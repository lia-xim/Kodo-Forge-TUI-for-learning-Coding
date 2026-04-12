# Section 4: Type-Safe Event Systems

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - Pattern Matching](./03-pattern-matching.md)
> Next section: [05 - Practical Patterns](./05-praxis-patterns.md)

---

## What you'll learn here

- How to **automatically derive event names from data types** instead of typing them manually
- The pattern behind Angular EventEmitter and DOM events — and how to build it yourself
- How to build a fully type-safe `on`/`emit` EventEmitter using Template Literal Types and generic types
- Why this pattern is one of the most practical use cases for Template Literal Types

---

## The Background Story: The Event Problem

Every frontend framework solves the same fundamental problem: components need to communicate with each other without directly depending on one another. The solution is almost always an event system — one component emits an event, others listen.

The long-standing problem was: TypeScript couldn't automatically establish the connection between event names and event payload types. When you wrote `emitter.on("user-login", handler)`, TypeScript had no idea what argument `handler` would receive — unless you had explicitly defined it.

Template Literal Types and generic constraints solve this. The TypeScript team itself uses this in the types for the DOM API: `addEventListener("click", handler)` only works because `lib.dom.d.ts` uses exactly the pattern we'll build in this section. So you're rebuilding what the TypeScript team implemented for browser events.

---

## Starting Point: Deriving Event Names from Properties

The most elegant pattern: if you have an interface, changes to properties should automatically generate events. A property `name` becomes an event `nameChanged`, `theme` becomes `themeChanged`:

```typescript annotated
type EventNames<T> = {
  [K in keyof T & string as `${K}Changed`]: {
  //                  ^^^^^^^^^^^^^^^^^^    // Key Remapping: K -> "${K}Changed"
  //   ^^^^^^^^^^^^^^                        // Keep only string keys (not symbol)
    previousValue: T[K]; // Field type = type of the previous value
    newValue: T[K];      // Same type for the new value
  };
};

interface UserProfile {
  name: string;
  avatar: string;
  theme: "light" | "dark";
}

type UserEvents = EventNames<UserProfile>;
// {
//   nameChanged:   { previousValue: string;           newValue: string; }
//   avatarChanged: { previousValue: string;            newValue: string; }
//   themeChanged:  { previousValue: "light" | "dark"; newValue: "light" | "dark"; }
// }
```

Note: The payload types are **automatically correct**. `themeChanged` can only have `"light"` or `"dark"` as values — not arbitrary strings. TypeScript derives this directly from `UserProfile.theme`.

> **Explain to yourself:** Why do we use `keyof T & string` instead of just `keyof T`? What could `keyof T` contain that isn't a string?
>
> **Key points:** `keyof T` can contain strings, numbers, and symbols. Symbols and numbers cannot be used in Template Literals. `& string` filters out everything except strings. In practice, most interfaces only have string keys, but TypeScript is strict.

---

## A Type-Safe EventEmitter from Scratch

Now let's build the complete EventEmitter — with correct types for `on` and `emit`:

```typescript annotated
class EventEmitter<Events extends Record<string, unknown>> {
//                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                  Events describes the event catalog:
//                  { "user:login": { userId: string }, ... }
  private handlers = new Map<string, Array<(data: unknown) => void>>();

  on<E extends string & keyof Events>(
  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // E is a concrete event name (e.g. "user:login")
  // Constraint: E must be a valid key of Events
    event: E,
    handler: (data: Events[E]) => void
    //             ^^^^^^^^    // Payload type is automatically inferred from Events!
  ): void {
    const list = this.handlers.get(event) ?? [];
    list.push(handler as (data: unknown) => void);
    this.handlers.set(event, list);
  }

  emit<E extends string & keyof Events>(
    event: E,
    data: Events[E]  // Payload must match the event name
  ): void {
    const list = this.handlers.get(event) ?? [];
    list.forEach(fn => fn(data));
  }
}
```

The usage demonstrates the full power:

```typescript
interface AppEvents {
  "user:login":   { userId: string; timestamp: number };
  "user:logout":  { reason: "timeout" | "manual" };
  "data:refresh": { source: string; itemCount: number };
}

const emitter = new EventEmitter<AppEvents>();

// TypeScript knows: the handler for "user:login" receives { userId, timestamp }
emitter.on("user:login", (data) => {
  console.log(data.userId);    // OK — TypeScript knows: string
  console.log(data.timestamp); // OK — TypeScript knows: number
  // console.log(data.reason); // ERROR! "reason" doesn't exist on user:login
});

// TypeScript checks: data must be { reason: "timeout" | "manual" }
emitter.emit("user:logout", { reason: "timeout" }); // OK
// emitter.emit("user:logout", { reason: "aborted" }); // ERROR! Wrong value
// emitter.emit("page:load", {});                       // ERROR! No "page:load"
```

> **Think about it:** What would be different if `on` and `emit` simply used `string` and `unknown` as types? Which errors would TypeScript no longer catch? And at what stage would those errors only surface?
>
> **Answer:** With `string` and `unknown`, any event name would be accepted — typos become silent runtime errors (no handler responds). Payload errors also only become visible at runtime when properties are missing or wrong. This is the classic "works fine during development but doesn't blow up until production" error type.

---

## DOM Events: The Original Pattern

The TypeScript types for the DOM API in `lib.dom.d.ts` use exactly this pattern. Here's the underlying principle — rebuilt in simplified form:

```typescript annotated
// The DOM API defines a catalog of events and their types:
interface HTMLElementEventMap {
  click:      MouseEvent;
  keydown:    KeyboardEvent;
  mouseenter: MouseEvent;
  scroll:     Event;
  focus:      FocusEvent;
}

// addEventListener is then typed essentially like this:
interface HTMLElement {
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,                                         // e.g. "click"
    listener: (event: HTMLElementEventMap[K]) => void // MouseEvent for "click"
  ): void;
}

// That's why this works:
document.addEventListener("click", (event) => {
  console.log(event.clientX); // OK — TypeScript knows: event is MouseEvent
  // console.log(event.key);  // ERROR! MouseEvent has no .key (that's KeyboardEvent)
});
```

This is no coincidence — Template Literal Types were designed exactly for this. You now have the tools to build APIs like this yourself.

---

> **Experiment:** Try the following in the TypeScript Playground:
>
> ```typescript
> interface ComponentEvents {
>   valueChange: string;
>   visibilityChange: boolean;
>   itemSelect: { id: number; label: string };
> }
>
> // Automatically generate the handler props:
> type EventHandlerProps = {
>   [K in keyof ComponentEvents as `on${Capitalize<K & string>}`]:
>     (event: ComponentEvents[K]) => void;
> };
>
> // Hover over EventHandlerProps — what does it produce?
>
> // Then test:
> function createComponent(props: EventHandlerProps) { /* ... */ }
>
> createComponent({
>   onValueChange: (value) => console.log(value),          // value: string?
>   onVisibilityChange: (visible) => console.log(visible), // visible: boolean?
>   onItemSelect: (item) => console.log(item.id),          // item.id: number?
> });
> ```
>
> This is exactly the pattern React uses for its synthetic events. What happens when you leave out `onValueChange`?

---

## Angular Connection: EventEmitter and Output

In Angular components you're familiar with `@Output()` and `EventEmitter`. The underlying type pattern is closely related:

```typescript
// What Angular does behind the scenes (simplified):
type OutputNames<T> = {
  [K in keyof T as `${K & string}Change`]: EventEmitter<T[K]>;
};

// In an Angular component:
@Component({
  selector: 'app-user-form',
  template: `...`
})
export class UserFormComponent {
  @Output() nameChange = new EventEmitter<string>();
  @Output() avatarChange = new EventEmitter<string>();
  @Output() themeChange = new EventEmitter<"light" | "dark">();
}

// The parent component binds:
// <app-user-form (nameChange)="onNameChange($event)"></app-user-form>
// TypeScript knows: $event is string — not any!

// With our EventNames type, this could be generated automatically:
type FormOutputs = EventNames<UserProfile>;
// {
//   nameChanged:   { previousValue: string;          newValue: string }
//   avatarChanged: { previousValue: string;           newValue: string }
//   themeChanged:  { previousValue: "light" | "dark"; newValue: "light" | "dark" }
// }
```

Angular itself uses this convention for two-way binding: `[(value)]` requires both an `@Input() value` and an `@Output() valueChange`. That's exactly the `${K}Change` pattern — and TypeScript 4.1+ can represent this fully typed.

---

## What you've learned

- Event names can be automatically derived from interface keys: `nameChanged`, `themeChanged`, etc. are generated via `as \`${K}Changed\``
- A type-safe EventEmitter uses generic constraints to ensure that `on(event, handler)` and `emit(event, data)` **always match**
- The DOM API in `lib.dom.d.ts` uses exactly this pattern for `addEventListener` — you now have the tools to build similar APIs
- Angular `@Output()` and Angular's two-way binding convention (`valueChange`) follow the same pattern

> **Explain to yourself:** In `emitter.on<E extends string & keyof Events>(event: E, handler: (data: Events[E]) => void)` — why is `Events[E]` the right type for the handler parameter? What happens without this indexed access?
>
> **Key points:** `Events[E]` looks up the payload type for the concrete event name | When E = "user:login", then Events[E] = { userId: string; timestamp: number } | Without Indexed Access you'd have to specify the payload type manually | That would be error-prone and no real type-safety gain

**Core concept to remember:** Template Literal Types + generic constraints + Indexed Access Types are the trio that enables type-safe event systems. The compiler can automatically check: is this event name valid? And does the handler have the right payload type? Those are exactly the errors that occur most often in manually typed event systems.

---

## Quick Reference: Event Patterns at a Glance

Three variants for modeling event names in TypeScript — from simple to fully type-safe:

```typescript
// Variant 1: Simple (no type safety)
class SimpleEmitter {
  on(event: string, handler: (data: unknown) => void): void { /* ... */ }
  emit(event: string, data: unknown): void { /* ... */ }
}
// Advantage: Simple. Disadvantage: No error for wrong event name or payload.

// Variant 2: Union for event names (half type safety)
type EventName = "user:login" | "user:logout" | "data:refresh";
class TypedEmitter {
  on(event: EventName, handler: (data: unknown) => void): void { /* ... */ }
}
// Advantage: Wrong event names are caught.
// Disadvantage: Payload is always unknown — no protection against wrong properties.

// Variant 3: Fully type-safe (our EventEmitter)
class SafeEmitter<Events extends Record<string, unknown>> {
  on<E extends string & keyof Events>(
    event: E,
    handler: (data: Events[E]) => void
  ): void { /* ... */ }
}
// Advantage: Event name AND payload are type-safe.
// Disadvantage: Slightly more setup — the Events catalog must be defined.
```

In practice you'll almost always aim for Variant 3. The setup is minimal, and the gain is enormous: you can never write the wrong event name or send the wrong payload.

---

> **Pause point** — You've now seen the deepest pattern in this lesson. Before reading on: can you explain why `emitter.on("user:login", (data) => { data.userId })` works without an explicit type annotation? TypeScript infers the type of `data` automatically — from what information?
>
> Continue with: [Section 05: Practical Patterns](./05-praxis-patterns.md)