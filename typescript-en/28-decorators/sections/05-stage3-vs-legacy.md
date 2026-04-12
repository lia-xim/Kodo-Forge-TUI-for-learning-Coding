# Section 5: Stage 3 vs Legacy Decorators

> Estimated reading time: **10 minutes**
>
> Previous section: [04 - Parameter Decorators](./04-parameter-decorators.md)
> Next section: [06 - Practice: Angular and NestJS](./06-praxis-angular-nestjs.md)

---

## What you'll learn here

- The **concrete differences** between Legacy and Stage 3 Decorators
- Why Stage 3 Decorators are **safer** and **more standardized**
- What is **missing** in Stage 3 (Parameter Decorators, emitDecoratorMetadata)
- What the **migration path** from Legacy to Stage 3 looks like

---

## Background: Why two standards?

> **Feature Origin Story: TC39's long road**
>
> The TC39 Decorator Proposal started in 2014 as Stage 0. Yehuda Katz
> (Ember.js) was the original champion. TypeScript implemented
> an early version in 2015 as experimentalDecorators.
>
> Then something unusual happened: the proposal was completely
> redesigned. Between Stage 1 and Stage 3 the specification changed
> fundamentally — different parameters, different behavior,
> different capabilities. That is rare in TC39 and shows how
> complex the topic is.
>
> In 2022 the proposal reached Stage 3 with a completely new design.
> TypeScript 5.0 (March 2023) implemented it. But: millions of lines
> of code (Angular, NestJS, TypeORM, MobX) use the legacy version.
> An immediate switch is impossible — which is why both
> systems exist in parallel.

---

## Comparison: API differences

```typescript annotated
// ═══ METHOD DECORATOR ═══

// LEGACY:
function legacyLog(
  target: Object,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor | void {
  // target = class prototype
  // propertyKey = method name as string
  // descriptor = PropertyDescriptor (value, get, set, ...)
  // Return: modified descriptor or void
  const original = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(`${propertyKey}(${args})`);
    return original.apply(this, args);
  };
  return descriptor;
}

// STAGE 3:
function stage3Log(
  target: Function,
  context: ClassMethodDecoratorContext
): Function | void {
  // target = the method ITSELF (not the prototype!)
  // context = structured object { name, kind, static, private, ... }
  // Return: replacement function or void
  const name = String(context.name);
  return function (this: any, ...args: any[]) {
    console.log(`${name}(${args})`);
    return target.apply(this, args);
  };
}
```

> 🧠 **Explain to yourself:** Stage 3 passes the method directly as `target`,
> Legacy passes the prototype + PropertyDescriptor. Which approach is
> conceptually simpler?
>
> **Key points:** Stage 3: target IS the method → wrap directly |
> Legacy: target is the prototype → retrieve method from descriptor.value |
> Stage 3 is more functional: "Take a function, return a function" |
> Legacy is more object-oriented: "Modify the descriptor"

---

## Comparison: Feature matrix
<!-- section:summary -->
| Method Decorators | Yes | Yes |

<!-- depth:standard -->
| Feature | Legacy | Stage 3 |
|---|---|---|
| Class Decorators | Yes | Yes |
| Method Decorators | Yes | Yes |
| Property Decorators | Yes (limited) | Yes (improved) |
| Accessor Decorators | Yes | Yes (own context type) |
| **Parameter Decorators** | **Yes** | **No** |
| **emitDecoratorMetadata** | **Yes** | **No** |
| Auto-Accessor (`accessor`) | No | **Yes (new!)** |
| Type-safe (context object) | No | **Yes** |
| TC39 Standard | No (experimental) | **Yes (Stage 3)** |
| Angular/NestJS-compatible | **Yes** | Not yet |

> 💭 **Think about it:** Stage 3 has NO Parameter Decorators. How will
> Angular's DI work in the future?
>
> **Answer:** Angular is planning a gradual transition. Possible:
> 1. `inject()` function instead of constructor injection (already possible today).
> 2. A custom metadata solution as a replacement for emitDecoratorMetadata.
> 3. Hybrid approach: Legacy for DI, Stage 3 for the rest.
> Angular 17+ already promotes `inject()` as an alternative.

---

<!-- /depth -->
## Stage 3: New features

### Auto-Accessor (`accessor`)

