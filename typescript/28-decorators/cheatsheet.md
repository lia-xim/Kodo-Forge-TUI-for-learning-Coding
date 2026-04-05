# Cheatsheet: Decorators (Legacy & Stage 3)

Schnellreferenz fuer Lektion 28.

---

## Decorator Grundlagen

```typescript
// Decorator = Funktion mit @ vor einer Deklaration
@sealed
class MyClass {}

// Decorator Factory = Funktion die Decorator zurueckgibt (mit Parametern)
@Component({ selector: "app-root" })
class MyComponent {}

// Reihenfolge: bottom-up (naeher am Code → zuerst)
@A   // wird ZWEITENS angewandt
@B   // wird ZUERST angewandt
class X {}
```

---

## Legacy vs Stage 3

| | Legacy | Stage 3 |
|---|---|---|
| tsconfig | `experimentalDecorators: true` | Default (kein Flag) |
| Method Decorator | `(target, key, descriptor)` | `(target, context)` |
| Parameter Decorator | Ja | **Nein** |
| emitDecoratorMetadata | Ja | **Nein** |
| `accessor` Keyword | Nein | **Ja** |
| addInitializer | Nein | **Ja** |
| Frameworks | Angular, NestJS, TypeORM | Zukuenftiger Standard |

---

## Class Decorator (Legacy)

```typescript
// Ohne Parameter:
function Sealed(constructor: Function): void {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@Sealed
class BankAccount { /* ... */ }

// Mit Parameter (Factory):
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
  target: Object,                // Prototyp
  propertyKey: string,           // Methodenname
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

## Parameter Decorator (nur Legacy)

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
  // Erzeugt automatisch:
  // #theme: string;
  // get theme() { return this.#theme; }
  // set theme(v) { this.#theme = v; }
}
```

---

## Nuetzliche Decorator-Patterns

| Decorator | Zweck |
|---|---|
| `@Log` | Methodenaufruf loggen |
| `@Cache(ttl)` | Ergebnis cachen |
| `@Retry(n)` | Bei Fehler wiederholen |
| `@Throttle(ms)` | Maximal alle ms aufrufen |
| `@Debounce(ms)` | Erst nach ms Stille aufrufen |
| `@Measure` | Ausfuehrungszeit messen |
| `@Validate` | Parameter validieren |
| `@Roles('admin')` | Zugriffssteuerung (NestJS) |

---

## Angular Migration (Legacy → Stage 3 kompatibel)

| Alt (Legacy) | Neu (Stage-3-kompatibel) |
|---|---|
| `@Input() name = ""` | `name = input<string>("")` |
| `@Input({ required: true })` | `name = input.required<string>()` |
| `@Output() click = new EventEmitter()` | `click = output<void>()` |
| `constructor(private svc: UserService)` | `svc = inject(UserService)` |
| `@ViewChild('ref')` | `ref = viewChild<ElementRef>('ref')` |

---

## Anti-Patterns

| Anti-Pattern | Problem | Besser |
|---|---|---|
| Business-Logik im Decorator | Versteckt, schwer testbar | Service/Utility |
| Globaler State im Decorator | Seiteneffekte, Race Conditions | State Management |
| Typ-Erweiterung ohne Typ-Update | `(instance as any).newMethod()` | Interface Augmentation |
| Decorator fuer alles | Over-Engineering | Nur fuer Cross-Cutting Concerns |

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
// Was emitDecoratorMetadata generiert:
@Injectable()
class UserService {
  constructor(private http: HttpClient) {}
}
// → __metadata("design:paramtypes", [HttpClient])
// Angular liest das fuer DI!
```
