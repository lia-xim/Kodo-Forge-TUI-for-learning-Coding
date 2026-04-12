# Section 1: Interface Merging Basics

> Estimated reading time: **10 minutes**
>
> Previous section: -- (Start)
> Next section: [02 - Module Augmentation](./02-module-augmentation.md)

---

## What you'll learn here

- What **Declaration Merging** is and why TypeScript supports it
- How **Interface Merging** automatically combines two interfaces with the same name
- The rules for **conflicts** during merging (same properties, different types)
- Why Interface Merging enables **extending libraries**

---

## Background: Why Declaration Merging?

> **Feature Origin Story: Declaration Merging**
>
> When Anders Hejlsberg and his team designed TypeScript in 2012, they
> faced a fundamental problem: how do you describe the types of
> **existing JavaScript code** that was never designed with types in mind?
>
> JavaScript libraries like jQuery, Express, or Lodash use patterns
> that are unusual in statically typed languages: an object is
> simultaneously a function and has properties. A class gets new methods
> added at runtime. Global objects like `window` gain new properties
> depending on which scripts are loaded.
>
> The solution: **Declaration Merging** — TypeScript automatically combines
> multiple declarations with the same name. This makes it possible to
> precisely type JavaScript patterns that couldn't be expressed in a single
> declaration. And it allows users to **extend** existing types without
> changing the original code.

---

## Core rule: Interfaces with the same name are merged

```typescript annotated
// Declaration 1:
interface User {
  id: string;
  name: string;
}

// Declaration 2 (same name!):
interface User {
  email: string;
  role: "admin" | "user";
}

// TypeScript MERGES both into ONE interface:
// Result:
// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: "admin" | "user";
// }

const user: User = {
  id: "1",
  name: "Max",
  email: "max@example.com",
  role: "admin",
  // ^ All 4 properties are required! Both declarations are merged.
};
```

> 🧠 **Explain to yourself:** Why does Interface Merging only work
> with `interface` and not with `type`? What would happen if you had
> two `type User = ...` declarations?
>
> **Key points:** `type` does not allow duplicate declarations → compile error |
> `interface` was intentionally designed this way: merging is a feature |
> type is a fixed assignment, interface is an open declaration |
> This makes interface ideal for extensible APIs

---

## Conflicts during merging
<!-- section:summary -->
What happens when both declarations have the **same property**?

<!-- depth:standard -->
What happens when both declarations have the **same property**?

```typescript annotated
// Rule 1: Same name + SAME type → OK
interface Config {
  debug: boolean;
}
interface Config {
  debug: boolean; // Same type → no problem
}

// Rule 2: Same name + DIFFERENT type → COMPILE ERROR!
interface Settings {
  port: number;
}
// interface Settings {
//   port: string; // ERROR! 'port' already has type 'number'
// }
// ^ "Subsequent property declarations must have the same type."

// Rule 3: For method overloads → Later declaration takes PRECEDENCE
interface Serializer {
  serialize(input: string): string;
}
interface Serializer {
  serialize(input: number): string;
  serialize(input: boolean): string;
}
// Result: Overloads in reverse order of declaration!
// serialize(input: number): string;   ← later declaration first
// serialize(input: boolean): string;  ← later declaration first
// serialize(input: string): string;   ← earlier declaration last
```

> 💭 **Think about it:** Why does the **later** declaration take precedence
> for method overloads? What would be the problem if the earlier one took precedence?
>
> **Answer:** The later declaration is typically the
> **extension** (e.g. a plugin or library extension). When you extend a
> type, you want your overloads to be checked first —
> otherwise they could be "shadowed" by the original overloads.
> TypeScript therefore prioritizes the **extender** over the **creator**.

---

<!-- /depth -->
## Practical application: Extending Window
<!-- section:summary -->
The most common example of Interface Merging in practice:

<!-- depth:standard -->
The most common example of Interface Merging in practice:

