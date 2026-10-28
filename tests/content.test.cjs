/* Independent subject-matter checks. Reference calculations read only the stated
   givens (never data-answer or data-explain); answers are compared afterwards.
   Rational BigInt arithmetic and conservation/minimality checks provide a second
   calculation path, independent of generator floats and reverse construction. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const filenames = [...fs.readFileSync(path.join(root, 'train.html'), 'utf8').matchAll(/src="(js\/train\/topics\/[^"?]+\.js)"/g)].map(m => m[1]);
const sources = filenames.map(file => [file, fs.readFileSync(path.join(root, file), 'utf8')]);
function generators(random) {
  const topics = {};
  const math = Object.create(Math); math.random = random;
  const context = vm.createContext({ Math: math, Intl, window: { Train: { registerTopic: (name, maker) => { topics[name] = maker; } } } });
  for (const [file, source] of sources) vm.runInContext(source, context, { filename: file, timeout: 1000 });
  return topics;
}
function seeded(seed) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }; }
function text(html) { return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').replace(/ +([;,.])/g, '$1').trim(); }
function question(html) { return html.replace(/<(p|small|div)\b[^>]*\bdata-explain(?:="[^"]*")?[^>]*>[\s\S]*?<\/\1>/g, ''); }
const number = value => Number(value.replace(/\./g, '').replace(',', '.'));
function get(str, regex) { const m = str.match(regex); assert.ok(m, `Missing stated given ${regex}: ${str}`); return m.slice(1).map(number); }
function answerValues(html) { return [...html.matchAll(/<(?:input|select)\b[^>]*data-answer="([^"]+)"/g)].map(m => Number.isFinite(Number(m[1])) ? Number(m[1]) : m[1]); }
const roundRatio = (n, d, scale = 1) => Number((2n * BigInt(n) * BigInt(scale) + BigInt(d)) / (2n * BigInt(d))) / scale;
const ceilingRatio = (n, d) => Number((BigInt(n) + BigInt(d) - 1n) / BigInt(d));
function reference(topic, markup, difficulty, level) {
  const q = question(markup), t = text(q);
  switch (topic) {
    case 'break_even': {
      const [p, v, f] = get(t, /Preis je Stück: (\d+) €; variable Kosten je Stück: (\d+) €; gesamte Fixkosten der Periode: (\d+) €/);
      assert.match(t, /auf ganze Stück aufrunden/); assert.match(t, /Produzierte und verkaufte Menge sind gleich/);
      const n = ceilingRatio(f, p - v);
      assert.ok(p * n >= f + v * n && p * (n - 1) < f + v * (n - 1), 'smallest whole sale with nonnegative profit');
      return [n];
    }
    case 'bab': {
      assert.match(t, /ganze Prozent/);
      if (difficulty === 1) {
        const [em, mgk] = get(t, /Einzelmaterial \(EM\) i : (\d+) € · Material-Gemeinkosten \(MGK\) i : (\d+) €/);
        return [roundRatio(mgk * 100, em)];
      }
      const [em, mgk, fl, fgk, vw, vt] = get(t, /EM: (\d+) €, MGK: (\d+) €, FL: (\d+) €, FGK: (\d+) €, VwGK: ([\d.,]+) €, VtGK: ([\d.,]+) €/);
      assert.match(t, /keine Bestandsänderungen/);
      return [roundRatio(mgk * 100, em), roundRatio(fgk * 100, fl), roundRatio(Math.round((vw + vt) * 100), em + mgk + fl + fgk)];
    }
    case 'kostenarten': {
      if (level === 0 && difficulty === 1) {
        const [v, n] = get(t, /(\d+) € je Stück × (\d+) Stück/); assert.match(t, /keine Fixkosten/); return [v * n];
      }
      if (level === 0) { const [ek, gk] = get(t, /Einzelkosten: (\d+) €; Gemeinkosten: (\d+) €/); return [ek + gk]; }
      if (level === 1 && difficulty === 1) {
        const [f, v, n] = get(t, /Fixkosten: (\d+) €; variable Kosten je Stück: (\d+) €; Menge: (\d+)/);
        assert.match(t, /€\/Stück/); return [f + v * n, (f + v * n) / n];
      }
      if (level === 1) { const [ek, gk, n] = get(t, /Einzelkosten: (\d+) €; Gemeinkosten: (\d+) €; Menge: (\d+)/); assert.match(t, /kaufmännisch/); return [roundRatio(ek + gk, n)]; }
      if (level >= 2 && level <= 4) {
        if (/Lohn, der einem einzelnen Fertigungsauftrag|Fertigungsmaterial für einen einzelnen Auftrag/.test(t)) return ['Einzelkosten'];
        if (t.includes('Strom für die Verwaltung')) return ['Gemeinkosten'];
        if (t.includes('ohne Mietzahlung')) return ['kalkulatorisch'];
        assert.match(t, /tatsächliche Mietzahlung für betrieblich genutzte Räume dieser Periode/); return ['pagatorisch'];
      }
      if (level >= 5 && level <= 9) {
        const [m, w, g, f] = get(t, /Material: (\d+) €, Fertigungslohn: (\d+) €, variable Gemeinkosten: (\d+) €, Fixkosten: (\d+) €/);
        assert.match(t, /Material und Fertigungslohn sind hier vollständig variabel/); return [m + w + g, m + w + g + f];
      }
      const [total, n] = get(t, /Gesamtkosten: ([\d.]+) €; Menge: (\d+)/); assert.match(t, /kaufmännisch/); return [roundRatio(total, n)];
    }
    case 'abgrenzung': {
      const [expense, neutral] = get(t, /Gesamtaufwand der Periode: (\d+) €. Darin enthaltener neutraler Aufwand \(betriebsfremde Spende\): (\d+) €/);
      const extra = difficulty === 1 ? 0 : get(t, /ohne entsprechenden Aufwand: (\d+) €/)[0];
      assert.match(t, /keine Anderskosten/); assert.doesNotMatch(t, /EK-Änderung|pagatorisch/);
      return [expense - neutral + extra];
    }
    case 'kostenstellen': {
      const [costs, hours] = get(t, /Gemeinkosten der Periode: (\d+) €; Maschinenstunden der Periode: (\d+) h/);
      assert.match(q, /placeholder="€\/h"/); assert.doesNotMatch(t, /Zuschlagssatz/);
      const rate = costs / hours;
      return difficulty === 1 ? [rate] : [rate, rate * get(t, /Auftrag A beansprucht davon (\d+) h/)[0]];
    }
    case 'deckungsbeitrag': {
      const [p, v, n, f] = get(t, /Verkaufspreis je Stück: (\d+) € Variable Kosten je Stück: (\d+) € Menge: (\d+) Stück Fixkosten gesamt: (\d+) €/);
      assert.match(t, /freie Kapazitäten/); assert.match(t, /auf volle Euro aufrunden/);
      const minimum = ceilingRatio(v * n + f, n);
      assert.ok(minimum * n >= v * n + f && (minimum - 1) * n < v * n + f);
      return [p - v, p * n - v * n, v, minimum];
    }
    case 'aequivalenz': {
      const [total] = get(t, /gesamten Herstellkosten von (\d+) €/);
      const products = [...t.matchAll(/Sorte ([ABC]): Menge (\d+) Stück; ÄZ (\d+)/g)].map(m => ({ n: Number(m[2]), z: Number(m[3]) }));
      assert.equal(products.length, difficulty >= 3 ? 3 : 2);
      assert.doesNotMatch(t, /Basispreis|Preis [ABC]/);
      const units = products.reduce((sum, p) => sum + p.n * p.z, 0), base = total / units;
      const costs = products.map(p => base * p.z);
      assert.equal(costs.reduce((sum, c, i) => sum + c * products[i].n, 0), total, 'costs fully allocated');
      return [units, base, ...costs];
    }
    case 'zuschlag': {
      assert.match(t, /jeden Zuschlagsbetrag kaufmännisch auf Cent/); assert.doesNotMatch(t, /Listenpreis/);
      const rows = [...q.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(m => [...m[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map(c => c[1]));
      const money = i => number(text(rows[i][1]).match(/^[\d.,]+/)[0]);
      const percent = i => Number(text(rows[i][2]).replace('%', '') || 0);
      const em = money(0), ef = money(1);
      const mgk = roundRatio(em * percent(2), 100, 100), fgk = roundRatio(ef * percent(3), 100, 100);
      const hkCents = Math.round((em + ef + mgk + fgk) * 100);
      const vw = roundRatio(hkCents * percent(5), 100) / 100, vt = roundRatio(hkCents * percent(6), 100) / 100;
      const skCents = hkCents + Math.round(vw * 100) + Math.round(vt * 100);
      const profit = roundRatio(skCents * percent(8), 100) / 100;
      const expected = [em, ef, mgk, fgk, hkCents / 100, vw, vt, skCents / 100, profit, (skCents + Math.round(profit * 100)) / 100];
      const fields = [];
      rows.forEach((row, i) => {
        if (row[1].includes('<input')) fields.push(expected[i]);
        else if (i !== 8 || difficulty >= 3) assert.equal(money(i), expected[i], `stated row ${i} must match rates and cent rounding`);
      });
      assert.ok(fields.length >= 1 && fields.length <= 2);
      return fields;
    }
    case 'prozesskosten': {
      const processes = [...t.matchAll(/Prozess (\d): (\d+) € \/ (\d+) Treiber/g)].map(m => ({ costs: Number(m[2]), quantity: Number(m[3]) }));
      const demand = [...t.matchAll(/P\d×(\d+)/g)].map(m => Number(m[1]));
      assert.equal(processes.length, difficulty >= 3 ? 3 : 2); assert.equal(demand.length, processes.length);
      assert.match(t, /ungerundeten Kostensätzen/);
      let numerator = 0n, denominator = 1n;
      processes.forEach((p, i) => { numerator = numerator * BigInt(p.quantity) + BigInt(p.costs * demand[i]) * denominator; denominator *= BigInt(p.quantity); });
      return [...processes.map(p => roundRatio(p.costs, p.quantity, 100)), roundRatio(numerator, denominator, 100)];
    }
    case 'kennzahlen': {
      const [cash, bank, receivables, stock] = get(t, /Kasse: (\d+) €, Bank: (\d+) €, Forderungen: (\d+) €, Vorräte: (\d+) €/);
      const [assets] = get(t, /Anlagevermögen: (\d+) €/);
      const [short, long, equity] = get(t, /kurzfr. Verb.: (\d+) €, langfr. Verb.: (\d+) €, Eigenkapital: (\d+) €/);
      const [incoming, outgoing] = get(t, /Einzahlungen aus laufender Geschäftstätigkeit: (\d+) €, Auszahlungen aus laufender Geschäftstätigkeit: (\d+) €/);
      const balance = cash + bank + receivables + stock + assets;
      assert.equal(balance, short + long + equity, 'every generated balance reconciles'); assert.ok(assets >= 0);
      assert.match(t, /Forderungen sind kurzfristig/); assert.match(t, /ganze Prozent/);
      return [roundRatio((cash + bank) * 100, short), roundRatio((cash + bank + receivables) * 100, short), roundRatio((cash + bank + receivables + stock) * 100, short), roundRatio(equity * 100, balance), incoming - outgoing];
    }
    case 'investition': {
      const [outlay] = get(t, /Anschaffungsauszahlung: (\d+) €/);
      const [flow] = get(t, /jährlicher Netto-Rückfluss nach laufenden Auszahlungen: (\d+) €/);
      const saving = difficulty >= 3 ? get(t, /im Rückfluss noch nicht enthalten\): (\d+) €/)[0] : 0;
      assert.match(t, /am Jahresende/); assert.match(t, /auf ganze Jahre aufrunden/);
      let total = 0, years = 0;
      while (total < outlay) { total += flow + saving; years++; }
      return [flow + saving, years];
    }
    case 'lager': {
      const [usage, start, end] = get(t, /Jahreswareneinsatz: (\d+) € Anfangsbestand: (\d+) €, Endbestand: (\d+) €/);
      assert.match(t, /360 Tagen/); assert.match(t, /Einstandspreisen/); assert.match(t, /ungerundeten Umschlag/);
      return [(start + end) / 2, roundRatio(usage * 2, start + end, 100), roundRatio(180 * (start + end), usage)];
    }
    default: assert.fail(`No independent oracle for ${topic}`);
  }
}

const scenarios = [() => 0, () => 0.999999, () => 0.5, ...Array.from({ length: 32 }, (_, i) => seeded(i + 1))];
const topicNames = Object.keys(generators(() => 0));
test('inventory covers exactly the 12 active train topics; inactive Stufenleiter excluded', () => {
  assert.equal(topicNames.length, 12); assert.equal(filenames.length, 12);
  assert.ok(!topicNames.includes('stufenleiter'));
});
for (const topic of topicNames) {
  test(`${topic}: independent reference calculations, every difficulty and task slot`, () => {
    for (let scenario = 0; scenario < scenarios.length; scenario++) {
      const make = generators(scenarios[scenario])[topic];
      for (let difficulty = 1; difficulty <= 4; difficulty++) {
        for (let level = 0; level < (topic === 'kostenarten' ? 15 : 1); level++) {
          const { markup } = make(difficulty, level);
          const expected = reference(topic, markup, difficulty, level);
          assert.deepEqual(answerValues(markup), expected, `${topic}: scenario=${scenario} difficulty=${difficulty} level=${level}`);
          const explanations = [...markup.matchAll(/<([a-z]+)\b([^>]*\bdata-explain(?:="[^"]*")?[^>]*)>([\s\S]*?)<\/\1>/g)];
          assert.equal(explanations.length, 1, 'exactly one available explanation');
          assert.match(explanations[0][2], /\bis-hidden\b/);
          assert.ok(text(explanations[0][3]).length > 8, 'explanation has substance');
          assert.ok(!/\b(?:NaN|Infinity|undefined)\b/.test(markup));
        }
      }
    }
  });
}

test('all five classification statements occur and have semantic explanations in slots 2–4', () => {
  const seen = new Set();
  for (const value of [0, 0.21, 0.41, 0.61, 0.81]) {
    const make = generators(() => value).kostenarten;
    for (let d = 1; d <= 4; d++) for (let slot = 2; slot <= 4; slot++) {
      const { markup } = make(d, slot); seen.add(text(question(markup)).split('Kostenart:')[0]);
      assert.deepEqual(answerValues(markup), reference('kostenarten', markup, d, slot));
      assert.match(markup, /direkt zugerechnet|über einen Schlüssel verteilt|rechnerischer Kostenwert|tatsächlichen Zahlung/);
    }
  }
  assert.equal(seen.size, 5);
});

test('controlled edge scenarios: fractional break-even, negative cashflow and zero process demand', () => {
  const lower = generators(() => 0), upper = generators(() => 0.999999);
  for (let d = 3; d <= 4; d++) {
    const markup = lower.break_even(d).markup;
    const t = text(question(markup));
    const [p, v, f] = get(t, /Preis je Stück: (\d+) €; variable Kosten je Stück: (\d+) €; gesamte Fixkosten der Periode: (\d+) €/);
    assert.notEqual(f % (p - v), 0);
    assert.deepEqual(answerValues(markup), reference('break_even', markup, d));
    assert.match(lower.prozesskosten(d).markup, /P3×0/);
  }
  let index = 0;
  const random = () => [0, 0, 0, 0, 0, 0, 0, 0, 0.999999][index++ % 9];
  const markup = generators(random).kennzahlen(1).markup;
  assert.ok(answerValues(markup).at(-1) < 0);
  assert.deepEqual(answerValues(markup), reference('kennzahlen', markup, 1));
  assert.equal(answerValues(upper.zuschlag(4).markup).length, 2, 'constant RNG never loops indefinitely');
});

test('regression: duration and product cost use exact intermediate values', () => {
  // These sequences deliberately produce a different result under old whole-unit intermediate rounding.
  const make = generators(() => 0);
  const warehouse = make.lager(1).markup;
  assert.deepEqual(answerValues(warehouse), [5000, 8, 45]);
  let i = 0;
  const sequence = [0, 0.999999, 0.999999]; // 40,000 usage / 30,000 avg stock => 1.33; duration 270, not 360
  const fractional = generators(() => sequence[i++ % 3]).lager(1).markup;
  assert.deepEqual(answerValues(fractional), [30000, 1.33, 270]);
  const fractionalProcesses = generators(() => 0.5).prozesskosten(4).markup;
  assert.deepEqual(answerValues(fractionalProcesses), reference('prozesskosten', fractionalProcesses, 4));
  const amounts = answerValues(fractionalProcesses);
  assert.ok(amounts.some(v => !Number.isInteger(v)), 'fractional cents exercised');
});


test('exact half boundaries round commercially: 57.5 percent and 127.5 days', () => {
  function fromSequence(values, topic) {
    let index = 0;
    return generators(() => values[index++ % values.length])[topic](1).markup;
  }
  const ratios = fromSequence([0, 0.8125, 0, 0, 0.999999, 0, 0, 0, 0], 'kennzahlen');
  assert.equal(answerValues(ratios)[0], 58);
  assert.deepEqual(answerValues(ratios), reference('kennzahlen', ratios, 1));
  const days = fromSequence([32.1 / 81, 16.1 / 26, 0.999999], 'lager');
  assert.deepEqual(answerValues(days), [25500, 2.82, 128]);
  assert.deepEqual(answerValues(days), reference('lager', days, 1));
});
