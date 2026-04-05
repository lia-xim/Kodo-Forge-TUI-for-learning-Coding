# Sektion 1: Generic Factories

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: -- (Start)
> Naechste Sektion: [02 - Generic Collections](./02-generic-collections.md)

---

## Was du hier lernst

- Wie Factory Functions mit Generics beliebige Instanzen typsicher erzeugen
- Das `createInstance<T>` Pattern und seine Varianten
- Wie der Builder Pattern vom Compiler begleitet wird — Schritt fuer Schritt
- Warum Generics in Factories Type Inference ermoeglichen statt erzwingen

---

## Hintergrund: Wie Lodash TypeScript aufgeweckt hat

Im Jahr 2014 hatte Lodash ein Problem. Die Bibliothek war das meistbenutzte
JavaScript-Utility-Toolkit der Welt — aber ihre Typdefinitionen waren katastrophal.
`_.map(collection, iteratee)` gab `any[]` zurueck. `_.groupBy()` ebenfalls.
Jeder Rueckgabewert war ein Ratespiel.

2016 begann Boris Yankov das `DefinitelyTyped`-Projekt, das Lodash-Typen zu
reimplementieren — diesmal mit Generics. Plotzlich wusste der Compiler, dass
`_.map([1, 2, 3], n => n.toString())` ein `string[]` zurueckgibt. Das war
eine kleine Revolution: Es bewies, dass Generics nicht "akademisch" sind,
sondern direkt die Entwicklererfahrung verbessern.

Heute ist das Grundprinzip ueberall: React Hooks, Angular Services, RxJS
Operators — sie alle benutzen Generic Factories. Du schreibst gerade an den
Grundlagen davon.

---

## Das Problem: Factories ohne Generics

Stell dir vor, du baust ein System, das verschiedene Objekte erzeugt. Ohne
Generics verlierst du Typinformationen:

```typescript annotated
function createObject(data: unknown): unknown {
  return data;
}

const user = createObject({ name: "Max", age: 30 });
// ^ Typ: unknown — alle Typinfos sind weg!
// user.name -> Error: Object is of type 'unknown'
```

Das ist wie ein Paketdienst, der den Inhalt jedes Pakets vergisst. Du bekommst
dein Paket zurueck, aber niemand kann dir sagen, was drin ist.

> **Die Kernfrage:** Wie schaffen wir Factories, die den Typ des erzeugten
> Objekts BEIBEHALTEN — egal welcher Typ hereingegeben wird?

---

## createInstance: Das Grundmuster

Die einfachste Generic Factory nimmt einen Typ-Parameter und gibt ihn
typsicher zurueck:

```typescript annotated
function createInstance<T>(data: T): T {
  return { ...data };
}

const user = createInstance({ name: "Max", age: 30 });
// ^ Typ: { name: string; age: number } — vollstaendig inferiert!

const config = createInstance({ debug: true, port: 3000 });
// ^ Typ: { debug: boolean; port: number }
```

TypeScript inferiert `T` automatisch aus dem Argument. Du musst den Typ
nicht explizit angeben — aber du kannst:

```typescript annotated
interface User {
  name: string;
  age: number;
  email?: string;
}

// Expliziter Typ-Parameter — erzwingt die Struktur:
const user = createInstance<User>({ name: "Max", age: 30 });
// ^ Typ: User — mit optionalem email
```

> 🧠 **Erklaere dir selbst:** Wann wuerdest du den Typ-Parameter explizit
> angeben statt ihn inferieren zu lassen?
> **Kernpunkte:** Wenn du ein Interface erzwingen willst | Wenn Inference zu breit ist | Wenn optionale Properties wichtig sind

---

## Factory mit Constructor-Signatur

Oft willst du nicht ein Objekt kopieren, sondern eine Klasse instanziieren.
Dafuer braucht die Factory die Constructor-Signatur:

```typescript annotated
// { new (...args: any[]): T } beschreibt "etwas, das man mit new aufrufen kann"
function createInstance<T>(Ctor: { new (): T }): T {
  return new Ctor();
}

class UserService {
  getUsers() { return ["Max", "Anna"]; }
}

class ProductService {
  getProducts() { return ["Laptop", "Phone"]; }
}

const userService = createInstance(UserService);
// ^ Typ: UserService — mit getUsers()

const productService = createInstance(ProductService);
// ^ Typ: ProductService — mit getProducts()
```

