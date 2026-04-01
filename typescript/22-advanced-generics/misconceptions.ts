/**
 * Lektion 22 — Fehlkonzeption-Exercises: Advanced Generics
 *
 * Code der "offensichtlich richtig" aussieht aber subtil falsch ist.
 * Der Lernende muss den Bug finden.
 */

export interface Misconception {
  id: string;
  title: string;
  /** Der "offensichtlich korrekte" Code */
  code: string;
  /** Was die meisten Leute denken */
  commonBelief: string;
  /** Was tatsaechlich passiert */
  reality: string;
  /** Welches Konzept getestet wird */
  concept: string;
  /** Schwierigkeit 1-5 */
  difficulty: number;
}

export const misconceptions: Misconception[] = [
  // ─── 1: Array<Cat> ist immer Subtyp von Array<Animal> ─────────────────
  {
    id: "22-array-covariance",
    title: "Array<Cat> ist immer Subtyp von Array<Animal>",
    code: `interface Animal { name: string; }
interface Cat extends Animal { meow(): void; }

function addAnimal(animals: Animal[]) {
  animals.push({ name: "Hund" }); // Kein Cat!
}

const cats: Cat[] = [{ name: "Minka", meow() {} }];
addAnimal(cats); // Erlaubt TypeScript das?
// cats[1].meow(); // Runtime: .meow is not a function`,
    commonBelief:
      "Da Cat ein Subtyp von Animal ist, muesste Array<Cat> immer ein " +
      "Subtyp von Array<Animal> sein. Das waere ja logisch.",
    reality:
      "Arrays sind INVARIANT wenn man sie beschreibt. TypeScript erlaubt " +
      "die Zuweisung zwar (aus Pragmatismus), aber es ist unsicher: " +
      "addAnimal kann ein Nicht-Cat-Objekt in ein Cat-Array pushen. " +
      "Nur ReadonlyArray<Cat> waere sicher kovariant.",
    concept: "Kovarianz vs Invarianz bei mutablen Collections",
    difficulty: 3,
  },

  // ─── 2: Kovarianz bedeutet "der Typ wird groesser" ────────────────────
  {
    id: "22-covariance-meaning",
    title: "Kovarianz bedeutet der Typ wird groesser",
    code: `interface Producer<T> { get(): T; }

// Wenn Cat extends Animal:
// Producer<Cat> extends Producer<Animal>  ← kovariant

// "Kovarianz = der Typ wird breiter"?
type Test = Producer<Cat> extends Producer<Animal> ? true : false;
// Ergebnis: true`,
    commonBelief:
      "Kovarianz bedeutet, dass der innere Typ 'breiter' oder 'groesser' wird. " +
      "Producer<Animal> ist 'groesser' als Producer<Cat>.",
    reality:
      "Kovarianz bedeutet, dass die Subtypbeziehung ERHALTEN bleibt: " +
      "Cat extends Animal → Producer<Cat> extends Producer<Animal>. " +
      "Es geht nicht um Groesse, sondern um die RICHTUNG der Subtypbeziehung. " +
      "Producer<Cat> ist der ENGERE (speziellere) Typ.",
    concept: "Kovarianz = Subtyprichtung bleibt gleich",
    difficulty: 3,
  },

  // ─── 3: in/out Modifier aendern Verhalten ─────────────────────────────
  {
    id: "22-in-out-behavior",
    title: "in/out Modifier aendern das Verhalten des Typs",
    code: `// Ohne Modifier:
interface BoxA<T> { value: T; }

// Mit Modifier:
interface BoxB<in out T> { value: T; }

// Sind BoxA und BoxB unterschiedlich?
type Test1 = BoxA<string> extends BoxB<string> ? true : false; // true
type Test2 = BoxB<string> extends BoxA<string> ? true : false; // true`,
    commonBelief:
      "Die `in`/`out`-Modifier aendern, wie der Typ sich verhaelt. " +
      "Mit `out T` wird der Typ kovariant, ohne waere er es nicht.",
    reality:
      "Die Modifier aendern KEIN Verhalten — sie sind reine ANNOTATIONEN. " +
      "TypeScript berechnet Varianz sowieso strukturell. Die Modifier " +
      "deklarieren nur die Absicht und TypeScript prueft, ob die Deklaration " +
      "stimmt. Der Vorteil ist Klarheit und Performance (kein strukturelles Pruefen noetig).",
    concept: "in/out sind Annotationen, keine Verhaltensaenderungen",
    difficulty: 2,
  },

  // ─── 4: Generics sind immer besser als Unions ─────────────────────────
  {
    id: "22-generics-always-better",
    title: "Generics sind immer besser als Unions",
    code: `// "Generic-Version" (uebertrieben):
function formatGeneric<T extends string | number>(value: T): string {
  return String(value);
}

// Einfache Union-Version:
function formatUnion(value: string | number): string {
  return String(value);
}

// Beide machen das Gleiche — aber welche ist besser?`,
    commonBelief:
      "Generics sind immer die bessere Wahl weil sie flexibler sind. " +
      "Man sollte immer Generics verwenden wenn es moeglich ist.",
    reality:
      "Hier ist das Generic sinnlos: T wird nur einmal verwendet (als Parameter) " +
      "und taucht nicht im Rueckgabetyp auf. Die Union-Version ist identisch " +
      "in der Funktionalitaet aber einfacher zu lesen und zu verstehen. " +
      "Regel: Generics nur wenn der Typparameter eine BEZIEHUNG herstellt.",
    concept: "Rule of Two: Typparameter mind. 2x verwenden",
    difficulty: 2,
  },

  // ─── 5: T extends A | B = T muss A ODER B sein ───────────────────────
  {
    id: "22-extends-union",
    title: "T extends A | B bedeutet T muss A ODER B sein",
    code: `type IsStringOrNumber<T> = T extends string | number ? "yes" : "no";

// Was ist das Ergebnis?
type Test1 = IsStringOrNumber<string>;       // "yes"
type Test2 = IsStringOrNumber<42>;           // "yes"
type Test3 = IsStringOrNumber<"hello" | 42>; // ???
type Test4 = IsStringOrNumber<boolean>;      // ???`,
    commonBelief:
      "`T extends string | number` prueft ob T genau `string` ODER genau `number` ist. " +
      "Boolean sollte 'no' ergeben.",
    reality:
      "`extends` prueft die Subtyp-Beziehung: Jeder Subtyp von `string | number` " +
      "erfuellt den Constraint. `42` (Literal) ist Subtyp von `number`, also 'yes'. " +
      "Bei `boolean` ist es 'no'. Aber bei `string | number` (als nackter Typparameter) " +
      "VERTEILT sich der Conditional Type: `IsStringOrNumber<string> | IsStringOrNumber<number>` = 'yes'.",
    concept: "extends bei Unions und Distributive Behavior",
    difficulty: 4,
  },

  // ─── 6: Distributive Conditionals verteilen sich immer ────────────────
  {
    id: "22-always-distributive",
    title: "Distributive Conditional Types verteilen sich immer",
    code: `// Version 1: Distributiv
type IsString1<T> = T extends string ? true : false;
type R1 = IsString1<string | number>; // true | false

// Version 2: Nicht-distributiv
type IsString2<T> = [T] extends [string] ? true : false;
type R2 = IsString2<string | number>; // false

// Warum ist R1 !== R2?`,
    commonBelief:
      "Conditional Types verteilen sich immer ueber Unions. " +
      "`IsString1` und `IsString2` sollten das gleiche Ergebnis haben.",
    reality:
      "Distribution tritt NUR auf wenn T ein 'nackter' (unwrapped) Typparameter ist. " +
      "Bei `[T] extends [string]` ist T in ein Tuple gewrappt — keine Distribution. " +
      "Dann wird `string | number` als Ganzes gegen `string` geprueft → false.",
    concept: "Nackte vs gewrappte Typparameter bei Conditionals",
    difficulty: 4,
  },

  // ─── 7: Funktionsparameter sind kovariant ─────────────────────────────
  {
    id: "22-function-params-covariant",
    title: "Funktionsparameter sind kovariant",
    code: `interface Animal { name: string; }
interface Cat extends Animal { meow(): void; }

type AnimalHandler = (a: Animal) => void;
type CatHandler = (c: Cat) => void;

// Welche Zuweisung ist sicher?
const handler1: CatHandler = (a: Animal) => console.log(a.name); // OK?
const handler2: AnimalHandler = (c: Cat) => c.meow(); // OK?`,
    commonBelief:
      "Funktionsparameter sind kovariant: Da Cat extends Animal, sollte " +
      "CatHandler ein Subtyp von AnimalHandler sein.",
    reality:
      "Mit `strictFunctionTypes` sind Funktionsparameter KONTRAVARIANT: " +
      "AnimalHandler ist ein Subtyp von CatHandler (nicht umgekehrt!). " +
      "handler1 ist sicher (Animal-Handler kann Cats verarbeiten), " +
      "handler2 ist unsicher (Cat-Handler erwartet .meow(), " +
      "aber bekommt vielleicht einen Hund).",
    concept: "Kontravarianz von Funktionsparametern",
    difficulty: 3,
  },

  // ─── 8: Generic Defaults werden immer verwendet ───────────────────────
  {
    id: "22-generic-defaults",
    title: "Generic Defaults werden immer verwendet",
    code: `function createBox<T = string>(value: T): { value: T } {
  return { value };
}

// Was ist der Typ?
const box1 = createBox("hello");  // { value: string } oder { value: "hello" }?
const box2 = createBox(42);       // { value: string } oder { value: number }?
const box3 = createBox<string>(42); // Fehler?`,
    commonBelief:
      "Der Default `T = string` wird immer verwendet. `box1` hat Typ " +
      "`{ value: string }` und `box2` sollte einen Fehler erzeugen.",
    reality:
      "Inference hat VORRANG vor Defaults. Bei `box1` inferiert TS `T = string` " +
      "(Zufall, stimmt mit Default ueberein). Bei `box2` inferiert TS `T = number` — " +
      "der Default wird ignoriert! Der Default greift nur wenn KEINE Inference moeglich ist. " +
      "`box3` gibt einen Fehler weil T explizit string ist aber 42 kein string.",
    concept: "Inference hat Vorrang vor Default-Typparametern",
    difficulty: 2,
  },
];
