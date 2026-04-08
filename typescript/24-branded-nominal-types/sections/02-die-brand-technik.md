# Sektion 2: Die Brand-Technik

> Geschätzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Das Nominal-Typing-Problem](./01-das-nominal-typing-problem.md)
> Nächste Sektion: [03 - Smart Constructors & Opaque Types](./03-smart-constructors-opaque-types.md)

---

## Was du hier lernst

- Wie die **Brand-Technik** mit Intersection Types funktioniert
- Warum `string & { readonly __brand: 'UserId' }` nominal sicher ist
- Wie man **Smart Constructors** schreibt die Brands vergeben
- Den Unterschied zwischen **compile-time Brand** und Runtime-Overhead

---

## Die Idee: Struktur künstlich machen
<!-- section:summary -->
Das Problem aus Sektion 01: `type UserId = string` ist strukturell identisch

<!-- depth:standard -->
Das Problem aus Sektion 01: `type UserId = string` ist strukturell identisch
mit `string`. TypeScript kann sie nicht unterscheiden.

Die Lösung: Wir machen die Struktur *künstlich verschieden*, indem wir ein
einzigartiges "Brand"-Property hinzufügen.

<!-- depth:vollstaendig -->
> **Hintergrund: Woher kommt die Brand-Technik?**
>
> Die Brand-Technik wurde in der TypeScript-Community entwickelt als
> Workaround für fehlendes Nominal Typing. Sie wurde populär gemacht durch
> Projekte wie `ts-brand` (Charles Pick, 2019) und später durch Microsoft's
> eigenen Code (z.B. in TypeScript's `src/compiler/types.ts`!).
>
> Interessanterweise verwendet TypeScript selbst diese Technik intern, um
> Node-IDs, Source-File-Referenzen und andere typkritische Werte zu schützen.
> Die TypeScript-Compiler-Quelle enthält Dutzende von `{ readonly __brand: ... }`.
>
> Das zeigt: Auch TypeScript-Experten brauchen diese Technik — sie ist kein Hack,
> sondern ein anerkanntes Pattern im TypeScript-Ökosystem.

---

<!-- /depth -->
## Die Brand-Technik im Detail
<!-- section:summary -->
### Warum Intersection (`&`) und nicht Interface?

<!-- depth:standard -->
```typescript annotated
// Schritt 1: Brand-Typ als Intersection definieren
type UserId = string & { readonly __brand: 'UserId' };
//            ^^^^^^   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//            Basis    Das "Brand" — ein einzigartiges Property
//            (string) das TypeScript als strukturellen Unterschied erkennt

// 'readonly': Verhindert, dass das Brand-Property verändert werden kann
// '__brand': Konvention: __ = "interne" Property (nicht für User)
// 'UserId': Der Name macht das Brand einzigartig

type OrderId = string & { readonly __brand: 'OrderId' };
//                                          ^^^^^^^^^ Anderer Brand-Name!

// Jetzt sind UserId und OrderId STRUKTURELL VERSCHIEDEN:
// UserId  = string & { __brand: 'UserId' }
// OrderId = string & { __brand: 'OrderId' }
// TypeScript kann sie nicht mehr verwechseln!
```

### Warum Intersection (`&`) und nicht Interface?

```typescript annotated
// Option A: Intersection mit string (üblich)
type UserId = string & { readonly __brand: 'UserId' };

// Option B: Interface (seltener)
interface UserId {
  readonly __brand: 'UserId';
  // Aber: Wohin mit der eigentlichen string-Natur?
  // Interfaces können nicht direkt "extends string"
}

// Option A ist besser:
// - Branded UserId VERHÄLT sich wie string (hat .toUpperCase(), .length, etc.)
// - Überall wo string erwartet wird, kann UserId übergeben werden
// - Aber: Gewöhnlicher string kann NICHT mehr als UserId übergeben werden!
//   (Weil normaler string kein __brand-Property hat)
```

> 🧠 **Erkläre dir selbst:** Warum kann ein `string` nicht an eine Funktion
> übergeben werden die `UserId` erwartet, obwohl UserId ein Intersection mit
> `string` ist? Was bedeutet Intersection (`&`) für die Zuweisbarkeit?
>
> **Kernpunkte:** `A & B` bedeutet: "muss BEIDES haben" | Ein normaler `string`
> hat kein `__brand`-Property | Deshalb: `string` ist nicht zuweisbar zu `UserId` |
> Aber `UserId` ist zuweisbar zu `string` (weil es string + mehr ist)

---

<!-- /depth -->
## Das vollständige Beispiel

```typescript annotated
// 1. Brand-Typen definieren
type UserId  = string & { readonly __brand: 'UserId' };
type OrderId = string & { readonly __brand: 'OrderId' };

// 2. API-Funktionen nutzen die Brands
function getUser(id: UserId): string {
  return `User: ${id}`;
  // ^ 'id' kann wie ein normaler string verwendet werden!
  //   .toUpperCase(), .length, Template Literals — alles funktioniert.
}

function getOrder(id: OrderId): string {
  return `Order: ${id}`;
}

// 3. Normale Strings funktionieren NICHT mehr:
const rawString = "user-123";

getUser(rawString);
// ^ COMPILE-ERROR: Argument of type 'string' is not assignable to
//   parameter of type 'UserId'. Type 'string' is not assignable to
//   type '{ readonly __brand: "UserId"; }'.
//   → TypeScript schützt uns!

// 4. Brands können nicht verwechselt werden:
const orderId = "order-456" as OrderId; // (as-Cast erklären wir gleich)
getUser(orderId);
// ^ COMPILE-ERROR: Argument of type 'OrderId' is not assignable to
//   parameter of type 'UserId'. Types of property '__brand' are
//   incompatible. Type '"OrderId"' is not assignable to type '"UserId"'.
//   → Perfekt: Verschiedene Brands = Compile-Error!
```

---

## Smart Constructors: Das richtige Casting
<!-- section:summary -->
Eine Frage bleibt: Wie erstellt man eigentlich einen `UserId`-Wert?

<!-- depth:standard -->
Eine Frage bleibt: Wie erstellt man eigentlich einen `UserId`-Wert?
Wir brauchen **Smart Constructors** — Funktionen die aus einem `string`
einen validierten `UserId` machen.

```typescript annotated
// Smart Constructor Variante 1: Einfaches Casting (ohne Validierung)
function asUserId(value: string): UserId {
  return value as UserId;
  // ^ 'as UserId': Ein expliziter Type Assertion (Cast).
  //   Das ist der EINZIGE Ort wo wir 'as' verwenden!
  //   Wir "lügen" hier zum Compiler — aber bewusst und kontrolliert.
  //   Außerhalb dieser Funktion kann niemand versehentlich casten.
}

// Smart Constructor Variante 2: Mit Validierung (empfohlen!)
function createUserId(value: string): UserId {
  if (!value.startsWith('user-')) {
    throw new Error(`Ungültige UserId: "${value}"`);
    // ^ Verliert den 'as'-Cast ohne Validierung zu machen
  }
  if (value.length < 10) {
    throw new Error(`UserId zu kurz: "${value}"`);
  }
  return value as UserId;
  // ^ Hier ist der Cast sicher: Wir haben geprüft, dass der Wert valid ist.
}

// Verwendung:
const userId = createUserId('user-abc123');
// userId: UserId — typsicher UND validiert!

getUser(userId); // ✅ Funktioniert!
getOrder(userId); // ❌ COMPILE-ERROR — perfekt!
```

<!-- depth:vollstaendig -->
> **Experiment:** Öffne `examples/01-brand-basics.ts` und versuche folgendes:
> 1. Erstelle einen `UserId` mit `asUserId('user-123')`.
> 2. Versuche den gleichen Wert direkt (ohne Cast) an `getUser()` zu übergeben.
> 3. Beobachte: Was sagt TypeScript? Welche Fehlermeldung genau?

---

<!-- /depth -->
## Das `as`-Casting Problem einschränken
<!-- section:summary -->
Ein gutes Design-Prinzip: `as Brand` sollte **nur** in Smart Constructors

<!-- depth:standard -->
Ein gutes Design-Prinzip: `as Brand` sollte **nur** in Smart Constructors
vorkommen, nie im Business-Code. Um das erzuzwingen, können wir auf zwei
Arten vorgehen:

```typescript annotated
// Strategie 1: Modul mit privatem Brand
// In userId.ts:
declare const __brand: unique symbol; // Geheimes Symbol!
//            ^^^^^^^^^^^^ 'unique symbol' ist noch stärker:
//            Jeder 'unique symbol' ist einer eigener Typ!

type UserId = string & { readonly [__brand]: 'UserId' };
//                              ^^^^^^^^^ Computed property mit privatem Symbol

// Das 'unique symbol' kann nur in DIESER Datei als Key verwendet werden.
// Andere Module kennen __brand nicht → können keinen Cast machen!
export function createUserId(value: string): UserId {
  return value as UserId; // Nur hier erlaubt!
}
// Export nur die Funktion, nicht das Symbol → perfekte Kapselung!

// Strategie 2: Opaque Types (nächste Sektion)
```

> 💭 **Denkfrage:** Wenn wir `as UserId` überall im Code erlauben, haben wir
> einen Teil der Typsicherheit verloren. Warum? Was ist der Unterschied zwischen
> einem `as`-Cast in einem Smart Constructor und einem `as`-Cast im Business-Code?
>
> **Antwort:** Im Smart Constructor ist der Cast *dokumentiert und validiert* —
> ein einzelner Ort, der geprüft werden kann. `as`-Casts im Business-Code sind
> unsichtbar verteilt und schwer zu auditieren. TypeScript selbst sagt: "as" ist
> ein Promise an den Compiler ("Trau mir") — und Promises sollten zentralisiert werden.

---

<!-- /depth -->
## Branded Types verhalten sich wie primitive Typen
<!-- section:summary -->
Ein wichtiger Vorteil: Branded Types sind immer noch der Basis-Typ!

<!-- depth:standard -->
Ein wichtiger Vorteil: Branded Types sind immer noch der Basis-Typ!

```typescript annotated
type UserId = string & { readonly __brand: 'UserId' };

function createUserId(s: string): UserId {
  return s as UserId;
}

const id = createUserId('user-123');

// Alle string-Operationen funktionieren:
console.log(id.toUpperCase());  // 'USER-123'
console.log(id.length);         // 8
console.log(`ID: ${id}`);       // 'ID: user-123'
console.log(id.startsWith('user-')); // true

// Kann als string übergeben werden (Upcast, safe):
function logRaw(s: string): void { console.log(s); }
logRaw(id); // ✅ OK! UserId ist Subtyp von string.

// Aber string → UserId geht nicht (Downcast, unsafe):
function logUserId(id: UserId): void { console.log(id); }
const rawStr = "user-456";
// logUserId(rawStr); // ❌ COMPILE-ERROR
```

<!-- depth:vollstaendig -->
> **In deinem Angular-Projekt:** Du kannst Branded Types direkt in
> HttpClient-Aufrufen verwenden:
>
> ```typescript
> type UserId = string & { readonly __brand: 'UserId' };
>
> @Injectable({ providedIn: 'root' })
> export class UserService {
>   constructor(private http: HttpClient) {}
>
>   getUser(id: UserId) {
>     // 'id' verhält sich exakt wie string im Template-Literal:
>     return this.http.get<User>(`/api/users/${id}`);
>   }
>
>   deleteUser(id: UserId) {
>     return this.http.delete(`/api/users/${id}`);
>     // Kein Casten nötig! UserId ist kompatibel mit string im Template.
>   }
> }
>
> // Und in React:
> function UserCard({ userId }: { userId: UserId }) {
>   const { data } = useQuery(['user', userId], () => fetchUser(userId));
>   // userId ist kompatibel als Query-Key (string[]) und als Argument
>   return <div>{userId}</div>; // Funktioniert in JSX!
> }
> ```

---

<!-- /depth -->
## Zero Runtime Overhead
<!-- section:summary -->
Ein entscheidender Vorteil der Brand-Technik: **Kein Runtime-Overhead**.

<!-- depth:standard -->
Ein entscheidender Vorteil der Brand-Technik: **Kein Runtime-Overhead**.

Das `__brand`-Property existiert **nur zur Compilezeit**. Nach der Kompilierung
ist ein `UserId`-Wert einfach ein normaler JavaScript-String:

```typescript
// TypeScript (Compilezeit):
const id: UserId = createUserId('user-123');

// JavaScript nach Transpilierung:
const id = 'user-123'; // Einfach ein String!
// Das __brand-Property existiert nicht!
```

Das ist der Unterschied zu einer Klassen-Lösung:
```javascript
// Klassen-Lösung hätte Runtime-Overhead:
class UserId { constructor(val) { this.value = val; } }
const id = new UserId('user-123'); // Objekt-Allokation!
```

---

<!-- /depth -->
## Was du gelernt hast

- **Brand-Technik**: `type UserId = string & { readonly __brand: 'UserId' }` macht Typen
  strukturell unterschiedlich — ohne Runtime-Overhead
- Normale `string`-Werte sind **nicht mehr** zu `UserId` kompatibel → Compile-Error
- Verschiedene Brands (`'UserId'` vs `'OrderId'`) sind **nicht** kompatibel
- **Smart Constructors** zentralisieren `as`-Casts und können Validierung einbauen
- Branded Types verhalten sich vollständig wie ihr Basis-Typ (string-Operationen, Template Literals)

> 🧠 **Erkläre dir selbst:** Warum kann ein normaler `string` nicht an eine
> Funktion übergeben werden die `UserId` erwartet, obwohl `UserId = string & {...}`?
> Was prüft TypeScript bei Intersection Types?
>
> **Kernpunkte:** Intersection = muss ALLE Teile erfüllen | string allein
> hat kein `__brand` Property | TypeScript: "Du hast nicht alle Teile" → Error |
> Nur durch `as`-Cast oder Smart Constructor bekommst du ein echtes `UserId`

**Kernkonzept zum Merken:** Brand = Ein unsichtbares Property das zur Laufzeit
nicht existiert, aber TypeScript zur Compilezeit zwingt, Typen zu unterscheiden.

---

> **Pausenpunkt** -- Du kennst jetzt die grundlegende Brand-Technik.
>
> Weiter geht es mit: [Sektion 03: Smart Constructors & Opaque Types](./03-smart-constructors-opaque-types.md)
