var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// node_modules/ohm-js/src/common.js
var common_exports = {};
__export(common_exports, {
  StringBuffer: () => StringBuffer,
  abstract: () => abstract,
  assert: () => assert,
  checkNotNull: () => checkNotNull,
  clone: () => clone,
  copyWithoutDuplicates: () => copyWithoutDuplicates,
  defineLazyProperty: () => defineLazyProperty,
  getDuplicates: () => getDuplicates,
  isLexical: () => isLexical,
  isSyntactic: () => isSyntactic,
  padLeft: () => padLeft,
  repeat: () => repeat,
  repeatFn: () => repeatFn,
  repeatStr: () => repeatStr,
  unescapeCodePoint: () => unescapeCodePoint,
  unexpectedObjToString: () => unexpectedObjToString
});
var escapeStringFor = {};
for (let c = 0; c < 128; c++) {
  escapeStringFor[c] = String.fromCharCode(c);
}
escapeStringFor["'".charCodeAt(0)] = "\\'";
escapeStringFor['"'.charCodeAt(0)] = '\\"';
escapeStringFor["\\".charCodeAt(0)] = "\\\\";
escapeStringFor["\b".charCodeAt(0)] = "\\b";
escapeStringFor["\f".charCodeAt(0)] = "\\f";
escapeStringFor["\n".charCodeAt(0)] = "\\n";
escapeStringFor["\r".charCodeAt(0)] = "\\r";
escapeStringFor["	".charCodeAt(0)] = "\\t";
escapeStringFor["\v".charCodeAt(0)] = "\\v";
function abstract(optMethodName) {
  const methodName = optMethodName || "";
  return function() {
    throw new Error(
      "this method " + methodName + " is abstract! (it has no implementation in class " + this.constructor.name + ")"
    );
  };
}
function assert(cond, message) {
  if (!cond) {
    throw new Error(message || "Assertion failed");
  }
}
function defineLazyProperty(obj, propName, getterFn) {
  let memo;
  Object.defineProperty(obj, propName, {
    get() {
      if (!memo) {
        memo = getterFn.call(this);
      }
      return memo;
    }
  });
}
function clone(obj) {
  if (obj) {
    return Object.assign({}, obj);
  }
  return obj;
}
function repeatFn(fn, n2) {
  const arr = [];
  while (n2-- > 0) {
    arr.push(fn());
  }
  return arr;
}
function repeatStr(str, n2) {
  return new Array(n2 + 1).join(str);
}
function repeat(x, n2) {
  return repeatFn(() => x, n2);
}
function getDuplicates(array) {
  const duplicates = [];
  for (let idx = 0; idx < array.length; idx++) {
    const x = array[idx];
    if (array.lastIndexOf(x) !== idx && duplicates.indexOf(x) < 0) {
      duplicates.push(x);
    }
  }
  return duplicates;
}
function copyWithoutDuplicates(array) {
  const noDuplicates = [];
  array.forEach((entry) => {
    if (noDuplicates.indexOf(entry) < 0) {
      noDuplicates.push(entry);
    }
  });
  return noDuplicates;
}
function isSyntactic(ruleName) {
  const firstChar = ruleName[0];
  return firstChar === firstChar.toUpperCase();
}
function isLexical(ruleName) {
  return !isSyntactic(ruleName);
}
function padLeft(str, len, optChar) {
  const ch = optChar || " ";
  if (str.length < len) {
    return repeatStr(ch, len - str.length) + str;
  }
  return str;
}
function StringBuffer() {
  this.strings = [];
}
StringBuffer.prototype.append = function(str) {
  this.strings.push(str);
};
StringBuffer.prototype.contents = function() {
  return this.strings.join("");
};
var escapeUnicode = (str) => String.fromCodePoint(parseInt(str, 16));
function unescapeCodePoint(s) {
  if (s.charAt(0) === "\\") {
    switch (s.charAt(1)) {
      case "b":
        return "\b";
      case "f":
        return "\f";
      case "n":
        return "\n";
      case "r":
        return "\r";
      case "t":
        return "	";
      case "v":
        return "\v";
      case "x":
        return escapeUnicode(s.slice(2, 4));
      case "u":
        return s.charAt(2) === "{" ? escapeUnicode(s.slice(3, -1)) : escapeUnicode(s.slice(2, 6));
      default:
        return s.charAt(1);
    }
  } else {
    return s;
  }
}
function unexpectedObjToString(obj) {
  if (obj == null) {
    return String(obj);
  }
  const baseToString = Object.prototype.toString.call(obj);
  try {
    let typeName;
    if (obj.constructor && obj.constructor.name) {
      typeName = obj.constructor.name;
    } else if (baseToString.indexOf("[object ") === 0) {
      typeName = baseToString.slice(8, -1);
    } else {
      typeName = typeof obj;
    }
    return typeName + ": " + JSON.stringify(String(obj));
  } catch {
    return baseToString;
  }
}
function checkNotNull(obj, message = "unexpected null value") {
  if (obj == null) {
    throw new Error(message);
  }
  return obj;
}

// node_modules/ohm-js/src/unicode.js
var toRegExp = (val) => new RegExp(String.raw`\p{${val}}`, "u");
var UnicodeCategories = Object.fromEntries(
  [
    "Cc",
    "Cf",
    "Cn",
    "Co",
    "Cs",
    "Ll",
    "Lm",
    "Lo",
    "Lt",
    "Lu",
    "Mc",
    "Me",
    "Mn",
    "Nd",
    "Nl",
    "No",
    "Pc",
    "Pd",
    "Pe",
    "Pf",
    "Pi",
    "Po",
    "Ps",
    "Sc",
    "Sk",
    "Sm",
    "So",
    "Zl",
    "Zp",
    "Zs"
  ].map((cat) => [cat, toRegExp(cat)])
);
UnicodeCategories["Ltmo"] = /\p{Lt}|\p{Lm}|\p{Lo}/u;
var UnicodeBinaryProperties = Object.fromEntries(
  ["XID_Start", "XID_Continue", "White_Space"].map((prop) => [prop, toRegExp(prop)])
);

// node_modules/ohm-js/src/pexprs-main.js
var PExpr = class _PExpr {
  constructor() {
    if (this.constructor === _PExpr) {
      throw new Error("PExpr cannot be instantiated -- it's abstract");
    }
  }
  // Set the `source` property to the interval containing the source for this expression.
  withSource(interval) {
    if (interval) {
      this.source = interval.trimmed();
    }
    return this;
  }
};
var any = Object.create(PExpr.prototype);
var end = Object.create(PExpr.prototype);
var Terminal = class extends PExpr {
  constructor(obj) {
    super();
    this.obj = obj;
  }
};
var Range = class extends PExpr {
  constructor(from, to) {
    super();
    this.from = from;
    this.to = to;
    this.matchCodePoint = from.length > 1 || to.length > 1;
  }
};
var Param = class extends PExpr {
  constructor(index) {
    super();
    this.index = index;
  }
};
var Alt = class extends PExpr {
  constructor(terms) {
    super();
    this.terms = terms;
  }
};
var Extend = class extends Alt {
  constructor(superGrammar, name, body) {
    const origBody = superGrammar.rules[name].body;
    super([body, origBody]);
    this.superGrammar = superGrammar;
    this.name = name;
    this.body = body;
  }
};
var Splice = class extends Alt {
  constructor(superGrammar, ruleName, beforeTerms, afterTerms) {
    const origBody = superGrammar.rules[ruleName].body;
    super([...beforeTerms, origBody, ...afterTerms]);
    this.superGrammar = superGrammar;
    this.ruleName = ruleName;
    this.expansionPos = beforeTerms.length;
  }
};
var Seq = class extends PExpr {
  constructor(factors) {
    super();
    this.factors = factors;
  }
};
var Iter = class extends PExpr {
  constructor(expr) {
    super();
    this.expr = expr;
  }
};
var Star = class extends Iter {
};
var Plus = class extends Iter {
};
var Opt = class extends Iter {
};
Star.prototype.operator = "*";
Plus.prototype.operator = "+";
Opt.prototype.operator = "?";
Star.prototype.minNumMatches = 0;
Plus.prototype.minNumMatches = 1;
Opt.prototype.minNumMatches = 0;
Star.prototype.maxNumMatches = Number.POSITIVE_INFINITY;
Plus.prototype.maxNumMatches = Number.POSITIVE_INFINITY;
Opt.prototype.maxNumMatches = 1;
var Not = class extends PExpr {
  constructor(expr) {
    super();
    this.expr = expr;
  }
};
var Lookahead = class extends PExpr {
  constructor(expr) {
    super();
    this.expr = expr;
  }
};
var Lex = class extends PExpr {
  constructor(expr) {
    super();
    this.expr = expr;
  }
};
var Apply = class extends PExpr {
  constructor(ruleName, args = []) {
    super();
    this.ruleName = ruleName;
    this.args = args;
  }
  isSyntactic() {
    return isSyntactic(this.ruleName);
  }
  // This method just caches the result of `this.toString()` in a non-enumerable property.
  toMemoKey() {
    if (!this._memoKey) {
      Object.defineProperty(this, "_memoKey", { value: this.toString() });
    }
    return this._memoKey;
  }
};
var UnicodeChar = class extends PExpr {
  constructor(categoryOrProp) {
    super();
    this.categoryOrProp = categoryOrProp;
    if (categoryOrProp in UnicodeCategories) {
      this.pattern = UnicodeCategories[categoryOrProp];
    } else if (categoryOrProp in UnicodeBinaryProperties) {
      this.pattern = UnicodeBinaryProperties[categoryOrProp];
    } else {
      throw new Error(
        `Invalid Unicode category or property name: ${JSON.stringify(categoryOrProp)}`
      );
    }
  }
};

// node_modules/ohm-js/src/errors.js
function createError(message, optInterval) {
  let e;
  if (optInterval) {
    e = new Error(optInterval.getLineAndColumnMessage() + message);
    e.shortMessage = message;
    e.interval = optInterval;
  } else {
    e = new Error(message);
  }
  return e;
}
function intervalSourcesDontMatch() {
  return createError("Interval sources don't match");
}
function grammarSyntaxError(matchFailure) {
  const e = new Error();
  Object.defineProperty(e, "message", {
    enumerable: true,
    get() {
      return matchFailure.message;
    }
  });
  Object.defineProperty(e, "shortMessage", {
    enumerable: true,
    get() {
      return "Expected " + matchFailure.getExpectedText();
    }
  });
  e.interval = matchFailure.getInterval();
  return e;
}
function undeclaredGrammar(grammarName, namespace, interval) {
  const message = namespace ? `Grammar ${grammarName} is not declared in namespace '${namespace}'` : "Undeclared grammar " + grammarName;
  return createError(message, interval);
}
function duplicateGrammarDeclaration(grammar2, namespace) {
  return createError("Grammar " + grammar2.name + " is already declared in this namespace");
}
function grammarDoesNotSupportIncrementalParsing(grammar2) {
  return createError(`Grammar '${grammar2.name}' does not support incremental parsing`);
}
function undeclaredRule(ruleName, grammarName, optInterval) {
  return createError(
    "Rule " + ruleName + " is not declared in grammar " + grammarName,
    optInterval
  );
}
function cannotOverrideUndeclaredRule(ruleName, grammarName, optSource) {
  return createError(
    "Cannot override rule " + ruleName + " because it is not declared in " + grammarName,
    optSource
  );
}
function cannotExtendUndeclaredRule(ruleName, grammarName, optSource) {
  return createError(
    "Cannot extend rule " + ruleName + " because it is not declared in " + grammarName,
    optSource
  );
}
function duplicateRuleDeclaration(ruleName, grammarName, declGrammarName, optSource) {
  let message = "Duplicate declaration for rule '" + ruleName + "' in grammar '" + grammarName + "'";
  if (grammarName !== declGrammarName) {
    message += " (originally declared in '" + declGrammarName + "')";
  }
  return createError(message, optSource);
}
function wrongNumberOfParameters(ruleName, expected, actual, source) {
  return createError(
    "Wrong number of parameters for rule " + ruleName + " (expected " + expected + ", got " + actual + ")",
    source
  );
}
function wrongNumberOfArguments(ruleName, expected, actual, expr) {
  return createError(
    "Wrong number of arguments for rule " + ruleName + " (expected " + expected + ", got " + actual + ")",
    expr
  );
}
function duplicateParameterNames(ruleName, duplicates, source) {
  return createError(
    "Duplicate parameter names in rule " + ruleName + ": " + duplicates.join(", "),
    source
  );
}
function invalidParameter(ruleName, expr) {
  return createError(
    "Invalid parameter to rule " + ruleName + ": " + expr + " has arity " + expr.getArity() + ", but parameter expressions must have arity 1",
    expr.source
  );
}
var syntacticVsLexicalNote = "NOTE: A _syntactic rule_ is a rule whose name begins with a capital letter. See https://ohmjs.org/d/svl for more details.";
function applicationOfSyntacticRuleFromLexicalContext(ruleName, applyExpr) {
  return createError(
    "Cannot apply syntactic rule " + ruleName + " from here (inside a lexical context)",
    applyExpr.source
  );
}
function applySyntacticWithLexicalRuleApplication(applyExpr) {
  const { ruleName } = applyExpr;
  return createError(
    `applySyntactic is for syntactic rules, but '${ruleName}' is a lexical rule. ` + syntacticVsLexicalNote,
    applyExpr.source
  );
}
function unnecessaryExperimentalApplySyntactic(applyExpr) {
  return createError(
    "applySyntactic is not required here (in a syntactic context)",
    applyExpr.source
  );
}
function incorrectArgumentType(expectedType, expr) {
  return createError("Incorrect argument type: expected " + expectedType, expr.source);
}
function multipleSuperSplices(expr) {
  return createError("'...' can appear at most once in a rule body", expr.source);
}
function invalidCodePoint(applyWrapper) {
  const node = applyWrapper._node;
  assert(node && node.isNonterminal() && node.ctorName === "escapeChar_unicodeCodePoint");
  const digitIntervals = applyWrapper.children.slice(1, -1).map((d) => d.source);
  const fullInterval = digitIntervals[0].coverageWith(...digitIntervals.slice(1));
  return createError(
    `U+${fullInterval.contents} is not a valid Unicode code point`,
    fullInterval
  );
}
function kleeneExprHasNullableOperand(kleeneExpr, applicationStack) {
  const actuals = applicationStack.length > 0 ? applicationStack[applicationStack.length - 1].args : [];
  const expr = kleeneExpr.expr.substituteParams(actuals);
  let message = "Nullable expression " + expr + " is not allowed inside '" + kleeneExpr.operator + "' (possible infinite loop)";
  if (applicationStack.length > 0) {
    const stackTrace = applicationStack.map((app) => new Apply(app.ruleName, app.args)).join("\n");
    message += "\nApplication stack (most recent application last):\n" + stackTrace;
  }
  return createError(message, kleeneExpr.expr.source);
}
function inconsistentArity(ruleName, expected, actual, expr) {
  return createError(
    "Rule " + ruleName + " involves an alternation which has inconsistent arity (expected " + expected + ", got " + actual + ")",
    expr.source
  );
}
function multipleErrors(errors) {
  const messages = errors.map((e) => e.message);
  return createError(["Errors:"].concat(messages).join("\n- "), errors[0].interval);
}
function missingSemanticAction(ctorName, name, type, stack) {
  let stackTrace = stack.slice(0, -1).map((info) => {
    const ans = "  " + info[0].name + " > " + info[1];
    return info.length === 3 ? ans + " for '" + info[2] + "'" : ans;
  }).join("\n");
  stackTrace += "\n  " + name + " > " + ctorName;
  let moreInfo = "";
  if (ctorName === "_iter") {
    moreInfo = [
      "\nNOTE: as of Ohm v16, there is no default action for iteration nodes \u2014 see ",
      "  https://ohmjs.org/d/dsa for details."
    ].join("\n");
  }
  const message = [
    `Missing semantic action for '${ctorName}' in ${type} '${name}'.${moreInfo}`,
    "Action stack (most recent call last):",
    stackTrace
  ].join("\n");
  const e = createError(message);
  e.name = "missingSemanticAction";
  return e;
}
function throwErrors(errors) {
  if (errors.length === 1) {
    throw errors[0];
  }
  if (errors.length > 1) {
    throw multipleErrors(errors);
  }
}

// node_modules/ohm-js/src/util.js
function padNumbersToEqualLength(arr) {
  let maxLen = 0;
  const strings = arr.map((n2) => {
    const str = n2.toString();
    maxLen = Math.max(maxLen, str.length);
    return str;
  });
  return strings.map((s) => padLeft(s, maxLen));
}
function strcpy(dest, src, offset) {
  const origDestLen = dest.length;
  const start = dest.slice(0, offset);
  const end2 = dest.slice(offset + src.length);
  return (start + src + end2).substr(0, origDestLen);
}
function lineAndColumnToMessage(...ranges) {
  const lineAndCol = this;
  const { offset } = lineAndCol;
  const { repeatStr: repeatStr2 } = common_exports;
  const sb = new StringBuffer();
  sb.append("Line " + lineAndCol.lineNum + ", col " + lineAndCol.colNum + ":\n");
  const lineNumbers = padNumbersToEqualLength([
    lineAndCol.prevLine == null ? 0 : lineAndCol.lineNum - 1,
    lineAndCol.lineNum,
    lineAndCol.nextLine == null ? 0 : lineAndCol.lineNum + 1
  ]);
  const appendLine = (num, content, prefix) => {
    sb.append(prefix + lineNumbers[num] + " | " + content + "\n");
  };
  if (lineAndCol.prevLine != null) {
    appendLine(0, lineAndCol.prevLine, "  ");
  }
  appendLine(1, lineAndCol.line, "> ");
  const lineLen = lineAndCol.line.length;
  let indicationLine = repeatStr2(" ", lineLen + 1);
  for (let i = 0; i < ranges.length; ++i) {
    let startIdx = ranges[i][0];
    let endIdx = ranges[i][1];
    assert(startIdx >= 0 && startIdx <= endIdx, "range start must be >= 0 and <= end");
    const lineStartOffset = offset - lineAndCol.colNum + 1;
    startIdx = Math.max(0, startIdx - lineStartOffset);
    endIdx = Math.min(endIdx - lineStartOffset, lineLen);
    indicationLine = strcpy(indicationLine, repeatStr2("~", endIdx - startIdx), startIdx);
  }
  const gutterWidth = 2 + lineNumbers[1].length + 3;
  sb.append(repeatStr2(" ", gutterWidth));
  indicationLine = strcpy(indicationLine, "^", lineAndCol.colNum - 1);
  sb.append(indicationLine.replace(/ +$/, "") + "\n");
  if (lineAndCol.nextLine != null) {
    appendLine(2, lineAndCol.nextLine, "  ");
  }
  return sb.contents();
}
var builtInRulesCallbacks = [];
function awaitBuiltInRules(cb) {
  builtInRulesCallbacks.push(cb);
}
function announceBuiltInRules(grammar2) {
  builtInRulesCallbacks.forEach((cb) => {
    cb(grammar2);
  });
  builtInRulesCallbacks = null;
}
function getLineAndColumn(str, offset) {
  let lineNum = 1;
  let colNum = 1;
  let currOffset = 0;
  let lineStartOffset = 0;
  let nextLine = null;
  let prevLine = null;
  let prevLineStartOffset = -1;
  while (currOffset < offset) {
    const c = str.charAt(currOffset++);
    if (c === "\n") {
      lineNum++;
      colNum = 1;
      prevLineStartOffset = lineStartOffset;
      lineStartOffset = currOffset;
    } else if (c !== "\r") {
      colNum++;
    }
  }
  let lineEndOffset = str.indexOf("\n", lineStartOffset);
  if (lineEndOffset === -1) {
    lineEndOffset = str.length;
  } else {
    const nextLineEndOffset = str.indexOf("\n", lineEndOffset + 1);
    nextLine = nextLineEndOffset === -1 ? str.slice(lineEndOffset) : str.slice(lineEndOffset, nextLineEndOffset);
    nextLine = nextLine.replace(/^\r?\n/, "").replace(/\r$/, "");
  }
  if (prevLineStartOffset >= 0) {
    prevLine = str.slice(prevLineStartOffset, lineStartOffset).replace(/\r?\n$/, "");
  }
  const line = str.slice(lineStartOffset, lineEndOffset).replace(/\r$/, "");
  return {
    offset,
    lineNum,
    colNum,
    line,
    prevLine,
    nextLine,
    toString: lineAndColumnToMessage
  };
}
function getLineAndColumnMessage(str, offset, ...ranges) {
  return getLineAndColumn(str, offset).toString(...ranges);
}
var uniqueId = /* @__PURE__ */ (() => {
  let idCounter = 0;
  return (prefix) => "" + prefix + idCounter++;
})();

// node_modules/ohm-js/src/Interval.js
var Interval = class _Interval {
  constructor(sourceString, startIdx, endIdx) {
    Object.defineProperty(this, "_sourceString", {
      value: sourceString,
      configurable: false,
      enumerable: false,
      writable: false
    });
    this.startIdx = startIdx;
    this.endIdx = endIdx;
  }
  get sourceString() {
    return this._sourceString;
  }
  get contents() {
    if (this._contents === void 0) {
      this._contents = this.sourceString.slice(this.startIdx, this.endIdx);
    }
    return this._contents;
  }
  get length() {
    return this.endIdx - this.startIdx;
  }
  coverageWith(...intervals) {
    return _Interval.coverage(...intervals, this);
  }
  collapsedLeft() {
    return new _Interval(this.sourceString, this.startIdx, this.startIdx);
  }
  collapsedRight() {
    return new _Interval(this.sourceString, this.endIdx, this.endIdx);
  }
  getLineAndColumn() {
    return getLineAndColumn(this.sourceString, this.startIdx);
  }
  getLineAndColumnMessage() {
    const range = [this.startIdx, this.endIdx];
    return getLineAndColumnMessage(this.sourceString, this.startIdx, range);
  }
  // Returns an array of 0, 1, or 2 intervals that represents the result of the
  // interval difference operation.
  minus(that) {
    if (this.sourceString !== that.sourceString) {
      throw intervalSourcesDontMatch();
    } else if (this.startIdx === that.startIdx && this.endIdx === that.endIdx) {
      return [];
    } else if (this.startIdx < that.startIdx && that.endIdx < this.endIdx) {
      return [
        new _Interval(this.sourceString, this.startIdx, that.startIdx),
        new _Interval(this.sourceString, that.endIdx, this.endIdx)
      ];
    } else if (this.startIdx < that.endIdx && that.endIdx < this.endIdx) {
      return [new _Interval(this.sourceString, that.endIdx, this.endIdx)];
    } else if (this.startIdx < that.startIdx && that.startIdx < this.endIdx) {
      return [new _Interval(this.sourceString, this.startIdx, that.startIdx)];
    } else {
      return [this];
    }
  }
  // Returns a new Interval that has the same extent as this one, but which is relative
  // to `that`, an Interval that fully covers this one.
  relativeTo(that) {
    if (this.sourceString !== that.sourceString) {
      throw intervalSourcesDontMatch();
    }
    assert(
      this.startIdx >= that.startIdx && this.endIdx <= that.endIdx,
      "other interval does not cover this one"
    );
    return new _Interval(
      this.sourceString,
      this.startIdx - that.startIdx,
      this.endIdx - that.startIdx
    );
  }
  // Returns a new Interval which contains the same contents as this one,
  // but with whitespace trimmed from both ends.
  trimmed() {
    const { contents } = this;
    const startIdx = this.startIdx + contents.match(/^\s*/)[0].length;
    const endIdx = this.endIdx - contents.match(/\s*$/)[0].length;
    return new _Interval(this.sourceString, startIdx, endIdx);
  }
  subInterval(offset, len) {
    const newStartIdx = this.startIdx + offset;
    return new _Interval(this.sourceString, newStartIdx, newStartIdx + len);
  }
};
Interval.coverage = function(firstInterval, ...intervals) {
  let { startIdx, endIdx } = firstInterval;
  for (const interval of intervals) {
    if (interval.sourceString !== firstInterval.sourceString) {
      throw intervalSourcesDontMatch();
    } else {
      startIdx = Math.min(startIdx, interval.startIdx);
      endIdx = Math.max(endIdx, interval.endIdx);
    }
  }
  return new Interval(firstInterval.sourceString, startIdx, endIdx);
};

// node_modules/ohm-js/src/InputStream.js
var MAX_CHAR_CODE = 65535;
var MAX_CODE_POINT = 1114111;
var InputStream = class {
  constructor(source) {
    this.source = source;
    this.pos = 0;
    this.examinedLength = 0;
  }
  atEnd() {
    const ans = this.pos >= this.source.length;
    this.examinedLength = Math.max(this.examinedLength, this.pos + 1);
    return ans;
  }
  next() {
    const ans = this.source[this.pos++];
    this.examinedLength = Math.max(this.examinedLength, this.pos);
    return ans;
  }
  nextCharCode() {
    const nextChar = this.next();
    return nextChar && nextChar.charCodeAt(0);
  }
  nextCodePoint() {
    const cp = this.source.slice(this.pos++).codePointAt(0);
    if (cp > MAX_CHAR_CODE) {
      this.pos += 1;
    }
    this.examinedLength = Math.max(this.examinedLength, this.pos);
    return cp;
  }
  matchString(s, optIgnoreCase) {
    let idx;
    if (optIgnoreCase) {
      for (idx = 0; idx < s.length; idx++) {
        const actual = this.next();
        const expected = s[idx];
        if (actual == null || actual.toUpperCase() !== expected.toUpperCase()) {
          return false;
        }
      }
      return true;
    }
    for (idx = 0; idx < s.length; idx++) {
      if (this.next() !== s[idx]) {
        return false;
      }
    }
    return true;
  }
  sourceSlice(startIdx, endIdx) {
    return this.source.slice(startIdx, endIdx);
  }
  interval(startIdx, optEndIdx) {
    return new Interval(this.source, startIdx, optEndIdx ? optEndIdx : this.pos);
  }
};

