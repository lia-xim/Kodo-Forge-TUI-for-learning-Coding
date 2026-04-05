# Sektion 1: Warum Inference existiert

**Geschaetzte Lesezeit:** ~10 Minuten

## Was du hier lernst

- Was Type Inference ueberhaupt ist und welches Problem sie loest
- Warum TypeScript sich fuer "teilweise Inference" entschieden hat -- und was die Alternative waere
- Die Geschichte hinter Hindley-Milner und wie TypeScript davon abweicht
- Das Kernprinzip, das dein gesamtes Annotations-Verhalten leiten wird

---

## Denkfragen fuer diese Sektion

Halte diese Fragen im Hinterkopf, waehrend du liest. Am Ende der Sektion solltest du sie beantworten koennen:

1. **Warum ist Inference nicht weniger sicher als eine explizite Annotation?**
2. **Welches Problem wuerde entstehen, wenn TypeScript Parameter automatisch aus Aufrufstellen inferieren wuerde?**

---

## Das Problem ohne Inference

Stell dir vor, TypeScript haette **keine** Inference. Jede einzelne Variable, jedes Zwischenergebnis, jeder Callback-Parameter muesste annotiert werden:

```typescript
// Welt OHNE Inference (hypothetisch)
const name: string = "Matthias";
const items: number[] = [1, 2, 3];
const doubled: number[] = items.map((n: number): number => n * 2);
const result: number = doubled.reduce(
  (acc: number, curr: number): number => acc + curr,
  0 as number
);
```

Vergleiche mit dem echten TypeScript:

```typescript
// Welt MIT Inference (Realitaet)
const name = "Matthias";
const items = [1, 2, 3];
const doubled = items.map(n => n * 2);
const result = doubled.reduce((acc, curr) => acc + curr, 0);
```

Beide Varianten sind **exakt gleich sicher**. TypeScript kennt in beiden Faellen jeden Typ. Aber die zweite Version ist lesbar, wartbar und laesst dich auf die Logik fokussieren statt auf Typ-Dekorationen.

> **Merke**: Inference ist kein "weniger sicher". Der Compiler nutzt intern denselben Typ, egal ob du ihn hingeschrieben hast oder nicht. `let x = 5` ist genauso strikt `number` wie `let x: number = 5`.

> 🧠 **Erklaere dir selbst:** Warum ist `const name = "Matthias"` genauso sicher wie `const name: string = "Matthias"` -- und in einem wichtigen Punkt sogar besser?
> **Kernpunkte:**
> - Der Compiler kennt in beiden Faellen den Typ `string` intern
> - Ohne Annotation inferiert TS sogar den praeziseren Literal-Typ `"Matthias"` (nicht nur `string`)
> - Inference und explizite Annotation erzeugen denselben Compile-Zeit-Schutz
> - Annotation ist nur Dokumentation fuer den menschlichen Leser -- TypeScript braucht sie nicht

---

## Die Analogie: Inference als Detektiv

Stell dir den TypeScript-Compiler als **Detektiv** vor. Er kommt an einen Tatort (deinen Code) und sammelt Hinweise:

- **Hinweis 1 (Wert):** Du schreibst `const x = 42` -- der Detektiv sieht eine Zahl. Schlussfolgerung: `number`.
- **Hinweis 2 (Kontext):** Du uebergibst eine Funktion an `array.map()` -- der Detektiv weiss, was `.map()` erwartet. Schlussfolgerung: Der Parameter hat den Element-Typ des Arrays.
- **Hinweis 3 (Logik):** Du schreibst `if (typeof x === "string")` -- der Detektiv weiss: Ab hier ist `x` ein `string`.

Eine **Annotation** hingegen ist wie ein **Namensschild**: Du sagst dem Detektiv direkt "Das ist ein string". Er muss nicht mehr ermitteln -- aber er prueft trotzdem, ob das Namensschild zur Realitaet passt.

```
Inference  = Detektiv, der aus Hinweisen schliesst
Annotation = Namensschild, das du selbst anbringst
```

---

## Die Geschichte hinter Type Inference

> **Hintergrund:** Type Inference ist keine TypeScript-Erfindung. Die theoretische Grundlage stammt aus den 1970ern: der **Hindley-Milner-Algorithmus** (benannt nach Roger Hindley und Robin Milner). Dieser Algorithmus kann in funktionalen Sprachen wie Haskell oder ML den Typ **jedes einzelnen Ausdruck** automatisch ableiten -- ohne eine einzige Annotation.

### Haskell vs. TypeScript: Zwei Philosophien

In Haskell kannst du tatsaechlich ein ganzes Programm ohne Typ-Annotationen schreiben:

```haskell
-- Haskell: Keine einzige Annotation, trotzdem vollstaendig typsicher
map (\x -> x * 2) [1, 2, 3]
filter (\x -> length x > 3) ["hello", "hi", "world"]
```

TypeScript hat sich **bewusst dagegen entschieden**, so weit zu gehen. Warum?

**Der Grund heisst: Lesbarkeit schlaegt Bequemlichkeit.**

JavaScript-Codebases werden von vielen Entwicklern gelesen und geaendert. Wenn Parameter-Typen automatisch aus Aufrufstellen inferiert wuerden, muesste jeder Leser den gesamten Aufrufgraph im Kopf haben, um zu verstehen, was eine Funktion akzeptiert. Das macht Code **schreibbar**, aber **nicht lesbar**.

> **Fun Fact:** Haskell-Entwickler schreiben trotz perfekter Inference freiwillig Typ-Signaturen ueber ihre Funktionen -- weil es die Lesbarkeit verbessert. TypeScript hat diesen Pragmatismus direkt in die Sprache eingebaut: Parameter **muessen** annotiert werden.

### Was TypeScript von Hindley-Milner uebernommen hat

TypeScript nutzt eine **vereinfachte, lokale** Variante von Type Inference:

| Aspekt | Hindley-Milner (Haskell) | TypeScript |
|--------|--------------------------|------------|
| **Scope** | Global (gesamtes Programm) | Lokal (einzelne Ausdruecke/Funktionen) |
| **Parameter** | Werden inferiert | Muessen annotiert werden |
| **Return Types** | Werden inferiert | Werden inferiert (Annotation empfohlen bei Exports) |
| **Generics** | Vollstaendige Unifikation | Begrenzte Inference aus Argumenten |
| **Philosophie** | Maximale Kompaktheit | Lesbarkeit an Grenzen, Kompaktheit innen |

Die Kurzversion: TypeScript inferiert **innerhalb** von Funktionen, verlangt aber **an den Grenzen** (Parametern) explizite Typen. Dieses Prinzip heisst **"Annotate at boundaries, infer inside"** -- und es wird dich durch diese gesamte Lektion begleiten.

---

## Warum Parameter nicht inferiert werden koennen

Das ist kein technisches Limit, sondern eine **bewusste Design-Entscheidung**. TypeScript koennte theoretisch schauen, wie eine Funktion aufgerufen wird, und daraus die Parameter-Typen ableiten. Aber drei Gruende sprechen dagegen:

### 1. Aufrufstellen koennen sich aendern

```typescript
// Heute: process wird nur mit Strings aufgerufen
process("hello");
process("world");

// Naechste Woche: Jemand fuegt hinzu
process(42);  // Ploetzlich aendert sich der Parameter-Typ!
```

Wenn der Parameter-Typ von den Aufrufstellen abhaengt, ist er **instabil**. Jeder neue Aufrufer aendert den Vertrag der Funktion -- das Gegenteil von zuverlaessiger Typisierung.

### 2. Zirkulaere Abhaengigkeiten

```typescript
function a(x) { return b(x); }
function b(y) { return a(y); }
// Welcher Typ zuerst? Endlosschleife!
```

### 3. Parameter sind Vertraege, keine Beobachtungen

Eine Funktions-Signatur dokumentiert die **Intention** des Autors, nicht die aktuelle Nutzung. Der Parameter-Typ sagt: "Ich bin so entworfen, dass ich X akzeptiere" -- unabhaengig davon, ob bisher jemand Y uebergeben hat.

> **Denkfrage:** Du schreibst `function process(data)` und rufst sie nur mit Strings auf. Soll der Parameter automatisch `string` sein? Was passiert, wenn naechste Woche jemand sie mit einer Zahl aufruft?

---

## Das Kernprinzip dieser Lektion

```
  +---------------------------------------------------------+
  |        Funktions-Grenze                                 |
  |  +---------------------------------------------------+  |
  |  |   params: ANNOTIERT  ------------------>          |  |
  |  |                                                   |  |
  |  |   lokale vars:     inferiert                      |  |
  |  |   callbacks:       inferiert (Contextual Typing)  |  |
  |  |   zwischenwerte:   inferiert                      |  |
  |  |                                                   |  |
  |  |   <------------------  return: ANNOTIERT          |  |
  |  |                        (bei Exports)              |  |
  |  +---------------------------------------------------+  |
  |                                                         |
  |  Externe Daten (API, JSON, etc): ANNOTIERT              |
  +---------------------------------------------------------+
```

**An den Grenzen annotieren, innen inferieren lassen.** Das ist die Kurzformel, die alle weiteren Sektionen konkretisieren werden.

