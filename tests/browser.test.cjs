/* Local-only browser regressions. Uses a fresh Playwright context per case. */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require(process.env.BWL_PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
let browser, server, origin;
const area1 = ['deckungsbeitrag', 'kostenarten', 'kostenstellen', 'zuschlag'];
const allTopics = ['break_even', 'bab', 'kostenarten', 'abgrenzung', 'kostenstellen', 'deckungsbeitrag', 'aequivalenz', 'zuschlag', 'prozesskosten', 'kennzahlen', 'investition', 'lager'];
const blank = () => ({ points: 0, topics: Object.fromEntries(allTopics.map(key => [key, { seen: 0, correct: 0, correctIds: [], wrongIds: [], awarded: {} }])), lastRank: '' });
const unlocked = () => {
  const p = blank();
  for (const topic of area1) {
    p.topics[topic] = { seen: 15, correct: 15, correctIds: Array.from({ length: 15 }, (_, i) => `${topic}_${i}`), wrongIds: [], awarded: Object.fromEntries(Array.from({ length: 15 }, (_, i) => [`${topic}_${i}`, 1])) };
  }
  p.points = 1200;
  return p;
};
before(async () => {
  const apache = await fs.readFile(path.join(root, '.htaccess'), 'utf8');
  const csp = apache.match(/Header always set Content-Security-Policy "([^"]+)"/)[1];
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.txt': 'text/plain' };
  server = http.createServer(async (req, res) => {
    try {
      const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const file = path.resolve(root, '.' + (name === '/' ? '/index.html' : name));
      if (!file.startsWith(root + path.sep)) throw Error('invalid path');
      const data = await fs.readFile(file);
      res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Content-Security-Policy': csp, 'Cache-Control': 'no-store' });
      res.end(data);
    } catch (_) { res.writeHead(404); res.end('Not found'); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true, executablePath: process.env.BWL_CHROMIUM_PATH || undefined, timeout: 10000 });
  if (process.env.BWL_TEST_ARTIFACTS) {
    await fs.mkdir(process.env.BWL_TEST_ARTIFACTS, { recursive: true });
    await fs.writeFile(path.join(process.env.BWL_TEST_ARTIFACTS, 'runtime.json'), JSON.stringify({ browser: await browser.version(), node: process.version, binding: '127.0.0.1', csp: 'from reference .htaccess', personal_browser_profile: false }, null, 2));
  }
});
after(async () => { if (browser) await browser.close(); if (server && server.listening) await new Promise(resolve => server.close(resolve)); });
async function session(t, { selection, progress, viewport } = {}) {
  const context = await browser.newContext({ viewport: viewport || { width: 1440, height: 1000 } });
  t.after(() => context.close());
  await context.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
  await context.addInitScript(({ selection, progress }) => {
    if (sessionStorage.getItem('bwl_test_seeded')) return;
    sessionStorage.setItem('bwl_test_seeded', '1');
    if (selection) localStorage.setItem('bwl_enabled_topics_v1', JSON.stringify(selection));
    if (progress) localStorage.setItem('bwl_prog_v2', JSON.stringify(progress));
  }, { selection, progress });
  const page = await context.newPage();
  page.setDefaultTimeout(3500);
  const errors = [], violations = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.exposeFunction('recordCsp', detail => violations.push(detail));
  await page.addInitScript(() => document.addEventListener('securitypolicyviolation', e => window.recordCsp(e.violatedDirective + ': ' + e.blockedURI)));
  return { context, page, errors, violations };
}
async function saved(page) { return page.evaluate(() => JSON.parse(localStorage.getItem('bwl_prog_v2'))); }
async function answerAll(page) {
  const fields = page.locator('#bab-wrapper [data-answer]');
  for (let i = 0; i < await fields.count(); i++) {
    const el = fields.nth(i), answer = await el.getAttribute('data-answer');
    if (await el.evaluate(e => e.tagName) === 'SELECT') await el.selectOption(answer);
    else await el.fill(answer.replace('.', ','));
  }
}
async function layoutState(page) {
  return page.evaluate(() => ({width:innerWidth, scroll:document.documentElement.scrollWidth, overflow:[...document.querySelectorAll('body *')].map(el=>({tag:el.tagName, cls:el.className?.baseVal || el.className, text:el.textContent.slice(0,60), right:Math.round(el.getBoundingClientRect().right)})).filter(el=>el.right>innerWidth+1).slice(0,15)}));
}
async function snapshot(page, name) {
  if (!process.env.BWL_TEST_ARTIFACTS) return;
  await fs.mkdir(process.env.BWL_TEST_ARTIFACTS, { recursive: true });
  await page.screenshot({ path: path.join(process.env.BWL_TEST_ARTIFACTS, `${process.env.BWL_SNAPSHOT_LABEL || 'current'}-${name}.png`), fullPage: true, animations: 'disabled' });
}
test('all five entry pages load with local assets and strict CSP', async t => {
  const { page, errors, violations } = await session(t);
  const missing = [];
  page.on('response', response => { if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) missing.push(response.url()); });
  for (const entry of ['index', 'dashboard', 'train', 'achievements', 'settings']) {
    await page.goto(`${origin}/${entry}.html`);
    assert.equal(await page.locator('nav a[aria-current="page"]').count(), 1, entry);
    assert.equal(await page.locator('body').getAttribute('data-page'), entry === 'index' ? 'dashboard' : entry);
  }
  assert.deepEqual(errors, []); assert.deepEqual(violations, []); assert.deepEqual(missing, []);
});
test('training task stays visible and keyboard reachable', async t => {
  const { page } = await session(t, { selection: ['kostenarten'] });
  await page.goto(`${origin}/train.html?topic=kostenarten`);
  await snapshot(page, 'training-desktop');
  const box = await page.locator('#bab-wrapper').boundingBox();
  assert.ok(box && box.x >= 0 && box.width > 280 && box.height > 80, JSON.stringify(box));
  await page.locator('#bab-wrapper [data-answer]').first().focus();
  assert.equal(await page.evaluate(() => document.activeElement.hasAttribute('data-answer')), true);
});
test('wrong/correct answers save once, advance and resume after reload', async t => {
  const { page } = await session(t, { selection: ['kostenarten'] });
  await page.goto(`${origin}/train.html?topic=kostenarten`);
  const field = page.locator('#bab-wrapper [data-answer]').first();
  await field.fill('-999'); await page.locator('#btn-check').click();
  assert.equal((await saved(page)).topics.kostenarten.seen, 1);
  await answerAll(page); await page.locator('#btn-check').click();
  assert.equal((await saved(page)).points, 14);
  await page.waitForFunction(() => document.getElementById('session-pill').textContent.includes('Level 2/15'));
  await page.reload();
  assert.match(await page.locator('#session-pill').textContent(), /Level 2\/15/);
  assert.equal((await saved(page)).points, 14);
});
test('correct answer after manually revisiting an awarded level does not lower accuracy', async t => {
  const p = blank();
  p.points = 20; p.topics.kostenarten = { seen: 1, correct: 1, correctIds: ['kostenarten_1'], wrongIds: [], awarded: { kostenarten_1: 1 } };
  const { page } = await session(t, { selection: ['kostenarten'], progress: p });
  await page.goto(`${origin}/train.html?topic=kostenarten`);
  await page.locator('#btn-next').click();
  await answerAll(page); await page.locator('#btn-check').click();
  const result = await saved(page);
  assert.equal(result.points, 20, 'never award duplicate XP');
  assert.match(await page.locator('#topic-progress-train').textContent(), /100%/, 'a correct answer is not a wrong attempt');
  assert.equal(result.topics.kostenarten.seen, 2);
  await page.goto(`${origin}/achievements.html`);
  assert.equal(await page.locator('.bar-card .meta').first().textContent(), '100%');
  assert.match(await page.locator('#stats-head').textContent(), /Quote: 100%/);
});
test('all Kostenarten levels complete and remain complete', async t => {
  const { page, errors } = await session(t, { selection: ['kostenarten'] });
  await page.goto(`${origin}/train.html?topic=kostenarten`);
  for (let level = 0; level < 15; level++) {
    await page.waitForFunction(n => document.getElementById('session-pill').textContent.includes(`Level ${n}/15`), level + 1);
    await answerAll(page); await page.locator('#btn-check').click();
    if (level < 14) await page.waitForFunction(n => document.getElementById('session-pill').textContent.includes(`Level ${n}/15`), level + 2);
  }
  await page.locator('#bab-wrapper h3').filter({ hasText: 'Alle Level abgeschlossen' }).waitFor();
  const result = await saved(page);
  assert.equal(result.points, 300); assert.equal(result.topics.kostenarten.correct, 15);
  assert.equal(await page.locator('#btn-check').isDisabled(), true);
  await page.reload(); assert.match(await page.locator('#bab-wrapper').textContent(), /Alle Level abgeschlossen/);
  assert.deepEqual(errors, []);
});
test('all registered topics render and accept exact solutions at all four difficulties', async t => {
  const { page, errors, violations } = await session(t, { selection: allTopics, progress: unlocked() });
  for (const topic of allTopics) for (const difficulty of [1, 2, 3, 4]) {
    // Clear only the synthetic current topic while keeping the four prerequisite topics complete.
    await page.goto(`${origin}/train.html?topic=${topic}&difficulty=${difficulty}`);
    await page.evaluate(topic => {
      const p = window.ensureProg(); p.topics[topic] = { seen: 0, correct: 0, correctIds: [], wrongIds: [], awarded: {} };
    }, topic);
    await page.evaluate(({ topic, difficulty }) => { window.Train.prime(topic, difficulty); }, { topic, difficulty });
    // Page reload seeds a clean candidate without making DOM-only fabricated exercises.
    await page.evaluate(({ topic }) => {
      const p = window.ensureProg();
      for (const key of ['deckungsbeitrag','kostenarten','kostenstellen','zuschlag']) if (key !== topic) {
        p.topics[key].correct = 15;
      }
      localStorage.setItem('bwl_prog_v2', JSON.stringify(p));
    }, { topic });
    await page.reload();
    assert.ok(await page.locator('#bab-wrapper [data-answer]').count() > 0, `${topic}/${difficulty}`);
    const unnamed = await page.locator('#bab-wrapper [data-answer]').evaluateAll(fields => fields.filter(el => !el.labels?.length && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')).length);
    assert.equal(unnamed, 0, `answer names: ${topic}/${difficulty}`);
    await answerAll(page); await page.locator('#btn-check').click();
    const state = await saved(page);
    assert.equal(state.topics[topic].correct, 1, `${topic}/${difficulty}`);
  }
  assert.deepEqual(errors, []); assert.deepEqual(violations, []);
});
test('empty selection, settings, reset and legacy link behave consistently', async t => {
  const { page } = await session(t, { selection: [] });
  await page.goto(`${origin}/dashboard.html`);
  assert.equal(await page.locator('#overall-progress-label').textContent(), '0%');
  assert.equal(await page.locator('#btn-start-recommend').getAttribute('aria-disabled'), 'true');
  await page.goto(`${origin}/train.html`);
  assert.match(await page.locator('#bab-wrapper').textContent(), /Keine Aufgabe verfügbar/);
  await page.goto(`${origin}/settings.html`);
  await page.locator('input[data-topic="kostenarten"]').check();
  await page.goto(`${origin}/index.html#train`);
  assert.match(page.url(), /train\.html$/);
  assert.match(await page.locator('#session-pill').textContent(), /Kostenarten/);
  await answerAll(page); await page.locator('#btn-check').click();
  await page.goto(`${origin}/settings.html`);
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#btn-reset-progress').click();
  assert.equal(await page.evaluate(() => window.ensureProg().points), 0);
});
test('damaged saved topic data recovers without losing valid points', async t => {
  const p = blank(); p.points = 100;
  p.topics.kostenarten = { seen: '3', correct: '0', awarded: null, correctIds: null, wrongIds: null };
  const { page, errors } = await session(t, { selection: ['kostenarten'], progress: p });
  await page.goto(`${origin}/train.html?topic=kostenarten`);
  await answerAll(page); await page.locator('#btn-check').click();
  const result = await saved(page);
  assert.equal(result.points, 120); assert.equal(result.topics.kostenarten.correct, 1); assert.deepEqual(errors, []);
});
test('highest rank stays visually full', async t => {
  const p = unlocked(); p.points = 1000;
  const { page } = await session(t, { progress: p });
  await page.goto(`${origin}/dashboard.html`);
  assert.match(await page.locator('#rank-level-fill-dashboard').getAttribute('class'), /\bw-100\b/);
  assert.doesNotMatch(await page.locator('#rank-level-label-dashboard').textContent(), /nächsten Rang/);
});
test('desktop and narrow screens keep content inside the viewport', async t => {
  for (const width of [1440, 1024, 768, 390, 320]) {
    const { page } = await session(t, { viewport: { width, height: width === 390 ? 844 : 1000 } });
    for (const name of ['dashboard', 'train', 'achievements', 'settings']) {
      await page.goto(`${origin}/${name}.html`);
      await snapshot(page, `${name}-${width}`);
      const dimensions = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth, overflow: [...document.querySelectorAll('body *')].map(el => ({ tag:el.tagName, cls:el.className?.baseVal || el.className, right:Math.round(el.getBoundingClientRect().right), width:Math.round(el.getBoundingClientRect().width) })).filter(el => el.right > innerWidth + 1).slice(0, 12) }));
      assert.ok(dimensions.scroll <= dimensions.width + 1, `${name}: ${JSON.stringify(dimensions)}`);
    }
  }
});

