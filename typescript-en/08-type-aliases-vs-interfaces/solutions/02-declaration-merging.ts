/**
 * Lektion 08 - Solution 02: Declaration Merging
 *
 * Ausfuehren mit: npx tsx solutions/02-declaration-merging.ts
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Einfaches Declaration Merging
// ═══════════════════════════════════════════════════════════════════════════

interface AppConfig {
  host: string;
  port: number;
}

// Zweite Deklaration — wird zusammengefuegt:
interface AppConfig {
  database: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Mehrfaches Declaration Merging
// ═══════════════════════════════════════════════════════════════════════════

interface PluginAPI {
  init(): void;
}

interface PluginAPI {
  render(data: unknown): string;
}

interface PluginAPI {
  destroy(): void;
}

// PluginAPI hat jetzt: init, render, destroy

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Global erweitern (Window)
// ═══════════════════════════════════════════════════════════════════════════

// In einer .d.ts oder .ts Datei:
declare global {
  interface Window {
    __APP_VERSION__: string;
  }
}

// Damit dieses File als Modul behandelt wird (noetig fuer declare global):
export {};

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Warum geht das mit type NICHT?
// ═══════════════════════════════════════════════════════════════════════════

// type MyConfig = { host: string };
// type MyConfig = { port: number };
// ^ Error: Duplicate identifier 'MyConfig'.

// ERKLAERUNG:
// Type Aliases sind EINMALIGE Definitionen. Wenn du einen Type Alias
// einmal definiert hast, ist der Name "belegt" und kann nicht nochmal
// verwendet werden. Das ist by design — TypeScript will Eindeutigkeit.
//
// Die Alternative mit type:
type MyConfigBase = { host: string };
type MyConfig = MyConfigBase & { port: number };
// Man muss einen NEUEN Namen verwenden und den alten mit & erweitern.

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Logger mit Declaration Merging + Klasse
// ═══════════════════════════════════════════════════════════════════════════

interface Logger {
  log(message: string): void;
}

interface Logger {
  warn(message: string): void;
}

interface Logger {
  error(message: string, stack?: string): void;
}

class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(`[LOG] ${message}`);
  }

  warn(message: string): void {
    console.log(`[WARN] ${message}`);
  }

  error(message: string, stack?: string): void {
    console.log(`[ERROR] ${message}`);
    if (stack) {
      console.log(`  Stack: ${stack}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

// Test 1
const config: AppConfig = { host: "localhost", port: 3000, database: "mydb" };
console.log(`Config: ${config.host}:${config.port}/${config.database}`);

// Test 2
const plugin: PluginAPI = {
  init: () => console.log("Plugin initialisiert"),
  render: (data) => `Rendered: ${String(data)}`,
  destroy: () => console.log("Plugin zerstoert"),
};
plugin.init();
console.log(plugin.render("test-data"));
plugin.destroy();

// Test 5
const logger = new ConsoleLogger();
logger.log("Info-Nachricht");
logger.warn("Warnung!");
logger.error("Kritischer Fehler!", "at UserService.login (line 42)");

console.log("\nAlle Tests bestanden!");
