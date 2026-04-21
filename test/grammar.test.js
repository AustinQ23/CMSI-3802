import fs from 'fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as ohm from 'ohm-js';
import { validateDeclarations } from '../src/semantic.js';

const grammarText = fs.readFileSync('src/TEMP_JS.ohm', 'utf8');
const G = ohm.grammar(grammarText);

function parseResult(code) {
  const m = G.match(code);
  return { ok: m.succeeded(), message: m.failed() ? m.message : '' };
}

test('valid: simple function (no semicolons)', () => {
  const code = `
fn check_even(num: int) -> bool {
    if num % 2 == 0 {
        return true
    } else {
        return false
    }
}
`;
  const r = parseResult(code);
  assert.equal(r.ok, true, r.message);
});

test('invalid: semicolons are rejected by current grammar', () => {
  const code = `
fn f() {
    return true;
}
`;
  const r = parseResult(code);
  assert.equal(r.ok, false, 'Expected parser to reject semicolons (current grammar does not allow them)');
});

test('valid: arithmetic, power, and print call', () => {
  const code = `
fn main() {
    print(2 ** 3 + 4 * (5 - 1))
}
`;
  const r = parseResult(code);
  assert.equal(r.ok, true, r.message);
});

test('valid: assignment statement inside function', () => {
  const code = `
fn main() {
    x = 3
}
`;
  const r = parseResult(code);
  assert.equal(r.ok, true, r.message);
});

test('semantics: assignment without declaration should error', () => {
  const code = `
fn main() {
    x = 3
}
`;
  const errs = validateDeclarations(code);
  assert.equal(errs.length > 0, true, 'Expected semantic error for assignment to undeclared variable');
});

test('semantics: mut declared then assignment is allowed', () => {
  const code = `
fn main() {
    mut x: int =
    x = 3
}
`;
  const errs = validateDeclarations(code);
  assert.equal(errs.length, 0, `Expected no semantic errors but found: ${JSON.stringify(errs)}`);
});

test('valid: inline mut declaration with initializer', () => {
  const code = `
fn main() {
    mut x = 5
}
`;
  const r = parseResult(code);
  assert.equal(r.ok, true, r.message);
  const errs = validateDeclarations(code);
  assert.equal(errs.length, 0, `Semantic errors found: ${JSON.stringify(errs)}`);
});

test('invalid: malformed if (missing condition)', () => {
  const code = `
fn bug() {
    if {
        return
    }
}
`;
  const r = parseResult(code);
  assert.equal(r.ok, false, 'Expected malformed if to fail');
});

test('valid: mutability - mutable declaration and assignment', () => {
  const code = `
fn mut_example() {
  mut x = 5
}
`;
  const r = parseResult(code);
  assert.equal(r.ok, true, r.message);
  const errs = validateDeclarations(code);
  assert.equal(errs.length, 0, `Semantic errors found: ${JSON.stringify(errs)}`);
});
