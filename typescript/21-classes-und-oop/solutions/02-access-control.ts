/**
 * Lektion 21 — Loesung 02: Access Control
 */

// ═══ Aufgabe 1: Grundlegende Kapselung ═══

class BankAccount {
  private balance: number;

  constructor(
    public owner: string,
    public readonly accountNumber: string,
    initialBalance: number = 0
  ) {
    this.balance = initialBalance;
  }

  deposit(amount: number): void {
    if (amount <= 0) throw new Error("Betrag muss positiv sein");
    this.balance += amount;
  }

  withdraw(amount: number): boolean {
    if (amount <= 0) throw new Error("Betrag muss positiv sein");
    if (amount > this.balance) return false;
    this.balance -= amount;
    return true;
  }

  getBalance(): number {
    return this.balance;
  }
}

// ═══ Aufgabe 2: Echte Kapselung mit #private ═══

class SecureAccount {
  #password: string;

  constructor(password: string) {
    this.#password = password;
  }

  authenticate(attempt: string): boolean {
    return attempt === this.#password;
  }

  changePassword(oldPw: string, newPw: string): boolean {
    if (!this.authenticate(oldPw)) return false;
    if (newPw.length < 8) throw new Error("Passwort zu kurz");
    this.#password = newPw;
    return true;
  }
}

// ═══ Aufgabe 3: Getter/Setter mit Validierung ═══

class Product {
  private _price: number;
  private _stock: number;

  constructor(
    public readonly name: string,
    price: number,
    stock: number
  ) {
    this._price = price;
    this._stock = stock;
  }

  get price(): number { return this._price; }
  set price(value: number) {
    if (value < 0) throw new Error("Preis darf nicht negativ sein");
    this._price = value;
  }

  get stock(): number { return this._stock; }
  set stock(value: number) {
    if (value < 0) throw new Error("Bestand darf nicht negativ sein");
    this._stock = value;
  }

  get isAvailable(): boolean {
    return this._stock > 0;
  }
}

// ═══ Tests ═══

const acc = new BankAccount("Max", "DE1234", 1000);
acc.deposit(500);
console.assert(acc.getBalance() === 1500, "Deposit failed");
console.assert(acc.withdraw(200) === true, "Withdraw should succeed");
console.assert(acc.getBalance() === 1300, "Balance after withdraw");
console.assert(acc.withdraw(5000) === false, "Withdraw should fail");

const secure = new SecureAccount("geheim123");
console.assert(secure.authenticate("falsch") === false, "Should reject wrong pw");
console.assert(secure.authenticate("geheim123") === true, "Should accept correct pw");
// (secure as any).#password; // Syntax-Error — echte Kapselung!

const product = new Product("Widget", 9.99, 10);
console.assert(product.isAvailable === true, "Should be available");
product.stock = 0;
console.assert(product.isAvailable === false, "Should not be available");

console.log("\n--- Loesung 02 erfolgreich ---");
