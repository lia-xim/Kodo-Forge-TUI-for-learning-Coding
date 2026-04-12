# Section 3: String Enums

> Estimated reading time: **10 minutes**
>
> Previous Section: [02 - Numeric Enums](./02-numerische-enums.md)
> Next Section: [04 - Enums vs Union Literals](./04-enums-vs-union-literals.md)

---

## What you'll learn here

- Why string enums have **no reverse mapping**
- The advantages of string enums over numeric enums
- How string enums compile to **readable JavaScript**
- When string enums are the right choice

---

## String Enums: The Safer Alternative

With string enums, every member has an **explicit string value**:

```typescript annotated
enum LogLevel {
  Debug = "DEBUG",
  Info = "INFO",
  Warning = "WARNING",
  Error = "ERROR",
}
// ^ Every member needs an explicit string value

console.log(LogLevel.Debug);   // "DEBUG"
console.log(LogLevel.Error);   // "ERROR"
```

### No Auto-Increment for Strings

Unlike numeric enums, there is **no auto-increment**:

```typescript
// This does NOT work:
// enum Broken {
//   A = "ALPHA",
//   B,  // Error! String enums need explicit values for EVERY member
// }
```

This is intentional: there is no meaningful "next" string sequence.
What would the auto-increment of `"ALPHA"` be — `"ALPHB"`? `"BETA"`?

---

## No Reverse Mapping

The biggest difference from numeric enums:

```typescript annotated
enum LogLevel {
  Debug = "DEBUG",
  Info = "INFO",
}

// Forward: Name -> Value
console.log(LogLevel.Debug);   // "DEBUG"

// Reverse: Value -> Name? NO!
// console.log(LogLevel["DEBUG"]);  // Error! Doesn't exist

// The generated JavaScript:
// var LogLevel;
// (function (LogLevel) {
//     LogLevel["Debug"] = "DEBUG";
//     LogLevel["Info"] = "INFO";
// })(LogLevel || (LogLevel = {}));

// Only one-directional entries — NO "DEBUG": "Debug" in the object
```

> 🧠 **Explain to yourself:** Why is the absence of reverse mapping
> an ADVANTAGE? Think about iteration with `Object.keys()`.
> **Key points:** No duplicate entries | Object.keys returns only enum names | Object.values returns only values | Iteration is safe and predictable

---

## Advantages of String Enums

### 1. Readable Debug Output

```typescript annotated
enum Status {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
}

enum NumericStatus {
  Active,    // 0
  Inactive,  // 1
}

const user = { status: Status.Active };
console.log(user);
// ^ { status: "ACTIVE" } — immediately readable!

const user2 = { status: NumericStatus.Active };
console.log(user2);
// ^ { status: 0 } — what does 0 mean?! Debugging nightmare.
```

### 2. No Accidental Number Assignment

```typescript annotated
enum StringStatus {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
}

// const s: StringStatus = "RANDOM";
// ^ Error! "RANDOM" is not assignable to StringStatus

// const s2: StringStatus = 42;
// ^ Error! 42 is not assignable to StringStatus

// Compare with numeric enum:
enum NumStatus {
  Active,
  Inactive,
}

const n: NumStatus = 42;
// ^ NO Error! TypeScript allows any number (soundness hole)
```

### 3. Safe Iteration

```typescript annotated
enum Color {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE",
}

// Object.keys works as expected:
console.log(Object.keys(Color));
// ^ ["Red", "Green", "Blue"] — exactly 3, no surprises

console.log(Object.values(Color));
// ^ ["RED", "GREEN", "BLUE"] — exactly 3 values
```

> 📖 **Background: The TypeScript Team's Recommendation**
>
> The official TypeScript docs state: "String enums [...] give you a
> better debugging experience." The recommendation is clear: if you use enums,
> prefer string enums — unless you need bitwise flags or reverse mapping.
>
> In practice, many teams go even further and don't use enums at all,
> using Union Literal Types instead (more on this in Section 4).

---

## Heterogeneous Enums (and why you should avoid them)

TypeScript allows enums that **mix string and number values**:

```typescript annotated
enum Mixed {
  No = 0,
  Yes = "YES",
}
// ^ Technically possible, but WHY?

// This is almost always a sign of poor design.
// TypeScript allows it, but the community strongly advises against it.
```

