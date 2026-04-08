# Sektion 5: Das Newtype Pattern

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Fluent API Pattern](./04-fluent-api-pattern.md)
> Naechste Sektion: [06 - Praxis-Kombination](./06-praxis-kombination.md)

---

## Was du hier lernst

- Was das **Newtype Pattern** ist und wie es sich von Branded Types unterscheidet
- Wie man **Wrapper-Typen** mit vollem Typ-Schutz und null Runtime-Overhead baut
- Wann man **Newtype vs. Branded Type vs. Phantom Type** waehlt
- Wie das **Opaque Type Pattern** in grossen Codebases funktioniert

---

## Hintergrund: Newtypes in Haskell und Rust

> **Feature Origin Story: Newtype**
>
> Das Newtype Pattern kommt aus Haskell: `newtype UserId = UserId Int`.
> Es erzeugt einen voellig neuen Typ, der zur Laufzeit identisch mit dem
> Basistyp ist (der Compiler optimiert den Wrapper weg).
>
> Rust hat ein aehnliches Konzept: `struct UserId(i32)` — ein Tuple Struct
> als Wrapper. Anders als in Haskell hat der Rust-Wrapper tatsaechlich eine
> Laufzeit-Repraesentaiton, aber der Compiler kann ihn oft wegoptimieren.
>
> In TypeScript gibt es kein eingebautes Newtype. Aber mit dem
> Zusammenspiel von Branded Types, Phantom Types und Utility Types
> koennen wir ein sehr aehnliches Pattern bauen. Der Vorteil gegenueber
> einfachen Branded Types: Newtypes koennen eigene **Operationen**
> definieren, die nur auf dem Newtype funktionieren.

---

## Das Problem: Primitive Obsession

```typescript annotated
// "Primitive Obsession" — alles ist string oder number:
function createOrder(
  userId: string,      // User-ID
  productId: string,   // Produkt-ID
  quantity: number,     // Menge
  priceInCents: number  // Preis in Cent
): void {
  // Welcher string ist welche ID?
  // Welche number ist Menge, welche Preis?
}

// Verwechslung ist LEICHT moeglich:
createOrder(
  "prod-123",  // Oops! productId statt userId
  "user-456",  // Oops! userId statt productId
  1999,        // Ist das die Menge oder der Preis?
  3            // Und das?
);
// ^ TypeScript: "Alles OK!" — Alles ist string/number.
```

> 💭 **Denkfrage:** Du hast Branded Types (L24) und Phantom Types (L26.3)
> kennengelernt. Beide loesen dieses Problem. Warum brauchen wir noch
> ein weiteres Pattern?
>
> **Antwort:** Branded Types und Phantom Types verhindern Verwechslungen.
> Newtypes gehen einen Schritt weiter: Sie definieren **eigene
> Operationen** die nur auf diesem Typ funktionieren. Z.B. kann man
> zwei `UserId`s nicht addieren, auch wenn es intern `number` ist.

---

## Newtype in TypeScript: Der vollstaendige Ansatz

```typescript annotated
// Schritt 1: Newtype-Grundlage mit unique symbol
// (unique symbol ist zur Compilezeit einzigartig — perfekt fuer Branding)
declare const UserIdBrand: unique symbol;
declare const ProductIdBrand: unique symbol;
declare const CentsAmountBrand: unique symbol;

// Schritt 2: Newtype-Definitionen
type UserId = string & { readonly [UserIdBrand]: typeof UserIdBrand };
type ProductId = string & { readonly [ProductIdBrand]: typeof ProductIdBrand };
type CentsAmount = number & { readonly [CentsAmountBrand]: typeof CentsAmountBrand };
// ^ Jeder Typ hat ein einzigartiges Symbol als Brand
// ^ Zur Laufzeit sind es normale string/number-Werte

// Schritt 3: Smart Constructors (Validierung beim Erstellen)
function UserId(raw: string): UserId {
  if (!raw.startsWith("user-")) {
    throw new Error(`Ungueltige UserId: ${raw}`);
  }
  return raw as UserId;
}

function ProductId(raw: string): ProductId {
  if (!raw.startsWith("prod-")) {
    throw new Error(`Ungueltige ProductId: ${raw}`);
  }
  return raw as ProductId;
}

function CentsAmount(raw: number): CentsAmount {
  if (!Number.isInteger(raw) || raw < 0) {
    throw new Error(`Ungueltiger Cent-Betrag: ${raw}`);
  }
  return raw as CentsAmount;
}

// Schritt 4: Typsichere Funktionen
function createOrder(
  userId: UserId,
  productId: ProductId,
  quantity: number,
  price: CentsAmount
): void { /* ... */ }

// Jetzt:
const uid = UserId("user-456");
const pid = ProductId("prod-123");
const price = CentsAmount(1999);

createOrder(uid, pid, 3, price); // OK
// createOrder(pid, uid, 3, price); // COMPILE-ERROR!
// ^ ProductId ist nicht UserId — obwohl beides intern string ist
```

