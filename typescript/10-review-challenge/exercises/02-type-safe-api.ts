export {};

/**
 * Lektion 10 - Exercise 02: Typsichere API-Funktionen
 *
 * INTEGRATIONS-CHALLENGE: Baue eine typsichere API-Schicht mit Overloads,
 * Union Returns und Discriminated Unions fuer Response-States.
 *
 * Konzepte die du brauchst:
 * - Function Overloads (L06)
 * - Union Types & Discriminated Unions (L07)
 * - Interfaces (L05)
 * - Literal Types (L09)
 * - as const (L09)
 * - Tuples (L04)
 * - Type Narrowing (L07)
 *
 * Ausfuehren: npx tsx exercises/02-type-safe-api.ts
 */

// ═══════════════════════════════════════════════════════════════════════════════
// GEGEBEN: Datenmodell
// ═══════════════════════════════════════════════════════════════════════════════

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
}

interface Post {
  id: string;
  title: string;
  body: string;
  authorId: string;
  status: "draft" | "published";
  tags: string[];
}

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  text: string;
  createdAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUFGABE 1: API Response als Discriminated Union
// ═══════════════════════════════════════════════════════════════════════════════
//
// Erstelle einen ApiResponse-Typ als Discriminated Union mit folgenden Zustaenden:
//
// a) Loading:   { status: "loading" }
// b) Success:   { status: "success"; data: T; timestamp: Date }
// c) Error:     { status: "error"; error: string; code: number }
// d) NotFound:  { status: "not_found"; resource: string; id: string }
//
// Hinweis: Du kannst hier noch keine echten Generics (<T>) verwenden
// (das kommt in Phase 2). Erstelle stattdessen konkrete Varianten:
//
// type UserResponse = ... (mit data: User)
// type UsersResponse = ... (mit data: User[])
// type PostResponse = ... (mit data: Post)
// type PostsResponse = ... (mit data: Post[])
// type CommentResponse = ... (mit data: Comment)
// type CommentsResponse = ... (mit data: Comment[])

// TODO: Erstelle die Response-Typen hier

// ═══════════════════════════════════════════════════════════════════════════════
// AUFGABE 2: HTTP Methoden als Literal Types
// ═══════════════════════════════════════════════════════════════════════════════
//
// a) Erstelle HTTP_METHODS mit as const: ["GET", "POST", "PUT", "PATCH", "DELETE"]
// b) Leite den Typ HttpMethod daraus ab
// c) Erstelle STATUS_CODES als const Object:
//    { OK: 200, CREATED: 201, BAD_REQUEST: 400, NOT_FOUND: 404,
//      UNAUTHORIZED: 401, SERVER_ERROR: 500 }
// d) Leite StatusCode als Union aller Werte ab

// TODO: Erstelle die HTTP-Typen hier

// ═══════════════════════════════════════════════════════════════════════════════
// AUFGABE 3: API Endpoint Konfiguration
// ═══════════════════════════════════════════════════════════════════════════════
//
// Erstelle ein Interface ApiEndpoint mit:
//   - path: string
//   - method: HttpMethod
//   - requiresAuth: boolean
//   - description: string
//
// Erstelle dann ENDPOINTS als const Object mit diesen Eintraegen:
//
//   getUsers:     { path: "/users",         method: "GET",    requiresAuth: true,  description: "Alle User laden" }
//   getUser:      { path: "/users/:id",     method: "GET",    requiresAuth: true,  description: "Einzelnen User laden" }
//   createUser:   { path: "/users",         method: "POST",   requiresAuth: true,  description: "User erstellen" }
//   getPosts:     { path: "/posts",         method: "GET",    requiresAuth: false, description: "Alle Posts laden" }
//   getPost:      { path: "/posts/:id",     method: "GET",    requiresAuth: false, description: "Einzelnen Post laden" }
//   createPost:   { path: "/posts",         method: "POST",   requiresAuth: true,  description: "Post erstellen" }
//   getComments:  { path: "/posts/:id/comments", method: "GET", requiresAuth: false, description: "Kommentare laden" }
//
// Leite EndpointName als Union aller Keys ab.

// TODO: Erstelle ApiEndpoint und ENDPOINTS hier

