/**
 * Lektion 09 - Example 02: Numerische Enums
 *
 * Ausfuehren mit: npx tsx examples/02-numerische-enums.ts
 *
 * Auto-Increment, Reverse Mapping, Bitwise Flags und die Fallstricke.
 */

// ─── GRUNDLAGEN ─────────────────────────────────────────────────────────────

enum Direction {
  Up,     // 0
  Down,   // 1
  Left,   // 2
  Right,  // 3
}

console.log("--- Grundlagen ---");
console.log(`Direction.Up = ${Direction.Up}`);       // 0
console.log(`Direction.Down = ${Direction.Down}`);   // 1
console.log(`Direction.Left = ${Direction.Left}`);   // 2
console.log(`Direction.Right = ${Direction.Right}`); // 3

// ─── AUTO-INCREMENT MIT STARTWERT ───────────────────────────────────────────

enum HttpStatus {
  Ok = 200,
  Created = 201,
  Accepted = 202,
  // Luecke:
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  // Luecke:
  InternalError = 500,
}

console.log("\n--- HTTP Status ---");
console.log(`HttpStatus.Ok = ${HttpStatus.Ok}`);             // 200
console.log(`HttpStatus.NotFound = ${HttpStatus.NotFound}`); // 404

// ─── REVERSE MAPPING ────────────────────────────────────────────────────────

console.log("\n--- Reverse Mapping ---");
console.log(`Direction[0] = "${Direction[0]}"`);  // "Up"
console.log(`Direction[1] = "${Direction[1]}"`);  // "Down"
console.log(`Direction[2] = "${Direction[2]}"`);  // "Left"
console.log(`Direction[3] = "${Direction[3]}"`);  // "Right"

// Das Enum-Objekt hat DOPPELTE Eintraege:
console.log("\n--- Enum-Objekt (Direction) ---");
console.log(Direction);
// { '0': 'Up', '1': 'Down', '2': 'Left', '3': 'Right',
//   Up: 0, Down: 1, Left: 2, Right: 3 }

// ─── ITERATION: DIE FALLE ──────────────────────────────────────────────────

console.log("\n--- Iteration (Achtung!) ---");
console.log(`Object.keys:`, Object.keys(Direction));
// ["0", "1", "2", "3", "Up", "Down", "Left", "Right"] — 8 statt 4!

console.log(`Object.values:`, Object.values(Direction));
// ["Up", "Down", "Left", "Right", 0, 1, 2, 3] — gemischt!

// Korrekte Iteration ueber Namen:
const directionNames = Object.keys(Direction).filter(k => isNaN(Number(k)));
console.log(`Nur Namen:`, directionNames);
// ["Up", "Down", "Left", "Right"]

// Korrekte Iteration ueber Werte:
const directionValues = Object.values(Direction).filter(v => typeof v === "number");
console.log(`Nur Werte:`, directionValues);
// [0, 1, 2, 3]

// ─── BITWISE FLAGS ──────────────────────────────────────────────────────────

enum Permission {
  None    = 0,        // 0b0000
  Read    = 1 << 0,   // 0b0001 = 1
  Write   = 1 << 1,   // 0b0010 = 2
  Execute = 1 << 2,   // 0b0100 = 4
  All     = Read | Write | Execute, // 0b0111 = 7
}

console.log("\n--- Bitwise Flags ---");
const userPerms = Permission.Read | Permission.Write;
console.log(`Read | Write = ${userPerms}`);  // 3

// Pruefen ob eine Permission gesetzt ist:
const hasRead = (userPerms & Permission.Read) !== 0;
const hasExecute = (userPerms & Permission.Execute) !== 0;
console.log(`Hat Read: ${hasRead}`);        // true
console.log(`Hat Execute: ${hasExecute}`);  // false

// ─── SOUNDNESS-LOCH ────────────────────────────────────────────────────────

console.log("\n--- Soundness-Loch ---");

// TypeScript erlaubt jede Zahl als numerischen Enum-Wert:
const suspekt: Direction = 42;  // KEIN Error!
console.log(`suspekt (42 als Direction) = ${suspekt}`);
console.log(`Direction[42] = "${Direction[42]}"`);  // undefined!

// Das ist ein bekanntes Problem. String Enums haben es nicht.

// ─── BERECHNETE WERTE ───────────────────────────────────────────────────────

enum FileSize {
  Byte = 1,
  Kilobyte = 1024,
  Megabyte = 1024 * 1024,
  Gigabyte = 1024 * 1024 * 1024,
}

console.log("\n--- Berechnete Werte ---");
console.log(`1 KB = ${FileSize.Kilobyte} Bytes`);    // 1024
console.log(`1 MB = ${FileSize.Megabyte} Bytes`);    // 1048576
console.log(`1 GB = ${FileSize.Gigabyte} Bytes`);    // 1073741824

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
