# Sektion 2: Das infer-Keyword — Typen aus Typen herausloesen

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Die extends-Bedingung](./01-extends-bedingung.md)
> Naechste Sektion: [03 - Distributive Conditional Types](./03-distributive-types.md)

---

## Was du hier lernst

- Was `infer` bedeutet und welches Problem es loest
- Wie man mit `infer` Return Types, Parameter und Array-Elemente extrahiert
- Die wichtigsten eingebauten Utility Types (`ReturnType`, `Parameters`, `Awaited`) — und wie sie intern funktionieren
- Mehrere `infer`-Variablen in einem einzigen Pattern

---

## Das Problem: Typen die im Dunkeln liegen

Stell dir vor, du bekommst eine Funktion von aussen — aus einer Bibliothek, einem anderen Team, einem automatisch generierten Code. Du weisst, was die Funktion tut, aber du kennst ihren Rueckgabetyp nicht auswendig. Du moechtest diesen Rueckgabetyp in deinem Code wiederverwenden — ohne die Bibliothek zu importieren oder den Typ manuell nachzubauen.

```typescript
// Eine Funktion aus einer Bibliothek — den Return-Typ kennst du nicht auswendig:
function createSession(userId: string, role: "admin" | "user") {
  return {
    id: Math.random().toString(36),
    userId,
    role,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 3600_000),
  };
}

// Du willst: type Session = ???
// Du koenntest den Typ manuell abschreiben, aber das ist fehleranfaellig.
// Wenn die Funktion sich aendert, muss der Typ auch angepasst werden.
```

Die elegante Loesung: Sage TypeScript, es soll selbst herausfinden, was der Rueckgabetyp ist. Genau dafuer gibt es `infer`.

---

## Hintergrund: Die Entstehung von infer

`infer` wurde zusammen mit Conditional Types in TypeScript 2.8 eingefuehrt. Das Team stand vor einem Designproblem: Conditional Types erlauben es zu fragen "Ist T ein Array?" — aber wie kommt man an den **Element-Typ des Arrays**, ohne ihn explizit angeben zu muessen?

Die urspruengliche Idee war, auf den rechten Seiten der Conditional Types Typ-Variablen binden zu koennen. Das Schluuesselwort `infer` (englisch: "schlussfolgern", "ableiten") drueckt aus, was TypeScript tut: Es **schliesst den Typ** aus dem Kontext.

Der Name war tatsaechlich umstritten. Alternativen wie `bind`, `capture` oder `let` wurden diskutiert. `infer` gewann, weil es am deutlichsten beschreibt, was passiert: Der Compiler leitet (inferiert) den Typ ab.

Ohne `infer` haette es `ReturnType<T>`, `Parameters<T>`, `Awaited<T>` nicht gegeben — oder sie haetten auf Hacks mit `any` basieren muessen.

---

## Die Grundidee: infer als Platzhalter

```typescript annotated
type UnpackArray<T> = T extends (infer U)[]
//                                     ^
//                              infer U: "Wenn T ein Array von IRGENDWAS ist,
//                              nenne dieses IRGENDWAS U"
  ? U      // Gib U zurueck (den Element-Typ)
  : T;     // T ist kein Array: gib T direkt zurueck

type A = UnpackArray<string[]>;    // string  — U wurde als string inferiert
type B = UnpackArray<number[]>;    // number  — U wurde als number inferiert
type C = UnpackArray<boolean[][]>; // boolean[] — nur eine Ebene entpackt
type D = UnpackArray<string>;      // string  — kein Array, Else-Ast
```

Denke an `infer U` als einen "Platzhalter-Namen": TypeScript fuellt ihn aus, sobald es den Pattern gematcht hat. U ist kein Typ den du vorgibst — es ist ein Typ den TypeScript **entdeckt**.

---

## Annotierter Code: infer in verschiedenen Positionen

