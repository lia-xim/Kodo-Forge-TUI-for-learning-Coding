/**
 * Lektion 21 — Fehlkonzeption-Exercises: Classes & OOP
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
  // ─── 1: private verhindert Laufzeit-Zugriff ────────────────────────────
  {
    id: "21-private-runtime",
    title: "private verhindert Zugriff zur Laufzeit",
    code: `class Secret {
  private apiKey: string = "sk-12345";
}

const s = new Secret();
// "private schuetzt die Daten vor unbefugtem Zugriff"
console.log((s as any).apiKey); // ???`,
    commonBelief:
      "`private` schuetzt Felder zur Laufzeit — niemand kann auf " +
      "`apiKey` zugreifen, weil es privat ist.",
    reality:
      "`(s as any).apiKey` gibt 'sk-12345' zurueck! TypeScript's `private` " +
      "ist ein reines Compilezeit-Feature (Type Erasure). Zur Laufzeit ist " +
      "das Feld ein ganz normales JavaScript-Property. Fuer echten " +
      "Laufzeit-Schutz muss `#apiKey` (ES2022 Private Fields) verwendet werden.",
    concept: "Type Erasure / private vs #private",
    difficulty: 2,
  },

  // ─── 2: Abstract classes haben NUR abstrakte Methoden ──────────────────
  {
    id: "21-abstract-only-abstract",
    title: "Abstract classes koennen nur abstrakte Methoden haben",
    code: `abstract class Base {
  // "Alles in einer abstract class muss abstract sein"
  abstract doWork(): void;

  // Ist DAS erlaubt?
  log(message: string): void {
    console.log(\`[Base] \${message}\`);
  }
}`,
    commonBelief:
      "Wenn eine Klasse `abstract` ist, muessen ALLE ihre Methoden " +
      "ebenfalls `abstract` sein — eine abstract class darf keinen " +
      "konkreten Code enthalten.",
    reality:
      "Voellig erlaubt! Abstract classes koennen sowohl abstrakte Methoden " +
      "(ohne Body — muessen von Subklassen implementiert werden) als auch " +
      "konkrete Methoden (mit Body — werden vererbt) haben. Das ist " +
      "genau ihr Vorteil gegenueber Interfaces: Sie koennen gemeinsamen " +
      "Code bereitstellen UND Implementierungen erzwingen.",
    concept: "Abstract Classes / konkrete vs abstrakte Methoden",
    difficulty: 2,
  },

  // ─── 3: implements prueft mehr als structural compatibility ────────────
  {
    id: "21-implements-structural",
    title: "implements ist strenger als Structural Typing",
    code: `interface Printable {
  print(): void;
}

class Report {
  print(): void {
    console.log("Drucke Report...");
  }
}

function printAll(items: Printable[]) {
  items.forEach(i => i.print());
}

// Ohne 'implements Printable' — funktioniert das?
printAll([new Report()]);`,
    commonBelief:
      "Ohne `implements Printable` kann `Report` nicht als " +
      "`Printable` verwendet werden — man MUSS `implements` schreiben.",
    reality:
      "Es kompiliert und funktioniert! TypeScript nutzt Structural Typing: " +
      "Report hat eine `print(): void`-Methode, also passt es zu Printable. " +
      "`implements` ist optional — es bietet fruehere Fehlermeldungen und " +
      "Dokumentation, ist aber fuer die Kompatibilitaet nicht erforderlich.",
    concept: "Structural Typing / implements ist optional",
    difficulty: 3,
  },

  // ─── 4: Vererbung ist immer besser als Komposition ─────────────────────
  {
    id: "21-inheritance-always-better",
    title: "Vererbung ist immer die beste Loesung fuer Code-Sharing",
    code: `// "Teile Code durch Vererbung"
class Animal { move() { /* ... */ } }
class SwimmingAnimal extends Animal { swim() { /* ... */ } }
class FlyingAnimal extends Animal { fly() { /* ... */ } }
// Ente: kann schwimmen UND fliegen?
// class Duck extends SwimmingAnimal, FlyingAnimal ???
// FEHLER: Nur EINE Elternklasse erlaubt!`,
    commonBelief:
      "Vererbung ist die primaere Methode, um Code zwischen Klassen " +
      "zu teilen. Je mehr Vererbungsstufen, desto besser organisiert.",
    reality:
      "TypeScript erlaubt nur EINE Elternklasse (kein Mehrfacherben). " +
      "Selbst wenn es ginge: Tiefe Vererbungshierarchien erzeugen enge " +
      "Kopplung und sind schwer zu warten. Die Gang of Four empfahl " +
      "bereits 1994: 'Favor composition over inheritance'. " +
      "Besser: Interfaces + Komposition oder Mixins.",
    concept: "Composition over Inheritance",
    difficulty: 2,
  },

  // ─── 5: Static Methoden und this wie Instanz-Methoden ──────────────────
  {
    id: "21-static-this",
    title: "Static Methoden greifen auf Instanz-Felder zu",
    code: `class Counter {
  count: number = 0;

  static increment(): void {
    this.count++;
    // "this.count erhoert den Zaehler der Instanz"
  }
}

Counter.increment();
console.log(new Counter().count); // ???`,
    commonBelief:
      "`this` in einer static Methode verweist auf die aktuelle " +
      "Instanz, genau wie in normalen Methoden.",
    reality:
      "In static Methoden verweist `this` auf die KLASSE, nicht auf " +
      "eine Instanz. `this.count++` erstellt oder inkrementiert `Counter.count` " +
      "(ein static Property auf der Klasse), nicht das Instanz-Feld. " +
      "`new Counter().count` ist immer noch 0 — das Instanz-Feld wurde " +
      "nie beruehrt. Static und Instance Members sind getrennte Welten.",
    concept: "Static vs Instance Members / this in static",
    difficulty: 3,
  },

  // ─── 6: #private und private sind dasselbe ─────────────────────────────
  {
    id: "21-hash-private-same",
    title: "#private und private sind dasselbe",
    code: `class A {
  private tsPrivate: string = "ts";
  #jsPrivate: string = "js";
}

const a = new A();

// Versuch 1: TypeScript private
console.log((a as any).tsPrivate); // ???

// Versuch 2: JavaScript #private
// console.log((a as any).#jsPrivate); // ???`,
    commonBelief:
      "`private` und `#private` sind zwei Schreibweisen fuer dasselbe Feature — " +
      "beide schuetzen Felder vor externem Zugriff.",
    reality:
      "`(a as any).tsPrivate` gibt 'ts' zurueck — TypeScript's `private` " +
      "wird bei der Kompilierung entfernt! " +
      "`(a as any).#jsPrivate` ist ein Syntax-Error — `#` Fields sind zur " +
      "Laufzeit ECHT privat, nicht einmal mit `as any` zugaenglich. " +
      "Sie tauchen auch nicht in `Object.keys()` oder `JSON.stringify()` auf.",
    concept: "TypeScript private vs JavaScript #private",
    difficulty: 3,
  },

  // ─── 7: Arrow-Functions als Klassen-Felder sind immer besser ───────────
  {
    id: "21-arrow-class-fields",
    title: "Arrow-Functions als Klassen-Felder sind immer besser",
    code: `class Button {
  label: string;
  constructor(label: string) { this.label = label; }

  // "Arrow Functions loesen alle this-Probleme!"
  onClick = () => {
    console.log(\`Clicked: \${this.label}\`);
  };
}

// 10.000 Buttons erstellen:
const buttons = Array.from({ length: 10000 },
  (_, i) => new Button(\`Button \${i}\`));`,
    commonBelief:
      "Arrow-Functions als Klassen-Felder sind immer die beste Loesung " +
      "fuer this-Binding — es gibt keinen Nachteil.",
    reality:
      "Arrow-Functions als Klassen-Felder loesen das this-Problem, " +
      "haben aber einen Nachteil: Jede INSTANZ bekommt eine eigene Kopie " +
      "der Funktion (sie liegt auf der Instanz, nicht auf dem Prototype). " +
      "Bei 10.000 Buttons = 10.000 Kopien von onClick im Speicher. " +
      "Prototype-Methoden (normale Methoden) werden nur einmal gespeichert " +
      "und von allen Instanzen geteilt.",
    concept: "Arrow Fields vs Prototype Methods / Memory",
    difficulty: 4,
  },

  // ─── 8: Klassen sind Referenztypen, Interfaces sind Werttypen ─────────
  {
    id: "21-class-reference-interface-value",
    title: "Klassen sind Referenztypen, Interfaces sind Werttypen",
    code: `interface Point {
  x: number;
  y: number;
}

class PointClass {
  constructor(public x: number, public y: number) {}
}

const a: Point = { x: 1, y: 2 };
const b: Point = a;
b.x = 99;
console.log(a.x); // ???

const c = new PointClass(1, 2);
const d = c;
d.x = 99;
console.log(c.x); // ???`,
    commonBelief:
      "Interface-typisierte Objekte sind Werttypen (werden kopiert), " +
      "Klassen-Instanzen sind Referenztypen (werden referenziert). " +
      "Deshalb aendert `b.x = 99` den Wert von `a.x` nicht.",
    reality:
      "BEIDE geben 99 aus! In JavaScript sind ALLE Objekte Referenztypen — " +
      "egal ob sie via Klasse, Interface oder Objekt-Literal erstellt wurden. " +
      "Der Interface-Typ aendert nichts am Laufzeitverhalten. " +
      "`const b = a` kopiert die REFERENZ, nicht das Objekt. " +
      "Interfaces existieren zur Laufzeit nicht (Type Erasure).",
    concept: "Referenztypen / Interface = kein Laufzeit-Konzept",
    difficulty: 3,
  },
];
