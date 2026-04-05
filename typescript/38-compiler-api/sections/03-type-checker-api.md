# Sektion 3: Type Checker API

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Nodes traversieren](./02-nodes-traversieren.md)
> Naechste Sektion: [04 - Custom Transformers](./04-custom-transformers.md)

---

## Was du hier lernst

- Wie man mit **getTypeAtLocation** den Typ eines beliebigen Ausdrucks abfragt
- **getSymbolAtLocation** fuer Name-Resolution und Deklarations-Lookup
- Den Unterschied zwischen **Typ als String** und **Typ als Objekt** in der API
- Praktisches Beispiel: Ungenutzte Exports automatisch finden

---

## Der Type Checker: Das Gehirn des Compilers

Der Parser erzeugt den AST (Syntax). Aber der AST allein weiss
nicht, dass `greeting` vom Typ `string` ist — das weiss nur der
**Type Checker**. Er ist die maechtigste Komponente der Compiler API.

> 📖 **Hintergrund: Wie der Type Checker arbeitet**
>
> Der Type Checker wurde von Anders Hejlsberg persoenlich
> implementiert und ist mit Abstand die komplexeste Komponente des
> TypeScript-Compilers (~50.000 Zeilen in `checker.ts`). Er
> durchlaeuft den AST und berechnet fuer jeden Ausdruck den Typ.
> Dabei loest er Generics auf, fuehrt Type Narrowing durch,
> checkt Zuweisungskompatibilitaet und vieles mehr. Die Datei
> `checker.ts` im TypeScript-Repository ist eine der groessten
> einzelnen Dateien in der Open-Source-Welt — und sie waechst
> mit jedem Release.

---

## getTypeAtLocation: Welchen Typ hat dieser Ausdruck?

```typescript annotated
import * as ts from "typescript";

const program = ts.createProgram(["src/main.ts"], { strict: true });
const checker = program.getTypeChecker();
const sourceFile = program.getSourceFile("src/main.ts")!;

// Finde alle Variablen und gib ihren Typ aus:
function printVariableTypes(node: ts.Node): void {
  if (ts.isVariableDeclaration(node) && node.name) {
    const type = checker.getTypeAtLocation(node);
    // ^ Gibt den AUFGELOESTEN Typ zurueck (nach Inferenz, Narrowing, etc.)
    const typeString = checker.typeToString(type);
    // ^ Konvertiert den Typ in einen lesbaren String
    console.log(`${node.name.getText(sourceFile)}: ${typeString}`);
  }
  ts.forEachChild(node, printVariableTypes);
}

printVariableTypes(sourceFile!);
// Ausgabe z.B.:
// greeting: string
// numbers: number[]
// config: { host: string; port: number }
```

### Typ-Objekte untersuchen

```typescript annotated
// Der Type-Checker gibt Type-Objekte zurueck — nicht nur Strings:
const type = checker.getTypeAtLocation(someNode);

// Pruefen ob es ein Union-Typ ist:
if (type.isUnion()) {
  console.log("Union-Mitglieder:");
  for (const member of type.types) {
    console.log("  -", checker.typeToString(member));
  }
}

// Properties eines Objekttyps auflisten:
const properties = type.getProperties();
// ^ Gibt ein Array von Symbol-Objekten zurueck
for (const prop of properties) {
  const propType = checker.getTypeOfSymbolAtLocation(prop, someNode);
  console.log(`  ${prop.getName()}: ${checker.typeToString(propType)}`);
}

// Pruefen ob ein Typ einem anderen zuweisbar ist:
const isAssignable = checker.isTypeAssignableTo(typeA, typeB);
// ^ Wie: "Kann ich A an eine Variable vom Typ B zuweisen?"
```

> 🧠 **Erklaere dir selbst:** Warum gibt `getTypeAtLocation` den
> **aufgeloesten** Typ zurueck und nicht den annotierten Typ?
> Was ist der Unterschied bei `const x = [1, 2, 3]`?
> **Kernpunkte:** Der annotierte Typ koennte fehlen (Inferenz) |
> Der aufgeloeste Typ beruecksichtigt Narrowing und Context |
> Bei `const x = [1, 2, 3]` ist der aufgeloeste Typ `number[]`
> (nicht `(number)[]` oder `[number, number, number]`)

---

## getSymbolAtLocation: Was bedeutet dieser Name?

```typescript annotated
import * as ts from "typescript";

// Ein Symbol repraesentiert eine benannte Entity:
// Variable, Funktion, Klasse, Property, Parameter, etc.

function findSymbolInfo(node: ts.Node): void {
  if (ts.isIdentifier(node)) {
    const symbol = checker.getSymbolAtLocation(node);
    // ^ Loest den Namen auf — folgt Imports, Aliase, etc.
    if (symbol) {
      console.log(`Name: ${symbol.getName()}`);

      // Wo wurde es deklariert?
      const declarations = symbol.getDeclarations();
      if (declarations && declarations.length > 0) {
        const decl = declarations[0];
        const file = decl.getSourceFile().fileName;
        const pos = decl.getSourceFile().getLineAndCharacterOfPosition(decl.getStart());
        console.log(`  Deklariert in: ${file}:${pos.line + 1}`);
      }

      // Welchen Typ hat es?
      const type = checker.getTypeOfSymbolAtLocation(symbol, node);
      console.log(`  Typ: ${checker.typeToString(type)}`);

      // Ist es exportiert?
      const flags = symbol.getFlags();
      console.log(`  Flags: ${ts.SymbolFlags[flags]}`);
    }
  }
  ts.forEachChild(node, findSymbolInfo);
}
```

