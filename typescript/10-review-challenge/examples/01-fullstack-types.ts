export {};

/**
 * Lektion 10 - Beispiel 01: Fullstack Type System
 *
 * Ein komplettes Typsystem fuer eine Blog-Plattform.
 * Verwendet ALLE Phase-1-Konzepte:
 *
 * - Interfaces & Type Aliases (L05, L08)
 * - Optional & Readonly Properties (L05)
 * - Union & Intersection Types (L07)
 * - Discriminated Unions (L07)
 * - Literal Types & as const (L09)
 * - Function Overloads (L06)
 * - Arrays & Tuples (L04)
 * - Type Annotations & Inference (L03)
 * - Exhaustive Checks mit never (L09)
 *
 * Ausfuehren: npx tsx examples/01-fullstack-types.ts
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 1. BASISTYPEN — Literal Types & as const (L09)
// ═══════════════════════════════════════════════════════════════════════════════

const USER_ROLES = ["admin", "editor", "reader"] as const;
type UserRole = (typeof USER_ROLES)[number]; // "admin" | "editor" | "reader"

const POST_STATUS = ["draft", "published", "archived"] as const;
type PostStatus = (typeof POST_STATUS)[number];

// Typ-sichere Permissions Map
const ROLE_PERMISSIONS = {
  admin: ["read", "write", "delete", "manage_users"],
  editor: ["read", "write"],
  reader: ["read"],
} as const;

type Permission = (typeof ROLE_PERMISSIONS)[UserRole][number];

console.log("=== Literal Types & as const ===");
console.log("User Roles:", USER_ROLES);
console.log("Post Status:", POST_STATUS);

// ═══════════════════════════════════════════════════════════════════════════════
// 2. INTERFACES — Structural Typing & Composition (L05, L08)
// ═══════════════════════════════════════════════════════════════════════════════

// Basis-Interfaces fuer Wiederverwendung (Intersection-Bausteine)
interface HasId {
  readonly id: string;
}

interface HasTimestamps {
  readonly createdAt: Date;
  updatedAt: Date;
}

interface HasAuthor {
  authorId: string;
}

// Zusammengesetzt mit Intersection (L07)
type Entity = HasId & HasTimestamps;

// User Interface — optional, readonly, nested (L05)
interface UserProfile {
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  social?: {
    twitter?: string;
    github?: string;
    website?: string;
  };
}

interface User extends HasId, HasTimestamps {
  email: string;
  role: UserRole; // Literal Type (L09)
  profile: UserProfile;
  readonly registeredAt: Date;
}

// Post mit Discriminated Union fuer Status (L07)
interface BasePost extends HasId, HasTimestamps, HasAuthor {
  title: string;
  content: string;
  tags: readonly string[]; // readonly Array (L04)
}

interface DraftPost extends BasePost {
  status: "draft";
  publishedAt?: never; // Draft hat kein publishedAt
}

interface PublishedPost extends BasePost {
  status: "published";
  publishedAt: Date;
  slug: string;
}

interface ArchivedPost extends BasePost {
  status: "archived";
  publishedAt: Date;
  archivedAt: Date;
  archiveReason: string;
}

// Discriminated Union (L07)
type Post = DraftPost | PublishedPost | ArchivedPost;

// Comment mit verschachtelten Replies
interface Comment extends Entity, HasAuthor {
  postId: string;
  body: string;
  parentCommentId?: string; // Optional fuer Reply-Ketten (L05)
  likes: number;
  edited: boolean;
}

console.log("\n=== Interfaces & Composition ===");

const exampleUser: User = {
  id: "u-001",
  email: "max@example.com",
  role: "editor",
  profile: {
    displayName: "Max Mustermann",
    bio: "TypeScript-Enthusiast",
    social: { github: "maxmuster" },
  },
  registeredAt: new Date("2024-01-15"),
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2025-03-01"),
};

console.log(`User: ${exampleUser.profile.displayName} (${exampleUser.role})`);

// ═══════════════════════════════════════════════════════════════════════════════
// 3. DISCRIMINATED UNION — Exhaustive Handling (L07, L09)
// ═══════════════════════════════════════════════════════════════════════════════

// Funktion die JEDEN Post-Status sicher behandelt
function getPostSummary(post: Post): string {
  switch (post.status) {
    case "draft":
      return `[ENTWURF] "${post.title}" — noch nicht veroeffentlicht`;
    case "published":
      return `"${post.title}" — veroeffentlicht am ${post.publishedAt.toLocaleDateString()}`;
    case "archived":
      return `[ARCHIV] "${post.title}" — Grund: ${post.archiveReason}`;
    default: {
      // Exhaustive Check: Wenn ein neuer Status hinzukommt, meldet der Compiler hier einen Fehler
      const _exhaustive: never = post;
      return _exhaustive;
    }
  }
}

const draftPost: DraftPost = {
  id: "p-001",
  title: "TypeScript Phase 2 Preview",
  content: "Generics sind...",
  tags: ["typescript", "tutorial"],
  status: "draft",
  authorId: "u-001",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const publishedPost: PublishedPost = {
  id: "p-002",
  title: "Phase 1 abgeschlossen!",
  content: "Nach 10 Lektionen...",
  tags: ["typescript", "milestone"] as const,
  status: "published",
  publishedAt: new Date("2025-03-15"),
  slug: "phase-1-abgeschlossen",
  authorId: "u-001",
  createdAt: new Date("2025-03-10"),
  updatedAt: new Date("2025-03-15"),
};

console.log("\n=== Discriminated Union Posts ===");
console.log(getPostSummary(draftPost));
console.log(getPostSummary(publishedPost));

// ═══════════════════════════════════════════════════════════════════════════════
// 4. FUNCTION OVERLOADS — Praezise APIs (L06)
// ═══════════════════════════════════════════════════════════════════════════════

// Overload: Einzelnen Post oder Array von Posts finden
function findPosts(filter: { id: string }): Post | undefined;
function findPosts(filter: { authorId: string }): Post[];
function findPosts(filter: { tag: string }): Post[];
function findPosts(
  filter: { id: string } | { authorId: string } | { tag: string }
): Post | Post[] | undefined {
  const allPosts: Post[] = [draftPost, publishedPost];

  if ("id" in filter) {
    return allPosts.find((p) => p.id === filter.id);
  }
  if ("authorId" in filter) {
    return allPosts.filter((p) => p.authorId === filter.authorId);
  }
  if ("tag" in filter) {
    return allPosts.filter((p) => p.tags.includes(filter.tag));
  }
  return [];
}

console.log("\n=== Function Overloads ===");

// Dank Overloads weiss TypeScript den genauen Return Type:
const singlePost = findPosts({ id: "p-001" }); // Post | undefined
const userPosts = findPosts({ authorId: "u-001" }); // Post[]
const taggedPosts = findPosts({ tag: "typescript" }); // Post[]

console.log(`Einzelner Post: ${singlePost?.title}`);
console.log(`Posts von User: ${userPosts.length}`);
console.log(`Posts mit Tag: ${taggedPosts.length}`);

// ═══════════════════════════════════════════════════════════════════════════════
// 5. TUPLES — Strukturierte Rueckgabewerte (L04)
// ═══════════════════════════════════════════════════════════════════════════════

// Tuple als Return Type: [Erfolg-Daten, Fehler]
type Result<T> = [T, null] | [null, string];

function validateUser(data: unknown): Result<User> {
  if (typeof data !== "object" || data === null) {
    return [null, "Input muss ein Objekt sein"];
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj["email"] !== "string") {
    return [null, "Email ist erforderlich"];
  }

  if (!USER_ROLES.includes(obj["role"] as UserRole)) {
    return [null, `Ungueltige Rolle: ${obj["role"]}`];
  }

  // Vereinfacht — in der Praxis wuerdest du alle Felder pruefen
  return [obj as unknown as User, null];
}

console.log("\n=== Tuple Results ===");

const [user, error] = validateUser({ email: "test@test.de", role: "admin" });
if (error) {
  console.log(`Validierungsfehler: ${error}`);
} else {
  console.log(`Valider User: ${user.email}`);
}

const [, error2] = validateUser("keine Daten");
console.log(`Erwarteter Fehler: ${error2}`);

// ═══════════════════════════════════════════════════════════════════════════════
// 6. INDEX SIGNATURES + MAPPED PERMISSIONS (L05)
// ═══════════════════════════════════════════════════════════════════════════════

// Dynamisches Berechtigungssystem
interface PermissionMap {
  [resource: string]: {
    read: boolean;
    write: boolean;
    delete: boolean;
  };
}

function buildPermissions(role: UserRole): PermissionMap {
  const base: PermissionMap = {
    posts: { read: true, write: false, delete: false },
    comments: { read: true, write: false, delete: false },
    users: { read: false, write: false, delete: false },
  };

  switch (role) {
    case "admin":
      base.posts = { read: true, write: true, delete: true };
      base.comments = { read: true, write: true, delete: true };
      base.users = { read: true, write: true, delete: true };
      break;
    case "editor":
      base.posts = { read: true, write: true, delete: false };
      base.comments = { read: true, write: true, delete: true };
      break;
    case "reader":
      // Basis-Rechte bleiben
      base.comments.write = true; // Reader duerfen Kommentare schreiben
      break;
  }

  return base;
}

console.log("\n=== Permission System ===");
console.log("Admin:", JSON.stringify(buildPermissions("admin").posts));
console.log("Editor:", JSON.stringify(buildPermissions("editor").posts));
console.log("Reader:", JSON.stringify(buildPermissions("reader").posts));

// ═══════════════════════════════════════════════════════════════════════════════
// 7. ALLES ZUSAMMEN — API Response Handler
// ═══════════════════════════════════════════════════════════════════════════════

// API Response als Discriminated Union
type ApiResponse<T> =
  | { status: "loading" }
  | { status: "success"; data: T; meta: { total: number; page: number } }
  | { status: "error"; error: string; code: number };

function handleResponse(response: ApiResponse<Post[]>): string {
  switch (response.status) {
    case "loading":
      return "Laden...";
    case "success":
      return `${response.data.length} Posts geladen (Seite ${response.meta.page})`;
    case "error":
      return `Fehler ${response.code}: ${response.error}`;
  }
}

console.log("\n=== API Response Handler ===");
console.log(handleResponse({ status: "loading" }));
console.log(
  handleResponse({
    status: "success",
    data: [draftPost, publishedPost],
    meta: { total: 42, page: 1 },
  })
);
console.log(
  handleResponse({
    status: "error",
    error: "Nicht autorisiert",
    code: 401,
  })
);

console.log("\n=== Fazit ===");
console.log(
  "Dieses Beispiel nutzt ALLE Phase-1-Konzepte in einem realistischen Szenario."
);
console.log("Interfaces, Unions, Literals, Overloads, Tuples, as const, never — alles drin!");
