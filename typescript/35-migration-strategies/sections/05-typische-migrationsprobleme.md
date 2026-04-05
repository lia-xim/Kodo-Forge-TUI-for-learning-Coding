# Sektion 5: Typische Migrationsprobleme und Loesungen

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Declaration Files fuer Legacy-Code](./04-declaration-files-fuer-legacy.md)
> Naechste Sektion: [06 - Praxis: Angular- und React-Migration](./06-praxis-framework-migration.md)

---

## Was du hier lernst

- Die **10 haeufigsten Fehler** bei JS→TS-Migrationen und wie du sie loest
- Warum **dynamic property access** das groesste Einzelproblem ist
- Wie du **CommonJS/ESM-Konflikte** aufloest
- Strategien fuer **this-Binding** und **Klassen-Migration**

---

## Hintergrund: Warum scheitern Migrationen?

> **Origin Story: Die gescheiterte Migration**
>
> Ein mittelgrosses Unternehmen startete 2020 die Migration einer 300-Dateien
> React-App von JavaScript zu TypeScript. Nach 3 Monaten wurde das Projekt
> abgebrochen. Der Grund: Sie aktivierten `strict: true` am Tag 1 und
> hatten 4.000+ Fehler. Statt stufenweise vorzugehen, versuchten sie alle
> Fehler auf einmal zu fixen — und brachen unter der Last zusammen.
>
> Die Lehre: Migrationen scheitern nicht an TypeScript. Sie scheitern an
> zu aggressiven Einstellungen, fehlender Priorisierung, und dem Versuch
> alles auf einmal perfekt zu machen.

Die meisten Migrationsprobleme fallen in wenige Kategorien. Wenn du
diese kennst, kannst du sie systematisch loesen.

---

## Problem 1: Dynamische Property-Zugriffe

Das haeufigste Problem — JavaScript erlaubt dynamische Properties,
TypeScript nicht:

```typescript annotated
// JavaScript (funktioniert):
const obj = {};
obj.name = "Max";           // Property wird dynamisch erstellt
obj["email"] = "a@b.com";   // Bracket-Notation ebenso
obj[someKey] = someValue;    // Dynamischer Key

// TypeScript (Fehler):
const obj = {};
obj.name = "Max";
// ^ FEHLER: Property 'name' does not exist on type '{}'

// Fix 1: Typ vorab definieren
const obj: { name?: string; email?: string } = {};
obj.name = "Max";  // OK

// Fix 2: Record fuer dynamische Keys
const obj: Record<string, string> = {};
obj.name = "Max";  // OK
obj[someKey] = someValue;  // OK

// Fix 3: Index Signature
interface DynamicObj {
  [key: string]: unknown;
  name?: string;  // Bekannte Properties explizit
}
```

> 🧠 **Erklaere dir selbst:** Warum ist `Record<string, any>` eine schlechtere Loesung als `Record<string, unknown>`? Was verlierst du mit `any`?
> **Kernpunkte:** any deaktiviert Type-Checking komplett | unknown erzwingt Pruefung vor Verwendung | Record<string, any> ist wie kein TypeScript | Record<string, unknown> ist sicher + flexibel

---

## Problem 2: CommonJS vs. ES Modules

JavaScript-Projekte mischen oft CommonJS und ES Module Syntax:

```typescript annotated
// CommonJS (Node.js Standard bis vor kurzem):
const express = require("express");
module.exports = { router };
module.exports.handler = function() {};

// TypeScript-Migration:
import express from "express";
// ^ FEHLER: Module has no default export
// Fix: esModuleInterop: true in tsconfig.json

import * as express from "express";
// ^ Alternative ohne esModuleInterop

// module.exports → export
export { router };
export function handler() {}

// Schwieriger Fall: module.exports = function()
// module.exports = function createApp() { ... }
// → export default function createApp() { ... }
// ACHTUNG: Default-Exports aendern die Import-Syntax!
```

```typescript annotated
// tsconfig.json fuer gemischte Projekte:
{
  "compilerOptions": {
    "esModuleInterop": true,
    // ^ Erlaubt: import express from "express"
    // ^ Statt:   import * as express from "express"
    // ^ Generiert __importDefault Helper

    "allowSyntheticDefaultImports": true,
    // ^ Erlaubt Default-Imports von Modulen ohne Default-Export
    // ^ Nur Typ-Level — aendert den generierten Code nicht

    "moduleResolution": "bundler"
    // ^ Modern: Versteht package.json "exports" Feld
    // ^ Empfohlen fuer Projekte mit Bundler (Vite, webpack, esbuild)
  }
}
```

> 💭 **Denkfrage:** Warum hat TypeScript `esModuleInterop` nicht von Anfang
> an als Standard? Warum ist es eine Option die man aktivieren muss?
>
> **Antwort:** Abwaertskompatibilitaet. Aeltere TypeScript-Projekte haben
> bereits `import * as` verwendet. esModuleInterop aendert den generierten
> Code — das wuerde bestehende Projekte brechen. Deshalb ist es opt-in.
> Neue Projekte sollten es IMMER aktivieren.

---

## Problem 3: this-Binding

JavaScript's `this` ist notorisch flexibel — TypeScript macht es strikt:

```typescript annotated
// JavaScript — this ist dynamisch:
class EventHandler {
  constructor() {
    this.name = "Handler";
  }
  handle() {
    console.log(this.name);  // Was ist 'this'? Kommt drauf an...
  }
}

const handler = new EventHandler();
button.addEventListener("click", handler.handle);
// ^ 'this' ist NICHT handler, sondern das button-Element!
// ^ In JavaScript: silent bug. In TypeScript mit noImplicitThis: FEHLER

// Fix 1: Arrow Function (kein eigenes this)
class EventHandler {
  name = "Handler";
  handle = () => {
    // ^ Arrow Function bindet this an die Instanz
    console.log(this.name);  // this ist immer EventHandler
  };
}

// Fix 2: bind() im Konstruktor
class EventHandler {
  name = "Handler";
  constructor() {
    this.handle = this.handle.bind(this);
    // ^ Explizites Binding — TypeScript versteht das
  }
  handle() {
    console.log(this.name);
  }
}
```

---

## Problem 4: Implizite any-Arrays

```typescript annotated
// JavaScript-Pattern das in TypeScript Probleme macht:
const items = [];
// ^ Typ: any[] (implizit any!)
items.push("hello");
items.push(42);
// ^ Gemischtes Array — in JS normal, in TS problematisch

// Fix 1: Typ annotieren
const items: string[] = [];
items.push("hello");  // OK
items.push(42);        // FEHLER!

// Fix 2: Union-Typ wenn gemischt gewollt
const items: (string | number)[] = [];
items.push("hello");  // OK
items.push(42);        // OK

// Fix 3: Sofort initialisieren (Inferenz)
const items = ["hello", "world"];
// ^ Typ: string[] (inferiert aus dem Inhalt)
```

---

## Problem 5: Lose Funktion-Typen

```typescript annotated
// JavaScript: Funktionen akzeptieren alles
function process(callback) {
  callback({ data: "test" });
}

// TypeScript mit noImplicitAny: FEHLER
// Fix: Callback-Typ definieren
function process(callback: (result: { data: string }) => void) {
  callback({ data: "test" });
}

// Oder mit generischem Callback:
function process<T>(callback: (result: T) => void, data: T) {
  callback(data);
}
```

> ⚡ **Framework-Bezug (Angular):** In Angular-Projekten sind lose Callback-
> Typen besonders bei Event-Handlern ein Problem:
>
> ```typescript
> // VORHER (JavaScript-Stil):
> onUserSelect(event) {  // event ist 'any'
>   this.selectedUser = event.detail;
> }
>
> // NACHHER (TypeScript):
> onUserSelect(event: CustomEvent<User>) {
>   this.selectedUser = event.detail;  // Typ: User
> }
> ```

---

## Problem 6-10: Weitere haeufige Probleme

```typescript annotated
// Problem 6: JSON.parse() gibt 'any'
const data = JSON.parse(jsonString);
// ^ Typ: any — TypeScript kann JSON nicht statisch analysieren
// Fix: Type Assertion oder Validierung
const data = JSON.parse(jsonString) as Config;       // Unsicher aber schnell
const data = configSchema.parse(JSON.parse(jsonString)); // Sicher mit zod

// Problem 7: Object.keys() gibt string[]
const obj: Config = { host: "localhost", port: 3000 };
Object.keys(obj).forEach(key => {
  console.log(obj[key]);
  // ^ FEHLER: Element implicitly has an 'any' type
  // ^ Object.keys() gibt string[], nicht (keyof Config)[]
});
// Fix: Expliziter Cast
(Object.keys(obj) as (keyof Config)[]).forEach(key => {
  console.log(obj[key]);  // OK
});

// Problem 8: Third-Party Events (z.B. Socket.io)
// socket.on("message", (data) => { ... })
// ^ data ist 'any' — typische Quelle fuer untypisierte Daten
// Fix: Event-Map definieren

// Problem 9: Mutable Objekte aus Konfiguration
// const config = require("./config.json");
// Fix: import config from "./config.json" + resolveJsonModule: true

// Problem 10: Globale Augmentation
// jQuery, Lodash als globale Variable
// Fix: declare global (siehe Sektion 4)
```

> 🧪 **Experiment:** Teste das Object.keys-Problem:
>
> ```typescript
> interface User { name: string; age: number; }
> const user: User = { name: "Max", age: 30 };
>
> // Warum gibt Object.keys(user) string[] statt ("name" | "age")[]?
> Object.keys(user).forEach(key => {
>   // Versuche: user[key] — was passiert?
>   // Versuche: user[key as keyof User] — was passiert?
> });
>
> // Antwort: TypeScript ist konservativ. Ein User-Objekt KOENNTE
> // zusaetzliche Properties haben (strukturelles Typsystem!).
> // Deshalb ist string[] technisch korrekt, auch wenn es nervt.
> ```
>
> Das ist kein Bug — es ist ein bewusste Designentscheidung.

---

## Was du gelernt hast

- **Dynamische Properties** sind das #1 Problem — loese sie mit Record oder Index Signatures
- **CommonJS/ESM-Konflikte** loest du mit `esModuleInterop` und `moduleResolution: bundler`
- **this-Binding** in Klassen fixst du mit Arrow Functions oder bind()
- **JSON.parse und Object.keys** geben `any`/`string[]` — bewusst so designt
- Migrationen scheitern an **zu aggressiven Einstellungen**, nicht an TypeScript

**Kernkonzept zum Merken:** Die meisten Migrationsprobleme fallen in 5-6 Kategorien. Wenn du diese Muster kennst, loest du 80% der Fehler mechanisch. Die restlichen 20% erfordern Nachdenken ueber die Datenstruktur — und genau das ist der Wert von TypeScript.

---

> **Pausenpunkt** -- Guter Moment fuer eine Pause. Du kennst jetzt die
> haeufigsten Stolpersteine.
>
> Weiter geht es mit: [Sektion 06: Praxis — Angular- und React-Migration](./06-praxis-framework-migration.md)
