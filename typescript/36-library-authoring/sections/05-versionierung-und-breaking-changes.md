# Sektion 5: Versionierung und Breaking Changes bei Typen

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Generische Library-Patterns](./04-generische-library-patterns.md)
> Naechste Sektion: [06 - Praxis: Eigene Utility-Library und npm publish](./06-praxis-utility-library.md)

---

## Was du hier lernst

- Warum **Typ-Aenderungen** genauso Breaking Changes sein koennen wie Code-Aenderungen
- Was die **Semantic Versioning (SemVer) Regeln** fuer Typen sind
- Welche scheinbar harmlosen Aenderungen **Konsumenten-Code brechen**
- Wie du **non-breaking Typ-Erweiterungen** designst

---

## Hintergrund: Typen sind Teil der API

> **Origin Story: Das Ember.js SemVer-fuer-Typen RFC**
>
> 2021 veroeffentlichte das Ember.js-Team ein bahnbrechendes RFC:
> "Semantic Versioning for TypeScript Types". Es definierte erstmals
> formal, was ein "Breaking Change" bei Typen bedeutet. Der Grund:
> Ember hatte mehrfach "Minor"-Releases veroeffentlicht die Typ-
> Definitionen aenderten — und damit den Build von Konsumenten brachen.
>
> Die Erkenntnis: Wenn du eine TypeScript-Library veroeffentlichst,
> sind die Typen genauso Teil der oeffentlichen API wie die Funktionen.
> Eine Typ-Aenderung die Konsumenten-Code zum Nicht-Kompilieren bringt,
> ist ein Breaking Change — auch wenn sich zur Laufzeit nichts aendert.

Die Regel ist einfach: **Wenn dein Typ-Update den Build eines
Konsumenten bricht, ist es ein Breaking Change und erfordert eine
Major-Version.**

---

## Was ist ein Breaking Change bei Typen?

```typescript annotated
// === BREAKING: Typ enger machen (Rueckgabe/Output) ===

// v1.0.0:
export function getUser(): { id: string; name: string; email: string };

// v1.1.0 — BREAKING! email entfernt:
export function getUser(): { id: string; name: string };
// ^ Konsumenten die user.email nutzen → COMPILE-ERROR
// ^ Das ist ein MAJOR-Bump: v2.0.0

// === BREAKING: Typ breiter machen (Parameter/Input) ===
// (klingt paradox, aber...)

// v1.0.0:
export function formatDate(date: Date): string;

// v1.1.0 — BREAKING! Parameter wird Union:
export function formatDate(date: Date | string): string;
// ^ NICHT breaking fuer Aufrufer (Date funktioniert weiterhin)
// ^ ABER breaking fuer Typ-Guards die 'typeof date === "object"' nutzen
// ^ Und fuer generische Wrapper: T extends Date → schlaegt fehl fuer string
```

> 🧠 **Erklaere dir selbst:** Warum ist das Hinzufuegen einer optionalen Property zum Rueckgabetyp KEIN Breaking Change, aber das Entfernen schon?
> **Kernpunkte:** Hinzufuegen = Konsumenten koennen es nutzen oder ignorieren | Entfernen = Konsumenten die es nutzen brechen | Gleiche Logik wie bei REST APIs: neue Felder OK, entfernte Felder = Breaking

---

## Die SemVer-Regeln fuer Typen

| Aenderung | SemVer | Warum |
|-----------|:------:|-------|
| Neue optionale Property in Rueckgabe | Minor | Konsumenten koennen es ignorieren |
| Property aus Rueckgabe entfernen | **Major** | Konsumenten die es nutzen brechen |
| Neuer optionaler Parameter | Minor | Bestehende Aufrufe funktionieren weiter |
| Parameter-Typ einschraenken | **Major** | Bestehende Aufrufe koennen brechen |
| Neuer Export hinzufuegen | Minor | Bricht nichts |
| Export entfernen | **Major** | Importe brechen |
| Required Property zu optional machen | **Major** | Konsumenten die auf non-null vertrauen brechen |
| Generic Constraint verschaerfen | **Major** | Bestehende Instantiierungen koennen brechen |
| TypeScript Minimum-Version erhoehen | **Major** | Konsumenten auf aelterem TS brechen |

```typescript annotated
// Beispiel: Optional → Required (BREAKING)
// v1.0.0:
export interface Config {
  host: string;
  port?: number;   // optional
}

// v2.0.0 — MAJOR! port wird Pflicht:
export interface Config {
  host: string;
  port: number;    // required!
}
// ^ Alle Konsumenten die Config ohne port erstellen → FEHLER
// ^ { host: "localhost" } war vorher gueltig, jetzt nicht mehr
```

> 💭 **Denkfrage:** Ist das Aendern eines Rueckgabetyps von `string` zu
> `string | null` ein Breaking Change?
>
> **Antwort:** JA — und das ist einer der haeufigsten versteckten Breaking
> Changes. Konsumenten die `const len = getTitle().length` schreiben,
> bekommen mit strictNullChecks einen Fehler: "Object is possibly null."
> Der Wert war vorher nie null — jetzt kann er es sein.

---

## Defensive Typ-Strategien

So designst du Typen die du spaeter erweitern kannst ohne zu brechen:

```typescript annotated
// Strategie 1: Opaque Types fuer Erweiterbarkeit
// SCHLECHT: Direktes Interface (schwer erweiterbar)
export interface UserId {
  value: string;
}

// GUT: Branded Type (intern erweiterbar)
export type UserId = string & { readonly __brand: unique symbol };
// ^ Du kannst intern die Validierung aendern ohne die API zu brechen
// ^ Konsumenten sehen nur: UserId (ein String mit Brand)

// Strategie 2: Options-Objekte statt fester Parameter
// SCHLECHT: Feste Parameter (Breaking bei neuen Pflichtfeldern)
export function send(to: string, subject: string, body: string): void;

// GUT: Options-Objekt (erweiterbar)
export interface SendOptions {
  to: string;
  subject: string;
  body: string;
  // Spaeter hinzufuegen: cc?: string — kein Breaking Change!
}
export function send(options: SendOptions): void;

// Strategie 3: Union-Typen offen halten
// SCHLECHT: Feste Union (jede neue Variante ist Breaking fuer exhaustive Checks)
export type Status = "active" | "inactive";

// GUT: String-Subtyp (erweiterbar)
export type Status = "active" | "inactive" | (string & {});
// ^ (string & {}) erlaubt beliebige Strings aber zeigt Autocomplete fuer bekannte
// ^ Neue Status-Werte brechen keine exhaustive switch-Statements
```

> ⚡ **Framework-Bezug (Angular):** Angular nutzt diese Strategie bei
> seinen Konfigurationstypen. Zum Beispiel `provideRouter()`: Das
> Options-Objekt hat dutzende optionale Properties. Jede neue Angular-
> Version fuegt Properties hinzu — das ist nie ein Breaking Change
> weil sie optional sind. Konsumenten die die neuen Properties nicht
> nutzen, merken nichts.

---

## TypeScript-Version als Breaking Change

Das Erhoehen der minimalen TypeScript-Version ist ein Breaking Change:

```typescript annotated
// v1.0.0: Funktioniert mit TypeScript 4.5+
// Du nutzt: Conditional Types, Mapped Types, etc.

// v2.0.0: Erfordert TypeScript 5.0+
// Du nutzt: const type parameters, satisfies, etc.
// ^ Konsumenten auf TypeScript 4.9 brechen!

// Empfehlung:
// - In package.json angeben:
{
  "engines": {
    "node": ">=18"
  },
  "peerDependencies": {
    "typescript": ">=5.0"
    // ^ Macht die Mindestversion explizit
  }
}

// - In README dokumentieren:
// "This library requires TypeScript 5.0 or later."

// - TS-Version-Bump = Major-Version deiner Library
```

> 🧪 **Experiment:** Pruefe ob eine Typ-Aenderung breaking ist:
>
> ```typescript
> // Version 1:
> interface ConfigV1 { host: string; port: number; }
> export function createServer(config: ConfigV1): void;
>
> // Version 2 — ist das breaking?
> interface ConfigV2 { host: string; port: number; ssl?: boolean; }
> export function createServer(config: ConfigV2): void;
>
> // Test: Wuerde Code der gegen V1 geschrieben wurde mit V2 kompilieren?
> const config: ConfigV1 = { host: "localhost", port: 3000 };
> createServer(config); // Kompiliert mit V2? → JA! (ssl ist optional)
> // → NICHT breaking → Minor-Version
> ```
>
> Fuehre den Gedankentest immer durch: "Kompiliert bestehender
> Konsumenten-Code noch?"

---

## Changelog fuer Typen

```typescript annotated
// CHANGELOG.md — Best Practice:
//
// ## 2.0.0 (Breaking Changes)
//
// ### Type Changes
// - **BREAKING**: `getUser()` returns `User | null` instead of `User`
//   - Migration: Add null-check before accessing properties
//   - Reason: Align with API that can return 404
//
// - **BREAKING**: Minimum TypeScript version raised to 5.0
//   - Migration: Update TypeScript in your project
//
// ## 1.2.0 (Features)
//
// ### Type Changes
// - Added optional `timeout` property to `RequestOptions`
// - Added new export `createBatchClient`
// - Generic `Client<T>` now infers T from constructor argument
//
// ^ Typ-Aenderungen explizit im Changelog dokumentieren
// ^ "BREAKING" prominent markieren
// ^ Migration-Anleitung angeben
```

---

## Was du gelernt hast

- **Typ-Aenderungen** sind genauso Breaking Changes wie Code-Aenderungen
- Properties **entfernen** = Major, Properties **hinzufuegen** (optional) = Minor
- **Options-Objekte** statt fester Parameter sind erweiterungsfreundlicher
- **TypeScript-Version erhoehen** ist ein Breaking Change
- **Changelog** sollte Typ-Aenderungen explizit dokumentieren

**Kernkonzept zum Merken:** Deine Typen sind ein Vertrag mit deinen Konsumenten. Jede Aenderung die bestehenden Konsumenten-Code bricht, erfordert eine Major-Version — egal ob sich zur Laufzeit etwas aendert oder nicht. Designe Typen von Anfang an erweiterbar: Options-Objekte, optionale Properties, Branded Types.

---

> **Pausenpunkt** -- Guter Moment fuer eine Pause. Du verstehst jetzt,
> warum Versionierung bei Typen so wichtig ist.
>
> Weiter geht es mit: [Sektion 06: Praxis — Eigene Utility-Library und npm publish](./06-praxis-utility-library.md)