test('calculator uses editable input, caret selection and native clear-button activation', async t => {
  const { page } = await session(t, { selection: ['kostenarten'] });
  await page.goto(`${origin}/train.html`);
  await page.locator('#calculator summary').click();
  const display = page.locator('#calc-display');
  await display.fill('-2+3'); await display.press('Enter');
  assert.equal(await display.inputValue(), '1');
  await display.fill('50x+2');
  await display.evaluate(el => el.setSelectionRange(2, 3));
  await display.press('%'); assert.equal(await display.inputValue(), '50/100+2');
  await display.press('Enter'); assert.equal(await display.inputValue(), '2,5');
  await page.locator('[data-calc-action="clear"]').focus();
  await page.keyboard.press('Enter'); assert.equal(await display.inputValue(), '0');
  const field = page.locator('#bab-wrapper [data-answer]').first();
  await field.fill('42'); await field.press('Backspace');
  assert.equal(await field.inputValue(), '4'); assert.equal(await display.inputValue(), '0');
});
test('dark theme survives page navigation and progress controls stay readable', async t => {
  const { page } = await session(t, { selection: ['kostenarten'], viewport: { width: 390, height: 844 } });
  await page.goto(`${origin}/settings.html`);
  await page.locator('#theme-select').selectOption('dark');
  await page.locator('nav a[href="train.html"]').click();
  await page.waitForLoadState('load');
  assert.equal(await page.locator('body').getAttribute('data-theme'), 'dark');
  await answerAll(page); await page.locator('#btn-check').click();
  const colors = await page.locator('#bab-wrapper [data-answer]').first().evaluate(el => ({ color: getComputedStyle(el).color, background: getComputedStyle(el).backgroundColor }));
  assert.notEqual(colors.color, colors.background);
  await snapshot(page, 'training-dark-390');
});
test('locked or unselected topic cannot be started by a URL parameter', async t => {
  const { page } = await session(t, { selection: ['kostenarten'] });
  await page.goto(`${origin}/train.html?topic=investition`);
  assert.match(await page.locator('#session-pill').textContent(), /Kostenarten/);
  await page.goto(`${origin}/train.html?topic=%3Cimg%20src=x%20onerror=alert(1)%3E`);
  assert.match(await page.locator('#session-pill').textContent(), /Kostenarten/);
  assert.equal(await page.locator('#bab-wrapper img').count(), 0);
});
test('a second tab receives progress and reset without reloading', async t => {
  const { page, context } = await session(t, { selection: ['kostenarten'] });
  await page.goto(`${origin}/train.html?topic=kostenarten`);
  const dashboard = await context.newPage();
  await dashboard.goto(`${origin}/dashboard.html`);
  await answerAll(page); await page.locator('#btn-check').click();
  await dashboard.waitForFunction(() => document.getElementById('overall-correct').textContent === '1');
  dashboard.once('dialog', dialog => dialog.accept());
  await dashboard.locator('#btn-reset-progress').click();
  await page.waitForFunction(() => document.getElementById('session-pill').textContent.includes('Level 1/15'));
  assert.equal(await page.evaluate(() => window.ensureProg().points), 0);
});
test('unavailable storage reports a warning and retains the in-session result', async t => {
  const { page } = await session(t, { selection: ['kostenarten'] });
  await page.goto(`${origin}/train.html?topic=kostenarten`);
  await page.evaluate(() => { Storage.prototype.setItem = function() { throw new DOMException('Blocked', 'QuotaExceededError'); }; });
  await answerAll(page); await page.locator('#btn-check').click();
  await page.locator('#storage-warning').waitFor();
  assert.equal(await page.evaluate(() => window.ensureProg().points), 20);
});
test('partial selection write failure restores the previous choice', async t => {
  const { page } = await session(t, { selection: ['kostenarten'] });
  await page.goto(`${origin}/settings.html`);
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key === 'bwl_enabled_topics_v1') throw new DOMException('Blocked', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await page.locator('input[data-topic="kostenstellen"]').click();
  assert.equal(await page.locator('input[data-topic="kostenstellen"]').isChecked(), false);
  assert.deepEqual(await page.evaluate(() => window.BwlTopics.selected()), ['kostenarten']);
  await page.locator('#storage-warning').waitFor();
});

