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

// MatchStmt

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

// EnumDecl 

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

// FString 

test('parser: fstring produces FString node', () => {
  const tree = ast('fn f() { let s = f"hello" }');
  assert.equal(tree.body[0].body[0].init.type, 'FString');
});

test('parser: fstring with text-only part produces FStringText', () => {
  const tree = ast('fn f() { let s = f"hello" }');
  const parts = tree.body[0].body[0].init.parts;
  assert.equal(parts[0].type, 'FStringText');
  assert.equal(parts[0].value, 'hello');
});

test('parser: fstring with interpolation produces FStringInterp', () => {
  const tree = ast('fn f(x) { let s = f"val: {x}" }');
  const parts = tree.body[0].body[0].init.parts;
  assert.equal(parts[0].type, 'FStringText');
  assert.equal(parts[1].type, 'FStringInterp');
  assert.equal(parts[1].expr.type, 'Identifier');
});

test('parser: fstring with multiple interpolations', () => {
  const tree = ast('fn f(a, b) { let s = f"{a} and {b}" }');
  const parts = tree.body[0].body[0].init.parts;
  assert.equal(parts[0].type, 'FStringInterp');
  assert.equal(parts[1].type, 'FStringText');
  assert.equal(parts[2].type, 'FStringInterp');
});

test('parser: empty fstring produces FString with no parts', () => {
  const tree = ast('fn f() { let s = f"" }');
  assert.equal(tree.body[0].body[0].init.parts.length, 0);
});

test('parser: fstring interpolation can contain expressions', () => {
  const tree = ast('fn f(x) { let s = f"result: {x + 1}" }');
  const interp = tree.body[0].body[0].init.parts[1];
  assert.equal(interp.expr.type, 'Binary');
  assert.equal(interp.expr.op, '+');
});

// StructDecl

test('parser: struct declaration produces StructDecl node', () => {
  const tree = ast('struct Point { x y }');
  assert.equal(tree.body[0].type, 'StructDecl');
  assert.equal(tree.body[0].name, 'Point');
  assert.deepEqual(tree.body[0].fields, ['x', 'y']);
});

// InterfaceDecl / MethodSig

test('parser: interface declaration produces InterfaceDecl node', () => {
  const tree = ast('interface Describable { fn describe() }');
  assert.equal(tree.body[0].type, 'InterfaceDecl');
  assert.equal(tree.body[0].name, 'Describable');
  assert.equal(tree.body[0].methods.length, 1);
});

test('parser: interface method signature captures name and paramCount', () => {
  const tree = ast('interface Greeter { fn greet(name) }');
  const method = tree.body[0].methods[0];
  assert.equal(method.name, 'greet');
  assert.equal(method.paramCount, 1);
});

// ImplDecl

test('parser: impl declaration produces ImplDecl node', () => {
  const tree = ast('struct Circle { radius } interface Describable { fn describe() } impl Circle for Describable { fn describe() { return f"hi" } }');
  const impl = tree.body[2];
  assert.equal(impl.type, 'ImplDecl');
  assert.equal(impl.structName, 'Circle');
  assert.equal(impl.interfaceName, 'Describable');
  assert.equal(impl.methods.length, 1);
});

test('parser: impl method is a FunctionDecl with correct name', () => {
  const tree = ast('struct Circle { radius } interface Describable { fn describe() } impl Circle for Describable { fn describe() { return f"hi" } }');
  const method = tree.body[2].methods[0];
  assert.equal(method.type, 'FunctionDecl');
  assert.equal(method.name, 'describe');
});

// CompoundAssign

test('parser: += produces CompoundAssign node', () => {
  const tree = ast('fn f() { mut x = 1 x += 2 }');
  const stmt = tree.body[0].body[1];
  assert.equal(stmt.type, 'CompoundAssign');
  assert.equal(stmt.target, 'x');
  assert.equal(stmt.op, '+=');
});