```typescript annotated
// TypeScript's built-in definition:
// interface Window {
//   document: Document;
//   navigator: Navigator;
//   // ... hundreds of properties
// }

// You extend it — e.g. for a global analytics library:
interface Window {
  analytics: {
    track(event: string, data?: Record<string, unknown>): void;
    identify(userId: string): void;
  };
  __APP_CONFIG__: {
    apiUrl: string;
    environment: "dev" | "staging" | "prod";
  };
}

// Now: window.analytics is typed!
window.analytics.track("page_view", { path: "/home" });
window.__APP_CONFIG__.apiUrl; // string — type-safe!

// Without Interface Merging you'd have to cast:
// (window as any).analytics.track(...); // Unsafe!
```

<!-- depth:vollstaendig -->
> **Experiment:** Open any TypeScript file and type
> `window.` — look at the autocomplete list. Now add
> this Interface Merging:
>
> ```typescript
> interface Window {
>   myCustomProperty: string;
> }
> ```
>
> Type `window.` again — `myCustomProperty` appears in the list!
> That's Interface Merging in action.

---

<!-- /depth -->
## Enum Merging
<!-- section:summary -->
Less well-known: enums can also be merged:

<!-- depth:standard -->
Less well-known: enums can also be merged:

```typescript annotated
enum Direction {
  Up = "UP",
  Down = "DOWN",
}

enum Direction {
  Left = "LEFT",
  Right = "RIGHT",
  // ^ Note: Only the FIRST enum block may omit initializers!
  //   All subsequent blocks must have explicit values.
}

// Result: Direction has Up, Down, Left, Right
const d: Direction = Direction.Left; // OK
```

> ⚡ **In your Angular project** you encounter Interface Merging implicitly:
>
> ```typescript
> // @angular/core defines:
> // interface OnInit { ngOnInit(): void; }
>
> // If you write an Angular plugin that wants to add new lifecycle hooks,
> // it could theoretically extend OnInit:
> // interface OnInit { onPluginInit?(): void; }
> // ^ In practice this is rarely done with Angular hooks,
> //   but the PRINCIPLE is the same as with Window extensions.
> ```
>
> In React, Interface Merging matters for JSX attributes:
>
> ```typescript
> // @types/react defines:
> // namespace JSX { interface IntrinsicElements { div: ...; span: ...; } }
>
> // Extend with custom elements:
> declare namespace JSX {
>   interface IntrinsicElements {
>     "my-component": { label: string; onAction?: () => void };
>   }
> }
> // <my-component label="Hello" /> → type-safe!
> ```

---

<!-- /depth -->
## Namespace Merging
<!-- section:summary -->
Namespaces can also be merged — and even combined with

<!-- depth:standard -->
Namespaces can also be merged — and even combined with
classes, functions, or enums:

```typescript annotated
// Function + Namespace → Function with properties!
function jQuery(selector: string): HTMLElement[] {
  return Array.from(document.querySelectorAll(selector));
}

namespace jQuery {
  export function ajax(url: string): Promise<unknown> {
    return fetch(url).then(r => r.json());
  }
  export const version = "3.7.1";
}

// jQuery is BOTH: a function and an object with properties
jQuery("div");           // Call as function
jQuery.ajax("/api");     // Call as property
jQuery.version;          // "3.7.1"
// ^ This is exactly how real jQuery works!
```

---

<!-- /depth -->
## What you've learned

- **Declaration Merging** automatically combines multiple declarations with the same name
- **Interface Merging** combines properties — conflicts from different types are forbidden
- For **method overloads**, the later declaration takes precedence
- **Enum Merging** and **Namespace Merging** extend the concept to other declaration kinds
- Namespace + function/class enables patterns like `jQuery()` + `jQuery.ajax()`

> 🧠 **Explain to yourself:** Why does TypeScript only allow `interface`
> merging and not `type` merging? What is the conceptual difference?
>
> **Key points:** `interface` is an "open" declaration — extensible |
> `type` is a "closed" assignment — one-time, final |
> Open declarations enable plugin systems and library extensions |
> Closed assignments offer more predictability

**Core concept to remember:** Interface Merging is not a bug but a
deliberate design decision — it enables extending types without
changing the original code. This is the foundation for Module Augmentation.

---

> **Pause point** — You understand Interface Merging. Next topic:
> How to extend types from external modules.
>
> Continue with: [Section 02: Module Augmentation](./02-module-augmentation.md)