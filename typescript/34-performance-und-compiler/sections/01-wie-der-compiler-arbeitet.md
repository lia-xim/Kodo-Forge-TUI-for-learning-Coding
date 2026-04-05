# Sektion 1: Wie der Compiler arbeitet

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: -- (Start)
> Naechste Sektion: [02 - Type Instantiation und Depth Limits](./02-type-instantiation-und-depth-limits.md)

---

## Was du hier lernst

- Welche **Phasen** der TypeScript-Compiler durchlaeuft (Scanner, Parser, Binder, Checker, Emitter)
- Wie der **Abstract Syntax Tree (AST)** entsteht und warum er zentral ist
- Warum der **Type Checker** die mit Abstand teuerste Phase ist
- Wie du dieses Wissen nutzt um **Performance-Probleme gezielt einzugrenzen**

---

## Hintergrund: Warum den Compiler verstehen?

> **Origin Story: tsc — Vom Einmannprojekt zum Industrie-Compiler**
>
> Als Anders Hejlsberg 2012 TypeScript vorstellte, war `tsc` ein relativ
> einfacher Transpiler. Heute ist der TypeScript-Compiler eines der
> komplexesten Open-Source-Projekte ueberhaupt: ueber 100.000 Zeilen
> handoptimiertes TypeScript (ja, der Compiler ist in TypeScript geschrieben).
> Das Type-Checking allein macht ueber 60% der gesamten Compile-Zeit aus.
>
> Warum ist das relevant fuer dich? Weil in grossen Projekten — Angular-
> Monorepos mit 500+ Dateien, React-Apps mit komplexen generischen Typen —
> die Compile-Zeit von Sekunden auf Minuten wachsen kann. Und wenn du
> verstehst, WO die Zeit verbraucht wird, kannst du gezielt optimieren.

Die meisten Entwickler behandeln `tsc` als Black Box: Code rein, JavaScript
raus. Aber sobald die Compile-Zeit in einem Projekt ueber 30 Sekunden steigt,
wird der Compiler zum Engpass — im CI, im Watch-Mode, und bei jeder IDE-
Aktion. Dann lohnt es sich, die Black Box zu oeffnen.

---

## Die 5 Phasen des Compilers

Der TypeScript-Compiler durchlaeuft fuenf Phasen in fester Reihenfolge.
Jede Phase nimmt den Output der vorherigen als Input:

```
  Quellcode (.ts)
       │
       ▼
  ┌─────────────┐
  │  1. Scanner  │  Quelltext → Token-Stream
  │  (Lexer)     │  "const x: number = 42"  →  [const, x, :, number, =, 42]
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  2. Parser   │  Token-Stream → AST (Abstract Syntax Tree)
  │              │  Baumstruktur des Programms
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  3. Binder   │  AST → Symboltabelle
  │              │  Verbindet Bezeichner mit Deklarationen
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  4. Checker  │  AST + Symboltabelle → Typ-Information + Fehler
  │  (60-80%!)   │  <<<< DAS ist der teure Teil
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  5. Emitter  │  AST → JavaScript + .d.ts + Source Maps
  │              │
  └─────────────┘
```

> 🧠 **Erklaere dir selbst:** Warum ist der Checker die teuerste Phase? Was macht er, das die anderen Phasen nicht tun?
> **Kernpunkte:** Checker muss ALLE Typen berechnen | Generics instantiieren | Zuweisbarkeit pruefen | Conditional Types aufloesen | Overload-Resolution | Jede Expression hat einen Typ

---

## Phase 1-2: Scanner und Parser

Der **Scanner** (auch Lexer) zerlegt den Quelltext in Tokens. Das ist
blitzschnell — im Wesentlichen ein Zeichen-fuer-Zeichen-Durchlauf:

```typescript annotated
const greeting: string = "Hallo";
// Token 1: const       (Keyword)
// Token 2: greeting    (Identifier)
// ^ Der Scanner erkennt Schluesselwoerter, Bezeichner, Operatoren, Literale
// Token 3: :           (ColonToken)
// Token 4: string      (Keyword)
// Token 5: =           (EqualsToken)
// Token 6: "Hallo"     (StringLiteral)
// Token 7: ;           (SemicolonToken)
```

Der **Parser** baut aus den Tokens einen **Abstract Syntax Tree (AST)**.
Der AST repraesentiert die hierarchische Struktur deines Programms:

```typescript annotated
// Fuer: const greeting: string = "Hallo";
// Entsteht dieser AST-Knoten:
//
// VariableStatement
//   └── VariableDeclarationList (const)
//         └── VariableDeclaration
//               ├── Identifier: "greeting"
//               ├── TypeAnnotation: StringKeyword
//               └── Initializer: StringLiteral "Hallo"
//
// ^ Jeder Knoten hat: kind, pos, end, parent, children
// ^ Der AST ist die zentrale Datenstruktur fuer ALLE weiteren Phasen
```

> 💭 **Denkfrage:** Wenn der Parser einen Syntaxfehler findet (z.B. `const = 42;`),
> kann der Compiler trotzdem weitermachen? Oder bricht er sofort ab?
>
> **Antwort:** TypeScript's Parser ist **fehlertolerant** — er erzeugt auch bei
> Syntaxfehlern einen (teilweisen) AST. Das ist essenziell fuer IDE-Support:
> Waehrend du tippst, ist dein Code staendig "kaputt", aber die IDE soll
> trotzdem Autocomplete und Fehler anzeigen.

---

## Phase 3: Der Binder

Der Binder durchlaeuft den AST und erstellt eine **Symboltabelle**. Er
verbindet jeden Bezeichner (Variable, Funktion, Klasse) mit seiner
Deklaration:

```typescript annotated
function greet(name: string): string {
  // Binder erstellt Symbol "greet" → FunctionDeclaration
  // Binder erstellt Symbol "name" → Parameter
  const msg = `Hallo ${name}`;
  // ^ Binder erstellt Symbol "msg" → VariableDeclaration
  return msg;
  // ^ Binder verbindet "msg" hier mit der Deklaration oben
}

greet("Welt");
// ^ Binder verbindet "greet" hier mit der FunctionDeclaration oben
// Das nennt man "Name Resolution"
```

Der Binder kuemmert sich auch um **Scoping** — er weiss, dass eine Variable
in einem Block nur innerhalb dieses Blocks sichtbar ist. Und er erkennt
**Control Flow**: welche Pfade der Code nehmen kann.

---

## Phase 4: Der Type Checker — das Herzstück

Der Checker ist mit Abstand die komplexeste und teuerste Phase. Die Datei
`checker.ts` im TypeScript-Quellcode hat ueber **50.000 Zeilen** — sie ist
die groesste einzelne Datei des gesamten Projekts.

Was macht der Checker?

1. **Typ-Berechnung:** Fuer jede Expression den Typ ermitteln
2. **Zuweisbarkeits-Pruefung:** Ist `T` an `U` zuweisbar?
3. **Generic-Instantiierung:** `Array<string>` aus `Array<T>` ableiten
4. **Overload-Resolution:** Welche Signatur passt am besten?
5. **Control-Flow-Narrowing:** Nach `if (typeof x === "string")` ist `x` ein `string`

```typescript annotated
function processData<T extends { id: string }>(items: T[]): Map<string, T> {
  // Checker prueft: Hat T eine id-Property vom Typ string? (Constraint)
  const map = new Map<string, T>();
  // ^ Checker instantiiert Map<string, T> — ein neuer Typ entsteht
  for (const item of items) {
    // ^ Checker inferiert: item ist T (aus items: T[])
    map.set(item.id, item);
    // ^ Checker prueft: item.id existiert (weil T extends { id: string })
    // ^ Checker prueft: map.set(string, T) passt zur Map-Signatur
  }
  return map;
  // ^ Checker prueft: Map<string, T> ist zuweisbar an Map<string, T>
}
```

> ⚡ **Framework-Bezug (Angular):** In deinem Angular-Projekt passiert beim
> Compile besonders viel im Checker. Angulars Template-Compiler (`ngc`)
> generiert TypeScript-Code aus Templates, der dann vom Checker geprueft wird.
> Wenn du `strictTemplates: true` nutzt (empfohlen!), prueft der Checker jeden
> Property-Binding und Event-Handler in deinen Templates — das ist maechtig,
> aber auch teuer. Ein Angular-Monorepo mit 200 Komponenten kann allein durch
> Template-Checking 30+ Sekunden Compile-Zeit verursachen.

---

## Phase 5: Der Emitter

