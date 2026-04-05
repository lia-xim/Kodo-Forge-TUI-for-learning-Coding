# Sektion 4: Constraints (Einschraenkungen)

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Generische Interfaces und Types](./03-generische-interfaces-und-types.md)
> Naechste Sektion: [05 - Default-Typparameter](./05-default-typparameter.md)

---

## Was du hier lernst

- Warum uneingeschraenkte Typparameter manchmal zu wenig koennen
- Wie `extends` Typparameter einschraenkt
- Das `keyof`-Constraint fuer typsichere Property-Zugriffe
- Mehrere Constraints kombinieren

---

## Das Problem: T kann ALLES sein

Ohne Einschraenkung ist `T` voellig offen. Du kannst nichts damit machen:

```typescript annotated
function getLength<T>(arg: T): number {
  return arg.length;
  //         ^^^^^^ Error! Property 'length' does not exist on type 'T'
}
// TypeScript: "T koennte number sein — und number hat kein .length!"
```

Das ist korrekt. `T` koennte `string` sein (hat `.length`), aber auch
`number` (hat kein `.length`). TypeScript erlaubt nur Operationen die
fuer **jeden moeglichen Typ** gelten.

> 💭 **Denkfrage:** Was passiert ohne den `extends`-Constraint? Und warum
> reicht `unknown` als Constraint nicht?
>
> **Denk kurz nach, bevor du weiterliest...**
>
> Ohne Constraint ist `T` voellig unbeschraenkt — TypeScript behandelt es
> wie `unknown`. Du kannst keine Properties lesen, keine Methoden aufrufen,
> nichts. `unknown` als expliziter Constraint (`T extends unknown`) aendert
> daran nichts, denn `unknown` hat null bekannte Properties. Ein Constraint
> muss die **konkreten Faehigkeiten** beschreiben, die du brauchst —
> z.B. `{ length: number }`.

---

## Die Loesung: `extends` als Constraint

Mit `extends` sagst du: "T muss mindestens diese Eigenschaften haben."

```typescript annotated
function getLength<T extends { length: number }>(arg: T): number {
  return arg.length; // OK! TypeScript weiss: T hat .length
}

getLength("hallo");       // OK — string hat .length
getLength([1, 2, 3]);     // OK — Array hat .length
getLength({ length: 10 }); // OK — Objekt hat .length

// getLength(42);          // Error! number hat kein .length
// getLength(true);        // Error! boolean hat kein .length
```

`T extends { length: number }` bedeutet: "T muss ein Typ sein, der
mindestens eine Property `length: number` hat." TypeScript prueft das
bei jedem Aufruf.

> 🔬 **Experiment:** Probiere folgendes im TypeScript Playground aus:
>
> ```typescript
> // Schritt 1: Ohne Constraint — beobachte den Fehler
> function getLengthBroken<T>(arg: T): number {
>   return arg.length; // Fehler hier — warum genau?
> }
>
> // Schritt 2: Mit Constraint — der Fehler wandert zur Aufrufstelle
> function getLength<T extends { length: number }>(arg: T): number {
>   return arg.length; // Jetzt OK!
> }
>
> getLength("hallo");    // OK
> getLength([1, 2, 3]);  // OK
> getLength(42);          // Fehler — hier, an der Aufrufstelle
> ```
>
> Beobachte: Wo erscheint der Fehler **ohne** Constraint (in der Funktion)?
> Wo mit Constraint (beim Aufruf)? Das ist der Unterschied zwischen
> "Fehler spaet entdecken" und "Fehler frueh entdecken".

> 🔍 **Tieferes Wissen: Constraints in TypeScript vs. Bounds in Java**
>
> TypeScript's `<T extends { length: number }>` entspricht konzeptionell
> Java's *Upper Bounds*: `<T extends Comparable<T>>`. Aber es gibt einen
> entscheidenden Unterschied:
>
> - **Java** prueft ob T eine Klasse/ein Interface **implementiert**
>   (nominale Typisierung). `T extends Comparable<T>` heisst: T muss
>   `Comparable` explizit implementieren.
> - **TypeScript** prueft ob T die **Struktur** erfuellt (strukturelle
>   Typisierung). `T extends { length: number }` heisst: T muss eine
>   Property `length: number` haben — egal woher.
>
> Das macht TypeScript-Constraints flexibler: Ein `string` erfuellt
> `{ length: number }` ohne dass `String` irgendetwas implementieren muss.

