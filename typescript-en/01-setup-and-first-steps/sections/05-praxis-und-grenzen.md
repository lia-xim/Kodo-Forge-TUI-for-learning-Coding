# Section 5: Practice & Limits -- Type Checking vs. Runtime Behavior

> Estimated reading time: ~10 minutes

## What you'll learn here

- Why TypeScript doesn't change your code's runtime behavior
- Where TypeScript protects you -- and where it DOESN'T
- How to handle the limits (runtime validation, zod, io-ts)

---

## TypeScript DOESN'T change how your code runs

This is a point where many TypeScript beginners stumble. It's important enough to deserve its own section:

**TypeScript adds no runtime checks.**

If you write:

```typescript
function add(a: number, b: number): number {
  return a + b;
}
```

...TypeScript compiles that to:

```javascript
function add(a, b) {
  return a + b;
}
```

If someone calls `add("hello", "world")`, the function returns `"helloworld"` -- there's no type check at runtime. The TypeScript compiler would have flagged the error *beforehand*, but if the code runs anyway (e.g., because it's executed via `tsx` without type checking, or because the data comes from an external API), no error occurs.

### The Analogy: Spell Checker

TypeScript is like a spell checker:

- It shows you errors *as you write*
- It doesn't prevent you from sending the text anyway
- The recipient reads the text with all the errors you ignored
- But if you fix the errors, the text is better

Or even more precisely: TypeScript is like a vehicle safety inspection for your car. The inspection checks *before you drive* whether everything is in order. But it doesn't sit next to you while you're driving and grab the steering wheel. If you skip the inspection and drive anyway, the car still works -- but you bear the risk.

> **Background:** This design decision wasn't the only option. Languages like Dart (also from Google) actually add runtime assertions in debug mode. TypeScript deliberately chose against this, because every runtime check costs performance and makes the generated JavaScript output larger. The core philosophy: *TypeScript is an analysis tool, not a runtime framework.*

---

## Where TypeScript Protects You

TypeScript excels at everything that is **known at compile time**:

**1. Your own code**

```typescript
interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return `Hallo ${user.nmae}`;  // FEHLER! Property 'nmae' does not exist on type 'User'
}
```

The compiler knows the structure of `User` and catches the typo immediately.

**2. Interaction between your modules**

When module A exports a function and module B calls it, TypeScript checks whether the parameters match. This is the main reason why refactoring in TypeScript is so much safer than in JavaScript.

**3. Library APIs**

Thanks to `.d.ts` files, TypeScript knows the types of npm packages. When you call `axios.get()`, the IDE knows which parameters the function expects and what it returns.

---

## Where TypeScript DOESN'T Protect You

TypeScript cannot check what isn't known at compile time. This primarily concerns **external data**:

### 1. API Responses

```typescript annotated
interface UserResponse {
  id: number;
  name: string;
  email: string;
}

const response = await fetch("/api/users/1");
const user: UserResponse = await response.json();
// ^ response.json() returns "any" -- TypeScript trusts you blindly!
// ^ No check whether the API actually returns {id, name, email}
// ^ If the API responds differently: runtime crash with no compiler warning
```

> 🧠 **Explain to yourself:** Why can't TypeScript check the structure of an API response? What is the boundary between compile time and runtime -- and how do you bridge it?
> **Key points:** API data only known at runtime | TypeScript only works at compile time | Type assertion is not a check | Solution: runtime validation (zod, io-ts)

The problem: `response.json()` returns `any`. You cast it to `UserResponse`, but TypeScript doesn't check whether the data actually matches that structure.

> **Practical tip:** In Angular projects, you often see `httpClient.get<UserResponse>(url)`. This looks safe, but it isn't -- the generic argument is just a type assertion, not runtime validation. The HTTP response is not checked against the type.

### 2. User Input

```typescript
const input = document.getElementById("age") as HTMLInputElement;
const age: number = Number(input.value);

// Was wenn der Nutzer "abc" eingibt?
// age ist jetzt NaN -- ein gueltiger JavaScript number-Wert
// TypeScript sagt: alles in Ordnung
```

### 3. `JSON.parse` and Dynamic Data

```typescript
const config = JSON.parse(fs.readFileSync("config.json", "utf-8"));
// config hat den Typ 'any' -- TypeScript weiss nichts ueber den Inhalt
```

> **Think about it:** `JSON.parse()` returns `any`. Why didn't the TypeScript team define that as `unknown`? What would change for all existing projects if `JSON.parse()` suddenly returned `unknown`?

### 4. `any` Casts

```typescript
const data: any = getExternalData();
data.whatever.does.not.exist;  // Kein Fehler! 'any' schaltet TypeScript ab
```

---

## The Solution: Runtime Validation

For external data, you need **runtime validation** -- code that checks at runtime whether the data matches the expected structure. The most popular libraries for this:

### zod -- The Current Standard

```typescript
import { z } from "zod";

// Schema definieren (existiert zur Laufzeit!)
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

// TypeScript-Typ automatisch ableiten
type User = z.infer<typeof UserSchema>;

// Validierung zur Laufzeit
const result = UserSchema.safeParse(await response.json());
if (result.success) {
  console.log(result.data.name);  // Typ-sicher UND runtime-validiert
} else {
  console.error(result.error);
}
```

