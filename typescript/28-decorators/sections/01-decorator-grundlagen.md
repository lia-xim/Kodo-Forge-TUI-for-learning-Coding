# Sektion 1: Decorator-Grundlagen

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: -- (Start)
> Naechste Sektion: [02 - Class Decorators](./02-class-decorators.md)

---

## Was du hier lernst

- Was **Decorators** sind und welches Problem sie loesen
- Den Unterschied zwischen **Legacy Decorators** (experimentalDecorators) und **Stage 3 Decorators**
- Wie Decorators als **Metaprogrammierung** funktionieren
- Warum Decorators in **Angular und NestJS** fundamental sind

---

## Hintergrund: Die Geschichte der Decorators

> **Feature Origin Story: Von Python zu TypeScript**
>
> Decorators kommen urspruenglich aus Python (PEP 318, 2003): `@decorator`
> ueber einer Funktion transformiert sie. Das Konzept wurde von Java-
> Annotations (JSR 175, 2004) und C#-Attributes inspiriert.
>
> Fuer JavaScript wurde ein Decorator-Proposal 2014 gestartet (TC39 Stage 0).
> TypeScript implementierte 2015 eine fruehe Version als **experimentelles**
> Feature (`experimentalDecorators: true`). Angular 2 (2016) baute sein
> gesamtes Framework darauf auf: `@Component`, `@Injectable`, `@Input`.
>
> Das TC39-Proposal durchlief mehrere Redesigns. 2022 erreichte es
> **Stage 3** — eine komplett neue Spezifikation, nicht kompatibel
> mit der experimentellen Version. TypeScript 5.0 (Maerz 2023)
> implementierte die Stage-3-Version.
>
> Heute existieren ZWEI Decorator-Systeme in TypeScript:
> - **Legacy** (`experimentalDecorators: true`) — Angular, NestJS, TypeORM
> - **Stage 3** (default ab TS 5.0) — der zukuenftige Standard

---

## Was ist ein Decorator?
<!-- section:summary -->
Ein Decorator ist eine **Funktion**, die eine Klasse, Methode, Property

<!-- depth:standard -->
Ein Decorator ist eine **Funktion**, die eine Klasse, Methode, Property
oder einen Parameter **transformiert** oder **annotiert**:

```typescript annotated
// Ein Decorator ist einfach eine Funktion:
function log(target: any, context: ClassMethodDecoratorContext) {
  // ^ target = die dekorierte Methode
  // ^ context = Metadaten (Name, Art, Klasse)
  const methodName = String(context.name);

  // Wrapper-Funktion zurueckgeben:
  return function (this: any, ...args: any[]) {
    console.log(`→ ${methodName}(${args.join(", ")})`);
    const result = target.apply(this, args);
    console.log(`← ${methodName} = ${result}`);
    return result;
  };
}

// Decorator anwenden mit @:
class Calculator {
  @log
  // ^ @log "umwickelt" die add-Methode mit Logging
  add(a: number, b: number): number {
    return a + b;
  }
}

const calc = new Calculator();
calc.add(2, 3);
// Ausgabe:
// → add(2, 3)
// ← add = 5
```

> 🧠 **Erklaere dir selbst:** Ein Decorator ist eine Funktion die eine
> andere Funktion "umwickelt". Wo hast du dieses Pattern schon gesehen,
> OHNE den @-Syntax?
>
> **Kernpunkte:** Higher-Order Functions! | middleware(handler) in Express |
> pipe(map(), filter()) in RxJS | Wrapper-Funktionen in JavaScript |
> Decorators sind syntaktischer Zucker fuer Higher-Order Functions

---

## Decorator vs. Higher-Order Function

```typescript annotated
// OHNE Decorator — manuelles Wrapping:
function log<T extends (...args: any[]) => any>(fn: T): T {
  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    console.log(`Aufruf: ${fn.name}(${args})`);
    return fn.apply(this, args);
  } as T;
}

const add = log(function add(a: number, b: number) {
  return a + b;
});
// ^ Funktioniert, aber: Das Wrapping passiert AUSSERHALB der Klasse.
//   Man muss die Methode manuell wrappen.

// MIT Decorator — deklarativ, direkt an der Methode:
class Calculator {
  @log
  add(a: number, b: number): number {
    return a + b;
  }
  // ^ Wrapping passiert DIREKT an der Deklaration.
  //   Man sieht sofort: "add" wird geloggt.
}
```

> 💭 **Denkfrage:** Decorators sind syntaktischer Zucker fuer Higher-Order
> Functions. Warum ist der Zucker trotzdem wertvoll?
>
> **Antwort:** 1. **Lesbarkeit**: `@log` direkt ueber der Methode ist
> klarer als ein separater Wrapping-Aufruf. 2. **Komposition**: Mehrere
> Decorators koennen gestapelt werden (`@log @validate @cache`).
> 3. **Metadaten**: Decorators koennen Informationen UEBER die Klasse
> speichern (Reflection), nicht nur das Verhalten aendern.

---

## Legacy vs. Stage 3: Der grosse Unterschied

