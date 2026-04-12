# Section 2: String Utility Types

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - Basics](./01-grundlagen.md)
> Next section: [03 - Pattern Matching](./03-pattern-matching.md)

---

## What you'll learn here

- The four built-in string transformation types: `Uppercase<T>`, `Lowercase<T>`, `Capitalize<T>`, `Uncapitalize<T>`
- What "intrinsic" means and why these types live **directly in the compiler**
- How to automatically generate getter/setter names, event prefixes, and API conventions
- Why these types reach their full power when combined with Template Literals and Unions

---

## The background story: What the compiler needs to know

When the TypeScript team developed Template Literal Types in version 4.1, they ran into a problem: how should the compiler turn `"hello"` into `"HELLO"`?

That sounds trivial — JavaScript has `String.prototype.toUpperCase()`. But TypeScript types only exist at compile time. There is **no JavaScript code** to call. The compiler would have to understand the transformation itself.

The solution: the team implemented four "intrinsic" (built-in) types directly **in the compiler code**. They are not TypeScript code sitting somewhere in `lib.d.ts` — they are implemented in Rust (or C++ in the original compiler). TypeScript simply gives them names, but the actual logic lives deep inside the compiler.

This means: you **cannot replicate these types using normal TypeScript constructs**. There is no Conditional Type construction that could transform `"hello"` into `"HELLO"` — unless you had access to the compiler itself. That makes them a category of their own in the TypeScript type system.

---

## The four transformation types

```typescript annotated
type A = Uppercase<"hello">;      // "HELLO"
//       ^^^^^^^^^                // All characters in uppercase
type B = Lowercase<"HELLO">;      // "hello"
//       ^^^^^^^^^                // All characters in lowercase
type C = Capitalize<"hello">;     // "Hello"
//       ^^^^^^^^^^               // Only FIRST letter uppercase, rest unchanged
type D = Uncapitalize<"Hello">;   // "hello"
//       ^^^^^^^^^^^^^            // Only FIRST letter lowercase, rest unchanged
```

That looks simple — and it is. The power lies not in these types alone, but in what happens when you combine them with **Template Literals and Unions**.

> **Explain to yourself:** What is the difference between `Uppercase<T>` and `Capitalize<T>`? In which situation would you use which one? Think of concrete examples from an API design.
>
> **Key points:** Uppercase transforms ALL characters. Capitalize only the first one. Uppercase suits constants (HTTP_METHOD), Capitalize suits CamelCase conventions (onClick, getName). Capitalize is far more common in practice because JavaScript conventions mostly use CamelCase.

---

## Combined with Template Literals: Getters and Setters

The classic example you could use in almost any TypeScript project:

```typescript annotated
type Getter<T extends string> = `get${Capitalize<T>}`;
//          ^^^^^^^^^^^^^^^^^^   ^^^  ^^^^^^^^^^^^^^
//          Constraint: T must   |    T is capitalized
//          be a string          The prefix "get" is prepended

type Setter<T extends string> = `set${Capitalize<T>}`;

type GetName = Getter<"name">;     // "getName"
type SetAge  = Setter<"age">;      // "setAge"
type GetUrl  = Getter<"url">;      // "getUrl"

// The decisive moment: combining with Unions
type Properties = "name" | "email" | "age";

type GetterNames = Getter<Properties>;
// TypeScript expands: Getter<"name"> | Getter<"email"> | Getter<"age">
// Result:            "getName" | "getEmail" | "getAge"

type SetterNames = Setter<Properties>;
// "setName" | "setEmail" | "setAge"

type AllAccessors = GetterNames | SetterNames;
// "getName" | "getEmail" | "getAge" | "setName" | "setEmail" | "setAge"
```

This is **distributive behavior**: when `T` is a Union, the generic type is evaluated separately for each Union member. This is the same principle we saw in Section 1 with the Cartesian product — but now with transformations.

---