> **Background:** `zod` was written in 2020 by Colin McDonnell and has become the de facto standard for runtime validation in TypeScript. The trick: you define the schema once, and `zod` derives both the runtime validation and the TypeScript type from it. No duplication, no divergence. This is the most elegant solution to the gap between compile time and runtime.

Other libraries in this space include `io-ts`, `valibot` (lighter than zod), and `arktype`.

> **Experiment:** Open `examples/02-type-erasure.ts` and find a place where TypeScript types don't protect you at runtime. Can you construct a scenario where the code crashes at runtime despite correct types? (Hint: Think about external data coming in as `any`.)

> **Think about it:** The `httpClient.get<UserResponse>(url)` function in Angular *looks* type-safe. Why isn't it? What would Angular need to do differently to guarantee real type safety?

> **Practical tip:** Build the habit of validating every external data source:
> - API responses: `zod` schema
> - Form inputs: framework-native validation (Angular Reactive Forms, React Hook Form) + `zod`
> - Environment variables: `zod` schema for `process.env`
> - JSON config files: `zod` schema
>
> This sounds like a lot of effort, but it saves enormous debugging time.

---

## Summary: Compile Time vs. Runtime

```mermaid
flowchart LR
    subgraph CT ["COMPILE-ZEIT -- TypeScript prueft"]
        C1["Dein eigener Code"]
        C2["Modul-Interaktionen"]
        C3["Library-APIs (.d.ts)"]
        C4["Typen, Interfaces"]
    end

    subgraph RT ["LAUFZEIT -- Du musst selbst pruefen"]
        R1["Externe API-Responses"]
        R2["Benutzereingaben"]
        R3["JSON.parse() Ergebnisse"]
        R4["Dynamische Daten"]
    end

    CT ---|"Grenze"| RT

    style CT fill:#10b981,stroke:#059669,color:#fff
    style RT fill:#ef4444,stroke:#dc2626,color:#fff
```

> The **boundary** between compile time and runtime is the central insight of this lesson. On the left, TypeScript checks automatically. On the right, you are responsible yourself -- with tools like `zod`, `io-ts`, or manual checks.

> **Think about it:** Why did TypeScript decide NOT to add runtime checks? After all, one could automatically generate a runtime check for every type annotation. What would the drawbacks be?

The drawbacks would be: (1) **Performance** -- every type check costs CPU time, (2) **Bundle size** -- the generated JavaScript file would be many times larger, (3) **Compatibility** -- the generated code would no longer be standard JavaScript and would require a TypeScript runtime library, and (4) **Predictability** -- the generated code would be harder to understand and debug. TypeScript would have become a different language, not an extension of JavaScript.

---

## Practice: What You Should Do Now

1. Read through the example files in `examples/` and run them
2. Work through the exercises in `exercises/`
3. Check your solutions against `solutions/`
4. Take the quiz (`quiz.ts`)
5. Keep `cheatsheet.md` as a reference

```bash
# Beispiele ausfuehren
tsx examples/01-hello-typescript.ts
tsx examples/02-type-erasure.ts
tsx examples/03-compiler-errors.ts
tsx examples/04-source-maps-und-output.ts

# Uebungen bearbeiten
code exercises/01-erste-schritte.ts
code exercises/02-tsconfig-verstehen.ts
code exercises/03-compiler-output-vorhersagen.ts
code exercises/04-fehler-finden-und-fixen.ts
code exercises/05-predict-the-output.ts
code exercises/06-fehlermeldungen-lesen.ts

# Quiz starten
tsx quiz.ts
```

---

## What You Learned in This Lesson

1. **TypeScript = JavaScript + static types.** Everything JavaScript can do, TypeScript can do. TypeScript only adds types.

2. **Types only exist at compile time.** At runtime, everything is pure JavaScript. This is called Type Erasure.

3. **The compiler has three phases:** Parsing (generating the AST), Type Checking (finding errors), Emit (generating JavaScript). Type Checking and Emit are independent.

4. **`strict: true` is mandatory.** Without strict mode, you're giving up TypeScript's greatest advantage -- especially `strictNullChecks`.

5. **TypeScript doesn't change runtime behavior.** It adds no checks. It only tells you *beforehand* where problems lurk.

6. **`tsc` checks and compiles, `tsx` executes quickly.** Use both together for the best workflow.

7. **External data** (API responses, JSON, user input) is where TypeScript's limits lie -- this is where you need runtime validation.

---

> **Experiment:** Write a small function that fetches data from a public API (e.g., `https://jsonplaceholder.typicode.com/users/1`). Use `fetch` and assign the result to an interface. Then change the API URL so that invalid data comes back. Your code will crash -- even though TypeScript reports no errors. That is the boundary you need to understand.

## Next Lesson

**Lesson 02: Primitive Types & Fundamentals**
- `string`, `number`, `boolean` in detail
- `null`, `undefined`, `void`, `never`
- `any` vs `unknown` -- and why `any` is poison
- Type Inference -- when TypeScript figures out the type on its own

Continue: `../02-primitive-types/`