# Section 5: Template Literal Types

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Enums vs Union Literals](./04-enums-vs-union-literals.md)
> Next section: [06 - Patterns and Alternatives](./06-patterns-und-alternativen.md)

---

## What you'll learn here

- How TypeScript can **manipulate strings at the type level**
- The built-in **string manipulation types**: `Uppercase`, `Lowercase`, etc.
- How template literal types create **combinatorial explosions**
- How this feature **revolutionizes IDE autocomplete**

> **Note:** Template literal types are included here as a **preview**.
> In **Lesson 18** you'll get a full, deep treatment — with
> `infer` in template literals, advanced string manipulations,
> and real-world use cases like tRPC router definitions.
> Here it's enough to understand the basic concept: TypeScript can
> combine strings at the type level.

---

## String Manipulation at the Type Level

TypeScript can use template literal syntax not only for values, but
also for **types**:

```typescript annotated
type World = "world";
type Greeting = `hello ${World}`;
// ^ Type: "hello world" — a single string literal type

// The special thing: With union types, ALL combinations are created:
type Color = "red" | "green" | "blue";
type Shade = "light" | "dark";

type ColorVariant = `${Shade}-${Color}`;
// ^ "light-red" | "light-green" | "light-blue"
//   | "dark-red" | "dark-green" | "dark-blue"
// 2 x 3 = 6 combinations, automatically!
```

> 📖 **Background: A unique capability**
>
> No other typed language system can do this. Java, C#, Rust, Go —
> none of these languages can perform string operations at the type level.
> TypeScript's type system is more powerful in this regard than all
> alternatives. This is because TypeScript's type system is
> **Turing-complete** — it can theoretically perform any computation,
> even at the type level.
>
> Template literal types were introduced in TypeScript 4.1 (November 2020)
> and were immediately one of the most used features — especially for
> library authors.

---

## The Built-in String Manipulation Types

TypeScript has four intrinsic (built into the compiler) utility types
for strings:

```typescript annotated
type Event = "click" | "scroll" | "mousemove";

type UpperEvent = Uppercase<Event>;
// ^ "CLICK" | "SCROLL" | "MOUSEMOVE"

type LowerEvent = Lowercase<UpperEvent>;
// ^ "click" | "scroll" | "mousemove"

type CapEvent = Capitalize<Event>;
// ^ "Click" | "Scroll" | "Mousemove"

type UncapEvent = Uncapitalize<CapEvent>;
// ^ "click" | "scroll" | "mousemove"
```

### Combination with Template Literals

The true power comes from combination:

```typescript annotated
type Event = "click" | "scroll" | "mousemove";

// Generate event handler names:
type EventHandler = `on${Capitalize<Event>}`;
// ^ "onClick" | "onScroll" | "onMousemove"

// CSS custom properties:
type CSSVar = `--${string}`;
// ^ Any string that starts with "--"

// API endpoints:
type Entity = "user" | "post" | "comment";
type ApiEndpoint = `/api/${Entity}` | `/api/${Entity}/${number}`;
// ^ "/api/user" | "/api/post" | "/api/comment"
//   | "/api/user/${number}" | "/api/post/${number}" | "/api/comment/${number}"
```

> 🧠 **Explain to yourself:** Why does `Capitalize<"click" | "scroll">`
> produce the type `"Click" | "Scroll"` and not `"Click" | "click" | "Scroll" | "scroll"`?
> **Key points:** Capitalize is applied to EACH union member individually (distributive) | Each member is transformed, not expanded | Result has the same number of members

---

## Practical Pattern: Type-Safe Event System

A realistic example that uses template literal types:

```typescript annotated
type EventMap = {
  click: { x: number; y: number };
  scroll: { offset: number };
  keypress: { key: string };
};

// Derive handler type from EventMap:
type EventHandlers = {
  [K in keyof EventMap as `on${Capitalize<K & string>}`]:
    (event: EventMap[K]) => void;
};

// Result:
// {
//   onClick: (event: { x: number; y: number }) => void;
//   onScroll: (event: { offset: number }) => void;
//   onKeypress: (event: { key: string }) => void;
// }

// The IDE AUTOMATICALLY suggests the correct handlers!
const handlers: EventHandlers = {
  onClick: (e) => console.log(e.x, e.y),
  // ^ e automatically has type { x: number; y: number }
  onScroll: (e) => console.log(e.offset),
  onKeypress: (e) => console.log(e.key),
};
```

> 🔍 **Deeper knowledge: Key remapping with `as`**
>
> The `as` in `[K in keyof EventMap as ...]` is **key remapping**
> (since TypeScript 4.1). It allows you to rename the keys of a mapped type.
> Without `as`, the key `K` would remain itself (`click`,
> `scroll`). With `as \`on${Capitalize<K & string>}\`` it becomes
> `onClick`, `onScroll`, etc.
>
> The `K & string` is necessary because `keyof` can also return `number` or `symbol`
> keys. `& string` filters to string keys only.