```typescript annotated
// 1. Return Type extrahieren (so ist ReturnType<T> implementiert):
type MyReturnType<T> =
  T extends (...args: any[]) => infer R
  //        ^^^^^^^^^^^^^^^^^^^^^^^^^^
  //        Pattern: "Jede Funktion die irgendetwas zurueckgibt"
  //                                                      ^
  //                                              infer R: der Rueckgabetyp
  ? R       // Gib den Rueckgabetyp zurueck
  : never;  // T ist keine Funktion

type A = MyReturnType<() => string>;           // string
type B = MyReturnType<(x: number) => boolean>; // boolean
type C = MyReturnType<string>;                 // never

// 2. Parameter extrahieren (so ist Parameters<T> implementiert):
type MyParameters<T> =
  T extends (...args: infer P) => any
  //                       ^
  //              infer P: alle Parameter als Tuple
  ? P
  : never;

type D = MyParameters<(a: string, b: number) => void>; // [a: string, b: number]
type E = MyParameters<() => void>;                     // []

// 3. Promise-Inhalt extrahieren:
type UnpackPromise<T> =
  T extends Promise<infer U>
  //                      ^
  //              infer U: der Typ innerhalb des Promise
  ? U
  : T;

type F = UnpackPromise<Promise<string>>; // string
type G = UnpackPromise<Promise<number>>; // number
type H = UnpackPromise<string>;          // string (kein Promise, Else-Ast)
```

---

## Die eingebauten Utility Types — unter der Haube

TypeScript liefert mehrere Utility Types die mit `infer` gebaut sind. Du hast sie vielleicht schon benutzt, ohne zu wissen, wie sie funktionieren:

```typescript annotated
// ReturnType<T> — aus der TypeScript Standardbibliothek:
type ReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : any;
//                                    ^^^
//                           infer R: der Rueckgabetyp wird "eingefangen"

// Parameters<T> — aus der TypeScript Standardbibliothek:
type Parameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never;
//                           ^
//              infer P: die Parameter-Tuple wird "eingefangen"

// Awaited<T> — etwas vereinfacht (TS 4.5, korrekte Version ist rekursiv):
type Awaited<T> =
  T extends null | undefined ? T :           // null/undefined durchlassen
  T extends object & { then(onfulfilled: infer F, ...args: infer _): any }
  //                                                        ^
  //                                  infer F: der Callback-Typ des then()-Methode
    ? F extends ((value: infer V, ...args: infer _) => any)
      ? Awaited<V>   // Rekursiv: der aufgeloeste Wert
      : never
    : T;             // Kein Thenable: direkt zurueckgeben
```

Das echte `Awaited<T>` ist komplexer als `T extends Promise<infer U> ? U : T`, weil es nicht nur echte Promises entpackt, sondern alle **Thenables** (Objekte mit einer `then`-Methode) — das ist die Definition eines Promise-kompatiblen Objekts in JavaScript.

---

## Mehrere infer in einem Pattern

Du kannst in einem einzigen Conditional Type mehrere `infer`-Variablen verwenden:

```typescript annotated
// Alle drei Teile einer Funktion auf einmal extrahieren:
type FunctionSignature<T> =
  T extends (a: infer A, b: infer B) => infer R
  //                  ^            ^          ^
  //              Erster Param   Zweiter   Return
  ? {
      firstParam: A;
      secondParam: B;
      returnType: R;
    }
  : never;

function login(username: string, password: string): { token: string; userId: number } {
  return { token: "abc", userId: 1 };
}

type Sig = FunctionSignature<typeof login>;
// {
//   firstParam: string;
//   secondParam: string;
//   returnType: { token: string; userId: number };
// }
```

Das ist besonders nützlich wenn du Typ-Metadaten aus Funktionen extrahieren willst — zum Beispiel um automatisch generierte Wrappers oder Proxy-Typen zu bauen.

---

## Experiment: Eigenen ReturnType bauen

> **Experiment:** Probiere folgendes im TypeScript Playground aus:
>
> ```typescript
> // Baue deinen eigenen ReturnType:
> type MeinReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
>
> function berechne(x: number, y: number): { summe: number; produkt: number } {
>   return { summe: x + y, produkt: x * y };
> }
>
> type Ergebnis = MeinReturnType<typeof berechne>;
> // Fahre mit der Maus ueber Ergebnis — was siehst du?
>
> // Jetzt aendere die Funktion:
> function berechneString(x: number): string {
>   return x.toString();
> }
>
> type ErgebniString = MeinReturnType<typeof berechneString>;
> // Was aendert sich?
>
> // Bonus: Was passiert wenn du keine Funktion uebergibst?
> type ErgebnisKeineFunktion = MeinReturnType<string>;
> ```
>
> Aendere die Funktion und beobachte, wie der Typ automatisch mitaendert. Das ist der Kernvorteil von `infer`: Typen bleiben synchron mit dem Code, ohne manuelles Nachziehen.

---

## Erklaere dir selbst

