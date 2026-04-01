# Sektion 1: Das Nominal-Typing-Problem

> Geschätzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: -- (Start)
> Nächste Sektion: [02 - Die Brand-Technik](./02-die-brand-technik.md)

---

## Was du hier lernst

- Warum `type UserId = string` **keine echte Typsicherheit** bietet
- Den Unterschied zwischen **Structural Typing** (TypeScript) und **Nominal Typing** (Java/C#)
- Welche realen Bugs durch verwechselbare Typen entstehen
- Warum der Compiler dich bei `loginUser(orderId, userId)` nicht schützt

---

## Hintergrund: Zwei Welten des Typsystems

> **Feature Origin Story: Structural vs. Nominal Typing**
>
> Es gibt zwei fundamentale Philosophien in der Typtheorie:
> **Structural Typing** und **Nominal Typing**.
>
> Java, C#, Swift — sie alle nutzen **Nominal Typing**: Ein Typ wird durch
> seinen *Namen* identifiziert. Eine `UserId`-Klasse und eine `OrderId`-Klasse
> sind verschiedene Typen, auch wenn sie beide nur einen `String` enthalten.
>
> TypeScript nutzt **Structural Typing**: Typen werden durch ihre *Struktur*
> identifiziert. Wenn zwei Typen die gleiche Struktur haben, sind sie
> austauschbar — egal wie sie heißen.
>
> Anders Hejlsberg (TS-Erfinder) entschied sich bewusst für Structural Typing,
> weil TypeScript *JavaScript* typen soll — und JavaScript hat keine Klassen im
> traditionellen Sinn. Structural Typing passt besser zur dynamischen Natur
> von JavaScript-Objekten.
>
> Aber das hat eine Konsequenz: Aliase für primitive Typen bringen keine
> zusätzliche Typsicherheit. `type Meter = number` und `type Second = number`
> sind für TypeScript **identisch**.

---

## Das Problem: Type Aliases helfen nicht

Stell dir vor, du hast eine Benutzer-Management-API:

```typescript annotated
// Du denkst, das macht deinen Code sicherer:
type UserId = string;
type OrderId = string;
type SessionToken = string;

function getUser(id: UserId): User { /* ... */ return {} as User; }
function getOrder(id: OrderId): Order { /* ... */ return {} as Order; }
function validateSession(token: SessionToken): boolean { return true; }

// Aber schau was TypeScript erlaubt:
const userId: UserId = "user-123";
const orderId: OrderId = "order-456";
const token: SessionToken = "abc-token";

getUser(orderId);     // KEIN FEHLER! OrderId ist strukturell identisch mit UserId
// ^ Das ist ein Bug: Wir übergeben eine Order-ID an eine User-Funktion

getOrder(token);      // KEIN FEHLER! SessionToken ist identisch mit OrderId
// ^ Noch schlimmer: Ein Session-Token als Order-ID

validateSession(userId); // KEIN FEHLER! Literal string
// ^ TypeScript sieht: "string" = "string". Kein Problem.
```

> 🧠 **Erkläre dir selbst:** Warum hilft `type UserId = string` nicht?
> Was macht TypeScript beim Typvergleich? Und was müsste TypeScript machen,
> damit `UserId` wirklich verschieden von `string` wäre?
>
> **Kernpunkte:** TypeScript prüft Struktur, nicht Namen | `UserId = string`
> bedeutet: "UserId IST string" (Alias, kein neuer Typ) | Für echten Schutz
> brauchen wir strukturellen Unterschied | Lösung: Einzigartiges Property hinzufügen

---

## Reale Bugs durch Typ-Verwechslung

Das ist kein theoretisches Problem. Es passiert in der Praxis:

```typescript annotated
// E-Commerce Backend
type ProductId = string;
type CartId = string;
type CouponCode = string;

// Alle drei: strukturell identisch mit string

function applyDiscount(cartId: CartId, coupon: CouponCode): void {
  // Verarbeitung...
}

function deleteProduct(productId: ProductId): void {
  // GEFÄHRLICHE Operation!
}

// Irgendwo im Code:
const productId: ProductId = "prod-789";
const cartId: CartId = "cart-456";
const coupon: CouponCode = "SAVE20";

// TypeScript sagt: OK!
applyDiscount(productId, cartId);
// ^ Bug: productId als cartId, cartId als coupon

deleteProduct(coupon);
// ^ Bug: CouponCode als ProductId — könnte Produktlöschung auslösen
```

> 💭 **Denkfrage:** Dieser Bug würde zur Laufzeit einen Fehler in der Datenbank
> auslösen — aber erst dann, nicht zur Compilezeit. Was wäre der Unterschied
> wenn TypeScript uns schon beim Kompilieren warnen könnte?
>
> **Antwort:** Compile-Time-Fehler sind "free" — sie kosten keine Serverzeit,
> hinterlassen keine inkonsistenten Datenbankzustände, und werden vom Entwickler
> sofort (im Editor) bemerkt. Runtime-Fehler entstehen oft erst in Production,
> wenn echte Daten bewegt werden. TypeScript-Ziel: Fehler so früh wie möglich.

---

## Nominal Typing in anderen Sprachen

Zum Vergleich: In Java wäre das Problem nicht möglich:

```java
// Java: Nominal Typing
class UserId {
    private final String value;
    UserId(String value) { this.value = value; }
}

class OrderId {
    private final String value;
    OrderId(String value) { this.value = value; }
}

// Java: COMPILE-FEHLER!
// getUser(new OrderId("order-456")); // Type mismatch: UserId vs OrderId
```

Java's Typsystem sagt: `UserId ≠ OrderId`, auch wenn beide nur `String` enthalten,
weil sie verschiedene **Namen** (Nominal) haben.

TypeScript sagt: `UserId = OrderId`, weil beide strukturell `string` sind.

> 🔍 **Tieferes Wissen: Warum hat TypeScript kein eingebautes Nominal Typing?**
>
> Die TypeScript-Designer haben Nominal Typing mehrfach diskutiert (GitHub Issues
> #202, #9455, #33148). Das Hauptargument dagegen: TypeScript muss mit
> existierendem JavaScript-Code interoperieren. JavaScript-Objekte haben
> keine "Klassen-Identität" im Java-Sinne.
>
> Außerdem würde Nominal Typing den Ergonomie-Vorteil von TypeScript zerstören:
> Wenn `{ name: string, age: number }` und `Person` (mit gleichen Feldern)
> inkompatibel wären, müsste man überall explizit konvertieren. Das ist
> der TypeScript-Albtraum — alle Vorteile von "just works with JS" wären weg.
>
> Die Lösung ist daher ein **Workaround**: Wir *simulieren* Nominal Typing
> innerhalb des Structural Type Systems — die sogenannte "Brand-Technik".

---

## Das Structural Typing Dilemma

Das Problem ist klar:

```
Structural Typing (TypeScript):
  UserId = string → ÜBERALL verwendbar wo string erwartet wird
  type Aliases → nur Dokumentation, keine echte Absicherung

Nominal Typing (Java):
  UserId ≠ OrderId → auch wenn beide string-basiert sind
  Klassen → echte Typ-Identität, aber: überall explizite Konversionen
```

Wir wollen das Beste aus beiden Welten:
- TypeScript's Ergonomie (kein explizites Casting überall)
- Java's Sicherheit (verwechselbar? → Compile-Fehler)

Das ist genau das, was **Branded Types** liefern.

> **In deinem Angular-Projekt** sind Typ-Verwechslungen besonders gefährlich
> bei Services die IDs verarbeiten. Wenn du einen `HttpClient`-Service hast
> der `getUserById(id: string)` und `deleteAccount(userId: string)` hat,
> kann ein Verwechsler (falscher ID-Typ) das falsche Konto löschen.
>
> ```typescript
> // Typischer Angular Service — anfällig für Verwechslungen:
> @Injectable({ providedIn: 'root' })
> export class UserService {
>   getUserById(id: string) { /* ... */ }
>   deleteAccount(userId: string) { /* GEFÄHRLICH ohne Branded Types */ }
> }
>
> // Mit Branded Types (kommt in Sektion 02):
> type UserId = string & { readonly __brand: 'UserId' };
> deleteAccount(userId: UserId) { /* Nur noch UserId akzeptiert! */ }
> ```

---

## Zusammenfassung: Was fehlt

| Ansatz | Typsicherheit | Ergonomie | Problem |
|--------|:------------:|:---------:|---------|
| `type UserId = string` | ❌ Keine | ✅ Maximal | Kein echter Schutz |
| `class UserId { ... }` | ✅ Gut | ❌ Minimal | Überall `new UserId(...)` |
| Interface mit Phantom | ✅ Gut | ✅ Gut | Muss explizit gecastet werden |
| **Branded Types** | ✅ Gut | ✅ Gut | Unsere Lösung! |

---

## Was du gelernt hast

- TypeScript's **Structural Typing** bedeutet: `type UserId = string` bietet
  keinen Schutz — UserId und OrderId sind für TypeScript identisch
- **Typ-Aliases** sind nur Dokumentation, keine neue Typ-Identität
- Dieser Unterschied führt zu realen Bugs: Falsche IDs an falsche Funktionen
- **Nominal Typing** (Java/C#) löst das, ist aber inkompatibel mit TypeScript's Design
- Die Lösung: **Branded Types** — Nominal Typing simuliert im Structural System

> 🧠 **Erkläre dir selbst:** Was ist der fundamentale Unterschied zwischen
> `type UserId = string` und einer Java-Klasse `UserId`? Was prüft TypeScript
> vs. Java beim Typvergleich?
>
> **Kernpunkte:** TypeScript: Struktur (string = string) | Java: Name (UserId ≠ OrderId) |
> Type Alias = Umbenennung, nicht neuer Typ | Branded Types: Struktur künstlich machen

**Kernkonzept zum Merken:** `type UserId = string` ist nur ein Kommentar für
Menschen — der TypeScript-Compiler sieht nur `string`. Um echte Typsicherheit
zu bekommen, müssen wir die *Struktur* der Typen unterschiedlich machen.

---

> **Pausenpunkt** -- Du hast das Problem verstanden. Jetzt kommt die Lösung.
>
> Weiter geht es mit: [Sektion 02: Die Brand-Technik](./02-die-brand-technik.md)
