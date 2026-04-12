/**
 * Lektion 15 - Exercise 06: Utility Types kombinieren
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/06-utility-types-kombinieren.ts
 *
 * 6 Aufgaben zur Composition von Utility Types.
 * Ersetze alle TODO-Kommentare mit der richtigen Loesung.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: PartialExcept implementieren
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

// TODO: Implementiere PartialExcept<T, K> — K bleibt required, Rest optional
// type PartialExcept<T, K extends keyof T> = ...

// TODO: Erstelle einen Typ "TaskUpdate" wo nur "id" required ist
// type TaskUpdate = ...

// TODO: Erstelle eine Funktion updateTask
// function updateTask(update: TaskUpdate): void { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: RequireKeys implementieren
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

// TODO: Implementiere RequireKeys<T, K> — macht K required, Rest bleibt
// type RequireKeys<T, K extends keyof T> = ...

// TODO: Erstelle einen Typ "CompleteProfile" wo avatar und bio required sind
// type CompleteProfile = ...

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: API CRUD-Typen aus einem Basis-Interface ableiten
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

// TODO: Erstelle folgende Typen durch Kombination:
// 1. CreateArticle: Ohne id, createdAt, updatedAt, slug (Server-generiert)
// type CreateArticle = ...

// 2. UpdateArticle: id required, title/content/tags/published optional, Rest weg
// type UpdateArticle = ...

// 3. ArticlePreview: Nur id, title, author, published, createdAt — und readonly
// type ArticlePreview = ...

// 4. ArticleSearchResult: ArticlePreview + ein relevance-Score
// type ArticleSearchResult = ...

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Form-State-System bauen
// ═══════════════════════════════════════════════════════════════════════════

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  urgency: "low" | "medium" | "high";
}

// TODO: Erstelle die folgenden Form-Hilfstypen:
// 1. FormState: Alle Felder optional (noch nicht ausgefuellt)
// type FormState = ...

// 2. FormErrors: Fuer jedes Feld ein optionaler Fehler-String
// type FormErrors = ...

// 3. TouchedFields: Fuer jedes Feld ein optionaler boolean
// type TouchedFields = ...

// 4. FormStore: Kombiniert values, errors, touched und isValid
// interface FormStore {
//   values: FormState;
//   errors: FormErrors;
//   touched: TouchedFields;
//   isValid: boolean;
// }

// TODO: Erstelle eine Funktion "createFormStore" die einen leeren Store zurueckgibt
// function createFormStore(): FormStore { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: ReadonlyDeep + Pick fuer View-Models
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

// TODO: Erstelle einen DeepReadonly-Typ (aus Sektion 05)
// type DeepReadonly<T> = ...

// TODO: Erstelle ein ViewModel das readonly ist und nur bestimmte Felder hat:
// OrderListItem: Nur id, total, status, createdAt — deep readonly
// type OrderListItem = ...

// OrderDetail: Alles ausser customerId — deep readonly
// type OrderDetail = ...

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 6: Das Swiss Army Knife Pattern
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere TransformType<T, R, O, X>:
// R = Required keys (muessen vorhanden sein)
// O = Optional keys (duerfen fehlen)
// X = Excluded keys (werden entfernt)
// Rest: bleibt wie im Original
// type TransformType<T, R extends keyof T, O extends keyof T = never, X extends keyof T = never> = ...

// Teste mit Article:
// type CreateViaTransform = TransformType<Article, "title" | "content" | "author", "tags" | "published", "id" | "createdAt" | "updatedAt" | "slug">;
// title, content, author: required
// tags, published: optional
// id, createdAt, updatedAt, slug: entfernt

// ═══════════════════════════════════════════════════════════════════════════
// TESTS — Entkommentiere nach der Implementierung
// ═══════════════════════════════════════════════════════════════════════════

// console.log("--- Tests ---");
// updateTask({ id: 1, title: "Updated Title" });
// updateTask({ id: 2 }); // Nur id
//
// const store = createFormStore();
// console.log("Empty form store:", store);
//
// console.log("All exercises completed!");

console.log("Exercise 06 geladen. Ersetze die TODOs!");