```typescript annotated
// Das Prinzip "annotate at boundaries, infer inside" in der Praxis:
// (Order und Summary wuerden in einer separaten Datei definiert)

interface Order { price: number; name: string; }
interface Summary { total: number; count: number; labels: string[]; }

function processOrders(orders: Order[], taxRate: number): Summary {
// ^ Parameter: IMMER annotieren -------^              ^-- und Return-Typ
  const total = orders.reduce((sum, o) => sum + o.price, 0);
  // ^ Lokale Variable: NICHT annotieren -- TS inferiert `number`

  const withTax = total * (1 + taxRate);
  // ^ Zwischenergebnis: NICHT annotieren -- TS inferiert `number`

  const labels = orders.map(o => o.name);
  // ^ Callback-Parameter 'o': NICHT annotieren (Contextual Typing)
  // ^ 'labels': NICHT annotieren -- TS inferiert `string[]`

  return { total: withTax, count: orders.length, labels };
  // ^ Return: TS prueft, ob das Objekt dem Return-Typ `Summary` entspricht
}
```

---

## In deinem Angular-Projekt: Wo du dieses Prinzip jeden Tag siehst

Angular-Services demonstrieren das Prinzip perfekt:

```typescript
@Injectable({ providedIn: 'root' })
export class ProductService {
  // Grenze: Konstruktor-Parameter annotiert (Dependency Injection benoetigt das)
  constructor(private http: HttpClient) {}

  // Grenze: Return-Typ annotiert -- der Konsument soll wissen, was er bekommt
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('/api/products').pipe(
      // Innen: Callback-Parameter 'products' -- NICHT annotieren!
      // Angular's HttpClient + RxJS kennen den Typ (Contextual Typing)
      map(products => products.filter(p => p.active)),
      // 'p' ist automatisch Product -- keine Annotation noetig
    );
  }
}
```

Der `HttpClient`-Generic `<Product[]>` ist die Grenze: Hier sagst du TypeScript, welcher Typ aus der API kommen soll. Alles danach in der `.pipe()`-Kette inferiert TS automatisch.

---

## Experiment-Box: Probiere es selbst aus

> **Experiment:** Probiere folgendes im TypeScript Playground aus (typescriptlang.org/play):
>
> ```typescript
> // Schritt 1: const vs. let -- hovere ueber die Variablen
> const x = 42;       // Was ist der Typ?
> let y = 42;         // Was ist der Typ?
>
> // Schritt 2: Funktionen mit Parametern
> const fn = (a: number, b: number) => a + b;
> // Hovere ueber 'fn' -- welchen Return-Typ inferiert TS automatisch?
>
> // Schritt 3: Entferne die Parameter-Annotationen
> const fn2 = (a, b) => a + b;
> // Was passiert jetzt? Warum?
>
> // Schritt 4: Inference innerhalb der Funktion
> function calculate(price: number, tax: number) {
>   const total = price + tax;       // Kein Typ noetig -- TS inferiert
>   const label = `Gesamt: ${total}`; // Auch inferiert
>   return { total, label };          // Return-Typ wird inferiert
> }
> // Hovere ueber 'calculate' -- was ist der Return-Typ?
> ```
>
> Diese vier Schritte demonstrieren das Kernprinzip: An den Grenzen (Parameter) musst du annotieren, innen (lokale Variablen, Returns) inferiert TS automatisch.

---

## Rubber-Duck-Prompt

Erklaere einem imaginaeren Kollegen in 2-3 Saetzen:
- Was ist der Unterschied zwischen Inference und Annotation?
- Warum inferiert TypeScript Parameter absichtlich NICHT?

Wenn du das nicht frei erklaeren kannst, lies den Abschnitt "Warum Parameter nicht inferiert werden koennen" nochmal.

---

## Was du gelernt hast

- **Type Inference** bedeutet: Der Compiler leitet den Typ aus dem Kontext ab, ohne dass du ihn hinschreiben musst
- Inference ist **genauso sicher** wie explizite Annotationen -- der interne Typ ist identisch
- TypeScript nutzt eine **lokale, vereinfachte** Form der Hindley-Milner Inference
- Parameter werden **absichtlich nicht** inferiert -- sie sind Vertraege, keine Beobachtungen
- Das Leitprinzip heisst: **"Annotate at boundaries, infer inside"**

---

**Pausenpunkt.** Wenn du bereit bist, geht es weiter mit [Sektion 2: Explizite Annotationen](./02-explizite-annotationen.md) -- dort lernst du die gesamte Annotations-Syntax und wann genau du sie einsetzen solltest.
