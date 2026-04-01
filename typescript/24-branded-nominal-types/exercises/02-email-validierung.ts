// Exercise 02: Email-Validierung mit Smart Constructor
// =====================================================
// Ziel: Schreibe einen robusten Email-Smart-Constructor

type Brand<T, B extends string> = T & { readonly __brand: B };

// TODO 1: Definiere den Email-Brand-Typ
// type Email = ...

// TODO 2: Schreibe eine validate-Funktion die 3 Varianten anbietet:
//   a) createEmailOrThrow(raw: string): Email  — wirft bei Fehler
//   b) tryCreateEmail(raw: string): Email | null  — gibt null bei Fehler
//   c) parseEmail(raw: string): { ok: true; value: Email } | { ok: false; error: string }

// Anforderungen an eine valide E-Mail:
//   - Enthält genau ein '@'
//   - Teil vor '@': min 1 Zeichen
//   - Teil nach '@': enthält mindestens einen Punkt + TLD min 2 Zeichen
//   - Nach trim() und toLowerCase() verarbeiten

// TODO: Implementiere alle drei Varianten

// TODO 3: Schreibe eine Funktion die nur 'Email' akzeptiert:
// function sendMarketingEmail(to: Email): void {
//   console.log(`Sende Marketing-E-Mail an ${to}`);
// }

// TODO 4: Teste folgende Fälle:
// Gültige E-Mails: "user@example.com", "  Max.M@Test.DE  " (Leerzeichen + Upper)
// Ungültige: "kein-email", "@example.com", "user@", "user@.com"

// Erwartetes Verhalten:
// createEmailOrThrow("Max@Test.DE") → max@test.de (normalisiert!)
// tryCreateEmail("invalid") → null
// parseEmail("a@b.de") → { ok: true, value: 'a@b.de' }
// parseEmail("") → { ok: false, error: '...' }

export {};
