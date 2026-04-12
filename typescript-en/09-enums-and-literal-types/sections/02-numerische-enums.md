# Section 2: Numeric Enums

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - Literal Types](./01-literal-types.md)
> Next section: [03 - String Enums](./03-string-enums.md)

---

## What you'll learn here

- How numeric enums work and what the compiler does with them
- What **reverse mapping** is and why it's both useful and dangerous
- How **auto-increment** works and what pitfalls it has
- Why enums are the **only TypeScript construct** that generates runtime code

---

## Enums: The Exception to Type Erasure

In lesson 02 you learned: TypeScript types disappear at runtime (type erasure).
Enums are the **big exception**. They generate real JavaScript code:

```typescript annotated
enum Direction {
  Up,
  Down,
  Left,
  Right,
}
// ^ Looks like a pure type — but it's NOT

// What the compiler generates (JavaScript):
// var Direction;
// (function (Direction) {
//     Direction[Direction["Up"] = 0] = "Up";
//     Direction[Direction["Down"] = 1] = "Down";
//     Direction[Direction["Left"] = 2] = "Left";
//     Direction[Direction["Right"] = 3] = "Right";
// })(Direction || (Direction = {}));
```

> 📖 **Background: Why do enums generate runtime code?**
>
> When TypeScript was created in 2012, enums were one of the few features
> deliberately excluded from type erasure. The reason: developers from C#
> and Java expected enums to be available as values at runtime — for example,
> for iterating over all values or reverse mapping.
>
> Today many TypeScript experts (including members of the TypeScript team)
> see this as a design mistake. Ryan Cavanaugh said in 2022:
> "If we were designing TypeScript from scratch today, there probably
> wouldn't be enums." Instead, union literal types and `as const`
> would be used.

---

## Auto-Increment: Automatic Numbering

Without explicit values, TypeScript counts up from 0:

```typescript annotated
enum Status {
  Draft,      // 0
  Published,  // 1
  Archived,   // 2
}

console.log(Status.Draft);     // 0
console.log(Status.Published); // 1
console.log(Status.Archived);  // 2
```

You can change the starting value:

```typescript annotated
enum HttpStatus {
  Ok = 200,
  Created = 201,
  BadRequest = 400,
  NotFound = 404,
  InternalError = 500,
}

// Auto-increment also works from a different starting value:
enum Priority {
  Low = 1,
  Medium,     // 2 (auto-increment from 1)
  High,       // 3
  Critical,   // 4
}
```

### The Auto-Increment Trap

A subtle danger lurks here:

```typescript annotated
enum Permissions {
  Read = 1,
  Write = 2,
  Execute = 4,
  // Bitwise flags — need explicit values!
}

// WRONG — if someone later expects auto-increment:
enum PermissionsBroken {
  None = 0,
  Read,     // 1 — OK
  Write,    // 2 — OK
  Execute,  // 3 — WRONG! Should be 4 (bitwise)
}
```

> 🧠 **Explain it to yourself:** Why is auto-increment dangerous with bitwise flags?
> What happens when you want to compute `Read | Write` and the values are
> 1, 2, 3 instead of 1, 2, 4?
> **Key points:** Bitwise OR requires powers of two | 1|2=3 works | 1|2=3 with values 1,2,3 collides with Execute(3) | Always use explicit values for flags

---

## Reverse Mapping: From Value to Name

The unique feature of numeric enums:

```typescript annotated
enum Color {
  Red,    // 0
  Green,  // 1
  Blue,   // 2
}

// Forward: name -> value
console.log(Color.Red);   // 0
console.log(Color.Green); // 1

// Reverse: value -> name
console.log(Color[0]);    // "Red"
console.log(Color[1]);    // "Green"
```

### How does it work?

The generated JavaScript object has **duplicate entries**:

```typescript
// The generated JavaScript object looks like this:
// {
//   0: "Red",     <-- Reverse mapping
//   1: "Green",   <-- Reverse mapping
//   2: "Blue",    <-- Reverse mapping
//   Red: 0,       <-- Forward mapping
//   Green: 1,     <-- Forward mapping
//   Blue: 2,      <-- Forward mapping
// }
```

### The Pitfalls of Reverse Mapping

**Problem 1: Iteration is dangerous**

