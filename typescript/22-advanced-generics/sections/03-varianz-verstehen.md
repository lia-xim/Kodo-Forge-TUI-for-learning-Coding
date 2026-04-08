# Sektion 3: Varianz verstehen

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Higher-Order Types](./02-higher-order-types.md)
> Naechste Sektion: [04 - in/out Modifier](./04-in-out-modifier.md)

---

## Was du hier lernst

- Was **Kovarianz** ist: Subtyp-Beziehung bleibt erhalten (Cat → Animal wird zu Producer<Cat> → Producer<Animal>)
- Was **Kontravarianz** ist: Subtyp-Beziehung kehrt sich um (bei Funktionsparametern)
- Was **Invarianz** ist: Keine Subtyp-Beziehung — weder kovariant noch kontravariant
- Warum **Varianz die wichtigste Eigenschaft** generischer Typen ist

---

## Die Grundfrage
<!-- section:summary -->
Wenn `Cat` ein Subtyp von `Animal` ist (`Cat extends Animal`), was gilt

<!-- depth:standard -->
Wenn `Cat` ein Subtyp von `Animal` ist (`Cat extends Animal`), was gilt
dann fuer Container die Cat oder Animal enthalten?

```typescript
interface Animal { name: string; }
interface Cat extends Animal { meow(): void; }

// Cat extends Animal — das ist klar.
// Aber:
// Ist Array<Cat> ein Subtyp von Array<Animal>?
// Ist Promise<Cat> ein Subtyp von Promise<Animal>?
// Ist ((a: Cat) => void) ein Subtyp von ((a: Animal) => void)?
```

Die Antwort auf diese Fragen ist **Varianz** — und sie ist fuer jede
Frage anders.

---

