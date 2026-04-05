# Sektion 2: typeof Guards

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Was ist Narrowing?](./01-was-ist-narrowing.md)
> Naechste Sektion: [03 - instanceof und in](./03-instanceof-und-in.md)

---

## Was du hier lernst

- Wie der `typeof`-Operator als Type Guard funktioniert
- Welche Typen typeof erkennt: string, number, boolean, object, function, undefined, symbol, bigint
- Der beruechtigte Fallstrick: `typeof null === "object"`
- Wann typeof funktioniert und wann du etwas anderes brauchst

---

## typeof als Narrowing-Werkzeug

Du kennst `typeof` aus JavaScript — es gibt einen String zurueck, der den
Laufzeit-Typ eines Werts beschreibt. TypeScript nutzt diesen Operator
als **Narrowing-Mechanismus**:

```typescript annotated
function beschreibe(wert: string | number | boolean) {
  if (typeof wert === "string") {
    // ^ typeof-Check: TypeScript narrowt wert zu string
    return `Text: "${wert}"`;
    // ^ wert ist hier string — alle String-Methoden verfuegbar
  }
  if (typeof wert === "number") {
    return `Zahl: ${wert.toFixed(2)}`;
    // ^ wert ist hier number — toFixed() ist verfuegbar
  }
  // TypeScript schlussfolgert: boolean ist uebrig
  return `Boolean: ${wert}`;
  // ^ wert ist hier boolean
}
```

### Alle typeof-Ergebnisse

Der `typeof`-Operator kann genau **acht verschiedene Strings** zurueckgeben:

| typeof-Ergebnis | Narrowt zu | Beispielwerte |
|---|---|---|
| `"string"` | `string` | `"hallo"`, `""`, `` `template` `` |
| `"number"` | `number` | `42`, `3.14`, `NaN`, `Infinity` |
| `"boolean"` | `boolean` | `true`, `false` |
| `"undefined"` | `undefined` | `undefined` |
| `"object"` | `object \| null` | `{}`, `[]`, `null` (!) |
| `"function"` | `Function` | `() => {}`, `function() {}` |
| `"symbol"` | `symbol` | `Symbol("id")` |
| `"bigint"` | `bigint` | `42n`, `BigInt(100)` |

> 💭 **Denkfrage:** Warum gibt es kein `typeof x === "null"` und kein
> `typeof x === "array"`? Wie pruefst du stattdessen auf null und Arrays?
>
> **Antwort:** `typeof null` gibt `"object"` zurueck (historischer Bug).
> Arrays sind in JavaScript Objekte, daher `typeof [] === "object"`.
> Fuer null: `x === null`. Fuer Arrays: `Array.isArray(x)`.

---

## Die typeof-null-Falle

Das ist der wichtigste Fallstrick bei typeof — und er betrifft dich direkt
beim Narrowing:

```typescript annotated
function verarbeite(wert: string | object | null) {
  if (typeof wert === "object") {
    // ACHTUNG! wert ist hier: object | null
    // ^ typeof null gibt "object" zurueck!
    // wert.toString();  // GEFAHR: null.toString() crasht!
  }
}
```

TypeScript **weiss** ueber diesen Bug und beruecksichtigt ihn. Nach
`typeof x === "object"` ist der Typ `object | null`, nicht nur `object`.
Du musst null separat ausschliessen:

```typescript annotated
function verarbeiteSicher(wert: string | object | null) {
  if (typeof wert === "object") {
    // wert: object | null
    if (wert !== null) {
      // wert: object — jetzt sicher!
      console.log(Object.keys(wert));
    }
  }
}

// Oder eleganter: null zuerst ausschliessen
function verarbeiteBesser(wert: string | object | null) {
  if (wert === null) return;
  // wert: string | object  (null weg)

  if (typeof wert === "object") {
    // wert: object — null ist schon weg!
    console.log(Object.keys(wert));
  }
}
```

> 📖 **Hintergrund: Warum typeof null === "object"?**
>
> In der allerersten JavaScript-Implementierung (1995, Brendan Eich bei
> Netscape) wurden Werte intern als Typ-Tag + Daten gespeichert. Das
> Typ-Tag fuer Objekte war 0. `null` wurde als NULL-Pointer dargestellt
> — mit dem Typ-Tag 0. Daher gab `typeof null` den Wert `"object"`
> zurueck. Diesen Bug zu beheben haette existierenden Code gebrochen,
> also blieb er fuer immer. Ein TC39-Vorschlag (typeof null === "null")
> wurde 2006 eingereicht und 2013 abgelehnt.

---

## typeof in verschiedenen Kontexten

