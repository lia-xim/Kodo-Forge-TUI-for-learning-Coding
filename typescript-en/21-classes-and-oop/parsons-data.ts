/**
 * Lesson 21 — Parson's Problems: Classes & OOP
 *
 * 4 problems for ordering lines of code.
 * Concepts: Inheritance, Abstract Class, Singleton, Mixin
 */

import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  // ─── Problem 1: Simple Inheritance with super ──────────────────────────
  {
    id: "L21-P1",
    title: "Inheritance with extends and super",
    description:
      "Arrange the lines so that a class 'Employee' inherits from 'Person'. " +
      "Employee has an additional field 'role' and overrides greet().",
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
      "    this.name = name; // ERROR: super() missing!",
    ],
    hint:
      "super() must be the FIRST statement in the constructor. " +
      "Without super(), 'this' is not initialized. " +
      "override marks the intentional override of greet().",
    concept: "extends-super-override",
    difficulty: 2,
  },

  // ─── Problem 2: Abstract Class with Template Method ────────────────────
  {
    id: "L21-P2",
    title: "Abstract Class with Template Method Pattern",
    description:
      "Arrange the lines so that an abstract class 'Formatter' " +
      "implements the Template Method Pattern: format() is abstract, " +
      "output() uses format() and adds a header.",
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
      "Abstract methods have NO body (no { ... }). " +
      "Subclasses use 'extends', not 'implements', for classes. " +
      "'implements' inherits no code — extends does.",
    concept: "abstract-template-method",
    difficulty: 3,
  },

  // ─── Problem 3: Singleton Pattern ──────────────────────────────────────
  {
    id: "L21-P3",
    title: "Singleton with private Constructor",
    description:
      "Arrange the lines so that a correct singleton is created: " +
      "private constructor, static instance, static getInstance().",
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
      "The constructor MUST be private so that 'new Database()' is not " +
      "possible from outside. The instance is stored in a static field " +
      "and returned via getInstance() (Lazy Init).",
    concept: "singleton-pattern",
    difficulty: 3,
  },

  // ─── Problem 4: Implementing Interfaces ────────────────────────────────
  {
    id: "L21-P4",
    title: "Implementing Multiple Interfaces",
    description:
      "Arrange the lines so that a class 'SmartDevice' " +
      "implements two interfaces: Switchable and Loggable.",
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
      "Interfaces are specified with 'implements' (not extends). " +
      "Multiple interfaces are separated by commas. " +
      "extends is for class inheritance, implements is for interface contracts.",
    concept: "implements-multiple",
    difficulty: 2,
  },
];