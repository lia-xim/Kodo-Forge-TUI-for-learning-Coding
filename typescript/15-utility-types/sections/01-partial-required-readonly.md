# Sektion 1: Partial, Required, Readonly

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: -- (Start)
> Naechste Sektion: [02 - Pick, Omit, Record](./02-pick-omit-record.md)

---

## Was du hier lernst

- Warum Utility Types existieren und welches Problem sie loesen
- **Partial\<T\>** — alle Properties optional machen
- **Required\<T\>** — alle Properties verpflichtend machen
- **Readonly\<T\>** — alle Properties unveraenderlich machen
- Wann welcher Modifier-Type die richtige Wahl ist

---

## Das Problem: Typ-Duplikation

> 📖 **Hintergrund: Die Geburt der Utility Types**
>
> Utility Types basieren intern auf **Mapped Types**, die Anders Hejlsberg
> in TypeScript 2.1 (Dezember 2016) einfuehrte. Die Idee stammte aus der
> funktionalen Programmierung — genauer aus Haskells **Functor-Konzept**:
> Ein Functor ist etwas, das eine Struktur behaelt aber den Inhalt
> transformiert. `Array.map()` transformiert Werte in einem Array,
> Mapped Types transformieren **Typen** in einem Objekt-Typ.
>
> Hejlsberg demonstrierte sie live auf der TSConf und zeigte, wie man
> `Partial<T>`, `Readonly<T>` und `Pick<T, K>` in wenigen Zeilen
> definieren kann. Das Publikum war beeindruckt — vorher musste man fuer
> jede Variante eines Typs ein komplett neues Interface schreiben.
> Die ersten Utility Types (`Partial`, `Readonly`, `Record`, `Pick`)
> wurden direkt mit TS 2.1 in die Standardbibliothek aufgenommen.

In Lektion 13-14 hast du gelernt, wie Generics Typen parametrisch machen.
Utility Types gehen einen Schritt weiter: Sie **transformieren** bestehende Typen.

Stell dir vor, du hast ein User-Interface:

```typescript annotated
interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}
```

Fuer eine Update-Funktion brauchst du einen Typ, bei dem alle Felder
optional sind. Ohne Utility Types muesstest du den gesamten Typ duplizieren:

```typescript annotated
// SCHLECHT: Duplikation — wenn User sich aendert, muss das hier auch!
interface UserUpdate {
  id?: number;
  name?: string;
  email?: string;
  role?: "admin" | "user";
}
```

> **Das ist das Kernproblem:** Typ-Duplikation fuehrt zu Inkonsistenzen.
> Utility Types loesen das, indem sie neue Typen aus bestehenden ABLEITEN.

> 🧠 **Erklaere dir selbst:** Was ist das Risiko, wenn du `UserUpdate` als separates Interface pflegst statt es aus `User` abzuleiten? Was passiert bei einem Refactoring von `User`?
> **Kernpunkte:** Manuelle Interfaces gehen aus dem Tritt | Felder werden in User geaendert aber in UserUpdate vergessen | Bugs erst zur Laufzeit sichtbar | Utility Types halten alles automatisch synchron

---

## Partial\<T\> — Alles optional

> **Analogie:** Partial ist wie ein Aenderungsformular beim Einwohnermeldeamt —
> du fuellst **nur die Felder aus, die sich aendern**. Du musst nicht deinen
> vollstaendigen Namen, Geburtsort und alles andere nochmal eintragen,
> nur weil du deine Adresse aenderst.

`Partial<T>` macht **alle** Properties eines Typs optional:

```typescript annotated
interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

type UserUpdate = Partial<User>;
// ^ Aequivalent zu:
// {
//   id?: number;
//   name?: string;
//   email?: string;
//   role?: "admin" | "user";
// }

function updateUser(id: number, changes: Partial<User>): User {
  const existing: User = { id, name: "Max", email: "max@example.com", role: "user" };
  return { ...existing, ...changes };
}

// Nur die Felder senden, die sich aendern:
updateUser(1, { name: "Maximilian" });           // OK
updateUser(1, { email: "new@mail.com" });         // OK
updateUser(1, { name: "Max", role: "admin" });    // OK
updateUser(1, {});                                // Auch OK — nichts aendern
```

