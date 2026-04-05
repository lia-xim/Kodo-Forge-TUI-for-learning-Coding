# Sektion 2: Die Strict-Mode-Familie

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - tsconfig-Grundstruktur](./01-tsconfig-grundstruktur.md)
> Naechste Sektion: [03 - Module Resolution](./03-module-resolution.md)

---

## Was du hier lernst

- Was `strict: true` wirklich aktiviert (es sind 11 einzelne Flags!)
- Warum `strictNullChecks` das wichtigste einzelne Flag ist
- Wie `strictFunctionTypes` Varianz erzwingt (Bezug zu L22!)
- Welche Strict-Flags oft uebersehen werden

---

## Das `strict`-Flag: Ein Buendel, kein einzelnes Flag

Wenn du `"strict": true` setzt, aktivierst du nicht ein einzelnes
Verhalten — du aktivierst **11 einzelne Flags gleichzeitig**. Das ist
wie ein "Alles anschalten"-Schalter fuer Typsicherheit.

```typescript annotated
{
  "compilerOptions": {
    "strict": true
    // ^ Aktiviert ALLE folgenden 11 Flags auf einmal:
    // strictNullChecks, strictFunctionTypes, strictBindCallApply,
    // strictPropertyInitialization, noImplicitAny, noImplicitThis,
    // alwaysStrict, useUnknownInCatchVariables,
    // exactOptionalPropertyTypes, noImplicitOverride,
    // strictBuiltinIteratorReturn (ab TS 5.6)
  }
}
```

> 📖 **Hintergrund: Warum ein Buendel statt einzelner Flags?**
>
> Als TypeScript 2.3 (2017) den `strict`-Mode einfuehrte, hatte das
> Team ein Dilemma: Neue Strict-Checks sollten hinzugefuegt werden
> koennen, ohne bestehenden Code zu brechen. Die Loesung: `strict`
> ist ein Meta-Flag. Mit jedem TypeScript-Release koennen neue
> Checks darunter gebuendelt werden. Wer `strict: true` setzt,
> bekommt automatisch die neuesten Sicherheitschecks — und muss
> nicht jedes einzelne Flag kennen.
>
> Das bedeutet aber auch: **Ein TypeScript-Update kann deinen Code
> brechen**, wenn ein neues Strict-Flag Fehler findet, die vorher
> nicht geprueft wurden. Das ist gewollt — es ist der Preis fuer
> maximale Sicherheit.

---

## Die 11 Flags im Detail

### 1. `strictNullChecks` — Das wichtigste Flag

Ohne `strictNullChecks` ist jeder Typ automatisch auch `null` und
`undefined`. Das bedeutet: TypeScript prueft NICHT, ob ein Wert
existiert, bevor du ihn verwendest.

```typescript annotated
// OHNE strictNullChecks:
function getLength(s: string): number {
  return s.length;
  // ^ KEIN Fehler! Obwohl s null sein koennte
}
getLength(null); // Kompiliert! Runtime: TypeError: Cannot read property 'length' of null

// MIT strictNullChecks:
function getLength(s: string): number {
  return s.length; // OK — string ist GARANTIERT nicht null
}
getLength(null);
// ^ Fehler! Argument of type 'null' is not assignable to parameter of type 'string'
```

Tony Hoare, der Erfinder der Null-Referenz, nannte sie seinen
"Billion Dollar Mistake". `strictNullChecks` ist TypeScripts Antwort
darauf — es macht `null` und `undefined` zu expliziten Typen, die
du bewusst handhaben musst.

> 💭 **Denkfrage:** Warum ist `strictNullChecks` nicht einfach
> der Standard in TypeScript? Warum muss man es aktivieren?
>
> **Antwort:** Abwaertskompatibilitaet. Als TypeScript eingefuehrt wurde,
> hatten Millionen Zeilen JavaScript-Code keine Null-Pruefungen.
> Ein Pflicht-Check haette Migration unmoeglich gemacht. Deshalb
> ist es opt-in (ueber strict oder einzeln).

### 2. `strictFunctionTypes` — Varianz erzwingen

