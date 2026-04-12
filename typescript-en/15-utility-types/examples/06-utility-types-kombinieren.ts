/**
 * Lektion 15 - Example 06: Utility Types kombinieren
 *
 * Ausfuehren mit: npx tsx examples/06-utility-types-kombinieren.ts
 *
 * Composition-Patterns: Pick + Partial, Omit + Required, Forms & APIs.
 */

// ─── BASIS-INTERFACE ────────────────────────────────────────────────────────

interface Article {
  id: number;
  title: string;
  content: string;
  author: string;
  tags: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── PATTERN 1: PARTIALEXCEPT — K BLEIBT REQUIRED ──────────────────────────

type PartialExcept<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;

type ArticleUpdate = PartialExcept<Article, "id">;
// ^ id ist REQUIRED, alles andere optional

function updateArticle(data: PartialExcept<Article, "id">): void {
  console.log(`Updating article ${data.id}:`, Object.keys(data).filter(k => k !== "id").join(", "));
}

updateArticle({ id: 1, title: "Updated Title" });           // OK
updateArticle({ id: 2, published: true });                    // OK
updateArticle({ id: 3 });                                     // OK — nur id
// updateArticle({ title: "Orphan" });                        // Error! id fehlt

// ─── PATTERN 2: REQUIREKEYS — K WIRD REQUIRED ──────────────────────────────

type RequireKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

interface UserSettings {
  theme?: "light" | "dark";
  language?: string;
  notifications?: boolean;
  fontSize?: number;
}

type UserWithTheme = RequireKeys<UserSettings, "theme" | "language">;
// theme und language sind jetzt required!

function applySettings(settings: UserWithTheme): void {
  console.log(`Theme: ${settings.theme}, Language: ${settings.language}`);
}

applySettings({ theme: "dark", language: "de" });                          // OK
applySettings({ theme: "light", language: "en", notifications: true });    // OK
// applySettings({ language: "de" });                                      // Error! theme fehlt

// ─── PATTERN 3: CREATE-INPUT ────────────────────────────────────────────────

type ServerGenerated = "id" | "createdAt" | "updatedAt";

type CreateArticleInput = Omit<Article, ServerGenerated>;

function createArticle(input: CreateArticleInput): Article {
  const article: Article = {
    ...input,
    id: Math.floor(Math.random() * 10000),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  console.log(`Created article "${article.title}" with id ${article.id}`);
  return article;
}

createArticle({
  title: "TypeScript Utility Types",
  content: "Ein umfassender Guide...",
  author: "Max",
  tags: ["typescript", "types"],
  published: false,
});

// ─── PATTERN 4: FORM-STATE ──────────────────────────────────────────────────

interface FormFields {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type FormState = Partial<FormFields>;
type FormErrors = Partial<Record<keyof FormFields, string>>;
type TouchedFields = Partial<Record<keyof FormFields, boolean>>;

interface FormStore {
  values: FormState;
  errors: FormErrors;
  touched: TouchedFields;
  isValid: boolean;
}

const initialForm: FormStore = {
  values: {},
  errors: {},
  touched: {},
  isValid: false,
};

function setField<K extends keyof FormFields>(
  store: FormStore,
  field: K,
  value: FormFields[K],
): FormStore {
  return {
    ...store,
    values: { ...store.values, [field]: value },
    touched: { ...store.touched, [field]: true },
  };
}

let form = initialForm;
form = setField(form, "username", "MaxMustermann");
form = setField(form, "email", "max@example.com");
console.log("Form values:", form.values);
console.log("Touched fields:", form.touched);

// ─── PATTERN 5: API-RESPONSE-TRANSFORMATION ─────────────────────────────────

interface ApiArticle {
  id: number;
  title: string;
  content: string;
  author_name: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  view_count: number;
}

// Fuer die Liste: Nur Preview-Felder, readonly
type ArticlePreview = Readonly<Pick<ApiArticle, "id" | "title" | "author_name" | "is_published">>;

// Fuer den Editor: Ohne Server-generierte Felder
type ArticleEditInput = Omit<ApiArticle, "id" | "created_at" | "updated_at" | "view_count">;

function renderPreview(article: ArticlePreview): void {
  console.log(`[${article.is_published ? "Published" : "Draft"}] ${article.title} by ${article.author_name}`);
}

renderPreview({ id: 1, title: "Hello World", author_name: "Anna", is_published: true });

// ─── PATTERN 6: SWISS ARMY KNIFE ───────────────────────────────────────────

type TransformType<
  T,
  R extends keyof T,
  O extends keyof T = never,
  X extends keyof T = never,
> = Required<Pick<T, R>> & Partial<Pick<T, O>> & Omit<T, R | O | X>;

// Create: title + content required, published optional, kein id/timestamps
type CreateInput = TransformType<Article, "title" | "content" | "author", "published" | "tags", ServerGenerated>;

// Update: id required, alles andere optional, keine timestamps
type UpdateInput = TransformType<Article, "id", "title" | "content" | "author" | "tags" | "published", ServerGenerated>;

function create(input: CreateInput): void {
  console.log(`Creating: "${input.title}" by ${input.author}`);
}

function update(input: UpdateInput): void {
  console.log(`Updating article ${input.id}`);
}

create({
  title: "New Article",
  content: "Lorem ipsum...",
  author: "Max",
  tags: ["draft"],
});

update({ id: 42, title: "Updated Title" });
update({ id: 43 }); // Nur id — Rest optional

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
