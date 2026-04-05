# Sektion 1: ts.createProgram und der AST

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: — (Start)
> Naechste Sektion: [02 - Nodes traversieren](./02-nodes-traversieren.md)

---

## Was du hier lernst

- Was der **Abstract Syntax Tree (AST)** ist und warum er das Herzstueck des Compilers bildet
- Wie man mit **ts.createProgram** ein TypeScript-Programm programmatisch laedt
- Die wichtigsten **Node-Typen** im AST und wie sie zusammenhaengen
- Wann man die Compiler API braucht — und wann nicht

---

## Der Compiler als Werkzeug

Bis jetzt hast du TypeScript als Sprache kennengelernt. Aber der
TypeScript-Compiler (`tsc`) ist nicht nur ein Uebersetzungswerkzeug —
er ist eine **Programmierbibliothek**. Du kannst ihn in deinem eigenen
Code verwenden um TypeScript-Dateien zu analysieren, zu transformieren
und zu generieren.

> 📖 **Hintergrund: Warum TypeScript eine oeffentliche API hat**
>
> Die meisten Compiler sind Black Boxes — du gibst Code rein und
> bekommst Output. TypeScript ist anders. Das Team um Anders Hejlsberg
> entschied frueh, die Compiler-Interna als API bereitzustellen.
> Der Grund: Das TypeScript-Oekosystem sollte erweiterbar sein.
> IDEs (VS Code), Linter (ESLint mit @typescript-eslint), Bundler
> (webpack, esbuild) und Code-Generatoren nutzen alle die Compiler
> API. Ohne sie waere das TypeScript-Oekosystem nicht moeglich.
> Die API ist unter `typescript` (dem npm-Paket) direkt verfuegbar —
> kein separates Paket noetig.

---

## Der Abstract Syntax Tree (AST)

Wenn der Compiler deinen Code liest, erzeugt er einen **Baum** der
die Struktur des Codes repraesentiert. Dieser Baum heisst AST.

```typescript annotated
// Dieser Code...
const greeting = "hello";

// ...wird zu diesem AST (vereinfacht):
// SourceFile
//   └── VariableStatement
//         └── VariableDeclarationList (const)
//               └── VariableDeclaration
//                     ├── Identifier: "greeting"
//                     └── StringLiteral: "hello"
// ^ Jeder "Knoten" im Baum ist ein Node-Objekt mit Typ, Position und Kindern
```

### Warum der AST wichtig ist

Der AST ist die **gemeinsame Sprache** aller Tools:

```
Quellcode (String)
    │
    ▼
  Parser → AST (Baumstruktur)
    │
    ├── Type Checker: Prueft Typen anhand des AST
    ├── Emitter: Generiert JavaScript aus dem AST
    ├── Language Service: Autocomplete, Hover, Rename
    ├── ESLint: Prueft Regeln auf dem AST
    └── DEIN Tool: Analysiert/transformiert den AST
```

> 💭 **Denkfrage:** Warum arbeiten alle Tools auf dem AST statt
> direkt auf dem Quellcode-String? Was waere das Problem mit
> String-basierter Analyse?
>
> **Antwort:** Strings sind unstrukturiert. Um zu wissen ob
> `greeting` eine Variable oder ein Property ist, muesste man den
> gesamten Kontext parsen. Der AST hat diese Information bereits
> — jeder Node kennt seinen Typ, seine Position und seinen Kontext.
> String-basierte Tools (RegExp) brechen bei Kommentaren, Strings-
> in-Strings und verschachteltem Code.

---

## ts.createProgram: Dein Einstieg

```typescript annotated
import * as ts from "typescript";

// Schritt 1: Programm erstellen
const program = ts.createProgram(
  ["src/main.ts"],                    // Dateien
  { strict: true, target: ts.ScriptTarget.ES2022 }  // Compiler-Optionen
);
// ^ createProgram liest die Dateien, parst sie und erstellt den AST

// Schritt 2: SourceFile holen (= AST einer Datei)
const sourceFile = program.getSourceFile("src/main.ts");
// ^ SourceFile ist der Wurzelknoten des AST fuer diese Datei

// Schritt 3: Type Checker holen
const checker = program.getTypeChecker();
// ^ Der Type Checker hat Zugriff auf ALLE Typ-Informationen

// Schritt 4: Diagnostics pruefen (Fehler)
const diagnostics = ts.getPreEmitDiagnostics(program);
diagnostics.forEach(d => {
  const message = ts.flattenDiagnosticMessageText(d.messageText, "\n");
  console.log(`Fehler: ${message}`);
});
```

### Die wichtigsten Objekte

| Objekt | Beschreibung | Erstellt durch |
|--------|-------------|----------------|
| `Program` | Repraesentiert das gesamte Projekt | `ts.createProgram()` |
| `SourceFile` | AST einer einzelnen Datei | `program.getSourceFile()` |
| `TypeChecker` | Kennt alle Typen im Projekt | `program.getTypeChecker()` |
| `Node` | Ein Knoten im AST | Im SourceFile enthalten |
| `Symbol` | Repraesentiert eine benannte Entity | `checker.getSymbolAtLocation()` |
| `Type` | Ein aufgeloester Typ | `checker.getTypeAtLocation()` |

