/**
 * Lektion 09 - Solution 02: Enum Grundlagen
 *
 * Ausfuehren mit: npx tsx solutions/02-enum-grundlagen.ts
 *
 * Vollstaendige Loesungen mit ausfuehrlichen deutschen Erklaerungen.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Numerisches Enum mit Auto-Increment
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Startwert 1 setzen, danach zaehlt TypeScript automatisch hoch
enum Season {
  Spring = 1,
  Summer,   // 2
  Autumn,   // 3
  Winter,   // 4
}

function getSeasonName(season: Season): string {
  switch (season) {
    case Season.Spring: return "Fruehling";
    case Season.Summer: return "Sommer";
    case Season.Autumn: return "Herbst";
    case Season.Winter: return "Winter";
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: String Enum fuer Rollen
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Jedes Mitglied braucht einen expliziten String-Wert
enum UserRole {
  Admin = "ADMIN",
  Editor = "EDITOR",
  Viewer = "VIEWER",
  Guest = "GUEST",
}

function canEdit(role: UserRole): boolean {
  return role === UserRole.Admin || role === UserRole.Editor;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Bitwise Flags
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Zweierpotenzen fuer Bitwise-Operationen
// 1 << 0 = 1, 1 << 1 = 2, 1 << 2 = 4
enum FilePermission {
  None    = 0,
  Read    = 1 << 0,  // 1
  Write   = 1 << 1,  // 2
  Execute = 1 << 2,  // 4
  ReadWrite = Read | Write,        // 3
  All       = Read | Write | Execute, // 7
}

function hasPermission(permissions: number, check: FilePermission): boolean {
  // Bitwise AND: Ergebnis ist != 0 wenn das Bit gesetzt ist
  return (permissions & check) !== 0;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Enum-Iteration
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Bei numerischen Enums Zahlen-Keys herausfiltern
function getEnumNames(enumObj: Record<string, string | number>): string[] {
  return Object.keys(enumObj).filter(key => isNaN(Number(key)));
}

// Bei String Enums gibt es keine Zahlen-Keys — einfach Object.values
function getStringEnumValues(enumObj: Record<string, string>): string[] {
  return Object.values(enumObj);
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Reverse Mapping
// ═══════════════════════════════════════════════════════════════════════════

enum Priority {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3,
}

function getPriorityLabel(value: number): string {
  // Reverse Mapping: Priority[number] gibt den Namen oder undefined
  const name = Priority[value];
  return name ?? "Unknown";
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

console.log("--- Tests ---");
console.log(getSeasonName(Season.Spring));  // "Fruehling"
console.log(getSeasonName(Season.Winter));  // "Winter"
console.log(`Season.Summer = ${Season.Summer}`);  // 2

console.log(canEdit(UserRole.Admin));   // true
console.log(canEdit(UserRole.Viewer));  // false
console.log(canEdit(UserRole.Guest));   // false

const perms = FilePermission.Read | FilePermission.Write;
console.log(`Read | Write = ${perms}`);                       // 3
console.log(`Hat Read: ${hasPermission(perms, FilePermission.Read)}`);      // true
console.log(`Hat Execute: ${hasPermission(perms, FilePermission.Execute)}`); // false
console.log(`Hat Write: ${hasPermission(perms, FilePermission.Write)}`);    // true

console.log(getEnumNames(Season));  // ["Spring", "Summer", "Autumn", "Winter"]
console.log(getStringEnumValues(UserRole));  // ["ADMIN", "EDITOR", "VIEWER", "GUEST"]

console.log(getPriorityLabel(2));   // "High"
console.log(getPriorityLabel(0));   // "Low"
console.log(getPriorityLabel(99));  // "Unknown"

console.log("\n--- Alle Tests bestanden! ---");
