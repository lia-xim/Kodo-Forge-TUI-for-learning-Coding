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

> 📖 **Hintergrund: Mapped Types in realen Frameworks**
>
> Die Patterns in dieser Sektion sind keine akademischen Uebungen —
> sie sind exakt das, was grosse Frameworks und Libraries intern tun:
>
> - **Angular Reactive Forms**: `FormGroup<T>` nutzt einen Mapped Type
>   um fuer jedes Feld ein `FormControl<T[K]>` zu generieren
> - **React Hook Form**: `useForm<T>()` leitet `FieldErrors<T>`,
>   `TouchedFields<T>` und `DirtyFields<T>` automatisch aus T ab
> - **Prisma ORM**: Mapped Types generieren Create/Update/Where-Typen
>   aus dem Datenbank-Schema
> - **tRPC**: Mapped Types transformieren Router-Definitionen in
>   typsichere Client-APIs
>
> Wenn du diese Patterns verstehst, verstehst du wie diese Libraries
> unter der Haube funktionieren.

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

> ⚡ **Praxis-Tipp: Angular Reactive Forms vs React Hook Form**
>
> ```typescript
> // Angular: FormGroup mit typsicheren Controls
> interface LoginForm {
>   email: string;
>   password: string;
> }
> // Angular 14+ generiert intern:
> // FormGroup<{ email: FormControl<string>; password: FormControl<string> }>
> // Das ist ein Mapped Type!
>
> // React Hook Form: Errors werden automatisch abgeleitet
> const { formState: { errors } } = useForm<LoginForm>();
> // errors.email?.message    — typsicher!
> // errors.password?.message — typsicher!
> // errors.foo               — Error! 'foo' existiert nicht in LoginForm
> ```

> 🧠 **Erklaere dir selbst:** Warum ist `FormErrors<T>` als `{ [K in keyof T]?: string }` definiert (mit ?) statt `{ [K in keyof T]: string }`?
> **Kernpunkte:** Nicht jedes Feld hat einen Fehler | Kein Fehler = Key fehlt (undefined) | Required wuerde erzwingen dass JEDES Feld einen Error-String hat | Optional bedeutet: "hat einen Fehler ODER hat keinen"

---

## Pattern 2: API-Transformationen

> **Analogie:** Stell dir einen Entity-Typ als **Stammzelle** vor:
> Aus einer einzigen Definition (dem Basis-Typ) werden verschiedene
> spezialisierte Typen abgeleitet — CreateDTO, UpdateDTO, ResponseDTO.
> Wie eine Stammzelle sich in verschiedene Zelltypen differenziert,
> differenziert sich der Entity-Typ in verschiedene API-Varianten.

Ein einziger Entity-Typ, verschiedene API-Varianten:

```typescript annotated
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

> 💭 **Denkfrage:** Was passiert in `ResponseDTO`, wenn ein Property
> den Typ `Date | null` hat (nullable Date)? Wird es zu `string | null`?
>
> **Antwort:** Nein! `Date | null extends Date` ist `false` (weil `null`
> nicht Date ist). Das Property bleibt als `Date | null` — was falsch ist,
> da die API einen String oder null liefert. Die robustere Version waere:
> `T[K] extends Date ? string : T[K] extends Date | null ? string | null : T[K]`.
> Solche Edge Cases zeigen, warum man eigene Utility Types gruendlich
> testen sollte.

> 🔬 **Experiment:** Erweitere das API-Pattern um einen `ListDTO<T>`:
> `type ListDTO<T extends Entity> = { items: ResponseDTO<T>[]; total: number; page: number }`.
> Teste es mit `User`. Sind die Dates in den Items korrekt zu Strings geworden?

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

> 📖 **Hintergrund: Java-Style meets TypeScript**
>
> In Java ist es ueblich, fuer jedes Feld explizite Getter und Setter
> zu schreiben (`getName()`, `setName()`). In TypeScript/JavaScript ist
> das normalerweise nicht noetig — man greift direkt auf Properties zu.
> Aber es gibt Szenarien (z.B. Proxy-Objekte, Observables, Change Detection),
> wo Getter/Setter nuetzlich sind. Mapped Types koennen diese automatisch
> aus dem Interface generieren — zero Boilerplate.

```typescript annotated
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

> 🧠 **Erklaere dir selbst:** Warum nutzt `WithAccessors<T>` eine Intersection (`T & { ... } & { ... }`) statt die Properties direkt in einem Mapped Type zu definieren?
> **Kernpunkte:** Man will die ORIGINAL-Properties behalten UND Getter/Setter hinzufuegen | Ein Mapped Type kann Keys nur transformieren, nicht verdoppeln | Intersection ist die "Addition" von Typ-Informationen | Drei separate Teile: Original + Getter + Setter

