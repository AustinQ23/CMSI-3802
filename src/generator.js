// Very small transpiler from our AST to JavaScript.
function indent(n) { return '  '.repeat(n); }

function emitExpr(expr, level=0) {
  switch (expr.type) {
    case 'Literal':
      return JSON.stringify(expr.value);
    case 'Identifier':
      return expr.name;
    case 'Binary':
      if (expr.op === '//') return `Math.floor(${emitExpr(expr.left)} / ${emitExpr(expr.right)})`;
      return `(${emitExpr(expr.left)} ${expr.op} ${emitExpr(expr.right)})`;
    case 'Unary':
      return `(${expr.op}${emitExpr(expr.expr)})`;
    case 'Call':
      return `${expr.callee}(${expr.args.map(a => emitExpr(a)).join(', ')})`;
    case 'ArrayLiteral':
      return `[${expr.elements.map(e => emitExpr(e)).join(', ')}]`;
    case 'IndexAccess':
      return `${emitExpr(expr.array)}[${emitExpr(expr.index)}]`;
    case 'MemberAccess':
      return `${expr.object}.${expr.member}`;
    case 'FString': {
      const content = expr.parts.map(p =>
        p.type === 'FStringText' ? p.value : '${' + emitExpr(p.expr) + '}'
      ).join('');
      return '`' + content + '`';
    }
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
    case 'IncrDecr':
      return `${indent(level)}${stmt.target}${stmt.op};`;
    case 'CompoundAssign':
      return `${indent(level)}${stmt.target} ${stmt.op} ${emitExpr(stmt.expr)};`;
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
    case 'Match': {
      const lines = [`${indent(level)}{`];
      lines.push(`${indent(level + 1)}const __match = ${emitExpr(stmt.subject)};`);
      let first = true;
      for (const arm of stmt.arms) {
        const bodyCode = arm.body.map(s => emitStmt(s, level + 2)).join('\n');
        if (arm.pattern.type === 'WildCard') {
          lines.push(`${indent(level + 1)}${first ? '' : 'else '}{\n${bodyCode}\n${indent(level + 1)}}`);
        } else {
          const kw = first ? 'if' : 'else if';
          const patExpr = arm.pattern.type === 'EnumVariant'
            ? `${arm.pattern.enum}.${arm.pattern.variant}`
            : JSON.stringify(arm.pattern.value);
          lines.push(`${indent(level + 1)}${kw} (__match === ${patExpr}) {\n${bodyCode}\n${indent(level + 1)}}`);
        }
        first = false;
      }
      lines.push(`${indent(level)}}`);
      return lines.join('\n');
    }
    case 'Block':
      return stmt.body.map(s => emitStmt(s, level)).join('\n');
    default:
      return `${indent(level)}${emitExpr(stmt)};`;
  }
}

const RANGE_HELPER = `function range(start, stop, step) {
  if (stop === undefined) { stop = start; start = 0; }
  if (step === undefined) step = 1;
  const result = [];
  for (let i = start; i < stop; i += step) result.push(i);
  return result;
}`;

function hasRangeCall(nodes) {
  if (!nodes) return false;
  for (const node of nodes) {
    if (!node) continue;
    if (node.type === 'Call' && node.callee === 'range') return true;
    if (node.type === 'FunctionDecl' && hasRangeCall(node.body)) return true;
    if (node.type === 'If' && (hasRangeCall(node.thenBody) || hasRangeCall(node.elseBody))) return true;
    if (node.type === 'While' && hasRangeCall(node.body)) return true;
    if (node.type === 'For' && (node.iterable?.type === 'Call' && node.iterable.callee === 'range' || hasRangeCall(node.body))) return true;
    if (node.type === 'Match' && node.arms?.some(a => hasRangeCall(a.body))) return true;
    if (node.args && hasRangeCall(node.args)) return true;
  }
  return false;
}

export function generateJS(ast) {
  if (!ast || ast.type !== 'Program') throw new Error('Invalid AST for codegen');
  const parts = [];
  if (hasRangeCall(ast.body)) parts.push(RANGE_HELPER);
  for (const node of ast.body) {
    if (node.type === 'EnumDecl') {
      const pairs = node.variants.map(v => `${v}: "${v}"`).join(', ');
      parts.push(`const ${node.name} = Object.freeze({ ${pairs} });`);
    } else if (node.type === 'FunctionDecl') {
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
