# Sektion 5: Template Literal Types

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Enums vs Union Literals](./04-enums-vs-union-literals.md)
> Naechste Sektion: [06 - Patterns und Alternativen](./06-patterns-und-alternativen.md)

---

## Was du hier lernst

- Wie TypeScript **Strings auf Type-Level** manipulieren kann
- Die eingebauten **String-Manipulation-Types**: `Uppercase`, `Lowercase`, etc.
- Wie du mit Template Literal Types **kombinatorische Explosionen** erzeugst
- Wie dieses Feature **IDE Autocomplete** revolutioniert

> **Hinweis:** Template Literal Types sind hier als **Vorschau** enthalten.
> In **Lektion 18** bekommst du eine volle, tiefe Behandlung — mit
> `infer` in Template Literals, fortgeschrittenen String-Manipulationen,
> und realen Anwendungsfällen wie tRPC-Router-Definitionen.
> Hier reicht es, das Grundkonzept zu verstehen: TypeScript kann
> Strings auf Type-Level kombinieren.

---

## String-Manipulation auf Type-Level

TypeScript kann Template Literal Syntax nicht nur fuer Werte, sondern
auch fuer **Typen** verwenden:

```typescript annotated
type World = "world";
type Greeting = `hello ${World}`;
// ^ Typ: "hello world" — ein einzelner String Literal Type

// Das Besondere: Mit Union Types entstehen ALLE Kombinationen:
type Color = "red" | "green" | "blue";
type Shade = "light" | "dark";

type ColorVariant = `${Shade}-${Color}`;
// ^ "light-red" | "light-green" | "light-blue"
//   | "dark-red" | "dark-green" | "dark-blue"
// 2 x 3 = 6 Kombinationen, automatisch!
```

> 📖 **Hintergrund: Eine einzigartige Faehigkeit**
>
> Kein anderes typisiertes Sprachsystem kann das. Java, C#, Rust, Go —
> keine dieser Sprachen kann String-Operationen auf Type-Level ausfuehren.
> TypeScript's Typsystem ist in dieser Hinsicht maechtiger als alle
> Alternativen. Das liegt daran, dass TypeScript's Typsystem
> **Turing-vollstaendig** ist — es kann theoretisch jede Berechnung
> durchfuehren, auch auf Type-Level.
>
> Template Literal Types wurden in TypeScript 4.1 (November 2020) eingefuehrt
> und waren sofort eine der meistgenutzten Features — besonders fuer
> Library-Autoren.

---

## Die eingebauten String-Manipulation-Types

TypeScript hat vier intrinsische (im Compiler eingebaute) Utility Types
fuer Strings:

```typescript annotated
type Event = "click" | "scroll" | "mousemove";

type UpperEvent = Uppercase<Event>;
// ^ "CLICK" | "SCROLL" | "MOUSEMOVE"

type LowerEvent = Lowercase<UpperEvent>;
// ^ "click" | "scroll" | "mousemove"

type CapEvent = Capitalize<Event>;
// ^ "Click" | "Scroll" | "Mousemove"

type UncapEvent = Uncapitalize<CapEvent>;
// ^ "click" | "scroll" | "mousemove"
```

### Kombination mit Template Literals

Die wahre Macht entsteht durch Kombination:

```typescript annotated
type Event = "click" | "scroll" | "mousemove";

// Event-Handler-Namen generieren:
type EventHandler = `on${Capitalize<Event>}`;
// ^ "onClick" | "onScroll" | "onMousemove"

// CSS Custom Properties:
type CSSVar = `--${string}`;
// ^ Jeder String der mit "--" anfaengt

// API-Endpunkte:
type Entity = "user" | "post" | "comment";
type ApiEndpoint = `/api/${Entity}` | `/api/${Entity}/${number}`;
// ^ "/api/user" | "/api/post" | "/api/comment"
//   | "/api/user/${number}" | "/api/post/${number}" | "/api/comment/${number}"
```

