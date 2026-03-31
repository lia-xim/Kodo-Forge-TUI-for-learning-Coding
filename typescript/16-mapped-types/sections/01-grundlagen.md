# Sektion 1: Mapped Types — Grundlagen

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: -- (Start)
> Naechste Sektion: [02 - Key Remapping](./02-key-remapping.md)

---

## Was du hier lernst

- Was Mapped Types sind und welches Problem sie loesen
- Die Grundsyntax: `{ [K in keyof T]: ... }`
- Modifier: `readonly`, `?`, `+`, `-`
- Wie TypeScripts eingebaute Utility Types intern funktionieren

---

## Das Problem: Jede Property einzeln transformieren

In Lektion 15 hast du Utility Types wie `Partial<T>` und `Readonly<T>` benutzt.
Aber wie funktionieren die INTERN? Die Antwort: **Mapped Types**.

Stell dir vor, du hast ein User-Interface und willst JEDE Property optional machen.
Ohne Mapped Types muesstest du jede Property einzeln aendern:

```typescript
// Manuell — skaliert nicht!
interface UserOptional {
  id?: number;
  name?: string;
  email?: string;
}
```

---

## Die Grundsyntax

Ein Mapped Type iteriert ueber die Keys eines Typs und transformiert jede Property:

```typescript
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};
```

Schritt fuer Schritt:
1. `keyof T` — alle Keys von T als Union: `'id' | 'name' | 'email'`
2. `K in ...` — fuer JEDEN Key K in dieser Union
3. `T[K]` — der Wert-Typ der Property K in T
4. `?` — macht die Property optional

> **Denke an eine for-Schleife fuer Typen:**
> "Fuer jeden Key K in T, erstelle eine Property K mit dem Typ T[K]."

---

## Beispiel: Partial nachbauen

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

type PartialUser = MyPartial<User>;
// Ergebnis:
// {
//   id?: number;
//   name?: string;
//   email?: string;
// }
```

---

## Modifier: readonly und optional

Mapped Types haben vier Modifier-Varianten:

```typescript
// Optional hinzufuegen (+? oder einfach ?)
type AllOptional<T> = { [K in keyof T]+?: T[K] };

// Optional ENTFERNEN (-?)
type AllRequired<T> = { [K in keyof T]-?: T[K] };

// readonly hinzufuegen (+readonly oder einfach readonly)
type AllReadonly<T> = { +readonly [K in keyof T]: T[K] };

// readonly ENTFERNEN (-readonly)
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
```

> **Plus fuegt hinzu, Minus entfernt.** Das ist die gesamte Modifier-Logik.
> `+?` = optional machen, `-?` = optional entfernen.
> `+readonly` = readonly machen, `-readonly` = readonly entfernen.

---

## Homomorphe Mapped Types

Wenn du `keyof T` als Source verwendest, bewahrt TypeScript die Original-Modifier:

```typescript
interface Config {
  readonly host: string;
  port?: number;
}

type Copy<T> = { [K in keyof T]: T[K] };
type ConfigCopy = Copy<Config>;
// { readonly host: string; port?: number; }
// readonly und optional werden BEIBEHALTEN!
```

Das nennt man **homomorph** — der Mapped Type bewahrt die Struktur des Originals.
Nur explizite Modifier (`+?`, `-?`, `+readonly`, `-readonly`) aendern etwas.

---

## Hintergrund: So funktionieren TypeScripts Utility Types

Jetzt verstehst du, was hinter den Kulissen passiert:

```typescript
// TypeScripts echte Definitionen (vereinfacht):
type Partial<T>   = { [K in keyof T]?: T[K] };
type Required<T>  = { [K in keyof T]-?: T[K] };
type Readonly<T>  = { readonly [K in keyof T]: T[K] };
type Mutable<T>   = { -readonly [K in keyof T]: T[K] };  // nicht eingebaut!
```

---

## Pausenpunkt

Du kennst jetzt die Grundsyntax von Mapped Types und wie Modifier funktionieren.

**Kernerkenntnisse:**
- `{ [K in keyof T]: ... }` — fuer-jede-Property-Schleife auf Type-Level
- `?` / `-?` — optional hinzufuegen / entfernen
- `readonly` / `-readonly` — readonly hinzufuegen / entfernen
- Homomorphe Mapped Types bewahren Original-Modifier

> **Weiter:** [Sektion 02 - Key Remapping](./02-key-remapping.md)
