# Sektion 2: Class Decorators

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Decorator-Grundlagen](./01-decorator-grundlagen.md)
> Naechste Sektion: [03 - Method und Property Decorators](./03-method-property-decorators.md)

---

## Was du hier lernst

- Wie **Class Decorators** funktionieren (Legacy und Stage 3)
- Wie man Klassen mit Decorators **erweitert** und **versiegelt**
- Decorator Factories: Decorators mit **Parametern**
- Wie Angular's `@Component()` und `@Injectable()` intern funktionieren

---

## Hintergrund: Klassen als Decorator-Ziel

> **Feature Origin Story: @Component — der bekannteste Decorator**
>
> Als das Angular-Team um Misko Hevery Angular 2 (2016) entwarf,
> stand eine radikale Designentscheidung an: Wie definiert man
> Komponenten? React nutzte `React.createClass()` (spaeter Klassen),
> Vue nutzte Options-Objekte.
>
> Angular waehlte Decorators: `@Component({ ... }) class MyComponent`.
> Der Decorator transformiert die Klasse nicht — er **annotiert** sie
> mit Metadaten (Template, Styles, Selector). Angular's Compiler liest
> diese Metadaten und generiert den eigentlichen Rendering-Code.
>
> Diese Entscheidung hatte weitreichende Folgen: Angular war das erste
> grosse Framework das sich auf experimentelle TypeScript-Features
> verliess. Heute, 10 Jahre spaeter, ist Angular immer noch an die
> Legacy-Decorator-Spezifikation gebunden — ein Wechsel zu Stage 3
> ist in Planung, aber nicht trivial.

---

## Class Decorator: Legacy-Syntax

```typescript annotated
// Legacy Class Decorator — nimmt den Konstruktor als Argument:
function Sealed(constructor: Function): void {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
  // ^ Object.seal verhindert das Hinzufuegen/Entfernen von Properties
  // Die Klasse und ihr Prototyp sind jetzt "versiegelt"
}

@Sealed
class BankAccount {
  constructor(
    public owner: string,
    public balance: number
  ) {}

  deposit(amount: number): void {
    this.balance += amount;
  }
}

// Jetzt: Man kann keine neuen Properties hinzufuegen:
const account = new BankAccount("Max", 1000);
// (account as any).hacked = true;
// ^ Wuerde in strict mode einen Error werfen (Object.seal)
```

> 🧠 **Erklaere dir selbst:** Ein Class Decorator bekommt den Konstruktor
> als Argument. Was koennte man alles damit machen?
>
> **Kernpunkte:** Klasse versiegeln (Object.seal/freeze) | Neue Methoden
> hinzufuegen | Konstruktor wrappen (z.B. Logging) | Metadaten
> speichern (Reflect.metadata) | Klasse komplett ersetzen

---

## Class Decorator: Stage-3-Syntax

```typescript annotated
// Stage 3 Class Decorator — neues API mit context:
function sealed(
  target: new (...args: any[]) => any,
  // ^ target = der Klassenkonstruktor
  context: ClassDecoratorContext
  // ^ context = Metadaten (name, kind, etc.)
): void {
  // context.kind === "class" — immer bei Class Decorators
  console.log(`Sealing class: ${String(context.name)}`);
  Object.seal(target);
  Object.seal(target.prototype);
}

@sealed
class SecureStorage {
  private data: Map<string, string> = new Map();

  set(key: string, value: string): void {
    this.data.set(key, value);
  }

  get(key: string): string | undefined {
    return this.data.get(key);
  }
}
```

---

## Decorator Factory: Decorators mit Parametern

```typescript annotated
// Problem: @Sealed hat keine Parameter.
// Loesung: Eine Funktion die einen Decorator ZURUECKGIBT.

// Legacy Decorator Factory:
function Component(options: { selector: string; template: string }) {
  // ^ Aeussere Funktion nimmt Parameter
  return function (constructor: Function): void {
    // ^ Innere Funktion ist der eigentliche Decorator
    // Metadaten an die Klasse heften:
    (constructor as any).__selector = options.selector;
    (constructor as any).__template = options.template;
  };
}

@Component({
  selector: "app-header",
  template: "<h1>{{ title }}</h1>",
})
class HeaderComponent {
  title = "Willkommen";
}

// Jetzt kann ein Framework die Metadaten auslesen:
const selector = (HeaderComponent as any).__selector;
// ^ "app-header" — so funktioniert Angular's @Component() intern!
// (Angular nutzt Reflect.metadata statt __-Properties, aber das Prinzip ist gleich)
```

> 💭 **Denkfrage:** `@Component({...})` hat Klammern, `@Sealed` nicht.
> Was ist der Unterschied? Wann braucht man Klammern?
>
> **Antwort:** Ohne Klammern: `@Sealed` — der Decorator selbst wird angewandt.
> Mit Klammern: `@Component({...})` — die **Factory** wird aufgerufen und
> gibt den eigentlichen Decorator zurueck. Klammern = Decorator Factory.
> Das ist wie `log` vs. `log("verbose")` — einmal die Funktion selbst,
> einmal ein Aufruf der eine Funktion zurueckgibt.

