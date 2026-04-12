export {};

/**
 * Lektion 10 - Exercise 03: Form Validation System
 *
 * INTEGRATIONS-CHALLENGE: Baue ein Validierungssystem fuer Formulare
 * mit Type Guards, Discriminated Unions und typsicherer Fehlerbehandlung.
 *
 * Konzepte die du brauchst:
 * - Discriminated Unions (L07)
 * - Type Narrowing / typeof Guards (L07)
 * - Interfaces & Type Aliases (L05, L08)
 * - Literal Types (L09)
 * - Function Types / Callbacks (L06)
 * - Optional Properties (L05)
 * - Arrays & Tuples (L04)
 *
 * Ausfuehren: npx tsx exercises/03-form-validation.ts
 */

// ═══════════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Validation Result als Discriminated Union
// ═══════════════════════════════════════════════════════════════════════════════
//
// Erstelle die folgenden Typen:
//
// FieldError Interface:
//   - field: string
//   - message: string
//   - code: "required" | "min_length" | "max_length" | "pattern" | "type_mismatch" | "custom"
//
// ValidationResult — Discriminated Union:
//   - { valid: true; data: Record<string, unknown> }
//   - { valid: false; errors: FieldError[] }

// TODO: Erstelle FieldError und ValidationResult hier

// ═══════════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Validation Rules
// ═══════════════════════════════════════════════════════════════════════════════
//
// Erstelle verschiedene Validierungsregeln als Discriminated Union.
// Discriminator: "type"
//
// RequiredRule:
//   - type: "required"
//   - message?: string (optional, Standard: "Feld ist erforderlich")
//
// MinLengthRule:
//   - type: "min_length"
//   - min: number
//   - message?: string
//
// MaxLengthRule:
//   - type: "max_length"
//   - max: number
//   - message?: string
//
// PatternRule:
//   - type: "pattern"
//   - pattern: RegExp
//   - message?: string
//
// RangeRule:
//   - type: "range"
//   - min: number
//   - max: number
//   - message?: string
//
// CustomRule:
//   - type: "custom"
//   - validate: (value: unknown) => boolean   (Callback, L06!)
//   - message: string
//
// ValidationRule = RequiredRule | MinLengthRule | MaxLengthRule | PatternRule | RangeRule | CustomRule

// TODO: Erstelle die Validation Rules hier

// ═══════════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Field Schema
// ═══════════════════════════════════════════════════════════════════════════════
//
// FieldSchema Interface:
//   - name: string
//   - label: string
//   - type: "string" | "number" | "email" | "password" | "boolean"
//   - rules: ValidationRule[]
//   - defaultValue?: unknown (optional)
//
// FormSchema Interface:
//   - name: string
//   - fields: FieldSchema[]
//   - submitLabel?: string (optional, Standard: "Absenden")

// TODO: Erstelle FieldSchema und FormSchema hier

// ═══════════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Validator-Funktionen
// ═══════════════════════════════════════════════════════════════════════════════
//
// a) validateField(field: FieldSchema, value: unknown): FieldError[]
//    — Prueft den Wert gegen ALLE Regeln des Felds
//    — Nutzt einen exhaustive switch ueber rule.type
//    — Gibt ein Array von FieldErrors zurueck (leer = valide)
//
//    Logik pro Regel:
//    - "required": Wert darf nicht null, undefined, oder "" sein
//    - "min_length": typeof value === "string" && value.length >= min
//    - "max_length": typeof value === "string" && value.length <= max
//    - "pattern": typeof value === "string" && pattern.test(value)
//    - "range": typeof value === "number" && value >= min && value <= max
//    - "custom": rule.validate(value) muss true zurueckgeben

// TODO: Implementiere validateField hier

// b) validateForm(schema: FormSchema, data: Record<string, unknown>): ValidationResult
//    — Validiert ALLE Felder des Schemas gegen die entsprechenden Werte in data
//    — Sammelt alle Fehler
//    — Gibt { valid: true, data } zurueck wenn keine Fehler
//    — Gibt { valid: false, errors } zurueck wenn Fehler vorhanden

// TODO: Implementiere validateForm hier

// ═══════════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Formular-Schemas definieren
// ═══════════════════════════════════════════════════════════════════════════════
//
// Erstelle ein registrationSchema: FormSchema mit diesen Feldern:
//
// - username:
//     label: "Benutzername"
//     type: "string"
//     rules: required, min_length(3), max_length(20), pattern(/^[a-zA-Z0-9_]+$/)
//
// - email:
//     label: "E-Mail"
//     type: "email"
//     rules: required, pattern(Email-Regex)
//
// - password:
//     label: "Passwort"
//     type: "password"
//     rules: required, min_length(8), pattern(mindestens eine Zahl, ein Grossbuchstabe)
//
// - age:
//     label: "Alter"
//     type: "number"
//     rules: required, range(13, 120)
//
// - acceptTerms:
//     label: "AGB akzeptieren"
//     type: "boolean"
//     rules: custom(muss true sein, "Du musst die AGB akzeptieren")

// TODO: Erstelle das registrationSchema hier

// ═══════════════════════════════════════════════════════════════════════════════
// AUFGABE 6: Error Formatter
// ═══════════════════════════════════════════════════════════════════════════════
//
// a) formatErrors(result: ValidationResult): string
//    — Wenn valid: "Validierung erfolgreich!"
//    — Wenn invalid: Formatierte Fehlerliste:
//      "3 Fehler gefunden:
//       - username: Mindestens 3 Zeichen erforderlich (min_length)
//       - email: Feld ist erforderlich (required)
//       - password: Muss Grossbuchstabe und Zahl enthalten (pattern)"
//
// b) getFieldErrors(result: ValidationResult, fieldName: string): FieldError[]
//    — Filtert Fehler fuer ein bestimmtes Feld
//    — Gibt leeres Array zurueck wenn valid oder keine Fehler fuer das Feld

// TODO: Implementiere die Formatter hier

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS — Entkommentiere diese, wenn du fertig bist!
// ═══════════════════════════════════════════════════════════════════════════════

/*
// Test 1: Valide Registrierung
const validData = {
  username: "max_muster",
  email: "max@example.com",
  password: "Secure1Pass",
  age: 28,
  acceptTerms: true,
};

const result1 = validateForm(registrationSchema, validData);
console.log("Test 1 (valide):", formatErrors(result1));
console.assert(result1.valid === true, "Valide Daten sollten bestehen");

// Test 2: Invalide Registrierung
const invalidData = {
  username: "x",
  email: "nicht-eine-email",
  password: "weak",
  age: 10,
  acceptTerms: false,
};

const result2 = validateForm(registrationSchema, invalidData);
console.log("\nTest 2 (invalide):", formatErrors(result2));
console.assert(result2.valid === false, "Invalide Daten sollten fehlschlagen");

if (!result2.valid) {
  console.assert(result2.errors.length >= 4, "Mindestens 4 Fehler erwartet");

  const usernameErrors = getFieldErrors(result2, "username");
  console.log(`\nUsername-Fehler: ${usernameErrors.length}`);
  console.assert(usernameErrors.length >= 1, "Username sollte Fehler haben");
}

// Test 3: Fehlende Felder
const emptyData = {};

const result3 = validateForm(registrationSchema, emptyData);
console.log("\nTest 3 (leer):", formatErrors(result3));
console.assert(result3.valid === false, "Leere Daten sollten fehlschlagen");

if (!result3.valid) {
  console.assert(result3.errors.length >= 5, "Alle 5 Felder sollten Fehler haben");
}

console.log("\nAlle Tests bestanden!");
*/
