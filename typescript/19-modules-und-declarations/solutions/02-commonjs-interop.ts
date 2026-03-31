/**
 * Lektion 19 - Loesung 02: CommonJS Interop
 */
// AUFGABE 1: import _ from 'lodash' (Default Import, braucht esModuleInterop)
//            import * as _ from 'lodash' (Namespace Import, funktioniert immer)

// AUFGABE 2: esModuleInterop: true

// AUFGABE 3: moduleResolution: "bundler" nutzt package.json "exports"
//            und erlaubt Import-Abkuerzungen wie bei Vite/Webpack

// AUFGABE 4: isolatedModules: true wenn ein Bundler (Vite, esbuild) verwendet wird
//            weil diese Datei-fuer-Datei transpilieren (kein Cross-File-Analysis)

// AUFGABE 5:
const tsconfig = {
  compilerOptions: {
    module: "ESNext",
    moduleResolution: "bundler",
    esModuleInterop: true,
    isolatedModules: true,
    resolveJsonModule: true,
    strict: true,
  },
};

export { tsconfig };
