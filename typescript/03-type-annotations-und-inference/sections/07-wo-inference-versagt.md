# Sektion 7: Wo Inference versagt

**Geschaetzte Lesezeit:** ~10 Minuten

## Was du hier lernst

- Die sechs systematischen Stellen, an denen Inference unzureichende Typen liefert
- **Warum** sie dort versagt -- nicht nur dass sie es tut
- Design-Entscheidungen hinter `Object.keys()` und `JSON.parse()`
- Die "Goldenen Regeln" und das Gesamtbild: Wann annotieren, wann inferieren

---

## Denkfragen fuer diese Sektion

1. **Warum ist `Object.keys(user) as (keyof typeof user)[]` technisch unsicher?**
2. **Warum gibt `JSON.parse()` den Typ `any` zurueck -- und warum kann TypeScript das nicht besser machen?**

---

## Inference versagt systematisch -- nicht zufaellig

Wenn du die bisherigen Sektionen verstanden hast, kannst du die Stellen, an denen Inference versagt, **vorhersagen**. Inference braucht **Information** -- und es gibt genau definierte Stellen, an denen diese Information fehlt.

### Die Analogie: Der Detektiv ohne Hinweise

Erinnere dich an den Detektiv aus Sektion 1. Er schliesst aus Hinweisen -- aber was, wenn es keine gibt?

- **Leeres Array** = Leerer Tatort. Keine Spuren, keine Schlussfolgerung moeglich.
- **JSON.parse** = Versiegelter Umschlag. Der Detektiv weiss nicht, was drin ist, bis er ihn oeffnet -- aber das passiert erst zur Laufzeit.
- **Separater Callback** = Zeuge in einem anderen Raum. Der Detektiv kann ihn nicht befragen, weil er nur den aktuellen Raum sieht (lokale Analyse).

---

## Fall 1: Leere Arrays

```typescript
const items = [];        // Typ: any[]  <-- gefaehrlich!
items.push("hello");     // Kein Fehler
items.push(42);          // Kein Fehler -- alles geht rein!
```

**Warum?** TypeScript hat keine Elemente, aus denen es den Typ ableiten koennte. Ein leeres Array ist ein "Tatort ohne Spuren".

**Loesung: Immer annotieren.**

```typescript
const items: string[] = [];
items.push("hello");     // OK
items.push(42);          // FEHLER -- genau was wir wollen
```

> **Tieferes Wissen:** Technisch inferiert TypeScript neuere Versionen bei `const items = []` den Typ `any[]` nur, wenn `noImplicitAny` ausgeschaltet ist. Mit `noImplicitAny: true` (empfohlen!) bekommst du einen Fehler: "Variable 'items' implicitly has type 'any[]'". In der `strict`-Mode-Konfiguration ist `noImplicitAny` automatisch aktiviert. Das heisst: Mit korrekter Konfiguration **zwingt** TypeScript dich, leere Arrays zu annotieren. Wenn du keinen Fehler siehst, pruefe deine `tsconfig.json`.

---

## Fall 2: Object.keys() -- eine bewusste Design-Entscheidung

```typescript
const user = { name: "Max", age: 30 };
const keys = Object.keys(user);
// Typ: string[]  --  NICHT ("name" | "age")[]!
```

Das ueberrascht fast jeden TypeScript-Entwickler. Warum gibt `Object.keys()` nicht die konkreten Keys zurueck?

> **Hintergrund:** Das ist eine der meistdiskutierten Design-Entscheidungen in TypeScript. Der Grund liegt im **strukturellen Typ-System**. In TypeScript kann ein Objekt **mehr Properties** haben als sein Typ deklariert:

```typescript
interface User {
  name: string;
  age: number;
}

function processUser(user: User) {
  const keys = Object.keys(user);
  // keys koennte ["name", "age", "email", "lastLogin", ...] enthalten!
  // Weil das Objekt zur Laufzeit mehr Properties haben kann
}

// Beweis:
const extendedUser = { name: "Max", age: 30, email: "max@example.com" };
processUser(extendedUser);  // Erlaubt! Strukturelle Typisierung.
// Object.keys() gibt jetzt ["name", "age", "email"] zurueck -- 3 Keys, nicht 2!
```

