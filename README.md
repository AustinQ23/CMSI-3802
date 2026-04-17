# CMSI-3802
# TEMP_JS

<div align="center">
  <img src="docs/tempJS-logo.png" alt="TEMP_JS Logo" width="300" />
</div>

A statically-typed, modern programming language designed for clarity and safety.

### Authors
* Quinn Austin
* Colin Bajo-Smith
* Max Lehmann

---

Programming should be a seamless translation of thought into logic, but too often, developers spend their time fighting runtime errors, obscure type coercions, and unintentional state mutations. We created TEMP_JS to solve these frustrations. TEMP_JS is built on the belief that a compiler should be your strictest mentor and your best friend. By forcing developers to be explicit about mutability and types, TEMP_JS catches bugs before the code ever runs. It pairs the expressive, clean syntax of modern scripting languages with the safety of a strongly-typed, compiled language.

---

## Features

* **Strong Static Typing:** Catch type errors at compile time, not runtime.
* **Immutable by Default:** Variables defined with `let` cannot be mutated. Opt-in to mutability using `mut`.
* **Lexical Scoping:** Predictable scope resolution.
* **Clean Syntax:** Minimalist punctuation where possible without sacrificing readability.
* **First-Class Functions:** Robust support for function declarations, recursive functions, and strict parameter matching.

---

## Static, Safety, and Security Checks

The TEMP_JS compiler performs significant work during the static analysis phase to guarantee safety:

1. **Undeclared Variable Checking:** Variables and functions must be declared before they are used.
2. **Mutability Enforcement:** A compile-time error is thrown if a reassignment is attempted on a `let` variable.
3. **Type Checking:** All assignments, arithmetic operators, and relational operators verify type compatibility (e.g., `3 + "hello"` will fail).
4. **Contextual Constraints:** `break` statements are only valid inside loops. `return` statements are strictly checked to ensure they are only inside function bodies and match the declared return type.
5. **Parameter Matching:** Function calls are evaluated to ensure the arity (number of arguments) and types match the function signature perfectly.