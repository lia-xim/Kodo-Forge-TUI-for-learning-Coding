# Section 3: Function Overloads

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - Optional and Default Parameters](./02-optionale-und-default-parameter.md)
> Next section: [04 - Callback Types](./04-callback-typen.md)

---

## What you'll learn here

- What **function overloads** in TypeScript are and how they differ from Java/C#
- The difference between **overload signatures** and the **implementation signature**
- When overloads are **useful** and when to avoid them
- How TypeScript selects the **correct overload signature**

---

## The Problem: One Function, Multiple Forms

Imagine you're writing a `createElement` function:

```typescript
// This function should create different elements:
createElement("img")     // → HTMLImageElement
createElement("input")   // → HTMLInputElement
createElement("div")     // → HTMLDivElement
```

**The problem:** The return type depends on the value of the argument.
A simple union type can't express this precisely:

```typescript
// Imprecise: return is ALWAYS the wide union
function createElement(tag: "img" | "input" | "div"):
  HTMLImageElement | HTMLInputElement | HTMLDivElement {
  // ...
}

const img = createElement("img");
// Type: HTMLImageElement | HTMLInputElement | HTMLDivElement
// But we KNOW it must be an HTMLImageElement!
```

This is where **overloads** come in.

---

## Overloads: Syntax and Structure

```typescript annotated
// ─── Overload signatures (visible to the caller) ──────────────────────
function createElement(tag: "img"): HTMLImageElement;
function createElement(tag: "input"): HTMLInputElement;
function createElement(tag: "div"): HTMLDivElement;
// ─── Implementation signature (ONLY visible internally) ───────────────
function createElement(tag: string): HTMLElement {
//                     ^^^^^^^^^^^ Must cover ALL overloads
  return document.createElement(tag);
}

const img = createElement("img");
//    ^^^ Type: HTMLImageElement — precise!

const input = createElement("input");
//    ^^^^^ Type: HTMLInputElement — precise!
```

> 📖 **Background: Overloads in TypeScript vs. Java/C#**
>
> In Java or C#, each overload has its **own implementation**.
> In TypeScript there is **a single implementation** — the overload
> signatures are pure compile-time information (type erasure!).
> At runtime, only one function exists. This means: in the implementation
> you must **manually** determine which case you're dealing with.
>
> This is a direct consequence of the core principle from Lesson 02:
> TypeScript types exist ONLY at compile time.

---

## The Rules of Overloads

### Rule 1: The Implementation Signature Is Invisible to Callers

```typescript
function format(value: string): string;
function format(value: number): string;
function format(value: string | number): string {
//                     ^^^^^^^^^^^^^^^^ Implementation signature
  return String(value);
}

format("hallo");  // OK — matches overload 1
format(42);       // OK — matches overload 2
format(true);     // Error! No overload matches
//                   Even though boolean would be compatible with (string | number)
//                   in the implementation type — callers see ONLY the overloads!
```

### Rule 2: The Implementation Must Cover ALL Overloads

```typescript
function double(x: string): string;
function double(x: number): number;
// Implementation must handle both string and number:
function double(x: string | number): string | number {
  if (typeof x === "string") {
    return x + x;        // String duplication
  }
  return x * 2;           // Number doubling
}

double("ha");  // Type: string → "haha"
double(21);    // Type: number → 42
```

### Rule 3: Overloads Are Checked Top to Bottom

```typescript annotated
function process(value: string): string;
function process(value: string | number): number;
//                      ^^^^^^^^^^^^^^^^ Broader than overload 1
function process(value: string | number): string | number {
  if (typeof value === "string") return value.toUpperCase();
  return value * 2;
}

const a = process("hello");
//    ^ Type: string — overload 1 matches first

const b = process(42);
//    ^ Type: number — overload 1 doesn't match, overload 2 matches
```

> 💭 **Think about it:** What happens if you swap the order of the overloads
> — putting the broader one first?
>
> **Answer:** Then `process("hello")` would match the broad overload
> and get the type `number` — which would be wrong! That's why:
> **Specific overloads first, broad ones last.**

---

## When to Use Overloads — and When Not To?

### Use overloads when:

The return type **depends on the value of the argument**:

```typescript
// GOOD: Return type varies based on argument
function parse(input: string): object;
function parse(input: string, asArray: true): unknown[];
function parse(input: string, asArray?: boolean): object | unknown[] {
  const result = JSON.parse(input);
  if (asArray) return Array.isArray(result) ? result : [result];
  return result;
}
```

### Avoid overloads when:

A simple **union type** or **generics** produce the same result:

```typescript
// BAD: Overloads where a union would suffice
function len(x: string): number;
function len(x: unknown[]): number;
function len(x: string | unknown[]): number {
  return x.length;
}

// BETTER: Simple union type
function len(x: string | unknown[]): number {
  return x.length;
}
```

> 🔍 **Deeper knowledge: The TypeScript team's recommendation**
>
> The TypeScript team explicitly recommends:
> *"Always prefer parameters with union types instead of overloads
> when possible."* (TypeScript Handbook)
>
> The reason: overloads increase complexity, and the compiler
> can perform better type narrowing with union types. Overloads
> are a precision tool for cases where unions fall short —
> not the default approach.

---

## Practical Example: Event Handlers

```typescript annotated
// Overloads: Different events → different event objects
function addEventListener(
  event: "click",
  handler: (e: MouseEvent) => void
): void;
function addEventListener(
  event: "keydown",
  handler: (e: KeyboardEvent) => void
): void;
function addEventListener(
  event: "submit",
  handler: (e: SubmitEvent) => void
): void;
function addEventListener(
  event: string,
  handler: (e: Event) => void
): void {
  // Implementation: register event listener
  document.addEventListener(event, handler as EventListener);
}

// TypeScript knows the exact event type:
addEventListener("click", (e) => {
//                          ^ Type: MouseEvent — precise!
  console.log(e.clientX, e.clientY);
});

addEventListener("keydown", (e) => {
//                            ^ Type: KeyboardEvent — precise!
  console.log(e.key);
});
```

> 🧠 **Explain to yourself:** Why does this event handler need overloads instead of a simple union type? What would be the problem with `event: "click" | "keydown" | "submit", handler: (e: MouseEvent | KeyboardEvent | SubmitEvent) => void`?
> **Key points:** A union loses the connection between event name and event type | "click" could be called with a KeyboardEvent handler | Overloads enforce the correlation: "click" → MouseEvent, "keydown" → KeyboardEvent | Type safety on correlation

---

## What You've Learned

- **Overload signatures** define the possible call forms (visible to the caller)
- The **implementation signature** must cover all overloads (invisible to the caller)
- TypeScript checks overloads **top to bottom** — specific ones first
- Overloads are only useful when the **return type depends on the argument value**
- When the return type is the same, **union types are better** than overloads

> **Experiment:** Try the following in the TypeScript Playground:
>
> ```typescript
> function createElement(tag: "img"): HTMLImageElement;
> function createElement(tag: "input"): HTMLInputElement;
> function createElement(tag: "div"): HTMLDivElement;
> function createElement(tag: string): HTMLElement {
>   return document.createElement(tag);
> }
>
> // Now add a new overload HERE:
> // function createElement(tag: "canvas"): HTMLCanvasElement;
> ```
>
> Add the `canvas` signature — **before** the implementation signature.
> What happens if you place it **after** the implementation?
> TypeScript reports an error: overload signatures must always
> come **before** the implementation. Order within the overloads:
> specific ones first, broad ones last.

**In your Angular project:** Angular's `Router.navigate()` uses exactly
this overload pattern internally. Depending on whether you pass a relative
or absolute path, the signature varies. Angular's `HttpClient` also has overloads:

```typescript
// HttpClient.get() is overloaded — return type depends on the type parameter:
http.get("/api/users")                    // → Observable<Object>
http.get<User[]>("/api/users")            // → Observable<User[]>
http.get("/api/file", { responseType: "blob" })  // → Observable<Blob>

// This isn't a trick — these are real overloads in Angular's type definitions.
// In React you see the same with useRef():
// useRef<HTMLInputElement>(null)  → RefObject<HTMLInputElement>
// useRef(initialValue)            → MutableRefObject<T>
```

---

**Core Concept to remember:** Overloads connect input and output more precisely than union types. But: only use them when a union isn't enough.

---

> **Pause point** — Overloads are an advanced tool.
> If you've understood them, you're well on your way.
>
> Continue with: [Section 04: Callback Types](./04-callback-typen.md)