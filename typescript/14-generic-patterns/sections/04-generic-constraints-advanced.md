# Sektion 4: Advanced Generic Constraints

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Generic Higher-Order Functions](./03-generic-hof.md)
> Naechste Sektion: [05 - Real-World Generics](./05-real-world-generics.md)

---

## Was du hier lernst

- Conditional Constraints: Typen abhaengig von Bedingungen einschraenken
- Recursive Constraints: Typen die sich selbst referenzieren
- `const` Type Parameters (TS 5.0): Literal-Inferenz erzwingen ohne `as const`
- Mapped Constraints: Keys und Values abhaengig voneinander verknuepfen

---

## Hintergrund: Ryan Cavanaugh und der Conditional Types Moment

Es war 2018, TypeScript 2.8. Ryan Cavanaugh, damaliger Engineering Lead des
TypeScript-Teams, kueendigte in einem GitHub-Issue etwas an, das die Community
sofort aufhorchen liess: Conditional Types. Die Reaktion war eine Mischung
aus Begeisterung und Schrecken — das Typsystem war plotzlich Turing-vollstaendig.

Mit Conditional Types (`T extends string ? X : Y`) konnten Typen erstmals
BEDINGTE Entscheidungen treffen. Das ermoeglichte Utility Types wie `ReturnType<T>`,
`Parameters<T>`, `Awaited<T>` — alles erst durch Conditional Types moeglich.
Die gesamte TypeScript-Standardbibliothek wurde in den Monaten danach umgeschrieben,
um von diesem Feature zu profitieren.

Diese Sektion zeigt, wie du dasselbe in eigenen Abstraktionen nutzt.

---

## Conditional Constraints

In Lektion 13 hast du einfache Constraints kennengelernt: `T extends string`.
Jetzt verbinden wir Constraints mit **Conditional Types** — der Rueckgabetyp
haengt vom Input-Typ ab:

```typescript annotated
type ProcessResult<T> = T extends string ? string : number;

function processValue<T extends string | number>(
  value: T
): ProcessResult<T> {
  if (typeof value === "string") {
    return value.toUpperCase() as ProcessResult<T>;
  }
  return (value * 2) as ProcessResult<T>;
}

const s = processValue("hello"); // Typ: string
const n = processValue(42);       // Typ: number
```

### Bedingte Pflichtfelder

```typescript annotated
type WithTimestamps<T, HasTS extends boolean> =
  HasTS extends true
    ? T & { createdAt: Date; updatedAt: Date }
    : T;

function createRecord<T extends object, H extends boolean>(
  data: T,
  addTimestamps: H
): WithTimestamps<T, H> {
  if (addTimestamps) {
    return {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as WithTimestamps<T, H>;
  }
  return data as WithTimestamps<T, H>;
}

const withTs = createRecord({ name: "Alice" }, true);
// ^ Typ: { name: string } & { createdAt: Date; updatedAt: Date }
console.log(withTs.createdAt); // OK

const withoutTs = createRecord({ name: "Bob" }, false);
// ^ Typ: { name: string }
// withoutTs.createdAt; // Error! Property existiert nicht
```

> 🧠 **Erklaere dir selbst:** Warum braucht man `as WithTimestamps<T, H>`
> im Funktionskoerper? Kann TypeScript das nicht automatisch ableiten?
> **Kernpunkte:** TypeScript kann Conditional Types nicht durch Control Flow narrowen | if(addTimestamps) sagt dem Compiler NICHT dass H = true | Der Cast ueberbrueckt diese Einschraenkung

> 💭 **Denkfrage:** Conditional Types koennen distributiv sein: wenn `T` eine
> Union ist, wird der Conditional Type auf JEDEN Member der Union angewendet.
> `ProcessResult<string | number>` ergibt also `string | number`. Was wuere
> das Ergebnis von `ProcessResult<string | boolean>`? Ueberlege es zuerst,
> dann probiere es im TypeScript Playground aus.

