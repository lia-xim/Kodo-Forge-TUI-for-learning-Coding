# Section 5: Practical Patterns and Limitations

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Type-Safe Event Systems](./04-event-names.md)

---

## What you'll learn here

- Four concrete practical patterns: CSS properties, route parameters, i18n keys, and SQL columns
- How real libraries (tRPC, Prisma, react-hook-form) use Template Literal Types
- The real limitations of this feature: where it becomes too slow, too complex, or simply unsuitable
- When you should **not** use Template Literal Types

---

## The background story: From idea to library

When TypeScript 4.1 was released, it took less than six months for Template Literal Types to appear in major open-source libraries. The reason: they solved a fundamental problem that type-safe API designers had been working around for years.

The clearest example is **tRPC** (TypeScript Remote Procedure Call). tRPC allows you to call backend functions directly from the frontend — with full type safety, without code generation. The name of a procedure on the server is a string; tRPC turns it into a type-safe call on the client. Template Literal Types are a central tool in making this work.

Similarly with **Prisma**: the ORM generates a fully typed client from your database schema. Queries like `prisma.user.findMany({ where: { name: { contains: "Max" } } })` are type-safe down to the individual column — that wouldn't be so elegant without Template Literal Types.

This is the context for the patterns we'll look at now: they aren't academic, but come from real production software.

---

## Pattern 1: CSS Property Types

TypeScript can ensure that CSS values have the correct format:

```typescript annotated
type CssUnit = "px" | "em" | "rem" | "%" | "vh" | "vw";
type CssLength = `${number}${CssUnit}`;
//               ^^^^^^^^^  ^^^^^^^^
//               A number   Followed by a valid unit

type CssColor =
  | `#${string}`                                    // Hex: #ff0000
  | `rgb(${number}, ${number}, ${number})`          // RGB: rgb(255, 0, 0)
  | `rgba(${number}, ${number}, ${number}, ${number})` // RGBA with alpha
  | "transparent" | "inherit" | "currentColor";    // Keywords

function setStyle(property: string, value: CssLength | CssColor): void {
  document.documentElement.style.setProperty(property, value);
}

setStyle("--spacing", "8px");          // OK
setStyle("--margin", "2rem");          // OK
setStyle("--primary", "#3490dc");      // OK
setStyle("--bg", "rgb(255, 255, 255)");// OK
// setStyle("--size", "100");          // ERROR! Missing unit
// setStyle("--color", "blue");        // ERROR! "blue" is not a valid value
```

**Important limitation:** `${number}` allows all JavaScript numbers — including `Infinity`, `NaN`, and negative numbers like `-8`. CSS values are not always non-negative. Template Literal Types cannot constrain this further; runtime validation is needed as a second line of defense.

---

> **Experiment:** Try the following in the TypeScript Playground:
>
> ```typescript
> type GridTemplate = `repeat(${number}, ${number}fr)`;
>
> const a: GridTemplate = "repeat(3, 1fr)";   // OK?
> const b: GridTemplate = "repeat(0, 2fr)";   // OK? (0 columns meaningless, but TypeScript?)
> const c: GridTemplate = "repeat(3, auto)";  // Error? (auto is not a number)
>
> // Now with string instead of number:
> type FlexibleGrid = `repeat(${number | "auto-fill" | "auto-fit"}, ${number}fr)`;
> const d: FlexibleGrid = "repeat(auto-fill, 1fr)"; // OK?
> const e: FlexibleGrid = "repeat(3, 1fr)";         // OK?
> ```
>
> Notice how `number` and string literals can be combined in templates. What happens when you try to use `0.5fr`?

---

## Pattern 2: Route Parameter Extraction

Frameworks like Express and Angular Router use `:param` for URL parameters. Template Literal Types can extract these parameters:

```typescript annotated
// Recursive extraction of all parameters from a route pattern:
type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
  //         ^^^^^^^^^^^                              // Everything before the parameter
  //                    ^^^^^^^^^^^                  // The parameter name
  //                               ^^^^^^^^^^^^      // Everything after (recursive)
    ? Param | ExtractParams<`/${Rest}`>
    : T extends `${string}:${infer Param}`
      ? Param
      : never;

type Params1 = ExtractParams<"/users/:userId">;
// "userId"
type Params2 = ExtractParams<"/users/:userId/posts/:postId">;
// "userId" | "postId"
type Params3 = ExtractParams<"/dashboard">;
// never — no parameters

