# Sektion 6: Praxis-Patterns

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [05 - Grenzen und Performance](./05-grenzen-und-performance.md)
> Naechste Sektion: -- (Ende der Lektion)

---

## Was du hier lernst

- Wie Libraries wie **Zod**, **Prisma** und **React Hook Form** rekursive Typen nutzen
- Wie du **typsichere Config-Objekte** mit rekursiven Typen modellierst
- Wie du einen **typsicheren deep-get** baust — das Paradeprojekt dieser Lektion
- Wann du **z.lazy()** brauchst und warum Zod eine spezielle API dafuer hat

---

## Zod: Rekursive Schema-Validierung
<!-- section:summary -->
Zod ist eine der populaersten TypeScript-Validierungsbibliotheken.

<!-- depth:standard -->
Zod ist eine der populaersten TypeScript-Validierungsbibliotheken.
Fuer rekursive Schemas hat Zod eine spezielle API: `z.lazy()`.

<!-- depth:vollstaendig -->
> **Hintergrund: Warum Zod `z.lazy()` braucht**
>
> TypeScript-Typen werden **lazy** ausgewertet — der Compiler
> entfaltet sie erst bei Bedarf. Aber Zod-Schemas sind
> **JavaScript-Objekte**, die zur Laufzeit existieren. Ein Schema
> das sich selbst referenziert, wuerde eine **Endlosschleife**
> beim Erstellen erzeugen:
>
> ```typescript
> // ❌ FEHLER: Endlosschleife beim Erstellen!
> const categorySchema = z.object({
>   name: z.string(),
>   subcategories: z.array(categorySchema),
>   //                      ^^^^^^^^^^^^^^ Noch nicht definiert!
> });
>
> // ✅ LOESUNG: z.lazy() verzoegert die Auswertung
> type Category = {
>   name: string;
>   subcategories: Category[];
> };
>
> const categorySchema: z.ZodType<Category> = z.object({
>   name: z.string(),
>   subcategories: z.array(z.lazy(() => categorySchema)),
>   //                     ^^^^^^^^^^^^^^^^^^^^^^^^^^
>   //                     Lambda → wird erst bei Validierung aufgeloest
> });
> ```
>
> Das ist der fundamentale Unterschied: **Typen** koennen direkt
> rekursiv sein, **Laufzeit-Objekte** brauchen Lazy Evaluation.

---

<!-- /depth -->
## Erklaere dir selbst: Warum braucht Zod z.lazy()?
<!-- section:summary -->
Die Antwort: TypeScript-Typen werden **lazy** ausgewertet — der

<!-- depth:standard -->
> **Erklaere dir selbst:**
>
> Warum braucht Zod `z.lazy()` fuer rekursive Schemas, obwohl
> TypeScript rekursive Typen direkt erlaubt?
>
> Hinweis: Denke an den Unterschied zwischen Compilezeit (Typen)
> und Laufzeit (JavaScript-Objekte).
>
> *30 Sekunden nachdenken.*

Die Antwort: TypeScript-Typen werden **lazy** ausgewertet — der
Compiler muss `LinkedList<T>` nicht sofort vollstaendig entfalten.
Aber JavaScript-Objekte werden **sofort** erstellt. Ohne `z.lazy()`
wuerde `categorySchema` sich selbst referenzieren, **bevor es
fertig definiert ist** — das ist wie eine Variable vor ihrer
Deklaration zu verwenden.

---

<!-- /depth -->
## Prisma: Rekursive Includes und Selects
<!-- section:summary -->
Prisma's Type-System nutzt rekursive Typen fuer verschachtelte

<!-- depth:standard -->
Prisma's Type-System nutzt rekursive Typen fuer verschachtelte
Datenbank-Abfragen:

