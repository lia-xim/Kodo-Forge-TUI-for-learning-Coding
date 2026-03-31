# Sektion 4: Entscheidungsmatrix

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Der grosse Vergleich](./03-der-grosse-vergleich.md)
> Naechste Sektion: [05 - Patterns und Best Practices](./05-patterns-und-best-practices.md)

---

## Was du hier lernst

- Ein **klarer Entscheidungsbaum**: Wann `type`, wann `interface`?
- Die **drei Faustregeln**, die in 95% der Faelle reichen
- Warum **Konsistenz** wichtiger ist als die "perfekte" Wahl
- Wie du die Entscheidung in deinem Team verankerst

---

## Der Entscheidungsbaum

Folge diesem Flowchart von oben nach unten. Die erste Frage, die du
mit "Ja" beantworten kannst, gibt dir die Antwort:

```
  Brauchst du einen Union Type? (A | B)
  ├── Ja ──> type
  │
  Brauchst du Mapped oder Conditional Types?
  ├── Ja ──> type
  │
  Brauchst du einen Primitive Alias? (type ID = string)
  ├── Ja ──> type
  │
  Brauchst du einen Tuple Type? ([string, number])
  ├── Ja ──> type
  │
  Brauchst du Declaration Merging?
  ├── Ja ──> interface
  │
  Beschreibst du eine Objekt-Form die erweitert werden soll?
  ├── Ja ──> interface
  │
  Sonst: Folge der Team-Konvention.
  └── Keine Konvention? ──> interface fuer Objekte, type fuer alles andere
```

> 🧠 **Erklaere dir selbst:** Gehe den Entscheidungsbaum mit drei konkreten
> Beispielen durch: (1) Ein Typ fuer API-Response mit Erfolg/Fehler-Varianten,
> (2) Ein Typ fuer einen User mit Name und E-Mail, (3) Ein Typ der ein
> Array readonly macht. Wo landest du jeweils?
> **Kernpunkte:** (1) Union = type | (2) Objekt-Form = interface |
> (3) Mapped Type = type

---

## Die drei Faustregeln

### Regel 1: Union Types = type (immer)

Es gibt keine Alternative. Wenn du `|` brauchst, nimm `type`:

```typescript annotated
// Das geht NUR mit type:
type Status = "active" | "inactive" | "banned";
// ^ Drei String-Literale als Union.

type Result<T> = { ok: true; value: T } | { ok: false; error: Error };
// ^ Discriminated Union. Das maechtigste Pattern in TypeScript.

type InputValue = string | number | boolean;
// ^ Primitiver Union.
```

### Regel 2: Erweiterbare Objekte = interface (bevorzugt)

Wenn du ein Objekt beschreibst, das von anderen erweitert werden koennte,
nimm `interface`:

```typescript annotated
// DTOs, Entities, Service-Contracts:
interface User {
  id: string;
  name: string;
  email: string;
}

interface AdminUser extends User {
// ^ Saubere Erweiterung mit extends.
  permissions: string[];
  lastLogin: Date;
}
```

### Regel 3: Alles andere = type

Mapped Types, Conditional Types, Utility-Typen, Primitive Aliases:

```typescript annotated
// Mapped Type:
type Readonly<T> = { readonly [K in keyof T]: T[K] };

// Conditional Type:
type NonNullable<T> = T extends null | undefined ? never : T;

// Primitive Alias:
type Milliseconds = number;

// Tuple:
type Coordinate = [latitude: number, longitude: number];

// Template Literal:
type EventHandler = `on${string}`;
```

---

## Reale Entscheidungen: Beispiele

### Beispiel 1: Props fuer eine React-Komponente

```typescript
// React-Community-Konvention: type fuer Props
type ButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant: "primary" | "secondary" | "danger";
// ^ variant ist ein Union — deshalb passt type gut.
};
```

Koennte man hier `interface` nehmen? Ja, fuer die reinen Properties.
Aber der Union-Typ bei `variant` und die React-Konvention sprechen
fuer `type`.

### Beispiel 2: Angular Service-Contract

```typescript
// Angular-Konvention: interface fuer Service-Contracts
interface UserService {
  getUser(id: string): Observable<User>;
  updateUser(id: string, data: Partial<User>): Observable<User>;
  deleteUser(id: string): Observable<void>;
}

// Klasse implementiert das Interface:
class UserServiceImpl implements UserService {
  // ...
}
```

Koennte man hier `type` nehmen? Ja, `implements` funktioniert auch
mit Type Aliases. Aber die Angular-Konvention und `extends`-Moeglichkeit
sprechen fuer `interface`.

### Beispiel 3: API-Response mit Varianten

```typescript
// Discriminated Union — NUR mit type moeglich:
type ApiResponse<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string; retryAfter?: number };

// Verwendung:
function handleResponse(response: ApiResponse<User[]>) {
  switch (response.status) {
    case "loading":
      showSpinner();
      break;
    case "success":
      renderUsers(response.data);
// ^ TypeScript weiss: data existiert hier.
      break;
    case "error":
      showError(response.error);
// ^ TypeScript weiss: error existiert hier.
      break;
  }
}
```

