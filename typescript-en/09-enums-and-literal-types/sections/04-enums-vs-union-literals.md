# Section 4: Enums vs Union Literal Types

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - String Enums](./03-string-enums.md)
> Next section: [05 - Template Literal Types](./05-template-literal-types.md)

---

## What you'll learn here

- The comprehensive **comparison** between Enums and Union Literal Types
- Why `as const` Objects are often the **best alternative**
- A clear **decision guide** for practical use
- What happens with **Tree Shaking** and **Bundle Size**

---

## The Big Comparison

Here is the same concept implemented in three different ways:

```typescript annotated
// 1. String Enum
enum DirectionEnum {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}

// 2. Union Literal Type
type DirectionUnion = "UP" | "DOWN" | "LEFT" | "RIGHT";

// 3. as const Object
const Direction = {
  Up: "UP",
  Down: "DOWN",
  Left: "LEFT",
  Right: "RIGHT",
} as const;
type DirectionConst = typeof Direction[keyof typeof Direction];
// ^ "UP" | "DOWN" | "LEFT" | "RIGHT"
```

### What happens at runtime?

```typescript
// 1. Enum → generates a JavaScript object:
// var DirectionEnum;
// (function (DirectionEnum) {
//     DirectionEnum["Up"] = "UP";
//     ...
// })(DirectionEnum || (DirectionEnum = {}));

// 2. Union Type → NOTHING! Completely removed (Type Erasure):
// (no JavaScript code)

// 3. as const Object → a normal JavaScript object:
// const Direction = { Up: "UP", Down: "DOWN", Left: "LEFT", Right: "RIGHT" };
```

> 🧠 **Explain it to yourself:** Which of the three variants produces the
> smallest JavaScript output? And what consequence does that have for
> the bundle size?
> **Key points:** Union Type produces ZERO code | as const Object produces a normal object | Enum produces an IIFE wrapper | With many enums the overhead adds up

---

## Comparison Table

| Criterion | Enum | Union Literal | as const Object |
|---|---|---|---|
| Runtime code? | Yes (IIFE) | No (Type Erasure) | Yes (normal object) |
| Reverse Mapping? | Numeric only | No | Manually possible |
| Tree-Shakeable? | Poor | Perfect | Good |
| IDE Autocomplete? | Yes | Yes | Yes |
| Exhaustive Checks? | Yes | Yes | Yes |
| Iterate over values? | Cumbersome | Not possible | `Object.values()` |
| Extendable? | No | No | Via spread |
| Runtime access to values? | Yes | No | Yes |
| Nominal type? | Yes | No (structural) | No (structural) |
| Compatible with strings? | No (with String Enum) | Yes | Yes |

### What does "nominal type" mean?

```typescript annotated
enum StatusA { Active = "ACTIVE" }
enum StatusB { Active = "ACTIVE" }

// Even though both have the same value:
let a: StatusA = StatusA.Active;
// let b: StatusA = StatusB.Active;
// ^ Error! StatusB.Active is not assignable to StatusA!

// With Union Types: Structural compatibility
type StatusC = "ACTIVE" | "INACTIVE";
type StatusD = "ACTIVE" | "INACTIVE";

let c: StatusC = "ACTIVE";
let d: StatusD = c;
// ^ OK! Same structure = compatible
```

> 📖 **Background: Nominal vs. Structural Typing**
>
> TypeScript uses a **structural type system**: Two types are
> compatible if their structure matches — regardless of their names. Enums
> are the **only exception**: They are nominal, meaning the name matters.
>
> In practice this means: If you define `StatusA` in one package
> and `StatusB` in another, they are incompatible — even if
> they have identical values. This is sometimes desired (safety),
> sometimes inconvenient (library compatibility).

---

## The as const Object Pattern (The Modern Alternative)

This pattern combines the advantages of Enums and Union Types:

```typescript annotated
// 1. Define the object with as const
const HttpStatus = {
  Ok: 200,
  Created: 201,
  BadRequest: 400,
  NotFound: 404,
  InternalError: 500,
} as const;

// 2. Derive the Union Type
type HttpStatus = typeof HttpStatus[keyof typeof HttpStatus];
// ^ 200 | 201 | 400 | 404 | 500

// 3. Use both — values AND types
function handleResponse(status: HttpStatus) {
  if (status === HttpStatus.Ok) {
    // ^ Access via named constants
    console.log("All good!");
  }
}

// Iteration works cleanly:
const allStatuses = Object.values(HttpStatus);
// ^ [200, 201, 400, 404, 500]

const statusNames = Object.keys(HttpStatus);
// ^ ["Ok", "Created", "BadRequest", "NotFound", "InternalError"]
```

### The typeof + keyof Trick Explained

