/**
 * Lektion 13 - Exercise 06: Praxis-Integration
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/06-praxis-integration.ts
 *
 * 4 Aufgaben — alles zusammen: Generics in realistischen Szenarien.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Typsicherer Event-Emitter
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle einen typsicheren Event-Emitter:
// interface TypedEmitter<TEvents extends Record<string, unknown>>
// Methoden: on, emit (beide generisch ueber die Events)
// function createEmitter...

// Tests:
// interface AppEvents {
//   "user:login": { userId: string };
//   "user:logout": { userId: string };
//   "message": { text: string; from: string };
// }
// const emitter = createEmitter<AppEvents>();
// emitter.on("user:login", data => console.log(`Login: ${data.userId}`));
// emitter.emit("user:login", { userId: "123" });
// emitter.emit("message", { text: "Hallo", from: "System" });

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Generic Repository Pattern
// ═══════════════════════════════════════════════════════════════════════════

// interface Entity { id: number; }

// TODO: Erstelle ein generisches Repository-Interface und implementiere es:
// interface Repository<T extends Entity>
// Methoden: findById, findAll, save, update, delete
// function createRepository...

// Tests:
// interface User extends Entity { name: string; email: string; }
// const userRepo = createRepository<User>();
// userRepo.save({ id: 1, name: "Max", email: "max@test.de" });
// userRepo.save({ id: 2, name: "Anna", email: "anna@test.de" });
// console.log(userRepo.findById(1));  // { id: 1, name: "Max", ... }
// console.log(userRepo.findAll());    // Alle User

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Typsichere Konfiguration
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ein typsicheres Config-System:
// function createConfig<T extends Record<string, unknown>>(defaults: T)
// Rueckgabe: { get<K extends keyof T>(key: K): T[K], set<K extends keyof T>(key: K, value: T[K]): void }
// function createConfig...

// Tests:
// const config = createConfig({
//   host: "localhost",
//   port: 3000,
//   debug: false,
// });
// const host = config.get("host"); // string
// const port = config.get("port"); // number
// config.set("port", 8080);        // OK
// config.set("port", "8080");      // Soll Error sein! string !== number

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Async Pipeline
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle eine Funktion "asyncPipe" die einen Wert durch
// eine Reihe von async-Transformationen leitet.
// async function asyncPipe<T>(initial: T, ...fns: ((arg: T) => Promise<T>)[]): Promise<T>
// async function asyncPipe...

// Tests:
// const result = await asyncPipe(
//   5,
//   async n => n * 2,     // 10
//   async n => n + 3,     // 13
//   async n => n * n,     // 169
// );
// console.log(result); // 169