```typescript annotated
enum Color {
  Red,
  Green,
  Blue,
}

// Object.keys returns ALL keys — including the reverse mappings!
console.log(Object.keys(Color));
// ^ ["0", "1", "2", "Red", "Green", "Blue"] — 6 instead of 3!

// Object.values has the same problem:
console.log(Object.values(Color));
// ^ ["Red", "Green", "Blue", 0, 1, 2] — mixed!

// Correct iteration: filter only the numeric values
const colorNames = Object.keys(Color).filter(k => isNaN(Number(k)));
// ^ ["Red", "Green", "Blue"]
```

**Problem 2: TypeScript allows any number**

```typescript annotated
enum Color {
  Red,
  Green,
  Blue,
}

// This compiles WITHOUT error:
const c: Color = 42;
// ^ 42 is NOT a defined Color value, but TypeScript allows it!

// This is a known soundness hole in TypeScript.
// String enums do NOT have this problem.
```

> 🔍 **Deeper knowledge: Why does TypeScript allow any number?**
>
> The soundness hole exists because numeric enums are also used for
> **bitwise flags**. With `Permissions.Read | Permissions.Write`
> you get `3` — a value not explicitly defined in the enum.
> TypeScript would otherwise have to prohibit bitwise operations on enums.
>
> The decision was: better to allow bitwise flags and accept a
> security gap in return. For string enums this concession wasn't
> necessary — that's why they're stricter.

> 💭 **Think about it:** If you design an API that takes a status code as
> an enum — how do you ensure only valid values arrive, even though
> TypeScript allows any number?
>
> **Answer:** You must check at runtime! A function like
> `Object.values(MyEnum).includes(value)` validates the value.
> Or use string enums, which don't have this problem.

---

## Computed Enum Values

Enum values can also be expressions:

```typescript annotated
enum FileAccess {
  None = 0,
  Read = 1 << 0,     // 1 (bit shift)
  Write = 1 << 1,    // 2
  Execute = 1 << 2,  // 4
  ReadWrite = Read | Write,  // 3 (bitwise OR)
  All = Read | Write | Execute,  // 7
}

// But CAUTION: after a computed value, auto-increment is not possible!
// enum Broken {
//   A = "hello".length,  // 5 (computed)
//   B,                   // Error! No auto-increment after computed value
// }
```

---

## What you've learned

- Numeric enums generate **real JavaScript code** — no type erasure
- **Auto-increment** counts up from 0 (or a starting value)
- **Reverse mapping** allows access from value to name: `Color[0]` returns `"Red"`
- Iterating over enums is dangerous due to duplicate entries
- TypeScript allows **any number** as a numeric enum value (soundness hole)
- Auto-increment is not possible after computed values

> 🧠 **Explain it to yourself:** Why is reverse mapping a problem when iterating?
> What happens if you use `Object.keys(Color)` and check the length?
> **Key points:** Duplicate entries (names + numbers) | Object.keys returns 6 instead of 3 | Must filter numeric keys | Alternative: string enums without reverse mapping

**Core concept to remember:** Numeric enums are powerful, but also the most error-prone enum variant. In most cases, string enums or union literal types are the better choice.

> ⚡ **In your Angular project:**
>
> ```typescript
> // Bitwise flags — one of the few legitimate use cases
> // for numeric enums in Angular:
> enum UserRole {
>   None    = 0,
>   Reader  = 1 << 0,  // 1
>   Editor  = 1 << 1,  // 2
>   Admin   = 1 << 2,  // 4
>   All     = Reader | Editor | Admin,  // 7
> }
>
> // Route guards can check bitwise roles:
> function canActivate(userRole: number): boolean {
>   return (userRole & UserRole.Admin) !== 0;
> }
>
> // CAUTION: For status fields, numeric enums are UNSUITABLE.
> // status: 2 in an API response is unreadable!
> // Use string enums or union literals for status.
> ```

> **Experiment:** Try the following in the TypeScript Playground:
> ```typescript
> enum Direction {
>   Up,     // 0
>   Down,   // 1
>   Left,   // 2
>   Right,  // 3
> }
>
> // Execute this mentally — what does each line return?
> console.log(Object.keys(Direction));    // ???
> console.log(Object.values(Direction));  // ???
> console.log(Direction[0]);              // ???
> console.log(Direction["Up"]);           // ???
>
> // The soundness hole:
> const d: Direction = 42;  // Does this compile without error?
> ```
> Surprise: `Object.keys()` returns 8 entries, not 4.
> Why? And why is `const d: Direction = 42` not an error?

---

> **Pause point** — You've understood the most complex enum variant.
> String enums in the next section are considerably simpler.
>
> Continue with: [Section 03: String Enums](./03-string-enums.md)