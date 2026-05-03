import fs from 'fs';
import * as ohm from 'ohm-js';

const grammarText = fs.readFileSync(new URL('./TEMP_JS.ohm', import.meta.url), 'utf8');
const G = ohm.grammar(grammarText);
const semantics = G.createSemantics();

// Helper constructors
const n = (type, props) => ({ type, ...props });

semantics.addOperation('ast', {
  Program(decls) {
    return n('Program', { body: decls.children.map(d => d.ast()) });
  },

  Decl(d) { return d.ast(); },

  FuncDecl(_fn, name, _open, params, _close, _openb, stmts, _closeb) {
    const pname = name.ast().name;
    const paramsArr = params.asIteration().children.map(c => c.ast());
    const body = stmts.children.map(s => s.ast());
    return n('FunctionDecl', { name: pname, params: paramsArr, body });
  },

  Param(id) {
    return n('Param', { name: id.ast().name });
  },

  Statement(s) { return s.ast(); },

  VarDecl(kind, id, _eq, init) {
    const k = kind.sourceString;
    const name = id.ast().name;
    return n('VarDecl', { kind: k, name, init: init.ast() });
  },

  Assign(id, _eq, exp) {
    return n('Assign', { target: id.ast().name, expr: exp.ast() });
  },

  Print(_print, _open, exp, _close) {
    return n('Print', { expr: exp.ast() });
  },

  IfStmt_long(_if, cond, _open, thenStmts, _close, _else, _open2, elseStmts, _close2) {
    const thenBody = thenStmts.children.map(s => s.ast());
    const elseBody = elseStmts.children.map(s => s.ast());
    return n('If', { cond: cond.ast(), thenBody, elseBody });
  },

  IfStmt_short(_if, cond, _open, stmts, _close) {
    const thenBody = stmts.children.map(s => s.ast());
    return n('If', { cond: cond.ast(), thenBody, elseBody: null });
  },

  WhileStmt(_while, cond, _open, stmts, _close) {
    return n('While', { cond: cond.ast(), body: stmts.children.map(s => s.ast()) });
  },

  ForStmt(_for, id, _in, iterable, _open, stmts, _close) {
    return n('For', { variable: id.ast().name, iterable: iterable.ast(), body: stmts.children.map(s => s.ast()) });
  },

  IndexAssign(id, _open, index, _close, _eq, value) {
    return n('IndexAssign', { target: id.ast().name, index: index.ast(), value: value.ast() });
  },

  ReturnStmt(_ret, expOpt) {
    const expr = expOpt.children.length ? expOpt.children[0].ast() : null;
    return n('Return', { expr });
  },

  BreakStmt(_b) { return n('Break', {}); },

  ExpStmt(exp) { return exp.ast(); },

  // Expressions
  Exp_or(left, _op, right) { return n('Binary', { op: '||', left: left.ast(), right: right.ast() }); },
  Exp(left) { return left.ast(); },
  Exp1_and(left, _op, right) { return n('Binary', { op: '&&', left: left.ast(), right: right.ast() }); },
  Exp1(left) { return left.ast(); },
  Exp2_compare(left, op, right) { return n('Binary', { op: op.ast(), left: left.ast(), right: right.ast() }); },
  Exp2(left) { return left.ast(); },
  Exp3_add(left, op, right) { return n('Binary', { op: op.ast(), left: left.ast(), right: right.ast() }); },
  Exp3(left) { return left.ast(); },
  Exp4_multiply(left, op, right) { return n('Binary', { op: op.ast(), left: left.ast(), right: right.ast() }); },
  Exp4(left) { return left.ast(); },
  Exp5_prefix(op, expr) { return n('Unary', { op: op.ast(), expr: expr.ast() }); },
  Exp5(expr) { return expr.ast(); },
  Exp6_power(left, _op, right) { return n('Binary', { op: '**', left: left.ast(), right: right.ast() }); },
  Exp6(expr) { return expr.ast(); },
  Exp7_index(arr, _open, index, _close) {
    return n('IndexAccess', { array: arr.ast(), index: index.ast() });
  },
  Exp7_array(_open, elements, _close) {
    return n('ArrayLiteral', { elements: elements.asIteration().children.map(c => c.ast()) });
  },
  Exp7_call(id, _open, args, _close) {
    const argList = args.asIteration().children.map(c => c.ast());
    return n('Call', { callee: id.ast().name, args: argList });
  },
  Exp7_id(id) { return id.ast(); },
  Exp7_parens(_open, expr, _close) { return expr.ast(); },

  relop(ch) { return this.sourceString; },
  addop(ch) { return this.sourceString; },
  mulop(ch) { return this.sourceString; },
  prefixop(ch) { return this.sourceString; },

  id(a, b) { return n('Identifier', { name: this.sourceString }); },

  num(a, b, c) { return n('Literal', { value: Number(this.sourceString) }); },
  string(_open, _chars, _close) { return n('Literal', { value: this.sourceString.slice(1, -1) }); },
  true(_true) { return n('Literal', { value: true }); },
  false(_false) { return n('Literal', { value: false }); },
});

export function buildAST(src) {
  const match = G.match(src);
  if (!match.succeeded()) {
    return { ast: null, errors: [match.message] };
  }
  const ast = semantics(match).ast();
  return { ast, errors: [] };
}

export default { buildAST };