---

## Klasse erweitern: Neue Funktionalitaet hinzufuegen

```typescript annotated
// Decorator der eine Klasse um Methoden erweitert (Legacy):
function Timestamped<T extends new (...args: any[]) => {}>(Base: T) {
  return class extends Base {
    // ^ Erzeugt eine neue Klasse die von der Original-Klasse erbt
    createdAt = new Date();
    updatedAt = new Date();

    touch(): void {
      this.updatedAt = new Date();
    }
  };
}

@Timestamped
class BlogPost {
  constructor(
    public title: string,
    public content: string
  ) {}
}

const post = new BlogPost("TypeScript Decorators", "...");
// post.createdAt → Date (von Timestamped hinzugefuegt)
// post.touch()   → aktualisiert updatedAt
// ACHTUNG: TypeScript kennt createdAt/touch() nicht!
// Das ist ein bekanntes Problem bei Legacy Class Decorators:
// Der Typ der Klasse aendert sich nicht durch den Decorator.
```

> **Experiment:** Probiere einen einfachen Logging-Decorator:
>
> ```typescript
> function LogCreation(constructor: Function): void {
>   const original = constructor;
>   const newConstructor: any = function (...args: any[]) {
>     console.log(`Erstelle ${original.name} mit:`, args);
>     return new (original as any)(...args);
>   };
>   newConstructor.prototype = original.prototype;
>   return newConstructor;
> }
>
> @LogCreation
> class User {
>   constructor(public name: string, public email: string) {}
> }
>
> new User("Max", "max@example.com");
> // Ausgabe: "Erstelle User mit: ['Max', 'max@example.com']"
> ```

---

## Mehrere Decorators stapeln

Decorators koennen kombiniert werden — die Reihenfolge ist wichtig:

```typescript annotated
function First(constructor: Function) {
  console.log("First ausgefuehrt");
}

function Second(constructor: Function) {
  console.log("Second ausgefuehrt");
}

@First
@Second
class MyClass {}

// Ausgabe:
// "Second ausgefuehrt"    ← BOTTOM-UP! Naechster zum Code zuerst
// "First ausgefuehrt"

// Aber bei Decorator FACTORIES:
@First()  // Evaluierung: TOP-DOWN
@Second() // Evaluierung: TOP-DOWN
class MyClass2 {}
// Factory-Evaluierung: First() → Second()
// Decorator-Anwendung:  Second → First (bottom-up)
```

> ⚡ **In deinem Angular-Projekt** siehst du gestapelte Decorators selten
> auf Klassen, aber haeufig auf Properties:
>
> ```typescript
> class UserComponent {
>   @Input()
>   @Required()        // Custom Validator
>   @Transform(lower)  // Custom Transformer
>   username: string;
>   // ^ Drei Decorators auf einer Property — alle werden bottom-up angewandt
> }
> ```
>
> In NestJS sind gestapelte Decorators Standard:
>
> ```typescript
> @Controller("users")
> @UseGuards(AuthGuard)
> @UseInterceptors(LoggingInterceptor)
> class UsersController {
>   @Get(":id")
>   @UseGuards(RolesGuard)
>   findOne(@Param("id") id: string): User { /* ... */ }
> }
> ```

---

## Was du gelernt hast

- Class Decorators bekommen den **Konstruktor** als Argument
- **Decorator Factories** sind Funktionen die Decorators zurueckgeben (`@Component({...})`)
- Decorators koennen Klassen **versiegeln**, **erweitern** oder mit **Metadaten annotieren**
- Mehrere Decorators werden **bottom-up** angewandt (naechster zum Code zuerst)
- Legacy Class Decorators aendern den **Typ** der Klasse nicht — ein bekanntes Manko

> 🧠 **Erklaere dir selbst:** Warum unterscheidet man zwischen
> "Decorator" und "Decorator Factory"? Koennte man nicht immer
> eine Factory verwenden?
>
> **Kernpunkte:** Decorator = Funktion die direkt angewandt wird (@Sealed) |
> Factory = Funktion die einen Decorator zurueckgibt (@Component({...})) |
> Man KOENNTE immer Factories verwenden, aber @Sealed ist kuerzer als @Sealed() |
> Konvention: Ohne Parameter → Decorator, mit Parameter → Factory

**Kernkonzept zum Merken:** `@Decorator` = die Funktion selbst.
`@Decorator()` = ein Aufruf der eine Funktion zurueckgibt.
Der Unterschied ist subtil aber fundamental — wie `fn` vs. `fn()`.

---

> **Pausenpunkt** -- Du verstehst Class Decorators.
> Naechstes Thema: Method und Property Decorators — das taegliche Brot.
>
> Weiter geht es mit: [Sektion 03: Method und Property Decorators](./03-method-property-decorators.md)
