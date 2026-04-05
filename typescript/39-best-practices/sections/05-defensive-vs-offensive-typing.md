# Sektion 5: Defensive vs Offensive Typing

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Type Assertions vs Type Guards](./04-assertions-vs-guards.md)
> Naechste Sektion: [06 - Praxis: Code-Review-Checkliste](./06-praxis-code-review.md)

---

## Was du hier lernst

- Die zwei Denkschulen: **Defensive Typing** (alles pruefen) vs **Offensive Typing** (Fehler frueh werfen)
- Wann welche Strategie die richtige ist — es haengt von der **Systemgrenze** ab
- Wie man **Parse, Don't Validate** als Leitprinzip anwendet
- Die Architektur: Defensive Schale, offensiver Kern

---

## Zwei Denkschulen

### Defensive Typing: Vertraue niemandem

```typescript annotated
// DEFENSIV: Jede Funktion prueft ihre Eingaben
function calculateTotal(items: CartItem[]): number {
  if (!Array.isArray(items)) throw new Error("Expected array");
  // ^ Defensiv: Pruefe ob es wirklich ein Array ist
  return items.reduce((sum, item) => {
    if (typeof item.price !== "number") throw new Error("Invalid price");
    if (typeof item.quantity !== "number") throw new Error("Invalid quantity");
    // ^ Defensiv: Pruefe jeden Wert
    return sum + item.price * item.quantity;
  }, 0);
}
```

### Offensive Typing: Vertraue dem Typsystem

```typescript annotated
// OFFENSIV: Der Typ GARANTIERT korrekte Eingaben
interface CartItem {
  readonly price: number;
  readonly quantity: number;
}

function calculateTotal(items: readonly CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // ^ Offensiv: Kein Runtime-Check noetig — der Typ garantiert Korrektheit
  // ^ Wenn jemand falschen Input gibt → Compile-Error, nicht Runtime-Error
}
```

> 📖 **Hintergrund: Parse, Don't Validate (Alexis King, 2019)**
>
> Der Blogpost "Parse, Don't Validate" von Alexis King ist einer der
> einflussreichsten Texte der modernen Typ-Programmierung. Die Kernidee:
> Validierung prueft ob Daten korrekt sind und gibt `boolean` zurueck.
> Parsing prueft UND transformiert — es gibt den staerkeren Typ
> zurueck. `validateEmail(s): boolean` vs `parseEmail(s): Email`.
> Nach dem Parsen WEISST du dass es eine Email ist — der Typ beweist
> es. Nach der Validierung weisst du nur dass die Pruefung bestanden
> wurde — aber der Typ bleibt `string`. In TypeScript: Branded Types
> und Smart Constructors (L24) sind die Umsetzung von Parse, Don't
> Validate.

---

## Die Architektur: Defensive Schale, offensiver Kern

Die Loesung ist nicht "entweder oder" — es ist **beides an der
richtigen Stelle**:

```
┌─────────────────────────────────────────────────────┐
│                  DEFENSIVE SCHALE                    │
│                                                     │
│  Systemgrenzen: API-Handler, CLI-Eingaben,          │
│  Event-Handler, deserialisierte Daten               │
│                                                     │
│  → Hier: Runtime-Validierung, Type Guards,          │
│    Zod-Schemas, Assertion Functions                  │
│  → unknown → validiert → typisiert                  │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │             OFFENSIVER KERN                  │    │
│  │                                             │    │
│  │  Business-Logik: Services, Pure Functions,  │    │
│  │  Berechnungen, Transformationen             │    │
│  │                                             │    │
│  │  → Hier: Vertraue dem Typsystem komplett    │    │
│  │  → Keine Runtime-Checks noetig              │    │
│  │  → Falsche Eingaben = Compile-Error         │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Beispiel: API-Handler (defensiv) → Service (offensiv)

```typescript annotated
// SCHALE: API-Handler — defensive Validierung
import { z } from "zod";  // Nur als Beispiel-Pattern, nicht als Dependency

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().positive(),
});
type CreateUserInput = z.infer<typeof CreateUserSchema>;

async function handleCreateUser(req: Request): Promise<Response> {
  const body: unknown = await req.json();
  // ^ unknown: Wir vertrauen dem Request NICHT
  const parsed = CreateUserSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify(parsed.error), { status: 400 });
  }
  // Ab hier: parsed.data ist CreateUserInput — BEWIESEN
  const user = await userService.create(parsed.data);
  return new Response(JSON.stringify(user), { status: 201 });
}