### typeof im switch-Statement

```typescript annotated
function formatiere(wert: string | number | boolean | undefined) {
  switch (typeof wert) {
    case "string":
      // wert: string
      return wert.toUpperCase();
    case "number":
      // wert: number
      return wert.toFixed(2);
    case "boolean":
      // wert: boolean
      return wert ? "Ja" : "Nein";
    case "undefined":
      // wert: undefined
      return "(leer)";
  }
}
```

### typeof mit logischen Operatoren

```typescript annotated
function laenge(wert: string | null | undefined): number {
  // typeof funktioniert auch in &&-Ketten:
  if (typeof wert === "string" && wert.length > 0) {
    // ^ wert ist hier string UND hat Laenge > 0
    return wert.length;
  }
  return 0;
}
```

### typeof mit Negation

```typescript annotated
function nichtString(wert: string | number) {
  if (typeof wert !== "string") {
    // ^ Negation! wert ist hier number
    return wert * 2;
  }
  // wert ist hier string
  return wert.toUpperCase();
}
```

---

## Grenzen von typeof

typeof funktioniert nur fuer **primitive Typen** und `function`. Fuer
komplexere Unterscheidungen brauchst du andere Werkzeuge:

```typescript
// typeof kann NICHT unterscheiden zwischen:
typeof {} === "object"        // true
typeof [] === "object"        // true  (Arrays sind Objekte!)
typeof null === "object"      // true  (Bug!)
typeof new Date() === "object" // true  (alles Objekte)
typeof /regex/ === "object"   // true  (auch Objekte)

// Dafuer brauchst du:
Array.isArray([])             // true — fuer Arrays
x === null                    // fuer null
x instanceof Date             // fuer Klasse-Instanzen (Sektion 03)
"prop" in x                   // fuer Property-Checks (Sektion 03)
```

> **Experiment:** Probiere folgendes im TypeScript Playground aus:
> ```typescript
> function sicher(wert: string | object | null) {
>   if (wert === null) {
>     console.log("null erkannt");
>     return;
>   }
>   // wert: string | object — null ist weg!
>   if (typeof wert === "object") {
>     console.log(`Objekt mit Schluesseln: ${Object.keys(wert).join(", ")}`);
>   } else {
>     console.log(`String: "${wert}"`);
>   }
> }
> ```
> Kommentiere den null-Check aus (`if (wert === null) return;`) und beobachte, welche Fehler TypeScript bei `typeof wert === "object"` meldet. Fuege dann `undefined` zum Union-Typ hinzu.

---

## typeof und unknown

`typeof` ist das **primaere Werkzeug** um `unknown`-Werte zu narrowen:

```typescript annotated
function sicherVerarbeiten(daten: unknown): string {
  if (typeof daten === "string") {
    // daten: string
    return daten.toUpperCase();
  }
  if (typeof daten === "number") {
    // daten: number
    return daten.toString();
  }
  if (typeof daten === "boolean") {
    // daten: boolean
    return daten ? "wahr" : "falsch";
  }
  // daten: unknown — immer noch unbekannt
  return String(daten);
}
```

> 🧠 **Erklaere dir selbst:** Warum bleibt der Typ im letzten `return`
> immer noch `unknown` und wird nicht zu `never`? Was muesste passieren,
> damit er `never` wird?
> **Kernpunkte:** unknown umfasst ALLE Typen | Wir haben nur 3 geprueft |
> Es gibt noch object, null, undefined, symbol, bigint, function |
> Erst wenn ALLE Moeglichkeiten eliminiert sind, wird es never

---

## Was du gelernt hast

- `typeof` ist das grundlegendste Narrowing-Werkzeug fuer primitive Typen
- Es gibt genau 8 moegliche typeof-Ergebnisse (string, number, boolean, undefined, object, function, symbol, bigint)
- `typeof null === "object"` ist ein historischer Bug — TypeScript beruecksichtigt ihn
- typeof funktioniert in if, switch, logischen Operatoren und mit Negation
- typeof kann nicht zwischen verschiedenen Objekttypen unterscheiden (dafuer: instanceof, in)

**Kernkonzept zum Merken:** typeof ist wie ein grobes Sieb — es trennt
primitive Typen zuverlaessig, aber fuer feinere Unterscheidungen
(welches Objekt? welches Interface?) brauchst du andere Werkzeuge.

---

> **Pausenpunkt** -- typeof ist dein taegliches Brot. In der naechsten
> Sektion lernst du instanceof und in — die Werkzeuge fuer Objekt-Narrowing.
>
> Weiter geht es mit: [Sektion 03: instanceof und in](./03-instanceof-und-in.md)
