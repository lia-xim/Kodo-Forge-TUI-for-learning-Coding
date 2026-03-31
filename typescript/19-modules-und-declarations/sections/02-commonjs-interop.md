# Sektion 2: CommonJS Interop

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - ES Modules](./01-es-modules.md)
> Naechste Sektion: [03 - Declaration Files](./03-declaration-files.md)

---

## Was du hier lernst

- CommonJS vs ES Modules
- esModuleInterop und allowSyntheticDefaultImports
- Module Resolution: node vs bundler
- Wann man welches Format braucht

---

## CommonJS — Das aeltere Format

```javascript
// CommonJS (Node.js traditionell)
const fs = require('fs');
module.exports = { readFile: fs.readFile };
module.exports.default = myFunction;

// ES Modules (Moderner Standard)
import fs from 'fs';
export { readFile } from 'fs';
export default myFunction;
```

---

## Das Problem: CJS in ESM importieren

```typescript
// lodash exportiert mit module.exports = { ... }
// Ohne esModuleInterop:
import * as _ from 'lodash';  // Funktioniert
import _ from 'lodash';       // Error!

// Mit esModuleInterop: true (tsconfig.json)
import _ from 'lodash';       // Funktioniert!
```

---

## tsconfig.json Module-Optionen

```json
{
  "compilerOptions": {
    "module": "ESNext",              // Output-Format
    "moduleResolution": "bundler",   // Wie Module gefunden werden
    "esModuleInterop": true,         // CJS Default-Import Support
    "allowSyntheticDefaultImports": true,  // Typ-Level Default-Import
    "resolveJsonModule": true,       // JSON importieren
    "isolatedModules": true          // Kompatibel mit Bundlern
  }
}
```

---

## Module Resolution

| Strategie | Verwendung | Sucht in |
|-----------|-----------|----------|
| `node` | Node.js | node_modules, .js, .ts, index |
| `node16`/`nodenext` | Node.js ESM | package.json "exports" |
| `bundler` | Vite, Webpack, etc. | Wie node16 aber flexibler |

> **Empfehlung 2024+:** `"moduleResolution": "bundler"` fuer die meisten Projekte.

---

## Pausenpunkt

**Kernerkenntnisse:**
- `esModuleInterop: true` — Default-Imports aus CJS-Modulen ermoeglichen
- `moduleResolution: "bundler"` — moderner Standard fuer die meisten Projekte
- CJS nutzt `require`/`module.exports`, ESM nutzt `import`/`export`

> **Weiter:** [Sektion 03 - Declaration Files](./03-declaration-files.md)
