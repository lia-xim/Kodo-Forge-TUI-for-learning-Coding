# Sektion 5: Default-Typparameter

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Constraints](./04-constraints.md)
> Naechste Sektion: [06 - Generics in der Praxis](./06-generics-in-der-praxis.md)

---

## Was du hier lernst

- Wie Default Types bei Typparametern funktionieren (`<T = string>`)
- Wann Default Types sinnvoll sind
- Die Reihenfolge-Regeln (Defaults muessen am Ende stehen)
- Patterns: Event-Systeme, Factory-Funktionen, Konfigurationen

---

> 📖 **Hintergrund:** Default Type Parameters wurden in **TypeScript 2.3**
> (April 2017) eingefuehrt. Die Inspiration kam direkt aus C++, wo
> *Default Template Arguments* seit C++11 existieren:
> `template<typename T = int>`. Auch Java diskutiert das Konzept seit
> Jahren, hat es aber nie eingefuehrt — dort muss man immer explizit sein.
> In TypeScript loesen Defaults ein echtes Ergonomie-Problem: Bibliotheken
> koennen den "einfachen Fall" einfach halten, ohne Flexibilitaet zu
> opfern.

---

## Das Problem: Immer den Typ angeben muessen

Manchmal gibt es einen "ueblichen" Typ, aber du willst Flexibilitaet:

```typescript annotated
interface Container<T> {
  value: T;
  label: string;
}

// Ohne Default: Du MUSST T immer angeben
const a: Container<string> = { value: "hallo", label: "text" };
const b: Container<number> = { value: 42, label: "zahl" };

// Was wenn 90% der Faelle string sind?
// Dann ist es laestig, jedes Mal <string> zu schreiben.
```

---

## Die Loesung: Default-Typparameter

```typescript annotated
interface Container<T = string> {
  value: T;
  label: string;
}

// Ohne expliziten Typ: T ist string (der Default)
const a: Container = { value: "hallo", label: "text" };
// ^ Container = Container<string>

// Mit explizitem Typ: Default wird ueberschrieben
const b: Container<number> = { value: 42, label: "zahl" };
// ^ Container<number> — Default ignoriert
```

Die Syntax `<T = string>` funktioniert genau wie Default-Parameter
bei Funktionen: Wenn nichts angegeben wird, gilt der Default.

> **Analogie:** Defaults bei Generics sind wie Defaults bei
> Funktionsparametern — wenn du nichts angibst, wird der Standard
> verwendet. So wie `function greet(name = "Welt")` ohne Argument
> `"Welt"` nutzt, nutzt `Container` ohne Typargument `string`.
> Der Mechanismus ist derselbe, nur auf der Typ-Ebene statt der Wert-Ebene.

---

## Default mit Constraint kombinieren

Defaults und Constraints koennen zusammen verwendet werden:

```typescript annotated
interface Identifiable {
  id: string | number;
}

interface Repository<T extends Identifiable = { id: number; name: string }> {
  findById(id: T["id"]): Promise<T | null>;
  save(entity: T): Promise<T>;
}
// ^ T muss Identifiable erfuellen (Constraint)
// ^ Ohne Angabe ist T = { id: number; name: string } (Default)

// Ohne Typ: Default greift
type DefaultRepo = Repository;
// ^ Repository<{ id: number; name: string }>

// Mit eigenem Typ: Constraint wird geprueft
type UserRepo = Repository<{ id: string; name: string; email: string }>;
// ^ OK — hat id: string (erfuellt Identifiable)
```

> **Regel:** Der Default-Typ muss den Constraint erfuellen.
> `<T extends number = string>` waere ein Fehler — string erfuellt nicht number.

---

## Reihenfolge-Regeln

Wie bei Funktions-Parametern muessen Defaults am **Ende** stehen:

```typescript annotated
// OK: Defaults am Ende
interface Cache<K, V = string> {
  get(key: K): V | undefined;
  set(key: K, value: V): void;
}

const stringCache: Cache<string> = { /* ... */ } as any;
// ^ K = string, V = string (Default)

const numberCache: Cache<string, number> = { /* ... */ } as any;
// ^ K = string, V = number

// FEHLER: Default VOR Nicht-Default
// interface Bad<T = string, U> { ... }
//                          ^ Error! Required nach Optional
```

> 💭 **Denkfrage:** Warum muessen Default-Parameter am **Ende** stehen?
> Was waere das Problem, wenn sie vorne stehen koennten?
>
> **Denk kurz nach, bevor du weiterliest...**
>
> Stell dir vor: `interface Bad<T = string, U>`. Wenn du `Bad<number>`
> schreibst — ist `number` jetzt T (und U fehlt) oder U (und T ist der
> Default)? Es waere mehrdeutig. Genau wie bei Funktionen:
> `function f(a = 1, b)` — bei `f(5)` ist unklar ob 5 fuer a oder b ist.
> Deshalb: Defaults immer am Ende, damit die Zuordnung eindeutig bleibt.

