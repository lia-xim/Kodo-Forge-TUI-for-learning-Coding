# Cheatsheet: Type Annotations & Type Inference

## Annotation Syntax -- Quick Reference

```typescript
// Variable
let x: string = "hello";

// Funktion
function fn(a: number, b: string): boolean { ... }

// Arrow Function
const fn = (a: number): string => a.toString();

// Objekt-Destructuring
function fn({ name, age }: { name: string; age: number }): void { ... }

// Array-Destructuring
const [a, b]: [string, number] = ["hello", 42];

// Array
let items: string[] = [];
let items: Array<string> = [];

// Tuple
let pair: [string, number] = ["hello", 42];

// Union
let id: string | number = "abc";

// Literal
let dir: "north" | "south" = "north";

// Generic
function fn<T>(x: T): T { return x; }
```

---

## Decision Table: When to Annotate?

| Situation | Annotate? | Reason |
|-----------|:---------:|--------|
| Function parameters | YES | TS cannot infer parameters |
| Exported return types | YES | Stable API, better error messages |
| Local variable with value | NO | Inference is correct |
| Local variable without value | YES | Otherwise it becomes `any` |
| Callback parameters | NO | Contextual Typing |
| Empty arrays `[]` | YES | Otherwise becomes `any[]` |
| `const` primitive | NO | Literal type is correctly inferred |
| Object property type | DEPENDS | Only when widening is problematic |
| Generic call `fn<T>(x)` | NO | T is inferred from `x` |
| Separate callback | YES | No contextual typing |
| API response / JSON.parse | YES | TS doesn't know the runtime type |
| Complex return types (5+ unions) | YES | Documentation + error prevention |

---

## Widening Rules

| Declaration | Value | Inferred Type | Explanation |
|-------------|-------|---------------|-------------|
| `const x =` | `"hello"` | `"hello"` | const primitive = Literal |
| `let x =` | `"hello"` | `string` | let = Widened |
| `const x =` | `42` | `42` | const primitive = Literal |
| `let x =` | `42` | `number` | let = Widened |
| `const x =` | `true` | `true` | const primitive = Literal |
| `let x =` | `true` | `boolean` | let = Widened |
| `const obj =` | `{ a: 1 }` | `{ a: number }` | Object Properties = Widened |
| `const arr =` | `[1, 2]` | `number[]` | Array = Widened |
| `function()` | `return "x"` | `string` | Return = Widened |

---

## `as const` -- Effects

| Without `as const` | With `as const` |
|---------------------|-----------------|
| `"hello"` --> `string` (with let) | `"hello"` --> `"hello"` |
| `[1, 2, 3]` --> `number[]` | `[1, 2, 3]` --> `readonly [1, 2, 3]` |
| `{ a: 1 }` --> `{ a: number }` | `{ a: 1 }` --> `{ readonly a: 1 }` |
| Properties are mutable | Properties are `readonly` |
| Array has variable length | Array is a Tuple (fixed length) |
| No union type derivable | Union with `(typeof X)[number]` possible |

### Typical `as const` Use Case:

```typescript
const ROLES = ["admin", "user", "guest"] as const;
type Role = (typeof ROLES)[number];
// Ergebnis: "admin" | "user" | "guest"
```

---

## satisfies vs Annotation vs Inference

| Tool | Validates? | Precise Types? | Use when... |
|------|:----------:|:--------------:|-------------|
| `: Typ` (Annotation) | Yes | No (widened to annotation type) | Restrict the type (e.g., let variable) |
| `satisfies Typ` | Yes | Yes (inferred types are preserved) | Config objects, configuration constants |
| Nothing (Inference) | No | Yes | Local variables with a clear value |
| `as const satisfies Typ` | Yes | Yes + Literal + Readonly | Enum replacement, route definitions |

### Quick Decision:

```
Do you need validation?  --No-->  Let TS infer
        |Yes
Do you need specific types?  --No-->  Annotation (: Typ)
        |Yes
Do you need Literal + Readonly?  --No-->  satisfies Typ
        |Yes
        as const satisfies Typ
```

---

## Control Flow Narrowing

| Check | Before | After |
|-------|--------|-------|
| `typeof x === "string"` | `string \| number` | `string` |
| `x instanceof Date` | `Date \| string` | `Date` |
| `if (x)` | `string \| null` | `string` (Caution: 0 and `""` are also removed!) |
| `x !== null` | `string \| null` | `string` |
| `"key" in x` | `A \| B` | Type with "key" |
| `x.kind === "circle"` | `Circle \| Rect` | `Circle` (Discriminated Union) |
| Type Predicate | `unknown` | Defined type |

---

## Inference Rules

### 1. Variable Initialization
TS infers the type from the initial value.
```typescript
let x = 5;        // number
const y = "hi";   // "hi"
```

### 2. Return Type Inference
TS forms the union of all return paths.
```typescript
function f(x: boolean) {
  if (x) return "yes";
  return 42;
}
// Return: "yes" | 42
```

### 3. Best Common Type
For arrays, TS finds the narrowest common type.
```typescript
const arr = [1, "hello", null];
// (string | number | null)[]
```

### 4. Contextual Typing
The context determines the type of callback parameters.
```typescript
[1,2,3].map(n => n * 2);
//           ^-- n: number (aus Array-Typ)
```

### 5. Generic Inference
Type parameters are inferred from arguments.
```typescript
function id<T>(x: T): T { return x; }
id("hello");  // T = string
```

### 6. Control Flow Analysis
TS narrows types based on conditions.
```typescript
function f(x: string | null) {
  if (x !== null) {
    x.toUpperCase();  // x: string
  }
}
```

---

## Where Inference Fails

| Situation | Inferred Type | Problem | Solution |
|-----------|---------------|---------|----------|
| `const x = []` | `any[]` | No element type known | `const x: string[] = []` |
| `Object.keys(obj)` | `string[]` | Not the concrete keys | `(Object.keys(obj) as (keyof typeof obj)[])` |
| `JSON.parse(...)` | `any` | Runtime type unknown | Annotation or runtime validation |
| Separate callback | Parameters are `any` | No contextual typing | Annotate parameters |
| `fetch().json()` | `any` | API type unknown | Annotate return type |

---

## Memory Aids

- **Parameters** = Door into the house --> always label them (annotate)
- **Local variable** = Furniture in the house --> TS sees it directly
- **Return Type** = Package going out --> label it if exported
- **Empty array** = empty box --> put a label on it (specify the type)
- **Callback in .map()** = TS knows the contents --> don't label it
- **`as const`** = "Please don't touch!" --> everything becomes readonly + literal
- **`satisfies`** = "Matches the blueprint, but keeps the details"
- **Control Flow** = TS reads along --> after if/typeof it knows more than before

---

## Golden Rules (to Memorize)

1. **Annotate at boundaries, infer inside**
2. **Empty arrays, JSON, API responses: always annotate**
3. **Do NOT annotate callback parameters (Contextual Typing)**
4. **satisfies for configuration objects with a schema**
5. **as const when literal types or readonly are needed**
6. **as const satisfies for maximum precision + validation**
7. **Exhaustiveness checking with never in the default branch**
8. **Type predicates for custom type guards**