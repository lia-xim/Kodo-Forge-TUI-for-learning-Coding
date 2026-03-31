# Lektion 17: Conditional Types

> **Voraussetzung:** Lektion 16 (Mapped Types) abgeschlossen.
> **Ziel:** Conditional Types, das infer-Keyword und distributive Typen meistern — die maechtigsten Werkzeuge im TypeScript-Typsystem.
> **Kernfrage dieser Lektion:** Wie treffe ich Typ-Entscheidungen zur Compile-Zeit basierend auf der Struktur anderer Typen?
> **Gesamtdauer:** ~50 Minuten (5 Sektionen a ~10 Minuten)

---

## Lernpfad

### Sektionen

| # | Sektion | Dauer | Was du lernst |
|---|---|---|---|
| 01 | [Extends-Bedingung](./sections/01-extends-bedingung.md) | ~10 Min | T extends U ? X : Y Syntax, verschachtelte Conditionals |
| 02 | [Infer-Keyword](./sections/02-infer-keyword.md) | ~10 Min | Typ-Extraktion mit infer, Return Types, Promise-Unwrapping |
| 03 | [Distributive Types](./sections/03-distributive-types.md) | ~10 Min | Verteilung ueber Unions, Kontrolle mit [T] |
| 04 | [Rekursive Conditional](./sections/04-rekursive-conditional.md) | ~10 Min | Rekursive Typen, Flatten, DeepAwaited |
| 05 | [Praxis-Patterns](./sections/05-praxis-patterns.md) | ~10 Min | UnpackPromise, DeepPartial, Praxis-Szenarien |

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
```

---

## Die 10 wichtigsten Erkenntnisse (Spoiler!)

<details>
<summary>Zusammenfassung aufklappen</summary>

1. **Conditional Types sind Ternaries fuer Typen**: `T extends U ? X : Y` — waehlt X oder Y basierend auf extends.

2. **infer extrahiert Teile eines Typs**: `T extends Promise<infer U> ? U : T` — holt den inneren Typ eines Promise.

3. **Distributive Conditional Types verteilen ueber Unions**: `T extends X ? Y : Z` wird fuer jedes Union-Member einzeln ausgewertet.

4. **[T] verhindert Distribution**: `[T] extends [X] ? Y : Z` — wertet den gesamten Union als Ganzes aus.

5. **infer kann an beliebiger Position stehen**: Parameter, Return Type, Array-Element, Object-Property — ueberall wo ein Typ steht.

6. **Rekursive Conditional Types loesen verschachtelte Strukturen auf**: `Flatten<T>` entpackt Arrays beliebiger Tiefe.

7. **never ist der leere Union**: Distribution ueber never ergibt immer never — eine wichtige Sonderregel.

8. **Mehrere infer in einem Pattern**: `T extends (a: infer A, b: infer B) => infer R` extrahiert alle Teile einer Funktion.

9. **TypeScript hat eingebaute Conditional Types**: ReturnType, Parameters, Awaited — alle nutzen infer intern.

10. **Conditional Types sind die Grundlage fuer Type-Level-Programmierung**: Zusammen mit Mapped Types kannst du beliebig komplexe Typ-Transformationen bauen.

</details>

---

> **Starte hier:** [Sektion 01 - Extends-Bedingung](./sections/01-extends-bedingung.md)
>
> **Naechste Lektion:** 18 — Template Literal Types
