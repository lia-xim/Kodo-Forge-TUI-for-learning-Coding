# Sektion 4: Advanced Generic Constraints

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Generic Higher-Order Functions](./03-generic-hof.md)
> Naechste Sektion: [05 - Real-World Generics](./05-real-world-generics.md)

---

## Was du hier lernst

- Conditional Constraints: Typen abhaengig von Bedingungen einschraenken
- Recursive Constraints: Typen die sich selbst referenzieren
- const Type Parameters (TS 5.0): Literal-Inferenz erzwingen
- Mapped Constraints: Keys und Values abhaengig voneinander

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

---

## Zusammenfassung

| Constraint-Art | Einsatz | Beispiel |
|----------------|---------|----------|
| Conditional | Rueckgabetyp abhaengig vom Input | `T extends string ? X : Y` |
| Recursive | Baumartige Strukturen | `TreeNode<T>`, `DeepPartial<T>` |
| const T (TS 5.0) | Literal-Inferenz erzwingen | `<const T>` statt `as const` |
| Mapped | Key-Value-Beziehungen | `EventMap[K]` |

---

> **Pause moeglich!** Advanced Constraints erweitern dein Repertoire erheblich.
> Jetzt kommt der Praxis-Test: echte Architektur-Patterns.
>
> Naechste Sektion: [05 - Real-World Generics](./05-real-world-generics.md)