Dieses Flag erzwingt **kontravariante Parameter-Typen** bei
Funktionstypen. Erinnerst du dich an L22 (Advanced Generics)?
Dort hast du Kovarianz und Kontravarianz gelernt.

```typescript annotated
type Handler = (event: MouseEvent) => void;

// OHNE strictFunctionTypes:
const handler: Handler = (event: Event) => {};
// ^ Erlaubt! Event ist Supertyp von MouseEvent — das ist unsicher
// Weil handler vielleicht auf MouseEvent-spezifische Properties zugreift

// MIT strictFunctionTypes:
const handler: Handler = (event: Event) => {};
// ^ Fehler! Type '(event: Event) => void' is not assignable to type 'Handler'
// Parameter-Typen sind kontravariant — Supertyp geht NICHT
```

> 🧠 **Erklaere dir selbst:** Warum ist es unsicher, wenn eine
> Funktion, die `MouseEvent` erwartet, nur `Event` akzeptiert?
> Denke an einen konkreten Fall: Was passiert, wenn die Funktion
> `event.clientX` aufruft?
> **Kernpunkte:** MouseEvent hat clientX/clientY | Event hat das nicht |
> Funktion mit Event-Parameter koennte MouseEvent-Properties verlieren |
> kontravariante Parameter verhindern das

### 3. `noImplicitAny` — Kein verstecktes any

Ohne dieses Flag darf TypeScript Typen als `any` inferieren, wenn
es den Typ nicht herausfinden kann. Mit dem Flag muss der Typ
explizit angegeben werden.

```typescript annotated
// OHNE noImplicitAny:
function add(a, b) {
// ^ a und b sind implizit "any" — kein Fehler
  return a + b;
}

// MIT noImplicitAny:
function add(a, b) {
// ^ Fehler! Parameter 'a' implicitly has an 'any' type
  return a + b;
}
// Fix:
function add(a: number, b: number): number {
  return a + b;
}
```

### 4. `strictPropertyInitialization` — Klassen-Properties

Erzwingt, dass jede Klassen-Property entweder im Konstruktor
initialisiert wird oder als optional markiert ist.

```typescript annotated
class User {
  name: string;
  // ^ Fehler! Property 'name' has no initializer and is not definitely assigned
  age?: number;
  // ^ OK — optional (undefiniert erlaubt)

  constructor(name: string) {
    this.name = name;
    // ^ Jetzt OK — im Konstruktor initialisiert
  }
}
```

Das kennst du aus L21 (Classes & OOP). Der `!`-Operator
(Definite Assignment Assertion) umgeht den Check:
`name!: string;` — aber verwende ihn nur wenn du WEISST, dass die
Property woanders gesetzt wird (z.B. durch ein Framework wie Angular).

> ⚡ **Praxis-Tipp:** In Angular-Komponenten siehst du oft `@Input()`
> Properties mit dem `!`-Operator:
> ```typescript
> @Input() title!: string;
> ```
> Angular setzt die Property nach der Konstruktion — TypeScript kann
> das nicht wissen. Der `!`-Operator sagt: "Vertrau mir, Angular
> kuemmert sich darum." Ab Angular 16 mit `required: true` gibt es
> eine bessere Alternative:
> ```typescript
> title = input.required<string>();
> ```

### 5. `useUnknownInCatchVariables` — Sichere catch-Bloecke

Seit TypeScript 4.4 kann dieses Flag den Typ von `catch`-Variablen
von `any` zu `unknown` aendern:

```typescript annotated
try {
  riskyOperation();
} catch (error) {
  // OHNE useUnknownInCatchVariables:
  // error ist "any" — du kannst alles damit machen (unsicher!)
  console.log(error.message); // Kein Fehler, aber was wenn error kein Error ist?

  // MIT useUnknownInCatchVariables:
  // error ist "unknown" — du MUSST pruefen
  if (error instanceof Error) {
    console.log(error.message); // Jetzt sicher!
  }
}
```

Das passt perfekt zu L25 (Type-safe Error Handling) — dort hast du
gelernt, warum `throw` beliebige Werte werfen kann, nicht nur `Error`.

