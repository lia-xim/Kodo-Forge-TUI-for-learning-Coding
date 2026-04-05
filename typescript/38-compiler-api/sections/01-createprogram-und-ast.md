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
> bekommst Output. GCC, Clang, javac — sie alle verbergen ihre
> internen Strukturen. TypeScript ist fundamental anders. Das Team
> um Anders Hejlsberg (Erfinder von Turbo Pascal, Delphi und C#)
> entschied von Anfang an, die Compiler-Interna als oeffentliche
> API bereitzustellen.
>
> Der Grund war pragmatisch: Microsoft wollte nicht das einzige
> Unternehmen sein, das TypeScript-Tools baut. Sie wollten ein
> Oekosystem. Die Entscheidung war revolutionaer — denn ein Compiler
> der sich selbst als Bibliothek anbietet, wird zu einer Plattform.
>
> Das Ergebnis siehst du heute: VS Code kommuniziert direkt mit dem
> TypeScript-Compiler-Kern (tsserver). ESLint mit `@typescript-eslint`
> nutzt `ts.createProgram` um Typ-basierte Regeln zu pruefen — etwas
> das ohne diese API schlicht unmoglich waere. Bundler wie esbuild
> und Vite parsen TypeScript mit der gleichen Infrastruktur. Code-
> Generatoren wie GraphQL-Codegen lesen TypeScript-Typen und erzeugen
> automatisch Client-Code.
>
> Die API ist unter `typescript` (dem npm-Paket) direkt verfuegbar —
> kein separates Paket noetig. Dieselbe `typescript`-Abhaengigkeit
> die `tsc` ausfuehrt, gibt dir auch Zugang zum gesamten Compiler-Kern.

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
>
> Stell dir vor, du willst alle Funktionsaufrufe von `console.log`
> finden. Mit RegExp: `/console\.log\(/g` — aber was ist mit
> `// console.log(...)` in einem Kommentar? Oder `"console.log("` in
> einem String-Literal? Oder `console\n.log(`mit Zeilenumbruch? Jede
> Sonderfall-Behandlung macht den RegExp komplexer und fehleranfaelliger.
> Der AST hat diese Probleme nicht — `ts.isCallExpression(node)` und
> `ts.isPropertyAccessExpression(node.expression)` sind exakt und
> kontextsicher.

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

> ⚡ **Framework-Bezug: Angular und die Compiler API**
>
> In deinem Angular-Projekt ist die Compiler API allgegenwaertig,
> auch wenn du sie nie direkt siehst. Wenn du `ng build` ausfuehrst,
> passiert folgendes:
>
> 1. `@angular/compiler-cli` ruft `ts.createProgram` auf — genau wie
>    in Sektion 1 gezeigt
> 2. Angular-spezifische Transformer durchsuchen den AST nach
>    `@Component`, `@Injectable`, `@NgModule`-Decorators
> 3. Fuer jede Component wird Template-Code gelesen, analysiert und
>    in optimierten JavaScript-Code (Ivy-Instructions) umgewandelt
> 4. Dependency-Injection-Factories werden automatisch generiert —
>    das `ɵfac`-Property das du in kompiliertem Angular-Code siehst
>
> Das ist der Grund warum Angular einen eigenen Build-Schritt (`ngc`)
> braucht statt reinem `tsc`. Der Angular-Compiler ist eine der
> groessten und komplexesten Compiler-API-Anwendungen in der
> Open-Source-Welt. Dein Wissen ueber `ts.createProgram` und den AST
> ist direkt auf das Angular-Innenleben uebertragbar.
>
> ESLint mit `@typescript-eslint/parser` parst ebenfalls den AST —
> deshalb kann es Typ-basierte Regeln wie `no-floating-promises`
> pruefen, die ohne Type Checker schlicht unmoglich waeren.

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
  // ^ Ohne setParentNodes: node.parent ist undefined!
  // ^ Mit setParentNodes: Jeder Node kennt seinen Eltern-Node
);

// Gib alle Top-Level-Nodes aus:
sourceFile.forEachChild(node => {
  console.log(
    ts.SyntaxKind[node.kind],     // Node-Typ als String (z.B. "VariableStatement")
    node.getFullText(sourceFile)  // Quellcode dieses Nodes
  );
});

// Erkundung: Geh tiefer in den Baum hinein
sourceFile.forEachChild(node => {
  if (ts.isFunctionDeclaration(node)) {
    console.log("Funktion:", node.name?.text);
    // Parameters ausgeben:
    node.parameters.forEach(param => {
      console.log("  Parameter:", param.name.getText(sourceFile));
      if (param.type) {
        console.log("  Typ:", ts.SyntaxKind[param.type.kind]);
      }
    });
  }
});

// Experiment: Aendere den Source-String und beobachte wie sich
// der AST aendert. Was passiert bei einem Syntax-Fehler?
// Tipp: ts.createSourceFile versucht fehlertolerantes Parsen —
// auch ungueliger Code erzeugt einen (unvollstaendigen) AST.
// Was passiert bei einem Interface? Bei einer Klasse? Bei einem Enum?
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
