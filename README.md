# CMSI-3802
# TEMP_JS

<div align="center">
  <img src="docs/tempJS-logo.png" alt="TEMP_JS Logo" width="300" />
</div>

A lightweight, type-inferred transpiled programming language designed for clarity, safety, and speed.

GitHub Pages Link: https://austinq23.github.io/TEMP_JS/

### Authors
* Quinn Austin
* Colin Bajo-Smith
* Max Lehmann

---

Programming should be a seamless translation of thought into logic, but too often, developers spend their time fighting runtime errors, overly verbose type systems, and unintentional state mutations. We created TEMP_JS to solve these frustrations. TEMP_JS is built on the belief that a compiler should be your strictest mentor and your best friend. By forcing developers to be explicit about mutability, while intelligently inferring types behind the scenes, TEMP_JS catches logical bugs before the code ever runs. It pairs the expressive, uncluttered syntax of dynamic scripting languages with the safety of an AST-based semantic analyzer.

---

## Features

* **Type Inference:** Catch type errors at compile-time without writing a single type annotation. The compiler infers types from initializers and literals.
* **Immutable by Default:** Variables defined with `let` cannot be mutated. Opt-in to mutability using `mut`.
* **AST Optimization:** Features an optimization phase that automatically performs constant folding and dead code elimination.
* **Clean Syntax:** Minimalist punctuation (no semicolons required) and unified array handling without sacrificing readability.
* **JavaScript Transpilation:** Compiles down to clean, optimized JavaScript (`.js`) ready to be executed in any modern JS environment or browser.

---

## Static, Safety, and Security Checks

The TEMP_JS compiler performs significant work during the semantic analysis phase to guarantee code safety:

1. **Undeclared Variable Checking:** Variables and functions must be declared in their lexical scope before they are used.
2. **Mutability Enforcement:** A compile-time error is immediately thrown if a reassignment is attempted on an immutable `let` variable.
3. **Inferred Type Checking:** All assignments, arithmetic operators, and relational operators verify type compatibility based on inferred types (e.g., attempting `3 + "hello"` will fail).
4. **Contextual Constraints:** `break` statements are strictly checked to ensure they only exist inside loops.
5. **Arity Matching:** Function calls are evaluated during the first pass to ensure the number of provided arguments perfectly matches the function's declared parameter count.