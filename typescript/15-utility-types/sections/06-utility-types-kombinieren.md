# Sektion 6: Utility Types kombinieren

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [05 - Eigene Utility Types](./05-eigene-utility-types.md)
> Naechste Sektion: -- (Ende der Lektion)

---

## Was du hier lernst

- **Composition**: Mehrere Utility Types verschachteln
- **Pick + Partial**: Bestimmte Felder optional machen
- **Omit + Required**: Bestimmte Felder verpflichtend machen
- Praxis-Patterns fuer **Forms**, **APIs** und **State Management**
- Das "Swiss Army Knife"-Pattern fuer flexible Typ-Transformationen

---

## Das Prinzip: Composition

Utility Types sind wie Funktionen — man kann sie **verschachteln**:

```typescript annotated
interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: "admin" | "user";
}

// Readonly + Partial = Unveraenderliches Partial-Update
type ReadonlyPartialUser = Readonly<Partial<User>>;

// Pick + Required = Bestimmte Felder als Pflicht
type RequiredNameEmail = Required<Pick<User, "name" | "email">>;
// ^ { name: string; email: string }  — beide required
```

---

## Pattern 1: Bestimmte Felder optional, Rest required

Typisch fuer **Update-Formulare** wo id required ist, aber alles andere optional:

```typescript annotated
// "K bleibt required, der Rest wird optional"
type PartialExcept<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;

type UserUpdate = PartialExcept<User, "id">;
// ^ { id: number } & { name?: string; email?: string; avatar?: string; bio?: string; role?: "admin" | "user" }

function updateUser(data: PartialExcept<User, "id">): void {
  console.log(`Updating user ${data.id}`);
  // data.id ist GARANTIERT vorhanden
  // data.name ist optional
}

updateUser({ id: 1 });                          // OK — nur id
updateUser({ id: 1, name: "Max" });              // OK — id + name
// updateUser({ name: "Max" });                  // Error! id fehlt!
```

### Pattern 2: Bestimmte Felder required, Rest optional

Das Gegenteil — fuer **Formulare mit Mindestanforderungen**:

```typescript annotated
// "K wird required, der Rest bleibt wie es ist"
type RequireKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

type UserWithAvatar = RequireKeys<User, "avatar">;
// avatar ist jetzt string (nicht mehr string | undefined)!

function displayProfile(user: RequireKeys<User, "avatar" | "bio">): void {
  // avatar und bio sind GARANTIERT vorhanden
  console.log(`Avatar: ${user.avatar}, Bio: ${user.bio}`);
}
```

---

## Pattern 3: Create-Input-Typ (ohne Server-generierte Felder)

Fuer API-Calls wo `id` und `createdAt` vom Server kommen:

```typescript annotated
interface Article {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
}

// Felder die der Server setzt:
type ServerGenerated = "id" | "createdAt" | "updatedAt";

// Create: Ohne Server-Felder, published optional
type CreateArticle = Omit<Article, ServerGenerated> & { published?: boolean };

// Update: id required, Rest optional
type UpdateArticle = Pick<Article, "id"> & Partial<Omit<Article, "id" | ServerGenerated>>;

function createArticle(input: CreateArticle): Article {
  return {
    ...input,
    id: Math.random(),
    published: input.published ?? false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
```

---

## Pattern 4: Form-State mit Validierung

```typescript annotated
interface FormFields {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Form-State: Alle Felder optional (noch nicht ausgefuellt)
type FormState = Partial<FormFields>;

// Validierter State: Alles ausgefuellt
type ValidatedForm = Required<FormFields>;

// Fehler-Map: Fuer jedes Feld ein optionaler Fehler-String
type FormErrors = Partial<Record<keyof FormFields, string>>;

// Touched-State: Welche Felder wurden beruehrt?
type TouchedFields = Partial<Record<keyof FormFields, boolean>>;

interface FormStore {
  values: FormState;
  errors: FormErrors;
  touched: TouchedFields;
  isValid: boolean;
}
```

> 🧠 **Erklaere dir selbst:** Warum ist `Record<keyof FormFields, string>`
> besser als `{ [key: string]: string }` fuer die Fehler-Map?
> **Kernpunkte:** Record mit keyof erlaubt nur die echten Feldnamen | Index Signature erlaubt beliebige Strings | Tippfehler werden bei Record erkannt | Record ist selbst-dokumentierend

