# Section 5: Practical Patterns

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Conditional Mapped Types](./04-bedingte-mapped-types.md)
> Next section: -- (End of this lesson)

---

## What you'll learn here

- Form types: Errors, Touched, Dirty
- API transformations: Create, Update, Response
- Configuration patterns with Mapped Types
- Real-world architecture patterns

---

> 📖 **Background: Mapped Types in real frameworks**
>
> The patterns in this section are not academic exercises —
> they are exactly what large frameworks and libraries do internally:
>
> - **Angular Reactive Forms**: `FormGroup<T>` uses a Mapped Type
>   to generate a `FormControl<T[K]>` for each field
> - **React Hook Form**: `useForm<T>()` automatically derives `FieldErrors<T>`,
>   `TouchedFields<T>` and `DirtyFields<T>` from T
> - **Prisma ORM**: Mapped Types generate Create/Update/Where types
>   from the database schema
> - **tRPC**: Mapped Types transform router definitions into
>   type-safe client APIs
>
> When you understand these patterns, you understand how these libraries
> work under the hood.

## Pattern 1: Form Types

Forms always need the same companion types:

```typescript
// Error per field
type FormErrors<T> = {
  [K in keyof T]?: string;
};

// Was the field touched?
type FormTouched<T> = {
  [K in keyof T]: boolean;
};

// Did the value change?
type FormDirty<T> = {
  [K in keyof T]: boolean;
};

// Everything together
interface FormState<T> {
  values: T;
  errors: FormErrors<T>;
  touched: FormTouched<T>;
  dirty: FormDirty<T>;
  isValid: boolean;
  isSubmitting: boolean;
}

// Usage:
interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

type LoginState = FormState<LoginForm>;
// values: { email: string; password: string; rememberMe: boolean; }
// errors: { email?: string; password?: string; rememberMe?: string; }
// touched: { email: boolean; password: boolean; rememberMe: boolean; }
```

> **This is THE use case** for Mapped Types in frontend projects.
> One type, all form aspects are automatically derived.

> ⚡ **Practical tip: Angular Reactive Forms vs React Hook Form**
>
> ```typescript
> // Angular: FormGroup with type-safe controls
> interface LoginForm {
>   email: string;
>   password: string;
> }
> // Angular 14+ internally generates:
> // FormGroup<{ email: FormControl<string>; password: FormControl<string> }>
> // That's a Mapped Type!
>
> // React Hook Form: Errors are automatically derived
> const { formState: { errors } } = useForm<LoginForm>();
> // errors.email?.message    — type-safe!
> // errors.password?.message — type-safe!
> // errors.foo               — Error! 'foo' does not exist in LoginForm
> ```

> 🧠 **Explain to yourself:** Why is `FormErrors<T>` defined as `{ [K in keyof T]?: string }` (with ?) instead of `{ [K in keyof T]: string }`?
> **Key points:** Not every field has an error | No error = key is missing (undefined) | Required would force EVERY field to have an error string | Optional means: "has an error OR has none"

---

## Pattern 2: API Transformations

> **Analogy:** Think of an entity type as a **stem cell**:
> From a single definition (the base type), different
> specialized types are derived — CreateDTO, UpdateDTO, ResponseDTO.
> Just as a stem cell differentiates into various cell types,
> the entity type differentiates into various API variants.

One single entity type, various API variants:

```typescript annotated
interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// For POST: without auto-generated fields
type CreateDTO<T extends Entity> = Omit<T, keyof Entity>;

// For PUT: only changeable fields, all optional
type UpdateDTO<T extends Entity> = Partial<Omit<T, keyof Entity>>;

// For GET: everything present, with string dates
type ResponseDTO<T extends Entity> = {
  [K in keyof T]: T[K] extends Date ? string : T[K];
};

// Usage:
interface User extends Entity {
  name: string;
  email: string;
  role: 'admin' | 'user';
}

type CreateUser = CreateDTO<User>;
// { name: string; email: string; role: 'admin' | 'user'; }

type UpdateUser = UpdateDTO<User>;
// { name?: string; email?: string; role?: 'admin' | 'user'; }

type UserResponse = ResponseDTO<User>;
// { id: string; createdAt: string; updatedAt: string;
//   name: string; email: string; role: 'admin' | 'user'; }
```

> 💭 **Think about it:** What happens in `ResponseDTO` when a property
> has the type `Date | null` (nullable Date)? Does it become `string | null`?
>
> **Answer:** No! `Date | null extends Date` is `false` (because `null`
> is not Date). The property stays as `Date | null` — which is wrong,
> since the API delivers a string or null. The more robust version would be:
> `T[K] extends Date ? string : T[K] extends Date | null ? string | null : T[K]`.
> Such edge cases show why you should thoroughly test your own utility types.

> 🔬 **Experiment:** Extend the API pattern with a `ListDTO<T>`:
> `type ListDTO<T extends Entity> = { items: ResponseDTO<T>[]; total: number; page: number }`.
> Test it with `User`. Have the dates in the items correctly become strings?

---

## Pattern 3: Configuration Documentation

```typescript
// Each config property gets a description text
type Documented<T> = {
  [K in keyof T]: {
    value: T[K];
    description: string;
    defaultValue?: T[K];
  };
};

interface AppConfig {
  port: number;
  host: string;
  debug: boolean;
}

type DocumentedConfig = Documented<AppConfig>;
// {
//   port: { value: number; description: string; defaultValue?: number; };
//   host: { value: string; description: string; defaultValue?: string; };
//   debug: { value: boolean; description: string; defaultValue?: boolean; };
// }
```

