/**
 * Lektion 09 - Exercise 02: Enum Grundlagen
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/02-enum-grundlagen.ts
 *
 * 5 Aufgaben zu numerischen und String Enums.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Numerisches Enum mit Auto-Increment
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ein numerisches Enum "Season" mit:
// Spring = 1, Summer = 2, Autumn = 3, Winter = 4
// Nutze Auto-Increment (nur den Startwert setzen)
// enum Season { ... }

// TODO: Erstelle eine Funktion "getSeasonName" die den deutschen
// Namen der Jahreszeit zurueckgibt
// function getSeasonName(season: Season): string { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: String Enum fuer Rollen
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ein String Enum "UserRole" mit:
// Admin = "ADMIN", Editor = "EDITOR", Viewer = "VIEWER", Guest = "GUEST"
// enum UserRole { ... }

// TODO: Erstelle eine Funktion "canEdit" die true zurueckgibt
// wenn die Rolle Admin oder Editor ist
// function canEdit(role: UserRole): boolean { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Bitwise Flags
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ein numerisches Enum "FilePermission" mit Bitwise-Werten:
// None = 0, Read = 1, Write = 2, Execute = 4
// ReadWrite = Read | Write,
// All = Read | Write | Execute
// enum FilePermission { ... }

// TODO: Erstelle eine Funktion "hasPermission" die prueft ob
// eine bestimmte Permission in einem kombinierten Wert enthalten ist
// function hasPermission(permissions: number, check: FilePermission): boolean { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Enum-Iteration
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle eine Funktion "getEnumNames" die alle Namen
// eines numerischen Enums zurueckgibt (ohne die Zahlenwerte!)
// Hinweis: Object.keys() gibt bei numerischen Enums auch Zahlen-Keys zurueck

// function getEnumNames(enumObj: Record<string, string | number>): string[] { ... }

// TODO: Erstelle eine Funktion "getStringEnumValues" die alle Werte
// eines String Enums zurueckgibt
// function getStringEnumValues(enumObj: Record<string, string>): string[] { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Reverse Mapping nutzen
// ═══════════════════════════════════════════════════════════════════════════

enum Priority {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3,
}

// TODO: Erstelle eine Funktion "getPriorityLabel" die einen
// numerischen Wert nimmt und den Enum-Namen zurueckgibt.
// Wenn der Wert ungueltig ist, gib "Unknown" zurueck.
// Nutze das Reverse Mapping!
// function getPriorityLabel(value: number): string { ... }

// ═══════════════════════════════════════════════════════════════════════════
// TESTS — Entkommentiere nach der Implementierung
// ═══════════════════════════════════════════════════════════════════════════

// console.log("--- Tests ---");
// console.log(getSeasonName(Season.Spring));  // "Fruehling"
// console.log(getSeasonName(Season.Winter));  // "Winter"
// console.log(Season.Summer);  // 2

// console.log(canEdit(UserRole.Admin));   // true
// console.log(canEdit(UserRole.Viewer));  // false

// const perms = FilePermission.Read | FilePermission.Write;
// console.log(hasPermission(perms, FilePermission.Read));     // true
// console.log(hasPermission(perms, FilePermission.Execute));  // false

// console.log(getEnumNames(Season));  // ["Spring", "Summer", "Autumn", "Winter"]
// console.log(getStringEnumValues(UserRole));  // ["ADMIN", "EDITOR", "VIEWER", "GUEST"]

// console.log(getPriorityLabel(2));   // "High"
// console.log(getPriorityLabel(99));  // "Unknown"

console.log("Exercise 02 geladen. Ersetze die TODOs!");
