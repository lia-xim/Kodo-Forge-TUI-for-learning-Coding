/**
 * Lektion 21 — Exercise 02: Access Control
 *
 * Implementiere eine BankAccount-Klasse mit korrekter Kapselung.
 *
 * Ausfuehren: npx tsx exercises/02-access-control.ts
 * Hinweise:   hints.json → "exercises/02-access-control.ts"
 */

// ═══ Aufgabe 1: Grundlegende Kapselung ═══
// Erstelle eine Klasse 'BankAccount' mit:
// - private balance: number
// - readonly accountNumber: string
// - public owner: string
// - deposit(amount: number): void — mit Validierung (amount > 0)
// - withdraw(amount: number): boolean — false wenn nicht genug Geld
// - getBalance(): number — der sichere Weg den Saldo zu lesen

// TODO: class BankAccount { ... }

// ═══ Aufgabe 2: Echte Kapselung mit #private ═══
// Erstelle eine Klasse 'SecureAccount' die #private fuer das Passwort nutzt:
// - #password: string (echte Laufzeit-Kapselung)
// - authenticate(attempt: string): boolean
// - changePassword(oldPw: string, newPw: string): boolean

// TODO: class SecureAccount { ... }

// ═══ Aufgabe 3: Getter/Setter mit Validierung ═══
// Erstelle eine Klasse 'Product' mit:
// - private _price: number
// - get price(): number
// - set price(value: number) — wirft Error wenn value < 0
// - private _stock: number
// - get stock(): number
// - set stock(value: number) — wirft Error wenn value < 0
// - get isAvailable(): boolean — true wenn stock > 0

// TODO: class Product { ... }

// ═══ Tests ═══
function testAccessControl(): void {
  // Kommentiere die Tests ein, wenn du die Klassen erstellt hast:

  // Aufgabe 1
  // const acc = new BankAccount("Max", "DE1234", 1000);
  // acc.deposit(500);
  // console.assert(acc.getBalance() === 1500, "Deposit failed");
  // console.assert(acc.withdraw(200) === true, "Withdraw should succeed");
  // console.assert(acc.withdraw(5000) === false, "Withdraw should fail");

  // Aufgabe 2
  // const secure = new SecureAccount("geheim123");
  // console.assert(secure.authenticate("falsch") === false, "Should reject wrong pw");
  // console.assert(secure.authenticate("geheim123") === true, "Should accept correct pw");

  console.log("Exercise 02: Erstelle die Klassen und kommentiere die Tests ein!");
}

testAccessControl();
