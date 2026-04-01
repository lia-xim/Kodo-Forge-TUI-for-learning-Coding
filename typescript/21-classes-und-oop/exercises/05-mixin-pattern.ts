/**
 * Lektion 21 — Exercise 05: Mixin Pattern
 *
 * Implementiere Mixins fuer Code-Wiederverwendung ohne Vererbung.
 *
 * Ausfuehren: npx tsx exercises/05-mixin-pattern.ts
 * Hinweise:   hints.json → "exercises/05-mixin-pattern.ts"
 */

// Basis-Typ fuer Mixins
type Constructor<T = {}> = new (...args: any[]) => T;

// ═══ Aufgabe 1: WithId Mixin ═══
// Erstelle ein Mixin 'WithId' das einer Klasse eine auto-generierte
// 'id: string' hinzufuegt (z.B. Math.random().toString(36).slice(2))

// TODO: function WithId<T extends Constructor>(Base: T) { ... }

// ═══ Aufgabe 2: WithValidation Mixin ═══
// Erstelle ein Mixin 'WithValidation' das folgendes hinzufuegt:
// - errors: string[] = []
// - abstract validate(): boolean (Hinweis: Mixins koennen keine abstract methods haben!)
// - Alternative: isValid: boolean Property (computed via validate Logik)
// - addError(msg: string): void
// - clearErrors(): void

// TODO: function WithValidation<T extends Constructor>(Base: T) { ... }

// ═══ Aufgabe 3: Mixins kombinieren ═══
// Erstelle eine Basis-Klasse 'User' mit name und email.
// Wende WithId und WithValidation an.
// Erstelle eine Instanz und teste alle Features.

// TODO:
// class User { constructor(public name: string, public email: string) {} }
// const EnhancedUser = WithValidation(WithId(User));
// const user = new EnhancedUser("Anna", "anna@mail.de");

// ═══ Tests ═══
function testMixins(): void {
  // Kommentiere die Tests ein:
  // const user = new EnhancedUser("Anna", "anna@mail.de");
  // console.assert(typeof user.id === "string", "Should have id");
  // console.assert(user.name === "Anna", "Should have name");
  // user.addError("Test error");
  // console.assert(user.errors.length === 1, "Should have 1 error");
  // user.clearErrors();
  // console.assert(user.errors.length === 0, "Should have 0 errors");

  console.log("Exercise 05: Erstelle die Mixins und kommentiere die Tests ein!");
}

testMixins();
