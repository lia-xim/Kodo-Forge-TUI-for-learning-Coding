# Sektion 4: Custom Transformers — AST-Manipulation

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Type Checker API](./03-type-checker-api.md)
> Naechste Sektion: [05 - Diagnostics und Language Service](./05-diagnostics-und-language-service.md)

---

## Was du hier lernst

- Wie **Custom Transformers** den AST veraendern — vor oder nach der Typ-Pruefung
- Die **ts.factory**-API zum Erstellen neuer AST-Nodes
- **Before-** und **After-Transformers** und wann man welchen braucht
- Praktisches Beispiel: Automatisches Logging in Funktionen injizieren

---

## Transformers: Code zur Compile-Zeit aendern

Custom Transformers sind Funktionen die den AST **vor der Ausgabe**
veraendern. Sie sind das maechtigste Feature der Compiler API — damit
kannst du Code generieren, entfernen oder umschreiben.

> 📖 **Hintergrund: Transformer im TypeScript-Oekosystem**
>
> TypeScript selbst nutzt intern Transformer: Der Compiler wandelt
> `async/await` in Promises um, entfernt Typ-Annotationen und
> kompiliert `enum` zu JavaScript-Objekten — alles ueber interne
> Transformer. Die oeffentliche Transformer-API wurde ab TS 2.3
> (2017) verfuegbar gemacht. Angular's `@angular/compiler-cli`
> nutzt sie um Template-Code zu generieren. `ts-auto-mock` nutzt
> sie um Mock-Objekte zur Compile-Zeit zu erzeugen. Und
> `typescript-plugin-css-modules` nutzt sie um CSS-Klassen als
> Typen bereitzustellen.

---

## Die Anatomie eines Transformers

```typescript annotated
import * as ts from "typescript";

// Ein Transformer ist eine Funktion die einen TransformationContext bekommt
// und eine Funktion zurueckgibt die SourceFiles transformiert:
const myTransformer: ts.TransformerFactory<ts.SourceFile> =
  (context: ts.TransformationContext) => {
    // Context enthaelt Compiler-Optionen und Hilfsfunktionen
    return (sourceFile: ts.SourceFile): ts.SourceFile => {
      // Visitor-Funktion die jeden Node besucht:
      function visitor(node: ts.Node): ts.Node {
        // Hier: Entscheide ob der Node veraendert werden soll
        if (ts.isStringLiteral(node)) {
          // Erstelle einen NEUEN Node (immutable!):
          return ts.factory.createStringLiteral(
            node.text.toUpperCase()
          );
        }
        // Fuer unveraenderte Nodes: besuche die Kinder
        return ts.visitEachChild(node, visitor, context);
        // ^ visitEachChild gibt einen neuen Baum zurueck
      }
      return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
    };
  };
```

### Die ts.factory-API

```typescript annotated
// ts.factory erstellt neue AST-Nodes:
const factory = ts.factory;

// Neuer String:
const str = factory.createStringLiteral("hello");

// Neuer Funktionsaufruf: console.log("hello")
const logCall = factory.createCallExpression(
  factory.createPropertyAccessExpression(
    factory.createIdentifier("console"),
    factory.createIdentifier("log")
  ),
  undefined,  // Type Arguments
  [factory.createStringLiteral("hello")]  // Argumente
);

// Neues Variable Statement: const x = 42
const varDecl = factory.createVariableStatement(
  undefined,  // Modifier
  factory.createVariableDeclarationList(
    [factory.createVariableDeclaration(
      "x",
      undefined,  // Typ-Annotation
      undefined,  // Typ
      factory.createNumericLiteral(42)
    )],
    ts.NodeFlags.Const
  )
);
```

> 🧠 **Erklaere dir selbst:** Warum sind AST-Nodes immutable?
> Warum erzeugt `ts.factory` immer NEUE Nodes statt bestehende
> zu veraendern?
> **Kernpunkte:** Immutability macht den Compiler zuverlaessig |
> Mehrere Transformer koennen den gleichen AST lesen ohne sich
> gegenseitig zu stoeren | Debugging: Man kann den Zustand vor
> und nach jedem Transformer vergleichen | Wie Immer's produce()
> oder Redux's State

---

## Praxis: Automatisches Logging injizieren

Ein Transformer der am Anfang jeder Funktion ein `console.log`
einfuegt:

```typescript annotated
function createLoggingTransformer(): ts.TransformerFactory<ts.SourceFile> {
  return (context) => (sourceFile) => {
    function visitor(node: ts.Node): ts.Node {
      if (ts.isFunctionDeclaration(node) && node.name && node.body) {
        const funcName = node.name.text;

        // Erstelle: console.log("Entering functionName", arguments)
        const logStatement = ts.factory.createExpressionStatement(
          ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier("console"),
              ts.factory.createIdentifier("log")
            ),
            undefined,
            [
              ts.factory.createStringLiteral(`Entering ${funcName}`),
            ]
          )
        );

        // Neuer Funktionsbody: Log-Statement + originale Statements
        const newBody = ts.factory.createBlock(
          [logStatement, ...node.body.statements],
          true  // multiLine
        );

        // Gib eine neue FunctionDeclaration zurueck:
        return ts.factory.updateFunctionDeclaration(
          node,
          node.modifiers,        // Modifier beibehalten
          node.asteriskToken,    // Generator-Token
          node.name,             // Name beibehalten
          node.typeParameters,   // Generics
          node.parameters,       // Parameter
          node.type,             // Rueckgabetyp
          newBody                // Neuer Body mit Logging
        );
      }
      return ts.visitEachChild(node, visitor, context);
    }
    return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
  };
}
```