// KERN: Service — offensives Typing
class UserService {
  async create(input: CreateUserInput): Promise<User> {
    // Keine Validierung noetig — der Typ GARANTIERT korrekte Daten
    // Die Schale hat bereits validiert
    return this.db.users.insert({
      name: input.name,
      email: input.email,
      age: input.age,
    });
  }
}
```

> 🧠 **Erklaere dir selbst:** Warum ist es falsch, im `UserService`
> nochmal zu pruefen ob `input.name` ein String ist? Was waere der
> Nachteil?
> **Kernpunkte:** Doppelte Validierung ist redundant und verlangsamt |
> Der Typ BEWEIST dass name ein String ist — die Schale hat geprueft |
> Redundante Checks machen den Code schwerer zu lesen | Wenn man
> dem Typsystem nicht vertraut, warum hat man es dann?

---

## Wo ist die Systemgrenze?

```
DEFENSIV (Runtime-Checks noetig):
├── HTTP-Requests und -Responses
├── Formulareingaben (User-Input)
├── JSON.parse, localStorage.getItem
├── Externe APIs und Webhooks
├── Event-Handler (MessageEvent.data)
├── URL-Parameter und Query-Strings
├── Datenbank-Abfragen (wenn nicht ORM-typisiert)
└── Daten von anderen Microservices

OFFENSIV (Typsystem reicht):
├── Funktionsaufrufe innerhalb des eigenen Codes
├── Service-zu-Service (im selben Prozess)
├── Pure Functions
├── State-Management (Redux/NgRx Actions)
├── Utility-Funktionen
└── Alles was zur Compilezeit bekannt ist
```

> ⚡ **Framework-Bezug:** Angular's `HttpClient.get<User>()` ist
> ein Beispiel fuer **falsches Vertrauen** an der Systemgrenze:
> `<User>` ist eine Assertion, keine Validierung! Die API koennte
> ein komplett anderes Format liefern. Besser: `get<unknown>()` +
> Zod-Validierung. In React mit `fetch()` ist dasselbe Problem:
> `const data: User = await res.json()` — das ist eine unsichere
> Assertion. Immer `unknown` + Validierung.

> 💭 **Denkfrage:** Ist `HttpClient.get<User[]>('/api/users')` in
> Angular defensiv oder offensiv? Warum ist es problematisch?
>
> **Antwort:** Es ist weder noch — es ist eine **getarnte Assertion**.
> Es sieht typsicher aus, aber TypeScript prueft NICHT ob die API
> wirklich `User[]` liefert. Der Generic `<User[]>` ist ein
> "Trust me" an den Compiler. Defensiv waere:
> `get<unknown>().pipe(map(validateUsers))`.

---

## Experiment: Defensive Schale implementieren

Baue eine defensive Schale fuer eine API-Route:

```typescript
// Ohne externe Dependencies (kein Zod noetig):

// Type Guard fuer CreateUserInput:
interface CreateUserInput {
  name: string;
  email: string;
  age: number;
}

function isCreateUserInput(data: unknown): data is CreateUserInput {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  if (typeof obj.name !== "string" || obj.name.length === 0) return false;
  if (typeof obj.email !== "string" || !obj.email.includes("@")) return false;
  if (typeof obj.age !== "number" || obj.age < 0 || !Number.isInteger(obj.age)) return false;
  return true;
}

// Experiment: Schreibe einen generischen 'validate' Helper:
// function validate<T>(data: unknown, guard: (d: unknown) => d is T): T
// Der bei Fehlschlag eine sinnvolle Fehlermeldung gibt.
// Bonus: Erweitere ihn so dass er genau sagt WELCHES Feld ungueltig ist.
```

---

## Was du gelernt hast

- **Defensive Typing** = Runtime-Checks an Systemgrenzen (API, User-Input, externe Daten)
- **Offensive Typing** = Vertraue dem Typsystem im Kern (Services, Business-Logik)
- Die **Architektur**: Defensive Schale validiert und parsed, offensiver Kern vertraut
- **Parse, Don't Validate**: Validierung gibt `boolean`, Parsing gibt einen staerkeren Typ
- `HttpClient.get<T>()` und `fetch()` sind **getarnte Assertions** — immer `unknown` + Validierung

> 🧠 **Erklaere dir selbst:** Was ist der Zusammenhang zwischen
> "Parse, Don't Validate", Branded Types (L24) und dem
> defensiven/offensiven Modell?
> **Kernpunkte:** Parse, Don't Validate = an der Grenze validieren
> und in einen staerkeren Typ umwandeln | Branded Types = der
> staerkere Typ (Email statt string) | Die Schale parsed, der
> Kern arbeitet mit dem Branded Type | Alles haengt zusammen

**Kernkonzept zum Merken:** Verteidige die Grenzen deines Systems aggressiv. Innerhalb der Grenzen vertraue dem Typsystem komplett. Das ist die effizienteste Balance zwischen Sicherheit und Einfachheit.

---

> **Pausenpunkt** — Die Denkschulen sind verstanden. In der letzten
> Sektion fasst du alles als Code-Review-Checkliste zusammen.
>
> Weiter geht es mit: [Sektion 06: Praxis — Code-Review-Checkliste](./06-praxis-code-review.md)
