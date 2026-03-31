/**
 * Lektion 19 - Beispiel 04: Module Augmentation
 */

// Global Augmentation Beispiel
declare global {
  interface Window {
    __APP_VERSION__: string;
  }
}

export {}; // Macht diese Datei zum Modul!

// Interface Merging Beispiel
interface Config { name: string; }
interface Config { version: string; }
// Config hat jetzt name UND version!

const cfg: Config = { name: "MyApp", version: "1.0.0" };
console.log("Config:", cfg);
