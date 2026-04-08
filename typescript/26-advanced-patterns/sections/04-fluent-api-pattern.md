# Sektion 4: Das Fluent API Pattern

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Phantom Types](./03-phantom-types.md)
> Naechste Sektion: [05 - Newtype Pattern](./05-newtype-pattern.md)

---

## Was du hier lernst

- Wie man **Fluent APIs** mit Method Chaining in TypeScript typsicher baut
- Warum der **Rueckgabetyp** sich bei jedem Schritt aendern kann
- Wie man **kontextabhaengige Methoden** mit Conditional Types steuert
- Den Unterschied zwischen **einfachem Chaining** und **typsicherem Chaining**

---

## Hintergrund: Die Eleganz von Fluent APIs

> **Feature Origin Story: Fluent Interfaces**
>
> Der Begriff "Fluent Interface" wurde 2005 von Martin Fowler und
> Eric Evans gepraegt. Die Idee: APIs die sich wie natuerliche Sprache
> lesen lassen, durch Methoden-Verkettung (Method Chaining).
>
> jQuery (2006) machte das Pattern populaer: `$("div").addClass("active").show().fadeIn()`.
> Heute findet man es ueberall: Lodash, Knex (SQL Builder), Cypress
> (Testing), RxJS-Pipes und sogar CSS-in-JS-Bibliotheken.
>
> TypeScript hat einen entscheidenden Vorteil gegenueber JavaScript:
> Der Rueckgabetyp kann sich bei jedem Schritt **aendern** und somit
> **andere Methoden** freischalten oder blockieren. Das ist der
> Unterschied zwischen "Chaining das funktioniert" und "Chaining
> das zur Compilezeit geprueft wird".

---

## Einfaches Method Chaining: `return this`
<!-- section:summary -->
Das einfachste Fluent-Pattern: Jede Methode gibt `this` zurueck:

<!-- depth:standard -->
Das einfachste Fluent-Pattern: Jede Methode gibt `this` zurueck:

```typescript annotated
class QueryBuilder {
  private parts: string[] = [];

  select(columns: string): this {
    // ^ 'this' als Rueckgabetyp — wichtig fuer Vererbung!
    this.parts.push(`SELECT ${columns}`);
    return this;
  }

  from(table: string): this {
    this.parts.push(`FROM ${table}`);
    return this;
  }

  where(condition: string): this {
    this.parts.push(`WHERE ${condition}`);
    return this;
  }

  orderBy(column: string): this {
    this.parts.push(`ORDER BY ${column}`);
    return this;
  }

  build(): string {
    return this.parts.join(" ");
  }
}

// Fluent API in Aktion:
const sql = new QueryBuilder()
  .select("name, email")
  .from("users")
  .where("active = true")
  .orderBy("name")
  .build();
// ^ Liest sich fast wie SQL! Jede Methode gibt den Builder zurueck.
```

> 💭 **Denkfrage:** Was ist der Unterschied zwischen `this` und dem
> Klassennamen als Rueckgabetyp? Warum ist `this` besser?
>
> **Antwort:** `this` ist polymorph — wenn eine Subklasse erbt, gibt
> `this` den Subklassen-Typ zurueck, nicht den Elternklassen-Typ.
> `QueryBuilder` als Rueckgabetyp wuerde bei Vererbung die
> Subklassen-Methoden "verlieren".

---

<!-- /depth -->
## Problem: Keine Reihenfolge-Pruefung
<!-- section:summary -->
Der einfache Builder erlaubt unsinnige Aufrufe:

<!-- depth:standard -->
Der einfache Builder erlaubt unsinnige Aufrufe:

```typescript
// Syntaktisch OK, semantisch falsch:
new QueryBuilder()
  .where("active = true")   // WHERE ohne SELECT und FROM?
  .orderBy("name")          // ORDER BY ohne FROM?
  .build();
// ^ TypeScript beschwert sich nicht — jede Methode gibt 'this' zurueck.
```

---

<!-- /depth -->
## Typsicheres Chaining: Methoden schrittweise freischalten

