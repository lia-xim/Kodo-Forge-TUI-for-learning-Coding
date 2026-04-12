# Section 4: Array Improvements and Control Flow

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - Inferred Type Predicates](./03-inferred-type-predicates.md)
> Next section: [05 - Performance and Editor Features](./05-performance-und-editor-features.md)

---

## What you'll learn here

- How TypeScript 5.4 **improved narrowing in closures** — a long-standing pain point
- Why `Array.isArray()` now works correctly with **readonly arrays**
- New **utility types and typings** for `Object.groupBy` and `Array.fromAsync`
- How `Object.hasOwn` is the more type-safe alternative to `hasOwnProperty`

---

## Preserved Narrowing in Closures (TypeScript 5.4)

Here's a code pattern you've written a hundred times:

```typescript
function processUser(user: User | null) {
  if (!user) return;
  
  // Here: user is User (narrowed)
  
  const greet = () => {
    console.log(user.name);
    //          ^^^^^^^^^^
    // Before TS 5.4: Error!
    // "'user' is possibly null"
    // But... we already checked above?
  };
  
  greet();
}
```

Before TypeScript 5.4, this caused a compile error. The reason: TypeScript was
**conservative** with closures. The compiler thought: "Between the null check and
the closure execution, `user` could have been reassigned. I can't be sure."

That was technically correct — but overly cautious.

> 📖 **Background: The Closure Narrowing Problem**
>
> TypeScript's Control Flow Analysis (CFA) is normally brilliant. With closures,
> however, there was a fundamental problem: a closure is executed **later**
> (potentially). If `user` is a variable that can be reassigned, then the narrowing
> at closure creation no longer applies at closure execution time.
>
> The TypeScript team solved this elegantly in 5.4: TypeScript now analyzes whether
> the variable **is reassigned between the narrowing and the closure usage**.
> If not — the narrowing is also valid inside the closure.
>
> This sounds simple, but it's a significant extension of the Control Flow Analysis.

```typescript annotated
// TypeScript 5.4: Preserved Narrowing in Closures

function processOrder(order: Order | null) {
  if (!order) return;
  // order: Order  (narrowed -- null excluded)

  // TypeScript 5.4 analyzes: Is 'order' reassigned between here and the closure?
  // No? Then the narrowing holds inside the closure!

  const processItems = () => {
    order.items.forEach(item => {  // No error anymore!
      //  ^^^^^^^^^^^ TypeScript knows: order is Order
      processItem(item, order.id);
    });
  };

  // TypeScript 5.4: OK! order is never reassigned, so inside the
  // closure it's still safely of type Order
  processItems();
}

// BUT: If the variable can be reassigned, this does NOT apply:
function processOptional(data: string | null) {
  if (!data) return;
  // data: string

  // Somewhere between narrowing and closure, data could be reassigned:
  setTimeout(() => {
    console.log(data.toUpperCase());
    // TypeScript must be cautious: setTimeout runs ASYNCHRONOUSLY
    // By the time the setTimeout callback runs, data could be reassigned
    // TS 5.4: This is an edge case -- with let, TS will be more cautious
  }, 1000);
}
```

> 🧠 **Explain it to yourself:** Why is TypeScript more cautious with `setTimeout`
> callbacks than with synchronous closures? What is the technical difference?
>
> **Key points:** Synchronous closure is executed while the function is still running |
> `setTimeout` callback runs after the current call stack has finished |
> Between `setTimeout` registration and execution, the variable can be changed |
> `const` solves this: `const` cannot be reassigned, so narrowing always holds

---

## Array.isArray and readonly Arrays

Before TypeScript 5.4 there was a strange behavior with `Array.isArray`:

```typescript
// Before TS 5.4:
function process(input: string | readonly string[]) {
  if (Array.isArray(input)) {
    // input should be string[] -- but:
    input;  // Type: string[] & readonly string[]  -- strange!
    // TS combined BOTH branches into complex types
  }
}
```

TypeScript 5.4 improved the narrowing:

