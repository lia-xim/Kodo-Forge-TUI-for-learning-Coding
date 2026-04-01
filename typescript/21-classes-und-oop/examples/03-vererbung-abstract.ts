/**
 * Lektion 21 — Beispiel 03: Vererbung & Abstract Classes
 *
 * Ausfuehren: npx tsx examples/03-vererbung-abstract.ts
 */

// ═══ 1. Einfache Vererbung ═══

class Animal {
  constructor(public name: string) {}

  move(distance: number): void {
    console.log(`${this.name} bewegt sich ${distance}m`);
  }

  speak(): string {
    return "...";
  }
}

class Dog extends Animal {
  constructor(name: string, public breed: string) {
    super(name);                     // MUSS erste Anweisung sein!
  }

  override speak(): string {
    return "Wuff!";
  }

  fetch(): string {
    return `${this.name} bringt den Ball zurueck!`;
  }
}

const dog = new Dog("Rex", "Schaeferhund");
dog.move(10);                        // "Rex bewegt sich 10m" (geerbt)
console.log(dog.speak());           // "Wuff!" (ueberschrieben)
console.log(dog.fetch());           // "Rex bringt den Ball zurueck!"

// ═══ 2. Method Overriding mit super ═══

class Logger {
  log(message: string): void {
    console.log(`[LOG] ${message}`);
  }
}

class TimestampLogger extends Logger {
  override log(message: string): void {
    const time = new Date().toISOString().slice(11, 19);
    super.log(`${time} — ${message}`);
  }
}

const logger = new TimestampLogger();
logger.log("Server gestartet");

// ═══ 3. Abstract Classes ═══

abstract class Shape {
  constructor(public name: string) {}

  abstract area(): number;           // MUSS von Subklasse implementiert werden

  describe(): string {               // Konkrete Methode — wird vererbt
    return `${this.name}: Flaeche = ${this.area().toFixed(2)}`;
  }
}

class Circle extends Shape {
  constructor(public radius: number) {
    super("Kreis");
  }

  override area(): number {
    return Math.PI * this.radius ** 2;
  }
}

class Rectangle extends Shape {
  constructor(public width: number, public height: number) {
    super("Rechteck");
  }

  override area(): number {
    return this.width * this.height;
  }
}

// const shape = new Shape("test"); // FEHLER: Cannot create instance of abstract class

const shapes: Shape[] = [
  new Circle(5),
  new Rectangle(4, 6),
];

shapes.forEach(s => {
  console.log(s.describe());        // Polymorphie: RICHTIGE area() wird aufgerufen
});
// Kreis: Flaeche = 78.54
// Rechteck: Flaeche = 24.00

// ═══ 4. Template Method Pattern ═══

abstract class DataProcessor {
  // Template Method: Definiert den Algorithmus
  process(data: string[]): string[] {
    const validated = this.validate(data);
    const transformed = this.transform(validated);
    return this.format(transformed);
  }

  protected validate(data: string[]): string[] {
    return data.filter(d => d.length > 0);    // Default: Leere entfernen
  }

  abstract transform(data: string[]): string[];

  protected format(data: string[]): string[] {
    return data;                              // Default: Keine Formatierung
  }
}

class UpperCaseProcessor extends DataProcessor {
  override transform(data: string[]): string[] {
    return data.map(d => d.toUpperCase());
  }
}

const processor = new UpperCaseProcessor();
console.log(processor.process(["hello", "", "world"]));
// ["HELLO", "WORLD"]

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt ---");
