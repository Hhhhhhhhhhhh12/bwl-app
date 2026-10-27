const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function calculator() {
  const listeners = {};
  const panel = {};
  const display = { value: '0' };
  const document = {
    activeElement: null,
    getElementById: id => id === 'calc-panel' ? panel : display,
    addEventListener: (name, callback) => { listeners[name] = callback; },
  };
  const window = {};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/calc.js'), 'utf8'), {
    document, window, console: { debug() {} }, Intl,
  });
  function key(key, target = { tagName: 'BODY', closest: () => null }, modifiers = {}) {
    const event = { key, target, prevented: false, ...modifiers,
      preventDefault() { this.prevented = true; }, stopPropagation() {}, stopImmediatePropagation() {} };
    listeners.keydown(event);
    return event;
  }
  function evaluate(expression) {
    window.calc.set(expression);
    key('Enter');
    return window.calc.get();
  }
  return { evaluate, key, api: window.calc };
}

test('arithmetic, decimal separators, signs and exponent precedence', () => {
  const { evaluate } = calculator();
  for (const [expression, result] of [
    ['2+3*4', '14'], ['(2+3)*4', '20'], ['1,5+2.25', '3,75'],
    ['6×3÷2', '9'], ['6:2', '3'], ['2^3^2', '512'],
    ['-2+3', '1'], ['2*-3', '-6'], ['2--3', '5'], ['-(2+3)', '-5'],
    ['-2^2', '-4'], ['(-2)^2', '4'], ['2^-2', '0,25'],
    ['.5+1.', '1,5'], ['1\t+\n2', '3'],
  ]) assert.equal(evaluate(expression), result, expression);
});

test('invalid expressions stay unchanged instead of yielding a partial result', () => {
  const { evaluate } = calculator();
  for (const expression of ['1.2.3+1', '1,2.3+1', '.', '1 2', '2(3)', '()',
    '(1+2', '1+2)', '2+', '*2', '1/0', '0/0', '2^1024', 'alert(1)', '']) {
    assert.equal(evaluate(expression), expression, expression);
  }
});

test('keyboard shortcuts, editable fields and button activation retain their events', () => {
  const { key, api } = calculator();
  api.set('2+3');
  const input = { tagName: 'INPUT', closest: () => null };
  const textarea = { tagName: 'TEXTAREA', closest: () => null };
  const button = { tagName: 'BUTTON', closest: selector => selector === 'button, a' ? {} : null };
  const calcInput = { tagName: 'INPUT', closest: selector => selector === '#calc-panel' ? {} : null };
  for (const [pressed, target, modifiers] of [
    ['Enter', button], ['Enter', input], ['1', input], ['Backspace', textarea],
    ['1', calcInput], ['Backspace', calcInput], ['ArrowLeft', calcInput],
    ['a', calcInput, { ctrlKey: true }], ['Enter', calcInput, { metaKey: true }],
    ['1', undefined, { altKey: true }],
  ]) assert.equal(key(pressed, target, modifiers).prevented, false, pressed);
  assert.equal(api.get(), '2+3');
  assert.equal(key('Enter', calcInput).prevented, true);
  assert.equal(api.get(), '5');
});

test('global entry and percent shortcut, including selected calculator text', () => {
  const { key, api, evaluate } = calculator();
  key('2'); key('*'); key('-'); key('3');
  assert.equal(api.get(), '2*-3');
  key('Enter');
  assert.equal(api.get(), '-6');
  assert.equal(evaluate('0'), '0');
  key('%');
  assert.equal(api.get(), '0');
  api.set('50'); key('%'); key('Enter');
  assert.equal(api.get(), '0,5');
  const input = {
    tagName: 'INPUT', selectionStart: 2, selectionEnd: 3,
    closest: selector => selector === '#calc-panel' ? {} : null,
    setRangeText(text, start, end) { api.set(api.get().slice(0, start) + text + api.get().slice(end)); },
  };
  api.set('50x+2');
  key('%', input);
  assert.equal(api.get(), '50/100+2');
});