> 🧠 **Erklaere dir selbst:** Was ist der Unterschied zwischen einem
> `Node`, einem `Symbol` und einem `Type` in der Compiler API?
> Warum braucht man alle drei?
> **Kernpunkte:** Node = Syntax (wo im Code steht es?) | Symbol =
> Semantik (was bedeutet dieser Name?) | Type = Typ-Information
> (welchen Typ hat dieser Ausdruck?) | Ein Identifier-Node verweist
> auf ein Symbol, das Symbol hat einen Type

---

## Node-Typen: Die Bausteine des AST

TypeScript hat ueber 300 Node-Typen. Die wichtigsten:

```typescript annotated
// SyntaxKind ist ein Enum mit allen Node-Typen:
ts.SyntaxKind.SourceFile           // Wurzel
ts.SyntaxKind.VariableStatement    // const/let/var ...
ts.SyntaxKind.FunctionDeclaration  // function foo() {}
ts.SyntaxKind.ClassDeclaration     // class Foo {}
ts.SyntaxKind.InterfaceDeclaration // interface Foo {}
ts.SyntaxKind.TypeAliasDeclaration // type Foo = ...
ts.SyntaxKind.Identifier           // Ein Name (z.B. "greeting")
ts.SyntaxKind.StringLiteral        // "hello"
ts.SyntaxKind.NumericLiteral       // 42
ts.SyntaxKind.CallExpression       // foo()
ts.SyntaxKind.PropertyAccessExpression  // obj.prop

// Type Guards fuer Nodes:
if (ts.isVariableStatement(node)) {
  // TypeScript weiss: node ist VariableStatement
  // node.declarationList ist verfuegbar
}
if (ts.isFunctionDeclaration(node)) {
  // node.name, node.parameters, node.body sind verfuegbar
}
```

> ⚡ **Framework-Bezug:** Angular's Compiler (`@angular/compiler-cli`)
> nutzt die TypeScript Compiler API intensiv. Er liest Component-
> Decorators ueber den AST, analysiert Template-Expressions und
> generiert Factory-Code. Wenn du `ng build` aufrufst, laeuft unter
> der Haube `ts.createProgram` mit Angular-spezifischen Transformern.
> ESLint mit `@typescript-eslint/parser` parst ebenfalls den AST —
> deshalb kann es Typ-basierte Regeln pruefen.

---

## Experiment: AST-Explorer

Schreibe ein Mini-Skript das den AST einer TypeScript-Datei ausgibt:

```typescript
import * as ts from "typescript";

// Erzeuge einen AST direkt aus einem String (ohne Datei):
const source = `
  const name: string = "TypeScript";
  function greet(who: string): string {
    return "Hello " + who;
  }
`;

const sourceFile = ts.createSourceFile(
  "example.ts",
  source,
  ts.ScriptTarget.Latest,
  true  // setParentNodes = true (wichtig fuer Traversierung!)
);

// Gib alle Top-Level-Nodes aus:
sourceFile.forEachChild(node => {
  console.log(
    ts.SyntaxKind[node.kind],    // Node-Typ als String
    node.getFullText(sourceFile)  // Quellcode dieses Nodes
  );
});

// Experiment: Aendere den Source-String und beobachte wie sich
// der AST aendert. Was passiert bei einem Syntax-Fehler?
// Was passiert bei einem Interface? Bei einer Klasse?
```

---

## Was du gelernt hast

- Der **AST** ist eine Baumstruktur die den Code repraesentiert — alle Tools arbeiten darauf
- **ts.createProgram** laedt Dateien und erzeugt den AST, Type Checker und Diagnostics
- **Node**, **Symbol** und **Type** sind die drei Kernkonzepte: Syntax, Semantik, Typ-Information
- TypeScript hat ueber **300 Node-Typen** — Type Guards wie `ts.isFunctionDeclaration()` helfen bei der Arbeit
- Die Compiler API ist die Grundlage fuer IDEs, Linter, Bundler und Code-Generatoren

> 🧠 **Erklaere dir selbst:** Warum ist `ts.createSourceFile` (parst
> einen String) anders als `ts.createProgram` (parst ein Projekt)?
> Wann wuerdest du welches verwenden?
> **Kernpunkte:** createSourceFile parst nur Syntax (kein Type
> Checker) | createProgram laedt Imports, loest Typen auf |
> Fuer Syntax-Analyse: createSourceFile | Fuer Typ-Analyse:
> createProgram

**Kernkonzept zum Merken:** Der AST ist die Bruecke zwischen Quellcode und Tools. Jedes Tool das TypeScript versteht — von VS Code bis ESLint — arbeitet auf dem AST. Die Compiler API gibt dir Zugang zu dieser Bruecke.

---

> **Pausenpunkt** — Du kennst jetzt den AST und ts.createProgram.
> Als naechstes lernst du den Baum zu durchlaufen.
>
> Weiter geht es mit: [Sektion 02: Nodes traversieren](./02-nodes-traversieren.md)