```typescript annotated
// Vereinfacht: Prisma's Include-Typ
type UserInclude = {
  posts?: boolean | {
    include?: {
      comments?: boolean | {
        include?: {
          author?: boolean | { include?: UserInclude };
          // ^ INDIREKTE REKURSION: Comment → Author → User → Posts → ...
        };
      };
    };
  };
  profile?: boolean;
};

// In der Praxis:
const user = await prisma.user.findFirst({
  include: {
    posts: {
      include: {
        comments: {
          include: {
            author: true,
            // ^ Prisma erzeugt den passenden Return-Typ!
          },
        },
      },
    },
  },
});
// user.posts[0].comments[0].author.name → typsicher!
```

---

<!-- /depth -->
## Config-Objekte mit rekursiven Typen
<!-- section:summary -->
Ein haeufiges Pattern: Eine Konfiguration die beliebig tief

<!-- depth:standard -->
Ein haeufiges Pattern: Eine Konfiguration die beliebig tief
verschachtelt sein kann, aber nur bestimmte Wert-Typen erlaubt:

```typescript annotated
// Konfiguration die nur primitive Werte und verschachtelte
// Konfigurationen erlaubt (keine Arrays, keine Funktionen)
type ConfigValue = string | number | boolean;
type ConfigSection = {
  [key: string]: ConfigValue | ConfigSection;
  // ^ Rekursiv: Werte sind primitiv ODER weitere Sektionen
};

// Typsichere Konfiguration:
const appConfig: ConfigSection = {
  app: {
    name: "MeinProjekt",
    version: "1.0.0",
    debug: false,
  },
  database: {
    host: "localhost",
    port: 5432,
    pool: {
      min: 2,
      max: 10,
      idle: {
        timeout: 30000,
        // ^ Beliebig tief verschachtelt — TypeScript prueft es
      },
    },
  },
  // app: [1, 2, 3],    // Error! Arrays nicht erlaubt
  // app: () => {},      // Error! Funktionen nicht erlaubt
};
```

---

<!-- /depth -->
## Der typsichere deep-get: Das Meisterstueck
<!-- section:summary -->
Jetzt bauen wir das Paradeprojekt dieser Lektion — eine `get`-Funktion

<!-- depth:standard -->
Jetzt bauen wir das Paradeprojekt dieser Lektion — eine `get`-Funktion
die **typsicher** auf verschachtelte Objekte zugreift:

```typescript annotated
// Schritt 1: Paths berechnen (aus Sektion 4)
type Paths<T> = T extends object
  ? { [K in keyof T & string]: K | `${K}.${Paths<T[K]>}` }[keyof T & string]
  : never;

// Schritt 2: PathValue berechnen (aus Sektion 4)
type PathValue<T, P extends string> =
  P extends `${infer Head}.${infer Tail}`
    ? Head extends keyof T
      ? PathValue<T[Head], Tail>
      : never
    : P extends keyof T
      ? T[P]
      : never;

// Schritt 3: Die get-Funktion
function deepGet<T extends object, P extends Paths<T> & string>(
  obj: T,
  path: P
): PathValue<T, P> {
  // ^ Rueckgabe-Typ wird aus dem Pfad BERECHNET!
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined as PathValue<T, P>;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return current as PathValue<T, P>;
}

// Verwendung:
type AppConfig = {
  server: {
    host: string;
    port: number;
    tls: { enabled: boolean; cert: string };
  };
  logging: { level: "debug" | "info" | "warn" | "error" };
};

declare const config: AppConfig;

const host = deepGet(config, "server.host");
// ^ Typ: string ✓

const port = deepGet(config, "server.port");
// ^ Typ: number ✓

const tlsEnabled = deepGet(config, "server.tls.enabled");
// ^ Typ: boolean ✓

const level = deepGet(config, "logging.level");
// ^ Typ: "debug" | "info" | "warn" | "error" ✓

// deepGet(config, "server.invalid");
// ^ Error: '"server.invalid"' is not assignable to parameter ✓
```

---

<!-- /depth -->
## Denkfrage: Wo ist die Grenze?

