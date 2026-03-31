/**
 * Lektion 15 - Solution 06: Utility Types kombinieren
 *
 * Ausfuehren mit: npx tsx solutions/06-utility-types-kombinieren.ts
 *
 * Vollstaendige Loesungen mit ausfuehrlichen deutschen Erklaerungen.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: PartialExcept
// ═══════════════════════════════════════════════════════════════════════════

interface Task {
  id: number;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  assignee: string;
  dueDate: Date;
  completed: boolean;
}

// Loesung: Pick fuer required Keys, Partial + Omit fuer den Rest
type PartialExcept<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;

type TaskUpdate = PartialExcept<Task, "id">;

function updateTask(update: TaskUpdate): void {
  console.log(`Updating task ${update.id}:`, Object.keys(update).filter(k => k !== "id").join(", ") || "(no changes)");
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: RequireKeys
// ═══════════════════════════════════════════════════════════════════════════

interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  website?: string;
  location?: string;
}

// Loesung: Omit entfernt die Keys, Required<Pick> macht sie required, & vereint
type RequireKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

type CompleteProfile = RequireKeys<UserProfile, "avatar" | "bio">;
// avatar und bio sind jetzt required!

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: API CRUD-Typen
// ═══════════════════════════════════════════════════════════════════════════

interface Article {
  id: number;
  title: string;
  content: string;
  author: string;
  tags: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  slug: string;
}

// 1. CreateArticle: Ohne Server-generierte Felder
type CreateArticle = Omit<Article, "id" | "createdAt" | "updatedAt" | "slug">;

// 2. UpdateArticle: id required, einige optional, Rest weg
type UpdateArticle = Pick<Article, "id"> & Partial<Pick<Article, "title" | "content" | "tags" | "published">>;

// 3. ArticlePreview: Nur bestimmte Felder, readonly
type ArticlePreview = Readonly<Pick<Article, "id" | "title" | "author" | "published" | "createdAt">>;

// 4. ArticleSearchResult: Preview + Score
type ArticleSearchResult = ArticlePreview & { relevance: number };

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Form-State-System
// ═══════════════════════════════════════════════════════════════════════════

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  urgency: "low" | "medium" | "high";
}

type FormState = Partial<ContactForm>;
type FormErrors = Partial<Record<keyof ContactForm, string>>;
type TouchedFields = Partial<Record<keyof ContactForm, boolean>>;

interface FormStore {
  values: FormState;
  errors: FormErrors;
  touched: TouchedFields;
  isValid: boolean;
}

function createFormStore(): FormStore {
  return {
    values: {},
    errors: {},
    touched: {},
    isValid: false,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: DeepReadonly + Pick fuer View-Models
// ═══════════════════════════════════════════════════════════════════════════

interface Order {
  id: number;
  customerId: number;
  items: { productId: number; name: string; quantity: number; price: number }[];
  subtotal: number;
  tax: number;
  total: number;
  status: "pending" | "paid" | "shipped" | "delivered";
  createdAt: Date;
}

type DeepReadonly<T> = T extends (infer U)[]
  ? readonly DeepReadonly<U>[]
  : T extends object
    ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
    : T;

// OrderListItem: Nur bestimmte Felder, deep readonly
type OrderListItem = DeepReadonly<Pick<Order, "id" | "total" | "status" | "createdAt">>;

// OrderDetail: Alles ausser customerId, deep readonly
type OrderDetail = DeepReadonly<Omit<Order, "customerId">>;

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 6: Swiss Army Knife Pattern
// ═══════════════════════════════════════════════════════════════════════════

// Loesung: Drei Teile mit & kombiniert
type TransformType<
  T,
  R extends keyof T,
  O extends keyof T = never,
  X extends keyof T = never,
> = Required<Pick<T, R>> & Partial<Pick<T, O>> & Omit<T, R | O | X>;

type CreateViaTransform = TransformType<
  Article,
  "title" | "content" | "author",          // Required
  "tags" | "published",                      // Optional
  "id" | "createdAt" | "updatedAt" | "slug"  // Excluded
>;
// title, content, author: required
// tags, published: optional
// id, createdAt, updatedAt, slug: entfernt

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

console.log("--- Tests ---");

updateTask({ id: 1, title: "Updated Title" });
updateTask({ id: 2 }); // Nur id

const store = createFormStore();
console.log("Empty form store:", store);

// CreateArticle Test:
const newArticle: CreateArticle = {
  title: "Test",
  content: "Lorem ipsum",
  author: "Max",
  tags: ["test"],
  published: false,
};
console.log("CreateArticle:", newArticle.title);

// UpdateArticle Test:
const articleUpdate: UpdateArticle = { id: 1, title: "New Title" };
console.log("UpdateArticle:", articleUpdate);

// ArticleSearchResult Test:
const searchResult: ArticleSearchResult = {
  id: 1,
  title: "TypeScript Guide",
  author: "Anna",
  published: true,
  createdAt: new Date(),
  relevance: 0.95,
};
console.log("SearchResult:", searchResult.title, "relevance:", searchResult.relevance);

// TransformType Test:
const created: CreateViaTransform = {
  title: "Swiss Army",
  content: "...",
  author: "Max",
};
console.log("TransformType:", created.title);

console.log("\n--- Alle Tests bestanden! ---");
