// Optional browser speech assistance. It never reads answer attributes,
// grades an answer, or changes the application's progress state.
(() => {
  'use strict';
  const task = document.getElementById('bab-wrapper');
  const panel = document.getElementById('speech-panel');
  if (!task || !panel) return;

  const consent = document.getElementById('speech-consent');
  const read = document.getElementById('speech-read');
  const stop = document.getElementById('speech-stop');
  const dictate = document.getElementById('speech-dictate');
  const target = document.getElementById('speech-target');
  const preview = document.getElementById('speech-preview');
  const apply = document.getElementById('speech-apply');
  const status = document.getElementById('speech-status');
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const synthesis = window.speechSynthesis;
  const canRead = !!(synthesis && window.SpeechSynthesisUtterance);
  let fields = [];
  let recognizer = null;
  let utterance = null;
  let draftTarget = null;

  function announce(message) { status.textContent = message; }
  function isVisible(element) {
    for (let node = element; node && node !== task.parentElement; node = node.parentElement) {
      if (node.hidden || node.getAttribute('aria-hidden') === 'true') return false;
      const style = window.getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse') return false;
    }
    return true;
  }
  function usable(field) {
    return !!field && task.contains(field) && !field.disabled && !field.readOnly && isVisible(field);
  }
  function selected() {
    if (target.value === '') return null;
    const index = Number(target.value);
    return Number.isInteger(index) ? fields[index] || null : null;
  }
  function updateControls() {
    const allowed = consent.checked;
    const busy = !!recognizer;
    read.disabled = !allowed || !canRead;
    stop.disabled = !recognizer && !utterance;
    target.disabled = !allowed || !Recognition || !fields.length || busy;
    dictate.disabled = !allowed || !Recognition || !usable(selected()) || busy;
    preview.disabled = !allowed || !draftTarget || busy;
    apply.disabled = !allowed || busy || !usable(draftTarget) || draftTarget !== selected() || !preview.value.trim();
  }
  function cancelSpeech() {
    const previous = recognizer;
    recognizer = null; // Invalidate late results before aborting a pending session.
    if (previous) { try { previous.abort(); } catch { /* Already stopped. */ } }
    utterance = null;
    if (canRead) synthesis.cancel();
    updateControls();
  }
  function clearDraft() {
    draftTarget = null;
    preview.value = '';
  }
  function refreshFields() {
    fields = [...task.querySelectorAll('input[data-answer], textarea[data-answer]')]
      .filter(field => !['hidden', 'checkbox', 'radio', 'button', 'submit', 'file', 'password'].includes(field.type) && usable(field));
    target.replaceChildren();
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = fields.length ? 'Antwortfeld auswählen' : 'Kein beschreibbares Antwortfeld';
    target.append(placeholder);
    fields.forEach((field, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      const label = field.getAttribute('aria-label') || field.labels?.[0]?.textContent || `Antwort ${index + 1}`;
      option.textContent = `${index + 1}. ${label.replace(/\s+/g, ' ').trim()}`;
      target.append(option);
    });
    target.value = '';
    updateControls();
  }
  function resetForTask() {
    cancelSpeech();
    clearDraft();
    refreshFields();
    announce('Sprachfunktionen bereit. Das Vorlesen startet nur auf Knopfdruck.');
  }

  // Read only visible text nodes. Form controls, tooltips and all solution
  // sections are excluded, including solutions the user has already revealed.
  function taskText() {
    const walker = document.createTreeWalker(task, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest('[data-explain], input, select, textarea, button, script, style, [data-tip], [data-info], [data-i], .i, .sr-only') || !isVisible(parent)) {
          return NodeFilter.FILTER_REJECT;
        }
        return node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const parts = [];
    while (walker.nextNode()) parts.push(walker.currentNode.textContent.trim());
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  }

  read.addEventListener('click', () => {
    if (!consent.checked || !canRead) return;
    cancelSpeech();
    const text = taskText();
    if (!text) { announce('Es ist keine Aufgabenstellung zum Vorlesen vorhanden.'); return; }
    const current = new SpeechSynthesisUtterance(text);
    current.lang = 'de-DE';
    const voice = synthesis.getVoices().find(item => item.lang.startsWith('de') && item.localService);
    if (voice) current.voice = voice;
    utterance = current;
    current.onend = () => {
      if (utterance !== current) return;
      utterance = null; updateControls(); announce('Vorlesen beendet.');
    };
    current.onerror = () => {
      if (utterance !== current) return;
      utterance = null; updateControls(); announce('Das Vorlesen ist in diesem Browser gerade nicht möglich.');
    };
    try {
      synthesis.speak(current);
      announce('Die Aufgabenstellung wird vorgelesen.');
    } catch {
      utterance = null;
      announce('Das Vorlesen konnte nicht gestartet werden.');
    }
    updateControls();
  });

  dictate.addEventListener('click', () => {
    const field = selected();
    if (!consent.checked || !Recognition || !usable(field) || recognizer) return;
    cancelSpeech();
    clearDraft();
    draftTarget = field;
    let current;
    try { current = new Recognition(); }
    catch { clearDraft(); updateControls(); announce('Das Diktat wird von diesem Browser nicht bereitgestellt.'); return; }
    current.lang = 'de-DE';
    current.continuous = false;
    current.interimResults = false;
    current.maxAlternatives = 1;
    recognizer = current;
    current.onstart = () => {
      if (recognizer === current) announce('Diktat läuft. Sprich die Antwort für das ausgewählte Feld.');
    };
    current.onresult = event => {
      if (recognizer !== current || !consent.checked || !usable(field) || draftTarget !== field) return;
      const parts = [];
      for (let index = 0; index < event.results.length; index++) {
        if (event.results[index].isFinal) parts.push(event.results[index][0].transcript);
      }
      preview.value = parts.join(' ').trim();
      updateControls();
    };
    current.onerror = event => {
      if (recognizer !== current) return;
      recognizer = null;
      try { current.abort(); } catch { /* The browser may already have ended it. */ }
      const messages = {
        'not-allowed': 'Der Mikrofonzugriff wurde nicht erlaubt. Du kannst die Antwort weiterhin tippen.',
        'service-not-allowed': 'Der Browser hat den Sprachdienst nicht erlaubt.',
        'audio-capture': 'Es ist kein nutzbares Mikrofon verfügbar.',
        'no-speech': 'Es wurde keine Sprache erkannt. Du kannst das Diktat erneut starten.',
        'network': 'Der Sprachdienst ist nicht erreichbar. Bitte tippe die Antwort oder versuche es später erneut.',
        'language-not-supported': 'Der Sprachdienst unterstützt Deutsch hier nicht.'
      };
      announce(messages[event.error] || 'Das Diktat wurde beendet. Du kannst deine Antwort tippen.');
      updateControls();
    };
    current.onend = () => {
      if (recognizer !== current) return;
      recognizer = null;
      announce(preview.value ? 'Prüfe den erkannten Text und übernimm ihn anschließend in das Antwortfeld.' : 'Es wurde kein Text erkannt.');
      updateControls();
    };
    try {
      current.start();
      announce('Mikrofon wird angefragt.');
    } catch {
      recognizer = null;
      clearDraft();
      announce('Das Diktat konnte nicht gestartet werden. Bitte tippe die Antwort.');
    }
    updateControls();
  });

  apply.addEventListener('click', () => {
    const field = draftTarget;
    if (!consent.checked || recognizer || !usable(field) || field !== selected() || !preview.value.trim()) return;
    let value = preview.value.trim();
    // Number inputs cannot accept spoken words or a decimal comma. Leave the
    // decision to the learner instead of guessing or reading the expected answer.
    if (field.type === 'number') {
      value = value.replace(',', '.');
      if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)) {
        announce('Bitte korrigiere die Vorschau zu einer Zahl, bevor du sie übernimmst.');
        preview.focus(); return;
      }
    }
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    clearDraft();
    updateControls();
    field.focus();
    announce('Text übernommen. Mit „Antwort prüfen“ kannst du deine Antwort bewerten lassen.');
  });
  preview.addEventListener('input', updateControls);
  stop.addEventListener('click', () => {
    cancelSpeech();
    announce(preview.value ? 'Sprache gestoppt. Bereits erkannter Text bleibt zur Prüfung erhalten.' : 'Sprache gestoppt.');
  });
  consent.addEventListener('change', () => {
    cancelSpeech(); clearDraft(); target.value = ''; updateControls();
    announce(consent.checked ? 'Wähle für ein Diktat zuerst ausdrücklich ein Antwortfeld aus.' : 'Sprachfunktionen ausgeschaltet.');
  });
  target.addEventListener('change', () => { cancelSpeech(); clearDraft(); updateControls(); });
  document.addEventListener('bwl:task-state', resetForTask);
  new MutationObserver(resetForTask).observe(task, { childList: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancelSpeech(); });
  window.addEventListener('pagehide', cancelSpeech);
  panel.addEventListener('toggle', () => { if (!panel.open) cancelSpeech(); });
  refreshFields();
  if (!canRead && !Recognition) announce('Dein Browser bietet diese Sprachfunktionen nicht an. Du kannst wie gewohnt tippen.');
  else if (!Recognition) announce('Vorlesen ist verfügbar. Diktieren wird von diesem Browser nicht unterstützt.');
  else announce('Wähle aus, ob du die Sprachfunktionen verwenden möchtest.');
})();