> **Experiment:** Try the following in the TypeScript Playground:
>
> ```typescript
> type EventName<T extends string> = `on${Capitalize<T>}`;
>
> type DomEvents = "click" | "keydown" | "mouseenter" | "scroll";
>
> type HandlerNames = EventName<DomEvents>;
> // Hover over HandlerNames — what do you get?
>
> // Now turn it into an interface:
> type HandlerProps = {
>   [K in DomEvents as EventName<K>]: (event: Event) => void;
> };
> // What is produced here? Hover over HandlerProps.
> ```
>
> Notice how `as EventName<K>` transforms the key during mapping. That is Key Remapping from L16 — combined with Template Literal Types from this lesson.

---

## A realistic example: Generating API methods

Many projects have patterns like `getUserById`, `getProductById`, `deleteUserById`. These are repetitive patterns that can be automatically typed with Template Literal Types:

```typescript annotated
type Resource = "user" | "product" | "order";
type CrudAction = "get" | "create" | "update" | "delete";

// Automatically generate all CRUD method names
type CrudMethod = `${CrudAction}${Capitalize<Resource>}`;
// "getUser" | "createUser" | "updateUser" | "deleteUser"
// | "getProduct" | "createProduct" | "updateProduct" | "deleteProduct"
// | "getOrder" | "createOrder" | "updateOrder" | "deleteOrder"
// Total: 4 × 3 = 12 method names

// Now create a type-safe service interface:
type ApiService = {
  [K in CrudMethod]: (...args: unknown[]) => Promise<unknown>;
  //                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  //                  We simplify the payload — in practice
  //                  you would refine this with conditional types
};

// The interface enforces that EVERY one of the 12 methods is implemented
declare const service: ApiService;
service.getUser;      // OK
service.deleteOrder;  // OK
// service.fetchUser; // ERROR! "fetchUser" is not a valid method
```

---

## Uppercase for constants and enums

`Uppercase<T>` is especially useful for constants and configuration:

```typescript annotated
type HttpMethod = "get" | "post" | "put" | "delete";
type HttpMethodUpper = Uppercase<HttpMethod>;
// "GET" | "POST" | "PUT" | "DELETE"

// Conversion function with a precise return type:
function toUpperMethod<T extends HttpMethod>(method: T): Uppercase<T> {
  return method.toUpperCase() as Uppercase<T>;
  //            ^^^^^^^^^^^^^                    // Runtime: .toUpperCase()
  //                          ^^^^^^^^^^^^^^^    // Type: Uppercase<T> (compile time)
  // Both must agree — TypeScript checks the type,
  // JavaScript performs the transformation
}

const m = toUpperMethod("get");  // Type: "GET" (not just string!)
// TypeScript knows exactly that "get" becomes "GET"
```

**In your Angular project:** Angular uses uppercase conventions for HTTP methods in interceptors. Template Literal Types can ensure you use the correct casing:

```typescript
// In an Angular HTTP interceptor
type AllowedMethod = Uppercase<"get" | "post" | "put" | "delete">;
// "GET" | "POST" | "PUT" | "DELETE"

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly methodsNeedingAuth: AllowedMethod[] = ["POST", "PUT", "DELETE"];

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const method = req.method as AllowedMethod;
    if (this.methodsNeedingAuth.includes(method)) {
      // Add authentication
    }
    return next.handle(req);
  }
}
```

---

## Uncapitalize: The lesser-known fourth type

`Uncapitalize<T>` is the least frequently used of the four types — but it has its place, especially when converting PascalCase to camelCase:

```typescript annotated
type PascalToCamel<T extends string> = Uncapitalize<T>;
//  "UserProfile" -> "userProfile"
//  "HttpRequest" -> "httpRequest"

type Properties = "Name" | "Email" | "Age";  // PascalCase

type CamelProperties = Uncapitalize<Properties>;
// "name" | "email" | "age"

// Practical: if you have a library that delivers PascalCase keys,
// but your interface expects camelCase:
type NormalizeKeys<T> = {
  [K in keyof T as Uncapitalize<K & string>]: T[K];
};

interface PascalApi {
  UserName: string;
  UserAge: number;
  IsActive: boolean;
}

type NormalizedApi = NormalizeKeys<PascalApi>;
// {
//   userName: string;
//   userAge: number;
//   isActive: boolean;
// }
```

