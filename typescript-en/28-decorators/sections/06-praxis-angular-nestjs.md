# Section 6: Practice — Angular and NestJS References

> Estimated reading time: **10 minutes**
>
> Previous section: [05 - Stage 3 vs Legacy](./05-stage3-vs-legacy.md)
> Next section: — (End of lesson)

---

## What you'll learn here

- How Angular's decorator system **works internally** (@Component, @Injectable)
- How NestJS uses decorators for **HTTP APIs**
- How to write **custom decorators** for Angular and NestJS
- Best practices and **anti-patterns** when using decorators

---

## Background: Frameworks and their decorator philosophy

> **Feature Origin Story: Two Philosophies**
>
> Angular (2016, Google) and NestJS (2017, Kamil Mysliwiec) are both
> built on TypeScript decorators, but with different philosophies:
>
> **Angular:** Decorators as **declarations**. `@Component({...})`
> says "THIS is a component with these properties". The Angular
> compiler (ngc) reads the metadata and generates optimized code.
> Decorators don't change behavior directly —
> they describe it.
>
> **NestJS:** Decorators as **configuration and transformation**.
> `@Controller('users')` configures routing, `@UseGuards()`
> adds middleware, `@Param('id')` transforms the request.
> Decorators here are active participants in the request lifecycle.
>
> Both approaches show: decorators are flexible enough for
> fundamentally different architectures.

---

## Angular: Writing custom decorators
<!-- section:summary -->
### Custom Property Decorator: @AutoUnsubscribe

<!-- depth:standard -->
### Custom Property Decorator: @AutoUnsubscribe

```typescript annotated
// A common problem in Angular: memory leaks through subscriptions
// Solution: A decorator that automatically unsubscribes all subscriptions

import { Subscription } from "rxjs";

function AutoUnsubscribe(constructor: Function): void {
  const original = constructor.prototype.ngOnDestroy;
  // ^ Save the original ngOnDestroy method (if present)

  constructor.prototype.ngOnDestroy = function (): void {
    // Search all properties that are subscriptions:
    for (const key of Object.keys(this)) {
      const prop = this[key];
      if (prop instanceof Subscription) {
        prop.unsubscribe();
        console.log(`${constructor.name}: ${key} unsubscribed`);
      }
    }

    // Call the original ngOnDestroy if present:
    if (original) {
      original.apply(this);
    }
  };
}

@Component({ selector: "app-dashboard", template: "..." })
@AutoUnsubscribe
class DashboardComponent implements OnInit {
  private dataSub!: Subscription;
  private timerSub!: Subscription;

  ngOnInit(): void {
    this.dataSub = this.dataService.getData().subscribe(/* ... */);
    this.timerSub = interval(5000).subscribe(/* ... */);
    // ^ Both subscriptions are automatically unsubscribed on ngOnDestroy!
  }
}
```

> 🧠 **Explain to yourself:** Why is an @AutoUnsubscribe decorator
> better than manually unsubscribing in ngOnDestroy?
>
> **Key points:** DRY: No copy-paste in every component |
> Forgetting is impossible: the decorator finds ALL subscriptions |
> Declarative: @AutoUnsubscribe says what happens, not how |
> But: Angular today recommends takeUntilDestroyed() or async pipe

---

### Custom Method Decorator: @Debounce

```typescript annotated
function Debounce(delayMs: number) {
  return function (
    target: Object,
    key: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    let timer: ReturnType<typeof setTimeout>;
    const original = descriptor.value;

    descriptor.value = function (...args: any[]) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        original.apply(this, args);
      }, delayMs);
    };

    return descriptor;
  };
}

@Component({ selector: "app-search", template: "..." })
class SearchComponent {
  @Debounce(300)
  onSearchInput(query: string): void {
    // ^ Only called 300ms after the last keystroke
    this.searchService.search(query).subscribe(results => {
      this.results = results;
    });
  }
}
```

> 💭 **Think about it:** The @Debounce decorator works, but has a
> problem with Angular's change detection. What is it?
>
> **Answer:** `setTimeout` runs outside of Angular's Zone.
> In some configurations, Angular doesn't detect changes after the
> debounced call. Solution: `NgZone.run()` in the decorator, or
> better: use `debounceTime()` from RxJS — that is Zone-aware.

---

<!-- /depth -->
## NestJS: Writing custom decorators

### Custom Decorator: @Roles

```typescript annotated
import { SetMetadata } from "@nestjs/common";

// Decorator factory that sets allowed roles as metadata:
const Roles = (...roles: string[]) => SetMetadata("roles", roles);
// ^ SetMetadata is NestJS's helper for metadata decorators

@Controller("users")
class UsersController {
  @Get()
  @Roles("admin", "manager")
  // ^ Only admin and manager may use this route
  findAll(): User[] {
    return this.usersService.findAll();
  }

  @Get(":id")
  @Roles("admin", "manager", "user")
  // ^ Every logged-in user may view individual users
  findOne(@Param("id") id: string): User {
    return this.usersService.findOne(id);
  }
}

// Guard that reads the metadata:
@Injectable()
class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>("roles", context.getHandler());
    // ^ Reads the metadata that @Roles set
    if (!roles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return roles.includes(user.role);
    // ^ Checks whether the user has the correct role
  }
}
```

