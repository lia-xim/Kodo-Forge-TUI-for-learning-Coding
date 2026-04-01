# L24 — Branded/Nominal Types

> TypeScript Phase 3 | Lektion 24 von 40

## Überblick

Diese Lektion löst ein fundamentales Problem des TypeScript-Typsystems: `type UserId = string` bietet keine echte Typsicherheit. Du lernst die **Brand-Technik** — den Standard-Workaround für Nominal Typing in TypeScript.

## Lernziele

Nach dieser Lektion kannst du:
- Erklären warum Structural Typing Typ-Verwechslungen erlaubt
- Brand-Typen mit `T & { readonly __brand: B }` definieren
- Smart Constructors mit Validierung + Typ-Vergabe schreiben
- Brand-Hierarchien für Subtyp-Beziehungen aufbauen
- Brands sinnvoll in Angular-Services und React-Projekten einsetzen

## Sektionen

| # | Thema | Dateipfad |
|---|-------|-----------|
| 1 | Das Nominal-Typing-Problem | `sections/01-das-nominal-typing-problem.md` |
| 2 | Die Brand-Technik | `sections/02-die-brand-technik.md` |
| 3 | Smart Constructors & Opaque Types | `sections/03-smart-constructors-opaque-types.md` |
| 4 | Mehrere Brands & Hierarchien | `sections/04-mehrere-brands-hierarchien.md` |
| 5 | Praktische Patterns | `sections/05-praktische-patterns.md` |
| 6 | Branded Types in Angular & React | `sections/06-branded-types-praxis.md` |

## Dateien

| Typ | Datei |
|-----|-------|
| Übersicht | README.md |
| Beispiele | `examples/01-05-*.ts` |
| Übungen | `exercises/01-05-*.ts` |
| Lösungen | `solutions/01-05-*.ts` |
| Quiz | `quiz-data.ts` (15 Fragen) |
| Pre-Test | `pretest-data.ts` (18 Fragen) |
| Misconceptions | `misconceptions.ts` (8 Fehlkonzepte) |
| Completion Problems | `completion-problems.ts` (6 Lückentext) |
| Debugging | `debugging-data.ts` (5 Challenges) |
| Parson's Problems | `parsons-data.ts` (3 Aufgaben) |
| Code-Tracing | `tracing-data.ts` (4 Exercises) |
| Transfer-Tasks | `transfer-data.ts` (3 Tasks) |
| Hints | `hints.json` |
| Cheatsheet | `cheatsheet.md` |

## Voraussetzungen

- L13 (Generics Basics) — Brand<T, B> verwendet Generics
- L15 (Utility Types) — Kontext für strukturelle Typ-Unterschiede
- L16 (Mapped Types) — optional, für tieferes Verständnis

## Kernkonzept

```typescript
// Problem:
type UserId = string;   // Kein Schutz — identisch mit string!

// Lösung: Brand-Typ
type Brand<T, B extends string> = T & { readonly __brand: B };
type UserId  = Brand<string, 'UserId'>;
type OrderId = Brand<string, 'OrderId'>;

// Smart Constructor:
function createUserId(raw: string): UserId {
  if (!raw || raw.length < 5) throw new Error('Ungültig');
  return raw as UserId;  // Einziger erlaubter as-Cast!
}

// Typsicherheit:
function getUser(id: UserId): void {}
const userId  = createUserId('user-123');
const orderId = 'order-456' as OrderId;
getUser(userId);  // ✅
// getUser(orderId); // ❌ COMPILE-ERROR!
```
