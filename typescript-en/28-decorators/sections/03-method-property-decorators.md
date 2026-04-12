# Section 3: Method and Property Decorators

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - Class Decorators](./02-class-decorators.md)
> Next section: [04 - Parameter Decorators](./04-parameter-decorators.md)

---

## What you'll learn here

- How **Method Decorators** wrap and transform methods
- How **Property Decorators** add getters/setters and validation
- How **Accessor Decorators** (get/set) work
- Practical patterns: Logging, Caching, Validation, Throttle

---

## Background: Aspect-Oriented Programming

> **Feature Origin Story: AOP and Cross-Cutting Concerns**
>
> Method Decorators implement a concept from the 1990s:
> **Aspect-Oriented Programming** (AOP). Gregor Kiczales
> (Xerox PARC, 1997) recognized that certain concerns (logging,
> security, caching) are scattered throughout the entire codebase —
> so-called "cross-cutting concerns".
>
> In Java there is AspectJ, in .NET there are attributes with interceptors.
> TypeScript decorators are the most elegant form of AOP: `@log`,
> `@cache`, `@validate` — each aspect is a decorator that can be
> attached to any method.
>
> The Angular team uses this concept extensively: `@HostListener`
> is a Method Decorator that binds events without the method itself
> needing to know anything about events. The business logic stays clean.

---

## Method Decorator: Legacy Syntax

```typescript annotated
// Legacy Method Decorator — three parameters:
function Retry(attempts: number) {
  return function (
    target: Object,                // Prototype of the class
    propertyKey: string,           // Name of the method
    descriptor: PropertyDescriptor // { value, writable, enumerable, configurable }
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;
    // ^ The original method

    descriptor.value = async function (...args: any[]) {
      for (let i = 0; i < attempts; i++) {
        try {
          return await originalMethod.apply(this, args);
          // ^ Call the original method
        } catch (error) {
          if (i === attempts - 1) throw error;
          console.log(`Attempt ${i + 1} failed, retrying...`);
          await new Promise(r => setTimeout(r, 1000 * (i + 1)));
          // ^ Exponential Backoff: 1s, 2s, 3s...
        }
      }
    };

    return descriptor;
  };
}

class ApiClient {
  @Retry(3)
  async fetchData(url: string): Promise<Response> {
    return fetch(url);
    // ^ Will be attempted up to 3 times on failure
  }
}
```

> 🧠 **Explain to yourself:** The legacy Method Decorator receives a
> `PropertyDescriptor`. What are its most important properties?
>
> **Key points:** `value` = the method itself | `get`/`set` = for accessors |
> `writable` = can it be overwritten? | `enumerable` = visible in for...in? |
> `configurable` = can it be deleted/modified? |
> You usually change `value` to wrap the method

---

## Method Decorator: Stage-3 Syntax

```typescript annotated
// Stage 3 Method Decorator — simpler:
function retry(attempts: number) {
  return function (
    target: Function,
    // ^ The method itself (not the prototype!)
    context: ClassMethodDecoratorContext
    // ^ Structured context object
  ): Function {
    const name = String(context.name);

    return async function (this: any, ...args: any[]) {
      for (let i = 0; i < attempts; i++) {
        try {
          return await (target as any).apply(this, args);
        } catch (error) {
          if (i === attempts - 1) throw error;
          console.log(`${name}: Attempt ${i + 1}/${attempts} failed`);
        }
      }
    };
  };
}

class ApiClient {
  @retry(3)
  async fetchData(url: string): Promise<Response> {
    return fetch(url);
  }
}
```

> 💭 **Think about it:** What is the main difference between legacy and
> Stage 3 Method Decorators? Which is easier to understand?
>
> **Answer:** Legacy: 3 parameters (target, propertyKey, descriptor) —
> you modify `descriptor.value`. Stage 3: 2 parameters (target, context) —
> you return a new function. Stage 3 is conceptually simpler:
> take a function, return a (modified) function.

---

## Practical Method Decorators

```typescript annotated
// === Caching Decorator ===
function Cache(ttlMs: number) {
  return function (
    target: Object,
    key: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const cache = new Map<string, { value: any; expiry: number }>();
    const original = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const cacheKey = JSON.stringify(args);
      const cached = cache.get(cacheKey);

      if (cached && cached.expiry > Date.now()) {
        return cached.value;
        // ^ Cache hit: return stored result
      }

      const result = original.apply(this, args);
      cache.set(cacheKey, { value: result, expiry: Date.now() + ttlMs });
      return result;
    };
    return descriptor;
  };
}

class UserService {
  @Cache(60_000) // 60 seconds
  getUserById(id: string): User {
    console.log("DB query...");
    return { id, name: "Max" } as User;
  }
}
// First call: "DB query..." → result
// Second call (< 60s): No log → cached result
```

