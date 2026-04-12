/**
 * Lektion 06 - Solution 04: Praxis-Szenarien
 *
 * Ausfuehren mit: npx tsx solutions/04-praxis-szenarien.ts
 *
 * Vollstaendige Loesungen mit ausfuehrlichen deutschen Erklaerungen.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Pipe-Funktion
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Drei Generics: A (Input), B (Zwischentyp), C (Output).
// fn1 verwandelt A → B, fn2 verwandelt B → C.
// Die zurueckgegebene Funktion verwandelt A → C.
function pipe<A, B, C>(
  fn1: (a: A) => B,
  fn2: (b: B) => C,
): (a: A) => C {
  return (a) => fn2(fn1(a));
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Retry mit Callback
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Schleife bis maxAttempts erreicht.
// Bei Erfolg sofort zurueckgeben, bei Fehler speichern und wiederholen.
// Wenn alle Versuche fehlschlagen: letzten Error werfen.
function retry<T>(fn: () => T, maxAttempts: number = 3): T {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return fn();
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      // Weiter versuchen...
    }
  }

  throw lastError;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Event-Emitter mit generischen Events
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Die Event-Map als Generik-Parameter.
// keyof Events gibt die erlaubten Event-Namen.
// Events[K] gibt den Datentyp fuer ein bestimmtes Event.
interface AppEvents {
  login: { userId: string; timestamp: number };
  logout: { userId: string };
  error: { message: string; code: number };
}

function createTypedEmitter<Events extends Record<string, unknown>>(): {
  on<K extends keyof Events>(event: K, listener: (data: Events[K]) => void): () => void;
  emit<K extends keyof Events>(event: K, data: Events[K]): void;
} {
  const listeners = new Map<keyof Events, Array<(data: unknown) => void>>();

  return {
    on(event, listener) {
      if (!listeners.has(event)) {
        listeners.set(event, []);
      }
      listeners.get(event)!.push(listener as (data: unknown) => void);

      return () => {
        const eventListeners = listeners.get(event);
        if (eventListeners) {
          const index = eventListeners.indexOf(listener as (data: unknown) => void);
          if (index !== -1) eventListeners.splice(index, 1);
        }
      };
    },

    emit(event, data) {
      const eventListeners = listeners.get(event);
      if (eventListeners) {
        for (const listener of eventListeners) {
          listener(data);
        }
      }
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Builder-Pattern mit Methoden-Chaining
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Jede Methode speichert den Wert und gibt den Builder zurueck.
// build() setzt alles zusammen.
interface QueryBuilder {
  select(...columns: string[]): QueryBuilder;
  from(table: string): QueryBuilder;
  where(condition: string): QueryBuilder;
  build(): string;
}

function createQueryBuilder(): QueryBuilder {
  let selectCols: string[] = [];
  let fromTable = "";
  let whereClause = "";

  const builder: QueryBuilder = {
    select(...columns) {
      selectCols = columns;
      return builder;
    },
    from(table) {
      fromTable = table;
      return builder;
    },
    where(condition) {
      whereClause = condition;
      return builder;
    },
    build() {
      let query = `SELECT ${selectCols.join(", ")} FROM ${fromTable}`;
      if (whereClause) {
        query += ` WHERE ${whereClause}`;
      }
      return query;
    },
  };

  return builder;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Curried Formatter
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Drei verschachtelte Funktionen.
// Jede Ebene konfiguriert einen Aspekt des Formatters.
// Intl.NumberFormat wird erst beim innersten Aufruf erstellt.
function createFormatter(locale: string): (style: "currency" | "percent" | "decimal") => (value: number) => string {
  return (style) => {
    const options: Intl.NumberFormatOptions = { style };
    if (style === "currency") {
      options.currency = locale.startsWith("de") ? "EUR" : "USD";
    }
    const formatter = new Intl.NumberFormat(locale, options);
    return (value) => formatter.format(value);
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

// Aufgabe 1
const addOne = (n: number) => n + 1;
const double = (n: number) => n * 2;
const addOneThenDouble = pipe(addOne, double);
console.assert(addOneThenDouble(5) === 12, "A1: pipe (5+1)*2=12");
const toStr = (n: number) => String(n);
const addExcl = (s: string) => s + "!";
const numToExcl = pipe(toStr, addExcl);
console.assert(numToExcl(42) === "42!", "A1: pipe mixed types");

// Aufgabe 2
let attempt = 0;
const ergebnis = retry(() => {
  attempt++;
  if (attempt < 3) throw new Error("Noch nicht");
  return "Erfolg";
}, 5);
console.assert(ergebnis === "Erfolg", "A2: retry erfolgreich nach 3 Versuchen");
try {
  retry(() => { throw new Error("Immer Fehler"); }, 2);
  console.assert(false, "A2: sollte werfen");
} catch { console.assert(true, "A2: retry wirft nach maxAttempts"); }

// Aufgabe 3
const emitter = createTypedEmitter<AppEvents>();
let loginData: AppEvents["login"] | null = null;
emitter.on("login", (data) => { loginData = data; });
emitter.emit("login", { userId: "u1", timestamp: 1000 });
console.assert(loginData?.userId === "u1", "A3: event emitter");

// Aufgabe 4
const query = createQueryBuilder()
  .select("name", "age")
  .from("users")
  .where("age > 18")
  .build();
console.assert(query === "SELECT name, age FROM users WHERE age > 18", "A4: query builder");

// Aufgabe 5
const formatDE = createFormatter("de-DE");
const formatCurrency = formatDE("currency");
const formatted = formatCurrency(1234.5);
console.assert(typeof formatted === "string", "A5: formatter gibt string zurueck");
console.assert(formatted.length > 0, "A5: formatter nicht leer");

console.log("Alle Tests bestanden!");
