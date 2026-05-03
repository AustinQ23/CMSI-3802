// Very small transpiler from our AST to JavaScript.
function indent(n) { return '  '.repeat(n); }

function emitExpr(expr, level=0) {
  switch (expr.type) {
    case 'Literal':
      return JSON.stringify(expr.value);
    case 'Identifier':
      return expr.name;
    case 'Binary':
      return `(${emitExpr(expr.left)} ${expr.op} ${emitExpr(expr.right)})`;
    case 'Unary':
      return `(${expr.op}${emitExpr(expr.expr)})`;
    case 'Call':
      return `${expr.callee}(${expr.args.map(a => emitExpr(a)).join(', ')})`;
    case 'ArrayLiteral':
      return `[${expr.elements.map(e => emitExpr(e)).join(', ')}]`;
    case 'IndexAccess':
      return `${emitExpr(expr.array)}[${emitExpr(expr.index)}]`;
    default:
      throw new Error(`Unhandled expr kind ${expr.type}`);
  }
}

function emitStmt(stmt, level=0) {
  switch (stmt.type) {
    case 'VarDecl': {
      const kind = stmt.kind === 'mut' ? 'let' : 'const';
      return `${indent(level)}${kind} ${stmt.name} = ${emitExpr(stmt.init)};`;
    }
    case 'Assign':
      return `${indent(level)}${stmt.target} = ${emitExpr(stmt.expr)};`;
    case 'Print':
      return `${indent(level)}console.log(${emitExpr(stmt.expr)});`;
    case 'If': {
      const thenCode = stmt.thenBody.map(s => emitStmt(s, level+1)).join('\n');
      const elseCode = stmt.elseBody ? stmt.elseBody.map(s => emitStmt(s, level+1)).join('\n') : '';
      return `${indent(level)}if (${emitExpr(stmt.cond)}) {\n${thenCode}\n${indent(level)}}${elseCode ? ' else {\n' + elseCode + '\n' + indent(level) + '}' : ''}`;
    }
    case 'While': {
      const body = stmt.body.map(s => emitStmt(s, level+1)).join('\n');
      return `${indent(level)}while (${emitExpr(stmt.cond)}) {\n${body}\n${indent(level)}}`;
    }
    case 'Return':
      return stmt.expr ? `${indent(level)}return ${emitExpr(stmt.expr)};` : `${indent(level)}return;`;
    case 'Break':
      return `${indent(level)}break;`;
    case 'IndexAssign':
      return `${indent(level)}${stmt.target}[${emitExpr(stmt.index)}] = ${emitExpr(stmt.value)};`;
    case 'For': {
      const body = stmt.body.map(s => emitStmt(s, level + 1)).join('\n');
      return `${indent(level)}for (const ${stmt.variable} of ${emitExpr(stmt.iterable)}) {\n${body}\n${indent(level)}}`;
    }
    case 'Block':
      return stmt.body.map(s => emitStmt(s, level)).join('\n');
    default:
      return `${indent(level)}${emitExpr(stmt)};`;
  }
}

export function generateJS(ast) {
  if (!ast || ast.type !== 'Program') throw new Error('Invalid AST for codegen');
  const parts = [];
  for (const node of ast.body) {
    if (node.type === 'FunctionDecl') {
      const params = node.params.map(p => p.name).join(', ');
      const body = node.body.map(s => emitStmt(s, 1)).join('\n');
      parts.push(`function ${node.name}(${params}) {\n${body}\n}`);
    } else {
      parts.push(emitStmt(node, 0));
    }
  }
  // For convenience, if there's a `main` function, call it.
  if (ast.body.some(n => n.type === 'FunctionDecl' && n.name === 'main')) {
    parts.push('main();');
  }
  return parts.join('\n\n');
}

export default { generateJS };
