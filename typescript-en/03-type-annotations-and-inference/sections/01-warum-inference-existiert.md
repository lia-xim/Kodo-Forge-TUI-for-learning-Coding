# Section 1: Why Inference Exists

**Estimated reading time:** ~10 minutes

## What you'll learn here

- What Type Inference actually is and which problem it solves
- Why TypeScript chose "partial inference" -- and what the alternative would be
- The history behind Hindley-Milner and how TypeScript deviates from it
- The core principle that will guide all your annotation decisions

---

## Questions to keep in mind for this section

Keep these questions in mind as you read. By the end of this section, you should be able to answer them:

1. **Why is inference no less safe than an explicit annotation?**
2. **What problem would arise if TypeScript automatically inferred parameters from call sites?**

---

## The Problem Without Inference

Imagine TypeScript had **no** inference. Every single variable, every intermediate result, every callback parameter would need to be annotated:

```typescript
// Welt OHNE Inference (hypothetisch)
const name: string = "Matthias";
const items: number[] = [1, 2, 3];
const doubled: number[] = items.map((n: number): number => n * 2);
const result: number = doubled.reduce(
  (acc: number, curr: number): number => acc + curr,
  0 as number
);
```

Compare this with real TypeScript:

```typescript
// Welt MIT Inference (Realitaet)
const name = "Matthias";
const items = [1, 2, 3];
const doubled = items.map(n => n * 2);
const result = doubled.reduce((acc, curr) => acc + curr, 0);
```

Both versions are **exactly equally safe**. TypeScript knows every type in both cases. But the second version is readable, maintainable, and lets you focus on the logic rather than type decorations.

> **Remember**: Inference is not "less safe". The compiler uses the same type internally, regardless of whether you wrote it out or not. `let x = 5` is just as strictly `number` as `let x: number = 5`.

> 🧠 **Explain to yourself:** Why is `const name = "Matthias"` just as safe as `const name: string = "Matthias"` -- and in one important way even better?
> **Key points:**
> - The compiler knows the type `string` internally in both cases
> - Without an annotation, TS even infers the more precise literal type `"Matthias"` (not just `string`)
> - Inference and explicit annotation provide the same compile-time protection
> - Annotation is just documentation for the human reader -- TypeScript doesn't need it

---

## The Analogy: Inference as a Detective

Imagine the TypeScript compiler as a **detective**. It arrives at a crime scene (your code) and gathers clues:

- **Clue 1 (value):** You write `const x = 42` -- the detective sees a number. Conclusion: `number`.
- **Clue 2 (context):** You pass a function to `array.map()` -- the detective knows what `.map()` expects. Conclusion: the parameter has the element type of the array.
- **Clue 3 (logic):** You write `if (typeof x === "string")` -- the detective knows: from here on, `x` is a `string`.

An **annotation**, on the other hand, is like a **name tag**: you tell the detective directly "this is a string". It no longer needs to investigate -- but it still checks whether the name tag matches reality.

```
Inference  = Detektiv, der aus Hinweisen schliesst
Annotation = Namensschild, das du selbst anbringst
```

---

## The History Behind Type Inference

> **Background:** Type Inference is not a TypeScript invention. The theoretical foundation dates back to the 1970s: the **Hindley-Milner algorithm** (named after Roger Hindley and Robin Milner). This algorithm can automatically derive the type of **every single expression** in functional languages like Haskell or ML -- without a single annotation.

### Haskell vs. TypeScript: Two Philosophies

In Haskell, you can actually write an entire program without type annotations:

```haskell
-- Haskell: Keine einzige Annotation, trotzdem vollstaendig typsicher
map (\x -> x * 2) [1, 2, 3]
filter (\x -> length x > 3) ["hello", "hi", "world"]
```

TypeScript has **deliberately chosen not to** go that far. Why?

**The reason is: readability beats convenience.**

JavaScript codebases are read and modified by many developers. If parameter types were automatically inferred from call sites, every reader would need to hold the entire call graph in their head to understand what a function accepts. This makes code **writable**, but **not readable**.

> **Fun Fact:** Haskell developers voluntarily write type signatures above their functions despite perfect inference -- because it improves readability. TypeScript has baked this pragmatism directly into the language: parameters **must** be annotated.

### What TypeScript Borrowed from Hindley-Milner

TypeScript uses a **simplified, local** variant of Type Inference:

| Aspect | Hindley-Milner (Haskell) | TypeScript |
|--------|--------------------------|------------|
| **Scope** | Global (entire program) | Local (individual expressions/functions) |
| **Parameters** | Are inferred | Must be annotated |
| **Return Types** | Are inferred | Are inferred (annotation recommended for exports) |
| **Generics** | Full unification | Limited inference from arguments |
| **Philosophy** | Maximum compactness | Readability at boundaries, compactness inside |

The short version: TypeScript infers **inside** functions, but requires explicit types **at the boundaries** (parameters). This principle is called **"Annotate at boundaries, infer inside"** -- and it will guide you through this entire lesson.

---

## Why Parameters Cannot Be Inferred

This is not a technical limitation, but a **deliberate design decision**. TypeScript could theoretically look at how a function is called and derive parameter types from that. But three reasons argue against it:

### 1. Call Sites Can Change

```typescript
// Heute: process wird nur mit Strings aufgerufen
process("hello");
process("world");

// Naechste Woche: Jemand fuegt hinzu
process(42);  // Ploetzlich aendert sich der Parameter-Typ!
```

