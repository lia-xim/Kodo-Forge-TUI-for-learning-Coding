# Sektion 6: Praxis — Code-Review-Checkliste und Refactoring-Patterns

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [05 - Defensive vs Offensive Typing](./05-defensive-vs-offensive-typing.md)
> Naechste Sektion: [Lektion 40 - Capstone Project](../../40-capstone-project/sections/01-projekt-ueberblick.md)

---

## Was du hier lernst

- Eine **Code-Review-Checkliste** fuer TypeScript die du ab morgen verwenden kannst
- **5 Refactoring-Patterns** die TypeScript-Code sofort verbessern
- Wie man TypeScript-Qualitaet **messbar** macht
- Das Ergebnis von 39 Lektionen: Dein persoenlicher Typ-Stil

---

## Die Code-Review-Checkliste

Drucke diese Liste aus und haenge sie neben deinen Monitor. Bei
jedem Code Review pruefst du diese Punkte:

### Kategorie 1: Typsicherheit

| # | Pruefpunkt | Red Flag | Fix |
|---|-----------|----------|-----|
| 1 | Gibt es `any`? | Jedes `any` ohne Kommentar | `unknown` + Type Guard |
| 2 | Gibt es `as`? | `as` bei externen Daten | Runtime-Validierung |
| 3 | Gibt es `!`? | Non-null Assertion bei optionalem Wert | Optional Chaining `?.` |
| 4 | Sind switch-Statements exhaustive? | Fehlender `default: never` | Exhaustive Check hinzufuegen |
| 5 | Haben oeffentliche Funktionen Return Types? | Kein expliziter Return Type | Hinzufuegen |

### Kategorie 2: Architektur

| # | Pruefpunkt | Red Flag | Fix |
|---|-----------|----------|-----|
| 6 | Sind Systemgrenzen validiert? | `JSON.parse()` ohne Validierung | Zod/Type Guard |
| 7 | Sind IDs typsicher? | `userId: string` statt Branded Type | Branded Type einfuehren |
| 8 | Ist State eine Discriminated Union? | Boolean-Flags (`isLoading && isError`) | DU refactoren |
| 9 | Sind Fehler im Typ sichtbar? | `throws` in JSDoc statt Return-Typ | Result-Pattern |
| 10 | Sind Generics gerechtfertigt? | Generic mit nur einer Verwendung | `unknown` oder konkreter Typ |

### Kategorie 3: Wartbarkeit

| # | Pruefpunkt | Red Flag | Fix |
|---|-----------|----------|-----|
| 11 | Ist der Typ in 30s verstaendlich? | Verschachtelte Conditional Types | Vereinfachen |
| 12 | Gibt es Typ-Duplikation? | Gleicher Typ in mehreren Dateien | Shared Types extrahieren |
| 13 | Ist `strict: true` aktiv? | `strict: false` oder fehlend | Aktivieren |
| 14 | Sind Barrel-Exports bewusst? | `index.ts` mit 50+ Re-Exports | Direkte Imports |
| 15 | Gibt es `@ts-ignore`? | Jedes `@ts-ignore` ohne Begruendung | Typ-Fehler fixen |

> 📖 **Hintergrund: Warum Checklisten funktionieren**
>
> Atul Gawande beschrieb in "The Checklist Manifesto" (2009) wie
> Checklisten in der Chirurgie die Sterblichkeitsrate um 47% senkten.
> Das Prinzip gilt auch fuer Code: Nicht weil Entwickler die Regeln
> nicht kennen, sondern weil sie unter Zeitdruck vergessen sie
> anzuwenden. Eine Checkliste macht das Vergessen unmoeglich.
> Microsoft's TypeScript-Team nutzt intern eine aehnliche Liste
> fuer PRs in das TypeScript-Repository selbst.

---

## 5 Refactoring-Patterns

### Pattern 1: Boolean-Flags → Discriminated Union

```typescript annotated
// VORHER:
interface State {
  isLoading: boolean;
  isError: boolean;
  data: User[] | null;
  error: string | null;
}
// ^ 2^2 = 4 Kombinationen, davon 2 ungueltig

// NACHHER:
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: User[] }
  | { status: "error"; error: string };
// ^ Genau 4 gueltige Zustaende, kein ungueltiger moeglich
```

### Pattern 2: String-IDs → Branded Types

```typescript annotated
// VORHER:
function transfer(from: string, to: string, amount: number) {}
transfer(orderId, userId, price);  // OOPS! Argumente vertauscht

// NACHHER:
type AccountId = string & { __brand: "AccountId" };
type Amount = number & { __brand: "Amount" };
function transfer(from: AccountId, to: AccountId, amount: Amount) {}
// transfer(orderId, userId, price);  // COMPILE-ERROR!
```

### Pattern 3: Optional Chaining statt Non-null Assertion

```typescript annotated
// VORHER:
const name = user!.profile!.name!;
// ^ Drei Stellen die null sein koennten → Runtime-Crash

// NACHHER:
const name = user?.profile?.name ?? "Unbekannt";
// ^ Sicher: Falls null → Fallback
```

### Pattern 4: Overloads statt Union Return

```typescript annotated
// VORHER:
function parse(input: string): string | number {
  const num = Number(input);
  return isNaN(num) ? input : num;
}
const result = parse("42");  // string | number — unpraezise!

// NACHHER:
function parse(input: `${number}`): number;
function parse(input: string): string;
function parse(input: string): string | number {
  const num = Number(input);
  return isNaN(num) ? input : num;
}
const result = parse("42");  // number — praezise!
```

