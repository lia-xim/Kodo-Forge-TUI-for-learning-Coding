export {};

/**
 * Lektion 10 - Beispiel 02: Typsicheres Event-System
 *
 * Ein Event-Emitter der zur Compile-Zeit sicherstellt, dass:
 * - Nur bekannte Events emittiert werden koennen
 * - Die Payload zum Event passt
 * - Listener den richtigen Payload-Typ bekommen
 *
 * Verwendete Konzepte:
 * - Interfaces mit Index Signatures (L05)
 * - Union Types (L07)
 * - Literal Types (L09)
 * - Function Types & Callbacks (L06)
 * - Type Aliases (L08)
 * - Optional Properties (L05)
 * - Arrays (L04)
 *
 * Ausfuehren: npx tsx examples/02-type-safe-event-system.ts
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 1. EVENT-DEFINITIONEN — Was kann passieren?
// ═══════════════════════════════════════════════════════════════════════════════

// Jedes Event hat einen Namen und eine Payload-Struktur
interface UserEvents {
  "user:login": { userId: string; timestamp: Date; ip: string };
  "user:logout": { userId: string; timestamp: Date };
  "user:profile-update": {
    userId: string;
    changes: { field: string; oldValue: string; newValue: string }[];
  };
}

interface CartEvents {
  "cart:item-added": { productId: string; quantity: number; price: number };
  "cart:item-removed": { productId: string };
  "cart:cleared": Record<string, never>; // Leere Payload
}

interface SystemEvents {
  "system:error": { message: string; code: number; stack?: string };
  "system:warning": { message: string; source: string };
}

// Alle Events zusammengefasst (Intersection, L07)
type AppEvents = UserEvents & CartEvents & SystemEvents;

// Event-Name als Union Type (L09)
type EventName = keyof AppEvents;

console.log("=== Event-System: Typ-Definitionen ===");
console.log(
  "Definierte Events: user:login, user:logout, user:profile-update,",
  "cart:item-added, cart:item-removed, cart:cleared, system:error, system:warning"
);

// ═══════════════════════════════════════════════════════════════════════════════
// 2. EVENT-EMITTER — Typsichere Implementierung
// ═══════════════════════════════════════════════════════════════════════════════

// Listener-Typ: Eine Funktion die die passende Payload bekommt
type EventListener<T> = (payload: T) => void;

// Der Event-Emitter mit typsicheren Methoden
interface TypedEventEmitter {
  on<E extends EventName>(event: E, listener: EventListener<AppEvents[E]>): void;
  off<E extends EventName>(event: E, listener: EventListener<AppEvents[E]>): void;
  emit<E extends EventName>(event: E, payload: AppEvents[E]): void;
}

// Einfache Implementierung (nutzt Phase-1-Konzepte, keine Generics in der Impl.)
function createEventEmitter(): TypedEventEmitter {
  // Index Signature fuer dynamische Event-Registrierung (L05)
  const listeners: { [key: string]: Function[] } = {};

  return {
    on(event: string, listener: Function): void {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event].push(listener);
      console.log(`  [ON] Listener registriert fuer "${event}"`);
    },

    off(event: string, listener: Function): void {
      if (!listeners[event]) return;
      const index = listeners[event].indexOf(listener);
      if (index > -1) {
        listeners[event].splice(index, 1);
        console.log(`  [OFF] Listener entfernt fuer "${event}"`);
      }
    },

    emit(event: string, payload: unknown): void {
      const eventListeners = listeners[event];
      if (!eventListeners || eventListeners.length === 0) {
        console.log(`  [EMIT] "${event}" — keine Listener`);
        return;
      }
      console.log(
        `  [EMIT] "${event}" — ${eventListeners.length} Listener benachrichtigt`
      );
      eventListeners.forEach((fn) => fn(payload));
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. NUTZUNG — Typsicherheit in Aktion
// ═══════════════════════════════════════════════════════════════════════════════

const emitter = createEventEmitter();

console.log("\n=== Listener registrieren ===");

// TypeScript weiss, welchen Payload jeder Listener bekommt!
emitter.on("user:login", (payload) => {
  // payload ist automatisch: { userId: string; timestamp: Date; ip: string }
  console.log(`    Login: ${payload.userId} von ${payload.ip}`);
});

emitter.on("cart:item-added", (payload) => {
  // payload ist automatisch: { productId: string; quantity: number; price: number }
  console.log(
    `    Warenkorb: ${payload.quantity}x ${payload.productId} (${payload.price} EUR)`
  );
});

emitter.on("system:error", (payload) => {
  // payload ist automatisch: { message: string; code: number; stack?: string }
  console.log(`    FEHLER ${payload.code}: ${payload.message}`);
  if (payload.stack) {
    console.log(`    Stack: ${payload.stack}`);
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. EVENTS EMITTIEREN — Compiler prueft die Payload
// ═══════════════════════════════════════════════════════════════════════════════

console.log("\n=== Events emittieren ===");

// Korrekt: Payload passt zum Event
emitter.emit("user:login", {
  userId: "u-001",
  timestamp: new Date(),
  ip: "192.168.1.1",
});

emitter.emit("cart:item-added", {
  productId: "prod-42",
  quantity: 2,
  price: 29.99,
});

emitter.emit("system:error", {
  message: "Datenbankverbindung verloren",
  code: 500,
  stack: "Error: Connection timeout at db.connect()",
});

// Event ohne Listener
emitter.emit("cart:cleared", {} as Record<string, never>);

// ═══════════════════════════════════════════════════════════════════════════════
// 5. WAS DER COMPILER VERHINDERT (auskommentiert)
// ═══════════════════════════════════════════════════════════════════════════════

console.log("\n=== Compile-Time Sicherheit ===");
console.log("Folgende Zeilen wuerden NICHT kompilieren:");

// FEHLER 1: Unbekanntes Event
// emitter.emit("user:deleted", { userId: "u-001" });
// TS: Argument '"user:deleted"' is not assignable to parameter...
console.log('  ✗ emitter.emit("user:deleted", ...) — Event existiert nicht');

// FEHLER 2: Falsche Payload
// emitter.emit("user:login", { userId: "u-001" });
// TS: Property 'timestamp' is missing...
console.log('  ✗ emitter.emit("user:login", { userId: "u-001" }) — timestamp fehlt');

// FEHLER 3: Falscher Payload-Typ
// emitter.emit("cart:item-added", { productId: 42, quantity: "zwei", price: "gratis" });
// TS: Type 'number' is not assignable to type 'string' (productId)
console.log(
  "  ✗ emitter.emit(\"cart:item-added\", { productId: 42, ... }) — falscher Typ"
);

// FEHLER 4: Listener mit falschem Payload-Typ
// emitter.on("user:login", (payload: { name: string }) => { ... });
// TS: Type mismatch im Callback
console.log(
  "  ✗ emitter.on(\"user:login\", (p: { name: string }) => ...) — falscher Listener-Typ"
);

// ═══════════════════════════════════════════════════════════════════════════════
// 6. EVENT-LOG — Sammeln und Auswerten
// ═══════════════════════════════════════════════════════════════════════════════

// Tuple fuer Event-Log Eintraege (L04)
type EventLogEntry = readonly [timestamp: Date, event: EventName, payload: string];

const eventLog: EventLogEntry[] = [];

// Logger der alle Events mitschneidet
function createLogger(emitter: TypedEventEmitter): void {
  // Wir registrieren Listener fuer ausgewaehlte Events
  const eventsToLog: EventName[] = [
    "user:login",
    "user:logout",
    "system:error",
  ];

  for (const eventName of eventsToLog) {
    // Hier nutzen wir den allgemeinsten Listener-Typ
    emitter.on(eventName, (payload: unknown) => {
      const entry: EventLogEntry = [
        new Date(),
        eventName,
        JSON.stringify(payload),
      ];
      eventLog.push(entry);
    });
  }
}

createLogger(emitter);

// Nochmal Events emittieren fuer den Logger
emitter.emit("user:login", {
  userId: "u-002",
  timestamp: new Date(),
  ip: "10.0.0.1",
});

console.log("\n=== Event-Log ===");
for (const [ts, event, data] of eventLog) {
  console.log(`  [${ts.toISOString()}] ${event}: ${data}`);
}

console.log("\n=== Fazit ===");
console.log("Das Event-System demonstriert:");
console.log("  - Interfaces als Event-Maps (L05)");
console.log("  - Intersection fuer Event-Kombinierung (L07)");
console.log("  - Literal Types fuer Event-Namen (L09)");
console.log("  - Function Types fuer Callbacks (L06)");
console.log("  - Tuples fuer strukturierte Log-Eintraege (L04)");
