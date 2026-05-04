import fs from 'fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as ohm from 'ohm-js';
import { buildAST } from '../src/parser.js';
import { validateDeclarations, validate } from '../src/core.js';

const grammarText = fs.readFileSync('src/TEMP_JS.ohm', 'utf8');
const G = ohm.grammar(grammarText);

function parseResult(code) {
  const m = G.match(code);
  return { ok: m.succeeded(), message: m.failed() ? m.message : '' };
}

function ast(src) {
  const { ast: tree, errors } = buildAST(src);
  assert.equal(errors.length, 0, `Unexpected parse errors: ${JSON.stringify(errors)}`);
  return tree;
}

// Parse error

test('parser: invalid syntax returns null ast and errors', () => {
  const { ast: tree, errors } = buildAST('fn f() {');
  assert.equal(tree, null);
  assert.ok(errors.length > 0);
});

// Program / Decl

test('parser: minimal function produces Program with FunctionDecl', () => {
  const tree = ast('fn f() { }');
  assert.equal(tree.type, 'Program');
  assert.equal(tree.body[0].type, 'FunctionDecl');
  assert.equal(tree.body[0].name, 'f');
});

// FuncDecl / Param

test('parser: function params produce Param nodes', () => {
  const tree = ast('fn add(x, y) { return x }');
  const fn = tree.body[0];
  assert.equal(fn.params.length, 2);
  assert.equal(fn.params[0].type, 'Param');
  assert.equal(fn.params[0].name, 'x');
  assert.equal(fn.params[1].name, 'y');
});

// VarDecl

test('parser: let declaration produces VarDecl with kind let', () => {
  const tree = ast('fn f() { let x = 1 }');
  const decl = tree.body[0].body[0];
  assert.equal(decl.type, 'VarDecl');
  assert.equal(decl.kind, 'let');
  assert.equal(decl.name, 'x');
});

test('parser: mut declaration produces VarDecl with kind mut', () => {
  const tree = ast('fn f() { mut x = 1 }');
  assert.equal(tree.body[0].body[0].kind, 'mut');
});

// Assign

test('parser: assignment produces Assign node', () => {
  const tree = ast('fn f() { mut x = 1 x = 2 }');
  const stmt = tree.body[0].body[1];
  assert.equal(stmt.type, 'Assign');
  assert.equal(stmt.target, 'x');
});

// Print

test('parser: print produces Print node', () => {
  const tree = ast('fn f() { print(1) }');
  assert.equal(tree.body[0].body[0].type, 'Print');
});

// IfStmt_long

test('parser: if-else produces If node with non-null elseBody', () => {
  const tree = ast('fn f() { if true { let a = 1 } else { let b = 2 } }');
  const stmt = tree.body[0].body[0];
  assert.equal(stmt.type, 'If');
  assert.ok(Array.isArray(stmt.thenBody));
  assert.ok(Array.isArray(stmt.elseBody));
});

// IfStmt_short

test('parser: if without else produces If node with null elseBody', () => {
  const tree = ast('fn f() { if true { } }');
  const stmt = tree.body[0].body[0];
  assert.equal(stmt.type, 'If');
  assert.equal(stmt.elseBody, null);
});

// WhileStmt

test('parser: while produces While node', () => {
  const tree = ast('fn f() { while true { } }');
  assert.equal(tree.body[0].body[0].type, 'While');
});

// ForStmt

test('parser: for loop produces For node with variable and iterable', () => {
  const tree = ast('fn f() { let a = [1] for x in a { } }');
  const stmt = tree.body[0].body[1];
  assert.equal(stmt.type, 'For');
  assert.equal(stmt.variable, 'x');
  assert.ok(stmt.iterable !== null);
});

// IndexAssign

test('parser: index assignment produces IndexAssign node', () => {
  const tree = ast('fn f() { mut a = [1] a[0] = 2 }');
  const stmt = tree.body[0].body[1];
  assert.equal(stmt.type, 'IndexAssign');
  assert.equal(stmt.target, 'a');
});

// ReturnStmt

test('parser: return with expression has non-null expr', () => {
  const tree = ast('fn f() { return 1 }');
  const stmt = tree.body[0].body[0];
  assert.equal(stmt.type, 'Return');
  assert.ok(stmt.expr !== null);
});

test('parser: bare return has null expr', () => {
  const tree = ast('fn f() { return }');
  const stmt = tree.body[0].body[0];
  assert.equal(stmt.type, 'Return');
  assert.equal(stmt.expr, null);
});

// BreakStmt

test('parser: break produces Break node', () => {
  const tree = ast('fn f() { while true { break } }');
  assert.equal(tree.body[0].body[0].body[0].type, 'Break');
});

// ExpStmt

test('parser: expression statement passes through as expression node', () => {
  const tree = ast('fn f() { 1 + 2 }');
  assert.equal(tree.body[0].body[0].type, 'Binary');
});

// Exp_or

test('parser: || produces Binary node with op ||', () => {
  const tree = ast('fn f() { let x = true || false }');
  const expr = tree.body[0].body[0].init;
  assert.equal(expr.type, 'Binary');
  assert.equal(expr.op, '||');
});

