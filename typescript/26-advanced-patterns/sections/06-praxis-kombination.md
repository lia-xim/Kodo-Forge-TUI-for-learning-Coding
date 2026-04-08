# Sektion 6: Praxis-Kombination

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [05 - Newtype Pattern](./05-newtype-pattern.md)
> Naechste Sektion: — (Ende der Lektion)

---

## Was du hier lernst

- Wie man **mehrere Patterns kombiniert** fuer einen realistischen Use Case
- Ein vollstaendiges Beispiel: **typsicherer HTTP-Client** mit Builder, State Machine und Newtypes
- Wie man **Over-Engineering** erkennt und vermeidet
- Wann welches Pattern den groessten Mehrwert liefert

---

## Hintergrund: Patterns kombinieren

> **Feature Origin Story: Pattern-Sprachen**
>
> Christopher Alexander praegte 1977 das Konzept der "Pattern Language"
> in der Architektur: Einzelne Patterns sind nuetzlich, aber erst ihre
> **Kombination** erzeugt kohaerente Loesungen.
>
> In der Software-Entwicklung gilt das gleiche. Das Gang-of-Four-Buch
> (1994) beschreibt 23 Patterns — aber echte Software nutzt selten
> ein Pattern isoliert. Ein Builder kann State-Machine-Transitionen
> nutzen, Phantom Types koennen Newtypes schuetzen, und Fluent APIs
> koennen alle zusammenfuehren.
>
> Die Kunst liegt darin, **genau so viel** Typ-Sicherheit einzusetzen
> wie noetig — und nicht mehr. Over-Engineering mit Patterns ist
> genauso schaedlich wie Under-Engineering ohne sie.

---

## Praxis-Beispiel: Typsicherer HTTP-Client
<!-- section:summary -->
Wir kombinieren Builder + State Machine + Newtypes:

<!-- depth:standard -->
Wir kombinieren Builder + State Machine + Newtypes:

```typescript annotated
// === Newtypes fuer HTTP-Konzepte ===

declare const UrlBrand: unique symbol;
type SafeUrl = string & { readonly [UrlBrand]: "SafeUrl" };

function SafeUrl(raw: string): SafeUrl {
  try { new URL(raw); } catch { throw new Error(`Ungueltige URL: ${raw}`); }
  return raw as SafeUrl;
}

// === State Machine: Request-Phasen ===

type RequestState =
  | { phase: "configure" }
  // ^ URL und Methode werden gesetzt
  | { phase: "headers" }
  // ^ Headers werden hinzugefuegt
  | { phase: "body" }
  // ^ Request-Body wird gesetzt (nur POST/PUT)
  | { phase: "ready" }
  // ^ Bereit zum Senden
  ;

// === Builder mit State Machine ===

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ConfigureStep {
  url(url: SafeUrl): ConfigureStep;
  // ^ Muss mindestens einmal aufgerufen werden
  method(m: HttpMethod): HeaderStep;
  // ^ Methode setzt den naechsten Schritt
}

interface HeaderStep {
  header(name: string, value: string): HeaderStep;
  // ^ Beliebig viele Header
  body(data: unknown): ReadyStep;
  // ^ Body setzen (optional fuer GET/DELETE)
  send<T>(): Promise<T>;
  // ^ Direkt senden ohne Body
}

interface ReadyStep {
  send<T>(): Promise<T>;
  // ^ Nur noch senden moeglich
}
```

> 🧠 **Erklaere dir selbst:** Warum ist `SafeUrl` ein Newtype statt
> einfach `string`? Was verhindert es konkret?
>
> **Kernpunkte:** Verhindert ungueltige URLs im Request |
> Validierung passiert einmal bei Erstellung |
> Kann nicht versehentlich mit anderen Strings verwechselt werden |
> Type-Level Dokumentation: "Hier wird eine validierte URL erwartet"

---

<!-- /depth -->
## Die Implementierung