Der Emitter ist die "einfachste" Phase — er traversiert den AST und
erzeugt drei Arten von Output:

1. **JavaScript-Dateien** (.js) — der eigentliche Output
2. **Declaration-Dateien** (.d.ts) — Typ-Informationen fuer Konsumenten
3. **Source Maps** (.js.map) — fuer Debugging

Der Emitter **entfernt alle Typ-Annotationen** (Type Erasure) und
transformiert TypeScript-spezifische Syntax in JavaScript:

```typescript annotated
// Input: TypeScript
const add = (a: number, b: number): number => a + b;
// ^ Typ-Annotationen sind TypeScript-spezifisch

// Output: JavaScript (vom Emitter erzeugt)
// const add = (a, b) => a + b;
// ^ Alle Typ-Annotationen sind weg — nur reines JavaScript bleibt

// Output: Declaration (.d.ts, vom Emitter erzeugt)
// declare const add: (a: number, b: number) => number;
// ^ Typ-Information bleibt hier erhalten — fuer Library-Konsumenten
```

> 🧪 **Experiment:** Oeffne ein Terminal und fuehre folgendes aus:
>
> ```bash
> echo 'const x: number = 42; type Foo = { a: string };' > /tmp/test.ts
> npx tsc /tmp/test.ts --declaration --outDir /tmp/out
> cat /tmp/out/test.js    # Nur: const x = 42;
> cat /tmp/out/test.d.ts  # declare const x: number; type Foo = { a: string };
> ```
>
> Beobachte: Im .js ist der Typ weg, im .d.ts ist er erhalten. Der Emitter
> erzeugt zwei verschiedene Sichten auf denselben Code.

---

## Warum ist das wichtig fuer Performance?

Jetzt verstehst du, wo die Zeit draufgeht:

| Phase | Anteil an Compile-Zeit | Optimierbar? |
|-------|:---------------------:|:------------:|
| Scanner | ~2% | Kaum (schon optimal) |
| Parser | ~5% | Kaum (schon optimal) |
| Binder | ~5% | Kaum |
| **Checker** | **60-80%** | **JA — hier liegt das Gold** |
| Emitter | ~10% | Etwas (skipLibCheck, isolatedModules) |

Die Konsequenz: **Wenn du die Compile-Zeit halbieren willst, musst du
beim Checker ansetzen.** Und der Checker wird langsam durch:

- Tief verschachtelte Generics (jede Instantiierung kostet)
- Komplexe Conditional Types (jeder Zweig wird evaluiert)
- Grosse Union-Types (Zuweisbarkeits-Checks sind O(n*m))
- Unnecessary Re-Checks (fehlende Projekt-Referenzen)

In den naechsten Sektionen lernst du, wie du genau diese Probleme
erkennst und loest.

> 🧠 **Erklaere dir selbst:** Wenn der Checker 70% der Zeit verbraucht und du ihn um 30% schneller machst, wie viel schneller wird die gesamte Compilation? (Tipp: Amdahls Gesetz)
> **Kernpunkte:** 0.3 + 0.7 * 0.7 = 0.79 | Also ~21% schneller | Die anderen Phasen begrenzen den Gewinn | Trotzdem der groesste Hebel

---

## Was du gelernt hast

- Der TypeScript-Compiler hat **5 Phasen**: Scanner, Parser, Binder, Checker, Emitter
- Der **AST** (Abstract Syntax Tree) ist die zentrale Datenstruktur zwischen den Phasen
- Der **Checker** verbraucht 60-80% der Compile-Zeit — hier liegt das Optimierungspotenzial
- Der Parser ist **fehlertolerant** — essenziell fuer IDE-Support
- Der Emitter erzeugt **.js**, **.d.ts** und **.js.map** — drei Sichten auf denselben Code

**Kernkonzept zum Merken:** Der TypeScript-Compiler ist kein monolithischer Schritt, sondern eine Pipeline aus 5 Phasen. Performance-Probleme liegen fast immer im Checker — nicht im Parsing oder Emitting. Wer den Checker versteht, kann gezielt optimieren.

---

> **Pausenpunkt** -- Guter Moment fuer eine Pause. Du hast jetzt ein mentales
> Modell davon, wie tsc intern arbeitet.
>
> Weiter geht es mit: [Sektion 02: Type Instantiation und Depth Limits](./02-type-instantiation-und-depth-limits.md)
