/**
 * Lektion 08 - Solution 01: Type oder Interface?
 *
 * Ausfuehren mit: npx tsx solutions/01-type-oder-interface.ts
 *
 * Vollstaendige Loesungen mit deutschen Erklaerungen.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Union Type — NUR mit type moeglich
// ═══════════════════════════════════════════════════════════════════════════

// Union Types sind type-exklusiv. Interface kann keine Unions.
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Interface fuer einen User
// ═══════════════════════════════════════════════════════════════════════════

// Reine Objekt-Form — interface ist die natuerliche Wahl.
interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Discriminated Union — NUR mit type
// ═══════════════════════════════════════════════════════════════════════════

// Discriminated Unions sind eines der maechtigsten Patterns in TypeScript.
// Sie gehen nur mit type, weil sie Union Types verwenden.
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Interface mit extends
// ═══════════════════════════════════════════════════════════════════════════

// Vererbungshierarchie — die Staerke von interface.
interface HasTimestamps {
  createdAt: Date;
  updatedAt: Date;
}

interface Article extends HasTimestamps {
  title: string;
  content: string;
  author: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Mapped Type — NUR mit type
// ═══════════════════════════════════════════════════════════════════════════

// Mapped Types iterieren ueber Keys — das kann nur type.
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 6: Tuple Type — NUR mit type
// ═══════════════════════════════════════════════════════════════════════════

// Tuples sind type-exklusiv. Interface kann kein Array mit fester Laenge beschreiben.
type Coordinate = [latitude: number, longitude: number];

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 7: Primitive Aliases — NUR mit type
// ═══════════════════════════════════════════════════════════════════════════

// Primitive Aliases koennen NICHT mit interface erstellt werden.
// Interface beschreibt immer ein Objekt, nicht einen primitiven Wert.
type Seconds = number;
type Url = string;
type Percentage = number;

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 8: Interface mit implements
// ═══════════════════════════════════════════════════════════════════════════

// Service-Contracts — klassisches Interface-Territorium.
interface Cacheable {
  getKey(): string;
  getTTL(): number;
}

class UserCache implements Cacheable {
  constructor(private userId: string) {}

  getKey(): string {
    return `user:${this.userId}`;
  }

  getTTL(): number {
    return 3600; // 1 Stunde
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

// Test 1
const m1: HttpMethod = "GET";
const m2: HttpMethod = "POST";
console.log(`HttpMethod: ${m1}, ${m2}`);

// Test 2
const testUser: User = { id: "1", name: "Max", email: "max@test.de", isActive: true };
console.log(`User: ${testUser.name}`);

// Test 3
const success: Result<string> = { success: true, data: "hallo" };
const failure: Result<string> = { success: false, error: "Fehler!" };
console.log(`Erfolg: ${success.success}, Fehler: ${failure.success}`);

// Test 4
const article: Article = {
  title: "TypeScript Basics",
  content: "...",
  author: "Max",
  createdAt: new Date(),
  updatedAt: new Date(),
};
console.log(`Article: ${article.title} von ${article.author}`);

// Test 5
const nullableUser: Nullable<User> = {
  id: "1",
  name: null,
  email: null,
  isActive: null,
};
console.log(`Nullable: ${nullableUser.name ?? "kein Name"}`);

// Test 6
const berlin: Coordinate = [52.52, 13.405];
console.log(`Berlin: ${berlin[0]}, ${berlin[1]}`);

// Test 7
const timeout: Seconds = 30;
const site: Url = "https://example.com";
const progress: Percentage = 75;
console.log(`Timeout: ${timeout}s, URL: ${site}, Progress: ${progress}%`);

// Test 8
const cache = new UserCache("usr-001");
console.log(`Cache Key: ${cache.getKey()}`);
console.log(`Cache TTL: ${cache.getTTL()}`);

console.log("\nAlle Tests bestanden!");
