import fs from 'fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as ohm from 'ohm-js';
import { validateDeclarations, validate } from '../src/semantic.js';

const grammarText = fs.readFileSync('src/TEMP_JS.ohm', 'utf8');
const G = ohm.grammar(grammarText);

function parseResult(code) {
  const m = G.match(code);
  return { ok: m.succeeded(), message: m.failed() ? m.message : '' };
}

test('valid: simple function with if-else and return', () => {
  const code = `
fn check_even(n) {
    if n % 2 == 0 {
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

test('semantics: let mutation via validateDeclarations is an error', () => {
  const errs = validateDeclarations('fn f() {\n  let x = 5\n  x = 10\n}');
  assert.ok(errs.length > 0);
  assert.ok(errs[0].message.includes('immutable'));
});

test('semantics: unclosed function brace returns no errors and does not crash', () => {
  const errs = validateDeclarations('fn f() {');
  assert.equal(errs.length, 0);
});

test('semantics: fn keyword with no opening brace returns no errors', () => {
  const errs = validateDeclarations('fn f()');
  assert.equal(errs.length, 0);
});

test('semantics: validate() with a non-Program object calls validateDeclarations', () => {
  const result = validate({ type: 'NotAProgram' });
  assert.ok(Array.isArray(result));
});

test('semantics: validate() with a Program AST calls the AST analyzer', () => {
  const result = validate({ type: 'Program', body: [] });
  assert.ok(Array.isArray(result));
});

test('semantics: validate() with a string calls validateDeclarations', () => {
  const result = validate('fn f() {\n  x = 1\n}');
  assert.ok(Array.isArray(result));
  assert.ok(result.length > 0);
});
