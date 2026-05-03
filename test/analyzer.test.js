import test from 'node:test';
import assert from 'node:assert/strict';
import { compile } from '../src/compiler.js';

function errorsIn(src) {
  return compile(src, 'analyzed').diagnostics.map(d => d.message);
}

function passes(src) {
  return compile(src, 'analyzed').diagnostics.length === 0;
}

function hasError(src, substr) {
  return errorsIn(src).some(m => m.includes(substr));
}

// ── Undeclared identifiers ─────────────────────────────────────────────────

test('analyzer: undeclared variable used inside function', () => {
  assert.ok(hasError('fn f() { let x = y }', 'Undeclared variable'));
});

test('analyzer: undeclared variable at top level', () => {
  assert.ok(hasError('let x = z', 'Undeclared variable'));
});

test('analyzer: undeclared function called', () => {
  assert.ok(hasError('fn f() { ghost() }', 'undeclared function'));
});

// ── Mutability ─────────────────────────────────────────────────────────────

test('analyzer: let variable cannot be reassigned in function', () => {
  assert.ok(hasError('fn f() { let x = 1 x = 2 }', 'immutable'));
});

test('analyzer: let variable cannot be reassigned at top level', () => {
  assert.ok(hasError('let x = 1 x = 2', 'immutable'));
});

test('analyzer: mut variable can be reassigned', () => {
  assert.ok(passes('fn f() { mut x = 1 x = 2 }'));
});

// ── Break context ──────────────────────────────────────────────────────────

test('analyzer: break inside while loop is valid', () => {
  assert.ok(passes('fn f() { while true { break } }'));
});

test('analyzer: break outside any loop is an error', () => {
  assert.ok(hasError('fn f() { break }', 'outside of a loop'));
});

test('analyzer: break inside if that is inside a while is valid', () => {
  assert.ok(passes('fn f() { while true { if true { break } } }'));
});

test('analyzer: break inside nested while is valid', () => {
  assert.ok(passes('fn f() { while true { while true { break } } }'));
});

// ── Return context ─────────────────────────────────────────────────────────

test('analyzer: return at top level is an error', () => {
  assert.ok(hasError('return 1', 'outside of a function'));
});

test('analyzer: return inside function is valid', () => {
  assert.ok(passes('fn f() { return 1 }'));
});

test('analyzer: bare return inside function is valid', () => {
  assert.ok(passes('fn f() { return }'));
});

// ── Function arity ─────────────────────────────────────────────────────────

test('analyzer: too few arguments', () => {
  assert.ok(hasError('fn add(x, y) { return x } fn main() { add(1) }', 'expects 2'));
});

test('analyzer: too many arguments', () => {
  assert.ok(hasError('fn add(x, y) { return x } fn main() { add(1, 2, 3) }', 'expects 2'));
});

test('analyzer: correct argument count is valid', () => {
  assert.ok(passes('fn add(x, y) { return x } fn main() { let r = add(1, 2) }'));
});

test('analyzer: zero-argument call is valid', () => {
  assert.ok(passes('fn ping() { return 1 } fn main() { let r = ping() }'));
});

// ── Type errors in expressions ─────────────────────────────────────────────

test('analyzer: num + str is a type error', () => {
  assert.ok(hasError('fn f() { let x = 3 + "hello" }', "requires num operands"));
});

test('analyzer: str - num is a type error', () => {
  assert.ok(hasError('fn f() { let x = "hi" - 2 }', "requires num operands"));
});

test('analyzer: less-than requires num operands', () => {
  assert.ok(hasError('fn f() { let x = "a" < "b" }', "requires num operands"));
});

test('analyzer: logical && requires bool operands', () => {
  assert.ok(hasError('fn f() { let x = 1 && 2 }', "requires bool operands"));
});

test('analyzer: str + str is valid (string concatenation)', () => {
  assert.ok(passes('fn f() { let s = "hello" + " world" }'));
});

// ── Assignment type checking ───────────────────────────────────────────────

test('analyzer: assigning str to an inferred-num variable is an error', () => {
  assert.ok(hasError('fn f() { mut x = 5 x = "hello" }', "inferred type 'num'"));
});

test('analyzer: assigning num to an inferred-str variable is an error', () => {
  assert.ok(hasError('fn f() { mut s = "hi" s = 42 }', "inferred type 'str'"));
});

test('analyzer: reassigning same type to mut variable is valid', () => {
  assert.ok(passes('fn f() { mut x = 10 x = 20 }'));
});

// ── Condition type checking ────────────────────────────────────────────────

test('analyzer: if condition that is a num is an error', () => {
  assert.ok(hasError('fn f() { if 5 { } }', "must be 'bool'"));
});