test('Lernatelier help and calculator disclosures preserve answer and keyboard behavior', async t => {
  const { page, errors, violations } = await session(t, { selection: ['kostenarten'] });
  await page.goto(`${origin}/train.html?topic=kostenarten`);
  const field = page.locator('#bab-wrapper [data-answer]').first();
  const explanation = page.locator('[data-explain]').first();
  const help = page.locator('#btn-help');
  assert.equal(await explanation.isVisible(), false);
  await field.fill('12'); await help.click();
  assert.equal(await help.getAttribute('aria-expanded'), 'true');
  assert.equal(await explanation.isVisible(), true);
  assert.equal(await field.inputValue(), '12', 'reading the method does not overwrite an answer');
  assert.equal(await page.evaluate(() => window.ensureProg().points), 0);
  await help.click(); assert.equal(await explanation.isVisible(), false);
  const summary = page.locator('#calculator summary');
  await summary.focus(); await summary.press('Enter');
  assert.equal(await page.locator('#calculator').evaluate(el => el.open), true);
  assert.equal(await page.evaluate(() => window.ensureProg().topics.kostenarten.seen), 0, 'opening calculator does not check an answer');
  await page.locator('#calc-display').fill('3*4'); await page.locator('#calc-display').press('Enter');
  assert.equal(await page.locator('#calc-display').inputValue(), '12');
  await summary.press('Enter');
  assert.equal(await page.locator('#calculator').evaluate(el => el.open), false);
  await page.locator('body').click({position:{x:3,y:3}}); await page.keyboard.press('9');
  assert.equal(await page.locator('#calc-display').inputValue(), '12', 'closed calculator does not consume number keys');
  await page.locator('#btn-reveal').click();
  assert.equal(await field.inputValue(), await field.getAttribute('data-answer'));
  assert.equal(await page.locator('[data-equation-result]').textContent(), await page.locator('[data-equation-result]').getAttribute('data-equation-answer'));
  assert.equal(await help.getAttribute('aria-expanded'), 'true');
  await page.locator('#btn-next').click();
  assert.equal(await help.getAttribute('aria-expanded'), 'false');
  assert.equal(await explanation.isVisible(), false);
  assert.equal(await page.locator('#task-feedback').isVisible(), false);
  assert.deepEqual(errors, []); assert.deepEqual(violations, []);
});