Wenn `Object.keys()` den Typ `(keyof User)[]` haette, waere das **unsicher**, weil es Keys geben kann, die nicht in `User` deklariert sind. TypeScript waehlt hier Sicherheit ueber Praezision.

**Workaround (mit Vorsicht):**

```typescript
// Nur verwenden, wenn du SICHER bist, dass keine Extra-Properties existieren
const keys = Object.keys(user) as (keyof typeof user)[];
// keys: ("name" | "age")[]
```

> **Denkfrage:** Warum ist `Object.keys(user) as (keyof typeof user)[]` **technisch unsicher**? Denke an das `extendedUser`-Beispiel oben. Der Cast luegt -- es behauptet, die Keys seien nur "name" und "age", aber zur Laufzeit koennten es mehr sein.

---

## Fall 3: Separate Callback-Definitionen

```typescript
const handler = (event) => { ... };  // event: any -- kein Kontext!
document.addEventListener("click", handler);
```

**Warum?** Du hast das in Sektion 5 gelernt: TypeScript analysiert lokal. Wenn der Callback separat definiert wird, fehlt die Contextual-Typing-Information.

**Loesung: Annotieren oder inline verwenden.**

```typescript
// Option 1: Inline (Contextual Typing funktioniert)
document.addEventListener("click", (event) => { /* event: MouseEvent */ });

// Option 2: Separat mit Annotation
const handler = (event: MouseEvent) => { /* ... */ };
```

---

## Fall 4: JSON.parse() und fetch().json()

```typescript
const data = JSON.parse('{"name": "Max"}');
// Typ: any  --  TS weiss nicht, was im JSON steckt!
```

**Warum?** JSON ist ein **Runtime-Format**. TypeScript kann zur Compile-Zeit nicht wissen, was in einem JSON-String steht. Das ist eine fundamentale Grenze: Der Typ-Checker arbeitet zur Compile-Zeit, JSON wird zur Laufzeit geparst.

**Loesung -- drei Stufen:**

```typescript
// Stufe 1: Einfache Annotation (Vertrauensbasis)
interface User { name: string; age: number; }
const data: User = JSON.parse(responseBody);
// Einfach, aber: Wenn der JSON nicht der erwarteten Struktur entspricht,
// merkt TypeScript das NICHT. Der Fehler zeigt sich erst zur Laufzeit.

// Stufe 2: Generic bei fetch (Angular HttpClient)
// Angular's HttpClient hat Generics eingebaut:
this.http.get<User[]>('/api/users').subscribe(users => {
  // users ist User[] -- aber nur weil wir es dem HttpClient gesagt haben
});

// Stufe 3: Runtime-Validierung (die sicherste Option)
import { z } from "zod";

const UserSchema = z.object({
  name: z.string(),
  age: z.number(),
});

const data = UserSchema.parse(JSON.parse(responseBody));
// data ist GARANTIERT { name: string; age: number }
// Wenn der JSON nicht passt, fliegt eine Exception -- zur Laufzeit!
```

> **Praxis-Tipp:** In Angular-Projekten nutzt du fast immer den `HttpClient` mit Generics (`this.http.get<T>`). Das ist Stufe 2 -- ausreichend fuer die meisten Faelle, weil du die API kontrollierst. Fuer externe APIs oder User-Input ist Stufe 3 (zod, io-ts, valibot) empfehlenswert.

---

## Fall 5: Ueberkomplexe Return-Types

```typescript
function parseInput(input: string) {
  if (input === "null") return null;
  if (input === "undefined") return undefined;
  if (input === "true") return true;
  if (input === "false") return false;
  if (!isNaN(Number(input))) return Number(input);
  return input;
}
// Return-Typ: string | number | boolean | null | undefined
// Ist das gewollt? Fast sicher nicht.
```

**Warum ist das ein Problem?** Der Aufrufer muss mit **allen** moeglichen Typen umgehen, was zu einer Kaskade von Narrowing-Checks fuehrt:

```typescript
const result = parseInput(userInput);
// Jetzt brauchst du:
if (result === null) { /* ... */ }
else if (result === undefined) { /* ... */ }
else if (typeof result === "boolean") { /* ... */ }
else if (typeof result === "number") { /* ... */ }
else { /* result ist string */ }
```

**Loesung: Return-Typ annotieren oder Funktion vereinfachen.**

