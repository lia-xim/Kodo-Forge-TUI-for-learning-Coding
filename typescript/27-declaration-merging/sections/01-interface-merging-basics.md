# Sektion 1: Interface Merging Basics

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: -- (Start)
> Naechste Sektion: [02 - Module Augmentation](./02-module-augmentation.md)

---

## Was du hier lernst

- Was **Declaration Merging** ist und warum TypeScript es unterstuetzt
- Wie **Interface Merging** zwei gleichnamige Interfaces automatisch vereint
- Die Regeln fuer **Konflikte** bei Merging (gleiche Properties, verschiedene Typen)
- Warum Interface Merging das **Erweitern von Bibliotheken** ermoeglicht

---

## Hintergrund: Warum Declaration Merging?

> **Feature Origin Story: Declaration Merging**
>
> Als Anders Hejlsberg und sein Team TypeScript 2012 entwarfen, standen
> sie vor einem fundamentalen Problem: Wie beschreibt man die Typen
> von **existierendem JavaScript-Code**, der nie fuer Typen designed wurde?
>
> JavaScript-Bibliotheken wie jQuery, Express oder Lodash verwenden
> Patterns die in statischen Sprachen unueblich sind: Ein Objekt ist
> gleichzeitig eine Funktion und hat Properties. Eine Klasse wird zur
> Laufzeit mit neuen Methoden erweitert. Globale Objekte wie `window`
> bekommen neue Properties je nach geladenem Skript.
>
> Die Loesung: **Declaration Merging** — TypeScript vereint automatisch
> mehrere Deklarationen mit dem gleichen Namen. Das ermoeglicht es,
> JavaScript-Patterns praezise zu typisieren, die in einer einzelnen
> Deklaration nicht ausdrueckbar waeren. Und es erlaubt Nutzern,
> existierende Typen zu **erweitern** ohne den Originalcode zu aendern.

---

## Grundregel: Gleichnamige Interfaces werden vereint

```typescript annotated
// Deklaration 1:
interface User {
  id: string;
  name: string;
}

// Deklaration 2 (gleicher Name!):
interface User {
  email: string;
  role: "admin" | "user";
}

// TypeScript VEREINT beide zu EINEM Interface:
// Ergebnis:
// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: "admin" | "user";
// }

const user: User = {
  id: "1",
  name: "Max",
  email: "max@example.com",
  role: "admin",
  // ^ Alle 4 Properties sind Pflicht! Beide Deklarationen sind vereint.
};
```

> 🧠 **Erklaere dir selbst:** Warum funktioniert Interface Merging nur
> mit `interface` und nicht mit `type`? Was wuerde passieren wenn man
> zwei `type User = ...` Deklarationen haette?
>
> **Kernpunkte:** `type` erlaubt keine Doppeldeklaration → Compile-Error |
> `interface` wurde absichtlich so designed: Merging ist ein Feature |
> type ist eine feste Zuweisung, interface ist eine offene Deklaration |
> Das macht interface ideal fuer erweiterbare APIs

---

## Konflikte beim Merging
<!-- section:summary -->
Was passiert wenn beide Deklarationen das **gleiche Property** haben?

<!-- depth:standard -->
Was passiert wenn beide Deklarationen das **gleiche Property** haben?

```typescript annotated
// Regel 1: Gleicher Name + GLEICHER Typ → OK
interface Config {
  debug: boolean;
}
interface Config {
  debug: boolean; // Gleicher Typ → kein Problem
}

// Regel 2: Gleicher Name + VERSCHIEDENER Typ → COMPILE-ERROR!
interface Settings {
  port: number;
}
// interface Settings {
//   port: string; // FEHLER! 'port' hat bereits Typ 'number'
// }
// ^ "Subsequent property declarations must have the same type."

// Regel 3: Bei Methoden-Overloads → Spaetere Deklaration hat VORRANG
interface Serializer {
  serialize(input: string): string;
}
interface Serializer {
  serialize(input: number): string;
  serialize(input: boolean): string;
}
// Ergebnis: Overloads in umgekehrter Reihenfolge der Deklaration!
// serialize(input: number): string;   ← spaetere Deklaration zuerst
// serialize(input: boolean): string;  ← spaetere Deklaration zuerst
// serialize(input: string): string;   ← fruehere Deklaration zuletzt
```

> 💭 **Denkfrage:** Warum hat die **spaetere** Deklaration Vorrang bei
> Methoden-Overloads? Was waere das Problem wenn die fruehere Vorrang haette?
>
> **Antwort:** Die spaetere Deklaration ist typischerweise die
> **Erweiterung** (z.B. Plugin, Bibliotheks-Extension). Wenn du einen
> Typ erweiterst, willst du dass deine Overloads zuerst geprueft werden —
> sonst koennten sie von den Original-Overloads "ueberdeckt" werden.
> TypeScript priorisiert also den **Erweiterer** ueber den **Ersteller**.

---

<!-- /depth -->
## Praktische Anwendung: Window erweitern
<!-- section:summary -->
Das haeufigste Beispiel fuer Interface Merging in der Praxis:

<!-- depth:standard -->
Das haeufigste Beispiel fuer Interface Merging in der Praxis:

```typescript annotated
// TypeScript's eingebaute Definition:
// interface Window {
//   document: Document;
//   navigator: Navigator;
//   // ... hunderte Properties
// }

// Du erweiterst es — z.B. fuer eine globale Analytics-Library:
interface Window {
  analytics: {
    track(event: string, data?: Record<string, unknown>): void;
    identify(userId: string): void;
  };
  __APP_CONFIG__: {
    apiUrl: string;
    environment: "dev" | "staging" | "prod";
  };
}

// Jetzt: window.analytics ist typisiert!
window.analytics.track("page_view", { path: "/home" });
window.__APP_CONFIG__.apiUrl; // string — typsicher!

// Ohne Interface Merging muesste man casten:
// (window as any).analytics.track(...); // Unsicher!
```

<!-- depth:vollstaendig -->
> **Experiment:** Oeffne eine beliebige TypeScript-Datei und tippe
> `window.` — schau dir die Autocomplete-Liste an. Jetzt fuege
> dieses Interface Merging hinzu:
>
> ```typescript
> interface Window {
>   myCustomProperty: string;
> }
> ```
>
> Tippe erneut `window.` — `myCustomProperty` erscheint in der Liste!
> Das ist Interface Merging in Aktion.

---

<!-- /depth -->
## Enum Merging
<!-- section:summary -->
Weniger bekannt: Auch Enums koennen gemergt werden:

<!-- depth:standard -->
Weniger bekannt: Auch Enums koennen gemergt werden:

```typescript annotated
enum Direction {
  Up = "UP",
  Down = "DOWN",
}

enum Direction {
  Left = "LEFT",
  Right = "RIGHT",
  // ^ Achtung: Nur der ERSTE Enum-Block darf ohne Initializer sein!
  //   Alle weiteren Bloecke muessen explizite Werte haben.
}

// Ergebnis: Direction hat Up, Down, Left, Right
const d: Direction = Direction.Left; // OK
```

> ⚡ **In deinem Angular-Projekt** begegnest du Interface Merging implizit:
>
> ```typescript
> // @angular/core definiert:
> // interface OnInit { ngOnInit(): void; }
>
> // Wenn du ein Angular-Plugin schreibst das neue Lifecycle-Hooks
> // hinzufuegen will, koennte es theoretisch OnInit erweitern:
> // interface OnInit { onPluginInit?(): void; }
> // ^ In der Praxis macht man das selten bei Angular-Hooks,
> //   aber das PRINZIP ist das gleiche wie bei Window-Erweiterungen.
> ```
>
> In React ist Interface Merging fuer JSX-Attribute wichtig:
>
> ```typescript
> // @types/react definiert:
> // namespace JSX { interface IntrinsicElements { div: ...; span: ...; } }
>
> // Custom Elements erweitern:
> declare namespace JSX {
>   interface IntrinsicElements {
>     "my-component": { label: string; onAction?: () => void };
>   }
> }
> // <my-component label="Hallo" /> → typsicher!
> ```

---

<!-- /depth -->
## Namespace Merging
<!-- section:summary -->
Namespaces koennen ebenfalls gemergt werden — und sogar mit

<!-- depth:standard -->
Namespaces koennen ebenfalls gemergt werden — und sogar mit
Klassen, Funktionen oder Enums kombiniert werden:

```typescript annotated
// Funktion + Namespace → Funktion mit Properties!
function jQuery(selector: string): HTMLElement[] {
  return Array.from(document.querySelectorAll(selector));
}

namespace jQuery {
  export function ajax(url: string): Promise<unknown> {
    return fetch(url).then(r => r.json());
  }
  export const version = "3.7.1";
}

// jQuery ist BEIDES: Funktion und Objekt mit Properties
jQuery("div");           // Funktion aufrufen
jQuery.ajax("/api");     // Property aufrufen
jQuery.version;          // "3.7.1"
// ^ Das ist genau wie das echte jQuery funktioniert!
```

---

<!-- /depth -->
## Was du gelernt hast

- **Declaration Merging** vereint mehrere gleichnamige Deklarationen automatisch
- **Interface Merging** kombiniert Properties — Konflikte bei verschiedenen Typen sind verboten
- Bei **Methoden-Overloads** hat die spaetere Deklaration Vorrang
- **Enum Merging** und **Namespace Merging** erweitern das Konzept auf andere Deklarationsarten
- Namespace + Funktion/Klasse ermoeglicht Patterns wie `jQuery()` + `jQuery.ajax()`

> 🧠 **Erklaere dir selbst:** Warum erlaubt TypeScript nur `interface`
> Merging und nicht `type` Merging? Was ist der konzeptionelle Unterschied?
>
> **Kernpunkte:** `interface` ist eine "offene" Deklaration — erweiterbar |
> `type` ist eine "geschlossene" Zuweisung — einmalig, fertig |
> Offene Deklarationen ermoeglichen Plugin-Systeme und Bibliotheks-Erweiterungen |
> Geschlossene Zuweisungen bieten mehr Vorhersagbarkeit

**Kernkonzept zum Merken:** Interface Merging ist kein Bug, sondern
ein bewusstes Design — es ermoeglicht das Erweitern von Typen ohne
den Originalcode zu aendern. Das ist die Grundlage fuer Module Augmentation.

---

> **Pausenpunkt** -- Du verstehst Interface Merging. Naechstes Thema:
> Wie man Typen aus fremden Modulen erweitert.
>
> Weiter geht es mit: [Sektion 02: Module Augmentation](./02-module-augmentation.md)
