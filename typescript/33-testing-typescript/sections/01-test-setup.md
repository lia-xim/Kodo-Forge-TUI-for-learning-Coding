# Sektion 1: Test-Setup — Vitest/Jest mit TypeScript

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: — (Start)
> Naechste Sektion: [02 - Typing von Tests](./02-typing-von-tests.md)

---

## Was du hier lernst

- Wie Vitest und Jest mit TypeScript zusammenarbeiten
- Den Unterschied zwischen "TypeScript-Tests kompilieren" und "TypeScript-Tests ausfuehren"
- Warum Vitest native TypeScript-Unterstuetzung hat und Jest einen Transformer braucht
- Wie du ein optimales Test-Setup fuer TypeScript-Projekte konfigurierst

---

## Die Geschichte: Testing und TypeScript

Testen in JavaScript war lange ein Kampf mit den Typen. Jest, 2014
von Facebook (Meta) veroeffentlicht, wurde zum Standard — aber ohne
native TypeScript-Unterstuetzung. Man brauchte `ts-jest` oder `babel-jest`
mit TypeScript-Plugin, um `.ts`-Dateien zu verarbeiten.

2022 aenderte **Vitest** das Spiel. Anthony Fu (Vue-Kernteam) baute
einen Test-Runner auf Vite auf — mit nativer TypeScript-Unterstuetzung,
ESM-Support und einer Jest-kompatiblen API.

> 📖 **Hintergrund: Warum native TS-Unterstuetzung so wichtig ist**
>
> Jest kompiliert standardmaessig nur JavaScript. Fuer TypeScript braucht
> es einen "Transformer" (ts-jest oder @swc/jest), der `.ts`-Dateien
> vor der Ausfuehrung in JavaScript umwandelt. Das hat zwei Probleme:
> (1) Konfigurationsaufwand — tsconfig-Kompatibilitaet, Path-Aliases,
> ESM-Modus. (2) Performance — Jede Datei wird einzeln transformiert.
>
> Vitest nutzt Vite's Plugin-System, das TypeScript nativ versteht.
> Keine extra Konfiguration, keine Transformer. Einfach `.ts`-Dateien
> schreiben und ausfuehren. Das ist der Hauptgrund warum Vitest in
> der TypeScript-Community so schnell populaer wurde.

---

## Vitest: Setup in 5 Minuten

```typescript annotated
// 1. Installation
// npm install -D vitest

// 2. vitest.config.ts (optional — Vitest nutzt vite.config.ts)
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // ^ describe, it, expect ohne Import verfuegbar (wie bei Jest)
    environment: 'node',
    // ^ 'node' fuer Backend, 'jsdom' fuer Browser-APIs, 'happy-dom' fuer schnelleres DOM
    include: ['src/**/*.{test,spec}.ts'],
    // ^ Welche Dateien sind Tests?
    coverage: {
      provider: 'v8',
      // ^ v8 ist schneller, istanbul hat mehr Features
      reporter: ['text', 'json', 'html'],
    },
  },
});

// 3. TypeScript-Typen fuer Globals (tsconfig.json oder vitest.d.ts)
// /// <reference types="vitest/globals" />
// ODER in tsconfig.json:
// "types": ["vitest/globals"]
```

### Der erste Test

```typescript annotated
// src/utils/add.ts
export function add(a: number, b: number): number {
  return a + b;
  // ^ Einfache Funktion — aber der Typ ist wichtig!
}

// src/utils/add.test.ts
import { describe, it, expect } from 'vitest';
// ^ Expliziter Import (Alternative: globals: true)
import { add } from './add';

describe('add', () => {
  it('should add two numbers', () => {
    const result = add(1, 2);
    // ^ result: number — TypeScript inferiert aus der Funktion
    expect(result).toBe(3);
  });

  it('should handle negative numbers', () => {
    expect(add(-1, -2)).toBe(-3);
    // ^ TypeScript prueft: -1 und -2 sind number ✓
  });

  // TypeScript verhindert fehlerhafte Tests:
  // add("1", "2");
  // ^ Compile-Error: Argument of type 'string' is not assignable to 'number'
  // Dieser Test kann gar nicht erst geschrieben werden!
});
```

> 💭 **Denkfrage:** Wenn TypeScript schon prueft, dass `add(1, 2)`
> korrekt getypt ist, braucht man dann ueberhaupt noch Unit-Tests?
>
> **Antwort:** Ja! TypeScript prueft TYPEN, nicht LOGIK. `add(a, b)`
> koennte `a * b` implementieren und TypeScript wuerde keinen Fehler
> melden — die Signatur stimmt ja. Tests pruefen das VERHALTEN,
> TypeScript prueft die FORM. Beides zusammen ergibt Sicherheit.

---

## Jest: Setup mit TypeScript