> 🧠 **Erklaere dir selbst:** Warum erzeugt `Capitalize<"click" | "scroll">`
> den Typ `"Click" | "Scroll"` und nicht `"Click" | "click" | "Scroll" | "scroll"`?
> **Kernpunkte:** Capitalize wird auf JEDES Union-Mitglied einzeln angewendet (distributiv) | Jedes Mitglied wird transformiert, nicht erweitert | Ergebnis hat gleiche Anzahl Mitglieder

---

## Praxis-Pattern: Type-Safe Event System

Ein realistisches Beispiel, das Template Literal Types nutzt:

```typescript annotated
type EventMap = {
  click: { x: number; y: number };
  scroll: { offset: number };
  keypress: { key: string };
};

// Handler-Typ aus EventMap ableiten:
type EventHandlers = {
  [K in keyof EventMap as `on${Capitalize<K & string>}`]:
    (event: EventMap[K]) => void;
};

// Ergebnis:
// {
//   onClick: (event: { x: number; y: number }) => void;
//   onScroll: (event: { offset: number }) => void;
//   onKeypress: (event: { key: string }) => void;
// }

// Die IDE schlaegt AUTOMATISCH die richtigen Handler vor!
const handlers: EventHandlers = {
  onClick: (e) => console.log(e.x, e.y),
  // ^ e hat automatisch den Typ { x: number; y: number }
  onScroll: (e) => console.log(e.offset),
  onKeypress: (e) => console.log(e.key),
};
```

> 🔍 **Tieferes Wissen: Key Remapping mit `as`**
>
> Das `as` in `[K in keyof EventMap as ...]` ist ein **Key Remapping**
> (seit TypeScript 4.1). Es erlaubt dir, die Keys eines Mapped Types
> umzubenennen. Ohne `as` wuerde der Key `K` selbst bleiben (`click`,
> `scroll`). Mit `as \`on${Capitalize<K & string>}\`` wird er zu
> `onClick`, `onScroll`, etc.
>
> Das `K & string` ist noetig, weil `keyof` auch `number` oder `symbol`
> Keys zurueckgeben kann. `& string` filtert auf String-Keys.

---

## Autocomplete: Die Killer-Feature

Template Literal Types verbessern die IDE-Erfahrung massiv:

```typescript annotated
type CSSColor = "red" | "blue" | "green" | "transparent";
type CSSUnit = "px" | "em" | "rem" | "%";

// Typ fuer CSS-Werte:
type CSSValue = `${number}${CSSUnit}` | CSSColor;

function setStyle(property: string, value: CSSValue) {
  // Wenn du hier tippst, schlaegt die IDE ALLE
  // moeglichen Werte vor: "red", "blue", "10px", "1.5em", ...
}

setStyle("width", "100px");    // OK
setStyle("color", "red");      // OK
// setStyle("width", "100pt"); // Error! "pt" ist kein CSSUnit
```

### Pattern fuer Pfad-basierte APIs

```typescript annotated
type Locale = "de" | "en" | "fr";
type Section = "home" | "about" | "contact";

type Route = `/${Locale}/${Section}`;
// ^ "/de/home" | "/de/about" | "/de/contact"
//   | "/en/home" | "/en/about" | "/en/contact"
//   | "/fr/home" | "/fr/about" | "/fr/contact"
// 3 x 3 = 9 gueltige Routen, alle mit Autocomplete!
```

> 💭 **Denkfrage:** Was passiert bei sehr grossen Union Types?
> Wenn `Color` 100 Werte hat und `Size` 50, wie viele Kombinationen
> hat `\`${Color}-${Size}\``?
>
> **Antwort:** 5000 Kombinationen! TypeScript hat ein internes Limit
> (standardmaessig 100.000 Mitglieder in einem Union Type). Bei extrem
> grossen Unions kann die Compile-Zeit explodieren. In der Praxis sollte
> man kombinatorische Template Literal Types auf vernuenftige Groessen
> beschraenken. Fuer offene Mengen ist `\`${string}-${string}\`` besser.

---

## Template Literals fuer Typ-Guards