> **Experiment:** Probiere folgendes im TypeScript Playground aus:
> ```typescript
> type IsArray<T> = T extends any[] ? true : false;
>
> type A = IsArray<string[]>;    // Was ist der Typ?
> type B = IsArray<number>;      // Was ist der Typ?
> type C = IsArray<string | string[]>; // Ueberraschung: was passiert hier?
>
> // Bonus: Wie kannst du den Elementtyp eines Arrays extrahieren?
> type ElementType<T> = T extends (infer U)[] ? U : never;
> type D = ElementType<string[]>;  // string
> type E = ElementType<number[]>;  // number
> type F = ElementType<string>;    // never
> ```
> Das `infer`-Keyword ist die Luecke zwischen Conditional Types und
> Typ-Extraktion. Du wirst es in L15 (Utility Types) tiefer kennenlernen.

---

## Recursive Constraints

Manche Datenstrukturen referenzieren sich selbst. Das klassische Beispiel:
Baeume.

```typescript annotated
interface TreeNode<T> {
  value: T;
  children: TreeNode<T>[];
}

function findInTree<T>(
  node: TreeNode<T>,
  predicate: (value: T) => boolean
): T | undefined {
  if (predicate(node.value)) return node.value;

  for (const child of node.children) {
    const found = findInTree(child, predicate);
    if (found !== undefined) return found;
  }
  return undefined;
}

const fileTree: TreeNode<string> = {
  value: "/",
  children: [
    {
      value: "/src",
      children: [
        { value: "/src/index.ts", children: [] },
        { value: "/src/utils.ts", children: [] },
      ],
    },
    { value: "/package.json", children: [] },
  ],
};

const found = findInTree(fileTree, v => v.includes("utils"));
// ^ Typ: string | undefined
```

### DeepPartial — Rekursiver Utility Type

Ein haeufig benoetigter Utility Type, der alle Properties auf jeder Ebene
optional macht:

```typescript annotated
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? DeepPartial<T[K]>
    : T[K];
};

interface Config {
  server: {
    host: string;
    port: number;
    ssl: { enabled: boolean; cert: string };
  };
  database: { url: string; poolSize: number };
}

function mergeConfig(base: Config, overrides: DeepPartial<Config>): Config {
  return JSON.parse(JSON.stringify({ ...base, ...overrides }));
}

// Nur ein einziges verschachteltes Feld aendern:
mergeConfig(defaultConfig, {
  server: { ssl: { enabled: true } }
  // host, port, cert, database — alles optional!
});
```

> **Wie liest man rekursive Typen?** Starte beim aeusseren Typ.
> `DeepPartial<Config>` macht die erste Ebene optional. Fuer jede Property
> die `object` ist, wird `DeepPartial` ERNEUT angewendet — unendlich tief.

> 📖 **Hintergrund: Rekursive Typen und der Compiler-Tiefenlimit**
>
> TypeScript erlaubt rekursive Typen, hat aber einen eingebauten Schutzmechanismus:
> Bei zu tiefer Rekursion (normalerweise > 50 Ebenen) bricht der Compiler mit
> "Type instantiation is excessively deep" ab. Das ist kein Bug — es verhindert
> Endlosschleifen im Typsystem. In der Praxis sind echter Daten selten tiefer
> als 5-10 Ebenen. `DeepPartial<Config>` ist vollkommen sicher.

> ⚡ **Angular-Bezug:** In Angular-Projekten mit komplexen Konfigurationsobjekten
> (z.B. Chart-Bibliotheken, Editor-Configs) wirst du `DeepPartial<T>` haeufig
> benoetigen. Statt `Partial<ChartConfig>` (nur eine Ebene optional) gibt
> `DeepPartial<ChartConfig>` dir die Freiheit, nur das zu ueberschreiben, was
> du aendern willst — egal wie tief es verschachtelt ist.

---

## const Type Parameters (TypeScript 5.0)

Eines der nuetzlichsten Features seit TS 5.0: `const` vor einem Typparameter
erzwingt Literal-Inferenz — ohne dass der Aufrufer `as const` schreiben muss.

### Das Problem ohne const

```typescript annotated
function getRoutes<T extends readonly string[]>(routes: T): T {
  return routes;
}

const routes1 = getRoutes(["home", "about", "contact"]);
// ^ Typ: string[] — die konkreten Werte sind VERLOREN!
```

### Die Loesung: const vor dem Typparameter