> **Erklaere dir selbst:** Warum gibt `UnpackPromise<string>` `string` zurueck (nicht `never`), obwohl `string` kein Promise ist?
> **Kernpunkte:** Im Else-Ast (`T extends Promise<infer U> ? U : T`) wird T selbst zurueckgegeben | Das ist eine Design-Entscheidung: "Wenn kein Promise, Pass-Through" | Alternativ haette man never zurueckgeben koennen — aber Pass-Through ist fuer viele Use Cases nuetzlicher (z.B. in rekursiven Typen)

---

## In React: Component-Props automatisch extrahieren

```typescript annotated
// React-Komponente — Props-Typ unbekannt oder aus Bibliothek:
import type { ComponentProps, ComponentType } from "react";

// ComponentProps<T> ist mit infer gebaut:
// type ComponentProps<T> = T extends ComponentType<infer P> ? P : never;

// So nutzt du es in der Praxis:
import { DatePicker } from "some-ui-library"; // Props-Typ nicht exportiert

type DatePickerProps = ComponentProps<typeof DatePicker>;
// TypeScript inferiert die Props automatisch — kein manuelles Nachbauen!

// Eigenes Wrapper-Interface das die Props erweitert:
type MyDatePickerProps = DatePickerProps & {
  onDateChange: (iso: string) => void;
  label: string;
};
```

Das ist ein Pattern das in grossen React-Projekten haeufig vorkommt: Du wrappst eine Drittanbieter-Komponente und willst ihre Props erweitern, ohne den Typ manuell zu kopieren.

---

## Denkfrage

> **Denkfrage:** `ReturnType<T>` nutzt `infer R` um den Rueckgabetyp zu erfassen. Warum braucht man dafuer `infer`? Koennte man nicht einfach schreiben: `type ReturnType<T extends () => any> = ???`?
>
> **Antwort:** Ohne `infer` gaebe es keine Moeglichkeit, den Rueckgabetyp zu **benennen** und dann zurueckzugeben. Man koennte pruefen ob T eine Funktion ist — aber um den Rueckgabetyp zu extrahieren, braucht man einen Mechanismus der sagt "capture diesen Teil des Patterns und gib ihm einen Namen". Genau das ist `infer`. Ohne `infer` haette man keine Moeglichkeit, Teile eines komplexen Typs herauszuloesen — man koennte nur pruefen, ob ein Typ zu einem Pattern passt, aber nichts aus ihm extrahieren.

---

## Was du gelernt hast

- `infer U` deklariert eine **Typ-Variable im Pattern** eines Conditional Types — TypeScript fuellt sie aus
- `infer` funktioniert in jeder Position: Return-Typ, Parameter, Array-Elemente, Promise-Inhalt, und mehr
- Die wichtigsten eingebauten Utility Types (`ReturnType`, `Parameters`, `Awaited`) sind alle mit `infer` gebaut
- Mehrere `infer`-Variablen in einem Pattern sind moeglich
- `infer` macht Typen **wartungsfreundlich**: Sie bleiben synchron mit dem Code

**Kernkonzept:** `infer` ist der Mechanismus um Typen aus anderen Typen "herauszuschaelen". Wo `extends` prueft, **entdeckt** `infer`. Zusammen ermoeglichen sie Typ-Transformationen die sonst nicht moeglich waeren.

---

## Kurz-Referenz: Haeufige infer-Patterns

| Was du extrahieren willst | Pattern |
|---------------------------|---------|
| Rueckgabetyp einer Funktion | `T extends (...args: any) => infer R ? R : never` |
| Alle Parameter als Tuple | `T extends (...args: infer P) => any ? P : never` |
| Promise-Inhalt | `T extends Promise<infer U> ? U : T` |
| Array-Element-Typ | `T extends (infer U)[] ? U : never` |
| Erstes Tuple-Element | `T extends [infer F, ...any[]] ? F : never` |

Diese Patterns bilden die Basis der TypeScript-Standardbibliothek. Wenn du sie verstehst, kannst du jeden `ReturnType` und jedes `Parameters` nachbauen — und eigene Varianten schreiben.

---

> **Pausenpunkt** — Du hast jetzt zwei der drei zentralen Konzepte: die `extends`-Bedingung und `infer`. Das dritte Konzept — Distribution ueber Unions — ist konzeptuell ueberraschend und aendert alles.
>
> Weiter geht es mit: [Sektion 03: Distributive Conditional Types](./03-distributive-types.md)