// node_modules/ohm-js/src/MatchResult.js
var MatchResult = class {
  constructor(matcher, input, startExpr, cst, cstOffset, rightmostFailurePosition, optRecordedFailures) {
    this.matcher = matcher;
    this.input = input;
    this.startExpr = startExpr;
    this._cst = cst;
    this._cstOffset = cstOffset;
    this._rightmostFailurePosition = rightmostFailurePosition;
    this._rightmostFailures = optRecordedFailures;
    if (this.failed()) {
      defineLazyProperty(this, "message", function() {
        const detail = "Expected " + this.getExpectedText();
        return getLineAndColumnMessage(this.input, this.getRightmostFailurePosition()) + detail;
      });
      defineLazyProperty(this, "shortMessage", function() {
        const detail = "expected " + this.getExpectedText();
        const errorInfo = getLineAndColumn(
          this.input,
          this.getRightmostFailurePosition()
        );
        return "Line " + errorInfo.lineNum + ", col " + errorInfo.colNum + ": " + detail;
      });
    }
  }
  succeeded() {
    return !!this._cst;
  }
  failed() {
    return !this.succeeded();
  }
  getRightmostFailurePosition() {
    return this._rightmostFailurePosition;
  }
  getRightmostFailures() {
    if (!this._rightmostFailures) {
      this.matcher.setInput(this.input);
      const matchResultWithFailures = this.matcher._match(this.startExpr, {
        tracing: false,
        positionToRecordFailures: this.getRightmostFailurePosition()
      });
      this._rightmostFailures = matchResultWithFailures.getRightmostFailures();
    }
    return this._rightmostFailures;
  }
  toString() {
    return this.succeeded() ? "[match succeeded]" : "[match failed at position " + this.getRightmostFailurePosition() + "]";
  }
  // Return a string summarizing the expected contents of the input stream when
  // the match failure occurred.
  getExpectedText() {
    if (this.succeeded()) {
      throw new Error("cannot get expected text of a successful MatchResult");
    }
    const sb = new StringBuffer();
    let failures = this.getRightmostFailures();
    failures = failures.filter((failure) => !failure.isFluffy());
    for (let idx = 0; idx < failures.length; idx++) {
      if (idx > 0) {
        if (idx === failures.length - 1) {
          sb.append(failures.length > 2 ? ", or " : " or ");
        } else {
          sb.append(", ");
        }
      }
      sb.append(failures[idx].toString());
    }
    return sb.contents();
  }
  getInterval() {
    const pos = this.getRightmostFailurePosition();
    return new Interval(this.input, pos, pos);
  }
};

// node_modules/ohm-js/src/PosInfo.js
var PosInfo = class {
  constructor() {
    this.applicationMemoKeyStack = [];
    this.memo = {};
    this.maxExaminedLength = 0;
    this.maxRightmostFailureOffset = -1;
    this.currentLeftRecursion = void 0;
  }
  isActive(application) {
    return this.applicationMemoKeyStack.indexOf(application.toMemoKey()) >= 0;
  }
  enter(application) {
    this.applicationMemoKeyStack.push(application.toMemoKey());
  }
  exit() {
    this.applicationMemoKeyStack.pop();
  }
  startLeftRecursion(headApplication, memoRec) {
    memoRec.isLeftRecursion = true;
    memoRec.headApplication = headApplication;
    memoRec.nextLeftRecursion = this.currentLeftRecursion;
    this.currentLeftRecursion = memoRec;
    const { applicationMemoKeyStack } = this;
    const indexOfFirstInvolvedRule = applicationMemoKeyStack.indexOf(headApplication.toMemoKey()) + 1;
    const involvedApplicationMemoKeys = applicationMemoKeyStack.slice(
      indexOfFirstInvolvedRule
    );
    memoRec.isInvolved = function(applicationMemoKey) {
      return involvedApplicationMemoKeys.indexOf(applicationMemoKey) >= 0;
    };
    memoRec.updateInvolvedApplicationMemoKeys = function() {
      for (let idx = indexOfFirstInvolvedRule; idx < applicationMemoKeyStack.length; idx++) {
        const applicationMemoKey = applicationMemoKeyStack[idx];
        if (!this.isInvolved(applicationMemoKey)) {
          involvedApplicationMemoKeys.push(applicationMemoKey);
        }
      }
    };
  }
  endLeftRecursion() {
    this.currentLeftRecursion = this.currentLeftRecursion.nextLeftRecursion;
  }
  // Note: this method doesn't get called for the "head" of a left recursion -- for LR heads,
  // the memoized result (which starts out being a failure) is always used.
  shouldUseMemoizedResult(memoRec) {
    if (!memoRec.isLeftRecursion) {
      return true;
    }
    const { applicationMemoKeyStack } = this;
    for (let idx = 0; idx < applicationMemoKeyStack.length; idx++) {
      const applicationMemoKey = applicationMemoKeyStack[idx];
      if (memoRec.isInvolved(applicationMemoKey)) {
        return false;
      }
    }
    return true;
  }
  memoize(memoKey, memoRec) {
    this.memo[memoKey] = memoRec;
    this.maxExaminedLength = Math.max(this.maxExaminedLength, memoRec.examinedLength);
    this.maxRightmostFailureOffset = Math.max(
      this.maxRightmostFailureOffset,
      memoRec.rightmostFailureOffset
    );
    return memoRec;
  }
  clearObsoleteEntries(pos, invalidatedIdx) {
    if (pos + this.maxExaminedLength <= invalidatedIdx) {
      return;
    }
    const { memo } = this;
    this.maxExaminedLength = 0;
    this.maxRightmostFailureOffset = -1;
    Object.keys(memo).forEach((k) => {
      const memoRec = memo[k];
      if (pos + memoRec.examinedLength > invalidatedIdx) {
        delete memo[k];
      } else {
        this.maxExaminedLength = Math.max(this.maxExaminedLength, memoRec.examinedLength);
        this.maxRightmostFailureOffset = Math.max(
          this.maxRightmostFailureOffset,
          memoRec.rightmostFailureOffset
        );
      }
    });
  }
};

// node_modules/ohm-js/src/Trace.js
var BALLOT_X = "\u2717";
var CHECK_MARK = "\u2713";
var DOT_OPERATOR = "\u22C5";
var RIGHTWARDS_DOUBLE_ARROW = "\u21D2";
var SYMBOL_FOR_HORIZONTAL_TABULATION = "\u2409";
var SYMBOL_FOR_LINE_FEED = "\u240A";
var SYMBOL_FOR_CARRIAGE_RETURN = "\u240D";
var Flags = {
  succeeded: 1 << 0,
  isRootNode: 1 << 1,
  isImplicitSpaces: 1 << 2,
  isMemoized: 1 << 3,
  isHeadOfLeftRecursion: 1 << 4,
  terminatesLR: 1 << 5
};
function spaces(n2) {
  return repeat(" ", n2).join("");
}
function getInputExcerpt(input, pos, len) {
  const excerpt = asEscapedString(input.slice(pos, pos + len));
  if (excerpt.length < len) {
    return excerpt + repeat(" ", len - excerpt.length).join("");
  }
  return excerpt;
}
function asEscapedString(obj) {
  if (typeof obj === "string") {
    return obj.replace(/ /g, DOT_OPERATOR).replace(/\t/g, SYMBOL_FOR_HORIZONTAL_TABULATION).replace(/\n/g, SYMBOL_FOR_LINE_FEED).replace(/\r/g, SYMBOL_FOR_CARRIAGE_RETURN);
  }
  return String(obj);
}
var Trace = class _Trace {
  constructor(input, pos1, pos2, expr, succeeded, bindings, optChildren) {
    this.input = input;
    this.pos = this.pos1 = pos1;
    this.pos2 = pos2;
    this.source = new Interval(input, pos1, pos2);
    this.expr = expr;
    this.bindings = bindings;
    this.children = optChildren || [];
    this.terminatingLREntry = null;
    this._flags = succeeded ? Flags.succeeded : 0;
  }
  get displayString() {
    return this.expr.toDisplayString();
  }
  clone() {
    return this.cloneWithExpr(this.expr);
  }
  cloneWithExpr(expr) {
    const ans = new _Trace(
      this.input,
      this.pos,
      this.pos2,
      expr,
      this.succeeded,
      this.bindings,
      this.children
    );
    ans.isHeadOfLeftRecursion = this.isHeadOfLeftRecursion;
    ans.isImplicitSpaces = this.isImplicitSpaces;
    ans.isMemoized = this.isMemoized;
    ans.isRootNode = this.isRootNode;
    ans.terminatesLR = this.terminatesLR;
    ans.terminatingLREntry = this.terminatingLREntry;
    return ans;
  }
  // Record the trace information for the terminating condition of the LR loop.
  recordLRTermination(ruleBodyTrace, value) {
    this.terminatingLREntry = new _Trace(
      this.input,
      this.pos,
      this.pos2,
      this.expr,
      false,
      [value],
      [ruleBodyTrace]
    );
    this.terminatingLREntry.terminatesLR = true;
  }
  // Recursively traverse this trace node and all its descendents, calling a visitor function
  // for each node that is visited. If `vistorObjOrFn` is an object, then its 'enter' property
  // is a function to call before visiting the children of a node, and its 'exit' property is
  // a function to call afterwards. If `visitorObjOrFn` is a function, it represents the 'enter'
  // function.
  //
  // The functions are called with three arguments: the Trace node, its parent Trace, and a number
  // representing the depth of the node in the tree. (The root node has depth 0.) `optThisArg`, if
  // specified, is the value to use for `this` when executing the visitor functions.
  walk(visitorObjOrFn, optThisArg) {
    let visitor = visitorObjOrFn;
    if (typeof visitor === "function") {
      visitor = { enter: visitor };
    }
    function _walk(node, parent, depth) {
      let recurse = true;
      if (visitor.enter) {
        if (visitor.enter.call(optThisArg, node, parent, depth) === _Trace.prototype.SKIP) {
          recurse = false;
        }
      }
      if (recurse) {
        node.children.forEach((child) => {
          _walk(child, node, depth + 1);
        });
        if (visitor.exit) {
          visitor.exit.call(optThisArg, node, parent, depth);
        }
      }
    }
    if (this.isRootNode) {
      this.children.forEach((c) => {
        _walk(c, null, 0);
      });
    } else {
      _walk(this, null, 0);
    }
  }
  // Return a string representation of the trace.
  // Sample:
  //     12⋅+⋅2⋅*⋅3 ✓ exp ⇒  "12"
  //     12⋅+⋅2⋅*⋅3   ✓ addExp (LR) ⇒  "12"
  //     12⋅+⋅2⋅*⋅3       ✗ addExp_plus
  toString() {
    const sb = new StringBuffer();
    this.walk((node, parent, depth) => {
      if (!node) {
        return this.SKIP;
      }
      const ctorName = node.expr.constructor.name;
      if (ctorName === "Alt") {
        return;
      }
      sb.append(getInputExcerpt(node.input, node.pos, 10) + spaces(depth * 2 + 1));
      sb.append((node.succeeded ? CHECK_MARK : BALLOT_X) + " " + node.displayString);
      if (node.isHeadOfLeftRecursion) {
        sb.append(" (LR)");
      }
      if (node.succeeded) {
        const contents = asEscapedString(node.source.contents);
        sb.append(" " + RIGHTWARDS_DOUBLE_ARROW + "  ");
        sb.append(typeof contents === "string" ? '"' + contents + '"' : contents);
      }
      sb.append("\n");
    });
    return sb.contents();
  }
};
Trace.prototype.SKIP = {};
Object.keys(Flags).forEach((name) => {
  const mask = Flags[name];
  Object.defineProperty(Trace.prototype, name, {
    get() {
      return (this._flags & mask) !== 0;
    },
    set(val) {
      if (val) {
        this._flags |= mask;
      } else {
        this._flags &= ~mask;
      }
    }
  });
});

// node_modules/ohm-js/src/pexprs-allowsSkippingPrecedingSpace.js
PExpr.prototype.allowsSkippingPrecedingSpace = abstract("allowsSkippingPrecedingSpace");
any.allowsSkippingPrecedingSpace = end.allowsSkippingPrecedingSpace = Apply.prototype.allowsSkippingPrecedingSpace = Terminal.prototype.allowsSkippingPrecedingSpace = Range.prototype.allowsSkippingPrecedingSpace = UnicodeChar.prototype.allowsSkippingPrecedingSpace = function() {
  return true;
};
Alt.prototype.allowsSkippingPrecedingSpace = Iter.prototype.allowsSkippingPrecedingSpace = Lex.prototype.allowsSkippingPrecedingSpace = Lookahead.prototype.allowsSkippingPrecedingSpace = Not.prototype.allowsSkippingPrecedingSpace = Param.prototype.allowsSkippingPrecedingSpace = Seq.prototype.allowsSkippingPrecedingSpace = function() {
  return false;
};

// node_modules/ohm-js/src/pexprs-assertAllApplicationsAreValid.js
var BuiltInRules;
awaitBuiltInRules((g) => {
  BuiltInRules = g;
});
var lexifyCount;
PExpr.prototype.assertAllApplicationsAreValid = function(ruleName, grammar2) {
  lexifyCount = 0;
  this._assertAllApplicationsAreValid(ruleName, grammar2);
};
PExpr.prototype._assertAllApplicationsAreValid = abstract(
  "_assertAllApplicationsAreValid"
);
any._assertAllApplicationsAreValid = end._assertAllApplicationsAreValid = Terminal.prototype._assertAllApplicationsAreValid = Range.prototype._assertAllApplicationsAreValid = Param.prototype._assertAllApplicationsAreValid = UnicodeChar.prototype._assertAllApplicationsAreValid = function(ruleName, grammar2) {
};
Lex.prototype._assertAllApplicationsAreValid = function(ruleName, grammar2) {
  lexifyCount++;
  this.expr._assertAllApplicationsAreValid(ruleName, grammar2);
  lexifyCount--;
};
Alt.prototype._assertAllApplicationsAreValid = function(ruleName, grammar2) {
  for (let idx = 0; idx < this.terms.length; idx++) {
    this.terms[idx]._assertAllApplicationsAreValid(ruleName, grammar2);
  }
};
Seq.prototype._assertAllApplicationsAreValid = function(ruleName, grammar2) {
  for (let idx = 0; idx < this.factors.length; idx++) {
    this.factors[idx]._assertAllApplicationsAreValid(ruleName, grammar2);
  }
};
Iter.prototype._assertAllApplicationsAreValid = Not.prototype._assertAllApplicationsAreValid = Lookahead.prototype._assertAllApplicationsAreValid = function(ruleName, grammar2) {
  this.expr._assertAllApplicationsAreValid(ruleName, grammar2);
};
Apply.prototype._assertAllApplicationsAreValid = function(ruleName, grammar2, skipSyntacticCheck = false) {
  const ruleInfo = grammar2.rules[this.ruleName];
  const isContextSyntactic = isSyntactic(ruleName) && lexifyCount === 0;
  if (!ruleInfo) {
    throw undeclaredRule(this.ruleName, grammar2.name, this.source);
  }
  if (!skipSyntacticCheck && isSyntactic(this.ruleName) && !isContextSyntactic) {
    throw applicationOfSyntacticRuleFromLexicalContext(this.ruleName, this);
  }
  const actual = this.args.length;
  const expected = ruleInfo.formals.length;
  if (actual !== expected) {
    throw wrongNumberOfArguments(this.ruleName, expected, actual, this.source);
  }
  const isBuiltInApplySyntactic = BuiltInRules && ruleInfo === BuiltInRules.rules.applySyntactic;
  const isBuiltInCaseInsensitive = BuiltInRules && ruleInfo === BuiltInRules.rules.caseInsensitive;
  if (isBuiltInCaseInsensitive) {
    if (!(this.args[0] instanceof Terminal)) {
      throw incorrectArgumentType('a Terminal (e.g. "abc")', this.args[0]);
    }
  }
  if (isBuiltInApplySyntactic) {
    const arg = this.args[0];
    if (!(arg instanceof Apply)) {
      throw incorrectArgumentType("a syntactic rule application", arg);
    }
    if (!isSyntactic(arg.ruleName)) {
      throw applySyntacticWithLexicalRuleApplication(arg);
    }
    if (isContextSyntactic) {
      throw unnecessaryExperimentalApplySyntactic(this);
    }
  }
  this.args.forEach((arg) => {
    arg._assertAllApplicationsAreValid(ruleName, grammar2, isBuiltInApplySyntactic);
    if (arg.getArity() !== 1) {
      throw invalidParameter(this.ruleName, arg);
    }
  });
};

// node_modules/ohm-js/src/pexprs-assertChoicesHaveUniformArity.js
PExpr.prototype.assertChoicesHaveUniformArity = abstract(
  "assertChoicesHaveUniformArity"
);
any.assertChoicesHaveUniformArity = end.assertChoicesHaveUniformArity = Terminal.prototype.assertChoicesHaveUniformArity = Range.prototype.assertChoicesHaveUniformArity = Param.prototype.assertChoicesHaveUniformArity = Lex.prototype.assertChoicesHaveUniformArity = UnicodeChar.prototype.assertChoicesHaveUniformArity = function(ruleName) {
};
Alt.prototype.assertChoicesHaveUniformArity = function(ruleName) {
  if (this.terms.length === 0) {
    return;
  }
  const arity = this.terms[0].getArity();
  for (let idx = 0; idx < this.terms.length; idx++) {
    const term = this.terms[idx];
    term.assertChoicesHaveUniformArity();
    const otherArity = term.getArity();
    if (arity !== otherArity) {
      throw inconsistentArity(ruleName, arity, otherArity, term);
    }
  }
};
Extend.prototype.assertChoicesHaveUniformArity = function(ruleName) {
  const actualArity = this.terms[0].getArity();
  const expectedArity = this.terms[1].getArity();
  if (actualArity !== expectedArity) {
    throw inconsistentArity(ruleName, expectedArity, actualArity, this.terms[0]);
  }
};
Seq.prototype.assertChoicesHaveUniformArity = function(ruleName) {
  for (let idx = 0; idx < this.factors.length; idx++) {
    this.factors[idx].assertChoicesHaveUniformArity(ruleName);
  }
};
Iter.prototype.assertChoicesHaveUniformArity = function(ruleName) {
  this.expr.assertChoicesHaveUniformArity(ruleName);
};
Not.prototype.assertChoicesHaveUniformArity = function(ruleName) {
};
Lookahead.prototype.assertChoicesHaveUniformArity = function(ruleName) {
  this.expr.assertChoicesHaveUniformArity(ruleName);
};
Apply.prototype.assertChoicesHaveUniformArity = function(ruleName) {
};

// node_modules/ohm-js/src/pexprs-assertIteratedExprsAreNotNullable.js
PExpr.prototype.assertIteratedExprsAreNotNullable = abstract(
  "assertIteratedExprsAreNotNullable"
);
any.assertIteratedExprsAreNotNullable = end.assertIteratedExprsAreNotNullable = Terminal.prototype.assertIteratedExprsAreNotNullable = Range.prototype.assertIteratedExprsAreNotNullable = Param.prototype.assertIteratedExprsAreNotNullable = UnicodeChar.prototype.assertIteratedExprsAreNotNullable = function(grammar2) {
};
Alt.prototype.assertIteratedExprsAreNotNullable = function(grammar2) {
  for (let idx = 0; idx < this.terms.length; idx++) {
    this.terms[idx].assertIteratedExprsAreNotNullable(grammar2);
  }
};
Seq.prototype.assertIteratedExprsAreNotNullable = function(grammar2) {
  for (let idx = 0; idx < this.factors.length; idx++) {
    this.factors[idx].assertIteratedExprsAreNotNullable(grammar2);
  }
};
Iter.prototype.assertIteratedExprsAreNotNullable = function(grammar2) {
  this.expr.assertIteratedExprsAreNotNullable(grammar2);
  if (this.expr.isNullable(grammar2)) {
    throw kleeneExprHasNullableOperand(this, []);
  }
};
Opt.prototype.assertIteratedExprsAreNotNullable = Not.prototype.assertIteratedExprsAreNotNullable = Lookahead.prototype.assertIteratedExprsAreNotNullable = Lex.prototype.assertIteratedExprsAreNotNullable = function(grammar2) {
  this.expr.assertIteratedExprsAreNotNullable(grammar2);
};
Apply.prototype.assertIteratedExprsAreNotNullable = function(grammar2) {
  this.args.forEach((arg) => {
    arg.assertIteratedExprsAreNotNullable(grammar2);
  });
};

// node_modules/ohm-js/src/nodes.js
var Node = class {
  constructor(matchLength) {
    this.matchLength = matchLength;
  }
  get ctorName() {
    throw new Error("subclass responsibility");
  }
  numChildren() {
    return this.children ? this.children.length : 0;
  }
  childAt(idx) {
    if (this.children) {
      return this.children[idx];
    }
  }
  indexOfChild(arg) {
    return this.children.indexOf(arg);
  }
  hasChildren() {
    return this.numChildren() > 0;
  }
  hasNoChildren() {
    return !this.hasChildren();
  }
  onlyChild() {
    if (this.numChildren() !== 1) {
      throw new Error(
        "cannot get only child of a node of type " + this.ctorName + " (it has " + this.numChildren() + " children)"
      );
    } else {
      return this.firstChild();
    }
  }
  firstChild() {
    if (this.hasNoChildren()) {
      throw new Error(
        "cannot get first child of a " + this.ctorName + " node, which has no children"
      );
    } else {
      return this.childAt(0);
    }
  }
  lastChild() {
    if (this.hasNoChildren()) {
      throw new Error(
        "cannot get last child of a " + this.ctorName + " node, which has no children"
      );
    } else {
      return this.childAt(this.numChildren() - 1);
    }
  }
  childBefore(child) {
    const childIdx = this.indexOfChild(child);
    if (childIdx < 0) {
      throw new Error("Node.childBefore() called w/ an argument that is not a child");
    } else if (childIdx === 0) {
      throw new Error("cannot get child before first child");
    } else {
      return this.childAt(childIdx - 1);
    }
  }
  childAfter(child) {
    const childIdx = this.indexOfChild(child);
    if (childIdx < 0) {
      throw new Error("Node.childAfter() called w/ an argument that is not a child");
    } else if (childIdx === this.numChildren() - 1) {
      throw new Error("cannot get child after last child");
    } else {
      return this.childAt(childIdx + 1);
    }
  }
  isTerminal() {
    return false;
  }
  isNonterminal() {
    return false;
  }
  isIteration() {
    return false;
  }
  isOptional() {
    return false;
  }
};
var TerminalNode = class extends Node {
  get ctorName() {
    return "_terminal";
  }
  isTerminal() {
    return true;
  }
  get primitiveValue() {
    throw new Error("The `primitiveValue` property was removed in Ohm v17.");
  }
};
var NonterminalNode = class extends Node {
  constructor(ruleName, children, childOffsets, matchLength) {
    super(matchLength);
    this.ruleName = ruleName;
    this.children = children;
    this.childOffsets = childOffsets;
  }
  get ctorName() {
    return this.ruleName;
  }
  isNonterminal() {
    return true;
  }
  isLexical() {
    return isLexical(this.ctorName);
  }
  isSyntactic() {
    return isSyntactic(this.ctorName);
  }
};
var IterationNode = class extends Node {
  constructor(children, childOffsets, matchLength, isOptional) {
    super(matchLength);
    this.children = children;
    this.childOffsets = childOffsets;
    this.optional = isOptional;
  }
  get ctorName() {
    return "_iter";
  }
  isIteration() {
    return true;
  }
  isOptional() {
    return this.optional;
  }
};