```typescript annotated
const Colors = {
  Red: "#ff0000",
  Green: "#00ff00",
  Blue: "#0000ff",
} as const;

// Step by step:
type ColorsObject = typeof Colors;
// ^ { readonly Red: "#ff0000"; readonly Green: "#00ff00"; readonly Blue: "#0000ff" }

type ColorKeys = keyof typeof Colors;
// ^ "Red" | "Green" | "Blue"

type ColorValues = typeof Colors[keyof typeof Colors];
// ^ "#ff0000" | "#00ff00" | "#0000ff"

// Shorthand (same type name as the constant):
type Colors = typeof Colors[keyof typeof Colors];
// ^ "#ff0000" | "#00ff00" | "#0000ff"
```

> 💭 **Think about it:** You may notice that `Colors` (const) and `Colors` (type)
> share the same name. Is that a mistake?
>
> **Answer:** No! TypeScript allows a **value** and a **type**
> to have the same name. They live in different "namespaces".
> When you use `Colors` as a type (e.g. in an annotation),
> TypeScript references the type. When you use `Colors` as a value
> (e.g. `Colors.Red`), it references the constant.
> Enums do the same thing — every enum is simultaneously a type and a value.

---

## Decision Guide

```
Do you need runtime values (iteration, logging)?
├── No → Union Literal Type: type Status = "active" | "inactive"
└── Yes
    ├── Do you need nominal typing (different enums not interchangeable)?
    │   ├── Yes → String Enum: enum Status { Active = "ACTIVE" }
    │   └── No
    │       └── as const Object: const Status = { Active: "ACTIVE" } as const
    └── Do you need Reverse Mapping (value → name)?
        ├── Yes → Numeric Enum (use with caution)
        └── No → as const Object or String Enum
```

### Rules of Thumb

1. **Default choice:** Union Literal Type — simple, no runtime code
2. **When you need runtime values:** `as const` Object
3. **When you need strict nominal types:** String Enum
4. **When you need bitwise flags:** Numeric Enum
5. **Never:** Heterogeneous Enums (mixed String + Number)

> 🧠 **Explain it to yourself:** Why is a Union Literal Type the
> default choice and not an Enum? Name three concrete reasons.
> **Key points:** No runtime code | Structurally compatible with strings | Tree-shakeable | Easier to understand | No import needed when type is inline

---

## What you've learned

- Union Literal Types are the **simplest and lightest** approach
- `as const` Objects provide **runtime values with derived types**
- Enums are **nominal** (name matters), everything else is **structural**
- The `typeof X[keyof typeof X]` trick derives Union Types from objects
- **A value and a type can share the same name** in TypeScript

**Core concept to remember:** In most cases you don't need an Enum. Union Literal Types cover 80% of use cases, `as const` Objects cover another 15%, and real Enums are only needed for the remaining 5%.

> ⚡ **In your Angular project:**
>
> ```typescript
> // The as const pattern for Angular Route Guards and HTTP Interceptors:
> const UserStatus = {
>   Active:    "active",
>   Suspended: "suspended",
>   Pending:   "pending",
> } as const;
> type UserStatus = typeof UserStatus[keyof typeof UserStatus];
>
> @Injectable({ providedIn: "root" })
> export class AuthGuard implements CanActivate {
>   canActivate(): boolean {
>     const status: UserStatus = this.authService.getStatus();
>     // Exhaustive Check works with Union Types AND as const Objects:
>     return status === UserStatus.Active;
>   }
> }
>
> // In React: Props with as const for Design System components
> const ButtonVariants = { primary: "primary", secondary: "secondary", danger: "danger" } as const;
> type ButtonVariant = typeof ButtonVariants[keyof typeof ButtonVariants];
> // <Button variant="primary"> — direct string works!
> ```

> **Experiment:** Try the following in the TypeScript Playground:
> ```typescript
> // Variant 1: String Enum
> enum StatusEnum { Active = "ACTIVE", Inactive = "INACTIVE" }
>
> // Variant 2: Union Literal Type
> type StatusUnion = "ACTIVE" | "INACTIVE";
>
> // Variant 3: as const Object
> const Status = { Active: "ACTIVE", Inactive: "INACTIVE" } as const;
> type StatusConst = typeof Status[keyof typeof Status];
>
> // Testing compatibility:
> function setStatusEnum(s: StatusEnum) { console.log(s); }
> function setStatusConst(s: StatusConst) { console.log(s); }
>
> // What works, what doesn't?
> setStatusEnum("ACTIVE");         // ???
> setStatusConst("ACTIVE");        // ???
> setStatusConst(Status.Active);   // ???
> ```
> Explain the difference: Why does `setStatusEnum("ACTIVE")` fail,
> but `setStatusConst("ACTIVE")` works?
> This is the difference between **nominal** and **structural** typing.

---

> **Pause point** — You now have the tools to make the right
> decision. The next section shows you a feature that is only
> possible with Literal Types.
>
> Continue with: [Section 05: Template Literal Types](./05-template-literal-types.md)