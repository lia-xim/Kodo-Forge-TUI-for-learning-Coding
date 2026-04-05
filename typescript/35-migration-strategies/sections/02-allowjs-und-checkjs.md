# Sektion 2: allowJs und checkJs Strategie

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Migrationspfade im Ueberblick](./01-migrationspfade-im-ueberblick.md)
> Naechste Sektion: [03 - Strict Mode stufenweise aktivieren](./03-strict-mode-stufenweise.md)

---

## Was du hier lernst

- Wie `allowJs` und `checkJs` die **Bruecke** zwischen JavaScript und TypeScript bilden
- Wie **JSDoc-Annotationen** JavaScript-Dateien typsicher machen OHNE sie umzubenennen
- Wie `@ts-check` und `@ts-nocheck` feinkoernige Kontrolle geben
- Einen konkreten **Migrations-Workflow** mit allowJs als erstem Schritt

---

## Hintergrund: Die Bruecke zwischen den Welten

> **Origin Story: Warum allowJs existiert**
>
> In der fruehen TypeScript-Geschichte (2012-2014) gab es ein hartes Entweder-
> Oder: Entweder eine Datei war TypeScript (.ts) oder JavaScript (.js). Es
> gab keine Koexistenz. Das machte Migration zu einem Alles-oder-Nichts-
> Unterfangen — genau das Gegenteil von TypeScripts Philosophie der
> graduellen Adoption.
>
> allowJs wurde in TypeScript 1.8 (2016) eingefuehrt. Es erlaubt .js-Dateien
> im selben Projekt wie .ts-Dateien. checkJs (TypeScript 2.3, 2017) ging
> noch weiter: Es prueft JavaScript-Dateien auf Typfehler — anhand von
> JSDoc-Kommentaren und Typinferenz. Zusammen ermoeglichten diese Features
> die graduelle Migration, die heute Standard ist.

allowJs und checkJs sind die Werkzeuge, die graduelle Migration erst
moeglich machen. Sie erlauben dir, TypeScript-Typen zu NUTZEN, bevor
du eine einzige Datei umbenennst.

---

## Schritt 1: allowJs aktivieren

```typescript annotated
// tsconfig.json — Minimale Konfiguration fuer gemischtes Projekt
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowJs": true,
    // ^ Erlaubt .js-Dateien im TypeScript-Projekt
    // ^ .ts-Dateien koennen .js-Dateien importieren
    // ^ .js-Dateien koennen .ts-Dateien importieren
    "outDir": "./dist",
    "strict": false
    // ^ WICHTIG: strict erst spaeter aktivieren!
    // ^ Bei Migration: erstmal kompilieren, dann verschaerfen
  },
  "include": ["src/**/*"]
  // ^ Inkludiert BEIDE: .ts und .js Dateien
}
```

Was aendert sich mit allowJs?

- .js-Dateien werden vom Compiler **einbezogen** (vorher ignoriert)
- Imports zwischen .js und .ts funktionieren **bidirektional**
- TypeScript inferiert Typen in .js-Dateien so gut es kann
- .js-Dateien werden NICHT auf Typfehler geprueft (dafuer brauchst du checkJs)

> 💭 **Denkfrage:** Wenn allowJs aktiv ist und du `import { helper } from './utils.js'`
> in einer .ts-Datei schreibst — welchen Typ hat `helper`?
>
> **Antwort:** TypeScript versucht den Typ zu inferieren. Wenn utils.js
> `export function helper(x) { return x + 1; }` hat, inferiert TS:
> `helper: (x: any) => any`. Ohne Typ-Annotationen ist alles `any`.
> Mit JSDoc wird es besser (naechster Abschnitt).

---

## Schritt 2: checkJs aktivieren

checkJs geht einen Schritt weiter — es prueft JavaScript-Dateien
auf Typfehler:

```typescript annotated
// tsconfig.json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true
    // ^ PRUEFT jetzt .js-Dateien auf Typfehler!
    // ^ Ohne Annotationen: Typinferenz (oft "any")
    // ^ Mit JSDoc: echtes Type-Checking
  }
}
```

