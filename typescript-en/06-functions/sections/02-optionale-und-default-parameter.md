# Section 2: Optional and Default Parameters

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - Function Type Basics](./01-function-type-basics.md)
> Next section: [03 - Function Overloads](./03-function-overloads.md)

---

## What you'll learn here

- How **optional parameters** (`?`) work and what they mean internally
- Why **default values** are often better than optional parameters
- How **rest parameters** (`...args`) enable type-safe variadic functions
- Typing **destructuring** in function parameters

---

## Optional Parameters

In JavaScript, you can omit any argument — it simply becomes
`undefined`. TypeScript makes this **explicit**:

```typescript annotated
function greet(name: string, greeting?: string): string {
//                           ^^^^^^^^^ The ? makes the parameter optional
  return `${greeting ?? "Hello"}, ${name}!`;
//              ^^  Nullish Coalescing: "Hello" if greeting is undefined
}

greet("Max");              // "Hello, Max!"
greet("Max", "Hey");       // "Hey, Max!"
greet("Max", undefined);   // "Hello, Max!"  — explicit undefined works too
```

### What `?` means internally

```typescript
// These two signatures are ALMOST identical:
function a(x?: string): void {}     // x is string | undefined
function b(x: string | undefined): void {}

// BUT: with a() you can OMIT x:
a();            // OK
a(undefined);   // OK
a("hello");     // OK

// With b() you MUST pass x:
b();            // Error! Expected 1 argument
b(undefined);   // OK
b("hello");     // OK
```

> 💭 **Think question:** When would you use `x?: string` and when `x: string | undefined`?
> Think about the difference for the caller.
>
> **Answer:** `x?: string` when the caller is allowed to omit the parameter entirely
> (configuration options, optional features). `x: string | undefined`
> when the caller should **consciously decide** whether to pass undefined —
> e.g. with `resetField(field, value: string | undefined)` where undefined
> means "reset".

### The Ordering Rule

```typescript
// CORRECT: Optional parameters come AFTER required parameters
function format(text: string, width?: number, fill?: string): string {
  return text.padStart(width ?? 20, fill ?? " ");
}

// WRONG: Optional parameters BEFORE required parameters
// function bad(width?: number, text: string): string { ... }
//              ^^^^^^ Error! A required parameter cannot follow
//                     an optional parameter.
```

> 📖 **Background: Why this restriction?**
>
> In languages like Python you can use named parameters:
> `greet(name="Max", greeting="Hello")`. In JavaScript/TypeScript,
> arguments are **position-based** — the third argument is always the
> third parameter. If an optional parameter came before a required one,
> you'd have to pass `undefined` as a placeholder. TypeScript prevents
> this anti-pattern. For named parameters, use an options object instead
> (see below).

---

## Default Parameters

Default values are often **better** than optional parameters because they
eliminate the `undefined` check:

```typescript annotated
function createUser(
  name: string,
  role: string = "user",
//      ^^^^^^^^^^^^^^^ Default value makes ? unnecessary
  active: boolean = true,
): { name: string; role: string; active: boolean } {
  return { name, role, active };
}

createUser("Max");                   // { name: "Max", role: "user", active: true }
createUser("Anna", "admin");         // { name: "Anna", role: "admin", active: true }
createUser("Bob", "editor", false);  // { name: "Bob", role: "editor", active: false }
```

**Important:** A parameter with a default value is automatically optional —
you don't need an additional `?`:

```typescript
// WRONG: ? and default at the same time
function bad(x?: number = 42) {}
//           ^^^^^^^^^^ Error! Parameter cannot be both
//                      optional and have an initializer.

// CORRECT: Default value only
function good(x: number = 42) {}
```

> 🧠 **Explain to yourself:** Why can't a parameter have both `?` and a default value? What would that mean, and why is it redundant?
> **Key points:** ? means "can be undefined" | Default automatically replaces undefined | Both together is contradictory | Default alone is sufficient

---

## Rest Parameters

For functions with **any number of arguments**:

```typescript annotated
function sum(...numbers: number[]): number {
//          ^^^^^^^^^^^ Rest parameter: collects all arguments into an array
  return numbers.reduce((acc, n) => acc + n, 0);
}

sum(1, 2, 3);       // 6
sum(10, 20);         // 30
sum();               // 0  — empty array is OK
```

### Rest Parameters with Leading Parameters

```typescript annotated
function log(level: "info" | "warn" | "error", ...messages: string[]): void {
//           ^^^^^ First parameter is required   ^^^^^^^^^^^^^^^^^^^
//                                               Rest parameter collects the rest
  const prefix = `[${level.toUpperCase()}]`;
  console.log(prefix, ...messages);
}

log("info", "Server started", "Port: 3000");
// [INFO] Server started Port: 3000
```

### Rest Parameters as Tuple