```typescript annotated
// === Throttle Decorator ===
function Throttle(delayMs: number) {
  return function (
    target: Object,
    key: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    let lastCall = 0;
    const original = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const now = Date.now();
      if (now - lastCall < delayMs) return;
      // ^ Too soon after the last call → ignore
      lastCall = now;
      return original.apply(this, args);
    };
    return descriptor;
  };
}

class UIController {
  @Throttle(500) // At most every 500ms
  onScroll(event: Event): void {
    console.log("Scroll processed");
  }
}
```

> **Experiment:** Build a `@Measure` decorator that measures execution time:
>
> ```typescript
> function Measure(
>   target: Object, key: string, descriptor: PropertyDescriptor
> ): PropertyDescriptor {
>   const original = descriptor.value;
>   descriptor.value = function (...args: any[]) {
>     const start = performance.now();
>     const result = original.apply(this, args);
>     const end = performance.now();
>     console.log(`${key}: ${(end - start).toFixed(2)}ms`);
>     return result;
>   };
>   return descriptor;
> }
>
> class DataProcessor {
>   @Measure
>   process(data: number[]): number[] {
>     return data.sort((a, b) => a - b);
>   }
> }
> // Output: "process: 0.42ms"
> ```

---

## Property Decorators
<!-- section:summary -->
Property Decorators have fewer capabilities than Method Decorators:

<!-- depth:standard -->
Property Decorators have fewer capabilities than Method Decorators:

```typescript annotated
// Legacy Property Decorator — cannot change the value directly:
function MinLength(min: number) {
  return function (target: Object, propertyKey: string): void {
    // ^ No PropertyDescriptor! Property Decorators only receive 2 parameters.
    // But you can define a getter/setter:
    let value: string;

    Object.defineProperty(target, propertyKey, {
      get: () => value,
      set: (newValue: string) => {
        if (newValue.length < min) {
          throw new Error(
            `${propertyKey} must be at least ${min} characters, ` +
            `but has ${newValue.length}`
          );
        }
        value = newValue;
      },
    });
  };
}

class UserProfile {
  @MinLength(3)
  name: string;
  // ^ name is automatically validated on assignment!

  @MinLength(5)
  password: string;

  constructor(name: string, password: string) {
    this.name = name;         // Checks: >= 3 characters
    this.password = password; // Checks: >= 5 characters
  }
}

new UserProfile("Max", "secret123"); // OK
// new UserProfile("Ma", "secret123"); // Error: name must have at least 3 characters
```

> ⚡ **In your Angular project** Property Decorators are fundamental:
>
> ```typescript
> @Component({ ... })
> class ProductListComponent {
>   @Input() products: Product[] = [];
>   // ^ @Input() is a Property Decorator!
>   //   Angular uses it to set up data binding.
>   //   Internally Angular stores metadata about the property.
>
>   @Output() productSelected = new EventEmitter<Product>();
>   // ^ @Output() marks properties as event emitters
>
>   @ViewChild('searchInput') searchInput!: ElementRef;
>   // ^ @ViewChild() accesses template references
> }
> ```
>
> In React with MobX:
>
> ```typescript
> class TodoStore {
>   @observable todos: Todo[] = [];
>   // ^ @observable makes the property reactive
>   @computed get completedCount(): number {
>     return this.todos.filter(t => t.done).length;
>   }
>   // ^ @computed caches computed values
> }
> ```

---

<!-- /depth -->
## Accessor Decorators (get/set)

```typescript annotated
// Accessor Decorator — for getters and setters:
function Readonly(
  target: Object,
  key: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  descriptor.set = undefined;
  // ^ Remove setter → property becomes readonly
  return descriptor;
}

class Config {
  private _version = "1.0.0";

  @Readonly
  get version(): string {
    return this._version;
  }

  set version(v: string) {
    this._version = v;
  }
}

const config = new Config();
console.log(config.version); // "1.0.0"
// config.version = "2.0.0"; // Error: Cannot set property (setter removed)
```

---

## What you've learned

- **Method Decorators** wrap methods — ideal for logging, caching, retry, throttle
- **Property Decorators** can set up getters/setters — ideal for validation
- **Accessor Decorators** modify getters/setters directly
- Legacy: 3 parameters (target, key, descriptor) — Stage 3: 2 parameters (target, context)
- Decorators implement **AOP** (Aspect-Oriented Programming)

> 🧠 **Explain to yourself:** Why are Method Decorators more powerful than
> Property Decorators? What does the Method Decorator receive that the
> Property Decorator does not?
>
> **Key points:** Method Decorator receives PropertyDescriptor with value |
> Property Decorator receives NO descriptor | For properties you must
> use Object.defineProperty manually | Methods can be wrapped directly,
> properties cannot

**Key concept to remember:** Method Decorators = wrapping functions
(simple, powerful). Property Decorators = setting up getters/setters
(more cumbersome, but useful for validation).

---

> **Pause point** -- You now know Method and Property Decorators.
> Next topic: Parameter Decorators — Angular's DI secret.
>
> Continue with: [Section 04: Parameter Decorators](./04-parameter-decorators.md)