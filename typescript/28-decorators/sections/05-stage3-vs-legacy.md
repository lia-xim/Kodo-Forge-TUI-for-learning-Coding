# Sektion 5: Stage 3 vs Legacy Decorators

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Parameter Decorators](./04-parameter-decorators.md)
> Naechste Sektion: [06 - Praxis: Angular und NestJS](./06-praxis-angular-nestjs.md)

---

## Was du hier lernst

- Die **konkreten Unterschiede** zwischen Legacy und Stage 3 Decorators
- Warum Stage 3 Decorators **sicherer** und **standardisierter** sind
- Was bei Stage 3 **fehlt** (Parameter Decorators, emitDecoratorMetadata)
- Wie der **Migrationspfad** von Legacy zu Stage 3 aussieht

---

## Hintergrund: Warum zwei Standards?

> **Feature Origin Story: TC39's langer Weg**
>
> Das TC39 Decorator Proposal begann 2014 als Stage 0. Yehuda Katz
> (Ember.js) war der urspruengliche Champion. TypeScript implementierte
> 2015 eine fruehe Version als experimentalDecorators.
>
> Dann geschah etwas Ungewoehnliches: Das Proposal wurde komplett
> ueberarbeitet. Zwischen Stage 1 und Stage 3 aenderte sich die
> Spezifikation fundamental — andere Parameter, anderes Verhalten,
> andere Moeglichkeiten. Das ist in TC39 selten und zeigt wie
> komplex das Thema ist.
>
> 2022 erreichte das Proposal Stage 3 mit einem komplett neuen Design.
> TypeScript 5.0 (Maerz 2023) implementierte es. Aber: Millionen Zeilen
> Code (Angular, NestJS, TypeORM, MobX) nutzen die Legacy-Version.
> Ein sofortiger Wechsel ist unmoeglich — deshalb existieren beide
> Systeme parallel.

---

## Vergleich: API-Unterschiede

```typescript annotated
// ═══ METHOD DECORATOR ═══

// LEGACY:
function legacyLog(
  target: Object,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor | void {
  // target = Klassen-Prototyp
  // propertyKey = Methodenname als string
  // descriptor = PropertyDescriptor (value, get, set, ...)
  // Return: modifizierter Descriptor oder void
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
  // target = die Methode SELBST (nicht der Prototyp!)
  // context = strukturiertes Objekt { name, kind, static, private, ... }
  // Return: Ersatz-Funktion oder void
  const name = String(context.name);
  return function (this: any, ...args: any[]) {
    console.log(`${name}(${args})`);
    return target.apply(this, args);
  };
}
```

> 🧠 **Erklaere dir selbst:** Stage 3 gibt die Methode direkt als `target`,
> Legacy gibt den Prototyp + PropertyDescriptor. Welcher Ansatz ist
> konzeptionell einfacher?
>
> **Kernpunkte:** Stage 3: target IS die Methode → direkt wrappen |
> Legacy: target ist der Prototyp → Methode aus descriptor.value holen |
> Stage 3 ist funktionaler: "Nimm Funktion, gib Funktion zurueck" |
> Legacy ist objektorientierter: "Aendere den Descriptor"

---

## Vergleich: Feature-Matrix
<!-- section:summary -->
| Method Decorators | Ja | Ja |

<!-- depth:standard -->
| Feature | Legacy | Stage 3 |
|---|---|---|
| Class Decorators | Ja | Ja |
| Method Decorators | Ja | Ja |
| Property Decorators | Ja (eingeschraenkt) | Ja (verbessert) |
| Accessor Decorators | Ja | Ja (eigener Kontext-Typ) |
| **Parameter Decorators** | **Ja** | **Nein** |
| **emitDecoratorMetadata** | **Ja** | **Nein** |
| Auto-Accessor (`accessor`) | Nein | **Ja (neu!)** |
| Typsicher (context Objekt) | Nein | **Ja** |
| TC39 Standard | Nein (experimentell) | **Ja (Stage 3)** |
| Angular/NestJS-kompatibel | **Ja** | Noch nicht |

> 💭 **Denkfrage:** Stage 3 hat KEINE Parameter Decorators. Wie wird
> Angular's DI in Zukunft funktionieren?
>
> **Antwort:** Angular plant einen schrittweisen Uebergang. Moeglich:
> 1. `inject()`-Funktion statt Konstruktor-Injection (schon heute moeglich).
> 2. Eigene Metadaten-Loesung als Ersatz fuer emitDecoratorMetadata.
> 3. Hybrid-Ansatz: Legacy fuer DI, Stage 3 fuer den Rest.
> Angular 17+ foerdert bereits `inject()` als Alternative.

---

<!-- /depth -->
## Stage 3: Neue Features

### Auto-Accessor (`accessor`)