```typescript annotated
function move(
  ...args: [x: number, y: number] | [x: number, y: number, z: number]
//          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//          Tuple type: exactly 2 or 3 numbers allowed
): void {
  const [x, y, z] = args;
  console.log(`Move to (${x}, ${y}${z !== undefined ? `, ${z}` : ""})`);
}

move(10, 20);      // "Move to (10, 20)"
move(10, 20, 30);  // "Move to (10, 20, 30)"
// move(10);       // Error! Requires 2 or 3 arguments
```

> 🔍 **Going Deeper: `arguments` vs Rest Parameters**
>
> In old JavaScript there was the `arguments` object — an array-like
> object containing all arguments. It was **not typeable** and had
> no real array methods. Rest parameters (`...args`) are the
> modern replacement: type-safe, a real array, and visible in the type.
> TypeScript never properly supported `arguments` — always use
> **rest parameters** instead.

---

## Destructuring in Parameters

Object destructuring in function parameters is **unusual** to type in TypeScript:

```typescript annotated
// WRONG — this looks like renaming but is a type error:
// function greet({ name: string, age: number }) { ... }
//                       ^^^^^^ "string" would be interpreted as an ALIAS for name

// CORRECT — the type comes AFTER the destructuring pattern:
function greet({ name, age }: { name: string; age: number }): string {
//             ^^^^^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//             Destructuring   Type of the entire object
  return `${name} is ${age} years old`;
}

greet({ name: "Max", age: 30 }); // "Max is 30 years old"
```

### Better: With Interface or Type Alias

```typescript annotated
interface UserInfo {
  name: string;
  age: number;
  email?: string;  // optional property
}

function greet({ name, age, email }: UserInfo): string {
//             ^^^^^^^^^^^^^^^^^^^^^^ Much more readable with a named type!
  let msg = `${name} is ${age} years old`;
  if (email) {
    msg += ` (${email})`;
  }
  return msg;
}
```

### The Options Object Pattern

The most important pattern for functions with many optional parameters:

```typescript annotated
interface FetchOptions {
  url: string;               // required
  method?: "GET" | "POST";   // optional, default: "GET"
  timeout?: number;          // optional, default: 5000
  headers?: Record<string, string>;  // optional
}

function fetchData({
  url,
  method = "GET",
  timeout = 5000,
  headers = {},
}: FetchOptions): void {
  console.log(`${method} ${url} (timeout: ${timeout}ms)`);
  console.log("Headers:", headers);
}

// Only provide the required field — everything else has defaults:
fetchData({ url: "https://api.example.com/users" });

// Override some options:
fetchData({ url: "https://api.example.com/users", method: "POST", timeout: 10000 });
```

> **Experiment:** Try the following in the TypeScript Playground:
>
> ```typescript
> interface FetchOptions {
>   url: string;
>   method?: "GET" | "POST";
>   timeout?: number;
> }
>
> function fetchData({
>   url,
>   method = "GET",  // <-- remove this default value
>   timeout = 5000,
> }: FetchOptions): void {
>   console.log(`${method.toUpperCase()} ${url}`);
>   //              ^^^^^^ What happens here without a default?
> }
> ```
>
> Without the default value, `method` inside the function has type
> `"GET" | "POST" | undefined`. TypeScript now requires an
> `undefined` check before you can call `.toUpperCase()` —
> the compiler catches the potential runtime error.

---

**In your Angular project:** The options object pattern is the standard pattern
for Angular services and configuration. A typical Angular HTTP call looks
almost identical:

```typescript
// Angular HttpClient uses the same pattern internally
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface ApiOptions {
  headers?: HttpHeaders;
  params?: Record<string, string>;
  reportProgress?: boolean;
}

// In your service:
getUserData(id: number, options: ApiOptions = {}): Observable<User> {
  return this.http.get<User>(`/api/users/${id}`, options);
}

// Caller only specifies what they need:
this.getUserData(42, { reportProgress: true });
this.getUserData(42);  // headers and params have defaults
```

Rest parameters appear in Angular in logging services or when forwarding
multiple arguments to `console.log`: `logger.log("DB", "query", sql)`.

---

## What you've learned

- **Optional parameters** (`?`) add `undefined` to the type and make the argument omittable
- **Default values** are often better than `?`, because they automatically replace `undefined`
- **Rest parameters** (`...args`) replace the unsafe `arguments` object
- **Destructuring** in parameters needs the type AFTER the pattern: `{ name }: { name: string }`
- The **options object pattern** is ideal for functions with many optional parameters

> 🧠 **Explain to yourself:** Why is `function greet({ name: string })` an error? What does TypeScript think `string` means here, and how do you write it correctly?
> **Key points:** TypeScript sees string as an alias/rename (destructuring rename) | Not as a type annotation | Correct: { name }: { name: string } | Type comes after the entire pattern

**Key Concept to Remember:** Default values > Optional parameters > Union with undefined. Always choose the most precise variant.

---

> **Break point** — You've now mastered the most important parameter variants.
> Next up, things get advanced: Function Overloads.
>
> Continue with: [Section 03: Function Overloads](./03-function-overloads.md)