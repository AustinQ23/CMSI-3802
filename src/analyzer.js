// Type-inferring semantic analyzer.
// 'unknown' is used when a type cannot be determined (e.g. function parameters);
// errors are only reported when both sides of an operation have known, incompatible types.

const UNKNOWN = 'unknown';

export function analyze(ast) {
  const errors = [];
  if (!ast) return errors;

  function report(msg, node) {
    errors.push({ message: msg, node });
  }

  // First pass: register all function names and param counts so forward calls work.
  // Return types start as UNKNOWN and get filled in when a return statement is analyzed.
  const funcSigs = Object.create(null);
  const enumRegistry = Object.create(null);
  for (const node of ast.body) {
    if (node.type === 'FunctionDecl') {
      funcSigs[node.name] = { paramCount: node.params.length, returnType: UNKNOWN };
    } else if (node.type === 'EnumDecl') {
      enumRegistry[node.name] = new Set(node.variants);
    }
  }

  // Infer the type of an expression given the current variable environment.
  // Returns a type string ('num' | 'str' | 'bool' | 'unknown') or null when the
  // expression contains a fatal error (e.g. reference to an undeclared variable).
  function inferType(expr, env) {
    if (!expr) return null;
    switch (expr.type) {
      case 'Literal': {
        if (typeof expr.value === 'number') return 'num';
        if (typeof expr.value === 'string') return 'str';
        return 'bool';
      }

      case 'Identifier': {
        const info = env[expr.name];
        if (!info) {
          report(`Undeclared variable '${expr.name}'`, expr);
          return null;
        }
        return info.type;
      }

      case 'Binary': {
        const lt = inferType(expr.left, env);
        const rt = inferType(expr.right, env);
        const op = expr.op;
        // Only report type errors when both sides have a concrete known type.
        const bothKnown = lt && lt !== UNKNOWN && rt && rt !== UNKNOWN;

        if (['+', '-', '*', '/', '%', '**'].includes(op)) {
          if (op === '+' && bothKnown && lt === 'str' && rt === 'str') return 'str';
          if (bothKnown && (lt !== 'num' || rt !== 'num')) {
            report(`Operator '${op}' requires num operands, got '${lt}' and '${rt}'`, expr);
          }
          return 'num';
        }
        if (['<', '<=', '>', '>='].includes(op)) {
          if (bothKnown && (lt !== 'num' || rt !== 'num')) {
            report(`Operator '${op}' requires num operands, got '${lt}' and '${rt}'`, expr);
          }
          return 'bool';
        }
        if (op === '==' || op === '!=') {
          if (bothKnown && lt !== rt) {
            report(`Cannot compare '${lt}' and '${rt}' with '${op}'`, expr);
          }
          return 'bool';
        }
        if (bothKnown && (lt !== 'bool' || rt !== 'bool')) {
          report(`Operator '${op}' requires bool operands, got '${lt}' and '${rt}'`, expr);
        }
        return 'bool';
      }

      case 'Unary': {
        const t = inferType(expr.expr, env);
        const known = t && t !== UNKNOWN;
        if (expr.op === '-') {
          if (known && t !== 'num') report(`Unary '-' requires num, got '${t}'`, expr);
          return 'num';
        }
        if (known && t !== 'bool') report(`Unary '!' requires bool, got '${t}'`, expr);
        return 'bool';
      }

      case 'ArrayLiteral': {
        for (const el of expr.elements) inferType(el, env);
        return 'array';
      }

      case 'IndexAccess': {
        const arrType = inferType(expr.array, env);
        const idxType = inferType(expr.index, env);
        if (arrType && arrType !== UNKNOWN && arrType !== 'array') {
          report(`Cannot index into type '${arrType}'`, expr);
        }
        if (idxType && idxType !== UNKNOWN && idxType !== 'num') {
          report(`Array index must be 'num', got '${idxType}'`, expr);
        }
        return UNKNOWN;
      }

      case 'MemberAccess': {
        const enumDef = enumRegistry[expr.object];
        if (!enumDef) {
          report(`Undeclared enum '${expr.object}'`, expr);
          return null;
        }
        if (!enumDef.has(expr.member)) {
          report(`Enum '${expr.object}' has no variant '${expr.member}'`, expr);
          return null;
        }
        return expr.object;
      }

      case 'Call': {
        const sig = funcSigs[expr.callee];
        if (!sig) {
          report(`Call to undeclared function '${expr.callee}'`, expr);
          return null;
        }
        if (expr.args.length !== sig.paramCount) {
          report(`'${expr.callee}' expects ${sig.paramCount} argument(s), got ${expr.args.length}`, expr);
        }
        for (const arg of expr.args) inferType(arg, env);
        return sig.returnType === UNKNOWN ? UNKNOWN : sig.returnType;
      }

    }
  }

  function walkStmts(stmts, env, inLoop, currentFunc) {
    for (const s of stmts) {
      if (!s) continue;
      switch (s.type) {
        case 'VarDecl': {
          const initType = inferType(s.init, env);
          // Infer variable's type from its initializer and record it.
          env[s.name] = { kind: s.kind, type: initType ?? UNKNOWN };
          break;
        }

        case 'Assign': {
          const info = env[s.target];
          if (!info) {
            report(`Assignment to undeclared variable '${s.target}'`, s);
          } else if (info.kind === 'let') {
            report(`Cannot assign to immutable variable '${s.target}' (declared with 'let')`, s);
          } else {
            const exprType = inferType(s.expr, env);
            const bothKnown = info.type !== UNKNOWN && exprType && exprType !== UNKNOWN;
            if (bothKnown && info.type !== exprType) {
              report(`Cannot assign '${exprType}' to '${s.target}' (inferred type '${info.type}')`, s);
            }
          }
          break;
        }

        case 'Print':
          inferType(s.expr, env);
          break;

        case 'If': {
          const condType = inferType(s.cond, env);
          if (condType && condType !== UNKNOWN && condType !== 'bool') {
            report(`If condition must be 'bool', got '${condType}'`, s.cond);
          }
          // Each branch gets a child scope so inner declarations don't leak out.
          walkStmts(s.thenBody || [], Object.create(env), inLoop, currentFunc);
          if (s.elseBody) walkStmts(s.elseBody, Object.create(env), inLoop, currentFunc);
          break;
        }

        case 'While': {
          const condType = inferType(s.cond, env);
          if (condType && condType !== UNKNOWN && condType !== 'bool') {
            report(`While condition must be 'bool', got '${condType}'`, s.cond);
          }
          walkStmts(s.body || [], Object.create(env), true, currentFunc);
          break;
        }

        case 'Return': {
          if (!currentFunc) {
            report(`'return' used outside of a function`, s);
            break;
          }
          const retType = s.expr ? inferType(s.expr, env) : 'void';
          const sig = funcSigs[currentFunc.name];
          if (sig.returnType === UNKNOWN) {
            // First return statement sets the inferred return type.
            sig.returnType = retType;
          } else if (retType && retType !== UNKNOWN && sig.returnType !== retType) {
            report(`Function '${currentFunc.name}' returns inconsistent types: '${sig.returnType}' and '${retType}'`, s);
          }
          break;
        }

        case 'IndexAssign': {
          const info = env[s.target];
          if (!info) {
            report(`Assignment to undeclared variable '${s.target}'`, s);
          } else if (info.kind === 'let') {
            report(`Cannot modify immutable array '${s.target}' (declared with 'let')`, s);
          } else if (info.type && info.type !== UNKNOWN && info.type !== 'array') {
            report(`Cannot index into '${s.target}' of type '${info.type}'`, s);
          }
          inferType(s.index, env);
          inferType(s.value, env);
          break;
        }

        case 'Match': {
          const subjectType = inferType(s.subject, env);
          const wildcardIdx = s.arms.findIndex(a => a.pattern.type === 'WildCard');
          if (wildcardIdx !== -1 && wildcardIdx !== s.arms.length - 1) {
            report(`Wildcard arm must be the last arm in a match expression`, s);
          }
          const seen = new Set();
          for (const arm of s.arms) {
            if (arm.pattern.type !== 'WildCard') {
              const key = arm.pattern.type === 'EnumVariant'
                ? `${arm.pattern.enum}.${arm.pattern.variant}`
                : JSON.stringify(arm.pattern.value);
              if (seen.has(key)) {
                report(`Duplicate pattern '${key}' in match expression`, s);
              }
              seen.add(key);
            }
          }
          if (subjectType && subjectType !== UNKNOWN) {
            for (const arm of s.arms) {
              if (arm.pattern.type === 'Literal') {
                const patType = typeof arm.pattern.value === 'number' ? 'num'
                              : typeof arm.pattern.value === 'string' ? 'str'
                              : 'bool';
                if (patType !== subjectType) {
                  report(`Pattern type '${patType}' does not match subject type '${subjectType}'`, s);
                }
              } else if (arm.pattern.type === 'EnumVariant') {
                const enumDef = enumRegistry[arm.pattern.enum];
                if (!enumDef) {
                  report(`Undeclared enum '${arm.pattern.enum}'`, s);
                } else if (!enumDef.has(arm.pattern.variant)) {
                  report(`Enum '${arm.pattern.enum}' has no variant '${arm.pattern.variant}'`, s);
                } else if (arm.pattern.enum !== subjectType) {
                  report(`Pattern type '${arm.pattern.enum}' does not match subject type '${subjectType}'`, s);
                }
              }
            }
            const hasWildcard = wildcardIdx !== -1;
            if (!hasWildcard) {
              if (subjectType === 'bool') {
                const hasTrue = s.arms.some(a => a.pattern.type === 'Literal' && a.pattern.value === true);
                const hasFalse = s.arms.some(a => a.pattern.type === 'Literal' && a.pattern.value === false);
                if (!hasTrue || !hasFalse) {
                  report(`Non-exhaustive match on 'bool': must cover both true and false or include a wildcard`, s);
                }
              } else if (subjectType === 'num' || subjectType === 'str') {
                report(`Non-exhaustive match on '${subjectType}': must include a wildcard arm`, s);
              } else if (enumRegistry[subjectType]) {
                const covered = new Set(
                  s.arms.filter(a => a.pattern.type === 'EnumVariant').map(a => a.pattern.variant)
                );
                for (const v of enumRegistry[subjectType]) {
                  if (!covered.has(v)) {
                    report(`Non-exhaustive match on '${subjectType}': variant '${v}' not covered`, s);
                  }
                }
              }
            }
          }
          for (const arm of s.arms) {
            walkStmts(arm.body, Object.create(env), inLoop, currentFunc);
          }
          break;
        }

        case 'For': {
          const iterType = inferType(s.iterable, env);
          if (iterType && iterType !== UNKNOWN && iterType !== 'array') {
            report(`For loop requires an array, got '${iterType}'`, s.iterable);
          }
          const loopEnv = Object.create(env);
          loopEnv[s.variable] = { kind: 'let', type: UNKNOWN };
          walkStmts(s.body || [], loopEnv, true, currentFunc);
          break;
        }

        case 'Break':
          if (!inLoop) report(`'break' used outside of a loop`, s);
          break;

        default:
          inferType(s, env);
          break;
      }
    }
  }

  // Global scope holds top-level variable declarations.
  const globalEnv = Object.create(null);

  for (const top of ast.body) {
    if (top.type === 'FunctionDecl') {
      const funcEnv = Object.create(globalEnv);
      for (const p of top.params || []) {
        funcEnv[p.name] = { kind: 'let', type: UNKNOWN };
      }
      walkStmts(top.body || [], funcEnv, false, { name: top.name });
    } else if (top.type === 'EnumDecl') {
      // already registered in first pass
    } else {
      walkStmts([top], globalEnv, false, null);
    }
  }

  return errors;
}

export default { analyze };