```typescript annotated
// Schritt-fuer-Schritt Typen:
interface SelectStep {
  select(columns: string): FromStep;
  // ^ Nach select() → nur from() verfuegbar
}

interface FromStep {
  from(table: string): WhereOrBuildStep;
  // ^ Nach from() → where() ODER build()
}

interface WhereOrBuildStep {
  where(condition: string): OrderOrBuildStep;
  orderBy(column: string): BuildStep;
  build(): string;
  // ^ Drei Optionen: filtern, sortieren oder fertig
}

interface OrderOrBuildStep {
  orderBy(column: string): BuildStep;
  build(): string;
  // ^ Zwei Optionen: sortieren oder fertig
}

interface BuildStep {
  build(): string;
  // ^ Nur noch build() — nichts anderes moeglich
}

// Implementierung (vereinfacht):
function createQuery(): SelectStep {
  const parts: string[] = [];

  const buildStep: BuildStep = {
    build: () => parts.join(" "),
  };

  const orderOrBuild: OrderOrBuildStep = {
    orderBy: (col) => { parts.push(`ORDER BY ${col}`); return buildStep; },
    build: buildStep.build,
  };

  const whereOrBuild: WhereOrBuildStep = {
    where: (cond) => { parts.push(`WHERE ${cond}`); return orderOrBuild; },
    orderBy: orderOrBuild.orderBy,
    build: buildStep.build,
  };

  return {
    select: (cols) => {
      parts.push(`SELECT ${cols}`);
      return {
        from: (table) => { parts.push(`FROM ${table}`); return whereOrBuild; },
      };
    },
  };
}

// Jetzt: Reihenfolge erzwungen!
createQuery().select("*").from("users").where("id = 1").build(); // OK
// createQuery().from("users"); // COMPILE-ERROR: from() existiert nicht auf SelectStep
// createQuery().select("*").build(); // COMPILE-ERROR: build() existiert nicht auf FromStep
```

> 🧠 **Erklaere dir selbst:** Warum definieren wir die Steps als
> separate Interfaces statt alles in eine Klasse zu packen? Was waere
> der Nachteil einer einzelnen Klasse?
>
> **Kernpunkte:** Separate Interfaces = pro Schritt nur erlaubte Methoden |
> Eine Klasse = alle Methoden immer sichtbar | IDE-Autocomplete zeigt nur
> gueltige naechste Schritte | Unmoegliche Aufrufe sind nicht nur Fehler,
> sie existieren GAR NICHT im Typ

---

## Generisches Fluent API: Typ akkumuliert Wissen
<!-- section:summary -->
Fuer komplexere APIs kann der Generic-Parameter Information sammeln:

<!-- depth:standard -->
Fuer komplexere APIs kann der Generic-Parameter Information sammeln:

```typescript annotated
type QueryConfig = {
  hasSelect: boolean;
  hasFrom: boolean;
  hasWhere: boolean;
};

// Startconfig: nichts gesetzt
type EmptyConfig = { hasSelect: false; hasFrom: false; hasWhere: false };

class FluentQuery<Config extends QueryConfig = EmptyConfig> {
  private parts: string[] = [];

  // select() nur verfuegbar wenn noch nicht aufgerufen:
  select(
    this: FluentQuery<Config & { hasSelect: false }>,
    columns: string
  ): FluentQuery<Config & { hasSelect: true }> {
    // ^ Vorher: hasSelect=false, Nachher: hasSelect=true
    this.parts.push(`SELECT ${columns}`);
    return this as any;
  }

  // from() nur verfuegbar nach select():
  from(
    this: FluentQuery<Config & { hasSelect: true; hasFrom: false }>,
    table: string
  ): FluentQuery<Config & { hasFrom: true }> {
    this.parts.push(`FROM ${table}`);
    return this as any;
  }

  // build() nur verfuegbar wenn select UND from gesetzt:
  build(
    this: FluentQuery<{ hasSelect: true; hasFrom: true; hasWhere: boolean }>
  ): string {
    return this.parts.join(" ");
  }
}
```