// ═══════════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Typsichere API-Funktionen mit Overloads
// ═══════════════════════════════════════════════════════════════════════════════
//
// Erstelle eine Funktion `fetchApi` mit folgenden Overloads:
//
//   fetchApi(endpoint: "getUsers"): UsersResponse
//   fetchApi(endpoint: "getUser", id: string): UserResponse
//   fetchApi(endpoint: "createUser", id: undefined, body: Omit<User, "id">): UserResponse
//   fetchApi(endpoint: "getPosts"): PostsResponse
//   fetchApi(endpoint: "getPost", id: string): PostResponse
//   fetchApi(endpoint: "createPost", id: undefined, body: Omit<Post, "id">): PostResponse
//   fetchApi(endpoint: "getComments", id: string): CommentsResponse
//
// Die Implementation soll simulierte Daten zurueckgeben (nicht echte API-Calls).
// Verwende die STATUS_CODES-Konstante fuer die Fehlercodes.

// TODO: Implementiere fetchApi mit Overloads hier

// ═══════════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Response Handler
// ═══════════════════════════════════════════════════════════════════════════════
//
// a) handleUserResponse(response: UserResponse): string
//    — Exhaustive switch ueber response.status
//    — Loading: "Lade User..."
//    — Success: "User: {name} ({email})"
//    — Error: "Fehler {code}: {error}"
//    — NotFound: "User {id} nicht gefunden"
//
// b) handlePostsResponse(response: PostsResponse): string
//    — Aehnlich, aber fuer Post-Listen
//    — Success: "{count} Posts geladen"
//
// c) isSuccessResponse(response): boolean
//    — Type Guard der prueft ob status === "success" ist
//    — Hinweis: Du kannst noch keinen vollen Type Guard mit `is` schreiben
//      (das kommt in Phase 2), aber du kannst die Logik implementieren

// TODO: Implementiere die Response Handler hier

// ═══════════════════════════════════════════════════════════════════════════════
// AUFGABE 6: Request Builder
// ═══════════════════════════════════════════════════════════════════════════════
//
// Erstelle ein Interface RequestConfig:
//   - endpoint: EndpointName
//   - params?: Record<string, string>  (URL Parameter)
//   - headers?: Record<string, string>
//   - body?: Record<string, unknown>   (nur fuer POST/PUT/PATCH)
//   - timeout?: number                 (in ms, optional)
//
// Erstelle eine Funktion buildRequest(config: RequestConfig): string
// Die den vollstaendigen Request als lesbaren String zurueckgibt:
//   "GET /users (Auth: true, Timeout: 5000ms)"
//   "POST /posts (Auth: true, Body: {title, body, ...})"
//
// Nutze die ENDPOINTS-Konstante um Method und Path zu ermitteln.

// TODO: Implementiere RequestConfig und buildRequest hier

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS — Entkommentiere diese, wenn du fertig bist!
// ═══════════════════════════════════════════════════════════════════════════════

/*
// Test: Response Handler
const successResponse: UserResponse = {
  status: "success",
  data: { id: "u-1", name: "Max", email: "max@test.de", role: "admin" },
  timestamp: new Date(),
};
console.log(handleUserResponse(successResponse));
console.assert(
  handleUserResponse(successResponse) === "User: Max (max@test.de)",
  "User Response Handler fehlgeschlagen"
);

const errorResponse: UserResponse = {
  status: "error",
  error: "Nicht autorisiert",
  code: 401,
};
console.log(handleUserResponse(errorResponse));

const notFoundResponse: UserResponse = {
  status: "not_found",
  resource: "User",
  id: "u-999",
};
console.log(handleUserResponse(notFoundResponse));

// Test: Request Builder
console.log(buildRequest({ endpoint: "getUsers" }));
console.log(buildRequest({ endpoint: "createPost", body: { title: "Test" }, timeout: 10000 }));

// Test: fetchApi
const usersResponse = fetchApi("getUsers");
console.log(`Users Response Status: ${usersResponse.status}`);

const postResponse = fetchApi("getPost", "p-1");
console.log(`Post Response Status: ${postResponse.status}`);

// Test: Literal Types
const method: HttpMethod = "GET"; // OK
// const bad: HttpMethod = "PATCH2"; // Wuerde nicht kompilieren

console.log("\nAlle Tests bestanden!");
*/