### Pattern 5: Index Signature → Record/Map

```typescript annotated
// VORHER:
interface Config {
  [key: string]: string;  // Alles erlaubt, nichts geprueft
}
config.tyypo;  // Kein Fehler — Tippfehler unbemerkt!

// NACHHER (wenn Keys bekannt):
interface Config {
  host: string;
  port: string;
  env: string;
}
// config.tyypo;  // FEHLER: Property 'tyypo' does not exist

// NACHHER (wenn Keys dynamisch):
const config = new Map<string, string>();
config.get("tyypo");  // Gibt string | undefined zurueck — sicherer
```

> 🧠 **Erklaere dir selbst:** Welches dieser 5 Patterns haette den
> groessten Impact in deinem aktuellen Projekt? Welches koenntest
> du morgen umsetzen?
> **Kernpunkte:** Boolean → DU hat den hoechsten Impact (verhindert
> unmoegliche Zustaende) | String → Branded ist am einfachsten
> umzusetzen | Beide zusammen decken 80% der Verbesserungen ab

---

## TypeScript-Qualitaet messen

> ⚡ **Framework-Bezug:** In Angular-Projekten mit Nx gibt es den
> `nx lint`-Befehl der @typescript-eslint Regeln prueft. In React-
> Projekten mit Next.js prueft `next lint` aehnliche Regeln. Fuer
> beide gilt: Die ESLint-Konfiguration IST deine Code-Review-
> Checkliste — automatisiert. Aktiviere mindestens:
> `@typescript-eslint/no-explicit-any`, `no-floating-promises`,
> `strict-boolean-expressions`.

```
Metriken fuer TypeScript-Qualitaet:
│
├── "any"-Dichte: Anzahl 'any' pro 1000 Zeilen
│     Ziel: < 1 pro 1000 Zeilen (in neuem Code: 0)
│
├── "as"-Dichte: Anzahl Type Assertions pro 1000 Zeilen
│     Ziel: < 5 pro 1000 Zeilen (die meisten in Tests)
│
├── Strict-Mode: Alle strict-Flags aktiviert?
│     Ziel: strict: true + noUncheckedIndexedAccess
│
├── Exhaustive Checks: % der switch-Statements mit never-Check
│     Ziel: 100% bei Discriminated Unions
│
└── Return Types: % der exportierten Funktionen mit explizitem Typ
      Ziel: 100% (Regel: @typescript-eslint/explicit-module-boundary-types)
```

> 💭 **Denkfrage:** Ist es realistisch, 0 `any` in einem grossen
> Projekt zu haben? Was waere ein pragmatischer Weg dorthin?
>
> **Antwort:** 0 `any` in NEUEM Code ist realistisch und sollte
> die Regel sein. In Legacy-Code: Schrittweise Migration. Setze
> `@typescript-eslint/no-explicit-any: "warn"` fuer Bestand und
> `"error"` fuer neue Dateien. Nutze `// eslint-disable-next-line`
> nur mit Begruendung. Ueber Monate sinkt die any-Dichte auf null.

---

## Experiment: Review deines eigenen Codes

Wende die Checkliste auf dein letztes Feature an:

```typescript
// Schritt 1: Oeffne deinen letzten Pull Request
// Schritt 2: Gehe die 15 Pruefpunkte durch
// Schritt 3: Notiere fuer jeden Red Flag:
//   - Was ist das Problem?
//   - Was waere der Fix?
//   - Wie lange wuerde der Fix dauern?
// Schritt 4: Setze die 3 schnellsten Fixes um

// Erfahrungswert: Die meisten Fixes dauern unter 5 Minuten.
// Die groessten Verbesserungen kommen von:
// 1. any → unknown (2 Min pro Stelle)
// 2. Boolean-Flags → Discriminated Union (15 Min)
// 3. Fehlende Exhaustive Checks (1 Min pro switch)
```

---

## Was du gelernt hast

- Eine **15-Punkte-Checkliste** fuer TypeScript Code Reviews
- **5 Refactoring-Patterns**: Boolean→DU, String→Brand, !→?., Overloads, Index→Record
- **Metriken** fuer TypeScript-Qualitaet: any-Dichte, as-Dichte, Strict-Mode, Exhaustive Checks
- Die meisten Verbesserungen sind **kleine Aenderungen** mit grossem Impact
- Automatisierung ueber **ESLint-Regeln** macht die Checkliste dauerhaft

> 🧠 **Erklaere dir selbst:** Wenn du nur EINEN Rat fuer einen
> Kollegen haettest der TypeScript lernt — was waere er? Was ist
> die einzelne wichtigste Best Practice?
> **Kernpunkte:** "Vertraue dem Compiler — wenn er meckert, hat
> er meistens recht. Nutze `as` und `any` nicht um ihn zum
> Schweigen zu bringen." | Das ist die Zusammenfassung der
> gesamten Lektion in einem Satz

**Kernkonzept der gesamten Lektion:** Best Practices sind keine starren Regeln — sie sind ein Entscheidungsrahmen. Die Checkliste, die Entscheidungsbaeume und die Refactoring-Patterns geben dir Werkzeuge um in jeder Situation die richtige Entscheidung zu treffen.

---

> **Pausenpunkt** — Du hast Best Practices und Anti-Patterns
> gemeistert. Die letzte Lektion bringt alles zusammen: Das
> Capstone Project.
>
> Weiter geht es mit: [Lektion 40: Capstone Project](../../40-capstone-project/sections/01-projekt-ueberblick.md)