---

## Autocomplete: The Killer Feature

Template literal types massively improve the IDE experience:

```typescript annotated
type CSSColor = "red" | "blue" | "green" | "transparent";
type CSSUnit = "px" | "em" | "rem" | "%";

// Type for CSS values:
type CSSValue = `${number}${CSSUnit}` | CSSColor;

function setStyle(property: string, value: CSSValue) {
  // When you type here, the IDE suggests ALL
  // possible values: "red", "blue", "10px", "1.5em", ...
}

setStyle("width", "100px");    // OK
setStyle("color", "red");      // OK
// setStyle("width", "100pt"); // Error! "pt" is not a CSSUnit
```

### Pattern for Path-Based APIs

```typescript annotated
type Locale = "de" | "en" | "fr";
type Section = "home" | "about" | "contact";

type Route = `/${Locale}/${Section}`;
// ^ "/de/home" | "/de/about" | "/de/contact"
//   | "/en/home" | "/en/about" | "/en/contact"
//   | "/fr/home" | "/fr/about" | "/fr/contact"
// 3 x 3 = 9 valid routes, all with autocomplete!
```

> 💭 **Think about it:** What happens with very large union types?
> If `Color` has 100 values and `Size` has 50, how many combinations
> does `\`${Color}-${Size}\`` have?
>
> **Answer:** 5000 combinations! TypeScript has an internal limit
> (default 100,000 members in a union type). With extremely
> large unions, compile time can explode. In practice you should
> limit combinatorial template literal types to reasonable sizes.
> For open sets, `\`${string}-${string}\`` is better.

---

## Template Literals for Type Guards

You can also use template literal types for runtime validation:

```typescript annotated
type EventName = `on${string}`;

function isEventHandler(key: string): key is EventName {
  return key.startsWith("on");
}

const key = "onClick";
if (isEventHandler(key)) {
  // key has type EventName here
  console.log(`Found event handler: ${key}`);
}
```

---

## What you learned

- Template literal types allow **string manipulation at the type level**
- `Uppercase<T>`, `Lowercase<T>`, `Capitalize<T>`, `Uncapitalize<T>` transform strings
- Union types generate **all combinations** (distributive)
- **Key remapping** with `as` in mapped types uses template literals
- IDE autocomplete benefits massively from precise template literal types
- With very large unions, watch out for **performance**

> 🧠 **Explain to yourself:** Why are template literal types especially
> valuable for library authors? Think about frameworks like React or Express.
> **Key points:** Automatic event handler types | Type-safe routes | Autocomplete for configuration | Fewer manual type definitions

**Key concept to remember:** Template literal types are string algebra at the type level. They make TypeScript's type system more powerful than that of any other typed language — and simultaneously improve the developer experience through autocomplete.

> ⚡ **In your Angular project:**
>
> ```typescript
> // Type-safe i18n keys with template literal types:
> type Locale = "de" | "en" | "fr";
> type Section = "auth" | "dashboard" | "settings";
> type I18nKey = `${Section}.${string}`;
>
> // Angular TranslateService becomes type-safe:
> @Injectable({ providedIn: "root" })
> export class TypedTranslateService {
>   get(key: I18nKey): string {
>     return this.translate.instant(key);
>   }
> }
>
> // Usage: Only valid key prefixes are accepted
> this.typedTranslate.get("auth.login");        // OK
> this.typedTranslate.get("dashboard.title");   // OK
> this.typedTranslate.get("unknown.key");       // Error!
>
> // In React: Event handler types for custom hooks
> type FormEvent = "change" | "blur" | "focus";
> type FormHandler = `on${Capitalize<FormEvent>}`;
> // ^ "onChange" | "onBlur" | "onFocus" — perfect for props types!
> ```

> **Experiment:** Try the following in the TypeScript Playground:
> ```typescript
> // CSS custom properties — only valid names allowed:
> type CSSCustomProperty = `--${string}`;
>
> function setCSSVar(property: CSSCustomProperty, value: string) {
>   document.documentElement.style.setProperty(property, value);
> }
>
> setCSSVar("--primary-color", "#3498db");   // OK
> setCSSVar("--font-size-lg", "1.25rem");    // OK
> setCSSVar("primary-color", "#3498db");     // Error! Missing "--"
>
> // Combinatorics with union types:
> type Color = "primary" | "secondary" | "danger";
> type CSSColorVar = `--color-${Color}`;
> // ^ "--color-primary" | "--color-secondary" | "--color-danger"
>
> // Hover over CSSColorVar — how many variants are there?
> ```
> Also create `type CSSSpacingVar = \`--spacing-${"xs" | "sm" | "md" | "lg" | "xl"}\``.
> How many valid values does this type have?

---

> **Pause point** — Template literal types are one of the most advanced
> features in TypeScript. In the final section we'll look at
> advanced patterns and alternatives.
>
> Continue with: [Section 06: Patterns and Alternatives](./06-patterns-und-alternativen.md)