```typescript annotated
function getRoutes<const T extends readonly string[]>(routes: T): T {
  return routes;
}

const routes2 = getRoutes(["home", "about", "contact"]);
// ^ Typ: readonly ["home", "about", "contact"] — EXAKT!
```

`const T` sagt dem Compiler: "Inferiere den praezisesten Typ — als haette
der Aufrufer `as const` geschrieben."

### Praktisches Beispiel

```typescript annotated
function defineRoutes<const T extends Record<string, string>>(routes: T): T {
  return routes;
}

const routes = defineRoutes({
  home: "/",
  about: "/about",
  contact: "/contact",
});
// ^ Typ: { readonly home: "/"; readonly about: "/about"; readonly contact: "/contact" }

type RouteName = keyof typeof routes;
// ^ "home" | "about" | "contact" — nicht string!
```

### Wann const Type Parameters verwenden?

| Situation | const noetig? |
|-----------|---------------|
| Du brauchst Literal Types in der Rueckgabe | Ja |
| Du baust eine Config/Definition API | Ja |
| Du verarbeitest den Wert generisch (identity) | Nein |
| Primitive Werte (string, number) | Nicht noetig — schon literal |

> ⚡ **React-Bezug:** In React-Projekten mit Routing (React Router, TanStack
> Router) wirst du `defineRoutes`-aehnliche Patterns sehen. TanStack Router
> nutzt genau dieses Feature: Die Route-Definitionen werden als Literal Types
> inferiert, sodass `<Link to="/about">` zur Compile-Zeit geprueft wird.
> Mit `const T` braucht der Aufrufer kein `as const` zu schreiben.

---

## Mapped Constraints: Keys und Values verknuepfen

Wenn Key und Value zusammenpassen muessen, brauchst du eine Type Map:

```typescript annotated
type EventMap = {
  click: { x: number; y: number };
  keydown: { key: string; code: number };
  resize: { width: number; height: number };
};

function on<K extends keyof EventMap>(
  event: K,
  handler: (data: EventMap[K]) => void
): void {
  // Registration...
}

on("click", (data) => {
  console.log(data.x, data.y);
  // data hat Typ { x: number; y: number } — automatisch!
});

on("keydown", (data) => {
  console.log(data.key);
  // data hat Typ { key: string; code: number }
});
```

> **Warum funktioniert das?** Wenn TypeScript `K` als `"click"` inferiert,
> wird `EventMap[K]` zu `EventMap["click"]` aufgeloest = `{ x: number; y: number }`.
> Key und Handler sind dadurch IMMER konsistent.

> ⚡ **Angular-Bezug:** Das Mapped Constraint Pattern liegt dem Angular
> `Output`-System und dem neuen Signal-System zugrunde. Wenn du
> `@Output() userSelected = new EventEmitter<User>()` schreibst, ist
> `EventEmitter<T>` genau dieses Pattern: der Event-Name ist durch das
> Property implizit definiert, der Payload-Typ durch das Generic `<T>`.
> Mit Signals wirst du `signal<User[]>([])` sehen — wieder dasselbe Muster.

---

## Was du gelernt hast

- Conditional Constraints (`T extends string ? X : Y`) machen den Rueckgabetyp abhaengig vom Input
- Rekursive Typen wie `DeepPartial<T>` traversieren verschachtelte Strukturen beliebiger Tiefe
- `const T` in TS 5.0 erzwingt Literal-Inferenz ohne `as const` beim Aufrufer
- Mapped Constraints verknuepfen Key und Value-Typ — ein falscher Event-Name ist ein Compile-Fehler

**Kernkonzept:** Fortgeschrittene Constraints sind nicht mehr nur Einschraenkungen
— sie sind Beschreibungen von Beziehungen zwischen Typen. Wenn Key und Payload
miteinander verknuepft sind, kann kein Tippfehler mehr unbemerkt bleiben.
Das ist der Unterschied zwischen einem einfachen Typsystem und einem Typsystem,
das deine Architektur versteht.

---

> **Pausenpunkt** — Advanced Constraints erweitern dein Repertoire erheblich.
> Jetzt kommt der Praxis-Test: echte Architektur-Patterns.
>
> Weiter geht es mit: [Sektion 05 — Real-World Generics](./05-real-world-generics.md)
