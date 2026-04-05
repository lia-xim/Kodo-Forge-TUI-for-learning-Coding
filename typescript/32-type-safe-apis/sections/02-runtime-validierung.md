# Sektion 2: Zod und Valibot — Runtime-Validierung

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - REST API Typing](./01-rest-api-typing.md)
> Naechste Sektion: [03 - End-to-End Type Safety (tRPC)](./03-end-to-end-type-safety.md)

---

## Was du hier lernst

- Warum Runtime-Validierung die Luecke zwischen TypeScript-Typen und echten Daten schliesst
- Wie Zod Schemas definiert die gleichzeitig TypeScript-Typen UND Runtime-Validierung sind
- Wie Valibot als leichtgewichtige Alternative funktioniert
- Das Pattern "Schema First" — Schema als Single Source of Truth

---

## Das Problem: Typen luegen

TypeScript-Typen existieren nur zur Compilezeit (Type Erasure, L02).
Daten von aussen — APIs, LocalStorage, URL-Parameter, FormData —
haben zur Laufzeit KEINE Typen. `as User[]` ist wie ein Schild an der
Tuer das "Bitte nur Berechtigte eintreten" sagt — aber niemanden
kontrolliert. Zod hingegen ist der Grenzbeamte: Prueft jeden Einreisenden,
weist zurueck wenn die Papiere nicht stimmen:

```typescript
// TypeScript sagt: users ist User[]
const users = await fetch('/api/users').then(r => r.json()) as User[];

// Realitaet: users koennte ALLES sein
// - null (API gibt null zurueck)
// - { error: "unauthorized" } (Fehler-Response)
// - [{ id: 1, fullName: "Max" }] (anderes Schema)
// - "Internal Server Error" (plain text)
```

> 📖 **Hintergrund: Die Geburt der Schema-Validierung**
>
> Das Problem ist so alt wie Web-APIs. In der Java-Welt gab es Jackson
> und Gson fuer JSON-Validierung. In Python gibt es Pydantic. In der
> TypeScript-Welt war `io-ts` (2017) von Giulio Canti der Pionier.
> Dann kam **Zod** (2020) von Colin McDonnell, das mit einer
> entwicklerfreundlichen API und hervorragender TypeScript-Integration
> zum De-facto-Standard wurde. **Valibot** (2023) von Fabian Hiller
> bietet die gleiche Idee mit einem radikal kleineren Bundle (~1kb
> vs ~13kb fuer Zod).

---

## Zod: Schema als Source of Truth

Zod's Kernidee: Du definierst ein Schema, und Zod leitet den
TypeScript-Typ automatisch ab. Das Schema ist wie ein Stempel im
Reisepass: Es definiert WAS gueltig ist — und der abgeleitete Typ
ist einfach die TypeScript-Uebersetzung davon. Eine einzige
Quelle, zwei Darstellungen:

```typescript annotated
import { z } from 'zod';

// Schema definieren — das ist die EINZIGE Wahrheitsquelle
const UserSchema = z.object({
  id: z.string().uuid(),
  // ^ string mit UUID-Validierung
  name: z.string().min(1).max(100),
  // ^ string mit Laengen-Constraints
  email: z.string().email(),
  // ^ string mit Email-Format-Pruefung
  role: z.enum(["admin", "user", "viewer"]),
  // ^ Literal Union — nur diese 3 Werte erlaubt
  createdAt: z.string().datetime(),
  // ^ ISO 8601 Datetime-String
});

// TypeScript-Typ ABLEITEN — nicht manuell definieren!
type User = z.infer<typeof UserSchema>;
// ^ { id: string; name: string; email: string; role: "admin" | "user" | "viewer"; createdAt: string }
// Der Typ ist IDENTISCH mit einem manuell definierten Interface —
// aber er kann NICHT vom Schema abweichen!
```

### Validierung in Aktion