Du kannst Template Literal Types auch fuer Laufzeit-Validierung nutzen:

```typescript annotated
type EventName = `on${string}`;

function isEventHandler(key: string): key is EventName {
  return key.startsWith("on");
}

const key = "onClick";
if (isEventHandler(key)) {
  // key hat hier den Typ EventName
  console.log(`Found event handler: ${key}`);
}
```

---

## Was du gelernt hast

- Template Literal Types erlauben **String-Manipulation auf Type-Level**
- `Uppercase<T>`, `Lowercase<T>`, `Capitalize<T>`, `Uncapitalize<T>` transformieren Strings
- Union Types erzeugen **alle Kombinationen** (distributiv)
- **Key Remapping** mit `as` in Mapped Types nutzt Template Literals
- IDE Autocomplete profitiert massiv von praezisen Template Literal Types
- Bei sehr grossen Unions auf **Performance achten**

> 🧠 **Erklaere dir selbst:** Warum sind Template Literal Types besonders
> wertvoll fuer Library-Autoren? Denke an Frameworks wie React oder Express.
> **Kernpunkte:** Automatische Event-Handler-Typen | Typsichere Routen | Autocomplete fuer Konfiguration | Weniger manuelle Typ-Definitionen

**Kernkonzept zum Merken:** Template Literal Types sind String-Algebra auf Type-Level. Sie machen TypeScript's Typsystem maechtiger als das jeder anderen typisierten Sprache — und verbessern gleichzeitig die Developer Experience durch Autocomplete.

> ⚡ **In deinem Angular-Projekt:**
>
> ```typescript
> // Typsichere i18n-Schluessel mit Template Literal Types:
> type Locale = "de" | "en" | "fr";
> type Section = "auth" | "dashboard" | "settings";
> type I18nKey = `${Section}.${string}`;
>
> // Angular TranslateService wird typsicher:
> @Injectable({ providedIn: "root" })
> export class TypedTranslateService {
>   get(key: I18nKey): string {
>     return this.translate.instant(key);
>   }
> }
>
> // Nutzung: Nur gueltige Key-Prefixe werden akzeptiert
> this.typedTranslate.get("auth.login");        // OK
> this.typedTranslate.get("dashboard.title");   // OK
> this.typedTranslate.get("unknown.key");       // Error!
>
> // In React: Event-Handler-Typen fuer Custom Hooks
> type FormEvent = "change" | "blur" | "focus";
> type FormHandler = `on${Capitalize<FormEvent>}`;
> // ^ "onChange" | "onBlur" | "onFocus" — perfekt fuer Props-Typen!
> ```

> **Experiment:** Probiere folgendes im TypeScript Playground aus:
> ```typescript
> // CSS Custom Properties — nur gueltige Namen erlaubt:
> type CSSCustomProperty = `--${string}`;
>
> function setCSSVar(property: CSSCustomProperty, value: string) {
>   document.documentElement.style.setProperty(property, value);
> }
>
> setCSSVar("--primary-color", "#3498db");   // OK
> setCSSVar("--font-size-lg", "1.25rem");    // OK
> setCSSVar("primary-color", "#3498db");     // Error! Fehlendes "--"
>
> // Kombinatorik mit Union Types:
> type Color = "primary" | "secondary" | "danger";
> type CSSColorVar = `--color-${Color}`;
> // ^ "--color-primary" | "--color-secondary" | "--color-danger"
>
> // Hover ueber CSSColorVar — wie viele Varianten gibt es?
> ```
> Erstelle zusaetzlich `type CSSSpacingVar = \`--spacing-${"xs" | "sm" | "md" | "lg" | "xl"}\``.
> Wie viele gueltige Werte hat dieser Typ?

---

> **Pausenpunkt** — Template Literal Types sind eines der fortgeschrittensten
> Features in TypeScript. In der letzten Sektion schauen wir uns
> fortgeschrittene Patterns und Alternativen an.
>
> Weiter geht es mit: [Sektion 06: Patterns und Alternativen](./06-patterns-und-alternativen.md)