```typescript annotated
// === LEGACY Decorators (experimentalDecorators: true) ===
// Verwendet in: Angular, NestJS, TypeORM, MobX 5
// Syntax: Spezielle Funktionssignaturen je nach Typ

// Method Decorator (Legacy):
function legacyLog(
  target: Object,           // Prototyp der Klasse
  propertyKey: string,      // Name der Methode
  descriptor: PropertyDescriptor  // { value, get, set, ... }
): PropertyDescriptor {
  // ^ Drei Parameter mit spezifischen Bedeutungen
  const original = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(`${propertyKey}(${args})`);
    return original.apply(this, args);
  };
  return descriptor;
}

// === STAGE 3 Decorators (default ab TS 5.0) ===
// Zukuenftiger Standard, einfachere API

// Method Decorator (Stage 3):
function stage3Log(
  target: Function,                    // Die Methode selbst
  context: ClassMethodDecoratorContext  // Strukturiertes Context-Objekt
): Function {
  // ^ Zwei Parameter: target + context
  const name = String(context.name);
  return function (this: any, ...args: any[]) {
    console.log(`${name}(${args})`);
    return target.apply(this, args);
  };
}
```

> **Experiment:** Pruefe in deinem aktuellen Projekt:
>
> ```json
> // tsconfig.json — welche Version nutzt du?
> {
>   "compilerOptions": {
>     "experimentalDecorators": true,  // Legacy!
>     "emitDecoratorMetadata": true    // Legacy-Feature fuer Reflection
>   }
> }
>
> // Wenn experimentalDecorators NICHT gesetzt ist
> // und target >= "ES2022" → Stage 3 Decorators aktiv
> ```
>
> Angular 16+ und NestJS verwenden immer noch Legacy Decorators.
> Der Wechsel zu Stage 3 wird schrittweise passieren.

---

## Wo Decorators ueberall eingesetzt werden

```typescript annotated
// Angular — ALLES basiert auf Decorators:
@Component({
  selector: "app-root",
  template: "<h1>{{ title }}</h1>",
})
class AppComponent {
  @Input() title = "Hallo";
  // ^ Property Decorator: markiert als Input-Binding
}

// NestJS — Server-Framework mit Decorator-API:
@Controller("users")
class UsersController {
  @Get(":id")
  getUser(@Param("id") id: string): User {
    // ^ Parameter Decorator: extrahiert Route-Parameter
    return this.userService.findById(id);
  }
}

// TypeORM — Datenbank-Entities:
@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;
}
```

> ⚡ **In deinem Angular-Projekt** sind Decorators allgegenwaertig:
>
> ```typescript
> // Jede Angular-Komponente IST ein Decorator:
> @Component({ ... })     // Class Decorator
> @Injectable({ ... })    // Class Decorator (Services)
> @Input()                // Property Decorator
> @Output()               // Property Decorator
> @ViewChild('ref')       // Property Decorator
> @HostListener('click')  // Method Decorator
> @HostBinding('class')   // Property Decorator
> @Pipe({ name: '...' })  // Class Decorator
>
> // Angular's DI-System funktioniert NUR mit Decorators:
> // @Injectable() + @Inject() fuer Dependency Injection
> ```
>
> In React: Decorators sind weniger verbreitet. MobX 6+ hat
> optionalen Decorator-Support. Allgemein bevorzugt React
> Hooks und Higher-Order Components (HOCs) statt Decorators.

---

## Was du gelernt hast

- Decorators sind **Funktionen** die Klassen/Methoden/Properties transformieren
- Sie sind **syntaktischer Zucker** fuer Higher-Order Functions
- **Legacy Decorators** (experimentalDecorators) werden von Angular, NestJS, TypeORM verwendet
- **Stage 3 Decorators** (ab TS 5.0) sind der zukuenftige Standard
- Beide Systeme sind **NICHT kompatibel** — man muss sich fuer eines entscheiden

> 🧠 **Erklaere dir selbst:** Warum existieren zwei verschiedene
> Decorator-Systeme in TypeScript? Warum hat man nicht einfach
> das Legacy-System aktualisiert?
>
> **Kernpunkte:** TC39 hat das Design komplett geaendert (Stage 3 != Stage 1) |
> Millionen Zeilen Angular/NestJS-Code nutzen Legacy | Abrupt brechen waere
> unverantwortlich | Beide existieren parallel, Legacy wird langfristig deprecated

**Kernkonzept zum Merken:** Ein Decorator ist eine Funktion die mit
`@name` vor einer Deklaration steht. Sie kann das Verhalten aendern,
Metadaten hinzufuegen oder den Wert komplett ersetzen — alles zur
Compilezeit definiert, zur Laufzeit ausgefuehrt.

<!-- /depth -->

---

> **Pausenpunkt** -- Du verstehst die Grundlagen. Jetzt geht es ins Detail:
> Class Decorators — ganze Klassen transformieren.
>
> Weiter geht es mit: [Sektion 02: Class Decorators](./02-class-decorators.md)
