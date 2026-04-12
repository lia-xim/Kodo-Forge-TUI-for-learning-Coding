/**
 * Lektion 19 - Beispiel 02: CommonJS Interop
 */

// Mit esModuleInterop: true koennen CJS-Module mit Default-Import geladen werden
// import fs from 'fs';        // Default Import (mit esModuleInterop)
// import * as fs from 'fs';   // Namespace Import (immer moeglich)

// JSON Import (mit resolveJsonModule: true)
// import config from './config.json';

console.log("CommonJS Interop Beispiel geladen.");
console.log("Tipp: esModuleInterop: true in tsconfig.json setzen!");
