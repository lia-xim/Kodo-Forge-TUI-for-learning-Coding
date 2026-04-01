/**
 * Lektion 21 — Loesung 05: Mixin Pattern
 */

type Constructor<T = {}> = new (...args: any[]) => T;

// ═══ Aufgabe 1: WithId Mixin ═══

function WithId<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    id: string = Math.random().toString(36).slice(2);
  };
}

// ═══ Aufgabe 2: WithValidation Mixin ═══

function WithValidation<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    errors: string[] = [];

    addError(msg: string): void {
      this.errors.push(msg);
    }

    clearErrors(): void {
      this.errors = [];
    }

    hasErrors(): boolean {
      return this.errors.length > 0;
    }
  };
}

// ═══ Aufgabe 3: Mixins kombinieren ═══

class User {
  constructor(public name: string, public email: string) {}
}

const EnhancedUser = WithValidation(WithId(User));

const user = new EnhancedUser("Anna", "anna@mail.de");

// Alle Features testen
console.log(`Name: ${user.name}`);          // Anna
console.log(`Email: ${user.email}`);        // anna@mail.de
console.log(`ID: ${user.id}`);             // z.B. "k8f2j9x"
console.log(`Has errors: ${user.hasErrors()}`); // false

user.addError("Email ungueltig");
console.log(`Has errors: ${user.hasErrors()}`); // true
console.log(`Errors: ${user.errors}`);       // ["Email ungueltig"]

user.clearErrors();
console.log(`Has errors: ${user.hasErrors()}`); // false

// ═══ Bonus: Weiteres Mixin ═══

function WithTimestamp<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    createdAt: Date = new Date();
    updatedAt: Date = new Date();

    touch(): void {
      this.updatedAt = new Date();
    }
  };
}

// Drei Mixins kombiniert:
const SuperUser = WithTimestamp(WithValidation(WithId(User)));
const superUser = new SuperUser("Max", "max@mail.de");
console.log(`ID: ${superUser.id}, Created: ${superUser.createdAt.toISOString()}`);

// ═══ Tests ═══

console.assert(typeof user.id === "string", "Should have id");
console.assert(user.id.length > 0, "ID should not be empty");
console.assert(user.name === "Anna", "Should have name");
console.assert(user.email === "anna@mail.de", "Should have email");

user.addError("Test error");
console.assert(user.errors.length === 1, "Should have 1 error");
user.clearErrors();
console.assert(user.errors.length === 0, "Should have 0 errors");

console.assert(superUser.createdAt instanceof Date, "Should have createdAt");

console.log("\n--- Loesung 05 erfolgreich ---");
