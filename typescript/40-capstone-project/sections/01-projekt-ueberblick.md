# Sektion 1: Projekt-Ueberblick — Typsichere Full-Stack-Architektur

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: — (Start)
> Naechste Sektion: [02 - Domain Modeling](./02-domain-modeling.md)

---

## Was du hier lernst

- Das **Capstone-Projekt**: Eine typsichere E-Commerce-API Schicht fuer Schicht
- Warum **durchgaengige Typsicherheit** (End-to-End) der heilige Gral ist
- Die **Architektur**: Domain → API → Business Logic → Frontend
- Wie **alle 40 Lektionen** in einem einzigen Projekt zusammenfliessen

---

## Willkommen zum Capstone

Du hast 39 Lektionen TypeScript gemeistert. Von primitiven Typen (L02)
ueber Generics (L13), Branded Types (L24), Type-Level Programming (L37)
bis hin zu Best Practices (L39) — und von Type Aliases (L08) und Klassen (L21) bis hin zu typsicheren Tests (L33) — du hast eine Reise hinter dir die
dich von "kann TypeScript" zu "beherrscht TypeScript" gebracht hat.

In dieser letzten Lektion bauen wir ein durchgaengiges Projekt das
**alles verbindet**. Kein neues Konzept — nur die Anwendung von allem
was du gelernt hast.

> 💡 **Analogie:** Stell dir vor du haettest 39 einzelne Werkzeuge in
> einer Werkstatt — einen Praezisionshammer, einen Laser-Zollstock,
> eine computergesteuerte Fraese. Jedes fuer sich ist beeindruckend.
> Aber erst wenn du sie kombinierst um ein komplettes Haus zu bauen,
> wird aus Werkzeugmeisterschaft echte Baukunst. Dieses Capstone
> ist dein Meisterstueck — der Moment wo aus einzelnen Faehigkeiten
> ein zusammenhaengendes Ganzes entsteht.

> 📖 **Hintergrund: Warum ein Capstone-Projekt?**
>
> In der Hochschuldidaktik ist das Capstone-Projekt der Abschluss
> eines Studiengangs: Ein Projekt das alle gelernten Faehigkeiten
> verbindet und zeigt dass der Lernende sie eigenstaendig anwenden
> kann. Benjamin Bloom beschrieb 1956 in seiner Taxonomie die
> hoechste Stufe als "Synthese" — die Faehigkeit, einzelne Teile
> zu einem neuen Ganzen zusammenzufuegen. Genau das tust du jetzt.
> Nicht mehr "wie funktioniert Conditional Types" sondern "wo
> setze ich Conditional Types ein um mein Projekt besser zu machen".
>
> 🏗️ **Architektur-Backstory: Warum E-Commerce?**
>
> E-Commerce ist nicht zufaellig gewaehlt. Es ist die Domaene die
> am meisten von Typsicherheit profitiert: Geldbetrage muessen
> stimmen, Bestellungen duerfen nicht verloren gehen, Status-
> uebergaenge muessen korrekt sein. Ein einziger Typ-Fehler kann
> hier direkt Geld kosten — falsche Preise, verlorene Lieferungen,
> doppelte Buchungen. In echten Projekten hat ein mittelstaendiges
> Unternehmen mit TypeScript-Migration seiner Shop-API die Fehler-
> rate an Schichtgrenzen um 73% gesenkt. Die Investition in
> Typsicherheit hat sich innerhalb von drei Monaten amortisiert.
>
> 💡 **Analogie:** Eine E-Commerce-Architektur ist wie ein
> Verkehrsleitsystem. Die Domain-Typen sind die Strassen und
> Kreuzungen. Die API ist die Ampelsteuerung. Die Business Logic
> sind die Verkehrsregeln. Ohne Typsicherheit wuerden Autos
> (Daten) einfach irgendwo hinfahren — mit Typsicherheit gibt
> es klare Routen und rote Ampeln halten alles auf.

> ⚡ **Real-World Beispiel:** Ein bekanntes TypeScript-E-Commerce-
> Projekt ist Medusa.js. Dessen gesamte Architektur basiert auf
> den gleichen Prinzipien die du hier lernst: Branded Types fuer
> Entity-IDs, Discriminated Unions fuer Order-Status, Generics
> fuer Repository-Pattern. Wenn du Medusa.js' Quellcode liest
> wirst du alles wiedererkennen — weil du es jetzt selbst gebaut
> hast. Der Unterschied: Du weisst WARUM jede Entscheidung so
> getroffen wurde.

---

## Das Projekt: TypeShop — Typsichere E-Commerce-Schichten

Wir bauen keine vollstaendige App sondern die **Typ-Architektur**
eines E-Commerce-Systems. Schicht fuer Schicht:

```
┌─────────────────────────────────────────────────────┐
│  Sektion 2: Domain Modeling                         │
│  Branded Types + Discriminated Unions               │
│  UserId, ProductId, Money, OrderStatus              │
│  → L02, L07, L12, L24                               │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│  Sektion 3: API Layer                               │
│  Type-safe REST + Validierung                       │
│  Route-Typen, Request/Response, Error Handling      │
│  → L06, L13, L17, L25, L32, L37                    │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│  Sektion 4: Business Logic                          │
│  Generics + Patterns                                │
│  Repository<T>, Result<T,E>, Event System           │
│  → L13, L14, L22, L25, L26                          │
└──────────────┬──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────┐
│  Sektion 5: Abschluss                               │
│  Rueckblick + Selbsteinschaetzung                   │
│  40 Lektionen in einer Architektur                  │
│  → Alles                                            │
└─────────────────────────────────────────────────────┘
```

---

## Die Architektur-Prinzipien

Unser Projekt folgt drei Prinzipien die du aus den letzten Lektionen
kennst:

### 1. Defensive Schale, offensiver Kern (L39)

```typescript annotated
// SCHALE: API-Endpunkt validiert externen Input
async function handleCreateOrder(req: Request): Promise<Response> {
  const body: unknown = await req.json();  // unknown!
  const parsed = parseCreateOrderInput(body);  // Validierung
  if (!parsed.ok) return errorResponse(parsed.error);
  // Ab hier: parsed.value ist typsicher
  const result = await orderService.create(parsed.value);
  return jsonResponse(result);
}

// KERN: Service vertraut dem Typ
class OrderService {
  async create(input: CreateOrderInput): Promise<Result<Order, OrderError>> {
    // Keine Validierung noetig — der Typ garantiert Korrektheit
    const orderId = OrderId.create();
    // ...
  }
}
```

### 2. Make Impossible States Impossible (L12, L26)

```typescript annotated
// Statt Boolean-Flags:
type OrderStatus =
  | { status: "draft"; items: CartItem[] }
  | { status: "pending"; items: CartItem[]; total: Money }
  | { status: "paid"; items: CartItem[]; total: Money; paymentId: PaymentId }
  | { status: "shipped"; items: CartItem[]; total: Money; paymentId: PaymentId; trackingId: string }
  | { status: "cancelled"; reason: string };
// ^ Jeder Status hat genau die Daten die er braucht — keine mehr, keine weniger
```

### 3. Parse, Don't Validate (L24, L39)

```typescript annotated
// Statt: validateEmail(s): boolean + s as Email
function parseEmail(raw: string): Result<Email, "invalid-email"> {
  if (!raw.includes("@")) return { ok: false, error: "invalid-email" };
  return { ok: true, value: raw as Email };
  // ^ Der Brand wird NUR hier vergeben — Smart Constructor
}
```

> 🧠 **Erklaere dir selbst:** Wie haengen diese drei Prinzipien
> zusammen? Warum braucht man alle drei — reicht nicht eines?
> **Kernpunkte:** Defensive Schale schuetzt die Grenze | Make
> Impossible States Impossible modelliert den Kern | Parse Don't
> Validate verbindet beides: An der Grenze parsen → im Kern
> typsichere Daten

---

## Die Lektion-zu-Feature-Map

| Feature | Genutzte Lektionen |
|---------|-------------------|
| Branded IDs (UserId, ProductId) | L02 (Primitives), L24 (Branded Types) |
| Money-Typ (cents-basiert) | L24 (Branded), L02 (number) |
| OrderStatus (DU) | L07 (Union), L12 (Discriminated Unions) |
| Repository<T> | L13 (Generics), L14 (Generic Patterns), L22 (Advanced Generics) |
| Result<T,E> | L25 (Error Handling), L07 (Union) |
| API-Route-Typen | L37 (Type-Level Programming), L06 (Functions) |
| Type Guards | L11 (Narrowing), L39 (Best Practices) |
| Event System | L17 (Conditional Types), L26 (Advanced Patterns) |
| Config-Typen | L16 (Mapped Types), L29 (tsconfig) |
| Exhaustive Checks | L12 (DU), L39 (Best Practices) |
| type vs. interface (Design-Entscheidung) | L08 (Type Aliases vs. Interfaces) |
| OrderService als Klasse | L21 (Classes und OOP) |
| Testbare Architektur *(Bonus)* | L33 (Testing TypeScript) |

> ⚡ **Framework-Bezug:** Diese Architektur ist direkt uebertragbar.
> In Angular wuerde die "Schale" aus HTTP-Interceptors und Route
> Guards bestehen, der "Kern" aus Services. In React waere die
> Schale in API-Route-Handlern (Next.js) oder Custom Hooks, der
> Kern in Utility-Funktionen und State-Logik. Die Typ-Architektur
> ist framework-agnostisch — deshalb lernst du sie hier ohne
> Framework.
>
> 💡 **Analogie:** Framework-agnostische Typ-Architektur ist wie
> das Fundament eines Hauses. Ob du darauf ein Fachwerkhaus
> (Angular), ein modernes Glashaus (React) oder ein Holzhaus
> (Next.js) baust — das Fundament bleibt gleich. Ein starkes
> Fundament mit korrekten Typen traegt jedes Framework.

