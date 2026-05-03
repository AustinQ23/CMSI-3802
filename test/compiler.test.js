import test from 'node:test';
import assert from 'node:assert/strict';
import { compile } from '../src/compiler.js';

// ── Parse errors ───────

test('compiler: syntax error returns diagnostics and null result', () => {
  const { result, diagnostics } = compile('fn ()', 'js');
  assert.equal(result, null);
  assert.ok(diagnostics.length > 0);
});

test('compiler: all diagnostics have a message property', () => {
  const { diagnostics } = compile('fn ()', 'js');
  for (const d of diagnostics) {
    assert.ok(typeof d.message === 'string' && d.message.length > 0);
  }
});

// ── Pipeline stages ────────────────────────────────────────────────────────

test('compiler: outputType "parsed" returns string confirmation on valid input', () => {
  const { result, diagnostics } = compile('fn f() { }', 'parsed');
  assert.equal(diagnostics.length, 0);
  assert.equal(typeof result, 'string');
});

test('compiler: outputType "analyzed" returns AST object on valid input', () => {
  const { result, diagnostics } = compile('fn f() { }', 'analyzed');
  assert.equal(diagnostics.length, 0);
  assert.equal(typeof result, 'object');
  assert.equal(result.type, 'Program');
});

test('compiler: outputType "optimized" returns AST object on valid input', () => {
  const { result, diagnostics } = compile('fn f() { }', 'optimized');
  assert.equal(diagnostics.length, 0);
  assert.equal(result.type, 'Program');
});

test('compiler: outputType "js" returns a string on valid input', () => {
  const { result, diagnostics } = compile('fn f() { }', 'js');
  assert.equal(diagnostics.length, 0);
  assert.equal(typeof result, 'string');
});

// ── Semantic errors short-circuit code generation ─────────────────────────

test('compiler: semantic error prevents JS output', () => {
  const { result, diagnostics } = compile('fn f() { let x = 1 x = 2 }', 'js');
  assert.equal(result, null);
  assert.ok(diagnostics.length > 0);
});

// ── End-to-end programs ────────────────────────────────────────────────────

test('compiler: complete program compiles to runnable JS', () => {
  const src = `
fn square(n) {
  return n * n
}
fn main() {
  let x = square(4)
  print(x)
}`;
  const { result, diagnostics } = compile(src, 'js');
  assert.equal(diagnostics.length, 0);
  assert.ok(result.includes('function square'));
  assert.ok(result.includes('console.log'));
  assert.ok(result.trimEnd().endsWith('main();'));
});
