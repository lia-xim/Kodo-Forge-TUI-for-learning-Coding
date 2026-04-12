# Section 4: Parameter Decorators

> Estimated reading time: **10 minutes**
>
> Previous section: [03 - Method and Property Decorators](./03-method-property-decorators.md)
> Next section: [05 - Stage 3 vs Legacy](./05-stage3-vs-legacy.md)

---

## What you'll learn here

- How **Parameter Decorators** work and what they CANNOT do
- Why Parameter Decorators are almost always combined with **Reflect Metadata**
- How Angular's **Dependency Injection** (`@Inject()`) works internally
- Why Stage 3 Decorators have **no Parameter Decorators**

---

## Background: Dependency Injection and Decorators

> **Feature Origin Story: @Inject and Reflect Metadata**
>
> When the Angular team designed Dependency Injection (DI), they needed
> a mechanism to annotate constructor parameters: "This parameter should
> inject the UserService, that one the HttpClient."
>
> The solution: Parameter Decorators + `emitDecoratorMetadata`.
> TypeScript can emit the **type information** of parameters as metadata
> (via the `reflect-metadata` polyfill library).
> Angular reads this metadata and knows: "The first parameter is of
> type UserService → inject the UserService instance."
>
> This is powerful, but it comes at a price: the entire DI magic
> depends on an **experimental** TypeScript feature
> (`emitDecoratorMetadata`) that doesn't exist in Stage 3. This is
> one of the reasons why Angular has to carefully plan the transition
> to Stage 3 Decorators.

---

## Parameter Decorator: Legacy Syntax

```typescript annotated
// Parameter Decorator — three arguments:
function Inject(token: string) {
  return function (
    target: Object,         // Prototype of the class (or constructor for constructor params)
    propertyKey: string | undefined,  // Name of the method (undefined for constructor)
    parameterIndex: number  // Position of the parameter (0, 1, 2...)
  ): void {
    // ^ Parameter Decorators RETURN NOTHING!
    //   They cannot change the parameter.
    //   They can only STORE METADATA.

    // Store metadata:
    const existingTokens: Record<number, string> =
      (target as any).__inject_tokens || {};
    existingTokens[parameterIndex] = token;
    (target as any).__inject_tokens = existingTokens;
  };
}

class UserController {
  constructor(
    @Inject("UserService") private userService: any,
    // ^ parameterIndex = 0, token = "UserService"
    @Inject("Logger") private logger: any
    // ^ parameterIndex = 1, token = "Logger"
  ) {}
}

// Read metadata:
const tokens = (UserController as any).__inject_tokens;
// { 0: "UserService", 1: "Logger" }
// ^ A DI container can use this to inject the right instances
```