```typescript
// Option 1: Annotieren -- dokumentiert die Intention
function parseInput(input: string): string | number | null {
  if (input === "null") return null;
  if (!isNaN(Number(input))) return Number(input);
  return input;
}

// Option 2: Discriminated Union -- noch besser
type ParseResult =
  | { type: "string"; value: string }
  | { type: "number"; value: number }
  | { type: "null" };

function parseInput(input: string): ParseResult {
  if (input === "null") return { type: "null" };
  const num = Number(input);
  if (!isNaN(num)) return { type: "number", value: num };
  return { type: "string", value: input };
}
```

---

## Fall 6: Promise-Chains und async/await

```typescript
async function loadData() {
  const response = await fetch("/api/users");
  if (!response.ok) return null;
  const data = await response.json();  // Typ: any!
  return data;
}
// Return: Promise<any>  --  die Annotation bei .json() fehlt

// Loesung:
async function loadData(): Promise<User[] | null> {
  const response = await fetch("/api/users");
  if (!response.ok) return null;
  const data: User[] = await response.json();
  return data;
}
```

> **Praxis-Tipp:** In Angular nutzt du den HttpClient statt fetch, und dort hast du Generics:
> ```typescript
> async loadData(): Promise<User[] | null> {
>   return firstValueFrom(
>     this.http.get<User[]>('/api/users').pipe(
>       catchError(() => of(null))
>     )
>   );
> }
> ```

---

## Die "Goldenen Regeln" -- das Gesamtbild

Nach sieben Sektionen hast du das vollstaendige Bild. Hier sind die Regeln, die dein gesamtes Annotations-Verhalten leiten:

### Das Leitprinzip: "Annotate at boundaries, infer inside"

```
  +---------------------------------------------------------+
  |  AUSSEN: Annotieren                                     |
  |                                                         |
  |  - Funktionsparameter                                   |
  |  - Exportierte Return-Types                             |
  |  - API-Responses / JSON.parse                           |
  |  - Leere Arrays                                         |
  |  - Variablen ohne Initialwert                           |
  |                                                         |
  |  +---------------------------------------------------+  |
  |  |  INNEN: Inferieren lassen                         |  |
  |  |                                                   |  |
  |  |  - Lokale Variablen mit Wert                      |  |
  |  |  - Callback-Parameter (Contextual Typing)         |  |
  |  |  - Zwischenergebnisse                             |  |
  |  |  - const-Werte                                    |  |
  |  +---------------------------------------------------+  |
  |                                                         |
  |  SPEZIAL: satisfies / as const                          |
  |  - Config-Objekte: satisfies                            |
  |  - Enum-Ersatz: as const                                |
  |  - Maximale Praezision: as const satisfies              |
  +---------------------------------------------------------+
```

### Die neun goldenen Regeln

1. **Parameter immer annotieren** -- TS kann sie nicht infern
2. **Exportierte Return-Types annotieren** -- bessere Fehlermeldungen, stabile API
3. **Lokale Variablen mit Wert NICHT annotieren** -- Inference ist korrekt und praeziser
4. **Callback-Parameter NICHT annotieren** -- Contextual Typing uebernimmt
5. **`as const` nutzen** wenn du Literal-Typen brauchst
6. **Variablen ohne Initialwert immer annotieren** -- sonst `any`
7. **`satisfies` nutzen** wenn du Validierung UND praezise Typen willst
8. **Leere Arrays immer annotieren** -- sonst `any[]`
9. **Externe Daten (JSON.parse, API-Responses) immer annotieren** -- TS kann den Laufzeit-Typ nicht kennen

---

## Haeufige Anti-Patterns

### Anti-Pattern 1: Alles annotieren ("sicher ist sicher")

```typescript
// SCHLECHT
const name: string = "Matthias";
const doubled: number[] = items.map((n: number): number => n * 2);

// GUT
const name = "Matthias";
const doubled = items.map(n => n * 2);
```

### Anti-Pattern 2: Gegen die Inference kaempfen

```typescript
// SCHLECHT: Inference ignorieren
const result = fetchData() as any;
const count = someFunction() as number;

// GUT: Der Inference vertrauen
const result = fetchData();
```

### Anti-Pattern 3: `as const` ohne Verstaendnis einsetzen

