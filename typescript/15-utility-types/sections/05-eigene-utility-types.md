# Sektion 5: Eigene Utility Types

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - ReturnType, Parameters, Awaited](./04-returntype-parameters-awaited.md)
> Naechste Sektion: [06 - Utility Types kombinieren](./06-utility-types-kombinieren.md)

---

## Was du hier lernst

- Wie du **DeepPartial\<T\>** baust — rekursives Partial
- Wie du **DeepReadonly\<T\>** baust — rekursives Readonly
- **Mutable\<T\>** — das Gegenteil von Readonly
- **RequiredKeys\<T\>** und **OptionalKeys\<T\>** — Keys nach Optionalitaet filtern
- Das Denkmuster: Mapped Types + Conditional Types = eigene Utility Types

---

## Warum eigene Utility Types?

Die eingebauten Utility Types sind **shallow** — sie transformieren nur
die erste Ebene. Fuer verschachtelte Objekte brauchst du rekursive Varianten:

```typescript annotated
interface User {
  id: number;
  name: string;
  address: {
    street: string;
    city: string;
    geo: {
      lat: number;
      lng: number;
    };
  };
}

type ShallowPartial = Partial<User>;
// address? ist optional, aber address.street ist IMMER NOCH required!

// Was wir wollen: ALLES optional, auch verschachtelt
```

---

## DeepPartial\<T\> — Rekursives Partial

```typescript annotated
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>   // Rekursion: Wenn Property ein Objekt ist
    : T[P];                // Basis: Primitive bleiben wie sie sind
};

// Anwendung:
type DeepPartialUser = DeepPartial<User>;
// {
//   id?: number;
//   name?: string;
//   address?: {
//     street?: string;
//     city?: string;
//     geo?: {
//       lat?: number;
//       lng?: number;
//     };
//   };
// }

function patchUser(id: number, changes: DeepPartial<User>): void {
  // Jetzt kann man nur die Geo-Koordinaten updaten:
  console.log(`Patching user ${id}`);
}

patchUser(1, { address: { geo: { lat: 48.137 } } });  // OK!
```

### Robustere Version mit Array-Handling

```typescript annotated
type DeepPartial<T> = T extends (infer U)[]
  ? DeepPartial<U>[]           // Arrays: Element-Typ rekursiv
  : T extends object
    ? { [P in keyof T]?: DeepPartial<T[P]> }  // Objekte: Rekursion
    : T;                       // Primitives: Unveraendert
```

> 📖 **Hintergrund: Warum hat TypeScript kein eingebautes DeepPartial?**
>
> Das TypeScript-Team hat sich bewusst dagegen entschieden. Der Grund:
> Es gibt zu viele Edge Cases (Arrays, Maps, Sets, Dates, Functions...).
> Jedes Projekt hat leicht andere Anforderungen. Deshalb stellt TypeScript
> die Bausteine bereit (Mapped Types + Conditional Types) und laesst
> Entwickler ihre eigene Version bauen.

---

## DeepReadonly\<T\> — Rekursives Readonly

```typescript annotated
type DeepReadonly<T> = T extends (infer U)[]
  ? readonly DeepReadonly<U>[]
  : T extends object
    ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
    : T;

// Anwendung:
type ImmutableUser = DeepReadonly<User>;
// {
//   readonly id: number;
//   readonly name: string;
//   readonly address: {
//     readonly street: string;
//     readonly city: string;
//     readonly geo: {
//       readonly lat: number;
//       readonly lng: number;
//     };
//   };
// }

function displayUser(user: DeepReadonly<User>): void {
  console.log(user.name);
  // user.name = "other";          // Error!
  // user.address.city = "other";  // Auch Error! Deep readonly!
}
```

---

## Mutable\<T\> — Das Gegenteil von Readonly

Manchmal bekommt man einen `Readonly<T>` und braucht die schreibbare Version:

```typescript annotated
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
// ^ -readonly ENTFERNT den readonly-Modifier!

interface FrozenConfig {
  readonly host: string;
  readonly port: number;
  readonly debug: boolean;
}

type WritableConfig = Mutable<FrozenConfig>;
// ^ { host: string; port: number; debug: boolean }  — kein readonly mehr!
```

