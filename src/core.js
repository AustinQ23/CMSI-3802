// A lightweight semantic validator that enforces:
// - assignments must target a previously declared variable (with let or mut) in the same function scope
// - assignments to `let` declarations are errors (immutable)
// This is intentionally simple and operates on source text using brace-matching and line scanning.

import { analyze as analyzeAst } from './analyzer.js';

export function validateDeclarations(src) {
  const errors = [];

  // Helper: find matching closing brace starting at index of an opening brace
  function findMatchingBrace(s, startIndex) {
    let depth = 0;
    for (let i = startIndex; i < s.length; i++) {
      const ch = s[i];
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) return i;
      }
    }
    return -1;
  }

  // Scan for function definitions: "fn" followed by name and a body in braces.
  const fnRegex = /\bfn\b/g;
  let m;
  while ((m = fnRegex.exec(src)) !== null) {
    // find first '{' after this position
    const bracePos = src.indexOf('{', m.index);
    if (bracePos === -1) break;
    const endPos = findMatchingBrace(src, bracePos);
    if (endPos === -1) break;
    const body = src.slice(bracePos + 1, endPos);

    // compute line offset for error reporting
    const prefix = src.slice(0, bracePos + 1);
    const lineOffset = prefix.split('\n').length - 1;

    const declared = Object.create(null); // name -> { kind: 'let'|'mut', line }

    const lines = body.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const line = raw.trim();
      const lineno = lineOffset + i + 1;

      if (line.length === 0) continue;

      // Declaration: let|mut name [: type] =
      // Accept declarations with or without a type annotation, e.g. `mut x: int =` or `mut x =`.
      const declMatch = line.match(/^(let|mut)\s+([A-Za-z][A-Za-z0-9_]*)(\s*:\s*[A-Za-z][A-Za-z0-9_]*)?\s*=/);
      if (declMatch) {
        const kind = declMatch[1];
        const name = declMatch[2];
        declared[name] = { kind, line: lineno };
        continue;
      }

      // Assignment: id =
      const assignMatch = line.match(/^([A-Za-z][A-Za-z0-9_]*)\s*=/);
      if (assignMatch) {
        const name = assignMatch[1];
        if (!declared[name]) {
          errors.push({ line: lineno, message: `Assignment to undeclared variable '${name}'` });
        } else if (declared[name].kind === 'let') {
          errors.push({ line: lineno, message: `Assignment to immutable 'let' variable '${name}' declared at line ${declared[name].line}` });
        }
      }
    }

    // continue search after this function body
    fnRegex.lastIndex = endPos + 1;
  }

  return errors;
}

// New compatibility wrapper: try to parse AST and run AST-based analyzer if available
// If caller passes a parsed AST instead of source string, support that too.
export function validate(input) {
  // If input is an AST (object with type 'Program'), call analyzeAst
  if (input && typeof input === 'object' && input.type === 'Program') {
    const errs = analyzeAst(input);
    return errs;
  }
  // Otherwise assume input is source string and use the text-scanning validator for now
  return validateDeclarations(input);
}

export default { validateDeclarations, validate };
