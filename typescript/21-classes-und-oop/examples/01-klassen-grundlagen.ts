/**
 * Lektion 21 — Beispiel 01: Klassen-Grundlagen
 *
 * Ausfuehren: npx tsx examples/01-klassen-grundlagen.ts
 */

// ═══ 1. Einfache Klasse ═══

class User {
  name: string;
  age: number;
  email: string;

  constructor(name: string, age: number, email: string) {
    this.name = name;
    this.age = age;
    this.email = email;
  }

  greet(): string {
    return `Hallo, ich bin ${this.name} (${this.age} Jahre)`;
  }

  isAdult(): boolean {
    return this.age >= 18;
  }
}

const user = new User("Anna", 28, "anna@example.com");
console.log(user.greet());     // "Hallo, ich bin Anna (28 Jahre)"
console.log(user.isAdult());   // true

// ═══ 2. strictPropertyInitialization — Vier Wege ═══

class WithDefault {
  name: string = "Unbekannt";        // Weg 1: Default-Wert
}

class WithConstructor {
  name: string;
  constructor(name: string) {
    this.name = name;                 // Weg 2: Im Constructor
  }
}

class WithOptional {
  name?: string;                      // Weg 3: Optional
}

class WithAssertion {
  name!: string;                      // Weg 4: Definite Assignment (unsicher!)
}

// ═══ 3. Structural Typing — Klassen sind keine Sonderfaelle ═══

class Point {
  constructor(public x: number, public y: number) {}
}

function printPoint(p: Point): void {
  console.log(`(${p.x}, ${p.y})`);
}

// Funktioniert OHNE 'new Point()'!
printPoint({ x: 10, y: 20 });        // Structural Typing
printPoint(new Point(5, 15));         // Auch mit new

// ═══ 4. Instanz-Typ vs Constructor-Typ ═══

let pet: User = new User("Kitty", 3, "kitty@cat.com");
// 'User' als Typ = Instanz-Typ

let UserClass: typeof User = User;
// 'typeof User' = Constructor-Typ
const pet2 = new UserClass("Buddy", 5, "buddy@dog.com");
console.log(pet2.greet());           // "Hallo, ich bin Buddy (5 Jahre)"

// ═══ 5. this-Kontext ═══

class Counter {
  count: number = 0;

  increment(): void {
    this.count++;
  }

  // Arrow-Function bindet this automatisch
  incrementSafe = (): void => {
    this.count++;
  };
}

const counter = new Counter();
counter.increment();
console.log(counter.count);         // 1

const safeFn = counter.incrementSafe;
safeFn();                            // OK! Arrow-Function
console.log(counter.count);         // 2

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt ---");
