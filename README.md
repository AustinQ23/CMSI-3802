# CMSI-3802
# TEMP_JS

<div align="center">
  <img src="docs/tempJS-logo.png" alt="TEMP_JS Logo" width="300" />
</div>

A lightweight, type-inferred transpiled programming language designed for clarity, safety, and speed.

GitHub Pages Link: https://austinq23.github.io/TEMP_JS/
Grammar: https://github.com/AustinQ23/TEMP_JS/blob/main/src/TEMP_JS.ohm
Slides Presentation: https://docs.google.com/presentation/d/1-9eS556S_GLzTtHdNvy_yfjl33GKdhfrVN-T2aLim_o/edit?usp=sharing

### Authors
* Quinn Austin
* Colin Bajo-Smith
* Max Lehmann

---

Programming should be a seamless translation of thought into logic. By forcing developers to be explicit about mutability, while intelligently inferring types behind the scenes, TEMP_JS catches logical bugs before the code ever runs. It combines the expressive syntax of dynamic scripting languages with a compiler that checks program correctness using an abstract syntax tree.


## Features

* **Type Inference:** Catch type errors at compile-time without writing a single type annotation. The compiler infers types from initializers and literals.
* **Immutable by Default:** Variables defined with `let` cannot be mutated. Opt-in to mutability by using `mut`.
* **Structs:** Group related data into named records with compile-time field validation and optional mutable field assignment.
* **Interfaces:** Define method contracts that structs must implement, enforced entirely at compile time.
* **AST Optimization:** Features an optimization phase that automatically performs constant folding, dead code elimination, and algebraic strength reduction.
* **JavaScript Transpilation:** Compiles down to clean, optimized JavaScript (`.js`) ready to be executed in any modern JS environment or browser.


## Static, Safety, and Security Checks

The TEMP_JS compiler performs significant work during the semantic analysis phase to guarantee code safety:

1. **Undeclared Variable Checking:** Variables and functions must be declared in their lexical scope before they are used.
2. **Mutability Enforcement:** A compile-time error is immediately thrown if a reassignment or mutation (via `++`, `--`, `+=`, `-=`, index assignment, or field assignment) is attempted on an immutable `let` variable or a `for...in` loop iteration variable.
3. **Inferred Type Checking:** All assignments, arithmetic operators, and relational operators verify type compatibility based on inferred types (e.g., attempting `3 + "hello"` will fail).
4. **Contextual Constraints:** `break` statements are strictly checked to ensure they only exist inside loops, and `return` statements are strictly forbidden outside of function bodies.
5. **Arity Matching:** Function and method calls are evaluated during the first pass to ensure the number of provided arguments perfectly matches the declared parameter count or built-in boundaries.
6. **Return Type Consistency:** A function's return type is locked by its first evaluated `return` statement; all subsequent returns within that function are checked to ensure they yield the identical inferred type.
7. **Array Operation Safety:** Bracket notation is validated to ensure it is only applied to `array` types using `num` expressions for the index. Similarly, `for...in` loops mandate an `array` type iterable.
8. **Enum Resolution:** Enum member access is evaluated at compile time to guarantee it references a valid, previously declared variant of that specific enum block.
9. **Exhaustive Pattern Matching:** `match` statements are heavily constrained to prevent unhandled cases at runtime. They must be perfectly exhaustive (mandating wildcards for infinite types like `num` and `str`), contain no duplicate patterns, align perfectly with the subject's type, and place wildcards strictly at the end.
10. **Reserved Keyword Protection:** Identifiers are scanned to ensure variable and function names do not collide with the language's reserved keywords (`fn`, `let`, `mut`, `struct`, `interface`, `impl`, `if`, `else`, `while`, `for`, `in`, `return`, `break`, `print`, `true`, `false`, `match`, `enum`).
11. **Struct Field Completeness:** Struct literals must provide every field declared in the struct definition — no missing and no extra fields are permitted.
12. **Struct Field Validity:** Field access (`p.x`) and field assignment (`p.x = v`) are validated at compile time against the struct's declared field list.
13. **Interface Contract Enforcement:** An `impl` block must implement every method declared by the interface. 
14. **Method Call Validation:** Method calls (`c.describe()`) verify at compile time that the variable's type has an `impl`, that the method exists on it, and that the correct number of arguments are provided.

## Example Programs

Here are seven complete programs covering every syntactic form in TEMP_JS. Try copying them into a `.tempjs` file and running them through the compiler!

### 1. Enums and Pattern Matching

This example demonstrates how to define **Enums** and use the **Match** statement to handle data variants.

```
enum Direction { North South East West }

enum Season { Spring Summer Fall Winter }

fn describe_direction(d) {
    match d {
        Direction.North => { return "Heading north" }
        Direction.South => { return "Heading south" }
        Direction.East  => { return "Heading east" }
        Direction.West  => { return "Heading west" }
    }
}

fn is_warm(s) {
    match s {
        Season.Spring => { return true }
        Season.Summer => { return true }
        Season.Fall   => { return false }
        Season.Winter => { return false }
    }
}

fn main() {
    let d = Direction.North
    print(describe_direction(d))

    let dirs = [Direction.North, Direction.South, Direction.East, Direction.West]
    for dir in dirs {
        print(describe_direction(dir))
    }

    let s = Season.Summer
    let warm = is_warm(s)
    match warm {
        true  => { print("Warm season") }
        false => { print("Cold season") }
    }
}
```

