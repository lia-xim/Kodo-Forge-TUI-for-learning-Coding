/**
 * Lektion 07 - Exercise 03: Discriminated Unions
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/03-discriminated-unions.ts
 *
 * 4 Aufgaben zu Tag-Property, Exhaustive Check, ADTs.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Einfache Discriminated Union
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Definiere drei Interfaces fuer geometrische Formen:
// - Circle: kind = "circle", radius: number
// - Square: kind = "square", sideLength: number
// - Ellipse: kind = "ellipse", radiusX: number, radiusY: number
// Erstelle einen Union Type "Shape" und schreibe eine Funktion "area"
// die die Flaeche berechnet. Nutze einen exhaustive switch mit assertNever.

function assertNever(value: never): never {
  throw new Error(`Unerwarteter Wert: ${JSON.stringify(value)}`);
}

// interface Circle { ... }
// interface Square { ... }
// interface Ellipse { ... }
// type Shape = ...
// function area(shape: Shape): number { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: API Response mit Discriminated Union
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Definiere einen generischen ApiResponse<T> Typ mit vier Zustaenden:
// - idle: Nur status
// - loading: Nur status
// - success: status + data: T
// - error: status + message: string + code: number
// Schreibe eine Funktion "renderResponse" die einen ApiResponse<string[]>
// entgegennimmt und einen passenden Text zurueckgibt.

// type ApiResponse<T> = ...
// function renderResponse(response: ApiResponse<string[]>): string { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Result Type implementieren
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere einen Result<T, E> Typ (Discriminated Union) mit:
// - ok: true + value: T
// - ok: false + error: E
// Schreibe Hilfsfunktionen "succeed" und "fail".
// Schreibe eine Funktion "safeDivide" die Result<number, string> zurueckgibt.
// Schreibe eine Funktion "safeParseInt" die Result<number, string> zurueckgibt.

// type Result<T, E> = ...
// function succeed<T>(value: T): Result<T, never> { ... }
// function fail<E>(error: E): Result<never, E> { ... }
// function safeDivide(a: number, b: number): Result<number, string> { ... }
// function safeParseInt(input: string): Result<number, string> { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Zustandsmaschine
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Modelliere den Lebenszyklus einer Aufgabe (Task) als State Machine:
// - "todo": Nur title und description
// - "in-progress": Zusaetzlich assignedTo: string und startedAt: Date
// - "review": Zusaetzlich reviewedBy: string
// - "done": Zusaetzlich completedAt: Date
// Schreibe Uebergangsfunktionen:
// - startTask(task: TodoTask, assignee: string): InProgressTask
// - submitForReview(task: InProgressTask, reviewer: string): ReviewTask
// - completeTask(task: ReviewTask): DoneTask
// Schreibe eine Funktion "describeTask" die den aktuellen Status beschreibt.

// interface TodoTask { ... }
// interface InProgressTask { ... }
// interface ReviewTask { ... }
// interface DoneTask { ... }
// type TaskState = ...

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

/*
// Test Aufgabe 1
console.assert(Math.abs(area({ kind: "circle", radius: 5 }) - 78.54) < 0.01, "area circle");
console.assert(area({ kind: "square", sideLength: 4 }) === 16, "area square");
console.assert(Math.abs(area({ kind: "ellipse", radiusX: 3, radiusY: 5 }) - 47.12) < 0.01, "area ellipse");

// Test Aufgabe 2
console.assert(renderResponse({ status: "idle" }).includes("idle") || renderResponse({ status: "idle" }).includes("Idle"), "render idle");
console.assert(renderResponse({ status: "loading" }).includes("Laden") || renderResponse({ status: "loading" }).includes("load"), "render loading");
console.assert(renderResponse({ status: "success", data: ["a", "b"] }).includes("2"), "render success");
console.assert(renderResponse({ status: "error", message: "Nope", code: 500 }).includes("500"), "render error");

// Test Aufgabe 3
const divOk = safeDivide(10, 3);
console.assert(divOk.ok === true && Math.abs((divOk as any).value - 3.33) < 0.01, "safeDivide ok");
const divErr = safeDivide(10, 0);
console.assert(divErr.ok === false, "safeDivide error");
const parseOk = safeParseInt("42");
console.assert(parseOk.ok === true && (parseOk as any).value === 42, "safeParseInt ok");
const parseErr = safeParseInt("abc");
console.assert(parseErr.ok === false, "safeParseInt error");

// Test Aufgabe 4
const todo = { status: "todo" as const, title: "Feature X", description: "Build it" };
const inProgress = startTask(todo, "Alice");
console.assert(inProgress.status === "in-progress", "startTask");
const review = submitForReview(inProgress, "Bob");
console.assert(review.status === "review", "submitForReview");
const done = completeTask(review);
console.assert(done.status === "done", "completeTask");

console.log("Alle Tests bestanden!");
*/
