# Cheatsheet: Classes & OOP in TypeScript

Schnellreferenz fuer Lektion 21.

---

## Klassen-Syntax

```typescript
class User {
  name: string;                   // Feld-Deklaration (Pflicht in TS)
  readonly id: number;            // Unveraenderlich nach Init

  constructor(name: string, id: number) {
    this.name = name;
    this.id = id;
  }

  greet(): string {               // Methode
    return `Hi, ${this.name}`;
  }
}
```

---

## Parameter Properties (Kurzschreibweise)

```typescript
// LANG:
class User {
  public name: string;
  private email: string;
  readonly id: number;
  constructor(name: string, email: string, id: number) {
    this.name = name; this.email = email; this.id = id;
  }
}

// KURZ (identisch):
class User {
  constructor(
    public name: string,
    private email: string,
    readonly id: number
  ) {}
}
```

**Regel:** Modifier vor dem Parameter = automatische Feld-Deklaration + Zuweisung.

---

## Access Modifiers

| Modifier | Klasse | Subklasse | Aussen | Laufzeit? |
|---|---|---|---|---|
| `public` (default) | Ja | Ja | Ja | — |
| `private` | Ja | Nein | Nein | **Entfernt** (Type Erasure) |
| `protected` | Ja | Ja | Nein | **Entfernt** |
| `readonly` | Init | Lesen | Lesen | — |
| `#private` (ES2022) | Ja | Nein | Nein | **Erhalten** (echte Kapselung) |

### private vs #private

```typescript
class A {
  private tsPrivate = "zugaenglich mit (a as any).tsPrivate";
  #jsPrivate = "NICHT zugaenglich, auch nicht mit as any";
}
```

---

## Vererbung (extends + super)

```typescript
class Animal {
  constructor(public name: string) {}
  speak(): string { return "..."; }
}

class Dog extends Animal {
  constructor(name: string, public breed: string) {
    super(name);    // MUSS erste Anweisung sein!
  }
  override speak(): string { return "Wuff!"; }
}
```

**super()** → Eltern-Constructor aufrufen
**super.method()** → Eltern-Methode aufrufen
**override** → Bewusstes Ueberschreiben (TS 4.3+, empfohlen mit `noImplicitOverride`)

---

## Abstract Classes

```typescript
abstract class Shape {
  abstract area(): number;           // Kein Body — Subklasse MUSS implementieren
  describe(): string {                // Konkreter Code — wird vererbt
    return `Flaeche: ${this.area()}`;
  }
}

class Circle extends Shape {
  constructor(private r: number) { super(); }
  override area(): number { return Math.PI * this.r ** 2; }
}

// new Shape();  // FEHLER: Cannot create instance of abstract class
new Circle(5);   // OK
```

---

## implements (Interface-Vertrag)

```typescript
interface Serializable { serialize(): string; }
interface Loggable { log(msg: string): void; }

class User implements Serializable, Loggable {
  serialize(): string { return JSON.stringify(this); }
  log(msg: string): void { console.log(msg); }
}
```

**Wichtig:** `implements` erbt KEINEN Code! Nur Strukturpruefung.

---

## Static Members

```typescript
class MathUtils {
  static PI = 3.14159;
  static add(a: number, b: number): number { return a + b; }
}

MathUtils.PI;          // Zugriff ohne 'new'
MathUtils.add(2, 3);   // 5
```

**this in static:** Verweist auf die KLASSE, nicht auf eine Instanz.

---

## Getter / Setter

```typescript
class Temp {
  private _celsius: number;
  constructor(c: number) { this._celsius = c; }

  get celsius(): number { return this._celsius; }
  set celsius(v: number) {
    if (v < -273.15) throw new Error("Zu kalt!");
    this._celsius = v;
  }
  get fahrenheit(): number { return this._celsius * 9/5 + 32; }
}
```

---

## Singleton-Pattern

```typescript
class Config {
  private static instance: Config | null = null;
  private constructor(public readonly apiUrl: string) {}

  static getInstance(): Config {
    if (!Config.instance) Config.instance = new Config("https://...");
    return Config.instance;
  }
}
```

---

## Factory-Pattern

```typescript
class Color {
  private constructor(public r: number, public g: number, public b: number) {}
  static fromHex(hex: string): Color { /* parse + new */ }
  static fromRGB(r: number, g: number, b: number): Color { return new Color(r, g, b); }
}
```

---

## this-Binding: Drei Loesungen

```typescript
class Timer {
  seconds = 0;

  // Problem: Methode verliert this als Callback
  tick(): void { this.seconds++; }

  // Loesung 1: Arrow-Field (Kopie pro Instanz)
  tickSafe = (): void => { this.seconds++; };

  // Loesung 2: bind() im Constructor
  constructor() { this.tick = this.tick.bind(this); }

  // Loesung 3: Arrow-Wrapper bei Uebergabe
  start(): void { setInterval(() => this.tick(), 1000); }
}
```

---

## Mixins

```typescript
type Constructor<T = {}> = new (...args: any[]) => T;

function WithTimestamp<T extends Constructor>(Base: T) {
  return class extends Base {
    createdAt = new Date();
  };
}

const TimestampedUser = WithTimestamp(User);
```

---

## Klasse vs Interface vs Abstract Class

| Feature | Interface | Abstract Class | Klasse |
|---|---|---|---|
| Code enthalten | Nein | **Ja** (abstrakt + konkret) | Ja |
| Instanziierbar | Nein | Nein | **Ja** |
| Mehrere moeglich | **Ja** (implements A, B) | Nein (extends 1) | Nein |
| Laufzeit-Existenz | Nein (Type Erasure) | **Ja** | **Ja** |
| instanceof | Nein | **Ja** | **Ja** |
| Access Modifiers | Nein | **Ja** | **Ja** |

---

## Entscheidungshilfe

| Situation | Empfehlung |
|---|---|
| Nur Struktur/Vertrag | Interface |
| Gemeinsamer Code + erzwungene Methoden | Abstract Class |
| Fertige, instanziierbare Klasse | Klasse |
| Mehrere Quellen fuer Code | Mixins oder Composition |
| Framework (Angular) | Klassen mit Dekoratoren |
| Kein this-Problem noetig | Funktionen / Closures |