> **Denkfrage:**
>
> Wann ist ein rekursiver Typ **zu clever**?
>
> Stell dir vor, ein Kollege oeffnet deinen Code und sieht:
>
> ```typescript
> type DeepMerge<T, U> = {
>   [K in keyof T | keyof U]:
>     K extends keyof T & keyof U
>       ? T[K] extends object
>         ? U[K] extends object
>           ? DeepMerge<T[K], U[K]>
>           : U[K]
>         : U[K]
>       : K extends keyof T ? T[K]
>       : K extends keyof U ? U[K]
>       : never;
> };
> ```
>
> Versteht er das in 30 Sekunden? Wenn nicht, solltest du
> vielleicht einen **Kommentar** oder eine **einfachere Alternative**
> in Betracht ziehen.

---

## Experiment: Baue einen typsicheren deep-get

> **Experiment:**
>
> Kopiere den kompletten deep-get in eine TypeScript-Datei:
>
> ```typescript
> type Paths<T> = T extends object
>   ? { [K in keyof T & string]: K | `${K}.${Paths<T[K]>}` }[keyof T & string]
>   : never;
>
> type PathValue<T, P extends string> =
>   P extends `${infer Head}.${infer Tail}`
>     ? Head extends keyof T
>       ? PathValue<T[Head], Tail>
>       : never
>     : P extends keyof T
>       ? T[P]
>       : never;
>
> function deepGet<T extends object, P extends Paths<T> & string>(
>   obj: T,
>   path: P
> ): PathValue<T, P> {
>   const keys = path.split(".");
>   let current: unknown = obj;
>   for (const key of keys) {
>     current = (current as Record<string, unknown>)[key];
>   }
>   return current as PathValue<T, P>;
> }
>
> // Teste mit deinen eigenen Daten:
> const testObj = {
>   user: { name: "Max", age: 30 },
>   settings: { theme: "dark" as const, lang: "de" as const },
> };
>
> const name = deepGet(testObj, "user.name");       // string
> const theme = deepGet(testObj, "settings.theme");  // "dark"
>
> console.log(name, theme);
> ```
>
> Probiere aus:
> 1. Tippe `deepGet(testObj, "` — siehst du Autocomplete?
> 2. Hovere ueber die Variablen — sind die Typen korrekt?
> 3. Versuche einen falschen Pfad — gibt es einen Error?

---

## Router-Typen: Verschachtelte Routen typsicher
<!-- section:summary -->
Ein fortgeschrittenes Praxis-Pattern: **Typsichere Router-Definitionen**:

<!-- depth:standard -->
Ein fortgeschrittenes Praxis-Pattern: **Typsichere Router-Definitionen**:

```typescript annotated
// Route-Definition mit rekursiven Kinder-Routen
type RouteConfig = {
  path: string;
  component?: string;
  children?: RouteConfig[];
  // ^ REKURSION: Kinder sind wieder RouteConfigs
};

// Alle Pfade aus einer Route-Konfiguration extrahieren
type ExtractPaths<R extends RouteConfig> =
  R extends { path: infer P extends string; children?: infer C }
    ? C extends RouteConfig[]
      ? P | `${P}/${ExtractPaths<C[number]>}`
      // ^ Rekursion: Eltern-Pfad / Kinder-Pfade
      : P
    : never;

// Beispiel:
type AppRoutes = {
  path: "";
  children: [
    { path: "home" },
    {
      path: "users";
      children: [
        { path: ":id" },
        { path: ":id/edit" },
      ];
    },
    { path: "settings" },
  ];
};

type AllPaths = ExtractPaths<AppRoutes>;
// "" | "home" | "users" | "users/:id" | "users/:id/edit" | "settings"
```

---

<!-- /depth -->
## Framework-Bezug: Typsichere Navigation