> 🧠 **Erklaere dir selbst:** Warum braucht man `Partial<T>` bei Update-Funktionen? Was passiert wenn man alle Properties required laesst?
> **Kernpunkte:** Nicht alle Felder aendern sich gleichzeitig | Ohne Partial muesste man ALLE Felder uebergeben | DRY-Prinzip | Caller muss Daten beschaffen die er gar nicht aendern will

> ⚡ **Praxis-Tipp: Partial in Angular und React**
>
> ```typescript
> // Angular: Partial fuer optionale Component Inputs
> @Component({ selector: 'user-card' })
> class UserCardComponent {
>   @Input() config: Partial<UserCardConfig> = {};
>   // Nicht alle Config-Felder muessen gesetzt werden
> }
>
> // React: Partial fuer defaultProps / optionale Props
> interface ButtonProps {
>   label: string;
>   variant: 'primary' | 'secondary';
>   size: 'sm' | 'md' | 'lg';
> }
> function Button(props: { label: string } & Partial<Omit<ButtonProps, 'label'>>) {
>   const { variant = 'primary', size = 'md' } = props;
>   // ...
> }
> ```

### Wie funktioniert Partial intern?

```typescript annotated
// Die eingebaute Definition von Partial:
type Partial<T> = {
// ^ Generischer Typ: nimmt einen beliebigen Typ T als Input
  [P in keyof T]?: T[P];
// ^ Mapped Type: Iteriert ueber alle Keys von T
//               ^ ? macht jede Property optional (das ist der ganze Trick!)
//                    ^ T[P] behaelt den Original-Typ bei (Indexed Access)
};
```

> 📖 **Hintergrund: Mapped Types als Grundlage**
>
> Alle Utility Types sind intern mit Mapped Types implementiert — einem
> Feature das wir in einer spaeteren Lektion im Detail behandeln. Fuer
> jetzt reicht es zu wissen: `[P in keyof T]` iteriert ueber alle
> Property-Keys von T, aehnlich wie eine `for...in`-Schleife.

> 🔬 **Experiment:** Oeffne `examples/01-partial-required-readonly.ts` und
> aendere `Partial<User>` zu `Required<Partial<User>>`. Was passiert?
> Heben sich die beiden auf? Hovere in der IDE ueber den resultierenden
> Typ und vergleiche ihn mit dem Original `User`.

---

## Required\<T\> — Alles verpflichtend

> **Analogie:** Required ist wie die Checkliste vor einem Flug — ALLE
> Punkte muessen abgehakt sein, bevor es losgehen kann. Kein "optional",
> kein "spaeter". Alles muss da sein.

`Required<T>` ist das **Gegenteil** von Partial — es macht alle optionalen
Properties zu Pflichtfeldern:

```typescript annotated
interface FormInput {
  username: string;
  password: string;
  rememberMe?: boolean;
  newsletter?: boolean;
}

type ValidatedForm = Required<FormInput>;
// ^ Aequivalent zu:
// {
//   username: string;
//   password: string;
//   rememberMe: boolean;   // Nicht mehr optional!
//   newsletter: boolean;    // Nicht mehr optional!
// }

function processForm(data: ValidatedForm): void {
  // Hier sind ALLE Felder garantiert vorhanden
  console.log(`User: ${data.username}, Newsletter: ${data.newsletter}`);
}
```

### Typisches Pattern: Optional Input, Required nach Validierung

```typescript annotated
interface Config {
  host?: string;
  port?: number;
  debug?: boolean;
}

const defaults: Required<Config> = {
  host: "localhost",
  port: 3000,
  debug: false,
};

function createConfig(overrides: Config): Required<Config> {
  return { ...defaults, ...overrides };
}

const config = createConfig({ port: 8080 });
// config.host ist GARANTIERT vorhanden — Typ ist string, nicht string | undefined
```

> 🧠 **Erklaere dir selbst:** Warum ist Required\<T\> nuetzlich, wenn man
> auch einfach alle Properties als required definieren koennte?
> **Kernpunkte:** Input-Typen haben oft optionale Felder fuer Defaults | Nach Verarbeitung will man Garantien | Required dokumentiert die Transformation im Typ-System

---

## Readonly\<T\> — Alles unveraenderlich

> **Analogie:** Readonly ist wie eine Vitrine im Museum — du kannst alles
> **sehen**, aber nichts **anfassen**. Die Objekte sind da, aber sie sind
> geschuetzt vor Veraenderung.

`Readonly<T>` macht alle Properties zu `readonly`:

> ⚡ **Praxis-Tipp: Readonly in React und Angular**
>
> ```typescript
> // React: Props sollten IMMER als immutable behandelt werden
> // Readonly<Props> macht das explizit:
> function UserCard(props: Readonly<UserCardProps>) {
>   // props.name = "other";  // Error! Genau das will man verhindern
> }
>
> // Angular: Readonly fuer @Input-Daten die nicht mutiert werden sollen
> @Component({ ... })
> class UserListComponent {
>   @Input() users: Readonly<User[]> = [];
>   // this.users.push(newUser);  // Error! Array ist readonly
> }
> ```

```typescript annotated
interface AppState {
  currentUser: string;
  theme: "light" | "dark";
  notifications: number;
}

type FrozenState = Readonly<AppState>;
// ^ Aequivalent zu:
// {
//   readonly currentUser: string;
//   readonly theme: "light" | "dark";
//   readonly notifications: number;
// }

function displayState(state: Readonly<AppState>): void {
  console.log(state.currentUser);
  // state.currentUser = "other"; // Error! readonly
}
```

### Wichtig: Readonly ist SHALLOW

```typescript annotated
interface UserProfile {
  name: string;
  settings: {
    theme: string;
    language: string;
  };
}

const profile: Readonly<UserProfile> = {
  name: "Max",
  settings: { theme: "dark", language: "de" },
};

// profile.name = "Anna";  // Error — readonly!
profile.settings.theme = "light";  // KEIN Error! settings-Objekt ist NICHT readonly!
```

> **Merke:** Readonly\<T\> schuetzt nur die **erste Ebene**. Fuer tiefe
> Unveraenderlichkeit braucht man **DeepReadonly** — das bauen wir in
> Sektion 05 selbst.

> 💭 **Denkfrage:** Warum ist `Readonly<T>` nur shallow? Waere es nicht
> besser, wenn TypeScript IMMER deep readonly machen wuerde?
>
> **Antwort:** Deep readonly waere sehr teuer fuer den Compiler bei grossen,
> verschachtelten Typen. Ausserdem wuerde es Typen wie `Date` oder `Map`
> "einfrieren", deren Methoden (`.setTime()`, `.set()`) dann nicht mehr
> aufrufbar waeren. Die shallow-Variante ist der pragmatische Kompromiss.

---

## Wann welchen Modifier?

| Utility Type | Effekt | Typischer Einsatz |
|---|---|---|
| `Partial<T>` | Alle Props optional | Update-Operationen, Patch-Requests |
| `Required<T>` | Alle Props required | Validierte Daten, aufgeloeste Defaults |
| `Readonly<T>` | Alle Props readonly | Immutable State, Funktionsparameter |

> 💭 **Denkfrage:** Kann man Partial und Required kombinieren? Was waere
> `Required<Partial<User>>`?
>
> **Antwort:** `Required<Partial<User>>` macht erst alles optional und
> dann alles required — das Ergebnis ist identisch mit dem Original `User`.
> Die Transformationen heben sich gegenseitig auf!

---

## Was du gelernt hast

- **Utility Types** transformieren bestehende Typen statt sie zu duplizieren
- **Partial\<T\>** macht alle Properties optional — ideal fuer Updates
- **Required\<T\>** macht alles verpflichtend — ideal nach Validierung
- **Readonly\<T\>** schuetzt vor Mutation, aber nur shallow (erste Ebene)
- Alle drei sind intern **Mapped Types** — sie iterieren ueber `keyof T`

> 🧠 **Erklaere dir selbst:** Was ist der Unterschied zwischen
> `Readonly<T>` und `as const`?
> **Kernpunkte:** Readonly\<T\> wirkt auf einen Typ (compile-time) | as const wirkt auf einen Wert | Readonly ist shallow, as const ist deep | as const erzeugt auch Literal Types

**Kernkonzept zum Merken:** Utility Types sind Type-Level-Funktionen — sie nehmen einen Typ als Input und geben einen transformierten Typ als Output zurueck.

> **Experiment:** Oeffne `examples/01-partial-required-readonly.ts` und
> experimentiere mit den drei Utility Types. Was passiert, wenn du
> `Readonly<Partial<User>>` verwendest?

---

> **Pausenpunkt** — Guter Moment fuer eine Pause. Die drei Modifier-Types
> sind die Grundlage fuer alles Weitere.
>
> Weiter geht es mit: [Sektion 02: Pick, Omit, Record](./02-pick-omit-record.md)
