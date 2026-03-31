/**
 * Lektion 06 — Transfer Tasks: Functions
 *
 * Konzepte aus der Functions-Lektion in neuen Kontexten:
 *  1. Validierungsbibliothek mit Type Guards und Assertion Functions
 *  2. Event-System mit Overloads und Callbacks
 *  3. Middleware-Pipeline mit Currying
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

export const transferTasks: TransferTask[] = [
  // ─── Task 1: Validierungsbibliothek ───────────────────────────────────
  {
    id: "06-validation-library",
    title: "Typsichere Validierungsbibliothek",
    prerequisiteLessons: [6],
    scenario:
      "Du arbeitest an einer API die JSON-Daten von externen Quellen empfaengt. " +
      "Bisher castest du alles mit `as` — und letzte Woche ist die App " +
      "abgestuerzt, weil ein Feld fehlte. Du brauchst eine Validierungs-Loesung " +
      "die Laufzeit-Checks UND Compile-Zeit-Sicherheit bietet.",
    task:
      "Erstelle eine kleine Validierungsbibliothek:\n\n" +
      "1. Schreibe einen Type Guard `isUser(data: unknown): data is User` " +
      "   der alle Properties prueft\n" +
      "2. Schreibe eine Assertion Function `assertUser(data: unknown): asserts data is User` " +
      "   die bei Misserfolg einen beschreibenden Error wirft\n" +
      "3. Schreibe eine generische Wrapper-Funktion " +
      "   `validate<T>(data: unknown, guard: (d: unknown) => d is T): T` " +
      "   die den Guard aufruft und bei Misserfolg wirft\n" +
      "4. Teste alle drei Varianten mit gueltigem und ungueltigem Input",
    starterCode: [
      "interface User {",
      "  name: string;",
      "  email: string;",
      "  age: number;",
      "}",
      "",
      "// 1. Type Guard",
      "function isUser(data: unknown): /* TODO */ {",
      "  // TODO: Pruefe alle Properties",
      "}",
      "",
      "// 2. Assertion Function",
      "function assertUser(data: unknown): /* TODO */ {",
      "  // TODO: Wirf bei Misserfolg",
      "}",
      "",
      "// 3. Generischer Validator",
      "function validate<T>(data: unknown, guard: /* TODO */): T {",
      "  // TODO",
      "}",
    ].join("\n"),
    solutionCode: [
      "interface User {",
      "  name: string;",
      "  email: string;",
      "  age: number;",
      "}",
      "",
      "// 1. Type Guard: Prueft ALLE Properties mit korrekten Typen",
      "function isUser(data: unknown): data is User {",
      "  return (",
      "    typeof data === 'object' &&",
      "    data !== null &&",
      "    'name' in data &&",
      "    'email' in data &&",
      "    'age' in data &&",
      "    typeof (data as User).name === 'string' &&",
      "    typeof (data as User).email === 'string' &&",
      "    typeof (data as User).age === 'number'",
      "  );",
      "}",
      "",
      "// 2. Assertion Function: Wirft bei Misserfolg",
      "function assertUser(data: unknown): asserts data is User {",
      "  if (!isUser(data)) {",
      "    throw new Error(",
      "      `Erwartet User, erhalten: ${JSON.stringify(data)}`",
      "    );",
      "  }",
      "}",
      "",
      "// 3. Generischer Validator: Wiederverwendbar fuer jeden Type Guard",
      "function validate<T>(data: unknown, guard: (d: unknown) => d is T): T {",
      "  if (!guard(data)) {",
      "    throw new Error(`Validierung fehlgeschlagen: ${JSON.stringify(data)}`);",
      "  }",
      "  return data; // TypeScript weiss: data ist T",
      "}",
      "",
      "// Testen:",
      "const goodData = { name: 'Max', email: 'max@test.de', age: 30 };",
      "const badData = { name: 'Max' }; // email und age fehlen",
      "",
      "// Type Guard (if/else)",
      "if (isUser(goodData)) {",
      "  console.log(goodData.email); // TypeScript weiss: User",
      "}",
      "",
      "// Assertion Function (wirft oder garantiert)",
      "assertUser(goodData);",
      "console.log(goodData.name); // TypeScript weiss: User",
      "",
      "// Generischer Validator",
      "const user = validate(goodData, isUser);",
      "console.log(user.age); // TypeScript weiss: User",
    ].join("\n"),
    conceptsBridged: [
      "Type Guards (value is T)",
      "Assertion Functions (asserts value is T)",
      "Generics mit Type Guard Callbacks",
      "Laufzeit-Validierung + Compile-Zeit-Sicherheit",
    ],
    hints: [
      "Ein Type Guard gibt boolean zurueck mit 'value is Type' als Annotation. " +
        "Pruefe typeof fuer jede Property.",
      "Die Assertion Function kann den Type Guard intern verwenden — " +
        "assertUser ruft isUser auf und wirft bei false.",
      "Der generische Validator nimmt einen Guard als Parameter. " +
        "Der Typ des Guards ist (d: unknown) => d is T.",
    ],
    difficulty: 3,
  },

  // ─── Task 2: Event-System mit Overloads ───────────────────────────────
  {
    id: "06-event-system",
    title: "Typsicheres Event-System",
    prerequisiteLessons: [6],
    scenario:
      "Du baust ein Custom-Event-System fuer eine Single-Page-App. " +
      "Verschiedene Events haben verschiedene Payloads. Bisher ist alles " +
      "`any` und Entwickler muessen raten welche Daten ein Event enthaelt.",
    task:
      "Erstelle ein typsicheres Event-System:\n\n" +
      "1. Definiere eine Event-Map (Interface) die Event-Namen " +
      "   auf ihre Payload-Typen mappt\n" +
      "2. Schreibe `on(event, callback)` mit Overloads, sodass " +
      "   der Callback-Parameter den richtigen Event-Typ bekommt\n" +
      "3. Schreibe `emit(event, payload)` das den richtigen " +
      "   Payload-Typ erzwingt\n" +
      "4. Die on-Funktion soll eine Unsubscribe-Funktion zurueckgeben",
    starterCode: [
      "// Event-Map: Name -> Payload",
      "interface EventMap {",
      "  'user:login': { userId: string; timestamp: Date };",
      "  'user:logout': { userId: string };",
      "  'page:view': { path: string; referrer?: string };",
      "}",
      "",
      "// TODO: on() mit Overloads",
      "// TODO: emit() mit Typ-Sicherheit",
      "// TODO: Unsubscribe-Funktion",
    ].join("\n"),
    solutionCode: [
      "interface EventMap {",
      "  'user:login': { userId: string; timestamp: Date };",
      "  'user:logout': { userId: string };",
      "  'page:view': { path: string; referrer?: string };",
      "}",
      "",
      "type Unsubscribe = () => void;",
      "type EventCallback<T> = (payload: T) => void;",
      "",
      "const listeners = new Map<string, Set<EventCallback<unknown>>>();",
      "",
      "// Overloads: Jeder Event-Name bekommt den richtigen Callback-Typ",
      "function on(event: 'user:login', cb: EventCallback<EventMap['user:login']>): Unsubscribe;",
      "function on(event: 'user:logout', cb: EventCallback<EventMap['user:logout']>): Unsubscribe;",
      "function on(event: 'page:view', cb: EventCallback<EventMap['page:view']>): Unsubscribe;",
      "function on(event: string, cb: EventCallback<unknown>): Unsubscribe {",
      "  if (!listeners.has(event)) listeners.set(event, new Set());",
      "  listeners.get(event)!.add(cb);",
      "  return () => { listeners.get(event)?.delete(cb); };",
      "}",
      "",
      "// emit: Payload-Typ wird durch Event-Name bestimmt",
      "function emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {",
      "  listeners.get(event)?.forEach(cb => cb(payload));",
      "}",
      "",
      "// Verwendung:",
      "const unsub = on('user:login', (payload) => {",
      "  console.log(payload.userId);    // TypeScript kennt den Typ",
      "  console.log(payload.timestamp); // Date — praezise!",
      "});",
      "",
      "emit('user:login', { userId: '123', timestamp: new Date() });",
      "unsub(); // Listener entfernen",
    ].join("\n"),
    conceptsBridged: [
      "Function Overloads (Event-Name -> Callback-Typ)",
      "Generics (emit mit keyof)",
      "Callback-Typen (EventCallback<T>)",
      "Unsubscribe-Pattern (Factory Function)",
    ],
    hints: [
      "Definiere zuerst die Callback- und Unsubscribe-Typen. " +
        "EventCallback<T> ist (payload: T) => void.",
      "Die on-Funktion braucht Overloads fuer jeden Event-Namen. " +
        "Jeder Overload verknuepft den Event-Namen mit dem Callback-Typ.",
      "emit kann generisch sein: emit<K extends keyof EventMap>(event: K, payload: EventMap[K]).",
    ],
    difficulty: 4,
  },
];
