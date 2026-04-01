/**
 * Lektion 21 — Parson's Problems: Classes & OOP
 *
 * 4 Problems zum Ordnen von Code-Zeilen.
 * Konzepte: Vererbung, Abstract Class, Singleton, Mixin
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  // ─── Problem 1: Einfache Vererbung mit super ───────────────────────────
  {
    id: "L21-P1",
    title: "Vererbung mit extends und super",
    description:
      "Ordne die Zeilen so, dass eine Klasse 'Employee' von 'Person' erbt. " +
      "Employee hat ein zusaetzliches Feld 'role' und ueberschreibt greet().",
    correctOrder: [
      "class Person {",
      "  constructor(public name: string) {}",
      "  greet(): string { return `Hi, ${this.name}`; }",
      "}",
      "class Employee extends Person {",
      "  constructor(name: string, public role: string) {",
      "    super(name);",
      "  }",
      "  override greet(): string {",
      "    return `${super.greet()} — ${this.role}`;",
      "  }",
      "}",
    ],
    distractors: [
      "  constructor(name: string, public role: string) {",
      "    this.name = name; // FEHLER: super() fehlt!",
    ],
    hint:
      "super() muss als ERSTE Anweisung im Constructor stehen. " +
      "Ohne super() ist 'this' nicht initialisiert. " +
      "override markiert die bewusste Ueberschreibung von greet().",
    concept: "extends-super-override",
    difficulty: 2,
  },

  // ─── Problem 2: Abstract Class mit Template Method ──────────────────────
  {
    id: "L21-P2",
    title: "Abstract Class mit Template Method Pattern",
    description:
      "Ordne die Zeilen so, dass eine abstrakte Klasse 'Formatter' " +
      "das Template Method Pattern implementiert: format() ist abstrakt, " +
      "output() nutzt format() und fuegt einen Header hinzu.",
    correctOrder: [
      "abstract class Formatter {",
      "  abstract format(data: string): string;",
      "  output(data: string): void {",
      "    console.log('=== Output ===');",
      "    console.log(this.format(data));",
      "  }",
      "}",
      "class JsonFormatter extends Formatter {",
      "  override format(data: string): string {",
      "    return JSON.stringify({ data });",
      "  }",
      "}",
    ],
    distractors: [
      "  format(data: string): string { return data; }",
      "class JsonFormatter implements Formatter {",
    ],
    hint:
      "Abstract methods haben KEINEN Body (kein { ... }). " +
      "Subklassen verwenden 'extends', nicht 'implements', bei Klassen. " +
      "'implements' erbt keinen Code — extends schon.",
    concept: "abstract-template-method",
    difficulty: 3,
  },

  // ─── Problem 3: Singleton-Pattern ──────────────────────────────────────
  {
    id: "L21-P3",
    title: "Singleton mit private Constructor",
    description:
      "Ordne die Zeilen so, dass ein korrektes Singleton entsteht: " +
      "private Constructor, static instance, static getInstance().",
    correctOrder: [
      "class Database {",
      "  private static instance: Database | null = null;",
      "  private constructor(private url: string) {}",
      "  static getInstance(): Database {",
      "    if (Database.instance === null) {",
      "      Database.instance = new Database('localhost');",
      "    }",
      "    return Database.instance;",
      "  }",
      "}",
    ],
    distractors: [
      "  constructor(private url: string) {}",
      "  public static instance: Database = new Database('localhost');",
    ],
    hint:
      "Der Constructor MUSS private sein, damit 'new Database()' von " +
      "aussen nicht moeglich ist. Die Instanz wird in einem static Feld " +
      "gespeichert und ueber getInstance() zurueckgegeben (Lazy Init).",
    concept: "singleton-pattern",
    difficulty: 3,
  },

  // ─── Problem 4: Interface implementieren ───────────────────────────────
  {
    id: "L21-P4",
    title: "Mehrere Interfaces implementieren",
    description:
      "Ordne die Zeilen so, dass eine Klasse 'SmartDevice' " +
      "zwei Interfaces implementiert: Switchable und Loggable.",
    correctOrder: [
      "interface Switchable {",
      "  turnOn(): void;",
      "  turnOff(): void;",
      "}",
      "interface Loggable {",
      "  log(message: string): void;",
      "}",
      "class SmartDevice implements Switchable, Loggable {",
      "  private isOn: boolean = false;",
      "  turnOn(): void { this.isOn = true; }",
      "  turnOff(): void { this.isOn = false; }",
      "  log(message: string): void { console.log(message); }",
      "}",
    ],
    distractors: [
      "class SmartDevice extends Switchable, Loggable {",
      "class SmartDevice implements Switchable extends Loggable {",
    ],
    hint:
      "Interfaces werden mit 'implements' angegeben (nicht extends). " +
      "Mehrere Interfaces werden mit Komma getrennt. " +
      "extends ist fuer Klassen-Vererbung, implements fuer Interface-Vertraege.",
    concept: "implements-multiple",
    difficulty: 2,
  },
];
