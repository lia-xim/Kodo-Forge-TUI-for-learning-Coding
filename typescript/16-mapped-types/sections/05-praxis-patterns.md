# Sektion 5: Praxis-Patterns

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Bedingte Mapped Types](./04-bedingte-mapped-types.md)
> Naechste Sektion: -- (Ende dieser Lektion)

---

## Was du hier lernst

- Form-Typen: Errors, Touched, Dirty
- API-Transformationen: Create, Update, Response
- Konfigurationsmuster mit Mapped Types
- Reale Architektur-Patterns

---

## Pattern 1: Form-Typen

Formulare brauchen immer die gleichen Begleiter-Typen:

```typescript
// Fehler pro Feld
type FormErrors<T> = {
  [K in keyof T]?: string;
};

// Wurde das Feld beruehrt?
type FormTouched<T> = {
  [K in keyof T]: boolean;
};

// Hat sich der Wert geaendert?
type FormDirty<T> = {
  [K in keyof T]: boolean;
};

// Alles zusammen
interface FormState<T> {
  values: T;
  errors: FormErrors<T>;
  touched: FormTouched<T>;
  dirty: FormDirty<T>;
  isValid: boolean;
  isSubmitting: boolean;
}

// Verwendung:
interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

type LoginState = FormState<LoginForm>;
// values: { email: string; password: string; rememberMe: boolean; }
// errors: { email?: string; password?: string; rememberMe?: string; }
// touched: { email: boolean; password: boolean; rememberMe: boolean; }
```

> **Das ist DER Anwendungsfall** fuer Mapped Types in Frontend-Projekten.
> Ein Typ, alle Form-Aspekte werden automatisch abgeleitet.

---

## Pattern 2: API-Transformationen

Ein einziger Entity-Typ, verschiedene API-Varianten:

```typescript
interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Fuer POST: ohne auto-generierte Felder
type CreateDTO<T extends Entity> = Omit<T, keyof Entity>;

// Fuer PUT: nur aenderbare Felder, alle optional
type UpdateDTO<T extends Entity> = Partial<Omit<T, keyof Entity>>;

// Fuer GET: alles vorhanden, mit String-Dates
type ResponseDTO<T extends Entity> = {
  [K in keyof T]: T[K] extends Date ? string : T[K];
};

// Anwendung:
interface User extends Entity {
  name: string;
  email: string;
  role: 'admin' | 'user';
}

type CreateUser = CreateDTO<User>;
// { name: string; email: string; role: 'admin' | 'user'; }

type UpdateUser = UpdateDTO<User>;
// { name?: string; email?: string; role?: 'admin' | 'user'; }

type UserResponse = ResponseDTO<User>;
// { id: string; createdAt: string; updatedAt: string;
//   name: string; email: string; role: 'admin' | 'user'; }
```

---

## Pattern 3: Konfigurations-Dokumentation

```typescript
// Jede Config-Property bekommt einen Beschreibungstext
type Documented<T> = {
  [K in keyof T]: {
    value: T[K];
    description: string;
    defaultValue?: T[K];
  };
};

interface AppConfig {
  port: number;
  host: string;
  debug: boolean;
}

type DocumentedConfig = Documented<AppConfig>;
// {
//   port: { value: number; description: string; defaultValue?: number; };
//   host: { value: string; description: string; defaultValue?: string; };
//   debug: { value: boolean; description: string; defaultValue?: boolean; };
// }
```

---

## Pattern 4: Getter/Setter-Interface generieren

```typescript
type WithAccessors<T> = T & {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
} & {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
};

interface Point {
  x: number;
  y: number;
}

type AccessiblePoint = WithAccessors<Point>;
// {
//   x: number;
//   y: number;
//   getX: () => number;
//   getY: () => number;
//   setX: (value: number) => void;
//   setY: (value: number) => void;
// }
```

---

## Pattern 5: Event-System ableiten

```typescript
type EventMap<T> = {
  [K in keyof T as `${string & K}Changed`]: {
    previousValue: T[K];
    newValue: T[K];
  };
};

interface UserProfile {
  name: string;
  avatar: string;
}

type UserEvents = EventMap<UserProfile>;
// {
//   nameChanged: { previousValue: string; newValue: string; };
//   avatarChanged: { previousValue: string; newValue: string; };
// }
```

---

## Zusammenfassung: Wann welches Pattern?

| Situation | Pattern | Beispiel |
|-----------|---------|----------|
| Formular-Management | FormErrors/Touched/Dirty | React Hook Form, Formik |
| REST-API | CreateDTO/UpdateDTO/ResponseDTO | Express, NestJS |
| Konfiguration | Documented\<T\> | App-Settings |
| OOP-Wrapper | WithAccessors\<T\> | Java-Style Getter/Setter |
| Reaktive Systeme | EventMap\<T\> | Event Emitter, Observable |

---

## Pausenpunkt — Ende der Lektion

Du beherrschst jetzt Mapped Types von den Grundlagen bis zu realen Praxis-Patterns.

**Die wichtigsten Erkenntnisse:**
- Mapped Types sind "for-Schleifen fuer Typen"
- Key Remapping und Conditional Types geben maximale Kontrolle
- Form-Typen und API-Transformationen sind die haeufigsten Anwendungen
- Ein Entity-Typ kann dutzende abgeleitete Typen erzeugen

> **Naechste Lektion:** [17 - Conditional Types](../../17-conditional-types/README.md)