> 🧠 **Erklaere dir selbst:** Was bedeutet das Minus-Zeichen in `-readonly`?
> **Kernpunkte:** + fuegt Modifier hinzu (ist der Default) | - entfernt Modifier | -readonly entfernt readonly | -? entfernt optional (das macht Required intern!)

### Deep Mutable

```typescript annotated
type DeepMutable<T> = T extends (infer U)[]
  ? DeepMutable<U>[]
  : T extends object
    ? { -readonly [P in keyof T]: DeepMutable<T[P]> }
    : T;
```

---

## RequiredKeys\<T\> und OptionalKeys\<T\>

Manchmal braucht man nur die **Namen** der required oder optionalen Keys:

```typescript annotated
interface UserProfile {
  id: number;          // required
  name: string;        // required
  bio?: string;        // optional
  avatar?: string;     // optional
  settings: {          // required
    theme: string;
  };
}

// OptionalKeys: Keys die optional sind
type OptionalKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];

// RequiredKeys: Keys die NICHT optional sind
type RequiredKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];

type Optional = OptionalKeys<UserProfile>;
// ^ "bio" | "avatar"

type Required = RequiredKeys<UserProfile>;
// ^ "id" | "name" | "settings"
```

### Wie funktioniert das?

```typescript annotated
// Schritt fuer Schritt (am Beispiel OptionalKeys):

// 1. Mapped Type erzeugt: { id: never; name: never; bio: "bio"; avatar: "avatar"; settings: never }
// 2. [keyof T] extrahiert alle Values: never | never | "bio" | "avatar" | never
// 3. never verschwindet aus dem Union: "bio" | "avatar"
```

> 💭 **Denkfrage:** Wie wuerde man **ReadonlyKeys\<T\>** bauen — also Keys
> die readonly sind?
>
> **Antwort:** Das ist trickier — TypeScript hat kein direktes `readonly`-
> Praedikat auf Type-Level. Man muss mit `Equal`-Vergleichen arbeiten:
> ```typescript
> type ReadonlyKeys<T> = {
>   [K in keyof T]-?: Equal<{ [P in K]: T[K] }, { readonly [P in K]: T[K] }> extends true ? K : never;
> }[keyof T];
> ```

---

## Das Denkmuster fuer eigene Utility Types

```
1. Mapped Type:        [P in keyof T]: ...
2. Conditional Type:   T[P] extends X ? A : B
3. Rekursion:          MyType<T[P]> fuer verschachtelte Typen
4. Index Access:       [keyof T] am Ende fuer Union der Values
```

Diese vier Bausteine reichen fuer fast jeden eigenen Utility Type.

---

## Was du gelernt hast

- **DeepPartial\<T\>** macht alles rekursiv optional — mit Objekt-Erkennung und Rekursion
- **DeepReadonly\<T\>** macht alles rekursiv readonly
- **Mutable\<T\>** entfernt readonly mit dem `-readonly`-Modifier
- **RequiredKeys/OptionalKeys** extrahieren Key-Namen nach Eigenschaft
- Das Muster ist immer: **Mapped Type + Conditional Type + Rekursion**

> 🧠 **Erklaere dir selbst:** Was ist der Unterschied zwischen `Partial<T>` und `DeepPartial<T>` bei einem flachen Objekt wie `{ id: number; name: string }`?
> **Kernpunkte:** Bei flachen Objekten sind sie identisch | Der Unterschied zeigt sich nur bei verschachtelten Properties | DeepPartial recurse in Objekt-Properties | Partial stoppt nach der ersten Ebene

**Kernkonzept zum Merken:** Eigene Utility Types folgen dem Muster "Mapped Type + Bedingung + Rekursion". Die eingebauten Types sind die flachen Varianten — du baust die tiefen.

> **Experiment:** Oeffne `examples/05-eigene-utility-types.ts` und baue
> einen `DeepRequired<T>` — das Gegenteil von DeepPartial.

---

> **Pausenpunkt** — Du kannst jetzt eigene Utility Types bauen!
>
> Weiter geht es mit: [Sektion 06: Utility Types kombinieren](./06-utility-types-kombinieren.md)
