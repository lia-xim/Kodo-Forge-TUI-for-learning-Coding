# Sektion 2: Nodes traversieren — forEachChild und Visitors

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - ts.createProgram und der AST](./01-createprogram-und-ast.md)
> Naechste Sektion: [03 - Type Checker API](./03-type-checker-api.md)

---

## Was du hier lernst

- Die zwei Traversierungsmethoden: **ts.forEachChild** und **ts.visitEachChild**
- Wie man einen **rekursiven Visitor** schreibt der bestimmte Nodes findet
- **Visitor-Pattern** fuer AST-Analyse — warum es besser ist als manuelle Rekursion
- Praktisches Beispiel: Alle Funktionen in einer Datei finden

---

## Den Baum durchlaufen

Ein AST ist ein Baum. Um ihn zu analysieren, musst du ihn
**durchlaufen** (traversieren). TypeScript bietet dafuer zwei
Hauptmethoden:

### Methode 1: ts.forEachChild (Direktkinder)

```typescript annotated
import * as ts from "typescript";

// forEachChild besucht nur die DIREKTEN Kinder eines Nodes:
function printChildren(node: ts.Node, sourceFile: ts.SourceFile): void {
  ts.forEachChild(node, child => {
    console.log(ts.SyntaxKind[child.kind], child.getText(sourceFile));
    // ^ Gibt den Typ und Quelltext jedes Kindes aus
  });
}

// Fuer eine SourceFile sind die Direktkinder die Top-Level-Statements:
// SourceFile
//   ├── ImportDeclaration      (direktes Kind)
//   ├── FunctionDeclaration    (direktes Kind)
//   │     ├── Identifier       (Kind des Kindes — NICHT besucht!)
//   │     └── Block            (Kind des Kindes — NICHT besucht!)
//   └── ClassDeclaration       (direktes Kind)
```

### Methode 2: Rekursive Traversierung (Deep Walk)

```typescript annotated
// Um ALLE Nodes zu besuchen, braucht man Rekursion:
function walk(node: ts.Node, sourceFile: ts.SourceFile): void {
  // Verarbeite diesen Node
  if (ts.isFunctionDeclaration(node) && node.name) {
    console.log(`Funktion gefunden: ${node.name.getText(sourceFile)}`);
  }

  // Besuche alle Kinder (rekursiv)
  ts.forEachChild(node, child => walk(child, sourceFile));
  // ^ Jedes Kind wird auch zu walk() uebergeben — so geht man tiefer
}

// Starten:
walk(sourceFile, sourceFile);
```

> 📖 **Hintergrund: Warum forEachChild und nicht node.children?**
>
> In vielen AST-Bibliotheken (z.B. Babel, ESTree) haben Nodes ein
> `children`-Array. TypeScript's AST hat das nicht. Stattdessen hat
> jeder Node spezifische Properties: `FunctionDeclaration.name`,
> `FunctionDeclaration.parameters`, `FunctionDeclaration.body`.
> `ts.forEachChild` kennt die Struktur jedes Node-Typs und besucht
> alle relevanten Kinder in der richtigen Reihenfolge. Der Vorteil:
> Kein generisches `children`-Array das Kommentare und Whitespace
> enthalten koennte. Der Nachteil: Du musst `forEachChild` verwenden
> statt einfach ueber ein Array zu iterieren.

---

## Das Visitor-Pattern

Fuer komplexere Analysen ist das Visitor-Pattern besser als
manuelle Rekursion:

```typescript annotated
// Ein Visitor der spezifische Node-Typen behandelt:
interface ASTVisitor {
  visitFunctionDeclaration?(node: ts.FunctionDeclaration): void;
  visitClassDeclaration?(node: ts.ClassDeclaration): void;
  visitCallExpression?(node: ts.CallExpression): void;
  visitIdentifier?(node: ts.Identifier): void;
}

function visitNode(node: ts.Node, visitor: ASTVisitor): void {
  // Dispatch basierend auf Node-Typ:
  if (ts.isFunctionDeclaration(node) && visitor.visitFunctionDeclaration) {
    visitor.visitFunctionDeclaration(node);
  }
  if (ts.isClassDeclaration(node) && visitor.visitClassDeclaration) {
    visitor.visitClassDeclaration(node);
  }
  if (ts.isCallExpression(node) && visitor.visitCallExpression) {
    visitor.visitCallExpression(node);
  }
  if (ts.isIdentifier(node) && visitor.visitIdentifier) {
    visitor.visitIdentifier(node);
  }

  // Rekursiv alle Kinder besuchen:
  ts.forEachChild(node, child => visitNode(child, visitor));
}
```

### Verwendung des Visitors

```typescript annotated
const functionNames: string[] = [];
const classNames: string[] = [];

visitNode(sourceFile, {
  visitFunctionDeclaration(node) {
    if (node.name) functionNames.push(node.name.text);
    // ^ node.name.text ist der Name als String
  },
  visitClassDeclaration(node) {
    if (node.name) classNames.push(node.name.text);
  },
});

console.log("Funktionen:", functionNames);
console.log("Klassen:", classNames);
```

> 🧠 **Erklaere dir selbst:** Warum ist das Visitor-Pattern besser
> als eine grosse `switch`-Anweisung ueber `node.kind`? Was passiert
> wenn du einen neuen Node-Typ behandeln willst?
> **Kernpunkte:** Separation of Concerns — jeder Visitor behandelt
> ein spezifisches Anliegen | Einfach erweiterbar (neues Property
> im Interface) | Mehrere Visitors koennen den gleichen Baum
> traversieren | switch wird bei 300+ SyntaxKinds unuebersichtlich

---

## Praktisches Beispiel: Alle Exports finden

```typescript annotated
import * as ts from "typescript";

interface ExportInfo {
  name: string;
  kind: string;
  isDefault: boolean;
}

function findExports(sourceFile: ts.SourceFile): ExportInfo[] {
  const exports: ExportInfo[] = [];

  ts.forEachChild(sourceFile, node => {
    // Pruefe ob der Node ein Export-Modifier hat:
    const modifiers = ts.getModifiers(node);
    const isExported = modifiers?.some(
      m => m.kind === ts.SyntaxKind.ExportKeyword
    );
    const isDefault = modifiers?.some(
      m => m.kind === ts.SyntaxKind.DefaultKeyword
    );

    if (!isExported) return;

    if (ts.isFunctionDeclaration(node) && node.name) {
      exports.push({ name: node.name.text, kind: "function", isDefault: !!isDefault });
    }
    if (ts.isClassDeclaration(node) && node.name) {
      exports.push({ name: node.name.text, kind: "class", isDefault: !!isDefault });
    }
    if (ts.isInterfaceDeclaration(node)) {
      exports.push({ name: node.name.text, kind: "interface", isDefault: false });
    }
    if (ts.isTypeAliasDeclaration(node)) {
      exports.push({ name: node.name.text, kind: "type", isDefault: false });
    }
  });

  return exports;
}
```

> ⚡ **Framework-Bezug:** Angular's `@angular/compiler-cli` traversiert
> den AST um `@Component`, `@Injectable` und andere Decorators zu
> finden. Der Angular Compiler ist im Grunde ein Visitor der auf
> bestimmte Node-Typen reagiert: Decorator → lese Metadaten →
> generiere Factory-Code. ESLint-Regeln wie `@typescript-eslint/
> no-floating-promises` traversieren den AST um unbehandelte Promises
> zu finden — genau mit diesem Visitor-Pattern.

> 💭 **Denkfrage:** Wenn du den AST einer grossen Datei (10.000 Zeilen)
> traversierst, besucht der Visitor jeden einzelnen Node. Wie
> koenntest du die Traversierung optimieren wenn du nur bestimmte
> Node-Typen suchst?
>
> **Antwort:** Du koenntest frueh abbrechen: Wenn du nur Top-Level-
> Deklarationen suchst, braucht du nicht in Funktionsbodies
> hineinzugehen. `ts.forEachChild` erlaubt das — du rufst einfach
> nicht rekursiv `walk()` fuer Nodes auf die dich nicht interessieren.
> ESLint nutzt "selectors" die nur bestimmte Node-Typen besuchen.

