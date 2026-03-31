# Sektion 1: Generic Factories

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: -- (Start)
> Naechste Sektion: [02 - Generic Collections](./02-generic-collections.md)

---

## Was du hier lernst

- Wie Factory Functions mit Generics beliebige Instanzen erzeugen
- Das `createInstance<T>` Pattern und seine Varianten
- Wie der Builder Pattern von Generics profitiert
- Warum Generics in Factories Type Inference ermoeglichen

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

> **Hintergrund:** Das `{ new (...args: Args): T }` Pattern ist ein
> "Construct Signature". Es beschreibt alles, was mit `new` aufgerufen werden
> kann. In JavaScript sind das Klassen und Constructor-Functions.

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

---

## Zusammenfassung

| Pattern | Wann verwenden | Vorteil |
|---------|----------------|---------|
| `createInstance<T>(data: T)` | Einfaches Kopieren/Wrapping | Inference, Zero-Config |
| Constructor Factory | Klassen instanziieren | Typ bleibt erhalten |
| Partial Factory | Objekte mit Defaults | Minimaler Aufrufer-Code |
| Generic Builder | Schrittweiser Aufbau | Wachsender Typ |
| Registry | Named Factories | Zentralisierte Erzeugung |

---

> **Pause moeglich!** Du hast jetzt das Fundament fuer Generic Factories.
> Weiter geht es mit typsicheren Datenstrukturen.
>
> Naechste Sektion: [02 - Generic Collections](./02-generic-collections.md)
