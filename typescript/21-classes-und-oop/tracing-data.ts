/**
 * Lektion 21 — Tracing-Exercises: Classes & OOP
 *
 * 4 Exercises zum Verfolgen von:
 *  - Vererbung und Polymorphie
 *  - this-Kontext in verschiedenen Situationen
 *  - Static vs Instance Members
 *  - Abstract Classes und Method Dispatch
 *
 * Schwierigkeit steigend: 1 -> 4
 */

import type { TracingExercise } from "../tools/tracing-engine.ts";

export const tracingExercises: TracingExercise[] = [
  // ─── Exercise 1: Vererbung und Polymorphie ──────────────────────────────
  {
    id: "21-inheritance-polymorphism",
    title: "Vererbung — Welche Methode wird aufgerufen?",
    description:
      "Verfolge, welche Version einer Methode aufgerufen wird, " +
      "wenn verschiedene Klassen die gleiche Methode ueberschreiben.",
    code: [
      "class Animal {",
      "  speak(): string { return 'Stille'; }",
      "}",
      "class Dog extends Animal {",
      "  override speak(): string { return 'Wuff!'; }",
      "}",
      "class Cat extends Animal {",
      "  override speak(): string { return 'Miau!'; }",
      "}",
      "",
      "const animals: Animal[] = [new Dog(), new Cat(), new Animal()];",
      "const sounds = animals.map(a => a.speak());",
      "console.log(sounds);",
    ],
    steps: [
      {
        lineIndex: 10,
        question:
          "Welche Typen haben die Elemente im Array?",
        expectedAnswer: "Dog, Cat, Animal (alle als Animal[] typisiert)",
        variables: { "animals": "[Dog, Cat, Animal]" },
        explanation:
          "Das Array ist als Animal[] typisiert, aber die Elemente " +
          "sind Instanzen verschiedener Subklassen. TypeScript erlaubt " +
          "das wegen Vererbung — Dog IS-A Animal.",
      },
      {
        lineIndex: 11,
        question:
          "Welche speak()-Version wird fuer animals[0] (Dog) aufgerufen?",
        expectedAnswer: "Dog.speak() → 'Wuff!'",
        variables: { "animals[0].speak()": "Wuff!" },
        explanation:
          "Polymorphie: Obwohl das Array als Animal[] typisiert ist, " +
          "ruft JavaScript die UEBERSCHRIEBENE Version von speak() auf. " +
          "Dog hat override speak(), also wird Dog.speak() ausgefuehrt.",
      },
      {
        lineIndex: 11,
        question:
          "Was ist der Wert von 'sounds' nach der map()-Operation?",
        expectedAnswer: "['Wuff!', 'Miau!', 'Stille']",
        variables: { "sounds": "['Wuff!', 'Miau!', 'Stille']" },
        explanation:
          "Jedes Element ruft SEINE Version von speak() auf: " +
          "Dog → 'Wuff!', Cat → 'Miau!', Animal → 'Stille'. " +
          "Das ist Polymorphie in Aktion — ein gemeinsames Interface, " +
          "verschiedene Implementierungen.",
      },
    ],
    concept: "polymorphism",
    difficulty: 1,
  },

  // ─── Exercise 2: this-Kontext ──────────────────────────────────────────
  {
    id: "21-this-context",
    title: "Der this-Kontext — wann geht er verloren?",
    description:
      "Verfolge den Wert von 'this' in verschiedenen Aufruf-Szenarien.",
    code: [
      "class Greeter {",
      "  name: string = 'Welt';",
      "",
      "  greet(): string {",
      "    return `Hallo, ${this.name}!`;",
      "  }",
      "",
      "  greetArrow = (): string => {",
      "    return `Hallo, ${this.name}!`;",
      "  };",
      "}",
      "",
      "const g = new Greeter();",
      "const normalFn = g.greet;",
      "const arrowFn = g.greetArrow;",
      "",
      "// g.greet();     → ???",
      "// normalFn();    → ???",
      "// arrowFn();     → ???",
    ],
    steps: [
      {
        lineIndex: 16,
        question:
          "Was gibt g.greet() zurueck?",
        expectedAnswer: "Hallo, Welt!",
        variables: { "this": "Greeter-Instanz", "this.name": "Welt" },
        explanation:
          "g.greet() ruft die Methode mit g als this auf. " +
          "this.name ist 'Welt', also: 'Hallo, Welt!'.",
      },
      {
        lineIndex: 17,
        question:
          "Was passiert bei normalFn()? (const normalFn = g.greet)",
        expectedAnswer: "TypeError: Cannot read properties of undefined (reading 'name')",
        variables: { "this": "undefined (strict mode)" },
        explanation:
          "normalFn() ruft die Funktion OHNE Objekt-Kontext auf. " +
          "In strict mode ist 'this' dann undefined. " +
          "'undefined.name' wirft einen TypeError. " +
          "Das ist das klassische this-Binding-Problem.",
      },
      {
        lineIndex: 18,
        question:
          "Was gibt arrowFn() zurueck?",
        expectedAnswer: "Hallo, Welt!",
        variables: { "this": "Greeter-Instanz (lexical binding)" },
        explanation:
          "Arrow-Functions als Klassen-Felder fangen 'this' lexikalisch ein. " +
          "Egal wie arrowFn aufgerufen wird — this ist IMMER die Greeter-Instanz. " +
          "Deshalb funktioniert arrowFn() korrekt.",
      },
    ],
    concept: "this-binding",
    difficulty: 2,
  },

  // ─── Exercise 3: Static vs Instance ────────────────────────────────────
  {
    id: "21-static-vs-instance",
    title: "Static vs Instance — Getrennte Welten",
    description:
      "Verfolge den Unterschied zwischen static und instance Feldern.",
    code: [
      "class Counter {",
      "  static total: number = 0;",
      "  count: number = 0;",
      "",
      "  increment(): void {",
      "    this.count++;",
      "    Counter.total++;",
      "  }",
      "}",
      "",
      "const a = new Counter();",
      "const b = new Counter();",
      "a.increment();",
      "a.increment();",
      "b.increment();",
      "",
      "console.log(a.count);        // ???",
      "console.log(b.count);        // ???",
      "console.log(Counter.total);  // ???",
    ],
    steps: [
      {
        lineIndex: 12,
        question:
          "Nach a.increment() und a.increment(): Welchen Wert haben a.count und Counter.total?",
        expectedAnswer: "a.count = 2, Counter.total = 2",
        variables: { "a.count": "2", "b.count": "0", "Counter.total": "2" },
        explanation:
          "Jeder increment()-Aufruf erhoeht das Instanz-Feld (this.count) " +
          "und das static Feld (Counter.total). a wurde 2x inkrementiert.",
      },
      {
        lineIndex: 14,
        question:
          "Nach b.increment(): Was sind a.count, b.count, Counter.total?",
        expectedAnswer: "a.count = 2, b.count = 1, Counter.total = 3",
        variables: { "a.count": "2", "b.count": "1", "Counter.total": "3" },
        explanation:
          "b hat sein EIGENES count-Feld (startet bei 0, jetzt 1). " +
          "Counter.total ist GETEILT zwischen allen Instanzen — " +
          "es zaehlt alle increment()-Aufrufe insgesamt (2+1=3).",
      },
      {
        lineIndex: 16,
        question:
          "Warum ist a.count != b.count aber Counter.total = 3?",
        expectedAnswer: "Instance-Felder sind pro Instanz, static Felder sind global",
        variables: { "a.count": "2", "b.count": "1", "Counter.total": "3" },
        explanation:
          "Das ist der Kern von static vs instance: " +
          "Instance-Felder (this.count) gehoeren der Instanz — jede hat ihre Kopie. " +
          "Static-Felder (Counter.total) gehoeren der KLASSE — " +
          "es gibt nur eine Kopie, geteilt von allen.",
      },
    ],
    concept: "static-vs-instance",
    difficulty: 2,
  },

  // ─── Exercise 4: Abstract + Polymorphie + super ────────────────────────
  {
    id: "21-abstract-polymorphism",
    title: "Abstract Class — Method Dispatch und super",
    description:
      "Verfolge den Kontrollfluss durch eine abstrakte Klasse " +
      "mit Template Method Pattern und super-Aufrufen.",
    code: [
      "abstract class Processor {",
      "  process(data: string): string {",
      "    const prepared = this.prepare(data);",
      "    const result = this.transform(prepared);",
      "    return `[DONE] ${result}`;",
      "  }",
      "  protected prepare(data: string): string {",
      "    return data.trim();",
      "  }",
      "  abstract transform(data: string): string;",
      "}",
      "",
      "class UpperProcessor extends Processor {",
      "  override transform(data: string): string {",
      "    return data.toUpperCase();",
      "  }",
      "  override prepare(data: string): string {",
      "    return super.prepare(data) + '!';",
      "  }",
      "}",
      "",
      "const p = new UpperProcessor();",
      "console.log(p.process('  hello  '));",
    ],
    steps: [
      {
        lineIndex: 22,
        question:
          "Wenn p.process('  hello  ') aufgerufen wird — welche Klasse hat process()?",
        expectedAnswer: "Processor (geerbt, nicht ueberschrieben)",
        variables: { "data": "  hello  " },
        explanation:
          "UpperProcessor hat process() nicht ueberschrieben, also wird " +
          "Processor.process() ausgefuehrt. Aber INNERHALB von process() " +
          "werden this.prepare() und this.transform() aufgerufen — " +
          "und 'this' ist UpperProcessor!",
      },
      {
        lineIndex: 2,
        question:
          "Was gibt this.prepare('  hello  ') zurueck? (Welche Version?)",
        expectedAnswer: "'hello!' (UpperProcessor.prepare: trim + '!')",
        variables: { "prepared": "hello!" },
        explanation:
          "UpperProcessor ueberschreibt prepare(). Es ruft super.prepare() " +
          "(das trim) auf und haengt '!' an. " +
          "Ergebnis: '  hello  '.trim() + '!' = 'hello!'.",
      },
      {
        lineIndex: 3,
        question:
          "Was gibt this.transform('hello!') zurueck?",
        expectedAnswer: "'HELLO!'",
        variables: { "result": "HELLO!" },
        explanation:
          "transform() ist abstract in Processor und ueberschrieben in " +
          "UpperProcessor: data.toUpperCase(). 'hello!'.toUpperCase() = 'HELLO!'.",
      },
      {
        lineIndex: 4,
        question:
          "Was ist das Endergebnis von p.process('  hello  ')?",
        expectedAnswer: "[DONE] HELLO!",
        variables: { "return": "[DONE] HELLO!" },
        explanation:
          "process() setzt alles zusammen: prepare → transform → formatieren. " +
          "Obwohl process() in Processor definiert ist, nutzt es die " +
          "UEBERSCHRIEBENEN Versionen aus UpperProcessor. " +
          "Das ist das Template Method Pattern in Aktion.",
      },
    ],
    concept: "abstract-template-method",
    difficulty: 4,
  },
];