---

## Pattern 5: Event-System ableiten

> ⚡ **Praxis-Tipp: Event-Systeme in Angular und React**
>
> ```typescript
> // Angular: EventEmitter + Output
> // Angular Components nutzen genau dieses Pattern:
> // Fuer jede @Input()-Property gibt es eine @Output()-Property mit "Change"-Suffix
> // z.B. @Input() name → @Output() nameChange
>
> // React: Controlled Components
> // Fuer jede State-Property braucht man einen onChange-Handler:
> // value + onChange, checked + onCheckedChange
> // EventMap<T> automatisiert genau das!
> ```

```typescript annotated
type EventMap<T> = {
  [K in keyof T as `${string & K}Changed`]: {
//                  ^^^^^^^^^^^^^^^^^^^^^^ Key: originalerName + "Changed"
    previousValue: T[K];
//  ^^^^^^^^^^^^^^^^^ Vorheriger Wert mit dem Original-Typ
    newValue: T[K];
//  ^^^^^^^^^^^^^ Neuer Wert mit dem Original-Typ
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

## Was du gelernt hast

- **Form-Typen** (Errors, Touched, Dirty) sind DER Anwendungsfall fuer Mapped Types im Frontend
- **API-Transformationen** (Create, Update, Response) leiten alle Varianten aus einem Entity-Typ ab
- **Konfigurations-Dokumentation** (`Documented<T>`) wickelt jeden Wert in ein Metadaten-Objekt
- **Getter/Setter-Generierung** nutzt Key Remapping + Template Literals
- **Event-Systeme** (`EventMap<T>`) erzeugen automatisch typsichere Change-Events

> 🧠 **Erklaere dir selbst:** Welches der fuenf Patterns wuerdest du als
> erstes in einem neuen Angular- oder React-Projekt einsetzen? Warum?
> **Kernpunkte:** Form-Typen sind fast immer relevant (jedes Projekt hat Formulare) | API-Transformationen sparen enormen Wartungsaufwand | Die anderen Patterns sind fuer spezifischere Szenarien | Starte mit dem, was dir am meisten Boilerplate spart

> 💭 **Denkfrage:** Koennten diese Patterns auch zur LAUFZEIT funktionieren,
> nicht nur zur Compilezeit? Z.B. ein `createFormState(schema)` das
> automatisch errors, touched und dirty Objekte erzeugt?
>
> **Antwort:** Ja! Und genau das tun Libraries wie React Hook Form,
> Formik und Angular Reactive Forms. Der Unterschied: Die Laufzeit-
> Version braucht ECHTEN Code (Funktionen, Objekte), die Compilezeit-
> Version (Mapped Types) erzeugt nur Typ-Informationen und verschwindet
> nach dem Kompilieren. Beides zusammen ergibt die beste Developer
> Experience: typsichere API + automatische Implementierung.

**Kernkonzept zum Merken:** Die wahre Staerke von Mapped Types zeigt sich in der Praxis: Ein einziger Entity-Typ kann dutzende abgeleitete Typen erzeugen — Form-State, API-DTOs, Event-Maps, Accessor-Interfaces. Das ist **Single Source of Truth** fuer Typen.

> 🔬 **Experiment:** Nimm ein Interface aus einem deiner eigenen Projekte
> (z.B. ein `User`-Typ) und wende die fuenf Patterns darauf an.
> Welche abgeleiteten Typen entstehen? Wie viel manuellen Code
> haettest du ohne Mapped Types schreiben muessen?

---

> **Ende der Lektion** — Du beherrschst jetzt Mapped Types von den
> Grundlagen bis zu realen Praxis-Patterns!
>
> **Zusammenfassung der gesamten Lektion:**
> - **Sektion 1:** Grundsyntax `{ [K in keyof T]: T[K] }` und Modifier
> - **Sektion 2:** Key Remapping mit `as` fuer dynamische Key-Namen
> - **Sektion 3:** Eigene Utility Types (Mutable, Nullable, DeepReadonly)
> - **Sektion 4:** Bedingte Mapped Types (Conditional im Key und im Wert)
> - **Sektion 5:** Praxis-Patterns (Forms, APIs, Events, Accessors)
>
> Naechste Schritte:
> 1. Quiz durcharbeiten
> 2. Cheatsheet als Referenz behalten
>
> **Naechste Lektion:** [17 - Conditional Types](../../17-conditional-types/README.md)
