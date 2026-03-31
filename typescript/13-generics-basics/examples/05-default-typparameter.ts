/**
 * Lektion 13 - Example 05: Default-Typparameter
 *
 * Ausfuehren mit: npx tsx examples/05-default-typparameter.ts
 *
 * Default Types <T = string>, Reihenfolge-Regeln, Praxis-Patterns.
 */

// ─── GRUNDSYNTAX ────────────────────────────────────────────────────────────

interface Container<T = string> {
  value: T;
  label: string;
}

console.log("=== Default-Typparameter ===");

// Ohne Typ: Default greift (T = string)
const textContainer: Container = { value: "Hallo Welt", label: "text" };
console.log(`Default: ${textContainer.label} = ${textContainer.value}`);

// Mit explizitem Typ: Default wird ueberschrieben
const numContainer: Container<number> = { value: 42, label: "zahl" };
console.log(`Explizit: ${numContainer.label} = ${numContainer.value}`);

// ─── DEFAULT MIT CONSTRAINT ─────────────────────────────────────────────────

interface Identifiable {
  id: string | number;
}

interface Repository<T extends Identifiable = { id: number; name: string }> {
  findById(id: T["id"]): T | null;
  save(entity: T): void;
}

console.log("\n=== Default + Constraint ===");

// Default-Repository: T = { id: number; name: string }
function createDefaultRepo(): Repository {
  const store = new Map<number, { id: number; name: string }>();
  return {
    findById: (id) => store.get(id) ?? null,
    save: (entity) => store.set(entity.id, entity),
  };
}

const repo = createDefaultRepo();
repo.save({ id: 1, name: "Max" });
console.log(`Default Repo: ${JSON.stringify(repo.findById(1))}`);

// ─── MEHRERE DEFAULTS ───────────────────────────────────────────────────────

interface Cache<K = string, V = string> {
  get(key: K): V | undefined;
  set(key: K, value: V): void;
}

console.log("\n=== Mehrere Defaults ===");

// Alle Defaults: K = string, V = string
function createStringCache(): Cache {
  const store = new Map<string, string>();
  return {
    get: (key) => store.get(key),
    set: (key, value) => store.set(key, value),
  };
}

const cache = createStringCache();
cache.set("greeting", "Hallo");
console.log(`Cache: greeting = ${cache.get("greeting")}`);

// Nur V ueberschreiben: K = string (Default), V = number
function createNumberCache(): Cache<string, number> {
  const store = new Map<string, number>();
  return {
    get: (key) => store.get(key),
    set: (key, value) => store.set(key, value),
  };
}

const numCache = createNumberCache();
numCache.set("port", 3000);
console.log(`NumCache: port = ${numCache.get("port")}`);

// ─── PRAXIS: RESULT-TYPE MIT DEFAULT ERROR ──────────────────────────────────

type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function tryParse(json: string): Result<unknown> {
  try {
    return { ok: true, value: JSON.parse(json) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e : new Error(String(e)) };
  }
}

function tryDivide(a: number, b: number): Result<number, string> {
  if (b === 0) return { ok: false, error: "Division durch Null" };
  return { ok: true, value: a / b };
}

console.log("\n=== Result-Type mit Default Error ===");

const parsed = tryParse('{"name":"Max"}');
if (parsed.ok) console.log(`Parsed: ${JSON.stringify(parsed.value)}`);

const divided = tryDivide(10, 0);
if (!divided.ok) console.log(`Error: ${divided.error}`);

// ─── PRAXIS: EVENT-SYSTEM ───────────────────────────────────────────────────

interface TypedEmitter<TEvents extends object = Record<string, unknown>> {
  emit<K extends keyof TEvents & string>(event: K, payload: TEvents[K]): void;
  on<K extends keyof TEvents & string>(event: K, handler: (payload: TEvents[K]) => void): void;
}

console.log("\n=== Event-System mit Defaults ===");

// Einfacher Emitter (Default: offenes Record)
function createSimpleEmitter(): TypedEmitter {
  const handlers = new Map<string, Function[]>();
  return {
    emit(event, payload) {
      handlers.get(event)?.forEach(fn => fn(payload));
    },
    on(event, handler) {
      if (!handlers.has(event)) handlers.set(event, []);
      handlers.get(event)!.push(handler);
    },
  };
}

const simple = createSimpleEmitter();
simple.on("message", (data) => console.log(`Event: ${JSON.stringify(data)}`));
simple.emit("message", { text: "Hallo" });

// Getypter Emitter (mit Event-Map)
interface AppEvents {
  "user:login": { userId: string };
  "user:logout": { userId: string };
  "error": { message: string; code: number };
}

function createTypedEmitter(): TypedEmitter<AppEvents> {
  const handlers = new Map<string, Function[]>();
  return {
    emit(event, payload) {
      handlers.get(event)?.forEach(fn => fn(payload));
    },
    on(event, handler) {
      if (!handlers.has(event)) handlers.set(event, []);
      handlers.get(event)!.push(handler);
    },
  };
}

const typed = createTypedEmitter();
typed.on("user:login", (data) => console.log(`Login: ${data.userId}`));
typed.emit("user:login", { userId: "user-123" });
// typed.emit("user:login", { wrong: true }); // Error!
