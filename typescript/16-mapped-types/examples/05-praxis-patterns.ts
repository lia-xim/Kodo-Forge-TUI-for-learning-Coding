/**
 * Lektion 16 - Beispiel 05: Praxis-Patterns
 * Ausfuehren mit: npx tsx examples/05-praxis-patterns.ts
 */

// ─── Pattern 1: Form-Typen ───────────────────────────────────────────────

type FormErrors<T> = { [K in keyof T]?: string };
type FormTouched<T> = { [K in keyof T]: boolean };
type FormDirty<T> = { [K in keyof T]: boolean };

interface FormState<T> {
  values: T;
  errors: FormErrors<T>;
  touched: FormTouched<T>;
  dirty: FormDirty<T>;
  isValid: boolean;
}

interface LoginForm {
  email: string;
  password: string;
}

const loginState: FormState<LoginForm> = {
  values: { email: "", password: "" },
  errors: { email: "Email ist Pflichtfeld" },
  touched: { email: true, password: false },
  dirty: { email: true, password: false },
  isValid: false,
};

console.log("Form State:", loginState);

// ─── Pattern 2: API-Transformationen ──────────────────────────────────────

interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

type CreateDTO<T extends BaseEntity> = Omit<T, keyof BaseEntity>;
type UpdateDTO<T extends BaseEntity> = Partial<Omit<T, keyof BaseEntity>>;
type ResponseDTO<T extends BaseEntity> = {
  [K in keyof T]: T[K] extends Date ? string : T[K];
};

interface Product extends BaseEntity {
  name: string;
  price: number;
  category: string;
}

const createProduct: CreateDTO<Product> = {
  name: "Laptop",
  price: 999,
  category: "Electronics",
};

const updateProduct: UpdateDTO<Product> = {
  price: 899, // Nur den Preis aendern
};

console.log("Create:", createProduct);
console.log("Update:", updateProduct);

// ─── Pattern 3: Event Map ableiten ────────────────────────────────────────

type EventMap<T> = {
  [K in keyof T as `${string & K}Changed`]: {
    previousValue: T[K];
    newValue: T[K];
  };
};

interface Settings {
  theme: "light" | "dark";
  fontSize: number;
}

type SettingsEvents = EventMap<Settings>;
// { themeChanged: { ... }; fontSizeChanged: { ... }; }

function handleEvent<T, K extends keyof EventMap<T>>(
  _eventName: K,
  payload: EventMap<T>[K]
) {
  console.log("Event payload:", payload);
}

console.log("\n--- Praxis-Patterns abgeschlossen ---");