```typescript annotated
// parse() — wirft bei ungueltigem Input
function validateUser(data: unknown): User {
  return UserSchema.parse(data);
  // ^ Wenn data nicht dem Schema entspricht: ZodError
  // ^ Wenn data gueltig ist: Rueckgabetyp ist User (exakt!)
}

// safeParse() — gibt Result zurueck (kein throw)
function validateUserSafe(data: unknown): z.SafeParseReturnType<unknown, User> {
  const result = UserSchema.safeParse(data);
  if (result.success) {
    console.log(result.data.name);
    // ^ result.data: User — typsicher nach dem success-Check!
  } else {
    console.log(result.error.issues);
    // ^ Detaillierte Fehlermeldungen pro Feld
  }
  return result;
}
```

> 💭 **Denkfrage:** Warum ist `z.infer<typeof Schema>` besser als
> ein manuell definiertes Interface `interface User { ... }`?
>
> **Antwort:** Weil Schema und Typ nicht auseinanderlaufen koennen.
> Bei manuellen Typen koenntest du das Interface aendern aber die
> Validierung vergessen — oder umgekehrt. Mit z.infer ist der Typ
> IMMER korrekt relativ zum Schema. Single Source of Truth.

---

## Zod-Patterns fuer APIs

```typescript annotated
// Request-Validierung
const CreateUserSchema = UserSchema.pick({ name: true, email: true }).extend({
  role: z.enum(["admin", "user", "viewer"]).optional(),
  // ^ Pick + extend — wie Pick<User, ...> & { role?: ... } aber mit Validierung
});
type CreateUserRequest = z.infer<typeof CreateUserSchema>;

// Response-Validierung (API-Antwort pruefen)
const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: z.object({
      page: z.number(),
      total: z.number(),
      perPage: z.number(),
    }).optional(),
  });
// ^ Generischer Response-Wrapper — wiederverwendbar fuer alle Endpunkte

// Validierter Fetch
async function fetchUsers(): Promise<User[]> {
  const raw = await fetch('/api/users').then(r => r.json());
  const response = ApiResponseSchema(z.array(UserSchema)).parse(raw);
  // ^ Runtime-Validierung! Wenn die API ein anderes Schema liefert → ZodError
  return response.data;
  // ^ response.data: User[] — GARANTIERT korrekt
}
```

> 🧠 **Erklaere dir selbst:** Was ist der Unterschied zwischen
> `response.json() as User[]` und `UserSchema.array().parse(response.json())`?
> Wann wuerde der erste Ansatz funktionieren und der zweite nicht?
>
> **Kernpunkte:** `as User[]` ist ein Cast — keine Pruefung, glaubt dir blind |
> `.parse()` validiert jeden Wert — wirft bei Abweichung | Erster Ansatz
> "funktioniert" immer (kompiliert) — Fehler erst spaeter | Zweiter
> Ansatz faellt sofort auf wenn API-Antwort nicht passt

---

## Valibot: Die leichtgewichtige Alternative

Valibot bietet die gleiche Funktionalitaet mit radikalem Tree-Shaking:

```typescript annotated
import * as v from 'valibot';

// Schema — aehnliche API wie Zod, aber modularer
const UserSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  // ^ pipe() statt Methoden-Chaining — besser fuer Tree-Shaking
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
  email: v.pipe(v.string(), v.email()),
  role: v.picklist(["admin", "user", "viewer"]),
  // ^ picklist statt enum — gleiche Funktionalitaet
  createdAt: v.pipe(v.string(), v.isoTimestamp()),
});

// Typ ableiten — identisch zu Zod
type User = v.InferOutput<typeof UserSchema>;

// Validierung
const result = v.safeParse(UserSchema, data);
if (result.success) {
  result.output.name; // typsicher!
}
```

### Zod vs Valibot: Entscheidungshilfe

```typescript
// Zod: Methoden-Chaining (ergonomisch, aber groesseres Bundle)
z.string().min(1).max(100).email()    // ~13kb min (gzip)

// Valibot: Pipe-basiert (kleineres Bundle, mehr Imports)
v.pipe(v.string(), v.minLength(1), v.maxLength(100), v.email())  // ~1kb min (gzip)
```

