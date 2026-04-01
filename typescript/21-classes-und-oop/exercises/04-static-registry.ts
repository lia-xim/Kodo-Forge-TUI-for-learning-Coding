/**
 * Lektion 21 — Exercise 04: Static Registry
 *
 * Erstelle ein Registry-Pattern mit static Members und Factory Methods.
 *
 * Ausfuehren: npx tsx exercises/04-static-registry.ts
 * Hinweise:   hints.json → "exercises/04-static-registry.ts"
 */

// ═══ Aufgabe 1: Plugin-Registry ═══
// Erstelle eine Klasse 'PluginRegistry' mit:
// - private static plugins: Map<string, Plugin>
// - static register(plugin: Plugin): void
// - static get(name: string): Plugin | undefined
// - static getAll(): Plugin[]
//
// Interface Plugin: { name: string; execute(input: string): string; }

// TODO: interface Plugin { ... }
// TODO: class PluginRegistry { ... }

// ═══ Aufgabe 2: Factory mit private Constructor ═══
// Erstelle eine Klasse 'HttpResponse' mit:
// - private constructor(public statusCode: number, public body: string)
// - static ok(body: string): HttpResponse
// - static notFound(): HttpResponse
// - static error(message: string): HttpResponse
// - isSuccess(): boolean (statusCode 200-299)

// TODO: class HttpResponse { ... }

// ═══ Aufgabe 3: Instance Counter ═══
// Erstelle eine Klasse 'Connection' mit:
// - static count: number (zaehlt alle erstellten Instanzen)
// - static getActiveCount(): number
// - readonly id: number (auto-generiert)
// - close(): void (dekrementiert count)

// TODO: class Connection { ... }

// ═══ Tests ═══
function testStaticRegistry(): void {
  // Kommentiere die Tests ein:

  // Aufgabe 2
  // const ok = HttpResponse.ok('{"status": "success"}');
  // console.assert(ok.isSuccess() === true, "200 should be success");
  // const notFound = HttpResponse.notFound();
  // console.assert(notFound.isSuccess() === false, "404 should not be success");

  // Aufgabe 3
  // const c1 = new Connection();
  // const c2 = new Connection();
  // console.assert(Connection.getActiveCount() === 2, "Should have 2 connections");
  // c1.close();
  // console.assert(Connection.getActiveCount() === 1, "Should have 1 connection");

  console.log("Exercise 04: Erstelle die Klassen und kommentiere die Tests ein!");
}

testStaticRegistry();