```typescript
// SCHLECHT: as const ueberall, auch wo es nicht noetig ist
const x = 42 as const;  // Ueberfluessig! const x = 42 gibt schon den Typ 42

// GUT: as const gezielt bei Objekten und Arrays
const THEMES = ["light", "dark"] as const;  // Sinnvoll: readonly ["light", "dark"]
```

---

## Was du gelernt hast

- Inference versagt an **sechs systematischen Stellen** -- leere Arrays, Object.keys(), separate Callbacks, JSON.parse, komplexe Returns, Promise-Chains
- Jeder Versagensfall hat einen **konkreten Grund**: fehlende Information, Runtime-Grenzen oder lokale Analyse
- **Object.keys()** gibt absichtlich `string[]` zurueck -- wegen struktureller Typisierung
- **"Annotate at boundaries, infer inside"** ist das Leitprinzip fuer dein gesamtes TypeScript
- Die **neun goldenen Regeln** decken alle Alltags-Situationen ab

---

## Experiment-Box: Inference-Grenzen austesten

> **Experiment:** Erstelle eine neue Datei oder nutze die REPL (`npx tsx`) und probiere:
>
> 1. `const items = [];` -- was sagt `typeof items`? Dann `items.push("hello"); items.push(42);` -- beides erlaubt? Warum?
> 2. `const keys = Object.keys({ name: "Max", age: 30 });` -- hovere ueber `keys`. Ist es `("name" | "age")[]`?
> 3. `const data = JSON.parse('{"x": 1}');` -- hovere ueber `data`. Was kannst du mit `data.x` machen?
> 4. Definiere einen Callback separat und uebergib ihn an `.map()`: `const fn = (n) => n * 2; [1,2,3].map(fn);` -- hat `n` einen Typ?
> 5. Schreibe `async function f() { return (await fetch("/")).json(); }` -- was ist der Return-Typ?

---

## Rubber-Duck-Prompt

Erklaere einem imaginaeren Kollegen die "neun goldenen Regeln" in eigenen Worten. Wenn du bei einer Regel nicht erklaeren kannst, WARUM sie gilt (nicht nur DASS sie gilt), geh zurueck zur entsprechenden Sektion.

Besonders wichtig:
- Warum gibt `Object.keys()` `string[]` zurueck? (Sektion 7)
- Warum verliert ein separater Callback seinen Kontext? (Sektion 5)
- Warum ist `as const` bei Primitiven mit `const` redundant? (Sektion 4)

---

## Wie geht es weiter?

Du hast jetzt das vollstaendige Bild zu Type Annotations und Inference. Um dein Wissen zu festigen:

1. Oeffne die **Examples** (`examples/`) und experimentiere -- hovere ueber Variablen und ueberpruefe deine Vorhersagen
2. Mache die **Exercises** (`exercises/`) selbststaendig
3. Vergleiche mit den **Solutions** (`solutions/`)
4. Absolviere das **Quiz**: `npx tsx 03-type-annotations-und-inference/quiz.ts`
5. Behalte das **Cheatsheet** (`cheatsheet.md`) als Referenz

| Datei | Beschreibung |
|-------|-------------|
| `examples/01-explizite-annotationen.ts` | Alle Annotations-Syntax-Varianten |
| `examples/02-type-inference.ts` | Inference in Aktion mit Hover-Uebungen |
| `examples/03-widening-und-const.ts` | Widening, `let` vs `const`, `as const`, `satisfies` |
| `examples/04-contextual-typing.ts` | Contextual Typing bei Callbacks und mehr |
| `examples/05-control-flow-analysis.ts` | Control Flow Narrowing und Inference |
| `examples/06-satisfies-deep-dive.ts` | `satisfies` vs Annotation vs Inference |
| `exercises/01-annotieren-oder-infern.ts` | 15 Szenarien: Annotation noetig oder nicht? |
| `exercises/02-inference-vorhersagen.ts` | 15 Typ-Vorhersagen mit Type-Level-Tests |
| `exercises/03-satisfies-und-control-flow.ts` | satisfies anwenden, Control Flow nutzen |
| `exercises/04-predict-the-type.ts` | 12 ueberraschende Inference-Faelle vorhersagen |
| `exercises/05-fehlermeldungen-lesen.ts` | 6 Fehlermeldungen richtig interpretieren |
| `quiz.ts` | 15 interaktive Fragen |
| `cheatsheet.md` | Schnellreferenz |