// Type-safe route handler:
type RouteHandler<Path extends string> = (
  params: Record<ExtractParams<Path>, string>,
  //       ^^^^^^                               // All extracted parameters as keys
  query: Record<string, string>
) => Response;

// Usage:
function createRoute<P extends string>(
  path: P,
  handler: RouteHandler<P>
): void { /* ... */ }

createRoute("/users/:userId/posts/:postId", (params) => {
  console.log(params.userId);   // OK — TypeScript knows: exists
  console.log(params.postId);   // OK — TypeScript knows: exists
  // console.log(params.id);    // ERROR! "id" is not an extracted parameter
  return new Response("OK");
});
```

**In Angular:** The Angular Router doesn't use Template Literal Types internally (it was designed before TypeScript 4.1), but you can build type-safe router definitions yourself:

```typescript
type AppRoutes = "/dashboard" | "/users/:id" | "/users/:id/edit";

// Type-safe navigate:
function navigate<R extends AppRoutes>(
  route: R,
  params: Record<ExtractParams<R>, string>
): void {
  // Replace :param with the real value
  let url: string = route;
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, value);
  });
  window.location.href = url;
}

navigate("/users/:id", { id: "42" });           // OK
// navigate("/users/:id", { userId: "42" });    // ERROR! "userId" != "id"
// navigate("/dashboard", { id: "42" });        // ERROR! dashboard has no params
```

---

## Pattern 3: i18n Translation Keys

Multilingual support requires unique key names in a hierarchy. Template Literal Types can enforce the allowed structure:

```typescript annotated
// Allow only keys that follow a namespace pattern:
type TranslationKey =
  | `nav.${string}`                   // Navigation: nav.home, nav.settings, ...
  | `page.${string}.title`            // Page titles: page.about.title, ...
  | `page.${string}.description`      // Page descriptions
  | `error.${number}`                 // Errors: error.404, error.500, ...
  | `validation.${string}`;           // Validation: validation.required, ...

function t(key: TranslationKey): string {
  return i18nCatalog[key] ?? key; // Fallback: display the key itself
}

t("nav.home");                   // OK
t("page.about.title");           // OK
t("error.404");                  // OK — number allowed
t("validation.required");        // OK
// t("footer.copyright");        // ERROR! "footer" is not a valid namespace
// t("page.about");               // ERROR! Missing title or description
```

**Think about it:** What is the downside of this approach compared to a type-generated solution (e.g. from a JSON file)?
The `TranslationKey` with `${string}` placeholders is **too permissive** — it allows `nav.any-nonsense`, even if that key doesn't exist in the translation file at all. A generated solution would only allow keys that actually exist. This is one of the real trade-offs with Template Literal Types.

---

## Pattern 4: Qualified Column Names

For type-safe SQL queries — or any system with tables and columns:

```typescript annotated
type Table = "users" | "products" | "orders";

// Columns per table (Conditional Types + Template Literals):
type Column<T extends Table> =
  T extends "users"    ? "id" | "name" | "email" | "created_at" :
  T extends "products" ? "id" | "name" | "price" | "stock" :
  T extends "orders"   ? "id" | "userId" | "total" | "status" :
  never;

// Qualified column name: "table.column"
type QualifiedColumn<T extends Table> = `${T}.${Column<T>}`;

type UserColumns    = QualifiedColumn<"users">;
// "users.id" | "users.name" | "users.email" | "users.created_at"

type AllColumns = QualifiedColumn<Table>;
// All valid table.column combinations

// Type-safe SELECT function:
function select(columns: Array<QualifiedColumn<Table>>): void {
  const sql = `SELECT ${columns.join(", ")} FROM ...`;
  console.log(sql);
}

select(["users.name", "orders.total", "products.price"]); // OK
// select(["users.password"]);   // ERROR! "password" is not a valid column
// select(["users.stock"]);      // ERROR! "stock" belongs to products, not users
```

---

## The real limitations — when Template Literal Types don't help

After four positive examples, some honesty is warranted. Template Literal Types have real limitations:

**Limitation 1: Performance with large unions**

```typescript
// This can slow down or crash the compiler:
type AllCssProperties = "width" | "height" | "margin" | /* ... 300 more */ | "z-index";
type AllCssValues = `${number}px` | `${number}em` | /* ... */;