> 💭 **Think about it:** Why does TypeScript allow heterogeneous enums even though
> they are almost never useful?
>
> **Answer:** Backward compatibility. Early TypeScript versions
> didn't have this restriction, and existing code would have broken.
> The TypeScript team almost never introduces breaking changes —
> even for features they would design differently today.

---

## String Enums and Type Narrowing

String enums work well with switch statements:

```typescript annotated
enum Theme {
  Light = "LIGHT",
  Dark = "DARK",
  System = "SYSTEM",
}

function applyTheme(theme: Theme): string {
  switch (theme) {
    case Theme.Light:
      return "Light background";
    case Theme.Dark:
      return "Dark background";
    case Theme.System:
      return "Use system setting";
    // No default needed — all cases covered
    // TypeScript reports an error if a new member
    // is added and no case exists (with strictNullChecks)
  }
}
```

### But: No Direct String Comparison!

```typescript annotated
enum Theme {
  Light = "LIGHT",
  Dark = "DARK",
}

function setTheme(theme: Theme) {
  // WRONG — String comparison doesn't work!
  // if (theme === "LIGHT") { }
  // ^ Error! "LIGHT" is not comparable to Theme

  // CORRECT — Use enum member:
  if (theme === Theme.Light) { }
  // ^ OK
}
```

This is both an advantage and a disadvantage: it enforces consistency,
but makes working with external strings cumbersome.

> 🧠 **Explain to yourself:** Why does TypeScript forbid the direct
> comparison `theme === "LIGHT"`, even though the enum value is exactly `"LIGHT"`?
> **Key points:** Enum is its own nominal type | Not structurally compatible with string | Enforces use of enum reference | Prevents typos in string literals

---

## What You've Learned

- String enums require **explicit values** for every member
- There is **no reverse mapping** and **no auto-increment**
- String enums produce **readable debug output**
- They prevent the **soundness hole** of numeric enums (no arbitrary numbers)
- **Iteration** with Object.keys/values works cleanly
- Direct **string comparison is not possible** — only enum members

**Core concept to remember:** String enums solve the biggest problems of numeric enums, but have one drawback: they still generate runtime code and are not directly comparable with strings.

> ⚡ **In your Angular project:**
>
> ```typescript
> // String Enums in Angular Services — readable API communication:
> enum ApiEnvironment {
>   Development = "https://dev.api.example.com",
>   Staging     = "https://staging.api.example.com",
>   Production  = "https://api.example.com",
> }
>
> @Injectable({ providedIn: "root" })
> export class ApiService {
>   private baseUrl = ApiEnvironment.Development;
>
>   constructor(private http: HttpClient) {}
>
>   getUsers() {
>     // this.baseUrl is "https://dev.api.example.com" — immediately readable!
>     return this.http.get(`${this.baseUrl}/users`);
>   }
> }
>
> // In React, this would be a context value:
> // const ApiContext = React.createContext<ApiEnvironment>(ApiEnvironment.Development);
> ```

> **Experiment:** Try the following in the TypeScript Playground:
> ```typescript
> enum LogLevel {
>   Debug = "DEBUG",
>   Info = "INFO",
>   Warning = "WARNING",
>   Error = "ERROR",
> }
>
> // String Enum:
> console.log(Object.keys(LogLevel));    // ["Debug", "Info", "Warning", "Error"]
> console.log(Object.values(LogLevel));  // ["DEBUG", "INFO", "WARNING", "ERROR"]
>
> // Now change it to a numeric enum:
> // enum LogLevel { Debug, Info, Warning, Error }
>
> // What changes with Object.keys() and Object.values()?
> // Can you still call LogLevel["DEBUG"]?
>
> // Bonus: Why does this fail?
> // const level: LogLevel = "DEBUG"; // ???
> ```
> Compare the output of `Object.keys()` with string vs. numeric enums.
> Explain why the direct string comparison `=== "DEBUG"` produces an error
> in a string enum function.

---

> **Break point** — You now know both enum variants. In the next section,
> we'll compare enums with their alternatives.
>
> Continue with: [Section 04: Enums vs Union Literals](./04-enums-vs-union-literals.md)