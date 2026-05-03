import { buildAST } from './parser.js';
import { analyze } from './analyzer.js';
import { optimize } from './optimizer.js';
import { generateJS } from './generator.js';

export function compile(source, outputType = 'js') {
  const { ast, errors: parseErrors } = buildAST(source);
  if (parseErrors.length) {
    return { result: null, diagnostics: parseErrors.map(m => ({ severity: 'error', message: m })) };
  }

  if (outputType === 'parsed') {
    return { result: 'Syntax is ok', diagnostics: [] };
  }

  // run AST-based analyzer
  const semErrs = analyze(ast);
  if (semErrs.length) {
    return { result: null, diagnostics: semErrs.map(e => ({ severity: 'error', message: e.message })) };
  }

  if (outputType === 'analyzed') {
    return { result: ast, diagnostics: [] };
  }

  // optimize AST
  const optimizedAst = optimize(ast);

  if (outputType === 'optimized') {
    return { result: optimizedAst, diagnostics: [] };
  }

  // codegen
  const code = generateJS(optimizedAst);
  return { result: code, diagnostics: [] };
}

export default { compile };
