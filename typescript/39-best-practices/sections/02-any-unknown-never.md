# Sektion 2: any vs unknown vs never — Der Entscheidungsbaum

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Die 10 haeufigsten Fehler](./01-haeufigste-fehler.md)
> Naechste Sektion: [03 - Overengineering vermeiden](./03-overengineering-vermeiden.md)

---

## Was du hier lernst

- Den **praezisen Unterschied** zwischen `any`, `unknown` und `never` in jeder Situation
- Einen **Entscheidungsbaum** den du bei jedem Code Review anwenden kannst
- Warum `unknown` in **95% der Faelle** die richtige Wahl ist wenn du `any` schreiben willst
- Die verbleibenden **5%** wo `any` tatsaechlich gerechtfertigt ist

---

## Die drei Spezialtypen im Vergleich

Du kennst diese Typen seit L02. Jetzt, mit 39 Lektionen Erfahrung,
verstehst du sie tiefer:

```typescript annotated
// any: Deaktiviert das Typsystem KOMPLETT
let a: any = "hello";
a.toFixed(2);    // Kein Fehler — obwohl string kein toFixed hat
a();              // Kein Fehler — obwohl string keine Funktion ist
a.foo.bar.baz;   // Kein Fehler — alles geht durch
// ^ any ist bidirektional: Alles kann any werden, any kann alles werden

// unknown: Sicher — erzwingt Pruefung vor Zugriff
let u: unknown = "hello";
// u.toFixed(2);  // FEHLER: Object is of type 'unknown'
if (typeof u === "string") {
  u.toUpperCase();  // OK — nach Narrowing
}
// ^ unknown ist der Top-Type: Alles kann unknown werden, aber
//   unknown kann NICHTS werden ohne Pruefung

// never: Der unmoegliche Typ — kein Wert existiert
function crash(): never { throw new Error("!"); }
// let n: never = "x";  // FEHLER: Nichts kann never zugewiesen werden
// ^ never ist der Bottom-Type: never kann zu allem zugewiesen werden,
//   aber nichts kann never werden
```

> 📖 **Hintergrund: Warum TypeScript drei "Spezialtypen" braucht**
>
> In der mathematischen Typentheorie gibt es den Top-Type (alle
> Werte) und den Bottom-Type (kein Wert). TypeScript hat beides:
> `unknown` (Top) und `never` (Bottom). `any` ist keines von
> beidem — es ist ein **Opt-out** aus dem Typsystem. Anders
> Hejlsberg fuehrte `any` ein weil TypeScript ein **Superset von
> JavaScript** sein sollte: Bestehender JS-Code musste ohne
> Aenderungen kompilierbar sein. `unknown` kam erst in TS 3.0
> (2018) als sichere Alternative. Heute gibt es keinen Grund mehr
> `any` zu verwenden — ausser in den wenigen Faellen die wir
> gleich besprechen.

---

## Der Entscheidungsbaum

```
Brauchst du einen Typ fuer "irgendwas"?
│
├── Daten von aussen (API, JSON.parse, User-Input)?
│     └── unknown ✓
│         (Dann: Narrowing oder Zod/io-ts zur Validierung)
│
├── Generischer Container (Box<T>, Result<T>)?
│     └── Generic T ✓
│         (Dann: T wird beim Aufruf konkretisiert)
│
├── Funktion die nie zurueckkehrt (throw, process.exit)?
│     └── never ✓
│
├── Callback mit beliebigem Typ den du nie liest?
│     └── unknown ✓
│         (z.B. function log(msg: unknown): void)
│
├── TypeScript-Migration (JS → TS, Schritt fuer Schritt)?
│     └── any (temporaer!) ✓
│         (Mit TODO-Kommentar und ESLint-Ausnahme)
│
├── Typ-System-Grenze (z.B. Type Guard Return)?
│     └── any in EINER Zeile ✓
│         (z.B. return value as any as TargetType)
│
└── Sonst?
      └── unknown ✓
          (Im Zweifel: unknown. Immer.)
```

> 🧠 **Erklaere dir selbst:** Warum ist `unknown` in fast allen
> Faellen besser als `any`? Was genau erzwingt `unknown` das `any`
> nicht tut?
> **Kernpunkte:** unknown erzwingt Narrowing vor Zugriff | any
> erlaubt alles ohne Pruefung | unknown-Fehler sind Compile-Fehler |
> any-Fehler sind Runtime-Crashes | unknown ist "sicher unwissend",
> any ist "unsicher gleichgueltig"

---

## Die 5%: Wann any gerechtfertigt ist

### Fall 1: Typ-System-Grenzen (Double Cast)

```typescript annotated
// Manchmal weisst du mehr als der Compiler:
function convertLegacy(old: OldFormat): NewFormat {
  // OldFormat und NewFormat sind nicht direkt kompatibel,
  // aber du weisst dass die Daten passen:
  return old as any as NewFormat;
  // ^ "Double Cast" — einzige Stelle wo any akzeptabel ist
  // ^ Dokumentiere WARUM mit einem Kommentar!
}
```

### Fall 2: Generische Typmanipulation in Libraries