---

## Pattern 5: API-Response-Transformation

```typescript annotated
// Server-Response (snake_case, alle Felder):
interface ApiUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  is_admin: boolean;
}

// Frontend-Modell (nur relevante Felder):
type UserViewModel = Pick<ApiUser, "id" | "email" | "is_admin">;

// Readonly fuer den Store:
type StoredUser = Readonly<UserViewModel>;

// Fuer Listen: Array von readonly Users
type UserList = readonly StoredUser[];
```

---

## Pattern 6: Das "Swiss Army Knife"-Pattern

Ein generischer Typ der mehrere Transformationen kombiniert:

```typescript annotated
/**
 * Flexible Typ-Transformation:
 * - R: Required Keys (muessen vorhanden sein)
 * - O: Optional Keys (duerfen fehlen)
 * - X: Excluded Keys (werden entfernt)
 */
type TransformType<T, R extends keyof T, O extends keyof T = never, X extends keyof T = never> =
  Required<Pick<T, R>> &
  Partial<Pick<T, O>> &
  Omit<T, R | O | X>;

// Beispiele:
type CreateUser = TransformType<User, "name" | "email", "avatar" | "bio", "id">;
// name + email: required
// avatar + bio: optional
// id: entfernt
// role: bleibt wie im Original (required)

type UpdateUser = TransformType<User, "id", "name" | "email" | "role", "avatar" | "bio">;
// id: required
// name + email + role: optional
// avatar + bio: entfernt
```

> 📖 **Hintergrund: Composition in der Praxis**
>
> In grossen Codebasen (Angular, React, Next.js) findet man diese Patterns
> ueberall. Statt fuer jede API-Operation einen separaten Typ manuell
> zu definieren, leitet man sie alle aus einem Basis-Typ ab. Das
> garantiert Konsistenz und reduziert Wartungsaufwand drastisch.

---

## Zusammenfassung der Patterns

| Pattern | Kombination | Einsatz |
|---|---|---|
| Partial except K | `Pick<T,K> & Partial<Omit<T,K>>` | Update mit required id |
| Require keys K | `Omit<T,K> & Required<Pick<T,K>>` | Pflichtfelder erzwingen |
| Create input | `Omit<T, ServerKeys>` | Neue Entitaeten anlegen |
| Form state | `Partial<T>` + `Record<keyof T, E>` | Formulare mit Validierung |
| Readonly store | `Readonly<Pick<T, K>>` | Immutable View-Models |

---

## Was du gelernt hast

- Utility Types lassen sich **verschachteln** wie Funktionen
- **Pick + Partial** und **Omit + Required** sind die haeufigsten Kombinationen
- **PartialExcept** und **RequireKeys** loesen 90% der Form/API-Probleme
- **Record\<keyof T, V\>** erzeugt typsichere Maps ueber alle Felder
- Das "Swiss Army Knife"-Pattern kombiniert Required + Partial + Omit

> 🧠 **Erklaere dir selbst:** Warum ist `Pick<T, K> & Partial<Omit<T, K>>`
> nicht dasselbe wie `Partial<T> & Required<Pick<T, K>>`?
> **Kernpunkte:** Erstes: K bleibt exakt wie in T, Rest wird optional | Zweites: K wird explizit required (auch wenn es in T optional war!) | Bei optionalen Keys in T macht das einen Unterschied | Beide Patterns haben ihre Berechtigung

**Kernkonzept zum Merken:** Die wahre Kraft der Utility Types liegt nicht in den einzelnen Types, sondern in ihrer Komposition. Denke in Transformationsketten: Basis-Typ -> Pick/Omit -> Partial/Required -> Readonly.

> **Experiment:** Oeffne `examples/06-utility-types-kombinieren.ts` und
> baue einen `FormType<T, RequiredFields, OptionalFields>` der alle
> drei Concerns vereint.

---

> **Ende der Lektion** — Du beherrschst jetzt TypeScripts Utility Types!
>
> Naechste Schritte:
> 1. Exercises in `exercises/` durcharbeiten
> 2. Quiz mit `npx tsx quiz.ts` testen
> 3. Cheatsheet als Referenz behalten
>
> **Naechste Lektion:** 16 — Mapped Types & Conditional Types
