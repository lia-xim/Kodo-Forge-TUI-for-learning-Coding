# Phase 2 Rueckblick: Konzeptlandkarte

> Geschaetzte Lesezeit: **10 Minuten**

---

## Die Reise durch Phase 2

Phase 2 hat dein TypeScript-Wissen von den Grundlagen zum fortgeschrittenen
Type System gebracht. Hier ist die Landkarte:

```
Phase 2: Type System Core (L11-L19)
========================================

L11: Type Narrowing
  |  typeof, instanceof, in, Discriminated Unions
  v
L12: Discriminated Unions
  |  Tag-basierte Unions, exhaustive Checks
  v
L13: Generics Basics
  |  <T>, Constraints, Default Types
  v
L14: Generic Patterns
  |  Factories, Collections, HOFs, Builder
  v
L15: Utility Types
  |  Partial, Pick, Omit, Record, eigene Utilities
  v
L16: Mapped Types ←────────────────────┐
  |  { [K in keyof T]: ... }, Modifier  |  Diese drei
  v                                      |  sind das
L17: Conditional Types ←────────────────┤  "Triumvirat"
  |  T extends U ? X : Y, infer         |  des Type
  v                                      |  Systems
L18: Template Literal Types ←───────────┘
  |  String-Manipulation auf Type-Level
  v
L19: Modules & Declarations
     import/export, .d.ts, Augmentation
```

---

## Die drei Saeulen des Type Systems

### 1. Type Narrowing (L11-L12)
**Problem:** TypeScript kennt den exakten Typ nicht.
**Loesung:** Control Flow Analyse verengt den Typ schrittweise.

### 2. Generics (L13-L15)
**Problem:** Code-Duplikation fuer verschiedene Typen.
**Loesung:** Typparameter machen Code generisch und wiederverwendbar.

### 3. Type-Level-Programmierung (L16-L18)
**Problem:** Typen manuell duplizieren und synchron halten.
**Loesung:** Mapped Types, Conditional Types und Template Literals
transformieren Typen automatisch.

---

## Zusammenhaenge erkennen

| Konzept A | + Konzept B | = Ergebnis |
|-----------|-------------|-----------|
| Mapped Types | + Conditional Types | Selektive Property-Transformation |
| Conditional Types | + infer | Typ-Extraktion (ReturnType, etc.) |
| Template Literals | + Mapped Types | Getter/Setter/Event-Generierung |
| Generics | + Utility Types | Typsichere Collections und APIs |
| Discriminated Unions | + exhaustive Check | Lueckenlose Fallbehandlung |

---

## Was du jetzt kannst

- Typen zur Compile-Zeit transformieren statt manuell duplizieren
- Generische, wiederverwendbare Abstraktionen bauen
- Das Typsystem fuer maximale Sicherheit nutzen
- Externe Libraries typisieren und erweitern