> **In React mit React Router:**
>
> ```typescript
> // React Router v6 nutzt kein rekursives Typing (noch nicht),
> // aber Community-Libraries tun es:
>
> // typesafe-routes (Community-Library):
> const routes = {
>   home: route("home"),
>   users: route("users", {
>     detail: route(":id"),
>     edit: route(":id/edit"),
>   }),
> } as const;
>
> // Pfade werden rekursiv aus der Konfiguration berechnet
> navigate(routes.users.detail, { id: "42" });
> // ^ Typsicher: id muss string sein
> ```
>
> **In Angular:**
>
> ```typescript
> // Angular Router hat eigene rekursive Route-Typen:
> const routes: Routes = [
>   { path: "home", component: HomeComponent },
>   {
>     path: "users",
>     children: [  // ← Rekursive Route-Definition
>       { path: ":id", component: UserDetailComponent },
>       { path: ":id/edit", component: UserEditComponent },
>     ],
>   },
> ];
> // Angular's Routes-Typ: Route[] mit children?: Routes
> // Das IST ein rekursiver Typ!
> ```

---

## Checkliste: Wann rekursive Typen einsetzen?
<!-- section:summary -->
| Situation | Rekursiver Typ? | Warum? |

<!-- depth:standard -->
| Situation | Rekursiver Typ? | Warum? |
|-----------|----------------|--------|
| JSON-Daten typisieren | ✅ Ja | JSON ist per Definition rekursiv |
| Baum-Strukturen (Menues, DOM) | ✅ Ja | Natuerlich rekursiv |
| DeepPartial/DeepReadonly | ✅ Ja | Haeufig benoetigt, gute Performance |
| Paths\<T\> fuer eigene Typen | ✅ Meist ja | Solange Typen nicht zu breit |
| Type-Level-Arithmetik | ⚠️ Vorsicht | Nur in Library-Code |
| Paths auf externen/generierten Typen | ❌ Meist nein | Kann Compile-Zeit sprengen |
| Rekursive String-Parser | ❌ Meist nein | Besser zur Laufzeit parsen |

---

<!-- /depth -->
## Zusammenfassung

### Was du gelernt hast

Du hast rekursive Typen in der **realen Praxis** gesehen:

- **Zod** braucht `z.lazy()` fuer rekursive Schemas (Laufzeit vs Compilezeit)
- **Prisma** nutzt rekursive Include-Typen fuer verschachtelte Abfragen
- Ein **typsicherer deep-get** kombiniert Paths + PathValue + Generics
- **Router-Typen** koennen Pfade rekursiv aus der Konfiguration berechnen
- Die **Checkliste** hilft bei der Entscheidung: Rekursiv oder nicht?

> **Kernkonzept:** Rekursive Typen sind am maechtigsten, wenn sie
> **natuerlich rekursive Datenstrukturen** abbilden (JSON, Baeume,
> Routen). Sie werden problematisch, wenn sie fuer Dinge eingesetzt
> werden, die besser zur Laufzeit geloest werden (komplexe
> String-Parser, Arithmetik). Die Frage ist immer: **Rechtfertigt
> die Typsicherheit die Compile-Zeit-Kosten?**

---

## Ende der Lektion: Rekursive Types
<!-- section:summary -->
Du hast alle sechs Sektionen durchgearbeitet und verstehst jetzt:

<!-- depth:standard -->
Du hast alle sechs Sektionen durchgearbeitet und verstehst jetzt:

1. **Grundlagen:** Selbstreferenz + Abbruchbedingung
2. **Baumstrukturen:** JSON, DOM, ASTs als rekursive Typen
3. **Deep-Operationen:** DeepPartial, DeepReadonly und ihre Mechanik
4. **Rekursive Conditionals:** Flatten, Paths, PathValue
5. **Grenzen:** Rekursionslimit, Tail Recursion, Performance-Fallen
6. **Praxis:** Zod, Prisma, deep-get, Router-Typen

**Empfohlener naechster Schritt:**
1. Arbeite die Examples in `examples/` durch
2. Loese die Exercises in `exercises/`
3. Teste dein Wissen mit `npx tsx quiz.ts`
4. Nutze `cheatsheet.md` als Schnellreferenz

> **Naechste Lektion:** 24 — Type-Level Programming
> Dort gehst du noch tiefer: String-Parser, State Machines
> und vollstaendige Programme auf Type-Level.

<!-- /depth -->