```typescript annotated
// 1. Installation
// npm install -D jest ts-jest @types/jest

// 2. jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  // ^ ts-jest Transformer: kompiliert .ts → .js vor dem Test
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // ^ Path-Aliases muessen hier gespiegelt werden!
    // Das ist einer der Schmerzpunkte von Jest + TypeScript.
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.spec.json',
      // ^ Separate tsconfig fuer Tests (kann andere Optionen haben)
    }],
  },
};

export default config;

// 3. tsconfig.spec.json
// {
//   "extends": "./tsconfig.json",
//   "compilerOptions": {
//     "types": ["jest"]
//   },
//   "include": ["src/**/*.spec.ts"]
// }
```

### Vitest vs Jest: Entscheidungshilfe

| Kriterium | Vitest | Jest |
|---|---|---|
| TypeScript-Support | Nativ (Zero-Config) | ts-jest / @swc/jest noetig |
| ESM-Support | Nativ | Experimentell |
| Performance | Sehr schnell (Vite) | Langsamer bei TS |
| API-Kompatibilitaet | Jest-kompatibel | Standard |
| Ecosystem | Wachsend | Riesig |
| Angular | Nicht offiziell | Offiziell (Karma ersetzt) |
| React (Vite) | Standard-Wahl | Alternative |

> ⚡ **Praxis-Tipp fuer Angular:** Angular nutzt seit v16 Jest statt
> Karma als Test-Runner. Das Setup ist in `angular.json` konfiguriert
> — du musst `ts-jest` nicht manuell einrichten. In Angular-Projekten
> ist Jest die Standard-Wahl. Fuer standalone-TypeScript-Projekte
> oder React+Vite ist Vitest oft besser.

---

## TypeScript-spezifische Test-Konfiguration

```typescript annotated
// tsconfig fuer Tests: Was ist anders?

// tsconfig.spec.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["vitest/globals"],
    // ^ Test-Globals (describe, it, expect) verfuegbar machen

    "strict": true,
    // ^ Strict AUCH in Tests — keine Ausnahmen!

    "noUnusedLocals": false,
    // ^ In Tests oft Variablen die nur fuer Assertions existieren

    "noUnusedParameters": false,
    // ^ Mock-Callbacks haben oft ungenutzte Parameter
  },
  "include": ["src/**/*.test.ts", "src/**/*.spec.ts"]
}
```

> 🧠 **Erklaere dir selbst:** Warum sollte `strict: true` auch in
> Test-Dateien gelten? Waere es nicht einfacher, stricte Checks in
> Tests zu deaktivieren?
>
> **Kernpunkte:** Tests TESTEN den Code — wenn Tests nicht strikt sind,
> testen sie mit falschen Annahmen | Ein `any` im Test kann echte
> Fehler verbergen | Wenn ein Test schwer zu typisieren ist, ist
> oft die Produktions-API zu komplex — der Test zeigt das Problem auf

---

## Watch-Mode und Debugging

```typescript
// Vitest Watch-Mode (Standard)
// npx vitest          ← startet im Watch-Mode
// npx vitest run      ← einmal ausfuehren (fuer CI)

// Debugging mit TypeScript
// launch.json (VS Code):
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest",
  "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
  "args": ["run", "--reporter=verbose", "${relativeFile}"],
  "console": "integratedTerminal"
}
```

> 🔬 **Experiment:** Richte ein minimales Vitest-Projekt ein und
> beobachte die TypeScript-Integration:
>
> ```bash
> mkdir ts-test-demo && cd ts-test-demo
> npm init -y
> npm install -D typescript vitest
> ```
>
> ```typescript
> // src/greet.ts
> export function greet(name: string): string {
>   return `Hello, ${name}!`;
> }
>
> // src/greet.test.ts
> import { expect, test } from 'vitest';
> import { greet } from './greet';
>
> test('greets by name', () => {
>   expect(greet('World')).toBe('Hello, World!');
> });
>
> // Fuehre aus: npx vitest run
> // Frage: Was passiert wenn du greet(42) schreibst?
> // Antwort: Compile-Error im Test — TypeScript schuetzt dich!
> ```

---

## Was du gelernt hast

- Vitest hat native TypeScript-Unterstuetzung — kein Transformer noetig
- Jest braucht ts-jest oder @swc/jest fuer TypeScript-Dateien
- TypeScript in Tests prueft TYPEN (Form), Tests pruefen VERHALTEN (Logik)
- `strict: true` sollte auch in Tests gelten — keine Ausnahmen
- Angular nutzt Jest, React+Vite nutzt Vitest als Standard

**Kernkonzept zum Merken:** TypeScript und Tests ergaenzen sich perfekt. TypeScript stellt sicher, dass dein Code die richtige FORM hat (richtige Typen, richtige Schnittstellen). Tests stellen sicher, dass dein Code das richtige VERHALTEN hat (richtige Ergebnisse, richtige Seiteneffekte). Beides zusammen ergibt echte Sicherheit.

---

> **Pausenpunkt** — Du hast das Setup. In der naechsten Sektion schauen
> wir uns an, wie die Test-Funktionen selbst typisiert sind.
>
> Weiter geht es mit: [Sektion 02: Typing von Tests](./02-typing-von-tests.md)