test('parser: -= produces CompoundAssign node with op -=', () => {
  const tree = ast('fn f() { mut x = 5 x -= 1 }');
  const stmt = tree.body[0].body[1];
  assert.equal(stmt.type, 'CompoundAssign');
  assert.equal(stmt.op, '-=');
});

// IncrDecr

test('parser: ++ produces IncrDecr node', () => {
  const tree = ast('fn f() { mut x = 1 x++ }');
  const stmt = tree.body[0].body[1];
  assert.equal(stmt.type, 'IncrDecr');
  assert.equal(stmt.target, 'x');
  assert.equal(stmt.op, '++');
});

test('parser: -- produces IncrDecr node with op --', () => {
  const tree = ast('fn f() { mut x = 1 x-- }');
  const stmt = tree.body[0].body[1];
  assert.equal(stmt.type, 'IncrDecr');
  assert.equal(stmt.op, '--');
});

// FieldAssign

test('parser: field assignment produces FieldAssign node', () => {
  const tree = ast('struct Point { x y } fn f() { mut p = Point { x: 0, y: 0 } p.x = 5 }');
  const stmt = tree.body[1].body[1];
  assert.equal(stmt.type, 'FieldAssign');
  assert.equal(stmt.object, 'p');
  assert.equal(stmt.field, 'x');
});

// Exp7_structlit / FieldInit

test('parser: struct literal produces StructLiteral node with fields', () => {
  const tree = ast('struct Point { x y } fn f() { let p = Point { x: 3, y: 4 } }');
  const expr = tree.body[1].body[0].init;
  assert.equal(expr.type, 'StructLiteral');
  assert.equal(expr.name, 'Point');
  assert.equal(expr.fields.length, 2);
  assert.equal(expr.fields[0].name, 'x');
  assert.equal(expr.fields[1].name, 'y');
});

test('parser: struct literal field init has name and value', () => {
  const tree = ast('struct Point { x y } fn f() { let p = Point { x: 3, y: 4 } }');
  const field = tree.body[1].body[0].init.fields[0];
  assert.equal(field.name, 'x');
  assert.equal(field.value.type, 'Literal');
  assert.equal(field.value.value, 3);
});

// Exp7_methodcall

test('parser: method call produces MethodCall node', () => {
  const tree = ast('struct Circle { radius } interface Describable { fn describe() } impl Circle for Describable { fn describe() { return f"hi" } } fn f() { let c = Circle { radius: 5 } let s = c.describe() }');
  const expr = tree.body[3].body[1].init;
  assert.equal(expr.type, 'MethodCall');
  assert.equal(expr.object, 'c');
  assert.equal(expr.method, 'describe');
  assert.equal(expr.args.length, 0);
});

// FString edge cases (parseFStringParts branches)

test('parser: fstring with unclosed brace reads to end of string', () => {
  const tree = ast('fn f(world) { let s = f"hello {world" }');
  const parts = tree.body[0].body[0].init.parts;
  assert.equal(parts[0].type, 'FStringText');
  assert.equal(parts[1].type, 'FStringInterp');
});

test('parser: fstring with empty braces produces null expr', () => {
  const tree = ast('fn f() { let s = f"hello {}" }');
  const parts = tree.body[0].body[0].init.parts;
  assert.equal(parts[1].type, 'FStringInterp');
  assert.equal(parts[1].expr, null);
});

test('parser: method call with argument captures args array', () => {
  const tree = ast('struct Greeter { val } interface Greetable { fn greet(who) } impl Greeter for Greetable { fn greet(who) { return f"hi {who}" } } fn f() { let g = Greeter { val: 1 } let s = g.greet("world") }');
  const expr = tree.body[3].body[1].init;
  assert.equal(expr.type, 'MethodCall');
  assert.equal(expr.args.length, 1);
  assert.equal(expr.args[0].type, 'Literal');
});
