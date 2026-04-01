# Sektion 1: Was sind rekursive Typen?

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: -- (Start)
> Naechste Sektion: [02 - Baumstrukturen typen](./02-baumstrukturen-typen.md)

---

## Was du hier lernst

- Was **selbstreferenzierende Typ-Definitionen** sind und warum TypeScript sie erlaubt
- Wie du **LinkedList** und **Tree** als rekursive Typen modellierst
- Warum jeder rekursive Typ eine **Abbruchbedingung** braucht
- Den Unterschied zwischen **Rekursion und Iteration** auf Type-Level

---

## Rekursion: Die aelteste Idee der Informatik

Bevor wir die erste Zeile TypeScript schreiben, muessen wir verstehen,
woher die Idee der Rekursion kommt — denn sie ist aelter als jeder
Computer.

> **Hintergrund: Alonzo Church und das Lambda-Kalkuel (1930er)**
>
> In den 1930er Jahren — noch bevor es elektronische Computer gab —
> entwickelte der Mathematiker **Alonzo Church** das Lambda-Kalkuel.
> Es war ein formales System, in dem Funktionen sich selbst aufrufen
> konnten. Sein Schueler **Stephen Kleene** bewies, dass rekursive
> Funktionen genau dieselbe Berechnungsstaerke haben wie Alan Turings
> Turingmaschine. Das war ein Meilenstein: Rekursion ist nicht nur
> ein Programmiertrick — sie ist eine **fundamentale Berechnungsform**.
>
> Die bekannteste rekursive Definition ist wohl die Fibonacci-Folge:
>
> ```
> fib(0) = 0            ← Abbruchbedingung (Base Case)
> fib(1) = 1            ← Abbruchbedingung (Base Case)
> fib(n) = fib(n-1) + fib(n-2)  ← Selbstreferenz
> ```
>
> Genau diese Struktur — **Selbstreferenz plus Abbruchbedingung** —
> finden wir in TypeScript's rekursiven Typen wieder.

---

## Dein erster rekursiver Typ: LinkedList

Eine verkettete Liste ist die einfachste rekursive Datenstruktur:
Jeder Knoten verweist auf den naechsten Knoten — der denselben Typ hat.

```typescript annotated
type LinkedList<T> = {
  value: T;
  // ^ Der aktuelle Wert in diesem Knoten
  next: LinkedList<T> | null;
  // ^ HIER ist die Rekursion: next hat denselben Typ LinkedList<T>
  // ^ | null ist die ABBRUCHBEDINGUNG — das Ende der Liste
};

// Erstelle eine Liste: 1 -> 2 -> 3 -> null
const list: LinkedList<number> = {
  value: 1,
  // ^ Erster Knoten
  next: {
    value: 2,
    // ^ Zweiter Knoten
    next: {
      value: 3,
      // ^ Dritter Knoten
      next: null,
      // ^ ENDE — die Abbruchbedingung
    },
  },
};
```

Das ist die gesamte Magie: Ein Typ, der **sich selbst referenziert**,
mit einer **Bedingung fuer das Ende** (hier: `| null`).

---

## Erklaere dir selbst: Warum funktioniert das?

> **Erklaere dir selbst:**
>
> Warum ist `type LinkedList<T> = { value: T; next: LinkedList<T> | null }`
> ein rekursiver Typ? Was genau ist die Abbruchbedingung, und warum wuerde
> der Typ ohne sie nicht funktionieren?
>
> *Nimm dir 30 Sekunden. Formuliere die Antwort in eigenen Worten.*

Die Antwort: Der Typ referenziert **sich selbst** in seiner eigenen
Definition (`next: LinkedList<T>`). Das `| null` ist die Abbruchbedingung —
ohne sie gaebe es keine Moeglichkeit, die Kette zu beenden, und TypeScript
wuerde einen "infinite type" melden.

---

## Baeume: Die naechste Stufe

Ein Baum ist wie eine Liste, aber jeder Knoten kann **mehrere Kinder**
haben statt nur eines "next":

```typescript annotated
type TreeNode<T> = {
  value: T;
  // ^ Der Wert dieses Knotens
  children: TreeNode<T>[];
  // ^ REKURSION: Ein Array von Knoten desselben Typs
  // ^ Die Abbruchbedingung ist ein leeres Array: []
};

// Ein Dateibaum:
const fileTree: TreeNode<string> = {
  value: "src",
  children: [
    {
      value: "components",
      children: [
        { value: "Button.tsx", children: [] },
        // ^ Blatt-Knoten: children ist leer
        { value: "Modal.tsx", children: [] },
      ],
    },
    {
      value: "utils",
      children: [
        { value: "format.ts", children: [] },
      ],
    },
  ],
};
```