> 🔬 **Experiment:** Oeffne `examples/05-default-typparameter.ts` und
> aendere die Reihenfolge der Typparameter — setze einen Default-Parameter
> **vor** einen ohne Default. Was sagt TypeScript? Die Fehlermeldung ist
> sehr aufschlussreich: *"Required type parameters may not follow
> optional type parameters."*

Bei mehreren Defaults koennen alle am Ende stehen:

```typescript annotated
interface EventBus<
  TPayload = unknown,     // Default: unknown
  TSource = string,       // Default: string
> {
  emit(event: string, payload: TPayload, source: TSource): void;
  on(event: string, handler: (payload: TPayload, source: TSource) => void): void;
}

// Alle Defaults:
type SimpleEventBus = EventBus;
// ^ EventBus<unknown, string>

// Nur ersten Default ueberschreiben:
type TypedEventBus = EventBus<{ type: string; data: unknown }>;
// ^ EventBus<{ type: string; data: unknown }, string>

// Beide ueberschreiben:
type FullEventBus = EventBus<{ type: string }, number>;
// ^ EventBus<{ type: string }, number>
```

---

## Praxis-Pattern: Konfigurationsobjekte

```typescript annotated
interface AppConfig<
  TAuth = { token: string },
  TLogger = Console,
> {
  auth: TAuth;
  logger: TLogger;
  baseUrl: string;
}

// Einfachster Fall: Alle Defaults
const simpleConfig: AppConfig = {
  auth: { token: "abc123" },
  logger: console,
  baseUrl: "https://api.example.com",
};

// Angepasste Auth:
interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

const oauthConfig: AppConfig<OAuthConfig> = {
  auth: { clientId: "...", clientSecret: "...", redirectUri: "..." },
  logger: console,
  baseUrl: "https://api.example.com",
};
```

---

## Praxis-Pattern: Event-System

```typescript annotated
// Event-Map definiert welche Events welche Payloads haben
interface EventMap {
  "user:login": { userId: string; timestamp: Date };
  "user:logout": { userId: string };
  "error": { message: string; code: number };
}

// Default-Event-Map ist ein offenes Record
interface TypedEventEmitter<TEvents extends Record<string, unknown> = Record<string, unknown>> {
  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void;
  on<K extends keyof TEvents>(event: K, handler: (payload: TEvents[K]) => void): void;
}

// Ungetypter Emitter (Default):
const simpleEmitter: TypedEventEmitter = {} as any;
simpleEmitter.emit("anything", { any: "data" }); // OK — offen

// Getypter Emitter (mit Event-Map):
const typedEmitter: TypedEventEmitter<EventMap> = {} as any;
typedEmitter.emit("user:login", { userId: "123", timestamp: new Date() }); // OK
// typedEmitter.emit("user:login", { wrong: true }); // Error!
```

---

## Wann sind Defaults sinnvoll?

| Situation | Default sinnvoll? | Beispiel |
|-----------|-------------------|----------|
| 90%+ nutzen denselben Typ | Ja | `Container<T = string>` |
| Bibliothek mit "einfach" und "fortgeschritten" | Ja | `EventBus<T = unknown>` |
| Jeder Aufruf hat einen anderen Typ | Nein | `Array<T>` hat keinen Default |
| Constraint reicht als Typ | Nein | Lieber Constraint nutzen |

> **Faustregel:** Defaults sind fuer **API-Design**. Wenn du eine
> Bibliothek oder ein wiederverwendbares System baust, machen Defaults
> das einfache Szenario einfach und das komplexe weiterhin moeglich.

---

## Zusammenfassung

| Konzept | Syntax | Beispiel |
|---------|--------|----------|
| Default-Typ | `<T = Type>` | `interface Box<T = string>` |
| Default + Constraint | `<T extends X = Y>` | Y muss X erfuellen |
| Reihenfolge | Defaults am Ende | `<K, V = string>` nicht `<V = string, K>` |
| Mehrere Defaults | Alle am Ende | `<T = string, U = number>` |

---

> 🧠 **Erklaere dir selbst:** Warum hat `Array<T>` keinen Default-Typ?
> Was waere problematisch an `Array<T = any>`?
> **Kernpunkte:** Jedes Array hat einen spezifischen Elementtyp | Default any wuerde Typsicherheit untergraben | Inference ist besser als Defaults bei Funktionsaufrufen

---

> **Pausenpunkt** — Gut? Dann weiter zu [Sektion 06: Generics in der Praxis](./06-generics-in-der-praxis.md)