// Exp1_and

test('parser: && produces Binary node with op &&', () => {
  const tree = ast('fn f() { let x = true && false }');
  const expr = tree.body[0].body[0].init;
  assert.equal(expr.type, 'Binary');
  assert.equal(expr.op, '&&');
});

// Exp2_compare / relop

test('parser: == comparison routes through relop semantic action', () => {
  const tree = ast('fn f() { let x = 1 == 2 }');
  const expr = tree.body[0].body[0].init;
  assert.equal(expr.type, 'Binary');
  assert.equal(expr.op, '==');
});

test('parser: != comparison routes through relop semantic action', () => {
  const tree = ast('fn f() { let x = 1 != 2 }');
  assert.equal(tree.body[0].body[0].init.op, '!=');
});

test('parser: < comparison routes through relop semantic action', () => {
  const tree = ast('fn f() { let x = 1 < 2 }');
  assert.equal(tree.body[0].body[0].init.op, '<');
});

test('parser: > comparison routes through relop semantic action', () => {
  const tree = ast('fn f() { let x = 1 > 2 }');
  assert.equal(tree.body[0].body[0].init.op, '>');
});

test('parser: <= comparison routes through relop semantic action', () => {
  const tree = ast('fn f() { let x = 1 <= 2 }');
  assert.equal(tree.body[0].body[0].init.op, '<=');
});

test('parser: >= comparison routes through relop semantic action', () => {
  const tree = ast('fn f() { let x = 1 >= 2 }');
  assert.equal(tree.body[0].body[0].init.op, '>=');
});

// Exp3_add / addop

test('parser: + routes through addop semantic action', () => {
  const tree = ast('fn f() { let x = 1 + 2 }');
  assert.equal(tree.body[0].body[0].init.op, '+');
});

test('parser: - routes through addop semantic action', () => {
  const tree = ast('fn f() { let x = 3 - 1 }');
  assert.equal(tree.body[0].body[0].init.op, '-');
});

// Exp4_multiply / mulop

test('parser: * routes through mulop semantic action', () => {
  const tree = ast('fn f() { let x = 2 * 3 }');
  assert.equal(tree.body[0].body[0].init.op, '*');
});

test('parser: / routes through mulop semantic action', () => {
  const tree = ast('fn f() { let x = 6 / 2 }');
  assert.equal(tree.body[0].body[0].init.op, '/');
});

test('parser: % routes through mulop semantic action', () => {
  const tree = ast('fn f() { let x = 7 % 3 }');
  assert.equal(tree.body[0].body[0].init.op, '%');
});

// Exp5_prefix / prefixop

test('parser: unary - routes through prefixop semantic action', () => {
  const tree = ast('fn f() { let x = -5 }');
  const expr = tree.body[0].body[0].init;
  assert.equal(expr.type, 'Unary');
  assert.equal(expr.op, '-');
});

test('parser: unary ! routes through prefixop semantic action', () => {
  const tree = ast('fn f() { let x = !true }');
  assert.equal(tree.body[0].body[0].init.op, '!');
});

// Exp6_power

test('parser: ** produces Binary node with op **', () => {
  const tree = ast('fn f() { let x = 2 ** 3 }');
  const expr = tree.body[0].body[0].init;
  assert.equal(expr.type, 'Binary');
  assert.equal(expr.op, '**');
});

// Exp7_index

test('parser: array index access produces IndexAccess node', () => {
  const tree = ast('fn f() { let a = [1] let x = a[0] }');
  const expr = tree.body[0].body[1].init;
  assert.equal(expr.type, 'IndexAccess');
});

// Exp7_array

test('parser: array literal produces ArrayLiteral with correct element count', () => {
  const tree = ast('fn f() { let a = [1, 2, 3] }');
  const expr = tree.body[0].body[0].init;
  assert.equal(expr.type, 'ArrayLiteral');
  assert.equal(expr.elements.length, 3);
});

// Exp7_call

test('parser: function call produces Call node with callee and args', () => {
  const tree = ast('fn foo() { return 1 } fn f() { let x = foo() }');
  const expr = tree.body[1].body[0].init;
  assert.equal(expr.type, 'Call');
  assert.equal(expr.callee, 'foo');
  assert.equal(expr.args.length, 0);
});

// Exp7_id

test('parser: bare identifier produces Identifier node', () => {
  const tree = ast('fn f(a) { return a }');
  const expr = tree.body[0].body[0].expr;
  assert.equal(expr.type, 'Identifier');
  assert.equal(expr.name, 'a');
});

// Exp7_parens

test('parser: parenthesized expression is transparent', () => {
  const tree = ast('fn f() { let x = (1 + 2) }');
  const expr = tree.body[0].body[0].init;
  assert.equal(expr.type, 'Binary');
  assert.equal(expr.op, '+');
});

// Literals