Hier gibt es keine Wahl — `type` ist die einzige Option.

### Beispiel 4: Konfigurationstyp fuer eine Bibliothek

```typescript
// interface — weil Nutzer den Typ erweitern sollen:
interface PluginConfig {
  name: string;
  version: string;
}

// Ein Plugin-Autor kann PluginConfig erweitern:
interface PluginConfig {
  hooks?: {
    onInit?: () => void;
    onDestroy?: () => void;
  };
}
// ^ Declaration Merging! PluginConfig hat jetzt name, version UND hooks.
```

---

## Die "Konsistenz schlaegt Perfektion"-Regel

> **Die wichtigste Regel: Sei konsistent innerhalb deines Projekts.**

Ein Projekt, das ueberall `type` verwendet, ist besser als ein Projekt,
das wahllos zwischen `type` und `interface` wechselt. Inkonsistenz
verwirrt Teammitglieder und erschwert Code-Reviews.

```typescript
// SCHLECHT: Inkonsistent
type UserProps = { name: string };
interface ProductProps { name: string; }
type OrderState = { items: string[] };
interface CartState { items: string[]; }
// ^ Warum ist UserProps ein type und ProductProps ein interface?
// Kein erkennbares Muster = Verwirrung.

// GUT: Konsistent (Variante A — type-first)
type UserProps = { name: string };
type ProductProps = { name: string };
type OrderState = { items: string[] };

// GUT: Konsistent (Variante B — interface-first)
interface UserProps { name: string; }
interface ProductProps { name: string; }
interface OrderState { items: string[]; }
```

> ⚡ **Praxis-Tipp:** Verwende eine ESLint-Regel um Konsistenz zu erzwingen:
>
> ```json
> // .eslintrc.json
> {
>   "rules": {
>     "@typescript-eslint/consistent-type-definitions": ["error", "interface"]
>     // Oder: ["error", "type"] — je nach Team-Entscheidung
>   }
> }
> ```
>
> Diese Regel erzwingt, dass Objekt-Typen einheitlich entweder als `type`
> oder als `interface` definiert werden.

---

## Haeufige Fragen

### "Soll ich immer interface verwenden, wie das TypeScript-Team empfiehlt?"

Das TypeScript-Team hat in der Vergangenheit `interface` fuer Objekt-Typen
empfohlen — hauptsaechlich wegen der Performance bei `extends`. Aber
diese Empfehlung hat Nuancen:

1. Sie gilt nur fuer **Objekttypen**, nicht fuer Unions, Tuples, etc.
2. Der Performance-Unterschied ist in den meisten Projekten **nicht messbar**
3. Viele moderne Projekte (React, Prisma) verwenden primaer `type`

### "Ist die Wahl wirklich egal?"

Nein! Es gibt Faelle, wo die Wahl klar ist:

- **Union Type noetig** → `type` (keine Alternative)
- **Declaration Merging noetig** → `interface` (keine Alternative)
- **Mapped/Conditional Type** → `type` (keine Alternative)
- **Nur ein Objekttyp** → Beide gehen, folge der Konvention

### "Was wenn ich mich spaeter umentscheide?"

Refactoring von `type` zu `interface` (oder umgekehrt) ist in den
meisten Faellen trivial — solange du keine `type`-exklusiven Features
benutzt (Unions, Mapped Types, etc.). Ein gutes IDE-Refactoring-Tool
macht das in Sekunden.

---

## Was du gelernt hast

- Der **Entscheidungsbaum** fuehrt dich in 5 Schritten zur richtigen Wahl
- **Drei Faustregeln**: Unions → type, erweiterbare Objekte → interface, Rest → type
- **Konsistenz** innerhalb des Projekts ist wichtiger als die "perfekte" Wahl
- ESLint kann die Konvention **automatisch erzwingen**

> 🧠 **Erklaere dir selbst:** Dein Team fragt dich: "Sollen wir immer type
> oder immer interface verwenden?" — Was antwortest du und warum?
> **Kernpunkte:** Kein "immer" moeglich weil Unions nur type koennen |
> Empfehlung: interface fuer Objekte, type fuer den Rest | ESLint-Regel
> fuer Konsistenz | Performance-Argument nur bei sehr grossen Projekten relevant

**Kernkonzept zum Merken:** Die "richtige" Wahl ist weniger wichtig als eine
**konsistente** Wahl. Definiere eine Team-Konvention, dokumentiere sie, und
erzwinge sie mit ESLint.

---

> **Pausenpunkt** — Guter Moment fuer eine Pause. Du hast jetzt einen
> klaren Entscheidungsrahmen.
>
> Weiter geht es mit: [Sektion 05: Patterns und Best Practices](./05-patterns-und-best-practices.md)