```typescript annotated
// Stage 3 introduces a NEW keyword: 'accessor'
// It automatically creates a getter and setter:

class User {
  accessor name: string;
  // ^ Is internally expanded to:
  // #name: string;
  // get name() { return this.#name; }
  // set name(v) { this.#name = v; }
}

// Why is this useful? Because Accessor Decorators now work on
// NORMAL properties — not just on get/set:
function Tracked(
  target: ClassAccessorDecoratorTarget<any, any>,
  context: ClassAccessorDecoratorContext
) {
  return {
    set(value: any) {
      console.log(`${String(context.name)} changed to: ${value}`);
      target.set.call(this, value);
      // ^ Track changes automatically!
    },
    get() {
      return target.get.call(this);
    },
  };
}

class Settings {
  @Tracked accessor theme: string = "light";
  @Tracked accessor fontSize: number = 14;
}

const s = new Settings();
s.theme = "dark";    // Log: "theme changed to: dark"
s.fontSize = 16;     // Log: "fontSize changed to: 16"
```

### context.addInitializer()

```typescript annotated
// Stage 3: Attach initialization code to the class
function Register(
  target: any,
  context: ClassDecoratorContext
): void {
  context.addInitializer(function (this: any) {
    // ^ Called when an instance is created
    console.log(`Instance of ${String(context.name)} created`);
    // Registry.register(this); // e.g. global registry
  });
}

@Register
class Plugin {
  name = "MyPlugin";
}

new Plugin(); // Log: "Instance of Plugin created"
```

> **Experiment:** Compare these two tsconfig configurations:
>
> ```json
> // Configuration A: Legacy Decorators
> {
>   "compilerOptions": {
>     "target": "ES2022",
>     "experimentalDecorators": true,
>     "emitDecoratorMetadata": true
>   }
> }
>
> // Configuration B: Stage 3 Decorators
> {
>   "compilerOptions": {
>     "target": "ES2022"
>     // No experimentalDecorators → Stage 3 is the default!
>     // emitDecoratorMetadata not available with Stage 3
>   }
> }
> ```
>
> Question: Which configuration does your current project use?
> Tip: Angular projects almost always use Configuration A.

---

## Migration path: From Legacy to Stage 3

```typescript annotated
// Phase 1: Legacy code (today in Angular/NestJS):
// experimentalDecorators: true
@Component({ selector: "app-root" })
class AppComponent {
  @Input() title = "";
  constructor(private service: UserService) {} // DI with emitDecoratorMetadata
}

// Phase 2: Hybrid (Angular 17+):
// Legacy Decorators, but inject() instead of constructor DI
@Component({ selector: "app-root" })
class AppComponent {
  title = input<string>("");        // Signal-based inputs
  service = inject(UserService);    // inject() instead of constructor DI
  // ^ NO emitDecoratorMetadata needed!
}

// Phase 3: Future (Stage 3 Decorators):
// When Angular supports Stage 3:
@Component({ selector: "app-root" })
class AppComponent {
  // Same API, but Stage 3 decorator semantics
  accessor title = input<string>("");
  service = inject(UserService);
}
```

> ⚡ **In your Angular project** you should start preparing NOW:
>
> ```typescript
> // Instead of constructor DI:
> // constructor(private service: UserService) {}
>
> // Use inject():
> private service = inject(UserService);
>
> // Instead of @Input():
> // @Input() name = "";
>
> // Use input() (Angular 17.1+):
> name = input<string>("");
> name = input.required<string>();
>
> // Instead of @Output():
> // @Output() clicked = new EventEmitter<void>();
>
> // Use output() (Angular 17.3+):
> clicked = output<void>();
> ```
>
> These APIs are already **Stage-3-compatible** and recommended!

---

## What you've learned

- Stage 3 Decorators have a **simpler API** (target + context instead of 3 parameters)
- Stage 3 has **NO Parameter Decorators** and no `emitDecoratorMetadata`
- The new `accessor` keyword enables **auto-accessors** with decorator support
- `context.addInitializer()` allows initialization code without constructor wrapping
- Angular is migrating gradually: `inject()`, `input()`, `output()` are Stage-3-compatible

> 🧠 **Explain to yourself:** Why did TC39 decide NOT to include Parameter
> Decorators in Stage 3?
>
> **Key points:** Parameter Decorators are complex and error-prone |
> They cannot change the parameter value (only metadata) |
> emitDecoratorMetadata couples the type system to the runtime — controversial |
> Simpler alternatives exist (inject(), tokens) |
> Could come later as a separate proposal

**Key concept to remember:** Legacy Decorators = powerful but experimental.
Stage 3 Decorators = standardized, simpler, but without Parameter Decorators.
The future is Stage 3 — start migrating today.

---

> **Pause point** -- You understand both systems.
> Final section: Putting everything together in practice.
>
> Continue with: [Section 06: Practice: Angular and NestJS](./06-praxis-angular-nestjs.md)