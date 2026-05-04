// Optimizer for TEMP_JS AST: performs constant folding, dead code elimination,
// and basic simplifications. Traverses the AST recursively.

export function optimize(node) {
  if (!node || typeof node !== 'object') return node;

  switch (node.type) {
    case 'Program':
      return {
        ...node,
        body: node.body.map(optimize).filter(stmt => stmt !== null) // remove nulls from dead code
      };

    case 'EnumDecl':
      return node;

    case 'FunctionDecl':
      return {
        ...node,
        body: node.body.map(optimize).filter(stmt => stmt !== null)
      };

    case 'VarDecl':
      return {
        ...node,
        init: node.init ? optimize(node.init) : node.init
      };

    case 'Assign':
      const optimizedExpr = optimize(node.expr);
      // Remove self-assignments: x = x
      if (node.target === optimizedExpr?.name && optimizedExpr?.type === 'Identifier') {
        return null; // dead code
      }
      return {
        ...node,
        expr: optimizedExpr
      };

    case 'Print':
      return {
        ...node,
        expr: optimize(node.expr)
      };

    case 'If':
      const cond = optimize(node.cond);
      const thenBody = node.thenBody.map(optimize).filter(s => s !== null);
      const elseBody = node.elseBody ? node.elseBody.map(optimize).filter(s => s !== null) : null;

      // Simplify if true -> then body
      if (cond?.type === 'Literal' && cond.value === true) {
        return thenBody.length === 1 ? thenBody[0] : { type: 'Block', body: thenBody };
      }
      // Simplify if false -> else body or nothing
      if (cond?.type === 'Literal' && cond.value === false) {
        if (elseBody && elseBody.length > 0) {
          return elseBody.length === 1 ? elseBody[0] : { type: 'Block', body: elseBody };
        }
        return null; // no else, dead
      }
      return {
        ...node,
        cond,
        thenBody,
        elseBody
      };

    case 'While':
      const whileCond = optimize(node.cond);
      const whileBody = node.body.map(optimize).filter(s => s !== null);
      // If condition is false, remove loop
      if (whileCond?.type === 'Literal' && whileCond.value === false) {
        return null;
      }
      return {
        ...node,
        cond: whileCond,
        body: whileBody
      };

    case 'Return':
      return {
        ...node,
        expr: node.expr ? optimize(node.expr) : node.expr
      };

    case 'Break':
      return node;

    case 'Literal':
      return node;

    case 'Identifier':
      return node;

    case 'MemberAccess':
      return node;

    case 'FString':
      return {
        ...node,
        parts: node.parts.map(p =>
          p.type === 'FStringInterp' ? { ...p, expr: optimize(p.expr) } : p
        ),
      };

    case 'Binary':
      const left = optimize(node.left);
      const right = optimize(node.right);
      // Constant folding for arithmetic
      if (left?.type === 'Literal' && right?.type === 'Literal') {
        const l = left.value;
        const r = right.value;
        let result;
        switch (node.op) {
          case '+': result = l + r; break;
          case '-': result = l - r; break;
          case '*': result = l * r; break;
          case '/': if (r !== 0) result = l / r; break;
          case '%': if (r !== 0) result = l % r; break;
          case '**': result = l ** r; break;
          case '==': result = l === r; break;
          case '!=': result = l !== r; break;
          case '<': result = l < r; break;
          case '<=': result = l <= r; break;
          case '>': result = l > r; break;
          case '>=': result = l >= r; break;
          case '&&': result = l && r; break;
          case '||': result = l || r; break;
        }
        if (result !== undefined) {
          return { type: 'Literal', value: result };
        }
      }
      // Strength reductions
      if (left?.type === 'Literal') {
        if (node.op === '+' && left.value === 0) return right;
        if (node.op === '*' && left.value === 1) return right;
        if (node.op === '*' && left.value === 0) return { type: 'Literal', value: 0 };
        if (node.op === '**' && left.value === 1) return { type: 'Literal', value: 1 };
      }
      if (right?.type === 'Literal') {
        if ((node.op === '+' || node.op === '-') && right.value === 0) return left;
        if (node.op === '*' && right.value === 1) return left;
        if (node.op === '*' && right.value === 0) return { type: 'Literal', value: 0 };
        if (node.op === '/' && right.value === 1) return left;
        if (node.op === '**' && right.value === 0) return { type: 'Literal', value: 1 };
      }
      return {
        ...node,
        left,
        right
      };

    case 'Unary':
      const expr = optimize(node.expr);
      if (expr?.type === 'Literal') {
        let result;
        switch (node.op) {
          case '-': result = -expr.value; break;
          case '!': result = !expr.value; break;
        }
        if (result !== undefined) {
          return { type: 'Literal', value: result };
        }
      }
      return {
        ...node,
        expr
      };

    case 'ArrayLiteral':
      return { ...node, elements: node.elements.map(optimize) };

    case 'IndexAccess':
      return { ...node, array: optimize(node.array), index: optimize(node.index) };

    case 'IndexAssign':
      return { ...node, index: optimize(node.index), value: optimize(node.value) };

    case 'For': {
      const forIterable = optimize(node.iterable);
      const forBody = node.body.map(optimize).filter(s => s !== null);
      return { ...node, iterable: forIterable, body: forBody };
    }

    case 'Match': {
      const matchSubject = optimize(node.subject);
      const matchArms = node.arms.map(arm => ({
        ...arm,
        body: arm.body.map(optimize).filter(s => s !== null),
      }));
      if (matchSubject?.type === 'Literal') {
        for (const arm of matchArms) {
          if (arm.pattern.type === 'WildCard' || arm.pattern.value === matchSubject.value) {
            const b = arm.body;
            if (b.length === 0) return null;
            return b.length === 1 ? b[0] : { type: 'Block', body: b };
          }
        }
      }
      return { ...node, subject: matchSubject, arms: matchArms };
    }

    case 'Call':
      return {
        ...node,
        args: node.args.map(optimize)
      };

    default:
      return node;
  }
}