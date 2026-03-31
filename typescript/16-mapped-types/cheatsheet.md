# Cheatsheet: Mapped Types

## Grundsyntax

```typescript
type MappedType<T> = {
  [K in keyof T]: T[K];    // Kopiert T
};
```

---

## Modifier

```typescript
// Optional hinzufuegen / entfernen
type AllOptional<T>  = { [K in keyof T]+?: T[K] };  // = Partial
type AllRequired<T>  = { [K in keyof T]-?: T[K] };  // = Required

// Readonly hinzufuegen / entfernen
type AllReadonly<T>  = { +readonly [K in keyof T]: T[K] };  // = Readonly
type Mutable<T>      = { -readonly [K in keyof T]: T[K] };  // Gegenteil

// Beides kombinieren
type WritableRequired<T> = { -readonly [K in keyof T]-?: T[K] };
```

---

## Key Remapping (as-Clause, TS 4.1)

```typescript
// Keys umbenennen
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

// Keys filtern (never = entfernen)
type StringKeysOnly<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

// Keys mit Prefix/Suffix
type Prefixed<T, P extends string> = {
  [K in keyof T as `${P}_${string & K}`]: T[K];
};
```

---

## Conditional innerhalb Mapped Types

```typescript
// Wert-Typ transformieren
type Stringify<T> = {
  [K in keyof T]: T[K] extends number ? string : T[K];
};

// OmitByType / PickByType
type OmitByType<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K];
};
type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};
```

---

## Rekursive Mapped Types

```typescript
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Function ? T[K] : DeepPartial<T[K]>
    : T[K];
};

type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function ? T[K] : DeepReadonly<T[K]>
    : T[K];
};
```

---

## Selektive Utility Types

```typescript
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];
```

---

## Praxis-Patterns

```typescript
// Form-Typen
type FormErrors<T>  = { [K in keyof T]?: string };
type FormTouched<T> = { [K in keyof T]: boolean };

// API DTOs
type CreateDTO<T extends Entity>  = Omit<T, keyof Entity>;
type UpdateDTO<T extends Entity>  = Partial<CreateDTO<T>>;
type ResponseDTO<T> = {
  [K in keyof T]: T[K] extends Date ? string : T[K];
};

// Event Map
type EventMap<T> = {
  [K in keyof T as `${string & K}Changed`]: {
    previousValue: T[K]; newValue: T[K];
  };
};
```

---

## Eselsbruecken

| Konzept | Merksatz |
|---------|---------|
| Mapped Type | "for-Schleife fuer Typen: fuer jeden Key tue X." |
| -? | "Minus entfernt, Plus fuegt hinzu." |
| as never | "never im Key = Key wird geloescht." |
| string & K | "keyof kann auch number/symbol sein — Intersection filtert." |
| Homomorph | "keyof T direkt = Modifier bleiben. Union = Modifier weg." |
| DeepPartial | "Rekursion + Function-Guard = sicher." |