test('analyzer: while condition that is a str is an error', () => {
  assert.ok(hasError('fn f() { while "yes" { } }', "must be 'bool'"));
});

test('analyzer: if condition that is bool is valid', () => {
  assert.ok(passes('fn f() { if true { } }'));
});

// ── Return type consistency ────────────────────────────────────────────────

test('analyzer: inconsistent return types in same function is an error', () => {
  const src = `
fn f(flag) {
  if flag {
    return 1
  } else {
    return "oops"
  }
}`;
  assert.ok(hasError(src, 'inconsistent types'));
});

test('analyzer: consistent return types in same function is valid', () => {
  const src = `
fn double(x) {
  return x + x
}`;
  assert.ok(passes(src));
});

// ── Scope isolation ────────────────────────────────────────────────────────

test('analyzer: variable declared inside if body does not leak to outer scope', () => {
  const src = `
fn f() {
  if true {
    let inner = 1
  }
  let x = inner
}`;
  assert.ok(hasError(src, 'Undeclared variable'));
});

// ── Unary operators ────────────────────────────────────────────────────────

test('analyzer: unary minus on a num is valid', () => {
  assert.ok(passes('fn f() { let x = -5 }'));
});

test('analyzer: unary ! on a bool is valid', () => {
  assert.ok(passes('fn f() { let x = !true }'));
});

test('analyzer: unary minus on a bool is an error', () => {
  assert.ok(hasError('fn f() { let x = -true }', "Unary '-' requires num"));
});

test('analyzer: unary ! on a num is an error', () => {
  assert.ok(hasError('fn f() { let x = !5 }', "Unary '!' requires bool"));
});

// ── Comparison type checking ───────────────────────────────────────────────

test('analyzer: == with mixed types is an error', () => {
  assert.ok(hasError('fn f() { let x = 3 == "hello" }', "Cannot compare"));
});

test('analyzer: != with mixed types is an error', () => {
  assert.ok(hasError('fn f() { let x = 3 != "hello" }', "Cannot compare"));
});

// ── Assign to undeclared ───────────────────────────────────────────────────

test('analyzer: assign to completely undeclared variable is an error', () => {
  assert.ok(hasError('fn f() { x = 5 }', 'undeclared'));
});

// ── Arrays ─────────────────────────────────────────────────────────────────

test('analyzer: array literal infers type array', () => {
  assert.ok(passes('fn f() { let a = [1, 2, 3] }'));
});

test('analyzer: indexing a non-array is an error', () => {
  assert.ok(hasError('fn f() { let x = 5 let y = x[0] }', "Cannot index into type 'num'"));
});

test('analyzer: array index must be num', () => {
  assert.ok(hasError('fn f() { let a = [1, 2] let x = a["bad"] }', "index must be 'num'"));
});

test('analyzer: index-assigning to a let array is an error', () => {
  assert.ok(hasError('fn f() { let a = [1, 2, 3] a[0] = 99 }', 'immutable'));
});

test('analyzer: index-assigning to a mut array is valid', () => {
  assert.ok(passes('fn f() { mut a = [1, 2, 3] a[0] = 99 }'));
});

test('analyzer: index-assigning to an undeclared variable is an error', () => {
  assert.ok(hasError('fn f() { ghost[0] = 1 }', 'undeclared'));
});

// ── For loops ──────────────────────────────────────────────────────────────

test('analyzer: for loop over an array is valid', () => {
  assert.ok(passes('fn f() { let a = [1, 2, 3] for x in a { print(x) } }'));
});

test('analyzer: for loop over a non-array is an error', () => {
  assert.ok(hasError('fn f() { let n = 5 for x in n { } }', "requires an array"));
});

test('analyzer: for loop variable does not leak outside the loop', () => {
  assert.ok(hasError('fn f() { for x in [1, 2] { } let y = x }', 'Undeclared variable'));
});

test('analyzer: break is valid inside a for loop', () => {
  assert.ok(passes('fn f() { for x in [1, 2, 3] { break } }'));
});

test('analyzer: for loop over an inline array literal is valid', () => {
  assert.ok(passes('fn f() { for x in [10, 20, 30] { print(x) } }'));
});

test('analyzer: complete valid program produces no errors', () => {
  const src = `
fn add(x, y) {
  return x + y
}
fn main() {
  let a = 10
  mut b = add(a, 5)
  b = b * 2
  print(b)
}`;
  assert.ok(passes(src));
});

test('analyzer: && with bool operands is valid', () => {
  assert.ok(passes('fn f() { let x = true && false }'));
});

test('analyzer: || with bool operands is valid', () => {
  assert.ok(passes('fn f() { let x = true || false }'));
});