test('Lernatelier covers every view in both themes, reflow and reduced motion', async t => {
  const { page, errors, violations } = await session(t, { selection: ['kostenarten'], progress: blank() });
  for (const theme of ['light','dark']) {
    await page.goto(`${origin}/settings.html`); await page.locator('#theme-select').selectOption(theme);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({width, height:900});
      for (const name of ['dashboard','train','achievements','settings']) {
        await page.goto(`${origin}/${name}.html`);
        assert.equal(await page.locator('html').getAttribute('data-design'), 'lernatelier');
        assert.equal(await page.locator('body').getAttribute('data-theme'), theme);
        assert.equal(await page.locator('h1').count(), 1);
        assert.equal(await page.locator('nav [aria-current="page"]').count(), 1);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `${name}/${theme}/${width}`);
        if (width !== 320) await snapshot(page, `${name}-${theme}-${width}`);
      }
    }
  }
  await page.goto(`${origin}/settings.html`);
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('.skip-link').evaluate(el=>document.activeElement===el),true);
  assert.ok((await page.locator('.skip-link').boundingBox()).width>50,'skip link is visible on focus');
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('main').evaluate(el=>document.activeElement===el),true);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(`${origin}/train.html?topic=kostenarten`);
  await page.evaluate(() => document.documentElement.style.fontSize = '34px');
  await snapshot(page, 'zoom-320');
  const zoom = await layoutState(page);
  assert.ok(zoom.scroll <= zoom.width + 1, JSON.stringify(zoom));
  assert.deepEqual(errors, []); assert.deepEqual(violations, []);
});

