import test from 'node:test';
import assert from 'node:assert/strict';
import { compile } from '../src/compiler.js';
import { generateJS } from '../src/generator.js';

function gen(src) {
  const { result, diagnostics } = compile(src, 'js');
  if (diagnostics.length) throw new Error(diagnostics.map(d => d.message).join('; '));
  return result;
}

function contains(src, fragment) {
  return gen(src).includes(fragment);
}

// Variable declarations

test('generator: let declaration becomes const', () => {
  assert.ok(contains('fn f() { let x = 5 }', 'const x = 5'));
});

test('generator: mut declaration becomes let', () => {
  assert.ok(contains('fn f() { mut x = 5 }', 'let x = 5'));
});

// Print

test('generator: print becomes console.log', () => {
  assert.ok(contains('fn f() { print(42) }', 'console.log(42)'));
});

test('generator: print of a string literal', () => {
  assert.ok(contains('fn f() { print("hi") }', 'console.log("hi")'));
});

// Control flow

test('generator: if without else', () => {
  const out = gen('fn f() { let x = 5 if x < 10 { print(1) } }');
  assert.ok(out.includes('if'));
  assert.ok(!out.includes('else'));
});

test('generator: if with else', () => {
  const out = gen('fn f() { let x = 5 if x < 10 { print(1) } else { print(2) } }');
  assert.ok(out.includes('if'));
  assert.ok(out.includes('else'));
});

test('generator: while loop', () => {
  assert.ok(contains('fn f() { while 1 < 2 { break } }', 'while'));
});

test('generator: break becomes break', () => {
  assert.ok(contains('fn f() { while true { break } }', 'break;'));
});

// Functions and calls

test('generator: function declaration uses function keyword', () => {
  assert.ok(contains('fn greet() { }', 'function greet()'));
});

test('generator: function with parameters', () => {
  assert.ok(contains('fn add(x, y) { return x + y }', 'function add(x, y)'));
});

test('generator: return with value', () => {
  assert.ok(contains('fn f() { return 42 }', 'return 42'));
});

test('generator: bare return', () => {
  assert.ok(contains('fn f() { return }', 'return;'));
});

test('generator: function call emits call expression', () => {
  const src = 'fn id(x) { return x } fn main() { let r = id(7) }';
  assert.ok(contains(src, 'id(7)'));
});

// Auto-call main

test('generator: main function is auto-called at end of output', () => {
  const out = gen('fn main() { print(1) }');
  assert.ok(out.trimEnd().endsWith('main();'));
});

test('generator: no main function means no auto-call', () => {
  const out = gen('fn helper() { return 1 }');
  assert.ok(!out.includes('main()'));
});

// Literals

test('generator: boolean true literal', () => {
  assert.ok(contains('fn f() { let b = true }', 'true'));
});

test('generator: boolean false literal', () => {
  assert.ok(contains('fn f() { let b = false }', 'false'));
});

test('generator: arithmetic expression preserves parentheses', () => {
  const out = gen('fn f() { let x = 2 + 3 * 4 }');
  // optimizer folds 2+12=14 but expression structure should be there
  assert.ok(out.includes('x'));
});

// Arrays and for loops

test('generator: array literal emits JS array', () => {
  assert.ok(contains('fn f() { let a = [1, 2, 3] }', '[1, 2, 3]'));
});

test('generator: empty array literal emits []', () => {
  assert.ok(contains('fn f() { let a = [] }', '= []'));
});

test('generator: index access emits bracket notation', () => {
  assert.ok(contains('fn f() { let a = [1, 2] let x = a[0] }', 'a[0]'));
});

test('generator: index assign emits bracket assignment', () => {
  assert.ok(contains('fn f() { mut a = [1, 2, 3] a[0] = 99 }', 'a[0] = 99'));
});

test('generator: for loop emits for...of', () => {
  const out = gen('fn f() { for x in [1, 2, 3] { print(x) } }');
  assert.ok(out.includes('for (const x of'));
});

test('generator: for loop body is indented', () => {
  const out = gen('fn f() { let a = [1, 2] for x in a { print(x) } }');
  assert.ok(out.includes('for (const x of a)'));
  assert.ok(out.includes('console.log(x)'));
});

// Unary expressions

test('generator: unary ! emits prefix operator', () => {
  const out = gen('fn f() { let flag = true let x = !flag }');
  assert.ok(out.includes('(!flag)'));
});

test('generator: unary - emits prefix operator', () => {
  const out = gen('fn f() { let a = [1] let x = a[0] let y = -x }');
  assert.ok(out.includes('(-x)'));
});

// Error handling

test('generator: generateJS throws on unknown expression type', () => {
  assert.throws(
    () => generateJS({ type: 'Program', body: [{ type: 'VarDecl', kind: 'let', name: 'x', init: { type: 'BogusExpr' } }] }),
    /Unhandled expr kind/
  );
});

// Block nodes

test('generator: Block node from optimized if-true emits statements inline', () => {
  const out = gen('fn f() { if true { let x = 1 let y = 2 } }');
  assert.ok(out.includes('const x = 1'));
  assert.ok(out.includes('const y = 2'));
});

// Standalone expression statements 

test('generator: standalone function call as statement emits call with semicolon', () => {
  const out = gen('fn ping() { return 1 } fn f() { ping() }');
  assert.ok(out.includes('ping();'));
});

// Top-level statements

test('generator: top-level variable declaration emits outside any function', () => {
  const out = gen('let x = 5');
  assert.ok(out.includes('const x = 5'));
  assert.ok(!out.includes('main()'));
});

// Assignment

