/* ===========================
   BWL-App • Train Engine (clean)
   =========================== */

const MAX_LEVELS_PER_TOPIC = 10;

/* Small helpers */
const rnd = (min, max) => {
  min = Math.floor(min); max = Math.floor(max);
  if (!Number.isFinite(min) || !Number.isFinite(max)) { min = 0; max = 1; }
  if (max < min) [min, max] = [max, min];
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const clamp0 = n => Math.max(0, Math.round(n));

// Helpers for mental arithmetic (round, small, divisible)
const pick = (arr) => arr[rnd(0, arr.length-1)];
const multipleOf = (base, min, max) => {
  const kmin = Math.ceil(min/base), kmax = Math.floor(max/base);
  const k = rnd(kmin, kmax);
  return k * base;
};

/* Safe-ish html template: join all parts as string */
const html = (strings, ...vals) => {
  let out = '';
  for (let i = 0; i < strings.length; i++) {
    out += strings[i] + (i < vals.length ? String(vals[i]) : '');
  }
  return out;
};

// Small tooltip helper for inline info symbols
const info = (tip) => ` <span class="i" title="${tip}">i</span>`;

// Difficulty: Easy if Stufe 1
function isEasy(){
  try{ return Number(window.session && window.session.difficulty) === 1; }catch(_e){ return true; }
}

/* Session state */
if (!window.session) window.session = { topic: 'break_even', difficulty: 1, items: [], index: 0 };
const session = window.session; // ensure local reference (avoids ReferenceError)

// Clamp session.index to valid range [0, MAX_LEVELS_PER_TOPIC]
function clampLevel(){
  if (session.index < 0) session.index = 0;
  if (session.index >= MAX_LEVELS_PER_TOPIC) session.index = MAX_LEVELS_PER_TOPIC; // "finished" state allowed
}
let lastSig = '';

function updateLevelPill(){
  const pill = document.getElementById('session-pill');
  if(!pill) return;
  const t = session.topic;
  const label = ({
    break_even: 'Break-Even',
    bab: 'BAB',
    kostenarten: 'Kostenarten',
    abgrenzung: 'Abgrenzung',
    kostenstellen: 'Kostenstellen',
    stl: 'Stufenleiter',
  })[t] || t;
  const current = Math.min(session.index + 1, MAX_LEVELS_PER_TOPIC);
  pill.textContent = `${label} • Stufe ${session.difficulty} • Level ${current}/${MAX_LEVELS_PER_TOPIC}`;
}

/* ---------- Task generators ---------- */

/* Break-Even */
function makeBreakEven(){
  if(isEasy()){
    // Einsteiger: Werte so wählen, dass q0 ganzzahlig ist, nur ein Feld
    const p = rnd(10, 20);      // Preis
    const v = rnd(3, Math.max(4, p-2)); // variable Kosten < p
    const deck = p - v;
    const q0 = rnd(8, 20);
    const F  = deck * q0;       // Fixkosten passend gewählt
    const markup = html`
      <div class="card">
        <h3>Break-Even — Einsteiger</h3>
        <p>Preis p = <strong>${p} €</strong> · variable Kosten v = <strong>${v} €</strong> · Fixkosten F = <strong>${F} €</strong></p>
        <table class="bab-table"><tbody>
          <tr>
            <th>q₀ = F ÷ (p − v)${info('Break-even-Menge: Fixkosten geteilt durch Deckungsbeitrag je Stück')}</th>
            <td><input type="text" inputmode="numeric" data-answer="${q0}"></td>
            <td class="muted">Stück</td>
          </tr>
        </tbody></table>
        <div class="explain muted" data-explain="1" style="display:none;margin-top:.5rem">
          Rechenweg: q₀ = F ÷ (p − v) = <strong>${F} ÷ (${p} − ${v}) = ${F} ÷ ${deck} = ${q0}</strong> Stück.
        </div>
      </div>`;
    return { markup };
  }
  // Normal: mental-arithmetic friendly values
  const price = pick([20, 25, 30, 40]);
  const varCost = price - pick([5, 10]); // DB = 5 oder 10
  const db = price - varCost;
  const q = pick([10, 12, 15, 20, 25, 30]);
  const fixed = db * q; // exakt teilbar → q ganzzahlig
  const markup = html`
    <div class="card">
      <h3>Break-Even — Aufgabe</h3>
      <p>Preis je Stück: <strong>${price} €</strong>, variable Kosten: <strong>${varCost} €</strong>, fixe Kosten: <strong>${fixed} €</strong></p>
      <table class="bab-table"><tbody>
        <tr><th>Menge am Break-Even${info('Fixkosten ÷ (Preis − variable Kosten)')}</th>
          <td><input type="text" inputmode="numeric" data-answer="${q}"></td><td class="muted">Stück</td></tr>
      </tbody></table>
      <div class="explain muted" data-explain="1" style="display:none;margin-top:.5rem">
        So rechnest du: <strong>DB</strong> = Preis − variable Kosten = <strong>${price} − ${varCost} = ${db} €</strong>.
        <br><strong>Break-even-Menge</strong> = fixe Kosten ÷ DB = <strong>${fixed} ÷ ${db} = ${q}</strong> (auf ganze Stücke aufrunden).
      </div>
    </div>`;
  return { markup };
}

function makeKostenarten(multi = false){
  if(isEasy()){
    const varStk = rnd(2, 10);
    const menge  = rnd(5, 20);
    const gesamt = clamp0(varStk * menge);
    const markup = html`
      <div class="card">
        <h3>Kostenarten — Einsteiger</h3>
        <p>Variable Kosten je Stück: <strong>${varStk} €</strong> · Menge: <strong>${menge}</strong></p>
        <table class="bab-table"><tbody>
          <tr>
            <th>Gesamtkosten${info('Variable Kosten je Stück × Menge')}</th>
            <td><input type="text" inputmode="numeric" data-answer="${gesamt}"></td>
            <td class="muted">€</td>
          </tr>
        </tbody></table>
        <div class="explain muted" data-explain="1" style="display:none;margin-top:.5rem">
          Rechenweg: <strong>${varStk} × ${menge} = ${gesamt} €</strong>.
        </div>
      </div>`;
    return { markup };
  }
  // Fix so wählen, dass Durchschnittskosten bei Bedarf ganzzahlig sind
  const varStk = rnd(2, 10);
  const menge = pick([10, 12, 15, 20, 25, 30, 40]);
  const fixProStk = pick([0, 1, 2, 3, 4, 5]);
  const fix = fixProStk * menge; // macht Durchschnitt glatt
  const gesamt = clamp0(fix + varStk * menge);
  const rows = html`
    <tr>
      <th>Gesamtkosten${info('Fixe Kosten + (Variable je Stück × Menge)')}</th>
      <td><input type="text" inputmode="numeric" data-answer="${gesamt}"></td><td class="muted">€</td>
    </tr>
    ${multi ? `
      <tr>
        <th>Durchschnittskosten/Stück${info('Gesamtkosten ÷ Menge')}</th>
        <td><input type="text" inputmode="numeric" data-answer="${(gesamt/menge)}"></td><td class="muted">€</td>
      </tr>` : ''}`;
  const markup = html`
    <div class="card">
      <h3>Kostenarten — Aufgabe${multi ? ' (Mehrteilig)' : ''}</h3>
      <p>Fixe Kosten: <strong>${fix} €</strong>, variable Kosten je Stück: <strong>${varStk} €</strong>, Menge: <strong>${menge}</strong></p>
      <table class="bab-table"><tbody>${rows}</tbody></table>
      <div class="explain muted" data-explain="1" style="display:none;margin-top:.5rem">
        So rechnest du: <strong>Gesamtkosten</strong> = Fix + (Var/Stück × Menge) = <strong>${fix} + (${varStk} × ${menge}) = ${gesamt} €</strong>.
        ${multi ? '<br><strong>Durchschnittskosten/Stück</strong> = Gesamtkosten ÷ Menge = <strong>'+ (gesamt/menge) +' €</strong>.' : ''}
      </div>
    </div>`;
  return { markup };
}

function makeAbgrenzung(){
  if(isEasy()){
    const ek = rnd(800, 2000);
    const pag = rnd(100, 400);
    const erfolg = ek - pag; // nur zwei Größen
    const markup = html`
      <div class="card">
        <h3>Abgrenzung — Einsteiger</h3>
        <p>EK-Änderung: <strong>${ek} €</strong> · pagatorische Aufw.${info('Pagatorisch = zahlungswirksam (tatsächlicher Geldfluss)')}: <strong>${pag} €</strong></p>
        <table class="bab-table"><tbody>
          <tr><th>Ergebnis</th><td><input type="text" inputmode="numeric" data-answer="${erfolg}"></td><td class="muted">€</td></tr>
        </tbody></table>
        <div class="explain muted" data-explain="1" style="display:none;margin-top:.5rem">Rechenweg: <strong>${ek} − ${pag} = ${erfolg} €</strong>.</div>
      </div>`;
    return { markup };
  }
  // Normal: kopfrechenfreundliche Werte
  const ek = multipleOf(100, 1000, 4000);   // 100er Schritte
  const pag = pick([100, 200, 300, 400, 500, 600, 700, 800]);
  const kalk = pick([100, 150, 200, 250, 300]);
  const noise = pick(['Hinweis: periodenfremd', 'Hinweis: neutral', '—']);
  const erfolg = ek - pag + kalk; // reine +/- in Hundertern
  const markup = html`
    <div class="card">
      <h3>Abgrenzung — Aufgabe</h3>
      <p>EK-Änderung: <strong>${ek} €</strong>, pagatorische Aufw.${info('Pagatorisch = zahlungswirksam (tatsächlicher Geldfluss)')}: <strong>${pag} €</strong>, kalkulatorische Kosten${info('Nicht zahlungswirksam; nur rechnerisch zur besseren Vergleichbarkeit')}: <strong>${kalk} €</strong>. (Zusatzangabe: ${noise})</p>
      <table class="bab-table"><tbody>
        <tr><th>Ergebnis</th><td><input type="text" inputmode="numeric" data-answer="${erfolg}"></td><td class="muted">€</td></tr>
      </tbody></table>
      <div class="explain muted" data-explain="1" style="display:none;margin-top:.5rem">So rechnest du: <strong>${ek} − ${pag} + ${kalk} = ${erfolg} €</strong>.</div>
    </div>`;
  return { markup };
}

function makeBab(){
  if(isEasy()){
    // Einsteiger: nur MGK-Zuschlag, runde Zahlen, ganzzahliges Ergebnis
    const emHundert = rnd(8, 20);  // 800..2000
    const zus = rnd(5, 25);        // 5..25 %
    const EM  = emHundert * 100;
    const MGK = Math.round(EM * zus / 100);
    const markup = html`
      <div class="card">
        <h3>BAB — Einsteiger</h3>
        <p>Einzelmaterial (EM)${info('Direkt dem Produkt zuordenbares Material')}: <strong>${EM} €</strong> · Material-Gemeinkosten (MGK)${info('Gemeinkosten im Materialbereich, nicht direkt zuordenbar')}: <strong>${MGK} €</strong></p>
        <table class="bab-table"><tbody>
          <tr>
            <th>MGK-Zuschlag${info('Material-GK ÷ Einzelmaterial × 100')}</th>
            <td><input type="text" inputmode="numeric" data-answer="${zus}"></td>
            <td class="muted">%</td>
          </tr>
        </tbody></table>
        <div class="explain muted" data-explain="1" style="display:none;margin-top:.5rem">
          Rechenweg: MGK ÷ EM × 100 = <strong>${MGK} ÷ ${EM} × 100 = ${zus}%</strong>.
        </div>
      </div>`;
    return { markup };
  }
  // Wähle glatte Zuschläge
  const EM = multipleOf(100, 1000, 8000);
  const rateMGK = pick([10, 15, 20, 25, 30]);
  const MGK = Math.round(EM * rateMGK / 100);

  const FL = multipleOf(100, 1000, 6000);
  const rateFGK = pick([10, 15, 20, 25, 30]);
  const FGK = Math.round(FL * rateFGK / 100);

  const HK = EM + FL + MGK + FGK;
  const rateVwVt = pick([5, 10, 15, 20]);
  const sumVwVt = Math.round(HK * rateVwVt / 100);
  // Teile Vw/Vt grob 50/50, rundbar
  const VwGK = Math.floor(sumVwVt/2);
  const VtGK = sumVwVt - VwGK;

  const zusMat  = rateMGK;
  const zusFert = rateFGK;
  const zusVwVt = rateVwVt;
  const markup = html`
    <div class="card">
      <h3>BAB — Aufgabe (vollständig angegeben)</h3>
      <p>
        Einzelmaterial (EM)${info('Direkt dem Produkt zuordenbares Material')}: <strong>${EM} €</strong>,
        Material-GK (MGK)${info('Gemeinkosten im Materialbereich, nicht direkt zuordenbar')}: <strong>${MGK} €</strong>,
        Fertigungslöhne (FL)${info('Einzellöhne in der Fertigung, direkt zuordenbar')}: <strong>${FL} €</strong>,
        Fertigungs-GK (FGK)${info('Gemeinkosten der Fertigung, nicht direkt zuordenbar')}: <strong>${FGK} €</strong>,
        Verwaltungs-GK (VwGK)${info('Gemeinkosten der Verwaltung')}: <strong>${VwGK} €</strong>,
        Vertriebs-GK (VtGK)${info('Gemeinkosten des Vertriebs')}: <strong>${VtGK} €</strong>
      </p>
      <table class="bab-table"><tbody>
        <tr>
          <th>MGK-Zuschlag${info('Material-GK ÷ Einzelmaterial × 100')}</th>
          <td><input type="text" inputmode="numeric" data-answer="${zusMat}"></td>
          <td class="muted">%</td>
        </tr>
        <tr>
          <th>FGK-Zuschlag${info('Fertigungs-GK ÷ Fertigungslöhne × 100')}</th>
          <td><input type="text" inputmode="numeric" data-answer="${zusFert}"></td>
          <td class="muted">%</td>
        </tr>
        <tr>
          <th>Vw/Vt-Zuschlag${info('(VwGK + VtGK) ÷ Herstellkosten × 100')}</th>
          <td><input type="text" inputmode="numeric" data-answer="${zusVwVt}"></td>
          <td class="muted">%</td>
        </tr>
      </tbody></table>
      <div class="explain muted" data-explain="1" style="display:none;margin-top:.5rem">
        So rechnest du:
        <br>1) <strong>MGK-Zuschlag</strong> = MGK ÷ EM × 100 = <strong>${MGK} ÷ ${EM} × 100 ≈ ${zusMat}%</strong>
        <br>2) <strong>FGK-Zuschlag</strong> = FGK ÷ FL × 100 = <strong>${FGK} ÷ ${FL} × 100 ≈ ${zusFert}%</strong>
        <br>3) <strong>Herstellkosten (HK)</strong> = EM + FL + MGK + FGK = <strong>${HK} €</strong>
        <br>4) <strong>Vw/Vt-Zuschlag</strong> = (VwGK + VtGK) ÷ HK × 100 = <strong>(${VwGK} + ${VtGK}) ÷ ${HK} × 100 ≈ ${zusVwVt}%</strong>
      </div>
    </div>`;
  return { markup };
}

function makeKostenstellen(){
  if(isEasy()){
    const gk = rnd(1000, 4000);
    const b  = rnd(10, 50); // kleine Bezugsgröße
    const satz = Math.round((gk / b) * 100);
    const markup = html`
      <div class="card">
        <h3>Kostenstellen — Einsteiger</h3>
        <p>Gemeinkosten (GK)${info('Kosten, die nicht direkt zuordenbar sind')}: <strong>${gk} €</strong> · Bezugsgröße (B)${info('z. B. Maschinenstunden, Leistungseinheiten')}: <strong>${b}</strong></p>
        <table class="bab-table"><tbody>
          <tr><th>Zuschlagssatz${info('GK ÷ Bezugsgröße × 100')}</th><td><input type="text" inputmode="numeric" data-answer="${satz}"></td><td class="muted">%</td></tr>
        </tbody></table>
        <div class="explain muted" data-explain="1" style="display:none;margin-top:.5rem"><strong>${gk} ÷ ${b} × 100 ≈ ${satz}%</strong>.</div>
      </div>`;
    return { markup };
  }
  // Kopfrechenfreundliche Werte
  const b = pick([50, 60, 80, 100, 120, 150]);
  const gkProEinheit = pick([2, 3, 4, 5]); // € je Einheit
  const gk = gkProEinheit * b;             // exakt teilbar
  const a = pick([20, 25, 30, 40, 50, 60]);
  const gkFuerAuftrag = gkProEinheit * a;  // glatt
  const zuschlag = Math.round((gk / b) * 100); // = gkProEinheit*100 → 200..500 (%), mental okay
  const sig = `kst|${gk}|${b}|${a}`;
  if (sig === lastSig) return makeKostenstellen();
  lastSig = sig;
  const markup = html`
    <div class="card">
      <h3>Kostenstellen — erweiterte Aufgabe</h3>
      <p>Gegeben: Gemeinkosten (GK)${info('Nicht direkt zuordenbare Kosten')}: <strong>${gk} €</strong>, Bezugsgröße (B)${info('z. B. Maschinenstunden/LE')}: <strong>${b}</strong>, Auftragsmenge A${info('Menge, auf die verrechnet wird')}: <strong>${a}</strong>.</p>
      <table class="bab-table"><tbody>
        <tr><th>Zuschlagssatz${info('GK ÷ Bezugsgröße × 100')}</th>
          <td><input type="text" inputmode="numeric" data-answer="${zuschlag}"></td><td class="muted">%</td></tr>
        <tr><th>GK pro Einheit${info('GK ÷ Bezugsgröße')}</th>
          <td><input type="text" inputmode="numeric" data-answer="${gkProEinheit}"></td><td class="muted">€</td></tr>
        <tr><th>GK für Auftrag A${info('GK je Einheit × A')}</th>
          <td><input type="text" inputmode="numeric" data-answer="${gkFuerAuftrag}"></td><td class="muted">€</td></tr>
      </tbody></table>
    </div>`;
  return { markup };
}

function makeStufenleiter(){
  if(isEasy()){
    const a = rnd(100, 300), b = rnd(100, 300);
    const sum = a + b;
    const markup = html`
      <div class="card">
        <h3>Stufenleiter — Einsteiger</h3>
        <p>Hilfskostenstellen${info('Kostenstellen, deren Kosten stufenweise auf Hauptstellen verteilt werden')}: <strong>${a} €</strong> und <strong>${b} €</strong></p>
        <table class="bab-table"><tbody>
          <tr><th>Summe</th><td><input type="text" inputmode="numeric" data-answer="${sum}"></td><td class="muted">€</td></tr>
        </tbody></table>
      </div>`;
    return { markup };
  }
  // Normal: runde Hunderter
  const h1 = multipleOf(100, 200, 800);
  const h2 = multipleOf(100, 300, 900);
  const h3 = multipleOf(100, 200, 700);
  const verteilung = h1 + h2 + h3;
  const markup = html`
    <div class="card">
      <h3>Stufenleiter — Praxisaufgabe</h3>
      <p>Ein Industriebetrieb hat drei <strong>Hilfskostenstellen</strong>:</p>
      <ul>
        <li><strong>Instandhaltung</strong>: ${h1} €</li>
        <li><strong>Energieversorgung</strong>: ${h2} €</li>
        <li><strong>Verwaltung</strong>: ${h3} €</li>
      </ul>
      <p>Diese Kosten werden stufenweise (ohne Rückverrechnung) auf die Hauptkostenstellen <em>Fertigung&nbsp;1</em> und <em>Fertigung&nbsp;2</em> umgelegt.${info('Stufenleiter: Hilfsstellen werden in einer sinnvollen Reihenfolge auf Hauptstellen verteilt; keine Rückverteilung')}</p>
      <table class="bab-table"><tbody>
        <tr>
          <th>Summe Hilfskostenstellen${info('Summe aller Hilfskostenstellen vor der Umlage')}</th>
          <td><input type="text" inputmode="numeric" data-answer="${verteilung}"></td>
          <td class="muted">€</td>
        </tr>
      </tbody></table>
      <div class="explain muted" data-explain="1" style="display:none;margin-top:.5rem">
        <strong>Rechenweg:</strong> Zuerst werden die Gesamtkosten der Hilfskostenstellen ermittelt, bevor die Umlage beginnt.
        <br>${h1} € (Instandhaltung) + ${h2} € (Energie) + ${h3} € (Verwaltung) = <strong>${verteilung} €</strong>.
        <br><em>Hinweis:</em> In der Stufenleiterrechnung wählst du eine Reihenfolge (z.&nbsp;B. Verwaltung → Instandhaltung → Energie) und verrechnest jede Stelle vollständig auf nachgeordnete Stellen und die Hauptkostenstellen.
      </div>
    </div>`;
  return { markup };
}

// XP accounting helper
function giveXP(points, allCorrect){
  try{
    // Minimal fallback: direkt auf prog schreiben, dann Rank/Progress aktualisieren
    window.prog = window.prog || {};
    window.prog.points = (window.prog.points||0) + (points|0);
    if(typeof window.renderRank === 'function') window.renderRank();
    if(typeof window.renderTopicProgress === 'function') window.renderTopicProgress();
    if(typeof window.save === 'function') window.save(window.prog);
    if(allCorrect && typeof window.announce === 'function') window.announce('Aufgabe korrekt — +' + points + ' XP');
  }catch(_e){}
}

/* Map topics → generators */
const TOPIC_MAKERS = {
  break_even: () => makeBreakEven(),
  bab:        () => makeBab(),
  kostenarten:() => makeKostenarten(window.session?.difficulty >= 2),
  abgrenzung: () => makeAbgrenzung(),
  kostenstellen: () => makeKostenstellen(),
  stl:        () => makeStufenleiter(),
};

/* ---------- Rendering & wiring ---------- */
function setPill(){
  updateLevelPill();
}

function renderFinished(){
  const wrap = document.getElementById('bab-wrapper');
  if(!wrap) return;
  wrap.innerHTML = `
    <div class="card">
      <h3>Alle Level abgeschlossen</h3>
      <p class="muted">Du hast die ${MAX_LEVELS_PER_TOPIC} Level für dieses Thema erledigt. Wechsle das Thema oder starte die Stufe neu.</p>
      <div class="task-controls">
        <button class="btn" id="btn-finish-change">Thema wechseln!</button>
      </div>
    </div>`;
  const btn = document.getElementById('btn-finish-change');
  if(btn){
    btn.addEventListener('click', ()=>{
      const keys = Object.keys(TOPIC_MAKERS);
      const pool = keys.filter(k => k !== session.topic);
      const pick = pool[Math.floor(Math.random()*pool.length)] || 'break_even';
      primeSession(pick, session.difficulty);
      setPill();
      renderTask();
    });
  }
}

function renderTask() {
  const wrap = document.getElementById('bab-wrapper');
  if (!wrap) return;

  clampLevel();

  if(session.index >= MAX_LEVELS_PER_TOPIC){
    updateLevelPill();
    renderFinished();
    return;
  }

  // generate fresh task
  const maker = TOPIC_MAKERS[session.topic] || TOPIC_MAKERS.break_even;
  const { markup } = maker();
  wrap.innerHTML = markup; // IMPORTANT: only innerHTML, never textContent
  const hasInput = !!wrap.querySelector('input[data-answer]');
  if (!hasInput) {
    console.warn('[train] no input fields generated for topic', session.topic);
  }

  // hide starter hint if present
  const starter = document.getElementById('train-starter');
  if (starter) starter.classList.add('hidden');

  // ensure explanations start hidden
  wrap.querySelectorAll('[data-explain]').forEach(x => { x.style.display = 'none'; });

  // focus first input for faster workflow
  const first = wrap.querySelector('input, select, textarea, button');
  if (first && typeof first.focus === 'function') first.focus();

  // Prüfen-Button beim Rendern neutralisieren
  try{
    const btn = document.querySelector('[data-action="check"]');
    if(btn) btn.classList.remove('ok','err');
  }catch(_e){}
}

function primeSession(topic, diff) {
  session.topic = topic || session.topic;
  session.difficulty = parseInt(diff || session.difficulty || 1, 10);
  session.items = [];
  session.index = 0;
  clampLevel();
  updateLevelPill();
}

/* Buttons: Prüfen / Lösung / Nächste */
function wireTrainControls() {
  const wrap = document.getElementById('bab-wrapper');
  const btnCheck = document.querySelector('[data-action="check"]');
  const btnReveal = document.querySelector('[data-action="reveal"]');
  const btnNext = document.querySelector('[data-action="next"]');
  const btnChange = document.getElementById('btn-change-topic');

  if (btnCheck) btnCheck.addEventListener('click', () => {
    let total = 0, ok = 0;
    wrap.querySelectorAll('input[data-answer]').forEach(inp => {
      total++;
      const wantStr = String(inp.getAttribute('data-answer')).trim();
      const gotStr = String(inp.value || '').replace(',', '.').trim();
      const wantNum = parseFloat(wantStr);
      const gotNum = parseFloat(gotStr);
      const correct = !isNaN(wantNum) && !isNaN(gotNum)
        ? Math.abs(wantNum - gotNum) < 1
        : gotStr.toLowerCase() === wantStr.toLowerCase();
      if (correct) { ok++; inp.classList.remove('err'); inp.classList.add('ok'); }
      else { inp.classList.remove('ok'); inp.classList.add('err'); }
    });
    // XP: voll korrekt → mehr Punkte; sonst kleine Teilpunkte
    const allCorrect = ok === total && total>0;
    const base = isEasy() ? 10 : 15;
    const partial = total>0 ? Math.max(1, Math.floor((ok/total) * (isEasy()?4:6))) : 0;
    giveXP(allCorrect ? base : partial, allCorrect);
    // Prüfen-Button farblich kennzeichnen (ok/err)
    if (btnCheck){
      btnCheck.classList.toggle('ok', allCorrect);
      btnCheck.classList.toggle('err', !allCorrect);
    }
    // Statistik je Thema (falls vorhanden)
    try{
      const s = ensureTopic(session.topic); s.seen = (s.seen||0) + 1; s.correct = (s.correct||0) + (allCorrect?1:0);
      if(typeof window.renderTopicProgress === 'function') window.renderTopicProgress();
      if(typeof window.save === 'function') window.save(window.prog);
    }catch(_e){}
  });

  if (btnReveal) btnReveal.addEventListener('click', () => {
    wrap.querySelectorAll('input[data-answer]').forEach(inp => {
      inp.value = inp.getAttribute('data-answer');
      inp.classList.remove('err'); inp.classList.add('ok');
    });
    // Erklärungen zum Rechenweg einblenden
    wrap.querySelectorAll('[data-explain]').forEach(x => { x.style.display = 'block'; });
    // Button-Status auf ok setzen
    if (btnCheck){
      btnCheck.classList.remove('err');
      btnCheck.classList.add('ok');
    }
  });

  if (btnNext) btnNext.addEventListener('click', () => {
    clampLevel();
    if (session.index + 1 >= MAX_LEVELS_PER_TOPIC) {
      session.index = MAX_LEVELS_PER_TOPIC; // lock at cap
      updateLevelPill();
      renderFinished();
      const btnChange = document.getElementById('btn-change-topic');
      if(btnChange) btnChange.classList.remove('hidden');
      return;
    }
    session.index = Math.min(session.index + 1, MAX_LEVELS_PER_TOPIC);
    updateLevelPill();
    if ((session.index % 3 === 0)) {
      const btnChange = document.getElementById('btn-change-topic');
      btnChange && btnChange.classList.remove('hidden');
    }
    // Button-Status neutralisieren
    if (btnCheck){ btnCheck.classList.remove('ok','err'); }
    renderTask();
  });

  if (btnChange) btnChange.addEventListener('click', () => {
    const keys = Object.keys(TOPIC_MAKERS);
    const pool = keys.filter(k => k !== session.topic);
    const pick = pool.length > 0 ? pool[rnd(0, pool.length - 1)] : 'break_even';
    primeSession(pick, session.difficulty);
    setPill();
    updateLevelPill();
    // Button-Status neutralisieren
    if (btnCheck){ btnCheck.classList.remove('ok','err'); }
    renderTask();
  });

  // Enter: only Check (unless calculator has focus)
  document.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Enter') return;
    if ((location.hash || '#dashboard') !== '#train') return;
    if (ev.target && ev.target.closest && ev.target.closest('#kbdcalc')) return;
    if (ev.target && ev.target.tagName === 'TEXTAREA') return;
    ev.preventDefault();
    btnCheck && btnCheck.click();
    // Nach dem Prüfen den ersten falschen oder sonst ersten Input fokussieren
    try{
      const bad = wrap.querySelector('input.err');
      const first = wrap.querySelector('input[data-answer]');
      (bad || first) && (bad || first).focus();
    }catch(_e){}
  }, true);
}

/* Public init used by app.js */
function initTrainEngine() {
  setPill();
  updateLevelPill();
  wireTrainControls();

  const btnStart = document.getElementById('btn-start');
  if (btnStart) btnStart.addEventListener('click', () => {
    const tsel = document.getElementById('topic-select-2');
    const dsel = document.getElementById('difficulty-select-2');
    primeSession(tsel?.value || session.topic, dsel?.value || session.difficulty);
    setPill();
    updateLevelPill();
    renderTask();
  });

  const btnQuick = document.getElementById('btn-quickstart');
  if (btnQuick) btnQuick.addEventListener('click', () => {
    const tsel = document.getElementById('topic-select');
    const dsel = document.getElementById('difficulty-select');
    primeSession(tsel?.value || 'break_even', dsel?.value || 1);
    location.hash = '#train';
    setTimeout(() => { setPill(); updateLevelPill(); renderTask(); }, 0);
  });
}

/* expose */
window.initTrainEngine = initTrainEngine;