test('parser: integer literal produces Literal with numeric value', () => {
  const tree = ast('fn f() { let x = 42 }');
  const expr = tree.body[0].body[0].init;
  assert.equal(expr.type, 'Literal');
  assert.equal(expr.value, 42);
});

test('parser: float literal produces Literal with numeric value', () => {
  const tree = ast('fn f() { let x = 3.14 }');
  assert.equal(tree.body[0].body[0].init.value, 3.14);
});

test('parser: string literal strips quotes', () => {
  const tree = ast('fn f() { let x = "hello" }');
  const expr = tree.body[0].body[0].init;
  assert.equal(expr.type, 'Literal');
  assert.equal(expr.value, 'hello');
});

test('parser: true literal produces Literal with value true', () => {
  const tree = ast('fn f() { let x = true }');
  assert.equal(tree.body[0].body[0].init.value, true);
});

test('parser: false literal produces Literal with value false', () => {
  const tree = ast('fn f() { let x = false }');
  assert.equal(tree.body[0].body[0].init.value, false);
});

// Grammar validity

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

// validateDeclarations

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

// ── MatchStmt ──────────────────────────────────────────────────────────────

test('parser: match with literal arms produces Match node', () => {
  const tree = ast('fn f() { let x = 1 match x { 1 => { print(1) } _ => { print(0) } } }');
  const stmt = tree.body[0].body[1];
  assert.equal(stmt.type, 'Match');
  assert.equal(stmt.arms.length, 2);
});

test('parser: match subject is correct expression', () => {
  const tree = ast('fn f() { let x = 1 match x { 1 => { print(1) } _ => { print(0) } } }');
  const stmt = tree.body[0].body[1];
  assert.equal(stmt.subject.type, 'Identifier');
  assert.equal(stmt.subject.name, 'x');
});

test('parser: match literal arm has Literal pattern', () => {
  const tree = ast('fn f() { let x = 1 match x { 1 => { print(1) } _ => { print(0) } } }');
  const arm = tree.body[0].body[1].arms[0];
  assert.equal(arm.pattern.type, 'Literal');
  assert.equal(arm.pattern.value, 1);
});

test('parser: match wildcard arm has WildCard pattern', () => {
  const tree = ast('fn f() { let x = 1 match x { 1 => { print(1) } _ => { print(0) } } }');
  const arm = tree.body[0].body[1].arms[1];
  assert.equal(arm.pattern.type, 'WildCard');
});

test('parser: match arm body contains statements', () => {
  const tree = ast('fn f() { let x = 1 match x { 1 => { print(1) } _ => { print(0) } } }');
  const arm = tree.body[0].body[1].arms[0];
  assert.equal(arm.body.length, 1);
  assert.equal(arm.body[0].type, 'Print');
});

test('parser: match with bool patterns', () => {
  const tree = ast('fn f() { let b = true match b { true => { print(1) } false => { print(0) } } }');
  const stmt = tree.body[0].body[1];
  assert.equal(stmt.arms[0].pattern.value, true);
  assert.equal(stmt.arms[1].pattern.value, false);
});

test('parser: match with string pattern', () => {
  const tree = ast('fn f() { let s = "hi" match s { "hi" => { print(1) } _ => { print(0) } } }');
  const arm = tree.body[0].body[1].arms[0];
  assert.equal(arm.pattern.type, 'Literal');
  assert.equal(arm.pattern.value, 'hi');
});

test('parser: match keyword cannot be used as identifier', () => {
  const { ast: tree, errors } = buildAST('fn f() { let match = 1 }');
  assert.equal(tree, null);
  assert.ok(errors.length > 0);
});

// ── EnumDecl ───────────────────────────────────────────────────────────────

test('parser: enum declaration produces EnumDecl node', () => {
  const tree = ast('enum Color { Red Green Blue }');
  assert.equal(tree.body[0].type, 'EnumDecl');
  assert.equal(tree.body[0].name, 'Color');
});

test('parser: enum variants are captured', () => {
  const tree = ast('enum Color { Red Green Blue }');
  assert.deepEqual(tree.body[0].variants, ['Red', 'Green', 'Blue']);
});

test('parser: enum member access produces MemberAccess node', () => {
  const tree = ast('enum Color { Red } fn f() { let c = Color.Red }');
  const expr = tree.body[1].body[0].init;
  assert.equal(expr.type, 'MemberAccess');
  assert.equal(expr.object, 'Color');
  assert.equal(expr.member, 'Red');
});

test('parser: enum variant match pattern produces EnumVariant node', () => {
  const tree = ast('enum Color { Red Green } fn f() { let c = Color.Red match c { Color.Red => { print(1) } Color.Green => { print(2) } } }');
  const arm = tree.body[1].body[1].arms[0];
  assert.equal(arm.pattern.type, 'EnumVariant');
  assert.equal(arm.pattern.enum, 'Color');
  assert.equal(arm.pattern.variant, 'Red');
});

test('parser: enum keyword cannot be used as identifier', () => {
  const { ast: tree, errors } = buildAST('fn f() { let enum = 1 }');
  assert.equal(tree, null);
  assert.ok(errors.length > 0);
});