---

## ts.visitEachChild: Fuer Transformationen

Fuer **lesende** Analyse reicht `forEachChild`. Fuer **Transformationen**
(AST veraendern) gibt es `ts.visitEachChild`:

```typescript annotated
import * as ts from "typescript";

// Transformer: Ersetze alle String-Literals durch UPPERCASE
function uppercaseStrings(context: ts.TransformationContext) {
  return (sourceFile: ts.SourceFile): ts.SourceFile => {
    function visitor(node: ts.Node): ts.Node {
      if (ts.isStringLiteral(node)) {
        // Ersetze den String durch seine Grossschreibung:
        return ts.factory.createStringLiteral(node.text.toUpperCase());
      }
      // Fuer alle anderen Nodes: besuche die Kinder
      return ts.visitEachChild(node, visitor, context);
      // ^ visitEachChild gibt einen NEUEN Node zurueck (immutable!)
    }
    return ts.visitEachChild(sourceFile, visitor, context);
  };
}
```

---

## Experiment: Finde alle TODO-Kommentare

Schreibe einen Visitor der alle TODO-Kommentare in einer Datei findet:

```typescript
import * as ts from "typescript";

function findTodos(sourceFile: ts.SourceFile): { line: number; text: string }[] {
  const todos: { line: number; text: string }[] = [];

  // Kommentare sind NICHT im AST — sie sind "Trivia" (angehaengt an Nodes)
  function scanTrivia(node: ts.Node): void {
    const leadingComments = ts.getLeadingCommentRanges(
      sourceFile.getFullText(),
      node.getFullStart()
    );

    if (leadingComments) {
      for (const comment of leadingComments) {
        const text = sourceFile.getFullText().slice(comment.pos, comment.end);
        if (text.includes("TODO")) {
          const line = sourceFile.getLineAndCharacterOfPosition(comment.pos).line + 1;
          todos.push({ line, text: text.trim() });
        }
      }
    }

    ts.forEachChild(node, scanTrivia);
  }

  scanTrivia(sourceFile);
  return todos;
}

// Experiment: Erweitere den Finder um auch FIXME und HACK zu erkennen.
// Bonus: Gib aus, in welcher Funktion/Klasse der Kommentar steht.
```

---

## Was du gelernt hast

- **ts.forEachChild** besucht Direktkinder — fuer Analyse braucht man Rekursion
- Das **Visitor-Pattern** trennt Traversierung von Analyse — sauberer und erweiterbarer
- **ts.visitEachChild** ist fuer Transformationen — es gibt neue (immutable) Nodes zurueck
- Kommentare sind **Trivia** — nicht im AST, aber ueber `getLeadingCommentRanges` zugaenglich
- Angular, ESLint und VS Code nutzen alle dieses Traversierungs-Pattern

> 🧠 **Erklaere dir selbst:** Was ist der Unterschied zwischen
> `ts.forEachChild` (fuer Analyse) und `ts.visitEachChild` (fuer
> Transformation)? Warum gibt es zwei verschiedene Methoden?
> **Kernpunkte:** forEachChild gibt void zurueck — nur lesen |
> visitEachChild gibt einen neuen Node zurueck — fuer Aenderungen |
> Immutability: Der AST wird nie direkt veraendert, immer kopiert

**Kernkonzept zum Merken:** AST-Traversierung = Rekursion ueber den Baum. Fuer Analyse: `forEachChild` + eigene Rekursion. Fuer Transformation: `visitEachChild` + `ts.factory`. Der Visitor entscheidet, der Traverser navigiert.

---

> **Pausenpunkt** — Du kannst den AST traversieren und Nodes finden.
> Naechster Schritt: Die Type Checker API fuer Typ-Informationen.
>
> Weiter geht es mit: [Sektion 03: Type Checker API](./03-type-checker-api.md)
