# Cheatsheet: Decorators (Legacy & Stage 3)

Quick reference for Lesson 28.

---

## Decorator Basics

```typescript
// Decorator = function with @ before a declaration
@sealed
class MyClass {}

// Decorator Factory = function that returns a decorator (with parameters)
@Component({ selector: "app-root" })
class MyComponent {}

// Order: bottom-up (closer to the code → applied first)
@A   // applied SECOND
@B   // applied FIRST
class X {}
```

---

## Legacy vs Stage 3

| | Legacy | Stage 3 |
|---|---|---|
| tsconfig | `experimentalDecorators: true` | Default (no flag) |
| Method Decorator | `(target, key, descriptor)` | `(target, context)` |
| Parameter Decorator | Yes | **No** |
| emitDecoratorMetadata | Yes | **No** |
| `accessor` Keyword | No | **Yes** |
| addInitializer | No | **Yes** |
| Frameworks | Angular, NestJS, TypeORM | Future standard |

---

## Class Decorator (Legacy)

```typescript
// Without parameter:
function Sealed(constructor: Function): void {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@Sealed
class BankAccount { /* ... */ }

// With parameter (Factory):
function Component(options: { selector: string }) {
  return function (constructor: Function): void {
    (constructor as any).__selector = options.selector;
  };
}

@Component({ selector: "app-root" })
class AppComponent { /* ... */ }
```

---

## Method Decorator (Legacy)

```typescript
function Log(
  target: Object,                // Prototype
  propertyKey: string,           // Method name
  descriptor: PropertyDescriptor // { value: Function, ... }
): PropertyDescriptor {
  const original = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(`${propertyKey}(${args})`);
    return original.apply(this, args);
  };
  return descriptor;
}

class Service {
  @Log
  getData(id: string): Data { /* ... */ }
}
```

---

## Method Decorator (Stage 3)

```typescript
function log(
  target: Function,
  context: ClassMethodDecoratorContext
): Function {
  const name = String(context.name);
  return function (this: any, ...args: any[]) {
    console.log(`${name}(${args})`);
    return target.apply(this, args);
  };
}
```

---

## Property Decorator (Legacy)

```typescript
function MinLength(min: number) {
  return function (target: Object, key: string): void {
    let value: string;
    Object.defineProperty(target, key, {
      get: () => value,
      set: (v: string) => {
        if (v.length < min) throw new Error(`${key}: min ${min} chars`);
        value = v;
      },
    });
  };
}

class User {
  @MinLength(3) name: string;
}
```

---

## Parameter Decorator (Legacy only)

```typescript
function Inject(token: string) {
  return function (
    target: Object,
    propertyKey: string | undefined,
    parameterIndex: number
  ): void {
    const tokens = (target as any).__inject || {};
    tokens[parameterIndex] = token;
    (target as any).__inject = tokens;
  };
}

class Controller {
  constructor(@Inject("UserService") private svc: any) {}
}
```

---

## Stage 3: Auto-Accessor

```typescript
class Settings {
  accessor theme: string = "light";
  // Automatically generates:
  // #theme: string;
  // get theme() { return this.#theme; }
  // set theme(v) { this.#theme = v; }
}
```

---

## Useful Decorator Patterns

| Decorator | Purpose |
|---|---|
| `@Log` | Log method calls |
| `@Cache(ttl)` | Cache results |
| `@Retry(n)` | Retry on error |
| `@Throttle(ms)` | Call at most once per ms |
| `@Debounce(ms)` | Call only after ms of silence |
| `@Measure` | Measure execution time |
| `@Validate` | Validate parameters |
| `@Roles('admin')` | Access control (NestJS) |

---

## Angular Migration (Legacy → Stage 3 compatible)

| Old (Legacy) | New (Stage-3-compatible) |
|---|---|
| `@Input() name = ""` | `name = input<string>("")` |
| `@Input({ required: true })` | `name = input.required<string>()` |
| `@Output() click = new EventEmitter()` | `click = output<void>()` |
| `constructor(private svc: UserService)` | `svc = inject(UserService)` |
| `@ViewChild('ref')` | `ref = viewChild<ElementRef>('ref')` |

---

## Anti-Patterns

| Anti-Pattern | Problem | Better |
|---|---|---|
| Business logic in decorator | Hidden, hard to test | Service/Utility |
| Global state in decorator | Side effects, race conditions | State management |
| Type extension without type update | `(instance as any).newMethod()` | Interface Augmentation |
| Decorators for everything | Over-engineering | Only for cross-cutting concerns |

---

## emitDecoratorMetadata

```json
// tsconfig.json (Legacy + Metadata):
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

```typescript
// What emitDecoratorMetadata generates:
@Injectable()
class UserService {
  constructor(private http: HttpClient) {}
}
// → __metadata("design:paramtypes", [HttpClient])
// Angular reads this for DI!
```