| Kriterium | Zod | Valibot |
|---|---|---|
| Bundle-Groesse | ~13kb gzip | ~1kb gzip |
| API-Stil | Method-Chaining | Pipe/Funktional |
| Tree-Shaking | Begrenzt | Exzellent |
| Ecosystem | Sehr gross | Wachsend |
| Empfehlung | Server, groessere Apps | Client, Bundle-kritisch |

> ⚡ **Praxis-Tipp fuer Angular:** In Angular-Projekten ist die
> Bundle-Groesse weniger kritisch (kein SSR-Overhead wie bei Next.js).
> Zod ist hier oft die bessere Wahl wegen des groesseren Oekosystems.
> In React/Next.js-Projekten kann Valibot durch kleinere Bundles
> punkten.

---

## Das "Schema First"-Pattern

Die beste Praxis: Schema zuerst definieren, dann Typ ableiten.
"Schema First" ist wie zuerst den Bauplan zu zeichnen und dann daraus
die Materialliste abzuleiten — nie umgekehrt. Wenn du den Plan aenderst,
stimmt die Liste automatisch. Wenn du beides separat pflegst, laufen
sie irgendwann auseinander:

```typescript annotated
// ❌ SCHLECHT: Typ zuerst, Schema nachtraeglich
interface User { name: string; email: string; }
const UserSchema = z.object({ name: z.string(), email: z.string() });
// ^ Schema und Interface KOENNTEN auseinanderlaufen!

// ✅ GUT: Schema zuerst, Typ ableiten
const UserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});
type User = z.infer<typeof UserSchema>;
// ^ Typ ist GARANTIERT identisch zum Schema
```

> 🔬 **Experiment:** Baue einen validierten fetch-Wrapper mit Zod:
>
> ```typescript
> import { z } from 'zod';
>
> async function validatedFetch<T extends z.ZodType>(
>   url: string,
>   schema: T
> ): Promise<z.infer<T>> {
>   const response = await fetch(url);
>   const data = await response.json();
>   return schema.parse(data);
>   // Was passiert wenn die API ein unerwartetes Format liefert?
>   // Antwort: ZodError mit detaillierten Fehlermeldungen pro Feld
> }
>
> // Verwendung:
> const users = await validatedFetch('/api/users', z.array(UserSchema));
> // users: User[] — GARANTIERT korrekt, nicht nur "Trust me"
> ```

---

## Transform und Coercion

Zod kann Daten waehrend der Validierung transformieren:

```typescript annotated
const EventSchema = z.object({
  name: z.string(),
  date: z.string().datetime().transform(s => new Date(s)),
  // ^ Input: string, Output: Date — Transformation im Schema!
  attendees: z.coerce.number(),
  // ^ Coercion: "42" → 42, akzeptiert string ODER number
});

type EventInput = z.input<typeof EventSchema>;
// ^ { name: string; date: string; attendees: string | number }
type EventOutput = z.output<typeof EventSchema>;
// ^ { name: string; date: Date; attendees: number }
// Input und Output haben VERSCHIEDENE Typen!
```

---

## Was du gelernt hast

- Runtime-Validierung schliesst die Luecke zwischen TypeScript-Typen und echten Daten
- Zod definiert Schemas die gleichzeitig TypeScript-Typen UND Validierungslogik sind
- `z.infer<typeof Schema>` leitet den Typ automatisch ab — Single Source of Truth
- Valibot bietet die gleiche Funktionalitaet mit ~1kb statt ~13kb Bundle-Groesse
- Transform/Coercion konvertieren Daten waehrend der Validierung

**Kernkonzept zum Merken:** "Schema First" ist der Schluessel. Definiere zuerst das Schema (was WIRKLICH gueltig ist), dann leite den TypeScript-Typ ab. So koennen Schema und Typ nie auseinanderlaufen — und dein Code ist zur Compilezeit UND Laufzeit sicher.

---

> **Pausenpunkt** — Du weisst jetzt, wie du die Typen-Luecke
> schliesst. Naechster Schritt: End-to-End Type Safety.
>
> Weiter geht es mit: [Sektion 03: End-to-End Type Safety (tRPC)](./03-end-to-end-type-safety.md)