> ⚡ **Framework-Bezug:** VS Code's "Go to Definition" (F12) nutzt
> genau `getSymbolAtLocation` — es nimmt den Identifier unter dem
> Cursor, loest das Symbol auf und springt zu dessen Deklaration.
> "Find All References" macht dasselbe rueckwaerts: Finde alle
> Identifier die auf dasselbe Symbol zeigen. Angular's Language
> Service nutzt die gleiche API fuer Template-Autocompletition.

---

## Praxis: Ungenutzte Exports finden

```typescript annotated
import * as ts from "typescript";

function findUnusedExports(program: ts.Program): string[] {
  const checker = program.getTypeChecker();
  const unused: string[] = [];

  for (const sourceFile of program.getSourceFiles()) {
    // Ueberspringe node_modules und .d.ts:
    if (sourceFile.isDeclarationFile) continue;
    if (sourceFile.fileName.includes("node_modules")) continue;

    ts.forEachChild(sourceFile, node => {
      // Finde exportierte Deklarationen:
      const modifiers = ts.getModifiers(node);
      const isExported = modifiers?.some(
        m => m.kind === ts.SyntaxKind.ExportKeyword
      );
      if (!isExported) return;

      // Hole das Symbol:
      let name: string | undefined;
      if (ts.isFunctionDeclaration(node) && node.name) name = node.name.text;
      if (ts.isClassDeclaration(node) && node.name) name = node.name.text;
      if (ts.isVariableStatement(node)) {
        for (const decl of node.declarationList.declarations) {
          if (ts.isIdentifier(decl.name)) name = decl.name.text;
        }
      }

      if (!name) return;

      // Pruefe ob das Symbol in anderen Dateien importiert wird:
      // (vereinfacht — vollstaendige Implementierung braeuchte Symbol-References)
      const symbol = checker.getSymbolAtLocation(
        (node as any).name || (node as any).declarationList?.declarations[0]?.name
      );
      // In der Praxis: checker.findReferences() oder eigene Import-Analyse
      if (symbol) {
        unused.push(`${sourceFile.fileName}: ${name}`);
      }
    });
  }

  return unused;
}
```

> 💭 **Denkfrage:** Der Type Checker ist die teuerste Komponente des
> Compilers in Bezug auf Laufzeit. Warum solltest du `createProgram`
> nur einmal aufrufen und den Checker wiederverwenden — statt fuer
> jede Analyse ein neues Programm zu erstellen?
>
> **Antwort:** `createProgram` parst alle Dateien und berechnet alle
> Typen. Das kann bei grossen Projekten Sekunden dauern. Der Checker
> cached Ergebnisse intern. Ein zweiter Aufruf von `getTypeAtLocation`
> fuer dieselbe Node ist fast kostenlos. Fuer Watch-Mode gibt es
> `ts.createWatchProgram` das nur geaenderte Dateien neu prueft.

---

## Experiment: Typ-Report-Generator

Baue ein Tool das fuer jede exportierte Funktion den vollstaendigen
Typ-Report ausgibt:

```typescript
import * as ts from "typescript";

function generateTypeReport(fileName: string): void {
  const program = ts.createProgram([fileName], { strict: true });
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(fileName)!;

  ts.forEachChild(sourceFile, node => {
    if (ts.isFunctionDeclaration(node) && node.name) {
      const signature = checker.getSignatureFromDeclaration(node);
      if (!signature) return;

      const returnType = checker.getReturnTypeOfSignature(signature);
      const params = signature.getParameters();

      console.log(`function ${node.name.text}(`);
      for (const param of params) {
        const paramType = checker.getTypeOfSymbolAtLocation(param, node);
        console.log(`  ${param.getName()}: ${checker.typeToString(paramType)}`);
      }
      console.log(`): ${checker.typeToString(returnType)}`);
    }
  });

  // Experiment: Erweitere den Report um auch Klassen und ihre
  // Methoden auszugeben. Nutze ts.isClassDeclaration und
  // iteriere ueber node.members.
}
```

---

## Was du gelernt hast

- **getTypeAtLocation** gibt den aufgeloesten Typ eines Ausdrucks zurueck — nach Inferenz und Narrowing
- **getSymbolAtLocation** loest einen Namen auf seine Deklaration auf — die Basis fuer "Go to Definition"
- **Type-Objekte** haben Methoden wie `isUnion()`, `getProperties()`, `isTypeAssignableTo()`
- Der Type Checker ist die **teuerste** Komponente — einmal erstellen, oft wiederverwenden
- VS Code, ESLint und Angular nutzen die gleiche API fuer Typ-basierte Features

> 🧠 **Erklaere dir selbst:** Was passiert wenn du `getTypeAtLocation`
> auf einen `if`-Block innerhalb einer Funktion anwendest, in dem
> Type Narrowing stattfindet? Beruecksichtigt der Typ das Narrowing?
> **Kernpunkte:** Ja! Der Type Checker beruecksichtigt den Kontrollfluss |
> Innerhalb von `if (typeof x === "string")` gibt getTypeAtLocation
> fuer x den Typ `string` zurueck, nicht `string | number` |
> Das ist die gleiche Analyse die VS Code fuer Hover-Tooltips nutzt

**Kernkonzept zum Merken:** Node = "wo steht es im Code?", Symbol = "was bedeutet dieser Name?", Type = "welchen Typ hat es?". Diese drei bilden das Rueckgrat jeder Compiler-API-Analyse.

---

> **Pausenpunkt** — Type Checker verstanden. Jetzt kommt die
> Koenigsklasse: AST-Transformation mit Custom Transformers.
>
> Weiter geht es mit: [Sektion 04: Custom Transformers](./04-custom-transformers.md)
