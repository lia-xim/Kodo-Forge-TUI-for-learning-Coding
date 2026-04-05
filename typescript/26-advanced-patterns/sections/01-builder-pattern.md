# Sektion 1: Das Builder Pattern

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: -- (Start)
> Naechste Sektion: [02 - State Machine Pattern](./02-state-machine-pattern.md)

---

## Was du hier lernst

- Wie das Builder Pattern **komplexe Objekterstellung** typsicher macht
- Warum Methoden-Chaining mit **Generics** den Builder zur Compilezeit validiert
- Den Unterschied zwischen dem **klassischen** Builder und dem **typsicheren** Builder
- Wie TypeScript-Generics **akkumulierten State** in Typen abbilden koennen

---

## Hintergrund: Warum Builder?

> **Feature Origin Story: Builder Pattern**
>
> Das Builder Pattern wurde 1994 im "Gang of Four"-Buch (Design Patterns)
> beschrieben. In Java und C# ist es seit Jahrzehnten ein Standard fuer
> die Erstellung komplexer Objekte — man denke an `StringBuilder` oder
> `HttpRequest.newBuilder()`.
>
> Aber in den meisten Sprachen prueft der Builder erst **zur Laufzeit**
> ob alle Pflichtfelder gesetzt wurden. TypeScript kann das besser:
> Mit Generics und Conditional Types koennen wir einen Builder bauen,
> der **zur Compilezeit** garantiert, dass alle Pflichtfelder gesetzt sind.
>
> Das ist einer der Momente, wo TypeScript's Typsystem ueber das
> hinausgeht, was Java oder C# bieten — und das ganz ohne Runtime-Overhead.

---

## Das Problem: Komplexe Objekte erstellen

Stell dir eine Konfiguration mit Pflicht- und optionalen Feldern vor:

```typescript annotated
interface ServerConfig {
  host: string;       // Pflicht
  port: number;       // Pflicht
  ssl: boolean;       // Optional (default: false)
  timeout: number;    // Optional (default: 30000)
  maxRetries: number; // Optional (default: 3)
}

// Naiver Ansatz: Alle Felder im Konstruktor
function createServer(config: ServerConfig): void { /* ... */ }

// Problem 1: Zu viele Parameter — welcher ist welcher?
createServer({ host: "api.example.com", port: 443, ssl: true, timeout: 5000, maxRetries: 5 });
// ^ Geht, aber bei 10+ Feldern wird es unuebersichtlich

// Problem 2: Partial macht ALLES optional — keine Pflicht-Pruefung!
function createServerPartial(config: Partial<ServerConfig>): void { /* ... */ }
createServerPartial({}); // Kein Fehler! Aber host und port fehlen.
// ^ TypeScript beschwert sich nicht — alle Felder sind optional.
```

> 🧠 **Erklaere dir selbst:** Warum ist `Partial<ServerConfig>` keine gute
> Loesung fuer optionale Felder? Was geht dabei verloren?
>
> **Kernpunkte:** Partial macht ALLE Felder optional | Pflichtfelder sind
> nicht mehr erzwungen | Fehler erst zur Laufzeit | Kein Compile-Schutz

---

## Der klassische Builder (ohne Typsicherheit)

```typescript annotated
class ServerConfigBuilder {
  private config: Partial<ServerConfig> = {};
  // ^ Alles ist Partial — wir verlieren die Pflicht-Information

  host(h: string): this { this.config.host = h; return this; }
  port(p: number): this { this.config.port = p; return this; }
  ssl(s: boolean): this { this.config.ssl = s; return this; }

  build(): ServerConfig {
    if (!this.config.host) throw new Error("host ist Pflicht!");
    if (!this.config.port) throw new Error("port ist Pflicht!");
    // ^ Laufzeit-Pruefung — TypeScript hilft uns hier NICHT
    return this.config as ServerConfig;
    // ^ Unsicherer Cast! Wir "versprechen" TypeScript dass alles da ist
  }
}

new ServerConfigBuilder().ssl(true).build();
// ^ KEIN Compile-Error! Erst zur Laufzeit: "host ist Pflicht!"
```

> 💭 **Denkfrage:** Dieser Builder hat das gleiche Problem wie `throw` bei
> Error Handling (Lektion 25): Der Typ "luegt". `build()` verspricht
> `ServerConfig`, wirft aber manchmal. Wie koennte man den Typ ehrlicher machen?
>
> **Antwort:** Indem wir den Rueckgabetyp von `build()` erst dann zu
> `ServerConfig` machen, wenn die Pflichtfelder nachweislich gesetzt
> wurden — und zwar im **Typ**, nicht zur Laufzeit.

---

## Der typsichere Builder mit Generics

Die Kernidee: Wir tracken im **Generic-Parameter**, welche Felder
schon gesetzt wurden:

```typescript annotated
// Schritt 1: Definiere welche Felder Pflicht sind
type RequiredFields = "host" | "port";

// Schritt 2: Builder mit Generic-Parameter fuer "schon gesetzt"
class TypedConfigBuilder<Set extends string = never> {
  // ^ 'Set' trackt welche Felder bereits gesetzt wurden
  //   Startwert: 'never' (nichts gesetzt)
  private config: Partial<ServerConfig> = {};

  host(h: string): TypedConfigBuilder<Set | "host"> {
    // ^ Rueckgabetyp ADDIERT "host" zum Set
    this.config.host = h;
    return this as any; // Interner Cast — Typ-Sicherheit ist im Rueckgabetyp
  }

  port(p: number): TypedConfigBuilder<Set | "port"> {
    // ^ Rueckgabetyp ADDIERT "port" zum Set
    this.config.port = p;
    return this as any;
  }

  ssl(s: boolean): TypedConfigBuilder<Set> {
    // ^ Optionales Feld: Set aendert sich NICHT
    this.config.ssl = s;
    return this as any;
  }

  // build() ist NUR verfuegbar wenn ALLE Pflichtfelder gesetzt sind:
  build(this: TypedConfigBuilder<RequiredFields>): ServerConfig {
    // ^ 'this' Parameter: Methode existiert nur wenn Set = RequiredFields
    return { ssl: false, timeout: 30000, maxRetries: 3, ...this.config } as ServerConfig;
  }
}
```

> **Experiment:** Probiere diese Aufrufe im Kopf durch — welche kompilieren?
>
> ```typescript
> // 1. Alle Pflichtfelder gesetzt:
> new TypedConfigBuilder().host("api.example.com").port(443).build();
> // Kompiliert? ___
>
> // 2. Nur host gesetzt:
> new TypedConfigBuilder().host("api.example.com").build();
> // Kompiliert? ___
>
> // 3. Optionales Feld allein:
> new TypedConfigBuilder().ssl(true).build();
> // Kompiliert? ___
>
> // 4. Reihenfolge egal:
> new TypedConfigBuilder().port(443).ssl(true).host("api.example.com").build();
> // Kompiliert? ___
> ```
>
> **Antworten:** 1: Ja | 2: Nein (port fehlt) | 3: Nein (host+port fehlen) | 4: Ja

---

## Alternative: Builder mit Mapped Types

Ein eleganterer Ansatz nutzt Mapped Types um das Tracking zu automatisieren:

```typescript annotated
type Builder<T, Required extends keyof T, Set extends keyof T = never> = {
  // ^ T = Zieltyp, Required = Pflichtfelder, Set = schon gesetzt
  [K in keyof T]-?: (value: T[K]) => Builder<T, Required, Set | K>;
  // ^ Fuer JEDES Feld: Methode die den Wert nimmt und Builder zurueckgibt
  //   mit K zum Set hinzugefuegt
} & (Required extends Set
  // ^ Wenn ALLE Required-Felder in Set enthalten sind:
  ? { build(): T }
  // ^ build() ist verfuegbar
  : { build?: never }
  // ^ build() existiert NICHT — Compile-Error bei Aufruf
);
```

> ⚡ **In deinem Angular-Projekt** kennst du Builder-aehnliche APIs bereits:
>
> ```typescript
> // Angular FormBuilder — aehnliches Pattern:
> this.fb.group({
>   name: ['', Validators.required],
>   email: ['', [Validators.required, Validators.email]],
> });
> // ^ FormBuilder ist ein Builder! Aber ohne Compile-Pruefung
> //   der Pflichtfelder. Ein typsicherer FormBuilder koennte
> //   fehlende Pflichtfelder zur Compilezeit melden.
> ```
>
> In React kennt man das Pattern von Query-Buildern (z.B. TanStack Query):
>
> ```typescript
> useQuery({ queryKey: ['user', id], queryFn: fetchUser });
> // ^ queryKey und queryFn sind "Pflicht" — aber nur durch Laufzeit-Checks
> ```

---

## Wann Builder, wann nicht?

| Situation | Builder sinnvoll? | Alternative |
|---|---|---|
| 3-4 Felder, alle Pflicht | Nein — Overkill | Direktes Objekt |
| 5+ Felder, Mix Pflicht/Optional | Ja | — |
| Objekt wird schrittweise aufgebaut | Ja | — |
| Validierung zwischen Feldern | Ja | — |
| Immutable Konfiguration | Ja | `Readonly<T>` + Factory |

---

## Was du gelernt hast

- Das **klassische Builder Pattern** validiert Pflichtfelder nur zur Laufzeit — der Typ "luegt"
- Mit **Generics als Accumulator** kann der Builder-Typ tracken, welche Felder schon gesetzt sind
- `build()` wird nur verfuegbar wenn alle Pflichtfelder im Generic-Set enthalten sind
- Die **Reihenfolge** der Aufrufe ist egal — nur die Vollstaendigkeit zaehlt

> 🧠 **Erklaere dir selbst:** Warum braucht der typsichere Builder einen
> Generic-Parameter `Set extends string`? Was wuerde passieren, wenn wir
> einfach `this` als Rueckgabetyp verwenden?
>
> **Kernpunkte:** `this` wuerde denselben Typ zurueckgeben — kein Tracking |
> Der Generic akkumuliert Information ueber gesetzte Felder |
> Ohne Akkumulation kein Compile-Check fuer build()

**Kernkonzept zum Merken:** Ein typsicherer Builder nutzt Generics als
"Gedaechtnis" — jeder Methodenaufruf fuegt Information zum Typ hinzu,
bis der Compiler `build()` freigibt.

---

> **Pausenpunkt** -- Du hast das Builder Pattern verstanden. Als naechstes:
> Zustandsmaschinen, die unmoegliche Transitionen verbieten.
>
> Weiter geht es mit: [Sektion 02: State Machine Pattern](./02-state-machine-pattern.md)
