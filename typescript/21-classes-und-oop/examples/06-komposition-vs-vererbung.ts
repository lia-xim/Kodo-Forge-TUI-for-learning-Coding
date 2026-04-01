/**
 * Lektion 21 — Beispiel 06: Komposition vs Vererbung
 *
 * Ausfuehren: npx tsx examples/06-komposition-vs-vererbung.ts
 */

// ═══ 1. Komposition statt Vererbung ═══

// Faehigkeiten als Interfaces
interface CanFight {
  fight(): string;
}
interface CanCast {
  cast(): string;
}

// Implementierungen
const swordFighter: CanFight = {
  fight() { return "Schwertstreich!"; }
};
const fireMage: CanCast = {
  cast() { return "Feuerball!"; }
};

// BattleMage kombiniert Faehigkeiten (Komposition)
class BattleMage implements CanFight, CanCast {
  constructor(
    public name: string,
    private fightAbility: CanFight = swordFighter,
    private castAbility: CanCast = fireMage
  ) {}

  fight(): string { return this.fightAbility.fight(); }
  cast(): string { return this.castAbility.cast(); }
}

const mage = new BattleMage("Gandalf");
console.log(mage.fight());                    // "Schwertstreich!"
console.log(mage.cast());                     // "Feuerball!"

// ═══ 2. Mixins ═══

type Constructor<T = {}> = new (...args: any[]) => T;

function WithTimestamp<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    createdAt: Date = new Date();
    updatedAt: Date = new Date();
    touch(): void { this.updatedAt = new Date(); }
  };
}

function WithLogging<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    log(message: string): void {
      console.log(`[LOG] ${message}`);
    }
  };
}

class User {
  constructor(public name: string) {}
}

const EnhancedUser = WithLogging(WithTimestamp(User));
const user = new EnhancedUser("Anna");
console.log(user.name);                       // "Anna"
console.log(user.createdAt instanceof Date);   // true
user.log("Eingeloggt");                        // "[LOG] Eingeloggt"

// ═══ 3. this-Binding: Drei Loesungen ═══

class Timer {
  seconds: number = 0;

  // Loesung 1: Arrow-Function als Klassen-Feld
  tickArrow = (): void => {
    this.seconds++;
  };

  // Loesung 2: Normale Methode + bind im Constructor
  tickBound: () => void;
  tickMethod(): void {
    this.seconds++;
  }

  constructor() {
    this.tickBound = this.tickMethod.bind(this);
  }

  // Loesung 3: Arrow bei Uebergabe
  start(): void {
    // setInterval(() => this.tickMethod(), 1000); // Arrow-Wrapper
  }
}

const timer = new Timer();

// Arrow-Field: Funktioniert als losgeloeste Funktion
const fn1 = timer.tickArrow;
fn1();
console.log(`Arrow: ${timer.seconds}`);        // 1

// bind: Funktioniert als losgeloeste Funktion
const fn2 = timer.tickBound;
fn2();
console.log(`Bound: ${timer.seconds}`);        // 2

// ═══ 4. instanceof — Nur mit Klassen! ═══

class HttpError {
  constructor(public statusCode: number, public message: string) {}
}

class ValidationError {
  constructor(public field: string, public message: string) {}
}

function handleError(error: HttpError | ValidationError): void {
  if (error instanceof HttpError) {
    console.log(`HTTP ${error.statusCode}: ${error.message}`);
  } else {
    console.log(`Validation: ${error.field} — ${error.message}`);
  }
}

handleError(new HttpError(404, "Nicht gefunden"));
handleError(new ValidationError("email", "Ungueltig"));

// ═══ 5. Klasse vs Funktion/Closure ═══

// Klassen-Version
class CounterClass {
  private count = 0;
  increment() { this.count++; }
  getCount() { return this.count; }
}

// Closure-Version (funktional)
function createCounter() {
  let count = 0;
  return {
    increment: () => { count++; },
    getCount: () => count,
  };
}

const c1 = new CounterClass();
c1.increment();
console.log(`Class: ${c1.getCount()}`);        // 1

const c2 = createCounter();
c2.increment();
console.log(`Closure: ${c2.getCount()}`);      // 1

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt ---");