---

## Pattern 4: Generating Getter/Setter Interfaces

> 📖 **Background: Java-style meets TypeScript**
>
> In Java it is common to write explicit getters and setters for each field
> (`getName()`, `setName()`). In TypeScript/JavaScript this is normally
> not necessary — you access properties directly.
> But there are scenarios (e.g. proxy objects, observables, change detection)
> where getters/setters are useful. Mapped Types can generate these automatically
> from the interface — zero boilerplate.

```typescript annotated
type WithAccessors<T> = T & {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
} & {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
};

interface Point {
  x: number;
  y: number;
}

type AccessiblePoint = WithAccessors<Point>;
// {
//   x: number;
//   y: number;
//   getX: () => number;
//   getY: () => number;
//   setX: (value: number) => void;
//   setY: (value: number) => void;
// }
```

> 🧠 **Explain to yourself:** Why does `WithAccessors<T>` use an intersection (`T & { ... } & { ... }`) instead of defining the properties directly in a single Mapped Type?
> **Key points:** You want to KEEP the original properties AND add getters/setters | A Mapped Type can only transform keys, not duplicate them | Intersection is the "addition" of type information | Three separate parts: Original + Getters + Setters

---

## Pattern 5: Deriving an Event System

> ⚡ **Practical tip: Event systems in Angular and React**
>
> ```typescript
> // Angular: EventEmitter + Output
> // Angular components use exactly this pattern:
> // For each @Input() property there is an @Output() property with a "Change" suffix
> // e.g. @Input() name → @Output() nameChange
>
> // React: Controlled Components
> // For each state property you need an onChange handler:
> // value + onChange, checked + onCheckedChange
> // EventMap<T> automates exactly that!
> ```

```typescript annotated
type EventMap<T> = {
  [K in keyof T as `${string & K}Changed`]: {
//                  ^^^^^^^^^^^^^^^^^^^^^^ Key: originalName + "Changed"
    previousValue: T[K];
//  ^^^^^^^^^^^^^^^^^ Previous value with the original type
    newValue: T[K];
//  ^^^^^^^^^^^^^ New value with the original type
  };
};

interface UserProfile {
  name: string;
  avatar: string;
}

type UserEvents = EventMap<UserProfile>;
// {
//   nameChanged: { previousValue: string; newValue: string; };
//   avatarChanged: { previousValue: string; newValue: string; };
// }
```

---

## Summary: Which pattern for which situation?

| Situation | Pattern | Example |
|-----------|---------|---------|
| Form management | FormErrors/Touched/Dirty | React Hook Form, Formik |
| REST API | CreateDTO/UpdateDTO/ResponseDTO | Express, NestJS |
| Configuration | Documented\<T\> | App settings |
| OOP wrapper | WithAccessors\<T\> | Java-style getters/setters |
| Reactive systems | EventMap\<T\> | Event emitter, Observable |

---

## What you've learned

- **Form types** (Errors, Touched, Dirty) are THE use case for Mapped Types in the frontend
- **API transformations** (Create, Update, Response) derive all variants from a single entity type
- **Configuration documentation** (`Documented<T>`) wraps each value in a metadata object
- **Getter/setter generation** uses key remapping + template literals
- **Event systems** (`EventMap<T>`) automatically generate type-safe change events

> 🧠 **Explain to yourself:** Which of the five patterns would you use first
> in a new Angular or React project? Why?
> **Key points:** Form types are almost always relevant (every project has forms) | API transformations save enormous maintenance effort | The other patterns are for more specific scenarios | Start with what saves you the most boilerplate

> 💭 **Think about it:** Could these patterns also work at RUNTIME,
> not just at compile time? E.g. a `createFormState(schema)` that
> automatically creates errors, touched and dirty objects?
>
> **Answer:** Yes! And that is exactly what libraries like React Hook Form,
> Formik and Angular Reactive Forms do. The difference: The runtime
> version needs REAL code (functions, objects), the compile-time
> version (Mapped Types) only produces type information and disappears
> after compilation. Both together produce the best developer
> experience: type-safe API + automatic implementation.

**Key concept to remember:** The true power of Mapped Types shows itself in practice: A single entity type can generate dozens of derived types — form state, API DTOs, event maps, accessor interfaces. This is **Single Source of Truth** for types.

> 🔬 **Experiment:** Take an interface from one of your own projects
> (e.g. a `User` type) and apply the five patterns to it.
> What derived types emerge? How much manual code
> would you have had to write without Mapped Types?

---

> **End of lesson** — You now master Mapped Types from the
> fundamentals to real-world practical patterns!
>
> **Summary of the entire lesson:**
> - **Section 1:** Basic syntax `{ [K in keyof T]: T[K] }` and modifiers
> - **Section 2:** Key remapping with `as` for dynamic key names
> - **Section 3:** Custom utility types (Mutable, Nullable, DeepReadonly)
> - **Section 4:** Conditional Mapped Types (conditional in key and value)
> - **Section 5:** Practical patterns (Forms, APIs, Events, Accessors)
>
> Next steps:
> 1. Work through the quiz
> 2. Keep the cheatsheet as a reference
>
> **Next lesson:** [17 - Conditional Types](../../17-conditional-types/README.md)