Beachte den Unterschied zur LinkedList:
- **LinkedList:** `next: LinkedList<T> | null` — **ein** Nachfolger oder Ende
- **TreeNode:** `children: TreeNode<T>[]` — **beliebig viele** Nachfolger, Ende = `[]`

---

## Denkfrage: Was passiert ohne Abbruchbedingung?

> **Denkfrage:**
>
> Was passiert, wenn du die Abbruchbedingung weglaesst?
>
> ```typescript
> type Infinite<T> = {
>   value: T;
>   next: Infinite<T>;  // Kein | null!
> };
> ```
>
> Kann TypeScript diesen Typ ueberhaupt verarbeiten?
> Und: Koenntest du jemals ein Objekt dieses Typs erstellen?

Ueberraschung: TypeScript **akzeptiert** diesen Typ! Typen werden
**lazy** (faul) ausgewertet — der Compiler entfaltet den Typ erst,
wenn du ihn verwendest. Aber du kannst **niemals ein endliches Objekt**
dieses Typs erstellen, weil jedes `next` wieder ein Objekt braucht.
Es ist wie ein Spiegel, der in einen Spiegel schaut — unendlich, aber
in der Praxis nutzlos.

```typescript
// TypeScript akzeptiert die Typ-Definition...
type Infinite<T> = { value: T; next: Infinite<T> };

// ...aber du kannst kein Objekt erstellen:
// const x: Infinite<number> = { value: 1, next: ??? };
//                                         ^ braucht wieder Infinite<number>!
```

---

## Rekursion vs Iteration auf Type-Level

In JavaScript kennst du den Unterschied: Eine `while`-Schleife (iterativ)
vs eine Funktion die sich selbst aufruft (rekursiv). Auf Type-Level gibt
es diese Unterscheidung auch:

```typescript annotated
// REKURSIV: Ein Typ referenziert sich selbst
type Countdown<N extends number, Acc extends unknown[] = []> =
  Acc["length"] extends N
    ? Acc
    // ^ Abbruchbedingung: wenn Acc so lang wie N ist, fertig
    : Countdown<N, [...Acc, unknown]>;
    // ^ Selbstreferenz: ruft sich mit groesserem Acc erneut auf

// ITERATIV (Mapped Types): Transformiert Schluessel-fuer-Schluessel
type MakeOptional<T> = {
  [K in keyof T]?: T[K];
  // ^ Kein Selbstverweis — iteriert ueber die Schluessel
};
```

Die Faustregel: **Mapped Types** sind iterativ (sie loopen ueber Schluessel),
**Conditional Types mit Selbstreferenz** sind rekursiv.

---

## Experiment: Baue deine eigene LinkedList

> **Experiment:**
>
> Oeffne eine TypeScript-Datei und probiere folgendes:
>
> ```typescript
> // 1. Definiere den LinkedList-Typ
> type LinkedList<T> = {
>   value: T;
>   next: LinkedList<T> | null;
> };
>
> // 2. Erstelle eine Liste mit 3 Elementen
> const zahlen: LinkedList<number> = {
>   value: 10,
>   next: {
>     value: 20,
>     next: {
>       value: 30,
>       next: null,
>     },
>   },
> };
>
> // 3. Schreibe eine Funktion die alle Werte sammelt
> function toArray<T>(list: LinkedList<T>): T[] {
>   const result: T[] = [];
>   let current: LinkedList<T> | null = list;
>   while (current !== null) {
>     result.push(current.value);
>     current = current.next;
>   }
>   return result;
> }
>
> console.log(toArray(zahlen)); // [10, 20, 30]
> ```
>
> Beobachte: Die **Typ-Definition** ist rekursiv, aber die
> **Traversierung** kann iterativ sein (while-Schleife).

---

## Binaerer Suchbaum: Ein klassisches Beispiel

Ein binaerer Suchbaum hat exakt **zwei** moegliche Kinder — links
(kleiner) und rechts (groesser):