---

## Constraints mit benannten Interfaces

Statt inline-Constraints kannst du auch Interfaces verwenden:

```typescript annotated
interface HasId {
  id: number;
}

interface HasName {
  name: string;
}

function printId<T extends HasId>(entity: T): void {
  console.log(`ID: ${entity.id}`);
  // entity hat .id — garantiert durch den Constraint
}

// Der Typ behaelt ALLE Properties — nicht nur id:
const user = { id: 1, name: "Max", email: "max@test.de" };
printId(user); // OK — user hat .id (und mehr)
// ^ TypeScript inferiert T als { id: number; name: string; email: string }
// Nicht als HasId! T ist der VOLLE Typ.
```

> **Wichtig:** Der Constraint ist die **Mindestanforderung**. Der
> inferierte Typ `T` behaelt alle tatsaechlichen Properties.

---

## Das `keyof`-Constraint — typsichere Property-Zugriffe

Eines der haeufigsten Generics-Patterns ueberhaupt:

```typescript annotated
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
// ^ K muss ein gueltiger Schluessel von T sein
// ^ T[K] ist der Typ der Property — automatisch korrekt!

const user = { name: "Max", age: 30, active: true };

const name = getProperty(user, "name");
// ^ Typ: string — TypeScript weiss dass user.name string ist

const age = getProperty(user, "age");
// ^ Typ: number

// getProperty(user, "email");
// Error! "email" ist nicht in keyof typeof user
```

Lass uns das aufschluesseln:

1. `T` ist der Typ des Objekts (inferiert aus `user`)
2. `K extends keyof T` bedeutet: K muss ein Schluessel von T sein
3. `T[K]` ist ein **Indexed Access Type**: "Der Typ der Property K in T"
4. TypeScript prueft zur Compilezeit dass der Key existiert

> Das ist der Grundbaustein fuer TypeScript-Utility-Types wie
> `Pick<T, K>`, `Omit<T, K>`, `Record<K, V>` usw.

> 🧠 **Self-Explanation:** Halt kurz an und erklaere dir selbst: Warum
> braucht `getProperty` **zwei** Typparameter (`T` und `K`) statt einem?
> Was waere das Problem, wenn K einfach `string` waere statt
> `K extends keyof T`?
>
> **Kernpunkte:** Mit `K extends keyof T` weiss TypeScript den **exakten**
> Schluessel | Der Rueckgabetyp `T[K]` ist dann praezise (`string`, nicht
> `string | number | boolean`) | Mit `string` als Key-Typ gaebe es keine
> Compilezeit-Pruefung ob der Key existiert

---

## Mehrere Constraints

TypeScript erlaubt nur ein `extends` pro Typparameter, aber du kannst
mit Intersection Types mehrere Constraints kombinieren:

```typescript annotated
interface HasId {
  id: number;
}

interface Serializable {
  toJSON(): string;
}

// T muss BEIDES erfuellen:
function saveEntity<T extends HasId & Serializable>(entity: T): void {
  console.log(`Saving entity ${entity.id}`);
  const json = entity.toJSON();
  // ... speichern
}
```

`T extends HasId & Serializable` bedeutet: "T muss sowohl `id: number`
als auch `toJSON(): string` haben."

### Constraints bei mehreren Typparametern

Jeder Typparameter kann seinen eigenen Constraint haben:

```typescript annotated
function merge<T extends object, U extends object>(
  target: T,
  source: U
): T & U {
  return { ...target, ...source };
}

const result = merge(
  { name: "Max" },
  { age: 30 }
);
// ^ Typ: { name: string } & { age: number }
// result.name — string
// result.age  — number
```

---

## Constraint Patterns in der Praxis

### Pattern 1: Vergleichbare Werte

```typescript annotated
function max<T extends number | string>(a: T, b: T): T {
  return a > b ? a : b;
}

max(10, 20);       // OK: number
max("abc", "xyz"); // OK: string
// max(10, "abc"); // Error! number und string gemischt
```

