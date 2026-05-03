import test from 'node:test';
import assert from 'node:assert/strict';
import { optimize } from '../src/optimizer.js';

// Helper node constructors
const lit = v => ({ type: 'Literal', value: v });
const id = n => ({ type: 'Identifier', name: n });
const bin = (op, l, r) => ({ type: 'Binary', op, left: l, right: r });
const unary = (op, e) => ({ type: 'Unary', op, expr: e });
const assign = (target, expr) => ({ type: 'Assign', target, expr });

// ── Constant folding: arithmetic ───────────────────────────────────────────

test('optimizer: folds 2 + 3 to 5', () => {
  const result = optimize(bin('+', lit(2), lit(3)));
  assert.equal(result.type, 'Literal');
  assert.equal(result.value, 5);
});

test('optimizer: folds 10 - 4 to 6', () => {
  const result = optimize(bin('-', lit(10), lit(4)));
  assert.equal(result.value, 6);
});

test('optimizer: folds 3 * 4 to 12', () => {
  const result = optimize(bin('*', lit(3), lit(4)));
  assert.equal(result.value, 12);
});

test('optimizer: folds 10 / 2 to 5', () => {
  const result = optimize(bin('/', lit(10), lit(2)));
  assert.equal(result.value, 5);
});

test('optimizer: folds 7 % 3 to 1', () => {
  const result = optimize(bin('%', lit(7), lit(3)));
  assert.equal(result.value, 1);
});

test('optimizer: folds 2 ** 8 to 256', () => {
  const result = optimize(bin('**', lit(2), lit(8)));
  assert.equal(result.value, 256);
});

// ── Constant folding: comparisons ─────────────────────────────────────────

test('optimizer: folds 3 == 3 to true', () => {
  const result = optimize(bin('==', lit(3), lit(3)));
  assert.equal(result.value, true);
});

test('optimizer: folds 4 > 5 to false', () => {
  const result = optimize(bin('>', lit(4), lit(5)));
  assert.equal(result.value, false);
});

test('optimizer: folds 2 <= 2 to true', () => {
  const result = optimize(bin('<=', lit(2), lit(2)));
  assert.equal(result.value, true);
});

// ── Constant folding: logical ──────────────────────────────────────────────

test('optimizer: folds true && false to false', () => {
  const result = optimize(bin('&&', lit(true), lit(false)));
  assert.equal(result.value, false);
});

test('optimizer: folds true || false to true', () => {
  const result = optimize(bin('||', lit(true), lit(false)));
  assert.equal(result.value, true);
});

// ── Constant folding: unary ────────────────────────────────────────────────

test('optimizer: folds !true to false', () => {
  const result = optimize(unary('!', lit(true)));
  assert.equal(result.value, false);
});

test('optimizer: folds -7 to literal -7', () => {
  const result = optimize(unary('-', lit(7)));
  assert.equal(result.value, -7);
});

// ── Dead code: if with literal condition ───────────────────────────────────

test('optimizer: if true eliminates to then body (single stmt)', () => {
  const br = { type: 'Break' };
  const result = optimize({ type: 'If', cond: lit(true), thenBody: [br], elseBody: null });
  assert.equal(result.type, 'Break');
});

test('optimizer: if false with no else eliminates entirely (returns null)', () => {
  const result = optimize({ type: 'If', cond: lit(false), thenBody: [{ type: 'Break' }], elseBody: null });
  assert.equal(result, null);
});

test('optimizer: if false eliminates to else body (single stmt)', () => {
  const ret = { type: 'Return', expr: null };
  const result = optimize({ type: 'If', cond: lit(false), thenBody: [{ type: 'Break' }], elseBody: [ret] });
  assert.equal(result.type, 'Return');
});

// ── Dead code: while false ─────────────────────────────────────────────────

test('optimizer: while false eliminates loop (returns null)', () => {
  const result = optimize({ type: 'While', cond: lit(false), body: [{ type: 'Break' }] });
  assert.equal(result, null);
});

// ── Dead code: self-assignment ─────────────────────────────────────────────

test('optimizer: x = x is removed (returns null)', () => {
  const result = optimize(assign('x', id('x')));
  assert.equal(result, null);
});

test('optimizer: x = y is kept (different names)', () => {
  const result = optimize(assign('x', id('y')));
  assert.ok(result !== null);
  assert.equal(result.type, 'Assign');
});

// ── Strength reductions ────────────────────────────────────────────────────

test('optimizer: x + 0 simplifies to x', () => {
  const result = optimize(bin('+', id('x'), lit(0)));
  assert.equal(result.type, 'Identifier');
  assert.equal(result.name, 'x');
});

test('optimizer: 0 + x simplifies to x', () => {
  const result = optimize(bin('+', lit(0), id('x')));
  assert.equal(result.type, 'Identifier');
  assert.equal(result.name, 'x');
});

test('optimizer: x * 1 simplifies to x', () => {
  const result = optimize(bin('*', id('x'), lit(1)));
  assert.equal(result.type, 'Identifier');
  assert.equal(result.name, 'x');
});

test('optimizer: 1 * x simplifies to x', () => {
  const result = optimize(bin('*', lit(1), id('x')));
  assert.equal(result.type, 'Identifier');
  assert.equal(result.name, 'x');
});

