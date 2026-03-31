# Sektion 3: Pattern Matching mit Strings

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Utility Types](./02-utility-types.md)
> Naechste Sektion: [04 - Event Names](./04-event-names.md)

---

## Was du hier lernst

- String-Parsing mit infer in Template Literals
- Prefix/Suffix/Split extrahieren
- Rekursive String-Manipulation
- Typ-sicheres Dot-Notation-Parsing

---

## infer in Template Literals

Du kannst `infer` innerhalb von Template Literals verwenden:

```typescript
type ExtractPrefix<T extends string> =
  T extends `${infer Prefix}_${string}` ? Prefix : never;

type A = ExtractPrefix<"user_name">;   // "user"
type B = ExtractPrefix<"get_value">;   // "get"
type C = ExtractPrefix<"noprefix">;    // never
```

---

## Split an einem Trennzeichen

```typescript
type Split<S extends string, D extends string> =
  S extends `${infer Head}${D}${infer Tail}`
    ? [Head, ...Split<Tail, D>]
    : [S];

type A = Split<"a.b.c", ".">;      // ["a", "b", "c"]
type B = Split<"hello", ".">;      // ["hello"]
type C = Split<"x-y-z", "-">;      // ["x", "y", "z"]
```

> **Rekursion:** Solange der Separator gefunden wird, wird der String
> gesplittet. Erst wenn kein Separator mehr da ist, terminiert die Rekursion.

---

## TrimLeft und TrimRight

```typescript
type TrimLeft<S extends string> =
  S extends ` ${infer Rest}` ? TrimLeft<Rest> : S;

type TrimRight<S extends string> =
  S extends `${infer Rest} ` ? TrimRight<Rest> : S;

type Trim<S extends string> = TrimLeft<TrimRight<S>>;

type A = Trim<"  hello  ">;  // "hello"
```

---

## Replace

```typescript
type Replace<
  S extends string,
  From extends string,
  To extends string
> = S extends `${infer Head}${From}${infer Tail}`
  ? `${Head}${To}${Tail}`
  : S;

type ReplaceAll<
  S extends string,
  From extends string,
  To extends string
> = S extends `${infer Head}${From}${infer Tail}`
  ? ReplaceAll<`${Head}${To}${Tail}`, From, To>
  : S;

type A = Replace<"hello world", "world", "TS">;     // "hello TS"
type B = ReplaceAll<"a.b.c", ".", "/">;              // "a/b/c"
```

---

## Dot-Notation Parsing

```typescript
type DotPath<T, Prefix extends string = ""> =
  T extends object
    ? {
        [K in keyof T & string]: T[K] extends object
          ? DotPath<T[K], `${Prefix}${K}.`>
          : `${Prefix}${K}`;
      }[keyof T & string]
    : never;

interface User {
  name: string;
  address: { city: string; zip: string };
}

type Paths = DotPath<User>;
// "name" | "address.city" | "address.zip"
```

---

## Pausenpunkt

**Kernerkenntnisse:**
- infer in Template Literals = String-Parsing auf Type-Level
- Split, Trim, Replace — alles rekursiv moeglich
- Dot-Notation-Parsing fuer typsichere Pfade

> **Weiter:** [Sektion 04 - Event Names](./04-event-names.md)