Das Problem: checkJs findet sofort Hunderte "Fehler" in bestehendem
JavaScript. Die Loesung: `@ts-nocheck` fuer Dateien die du noch
nicht migrieren willst:

```typescript annotated
// @ts-nocheck
// ^ Erste Zeile der Datei — deaktiviert checkJs fuer diese Datei
// ^ Verwende das als "Noch nicht migriert"-Marker

// Umgekehrt: @ts-check in einzelnen .js-Dateien aktivieren
// (ohne globales checkJs: true)

// @ts-check
// ^ Aktiviert Type-Checking NUR fuer diese Datei
// ^ Nuetzlich wenn du checkJs global noch nicht aktivieren willst
// ^ Gut fuer den "Datei fuer Datei"-Ansatz

// Und fuer einzelne Zeilen:
// @ts-ignore
// ^ Ignoriert den Fehler in der NAECHSTEN Zeile
// @ts-expect-error
// ^ Besser als @ts-ignore: Fehler wenn die Zeile KEINEN Fehler hat
// ^ Wird automatisch obsolet wenn der Fehler gefixt wird
```

> 🧠 **Erklaere dir selbst:** Was ist der Unterschied zwischen `@ts-ignore` und `@ts-expect-error`? Warum ist `@ts-expect-error` besser fuer Migrationen?
> **Kernpunkte:** @ts-ignore ignoriert immer | @ts-expect-error ERWARTET einen Fehler | Wenn der Fehler gefixt wird: @ts-ignore bleibt still, @ts-expect-error meldet sich | @ts-expect-error raeumt sich selbst auf

---

## JSDoc: Typen in JavaScript

JSDoc-Annotationen geben JavaScript-Dateien echte Typen — ohne
die Datei umzubenennen:

```typescript annotated
// utils.js — mit JSDoc-Typen

/**
 * @param {string} name - Der Name des Benutzers
 * @param {number} age - Das Alter
 * @returns {{ name: string, age: number, isAdult: boolean }}
 */
function createUser(name, age) {
  // ^ TypeScript kennt jetzt die Typen ALLER Parameter
  // ^ Autocomplete funktioniert, Fehler werden erkannt
  return { name, age, isAdult: age >= 18 };
}

/** @type {import('./types').Config} */
const config = loadConfig();
// ^ Importiert einen TypeScript-Typ in JavaScript!
// ^ config hat jetzt den vollen Config-Typ mit Autocomplete

/** @typedef {{ id: string, email: string }} User */
// ^ Definiert einen wiederverwendbaren Typ in JavaScript
// ^ Kann mit @type {User} referenziert werden

/**
 * @template T
 * @param {T[]} items
 * @param {(item: T) => boolean} predicate
 * @returns {T | undefined}
 */
function find(items, predicate) {
  // ^ Sogar Generics funktionieren mit JSDoc!
  return items.find(predicate);
}
```

> ⚡ **Framework-Bezug (React):** JSDoc ist besonders nuetzlich fuer
> React-Projekte die noch JavaScript verwenden. Du kannst Props-Typen
> mit JSDoc definieren:
>
> ```javascript
> /**
>  * @param {{ name: string, onSave: (name: string) => void }} props
>  */
> function UserCard({ name, onSave }) {
>   return <div onClick={() => onSave(name)}>{name}</div>;
> }
> ```
>
> Die IDE zeigt Autocomplete fuer Props, TypeScript prueft die Verwendung —
> alles ohne die Datei von .jsx zu .tsx umzubenennen.

---

## Der Migrations-Workflow

So sieht die graduelle Migration mit allowJs in der Praxis aus:

```typescript annotated
// Phase 1: Setup (Tag 1)
// tsconfig.json: allowJs: true, checkJs: false, strict: false
// → Alle .js-Dateien sind im Projekt, aber nicht geprueft

// Phase 2: Neue Dateien in .ts (ab Tag 2)
// Regel: Jede NEUE Datei wird als .ts erstellt
// → Der TS-Anteil waechst natuerlich mit jeder neuen Datei

// Phase 3: Blaetter migrieren (Woche 2-4)
// src/types.js → src/types.ts (Interfaces definieren)
// src/utils.js → src/utils.ts (Utility-Funktionen typisieren)
// ^ Blaetter haben keine Abhaengigkeiten → sicherste Migration

// Phase 4: checkJs fuer einzelne Dateien (Woche 4-8)
// Datei fuer Datei: @ts-check hinzufuegen, Fehler fixen
// Oder: checkJs: true + @ts-nocheck in noch nicht migrierten Dateien

// Phase 5: Dateien umbenennen (Woche 8-12)
// .js → .ts umbenennen (JSDoc → echte Typ-Annotationen)
// JSDoc entfernen, TypeScript-Syntax verwenden
// ^ Das ist der einfachste Schritt — die Typen existieren ja schon

// Phase 6: Strict Mode (Woche 12+)
// → Naechste Sektion!
```

> 🧪 **Experiment:** Erstelle eine Datei `test.js` mit folgendem Inhalt und
> beobachte das Verhalten mit verschiedenen Einstellungen:
>
> ```javascript
> // @ts-check
> function add(a, b) {
>   return a + b;
> }
> const result = add("hello", 42);
> // Frage: Erkennt TypeScript hier einen Fehler?
> // Antwort: NEIN — ohne @param-Annotationen sind a und b "any"
>
> // Jetzt mit JSDoc:
> /** @param {number} a @param {number} b */
> function addTyped(a, b) {
>   return a + b;
> }
> const result2 = addTyped("hello", 42);
> // JETZT meldet TypeScript: "hello" ist kein number!
> ```
>
> Beobachte: Ohne JSDoc-Typen ist @ts-check zahnlos. Die Kombination aus
> @ts-check + JSDoc gibt dir echtes Type-Checking in JavaScript.

---

## Haeufige Fallstricke

```typescript annotated
// Fallstrick 1: require() statt import
// allowJs unterstuetzt require(), aber die Typ-Inferenz ist schlechter:
const fs = require("fs");
// ^ Typ: any (keine Typ-Information!)

import * as fs from "fs";
// ^ Typ: typeof import("fs") — volle Typ-Information
// Loesung: Imports frueh auf ES-Module-Syntax umstellen

// Fallstrick 2: module.exports vs export
// module.exports = { helper };
// ^ TypeScript inferiert den Export-Typ, aber nicht immer korrekt
// Loesung: exports-Objekt mit JSDoc annotieren oder frueh auf export umstellen

// Fallstrick 3: Dynamische Properties
// const obj = {};
// obj.name = "test";  // ← FEHLER mit checkJs!
// ^ TypeScript's Typ fuer {} hat kein 'name'-Property
// Loesung: /** @type {{ name?: string }} */ oder const obj = { name: "" };
```

---

## Was du gelernt hast

- `allowJs: true` erlaubt **gemischte Projekte** (.js + .ts gleichzeitig)
- `checkJs: true` **prueft JavaScript-Dateien** auf Typfehler
- **JSDoc-Annotationen** geben JavaScript echte Typen (Params, Returns, Generics)
- `@ts-check` und `@ts-nocheck` geben **Kontrolle pro Datei**
- `@ts-expect-error` ist besser als `@ts-ignore` weil es sich **selbst aufraeumt**
- Der Workflow: allowJs → neue Dateien in .ts → Blaetter migrieren → umbenennen

**Kernkonzept zum Merken:** allowJs und checkJs sind die Bruecke zwischen JavaScript und TypeScript. Du musst nicht alles auf einmal migrieren — JSDoc + @ts-check geben dir 80% des TypeScript-Vorteils in JavaScript-Dateien, ohne sie umzubenennen.

---

> **Pausenpunkt** -- Guter Moment fuer eine Pause. Du weisst jetzt, wie du
> JavaScript-Dateien schrittweise in ein TypeScript-Projekt integrierst.
>
> Weiter geht es mit: [Sektion 03: Strict Mode stufenweise aktivieren](./03-strict-mode-stufenweise.md)