// node_modules/ohm-js/src/pexprs-eval.js
PExpr.prototype.eval = abstract("eval");
any.eval = function(state) {
  const { inputStream } = state;
  const origPos = inputStream.pos;
  const cp = inputStream.nextCodePoint();
  if (cp !== void 0) {
    state.pushBinding(new TerminalNode(String.fromCodePoint(cp).length), origPos);
    return true;
  } else {
    state.processFailure(origPos, this);
    return false;
  }
};
end.eval = function(state) {
  const { inputStream } = state;
  const origPos = inputStream.pos;
  if (inputStream.atEnd()) {
    state.pushBinding(new TerminalNode(0), origPos);
    return true;
  } else {
    state.processFailure(origPos, this);
    return false;
  }
};
Terminal.prototype.eval = function(state) {
  const { inputStream } = state;
  const origPos = inputStream.pos;
  if (!inputStream.matchString(this.obj)) {
    state.processFailure(origPos, this);
    return false;
  } else {
    state.pushBinding(new TerminalNode(this.obj.length), origPos);
    return true;
  }
};
Range.prototype.eval = function(state) {
  const { inputStream } = state;
  const origPos = inputStream.pos;
  const cp = this.matchCodePoint ? inputStream.nextCodePoint() : inputStream.nextCharCode();
  if (cp !== void 0 && this.from.codePointAt(0) <= cp && cp <= this.to.codePointAt(0)) {
    state.pushBinding(new TerminalNode(String.fromCodePoint(cp).length), origPos);
    return true;
  } else {
    state.processFailure(origPos, this);
    return false;
  }
};
Param.prototype.eval = function(state) {
  return state.eval(state.currentApplication().args[this.index]);
};
Lex.prototype.eval = function(state) {
  state.enterLexifiedContext();
  const ans = state.eval(this.expr);
  state.exitLexifiedContext();
  return ans;
};
Alt.prototype.eval = function(state) {
  for (let idx = 0; idx < this.terms.length; idx++) {
    if (state.eval(this.terms[idx])) {
      return true;
    }
  }
  return false;
};
Seq.prototype.eval = function(state) {
  for (let idx = 0; idx < this.factors.length; idx++) {
    const factor = this.factors[idx];
    if (!state.eval(factor)) {
      return false;
    }
  }
  return true;
};
Iter.prototype.eval = function(state) {
  const { inputStream } = state;
  const origPos = inputStream.pos;
  const arity = this.getArity();
  const cols = [];
  const colOffsets = [];
  while (cols.length < arity) {
    cols.push([]);
    colOffsets.push([]);
  }
  let numMatches = 0;
  let prevPos = origPos;
  let idx;
  while (numMatches < this.maxNumMatches && state.eval(this.expr)) {
    if (inputStream.pos === prevPos) {
      throw kleeneExprHasNullableOperand(this, state._applicationStack);
    }
    prevPos = inputStream.pos;
    numMatches++;
    const row = state._bindings.splice(state._bindings.length - arity, arity);
    const rowOffsets = state._bindingOffsets.splice(
      state._bindingOffsets.length - arity,
      arity
    );
    for (idx = 0; idx < row.length; idx++) {
      cols[idx].push(row[idx]);
      colOffsets[idx].push(rowOffsets[idx]);
    }
  }
  if (numMatches < this.minNumMatches) {
    return false;
  }
  let offset = state.posToOffset(origPos);
  let matchLength = 0;
  if (numMatches > 0) {
    const lastCol = cols[arity - 1];
    const lastColOffsets = colOffsets[arity - 1];
    const endOffset = lastColOffsets[lastColOffsets.length - 1] + lastCol[lastCol.length - 1].matchLength;
    offset = colOffsets[0][0];
    matchLength = endOffset - offset;
  }
  const isOptional = this instanceof Opt;
  for (idx = 0; idx < cols.length; idx++) {
    state._bindings.push(
      new IterationNode(cols[idx], colOffsets[idx], matchLength, isOptional)
    );
    state._bindingOffsets.push(offset);
  }
  return true;
};
Not.prototype.eval = function(state) {
  const { inputStream } = state;
  const origPos = inputStream.pos;
  state.pushFailuresInfo();
  const ans = state.eval(this.expr);
  state.popFailuresInfo();
  if (ans) {
    state.processFailure(origPos, this);
    return false;
  }
  inputStream.pos = origPos;
  return true;
};
Lookahead.prototype.eval = function(state) {
  const { inputStream } = state;
  const origPos = inputStream.pos;
  if (state.eval(this.expr)) {
    inputStream.pos = origPos;
    return true;
  } else {
    return false;
  }
};
Apply.prototype.eval = function(state) {
  const caller = state.currentApplication();
  const actuals = caller ? caller.args : [];
  const app = this.substituteParams(actuals);
  const posInfo = state.getCurrentPosInfo();
  if (posInfo.isActive(app)) {
    return app.handleCycle(state);
  }
  const memoKey = app.toMemoKey();
  const memoRec = posInfo.memo[memoKey];
  if (memoRec && posInfo.shouldUseMemoizedResult(memoRec)) {
    if (state.hasNecessaryInfo(memoRec)) {
      return state.useMemoizedResult(state.inputStream.pos, memoRec);
    }
    delete posInfo.memo[memoKey];
  }
  return app.reallyEval(state);
};
Apply.prototype.handleCycle = function(state) {
  const posInfo = state.getCurrentPosInfo();
  const { currentLeftRecursion } = posInfo;
  const memoKey = this.toMemoKey();
  let memoRec = posInfo.memo[memoKey];
  if (currentLeftRecursion && currentLeftRecursion.headApplication.toMemoKey() === memoKey) {
    memoRec.updateInvolvedApplicationMemoKeys();
  } else if (!memoRec) {
    memoRec = posInfo.memoize(memoKey, {
      matchLength: 0,
      examinedLength: 0,
      value: false,
      rightmostFailureOffset: -1
    });
    posInfo.startLeftRecursion(this, memoRec);
  }
  return state.useMemoizedResult(state.inputStream.pos, memoRec);
};
Apply.prototype.reallyEval = function(state) {
  const { inputStream } = state;
  const origPos = inputStream.pos;
  const origPosInfo = state.getCurrentPosInfo();
  const ruleInfo = state.grammar.rules[this.ruleName];
  const { body } = ruleInfo;
  const { description } = ruleInfo;
  state.enterApplication(origPosInfo, this);
  if (description) {
    state.pushFailuresInfo();
  }
  const origInputStreamExaminedLength = inputStream.examinedLength;
  inputStream.examinedLength = 0;
  let value = this.evalOnce(body, state);
  const currentLR = origPosInfo.currentLeftRecursion;
  const memoKey = this.toMemoKey();
  const isHeadOfLeftRecursion = currentLR && currentLR.headApplication.toMemoKey() === memoKey;
  let memoRec;
  if (state.doNotMemoize) {
    state.doNotMemoize = false;
  } else if (isHeadOfLeftRecursion) {
    value = this.growSeedResult(body, state, origPos, currentLR, value);
    origPosInfo.endLeftRecursion();
    memoRec = currentLR;
    memoRec.examinedLength = inputStream.examinedLength - origPos;
    memoRec.rightmostFailureOffset = state._getRightmostFailureOffset();
    origPosInfo.memoize(memoKey, memoRec);
  } else if (!currentLR || !currentLR.isInvolved(memoKey)) {
    memoRec = origPosInfo.memoize(memoKey, {
      matchLength: inputStream.pos - origPos,
      examinedLength: inputStream.examinedLength - origPos,
      value,
      failuresAtRightmostPosition: state.cloneRecordedFailures(),
      rightmostFailureOffset: state._getRightmostFailureOffset()
    });
  }
  const succeeded = !!value;
  if (description) {
    state.popFailuresInfo();
    if (!succeeded) {
      state.processFailure(origPos, this);
    }
    if (memoRec) {
      memoRec.failuresAtRightmostPosition = state.cloneRecordedFailures();
      memoRec.rightmostFailureOffset = state._getRightmostFailureOffset();
    }
  }
  if (state.isTracing() && memoRec) {
    const entry = state.getTraceEntry(origPos, this, succeeded, succeeded ? [value] : []);
    if (isHeadOfLeftRecursion) {
      assert(entry.terminatingLREntry != null || !succeeded);
      entry.isHeadOfLeftRecursion = true;
    }
    memoRec.traceEntry = entry;
  }
  inputStream.examinedLength = Math.max(
    inputStream.examinedLength,
    origInputStreamExaminedLength
  );
  state.exitApplication(origPosInfo, value);
  return succeeded;
};
Apply.prototype.evalOnce = function(expr, state) {
  const { inputStream } = state;
  const origPos = inputStream.pos;
  if (state.eval(expr)) {
    const arity = expr.getArity();
    const bindings = state._bindings.splice(state._bindings.length - arity, arity);
    const offsets = state._bindingOffsets.splice(state._bindingOffsets.length - arity, arity);
    const matchLength = inputStream.pos - origPos;
    return new NonterminalNode(this.ruleName, bindings, offsets, matchLength);
  } else {
    return false;
  }
};
Apply.prototype.growSeedResult = function(body, state, origPos, lrMemoRec, newValue) {
  if (!newValue) {
    return false;
  }
  const { inputStream } = state;
  while (true) {
    lrMemoRec.matchLength = inputStream.pos - origPos;
    lrMemoRec.value = newValue;
    lrMemoRec.failuresAtRightmostPosition = state.cloneRecordedFailures();
    if (state.isTracing()) {
      const seedTrace = state.trace[state.trace.length - 1];
      lrMemoRec.traceEntry = new Trace(
        state.input,
        origPos,
        inputStream.pos,
        this,
        true,
        [newValue],
        [seedTrace.clone()]
      );
    }
    inputStream.pos = origPos;
    newValue = this.evalOnce(body, state);
    if (inputStream.pos - origPos <= lrMemoRec.matchLength) {
      break;
    }
    if (state.isTracing()) {
      state.trace.splice(-2, 1);
    }
  }
  if (state.isTracing()) {
    lrMemoRec.traceEntry.recordLRTermination(state.trace.pop(), newValue);
  }
  inputStream.pos = origPos + lrMemoRec.matchLength;
  return lrMemoRec.value;
};
UnicodeChar.prototype.eval = function(state) {
  const { inputStream } = state;
  const origPos = inputStream.pos;
  const cp = inputStream.nextCodePoint();
  if (cp !== void 0 && cp <= MAX_CODE_POINT) {
    const ch = String.fromCodePoint(cp);
    if (this.pattern.test(ch)) {
      state.pushBinding(new TerminalNode(ch.length), origPos);
      return true;
    }
  }
  state.processFailure(origPos, this);
  return false;
};

// node_modules/ohm-js/src/pexprs-getArity.js
PExpr.prototype.getArity = abstract("getArity");
any.getArity = end.getArity = Terminal.prototype.getArity = Range.prototype.getArity = Param.prototype.getArity = Apply.prototype.getArity = UnicodeChar.prototype.getArity = function() {
  return 1;
};
Alt.prototype.getArity = function() {
  return this.terms.length === 0 ? 0 : this.terms[0].getArity();
};
Seq.prototype.getArity = function() {
  let arity = 0;
  for (let idx = 0; idx < this.factors.length; idx++) {
    arity += this.factors[idx].getArity();
  }
  return arity;
};
Iter.prototype.getArity = function() {
  return this.expr.getArity();
};
Not.prototype.getArity = function() {
  return 0;
};
Lookahead.prototype.getArity = Lex.prototype.getArity = function() {
  return this.expr.getArity();
};

// node_modules/ohm-js/src/pexprs-outputRecipe.js
function getMetaInfo(expr, grammarInterval) {
  const metaInfo = {};
  if (expr.source && grammarInterval) {
    const adjusted = expr.source.relativeTo(grammarInterval);
    metaInfo.sourceInterval = [adjusted.startIdx, adjusted.endIdx];
  }
  return metaInfo;
}
PExpr.prototype.outputRecipe = abstract("outputRecipe");
any.outputRecipe = function(formals, grammarInterval) {
  return ["any", getMetaInfo(this, grammarInterval)];
};
end.outputRecipe = function(formals, grammarInterval) {
  return ["end", getMetaInfo(this, grammarInterval)];
};
Terminal.prototype.outputRecipe = function(formals, grammarInterval) {
  return ["terminal", getMetaInfo(this, grammarInterval), this.obj];
};
Range.prototype.outputRecipe = function(formals, grammarInterval) {
  return ["range", getMetaInfo(this, grammarInterval), this.from, this.to];
};
Param.prototype.outputRecipe = function(formals, grammarInterval) {
  return ["param", getMetaInfo(this, grammarInterval), this.index];
};
Alt.prototype.outputRecipe = function(formals, grammarInterval) {
  return ["alt", getMetaInfo(this, grammarInterval)].concat(
    this.terms.map((term) => term.outputRecipe(formals, grammarInterval))
  );
};
Extend.prototype.outputRecipe = function(formals, grammarInterval) {
  const extension = this.terms[0];
  return extension.outputRecipe(formals, grammarInterval);
};
Splice.prototype.outputRecipe = function(formals, grammarInterval) {
  const beforeTerms = this.terms.slice(0, this.expansionPos);
  const afterTerms = this.terms.slice(this.expansionPos + 1);
  return [
    "splice",
    getMetaInfo(this, grammarInterval),
    beforeTerms.map((term) => term.outputRecipe(formals, grammarInterval)),
    afterTerms.map((term) => term.outputRecipe(formals, grammarInterval))
  ];
};
Seq.prototype.outputRecipe = function(formals, grammarInterval) {
  return ["seq", getMetaInfo(this, grammarInterval)].concat(
    this.factors.map((factor) => factor.outputRecipe(formals, grammarInterval))
  );
};
Star.prototype.outputRecipe = Plus.prototype.outputRecipe = Opt.prototype.outputRecipe = Not.prototype.outputRecipe = Lookahead.prototype.outputRecipe = Lex.prototype.outputRecipe = function(formals, grammarInterval) {
  return [
    this.constructor.name.toLowerCase(),
    getMetaInfo(this, grammarInterval),
    this.expr.outputRecipe(formals, grammarInterval)
  ];
};
Apply.prototype.outputRecipe = function(formals, grammarInterval) {
  return [
    "app",
    getMetaInfo(this, grammarInterval),
    this.ruleName,
    this.args.map((arg) => arg.outputRecipe(formals, grammarInterval))
  ];
};
UnicodeChar.prototype.outputRecipe = function(formals, grammarInterval) {
  return ["unicodeChar", getMetaInfo(this, grammarInterval), this.categoryOrProp];
};

// node_modules/ohm-js/src/pexprs-introduceParams.js
PExpr.prototype.introduceParams = abstract("introduceParams");
any.introduceParams = end.introduceParams = Terminal.prototype.introduceParams = Range.prototype.introduceParams = Param.prototype.introduceParams = UnicodeChar.prototype.introduceParams = function(formals) {
  return this;
};
Alt.prototype.introduceParams = function(formals) {
  this.terms.forEach((term, idx, terms) => {
    terms[idx] = term.introduceParams(formals);
  });
  return this;
};
Seq.prototype.introduceParams = function(formals) {
  this.factors.forEach((factor, idx, factors) => {
    factors[idx] = factor.introduceParams(formals);
  });
  return this;
};
Iter.prototype.introduceParams = Not.prototype.introduceParams = Lookahead.prototype.introduceParams = Lex.prototype.introduceParams = function(formals) {
  this.expr = this.expr.introduceParams(formals);
  return this;
};
Apply.prototype.introduceParams = function(formals) {
  const index = formals.indexOf(this.ruleName);
  if (index >= 0) {
    if (this.args.length > 0) {
      throw new Error("Parameterized rules cannot be passed as arguments to another rule.");
    }
    return new Param(index).withSource(this.source);
  } else {
    this.args.forEach((arg, idx, args) => {
      args[idx] = arg.introduceParams(formals);
    });
    return this;
  }
};

// node_modules/ohm-js/src/pexprs-isNullable.js
PExpr.prototype.isNullable = function(grammar2) {
  return this._isNullable(grammar2, /* @__PURE__ */ Object.create(null));
};
PExpr.prototype._isNullable = abstract("_isNullable");
any._isNullable = Range.prototype._isNullable = Param.prototype._isNullable = Plus.prototype._isNullable = UnicodeChar.prototype._isNullable = function(grammar2, memo) {
  return false;
};
end._isNullable = function(grammar2, memo) {
  return true;
};
Terminal.prototype._isNullable = function(grammar2, memo) {
  if (typeof this.obj === "string") {
    return this.obj === "";
  } else {
    return false;
  }
};
Alt.prototype._isNullable = function(grammar2, memo) {
  return this.terms.length === 0 || this.terms.some((term) => term._isNullable(grammar2, memo));
};
Seq.prototype._isNullable = function(grammar2, memo) {
  return this.factors.every((factor) => factor._isNullable(grammar2, memo));
};
Star.prototype._isNullable = Opt.prototype._isNullable = Not.prototype._isNullable = Lookahead.prototype._isNullable = function(grammar2, memo) {
  return true;
};
Lex.prototype._isNullable = function(grammar2, memo) {
  return this.expr._isNullable(grammar2, memo);
};
Apply.prototype._isNullable = function(grammar2, memo) {
  const key = this.toMemoKey();
  if (!Object.prototype.hasOwnProperty.call(memo, key)) {
    const { body } = grammar2.rules[this.ruleName];
    const inlined = body.substituteParams(this.args);
    memo[key] = false;
    memo[key] = inlined._isNullable(grammar2, memo);
  }
  return memo[key];
};

// node_modules/ohm-js/src/pexprs-substituteParams.js
PExpr.prototype.substituteParams = abstract("substituteParams");
any.substituteParams = end.substituteParams = Terminal.prototype.substituteParams = Range.prototype.substituteParams = UnicodeChar.prototype.substituteParams = function(actuals) {
  return this;
};
Param.prototype.substituteParams = function(actuals) {
  return checkNotNull(actuals[this.index]);
};
Alt.prototype.substituteParams = function(actuals) {
  return new Alt(this.terms.map((term) => term.substituteParams(actuals)));
};
Seq.prototype.substituteParams = function(actuals) {
  return new Seq(this.factors.map((factor) => factor.substituteParams(actuals)));
};
Iter.prototype.substituteParams = Not.prototype.substituteParams = Lookahead.prototype.substituteParams = Lex.prototype.substituteParams = function(actuals) {
  return new this.constructor(this.expr.substituteParams(actuals));
};
Apply.prototype.substituteParams = function(actuals) {
  if (this.args.length === 0) {
    return this;
  } else {
    const args = this.args.map((arg) => arg.substituteParams(actuals));
    return new Apply(this.ruleName, args);
  }
};

// node_modules/ohm-js/src/pexprs-toArgumentNameList.js
function isRestrictedJSIdentifier(str) {
  return /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(str);
}
function resolveDuplicatedNames(argumentNameList) {
  const count = /* @__PURE__ */ Object.create(null);
  argumentNameList.forEach((argName) => {
    count[argName] = (count[argName] || 0) + 1;
  });
  Object.keys(count).forEach((dupArgName) => {
    if (count[dupArgName] <= 1) {
      return;
    }
    let subscript = 1;
    argumentNameList.forEach((argName, idx) => {
      if (argName === dupArgName) {
        argumentNameList[idx] = argName + "_" + subscript++;
      }
    });
  });
}
PExpr.prototype.toArgumentNameList = abstract("toArgumentNameList");
any.toArgumentNameList = function(firstArgIndex, noDupCheck) {
  return ["any"];
};
end.toArgumentNameList = function(firstArgIndex, noDupCheck) {
  return ["end"];
};
Terminal.prototype.toArgumentNameList = function(firstArgIndex, noDupCheck) {
  if (typeof this.obj === "string" && /^[_a-zA-Z0-9]+$/.test(this.obj)) {
    return ["_" + this.obj];
  } else {
    return ["$" + firstArgIndex];
  }
};
Range.prototype.toArgumentNameList = function(firstArgIndex, noDupCheck) {
  let argName = this.from + "_to_" + this.to;
  if (!isRestrictedJSIdentifier(argName)) {
    argName = "_" + argName;
  }
  if (!isRestrictedJSIdentifier(argName)) {
    argName = "$" + firstArgIndex;
  }
  return [argName];
};
Alt.prototype.toArgumentNameList = function(firstArgIndex, noDupCheck) {
  const termArgNameLists = this.terms.map(
    (term) => term.toArgumentNameList(firstArgIndex, true)
  );
  const argumentNameList = [];
  const numArgs = termArgNameLists[0].length;
  for (let colIdx = 0; colIdx < numArgs; colIdx++) {
    const col = [];
    for (let rowIdx = 0; rowIdx < this.terms.length; rowIdx++) {
      col.push(termArgNameLists[rowIdx][colIdx]);
    }
    const uniqueNames = copyWithoutDuplicates(col);
    argumentNameList.push(uniqueNames.join("_or_"));
  }
  if (!noDupCheck) {
    resolveDuplicatedNames(argumentNameList);
  }
  return argumentNameList;
};
Seq.prototype.toArgumentNameList = function(firstArgIndex, noDupCheck) {
  let argumentNameList = [];
  this.factors.forEach((factor) => {
    const factorArgumentNameList = factor.toArgumentNameList(firstArgIndex, true);
    argumentNameList = argumentNameList.concat(factorArgumentNameList);
    firstArgIndex += factorArgumentNameList.length;
  });
  if (!noDupCheck) {
    resolveDuplicatedNames(argumentNameList);
  }
  return argumentNameList;
};
Iter.prototype.toArgumentNameList = function(firstArgIndex, noDupCheck) {
  const argumentNameList = this.expr.toArgumentNameList(firstArgIndex, noDupCheck).map(
    (exprArgumentString) => exprArgumentString[exprArgumentString.length - 1] === "s" ? exprArgumentString + "es" : exprArgumentString + "s"
  );
  if (!noDupCheck) {
    resolveDuplicatedNames(argumentNameList);
  }
  return argumentNameList;
};
Opt.prototype.toArgumentNameList = function(firstArgIndex, noDupCheck) {
  return this.expr.toArgumentNameList(firstArgIndex, noDupCheck).map((argName) => {
    return "opt" + argName[0].toUpperCase() + argName.slice(1);
  });
};
Not.prototype.toArgumentNameList = function(firstArgIndex, noDupCheck) {
  return [];
};
Lookahead.prototype.toArgumentNameList = Lex.prototype.toArgumentNameList = function(firstArgIndex, noDupCheck) {
  return this.expr.toArgumentNameList(firstArgIndex, noDupCheck);
};
Apply.prototype.toArgumentNameList = function(firstArgIndex, noDupCheck) {
  return [this.ruleName];
};
UnicodeChar.prototype.toArgumentNameList = function(firstArgIndex, noDupCheck) {
  return ["$" + firstArgIndex];
};
Param.prototype.toArgumentNameList = function(firstArgIndex, noDupCheck) {
  return ["param" + this.index];
};

// node_modules/ohm-js/src/pexprs-toDisplayString.js
PExpr.prototype.toDisplayString = abstract("toDisplayString");
Alt.prototype.toDisplayString = Seq.prototype.toDisplayString = function() {
  if (this.source) {
    return this.source.trimmed().contents;
  }
  return "[" + this.constructor.name + "]";
};
any.toDisplayString = end.toDisplayString = Iter.prototype.toDisplayString = Not.prototype.toDisplayString = Lookahead.prototype.toDisplayString = Lex.prototype.toDisplayString = Terminal.prototype.toDisplayString = Range.prototype.toDisplayString = Param.prototype.toDisplayString = function() {
  return this.toString();
};
Apply.prototype.toDisplayString = function() {
  if (this.args.length > 0) {
    const ps = this.args.map((arg) => arg.toDisplayString());
    return this.ruleName + "<" + ps.join(",") + ">";
  } else {
    return this.ruleName;
  }
};
UnicodeChar.prototype.toDisplayString = function() {
  return "Unicode [" + this.categoryOrProp + "] character";
};

// node_modules/ohm-js/src/Failure.js
function isValidType(type) {
  return type === "description" || type === "string" || type === "code";
}
var Failure = class _Failure {
  constructor(pexpr, text, type) {
    if (!isValidType(type)) {
      throw new Error("invalid Failure type: " + type);
    }
    this.pexpr = pexpr;
    this.text = text;
    this.type = type;
    this.fluffy = false;
  }
  getPExpr() {
    return this.pexpr;
  }
  getText() {
    return this.text;
  }
  getType() {
    return this.type;
  }
  isDescription() {
    return this.type === "description";
  }
  isStringTerminal() {
    return this.type === "string";
  }
  isCode() {
    return this.type === "code";
  }
  isFluffy() {
    return this.fluffy;
  }
  makeFluffy() {
    this.fluffy = true;
  }
  clearFluffy() {
    this.fluffy = false;
  }
  subsumes(that) {
    return this.getText() === that.getText() && this.type === that.type && (!this.isFluffy() || this.isFluffy() && that.isFluffy());
  }
  toString() {
    return this.type === "string" ? JSON.stringify(this.getText()) : this.getText();
  }
  clone() {
    const failure = new _Failure(this.pexpr, this.text, this.type);
    if (this.isFluffy()) {
      failure.makeFluffy();
    }
    return failure;
  }
  toKey() {
    return this.toString() + "#" + this.type;
  }
};

// node_modules/ohm-js/src/pexprs-toFailure.js
PExpr.prototype.toFailure = abstract("toFailure");
any.toFailure = function(grammar2) {
  return new Failure(this, "any object", "description");
};
end.toFailure = function(grammar2) {
  return new Failure(this, "end of input", "description");
};
Terminal.prototype.toFailure = function(grammar2) {
  return new Failure(this, this.obj, "string");
};
Range.prototype.toFailure = function(grammar2) {
  return new Failure(this, JSON.stringify(this.from) + ".." + JSON.stringify(this.to), "code");
};
Not.prototype.toFailure = function(grammar2) {
  const description = this.expr === any ? "nothing" : "not " + this.expr.toFailure(grammar2);
  return new Failure(this, description, "description");
};
Lookahead.prototype.toFailure = function(grammar2) {
  return this.expr.toFailure(grammar2);
};
Apply.prototype.toFailure = function(grammar2) {
  let { description } = grammar2.rules[this.ruleName];
  if (!description) {
    const article = /^[aeiouAEIOU]/.test(this.ruleName) ? "an" : "a";
    description = article + " " + this.ruleName;
  }
  return new Failure(this, description, "description");
};
UnicodeChar.prototype.toFailure = function(grammar2) {
  return new Failure(this, "a Unicode [" + this.categoryOrProp + "] character", "description");
};
Alt.prototype.toFailure = function(grammar2) {
  const fs = this.terms.map((t) => t.toFailure(grammar2));
  const description = "(" + fs.join(" or ") + ")";
  return new Failure(this, description, "description");
};
Seq.prototype.toFailure = function(grammar2) {
  const fs = this.factors.map((f) => f.toFailure(grammar2));
  const description = "(" + fs.join(" ") + ")";
  return new Failure(this, description, "description");
};
Iter.prototype.toFailure = function(grammar2) {
  const description = "(" + this.expr.toFailure(grammar2) + this.operator + ")";
  return new Failure(this, description, "description");
};

// node_modules/ohm-js/src/pexprs-toString.js
PExpr.prototype.toString = abstract("toString");
any.toString = function() {
  return "any";
};
end.toString = function() {
  return "end";
};
Terminal.prototype.toString = function() {
  return JSON.stringify(this.obj);
};
Range.prototype.toString = function() {
  return JSON.stringify(this.from) + ".." + JSON.stringify(this.to);
};
Param.prototype.toString = function() {
  return "$" + this.index;
};
Lex.prototype.toString = function() {
  return "#(" + this.expr.toString() + ")";
};
Alt.prototype.toString = function() {
  return this.terms.length === 1 ? this.terms[0].toString() : "(" + this.terms.map((term) => term.toString()).join(" | ") + ")";
};
Seq.prototype.toString = function() {
  return this.factors.length === 1 ? this.factors[0].toString() : "(" + this.factors.map((factor) => factor.toString()).join(" ") + ")";
};
Iter.prototype.toString = function() {
  return this.expr + this.operator;
};
Not.prototype.toString = function() {
  return "~" + this.expr;
};
Lookahead.prototype.toString = function() {
  return "&" + this.expr;
};
Apply.prototype.toString = function() {
  if (this.args.length > 0) {
    const ps = this.args.map((arg) => arg.toString());
    return this.ruleName + "<" + ps.join(",") + ">";
  } else {
    return this.ruleName;
  }
};
UnicodeChar.prototype.toString = function() {
  return "\\p{" + this.categoryOrProp + "}";
};

// node_modules/ohm-js/src/CaseInsensitiveTerminal.js
var CaseInsensitiveTerminal = class _CaseInsensitiveTerminal extends PExpr {
  constructor(param) {
    super();
    this.obj = param;
  }
  _getString(state) {
    const terminal = state.currentApplication().args[this.obj.index];
    assert(terminal instanceof Terminal, "expected a Terminal expression");
    return terminal.obj;
  }
  // Implementation of the PExpr API
  allowsSkippingPrecedingSpace() {
    return true;
  }
  eval(state) {
    const { inputStream } = state;
    const origPos = inputStream.pos;
    const matchStr = this._getString(state);
    if (!inputStream.matchString(matchStr, true)) {
      state.processFailure(origPos, this);
      return false;
    } else {
      state.pushBinding(new TerminalNode(matchStr.length), origPos);
      return true;
    }
  }
  getArity() {
    return 1;
  }
  substituteParams(actuals) {
    return new _CaseInsensitiveTerminal(this.obj.substituteParams(actuals));
  }
  toDisplayString() {
    return this.obj.toDisplayString() + " (case-insensitive)";
  }
  toFailure(grammar2) {
    return new Failure(
      this,
      this.obj.toFailure(grammar2) + " (case-insensitive)",
      "description"
    );
  }
  _isNullable(grammar2, memo) {
    return this.obj._isNullable(grammar2, memo);
  }
};