> 📖 **Hintergrund: Java's Array-Kovarianz — ein Designfehler**
>
> In Java (seit Version 1.0, 1995) sind Arrays kovariant: `String[]` ist
> ein Subtyp von `Object[]`. Das klingt logisch — ein Array von Strings
> IST ein Array von Objekten, oder?
>
> Das Problem zeigt sich beim Schreiben:
> ```java
> String[] strings = new String[1];
> Object[] objects = strings;  // Erlaubt (kovariante Arrays)
> objects[0] = 42;             // Kompiliert! Object[] akzeptiert Integer
> // RUNTIME: ArrayStoreException!
> ```
>
> Der Compiler sagt "OK", aber zur Laufzeit crasht es. James Gosling
> (Java's Erfinder) hat spaeter zugegeben, dass kovariante mutable Arrays
> ein Designfehler waren. Er brauchte sie damals fuer generische sort()-
> und equals()-Methoden — Java hatte 1995 noch keine Generics (erst 2004
> mit Java 5).
>
> TypeScript hat aus diesem Fehler gelernt — zumindest teilweise. Dazu
> gleich mehr.

---

<!-- /depth -->
## Kovarianz: Die Subtyprichtung bleibt
<!-- section:summary -->
**Kovarianz** bedeutet: Wenn `Cat extends Animal`, dann gilt auch

<!-- depth:standard -->
**Kovarianz** bedeutet: Wenn `Cat extends Animal`, dann gilt auch
`Container<Cat> extends Container<Animal>`. Die Richtung der Subtyp-
beziehung bleibt gleich.

```typescript annotated
interface Animal { name: string; }
interface Cat extends Animal { meow(): void; }

// Ein Producer GIBT Dinge heraus — er ist kovariant.
interface Producer<T> {
  get(): T;
}
// ^^^ T steht nur in OUTPUT-Position (Rueckgabetyp).

declare const catProducer: Producer<Cat>;
const animalProducer: Producer<Animal> = catProducer; // OK!
// ^^^ Warum? Wenn ich ein Tier erwarte und eine Katze bekomme,
//     ist das sicher — eine Katze IST ein Tier.
//     Producer<Cat> "passt" in Producer<Animal>.

// Die Richtung bleibt:
// Cat          extends Animal          → (Subtyp-Beziehung)
// Producer<Cat> extends Producer<Animal> → (gleiche Richtung = kovariant)
```

**Faustregel:** Ein Typ ist kovariant in T wenn T nur in
**Output-Positionen** steht: Rueckgabetypen, readonly Properties,
Callback-Rueckgabewerte.

---

<!-- /depth -->
## Kontravarianz: Die Subtyprichtung kehrt sich um
<!-- section:summary -->
**Kontravarianz** ist das Gegenteil: Wenn `Cat extends Animal`, dann gilt

<!-- depth:standard -->
**Kontravarianz** ist das Gegenteil: Wenn `Cat extends Animal`, dann gilt
`Handler<Animal> extends Handler<Cat>`. Die Richtung **kehrt sich um**.

```typescript annotated
interface Animal { name: string; }
interface Cat extends Animal { meow(): void; }

// Ein Consumer NIMMT Dinge entgegen — er ist kontravariant.
type Handler<T> = (item: T) => void;

declare const animalHandler: Handler<Animal>;
const catHandler: Handler<Cat> = animalHandler; // OK!
// ^^^ Warum? animalHandler kann JEDES Tier verarbeiten.
//     Also kann er auch Katzen verarbeiten.
//     Handler<Animal> "passt" in Handler<Cat>.

// ABER: Andersherum ist unsicher!
declare const catOnlyHandler: Handler<Cat>;
// const animalHandler2: Handler<Animal> = catOnlyHandler;
// ^^^ ERROR! catOnlyHandler erwartet .meow() — ein Hund hat das nicht!

// Die Richtung kehrt sich um:
// Cat             extends Animal             → (Subtyp-Beziehung)
// Handler<Animal> extends Handler<Cat>       → (umgekehrte Richtung = kontravariant)
```

> 🧠 **Erklaere dir selbst:** Warum ist ein `Array<Cat>` KEIN sicherer
> `Array<Animal>` wenn man in den Array **schreiben** kann?
>
> **Kernpunkte:** Lesen ist sicher (Katze rausnehmen → erwarte Tier → OK) |
> Schreiben ist unsicher (Hund reinschreiben → Array erwartet Katze → CRASH) |
> Lesen = Output = kovariant | Schreiben = Input = kontravariant |
> Beides zusammen = kein sicheres Subtyping moeglich

---

<!-- /depth -->
## Invarianz: Keine Richtung
<!-- section:summary -->
**Invarianz** entsteht wenn T sowohl in Input- als auch Output-Position

<!-- depth:standard -->
**Invarianz** entsteht wenn T sowohl in Input- als auch Output-Position
steht. Dann gibt es keine sichere Subtyp-Beziehung in keine Richtung.

```typescript annotated
interface Animal { name: string; }
interface Cat extends Animal { meow(): void; }

// MutableBox liest UND schreibt T — invariant.
interface MutableBox<T> {
  get(): T;          // Output-Position → will kovariant sein
  set(value: T): void; // Input-Position → will kontravariant sein
}
// ^^^ Lesen erfordert Kovarianz, Schreiben erfordert Kontravarianz.
//     Beides zusammen = INVARIANT. Kein Subtyping in keine Richtung.

declare const catBox: MutableBox<Cat>;
// const animalBox: MutableBox<Animal> = catBox;
// ^^^ UNSICHER! Jemand koennte animalBox.set({ name: "Rex" }) aufrufen.
//     Das schreibt ein Nicht-Cat-Objekt in eine Cat-Box.

declare const animalBox: MutableBox<Animal>;
// const catBox2: MutableBox<Cat> = animalBox;
// ^^^ AUCH UNSICHER! catBox2.get() wuerde ein Animal zurueckgeben,
//     aber wir erwarten eine Cat mit .meow().
```

**Arrays sind technisch invariant** — sie haben `push` (Input) und
Index-Zugriff (Output). Aber TypeScript erlaubt die kovariante Zuweisung
aus Pragmatismus. Das ist eine bewusste Unsicherheit.

---

> 🤔 **Denkfrage:** Funktionsparameter sind kontravariant. Was bedeutet das
> konkret? Wenn du eine Funktion hast die `(a: Cat) => void` erwartet,
> warum kannst du eine `(a: Animal) => void` uebergeben?
>
> Tipp: Denke an das Liskov Substitution Principle — ein Subtyp muss
> ueberall verwendbar sein wo der Supertyp erwartet wird.

---

<!-- /depth -->
## Die Varianz-Tabelle
<!-- section:summary -->
Hier ist die Zusammenfassung aller Varianz-Arten:

<!-- depth:standard -->
Hier ist die Zusammenfassung aller Varianz-Arten:

```typescript annotated
interface Animal { name: string; }
interface Cat extends Animal { meow(): void; }

// KOVARIANT (out): Subtyprichtung bleibt
// Cat extends Animal → Producer<Cat> extends Producer<Animal>
interface Producer<T> { get(): T; }

// KONTRAVARIANT (in): Subtyprichtung kehrt um
// Cat extends Animal → Consumer<Animal> extends Consumer<Cat>
interface Consumer<T> { accept(item: T): void; }

// INVARIANT: Keine Subtypbeziehung
// MutableBox<Cat> und MutableBox<Animal> sind NICHT zuweisbar
interface MutableBox<T> { get(): T; set(value: T): void; }

// BIVARIANT: Beide Richtungen (unsicher, Legacy)
// Nur bei Methoden-Parametern OHNE strictFunctionTypes
// ^^^ Bivariant ist fast immer ein Bug. strictFunctionTypes aktivieren!
```

| Varianz | Richtung | Wann | Position von T |
|---|---|---|---|
| Kovariant | bleibt | Nur Output | Rueckgabewert, readonly Property |
| Kontravariant | kehrt um | Nur Input | Parameter, Callback-Parameter |
| Invariant | keine | Input + Output | Mutable Property, Parameter + Return |
| Bivariant | beides | Legacy | Methoden-Params ohne strict |

---

> 🔬 **Experiment:** Teste in deinem Editor welche Zuweisungen TypeScript
> erlaubt und welche nicht:
>
> ```typescript
> interface Animal { name: string; }
> interface Cat extends Animal { meow(): void; }
>
> // ReadonlyArray ist kovariant (nur Output):
> const cats: readonly Cat[] = [{ name: "Minka", meow() {} }];
> const animals: readonly Animal[] = cats; // OK oder Error?
>
> // Normales Array (Input + Output):
> const cats2: Cat[] = [{ name: "Minka", meow() {} }];
> const animals2: Animal[] = cats2; // OK oder Error?
>
> // Funktion (Parameter ist Input):
> const fn1: (a: Animal) => void = (a) => console.log(a.name);
> const fn2: (c: Cat) => void = fn1; // OK oder Error?
> ```
>
> Spoiler: ReadonlyArray ist kovariant (OK), normales Array wird von TS
> erlaubt (aber technisch unsicher), und die Funktion ist kontravariant (OK).

---

<!-- /depth -->
## Warum TypeScript bei Arrays "luegt"
<!-- section:summary -->
TypeScript erlaubt `Cat[] = Animal[]`-artige Zuweisungen, obwohl Arrays

<!-- depth:standard -->
TypeScript erlaubt `Cat[] = Animal[]`-artige Zuweisungen, obwohl Arrays
invariant sein sollten. Warum?

```typescript annotated
const cats: Cat[] = [{ name: "Minka", meow() { console.log("Miau"); } }];
const animals: Animal[] = cats; // TypeScript: OK!
// ^^^ Das ist technisch unsicher!

animals.push({ name: "Rex" }); // Nur ein Animal, keine Cat!
cats[1].meow(); // RUNTIME ERROR: meow is not a function
// ^^^ TypeScript hat hier gelogen. Warum?
```

Die Antwort: **Pragmatismus**. Wenn Arrays strikt invariant waeren, wuerde
extrem viel existierender JavaScript-Code nicht mehr typchecken. Funktionen
wie `Array.prototype.sort` oder `Array.prototype.filter` waeren kaum
nutzbar. TypeScript waehlt hier bewusst Unsicherheit zugunsten von
Benutzbarkeit.

`ReadonlyArray<T>` ist dagegen korrekt kovariant — man kann nichts
Falsches reinschreiben wenn man nur lesen kann.

---

<!-- /depth -->
## Der Framework-Bezug

> 🅰️ **Angular:** Mit `strictFunctionTypes` (Teil von `strict: true`)
> erzwingt Angular korrekte Kontravarianz bei Funktionsparametern.
> Das bedeutet: Ein `EventEmitter<Cat>` kann nicht direkt einem
> `EventEmitter<Animal>` zugewiesen werden wenn Events in beide
> Richtungen fliessen. In aelteren Angular-Versionen (ohne strict)
> war das erlaubt — und fuehrte zu Bugs.
>
> ⚛️ **React:** `React.FC<Props>` ist kovariant in Props (Props stehen
> nur in Input-Position des Renders, aber die Component selbst "produziert"
> JSX). Hooks wie `useState<T>` erzeugen invariante State-Container:
> Man liest UND schreibt T.

---

## Was du gelernt hast

- **Kovarianz** (Output): Subtyp-Richtung bleibt. `Producer<Cat> extends Producer<Animal>`.
  Gilt wenn T nur herausgegeben wird.
- **Kontravarianz** (Input): Subtyp-Richtung kehrt um. `Handler<Animal> extends Handler<Cat>`.
  Gilt wenn T nur entgegengenommen wird.
- **Invarianz** (Input + Output): Keine Subtyp-Beziehung. Mutable Container sind invariant.
- **Java's Array-Kovarianz** war ein Designfehler — TypeScript wiederholt ihn (aus Pragmatismus).
- `ReadonlyArray<T>` ist korrekt kovariant, `Array<T>` ist "unsicher kovariant".

> **Kernkonzept:** Varianz beschreibt wie Subtyp-Beziehungen durch generische
> Typen "fliessen". Output-Position = kovariant, Input-Position = kontravariant,
> beides = invariant. Das zu verstehen ist essentiell fuer typsicheres API-Design.

---

> ⏸️ **Pausenpunkt:** Guter Zeitpunkt fuer eine kurze Pause.
> In der naechsten Sektion lernst du die `in`/`out`-Modifier (TS 4.7),
> mit denen du Varianz explizit deklarieren kannst — statt sie TypeScript
> berechnen zu lassen.
>
> **Weiter:** [Sektion 04 - in/out Modifier →](./04-in-out-modifier.md)
