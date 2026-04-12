/**
 * Lektion 19 - Loesung 04: Module Augmentation
 */

// AUFGABE 1: Express Request erweitern
// declare module 'express' {
//   interface Request {
//     user?: { id: string; role: string; email: string; };
//   }
// }

// AUFGABE 2: Process.env erweitern
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      DATABASE_URL: string;
      API_KEY: string;
      PORT?: string;
    }
  }
}

// AUFGABE 3: Window erweitern
// declare global {
//   interface Window {
//     __APP_CONFIG__: { apiUrl: string; version: string; };
//   }
// }

// AUFGABE 4: Interface Merging
interface AppConfig { name: string; }
interface AppConfig { version: string; debug: boolean; }
// AppConfig hat jetzt: name, version, debug

// AUFGABE 5: export {} ist noetig damit die Datei als Modul behandelt wird.
// Ohne export/import wird die Datei als Script behandelt und
// declare global funktioniert nicht korrekt.

export {};