```typescript annotated
// In Library-Code wo man Typen "biegt":
function createProxy<T extends object>(target: T): T {
  return new Proxy(target, {
    get(obj: any, prop: string) {
      // any hier ist noetig weil Proxy's Handler-Typen zu restriktiv sind
      return Reflect.get(obj, prop);
    },
  }) as T;
  // ^ Das Ergebnis hat den korrekten Typ T — any ist nur intern
}
```

### Fall 3: Temporaere Migration

```typescript annotated
// Waehrend JS→TS Migration:
// TODO: Typ hinzufuegen wenn UserService migriert ist
function processUser(user: any): void {  // eslint-disable-line @typescript-eslint/no-explicit-any
  // Legacy-Code — wird spaeter typisiert
}
```

> ⚡ **Framework-Bezug:** In Angular-Projekten findest du `any` oft
> in Legacy-Services die noch nicht vollstaendig migriert sind.
> Die Regel: `any` IMMER mit einem `// TODO: Type this` Kommentar
> versehen. In React-Projekten taucht `any` oft bei Event-Handlern
> auf: `onChange={(e: any) => ...}` — hier ist die korrekte Loesung
> `React.ChangeEvent<HTMLInputElement>`.

---

## never in der Praxis

`never` ist nicht nur fuer Exhaustive Checks. Es hat drei Hauptrollen:

```typescript annotated
// Rolle 1: Exhaustive Check
type Shape = "circle" | "square" | "triangle";
function area(s: Shape): number {
  switch (s) {
    case "circle": return Math.PI;
    case "square": return 1;
    case "triangle": return 0.5;
    default: const _: never = s; return _;
    // ^ Compiler-Fehler wenn ein Case fehlt
  }
}

// Rolle 2: Unmoegliche Funktion
function throwError(msg: string): never {
  throw new Error(msg);
}
// Kann ueberall eingesetzt werden wo ein Wert erwartet wird:
const value: string = condition ? "ok" : throwError("not ok");
// ^ Funktioniert weil never jedem Typ zuweisbar ist

// Rolle 3: Typ-Level-Filterung
type NonString<T> = T extends string ? never : T;
type Result = NonString<string | number | boolean>;
// ^ number | boolean (string wurde zu never → verschwindet aus der Union)
```

> 💭 **Denkfrage:** Wenn `never` der "leere Typ" ist und kein Wert
> `never` hat, warum kann man `never` dann einem `string` zuweisen?
>
> **Antwort:** Weil die leere Menge Teilmenge jeder Menge ist
> (Mengenlehre). "Alle Elemente der leeren Menge sind Strings" ist
> **vacuously true** — es gibt keine Gegenbeispiele weil es keine
> Elemente gibt. Das ist auch der Grund warum `never` in Unions
> verschwindet: `string | never = string`.

---

## Experiment: any-Audit

Fuehre ein any-Audit an deinem Projekt durch:

```typescript
// Schritt 1: Zaehle alle 'any' in deinem Projekt
// Terminal: grep -r ": any" --include="*.ts" | wc -l

// Schritt 2: Kategorisiere jedes 'any':
// - Kann es 'unknown' sein? (meistens ja)
// - Ist es ein Double Cast? (akzeptabel mit Kommentar)
// - Ist es Migration-Legacy? (TODO setzen)
// - Ist es unnoetig? (entfernen)

// Schritt 3: Ersetze 5 'any' durch 'unknown' und fixe die Fehler
// Du wirst sehen: Die Fixes sind meistens Type Guards oder Narrowing —
// Code der sowieso noetig ist fuer korrekte Fehlerbehandlung.

// Bonus: Aktiviere "@typescript-eslint/no-explicit-any": "warn"
// in deiner ESLint-Config.
```

---

## Was du gelernt hast

- **any** deaktiviert das Typsystem komplett und ist ansteckend — fast nie die richtige Wahl
- **unknown** ist der sichere Top-Type — erzwingt Narrowing vor Zugriff
- **never** ist der Bottom-Type — fuer Exhaustive Checks, unmoeliche Funktionen und Typ-Filterung
- Der **Entscheidungsbaum**: Im Zweifel immer `unknown`
- **5% der Faelle** wo `any` akzeptabel ist: Double Cast, Library-Internals, temporaere Migration

> 🧠 **Erklaere dir selbst:** Jemand sagt: "any und unknown sind
> dasselbe — bei beiden kann man jeden Wert zuweisen." Was antwortest
> du? Was ist der entscheidende Unterschied?
> **Kernpunkte:** Zuweisung AN den Typ: Beide akzeptieren alles |
> Zugriff AUF den Typ: unknown erzwingt Pruefung, any nicht |
> any ist bidirektional unsicher, unknown ist unidirektional sicher |
> Der Unterschied zeigt sich beim LESEN, nicht beim SCHREIBEN

**Kernkonzept zum Merken:** unknown = "Ich weiss nicht was das ist, also pruefe ich." any = "Ich weiss nicht was das ist, also ignoriere ich es." Der Unterschied ist Sicherheit vs. Bequemlichkeit.

---

> **Pausenpunkt** — Du hast den Entscheidungsbaum verinnerlicht.
> Naechster Schritt: Wann Typen zu viel des Guten sind.
>
> Weiter geht es mit: [Sektion 03: Overengineering vermeiden](./03-overengineering-vermeiden.md)