### 2. Functions and String Interpolation

Here you can see **Function declarations** in action, along with **f-strings** (formatted strings).

```
fn greet(name) {
  return f"Hello, {name}!"
}

fn describe_score(score) {
  let grade = "unknown"
  if score >= 90 {
    let grade = "A"
    print(f"Score: {score} — Grade: {grade}")
  } else {
    if score >= 80 {
      let grade = "B"
      print(f"Score: {score} — Grade: {grade}")
    } else {
      print(f"Score: {score} — Grade: {grade}")
    }
  }
}

fn main() {
  let name = "Alice"
  let msg = greet(name)
  print(msg)

  let x = 7
  let y = 3
  print(f"{x} + {y} = {x + y}")
  print(f"{x} * {y} = {x * y}")

  describe_score(95)
  describe_score(82)
  describe_score(70)
}
```

### 3. Conditionals and While Loops

This program uses a **while loop**. It combines `match` on numbers and booleans to convert raw values into descriptive strings, demonstrating how TEMP_JS handles state changes and branching logic together.

```
fn day_name(n) {
    match n {
        1 => { return "Monday" }
        2 => { return "Tuesday" }
        3 => { return "Wednesday" }
        4 => { return "Thursday" }
        5 => { return "Friday" }
        6 => { return "Saturday" }
        7 => { return "Sunday" }
        _ => { return "Unknown" }
    }
}

fn is_weekend(n) {
    match n {
        6 => { return true }
        7 => { return true }
        _ => { return false }
    }
}

fn day_type(weekend) {
    match weekend {
        true => { return "Weekend" }
        false => { return "Weekday" }
    }
}

fn main() {
    mut day = 1
    while day <= 7 {
        let name = day_name(day)
        let weekend = is_weekend(day)
        let kind = day_type(weekend)
        print(name)
        print(kind)
        day = day + 1
    }
}
```

### 4. Ranges and For-In Loops

This example showcases the built-in **range()** function.

```
fn sum_range(n) {
  mut total = 0
  for i in range(n) {
    total += i
  }
  return total
}

fn main() {
  # range(stop) — 0 up to stop
  for x in range(5) {
    print(x)
  }

  # range(start, stop)
  for x in range(10, 15) {
    print(x)
  }

  # range(start, stop, step)
  for x in range(0, 20, 4) {
    print(x)
  }

  let s = sum_range(10)
  print(f"Sum 0..9 = {s}")
}
```

### 5. Arrays and Mutability

This example focuses on **array manipulation** and the distinction between `let` and `mut` collections. It shows how to pass arrays into functions, iterate over them with `for-in`, and perform **index assignment** — which the compiler only permits on `mut` arrays.

```
fn sum(nums) {
    mut total = 0
    for n in nums {
        total = total + n
    }
    return total
}

fn main() {
    let nums = [1, 2, 3, 4, 5]
    let result = sum(nums)
    print(result)

    mut scores = [10, 20, 30]
    scores[0] = 99
    print(scores[0])

    for x in [10, 20, 30] {
        print(x)
    }
}
```

### 6. Structs and Field Access

This example introduces **structs**, TEMP_JS's named record type. It shows how to declare a struct, create both immutable and mutable instances, read fields with dot notation, mutate fields on `mut` variables, pass structs into functions, and store them in arrays.

```
struct Point { x y }

struct Rectangle { width height }

fn area(r) {
    return r.width * r.height
}

fn perimeter(r) {
    return 2 * r.width + 2 * r.height
}

fn distance_sq(p) {
    return p.x * p.x + p.y * p.y
}

fn main() {
    let p = Point { x: 3, y: 4 }
    print(f"Point: ({p.x}, {p.y})")
    print(f"Distance squared from origin: {distance_sq(p)}")

    mut q = Point { x: 0, y: 0 }
    q.x = 6
    q.y = 8
    print(f"Moved point: ({q.x}, {q.y})")
    print(f"Distance squared from origin: {distance_sq(q)}")

    let r = Rectangle { width: 5, height: 3 }
    print(f"Rectangle: {r.width}x{r.height}")
    print(f"Area: {area(r)}")
    print(f"Perimeter: {perimeter(r)}")

    let points = [Point { x: 1, y: 2 }, Point { x: 3, y: 4 }, Point { x: 5, y: 6 }]
    for pt in points {
        print(f"({pt.x}, {pt.y})")
    }
}
```

### 7. Interfaces and Method Calls

This example demonstrates **interfaces** and **impl blocks**. An interface declares the method signatures a type must provide; the `impl` block attaches those methods to a struct, with `self` referring to the instance.

```
interface Describable {
    fn describe()
}

struct Circle { radius }
struct Rect { width height }

impl Circle for Describable {
    fn describe() {
        return f"Circle with radius {self.radius}"
    }
}

impl Rect for Describable {
    fn describe() {
        return f"Rect {self.width}x{self.height}"
    }
}

fn main() {
    let c = Circle { radius: 5 }
    let r = Rect { width: 4, height: 6 }
    print(c.describe())
    print(r.describe())

    let shapes = [Circle { radius: 1 }, Circle { radius: 3 }, Circle { radius: 7 }]
    for s in shapes {
        print(s.describe())
    }
}
```