/**
 * Lektion 21 — Loesung 01: Vehicle Hierarchy
 */

// ═══ Aufgabe 1: Basisklasse Vehicle ═══

class Vehicle {
  protected speed: number = 0;

  constructor(
    public name: string,
    public readonly maxSpeed: number
  ) {}

  accelerate(amount: number): void {
    this.speed = Math.min(this.speed + amount, this.maxSpeed);
  }

  brake(amount: number): void {
    this.speed = Math.max(this.speed - amount, 0);
  }

  describe(): string {
    return `${this.name}: ${this.speed}/${this.maxSpeed} km/h`;
  }
}

// ═══ Aufgabe 2: Subklassen ═══

class Car extends Vehicle {
  constructor(
    name: string,
    maxSpeed: number,
    public doors: number
  ) {
    super(name, maxSpeed);
  }

  override describe(): string {
    return `${super.describe()} (${this.doors}-Tuerer)`;
  }
}

class Truck extends Vehicle {
  constructor(
    name: string,
    maxSpeed: number,
    public payload: number
  ) {
    super(name, maxSpeed);
  }

  override describe(): string {
    return `${super.describe()} (Nutzlast: ${this.payload}kg)`;
  }
}

class Motorcycle extends Vehicle {
  constructor(
    name: string,
    maxSpeed: number,
    public hasSidecar: boolean
  ) {
    super(name, maxSpeed);
  }

  override describe(): string {
    const sidecar = this.hasSidecar ? "mit Beiwagen" : "ohne Beiwagen";
    return `${super.describe()} (${sidecar})`;
  }
}

// ═══ Aufgabe 3: Polymorphie ═══

const vehicles: Vehicle[] = [
  new Car("BMW", 250, 4),
  new Truck("MAN", 120, 15000),
  new Motorcycle("Ducati", 200, false),
];

vehicles.forEach(v => {
  v.accelerate(80);
  console.log(v.describe());
});

// ═══ Tests ═══

const car = new Car("BMW", 250, 4);
car.accelerate(100);
console.assert(car.describe().includes("BMW"), "Car describe fehlgeschlagen");

const truck = new Truck("MAN", 120, 15000);
truck.accelerate(200);
console.assert(truck.describe().includes("120"), "Truck should be clamped to maxSpeed");

console.log("\n--- Loesung 01 erfolgreich ---");