// node_modules/ohm-js/src/MatchState.js
var builtInApplySyntacticBody;
awaitBuiltInRules((builtInRules) => {
  builtInApplySyntacticBody = builtInRules.rules.applySyntactic.body;
});
var applySpaces = new Apply("spaces");
var MatchState = class {
  constructor(matcher, startExpr, optPositionToRecordFailures) {
    this.matcher = matcher;
    this.startExpr = startExpr;
    this.grammar = matcher.grammar;
    this.input = matcher.getInput();
    this.inputStream = new InputStream(this.input);
    this.memoTable = matcher._memoTable;
    this.userData = void 0;
    this.doNotMemoize = false;
    this._bindings = [];
    this._bindingOffsets = [];
    this._applicationStack = [];
    this._posStack = [0];
    this.inLexifiedContextStack = [false];
    this.rightmostFailurePosition = -1;
    this._rightmostFailurePositionStack = [];
    this._recordedFailuresStack = [];
    if (optPositionToRecordFailures !== void 0) {
      this.positionToRecordFailures = optPositionToRecordFailures;
      this.recordedFailures = /* @__PURE__ */ Object.create(null);
    }
  }
  posToOffset(pos) {
    return pos - this._posStack[this._posStack.length - 1];
  }
  enterApplication(posInfo, app) {
    this._posStack.push(this.inputStream.pos);
    this._applicationStack.push(app);
    this.inLexifiedContextStack.push(false);
    posInfo.enter(app);
    this._rightmostFailurePositionStack.push(this.rightmostFailurePosition);
    this.rightmostFailurePosition = -1;
  }
  exitApplication(posInfo, optNode) {
    const origPos = this._posStack.pop();
    this._applicationStack.pop();
    this.inLexifiedContextStack.pop();
    posInfo.exit();
    this.rightmostFailurePosition = Math.max(
      this.rightmostFailurePosition,
      this._rightmostFailurePositionStack.pop()
    );
    if (optNode) {
      this.pushBinding(optNode, origPos);
    }
  }
  enterLexifiedContext() {
    this.inLexifiedContextStack.push(true);
  }
  exitLexifiedContext() {
    this.inLexifiedContextStack.pop();
  }
  currentApplication() {
    return this._applicationStack[this._applicationStack.length - 1];
  }
  inSyntacticContext() {
    const currentApplication = this.currentApplication();
    if (currentApplication) {
      return currentApplication.isSyntactic() && !this.inLexifiedContext();
    } else {
      return this.startExpr.factors[0].isSyntactic();
    }
  }
  inLexifiedContext() {
    return this.inLexifiedContextStack[this.inLexifiedContextStack.length - 1];
  }
  skipSpaces() {
    this.pushFailuresInfo();
    this.eval(applySpaces);
    this.popBinding();
    this.popFailuresInfo();
    return this.inputStream.pos;
  }
  skipSpacesIfInSyntacticContext() {
    return this.inSyntacticContext() ? this.skipSpaces() : this.inputStream.pos;
  }
  maybeSkipSpacesBefore(expr) {
    if (expr.allowsSkippingPrecedingSpace() && expr !== applySpaces) {
      return this.skipSpacesIfInSyntacticContext();
    } else {
      return this.inputStream.pos;
    }
  }
  pushBinding(node, origPos) {
    this._bindings.push(node);
    this._bindingOffsets.push(this.posToOffset(origPos));
  }
  popBinding() {
    this._bindings.pop();
    this._bindingOffsets.pop();
  }
  numBindings() {
    return this._bindings.length;
  }
  truncateBindings(newLength) {
    while (this._bindings.length > newLength) {
      this.popBinding();
    }
  }
  getCurrentPosInfo() {
    return this.getPosInfo(this.inputStream.pos);
  }
  getPosInfo(pos) {
    let posInfo = this.memoTable[pos];
    if (!posInfo) {
      posInfo = this.memoTable[pos] = new PosInfo();
    }
    return posInfo;
  }
  processFailure(pos, expr) {
    this.rightmostFailurePosition = Math.max(this.rightmostFailurePosition, pos);
    if (this.recordedFailures && pos === this.positionToRecordFailures) {
      const app = this.currentApplication();
      if (app) {
        expr = expr.substituteParams(app.args);
      } else {
      }
      this.recordFailure(expr.toFailure(this.grammar), false);
    }
  }
  recordFailure(failure, shouldCloneIfNew) {
    const key = failure.toKey();
    if (!this.recordedFailures[key]) {
      this.recordedFailures[key] = shouldCloneIfNew ? failure.clone() : failure;
    } else if (this.recordedFailures[key].isFluffy() && !failure.isFluffy()) {
      this.recordedFailures[key].clearFluffy();
    }
  }
  recordFailures(failures, shouldCloneIfNew) {
    Object.keys(failures).forEach((key) => {
      this.recordFailure(failures[key], shouldCloneIfNew);
    });
  }
  cloneRecordedFailures() {
    if (!this.recordedFailures) {
      return void 0;
    }
    const ans = /* @__PURE__ */ Object.create(null);
    Object.keys(this.recordedFailures).forEach((key) => {
      ans[key] = this.recordedFailures[key].clone();
    });
    return ans;
  }
  getRightmostFailurePosition() {
    return this.rightmostFailurePosition;
  }
  _getRightmostFailureOffset() {
    return this.rightmostFailurePosition >= 0 ? this.posToOffset(this.rightmostFailurePosition) : -1;
  }
  // Returns the memoized trace entry for `expr` at `pos`, if one exists, `null` otherwise.
  getMemoizedTraceEntry(pos, expr) {
    const posInfo = this.memoTable[pos];
    if (posInfo && expr instanceof Apply) {
      const memoRec = posInfo.memo[expr.toMemoKey()];
      if (memoRec && memoRec.traceEntry) {
        const entry = memoRec.traceEntry.cloneWithExpr(expr);
        entry.isMemoized = true;
        return entry;
      }
    }
    return null;
  }
  // Returns a new trace entry, with the currently active trace array as its children.
  getTraceEntry(pos, expr, succeeded, bindings) {
    if (expr instanceof Apply) {
      const app = this.currentApplication();
      const actuals = app ? app.args : [];
      expr = expr.substituteParams(actuals);
    }
    return this.getMemoizedTraceEntry(pos, expr) || new Trace(this.input, pos, this.inputStream.pos, expr, succeeded, bindings, this.trace);
  }
  isTracing() {
    return !!this.trace;
  }
  hasNecessaryInfo(memoRec) {
    if (this.trace && !memoRec.traceEntry) {
      return false;
    }
    if (this.recordedFailures && this.inputStream.pos + memoRec.rightmostFailureOffset === this.positionToRecordFailures) {
      return !!memoRec.failuresAtRightmostPosition;
    }
    return true;
  }
  useMemoizedResult(origPos, memoRec) {
    if (this.trace) {
      this.trace.push(memoRec.traceEntry);
    }
    const memoRecRightmostFailurePosition = this.inputStream.pos + memoRec.rightmostFailureOffset;
    this.rightmostFailurePosition = Math.max(
      this.rightmostFailurePosition,
      memoRecRightmostFailurePosition
    );
    if (this.recordedFailures && this.positionToRecordFailures === memoRecRightmostFailurePosition && memoRec.failuresAtRightmostPosition) {
      this.recordFailures(memoRec.failuresAtRightmostPosition, true);
    }
    this.inputStream.examinedLength = Math.max(
      this.inputStream.examinedLength,
      memoRec.examinedLength + origPos
    );
    if (memoRec.value) {
      this.inputStream.pos += memoRec.matchLength;
      this.pushBinding(memoRec.value, origPos);
      return true;
    }
    return false;
  }
  // Evaluate `expr` and return `true` if it succeeded, `false` otherwise. On success, `bindings`
  // will have `expr.getArity()` more elements than before, and the input stream's position may
  // have increased. On failure, `bindings` and position will be unchanged.
  eval(expr) {
    const { inputStream } = this;
    const origNumBindings = this._bindings.length;
    const origUserData = this.userData;
    let origRecordedFailures;
    if (this.recordedFailures) {
      origRecordedFailures = this.recordedFailures;
      this.recordedFailures = /* @__PURE__ */ Object.create(null);
    }
    const origPos = inputStream.pos;
    const memoPos = this.maybeSkipSpacesBefore(expr);
    let origTrace;
    if (this.trace) {
      origTrace = this.trace;
      this.trace = [];
    }
    const ans = expr.eval(this);
    if (this.trace) {
      const bindings = this._bindings.slice(origNumBindings);
      const traceEntry = this.getTraceEntry(memoPos, expr, ans, bindings);
      traceEntry.isImplicitSpaces = expr === applySpaces;
      traceEntry.isRootNode = expr === this.startExpr;
      origTrace.push(traceEntry);
      this.trace = origTrace;
    }
    if (ans) {
      if (this.recordedFailures && inputStream.pos === this.positionToRecordFailures) {
        Object.keys(this.recordedFailures).forEach((key) => {
          this.recordedFailures[key].makeFluffy();
        });
      }
    } else {
      inputStream.pos = origPos;
      this.truncateBindings(origNumBindings);
      this.userData = origUserData;
    }
    if (this.recordedFailures) {
      this.recordFailures(origRecordedFailures, false);
    }
    if (expr === builtInApplySyntacticBody) {
      this.skipSpaces();
    }
    return ans;
  }
  getMatchResult() {
    this.grammar._setUpMatchState(this);
    this.eval(this.startExpr);
    let rightmostFailures;
    if (this.recordedFailures) {
      rightmostFailures = Object.keys(this.recordedFailures).map(
        (key) => this.recordedFailures[key]
      );
    }
    const cst = this._bindings[0];
    if (cst) {
      cst.grammar = this.grammar;
    }
    return new MatchResult(
      this.matcher,
      this.input,
      this.startExpr,
      cst,
      this._bindingOffsets[0],
      this.rightmostFailurePosition,
      rightmostFailures
    );
  }
  getTrace() {
    this.trace = [];
    const matchResult = this.getMatchResult();
    const rootTrace = this.trace[this.trace.length - 1];
    rootTrace.result = matchResult;
    return rootTrace;
  }
  pushFailuresInfo() {
    this._rightmostFailurePositionStack.push(this.rightmostFailurePosition);
    this._recordedFailuresStack.push(this.recordedFailures);
  }
  popFailuresInfo() {
    this.rightmostFailurePosition = this._rightmostFailurePositionStack.pop();
    this.recordedFailures = this._recordedFailuresStack.pop();
  }
};

// node_modules/ohm-js/src/Matcher.js
var Matcher = class {
  constructor(grammar2) {
    this.grammar = grammar2;
    this._memoTable = [];
    this._input = "";
    this._isMemoTableStale = false;
  }
  _resetMemoTable() {
    this._memoTable = [];
    this._isMemoTableStale = false;
  }
  getInput() {
    return this._input;
  }
  setInput(str) {
    if (this._input !== str) {
      this.replaceInputRange(0, this._input.length, str);
    }
    return this;
  }
  replaceInputRange(startIdx, endIdx, str) {
    const prevInput = this._input;
    const memoTable = this._memoTable;
    if (startIdx < 0 || startIdx > prevInput.length || endIdx < 0 || endIdx > prevInput.length || startIdx > endIdx) {
      throw new Error("Invalid indices: " + startIdx + " and " + endIdx);
    }
    this._input = prevInput.slice(0, startIdx) + str + prevInput.slice(endIdx);
    if (this._input !== prevInput && memoTable.length > 0) {
      this._isMemoTableStale = true;
    }
    const restOfMemoTable = memoTable.slice(endIdx);
    memoTable.length = startIdx;
    for (let idx = 0; idx < str.length; idx++) {
      memoTable.push(void 0);
    }
    for (const posInfo of restOfMemoTable) {
      memoTable.push(posInfo);
    }
    for (let pos = 0; pos < startIdx; pos++) {
      const posInfo = memoTable[pos];
      if (posInfo) {
        posInfo.clearObsoleteEntries(pos, startIdx);
      }
    }
    return this;
  }
  match(optStartApplicationStr, options = { incremental: true }) {
    return this._match(this._getStartExpr(optStartApplicationStr), {
      incremental: options.incremental,
      tracing: false
    });
  }
  trace(optStartApplicationStr, options = { incremental: true }) {
    return this._match(this._getStartExpr(optStartApplicationStr), {
      incremental: options.incremental,
      tracing: true
    });
  }
  _match(startExpr, options = {}) {
    const opts = {
      tracing: false,
      incremental: true,
      positionToRecordFailures: void 0,
      ...options
    };
    if (!opts.incremental) {
      this._resetMemoTable();
    } else if (this._isMemoTableStale && !this.grammar.supportsIncrementalParsing) {
      throw grammarDoesNotSupportIncrementalParsing(this.grammar);
    }
    const state = new MatchState(this, startExpr, opts.positionToRecordFailures);
    return opts.tracing ? state.getTrace() : state.getMatchResult();
  }
  /*
    Returns the starting expression for this Matcher's associated grammar. If
    `optStartApplicationStr` is specified, it is a string expressing a rule application in the
    grammar. If not specified, the grammar's default start rule will be used.
  */
  _getStartExpr(optStartApplicationStr) {
    const applicationStr = optStartApplicationStr || this.grammar.defaultStartRule;
    if (!applicationStr) {
      throw new Error("Missing start rule argument -- the grammar has no default start rule.");
    }
    const startApp = this.grammar.parseApplication(applicationStr);
    return new Seq([startApp, end]);
  }
};

