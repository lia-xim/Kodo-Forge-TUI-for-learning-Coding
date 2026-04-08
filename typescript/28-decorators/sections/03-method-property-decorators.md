# Sektion 3: Method und Property Decorators

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Class Decorators](./02-class-decorators.md)
> Naechste Sektion: [04 - Parameter Decorators](./04-parameter-decorators.md)

---

## Was du hier lernst

- Wie **Method Decorators** Methoden umwickeln und transformieren
- Wie **Property Decorators** Getter/Setter und Validierung hinzufuegen
- Wie **Accessor Decorators** (get/set) funktionieren
- Praktische Patterns: Logging, Caching, Validierung, Throttle

---

## Hintergrund: Aspektorientierte Programmierung

> **Feature Origin Story: AOP und Cross-Cutting Concerns**
>
> Method Decorators implementieren ein Konzept aus den 1990ern:
> **Aspektorientierte Programmierung** (AOP). Gregor Kiczales
> (Xerox PARC, 1997) erkannte, dass bestimmte Concerns (Logging,
> Sicherheit, Caching) quer durch den gesamten Code verteilt sind —
> sogenannte "Cross-Cutting Concerns".
>
> In Java gibt es AspectJ, in .NET gibt es Attribute mit Interceptors.
> TypeScript-Decorators sind die eleganteste Form von AOP: `@log`,
> `@cache`, `@validate` — jeder Aspekt ist ein Decorator, der sich
> an beliebigen Methoden anbringen laesst.
>
> Das Angular-Team nutzt dieses Konzept intensiv: `@HostListener`
> ist ein Method Decorator der Events bindet, ohne dass die Methode
> selbst etwas von Events wissen muss. Die Business-Logik bleibt sauber.

---

## Method Decorator: Legacy-Syntax

```typescript annotated
// Legacy Method Decorator — drei Parameter:
function Retry(attempts: number) {
  return function (
    target: Object,                // Prototyp der Klasse
    propertyKey: string,           // Name der Methode
    descriptor: PropertyDescriptor // { value, writable, enumerable, configurable }
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;
    // ^ Die Original-Methode

    descriptor.value = async function (...args: any[]) {
      for (let i = 0; i < attempts; i++) {
        try {
          return await originalMethod.apply(this, args);
          // ^ Original-Methode aufrufen
        } catch (error) {
          if (i === attempts - 1) throw error;
          console.log(`Versuch ${i + 1} fehlgeschlagen, wiederhole...`);
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
    // ^ Wird bis zu 3 Mal versucht bei Fehler
  }
}
```

> 🧠 **Erklaere dir selbst:** Der Legacy Method Decorator bekommt einen
> `PropertyDescriptor`. Was sind die wichtigsten Properties davon?
>
> **Kernpunkte:** `value` = die Methode selbst | `get`/`set` = bei Accessors |
> `writable` = kann ueberschrieben werden? | `enumerable` = in for...in sichtbar? |
> `configurable` = kann geloescht/geaendert werden? |
> Man aendert meistens `value` um die Methode zu wrappen

---

## Method Decorator: Stage-3-Syntax

```typescript annotated
// Stage 3 Method Decorator — einfacher:
function retry(attempts: number) {
  return function (
    target: Function,
    // ^ Die Methode selbst (nicht der Prototyp!)
    context: ClassMethodDecoratorContext
    // ^ Strukturiertes Context-Objekt
  ): Function {
    const name = String(context.name);

    return async function (this: any, ...args: any[]) {
      for (let i = 0; i < attempts; i++) {
        try {
          return await (target as any).apply(this, args);
        } catch (error) {
          if (i === attempts - 1) throw error;
          console.log(`${name}: Versuch ${i + 1}/${attempts} fehlgeschlagen`);
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

> 💭 **Denkfrage:** Was ist der Hauptunterschied zwischen Legacy und
> Stage 3 Method Decorators? Welcher ist einfacher zu verstehen?
>
> **Antwort:** Legacy: 3 Parameter (target, propertyKey, descriptor) —
> man aendert `descriptor.value`. Stage 3: 2 Parameter (target, context) —
> man gibt eine neue Funktion zurueck. Stage 3 ist konzeptionell einfacher:
> Nimm eine Funktion, gib eine (modifizierte) Funktion zurueck.

---

## Praktische Method Decorators

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
        // ^ Cache-Hit: gespeichertes Ergebnis zurueckgeben
      }

      const result = original.apply(this, args);
      cache.set(cacheKey, { value: result, expiry: Date.now() + ttlMs });
      return result;
    };
    return descriptor;
  };
}

class UserService {
  @Cache(60_000) // 60 Sekunden
  getUserById(id: string): User {
    console.log("DB-Abfrage...");
    return { id, name: "Max" } as User;
  }
}
// Erster Aufruf: "DB-Abfrage..." → Ergebnis
// Zweiter Aufruf (< 60s): Kein Log → gecachtes Ergebnis
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
      // ^ Zu frueh nach dem letzten Aufruf → ignorieren
      lastCall = now;
      return original.apply(this, args);
    };
    return descriptor;
  };
}

class UIController {
  @Throttle(500) // Maximal alle 500ms
  onScroll(event: Event): void {
    console.log("Scroll verarbeitet");
  }
}
```

