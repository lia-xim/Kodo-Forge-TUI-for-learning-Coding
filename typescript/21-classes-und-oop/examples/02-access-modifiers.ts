/**
 * Lektion 21 — Beispiel 02: Access Modifiers
 *
 * Ausfuehren: npx tsx examples/02-access-modifiers.ts
 */

// ═══ 1. public, private, protected, readonly ═══

class BankAccount {
  public owner: string;
  private balance: number;
  protected accountType: string;
  readonly iban: string;

  constructor(owner: string, iban: string, initialBalance: number = 0) {
    this.owner = owner;
    this.iban = iban;
    this.balance = initialBalance;
    this.accountType = "checking";
  }

  deposit(amount: number): void {
    if (amount <= 0) throw new Error("Betrag muss positiv sein");
    this.balance += amount;
  }

  getBalance(): number {
    return this.balance;
  }
}

const account = new BankAccount("Max", "DE89...", 1000);
console.log(account.owner);          // OK: public
console.log(account.iban);           // OK: readonly (lesen)
// account.iban = "DE00...";         // FEHLER: readonly
// account.balance;                  // FEHLER: private
console.log(account.getBalance());   // 1000

// ═══ 2. TypeScript private vs JavaScript #private ═══

class Secret {
  private tsPrivate: string = "ts-geheim";
  #jsPrivate: string = "js-geheim";

  revealTs(): string { return this.tsPrivate; }
  revealJs(): string { return this.#jsPrivate; }
}

const s = new Secret();
console.log((s as any).tsPrivate);   // "ts-geheim" — private umgangen!
// console.log((s as any).#jsPrivate); // Syntax-Error — echte Kapselung!
console.log(s.revealJs());           // "js-geheim" — nur ueber Methode

// ═══ 3. protected in Subklassen ═══

class Vehicle {
  protected speed: number = 0;

  accelerate(amount: number): void {
    this.speed += amount;
  }
}

class Car extends Vehicle {
  turboBoost(): void {
    this.speed *= 2;                  // OK: protected in Subklasse
  }

  getSpeed(): number {
    return this.speed;
  }
}

const car = new Car();
car.accelerate(50);
car.turboBoost();
console.log(car.getSpeed());        // 100
// car.speed;                        // FEHLER: protected

// ═══ 4. Getter und Setter ═══

class Temperature {
  private _celsius: number;

  constructor(celsius: number) {
    this._celsius = celsius;
  }

  get celsius(): number { return this._celsius; }
  set celsius(value: number) {
    if (value < -273.15) throw new Error("Unter absolutem Nullpunkt!");
    this._celsius = value;
  }

  get fahrenheit(): number {
    return this._celsius * 9 / 5 + 32;
  }
}

const temp = new Temperature(20);
console.log(`${temp.celsius}°C = ${temp.fahrenheit}°F`); // 20°C = 68°F
temp.celsius = 100;
console.log(`${temp.celsius}°C = ${temp.fahrenheit}°F`); // 100°C = 212°F

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt ---");
