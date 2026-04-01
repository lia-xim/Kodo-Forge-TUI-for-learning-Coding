/**
 * Lektion 21 — Loesung 04: Static Registry
 */

// ═══ Aufgabe 1: Plugin-Registry ═══

interface Plugin {
  name: string;
  execute(input: string): string;
}

class PluginRegistry {
  private static plugins: Map<string, Plugin> = new Map();

  static register(plugin: Plugin): void {
    PluginRegistry.plugins.set(plugin.name, plugin);
  }

  static get(name: string): Plugin | undefined {
    return PluginRegistry.plugins.get(name);
  }

  static getAll(): Plugin[] {
    return [...PluginRegistry.plugins.values()];
  }
}

// Plugins registrieren
PluginRegistry.register({
  name: "upper",
  execute(input: string) { return input.toUpperCase(); },
});

PluginRegistry.register({
  name: "reverse",
  execute(input: string) { return [...input].reverse().join(""); },
});

console.log(PluginRegistry.get("upper")?.execute("hello")); // "HELLO"
console.log(PluginRegistry.getAll().length); // 2

// ═══ Aufgabe 2: Factory mit private Constructor ═══

class HttpResponse {
  private constructor(
    public readonly statusCode: number,
    public readonly body: string
  ) {}

  static ok(body: string): HttpResponse {
    return new HttpResponse(200, body);
  }

  static notFound(): HttpResponse {
    return new HttpResponse(404, "Not Found");
  }

  static error(message: string): HttpResponse {
    return new HttpResponse(500, message);
  }

  isSuccess(): boolean {
    return this.statusCode >= 200 && this.statusCode < 300;
  }
}

// ═══ Aufgabe 3: Instance Counter ═══

class Connection {
  private static _count: number = 0;
  private static _nextId: number = 1;
  readonly id: number;
  private closed: boolean = false;

  constructor() {
    this.id = Connection._nextId++;
    Connection._count++;
  }

  static getActiveCount(): number {
    return Connection._count;
  }

  close(): void {
    if (!this.closed) {
      this.closed = true;
      Connection._count--;
    }
  }
}

// ═══ Tests ═══

const ok = HttpResponse.ok('{"status": "success"}');
console.assert(ok.isSuccess() === true, "200 should be success");
console.assert(ok.statusCode === 200, "Status should be 200");

const notFound = HttpResponse.notFound();
console.assert(notFound.isSuccess() === false, "404 should not be success");

const err = HttpResponse.error("Internal Error");
console.assert(err.statusCode === 500, "Error should be 500");

const c1 = new Connection();
const c2 = new Connection();
console.assert(Connection.getActiveCount() === 2, "Should have 2 connections");
console.assert(c1.id !== c2.id, "IDs should be unique");
c1.close();
console.assert(Connection.getActiveCount() === 1, "Should have 1 connection");
c1.close(); // Double-close should be safe
console.assert(Connection.getActiveCount() === 1, "Still 1 connection");

console.log("\n--- Loesung 04 erfolgreich ---");