test('all training topic layouts fit a 320px Lernatelier worksheet', async t => {
  const { page, errors, violations } = await session(t, { selection: allTopics, progress: unlocked(), viewport: {width:320,height:900} });
  for (const topic of allTopics) {
    await page.goto(`${origin}/train.html?topic=${topic}&difficulty=4`);
    await page.evaluate(topic => { const p=window.ensureProg(); p.topics[topic]={seen:0,correct:0,awarded:{}}; localStorage.setItem('bwl_prog_v2',JSON.stringify(p)); },topic);
    await page.reload();
    await snapshot(page, `topic-${topic}-320`);
    const dimensions = await layoutState(page);
    assert.ok(dimensions.scroll <= dimensions.width + 1, `${topic}: ${JSON.stringify(dimensions)}`);
    const controls = await page.locator('#bab-wrapper [data-answer]').evaluateAll(fields => fields.map(el=>({left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right})));
    assert.ok(controls.length>0,topic);
    assert.ok(controls.every(box=>box.left>=0 && box.right<=321),`${topic}: ${JSON.stringify(controls)}`);
    const tip = page.locator('#bab-wrapper [data-tip]').first();
    if (await tip.count()) {
      await tip.focus();
      assert.equal(await tip.evaluate(el=>getComputedStyle(el,'::after').display),'block',topic+' keyboard tooltip');
      const focused=await layoutState(page); assert.ok(focused.scroll<=321,topic+' open tooltip fits viewport');
    }
    if (['bab','zuschlag','kostenstellen'].includes(topic)) await snapshot(page, `table-${topic}-320`);
  }
  assert.deepEqual(errors, []); assert.deepEqual(violations, []);
});