```typescript annotated
type BST<T> = {
  value: T;
  left: BST<T> | null;
  // ^ Linkes Kind: Werte die KLEINER sind
  right: BST<T> | null;
  // ^ Rechtes Kind: Werte die GROESSER sind
} | null;
// ^ Der gesamte Baum kann null sein (leerer Baum)

// Beispiel:    5
//            /   \
//           3     7
//          / \   / \
//        null 4 6  null

const baum: BST<number> = {
  value: 5,
  left: {
    value: 3,
    left: null,
    right: { value: 4, left: null, right: null },
  },
  right: {
    value: 7,
    left: { value: 6, left: null, right: null },
    right: null,
  },
};
```

---

## Framework-Bezug: Rekursion in Angular und React

> **In deinem Angular-Projekt** hast du wahrscheinlich schon
> rekursive Strukturen verwendet, ohne es so zu nennen:
>
> ```typescript
> // Angular: Rekursive Menue-Struktur
> interface MenuItem {
>   label: string;
>   route?: string;
>   children?: MenuItem[];  // ← Rekursion!
> }
>
> // Das Template rendert sich selbst rekursiv:
> // <ng-container *ngFor="let item of items">
> //   <app-menu-item [item]="item"></app-menu-item>
> //   <!-- app-menu-item rendert seine children wiederum als app-menu-item -->
> // </ng-container>
> ```
>
> **In React** ist das Pattern genauso haeufig:
>
> ```tsx
> // React: Rekursive Kommentar-Komponente
> interface Comment {
>   id: number;
>   text: string;
>   replies: Comment[];  // ← Rekursion!
> }
>
> function CommentThread({ comment }: { comment: Comment }) {
>   return (
>     <div>
>       <p>{comment.text}</p>
>       {comment.replies.map(reply => (
>         <CommentThread key={reply.id} comment={reply} />
>         // ← Komponente rendert SICH SELBST fuer replies
>       ))}
>     </div>
>   );
> }
> ```
>
> Die Typen (`MenuItem`, `Comment`) sind rekursiv — und die Komponenten
> folgen derselben rekursiven Struktur.

---

## Wann sind Typen NICHT rekursiv?

Nicht alles was verschachtelt aussieht ist rekursiv. Hier die Abgrenzung:

```typescript
// NICHT rekursiv — verschachtelt, aber kein Selbstverweis:
type Address = {
  street: string;
  city: string;
  country: { name: string; code: string };
};

// NICHT rekursiv — generisch, aber kein Selbstverweis:
type Wrapper<T> = { value: T };

// REKURSIV — referenziert sich selbst:
type NestedList<T> = T | NestedList<T>[];
//                       ^^^^^^^^^ Selbstverweis!

// REKURSIV — indirekte Rekursion (A → B → A):
type Expression = NumberLiteral | BinaryExpression;
type NumberLiteral = { type: "number"; value: number };
type BinaryExpression = {
  type: "binary";
  left: Expression;   // ← Zurueck zu Expression
  right: Expression;  // ← Zurueck zu Expression
  op: "+" | "-" | "*" | "/";
};
```

**Merke:** Ein Typ ist rekursiv, wenn er — direkt oder indirekt —
auf sich selbst verweist.

---

## Zusammenfassung

### Was du gelernt hast

Du hast die **Grundlagen rekursiver Typen** verstanden:

- Ein rekursiver Typ **referenziert sich selbst** in seiner Definition
- Jeder rekursive Typ braucht eine **Abbruchbedingung** (`| null`, `[]`, etc.)
- TypeScript wertet Typen **lazy** aus — deshalb funktioniert Selbstreferenz
- **LinkedList**, **Tree** und **BST** sind die klassischen Beispiele
- **Mapped Types** sind iterativ, **Conditional Types mit Selbstreferenz** sind rekursiv

> **Kernkonzept:** Ein rekursiver Typ ist ein Typ, der sich selbst
> referenziert, mit einer Abbruchbedingung die das Ende markiert.
> Die Abbruchbedingung ist der entscheidende Unterschied zwischen
> einem nuetzlichen Typ und einer Endlosschleife.

---

> **Pausenpunkt** — Du hast die Grundlagen gemeistert! In der naechsten
> Sektion typisieren wir reale Baumstrukturen: JSON, DOM, ASTs und
> verschachtelte Menues.
>
> Weiter: [Sektion 02 - Baumstrukturen typen](./02-baumstrukturen-typen.md)