This shows the combined pattern: Key Remapping from L16 (the `as` clause) plus `Uncapitalize` from this section. Template Literal Types build on what you already know.

---

## The limits: What "intrinsic" means

A brief look at what these types **cannot** do:

```typescript
// What Capitalize CANNOT do:
type CamelToSnake<T extends string> = ???;
// "userName" -> "user_name" — this is not possible with Capitalize alone
// You need infer + recursion for that (Section 3!)

// What Uppercase CANNOT do:
type OnlyFirstWordUpper<T extends string> = ???;
// "hello world" -> "Hello world" — that does not work directly either
```

The intrinsic types are deliberately **kept simple**. They do one thing and do it well. For more complex string transformations you need the combination of Template Literals and `infer` — that is the topic of Section 3.

> **Think about it:** If Capitalize only transforms the first letter — what happens with `Capitalize<"helloWorld">`? And what about `Capitalize<"hello-world">`? Check your answer in the TypeScript Playground before reading on.
>
> **Answer:** `Capitalize<"helloWorld">` produces `"HelloWorld"` — the rest stays unchanged, so CamelCase simply becomes CamelCase with a capital first letter. `Capitalize<"hello-world">` produces `"Hello-world"` — only the first letter before the hyphen is capitalized. This is often unexpected for developers who expect full Title Case behavior.

---

## What you've learned

- `Uppercase<T>`, `Lowercase<T>`, `Capitalize<T>`, and `Uncapitalize<T>` are the four built-in string transformation types — implemented directly in the TypeScript compiler, not in TypeScript itself
- These types are **intrinsic** — they cannot be replicated with Conditional Types because the string manipulation itself lives inside the compiler
- Combined with Template Literals, powerful patterns emerge: automatic getter/setter names, event handler props, CRUD methods
- **Distributive behavior**: when `T` is a Union, the type is evaluated separately for each Union member — the result is again a Union

> **Explain to yourself:** You saw `type Getter<T extends string> = \`get${Capitalize<T>}\``. Explain step by step what happens when you evaluate `Getter<"name" | "age">`. How does TypeScript arrive at `"getName" | "getAge"`?
>
> **Key points:** Union distribution | Evaluate separately for each Union member | Getter<"name"> = "getName", Getter<"age"> = "getAge" | Results are merged into a new Union

**Core concept to remember:** The four String utilities are intentionally primitive — they transform casing and nothing else. Their power lies in the combination with Template Literals and the distributive behavior over Unions. If you need more complex string manipulations, you have to bring in `infer` — that comes in the next section.

---

## Quick reference: The four intrinsic types

| Type | Transformation | Example |
|---|---|---|
| `Uppercase<T>` | All characters uppercase | `"hello"` → `"HELLO"` |
| `Lowercase<T>` | All characters lowercase | `"HELLO"` → `"hello"` |
| `Capitalize<T>` | First letter uppercase | `"hello"` → `"Hello"` |
| `Uncapitalize<T>` | First letter lowercase | `"Hello"` → `"hello"` |

All four types are distributive: they work on individual strings and on Unions. That makes them ideal as building blocks in larger generic types.

A thought to close with: why is there no `TitleCase<T>` that capitalizes every word? Because TypeScript cannot interpret spaces as word boundaries — except through recursive `infer` types. That would be possible, but very slow for the compiler and rarely needed in practice. The four built-in types cover the vast majority of real-world use cases — the rest is left to the developer's creativity with `infer`.

---

> **Pause point** — A good moment to consolidate what you've learned. Can you construct a `type IsEventHandler<T extends string> = T extends \`on${Capitalize<string>}\` ? true : false` from memory? Try it in the Playground — what does `IsEventHandler<"onClick">` produce, and what about `IsEventHandler<"handleClick">`?
>
> Continue with: [Section 03: Pattern Matching with Strings](./03-pattern-matching.md)