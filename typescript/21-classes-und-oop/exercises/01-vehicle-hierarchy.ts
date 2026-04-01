/**
 * Lektion 21 — Exercise 01: Vehicle Hierarchy
 *
 * Erstelle eine Fahrzeug-Hierarchie mit Vererbung.
 *
 * Ausfuehren: npx tsx exercises/01-vehicle-hierarchy.ts
 * Hinweise:   hints.json → "exercises/01-vehicle-hierarchy.ts"
 */

// ═══ Aufgabe 1: Basisklasse Vehicle ═══
// Erstelle eine Klasse 'Vehicle' mit:
// - name: string (public)
// - speed: number (protected, Default 0)
// - maxSpeed: number (readonly)
// - accelerate(amount: number): void — erhoeht speed (max bis maxSpeed)
// - brake(amount: number): void — verringert speed (min 0)
// - describe(): string — gibt Name und Speed zurueck

// TODO: class Vehicle { ... }

// ═══ Aufgabe 2: Subklassen ═══
// Erstelle drei Subklassen:
// - Car: hat 'doors: number', ueberschreibt describe()
// - Truck: hat 'payload: number' (Ladungsgewicht), ueberschreibt describe()
// - Motorcycle: hat 'hasSidecar: boolean', ueberschreibt describe()
// Alle nutzen super() und 'override'

// TODO: class Car extends Vehicle { ... }
// TODO: class Truck extends Vehicle { ... }
// TODO: class Motorcycle extends Vehicle { ... }

// ═══ Aufgabe 3: Polymorphie testen ═══
// Erstelle ein Array von Vehicles und rufe describe() auf jedem auf.

// TODO:
// const vehicles: Vehicle[] = [
//   new Car("BMW", 250, 4),
//   new Truck("MAN", 120, 15000),
//   new Motorcycle("Ducati", 200, false),
// ];
// vehicles.forEach(v => console.log(v.describe()));

// ═══ Tests (nicht aendern) ═══
function testVehicles(): void {
  // Kommentiere die Tests ein, wenn du die Klassen erstellt hast:
  // const car = new Car("BMW", 250, 4);
  // car.accelerate(100);
  // console.assert(car.describe().includes("BMW"), "Car describe fehlgeschlagen");

  // const truck = new Truck("MAN", 120, 15000);
  // truck.accelerate(200); // Soll auf maxSpeed begrenzt sein
  // console.assert(truck.describe().includes("MAN"), "Truck describe fehlgeschlagen");

  console.log("Exercise 01: Erstelle die Klassen und kommentiere die Tests ein!");
}

testVehicles();
