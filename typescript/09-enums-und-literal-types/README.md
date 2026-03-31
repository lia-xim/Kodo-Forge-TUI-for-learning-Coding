# Lektion 09: Enums & Literal Types

> **Voraussetzung:** Lektion 06 (Functions) abgeschlossen, Union Types bekannt.
> **Ziel:** Literal Types, Enums und deren Alternativen sicher beherrschen — und die richtige Wahl fuer jede Situation treffen.
> **Kernfrage dieser Lektion:** Wann brauche ich ein Enum, wann reicht ein Union Literal Type, und wann ist `as const` die beste Wahl?
> **Gesamtdauer:** ~60 Minuten (6 Sektionen a ~10 Minuten)

---

## Lernpfad

Diese Lektion ist in **sechs Sektionen** aufgeteilt. Jede Sektion dauert
ca. 10 Minuten und hat einen klaren Pausenpunkt am Ende. Du kannst nach
jeder Sektion stoppen und spaeter weitermachen.

### Sektionen

| # | Sektion | Dauer | Was du lernst |
|---|---|---|---|
| 01 | [Literal Types](./sections/01-literal-types.md) | ~10 Min | String/Number/Boolean Literals, const Assertions, as const |
| 02 | [Numerische Enums](./sections/02-numerische-enums.md) | ~10 Min | Grundlagen, Reverse Mapping, Auto-Increment, Fallstricke |
| 03 | [String Enums](./sections/03-string-enums.md) | ~10 Min | String Enums, kein Reverse Mapping, Vorteile |
| 04 | [Enums vs Union Literals](./sections/04-enums-vs-union-literals.md) | ~10 Min | Grosser Vergleich, as const Objects, Entscheidungshilfe |
| 05 | [Template Literal Types](./sections/05-template-literal-types.md) | ~10 Min | String-Manipulation auf Type-Level, Uppercase\<T\>, Autocomplete |
| 06 | [Patterns und Alternativen](./sections/06-patterns-und-alternativen.md) | ~10 Min | const enum, isolatedModules, as const Pattern, Branding |

---

## Empfohlener Lernweg

```
Sektionen 01-06 lesen (je ~10 Min, Pausen dazwischen moeglich)
        |
        v
Examples in examples/ durcharbeiten und experimentieren
        |
        v
Exercises in exercises/ loesen (TODO-Aufgaben)
        |
        v
Quiz mit "npx tsx quiz.ts" testen
        |
        v
Loesungen in solutions/ vergleichen
        |
        v
Cheatsheet (cheatsheet.md) als Schnellreferenz behalten
```

---

## Dateistruktur

```
09-enums-und-literal-types/
├── README.md                 <-- Du bist hier (Uebersicht + Navigation)
├── sections/
│   ├── 01-literal-types.md
│   ├── 02-numerische-enums.md
│   ├── 03-string-enums.md
│   ├── 04-enums-vs-union-literals.md
│   ├── 05-template-literal-types.md
│   └── 06-patterns-und-alternativen.md
├── examples/                 <-- Ausfuehrbare Beispiele (npx tsx examples/01-...)
│   ├── 01-literal-types.ts
│   ├── 02-numerische-enums.ts
│   ├── 03-string-enums.ts
│   ├── 04-as-const-objects.ts
│   └── 05-template-literal-types.ts
├── exercises/                <-- Uebungen mit TODOs
├── solutions/                <-- Loesungen zu den Uebungen
├── quiz.ts                   <-- Wissens-Quiz (npx tsx quiz.ts)
└── cheatsheet.md             <-- Schnellreferenz
```

---

## Die 10 wichtigsten Erkenntnisse (Spoiler!)

Lies das erst NACH den Sektionen — es ist deine Zusammenfassung:

<details>
<summary>Zusammenfassung aufklappen</summary>

1. **Literal Types sind Subtypen**: `"GET"` ist ein Subtyp von `string`.
   TypeScript nutzt den praezisesten Typ bei `const`.

2. **`as const` fixiert alles**: Drei Effekte — readonly, Literal Types,
   Tuple statt Array. Die wichtigste Assertion in TypeScript.

3. **Numerische Enums haben Reverse Mapping**: `Direction[0]` gibt den
   Namen zurueck. Das ist maechtig, aber auch eine Fehlerquelle.

4. **String Enums sind sicherer**: Kein Reverse Mapping, aber dafuer
   lesbare Debug-Ausgaben und kein versehentliches Zuweisen von Zahlen.

5. **Union Literal Types > Enums (meistens)**: Kein Laufzeit-Code,
   Tree-Shakeable, einfacher zu verstehen, volle IDE-Unterstuetzung.

6. **`as const` Objects vereinen das Beste**: Laufzeit-Werte UND
   abgeleitete Typen ohne Enum-Overhead.

7. **Template Literal Types sind String-Algebra**: TypeScript kann
   Strings auf Type-Level manipulieren — maechtiger als jede andere
   typisierte Sprache.

8. **`const enum` ist ein Sonderfall**: Wird komplett inline ersetzt,
   aber BRICHT mit `isolatedModules` (und damit mit den meisten
   modernen Build-Tools).

9. **Branding mit Literal Types**: `type EUR = number & { __brand: "EUR" }`
   verhindert Verwechslungen zwischen semantisch verschiedenen Zahlen.

10. **Die Entscheidung ist kontextabhaengig**: Kein Pattern ist immer
    richtig. Enums fuer stabile APIs, Union Literals fuer lokale Typen,
    `as const` Objects fuer das Beste aus beiden Welten.

</details>

---

> **Starte hier:** [Sektion 01 - Literal Types](./sections/01-literal-types.md)
>
> **Naechste Lektion:** 10 — Generics —
> Wie du Funktionen und Typen schreibst, die mit JEDEM Typ funktionieren.
