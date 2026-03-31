/**
 * Lektion 08 - Exercise 02: Declaration Merging
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/02-declaration-merging.ts
 *
 * 5 Aufgaben zu Declaration Merging — das Feature das nur interface hat.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Einfaches Declaration Merging
// ═══════════════════════════════════════════════════════════════════════════

// Gegeben: Ein Interface "AppConfig" mit host und port.
// TODO: Erweitere es um die Property "database" (string)
// durch eine zweite interface-Deklaration (Declaration Merging).

interface AppConfig {
  host: string;
  port: number;
}

// TODO: Schreibe hier die zweite interface-Deklaration:

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Mehrfaches Declaration Merging
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ein Interface "PluginAPI" in DREI separaten Bloecken:
// Block 1: init(): void
// Block 2: render(data: unknown): string
// Block 3: destroy(): void

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Global erweitern (Window)
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erweitere das globale Window-Interface um eine Property
// "__APP_VERSION__" vom Typ string.
// Tipp: Du brauchst "declare global" und "interface Window".

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Warum geht das mit type NICHT?
// ═══════════════════════════════════════════════════════════════════════════

// Probiere aus: Deklariere den GLEICHEN type-Namen zweimal.
// Was passiert? Erklaere den Fehler in einem Kommentar.

// type MyConfig = { host: string };
// type MyConfig = { port: number };  // <-- Was passiert hier?

// TODO: Schreibe einen Kommentar der erklaert warum das nicht geht
// und wie du es stattdessen mit type loesen wuerdest.

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Declaration Merging mit Methoden
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ein Interface "Logger" mit einer log-Methode.
// Erweitere es dann per Declaration Merging um:
// - warn(message: string): void
// - error(message: string, stack?: string): void
// Erstelle zum Schluss eine Klasse "ConsoleLogger" die Logger implementiert.

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

/*
// Test 1: AppConfig hat alle Properties
const config: AppConfig = { host: "localhost", port: 3000, database: "mydb" };
console.log(`Config: ${config.host}:${config.port}/${config.database}`);

// Test 2: PluginAPI hat alle Methoden
const plugin: PluginAPI = {
  init: () => {},
  render: (data) => String(data),
  destroy: () => {},
};
plugin.init();
console.log(`Plugin rendered: ${plugin.render("test")}`);
plugin.destroy();

// Test 5: Logger
const logger = new ConsoleLogger();
logger.log("Info-Nachricht");
logger.warn("Warnung!");
logger.error("Fehler!", "Error stack...");

console.log("Alle Tests bestanden!");
*/
