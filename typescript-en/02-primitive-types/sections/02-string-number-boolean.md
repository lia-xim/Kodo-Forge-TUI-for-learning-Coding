# Section 2: string, number, boolean — The Three Basics

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - The Type System at a Glance](./01-das-typsystem-ueberblick.md)
> Next section: [03 - null and undefined](./03-null-und-undefined.md)

---

## What you'll learn here

- Why **lowercase** (`string`) and not uppercase (`String`)
- The pitfalls of `number` (IEEE 754, floating point, NaN)
- How Template Literal Types revolutionize the type level for `string`

---

## string

```typescript
let name: string = "Matthias";
let greeting: string = `Hallo, ${name}!`;   // Template Literal
let empty: string = '';
```

Strings in TypeScript are always **Unicode (UTF-16)**, just like in JavaScript.
That means: every character takes 2 bytes, and emojis or rare characters
need **Surrogate Pairs** (2 code units for one character).

```typescript
"a".length;     // 1
"😀".length;    // 2 (!)  — one emoji consists of 2 UTF-16 code units
[..."😀"].length; // 1    — spread operator handles Unicode correctly
```

### Template Literal Types — Strings at the Type Level

Template literals (with backticks) are especially powerful in TypeScript
because they can become **Template Literal Types**. This is a capability
that TypeScript 4.1 (November 2020) introduced and that exists in
no other mainstream language:

```typescript
// Simple Template Literal Types:
type EventName = `on${string}`;          // "onClick", "onHover", ...
type CssUnit = `${number}px` | `${number}rem` | `${number}%`;
type ApiRoute = `/api/${string}`;

// TypeScript checks this at compile time!
function on(eventName: `on${string}`, handler: () => void): void { }
on("onClick", () => {});    // OK
// on("click", () => {});   // Error! Must start with "on"
```

> ⚡ **Practical tip:** Template Literal Types are surprisingly useful in Angular and React:
>
> ```typescript
> // Angular: type route parameters
> type RouteParam = `:${string}`;  // ":id", ":userId", ...
>
> // React: restrict CSS-in-JS values
> type Spacing = `${number}px` | `${number}rem`;
> function Box({ padding }: { padding: Spacing }) { /* ... */ }
> ```

---

## number

```typescript
let ganzzahl: number = 42;
let dezimal: number = 3.14;
let hex: number = 0xff;
let binaer: number = 0b1010;
let oktal: number = 0o777;
let negativ: number = -100;
let unendlich: number = Infinity;
let keineZahl: number = NaN;       // Yes, NaN is of type number!
```

**Important:** `number` is always a **64-bit IEEE 754 floating-point number**.
JavaScript makes no distinction between integer and float — everything
is `number`. This has consequences:

```typescript
console.log(0.1 + 0.2);           // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3);   // false!
```

> 📖 **Background: Why 0.1 + 0.2 !== 0.3**
>
> This is **not a JavaScript bug** — it's IEEE 754, the same standard
> used by C, Java, Python, Go, and virtually every modern language.
>
> The problem: decimal numbers like 0.1 and 0.2 cannot be represented
> exactly in binary — just as 1/3 becomes infinite in decimal
> (0.333...). The computer stores the closest possible approximation,
> and the sum of two approximations has a small deviation.
>
> This problem has existed since the 1960s and was formalized by William Kahan,
> who received the Turing Award for it in 1989. It affects
> **every language** that uses IEEE 754 — not just JavaScript.
>
> **Solution for monetary amounts:**
> ```typescript
> // WRONG: floating-point problems!
> const preis: number = 19.99;
> const menge: number = 3;
> console.log(preis * menge);  // 59.96999999999999 — not 59.97!
>
> // RIGHT: work in cents (integer)
> const preisCent: number = 1999;  // 19.99 EUR in cents
> const summe = preisCent * menge; // 5997 — exact!
> const anzeige = (summe / 100).toFixed(2);  // "59.97"
> ```

### NaN — The Misleading "Number"

```typescript
typeof NaN;            // "number"  — NaN IS of type number!
NaN === NaN;           // false     — NaN is the ONLY value not equal to itself!
Number.isNaN(NaN);     // true      — the safe check
isNaN("hallo");        // true      — WARNING: the global function coerces!
Number.isNaN("hallo"); // false     — Number.isNaN does NOT coerce
```

> 📖 **Background: Why is NaN !== NaN?**
>
> This too comes from IEEE 754. The idea: NaN arises from undefined
> operations like `0/0` or `Math.sqrt(-1)`. Since different undefined
> operations produce different "non-numbers", it would be wrong to
> say they are "equal". `NaN` means "some undefined result" — and two
> different undefined results are not necessarily identical.
>
> In practice, this is a frequent source of bugs:
> ```typescript
> const result = someCalculation();
> if (result === NaN) { /* WILL NEVER EXECUTE! */ }
> if (Number.isNaN(result)) { /* Correct! */ }
> ```

### Safe Integer Boundary

`Number.MAX_SAFE_INTEGER` is `9007199254740991` (2^53 - 1).
Beyond this value, `number` loses precision:

```typescript
console.log(9007199254740991 + 1);  // 9007199254740992 — correct
console.log(9007199254740991 + 2);  // 9007199254740992 — WRONG! Precision loss!
```

For larger numbers there is `bigint` (Section 5).

---

## boolean

```typescript
let aktiv: boolean = true;
let fertig: boolean = false;
```

Boolean is the simplest type: just `true` or `false`. But watch out
for **truthy/falsy** values in JavaScript:

```typescript
// These values are all "falsy":
// false, 0, -0, 0n, "", null, undefined, NaN

// TypeScript helps here: if you expect boolean,
// you must also provide boolean:
function setActive(active: boolean) { /* ... */ }
setActive(1);       // Error! number is not boolean
setActive(!!1);     // OK, explicit conversion to true
```

> 🔍 **Deeper knowledge: Boolean and Narrowing**
>
> Boolean plays a special role in **control flow narrowing**.
> TypeScript analyzes `if` conditions and narrows types:
>
> ```typescript
> function process(value: string | null) {
>   if (value) {           // truthy check
>     value.toUpperCase(); // TypeScript knows: string (not null)
>   }
>   // BUT CAREFUL: empty string "" is also falsy!
>   // That means: "" is treated just like null here
> }
>
> // Safer:
> function process2(value: string | null) {
>   if (value !== null) {       // explicit null check
>     value.toUpperCase();      // OK — "" works too
>   }
> }
> ```

---

## Why Lowercase? string vs String

This is one of the **most common points of confusion** for TypeScript beginners:

```typescript
// CORRECT: primitive types with lowercase
let a: string = "hallo";
let b: number = 42;
let c: boolean = true;

// WRONG: wrapper objects (never use!)
let x: String = "hallo";   // This is an object, not a primitive!
let y: Number = 42;
let z: Boolean = true;
```

`String`, `Number`, `Boolean` (uppercase) are **wrapper objects** from
JavaScript. They exist for historical reasons.

> 📖 **Background: Why do wrapper objects exist at all?**
>
> When Brendan Eich designed JavaScript in 10 days in 1995, he adopted
> an idea from Java: primitives sometimes need methods (e.g.
> `"hallo".toUpperCase()`). Since primitives are not objects, JavaScript
> creates **temporary wrapper objects** behind the scenes:
>
> ```typescript
> "hallo".toUpperCase();
> // What JavaScript does internally:
> // 1. create new String("hallo")
> // 2. call .toUpperCase()
> // 3. immediately discard the wrapper object
> ```
>
> These wrapper objects (`String`, `Number`, `Boolean`) can also be
> created explicitly with `new` — but you should **never** do this:
>
> ```typescript
> "hallo" === new String("hallo");  // false! Primitive !== Object
> typeof "hallo";                    // "string"
> typeof new String("hallo");        // "object" (!)
> ```

**The rule is simple and absolute:**

> **Always use lowercase: `string`, `number`, `boolean`.**
> The uppercase variants (`String`, `Number`, `Boolean`) are
> wrapper objects and lead to subtle bugs.

TypeScript's own ESLint configuration automatically warns against using
wrapper types. If you use `@typescript-eslint` (which you should), the
rule is `@typescript-eslint/ban-types`.

---

## Practical Scenarios: Which Primitive Type When?

| Scenario | Type | Why |
|---|---|---|
| Monetary amounts | `number` **in cents** | 1999 instead of 19.99 — avoids floating point |
| User inputs | `string` (always!) | Inputs are always strings, only parse after validation |
| Feature flags | `boolean` | Simple and clear: on/off |
| Enum-like values | String Literal Union | `"admin" \| "user" \| "guest"` instead of `enum` |
| CSS values | Template Literal Type | `` `${number}px` `` for type-safe CSS values |
| Small numbers (age, index) | `number` | No precision issues below 2^53 |

> ⚡ **Practical tip: Money in Angular/React projects**
>
> In every professional project, you'll eventually work with monetary amounts.
> The most important rule:
>
> ```typescript
> // In your Angular service or React hook:
> interface Preis {
>   betragInCent: number;  // 1999 for 19.99 EUR
>   waehrung: "EUR" | "USD" | "CHF";
> }
>
> // Only format for DISPLAY:
> function formatPreis(preis: Preis): string {
>   return new Intl.NumberFormat("de-DE", {
>     style: "currency",
>     currency: preis.waehrung,
>   }).format(preis.betragInCent / 100);
> }
> // formatPreis({ betragInCent: 1999, waehrung: "EUR" }) => "19,99 EUR"
> ```

---

## What you've learned

- Always use **lowercase**: `string`, `number`, `boolean` — never the wrapper objects
- `number` is IEEE 754: **0.1 + 0.2 !== 0.3** is not a bug, it's the physics of the binary system
- `NaN` is of type `number` and is **not equal to itself** — use `Number.isNaN()`
- Template Literal Types enable type checking for **string patterns**
- Always calculate monetary amounts in **cents**, never as decimals

**Core Concept to Remember:** `number` has a safe boundary at 2^53 - 1. Everything above that loses precision. Always store money in the smallest unit (cents).

> **Experiment:** Try the following in the TypeScript Playground:
> ```typescript
> // 1. const vs let: How does the inferred type change?
> const name1 = "Max";   // Hover: type is "Max" (Literal Type)
> let name2 = "Max";     // Hover: type is string (wider type)
>
> // 2. Wrapper object vs primitive: What does the compiler say?
> const preis1: number = 19.99;  // OK
> const preis2: Number = 19.99;  // Compiler warning — uppercase N is the wrapper object!
>
> // 3. The classic floating-point trap
> console.log(0.1 + 0.2 === 0.3);  // false! IEEE 754 precision
> console.log(0.1 + 0.2);           // 0.30000000000000004
> ```
> Hover over `name1` and `name2` in your IDE — do you see the difference
> between the Literal Type `"Max"` and the wider type `string`? What happens when you
> pass `preis2` to a function that expects `number`? And: why does
> `0.1 + 0.2 === 0.3` return `false`?

---

> **Pause Point** — The three most important types are solid. From here, we move on to
> the more specialized types that distinguish TypeScript from JavaScript.
>
> Continue with: [Section 03: null and undefined](./03-null-und-undefined.md)