### Pattern 2: Objekte mit bestimmter Form

```typescript annotated
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map(item => item[key]);
}

const users = [
  { name: "Max", age: 30 },
  { name: "Anna", age: 25 },
];

const names = pluck(users, "name");
// ^ Typ: string[] — automatisch korrekt!

const ages = pluck(users, "age");
// ^ Typ: number[]
```

### Pattern 3: Konstruktor-Constraint

```typescript annotated
function createInstance<T>(Constructor: new () => T): T {
  return new Constructor();
}
// ^ Akzeptiert nur Klassen die mit new() aufgerufen werden koennen
```

---

## Praxis-Bezug: Constraints in Angular und React

Constraints sind in echten Frameworks allgegenwaertig:

**Angular — Pipe mit Generic Constraint:**

```typescript annotated
// Eine Pipe die nur auf Arrays mit id-Property funktioniert
@Pipe({ name: 'sortById' })
class SortByIdPipe implements PipeTransform {
  transform<T extends { id: number }>(items: T[]): T[] {
    return [...items].sort((a, b) => a.id - b.id);
  }
  // ^ T behaelt den vollen Typ — die Pipe funktioniert mit
  //   User[], Product[], Order[] — alles was eine id hat
}
```

**React — useSelector mit Constraint:**

```typescript annotated
// Redux useSelector — vereinfacht
function useSelector<TState, TSelected>(
  selector: (state: TState) => TSelected
): TSelected;

// Verwendung:
const userName = useSelector((state: RootState) => state.user.name);
// ^ TSelected wird als string inferiert — typsicher!
```

In beiden Faellen sorgen Constraints dafuer, dass die Generics **genug wissen** um nuetzlich zu sein, aber **offen genug** bleiben um wiederverwendbar zu sein.

---

## Haeufiger Fehler: Zu enge Constraints

```typescript annotated
// SCHLECHT: Constraint schraenkt unnoetig ein
function logValue<T extends string>(value: T): void {
  console.log(value);
}
// Warum generisch? T wird nur als string genutzt.
// Besser: function logValue(value: string): void

// GUT: Constraint sinnvoll genutzt
function sortByKey<T extends Record<string, number>>(
  items: T[],
  key: keyof T
): T[] {
  return [...items].sort((a, b) => (a[key] as number) - (b[key] as number));
}
// Hier bewahrt T den vollen Typ der Objekte
```

---

## Was du gelernt hast

- Ohne Constraints ist `T` wie `unknown` — du kannst keine Properties lesen, keine Methoden aufrufen
- `T extends { length: number }` bedeutet: T muss **mindestens** diese Struktur haben (Mindestanforderung, nicht exakte Form)
- `K extends keyof T` + `T[K]` ist der Grundbaustein fuer typsichere Property-Zugriffe — der Rueckgabetyp ist praezise
- Constraints koennen kombiniert werden: `T extends A & B` erzwingt mehrere Mindestanforderungen
- Das Muster `<T extends { id: number }>` ist in Angular-Pipes und React-Hooks allgegenwaertig

**Kernkonzept:** Constraints sind die Balance zwischen "zu allgemein" (uneingeschraenktes T kann nichts) und "zu spezifisch" (konkreter Typ verliert Wiederverwendbarkeit). `T extends { length: number }` heisst: "Egal welcher Typ — Hauptsache er hat `.length`."

---

## Zusammenfassung

| Konzept | Syntax | Bedeutung |
|---------|--------|-----------|
| Basis-Constraint | `T extends Type` | T muss Type erfuellen |
| keyof-Constraint | `K extends keyof T` | K muss Schluessel von T sein |
| Mehrere Constraints | `T extends A & B` | T muss A UND B erfuellen |
| Indexed Access | `T[K]` | Typ der Property K in T |

---

> 🧠 **Erklaere dir selbst:** Warum gibt `getProperty(user, "name")` den
> Typ `string` zurueck und nicht `string | number | boolean`?
> **Kernpunkte:** K wird zu "name" inferiert | T["name"] ist string | Indexed Access ist praezise pro Key

---

> **Pausenpunkt** — Gut? Dann weiter zu [Sektion 05: Default-Typparameter](./05-default-typparameter.md)