If the parameter type depends on call sites, it is **unstable**. Every new caller changes the contract of the function -- the opposite of reliable typing.

### 2. Circular Dependencies

```typescript
function a(x) { return b(x); }
function b(y) { return a(y); }
// Welcher Typ zuerst? Endlosschleife!
```

### 3. Parameters Are Contracts, Not Observations

A function signature documents the **intention** of the author, not the current usage. The parameter type says: "I am designed to accept X" -- regardless of whether anyone has passed Y so far.

> **Think about it:** You write `function process(data)` and only call it with strings. Should the parameter automatically be `string`? What happens when someone calls it with a number next week?

---

## The Core Principle of This Lesson

```
  +---------------------------------------------------------+
  |        Funktions-Grenze                                 |
  |  +---------------------------------------------------+  |
  |  |   params: ANNOTIERT  ------------------>          |  |
  |  |                                                   |  |
  |  |   lokale vars:     inferiert                      |  |
  |  |   callbacks:       inferiert (Contextual Typing)  |  |
  |  |   zwischenwerte:   inferiert                      |  |
  |  |                                                   |  |
  |  |   <------------------  return: ANNOTIERT          |  |
  |  |                        (bei Exports)              |  |
  |  +---------------------------------------------------+  |
  |                                                         |
  |  Externe Daten (API, JSON, etc): ANNOTIERT              |
  +---------------------------------------------------------+
```

**Annotate at boundaries, let the inside infer.** This is the short formula that all subsequent sections will elaborate on.

```typescript annotated
// Das Prinzip "annotate at boundaries, infer inside" in der Praxis:
// (Order und Summary wuerden in einer separaten Datei definiert)

interface Order { price: number; name: string; }
interface Summary { total: number; count: number; labels: string[]; }

function processOrders(orders: Order[], taxRate: number): Summary {
// ^ Parameters: ALWAYS annotate ----------^              ^-- and return type
  const total = orders.reduce((sum, o) => sum + o.price, 0);
  // ^ Local variable: DO NOT annotate -- TS infers `number`

  const withTax = total * (1 + taxRate);
  // ^ Intermediate result: DO NOT annotate -- TS infers `number`

  const labels = orders.map(o => o.name);
  // ^ Callback parameter 'o': DO NOT annotate (Contextual Typing)
  // ^ 'labels': DO NOT annotate -- TS infers `string[]`

  return { total: withTax, count: orders.length, labels };
  // ^ Return: TS checks whether the object matches the return type `Summary`
}
```

---

## In Your Angular Project: Where You See This Principle Every Day

Angular services demonstrate the principle perfectly:

```typescript
@Injectable({ providedIn: 'root' })
export class ProductService {
  // Grenze: Konstruktor-Parameter annotiert (Dependency Injection benoetigt das)
  constructor(private http: HttpClient) {}

  // Grenze: Return-Typ annotiert -- der Konsument soll wissen, was er bekommt
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('/api/products').pipe(
      // Innen: Callback-Parameter 'products' -- NICHT annotieren!
      // Angular's HttpClient + RxJS kennen den Typ (Contextual Typing)
      map(products => products.filter(p => p.active)),
      // 'p' ist automatisch Product -- keine Annotation noetig
    );
  }
}
```

The `HttpClient` generic `<Product[]>` is the boundary: here you tell TypeScript what type should come from the API. Everything after that in the `.pipe()` chain is inferred automatically by TS.

---

## Experiment Box: Try It Yourself

> **Experiment:** Try the following in the TypeScript Playground (typescriptlang.org/play):
>
> ```typescript
> // Schritt 1: const vs. let -- hovere ueber die Variablen
> const x = 42;       // Was ist der Typ?
> let y = 42;         // Was ist der Typ?
>
> // Schritt 2: Funktionen mit Parametern
> const fn = (a: number, b: number) => a + b;
> // Hovere ueber 'fn' -- welchen Return-Typ inferiert TS automatisch?
>
> // Schritt 3: Entferne die Parameter-Annotationen
> const fn2 = (a, b) => a + b;
> // Was passiert jetzt? Warum?
>
> // Schritt 4: Inference innerhalb der Funktion
> function calculate(price: number, tax: number) {
>   const total = price + tax;       // Kein Typ noetig -- TS inferiert
>   const label = `Gesamt: ${total}`; // Auch inferiert
>   return { total, label };          // Return-Typ wird inferiert
> }
> // Hovere ueber 'calculate' -- was ist der Return-Typ?
> ```
>
> These four steps demonstrate the core principle: at the boundaries (parameters), you must annotate; inside (local variables, returns), TS infers automatically.

---

## Rubber Duck Prompt

Explain to an imaginary colleague in 2-3 sentences:
- What is the difference between inference and annotation?
- Why does TypeScript deliberately NOT infer parameters?

If you can't explain this freely, re-read the section "Why Parameters Cannot Be Inferred".

---

## What You've Learned

- **Type Inference** means: the compiler derives the type from context without you having to write it out
- Inference is **just as safe** as explicit annotations -- the internal type is identical
- TypeScript uses a **local, simplified** form of Hindley-Milner inference
- Parameters are **deliberately not** inferred -- they are contracts, not observations
- The guiding principle is: **"Annotate at boundaries, infer inside"**

---

**Pause point.** When you're ready, continue with [Section 2: Explicit Annotations](./02-explizite-annotationen.md) -- there you'll learn the full annotation syntax and exactly when to use it.