```typescript annotated
// Stage 3 bringt ein NEUES Keyword: 'accessor'
// Es erzeugt automatisch einen Getter und Setter:

class User {
  accessor name: string;
  // ^ Wird intern zu:
  // #name: string;
  // get name() { return this.#name; }
  // set name(v) { this.#name = v; }
}

// Warum ist das nuetzlich? Weil Accessor Decorators jetzt auf
// NORMALEN Properties funktionieren — nicht nur auf get/set:
function Tracked(
  target: ClassAccessorDecoratorTarget<any, any>,
  context: ClassAccessorDecoratorContext
) {
  return {
    set(value: any) {
      console.log(`${String(context.name)} geaendert zu: ${value}`);
      target.set.call(this, value);
      // ^ Automatisch Aenderungen tracken!
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
s.theme = "dark";    // Log: "theme geaendert zu: dark"
s.fontSize = 16;     // Log: "fontSize geaendert zu: 16"
```

### context.addInitializer()

```typescript annotated
// Stage 3: Initialisierungs-Code an die Klasse anhaengen
function Register(
  target: any,
  context: ClassDecoratorContext
): void {
  context.addInitializer(function (this: any) {
    // ^ Wird aufgerufen wenn eine Instanz erstellt wird
    console.log(`Instanz von ${String(context.name)} erstellt`);
    // Registry.register(this); // z.B. globale Registry
  });
}

@Register
class Plugin {
  name = "MyPlugin";
}

new Plugin(); // Log: "Instanz von Plugin erstellt"
```

> **Experiment:** Vergleiche diese beiden tsconfig-Konfigurationen:
>
> ```json
> // Konfiguration A: Legacy Decorators
> {
>   "compilerOptions": {
>     "target": "ES2022",
>     "experimentalDecorators": true,
>     "emitDecoratorMetadata": true
>   }
> }
>
> // Konfiguration B: Stage 3 Decorators
> {
>   "compilerOptions": {
>     "target": "ES2022"
>     // Kein experimentalDecorators → Stage 3 ist default!
>     // emitDecoratorMetadata nicht verfuegbar bei Stage 3
>   }
> }
> ```
>
> Frage: Welche Konfiguration verwendet dein aktuelles Projekt?
> Tipp: Angular-Projekte haben fast immer Konfiguration A.

---

## Migrationspfad: Von Legacy zu Stage 3

```typescript annotated
// Phase 1: Legacy-Code (heute in Angular/NestJS):
// experimentalDecorators: true
@Component({ selector: "app-root" })
class AppComponent {
  @Input() title = "";
  constructor(private service: UserService) {} // DI mit emitDecoratorMetadata
}

// Phase 2: Hybrid (Angular 17+):
// Legacy Decorators, aber inject() statt Konstruktor-DI
@Component({ selector: "app-root" })
class AppComponent {
  title = input<string>("");        // Signal-basierte Inputs
  service = inject(UserService);    // inject() statt Konstruktor-DI
  // ^ KEIN emitDecoratorMetadata noetig!
}

// Phase 3: Zukunft (Stage 3 Decorators):
// Wenn Angular Stage 3 unterstuetzt:
@Component({ selector: "app-root" })
class AppComponent {
  // Gleiche API, aber Stage 3 Decorator-Semantik
  accessor title = input<string>("");
  service = inject(UserService);
}
```

> ⚡ **In deinem Angular-Projekt** solltest du JETZT schon vorbereiten:
>
> ```typescript
> // Statt Konstruktor-DI:
> // constructor(private service: UserService) {}
>
> // Nutze inject():
> private service = inject(UserService);
>
> // Statt @Input():
> // @Input() name = "";
>
> // Nutze input() (Angular 17.1+):
> name = input<string>("");
> name = input.required<string>();
>
> // Statt @Output():
> // @Output() clicked = new EventEmitter<void>();
>
> // Nutze output() (Angular 17.3+):
> clicked = output<void>();
> ```
>
> Diese APIs sind bereits **Stage-3-kompatibel** und empfohlen!

---

## Was du gelernt hast

- Stage 3 Decorators haben eine **einfachere API** (target + context statt 3 Parameter)
- Stage 3 hat **KEINE Parameter Decorators** und kein `emitDecoratorMetadata`
- Das neue `accessor`-Keyword ermoeglicht **Auto-Accessors** mit Decorator-Support
- `context.addInitializer()` erlaubt Initialisierungs-Code ohne Konstruktor-Wrapping
- Angular migriert schrittweise: `inject()`, `input()`, `output()` sind Stage-3-kompatibel

> 🧠 **Erklaere dir selbst:** Warum hat TC39 entschieden, Parameter
> Decorators NICHT in Stage 3 aufzunehmen?
>
> **Kernpunkte:** Parameter Decorators sind komplex und fehleranfaellig |
> Sie koennen den Parameterwert nicht aendern (nur Metadaten) |
> emitDecoratorMetadata koppelt Typsystem an Laufzeit — kontrovers |
> Einfachere Alternativen existieren (inject(), Tokens) |
> Koennte als separates Proposal spaeter kommen

**Kernkonzept zum Merken:** Legacy Decorators = maechtig aber experimentell.
Stage 3 Decorators = standardisiert, einfacher, aber ohne Parameter Decorators.
Die Zukunft ist Stage 3 — beginne heute mit der Migration.

---

> **Pausenpunkt** -- Du verstehst beide Systeme.
> Letzte Sektion: Alles in der Praxis zusammenfuegen.
>
> Weiter geht es mit: [Sektion 06: Praxis: Angular und NestJS](./06-praxis-angular-nestjs.md)