test('optimizer: x * 0 simplifies to literal 0', () => {
  const result = optimize(bin('*', id('x'), lit(0)));
  assert.equal(result.type, 'Literal');
  assert.equal(result.value, 0);
});

test('optimizer: x / 1 simplifies to x', () => {
  const result = optimize(bin('/', id('x'), lit(1)));
  assert.equal(result.type, 'Identifier');
  assert.equal(result.name, 'x');
});

test('optimizer: x ** 0 simplifies to literal 1', () => {
  const result = optimize(bin('**', id('x'), lit(0)));
  assert.equal(result.type, 'Literal');
  assert.equal(result.value, 1);
});

test('optimizer: 1 ** x simplifies to literal 1', () => {
  const result = optimize(bin('**', lit(1), id('x')));
  assert.equal(result.type, 'Literal');
  assert.equal(result.value, 1);
});

test('optimizer: x - 0 simplifies to x', () => {
  const result = optimize(bin('-', id('x'), lit(0)));
  assert.equal(result.type, 'Identifier');
  assert.equal(result.name, 'x');
});

// ── Arrays and for loops ──────────────────────────────────────────────────

test('optimizer: array literal elements are folded', () => {
  const node = { type: 'ArrayLiteral', elements: [bin('+', lit(1), lit(2)), lit(10)] };
  const result = optimize(node);
  assert.equal(result.elements[0].value, 3);
  assert.equal(result.elements[1].value, 10);
});

test('optimizer: index access folds the index expression', () => {
  const node = { type: 'IndexAccess', array: id('arr'), index: bin('+', lit(1), lit(1)) };
  const result = optimize(node);
  assert.equal(result.index.type, 'Literal');
  assert.equal(result.index.value, 2);
});

test('optimizer: index assign folds the value expression', () => {
  const node = { type: 'IndexAssign', target: 'arr', index: lit(0), value: bin('*', lit(3), lit(3)) };
  const result = optimize(node);
  assert.equal(result.value.type, 'Literal');
  assert.equal(result.value.value, 9);
});

test('optimizer: for loop body has dead code removed', () => {
  const node = {
    type: 'For',
    variable: 'x',
    iterable: id('arr'),
    body: [assign('x', id('x')), { type: 'Break' }]
  };
  const result = optimize(node);
  assert.equal(result.body.length, 1);
  assert.equal(result.body[0].type, 'Break');
});

test('optimizer: Block node passes through unchanged', () => {
  const block = { type: 'Block', body: [{ type: 'Break' }] };
  const result = optimize(block);
  assert.equal(result.type, 'Block');
  assert.equal(result.body.length, 1);
});

// ── Program-level dead code removal ───────────────────────────────────────

test('optimizer: dead statements are filtered from program body', () => {
  const prog = {
    type: 'Program',
    body: [
      assign('x', id('x')),  // self-assignment → null
      { type: 'Break' }       // kept
    ]
  };
  const result = optimize(prog);
  assert.equal(result.body.length, 1);
  assert.equal(result.body[0].type, 'Break');
});

test('optimizer: division by zero is not constant folded', () => {
  const result = optimize(bin('/', lit(5), lit(0)));
  assert.equal(result.type, 'Binary');
});

test('optimizer: modulo by zero is not constant folded', () => {
  const result = optimize(bin('%', lit(5), lit(0)));
  assert.equal(result.type, 'Binary');
});

// ── Guard branches ─────────────────────────────────────────────────────────

test('optimizer: optimize(null) returns null', () => {
  assert.equal(optimize(null), null);
});

test('optimizer: optimize on a non-object primitive returns it unchanged', () => {
  assert.equal(optimize(42), 42);
});

// ── Missing strength reductions ────────────────────────────────────────────

test('optimizer: 0 * x simplifies to literal 0', () => {
  const result = optimize(bin('*', lit(0), id('x')));
  assert.equal(result.type, 'Literal');
  assert.equal(result.value, 0);
});

// ── VarDecl with null init ─────────────────────────────────────────────────

test('optimizer: VarDecl with null init passes through with null init', () => {
  const node = { type: 'VarDecl', kind: 'let', name: 'x', init: null };
  const result = optimize(node);
  assert.equal(result.init, null);
});

// ── if false with multi-statement else ────────────────────────────────────

test('optimizer: if false with multi-statement else returns Block', () => {
  const result = optimize({
    type: 'If',
    cond: lit(false),
    thenBody: [{ type: 'Break' }],
    elseBody: [{ type: 'Break' }, { type: 'Break' }]
  });
  assert.equal(result.type, 'Block');
  assert.equal(result.body.length, 2);
});

test('optimizer: if false with else body that eliminates to empty returns null', () => {
  const result = optimize({
    type: 'If',
    cond: lit(false),
    thenBody: [{ type: 'Break' }],
    elseBody: [assign('x', id('x'))]
  });
  assert.equal(result, null);
});

test('optimizer: Unary with unknown op and literal expr returns node unchanged', () => {
  const node = { type: 'Unary', op: '~', expr: lit(5) };
  const result = optimize(node);
  assert.equal(result.type, 'Unary');
  assert.equal(result.op, '~');
});