> 🧠 **Explain to yourself:** Why can't Parameter Decorators change the
> value of the parameter? What can they do instead?
>
> **Key points:** Parameter Decorators run BEFORE the constructor is called |
> They have no access to the value (it doesn't exist yet) |
> They can only store METADATA ABOUT the parameter |
> The metadata is later read by a framework (DI container)

---

## emitDecoratorMetadata: TypeScript's Secret Weapon

```typescript annotated
// tsconfig.json:
// {
//   "compilerOptions": {
//     "experimentalDecorators": true,
//     "emitDecoratorMetadata": true  ← THIS is the magic!
//   }
// }

// With emitDecoratorMetadata, TypeScript generates:
import "reflect-metadata";
// ^ Polyfill for Reflect.defineMetadata / Reflect.getMetadata

@Injectable()
class UserService {
  constructor(
    private http: HttpClient,
    // ^ TypeScript emits: Reflect.metadata("design:paramtypes", [HttpClient, Logger])
    private logger: Logger
  ) {}
}

// Angular can now figure out the types WITHOUT @Inject():
const paramTypes = Reflect.getMetadata("design:paramtypes", UserService);
// [HttpClient, Logger]
// ^ Angular knows: constructor needs HttpClient + Logger → inject them!

// THAT is why Angular doesn't need @Inject() in most cases:
// emitDecoratorMetadata delivers the type information automatically.
// @Inject() is only needed when the type is ambiguous
// (e.g. with interfaces or tokens).
```

> 💭 **Think about it:** `emitDecoratorMetadata` emits type information
> at runtime. But TypeScript has type erasure — types disappear at
> runtime. How does that fit together?
>
> **Answer:** emitDecoratorMetadata is an EXCEPTION to type erasure!
> TypeScript generates additional JavaScript code that stores the type
> information as metadata. It's one of the rare cases where TypeScript
> generates runtime code from type information. That's why it only
> works with **classes** (which exist at runtime), not with interfaces
> (which disappear at runtime).

---

## Angular's DI in Detail

```typescript annotated
// Angular's @Injectable() — a class decorator:
@Injectable({
  providedIn: "root",
  // ^ Angular knows: provide this service globally
})
class UserService {
  constructor(
    private http: HttpClient
    // ^ emitDecoratorMetadata → Angular knows the type
  ) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>("/api/users");
  }
}

// WHEN do you need @Inject()?
@Injectable()
class AppService {
  constructor(
    @Inject("API_URL") private apiUrl: string
    // ^ string is a primitive type — Angular can't know
    //   WHICH string is meant. @Inject(TOKEN) is necessary.
  ) {}
}

// Angular's InjectionToken:
const API_URL = new InjectionToken<string>("API_URL");
// ^ Token-based injection instead of type-based
```

> **Experiment:** Look at the compiled JavaScript output (dist/) in an
> Angular project. Search for `__decorate` and `__metadata`:
>
> ```javascript
> // Compiled output (simplified):
> UserService = __decorate([
>   Injectable({ providedIn: 'root' }),
>   __metadata("design:paramtypes", [HttpClient])
>   //          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
>   // THIS is emitDecoratorMetadata in action!
> ], UserService);
> ```
>
> The `__metadata` line only exists when `emitDecoratorMetadata: true`
> is set. It stores the constructor parameter types as
> runtime information.

---

## NestJS: Parameter Decorators for HTTP

```typescript annotated
// NestJS makes heavy use of Parameter Decorators:
@Controller("users")
class UsersController {
  @Get(":id")
  getUser(
    @Param("id") id: string,
    // ^ Parameter Decorator: Extracts route parameter "id"
    @Query("include") include?: string,
    // ^ Parameter Decorator: Extracts query parameter "include"
    @Headers("authorization") auth?: string,
    // ^ Parameter Decorator: Extracts header "authorization"
    @Body() body?: CreateUserDto
    // ^ Parameter Decorator: Extracts request body
  ): User {
    return this.userService.findById(id);
  }
}

// Internally, these decorators store metadata:
// "Parameter 0 → route param 'id'"
// "Parameter 1 → query param 'include'"
// NestJS reads the metadata and injects the right values.
```

> ⚡ **In your Angular project**, you use Parameter Decorators
> primarily for DI:
>
> ```typescript
> @Component({ ... })
> class DashboardComponent {
>   constructor(
>     private userService: UserService,
>     // ^ emitDecoratorMetadata → Angular knows the type
>     private router: Router,
>     @Optional() private analytics?: AnalyticsService
>     // ^ @Optional() = Parameter Decorator!
>     //   If no provider exists → null instead of Error
>   ) {}
> }
> ```
>
> In React there are no Parameter Decorators — React's DI is based
> on Context and Hooks, not on class constructors.

---

## What you've learned

- Parameter Decorators can **only store metadata** — they cannot change the value
- **emitDecoratorMetadata** emits type information as runtime metadata (an exception to type erasure!)
- Angular's DI uses emitDecoratorMetadata to recognize constructor parameter types
- `@Inject()` is only needed when the type is ambiguous (primitive types, tokens)
- **Stage 3 Decorators have NO Parameter Decorators** — this becomes a problem

> 🧠 **Explain to yourself:** Why is `emitDecoratorMetadata` an
> exception to TypeScript's type erasure? What exactly does it generate?
>
> **Key points:** Normally: all types are removed |
> emitDecoratorMetadata: generates Reflect.metadata() calls |
> The type information is stored as a VALUE (not as a type) |
> Only works with classes (exist at runtime) |
> Interfaces become Object (since they don't exist at runtime)

**Core concept to remember:** Parameter Decorators = metadata, not behavior.
They annotate parameters so that a framework (Angular, NestJS) knows
what to inject. The real magic lies in `emitDecoratorMetadata`.

---

> **Pause point** -- You now understand all decorator types.
> Next topic: Stage 3 vs Legacy — the big comparison.
>
> Continue with: [Section 05: Stage 3 vs Legacy](./05-stage3-vs-legacy.md)