### Mit Konstruktor-Argumenten

```typescript annotated
// Args-Tuple fuer beliebige Konstruktor-Parameter:
function createInstance<T, Args extends unknown[]>(
  Ctor: { new (...args: Args): T },
  ...args: Args
): T {
  return new Ctor(...args);
}

class Database {
  constructor(public host: string, public port: number) {}
}

const db = createInstance(Database, "localhost", 5432);
// ^ Typ: Database — TypeScript kennt host und port!
// db.host -> "localhost", db.port -> 5432
```

> 📖 **Hintergrund: Construct Signatures in TypeScript**
>
> Das `{ new (...args: Args): T }` Pattern ist eine sogenannte "Construct
> Signature". Sie beschreibt alles, was mit `new` aufgerufen werden kann:
> Klassen und klassische Constructor-Functions. Anders als in Java oder C#,
> wo Klassen und Interfaces klar getrennt sind, ist TypeScript strukturell —
> eine Klasse ist "nur" ein Objekt mit einer Construct Signature. Das ermoeglicht
> dieses Pattern und macht Dependency-Injection-Container (wie in Angular)
> mit vollem Typsupport moeglich.

> 💭 **Denkfrage:** Eine `createInstance`-Funktion kennt den Typ `T` nur zur
> Compilezeit. Zur Laufzeit gibt es kein `T`. Wie kann sie trotzdem die
> richtige Klasse instanziieren? Was passiert wirklich im JavaScript, das
> entsteht?

---

## Factory mit Defaults und Partials

Ein haeufiges Pattern: Objekte mit Default-Werten erzeugen, wobei der
Aufrufer nur einen Teil der Properties angeben muss.

```typescript annotated
function createWithDefaults<T>(defaults: T) {
  return (overrides: Partial<T>): T => {
    return { ...defaults, ...overrides };
  };
}

interface ButtonConfig {
  label: string;
  variant: "primary" | "secondary" | "danger";
  disabled: boolean;
  size: "sm" | "md" | "lg";
}

const createButton = createWithDefaults<ButtonConfig>({
  label: "Click me",
  variant: "primary",
  disabled: false,
  size: "md",
});

const dangerBtn = createButton({ variant: "danger", label: "Delete" });
// ^ Typ: ButtonConfig — alle Properties sind da
// dangerBtn.disabled -> false (vom Default)
// dangerBtn.variant -> "danger" (ueberschrieben)
```

Das ist das **Partial Factory Pattern**: Die aeussere Funktion fixiert die
Defaults, die innere nimmt nur die Aenderungen entgegen.

> ⚡ **Angular-Bezug:** Genau dieses Pattern liegt `InjectionToken` mit
> Default-Werten zugrunde. Wenn du in Angular `new InjectionToken('myToken',
> { providedIn: 'root', factory: () => defaultValue })` schreibst, ist das
> eine Generic Factory, die einen typsicheren Token erzeugt. Der Token traegt
> seinen Typ `T` zur Compilezeit — und Angular loest ihn zur Laufzeit auf.

> **Experiment:** Probiere folgendes im TypeScript Playground aus:
> ```typescript
> function createWithDefaults<T>(defaults: T) {
>   return (overrides: Partial<T>): T => ({ ...defaults, ...overrides });
> }
> interface Theme { primary: string; secondary: string; radius: number }
> const createTheme = createWithDefaults<Theme>({
>   primary: "#3b82f6",
>   secondary: "#64748b",
>   radius: 4,
> });
> const darkTheme = createTheme({ primary: "#1e40af" });
> // Hover ueber darkTheme — welchen Typ zeigt der Editor?
> // Versuche: createTheme({ unknown: "x" }) — was sagt TypeScript?
> ```
> Was passiert wenn du `Partial<T>` durch `T` ersetzt? Probiere es aus.

---

## Builder Pattern mit Generics

Der Builder Pattern erzeugt Objekte Schritt fuer Schritt. Mit Generics kann
der Builder den wachsenden Typ tracken:

```typescript annotated
class Builder<T extends Record<string, unknown> = {}> {
  private data: T;

  constructor(data: T = {} as T) {
    this.data = data;
  }

  set<K extends string, V>(
    key: K,
    value: V
  ): Builder<T & Record<K, V>> {
    return new Builder({ ...this.data, [key]: value } as T & Record<K, V>);
  }

  build(): T {
    return this.data;
  }
}

const result = new Builder()
  .set("name", "Max")
  .set("age", 30)
  .set("active", true)
  .build();
// ^ Typ: {} & Record<"name", string> & Record<"age", number> & Record<"active", boolean>
// Vereinfacht: { name: string; age: number; active: boolean }
```

Jeder `.set()` Aufruf ERWEITERT den Typ. TypeScript weiss nach `.build()`,
welche Properties existieren — obwohl sie dynamisch hinzugefuegt wurden.

> **Warum neue Instanz?** `set()` gibt einen NEUEN Builder zurueck statt
> `this` zu mutieren. Das ist "immutable builder" — jeder Schritt erzeugt
> einen neuen Typ. Wuerde man `this` zurueckgeben, koennte TypeScript den
> wachsenden Typ nicht tracken.

---

## Registry Pattern: Factory of Factories

Ein fortgeschrittenes Pattern: Eine Registry, die Factories nach Namen speichert
und typsicher die richtige Factory aufruft.

```typescript annotated
interface ServiceMap {
  user: { name: string; role: string };
  product: { title: string; price: number };
  order: { items: string[]; total: number };
}

function createServiceFactory<M extends Record<string, unknown>>() {
  const factories = new Map<string, () => unknown>();

  return {
    register<K extends keyof M>(key: K, factory: () => M[K]) {
      factories.set(key as string, factory);
    },
    create<K extends keyof M>(key: K): M[K] {
      const factory = factories.get(key as string);
      if (!factory) throw new Error(`No factory for ${String(key)}`);
      return factory() as M[K];
    },
  };
}

const registry = createServiceFactory<ServiceMap>();

registry.register("user", () => ({ name: "Max", role: "admin" }));
registry.register("product", () => ({ title: "Laptop", price: 999 }));

const user = registry.create("user");
// ^ Typ: { name: string; role: string }

const product = registry.create("product");
// ^ Typ: { title: string; price: number }
```

> ⚡ **React-Bezug:** Das Registry Pattern findest du im React-Oekosystem
> ueberall. `React.createContext<T>()` ist eine Generic Factory, die einen
> typsicheren Context-Token erzeugt. `createSlice` in Redux Toolkit registriert
> typsichere Action-Creator-Factories. Das Muster ist immer dasselbe: ein
> generischer Schluessels verbindet Registrierung und Aufruf.

---

## Was du gelernt hast

- Generic Factories erhalten den Typ des erzeugten Objekts durch den Typ-Parameter `T`
- Constructor Signatures (`{ new (): T }`) beschreiben alles, was mit `new` aufgerufen werden kann
- Das Partial Factory Pattern kombiniert Defaults mit optionalen Overrides
- Der immutable Builder Pattern erweitert den Typ bei jedem `.set()`-Aufruf
- Das Registry Pattern verknuepft Factory-Namen typsicher mit ihren Rueckgabetypen

**Kernkonzept:** Eine Generic Factory gibt den Typ des erzeugten Objekts nicht
auf — sie traegt ihn als Typ-Parameter durch den gesamten Erstellungsprozess
und liefert ihn am Ende vollstaendig an den Aufrufer zurueck.

> 🧠 **Erklaere dir selbst:** Was ist der Unterschied zwischen einer Generic
> Factory und einer gewoehnlichen Funktion mit `any` als Rueckgabetyp? Warum
> ist das eine nicht ein einfacher Ersatz fuer das andere?
> **Kernpunkte:** any deaktiviert Typsicherheit komplett | Generic Factory gibt den exakten Typ zurueck | Mit any verliert man Autovervollstaendigung und Fehlerhinweise beim Aufrufer

---

> **Pausenpunkt** — Du hast jetzt das Fundament fuer Generic Factories.
> Die Muster hier tauchen in jedem grossen TypeScript-Projekt auf.
>
> Weiter geht es mit: [Sektion 02 — Generic Collections](./02-generic-collections.md)
