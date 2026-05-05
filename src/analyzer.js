// Type-inferring semantic analyzer.
// 'unknown' is used when a type cannot be determined (e.g. function parameters);
// errors are only reported when both sides of an operation have known, incompatible types.

const UNKNOWN = 'unknown';

const BUILTINS = {
  range:     { minArgs: 1, maxArgs: 3, returnType: 'array' },
  floor_div: { minArgs: 2, maxArgs: 2, returnType: 'num'   },
  len:       { minArgs: 1, maxArgs: 1, returnType: 'num'   },
};

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
  const structRegistry = Object.create(null);
  const interfaceRegistry = Object.create(null); // name -> Map<methodName, paramCount>
  const implRegistry = Object.create(null);       // structName -> { interfaceName, methods: Map<name, paramCount> }
  for (const node of ast.body) {
    if (node.type === 'FunctionDecl') {
      funcSigs[node.name] = { paramCount: node.params.length, returnType: UNKNOWN };
    } else if (node.type === 'EnumDecl') {
      enumRegistry[node.name] = new Set(node.variants);
    } else if (node.type === 'StructDecl') {
      structRegistry[node.name] = new Set(node.fields);
    } else if (node.type === 'InterfaceDecl') {
      const methods = new Map();
      for (const m of node.methods) methods.set(m.name, m.paramCount);
      interfaceRegistry[node.name] = methods;
    } else if (node.type === 'ImplDecl') {
      const methods = new Map();
      for (const m of node.methods) {
        methods.set(m.name, m.params.length);
        funcSigs[`${node.structName}$$${m.name}`] = { paramCount: m.params.length, returnType: UNKNOWN };
      }
      implRegistry[node.structName] = { interfaceName: node.interfaceName, methods };
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

        if (['+', '-', '*', '/', '//', '%', '**'].includes(op)) {
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

      case 'FString': {
        for (const part of expr.parts) {
          if (part.type === 'FStringInterp') inferType(part.expr, env);
        }
        return 'str';
      }

      case 'MemberAccess': {
        const enumDef = enumRegistry[expr.object];
        if (enumDef) {
          if (!enumDef.has(expr.member)) {
            report(`Enum '${expr.object}' has no variant '${expr.member}'`, expr);
            return null;
          }
          return expr.object;
        }
        const varInfo = env[expr.object];
        if (!varInfo) {
          report(`Undeclared variable or enum '${expr.object}'`, expr);
          return null;
        }
        if (varInfo.type === UNKNOWN) return UNKNOWN;
        const structDef = structRegistry[varInfo.type];
        if (!structDef) {
          report(`Cannot access field '${expr.member}' on non-struct type '${varInfo.type}'`, expr);
          return null;
        }
        if (!structDef.has(expr.member)) {
          report(`Struct '${varInfo.type}' has no field '${expr.member}'`, expr);
          return null;
        }
        return UNKNOWN;
      }

      case 'StructLiteral': {
        const structDef = structRegistry[expr.name];
        if (!structDef) {
          report(`Undeclared struct '${expr.name}'`, expr);
          return null;
        }
        const provided = new Set(expr.fields.map(f => f.name));
        for (const field of structDef) {
          if (!provided.has(field)) {
            report(`Missing field '${field}' in struct literal '${expr.name}'`, expr);
          }
        }
        for (const f of expr.fields) {
          if (!structDef.has(f.name)) {
            report(`Unknown field '${f.name}' in struct '${expr.name}'`, expr);
          }
          inferType(f.value, env);
        }
        return expr.name;
      }

      case 'MethodCall': {
        const varInfo = env[expr.object];
        if (!varInfo) {
          report(`Undeclared variable '${expr.object}'`, expr);
          return null;
        }
        if (varInfo.type !== UNKNOWN) {
          const impl = implRegistry[varInfo.type];
          if (!impl) {
            report(`Type '${varInfo.type}' has no impl`, expr);
            return null;
          }
          if (!impl.methods.has(expr.method)) {
            report(`'${varInfo.type}' has no method '${expr.method}'`, expr);
            return null;
          }
          const expectedArgs = impl.methods.get(expr.method);
          if (expr.args.length !== expectedArgs) {
            report(`'${expr.method}' expects ${expectedArgs} argument(s), got ${expr.args.length}`, expr);
          }
        }
        for (const arg of expr.args) inferType(arg, env);
        return UNKNOWN;
      }

      case 'Call': {
        const builtin = BUILTINS[expr.callee];
        const sig = funcSigs[expr.callee];
        if (!sig && !builtin) {
          report(`Call to undeclared function '${expr.callee}'`, expr);
          return null;
        }
        if (sig && expr.args.length !== sig.paramCount) {
          report(`'${expr.callee}' expects ${sig.paramCount} argument(s), got ${expr.args.length}`, expr);
        }
        if (builtin && (expr.args.length < builtin.minArgs || expr.args.length > builtin.maxArgs)) {
          report(`'${expr.callee}' expects ${builtin.minArgs}-${builtin.maxArgs} argument(s), got ${expr.args.length}`, expr);
        }
        const argTypes = expr.args.map(arg => inferType(arg, env));
        if (expr.callee === 'len' && argTypes.length >= 1) {
          const t = argTypes[0];
          if (t && t !== UNKNOWN && t !== 'array' && t !== 'str') {
            report(`'len' requires an array or str, got '${t}'`, expr);
          }
        }
        const rt = sig ? sig.returnType : builtin.returnType;
        return rt === UNKNOWN ? UNKNOWN : rt;
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

        case 'IncrDecr': {
          const info = env[s.target];
          if (!info) {
            report(`Assignment to undeclared variable '${s.target}'`, s);
          } else if (info.kind === 'let') {
            report(`Cannot modify immutable variable '${s.target}' (declared with 'let')`, s);
          } else if (info.type && info.type !== UNKNOWN && info.type !== 'num') {
            report(`'${s.op}' requires a num variable, got '${info.type}'`, s);
          }
          break;
        }

        case 'CompoundAssign': {
          const info = env[s.target];
          if (!info) {
            report(`Assignment to undeclared variable '${s.target}'`, s);
          } else if (info.kind === 'let') {
            report(`Cannot modify immutable variable '${s.target}' (declared with 'let')`, s);
          } else {
            const exprType = inferType(s.expr, env);
            const bothKnown = info.type !== UNKNOWN && exprType && exprType !== UNKNOWN;
            if (s.op === '-=') {
              if (bothKnown && (info.type !== 'num' || exprType !== 'num')) {
                report(`'-=' requires num operands, got '${info.type}' and '${exprType}'`, s);
              }
            } else {
              if (bothKnown && info.type !== exprType) {
                report(`Cannot use '+=' with '${info.type}' and '${exprType}'`, s);
              }
              if (bothKnown && info.type !== 'num' && info.type !== 'str') {
                report(`'+=' requires num or str operands, got '${info.type}'`, s);
              }
            }
          }
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

        case 'FieldAssign': {
          const info = env[s.object];
          if (!info) {
            report(`Assignment to undeclared variable '${s.object}'`, s);
          } else if (info.kind === 'let') {
            report(`Cannot modify field of immutable variable '${s.object}' (declared with 'let')`, s);
          } else if (info.type !== UNKNOWN) {
            const structDef = structRegistry[info.type];
            if (!structDef) {
              report(`'${s.object}' is not a struct`, s);
            } else if (!structDef.has(s.field)) {
              report(`Struct '${info.type}' has no field '${s.field}'`, s);
            }
          }
          inferType(s.value, env);
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
    } else if (top.type === 'EnumDecl' || top.type === 'StructDecl' || top.type === 'InterfaceDecl') {
      // already registered in first pass
    } else if (top.type === 'ImplDecl') {
      if (!structRegistry[top.structName]) {
        report(`'impl' references undeclared struct '${top.structName}'`, top);
      }
      const iface = interfaceRegistry[top.interfaceName];
      if (!iface) {
        report(`'impl' references undeclared interface '${top.interfaceName}'`, top);
      } else {
        for (const [methodName, paramCount] of iface) {
          const implMethod = top.methods.find(m => m.name === methodName);
          if (!implMethod) {
            report(`'${top.structName}' is missing method '${methodName}' required by '${top.interfaceName}'`, top);
          } else if (implMethod.params.length !== paramCount) {
            report(`Method '${methodName}' requires ${paramCount} param(s) but implementation has ${implMethod.params.length}`, top);
          }
        }
      }
      for (const method of top.methods) {
        const funcEnv = Object.create(globalEnv);
        funcEnv['self'] = { kind: 'let', type: top.structName };
        for (const p of method.params || []) {
          funcEnv[p.name] = { kind: 'let', type: UNKNOWN };
        }
        walkStmts(method.body || [], funcEnv, false, { name: `${top.structName}$$${method.name}` });
      }
    } else {
      walkStmts([top], globalEnv, false, null);
    }
  }

  return errors;
}

export default { analyze };