// type AllCombinations = `${AllCssProperties}: ${AllCssValues}`;
// WARNING: 300 × 500 = 150,000 combinations — the compiler will be very slow
```

**Limitation 2: number literals are unbounded**

```typescript
type PositiveInt = ??? // TypeScript cannot express this
// ${number} allows -1, 0, 3.14, Infinity, NaN
// There is no way to enforce "only positive integers" in the type
```

**Limitation 3: Complex regex patterns**

```typescript
// Template Literal Types CANNOT do this:
type ValidEmail = ???  // email@domain.tld — too complex for Template Literals
type ValidUrl = ???    // https://... with optional parts

// For real validation: runtime checking (zod, yup, Regex)
```

**Limitation 4: Semantic correctness**

```typescript
// Template Literal Types check structure, not semantics:
type HexColor = `#${string}`;

const a: HexColor = "#ff0000"; // OK — correct hex color
const b: HexColor = "#xyz";    // OK for TypeScript! Not a valid hex value!
const c: HexColor = "#";       // OK for TypeScript! But empty hex is invalid
```

> **Explain it to yourself:** Explain the distinction between "structural correctness" (what TypeScript can check) and "semantic correctness" (what TypeScript cannot check). What consequences does this have for your design decisions?
>
> **Key points:** Structure = format of the string (starts with #, has a hyphen, ends with px). Semantics = meaning (is a valid hex value, is a real URL). TypeScript can only check structure. Semantic validation must happen at runtime with real code (zod, Regex, manually). Using both together gives the highest level of safety.

---

## How real libraries use this

For reference: here's how professional libraries apply Template Literal Types:

```typescript
// tRPC (simplified): Procedure names as Template Literals
type RouterProcedure = `${string}.${string}`;
// "user.getById" | "post.create" | ...

// Prisma (simplified): Field names for orderBy
type OrderByField<T> = `${keyof T & string}${"Asc" | "Desc"}`;
// "nameAsc" | "nameDesc" | "createdAtAsc" | ...

// react-hook-form (simplified): Type-safe field names
type FieldPath<T> = DotPath<T>; // We know this from Section 3!

// Zod (different!): Zod skips Template Literals and uses runtime validation
// This is intentional — Zod validates at runtime, not just at compile time
```

**In React:** React itself uses Template Literal Types for event props. The `DOMAttributes<T>` in `@types/react` uses the `on${Capitalize<EventName>}` pattern:

```typescript
// What React does internally (simplified from @types/react):
type ReactEventHandlers = {
  onClick?: (event: React.MouseEvent) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onChange?: (event: React.ChangeEvent) => void;
  // ... all other event handlers
};

// You now have the tools to understand this — and build it yourself
```

---

## What you've learned

- CSS property types: `` `${number}${CssUnit}` `` enforces units, but is permissive about values (no protection against negative numbers or NaN)
- Route parameter extraction: `ExtractParams<Path>` makes router params type-safe — now explain to yourself why `params.id` works with `/users/:id`
- i18n keys and SQL columns: Template Literals as namespace enforcement — useful, but too permissive with `${string}` for real production use
- The real limitations: performance with large unions, no semantic validation, no constraints for numbers beyond the `number` type

> **Explain it to yourself:** You've seen four practical patterns. In which case would you NOT use Template Literal Types and instead choose runtime validation? What is the deciding criterion?
>
> **Key points:** Template Literal Types for compile-time errors (typos, wrong names). Runtime validation for external data (APIs, user input). When data comes from an unknown source, TypeScript doesn't help — zod, Regex, or manual code are necessary. Combining both layers = maximum safety.

**Core concept to remember:** Template Literal Types are a tool for **compile-time safety with string formats**. They shine with internal APIs, configuration, and conventions (event names, route parameters, method names). With external data, complex formats, or semantic correctness they are too weak — there you need runtime validation as a partner.

---

> **Pause point** — End of lesson. You now have a solid command of Template Literal Types, from simple concatenation through string parsers to type-safe event systems and practical patterns. This is one of the most advanced mechanisms in the TypeScript type system.
>
> Take a moment: Which of the five patterns from this lesson could you apply directly in your current project? Event names? Route parameters? CSS types? That's the best way to consolidate what you've learned.
>
> **Next lesson:** [19 - Modules & Declarations](../../19-modules-und-declarations/README.md)