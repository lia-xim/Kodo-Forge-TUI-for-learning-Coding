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

> 📖 **Hintergrund: Warum hat TypeScript kein eingebautes DeepPartial?**
>
> Das TypeScript-Team unter Anders Hejlsberg hat sich bewusst fuer
> **Minimalismus** in der Standardbibliothek entschieden. Die Philosophie:
> Liefere maechtige Bausteine (Mapped Types, Conditional Types, `infer`),
> nicht fertige Loesungen fuer jeden Anwendungsfall. Der Grund: Es gibt
> zu viele Edge Cases. Soll `DeepPartial<Date>` die Properties von Date
> optional machen? Soll `DeepReadonly<Map<K,V>>` die Map-Methoden sperren?
> Jedes Projekt hat leicht andere Antworten auf diese Fragen.
>
> Die Community-Bibliothek `type-fest` (von Sindre Sorhus, 10M+ Downloads
> pro Woche) fuellt diese Luecke mit ueber 200 Utility Types.

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

> **Analogie:** `Partial<T>` ist wie eine Fotokopiemaschine die nur die
> **erste Seite** eines Dokuments aendert. `DeepPartial<T>` geht durch
> **jede Seite** und macht ueberall die gleiche Aenderung — rekursiv,
> bis zur letzten verschachtelten Ebene.

```typescript annotated
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
  //            ^ ? macht diese Ebene optional
    ? DeepPartial<T[P]>   // Rekursion: Wenn Property ein Objekt ist → gehe tiefer
    : T[P];                // Basis: Primitive bleiben wie sie sind (Rekursionsende)
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

> 🧠 **Erklaere dir selbst:** Warum braucht die robustere Version einen
> separaten Check fuer Arrays (`T extends (infer U)[]`)? Was passiert
> ohne diesen Check, wenn T ein `string[]` ist?
> **Kernpunkte:** Ohne Array-Check wird das Array wie ein Objekt behandelt | keyof string[] gibt "length", "push", "pop" etc. | Man will aber die ELEMENTE optional machen, nicht die Methoden | infer U extrahiert den Element-Typ

> **Experiment:** Probiere folgendes im TypeScript Playground aus:
> ```typescript
> type DeepPartial<T> = T extends (infer U)[]
>   ? DeepPartial<U>[]
>   : T extends object
>     ? { [P in keyof T]?: DeepPartial<T[P]> }
>     : T;
>
> type Test = DeepPartial<{ users: { name: string; age: number }[] }>;
> // Hovere ueber Test — ist users optional?
> // Sind die Elemente im Array auch partial?
> ```
> Vergleiche mit der einfacheren Version ohne Array-Check: `type SimpleDeepPartial<T> = { [P in keyof T]?: T extends object ? SimpleDeepPartial<T[P]> : T[P] }`. Was passiert bei einem `string[]`?

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

> ⚡ **Praxis-Tipp: DeepReadonly im State Management**
>
> ```typescript
> // React: Redux Store State als DeepReadonly
> type AppState = DeepReadonly<{
>   user: { name: string; preferences: { theme: string } };
>   posts: { id: number; title: string }[];
> }>;
> // ALLES ist readonly — auch user.preferences.theme!
>
> // Angular: NgRx Store State
> // NgRx verwendet intern bereits Readonly fuer den State,
> // aber DeepReadonly geht einen Schritt weiter und schuetzt
> // auch verschachtelte Objekte vor versehentlicher Mutation.
> ```

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

> 💭 **Denkfrage:** Warum gibt es kein eingebautes `Mutable<T>` in TypeScript,
> obwohl es `Readonly<T>` gibt?
>
> **Antwort:** Die TypeScript-Philosophie bevorzugt **Sicherheit by Default**.
> Readonly hinzuzufuegen ist eine Verschaerfung (sicherer), Readonly zu
> entfernen eine Lockerung (unsicherer). Deshalb wird Readonly als Utility
> Type bereitgestellt, aber Mutable wird bewusst dem Entwickler ueberlassen —
> als Signal, dass das Entfernen von Readonly eine bewusste Entscheidung
> sein sollte.

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
//    ^ Pflicht-Keys werden zu never     ^ Optionale Keys werden zu ihrem eigenen Namen
// 2. [keyof T] extrahiert alle Values: never | never | "bio" | "avatar" | never
//    ^ Index Access auf alle Keys gleichzeitig
// 3. never verschwindet aus dem Union: "bio" | "avatar"
//    ^ never ist das neutrale Element der Union
```

> 🔍 **Tieferes Wissen: Der `{} extends Pick<T, K>`-Trick**
>
> Wie erkennt man, ob eine Property optional ist? Der Trick nutzt
> Zuweisbarkeit: Wenn K optional ist, kann ein leeres Objekt `{}`
> zu `Pick<T, K>` zugewiesen werden (weil K ja fehlen darf).
> Wenn K required ist, kann `{}` NICHT zugewiesen werden (weil K
> vorhanden sein muss). Diese Asymmetrie nutzen wir als Test.

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

> **Experiment:** Baue im TypeScript Playground einen `DeepRequired<T>` —
> das Gegenteil von DeepPartial:
> ```typescript
> type DeepRequired<T> = T extends (infer U)[]
>   ? DeepRequired<U>[]
>   : T extends object
>     ? { [P in keyof T]-?: DeepRequired<T[P]> }
>     : T;
> ```
> Teste ihn mit `{ host?: string; ssl?: { cert?: string; key?: string } }`.
> Sind alle Properties — auch verschachtelte — jetzt required?

---

> **Pausenpunkt** — Du kannst jetzt eigene Utility Types bauen!
>
> Weiter geht es mit: [Sektion 06: Utility Types kombinieren](./06-utility-types-kombinieren.md)
