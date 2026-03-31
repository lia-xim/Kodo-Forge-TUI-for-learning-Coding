# 02 -- Selbsteinschaetzung: Wie sicher bist du?

> Geschaetzte Lesezeit: ~10 Minuten

## So nutzt du diesen Selbstcheck

Gehe die 20 Fragen langsam durch. Fuer jede Frage: **Kannst du die Antwort geben, OHNE
nachzuschauen?** Sei ehrlich zu dir selbst -- niemand bewertet dich. Fragen, bei denen du
unsicher bist, zeigen dir genau, welche Lektion du nochmal anschauen solltest.

Bewertungsskala pro Frage:
- **Sicher** -- Du koenntest es jemandem erklaeren
- **Ungefaehr** -- Du weisst die Richtung, aber Details fehlen
- **Unsicher** -- Du muestest nachschauen

---

## Die 20 Fragen

### Basics (L01-L03)

**Frage 1** -- Was macht `strict: true` in der tsconfig.json, und warum solltest du es
IMMER aktivieren?
> Lektion: L01 -- Setup

**Frage 2** -- Was ist der Unterschied zwischen `any` und `unknown`? Wann ist `unknown`
die richtige Wahl?
> Lektion: L02 -- Primitive Types

**Frage 3** -- Wann solltest du eine explizite Type Annotation schreiben, und wann reicht
Type Inference? Nenne je zwei Situationen.
> Lektion: L03 -- Annotations & Inference

**Frage 4** -- Was ist der Unterschied zwischen `null` und `undefined` in TypeScript mit
`strictNullChecks`?
> Lektion: L02 -- Primitive Types

---

### Datenstrukturen (L04-L05)

**Frage 5** -- Was ist der Unterschied zwischen `number[]` und `[number, number]`?
> Lektion: L04 -- Arrays & Tuples

**Frage 6** -- Was passiert, wenn du ein `readonly`-Array an eine Funktion uebergibst,
die `number[]` erwartet? Warum?
> Lektion: L04 -- Arrays & Tuples

**Frage 7** -- Erklaere Structural Typing in einem Satz. Warum kann ein Objekt mit MEHR
Properties an einen Typ mit WENIGER Properties zugewiesen werden?
> Lektion: L05 -- Objects & Interfaces

**Frage 8** -- Wann greift der Excess Property Check -- und wann NICHT?
> Lektion: L05 -- Objects & Interfaces

**Frage 9** -- Was ist eine Index Signature und wann brauchst du sie?
> Lektion: L05 -- Objects & Interfaces

---

### Funktionen (L06)

**Frage 10** -- Schreibe eine Funktion mit optionalem Parameter, Default-Wert und
Rest-Parameter -- im Kopf, ohne IDE.
> Lektion: L06 -- Functions

**Frage 11** -- Was ist ein Function Overload? Wann ist es besser als eine Union im
Return Type?
> Lektion: L06 -- Functions

**Frage 12** -- Was ist der Unterschied zwischen `void` und `never` als Return Type?
> Lektion: L06 -- Functions

---

### Typen kombinieren (L07-L08)

**Frage 13** -- Was ist der Unterschied zwischen `A | B` und `A & B`? Erklaere mit
einem konkreten Beispiel.
> Lektion: L07 -- Union & Intersection

**Frage 14** -- Was ist eine Discriminated Union? Welche drei Zutaten braucht sie?
> Lektion: L07 -- Union & Intersection

**Frage 15** -- Nenne drei Faelle, in denen `type` besser passt als `interface`, und
drei Faelle fuer das Gegenteil.
> Lektion: L08 -- Type Aliases vs Interfaces

**Frage 16** -- Was ist Declaration Merging und warum ist es relevant fuer Library-Autoren?
> Lektion: L08 -- Type Aliases vs Interfaces

---

### Enums & Literal Types (L09)

**Frage 17** -- Warum empfehlen viele Teams `as const` statt `enum`? Nenne mindestens
zwei Gruende.
> Lektion: L09 -- Enums & Literal Types

**Frage 18** -- Was macht `as const` genau? Was aendert sich am Typ eines Objekts oder
Arrays?
> Lektion: L09 -- Enums & Literal Types

**Frage 19** -- Schreibe einen exhaustive Check mit `never` -- im Kopf. Was passiert,
wenn du einen Case vergisst?
> Lektion: L09 -- Enums & Literal Types

---

### Integration

**Frage 20** -- Du bekommst eine REST-API die User-Daten liefert. Beschreibe, welche
TypeScript-Konzepte du nutzen wuerdest, um die Response typsicher zu verarbeiten
(Typdefinition, Validierung, Fehlerbehandlung, Zustandsmodellierung).
> Lektion: ALLE -- Wenn du diese Frage flüssig beantworten kannst, bist du bereit
> fuer Phase 2.

---

## Auswertung

Zaehle deine Antworten:

| Ergebnis | Bedeutung |
|----------|-----------|
| 18-20 "Sicher" | Du bist bereit fuer Phase 2 |
| 14-17 "Sicher" | Solide Basis, schau dir die unsicheren Lektionen nochmal an |
| 10-13 "Sicher" | Wiederhole die entsprechenden Lektionen bevor du weitergehst |
| Unter 10 | Nimm dir Zeit, Phase 1 nochmal durchzuarbeiten -- es lohnt sich! |

> **Wichtig:** Es ist voellig okay, wenn du nicht alles "Sicher" beantworten kannst.
> Dieses Review ist genau dafuer da, Luecken aufzudecken. Besser jetzt als mitten in
> Phase 2, wenn Generics auf einem wackeligen Fundament stehen.

---

## Empfohlener Aktionsplan

Fuer jede "Unsicher"-Frage:

1. Gehe zurueck zur entsprechenden Lektion
2. Lies die relevante Sektion nochmal durch
3. Mache das Quiz der Lektion erneut
4. Probiere ein Exercise aus der Lektion
5. Komm dann zurueck zu den Challenges dieser Lektion