```typescript annotated
// TypeScript 5.4: Array.isArray narrows readonly arrays correctly

function processData(data: string | readonly string[]) {
  if (Array.isArray(data)) {
    data;
    // data: readonly string[]  ← Correct! Not (string[] & readonly string[])
    // TypeScript preserves readonly -- because readonly string[] IS also an array

    // Practical: All non-mutating array methods work:
    const upper = data.map(s => s.toUpperCase()); // OK!
    const first = data[0];                         // OK!
    // data.push('new')  ← Error! readonly arrays are not writable
  }
}

// Why does this matter? In Angular many arrays are readonly:
// signals(), queryList.toArray(), etc. often return readonly
// Array.isArray checks now work correctly with these types
```

---

## New Utility Types: NoInfer\<T\> (TypeScript 5.4)

TypeScript 5.4 introduced `NoInfer<T>` — a utility type that makes inference
in generic functions more precise:

```typescript annotated
// Problem without NoInfer:
function createStore<T>(
  initialValue: T,
  fallback: T  // TypeScript infers T from BOTH arguments
): Store<T> { /* ... */ }

createStore("hello", 42);
// TypeScript infers T as string | number (because both arguments determine T)
// This is often not what you want!

// Solution with NoInfer<T>:
function createStore<T>(
  initialValue: T,
  fallback: NoInfer<T>  // fallback does NOT influence T inference
): Store<T> { /* ... */ }

createStore("hello", 42);
// Error! T is inferred as string from initialValue
// Then fallback: NoInfer<string> -- and 42 is not a string
// This is the desired behavior: determine T from initialValue

createStore("hello", "world");
// OK! T = string, fallback is also a string
```

```typescript annotated
// Practical example: Event system
function on<EventMap, K extends keyof EventMap>(
  event: K,
  handler: (data: NoInfer<EventMap[K]>) => void
  //                  ^^^^^^^^ handler does not influence K inference
): void { /* ... */ }

type AppEvents = {
  'user:login': { userId: string };
  'user:logout': { userId: string; reason: string };
};

on<AppEvents, 'user:login'>('user:login', (data) => {
  console.log(data.userId);  // data: { userId: string } -- correct!
  // Without NoInfer, TypeScript could infer K from the handler type
  // With NoInfer, K is only determined from the first argument (event)
});
```

---

## Object.groupBy and Map.groupBy Types (TypeScript 5.4)

JavaScript ES2024 introduced `Object.groupBy` and `Map.groupBy`.
TypeScript 5.4 added the correct types for them:

```typescript annotated
// Object.groupBy -- distributes array elements into groups
const users: User[] = [
  { id: '1', name: 'Alice', department: 'Engineering' },
  { id: '2', name: 'Bob', department: 'Design' },
  { id: '3', name: 'Charlie', department: 'Engineering' },
];

// TypeScript 5.4+ knows the type:
const byDepartment = Object.groupBy(users, u => u.department);
// byDepartment: Partial<Record<string, User[]>>
//               ^^^^^^^ Partial! Because not every key must be present
//                              ^ User[] per group

byDepartment['Engineering']?.forEach(u => console.log(u.name));
//                         ^^ Optional chaining required -- Partial!

// Map.groupBy: Like Object.groupBy but as Map<K, V[]>
const byDeptMap = Map.groupBy(users, u => u.department);
// byDeptMap: Map<string, User[]>
// No Partial here -- Map<K, V> returns undefined for missing keys
byDeptMap.get('Engineering')?.forEach(u => console.log(u.name));
```

> 💭 **Think about it:** Why is `Object.groupBy` typed as `Partial<Record<K, T[]>>`
> and not as `Record<K, T[]>`? What would happen if you used `Record<K, T[]>`?
>
> **Answer:** Because not all possible keys need to be populated. With
> `Record<K, T[]>`, TypeScript would assume that `byDepartment['Finance']`
> exists — but if no user from Finance is in the array, the value is `undefined`.
> `Partial` enforces optional chaining and protects against runtime errors.

---

## Experiment Box: Object.hasOwn as a Type-Safe Alternative

A feature that has existed since TypeScript 4.4 but many don't know about:
`Object.hasOwn` as a replacement for the error-prone `hasOwnProperty`:

```typescript
// The OLD pattern (problematic):
const obj = { name: 'Alice' };

if (obj.hasOwnProperty('name')) {
  // Problem 1: hasOwnProperty can be overridden
  // Problem 2: TypeScript does not narrow the type here
  console.log(obj.name); // obj is still the same type
}

// The special problem:
const evil = Object.create(null);
// evil has NO hasOwnProperty! It does not inherit from Object.prototype
// evil.hasOwnProperty('key')  ← Runtime error!

// NEW SOLUTION: Object.hasOwn (TypeScript 4.4+, ES2022)
if (Object.hasOwn(obj, 'name')) {
  // Object.hasOwn cannot be overridden
  // Also works with Object.create(null) objects
  // TypeScript 5.x understands this as a type guard in certain contexts
  console.log(obj.name);
}

// In Angular templates and services:
function validateConfig(config: unknown): config is AppConfig {
  if (typeof config !== 'object' || config === null) return false;
  
  // hasOwn is the modern, type-safe variant:
  return Object.hasOwn(config, 'apiUrl') &&
         Object.hasOwn(config, 'timeout') &&
         Object.hasOwn(config, 'environment');
}
```

> ⚡ **Practical tip for your Angular project:** `Object.hasOwn` is available without
> issues since Angular 15+ (target ES2022). If your `tsconfig.json` still has
> `"target": "ES2019"` or older, you'll need a polyfill.
> Modern Angular projects target ES2022 — there `Object.hasOwn` works natively.

---

## Array.fromAsync — Types (TypeScript 5.2)

TypeScript 5.2 introduced correct types for `Array.fromAsync`:

```typescript annotated
// Array.fromAsync: Like Array.from but for async iterables
async function collectData() {
  // Synchronous example with Array.from (familiar):
  const sync = Array.from({ length: 3 }, (_, i) => i);
  // sync: number[]

  // Asynchronous example with Array.fromAsync:
  async function* generateUsers() {
    yield { id: '1', name: 'Alice' };
    yield { id: '2', name: 'Bob' };
    yield { id: '3', name: 'Charlie' };
  }

  const users = await Array.fromAsync(generateUsers());
  // users: { id: string; name: string }[]
  //        ^ TypeScript infers the type correctly from the async generator!

  // Practical Angular example: HTTP streaming
  // (Angular SSE / Streaming HTTP):
  const chunks = await Array.fromAsync(
    streamingResponse as AsyncIterable<DataChunk>
  );
  // chunks: DataChunk[]
}
```

---

## Control Flow: switch(true) Narrowing (TypeScript 5.3)

A small but neat feature from TypeScript 5.3:

```typescript annotated
// switch(true) pattern -- an elegant pattern for complex conditions
function describeUser(user: User | Admin | SuperAdmin): string {
  switch (true) {
    case user.role === 'superadmin':
      // TypeScript 5.3: user is SuperAdmin here! Correct narrowing
      return `Super Admin: ${user.globalPermissions.join(', ')}`;

    case user.role === 'admin':
      // TypeScript 5.3: user is Admin here!
      return `Admin Level ${user.level}: ${user.department}`;

    default:
      // TypeScript: user is User here
      return `User: ${user.name}`;
  }
}
// Before TS 5.3: switch(true) did not narrow the type correctly
// TS 5.3 analyzes the case conditions as type guards
```

---

## What you've learned

- **Preserved Narrowing in Closures** (TS 5.4) solves the long-standing problem with
  null checks that were not recognized inside synchronous closures
- **Array.isArray** now correctly narrows `readonly` arrays without producing strange
  intersection types
- **NoInfer\<T\>** gives you control over which arguments determine type inference
- **Object.groupBy** and **Map.groupBy** have correct types — Partial because of
  possible gaps with Object.groupBy
- **Object.hasOwn** is the modern, type-safe alternative to `hasOwnProperty`

**Core concept to remember:** TypeScript 5.x continuously improves
**Control Flow Analysis** — the algorithm that determines what type a variable
has at any given point in the code. Each improvement makes the compiler smarter
without requiring any changes to your code.

> **Break point** — Well done! The core features of the 5.x series are now internalized.
> Next we'll look at what happens behind the scenes: performance and the editor.
>
> Continue with: [Section 05: Performance and Editor Features](./05-performance-und-editor-features.md)