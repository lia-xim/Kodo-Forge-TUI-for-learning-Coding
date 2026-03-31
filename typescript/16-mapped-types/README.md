# Lektion 16: Mapped Types

> **Voraussetzung:** Lektion 15 (Utility Types) abgeschlossen.
> **Ziel:** Mapped Types verstehen, eigene bauen und in realen Szenarien (Formulare, APIs, Konfigurationen) anwenden.
> **Kernfrage dieser Lektion:** Wie transformiere ich systematisch ALLE Properties eines Typs nach einer Regel?
> **Gesamtdauer:** ~50 Minuten (5 Sektionen a ~10 Minuten)

---

## Lernpfad

Diese Lektion ist in **fuenf Sektionen** aufgeteilt. Jede Sektion dauert
ca. 10 Minuten und hat einen klaren Pausenpunkt am Ende. Du kannst nach
jeder Sektion stoppen und spaeter weitermachen.

### Sektionen

| # | Sektion | Dauer | Was du lernst |
|---|---|---|---|
| 01 | [Grundlagen](./sections/01-grundlagen.md) | ~10 Min | Syntax [K in keyof T], readonly/optional Modifier |
| 02 | [Key Remapping](./sections/02-key-remapping.md) | ~10 Min | as-Clause, Template Literal Keys, Key-Filterung |
| 03 | [Eigene Utility Types](./sections/03-eigene-utility-types.md) | ~10 Min | Eigene Mapped Types bauen (Mutable, Nullable, etc.) |
| 04 | [Bedingte Mapped Types](./sections/04-bedingte-mapped-types.md) | ~10 Min | Conditional Types innerhalb Mapped Types |
| 05 | [Praxis-Patterns](./sections/05-praxis-patterns.md) | ~10 Min | Form-Typen, API-Transformationen, Konfigurationen |

---

## Empfohlener Lernweg

```
Sektionen 01-05 lesen (je ~10 Min, Pausen dazwischen moeglich)
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
16-mapped-types/
+-- README.md                 <-- Du bist hier (Uebersicht + Navigation)
+-- sections/
|   +-- 01-grundlagen.md
|   +-- 02-key-remapping.md
|   +-- 03-eigene-utility-types.md
|   +-- 04-bedingte-mapped-types.md
|   +-- 05-praxis-patterns.md
+-- examples/                 <-- Ausfuehrbare Beispiele (npx tsx examples/01-...)
+-- exercises/                <-- Uebungen mit TODOs
+-- solutions/                <-- Loesungen zu den Uebungen
+-- quiz.ts                   <-- Wissens-Quiz (npx tsx quiz.ts)
+-- cheatsheet.md             <-- Schnellreferenz
```

---

## Die 10 wichtigsten Erkenntnisse (Spoiler!)

Lies das erst NACH den Sektionen — es ist deine Zusammenfassung:

<details>
<summary>Zusammenfassung aufklappen</summary>

1. **Mapped Types iterieren ueber Keys**: `{ [K in keyof T]: ... }` wendet eine Transformation auf JEDE Property an.

2. **Modifier (+/-) kontrollieren readonly und optional**: `+readonly` fuegt readonly hinzu, `-?` entfernt optional.

3. **Key Remapping mit `as`**: `[K in keyof T as NewKey]` benennt Keys um oder filtert sie.

4. **Template Literal Keys erzeugen neue Schluessel**: `` [K in keyof T as `get${Capitalize<K>}`] `` generiert Getter-Namen.

5. **Eigene Utility Types sind Mapped Types**: Partial, Required, Readonly — alle sind intern Mapped Types.

6. **Conditional Types in Mapped Types ermoeglichen selektive Transformation**: Nur bestimmte Properties aendern, andere durchreichen.

7. **never im Key Remapping filtert Keys heraus**: `as K extends 'id' ? never : K` entfernt den Key 'id'.

8. **Homomorphe Mapped Types bewahren Modifier**: `{ [K in keyof T]: ... }` uebertraegt readonly und optional vom Original.

9. **Form-Typen sind DER Praxisfall**: FormErrors\<T\>, FormTouched\<T\>, FormDirty\<T\> — alles Mapped Types.

10. **API-Transformationen mit Mapped Types vermeiden Duplikation**: Ein Typ, viele Ableitungen (Create, Update, Response).

</details>

---

> **Starte hier:** [Sektion 01 - Grundlagen](./sections/01-grundlagen.md)
>
> **Naechste Lektion:** 17 — Conditional Types —
> Wie du mit `T extends U ? X : Y` und dem `infer`-Keyword arbeitest.