### 6-11: Die weiteren Flags

| Flag | Bewirkt |
|------|---------|
| `strictBindCallApply` | Prueft Typen bei `.bind()`, `.call()`, `.apply()` |
| `noImplicitThis` | Verbietet implizites `any` fuer `this` |
| `alwaysStrict` | Fuegt `"use strict"` in jede Ausgabe-Datei ein |
| `exactOptionalPropertyTypes` | `age?: number` erlaubt NICHT `age: undefined` — nur Weglassen |
| `noImplicitOverride` | `override` Keyword pflicht bei Method-Override in Klassen |
| `strictBuiltinIteratorReturn` | Prueft Iterator-Return-Typen (ab TS 5.6) |

> 🔬 **Experiment:** Hier ist ein Code-Snippet. Ueberlege, welche
> Strict-Flags jeweils den Fehler finden wuerden:
>
> ```typescript
> // Fall 1:
> function greet(name) { console.log("Hallo " + name); }
> // → noImplicitAny (Parameter ohne Typ)
>
> // Fall 2:
> class Dog { name: string; }
> // → strictPropertyInitialization (nicht im Konstruktor gesetzt)
>
> // Fall 3:
> function len(s: string | null) { return s.length; }
> // → strictNullChecks (s koennte null sein)
>
> // Fall 4:
> try { throw "ups"; } catch(e) { console.log(e.message); }
> // → useUnknownInCatchVariables (e ist unknown, nicht any)
> ```

---

## Strict-Flags einzeln ueberschreiben

Du kannst `strict: true` setzen und einzelne Flags wieder
deaktivieren. Das ist nuetzlich bei Migrationen:

```typescript annotated
{
  "compilerOptions": {
    "strict": true,
    // ^ Alles an...
    "strictPropertyInitialization": false
    // ^ ...ausser dieses eine Flag (weil Legacy-Code)
  }
}
```

**Empfehlung:** Starte IMMER mit `strict: true`. Deaktiviere einzelne
Flags nur temporaer waehrend einer Migration. Jedes deaktivierte Flag
ist eine potenzielle Fehlerquelle.

> ⚡ **Praxis-Tipp:** In React-Projekten mit `create-react-app` oder
> Vite ist `strict: true` der Default. In aelteren Angular-Projekten
> (vor Angular 12) war `strict` nicht der Default — pruefe deine
> bestehenden Projekte! Seit Angular 12 generiert `ng new` eine
> tsconfig mit `strict: true`.

---

## Was du gelernt hast

- `strict: true` aktiviert 11 einzelne Flags gleichzeitig
- `strictNullChecks` ist das wichtigste einzelne Flag — es macht null/undefined zu expliziten Typen
- `strictFunctionTypes` erzwingt kontravariante Parameter (Bezug zu Varianz aus L22)
- `useUnknownInCatchVariables` macht catch-Variablen sicher (Bezug zu Error Handling aus L25)
- Du kannst `strict: true` setzen und einzelne Flags temporaer deaktivieren

> 🧠 **Erklaere dir selbst:** Ein Kollege sagt: "Ich setze
> `strict: false`, weil TypeScript sonst zu viele Fehler meldet."
> Warum ist das ein Fehlschluss? Was waeren die Konsequenzen?
> **Kernpunkte:** Die Fehler existieren — strict macht sie nur sichtbar |
> Ohne strict: Laufzeit-Crashes statt Compile-Fehler | "Weniger
> Fehler sehen" ist nicht "weniger Fehler haben" | strict = fruehe
> Fehlererkennung

**Kernkonzept zum Merken:** `strict: true` ist kein "nice to have" — es
ist die Grundlage professioneller TypeScript-Entwicklung. Jedes Flag
darin hat einen konkreten Sicherheitsgewinn.

---

> **Pausenpunkt** -- Du kennst jetzt die Strict-Familie. Als Naechstes
> schauen wir uns an, wie TypeScript Module findet.
>
> Weiter geht es mit: [Sektion 03: Module Resolution](./03-module-resolution.md)
