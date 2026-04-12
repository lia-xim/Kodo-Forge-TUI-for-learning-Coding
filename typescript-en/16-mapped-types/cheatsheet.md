# Cheatsheet: Mapped Types

## Basic Syntax

```typescript
type MappedType<T> = {
  [K in keyof T]: T[K];    // Copies T
};
```

---

## Modifiers

```typescript
// Add / remove optional
type AllOptional<T>  = { [K in keyof T]+?: T[K] };  // = Partial
type AllRequired<T>  = { [K in keyof T]-?: T[K] };  // = Required

// Add / remove readonly
type AllReadonly<T>  = { +readonly [K in keyof T]: T[K] };  // = Readonly
type Mutable<T>      = { -readonly [K in keyof T]: T[K] };  // opposite

// Combine both
type WritableRequired<T> = { -readonly [K in keyof T]-?: T[K] };
```

---

## Key Remapping (as clause, TS 4.1)

```typescript
// Rename keys
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

// Filter keys (never = remove)
type StringKeysOnly<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

// Keys with prefix/suffix
type Prefixed<T, P extends string> = {
  [K in keyof T as `${P}_${string & K}`]: T[K];
};
```

---

## Conditionals inside Mapped Types

```typescript
// Transform value type
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

## Recursive Mapped Types

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

## Selective Utility Types

```typescript
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];
```

---

## Practical Patterns

```typescript
// Form types
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

## Memory Aids

| Concept | Mnemonic |
|---------|---------|
| Mapped Type | "for-loop for types: for each key do X." |
| -? | "Minus removes, plus adds." |
| as never | "never in a key = key gets deleted." |
| string & K | "keyof can also be number/symbol — intersection filters." |
| Homomorphic | "keyof T directly = modifiers preserved. Union = modifiers gone." |
| DeepPartial | "Recursion + function guard = safe." |