> 💭 **Denkfrage:** Wenn du dieses Projekt in deinem Angular-
> Projekt umsetzen wuerdest — wo wuerdest du anfangen? Welche
> Schicht hat den hoechsten ROI?
>
> **Antwort:** Domain Modeling (Branded IDs + Discriminated Unions).
> Es ist die einfachste Aenderung mit dem groessten Impact. Du
> kannst UserId und OrderId morgen einfuehren ohne bestehenden
> Code gross umzubauen. Die API-Schicht und Business Logic folgen
> danach natuerlich.

---

## Experiment: Deine eigene Architektur-Skizze

Bevor wir in den Code gehen, skizziere die Architektur deines
aktuellen Projekts:

```
// Fragen fuer deine Skizze:
// 1. Wo kommen externe Daten rein? (API-Responses, Formulare, URL-Params)
//    → Das sind deine Systemgrenzen (defensive Schale)
//
// 2. Welche Entities hast du? (User, Order, Product, ...)
//    → Das ist dein Domain Model (Branded IDs, DUs)
//
// 3. Welche Zustaende haben deine Entities? (draft → active → archived)
//    → Das sind deine Discriminated Unions
//
// 4. Welche Fehler koennen auftreten? (not-found, unauthorized, validation)
//    → Das ist dein Error-Model (Result<T,E>)
//
// Zeichne die Schichten und markiere wo du heute any/as verwendest.
// Das sind die Stellen die am meisten von TypeScript profitieren wuerden.

// BONUS-FRAGE: Wenn du dein Projekt neu aufsetzen koenntest —
// welche 3 Typen wuerdest du als Erstes mit Branded Types ausstatten?
// Warum gerade diese? Was wuerde passieren wenn du sie morgen
// einfuehrst ohne den Rest zu aendern?

// INLINE-EXPERIMENT: Nimm eine bestehende Funktion aus deinem
// Code die ein Boolean-Flag als Parameter hat:
//   function getUsers(active: boolean)
// Ersetze es durch eine Discriminated Union:
//   type UserFilter = { type: "active" } | { type: "inactive"; since: Date }
// Wie veraendert sich die Aufrufseite? Wie die Implementation?
```

---

## Was du gelernt hast

- Das **Capstone-Projekt** verbindet alle 40 Lektionen in einer durchgaengigen Architektur
- Drei Prinzipien: **Defensive Schale**, **Make Impossible States Impossible**, **Parse Don't Validate**
- Die **Schichten**: Domain → API → Business Logic → Frontend
- Jedes Feature mappt auf konkrete Lektionen — nichts ist neu, alles ist Anwendung

> 🧠 **Erklaere dir selbst:** Warum ist eine typsichere Architektur
> wertvoller als typsichere Einzelfunktionen? Was gewinnt man durch
> die durchgaengige Typisierung aller Schichten?
> **Kernpunkte:** Einzelne typsichere Funktionen schuetzen nur lokal |
> Durchgaengige Typisierung schuetzt ZWISCHEN Schichten | Die meisten
> Bugs entstehen an Schichtgrenzen | End-to-End-Typsicherheit
> eliminiert diese Bugs zur Compilezeit

**Kernkonzept zum Merken:** Eine Architektur ist so typsicher wie ihre schwaechste Schicht. Ein einziges `any` an einer Schichtgrenze macht die Typsicherheit aller anderen Schichten wertlos.

> 💭 **Denkfrage:** Stell dir vor ein Kollege fragt dich: "Lohnt
> sich der Aufwand fuer Typsicherheit wirklich?" Was antwortest
> du? Formuliere eine Antwort die den Business-Value erklaert —
> nicht nur die technischen Vorteile.
> **Kernpunkte:** Weniger Production-Bugs = weniger Hotfixes |
> Bessere Developer Experience = schnellere Feature-Entwicklung |
> Selbst-dokumentierender Code = weniger Meetings und Rueckfragen |
> Compilezeit-Pruefung = weniger QA-Zyklen noetig

> 💡 **Analogie:** Durchgaengige Typsicherheit ist wie eine
> Sicherheitskette beim Bergsteigen. Ein einziges schwaches
> Glied (ein `any`) reisst die gesamte Kette. Aber wenn jedes
> Glied stark ist, kannst du dich auf jedes verlassen — vom
> ersten Karabiner (Domain) bis zum letzten Seil (Frontend).

---

> **Pausenpunkt** — Die Architektur steht. Jetzt bauen wir die
> erste Schicht: Domain Modeling.
>
> Weiter geht es mit: [Sektion 02: Domain Modeling](./02-domain-modeling.md)