```typescript annotated
class HttpClientBuilder implements ConfigureStep, HeaderStep, ReadyStep {
  private _url?: SafeUrl;
  private _method: HttpMethod = "GET";
  private _headers: Record<string, string> = {};
  private _body?: unknown;

  url(url: SafeUrl): ConfigureStep {
    this._url = url;
    return this;
  }

  method(m: HttpMethod): HeaderStep {
    this._method = m;
    return this;
    // ^ Rueckgabetyp: HeaderStep — configure-Methoden nicht mehr sichtbar
  }

  header(name: string, value: string): HeaderStep {
    this._headers[name] = value;
    return this;
  }

  body(data: unknown): ReadyStep {
    this._body = data;
    return this;
    // ^ Rueckgabetyp: ReadyStep — nur noch send() moeglich
  }

  async send<T>(): Promise<T> {
    if (!this._url) throw new Error("URL nicht gesetzt");
    // Echte Implementierung wuerde fetch() verwenden:
    console.log(`${this._method} ${this._url}`);
    console.log("Headers:", this._headers);
    if (this._body) console.log("Body:", this._body);
    return {} as T; // Platzhalter
  }
}

function http(): ConfigureStep {
  return new HttpClientBuilder();
}

// Verwendung — liest sich wie natuerliche Sprache:
const response = await http()
  .url(SafeUrl("https://api.example.com/users"))
  .method("POST")
  .header("Content-Type", "application/json")
  .header("Authorization", "Bearer token123")
  .body({ name: "Max", email: "max@example.com" })
  .send<{ id: string }>();
```

> 💭 **Denkfrage:** Dieser HTTP-Client hat drei Patterns kombiniert
> (Newtype, State Machine, Builder). Koennte man auch nur eines
> verwenden und trotzdem gute Typ-Sicherheit erreichen?
>
> **Antwort:** Ja — fuer die meisten Anwendungsfaelle reicht ein
> einfacher Builder ODER eine typsichere Funktion mit Optionsobjekt.
> Die Kombination lohnt sich nur bei **oeffentlichen APIs** die viele
> Entwickler nutzen, oder bei **sicherheitskritischem Code** wo
> Verwechslungen teuer sind.

---

## Anti-Pattern: Over-Engineering erkennen

```typescript
// OVER-ENGINEERED — zu viele Patterns fuer ein einfaches Problem:
type ValidatedEmail = Phantom<string, "ValidatedEmail">;
type FormState = StateMachine<"empty" | "partial" | "complete" | "submitted">;

class FormBuilder<
  Set extends string = never,
  State extends FormState = FormState<"empty">
> {
  // 200 Zeilen Typ-Gymnastik fuer ein Formular mit 3 Feldern...
}

// BESSER — einfach und lesbar:
interface ContactForm {
  name: string;
  email: string;
  message: string;
}

function submitContact(form: ContactForm): Result<void, ValidationError> {
  // Direkte Validierung, klare Typen, kein Pattern noetig
}
```

> **Experiment:** Bewerte diese Szenarien — welches Pattern wuerdest du waehlen?
>
> ```
> Szenario 1: User-ID und Order-ID nicht verwechseln
> → Branded Type (einfach, reicht voellig)
>
> Szenario 2: Bestellprozess mit 5 Zustaenden
> → State Machine (Discriminated Union)
>
> Szenario 3: SQL-Query-Builder fuer eine Bibliothek
> → Fluent API mit Step-Interfaces
>
> Szenario 4: Waehrungsbetraege berechnen (EUR, USD, CHF)
> → Newtype mit eigenen Operationen
>
> Szenario 5: Config-Objekt mit 3 Pflichtfeldern
> → Einfaches Interface (KEIN Pattern noetig!)
> ```

---

## Entscheidungsbaum: Welches Pattern wann?