<!-- depth:vollstaendig -->
> **Experiment:** Probiere folgende Aufrufe — welche kompilieren?
>
> ```typescript
> const q = new FluentQuery();
>
> // 1:
> q.select("*").from("users").build();        // Kompiliert? ___
>
> // 2:
> q.from("users");                            // Kompiliert? ___
>
> // 3:
> q.select("*").select("name");               // Kompiliert? ___
>
> // 4:
> q.select("*").build();                      // Kompiliert? ___
> ```
>
> **Antworten:** 1: Ja | 2: Nein (select fehlt) |
> 3: Nein (select schon aufgerufen) | 4: Nein (from fehlt)

---

<!-- /depth -->
## Praxis: Fluent APIs in Frameworks

> ⚡ **In deinem Angular-Projekt** begegnest du Fluent APIs staendig:
>
> ```typescript
> // RxJS Pipe — ein Fluent API:
> this.http.get<User[]>('/api/users').pipe(
>   filter(users => users.length > 0),
>   map(users => users.map(u => u.name)),
>   catchError(err => of([])),
> );
> // ^ pipe() ist technisch kein Method-Chaining (Funktion, nicht Methode),
> //   aber das gleiche Prinzip: Komposition in lesbarer Reihenfolge.
>
> // Angular TestBed — ein Builder mit Fluent API:
> TestBed.configureTestingModule({
>   declarations: [AppComponent],
>   imports: [HttpClientModule],
> }).compileComponents();
> // ^ configureTestingModule() gibt TestBed zurueck → chaining moeglich
> ```
>
> In React ist React Query ein typisches Beispiel:
>
> ```typescript
> // TanStack Query — Builder-Pattern fuer Queries:
> queryOptions({
>   queryKey: ['users'],
>   queryFn: fetchUsers,
>   staleTime: 5 * 60 * 1000,
>   select: (data) => data.filter(u => u.active),
> });
> // ^ Kein echtes Chaining, aber ein "Konfigurations-Builder"
> ```

---

## Wann Fluent API, wann nicht?
<!-- section:summary -->
| Situation | Fluent API | Alternative |

<!-- depth:standard -->
| Situation | Fluent API | Alternative |
|---|---|---|
| SQL/Query-Builder | Ja — liest sich natuerlich | — |
| Konfigurationen | Ja — schrittweiser Aufbau | Objekt-Literal |
| Einfache Parameter | Nein — Overkill | Direkter Funktionsaufruf |
| Bibliotheks-API | Ja — gute DX | — |
| Interner Code | Meistens nein | Einfache Funktionen |

---

<!-- /depth -->
## Was du gelernt hast

- **Fluent APIs** nutzen Method Chaining fuer lesbare, natuerlich-sprachliche Aufrufe
- **Einfaches Chaining** (`return this`) erlaubt beliebige Reihenfolge — oft zu locker
- **Typsicheres Chaining** mit Step-Interfaces erzwingt die richtige Reihenfolge
- **Generische Akkumulation** kann tracken welche Methoden schon aufgerufen wurden
- `this` als Rueckgabetyp ist polymorph und unterstuetzt Vererbung

> 🧠 **Erklaere dir selbst:** Was ist der Zusammenhang zwischen dem
> typsicheren Builder (Sektion 1) und dem typsicheren Fluent API?
>
> **Kernpunkte:** Beide nutzen Typen als "Gedaechtnis" | Builder trackt
> gesetzte Felder | Fluent API trackt aufgerufene Methoden |
> Beide geben bei jedem Schritt einen neuen Typ zurueck

**Kernkonzept zum Merken:** Ein Fluent API ist nur so gut wie seine
Typ-Information. Einfaches `return this` ist bequem, aber typsichere
Step-Interfaces verhindern falsche Reihenfolgen zur Compilezeit.

---

> **Pausenpunkt** -- Du hast Fluent APIs gemeistert. Naechstes Thema:
> Das Newtype Pattern — Wrapper ohne Runtime-Kosten.
>
> Weiter geht es mit: [Sektion 05: Newtype Pattern](./05-newtype-pattern.md)
