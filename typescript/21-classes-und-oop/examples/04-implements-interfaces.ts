/**
 * Lektion 21 — Beispiel 04: Interfaces implementieren
 *
 * Ausfuehren: npx tsx examples/04-implements-interfaces.ts
 */

// ═══ 1. implements — Der Vertrag ═══

interface Serializable {
  serialize(): string;
}

interface Loggable {
  log(level: string): void;
}

class User implements Serializable, Loggable {
  constructor(public name: string, public email: string) {}

  serialize(): string {
    return JSON.stringify({ name: this.name, email: this.email });
  }

  log(level: string): void {
    console.log(`[${level}] User: ${this.name}`);
  }
}

const user = new User("Anna", "anna@mail.de");
console.log(user.serialize());       // {"name":"Anna","email":"anna@mail.de"}
user.log("INFO");                    // [INFO] User: Anna

// ═══ 2. Structural Typing — implements ist optional ═══

interface HasLength {
  length: number;
}

function printLength(item: HasLength): void {
  console.log(`Laenge: ${item.length}`);
}

// Alles funktioniert OHNE 'implements HasLength':
printLength("Hallo");                // 5 — String hat .length
printLength([1, 2, 3]);             // 3 — Array hat .length
printLength({ length: 42 });        // 42 — Objekt-Literal hat .length

// ═══ 3. extends + implements kombiniert ═══

interface Flyable {
  fly(): void;
}

interface Swimmable {
  swim(): void;
}

class Animal {
  constructor(public name: string) {}
}

class Duck extends Animal implements Flyable, Swimmable {
  fly(): void { console.log(`${this.name} fliegt!`); }
  swim(): void { console.log(`${this.name} schwimmt!`); }
}

const duck = new Duck("Donald");
duck.fly();                          // "Donald fliegt!"
duck.swim();                        // "Donald schwimmt!"

// ═══ 4. Generische Interface-Implementierung ═══

interface Repository<T> {
  findById(id: string): T | undefined;
  findAll(): T[];
  save(entity: T): void;
  delete(id: string): boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

class InMemoryProductRepo implements Repository<Product> {
  private products: Map<string, Product> = new Map();

  findById(id: string): Product | undefined {
    return this.products.get(id);
  }

  findAll(): Product[] {
    return [...this.products.values()];
  }

  save(entity: Product): void {
    this.products.set(entity.id, entity);
  }

  delete(id: string): boolean {
    return this.products.delete(id);
  }
}

const repo = new InMemoryProductRepo();
repo.save({ id: "1", name: "TypeScript-Buch", price: 29.99 });
repo.save({ id: "2", name: "Angular-Kurs", price: 49.99 });
console.log(repo.findAll().length);  // 2
console.log(repo.findById("1")?.name); // "TypeScript-Buch"

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt ---");