```
Brauche ich Typ-Sicherheit ueber primitive Typen hinaus?
├── Nein → Einfaches Interface/Type Alias reicht
└── Ja → Was genau?
    ├── Verwechslung verhindern (IDs, Einheiten)?
    │   ├── Einfache IDs → Branded Type
    │   └── Werte mit Operationen → Newtype
    ├── Zustaende modellieren?
    │   ├── Unsichtbar (Draft/Published) → Phantom Type
    │   └── Sichtbar (loading/error) → Discriminated Union
    ├── Schrittweiser Aufbau?
    │   ├── Pflichtfelder pruefen → Builder
    │   └── Reihenfolge erzwingen → Fluent API mit Steps
    └── Alles zusammen? → Kombiniere sparsam!
```

> ⚡ **In deinem Angular-Projekt** empfehle ich diesen pragmatischen Ansatz:
>
> ```typescript
> // 1. Branded Types fuer Entity-IDs (sofort einfuehren):
> type UserId = string & { readonly __brand: "UserId" };
> type OrderId = string & { readonly __brand: "OrderId" };
>
> // 2. Discriminated Unions fuer State (bei NgRx/Signals):
> type LoadState<T> =
>   | { status: "idle" }
>   | { status: "loading" }
>   | { status: "success"; data: T }
>   | { status: "error"; error: string };
>
> // 3. Builder nur fuer komplexe Konfigurationen (selten noetig)
> // 4. Phantom Types fuer Rollen/Rechte (wenn Security kritisch)
> ```
>
> In React:
>
> ```typescript
> // Gleicher Ansatz — Branded Types + Discriminated Unions decken
> // 90% der Faelle ab. Builder/Phantom/Newtype nur bei Bedarf.
> ```

---

## Zusammenfassung: Alle 5 Patterns im Ueberblick

| Pattern | Zweck | Laufzeit-Kosten | Komplexitaet |
|---|---|---|---|
| Builder | Schrittweiser Aufbau, Pflichtfelder | Keine | Mittel |
| State Machine | Zustaende und Uebergaenge | Keine | Mittel |
| Phantom Types | Unsichtbare Typ-Information | Keine | Mittel |
| Fluent API | Lesbare API mit Chaining | Keine | Mittel-Hoch |
| Newtype | Domain-Werte mit Operationen | Keine | Mittel |

Alle 5 Patterns haben **null Laufzeit-Overhead** — sie nutzen
TypeScript's Type Erasure als Feature, nicht als Einschraenkung.

---

## Was du gelernt hast

- **Pattern-Kombination** ist maechtig, aber muss mit Augenmass eingesetzt werden
- Ein **typsicherer HTTP-Client** zeigt wie Builder, State Machine und Newtypes zusammenwirken
- **Over-Engineering** erkennt man daran, dass die Typ-Komplexitaet den Business-Wert uebersteigt
- Die **pragmatische Regel**: Branded Types + Discriminated Unions decken 90% der Faelle ab

> 🧠 **Erklaere dir selbst:** Wann lohnt sich die Investition in ein
> komplexes Typ-Pattern, und wann ist ein einfaches Interface besser?
>
> **Kernpunkte:** Komplexe Patterns lohnen sich bei: oeffentlichen APIs |
> sicherheitskritischem Code | haeufig genutzten Abstraktion |
> Einfache Interfaces reichen bei: internem Code | wenig Parametern |
> Prototypen | Teams die nicht alle Patterns kennen

**Kernkonzept zum Merken:** TypeScript's Typsystem ist Turing-komplett —
du kannst fast alles modellieren. Aber die Kunst liegt im **Weglassen**:
Nutze genau so viel Typ-Sicherheit wie der Use Case erfordert.

---

> **Ende der Lektion** -- Du hast 5 fortgeschrittene TypeScript-Patterns
> gemeistert. In der naechsten Lektion geht es um Declaration Merging —
> wie man Drittanbieter-Typen erweitert.
>
> Weiter geht es mit: [Lektion 27: Declaration Merging](../../27-declaration-merging/sections/01-interface-merging-basics.md)