> **Experiment:** Baue einen `@Measure`-Decorator der die Ausfuehrungszeit misst:
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
> // Ausgabe: "process: 0.42ms"
> ```

---

## Property Decorators
<!-- section:summary -->
Property Decorators haben weniger Moeglichkeiten als Method Decorators:

<!-- depth:standard -->
Property Decorators haben weniger Moeglichkeiten als Method Decorators:

```typescript annotated
// Legacy Property Decorator — kann den Wert NICHT direkt aendern:
function MinLength(min: number) {
  return function (target: Object, propertyKey: string): void {
    // ^ Kein PropertyDescriptor! Property Decorators bekommen nur 2 Parameter.
    // Man kann aber einen Getter/Setter definieren:
    let value: string;

    Object.defineProperty(target, propertyKey, {
      get: () => value,
      set: (newValue: string) => {
        if (newValue.length < min) {
          throw new Error(
            `${propertyKey} muss mindestens ${min} Zeichen haben, ` +
            `hat aber ${newValue.length}`
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
  // ^ name wird automatisch validiert bei Zuweisung!

  @MinLength(5)
  password: string;

  constructor(name: string, password: string) {
    this.name = name;         // Prueft: >= 3 Zeichen
    this.password = password; // Prueft: >= 5 Zeichen
  }
}

new UserProfile("Max", "secret123"); // OK
// new UserProfile("Ma", "secret123"); // Error: name muss mind. 3 Zeichen haben
```

> ⚡ **In deinem Angular-Projekt** sind Property Decorators fundamental:
>
> ```typescript
> @Component({ ... })
> class ProductListComponent {
>   @Input() products: Product[] = [];
>   // ^ @Input() ist ein Property Decorator!
>   //   Angular nutzt es um das Data-Binding einzurichten.
>   //   Intern speichert Angular Metadaten ueber die Property.
>
>   @Output() productSelected = new EventEmitter<Product>();
>   // ^ @Output() markiert Properties als Event-Emitter
>
>   @ViewChild('searchInput') searchInput!: ElementRef;
>   // ^ @ViewChild() greift auf Template-Referenzen zu
> }
> ```
>
> In React mit MobX:
>
> ```typescript
> class TodoStore {
>   @observable todos: Todo[] = [];
>   // ^ @observable macht die Property reaktiv
>   @computed get completedCount(): number {
>     return this.todos.filter(t => t.done).length;
>   }
>   // ^ @computed cached berechnete Werte
> }
> ```

---

<!-- /depth -->
## Accessor Decorators (get/set)

```typescript annotated
// Accessor Decorator — fuer Getter und Setter:
function Readonly(
  target: Object,
  key: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  descriptor.set = undefined;
  // ^ Setter entfernen → Property wird readonly
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
// config.version = "2.0.0"; // Error: Cannot set property (Setter entfernt)
```

---

## Was du gelernt hast

- **Method Decorators** wrappen Methoden — ideal fuer Logging, Caching, Retry, Throttle
- **Property Decorators** koennen Getter/Setter einrichten — ideal fuer Validierung
- **Accessor Decorators** modifizieren Getter/Setter direkt
- Legacy: 3 Parameter (target, key, descriptor) — Stage 3: 2 Parameter (target, context)
- Decorators implementieren **AOP** (Aspektorientierte Programmierung)

> 🧠 **Erklaere dir selbst:** Warum sind Method Decorators maechiger als
> Property Decorators? Was bekommt der Method Decorator, das der Property
> Decorator nicht hat?
>
> **Kernpunkte:** Method Decorator bekommt PropertyDescriptor mit value |
> Property Decorator bekommt KEINEN Descriptor | Man muss bei Properties
> Object.defineProperty manuell verwenden | Methoden koennen direkt
> gewrappt werden, Properties nicht

**Kernkonzept zum Merken:** Method Decorators = Funktionen wrappen
(einfach, maechtig). Property Decorators = Getter/Setter einrichten
(umstaendlicher, aber nuetzlich fuer Validierung).

---

> **Pausenpunkt** -- Du kennst Method und Property Decorators.
> Naechstes Thema: Parameter Decorators — Angular's DI-Geheimnis.
>
> Weiter geht es mit: [Sektion 04: Parameter Decorators](./04-parameter-decorators.md)