// node_modules/ohm-js/src/Semantics.js
var globalActionStack = [];
var hasOwnProperty = (x, prop) => Object.prototype.hasOwnProperty.call(x, prop);
var Wrapper = class {
  constructor(node, sourceInterval, baseInterval) {
    this._node = node;
    this.source = sourceInterval;
    this._baseInterval = baseInterval;
    if (node.isNonterminal()) {
      assert(sourceInterval === baseInterval);
    }
    this._childWrappers = [];
  }
  _forgetMemoizedResultFor(attributeName) {
    delete this._node[this._semantics.attributeKeys[attributeName]];
    this.children.forEach((child) => {
      child._forgetMemoizedResultFor(attributeName);
    });
  }
  // Returns the wrapper of the specified child node. Child wrappers are created lazily and
  // cached in the parent wrapper's `_childWrappers` instance variable.
  child(idx) {
    if (!(0 <= idx && idx < this._node.numChildren())) {
      return void 0;
    }
    let childWrapper = this._childWrappers[idx];
    if (!childWrapper) {
      const childNode = this._node.childAt(idx);
      const offset = this._node.childOffsets[idx];
      const source = this._baseInterval.subInterval(offset, childNode.matchLength);
      const base = childNode.isNonterminal() ? source : this._baseInterval;
      childWrapper = this._childWrappers[idx] = this._semantics.wrap(childNode, source, base);
    }
    return childWrapper;
  }
  // Returns an array containing the wrappers of all of the children of the node associated
  // with this wrapper.
  _children() {
    for (let idx = 0; idx < this._node.numChildren(); idx++) {
      this.child(idx);
    }
    return this._childWrappers;
  }
  // Returns `true` if the CST node associated with this wrapper corresponds to an iteration
  // expression, i.e., a Kleene-*, Kleene-+, or an optional. Returns `false` otherwise.
  isIteration() {
    return this._node.isIteration();
  }
  // Returns `true` if the CST node associated with this wrapper is a terminal node, `false`
  // otherwise.
  isTerminal() {
    return this._node.isTerminal();
  }
  // Returns `true` if the CST node associated with this wrapper is a nonterminal node, `false`
  // otherwise.
  isNonterminal() {
    return this._node.isNonterminal();
  }
  // Returns `true` if the CST node associated with this wrapper is a nonterminal node
  // corresponding to a syntactic rule, `false` otherwise.
  isSyntactic() {
    return this.isNonterminal() && this._node.isSyntactic();
  }
  // Returns `true` if the CST node associated with this wrapper is a nonterminal node
  // corresponding to a lexical rule, `false` otherwise.
  isLexical() {
    return this.isNonterminal() && this._node.isLexical();
  }
  // Returns `true` if the CST node associated with this wrapper is an iterator node
  // having either one or no child (? operator), `false` otherwise.
  // Otherwise, throws an exception.
  isOptional() {
    return this._node.isOptional();
  }
  // Create a new _iter wrapper in the same semantics as this wrapper.
  iteration(optChildWrappers) {
    const childWrappers = optChildWrappers || [];
    const childNodes = childWrappers.map((c) => c._node);
    const iter = new IterationNode(childNodes, [], -1, false);
    const wrapper = this._semantics.wrap(iter, null, null);
    wrapper._childWrappers = childWrappers;
    return wrapper;
  }
  // Returns an array containing the children of this CST node.
  get children() {
    return this._children();
  }
  // Returns the name of grammar rule that created this CST node.
  get ctorName() {
    return this._node.ctorName;
  }
  // Returns the number of children of this CST node.
  get numChildren() {
    return this._node.numChildren();
  }
  // Returns the contents of the input stream consumed by this CST node.
  get sourceString() {
    return this.source.contents;
  }
};
var Semantics = class _Semantics {
  constructor(grammar2, superSemantics) {
    const self = this;
    this.grammar = grammar2;
    this.checkedActionDicts = false;
    this.Wrapper = class extends (superSemantics ? superSemantics.Wrapper : Wrapper) {
      constructor(node, sourceInterval, baseInterval) {
        super(node, sourceInterval, baseInterval);
        self.checkActionDictsIfHaventAlready();
        this._semantics = self;
      }
      toString() {
        return "[semantics wrapper for " + self.grammar.name + "]";
      }
    };
    this.super = superSemantics;
    if (superSemantics) {
      if (!(grammar2.equals(this.super.grammar) || grammar2._inheritsFrom(this.super.grammar))) {
        throw new Error(
          "Cannot extend a semantics for grammar '" + this.super.grammar.name + "' for use with grammar '" + grammar2.name + "' (not a sub-grammar)"
        );
      }
      this.operations = Object.create(this.super.operations);
      this.attributes = Object.create(this.super.attributes);
      this.attributeKeys = /* @__PURE__ */ Object.create(null);
      for (const attributeName in this.attributes) {
        Object.defineProperty(this.attributeKeys, attributeName, {
          value: uniqueId(attributeName)
        });
      }
    } else {
      this.operations = /* @__PURE__ */ Object.create(null);
      this.attributes = /* @__PURE__ */ Object.create(null);
      this.attributeKeys = /* @__PURE__ */ Object.create(null);
    }
  }
  toString() {
    return "[semantics for " + this.grammar.name + "]";
  }
  checkActionDictsIfHaventAlready() {
    if (!this.checkedActionDicts) {
      this.checkActionDicts();
      this.checkedActionDicts = true;
    }
  }
  // Checks that the action dictionaries for all operations and attributes in this semantics,
  // including the ones that were inherited from the super-semantics, agree with the grammar.
  // Throws an exception if one or more of them doesn't.
  checkActionDicts() {
    let name;
    for (name in this.operations) {
      this.operations[name].checkActionDict(this.grammar);
    }
    for (name in this.attributes) {
      this.attributes[name].checkActionDict(this.grammar);
    }
  }
  toRecipe(semanticsOnly) {
    function hasSuperSemantics(s) {
      return s.super !== _Semantics.BuiltInSemantics._getSemantics();
    }
    let str = "(function(g) {\n";
    if (hasSuperSemantics(this)) {
      str += "  var semantics = " + this.super.toRecipe(true) + "(g";
      const superSemanticsGrammar = this.super.grammar;
      let relatedGrammar = this.grammar;
      while (relatedGrammar !== superSemanticsGrammar) {
        str += ".superGrammar";
        relatedGrammar = relatedGrammar.superGrammar;
      }
      str += ");\n";
      str += "  return g.extendSemantics(semantics)";
    } else {
      str += "  return g.createSemantics()";
    }
    ["Operation", "Attribute"].forEach((type) => {
      const semanticOperations = this[type.toLowerCase() + "s"];
      Object.keys(semanticOperations).forEach((name) => {
        const { actionDict, formals, builtInDefault } = semanticOperations[name];
        let signature = name;
        if (formals.length > 0) {
          signature += "(" + formals.join(", ") + ")";
        }
        let method;
        if (hasSuperSemantics(this) && this.super[type.toLowerCase() + "s"][name]) {
          method = "extend" + type;
        } else {
          method = "add" + type;
        }
        str += "\n    ." + method + "(" + JSON.stringify(signature) + ", {";
        const srcArray = [];
        Object.keys(actionDict).forEach((actionName) => {
          if (actionDict[actionName] !== builtInDefault) {
            let source = actionDict[actionName].toString().trim();
            source = source.replace(/^.*\(/, "function(");
            srcArray.push("\n      " + JSON.stringify(actionName) + ": " + source);
          }
        });
        str += srcArray.join(",") + "\n    })";
      });
    });
    str += ";\n  })";
    if (!semanticsOnly) {
      str = "(function() {\n  var grammar = this.fromRecipe(" + this.grammar.toRecipe() + ");\n  var semantics = " + str + "(grammar);\n  return semantics;\n});\n";
    }
    return str;
  }
  addOperationOrAttribute(type, signature, actionDict) {
    const typePlural = type + "s";
    const parsedNameAndFormalArgs = parseSignature(signature, type);
    const { name } = parsedNameAndFormalArgs;
    const { formals } = parsedNameAndFormalArgs;
    this.assertNewName(name, type);
    const builtInDefault = newDefaultAction(type, name, doIt);
    const realActionDict = { _default: builtInDefault };
    Object.keys(actionDict).forEach((name2) => {
      realActionDict[name2] = actionDict[name2];
    });
    const entry = type === "operation" ? new Operation(name, formals, realActionDict, builtInDefault) : new Attribute(name, realActionDict, builtInDefault);
    entry.checkActionDict(this.grammar);
    this[typePlural][name] = entry;
    function doIt(...args) {
      const thisThing = this._semantics[typePlural][name];
      if (arguments.length !== thisThing.formals.length) {
        throw new Error(
          "Invalid number of arguments passed to " + name + " " + type + " (expected " + thisThing.formals.length + ", got " + arguments.length + ")"
        );
      }
      const argsObj = /* @__PURE__ */ Object.create(null);
      for (const [idx, val] of Object.entries(args)) {
        const formal = thisThing.formals[idx];
        argsObj[formal] = val;
      }
      const oldArgs = this.args;
      this.args = argsObj;
      const ans = thisThing.execute(this._semantics, this);
      this.args = oldArgs;
      return ans;
    }
    if (type === "operation") {
      this.Wrapper.prototype[name] = doIt;
      this.Wrapper.prototype[name].toString = function() {
        return "[" + name + " operation]";
      };
    } else {
      Object.defineProperty(this.Wrapper.prototype, name, {
        get: doIt,
        configurable: true
        // So the property can be deleted.
      });
      Object.defineProperty(this.attributeKeys, name, {
        value: uniqueId(name)
      });
    }
  }
  extendOperationOrAttribute(type, name, actionDict) {
    const typePlural = type + "s";
    parseSignature(name, "attribute");
    if (!(this.super && name in this.super[typePlural])) {
      throw new Error(
        "Cannot extend " + type + " '" + name + "': did not inherit an " + type + " with that name"
      );
    }
    if (hasOwnProperty(this[typePlural], name)) {
      throw new Error("Cannot extend " + type + " '" + name + "' again");
    }
    const inheritedFormals = this[typePlural][name].formals;
    const inheritedActionDict = this[typePlural][name].actionDict;
    const newActionDict = Object.create(inheritedActionDict);
    Object.keys(actionDict).forEach((name2) => {
      newActionDict[name2] = actionDict[name2];
    });
    this[typePlural][name] = type === "operation" ? new Operation(name, inheritedFormals, newActionDict) : new Attribute(name, newActionDict);
    this[typePlural][name].checkActionDict(this.grammar);
  }
  assertNewName(name, type) {
    if (hasOwnProperty(Wrapper.prototype, name)) {
      throw new Error("Cannot add " + type + " '" + name + "': that's a reserved name");
    }
    if (name in this.operations) {
      throw new Error(
        "Cannot add " + type + " '" + name + "': an operation with that name already exists"
      );
    }
    if (name in this.attributes) {
      throw new Error(
        "Cannot add " + type + " '" + name + "': an attribute with that name already exists"
      );
    }
  }
  // Returns a wrapper for the given CST `node` in this semantics.
  // If `node` is already a wrapper, returns `node` itself. 
  wrap(node, source, optBaseInterval) {
    const baseInterval = optBaseInterval || source;
    return node instanceof this.Wrapper ? node : new this.Wrapper(node, source, baseInterval);
  }
};
function parseSignature(signature, type) {
  if (!Semantics.prototypeGrammar) {
    assert(signature.indexOf("(") === -1);
    return {
      name: signature,
      formals: []
    };
  }
  const r = Semantics.prototypeGrammar.match(
    signature,
    type === "operation" ? "OperationSignature" : "AttributeSignature"
  );
  if (r.failed()) {
    throw new Error(r.message);
  }
  return Semantics.prototypeGrammarSemantics(r).parse();
}
function newDefaultAction(type, name, doIt) {
  return function(...children) {
    const thisThing = this._semantics.operations[name] || this._semantics.attributes[name];
    const args = thisThing.formals.map((formal) => this.args[formal]);
    if (!this.isIteration() && children.length === 1) {
      return doIt.apply(children[0], args);
    } else {
      throw missingSemanticAction(this.ctorName, name, type, globalActionStack);
    }
  };
}
Semantics.createSemantics = function(grammar2, optSuperSemantics) {
  const s = new Semantics(
    grammar2,
    optSuperSemantics !== void 0 ? optSuperSemantics : Semantics.BuiltInSemantics._getSemantics()
  );
  const proxy = function ASemantics(matchResult) {
    if (!(matchResult instanceof MatchResult)) {
      throw new TypeError(
        "Semantics expected a MatchResult, but got " + unexpectedObjToString(matchResult)
      );
    }
    if (matchResult.failed()) {
      throw new TypeError("cannot apply Semantics to " + matchResult.toString());
    }
    const cst = matchResult._cst;
    if (cst.grammar !== grammar2) {
      throw new Error(
        "Cannot use a MatchResult from grammar '" + cst.grammar.name + "' with a semantics for '" + grammar2.name + "'"
      );
    }
    const inputStream = new InputStream(matchResult.input);
    return s.wrap(cst, inputStream.interval(matchResult._cstOffset, matchResult.input.length));
  };
  proxy.addOperation = function(signature, actionDict) {
    s.addOperationOrAttribute("operation", signature, actionDict);
    return proxy;
  };
  proxy.extendOperation = function(name, actionDict) {
    s.extendOperationOrAttribute("operation", name, actionDict);
    return proxy;
  };
  proxy.addAttribute = function(name, actionDict) {
    s.addOperationOrAttribute("attribute", name, actionDict);
    return proxy;
  };
  proxy.extendAttribute = function(name, actionDict) {
    s.extendOperationOrAttribute("attribute", name, actionDict);
    return proxy;
  };
  proxy._getActionDict = function(operationOrAttributeName) {
    const action = s.operations[operationOrAttributeName] || s.attributes[operationOrAttributeName];
    if (!action) {
      throw new Error(
        '"' + operationOrAttributeName + '" is not a valid operation or attribute name in this semantics for "' + grammar2.name + '"'
      );
    }
    return action.actionDict;
  };
  proxy._remove = function(operationOrAttributeName) {
    let semantic;
    if (operationOrAttributeName in s.operations) {
      semantic = s.operations[operationOrAttributeName];
      delete s.operations[operationOrAttributeName];
    } else if (operationOrAttributeName in s.attributes) {
      semantic = s.attributes[operationOrAttributeName];
      delete s.attributes[operationOrAttributeName];
    }
    delete s.Wrapper.prototype[operationOrAttributeName];
    return semantic;
  };
  proxy.getOperationNames = function() {
    return Object.keys(s.operations);
  };
  proxy.getAttributeNames = function() {
    return Object.keys(s.attributes);
  };
  proxy.getGrammar = function() {
    return s.grammar;
  };
  proxy.toRecipe = function(semanticsOnly) {
    return s.toRecipe(semanticsOnly);
  };
  proxy.toString = s.toString.bind(s);
  proxy._getSemantics = function() {
    return s;
  };
  return proxy;
};
var Operation = class {
  constructor(name, formals, actionDict, builtInDefault) {
    this.name = name;
    this.formals = formals;
    this.actionDict = actionDict;
    this.builtInDefault = builtInDefault;
  }
  checkActionDict(grammar2) {
    grammar2._checkTopDownActionDict(this.typeName, this.name, this.actionDict);
  }
  // Execute this operation on the CST node associated with `nodeWrapper` in the context of the
  // given Semantics instance.
  execute(semantics2, nodeWrapper) {
    try {
      const { ctorName } = nodeWrapper._node;
      let actionFn = this.actionDict[ctorName];
      if (actionFn) {
        globalActionStack.push([this, ctorName]);
        return actionFn.apply(nodeWrapper, nodeWrapper._children());
      }
      if (nodeWrapper.isNonterminal()) {
        actionFn = this.actionDict._nonterminal;
        if (actionFn) {
          globalActionStack.push([this, "_nonterminal", ctorName]);
          return actionFn.apply(nodeWrapper, nodeWrapper._children());
        }
      }
      globalActionStack.push([this, "default action", ctorName]);
      return this.actionDict._default.apply(nodeWrapper, nodeWrapper._children());
    } finally {
      globalActionStack.pop();
    }
  }
};
Operation.prototype.typeName = "operation";
var Attribute = class extends Operation {
  constructor(name, actionDict, builtInDefault) {
    super(name, [], actionDict, builtInDefault);
  }
  execute(semantics2, nodeWrapper) {
    const node = nodeWrapper._node;
    const key = semantics2.attributeKeys[this.name];
    if (!hasOwnProperty(node, key)) {
      node[key] = Operation.prototype.execute.call(this, semantics2, nodeWrapper);
    }
    return node[key];
  }
};
Attribute.prototype.typeName = "attribute";

// node_modules/ohm-js/src/Grammar.js
var SPECIAL_ACTION_NAMES = ["_iter", "_terminal", "_nonterminal", "_default"];
function getSortedRuleValues(grammar2) {
  return Object.keys(grammar2.rules).sort().map((name) => grammar2.rules[name]);
}
var jsonToJS = (str) => str.replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
var ohmGrammar;
var buildGrammar;
var Grammar = class _Grammar {
  constructor(name, superGrammar, rules, optDefaultStartRule) {
    this.name = name;
    this.superGrammar = superGrammar;
    this.rules = rules;
    if (optDefaultStartRule) {
      if (!(optDefaultStartRule in rules)) {
        throw new Error(
          "Invalid start rule: '" + optDefaultStartRule + "' is not a rule in grammar '" + name + "'"
        );
      }
      this.defaultStartRule = optDefaultStartRule;
    }
    this._matchStateInitializer = void 0;
    this.supportsIncrementalParsing = true;
  }
  matcher() {
    return new Matcher(this);
  }
  // Return true if the grammar is a built-in grammar, otherwise false.
  // NOTE: This might give an unexpected result if called before BuiltInRules is defined!
  isBuiltIn() {
    return this === _Grammar.ProtoBuiltInRules || this === _Grammar.BuiltInRules;
  }
  equals(g) {
    if (this === g) {
      return true;
    }
    if (g == null || this.name !== g.name || this.defaultStartRule !== g.defaultStartRule || !(this.superGrammar === g.superGrammar || this.superGrammar.equals(g.superGrammar))) {
      return false;
    }
    const myRules = getSortedRuleValues(this);
    const otherRules = getSortedRuleValues(g);
    return myRules.length === otherRules.length && myRules.every((rule, i) => {
      return rule.description === otherRules[i].description && rule.formals.join(",") === otherRules[i].formals.join(",") && rule.body.toString() === otherRules[i].body.toString();
    });
  }
  match(input, optStartApplication) {
    const m = this.matcher();
    m.replaceInputRange(0, 0, input);
    return m.match(optStartApplication);
  }
  trace(input, optStartApplication) {
    const m = this.matcher();
    m.replaceInputRange(0, 0, input);
    return m.trace(optStartApplication);
  }
  createSemantics() {
    return Semantics.createSemantics(this);
  }
  extendSemantics(superSemantics) {
    return Semantics.createSemantics(this, superSemantics._getSemantics());
  }
  // Check that every key in `actionDict` corresponds to a semantic action, and that it maps to
  // a function of the correct arity. If not, throw an exception.
  _checkTopDownActionDict(what, name, actionDict) {
    const problems = [];
    for (const k in actionDict) {
      const v = actionDict[k];
      const isSpecialAction = SPECIAL_ACTION_NAMES.includes(k);
      if (!isSpecialAction && !(k in this.rules)) {
        problems.push(`'${k}' is not a valid semantic action for '${this.name}'`);
        continue;
      }
      if (typeof v !== "function") {
        problems.push(`'${k}' must be a function in an action dictionary for '${this.name}'`);
        continue;
      }
      const actual = v.length;
      const expected = this._topDownActionArity(k);
      if (actual !== expected) {
        let details;
        if (k === "_iter" || k === "_nonterminal") {
          details = `it should use a rest parameter, e.g. \`${k}(...children) {}\`. NOTE: this is new in Ohm v16 \u2014 see https://ohmjs.org/d/ati for details.`;
        } else {
          details = `expected ${expected}, got ${actual}`;
        }
        problems.push(`Semantic action '${k}' has the wrong arity: ${details}`);
      }
    }
    if (problems.length > 0) {
      const prettyProblems = problems.map((problem) => "- " + problem);
      const error = new Error(
        [
          `Found errors in the action dictionary of the '${name}' ${what}:`,
          ...prettyProblems
        ].join("\n")
      );
      error.problems = problems;
      throw error;
    }
  }
  // Return the expected arity for a semantic action named `actionName`, which
  // is either a rule name or a special action name like '_nonterminal'.
  _topDownActionArity(actionName) {
    return SPECIAL_ACTION_NAMES.includes(actionName) ? 0 : this.rules[actionName].body.getArity();
  }
  _inheritsFrom(grammar2) {
    let g = this.superGrammar;
    while (g) {
      if (g.equals(grammar2, true)) {
        return true;
      }
      g = g.superGrammar;
    }
    return false;
  }
  toRecipe(superGrammarExpr = void 0) {
    const metaInfo = {};
    if (this.source) {
      metaInfo.source = this.source.contents;
    }
    let startRule = null;
    if (this.defaultStartRule) {
      startRule = this.defaultStartRule;
    }
    const rules = {};
    Object.keys(this.rules).forEach((ruleName) => {
      const ruleInfo = this.rules[ruleName];
      const { body } = ruleInfo;
      const isDefinition = !this.superGrammar || !this.superGrammar.rules[ruleName];
      let operation;
      if (isDefinition) {
        operation = "define";
      } else {
        operation = body instanceof Extend ? "extend" : "override";
      }
      const metaInfo2 = {};
      if (ruleInfo.source && this.source) {
        const adjusted = ruleInfo.source.relativeTo(this.source);
        metaInfo2.sourceInterval = [adjusted.startIdx, adjusted.endIdx];
      }
      const description = isDefinition ? ruleInfo.description : null;
      const bodyRecipe = body.outputRecipe(ruleInfo.formals, this.source);
      rules[ruleName] = [
        operation,
        // "define"/"extend"/"override"
        metaInfo2,
        description,
        ruleInfo.formals,
        bodyRecipe
      ];
    });
    let superGrammarOutput = "null";
    if (superGrammarExpr) {
      superGrammarOutput = superGrammarExpr;
    } else if (this.superGrammar && !this.superGrammar.isBuiltIn()) {
      superGrammarOutput = this.superGrammar.toRecipe();
    }
    const recipeElements = [
      ...["grammar", metaInfo, this.name].map(JSON.stringify),
      superGrammarOutput,
      ...[startRule, rules].map(JSON.stringify)
    ];
    return jsonToJS(`[${recipeElements.join(",")}]`);
  }
  // TODO: Write the analog of these methods for inherited attributes.
  toOperationActionDictionaryTemplate() {
    return this._toOperationOrAttributeActionDictionaryTemplate();
  }
  toAttributeActionDictionaryTemplate() {
    return this._toOperationOrAttributeActionDictionaryTemplate();
  }
  _toOperationOrAttributeActionDictionaryTemplate() {
    const sb = new StringBuffer();
    sb.append("{");
    let first = true;
    for (const ruleName in this.rules) {
      const { body } = this.rules[ruleName];
      if (first) {
        first = false;
      } else {
        sb.append(",");
      }
      sb.append("\n");
      sb.append("  ");
      this.addSemanticActionTemplate(ruleName, body, sb);
    }
    sb.append("\n}");
    return sb.contents();
  }
  addSemanticActionTemplate(ruleName, body, sb) {
    sb.append(ruleName);
    sb.append(": function(");
    const arity = this._topDownActionArity(ruleName);
    sb.append(repeat("_", arity).join(", "));
    sb.append(") {\n");
    sb.append("  }");
  }
  // Parse a string which expresses a rule application in this grammar, and return the
  // resulting Apply node.
  parseApplication(str) {
    let app;
    if (str.indexOf("<") === -1) {
      app = new Apply(str);
    } else {
      const cst = ohmGrammar.match(str, "Base_application");
      app = buildGrammar(cst, {});
    }
    if (!(app.ruleName in this.rules)) {
      throw undeclaredRule(app.ruleName, this.name);
    }
    const { formals } = this.rules[app.ruleName];
    if (formals.length !== app.args.length) {
      const { source } = this.rules[app.ruleName];
      throw wrongNumberOfParameters(
        app.ruleName,
        formals.length,
        app.args.length,
        source
      );
    }
    return app;
  }
  _setUpMatchState(state) {
    if (this._matchStateInitializer) {
      this._matchStateInitializer(state);
    }
  }
};
Grammar.ProtoBuiltInRules = new Grammar(
  "ProtoBuiltInRules",
  // name
  void 0,
  // supergrammar
  {
    any: {
      body: any,
      formals: [],
      description: "any character",
      primitive: true
    },
    end: {
      body: end,
      formals: [],
      description: "end of input",
      primitive: true
    },
    caseInsensitive: {
      body: new CaseInsensitiveTerminal(new Param(0)),
      formals: ["str"],
      primitive: true
    },
    lower: {
      body: new UnicodeChar("Ll"),
      formals: [],
      description: "a lowercase letter",
      primitive: true
    },
    upper: {
      body: new UnicodeChar("Lu"),
      formals: [],
      description: "an uppercase letter",
      primitive: true
    },
    // Union of Lt (titlecase), Lm (modifier), and Lo (other), i.e. any letter not in Ll or Lu.
    unicodeLtmo: {
      body: new UnicodeChar("Ltmo"),
      formals: [],
      description: "a Unicode character in Lt, Lm, or Lo",
      primitive: true
    },
    // These rules are not truly primitive (they could be written in userland) but are defined
    // here for bootstrapping purposes.
    spaces: {
      body: new Star(new Apply("space")),
      formals: []
    },
    space: {
      body: new Range("\0", " "),
      formals: [],
      description: "a space"
    }
  }
);
Grammar.initApplicationParser = function(grammar2, builderFn) {
  ohmGrammar = grammar2;
  buildGrammar = builderFn;
};

// node_modules/ohm-js/src/GrammarDecl.js
var GrammarDecl = class {
  constructor(name) {
    this.name = name;
  }
  // Helpers
  sourceInterval(startIdx, endIdx) {
    return this.source.subInterval(startIdx, endIdx - startIdx);
  }
  ensureSuperGrammar() {
    if (!this.superGrammar) {
      this.withSuperGrammar(
        // I doubt anyone will ever try to declare a grammar called `BuiltInRules`. Still,
        // we should try to find a better way to do this.
        this.name === "BuiltInRules" ? Grammar.ProtoBuiltInRules : Grammar.BuiltInRules
      );
    }
    return this.superGrammar;
  }
  ensureSuperGrammarRuleForOverriding(name, source) {
    const ruleInfo = this.ensureSuperGrammar().rules[name];
    if (!ruleInfo) {
      throw cannotOverrideUndeclaredRule(name, this.superGrammar.name, source);
    }
    return ruleInfo;
  }
  installOverriddenOrExtendedRule(name, formals, body, source) {
    const duplicateParameterNames2 = getDuplicates(formals);
    if (duplicateParameterNames2.length > 0) {
      throw duplicateParameterNames(name, duplicateParameterNames2, source);
    }
    const ruleInfo = this.ensureSuperGrammar().rules[name];
    const expectedFormals = ruleInfo.formals;
    const expectedNumFormals = expectedFormals ? expectedFormals.length : 0;
    if (formals.length !== expectedNumFormals) {
      throw wrongNumberOfParameters(name, expectedNumFormals, formals.length, source);
    }
    return this.install(name, formals, body, ruleInfo.description, source);
  }
  install(name, formals, body, description, source, primitive = false) {
    this.rules[name] = {
      body: body.introduceParams(formals),
      formals,
      description,
      source,
      primitive
    };
    return this;
  }
  // Stuff that you should only do once
  withSuperGrammar(superGrammar) {
    if (this.superGrammar) {
      throw new Error("the super grammar of a GrammarDecl cannot be set more than once");
    }
    this.superGrammar = superGrammar;
    this.rules = Object.create(superGrammar.rules);
    if (!superGrammar.isBuiltIn()) {
      this.defaultStartRule = superGrammar.defaultStartRule;
    }
    return this;
  }
  withDefaultStartRule(ruleName) {
    this.defaultStartRule = ruleName;
    return this;
  }
  withSource(source) {
    this.source = new InputStream(source).interval(0, source.length);
    return this;
  }
  // Creates a Grammar instance, and if it passes the sanity checks, returns it.
  build() {
    const grammar2 = new Grammar(
      this.name,
      this.ensureSuperGrammar(),
      this.rules,
      this.defaultStartRule
    );
    grammar2._matchStateInitializer = grammar2.superGrammar._matchStateInitializer;
    grammar2.supportsIncrementalParsing = grammar2.superGrammar.supportsIncrementalParsing;
    const grammarErrors = [];
    let grammarHasInvalidApplications = false;
    Object.keys(grammar2.rules).forEach((ruleName) => {
      const { body } = grammar2.rules[ruleName];
      try {
        body.assertChoicesHaveUniformArity(ruleName);
      } catch (e) {
        grammarErrors.push(e);
      }
      try {
        body.assertAllApplicationsAreValid(ruleName, grammar2);
      } catch (e) {
        grammarErrors.push(e);
        grammarHasInvalidApplications = true;
      }
    });
    if (!grammarHasInvalidApplications) {
      Object.keys(grammar2.rules).forEach((ruleName) => {
        const { body } = grammar2.rules[ruleName];
        try {
          body.assertIteratedExprsAreNotNullable(grammar2, []);
        } catch (e) {
          grammarErrors.push(e);
        }
      });
    }
    if (grammarErrors.length > 0) {
      throwErrors(grammarErrors);
    }
    if (this.source) {
      grammar2.source = this.source;
    }
    return grammar2;
  }
  // Rule declarations
  define(name, formals, body, description, source, primitive) {
    this.ensureSuperGrammar();
    if (this.superGrammar.rules[name]) {
      throw duplicateRuleDeclaration(name, this.name, this.superGrammar.name, source);
    } else if (this.rules[name]) {
      throw duplicateRuleDeclaration(name, this.name, this.name, source);
    }
    const duplicateParameterNames2 = getDuplicates(formals);
    if (duplicateParameterNames2.length > 0) {
      throw duplicateParameterNames(name, duplicateParameterNames2, source);
    }
    return this.install(name, formals, body, description, source, primitive);
  }
  override(name, formals, body, descIgnored, source) {
    this.ensureSuperGrammarRuleForOverriding(name, source);
    this.installOverriddenOrExtendedRule(name, formals, body, source);
    return this;
  }
  extend(name, formals, fragment, descIgnored, source) {
    const ruleInfo = this.ensureSuperGrammar().rules[name];
    if (!ruleInfo) {
      throw cannotExtendUndeclaredRule(name, this.superGrammar.name, source);
    }
    const body = new Extend(this.superGrammar, name, fragment);
    body.source = fragment.source;
    this.installOverriddenOrExtendedRule(name, formals, body, source);
    return this;
  }
};

// node_modules/ohm-js/src/Builder.js
var Builder = class {
  constructor(options) {
    this.currentDecl = null;
    this.currentRuleName = null;
    this.options = options || {};
  }
  newGrammar(name) {
    return new GrammarDecl(name);
  }
  grammar(metaInfo, name, superGrammar, defaultStartRule, rules) {
    const gDecl = new GrammarDecl(name);
    if (superGrammar) {
      gDecl.withSuperGrammar(
        superGrammar instanceof Grammar ? superGrammar : this.fromRecipe(superGrammar)
      );
    }
    if (defaultStartRule) {
      gDecl.withDefaultStartRule(defaultStartRule);
    }
    if (metaInfo && metaInfo.source) {
      gDecl.withSource(metaInfo.source);
    }
    this.currentDecl = gDecl;
    Object.keys(rules).forEach((ruleName) => {
      this.currentRuleName = ruleName;
      const ruleRecipe = rules[ruleName];
      const action = ruleRecipe[0];
      const metaInfo2 = ruleRecipe[1];
      const description = ruleRecipe[2];
      const formals = ruleRecipe[3];
      const body = this.fromRecipe(ruleRecipe[4]);
      let source;
      if (gDecl.source && metaInfo2 && metaInfo2.sourceInterval) {
        source = gDecl.source.subInterval(
          metaInfo2.sourceInterval[0],
          metaInfo2.sourceInterval[1] - metaInfo2.sourceInterval[0]
        );
      }
      gDecl[action](ruleName, formals, body, description, source);
    });
    this.currentRuleName = this.currentDecl = null;
    return gDecl.build();
  }
  terminal(x) {
    return new Terminal(x);
  }
  range(from, to) {
    return new Range(from, to);
  }
  param(index) {
    return new Param(index);
  }
  alt(...termArgs) {
    let terms = [];
    for (let arg of termArgs) {
      if (!(arg instanceof PExpr)) {
        arg = this.fromRecipe(arg);
      }
      if (arg instanceof Alt) {
        terms = terms.concat(arg.terms);
      } else {
        terms.push(arg);
      }
    }
    return terms.length === 1 ? terms[0] : new Alt(terms);
  }
  seq(...factorArgs) {
    let factors = [];
    for (let arg of factorArgs) {
      if (!(arg instanceof PExpr)) {
        arg = this.fromRecipe(arg);
      }
      if (arg instanceof Seq) {
        factors = factors.concat(arg.factors);
      } else {
        factors.push(arg);
      }
    }
    return factors.length === 1 ? factors[0] : new Seq(factors);
  }
  star(expr) {
    if (!(expr instanceof PExpr)) {
      expr = this.fromRecipe(expr);
    }
    return new Star(expr);
  }
  plus(expr) {
    if (!(expr instanceof PExpr)) {
      expr = this.fromRecipe(expr);
    }
    return new Plus(expr);
  }
  opt(expr) {
    if (!(expr instanceof PExpr)) {
      expr = this.fromRecipe(expr);
    }
    return new Opt(expr);
  }
  not(expr) {
    if (!(expr instanceof PExpr)) {
      expr = this.fromRecipe(expr);
    }
    return new Not(expr);
  }
  lookahead(expr) {
    if (!(expr instanceof PExpr)) {
      expr = this.fromRecipe(expr);
    }
    if (this.options.eliminateLookaheads) {
      return new Not(new Not(expr));
    }
    return new Lookahead(expr);
  }
  lex(expr) {
    if (!(expr instanceof PExpr)) {
      expr = this.fromRecipe(expr);
    }
    return new Lex(expr);
  }
  app(ruleName, optParams) {
    if (optParams && optParams.length > 0) {
      optParams = optParams.map(function(param) {
        return param instanceof PExpr ? param : this.fromRecipe(param);
      }, this);
    }
    return new Apply(ruleName, optParams);
  }
  // Note that unlike other methods in this class, this method cannot be used as a
  // convenience constructor. It only works with recipes, because it relies on
  // `this.currentDecl` and `this.currentRuleName` being set.
  splice(beforeTerms, afterTerms) {
    return new Splice(
      this.currentDecl.superGrammar,
      this.currentRuleName,
      beforeTerms.map((term) => this.fromRecipe(term)),
      afterTerms.map((term) => this.fromRecipe(term))
    );
  }
  fromRecipe(recipe) {
    const args = recipe[0] === "grammar" ? recipe.slice(1) : recipe.slice(2);
    const result = this[recipe[0]](...args);
    const metaInfo = recipe[1];
    if (metaInfo) {
      if (metaInfo.sourceInterval && this.currentDecl) {
        result.withSource(this.currentDecl.sourceInterval(...metaInfo.sourceInterval));
      }
    }
    return result;
  }
};

// node_modules/ohm-js/src/makeRecipe.js
function makeRecipe(recipe) {
  if (typeof recipe === "function") {
    return recipe.call(new Builder());
  } else {
    if (typeof recipe === "string") {
      recipe = JSON.parse(recipe);
    }
    return new Builder().fromRecipe(recipe);
  }
}

// node_modules/ohm-js/dist/built-in-rules.js
var built_in_rules_default = makeRecipe(["grammar", { "source": 'BuiltInRules {\n\n  alnum  (an alpha-numeric character)\n    = letter\n    | digit\n\n  letter  (a letter)\n    = lower\n    | upper\n    | unicodeLtmo\n\n  digit  (a digit)\n    = "0".."9"\n\n  hexDigit  (a hexadecimal digit)\n    = digit\n    | "a".."f"\n    | "A".."F"\n\n  ListOf<elem, sep>\n    = NonemptyListOf<elem, sep>\n    | EmptyListOf<elem, sep>\n\n  NonemptyListOf<elem, sep>\n    = elem (sep elem)*\n\n  EmptyListOf<elem, sep>\n    = /* nothing */\n\n  listOf<elem, sep>\n    = nonemptyListOf<elem, sep>\n    | emptyListOf<elem, sep>\n\n  nonemptyListOf<elem, sep>\n    = elem (sep elem)*\n\n  emptyListOf<elem, sep>\n    = /* nothing */\n\n  // Allows a syntactic rule application within a lexical context.\n  applySyntactic<app> = app\n}' }, "BuiltInRules", null, null, { "alnum": ["define", { "sourceInterval": [18, 78] }, "an alpha-numeric character", [], ["alt", { "sourceInterval": [60, 78] }, ["app", { "sourceInterval": [60, 66] }, "letter", []], ["app", { "sourceInterval": [73, 78] }, "digit", []]]], "letter": ["define", { "sourceInterval": [82, 142] }, "a letter", [], ["alt", { "sourceInterval": [107, 142] }, ["app", { "sourceInterval": [107, 112] }, "lower", []], ["app", { "sourceInterval": [119, 124] }, "upper", []], ["app", { "sourceInterval": [131, 142] }, "unicodeLtmo", []]]], "digit": ["define", { "sourceInterval": [146, 177] }, "a digit", [], ["range", { "sourceInterval": [169, 177] }, "0", "9"]], "hexDigit": ["define", { "sourceInterval": [181, 254] }, "a hexadecimal digit", [], ["alt", { "sourceInterval": [219, 254] }, ["app", { "sourceInterval": [219, 224] }, "digit", []], ["range", { "sourceInterval": [231, 239] }, "a", "f"], ["range", { "sourceInterval": [246, 254] }, "A", "F"]]], "ListOf": ["define", { "sourceInterval": [258, 336] }, null, ["elem", "sep"], ["alt", { "sourceInterval": [282, 336] }, ["app", { "sourceInterval": [282, 307] }, "NonemptyListOf", [["param", { "sourceInterval": [297, 301] }, 0], ["param", { "sourceInterval": [303, 306] }, 1]]], ["app", { "sourceInterval": [314, 336] }, "EmptyListOf", [["param", { "sourceInterval": [326, 330] }, 0], ["param", { "sourceInterval": [332, 335] }, 1]]]]], "NonemptyListOf": ["define", { "sourceInterval": [340, 388] }, null, ["elem", "sep"], ["seq", { "sourceInterval": [372, 388] }, ["param", { "sourceInterval": [372, 376] }, 0], ["star", { "sourceInterval": [377, 388] }, ["seq", { "sourceInterval": [378, 386] }, ["param", { "sourceInterval": [378, 381] }, 1], ["param", { "sourceInterval": [382, 386] }, 0]]]]], "EmptyListOf": ["define", { "sourceInterval": [392, 434] }, null, ["elem", "sep"], ["seq", { "sourceInterval": [438, 438] }]], "listOf": ["define", { "sourceInterval": [438, 516] }, null, ["elem", "sep"], ["alt", { "sourceInterval": [462, 516] }, ["app", { "sourceInterval": [462, 487] }, "nonemptyListOf", [["param", { "sourceInterval": [477, 481] }, 0], ["param", { "sourceInterval": [483, 486] }, 1]]], ["app", { "sourceInterval": [494, 516] }, "emptyListOf", [["param", { "sourceInterval": [506, 510] }, 0], ["param", { "sourceInterval": [512, 515] }, 1]]]]], "nonemptyListOf": ["define", { "sourceInterval": [520, 568] }, null, ["elem", "sep"], ["seq", { "sourceInterval": [552, 568] }, ["param", { "sourceInterval": [552, 556] }, 0], ["star", { "sourceInterval": [557, 568] }, ["seq", { "sourceInterval": [558, 566] }, ["param", { "sourceInterval": [558, 561] }, 1], ["param", { "sourceInterval": [562, 566] }, 0]]]]], "emptyListOf": ["define", { "sourceInterval": [572, 682] }, null, ["elem", "sep"], ["seq", { "sourceInterval": [685, 685] }]], "applySyntactic": ["define", { "sourceInterval": [685, 710] }, null, ["app"], ["param", { "sourceInterval": [707, 710] }, 0]] }]);

// node_modules/ohm-js/src/main-kernel.js
Grammar.BuiltInRules = built_in_rules_default;
announceBuiltInRules(Grammar.BuiltInRules);

// node_modules/ohm-js/dist/ohm-grammar.js
var ohm_grammar_default = makeRecipe(["grammar", { "source": `Ohm {

  Grammars
    = Grammar*

  Grammar
    = ident SuperGrammar? "{" Rule* "}"

  SuperGrammar
    = "<:" ident

  Rule
    = ident Formals? ruleDescr? "="  RuleBody  -- define
    | ident Formals?            ":=" OverrideRuleBody  -- override
    | ident Formals?            "+=" RuleBody  -- extend

  RuleBody
    = "|"? NonemptyListOf<TopLevelTerm, "|">

  TopLevelTerm
    = Seq caseName  -- inline
    | Seq

  OverrideRuleBody
    = "|"? NonemptyListOf<OverrideTopLevelTerm, "|">

  OverrideTopLevelTerm
    = "..."  -- superSplice
    | TopLevelTerm

  Formals
    = "<" ListOf<ident, ","> ">"

  Params
    = "<" ListOf<Seq, ","> ">"

  Alt
    = NonemptyListOf<Seq, "|">

  Seq
    = Iter*

  Iter
    = Pred "*"  -- star
    | Pred "+"  -- plus
    | Pred "?"  -- opt
    | Pred

  Pred
    = "~" Lex  -- not
    | "&" Lex  -- lookahead
    | Lex

  Lex
    = "#" Base  -- lex
    | Base

  Base
    = ident Params? ~(ruleDescr? "=" | ":=" | "+=")  -- application
    | oneCharTerminal ".." oneCharTerminal           -- range
    | terminal                                       -- terminal
    | "(" Alt ")"                                    -- paren

  ruleDescr  (a rule description)
    = "(" ruleDescrText ")"

  ruleDescrText
    = (~")" any)*

  caseName
    = "--" (~"\\n" space)* name (~"\\n" space)* ("\\n" | &"}")

  name  (a name)
    = nameFirst nameRest*

  nameFirst
    = "_"
    | letter

  nameRest
    = "_"
    | alnum

  ident  (an identifier)
    = name

  terminal
    = "\\"" terminalChar* "\\""

  oneCharTerminal
    = "\\"" terminalChar "\\""

  terminalChar
    = escapeChar
      | ~"\\\\" ~"\\"" ~"\\n" "\\u{0}".."\\u{10FFFF}"

  escapeChar  (an escape sequence)
    = "\\\\\\\\"                                     -- backslash
    | "\\\\\\""                                     -- doubleQuote
    | "\\\\\\'"                                     -- singleQuote
    | "\\\\b"                                      -- backspace
    | "\\\\n"                                      -- lineFeed
    | "\\\\r"                                      -- carriageReturn
    | "\\\\t"                                      -- tab
    | "\\\\u{" hexDigit hexDigit? hexDigit?
             hexDigit? hexDigit? hexDigit? "}"   -- unicodeCodePoint
    | "\\\\u" hexDigit hexDigit hexDigit hexDigit  -- unicodeEscape
    | "\\\\x" hexDigit hexDigit                    -- hexEscape

  space
   += comment

  comment
    = "//" (~"\\n" any)* &("\\n" | end)  -- singleLine
    | "/*" (~"*/" any)* "*/"  -- multiLine

  tokens = token*

  token = caseName | comment | ident | operator | punctuation | terminal | any

  operator = "<:" | "=" | ":=" | "+=" | "*" | "+" | "?" | "~" | "&"

  punctuation = "<" | ">" | "," | "--"
}` }, "Ohm", null, "Grammars", { "Grammars": ["define", { "sourceInterval": [9, 32] }, null, [], ["star", { "sourceInterval": [24, 32] }, ["app", { "sourceInterval": [24, 31] }, "Grammar", []]]], "Grammar": ["define", { "sourceInterval": [36, 83] }, null, [], ["seq", { "sourceInterval": [50, 83] }, ["app", { "sourceInterval": [50, 55] }, "ident", []], ["opt", { "sourceInterval": [56, 69] }, ["app", { "sourceInterval": [56, 68] }, "SuperGrammar", []]], ["terminal", { "sourceInterval": [70, 73] }, "{"], ["star", { "sourceInterval": [74, 79] }, ["app", { "sourceInterval": [74, 78] }, "Rule", []]], ["terminal", { "sourceInterval": [80, 83] }, "}"]]], "SuperGrammar": ["define", { "sourceInterval": [87, 116] }, null, [], ["seq", { "sourceInterval": [106, 116] }, ["terminal", { "sourceInterval": [106, 110] }, "<:"], ["app", { "sourceInterval": [111, 116] }, "ident", []]]], "Rule_define": ["define", { "sourceInterval": [131, 181] }, null, [], ["seq", { "sourceInterval": [131, 170] }, ["app", { "sourceInterval": [131, 136] }, "ident", []], ["opt", { "sourceInterval": [137, 145] }, ["app", { "sourceInterval": [137, 144] }, "Formals", []]], ["opt", { "sourceInterval": [146, 156] }, ["app", { "sourceInterval": [146, 155] }, "ruleDescr", []]], ["terminal", { "sourceInterval": [157, 160] }, "="], ["app", { "sourceInterval": [162, 170] }, "RuleBody", []]]], "Rule_override": ["define", { "sourceInterval": [188, 248] }, null, [], ["seq", { "sourceInterval": [188, 235] }, ["app", { "sourceInterval": [188, 193] }, "ident", []], ["opt", { "sourceInterval": [194, 202] }, ["app", { "sourceInterval": [194, 201] }, "Formals", []]], ["terminal", { "sourceInterval": [214, 218] }, ":="], ["app", { "sourceInterval": [219, 235] }, "OverrideRuleBody", []]]], "Rule_extend": ["define", { "sourceInterval": [255, 305] }, null, [], ["seq", { "sourceInterval": [255, 294] }, ["app", { "sourceInterval": [255, 260] }, "ident", []], ["opt", { "sourceInterval": [261, 269] }, ["app", { "sourceInterval": [261, 268] }, "Formals", []]], ["terminal", { "sourceInterval": [281, 285] }, "+="], ["app", { "sourceInterval": [286, 294] }, "RuleBody", []]]], "Rule": ["define", { "sourceInterval": [120, 305] }, null, [], ["alt", { "sourceInterval": [131, 305] }, ["app", { "sourceInterval": [131, 170] }, "Rule_define", []], ["app", { "sourceInterval": [188, 235] }, "Rule_override", []], ["app", { "sourceInterval": [255, 294] }, "Rule_extend", []]]], "RuleBody": ["define", { "sourceInterval": [309, 362] }, null, [], ["seq", { "sourceInterval": [324, 362] }, ["opt", { "sourceInterval": [324, 328] }, ["terminal", { "sourceInterval": [324, 327] }, "|"]], ["app", { "sourceInterval": [329, 362] }, "NonemptyListOf", [["app", { "sourceInterval": [344, 356] }, "TopLevelTerm", []], ["terminal", { "sourceInterval": [358, 361] }, "|"]]]]], "TopLevelTerm_inline": ["define", { "sourceInterval": [385, 408] }, null, [], ["seq", { "sourceInterval": [385, 397] }, ["app", { "sourceInterval": [385, 388] }, "Seq", []], ["app", { "sourceInterval": [389, 397] }, "caseName", []]]], "TopLevelTerm": ["define", { "sourceInterval": [366, 418] }, null, [], ["alt", { "sourceInterval": [385, 418] }, ["app", { "sourceInterval": [385, 397] }, "TopLevelTerm_inline", []], ["app", { "sourceInterval": [415, 418] }, "Seq", []]]], "OverrideRuleBody": ["define", { "sourceInterval": [422, 491] }, null, [], ["seq", { "sourceInterval": [445, 491] }, ["opt", { "sourceInterval": [445, 449] }, ["terminal", { "sourceInterval": [445, 448] }, "|"]], ["app", { "sourceInterval": [450, 491] }, "NonemptyListOf", [["app", { "sourceInterval": [465, 485] }, "OverrideTopLevelTerm", []], ["terminal", { "sourceInterval": [487, 490] }, "|"]]]]], "OverrideTopLevelTerm_superSplice": ["define", { "sourceInterval": [522, 543] }, null, [], ["terminal", { "sourceInterval": [522, 527] }, "..."]], "OverrideTopLevelTerm": ["define", { "sourceInterval": [495, 562] }, null, [], ["alt", { "sourceInterval": [522, 562] }, ["app", { "sourceInterval": [522, 527] }, "OverrideTopLevelTerm_superSplice", []], ["app", { "sourceInterval": [550, 562] }, "TopLevelTerm", []]]], "Formals": ["define", { "sourceInterval": [566, 606] }, null, [], ["seq", { "sourceInterval": [580, 606] }, ["terminal", { "sourceInterval": [580, 583] }, "<"], ["app", { "sourceInterval": [584, 602] }, "ListOf", [["app", { "sourceInterval": [591, 596] }, "ident", []], ["terminal", { "sourceInterval": [598, 601] }, ","]]], ["terminal", { "sourceInterval": [603, 606] }, ">"]]], "Params": ["define", { "sourceInterval": [610, 647] }, null, [], ["seq", { "sourceInterval": [623, 647] }, ["terminal", { "sourceInterval": [623, 626] }, "<"], ["app", { "sourceInterval": [627, 643] }, "ListOf", [["app", { "sourceInterval": [634, 637] }, "Seq", []], ["terminal", { "sourceInterval": [639, 642] }, ","]]], ["terminal", { "sourceInterval": [644, 647] }, ">"]]], "Alt": ["define", { "sourceInterval": [651, 685] }, null, [], ["app", { "sourceInterval": [661, 685] }, "NonemptyListOf", [["app", { "sourceInterval": [676, 679] }, "Seq", []], ["terminal", { "sourceInterval": [681, 684] }, "|"]]]], "Seq": ["define", { "sourceInterval": [689, 704] }, null, [], ["star", { "sourceInterval": [699, 704] }, ["app", { "sourceInterval": [699, 703] }, "Iter", []]]], "Iter_star": ["define", { "sourceInterval": [719, 736] }, null, [], ["seq", { "sourceInterval": [719, 727] }, ["app", { "sourceInterval": [719, 723] }, "Pred", []], ["terminal", { "sourceInterval": [724, 727] }, "*"]]], "Iter_plus": ["define", { "sourceInterval": [743, 760] }, null, [], ["seq", { "sourceInterval": [743, 751] }, ["app", { "sourceInterval": [743, 747] }, "Pred", []], ["terminal", { "sourceInterval": [748, 751] }, "+"]]], "Iter_opt": ["define", { "sourceInterval": [767, 783] }, null, [], ["seq", { "sourceInterval": [767, 775] }, ["app", { "sourceInterval": [767, 771] }, "Pred", []], ["terminal", { "sourceInterval": [772, 775] }, "?"]]], "Iter": ["define", { "sourceInterval": [708, 794] }, null, [], ["alt", { "sourceInterval": [719, 794] }, ["app", { "sourceInterval": [719, 727] }, "Iter_star", []], ["app", { "sourceInterval": [743, 751] }, "Iter_plus", []], ["app", { "sourceInterval": [767, 775] }, "Iter_opt", []], ["app", { "sourceInterval": [790, 794] }, "Pred", []]]], "Pred_not": ["define", { "sourceInterval": [809, 824] }, null, [], ["seq", { "sourceInterval": [809, 816] }, ["terminal", { "sourceInterval": [809, 812] }, "~"], ["app", { "sourceInterval": [813, 816] }, "Lex", []]]], "Pred_lookahead": ["define", { "sourceInterval": [831, 852] }, null, [], ["seq", { "sourceInterval": [831, 838] }, ["terminal", { "sourceInterval": [831, 834] }, "&"], ["app", { "sourceInterval": [835, 838] }, "Lex", []]]], "Pred": ["define", { "sourceInterval": [798, 862] }, null, [], ["alt", { "sourceInterval": [809, 862] }, ["app", { "sourceInterval": [809, 816] }, "Pred_not", []], ["app", { "sourceInterval": [831, 838] }, "Pred_lookahead", []], ["app", { "sourceInterval": [859, 862] }, "Lex", []]]], "Lex_lex": ["define", { "sourceInterval": [876, 892] }, null, [], ["seq", { "sourceInterval": [876, 884] }, ["terminal", { "sourceInterval": [876, 879] }, "#"], ["app", { "sourceInterval": [880, 884] }, "Base", []]]], "Lex": ["define", { "sourceInterval": [866, 903] }, null, [], ["alt", { "sourceInterval": [876, 903] }, ["app", { "sourceInterval": [876, 884] }, "Lex_lex", []], ["app", { "sourceInterval": [899, 903] }, "Base", []]]], "Base_application": ["define", { "sourceInterval": [918, 979] }, null, [], ["seq", { "sourceInterval": [918, 963] }, ["app", { "sourceInterval": [918, 923] }, "ident", []], ["opt", { "sourceInterval": [924, 931] }, ["app", { "sourceInterval": [924, 930] }, "Params", []]], ["not", { "sourceInterval": [932, 963] }, ["alt", { "sourceInterval": [934, 962] }, ["seq", { "sourceInterval": [934, 948] }, ["opt", { "sourceInterval": [934, 944] }, ["app", { "sourceInterval": [934, 943] }, "ruleDescr", []]], ["terminal", { "sourceInterval": [945, 948] }, "="]], ["terminal", { "sourceInterval": [951, 955] }, ":="], ["terminal", { "sourceInterval": [958, 962] }, "+="]]]]], "Base_range": ["define", { "sourceInterval": [986, 1041] }, null, [], ["seq", { "sourceInterval": [986, 1022] }, ["app", { "sourceInterval": [986, 1001] }, "oneCharTerminal", []], ["terminal", { "sourceInterval": [1002, 1006] }, ".."], ["app", { "sourceInterval": [1007, 1022] }, "oneCharTerminal", []]]], "Base_terminal": ["define", { "sourceInterval": [1048, 1106] }, null, [], ["app", { "sourceInterval": [1048, 1056] }, "terminal", []]], "Base_paren": ["define", { "sourceInterval": [1113, 1168] }, null, [], ["seq", { "sourceInterval": [1113, 1124] }, ["terminal", { "sourceInterval": [1113, 1116] }, "("], ["app", { "sourceInterval": [1117, 1120] }, "Alt", []], ["terminal", { "sourceInterval": [1121, 1124] }, ")"]]], "Base": ["define", { "sourceInterval": [907, 1168] }, null, [], ["alt", { "sourceInterval": [918, 1168] }, ["app", { "sourceInterval": [918, 963] }, "Base_application", []], ["app", { "sourceInterval": [986, 1022] }, "Base_range", []], ["app", { "sourceInterval": [1048, 1056] }, "Base_terminal", []], ["app", { "sourceInterval": [1113, 1124] }, "Base_paren", []]]], "ruleDescr": ["define", { "sourceInterval": [1172, 1231] }, "a rule description", [], ["seq", { "sourceInterval": [1210, 1231] }, ["terminal", { "sourceInterval": [1210, 1213] }, "("], ["app", { "sourceInterval": [1214, 1227] }, "ruleDescrText", []], ["terminal", { "sourceInterval": [1228, 1231] }, ")"]]], "ruleDescrText": ["define", { "sourceInterval": [1235, 1266] }, null, [], ["star", { "sourceInterval": [1255, 1266] }, ["seq", { "sourceInterval": [1256, 1264] }, ["not", { "sourceInterval": [1256, 1260] }, ["terminal", { "sourceInterval": [1257, 1260] }, ")"]], ["app", { "sourceInterval": [1261, 1264] }, "any", []]]]], "caseName": ["define", { "sourceInterval": [1270, 1338] }, null, [], ["seq", { "sourceInterval": [1285, 1338] }, ["terminal", { "sourceInterval": [1285, 1289] }, "--"], ["star", { "sourceInterval": [1290, 1304] }, ["seq", { "sourceInterval": [1291, 1302] }, ["not", { "sourceInterval": [1291, 1296] }, ["terminal", { "sourceInterval": [1292, 1296] }, "\n"]], ["app", { "sourceInterval": [1297, 1302] }, "space", []]]], ["app", { "sourceInterval": [1305, 1309] }, "name", []], ["star", { "sourceInterval": [1310, 1324] }, ["seq", { "sourceInterval": [1311, 1322] }, ["not", { "sourceInterval": [1311, 1316] }, ["terminal", { "sourceInterval": [1312, 1316] }, "\n"]], ["app", { "sourceInterval": [1317, 1322] }, "space", []]]], ["alt", { "sourceInterval": [1326, 1337] }, ["terminal", { "sourceInterval": [1326, 1330] }, "\n"], ["lookahead", { "sourceInterval": [1333, 1337] }, ["terminal", { "sourceInterval": [1334, 1337] }, "}"]]]]], "name": ["define", { "sourceInterval": [1342, 1382] }, "a name", [], ["seq", { "sourceInterval": [1363, 1382] }, ["app", { "sourceInterval": [1363, 1372] }, "nameFirst", []], ["star", { "sourceInterval": [1373, 1382] }, ["app", { "sourceInterval": [1373, 1381] }, "nameRest", []]]]], "nameFirst": ["define", { "sourceInterval": [1386, 1418] }, null, [], ["alt", { "sourceInterval": [1402, 1418] }, ["terminal", { "sourceInterval": [1402, 1405] }, "_"], ["app", { "sourceInterval": [1412, 1418] }, "letter", []]]], "nameRest": ["define", { "sourceInterval": [1422, 1452] }, null, [], ["alt", { "sourceInterval": [1437, 1452] }, ["terminal", { "sourceInterval": [1437, 1440] }, "_"], ["app", { "sourceInterval": [1447, 1452] }, "alnum", []]]], "ident": ["define", { "sourceInterval": [1456, 1489] }, "an identifier", [], ["app", { "sourceInterval": [1485, 1489] }, "name", []]], "terminal": ["define", { "sourceInterval": [1493, 1531] }, null, [], ["seq", { "sourceInterval": [1508, 1531] }, ["terminal", { "sourceInterval": [1508, 1512] }, '"'], ["star", { "sourceInterval": [1513, 1526] }, ["app", { "sourceInterval": [1513, 1525] }, "terminalChar", []]], ["terminal", { "sourceInterval": [1527, 1531] }, '"']]], "oneCharTerminal": ["define", { "sourceInterval": [1535, 1579] }, null, [], ["seq", { "sourceInterval": [1557, 1579] }, ["terminal", { "sourceInterval": [1557, 1561] }, '"'], ["app", { "sourceInterval": [1562, 1574] }, "terminalChar", []], ["terminal", { "sourceInterval": [1575, 1579] }, '"']]], "terminalChar": ["define", { "sourceInterval": [1583, 1660] }, null, [], ["alt", { "sourceInterval": [1602, 1660] }, ["app", { "sourceInterval": [1602, 1612] }, "escapeChar", []], ["seq", { "sourceInterval": [1621, 1660] }, ["not", { "sourceInterval": [1621, 1626] }, ["terminal", { "sourceInterval": [1622, 1626] }, "\\"]], ["not", { "sourceInterval": [1627, 1632] }, ["terminal", { "sourceInterval": [1628, 1632] }, '"']], ["not", { "sourceInterval": [1633, 1638] }, ["terminal", { "sourceInterval": [1634, 1638] }, "\n"]], ["range", { "sourceInterval": [1639, 1660] }, "\0", "\u{10FFFF}"]]]], "escapeChar_backslash": ["define", { "sourceInterval": [1703, 1758] }, null, [], ["terminal", { "sourceInterval": [1703, 1709] }, "\\\\"]], "escapeChar_doubleQuote": ["define", { "sourceInterval": [1765, 1822] }, null, [], ["terminal", { "sourceInterval": [1765, 1771] }, '\\"']], "escapeChar_singleQuote": ["define", { "sourceInterval": [1829, 1886] }, null, [], ["terminal", { "sourceInterval": [1829, 1835] }, "\\'"]], "escapeChar_backspace": ["define", { "sourceInterval": [1893, 1948] }, null, [], ["terminal", { "sourceInterval": [1893, 1898] }, "\\b"]], "escapeChar_lineFeed": ["define", { "sourceInterval": [1955, 2009] }, null, [], ["terminal", { "sourceInterval": [1955, 1960] }, "\\n"]], "escapeChar_carriageReturn": ["define", { "sourceInterval": [2016, 2076] }, null, [], ["terminal", { "sourceInterval": [2016, 2021] }, "\\r"]], "escapeChar_tab": ["define", { "sourceInterval": [2083, 2132] }, null, [], ["terminal", { "sourceInterval": [2083, 2088] }, "\\t"]], "escapeChar_unicodeCodePoint": ["define", { "sourceInterval": [2139, 2243] }, null, [], ["seq", { "sourceInterval": [2139, 2221] }, ["terminal", { "sourceInterval": [2139, 2145] }, "\\u{"], ["app", { "sourceInterval": [2146, 2154] }, "hexDigit", []], ["opt", { "sourceInterval": [2155, 2164] }, ["app", { "sourceInterval": [2155, 2163] }, "hexDigit", []]], ["opt", { "sourceInterval": [2165, 2174] }, ["app", { "sourceInterval": [2165, 2173] }, "hexDigit", []]], ["opt", { "sourceInterval": [2188, 2197] }, ["app", { "sourceInterval": [2188, 2196] }, "hexDigit", []]], ["opt", { "sourceInterval": [2198, 2207] }, ["app", { "sourceInterval": [2198, 2206] }, "hexDigit", []]], ["opt", { "sourceInterval": [2208, 2217] }, ["app", { "sourceInterval": [2208, 2216] }, "hexDigit", []]], ["terminal", { "sourceInterval": [2218, 2221] }, "}"]]], "escapeChar_unicodeEscape": ["define", { "sourceInterval": [2250, 2309] }, null, [], ["seq", { "sourceInterval": [2250, 2291] }, ["terminal", { "sourceInterval": [2250, 2255] }, "\\u"], ["app", { "sourceInterval": [2256, 2264] }, "hexDigit", []], ["app", { "sourceInterval": [2265, 2273] }, "hexDigit", []], ["app", { "sourceInterval": [2274, 2282] }, "hexDigit", []], ["app", { "sourceInterval": [2283, 2291] }, "hexDigit", []]]], "escapeChar_hexEscape": ["define", { "sourceInterval": [2316, 2371] }, null, [], ["seq", { "sourceInterval": [2316, 2339] }, ["terminal", { "sourceInterval": [2316, 2321] }, "\\x"], ["app", { "sourceInterval": [2322, 2330] }, "hexDigit", []], ["app", { "sourceInterval": [2331, 2339] }, "hexDigit", []]]], "escapeChar": ["define", { "sourceInterval": [1664, 2371] }, "an escape sequence", [], ["alt", { "sourceInterval": [1703, 2371] }, ["app", { "sourceInterval": [1703, 1709] }, "escapeChar_backslash", []], ["app", { "sourceInterval": [1765, 1771] }, "escapeChar_doubleQuote", []], ["app", { "sourceInterval": [1829, 1835] }, "escapeChar_singleQuote", []], ["app", { "sourceInterval": [1893, 1898] }, "escapeChar_backspace", []], ["app", { "sourceInterval": [1955, 1960] }, "escapeChar_lineFeed", []], ["app", { "sourceInterval": [2016, 2021] }, "escapeChar_carriageReturn", []], ["app", { "sourceInterval": [2083, 2088] }, "escapeChar_tab", []], ["app", { "sourceInterval": [2139, 2221] }, "escapeChar_unicodeCodePoint", []], ["app", { "sourceInterval": [2250, 2291] }, "escapeChar_unicodeEscape", []], ["app", { "sourceInterval": [2316, 2339] }, "escapeChar_hexEscape", []]]], "space": ["extend", { "sourceInterval": [2375, 2394] }, null, [], ["app", { "sourceInterval": [2387, 2394] }, "comment", []]], "comment_singleLine": ["define", { "sourceInterval": [2412, 2458] }, null, [], ["seq", { "sourceInterval": [2412, 2443] }, ["terminal", { "sourceInterval": [2412, 2416] }, "//"], ["star", { "sourceInterval": [2417, 2429] }, ["seq", { "sourceInterval": [2418, 2427] }, ["not", { "sourceInterval": [2418, 2423] }, ["terminal", { "sourceInterval": [2419, 2423] }, "\n"]], ["app", { "sourceInterval": [2424, 2427] }, "any", []]]], ["lookahead", { "sourceInterval": [2430, 2443] }, ["alt", { "sourceInterval": [2432, 2442] }, ["terminal", { "sourceInterval": [2432, 2436] }, "\n"], ["app", { "sourceInterval": [2439, 2442] }, "end", []]]]]], "comment_multiLine": ["define", { "sourceInterval": [2465, 2501] }, null, [], ["seq", { "sourceInterval": [2465, 2487] }, ["terminal", { "sourceInterval": [2465, 2469] }, "/*"], ["star", { "sourceInterval": [2470, 2482] }, ["seq", { "sourceInterval": [2471, 2480] }, ["not", { "sourceInterval": [2471, 2476] }, ["terminal", { "sourceInterval": [2472, 2476] }, "*/"]], ["app", { "sourceInterval": [2477, 2480] }, "any", []]]], ["terminal", { "sourceInterval": [2483, 2487] }, "*/"]]], "comment": ["define", { "sourceInterval": [2398, 2501] }, null, [], ["alt", { "sourceInterval": [2412, 2501] }, ["app", { "sourceInterval": [2412, 2443] }, "comment_singleLine", []], ["app", { "sourceInterval": [2465, 2487] }, "comment_multiLine", []]]], "tokens": ["define", { "sourceInterval": [2505, 2520] }, null, [], ["star", { "sourceInterval": [2514, 2520] }, ["app", { "sourceInterval": [2514, 2519] }, "token", []]]], "token": ["define", { "sourceInterval": [2524, 2600] }, null, [], ["alt", { "sourceInterval": [2532, 2600] }, ["app", { "sourceInterval": [2532, 2540] }, "caseName", []], ["app", { "sourceInterval": [2543, 2550] }, "comment", []], ["app", { "sourceInterval": [2553, 2558] }, "ident", []], ["app", { "sourceInterval": [2561, 2569] }, "operator", []], ["app", { "sourceInterval": [2572, 2583] }, "punctuation", []], ["app", { "sourceInterval": [2586, 2594] }, "terminal", []], ["app", { "sourceInterval": [2597, 2600] }, "any", []]]], "operator": ["define", { "sourceInterval": [2604, 2669] }, null, [], ["alt", { "sourceInterval": [2615, 2669] }, ["terminal", { "sourceInterval": [2615, 2619] }, "<:"], ["terminal", { "sourceInterval": [2622, 2625] }, "="], ["terminal", { "sourceInterval": [2628, 2632] }, ":="], ["terminal", { "sourceInterval": [2635, 2639] }, "+="], ["terminal", { "sourceInterval": [2642, 2645] }, "*"], ["terminal", { "sourceInterval": [2648, 2651] }, "+"], ["terminal", { "sourceInterval": [2654, 2657] }, "?"], ["terminal", { "sourceInterval": [2660, 2663] }, "~"], ["terminal", { "sourceInterval": [2666, 2669] }, "&"]]], "punctuation": ["define", { "sourceInterval": [2673, 2709] }, null, [], ["alt", { "sourceInterval": [2687, 2709] }, ["terminal", { "sourceInterval": [2687, 2690] }, "<"], ["terminal", { "sourceInterval": [2693, 2696] }, ">"], ["terminal", { "sourceInterval": [2699, 2702] }, ","], ["terminal", { "sourceInterval": [2705, 2709] }, "--"]]] }]);

// node_modules/ohm-js/src/buildGrammar.js
var superSplicePlaceholder = Object.create(PExpr.prototype);
function namespaceHas(ns, name) {
  for (const prop in ns) {
    if (prop === name) return true;
  }
  return false;
}
function buildGrammar2(match, namespace, optOhmGrammarForTesting, options) {
  const builder = new Builder(options);
  let decl;
  let currentRuleName;
  let currentRuleFormals;
  let overriding = false;
  const metaGrammar = optOhmGrammarForTesting || ohm_grammar_default;
  const helpers = metaGrammar.createSemantics().addOperation("visit", {
    Grammars(grammarIter) {
      return grammarIter.children.map((c) => c.visit());
    },
    Grammar(id, s, _open, rules, _close) {
      const grammarName = id.visit();
      decl = builder.newGrammar(grammarName);
      s.child(0) && s.child(0).visit();
      rules.children.map((c) => c.visit());
      const g = decl.build();
      g.source = this.source.trimmed();
      if (namespaceHas(namespace, grammarName)) {
        throw duplicateGrammarDeclaration(g, namespace);
      }
      namespace[grammarName] = g;
      return g;
    },
    SuperGrammar(_, n2) {
      const superGrammarName = n2.visit();
      if (superGrammarName === "null") {
        decl.withSuperGrammar(null);
      } else {
        if (!namespace || !namespaceHas(namespace, superGrammarName)) {
          throw undeclaredGrammar(superGrammarName, namespace, n2.source);
        }
        decl.withSuperGrammar(namespace[superGrammarName]);
      }
    },
    Rule_define(n2, fs, d, _, b) {
      currentRuleName = n2.visit();
      currentRuleFormals = fs.children.map((c) => c.visit())[0] || [];
      if (!decl.defaultStartRule && decl.ensureSuperGrammar() !== Grammar.ProtoBuiltInRules) {
        decl.withDefaultStartRule(currentRuleName);
      }
      const body = b.visit();
      const description = d.children.map((c) => c.visit())[0];
      const source = this.source.trimmed();
      return decl.define(currentRuleName, currentRuleFormals, body, description, source);
    },
    Rule_override(n2, fs, _, b) {
      currentRuleName = n2.visit();
      currentRuleFormals = fs.children.map((c) => c.visit())[0] || [];
      const source = this.source.trimmed();
      decl.ensureSuperGrammarRuleForOverriding(currentRuleName, source);
      overriding = true;
      const body = b.visit();
      overriding = false;
      return decl.override(currentRuleName, currentRuleFormals, body, null, source);
    },
    Rule_extend(n2, fs, _, b) {
      currentRuleName = n2.visit();
      currentRuleFormals = fs.children.map((c) => c.visit())[0] || [];
      const body = b.visit();
      const source = this.source.trimmed();
      return decl.extend(currentRuleName, currentRuleFormals, body, null, source);
    },
    RuleBody(_, terms) {
      return builder.alt(...terms.visit()).withSource(this.source);
    },
    OverrideRuleBody(_, terms) {
      const args = terms.visit();
      const expansionPos = args.indexOf(superSplicePlaceholder);
      if (expansionPos >= 0) {
        const beforeTerms = args.slice(0, expansionPos);
        const afterTerms = args.slice(expansionPos + 1);
        afterTerms.forEach((t) => {
          if (t === superSplicePlaceholder) throw multipleSuperSplices(t);
        });
        return new Splice(
          decl.superGrammar,
          currentRuleName,
          beforeTerms,
          afterTerms
        ).withSource(this.source);
      } else {
        return builder.alt(...args).withSource(this.source);
      }
    },
    Formals(opointy, fs, cpointy) {
      return fs.visit();
    },
    Params(opointy, ps, cpointy) {
      return ps.visit();
    },
    Alt(seqs) {
      return builder.alt(...seqs.visit()).withSource(this.source);
    },
    TopLevelTerm_inline(b, n2) {
      const inlineRuleName = currentRuleName + "_" + n2.visit();
      const body = b.visit();
      const source = this.source.trimmed();
      const isNewRuleDeclaration = !(decl.superGrammar && decl.superGrammar.rules[inlineRuleName]);
      if (overriding && !isNewRuleDeclaration) {
        decl.override(inlineRuleName, currentRuleFormals, body, null, source);
      } else {
        decl.define(inlineRuleName, currentRuleFormals, body, null, source);
      }
      const params = currentRuleFormals.map((formal) => builder.app(formal));
      return builder.app(inlineRuleName, params).withSource(body.source);
    },
    OverrideTopLevelTerm_superSplice(_) {
      return superSplicePlaceholder;
    },
    Seq(expr) {
      return builder.seq(...expr.children.map((c) => c.visit())).withSource(this.source);
    },
    Iter_star(x, _) {
      return builder.star(x.visit()).withSource(this.source);
    },
    Iter_plus(x, _) {
      return builder.plus(x.visit()).withSource(this.source);
    },
    Iter_opt(x, _) {
      return builder.opt(x.visit()).withSource(this.source);
    },
    Pred_not(_, x) {
      return builder.not(x.visit()).withSource(this.source);
    },
    Pred_lookahead(_, x) {
      return builder.lookahead(x.visit()).withSource(this.source);
    },
    Lex_lex(_, x) {
      return builder.lex(x.visit()).withSource(this.source);
    },
    Base_application(rule, ps) {
      const params = ps.children.map((c) => c.visit())[0] || [];
      return builder.app(rule.visit(), params).withSource(this.source);
    },
    Base_range(from, _, to) {
      return builder.range(from.visit(), to.visit()).withSource(this.source);
    },
    Base_terminal(expr) {
      return builder.terminal(expr.visit()).withSource(this.source);
    },
    Base_paren(open, x, close) {
      return x.visit();
    },
    ruleDescr(open, t, close) {
      return t.visit();
    },
    ruleDescrText(_) {
      return this.sourceString.trim();
    },
    caseName(_, space1, n2, space2, end2) {
      return n2.visit();
    },
    name(first, rest) {
      return this.sourceString;
    },
    nameFirst(expr) {
    },
    nameRest(expr) {
    },
    terminal(open, cs, close) {
      return cs.children.map((c) => c.visit()).join("");
    },
    oneCharTerminal(open, c, close) {
      return c.visit();
    },
    escapeChar(c) {
      try {
        return unescapeCodePoint(this.sourceString);
      } catch (err) {
        if (err instanceof RangeError && err.message.startsWith("Invalid code point ")) {
          throw invalidCodePoint(c);
        }
        throw err;
      }
    },
    NonemptyListOf(x, _, xs) {
      return [x.visit()].concat(xs.children.map((c) => c.visit()));
    },
    EmptyListOf() {
      return [];
    },
    _terminal() {
      return this.sourceString;
    }
  });
  return helpers(match).visit();
}

// node_modules/ohm-js/dist/operations-and-attributes.js
var operations_and_attributes_default = makeRecipe(["grammar", { "source": 'OperationsAndAttributes {\n\n  AttributeSignature =\n    name\n\n  OperationSignature =\n    name Formals?\n\n  Formals\n    = "(" ListOf<name, ","> ")"\n\n  name  (a name)\n    = nameFirst nameRest*\n\n  nameFirst\n    = "_"\n    | letter\n\n  nameRest\n    = "_"\n    | alnum\n\n}' }, "OperationsAndAttributes", null, "AttributeSignature", { "AttributeSignature": ["define", { "sourceInterval": [29, 58] }, null, [], ["app", { "sourceInterval": [54, 58] }, "name", []]], "OperationSignature": ["define", { "sourceInterval": [62, 100] }, null, [], ["seq", { "sourceInterval": [87, 100] }, ["app", { "sourceInterval": [87, 91] }, "name", []], ["opt", { "sourceInterval": [92, 100] }, ["app", { "sourceInterval": [92, 99] }, "Formals", []]]]], "Formals": ["define", { "sourceInterval": [104, 143] }, null, [], ["seq", { "sourceInterval": [118, 143] }, ["terminal", { "sourceInterval": [118, 121] }, "("], ["app", { "sourceInterval": [122, 139] }, "ListOf", [["app", { "sourceInterval": [129, 133] }, "name", []], ["terminal", { "sourceInterval": [135, 138] }, ","]]], ["terminal", { "sourceInterval": [140, 143] }, ")"]]], "name": ["define", { "sourceInterval": [147, 187] }, "a name", [], ["seq", { "sourceInterval": [168, 187] }, ["app", { "sourceInterval": [168, 177] }, "nameFirst", []], ["star", { "sourceInterval": [178, 187] }, ["app", { "sourceInterval": [178, 186] }, "nameRest", []]]]], "nameFirst": ["define", { "sourceInterval": [191, 223] }, null, [], ["alt", { "sourceInterval": [207, 223] }, ["terminal", { "sourceInterval": [207, 210] }, "_"], ["app", { "sourceInterval": [217, 223] }, "letter", []]]], "nameRest": ["define", { "sourceInterval": [227, 257] }, null, [], ["alt", { "sourceInterval": [242, 257] }, ["terminal", { "sourceInterval": [242, 245] }, "_"], ["app", { "sourceInterval": [252, 257] }, "alnum", []]]] }]);

// node_modules/ohm-js/src/semanticsDeferredInit.js
initBuiltInSemantics(Grammar.BuiltInRules);
initPrototypeParser(operations_and_attributes_default);
function initBuiltInSemantics(builtInRules) {
  const actions = {
    empty() {
      return this.iteration();
    },
    nonEmpty(first, _, rest) {
      return this.iteration([first].concat(rest.children));
    },
    self(..._children) {
      return this;
    }
  };
  Semantics.BuiltInSemantics = Semantics.createSemantics(builtInRules, null).addOperation(
    "asIteration",
    {
      emptyListOf: actions.empty,
      nonemptyListOf: actions.nonEmpty,
      EmptyListOf: actions.empty,
      NonemptyListOf: actions.nonEmpty,
      _iter: actions.self
    }
  );
}
function initPrototypeParser(grammar2) {
  Semantics.prototypeGrammarSemantics = grammar2.createSemantics().addOperation("parse", {
    AttributeSignature(name) {
      return {
        name: name.parse(),
        formals: []
      };
    },
    OperationSignature(name, optFormals) {
      return {
        name: name.parse(),
        formals: optFormals.children.map((c) => c.parse())[0] || []
      };
    },
    Formals(oparen, fs, cparen) {
      return fs.asIteration().children.map((c) => c.parse());
    },
    name(first, rest) {
      return this.sourceString;
    }
  });
  Semantics.prototypeGrammar = grammar2;
}

// node_modules/ohm-js/src/findIndentation.js
function findIndentation(input) {
  let pos = 0;
  const stack = [0];
  const topOfStack = () => stack[stack.length - 1];
  const result = {};
  const regex = /( *).*(?:$|\r?\n|\r)/g;
  let match;
  while ((match = regex.exec(input)) != null) {
    const [line, indent2] = match;
    if (line.length === 0) break;
    const indentSize = indent2.length;
    const prevSize = topOfStack();
    const indentPos = pos + indentSize;
    if (indentSize > prevSize) {
      stack.push(indentSize);
      result[indentPos] = 1;
    } else if (indentSize < prevSize) {
      const prevLength = stack.length;
      while (topOfStack() !== indentSize) {
        stack.pop();
      }
      result[indentPos] = -1 * (prevLength - stack.length);
    }
    pos += line.length;
  }
  if (stack.length > 1) {
    result[pos] = 1 - stack.length;
  }
  return result;
}

// node_modules/ohm-js/src/IndentationSensitive.js
var INDENT_DESCRIPTION = "an indented block";
var DEDENT_DESCRIPTION = "a dedent";
var INVALID_CODE_POINT = 1114111 + 1;
var InputStreamWithIndentation = class extends InputStream {
  constructor(state) {
    super(state.input);
    this.state = state;
  }
  _indentationAt(pos) {
    return this.state.userData[pos] || 0;
  }
  atEnd() {
    return super.atEnd() && this._indentationAt(this.pos) === 0;
  }
  next() {
    if (this._indentationAt(this.pos) !== 0) {
      this.examinedLength = Math.max(this.examinedLength, this.pos);
      return void 0;
    }
    return super.next();
  }
  nextCharCode() {
    if (this._indentationAt(this.pos) !== 0) {
      this.examinedLength = Math.max(this.examinedLength, this.pos);
      return INVALID_CODE_POINT;
    }
    return super.nextCharCode();
  }
  nextCodePoint() {
    if (this._indentationAt(this.pos) !== 0) {
      this.examinedLength = Math.max(this.examinedLength, this.pos);
      return INVALID_CODE_POINT;
    }
    return super.nextCodePoint();
  }
};
var Indentation = class extends PExpr {
  constructor(isIndent = true) {
    super();
    this.isIndent = isIndent;
  }
  allowsSkippingPrecedingSpace() {
    return true;
  }
  eval(state) {
    const { inputStream } = state;
    const pseudoTokens = state.userData;
    state.doNotMemoize = true;
    const origPos = inputStream.pos;
    const sign = this.isIndent ? 1 : -1;
    const count = (pseudoTokens[origPos] || 0) * sign;
    if (count > 0) {
      state.userData = Object.create(pseudoTokens);
      state.userData[origPos] -= sign;
      state.pushBinding(new TerminalNode(0), origPos);
      return true;
    } else {
      state.processFailure(origPos, this);
      return false;
    }
  }
  getArity() {
    return 1;
  }
  _assertAllApplicationsAreValid(ruleName, grammar2) {
  }
  _isNullable(grammar2, memo) {
    return false;
  }
  assertChoicesHaveUniformArity(ruleName) {
  }
  assertIteratedExprsAreNotNullable(grammar2) {
  }
  introduceParams(formals) {
    return this;
  }
  substituteParams(actuals) {
    return this;
  }
  toString() {
    return this.isIndent ? "indent" : "dedent";
  }
  toDisplayString() {
    return this.toString();
  }
  toFailure(grammar2) {
    const description = this.isIndent ? INDENT_DESCRIPTION : DEDENT_DESCRIPTION;
    return new Failure(this, description, "description");
  }
};
var applyIndent = new Apply("indent");
var applyDedent = new Apply("dedent");
var newAnyBody = new Splice(built_in_rules_default, "any", [applyIndent, applyDedent], []);
var IndentationSensitive = new Builder().newGrammar("IndentationSensitive").withSuperGrammar(built_in_rules_default).define("indent", [], new Indentation(true), INDENT_DESCRIPTION, void 0, true).define("dedent", [], new Indentation(false), DEDENT_DESCRIPTION, void 0, true).extend("any", [], newAnyBody, "any character", void 0).build();
Object.assign(IndentationSensitive, {
  _matchStateInitializer(state) {
    state.userData = findIndentation(state.input);
    state.inputStream = new InputStreamWithIndentation(state);
  },
  supportsIncrementalParsing: false
});

// node_modules/ohm-js/src/main.js
Grammar.initApplicationParser(ohm_grammar_default, buildGrammar2);
var isBuffer = (obj) => !!obj.constructor && typeof obj.constructor.isBuffer === "function" && obj.constructor.isBuffer(obj);
function compileAndLoad(source, namespace, buildOptions) {
  const m = ohm_grammar_default.match(source, "Grammars");
  if (m.failed()) {
    throw grammarSyntaxError(m);
  }
  return buildGrammar2(m, namespace, void 0, buildOptions);
}
function _grammar(source, optNamespace, buildOptions) {
  const ns = _grammars(source, optNamespace, buildOptions);
  const grammarNames = Object.keys(ns);
  if (grammarNames.length === 0) {
    throw new Error("Missing grammar definition");
  } else if (grammarNames.length > 1) {
    const secondGrammar = ns[grammarNames[1]];
    const interval = secondGrammar.source;
    throw new Error(
      getLineAndColumnMessage(interval.sourceString, interval.startIdx) + "Found more than one grammar definition -- use ohm.grammars() instead."
    );
  }
  return ns[grammarNames[0]];
}
function _grammars(source, optNamespace, buildOptions) {
  const ns = Object.create(optNamespace || {});
  if (typeof source !== "string") {
    if (isBuffer(source)) {
      source = source.toString();
    } else {
      throw new TypeError(
        "Expected string as first argument, got " + unexpectedObjToString(source)
      );
    }
  }
  compileAndLoad(source, ns, buildOptions);
  return ns;
}
function grammar(source, optNamespace) {
  return _grammar(source, optNamespace);
}

// src/grammar.js
var grammarText = String.raw`
TEMP_JS {
  Program     = Decl+
  Decl        = FuncDecl | EnumDecl | VarDecl | Statement

  FuncDecl    = "fn" id "(" ListOf<Param, ","> ")" "{" Statement* "}"
  Param       = id

  Statement   = VarDecl
              | IndexAssign
              | CompoundAssign
              | IncrDecr
              | Assign
              | Print
              | IfStmt
              | WhileStmt
              | ForStmt
              | MatchStmt
              | ReturnStmt
              | BreakStmt
              | ExpStmt

  VarDecl        = ("let" | "mut") id "=" Exp
  IndexAssign    = id "[" Exp "]" "=" Exp
  CompoundAssign = id ("+=" | "-=") Exp
  IncrDecr       = id ("++" | "--")
  Assign         = id "=" Exp
  Print       = "print" "(" Exp ")"
  IfStmt      = "if" Exp "{" Statement* "}" "else" "{" Statement* "}" -- long
              | "if" Exp "{" Statement* "}" "else" IfStmt             -- elseif
              | "if" Exp "{" Statement* "}" -- short
  WhileStmt   = "while" Exp "{" Statement* "}"
  ForStmt     = "for" id "in" Exp "{" Statement* "}"
  EnumDecl    = "enum" id "{" id+ "}"
  MatchStmt   = "match" Exp "{" MatchArm+ "}"
  MatchArm    = MatchPattern "=>" "{" Statement* "}"
  MatchPattern = "_"       -- wildcard
               | id "." id -- variant
               | literal   -- lit
  ReturnStmt  = "return" Exp?
  BreakStmt   = "break"
  ExpStmt     = Exp

  Exp         = Exp "||" Exp1         -- or
              | Exp1
  Exp1        = Exp1 "&&" Exp2        -- and
              | Exp2
  Exp2        = Exp3 relop Exp3       -- compare
              | Exp3
  Exp3        = Exp3 addop Exp4       -- add
              | Exp4
  Exp4        = Exp4 mulop Exp5       -- multiply
              | Exp5
  Exp5        = prefixop Exp6         -- prefix
              | Exp6
  Exp6        = Exp7 "**" Exp6        -- power
              | Exp7
  Exp7        = Exp7 "[" Exp "]"             -- index
              | "[" ListOf<Exp, ","> "]"     -- array
              | literal
              | id "(" ListOf<Exp, ","> ")"  -- call
              | id "." id                    -- member
              | id                           -- id
              | "(" Exp ")"                  -- parens

  relop       = "<=" | ">=" | "==" | "!=" | "<" | ">"
  addop       = "+" | "-"
  mulop       = "*" | "//" | "/" | "%"
  prefixop    = "-" | "!"

  id          = ~keyword letter (alnum | "_")*
  keyword     = ("fn" | "let" | "mut" | "if" | "else" | "while" | "for" | "in" | "return" | "break" | "print" | "true" | "false" | "match" | "enum") ~(alnum | "_")
  literal     = num | fstring | string | true | false
  num         = digit+ ("." digit+)?
  fstring     = "f\"" (~"\"" any)* "\""
  string      = "\"" (~"\"" any)* "\""
  true        = "true"
  false       = "false"

  space      += "#" (~"\n" any)* "\n"?  -- comment
}
`;

// src/parser.js
var G = grammar(grammarText);
var semantics = G.createSemantics();
var n = (type, props) => ({ type, ...props });
semantics.addOperation("ast", {
  Program(decls) {
    return n("Program", { body: decls.children.map((d) => d.ast()) });
  },
  Decl(d) {
    return d.ast();
  },
  EnumDecl(_enum, name, _open, variants, _close) {
    return n("EnumDecl", { name: name.ast().name, variants: variants.children.map((v) => v.ast().name) });
  },
  FuncDecl(_fn, name, _open, params, _close, _openb, stmts, _closeb) {
    const pname = name.ast().name;
    const paramsArr = params.asIteration().children.map((c) => c.ast());
    const body = stmts.children.map((s) => s.ast());
    return n("FunctionDecl", { name: pname, params: paramsArr, body });
  },
  Param(id) {
    return n("Param", { name: id.ast().name });
  },
  Statement(s) {
    return s.ast();
  },
  VarDecl(kind, id, _eq, init) {
    const k = kind.sourceString;
    const name = id.ast().name;
    return n("VarDecl", { kind: k, name, init: init.ast() });
  },
  CompoundAssign(id, op, exp) {
    return n("CompoundAssign", { target: id.ast().name, op: op.sourceString, expr: exp.ast() });
  },
  IncrDecr(id, op) {
    return n("IncrDecr", { target: id.ast().name, op: op.sourceString });
  },
  Assign(id, _eq, exp) {
    return n("Assign", { target: id.ast().name, expr: exp.ast() });
  },
  Print(_print, _open, exp, _close) {
    return n("Print", { expr: exp.ast() });
  },
  IfStmt_long(_if, cond, _open, thenStmts, _close, _else, _open2, elseStmts, _close2) {
    const thenBody = thenStmts.children.map((s) => s.ast());
    const elseBody = elseStmts.children.map((s) => s.ast());
    return n("If", { cond: cond.ast(), thenBody, elseBody });
  },
  IfStmt_elseif(_if, cond, _open, stmts, _close, _else, elseIf) {
    return n("If", { cond: cond.ast(), thenBody: stmts.children.map((s) => s.ast()), elseBody: [elseIf.ast()] });
  },
  IfStmt_short(_if, cond, _open, stmts, _close) {
    const thenBody = stmts.children.map((s) => s.ast());
    return n("If", { cond: cond.ast(), thenBody, elseBody: null });
  },
  WhileStmt(_while, cond, _open, stmts, _close) {
    return n("While", { cond: cond.ast(), body: stmts.children.map((s) => s.ast()) });
  },
  ForStmt(_for, id, _in, iterable, _open, stmts, _close) {
    return n("For", { variable: id.ast().name, iterable: iterable.ast(), body: stmts.children.map((s) => s.ast()) });
  },
  MatchStmt(_match, subject, _open, arms, _close) {
    return n("Match", { subject: subject.ast(), arms: arms.children.map((a) => a.ast()) });
  },
  MatchArm(pattern, _arrow, _open, stmts, _close) {
    return { pattern: pattern.ast(), body: stmts.children.map((s) => s.ast()) };
  },
  MatchPattern_wildcard(_) {
    return n("WildCard", {});
  },
  MatchPattern_variant(enumId, _dot, variantId) {
    return n("EnumVariant", { enum: enumId.ast().name, variant: variantId.ast().name });
  },
  MatchPattern_lit(lit) {
    return lit.ast();
  },
  IndexAssign(id, _open, index, _close, _eq, value) {
    return n("IndexAssign", { target: id.ast().name, index: index.ast(), value: value.ast() });
  },
  ReturnStmt(_ret, expOpt) {
    const expr = expOpt.children.length ? expOpt.children[0].ast() : null;
    return n("Return", { expr });
  },
  BreakStmt(_b) {
    return n("Break", {});
  },
  ExpStmt(exp) {
    return exp.ast();
  },
  // Expressions
  Exp_or(left, _op, right) {
    return n("Binary", { op: "||", left: left.ast(), right: right.ast() });
  },
  Exp(left) {
    return left.ast();
  },
  Exp1_and(left, _op, right) {
    return n("Binary", { op: "&&", left: left.ast(), right: right.ast() });
  },
  Exp1(left) {
    return left.ast();
  },
  Exp2_compare(left, op, right) {
    return n("Binary", { op: op.ast(), left: left.ast(), right: right.ast() });
  },
  Exp2(left) {
    return left.ast();
  },
  Exp3_add(left, op, right) {
    return n("Binary", { op: op.ast(), left: left.ast(), right: right.ast() });
  },
  Exp3(left) {
    return left.ast();
  },
  Exp4_multiply(left, op, right) {
    return n("Binary", { op: op.ast(), left: left.ast(), right: right.ast() });
  },
  Exp4(left) {
    return left.ast();
  },
  Exp5_prefix(op, expr) {
    return n("Unary", { op: op.ast(), expr: expr.ast() });
  },
  Exp5(expr) {
    return expr.ast();
  },
  Exp6_power(left, _op, right) {
    return n("Binary", { op: "**", left: left.ast(), right: right.ast() });
  },
  Exp6(expr) {
    return expr.ast();
  },
  Exp7_index(arr, _open, index, _close) {
    return n("IndexAccess", { array: arr.ast(), index: index.ast() });
  },
  Exp7_array(_open, elements, _close) {
    return n("ArrayLiteral", { elements: elements.asIteration().children.map((c) => c.ast()) });
  },
  Exp7_call(id, _open, args, _close) {
    const argList = args.asIteration().children.map((c) => c.ast());
    return n("Call", { callee: id.ast().name, args: argList });
  },
  Exp7_member(obj, _dot, member) {
    return n("MemberAccess", { object: obj.ast().name, member: member.ast().name });
  },
  Exp7_id(id) {
    return id.ast();
  },
  Exp7_parens(_open, expr, _close) {
    return expr.ast();
  },
  relop(ch) {
    return this.sourceString;
  },
  addop(ch) {
    return this.sourceString;
  },
  mulop(ch) {
    return this.sourceString;
  },
  prefixop(ch) {
    return this.sourceString;
  },
  id(a, b) {
    return n("Identifier", { name: this.sourceString });
  },
  fstring(_open, _chars, _close) {
    const raw = this.sourceString.slice(2, -1);
    return n("FString", { parts: parseFStringParts(raw) });
  },
  num(a, b, c) {
    return n("Literal", { value: Number(this.sourceString) });
  },
  string(_open, _chars, _close) {
    return n("Literal", { value: this.sourceString.slice(1, -1) });
  },
  true(_true) {
    return n("Literal", { value: true });
  },
  false(_false) {
    return n("Literal", { value: false });
  }
});
function buildAST(src) {
  const match = G.match(src);
  if (!match.succeeded()) {
    return { ast: null, errors: [match.message] };
  }
  const ast = semantics(match).ast();
  return { ast, errors: [] };
}
function parseFStringParts(raw) {
  const parts = [];
  let textStart = 0;
  let i = 0;
  while (i < raw.length) {
    if (raw[i] === "{") {
      if (i > textStart) parts.push({ type: "FStringText", value: raw.slice(textStart, i) });
      const end2 = raw.indexOf("}", i + 1);
      const exprSrc = raw.slice(i + 1, end2 === -1 ? raw.length : end2);
      const { ast } = buildAST(exprSrc);
      parts.push({ type: "FStringInterp", expr: ast?.body[0] ?? null });
      i = end2 === -1 ? raw.length : end2 + 1;
      textStart = i;
    } else {
      i++;
    }
  }
  if (textStart < raw.length) parts.push({ type: "FStringText", value: raw.slice(textStart) });
  return parts;
}

// src/analyzer.js
var UNKNOWN = "unknown";
var BUILTINS = {
  range: { minArgs: 1, maxArgs: 3, returnType: "array" },
  floor_div: { minArgs: 2, maxArgs: 2, returnType: "num" },
  len: { minArgs: 1, maxArgs: 1, returnType: "num" }
};
function analyze(ast) {
  const errors = [];
  if (!ast) return errors;
  function report(msg, node) {
    errors.push({ message: msg, node });
  }
  const funcSigs = /* @__PURE__ */ Object.create(null);
  const enumRegistry = /* @__PURE__ */ Object.create(null);
  for (const node of ast.body) {
    if (node.type === "FunctionDecl") {
      funcSigs[node.name] = { paramCount: node.params.length, returnType: UNKNOWN };
    } else if (node.type === "EnumDecl") {
      enumRegistry[node.name] = new Set(node.variants);
    }
  }
  function inferType(expr, env) {
    if (!expr) return null;
    switch (expr.type) {
      case "Literal": {
        if (typeof expr.value === "number") return "num";
        if (typeof expr.value === "string") return "str";
        return "bool";
      }
      case "Identifier": {
        const info = env[expr.name];
        if (!info) {
          report(`Undeclared variable '${expr.name}'`, expr);
          return null;
        }
        return info.type;
      }
      case "Binary": {
        const lt = inferType(expr.left, env);
        const rt = inferType(expr.right, env);
        const op = expr.op;
        const bothKnown = lt && lt !== UNKNOWN && rt && rt !== UNKNOWN;
        if (["+", "-", "*", "/", "//", "%", "**"].includes(op)) {
          if (op === "+" && bothKnown && lt === "str" && rt === "str") return "str";
          if (bothKnown && (lt !== "num" || rt !== "num")) {
            report(`Operator '${op}' requires num operands, got '${lt}' and '${rt}'`, expr);
          }
          return "num";
        }
        if (["<", "<=", ">", ">="].includes(op)) {
          if (bothKnown && (lt !== "num" || rt !== "num")) {
            report(`Operator '${op}' requires num operands, got '${lt}' and '${rt}'`, expr);
          }
          return "bool";
        }
        if (op === "==" || op === "!=") {
          if (bothKnown && lt !== rt) {
            report(`Cannot compare '${lt}' and '${rt}' with '${op}'`, expr);
          }
          return "bool";
        }
        if (bothKnown && (lt !== "bool" || rt !== "bool")) {
          report(`Operator '${op}' requires bool operands, got '${lt}' and '${rt}'`, expr);
        }
        return "bool";
      }
      case "Unary": {
        const t = inferType(expr.expr, env);
        const known = t && t !== UNKNOWN;
        if (expr.op === "-") {
          if (known && t !== "num") report(`Unary '-' requires num, got '${t}'`, expr);
          return "num";
        }
        if (known && t !== "bool") report(`Unary '!' requires bool, got '${t}'`, expr);
        return "bool";
      }
      case "ArrayLiteral": {
        for (const el of expr.elements) inferType(el, env);
        return "array";
      }
      case "IndexAccess": {
        const arrType = inferType(expr.array, env);
        const idxType = inferType(expr.index, env);
        if (arrType && arrType !== UNKNOWN && arrType !== "array") {
          report(`Cannot index into type '${arrType}'`, expr);
        }
        if (idxType && idxType !== UNKNOWN && idxType !== "num") {
          report(`Array index must be 'num', got '${idxType}'`, expr);
        }
        return UNKNOWN;
      }
      case "FString": {
        for (const part of expr.parts) {
          if (part.type === "FStringInterp") inferType(part.expr, env);
        }
        return "str";
      }
      case "MemberAccess": {
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
      case "Call": {
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
        const argTypes = expr.args.map((arg) => inferType(arg, env));
        if (expr.callee === "len" && argTypes.length >= 1) {
          const t = argTypes[0];
          if (t && t !== UNKNOWN && t !== "array" && t !== "str") {
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
        case "VarDecl": {
          const initType = inferType(s.init, env);
          env[s.name] = { kind: s.kind, type: initType ?? UNKNOWN };
          break;
        }
        case "IncrDecr": {
          const info = env[s.target];
          if (!info) {
            report(`Assignment to undeclared variable '${s.target}'`, s);
          } else if (info.kind === "let") {
            report(`Cannot modify immutable variable '${s.target}' (declared with 'let')`, s);
          } else if (info.type && info.type !== UNKNOWN && info.type !== "num") {
            report(`'${s.op}' requires a num variable, got '${info.type}'`, s);
          }
          break;
        }
        case "CompoundAssign": {
          const info = env[s.target];
          if (!info) {
            report(`Assignment to undeclared variable '${s.target}'`, s);
          } else if (info.kind === "let") {
            report(`Cannot modify immutable variable '${s.target}' (declared with 'let')`, s);
          } else {
            const exprType = inferType(s.expr, env);
            const bothKnown = info.type !== UNKNOWN && exprType && exprType !== UNKNOWN;
            if (s.op === "-=") {
              if (bothKnown && (info.type !== "num" || exprType !== "num")) {
                report(`'-=' requires num operands, got '${info.type}' and '${exprType}'`, s);
              }
            } else {
              if (bothKnown && info.type !== exprType) {
                report(`Cannot use '+=' with '${info.type}' and '${exprType}'`, s);
              }
              if (bothKnown && info.type !== "num" && info.type !== "str") {
                report(`'+=' requires num or str operands, got '${info.type}'`, s);
              }
            }
          }
          break;
        }
        case "Assign": {
          const info = env[s.target];
          if (!info) {
            report(`Assignment to undeclared variable '${s.target}'`, s);
          } else if (info.kind === "let") {
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
        case "Print":
          inferType(s.expr, env);
          break;
        case "If": {
          const condType = inferType(s.cond, env);
          if (condType && condType !== UNKNOWN && condType !== "bool") {
            report(`If condition must be 'bool', got '${condType}'`, s.cond);
          }
          walkStmts(s.thenBody || [], Object.create(env), inLoop, currentFunc);
          if (s.elseBody) walkStmts(s.elseBody, Object.create(env), inLoop, currentFunc);
          break;
        }
        case "While": {
          const condType = inferType(s.cond, env);
          if (condType && condType !== UNKNOWN && condType !== "bool") {
            report(`While condition must be 'bool', got '${condType}'`, s.cond);
          }
          walkStmts(s.body || [], Object.create(env), true, currentFunc);
          break;
        }
        case "Return": {
          if (!currentFunc) {
            report(`'return' used outside of a function`, s);
            break;
          }
          const retType = s.expr ? inferType(s.expr, env) : "void";
          const sig = funcSigs[currentFunc.name];
          if (sig.returnType === UNKNOWN) {
            sig.returnType = retType;
          } else if (retType && retType !== UNKNOWN && sig.returnType !== retType) {
            report(`Function '${currentFunc.name}' returns inconsistent types: '${sig.returnType}' and '${retType}'`, s);
          }
          break;
        }
        case "IndexAssign": {
          const info = env[s.target];
          if (!info) {
            report(`Assignment to undeclared variable '${s.target}'`, s);
          } else if (info.kind === "let") {
            report(`Cannot modify immutable array '${s.target}' (declared with 'let')`, s);
          } else if (info.type && info.type !== UNKNOWN && info.type !== "array") {
            report(`Cannot index into '${s.target}' of type '${info.type}'`, s);
          }
          inferType(s.index, env);
          inferType(s.value, env);
          break;
        }
        case "Match": {
          const subjectType = inferType(s.subject, env);
          const wildcardIdx = s.arms.findIndex((a) => a.pattern.type === "WildCard");
          if (wildcardIdx !== -1 && wildcardIdx !== s.arms.length - 1) {
            report(`Wildcard arm must be the last arm in a match expression`, s);
          }
          const seen = /* @__PURE__ */ new Set();
          for (const arm of s.arms) {
            if (arm.pattern.type !== "WildCard") {
              const key = arm.pattern.type === "EnumVariant" ? `${arm.pattern.enum}.${arm.pattern.variant}` : JSON.stringify(arm.pattern.value);
              if (seen.has(key)) {
                report(`Duplicate pattern '${key}' in match expression`, s);
              }
              seen.add(key);
            }
          }
          if (subjectType && subjectType !== UNKNOWN) {
            for (const arm of s.arms) {
              if (arm.pattern.type === "Literal") {
                const patType = typeof arm.pattern.value === "number" ? "num" : typeof arm.pattern.value === "string" ? "str" : "bool";
                if (patType !== subjectType) {
                  report(`Pattern type '${patType}' does not match subject type '${subjectType}'`, s);
                }
              } else if (arm.pattern.type === "EnumVariant") {
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
              if (subjectType === "bool") {
                const hasTrue = s.arms.some((a) => a.pattern.type === "Literal" && a.pattern.value === true);
                const hasFalse = s.arms.some((a) => a.pattern.type === "Literal" && a.pattern.value === false);
                if (!hasTrue || !hasFalse) {
                  report(`Non-exhaustive match on 'bool': must cover both true and false or include a wildcard`, s);
                }
              } else if (subjectType === "num" || subjectType === "str") {
                report(`Non-exhaustive match on '${subjectType}': must include a wildcard arm`, s);
              } else if (enumRegistry[subjectType]) {
                const covered = new Set(
                  s.arms.filter((a) => a.pattern.type === "EnumVariant").map((a) => a.pattern.variant)
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
        case "For": {
          const iterType = inferType(s.iterable, env);
          if (iterType && iterType !== UNKNOWN && iterType !== "array") {
            report(`For loop requires an array, got '${iterType}'`, s.iterable);
          }
          const loopEnv = Object.create(env);
          loopEnv[s.variable] = { kind: "let", type: UNKNOWN };
          walkStmts(s.body || [], loopEnv, true, currentFunc);
          break;
        }
        case "Break":
          if (!inLoop) report(`'break' used outside of a loop`, s);
          break;
        default:
          inferType(s, env);
          break;
      }
    }
  }
  const globalEnv = /* @__PURE__ */ Object.create(null);
  for (const top of ast.body) {
    if (top.type === "FunctionDecl") {
      const funcEnv = Object.create(globalEnv);
      for (const p of top.params || []) {
        funcEnv[p.name] = { kind: "let", type: UNKNOWN };
      }
      walkStmts(top.body || [], funcEnv, false, { name: top.name });
    } else if (top.type === "EnumDecl") {
    } else {
      walkStmts([top], globalEnv, false, null);
    }
  }
  return errors;
}

// src/optimizer.js
function optimize(node) {
  if (!node || typeof node !== "object") return node;
  switch (node.type) {
    case "Program":
      return {
        ...node,
        body: node.body.map(optimize).filter((stmt) => stmt !== null)
        // remove nulls from dead code
      };
    case "EnumDecl":
      return node;
    case "FunctionDecl":
      return {
        ...node,
        body: node.body.map(optimize).filter((stmt) => stmt !== null)
      };
    case "VarDecl":
      return {
        ...node,
        init: node.init ? optimize(node.init) : node.init
      };
    case "Assign":
      const optimizedExpr = optimize(node.expr);
      if (node.target === optimizedExpr?.name && optimizedExpr?.type === "Identifier") {
        return null;
      }
      return {
        ...node,
        expr: optimizedExpr
      };
    case "Print":
      return {
        ...node,
        expr: optimize(node.expr)
      };
    case "If":
      const cond = optimize(node.cond);
      const thenBody = node.thenBody.map(optimize).filter((s) => s !== null);
      const elseBody = node.elseBody ? node.elseBody.map(optimize).filter((s) => s !== null) : null;
      if (cond?.type === "Literal" && cond.value === true) {
        return thenBody.length === 1 ? thenBody[0] : { type: "Block", body: thenBody };
      }
      if (cond?.type === "Literal" && cond.value === false) {
        if (elseBody && elseBody.length > 0) {
          return elseBody.length === 1 ? elseBody[0] : { type: "Block", body: elseBody };
        }
        return null;
      }
      return {
        ...node,
        cond,
        thenBody,
        elseBody
      };
    case "While":
      const whileCond = optimize(node.cond);
      const whileBody = node.body.map(optimize).filter((s) => s !== null);
      if (whileCond?.type === "Literal" && whileCond.value === false) {
        return null;
      }
      return {
        ...node,
        cond: whileCond,
        body: whileBody
      };
    case "Return":
      return {
        ...node,
        expr: node.expr ? optimize(node.expr) : node.expr
      };
    case "Break":
      return node;
    case "Literal":
      return node;
    case "Identifier":
      return node;
    case "MemberAccess":
      return node;
    case "FString":
      return {
        ...node,
        parts: node.parts.map(
          (p) => p.type === "FStringInterp" ? { ...p, expr: optimize(p.expr) } : p
        )
      };
    case "Binary":
      const left = optimize(node.left);
      const right = optimize(node.right);
      if (left?.type === "Literal" && right?.type === "Literal") {
        const l = left.value;
        const r = right.value;
        let result;
        switch (node.op) {
          case "+":
            result = l + r;
            break;
          case "-":
            result = l - r;
            break;
          case "*":
            result = l * r;
            break;
          case "/":
            if (r !== 0) result = l / r;
            break;
          case "//":
            if (r !== 0) result = Math.floor(l / r);
            break;
          case "%":
            if (r !== 0) result = l % r;
            break;
          case "**":
            result = l ** r;
            break;
          case "==":
            result = l === r;
            break;
          case "!=":
            result = l !== r;
            break;
          case "<":
            result = l < r;
            break;
          case "<=":
            result = l <= r;
            break;
          case ">":
            result = l > r;
            break;
          case ">=":
            result = l >= r;
            break;
          case "&&":
            result = l && r;
            break;
          case "||":
            result = l || r;
            break;
        }
        if (result !== void 0) {
          return { type: "Literal", value: result };
        }
      }
      if (left?.type === "Literal") {
        if (node.op === "+" && left.value === 0) return right;
        if (node.op === "*" && left.value === 1) return right;
        if (node.op === "*" && left.value === 0) return { type: "Literal", value: 0 };
        if (node.op === "**" && left.value === 1) return { type: "Literal", value: 1 };
      }
      if (right?.type === "Literal") {
        if ((node.op === "+" || node.op === "-") && right.value === 0) return left;
        if (node.op === "*" && right.value === 1) return left;
        if (node.op === "*" && right.value === 0) return { type: "Literal", value: 0 };
        if (node.op === "/" && right.value === 1) return left;
        if (node.op === "**" && right.value === 0) return { type: "Literal", value: 1 };
      }
      return {
        ...node,
        left,
        right
      };
    case "Unary":
      const expr = optimize(node.expr);
      if (expr?.type === "Literal") {
        let result;
        switch (node.op) {
          case "-":
            result = -expr.value;
            break;
          case "!":
            result = !expr.value;
            break;
        }
        if (result !== void 0) {
          return { type: "Literal", value: result };
        }
      }
      return {
        ...node,
        expr
      };
    case "ArrayLiteral":
      return { ...node, elements: node.elements.map(optimize) };
    case "IndexAccess":
      return { ...node, array: optimize(node.array), index: optimize(node.index) };
    case "IndexAssign":
      return { ...node, index: optimize(node.index), value: optimize(node.value) };
    case "For": {
      const forIterable = optimize(node.iterable);
      const forBody = node.body.map(optimize).filter((s) => s !== null);
      return { ...node, iterable: forIterable, body: forBody };
    }
    case "Match": {
      const matchSubject = optimize(node.subject);
      const matchArms = node.arms.map((arm) => ({
        ...arm,
        body: arm.body.map(optimize).filter((s) => s !== null)
      }));
      if (matchSubject?.type === "Literal") {
        for (const arm of matchArms) {
          if (arm.pattern.type === "WildCard" || arm.pattern.value === matchSubject.value) {
            const b = arm.body;
            if (b.length === 0) return null;
            return b.length === 1 ? b[0] : { type: "Block", body: b };
          }
        }
      }
      return { ...node, subject: matchSubject, arms: matchArms };
    }
    case "Call":
      return {
        ...node,
        args: node.args.map(optimize)
      };
    default:
      return node;
  }
}

// src/generator.js
function indent(n2) {
  return "  ".repeat(n2);
}
function emitExpr(expr, level = 0) {
  switch (expr.type) {
    case "Literal":
      return JSON.stringify(expr.value);
    case "Identifier":
      return expr.name;
    case "Binary":
      if (expr.op === "//") return `Math.floor(${emitExpr(expr.left)} / ${emitExpr(expr.right)})`;
      return `(${emitExpr(expr.left)} ${expr.op} ${emitExpr(expr.right)})`;
    case "Unary":
      return `(${expr.op}${emitExpr(expr.expr)})`;
    case "Call":
      if (expr.callee === "len") return `${emitExpr(expr.args[0])}.length`;
      return `${expr.callee}(${expr.args.map((a) => emitExpr(a)).join(", ")})`;
    case "ArrayLiteral":
      return `[${expr.elements.map((e) => emitExpr(e)).join(", ")}]`;
    case "IndexAccess":
      return `${emitExpr(expr.array)}[${emitExpr(expr.index)}]`;
    case "MemberAccess":
      return `${expr.object}.${expr.member}`;
    case "FString": {
      const content = expr.parts.map(
        (p) => p.type === "FStringText" ? p.value : "${" + emitExpr(p.expr) + "}"
      ).join("");
      return "`" + content + "`";
    }
    default:
      throw new Error(`Unhandled expr kind ${expr.type}`);
  }
}
function emitStmt(stmt, level = 0) {
  switch (stmt.type) {
    case "VarDecl": {
      const kind = stmt.kind === "mut" ? "let" : "const";
      return `${indent(level)}${kind} ${stmt.name} = ${emitExpr(stmt.init)};`;
    }
    case "IncrDecr":
      return `${indent(level)}${stmt.target}${stmt.op};`;
    case "CompoundAssign":
      return `${indent(level)}${stmt.target} ${stmt.op} ${emitExpr(stmt.expr)};`;
    case "Assign":
      return `${indent(level)}${stmt.target} = ${emitExpr(stmt.expr)};`;
    case "Print":
      return `${indent(level)}console.log(${emitExpr(stmt.expr)});`;
    case "If": {
      const thenCode = stmt.thenBody.map((s) => emitStmt(s, level + 1)).join("\n");
      if (stmt.elseBody?.length === 1 && stmt.elseBody[0].type === "If") {
        const chained = emitStmt(stmt.elseBody[0], level);
        return `${indent(level)}if (${emitExpr(stmt.cond)}) {
${thenCode}
${indent(level)}} else ${chained.trimStart()}`;
      }
      const elseCode = stmt.elseBody ? stmt.elseBody.map((s) => emitStmt(s, level + 1)).join("\n") : "";
      return `${indent(level)}if (${emitExpr(stmt.cond)}) {
${thenCode}
${indent(level)}}${elseCode ? " else {\n" + elseCode + "\n" + indent(level) + "}" : ""}`;
    }
    case "While": {
      const body = stmt.body.map((s) => emitStmt(s, level + 1)).join("\n");
      return `${indent(level)}while (${emitExpr(stmt.cond)}) {
${body}
${indent(level)}}`;
    }
    case "Return":
      return stmt.expr ? `${indent(level)}return ${emitExpr(stmt.expr)};` : `${indent(level)}return;`;
    case "Break":
      return `${indent(level)}break;`;
    case "IndexAssign":
      return `${indent(level)}${stmt.target}[${emitExpr(stmt.index)}] = ${emitExpr(stmt.value)};`;
    case "For": {
      const body = stmt.body.map((s) => emitStmt(s, level + 1)).join("\n");
      return `${indent(level)}for (const ${stmt.variable} of ${emitExpr(stmt.iterable)}) {
${body}
${indent(level)}}`;
    }
    case "Match": {
      const lines = [`${indent(level)}{`];
      lines.push(`${indent(level + 1)}const __match = ${emitExpr(stmt.subject)};`);
      let first = true;
      for (const arm of stmt.arms) {
        const bodyCode = arm.body.map((s) => emitStmt(s, level + 2)).join("\n");
        if (arm.pattern.type === "WildCard") {
          lines.push(`${indent(level + 1)}${first ? "" : "else "}{
${bodyCode}
${indent(level + 1)}}`);
        } else {
          const kw = first ? "if" : "else if";
          const patExpr = arm.pattern.type === "EnumVariant" ? `${arm.pattern.enum}.${arm.pattern.variant}` : JSON.stringify(arm.pattern.value);
          lines.push(`${indent(level + 1)}${kw} (__match === ${patExpr}) {
${bodyCode}
${indent(level + 1)}}`);
        }
        first = false;
      }
      lines.push(`${indent(level)}}`);
      return lines.join("\n");
    }
    case "Block":
      return stmt.body.map((s) => emitStmt(s, level)).join("\n");
    default:
      return `${indent(level)}${emitExpr(stmt)};`;
  }
}
var RANGE_HELPER = `function range(start, stop, step) {
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
    if (node.type === "Call" && node.callee === "range") return true;
    if (node.type === "FunctionDecl" && hasRangeCall(node.body)) return true;
    if (node.type === "If" && (hasRangeCall(node.thenBody) || hasRangeCall(node.elseBody))) return true;
    if (node.type === "While" && hasRangeCall(node.body)) return true;
    if (node.type === "For" && (node.iterable?.type === "Call" && node.iterable.callee === "range" || hasRangeCall(node.body))) return true;
    if (node.type === "Match" && node.arms?.some((a) => hasRangeCall(a.body))) return true;
    if (node.args && hasRangeCall(node.args)) return true;
  }
  return false;
}
function generateJS(ast) {
  if (!ast || ast.type !== "Program") throw new Error("Invalid AST for codegen");
  const parts = [];
  if (hasRangeCall(ast.body)) parts.push(RANGE_HELPER);
  for (const node of ast.body) {
    if (node.type === "EnumDecl") {
      const pairs = node.variants.map((v) => `${v}: "${v}"`).join(", ");
      parts.push(`const ${node.name} = Object.freeze({ ${pairs} });`);
    } else if (node.type === "FunctionDecl") {
      const params = node.params.map((p) => p.name).join(", ");
      const body = node.body.map((s) => emitStmt(s, 1)).join("\n");
      parts.push(`function ${node.name}(${params}) {
${body}
}`);
    } else {
      parts.push(emitStmt(node, 0));
    }
  }
  if (ast.body.some((n2) => n2.type === "FunctionDecl" && n2.name === "main")) {
    parts.push("main();");
  }
  return parts.join("\n\n");
}

// src/compiler.js
function compile(source, outputType = "js") {
  const { ast, errors: parseErrors } = buildAST(source);
  if (parseErrors.length) {
    return { result: null, diagnostics: parseErrors.map((m) => ({ severity: "error", message: m })) };
  }
  if (outputType === "parsed") {
    return { result: "Syntax is ok", diagnostics: [] };
  }
  const semErrs = analyze(ast);
  if (semErrs.length) {
    return { result: null, diagnostics: semErrs.map((e) => ({ severity: "error", message: e.message })) };
  }
  if (outputType === "analyzed") {
    return { result: ast, diagnostics: [] };
  }
  const optimizedAst = optimize(ast);
  if (outputType === "optimized") {
    return { result: optimizedAst, diagnostics: [] };
  }
  const code = generateJS(optimizedAst);
  return { result: code, diagnostics: [] };
}
var compiler_default = { compile };
export {
  compile,
  compiler_default as default
};
