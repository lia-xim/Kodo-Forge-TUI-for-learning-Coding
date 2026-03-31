/**
 * Lektion 08 - Exercise 01: Type oder Interface?
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/01-type-oder-interface.ts
 *
 * 8 Aufgaben: Entscheide ob type oder interface das richtige Werkzeug ist
 * und implementiere den Typ entsprechend.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Erstelle einen Union Type fuer HTTP-Methoden
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle einen Typ "HttpMethod" der nur die Werte
// "GET", "POST", "PUT", "PATCH", "DELETE" erlaubt.
// Tipp: Geht das mit interface?

// type HttpMethod = ...

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Erstelle ein Interface fuer einen User
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ein Interface "User" mit den Properties:
// id (string), name (string), email (string), isActive (boolean)

// interface User { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Erstelle einen Discriminated Union Type
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle einen Typ "Result<T>" der entweder ein Erfolg oder ein Fehler ist.
// Erfolg: { success: true, data: T }
// Fehler: { success: false, error: string }

// type Result<T> = ...

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Erweitere ein Interface mit extends
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ein Interface "HasTimestamps" mit createdAt und updatedAt (beide Date).
// Erstelle dann ein Interface "Article" das HasTimestamps erweitert
// und title (string), content (string), author (string) hat.

// interface HasTimestamps { ... }
// interface Article extends HasTimestamps { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Erstelle einen Mapped Type
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle einen generischen Mapped Type "Nullable<T>"
// der alle Properties von T auch null erlaubt.
// z.B. Nullable<{ name: string }> = { name: string | null }
// Geht das mit interface?

// type Nullable<T> = ...

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 6: Erstelle einen Tuple Type
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle einen Tuple Type "Coordinate" mit zwei benannten Elementen:
// [latitude: number, longitude: number]
// Geht das mit interface?

// type Coordinate = ...

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 7: Primitive Alias erstellen
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle drei Primitive Aliases:
// Seconds (number), Url (string), Percentage (number)
// Geht das mit interface?

// type Seconds = ...
// type Url = ...
// type Percentage = ...

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 8: Interface mit implements
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ein Interface "Cacheable" mit:
// - getKey(): string
// - getTTL(): number (in Sekunden)
// Erstelle dann eine Klasse "UserCache" die Cacheable implementiert.
// Der Konstruktor soll einen userId: string akzeptieren.

// interface Cacheable { ... }
// class UserCache implements Cacheable { ... }

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

// Entkommentiere die Tests wenn du die Aufgaben geloest hast:

/*
// Test 1: HttpMethod
const m1: HttpMethod = "GET";
const m2: HttpMethod = "POST";
// const m3: HttpMethod = "CONNECT"; // Sollte Fehler geben

// Test 2: User
const testUser: User = { id: "1", name: "Max", email: "max@test.de", isActive: true };

// Test 3: Result
const success: Result<string> = { success: true, data: "hallo" };
const failure: Result<string> = { success: false, error: "Fehler!" };

// Test 4: Article
const article: Article = {
  title: "TypeScript Basics",
  content: "...",
  author: "Max",
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Test 5: Nullable
const nullableUser: Nullable<User> = {
  id: "1",
  name: null,
  email: null,
  isActive: null,
};

// Test 6: Coordinate
const berlin: Coordinate = [52.52, 13.405];

// Test 7: Primitive Aliases
const timeout: Seconds = 30;
const site: Url = "https://example.com";
const progress: Percentage = 75;

// Test 8: Cacheable
const cache = new UserCache("usr-001");
console.log(cache.getKey());
console.log(cache.getTTL());

console.log("Alle Tests bestanden!");
*/