> 🧠 **Erklaere dir selbst:** Warum verwenden wir `unique symbol` statt
> eines einfachen String-Literals als Brand? Was waere der Nachteil von
> `type UserId = string & { __brand: "UserId" }`?
>
> **Kernpunkte:** unique symbol ist zur Compilezeit garantiert einzigartig |
> String-Literals koennten in verschiedenen Dateien kollidieren |
> unique symbol kann nicht versehentlich dupliziert werden |
> Fuer kleine Projekte reichen String-Brands — fuer grosse unique symbol

---

## Operationen auf Newtypes
<!-- section:summary -->
Der Kern-Vorteil von Newtypes: Eigene Operationen definieren:

<!-- depth:standard -->
Der Kern-Vorteil von Newtypes: Eigene Operationen definieren:

```typescript annotated
// Cent-Betraege koennen addiert werden — ergibt wieder CentsAmount:
function addCents(a: CentsAmount, b: CentsAmount): CentsAmount {
  return ((a as number) + (b as number)) as CentsAmount;
  // ^ Interner Cast: Wir wissen dass number + number = number
  //   und das Ergebnis ist wieder ein gueltiger CentsAmount
}

// Cent-Betraege koennen mit einem Faktor multipliziert werden:
function multiplyCents(amount: CentsAmount, factor: number): CentsAmount {
  return Math.round((amount as number) * factor) as CentsAmount;
}

// ABER: Zwei UserIds addieren ergibt keinen Sinn!
// addCents(UserId("user-1"), UserId("user-2")); // COMPILE-ERROR!
// ^ UserId ist kein CentsAmount — auch wenn beides intern string/number ist.

// Formatierung als eigene Operation:
function formatCents(amount: CentsAmount): string {
  const euros = (amount as number) / 100;
  return `${euros.toFixed(2)} EUR`;
}

console.log(formatCents(CentsAmount(1999))); // "19.99 EUR"
```

<!-- depth:vollstaendig -->
> **Experiment:** Baue ein Newtype-System fuer Temperatur:
>
> ```typescript
> // Definiere Celsius und Fahrenheit als Newtypes:
> declare const CelsiusBrand: unique symbol;
> declare const FahrenheitBrand: unique symbol;
>
> type Celsius = number & { readonly [CelsiusBrand]: typeof CelsiusBrand };
> type Fahrenheit = number & { readonly [FahrenheitBrand]: typeof FahrenheitBrand };
>
> // Konvertierungsfunktion:
> function toFahrenheit(c: Celsius): Fahrenheit {
>   return ((c as number) * 9/5 + 32) as Fahrenheit;
> }
>
> // Was passiert bei: toFahrenheit(72 as Fahrenheit)?
> // Antwort: COMPILE-ERROR! Fahrenheit ist nicht Celsius.
> // Ohne Newtypes: 72°F wuerde als 161.6°F interpretiert — ein stiller Bug.
> ```

---

<!-- /depth -->
## Opaque Types: Newtypes in grossen Codebases
<!-- section:summary -->
In grossen Projekten verwendet man oft das **Opaque Type Pattern**:

<!-- depth:standard -->
In grossen Projekten verwendet man oft das **Opaque Type Pattern**:
Der Typ ist nur innerhalb eines Moduls bekannt:

```typescript annotated
// user-id.ts — Nur dieses Modul kennt die interne Struktur
declare const brand: unique symbol;
export type UserId = string & { readonly [brand]: "UserId" };

// Smart Constructor — der EINZIGE Weg eine UserId zu erstellen:
export function createUserId(raw: string): UserId {
  if (!/^user-\d+$/.test(raw)) {
    throw new Error(`Invalid UserId format: ${raw}`);
  }
  return raw as UserId;
}

// Hilfsfunktionen:
export function userIdToString(id: UserId): string {
  return id; // Implizite Konvertierung: UserId ist ein string
}

// Andere Module koennen UserId NICHT selbst erstellen:
// const fake = "user-123" as UserId; // Funktioniert technisch,
// aber die Konvention ist: NUR createUserId() verwenden.
// In strikte Code-Reviews wird `as UserId` abgelehnt.
```

> ⚡ **In deinem Angular-Projekt** kannst du Opaque Types fuer
> Entitaets-IDs verwenden:
>
> ```typescript
> // entity-ids.ts
> export type UserId = string & { readonly __entity: "User" };
> export type OrderId = string & { readonly __entity: "Order" };
>
> // user.service.ts
> @Injectable({ providedIn: 'root' })
> export class UserService {
>   getUser(id: UserId): Observable<User> {
>     return this.http.get<User>(`/api/users/${id}`);
>   }
> }
>
> // Jetzt: this.userService.getUser(orderId) → COMPILE-ERROR!
> // Eine OrderId ist keine UserId. Verwechslung unmoeglich.
> ```
>
> In React mit TypeScript:
>
> ```typescript
> // Typsichere Route-Parameter:
> type RouteParams = { userId: UserId; orderId: OrderId };
> const { userId, orderId } = useParams<RouteParams>();
> // userId ist UserId, orderId ist OrderId — keine Verwechslung
> ```

---

<!-- /depth -->
## Entscheidungsmatrix: Welches Pattern wann?
<!-- section:summary -->
| Kriterium | Branded Type | Phantom Type | Newtype |

<!-- depth:standard -->
| Kriterium | Branded Type | Phantom Type | Newtype |
|---|---|---|---|
| Verwechslung verhindern | Ja | Ja | Ja |
| Eigene Operationen | Nein | Eingeschraenkt | Ja |
| Zustandstracking | Nein | Ja | Moeglich |
| Validierung bei Erstellung | Optional | Optional | Empfohlen |
| Komplexitaet | Gering | Mittel | Mittel-Hoch |
| Empfehlung | Simple IDs | Zustaende | Domain-Werte |

---

<!-- /depth -->
## Was du gelernt hast

- Das **Newtype Pattern** erstellt semantisch verschiedene Typen aus dem gleichen Basistyp
- **Smart Constructors** validieren bei Erstellung und sind der einzige Weg Newtypes zu erstellen
- **Eigene Operationen** (addCents, multiplyCents) arbeiten nur auf dem richtigen Newtype
- **Opaque Types** verstecken die interne Struktur hinter einem Modul
- `unique symbol` bietet staerkere Einzigartigkeit als String-Literals als Brand

> 🧠 **Erklaere dir selbst:** Was ist der Unterschied zwischen
> `type UserId = string & { __brand: "UserId" }` und dem Newtype-Ansatz
> mit `unique symbol`? Wann reicht das einfache Brand?
>
> **Kernpunkte:** String-Brand reicht fuer kleine Projekte | unique symbol
> fuer grosse Codebases | Newtype mit Smart Constructor erzwingt Validierung |
> Branded Type erlaubt `as UserId` ohne Validierung

**Kernkonzept zum Merken:** Newtypes sind "Wrapper ohne Wrapper" — sie
geben primitiven Werten eine Domain-Bedeutung, mit Validierung bei
Erstellung und eigenen Operationen, ohne Laufzeit-Overhead.

---

> **Pausenpunkt** -- Du kennst jetzt 5 fortgeschrittene Patterns.
> In der letzten Sektion kombinieren wir alles.
>
> Weiter geht es mit: [Sektion 06: Praxis-Kombination](./06-praxis-kombination.md)