> **Experiment:** Write your own NestJS decorator `@Public()`:
>
> ```typescript
> // @Public() marks a route as public (no auth required)
> const IS_PUBLIC_KEY = "isPublic";
> const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
>
> // In the guard:
> const isPublic = this.reflector.getAllAndOverride<boolean>(
>   IS_PUBLIC_KEY,
>   [context.getHandler(), context.getClass()]
> );
> if (isPublic) return true; // Public route → no auth check
>
> // Usage:
> @Public()
> @Get("health")
> healthCheck(): string { return "OK"; }
> ```

---

## Decorator composition: Combining multiple decorators

```typescript annotated
// NestJS: combining decorators into one
import { applyDecorators, UseGuards, SetMetadata } from "@nestjs/common";

// Custom composed decorator:
function AdminOnly() {
  return applyDecorators(
    SetMetadata("roles", ["admin"]),
    UseGuards(AuthGuard, RolesGuard),
    // ^ Combined: auth + role check
  );
}

// Instead of:
// @UseGuards(AuthGuard, RolesGuard)
// @Roles('admin')
// Now just:
@AdminOnly()
@Get("admin-dashboard")
getDashboard(): Dashboard { /* ... */ }
```

> ⚡ **In your Angular project** you can use similar composition:
>
> ```typescript
> // Custom decorator that combines multiple Angular features:
> function PageComponent(config: {
>   title: string;
>   route: string;
> }) {
>   return function (constructor: Function): void {
>     // Metadata for routing:
>     (constructor as any).__route = config.route;
>     // Metadata for title service:
>     (constructor as any).__pageTitle = config.title;
>   };
> }
>
> @Component({ selector: "app-dashboard", template: "..." })
> @PageComponent({ title: "Dashboard", route: "/dashboard" })
> class DashboardComponent { /* ... */ }
> ```

---

## Anti-patterns: What to avoid

```typescript annotated
// ANTI-PATTERN 1: Too much logic in the decorator
function BadDecorator(constructor: Function): void {
  // 200 lines of business logic...
  // Decorators should be SHORT and DECLARATIVE!
  // Extract into services/utilities!
}

// ANTI-PATTERN 2: Decorator that mutates global state
let globalCounter = 0;
function CountInstances(constructor: Function): void {
  globalCounter++; // SIDE EFFECT! Hard to test and debug.
}

// ANTI-PATTERN 3: Decorator that "lies" about the type
function AddMethod(constructor: Function): void {
  constructor.prototype.newMethod = () => {};
  // TypeScript does NOT know about newMethod!
  // (instance as any).newMethod() — unsafe
}

// BETTER: Use decorators for cross-cutting concerns:
// ✅ Logging, caching, retry, throttle, auth guards
// ✅ Metadata (routing, validation, serialization)
// ❌ Business logic, state management, complex transformations
```

---

## Summary: Decorator ecosystem

| Framework | Decorator type | Examples |
|---|---|---|
| Angular | Class | @Component, @Injectable, @Pipe, @Directive |
| Angular | Property | @Input, @Output, @ViewChild, @HostBinding |
| Angular | Method | @HostListener |
| NestJS | Class | @Controller, @Module, @Injectable |
| NestJS | Method | @Get, @Post, @Put, @UseGuards |
| NestJS | Parameter | @Param, @Query, @Body, @Headers |
| TypeORM | Class | @Entity |
| TypeORM | Property | @Column, @PrimaryGeneratedColumn |
| MobX | Property | @observable, @computed |
| MobX | Method | @action |

---

## What you've learned

- **Angular** uses decorators as declarations — metadata the compiler reads
- **NestJS** uses decorators as configuration and request transformation
- **Custom decorators** are easy to write: class decorator = function(constructor)
- **Decorator composition** combines multiple decorators into one
- **Anti-patterns**: no business logic, no global state, no type lies

> 🧠 **Explain to yourself:** Why are decorators so central to Angular,
> but almost absent in React?
>
> **Key points:** Angular: class-based → decorators are natural |
> React: function-based → hooks are more natural |
> Decorators annotate classes | Hooks compose functions |
> Both solve the same problem (DI, state, lifecycle) with
> different means

**Core concept to remember:** Decorators are metaprogramming —
code that describes and transforms code. In Angular they declare
what a class IS, in NestJS they configure what a method DOES.
Both use the same TypeScript feature for fundamentally different purposes.

---

> **End of lesson** — You've mastered TypeScript decorators —
> from the fundamentals to framework integration.
>
> Next up: [Lesson 29](../../29-next-lesson/sections/01-first-section.md)