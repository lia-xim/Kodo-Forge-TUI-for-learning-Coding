/**
 * Lektion 21 — Debugging Challenges: Classes & OOP
 *
 * 5 Challenges zu typischen Klassen-Bugs in TypeScript.
 */

import type { DebuggingChallenge } from "../tools/debugging-engine.ts";

export const debuggingChallenges: DebuggingChallenge[] = [
  // ─── Challenge 1: super() vergessen ───────────────────────────────────
  {
    id: "L21-D1",
    title: "super() im Constructor vergessen",
    buggyCode: [
      "class Animal {",
      "  constructor(public name: string) {}",
      "}",
      "",
      "class Dog extends Animal {",
      "  constructor(name: string, public breed: string) {",
      "    this.breed = breed;",
      "  }",
      "}",
    ].join("\n"),
    errorMessage: "'super' must be called before accessing 'this' in the constructor of a derived class.",
    bugType: "type-error",
    bugLine: 7,
    options: [
      "super() fehlt — muss als ERSTE Anweisung im Subklassen-Constructor stehen",
      "this.breed darf nicht im Constructor gesetzt werden",
      "Dog muss 'implements' statt 'extends' verwenden",
      "Der Constructor braucht keinen breed-Parameter",
    ],
    correctOption: 0,
    hints: [
      "Subklassen-Constructors muessen die Elternklasse initialisieren. Wie?",
      "super() ruft den Eltern-Constructor auf und MUSS vor 'this'-Zugriff kommen.",
      "Fuege 'super(name);' als erste Zeile im Dog-Constructor ein.",
    ],
    fixedCode: [
      "class Animal {",
      "  constructor(public name: string) {}",
      "}",
      "",
      "class Dog extends Animal {",
      "  constructor(name: string, public breed: string) {",
      "    super(name);",
      "  }",
      "}",
    ].join("\n"),
    explanation:
      "In einer Subklasse muss super() als ERSTE Anweisung im Constructor " +
      "aufgerufen werden — vor jedem Zugriff auf 'this'. Ohne super() ist " +
      "'this' noch nicht initialisiert. Mit Parameter Properties (public breed) " +
      "passiert die Zuweisung automatisch NACH super(), also reicht es, " +
      "super(name) einzufuegen.",
    concept: "super-aufruf",
    difficulty: 1,
  },

  // ─── Challenge 2: this-Kontext verloren ───────────────────────────────
  {
    id: "L21-D2",
    title: "this-Kontext als Callback verloren",
    buggyCode: [
      "class Timer {",
      "  seconds: number = 0;",
      "",
      "  tick(): void {",
      "    this.seconds++;",
      "    console.log(this.seconds);",
      "  }",
      "",
      "  start(): void {",
      "    setInterval(this.tick, 1000);",
      "  }",
      "}",
      "",
      "const timer = new Timer();",
      "timer.start(); // Error: Cannot read properties of undefined",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "runtime-error",
    bugLine: 10,
    options: [
      "setInterval kann keine Klassen-Methoden ausfuehren",
      "this.tick verliert den this-Kontext — 'this' ist undefined im Callback",
      "seconds muss static sein fuer setInterval",
      "Timer muss von EventEmitter erben",
    ],
    correctOption: 1,
    hints: [
      "Was passiert mit 'this', wenn du eine Methode als Callback uebergibst?",
      "'const fn = obj.method; fn()' — welches 'this' hat fn()?",
      "Loesung: Arrow-Function (this.tick = () => {...}) oder setInterval(() => this.tick(), 1000).",
    ],
    fixedCode: [
      "class Timer {",
      "  seconds: number = 0;",
      "",
      "  tick = (): void => {",
      "    this.seconds++;",
      "    console.log(this.seconds);",
      "  };",
      "",
      "  start(): void {",
      "    setInterval(this.tick, 1000);",
      "  }",
      "}",
    ].join("\n"),
    explanation:
      "In JavaScript haengt 'this' vom Aufruf-Kontext ab. " +
      "'setInterval(this.tick, 1000)' speichert die FUNKTION tick, " +
      "aber nicht den Kontext (das Timer-Objekt). Wenn setInterval " +
      "tick() aufruft, ist 'this' undefined (strict mode). " +
      "Loesung: Arrow-Function als Klassen-Feld (tick = () => {...}) " +
      "bindet 'this' lexikalisch an die Instanz.",
    concept: "this-binding",
    difficulty: 2,
  },

  // ─── Challenge 3: private zur Laufzeit umgangen ──────────────────────
  {
    id: "L21-D3",
    title: "private schuetzt nicht zur Laufzeit",
    buggyCode: [
      "class SecureVault {",
      "  private secret: string;",
      "",
      "  constructor(secret: string) {",
      "    this.secret = secret;",
      "  }",
      "",
      "  verify(attempt: string): boolean {",
      "    return attempt === this.secret;",
      "  }",
      "}",
      "",
      "const vault = new SecureVault('mein-passwort');",
      "",
      "// 'Sicher' — oder?",
      "const stolen = (vault as any).secret;",
      "console.log(stolen); // 'mein-passwort'",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "soundness-hole",
    bugLine: 2,
    options: [
      "TypeScript's 'private' wird zur Laufzeit entfernt — 'as any' umgeht den Schutz",
      "Der Constructor initialisiert das Feld falsch",
      "'as any' ist ein Syntax-Error",
      "private Felder koennen nicht mit Strings verglichen werden",
    ],
    correctOption: 0,
    hints: [
      "Was passiert mit TypeScript's 'private' nach dem Kompilieren? (Type Erasure)",
      "Im generierten JavaScript gibt es kein 'private' — das Feld ist ein normales Property.",
      "Fuer echten Laufzeit-Schutz verwende '#secret' (ES2022 Private Fields).",
    ],
    fixedCode: [
      "class SecureVault {",
      "  #secret: string;",
      "",
      "  constructor(secret: string) {",
      "    this.#secret = secret;",
      "  }",
      "",
      "  verify(attempt: string): boolean {",
      "    return attempt === this.#secret;",
      "  }",
      "}",
      "",
      "const vault = new SecureVault('mein-passwort');",
      "// (vault as any).#secret; // Syntax-Error — echte Kapselung!",
    ].join("\n"),
    explanation:
      "TypeScript's 'private' ist ein Compilezeit-Feature — zur Laufzeit " +
      "wird es entfernt (Type Erasure). Mit 'as any' kann jeder darauf " +
      "zugreifen. Fuer echten Laufzeit-Schutz muss JavaScript's '#private' " +
      "(ES2022) verwendet werden. '#secret' ist nicht einmal mit " +
      "'as any' zugaenglich und taucht nicht in Object.keys() auf.",
    concept: "private-vs-hash-private",
    difficulty: 2,
  },

  // ─── Challenge 4: abstract Methode vergessen ─────────────────────────
  {
    id: "L21-D4",
    title: "Abstract Methode nicht implementiert",
    buggyCode: [
      "abstract class Validator {",
      "  abstract validate(value: unknown): boolean;",
      "  abstract getErrorMessage(): string;",
      "",
      "  check(value: unknown): string | null {",
      "    if (this.validate(value)) return null;",
      "    return this.getErrorMessage();",
      "  }",
      "}",
      "",
      "class EmailValidator extends Validator {",
      "  validate(value: unknown): boolean {",
      "    return typeof value === 'string' && value.includes('@');",
      "  }",
      "  // getErrorMessage() fehlt!",
      "}",
    ].join("\n"),
    errorMessage:
      "Non-abstract class 'EmailValidator' does not implement inherited abstract member 'getErrorMessage' from class 'Validator'.",
    bugType: "type-error",
    bugLine: 11,
    options: [
      "EmailValidator muss getErrorMessage() implementieren — es ist abstract",
      "validate() muss als 'override' markiert werden",
      "abstract Klassen koennen keine konkreten Methoden haben",
      "extends funktioniert nicht mit abstract classes",
    ],
    correctOption: 0,
    hints: [
      "Zaehle die abstract Methoden in Validator. Sind alle in EmailValidator implementiert?",
      "getErrorMessage() ist abstract — Subklassen MUESSEN sie implementieren.",
      "Fuege 'getErrorMessage(): string { return \"Ungueltige Email\"; }' hinzu.",
    ],
    fixedCode: [
      "abstract class Validator {",
      "  abstract validate(value: unknown): boolean;",
      "  abstract getErrorMessage(): string;",
      "",
      "  check(value: unknown): string | null {",
      "    if (this.validate(value)) return null;",
      "    return this.getErrorMessage();",
      "  }",
      "}",
      "",
      "class EmailValidator extends Validator {",
      "  validate(value: unknown): boolean {",
      "    return typeof value === 'string' && value.includes('@');",
      "  }",
      "",
      "  getErrorMessage(): string {",
      "    return 'Ungueltige E-Mail-Adresse';",
      "  }",
      "}",
    ].join("\n"),
    explanation:
      "Wenn eine Klasse von einer abstract class erbt, MUSS sie alle " +
      "abstrakten Methoden implementieren. EmailValidator implementiert " +
      "nur validate(), aber nicht getErrorMessage(). TypeScript meldet " +
      "den Fehler beim Kompilieren — zur Laufzeit waere es ein undefinierter " +
      "Methodenaufruf, wenn check() getErrorMessage() aufruft.",
    concept: "abstract-implementierung",
    difficulty: 2,
  },

  // ─── Challenge 5: Overriding-Tippfehler ohne override ────────────────
  {
    id: "L21-D5",
    title: "Methode nicht ueberschrieben wegen Tippfehler",
    buggyCode: [
      "class Logger {",
      "  log(message: string): void {",
      "    console.log(`[LOG] ${message}`);",
      "  }",
      "}",
      "",
      "class TimestampLogger extends Logger {",
      "  // Soll log() ueberschreiben, aber Tippfehler!",
      "  logg(message: string): void {",
      "    const time = new Date().toISOString();",
      "    console.log(`[${time}] ${message}`);",
      "  }",
      "}",
      "",
      "const logger = new TimestampLogger();",
      "logger.log('Test'); // [LOG] Test — NICHT mit Timestamp!",
    ].join("\n"),
    errorMessage: undefined,
    bugType: "logic-error",
    bugLine: 9,
    options: [
      "logg() ist ein Tippfehler — log() wird nicht ueberschrieben",
      "TimestampLogger muss 'implements Logger' verwenden",
      "super.log() muss aufgerufen werden",
      "Console.log kann nicht mit Template-Strings verwendet werden",
    ],
    correctOption: 0,
    hints: [
      "Vergleiche den Methodennamen in Logger und TimestampLogger genau.",
      "'logg' != 'log' — die Methode wurde nicht ueberschrieben, sondern eine neue definiert.",
      "Mit 'override' wuerde TypeScript den Tippfehler erkennen: 'override logg()' → Error.",
    ],
    fixedCode: [
      "class Logger {",
      "  log(message: string): void {",
      "    console.log(`[LOG] ${message}`);",
      "  }",
      "}",
      "",
      "class TimestampLogger extends Logger {",
      "  override log(message: string): void {",
      "    const time = new Date().toISOString();",
      "    console.log(`[${time}] ${message}`);",
      "  }",
      "}",
      "",
      "const logger = new TimestampLogger();",
      "logger.log('Test'); // [2024-01-15T...] Test — mit Timestamp!",
    ].join("\n"),
    explanation:
      "'logg' statt 'log' — ein typischer Tippfehler. Ohne 'override' erstellt " +
      "TypeScript einfach eine neue Methode 'logg()' und log() bleibt die " +
      "Eltern-Version. Mit 'override log()' (oder noImplicitOverride: true) " +
      "wuerde TypeScript pruefen, ob die Methode in der Elternklasse existiert — " +
      "und den Tippfehler sofort melden.",
    concept: "override-keyword",
    difficulty: 3,
  },
];