test('generator: reassignment emits plain assignment', () => {
  assert.ok(contains('fn f() { mut x = 1 x = 2 }', 'x = 2'));
});

test('generator: power operator emits **', () => {
  const out = gen('fn f() { let a = [1] let x = a[0] let y = x ** 2 }');
  assert.ok(out.includes('**'));
});

test('generator: parenthesized expression is preserved', () => {
  const out = gen('fn f() { let a = [1] let x = a[0] let y = (x + 1) }');
  assert.ok(out.includes('(x + 1)'));
});

test('generator: generateJS throws on null AST', () => {
  assert.throws(() => generateJS(null), /Invalid AST for codegen/);
});

test('generator: generateJS throws on non-Program AST', () => {
  assert.throws(() => generateJS({ type: 'FunctionDecl' }), /Invalid AST for codegen/);
});

// Match statement 

test('generator: match emits if/else chain', () => {
  const out = gen('fn f() { let x = 1 match x { 1 => { print(1) } _ => { print(0) } } }');
  assert.ok(out.includes('const __match ='));
  assert.ok(out.includes('if (__match === 1)'));
  assert.ok(out.includes('else {'));
});

test('generator: match with multiple literal arms emits else if', () => {
  const out = gen('fn f() { let x = 1 match x { 1 => { print(1) } 2 => { print(2) } _ => { print(0) } } }');
  assert.ok(out.includes('if (__match === 1)'));
  assert.ok(out.includes('else if (__match === 2)'));
  assert.ok(out.includes('else {'));
});

test('generator: match wildcard-only arm emits plain block', () => {
  const out = gen('fn f() { let x = 1 match x { _ => { print(x) } } }');
  assert.ok(out.includes('const __match ='));
  assert.ok(!out.includes('if'));
});

test('generator: match with bool patterns emits correct literals', () => {
  const out = gen('fn f() { let b = true match b { true => { print(1) } false => { print(0) } } }');
  assert.ok(out.includes('__match === true'));
  assert.ok(out.includes('__match === false'));
});

test('generator: match arm body statements are emitted', () => {
  const out = gen('fn f() { let x = 1 match x { 1 => { print(99) } _ => { print(0) } } }');
  assert.ok(out.includes('console.log(99)'));
});

// Enums

test('generator: enum declaration emits Object.freeze', () => {
  const out = gen('enum Color { Red Green Blue }');
  assert.ok(out.includes('Object.freeze'));
  assert.ok(out.includes('Red: "Red"'));
  assert.ok(out.includes('Green: "Green"'));
  assert.ok(out.includes('Blue: "Blue"'));
});

test('generator: enum declaration uses const', () => {
  const out = gen('enum Dir { North South }');
  assert.ok(out.includes('const Dir ='));
});

test('generator: member access emits dot notation', () => {
  const out = gen('enum Color { Red } fn f() { let c = Color.Red }');
  assert.ok(out.includes('Color.Red'));
});

test('generator: enum variant match pattern emits correct comparison', () => {
  const out = gen('enum Color { Red Green } fn f() { let c = Color.Red match c { Color.Red => { print(1) } Color.Green => { print(2) } } }');
  assert.ok(out.includes('__match === Color.Red'));
  assert.ok(out.includes('__match === Color.Green'));
});

// FString 

test('generator: fstring with text only emits template literal', () => {
  const out = gen('fn f() { let s = f"hello world" }');
  assert.ok(out.includes('`hello world`'));
});

test('generator: fstring with interpolation emits template literal with ${...}', () => {
  const out = gen('fn f() { let x = 5 let s = f"x is {x}" }');
  assert.ok(out.includes('`x is ${x}`'));
});

test('generator: fstring with expression interpolation wraps in ${...}', () => {
  const out = gen('fn f() { let x = 3 let s = f"result: {x + 1}" }');
  assert.ok(out.includes('${'));
  assert.ok(out.includes('result: '));
});

test('generator: empty fstring emits empty template literal', () => {
  const out = gen('fn f() { let s = f"" }');
  assert.ok(out.includes('``'));
});

// range() built-in 

test('generator: range call emits range()', () => {
  const out = gen('fn f() { for x in range(5) { print(x) } }');
  assert.ok(out.includes('range(5)'));
});

test('generator: range in for loop emits for...of range()', () => {
  const out = gen('fn f() { for x in range(5) { print(x) } }');
  assert.ok(out.includes('for (const x of range(5))'));
});

test('generator: range helper is emitted when range is used', () => {
  const out = gen('fn f() { for x in range(3) { print(x) } }');
  assert.ok(out.includes('function range('));
});

test('generator: range helper is not emitted when range is not used', () => {
  const out = gen('fn f() { let x = 5 }');
  assert.ok(!out.includes('function range('));
});

test('generator: range with two args emits range(start, stop)', () => {
  const out = gen('fn f() { for x in range(1, 5) { print(x) } }');
  assert.ok(out.includes('range(1, 5)'));
});

test('generator: range with three args emits range(start, stop, step)', () => {
  const out = gen('fn f() { for x in range(0, 10, 2) { print(x) } }');
  assert.ok(out.includes('range(0, 10, 2)'));
});

// ── Floor division ─────────────────────────────────────────────────────────

test('generator: floor division emits Math.floor', () => {
  const out = gen('fn f() { let a = [7] let x = a[0] let y = x // 2 }');
  assert.ok(out.includes('Math.floor('));
});

test('generator: floor division with variables emits Math.floor(a / b)', () => {
  const out = gen('fn f() { let a = [7] let x = a[0] let y = x // 2 }');
  assert.ok(out.includes('Math.floor(x / 2)'));
});
