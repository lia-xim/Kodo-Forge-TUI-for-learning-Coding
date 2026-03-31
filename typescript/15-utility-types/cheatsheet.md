# Cheatsheet: Utility Types

## Modifier-Types

```typescript
// Partial — alle Properties optional
Partial<{ name: string; age: number }>
// { name?: string; age?: number }

// Required — alle Properties required
Required<{ name?: string; age?: number }>
// { name: string; age: number }

// Readonly — alle Properties readonly (SHALLOW!)
Readonly<{ name: string; age: number }>
// { readonly name: string; readonly age: number }
```

---

## Objekt-Transformation

```typescript
// Pick — Properties auswaehlen
Pick<User, "id" | "name">
// { id: number; name: string }

// Omit — Properties ausschliessen (NICHT typsicher!)
Omit<User, "password">
// { id: number; name: string; email: string }

// StrictOmit — typsichere Alternative
type StrictOmit<T, K extends keyof T> = Omit<T, K>;

// Record — typsicheres Dictionary
Record<"admin" | "user", string[]>
// { admin: string[]; user: string[] }
```

---

## Union-Manipulation

```typescript
// Exclude — Mitglieder entfernen
Exclude<"a" | "b" | "c", "a">      // "b" | "c"

// Extract — Mitglieder behalten
Extract<"a" | "b" | "c", "a" | "b"> // "a" | "b"

// NonNullable — null und undefined entfernen
NonNullable<string | null | undefined> // string
```

---

## Funktions-Types

```typescript
function myFunc(a: string, b: number): boolean { ... }

ReturnType<typeof myFunc>      // boolean
Parameters<typeof myFunc>      // [a: string, b: number]
Parameters<typeof myFunc>[0]   // string (erster Parameter)

// Async Funktionen:
async function fetchData() { return { x: 1 }; }

ReturnType<typeof fetchData>          // Promise<{ x: number }>
Awaited<ReturnType<typeof fetchData>> // { x: number }

// Klassen:
ConstructorParameters<typeof MyClass> // Konstruktor-Parameter
InstanceType<typeof MyClass>          // Instanz-Typ
```

---

## Eigene Utility Types

```typescript
// DeepPartial — rekursiv optional
type DeepPartial<T> = T extends (infer U)[]
  ? DeepPartial<U>[]
  : T extends object
    ? { [P in keyof T]?: DeepPartial<T[P]> }
    : T;

// DeepReadonly — rekursiv readonly
type DeepReadonly<T> = T extends (infer U)[]
  ? readonly DeepReadonly<U>[]
  : T extends object
    ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
    : T;

// Mutable — readonly entfernen
type Mutable<T> = { -readonly [P in keyof T]: T[P] };

// DeepRequired — rekursiv required
type DeepRequired<T> = T extends (infer U)[]
  ? DeepRequired<U>[]
  : T extends object
    ? { [P in keyof T]-?: DeepRequired<T[P]> }
    : T;
```

---

## Composition-Patterns

```typescript
// PartialExcept — K required, Rest optional
type PartialExcept<T, K extends keyof T> =
  Pick<T, K> & Partial<Omit<T, K>>;

// RequireKeys — K required machen
type RequireKeys<T, K extends keyof T> =
  Omit<T, K> & Required<Pick<T, K>>;

// Create-Input — ohne Server-Felder
type CreateInput = Omit<Entity, "id" | "createdAt" | "updatedAt">;

// Update-Input — id required, Rest optional
type UpdateInput = Pick<Entity, "id"> & Partial<Omit<Entity, "id">>;

// Form-State — alle optional + Error-Map
type FormState = Partial<FormFields>;
type FormErrors = Partial<Record<keyof FormFields, string>>;

// View-Model — bestimmte Felder, readonly
type ViewModel = Readonly<Pick<Entity, "id" | "name" | "status">>;
```

---

## Modifier-Syntax

```typescript
// + fuegt Modifier hinzu (Default):
{ [P in keyof T]+?: T[P] }    // optional hinzufuegen
{ +readonly [P in keyof T]: T[P] }  // readonly hinzufuegen

// - entfernt Modifier:
{ [P in keyof T]-?: T[P] }    // optional entfernen (= Required)
{ -readonly [P in keyof T]: T[P] }  // readonly entfernen (= Mutable)
```

---

## Schnell-Referenz

| Utility Type | Effekt | Typischer Einsatz |
|---|---|---|
| `Partial<T>` | Alle Props optional | Update/Patch-Operationen |
| `Required<T>` | Alle Props required | Validierte Daten, aufgeloeste Defaults |
| `Readonly<T>` | Alle Props readonly (shallow!) | Immutable Params, State |
| `Pick<T, K>` | K auswaehlen | API-Response, View-Models |
| `Omit<T, K>` | K entfernen (NICHT typsicher!) | Create-Input |
| `Record<K, V>` | Dictionary mit K-Keys | Lookup-Tables, Config-Maps |
| `Exclude<T, U>` | Union-Mitglieder entfernen | Typ-Filterung |
| `Extract<T, U>` | Union-Mitglieder behalten | Typ-Selektion |
| `NonNullable<T>` | null/undefined entfernen | Garantierte Werte |
| `ReturnType<T>` | Rueckgabetyp extrahieren | Typ-Ableitung |
| `Parameters<T>` | Parameter-Tuple | Wrapper-Funktionen |
| `Awaited<T>` | Promise entpacken | Async Typ-Extraktion |
