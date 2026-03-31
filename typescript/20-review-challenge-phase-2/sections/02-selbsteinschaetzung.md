# Selbsteinschaetzung: 20 Fragen

> Beantworte jede Frage ehrlich mit: Sicher / Unsicher / Keine Ahnung
>
> Bei "Unsicher" oder "Keine Ahnung" → die entsprechende Lektion nochmal anschauen.

---

## Type Narrowing (L11-L12)

1. Kann ich typeof, instanceof und den in-Operator fuer Type Narrowing verwenden?
2. Kann ich eigene Type Predicates (is-Funktionen) schreiben?
3. Kann ich Discriminated Unions mit exhaustive Checks implementieren?
4. Verstehe ich den Unterschied zwischen Type Guard und Type Assertion?

## Generics (L13-L14)

5. Kann ich generische Funktionen und Interfaces mit Constraints schreiben?
6. Kann ich das Builder Pattern mit Generic Type Growth implementieren?
7. Kann ich pipe() mit Overloads typsicher machen?
8. Verstehe ich den Unterschied zwischen Generics und any/unknown?

## Utility Types (L15)

9. Kann ich Partial, Required, Readonly, Pick, Omit, Record korrekt einsetzen?
10. Kann ich eigene Utility Types wie DeepPartial oder PartialBy bauen?
11. Verstehe ich wie Utility Types intern mit Mapped Types funktionieren?

## Mapped Types (L16)

12. Kann ich die Syntax `{ [K in keyof T]: ... }` lesen und schreiben?
13. Kann ich Key Remapping mit der as-Clause verwenden?
14. Kann ich Modifier (+/-, readonly, ?) gezielt einsetzen und entfernen?

## Conditional Types (L17)

15. Kann ich `T extends U ? X : Y` und verschachtelte Conditionals schreiben?
16. Kann ich infer verwenden um Typen aus Patterns zu extrahieren?
17. Verstehe ich distributive Conditional Types und kann Distribution kontrollieren?

## Template Literal Types (L18)

18. Kann ich Template Literal Types fuer String-Patterns und Event-Namen verwenden?
19. Kann ich String-Parsing mit infer in Template Literals machen?

## Modules & Declarations (L19)

20. Kann ich Declaration Files schreiben und Module augmentieren?

---

## Auswertung

| Ergebnis | Empfehlung |
|----------|-----------|
| 18-20 "Sicher" | Bereit fuer Phase 3! |
| 14-17 "Sicher" | Gezielt die unsicheren Themen wiederholen |
| 10-13 "Sicher" | Phase 2 gruendlich wiederholen, besonders L16-L18 |
| Unter 10 "Sicher" | Nochmal bei L11 starten und systematisch durcharbeiten |