### Den Transformer ausfuehren

```typescript annotated
// Methode 1: Mit ts.emit (empfohlen fuer Build-Pipelines)
const result = program.emit(
  undefined,  // Alle Dateien
  undefined,  // Default writeFile
  undefined,  // Cancellation Token
  false,      // emitOnlyDtsFiles
  {
    before: [createLoggingTransformer()],  // VOR der Typ-Entfernung
    // after: [...],                        // NACH der Typ-Entfernung
    // afterDeclarations: [...],            // Fuer .d.ts Dateien
  }
);

// Methode 2: Nur transformieren (ohne Ausgabe)
const transformed = ts.transform(sourceFile, [createLoggingTransformer()]);
const printer = ts.createPrinter();
const output = printer.printFile(transformed.transformed[0] as ts.SourceFile);
console.log(output);
transformed.dispose();  // Ressourcen freigeben!
```

> ⚡ **Framework-Bezug:** Angular's Build-Prozess nutzt genau
> dieses Pattern. Der `@angular/compiler-cli` registriert Before-
> Transformer die Template-Code und Dependency-Injection-Factories
> generieren. Wenn du in deinem Angular-Projekt `ng build` aufrufst,
> laufen mehrere Custom Transformer: Template-Compiler,
> i18n-Transformer, Ivy-Renderer-Factories. Das ist der Grund warum
> Angular einen eigenen Compiler braucht — `tsc` allein reicht nicht.

> 💭 **Denkfrage:** Wann solltest du einen Before-Transformer (vor
> Typ-Entfernung) und wann einen After-Transformer (nach Typ-
> Entfernung) verwenden?
>
> **Antwort:** Before: Wenn du Typ-Informationen brauchst (z.B.
> "Ist diese Variable ein Observable?") oder wenn du neuen Code
> generierst der noch vom Type Checker geprueft werden soll.
> After: Wenn du nur JavaScript-Output manipulieren willst (z.B.
> Minification, Polyfills einfuegen). After-Transformer sehen
> keinen TypeScript-Syntax mehr.

---

## Experiment: Dead-Code-Entferner

Baue einen Transformer der `if (false) { ... }`-Bloecke entfernt:

```typescript
function createDeadCodeRemover(): ts.TransformerFactory<ts.SourceFile> {
  return (context) => (sourceFile) => {
    function visitor(node: ts.Node): ts.Node | undefined {
      if (ts.isIfStatement(node)) {
        // Pruefe ob die Bedingung "false" ist:
        if (node.expression.kind === ts.SyntaxKind.FalseKeyword) {
          // Gibt es ein else? Dann behalte den else-Block:
          if (node.elseStatement) {
            return ts.visitNode(node.elseStatement, visitor);
          }
          // Kein else → entferne den ganzen if-Block:
          return undefined;  // undefined = Node entfernen
        }
        // Pruefe ob die Bedingung "true" ist:
        if (node.expression.kind === ts.SyntaxKind.TrueKeyword) {
          // Behalte nur den then-Block:
          return ts.visitNode(node.thenStatement, visitor);
        }
      }
      return ts.visitEachChild(node, visitor, context);
    }
    return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
  };
}

// Experiment: Erweitere den Remover um auch `if (0)` und
// `if ("")` als dead code zu erkennen.
// Bonus: Erkenne `if (process.env.NODE_ENV === "development")` im
// Production-Build als dead code.
```

---

## Was du gelernt hast

- Custom Transformers veraendern den AST **vor der Ausgabe** — Code-Generierung zur Compile-Zeit
- Die **ts.factory**-API erstellt neue immutable AST-Nodes
- **Before-Transformers** haben Zugang zu Typen, **After-Transformers** sehen nur JavaScript
- Ausfuehrung ueber `program.emit()` (Build-Pipeline) oder `ts.transform()` (manuell)
- Angular, ts-auto-mock und viele Libraries nutzen Custom Transformers

> 🧠 **Erklaere dir selbst:** Wenn Transformers den AST veraendern
> koennen, warum nutzt man nicht Transformers statt Babel-Plugins
> fuer Code-Transformationen?
> **Kernpunkte:** TypeScript-Transformers sind staerker (haben
> Typ-Informationen) | Aber: Weniger Oekosystem als Babel |
> Kein Plugin-System wie Babel | Fuer reine JS-Transformationen
> ist Babel besser | Fuer TS-spezifische: Transformers sind ideal

**Kernkonzept zum Merken:** Transformers sind "Code der Code schreibt". Sie operieren auf dem AST, nicht auf Strings — das macht sie zuverlaessig. Die Factory-API ist verbose aber praezise.

---

> **Pausenpunkt** — Du kannst jetzt den AST nicht nur lesen,
> sondern auch veraendern. Naechster Schritt: Diagnostics und der
> Language Service.
>
> Weiter geht es mit: [Sektion 05: Diagnostics und Language Service](./05-diagnostics-und-language-service.md)
