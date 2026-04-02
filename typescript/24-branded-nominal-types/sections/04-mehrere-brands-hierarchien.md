# Sektion 4: Mehrere Brands & Brand-Hierarchien

> Geschätzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Smart Constructors & Opaque Types](./03-smart-constructors-opaque-types.md)
> Nächste Sektion: [05 - Praktische Patterns](./05-praktische-patterns.md)

---

## Was du hier lernst

- Wie man **mehrere Brands** auf einem Typ kombiniert (z.B. `Trimmed & NonEmpty`)
- Was **Brand-Hierarchien** sind und wie sie Subtypen modellieren
- Wie man mit **mehrfach gebrandeten Typen** Transformationen verfolgt
- Warum Brands auch für `number`, `boolean` und andere primitive Typen sinnvoll sind

---

## Mehrere Brands kombinieren

Brands können kombiniert werden — ein Wert kann mehrere Eigenschaften haben:

> **Hintergrund: Das Refinement-Pattern**
>
> Dieses Pattern kommt aus der Typentheorie: **Refinement Types** (auch:
> Dependent Types). Dabei wird ein Typ durch Prädikate verfeinert:
> "Ein String, der nicht leer ist und keine Leerzeichen am Rand hat."
>
> In Sprachen wie Liquid Haskell oder F* (Microsoft Research) gibt es
> native Unterstützung dafür. TypeScript emuliert es mit mehrfachem
> Brand-Intersecting.
>
> Das Muster ist bekannt aus String-Validierung: Anstatt alle Regeln
> in eine Funktion zu packen, verfolgen wir jeden Validierungsschritt
> als eigenes Brand. Das macht Transformations-Ketten typsicher.

```typescript annotated
type Brand<T, B> = T & { readonly __brand: B };

// Einzelne Brands repräsentieren Eigenschaften:
type Trimmed  = { readonly __trimmed: true };
//                         ^^^^^^^^^ Kein 'Brand<>'-Helfer nötig für einfache Flags
type NonEmpty = { readonly __nonEmpty: true };
type Lowercase = { readonly __lowercase: true };

// Kombinierte Typen als Intersection:
type TrimmedString   = string & Trimmed;
type NonEmptyString  = string & NonEmpty;
type SearchQuery     = string & Trimmed & NonEmpty & Lowercase;
//                              ^^^^^^^ Alle drei Eigenschaften garantiert!

// Smart Constructors die jeweils ihren Teil verifizieren:
function trim(value: string): string & Trimmed {
  return value.trim() as string & Trimmed;
  // ^ Wir WISSEN: nach .trim() ist der String Trimmed
}

function assertNonEmpty(value: string & Trimmed): string & Trimmed & NonEmpty {
  if (value.length === 0) throw new Error('String darf nicht leer sein');
  return value as string & Trimmed & NonEmpty;
  // ^ Wir WISSEN: nicht leer nach der Prüfung
}

function toLowercase(value: string & Trimmed & NonEmpty): SearchQuery {
  return value.toLowerCase() as SearchQuery;
  // ^ SearchQuery = string & Trimmed & NonEmpty & Lowercase
}

// Verwendung — Kette von Transformationen:
function createSearchQuery(input: string): SearchQuery {
  const trimmed = trim(input);           // string & Trimmed
  const nonEmpty = assertNonEmpty(trimmed); // string & Trimmed & NonEmpty
  return toLowercase(nonEmpty);          // SearchQuery
}

function search(query: SearchQuery): void {
  console.log(`Suche nach: ${query}`);
}

search(createSearchQuery('  TypeScript  ')); // ✅ "typescript"
// search('typescript') → ❌ COMPILE-ERROR: string ≠ SearchQuery
```

> 🧠 **Erkläre dir selbst:** Warum ist `string & Trimmed & NonEmpty & Lowercase`
> *sicherer* als einfach `string`? Was weiß der Aufrufer von `search(query: SearchQuery)`,
> ohne in die Implementierung zu schauen?
>
> **Kernpunkte:** Der Typ *dokumentiert* Garantien | search() weiß: query ist
> bereits validiert und normalisiert | Keine Doppel-Validierung nötig |
> Compile-Error verhindert "vergessene" Validierung

---

## Brand-Hierarchien: Subtyping modellieren

Das Wort "Hierarchy" bezieht sich darauf, dass ein speziellerer Brand
automatisch auch einem allgemeineren Brand zuzuweisen ist:

```typescript annotated
// Konzept: Alle Emails sind Strings, aber nicht alle Strings sind Emails
// Alle verifizierten Emails sind Emails, aber nicht alle Emails sind verifiziert

type Email          = string & { readonly __brand: 'Email' };
type VerifiedEmail  = string & { readonly __brand: 'Email' } & { readonly __verified: true };
//                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                             Auch ein Email!                 Plus: verifiziert

// VerifiedEmail IST AUCH ein Email (Subtyp):
function sendEmail(to: Email): void {
  console.log(`Sende an: ${to}`);
}

const normalEmail  = 'max@example.com' as Email;
const verifiedMail = 'max@example.com' as VerifiedEmail;

sendEmail(normalEmail);   // ✅ OK
sendEmail(verifiedMail);  // ✅ OK! VerifiedEmail hat alle Properties von Email

// Aber umgekehrt:
function sendCriticalEmail(to: VerifiedEmail): void {
  console.log(`Kritische E-Mail an verifizierten Empfänger: ${to}`);
}

// sendCriticalEmail(normalEmail); // ❌ COMPILE-ERROR
// ^ Email hat kein __verified-Property → nicht VerifiedEmail
```

> 💭 **Denkfrage:** `VerifiedEmail` ist ein Subtyp von `Email`. Das bedeutet:
> Überall wo `Email` erwartet wird, kann `VerifiedEmail` verwendet werden.
> Aber nicht umgekehrt. Wie verhält sich das zu Liskov's Substitution Principle?
>
> **Antwort:** Perfekte Übereinstimmung mit LSP! Ein `VerifiedEmail` kann alles,
> was ein `Email` kann (es ist ein "stärkerer" Typ). Das Ersetzen von `Email`
> durch `VerifiedEmail` erhöht die Sicherheit. TypeScript's Structural Typing
> und die Hierarchie-Brands ergänzen sich hier elegant.

> 🧪 **Experiment:** Erstelle eine Brand-Hierarchie fuer verschiedene ID-Typen:
>
> ```typescript
> type BaseId = string & { readonly __brand: 'BaseId' };
> type UserId = string & { readonly __brand: 'BaseId' } & { readonly __userBrand: true };
> type AdminId = string & { readonly __brand: 'BaseId' } & { readonly __userBrand: true } & { readonly __admin: true };
>
> function processUser(id: UserId): void { console.log(id); }
> function processAdmin(id: AdminId): void { console.log(id); }
>
> const admin = 'admin-1' as AdminId;
> processUser(admin);   // Kompiliert das?
> // processAdmin('user-1' as UserId);  // Und das?
> ```
>
> Pruefe: Kann `AdminId` an eine Funktion uebergeben werden die `UserId` erwartet?
> Und umgekehrt? Beobachte wie TypeScript's Structural Typing die Hierarchie
> automatisch erzwingt — `AdminId` hat alle Properties von `UserId` (plus mehr),
> also ist es ein Subtyp.

---

## Number Brands: Physikalische Einheiten

Brands glänzen besonders bei `number`-Typen — ein häufiger Bug-Herd:

```typescript annotated
type Brand<T, B> = T & { readonly __brand: B };

// Physikalische Einheiten als Brands:
type Meter      = Brand<number, 'Meter'>;
type Foot       = Brand<number, 'Foot'>;
type Kilogram   = Brand<number, 'Kilogram'>;
type Pound      = Brand<number, 'Pound'>;
type Celsius    = Brand<number, 'Celsius'>;
type Fahrenheit = Brand<number, 'Fahrenheit'>;

// Smart Constructors:
const meter  = (n: number) => n as Meter;
const foot   = (n: number) => n as Foot;
const kg     = (n: number) => n as Kilogram;
const pound  = (n: number) => n as Pound;

// Konversions-Funktionen:
function footToMeter(f: Foot): Meter {
  return (f * 0.3048) as Meter;
  // ^ 'as Meter': Sicher nach Konversion (wir wissen das Ergebnis ist Meter)
}

function poundToKg(p: Pound): Kilogram {
  return (p * 0.453592) as Kilogram;
}

// Funktionen die klare Einheiten erwarten:
function calculateBMI(weight: Kilogram, height: Meter): number {
  return weight / (height * height);
}

// Verwendung:
const myWeightKg   = kg(75);
const myHeightMeter = meter(1.80);

calculateBMI(myWeightKg, myHeightMeter); // ✅ 23.15

// Fehlerscenarien:
const myWeightPound = pound(165);
// calculateBMI(myWeightPound, myHeightMeter); // ❌ COMPILE-ERROR
// ^ Pound ≠ Kilogram — TypeScript verhindert den Mars-Orbiter-Bug!

const myHeightFoot = foot(5.9);
const myHeightMeterConverted = footToMeter(myHeightFoot); // 1.798 Meter
calculateBMI(myWeightKg, myHeightMeterConverted); // ✅ OK nach Konversion
```

> 🔍 **Tieferes Wissen: Der Mars Orbiter Bug (1999)**
>
> Am 23. September 1999 verlor die NASA den Mars Climate Orbiter (Kosten: 327
> Millionen Dollar), weil **ein Team in Imperial Units (Pound-force·seconds)
> und ein anderes in SI Units (Newton·seconds)** arbeitete. Die Daten wurden
> ohne Einheiten-Konversion übergeben.
>
> TypeScript-Brands hätten diesen Bug verhindert — oder zumindest zur
> Compile-Zeit einen Fehler ausgelöst statt in der Marsumlaufbahn.
>
> Heute verwenden Organisationen wie NASA und ESA spezielle Typsysteme
> (Fortran mit UNITS, Ada, oder interne Bibliotheken) um genau das zu verhindern.
> TypeScript-Brands sind der pragmatische JavaScript/TypeScript-Ansatz.

---

## Brands für Validierungszustände (State-Machines)

Brands sind auch perfekt um **Verarbeitungszustände** zu modellieren:

```typescript annotated
// Ein Formular-Wert kann verschiedene Zustände haben:
type RawInput     = string & { readonly __brand: 'RawInput' };
type SanitizedInput = string & { readonly __brand: 'Sanitized' };
type ValidatedEmail = string & { readonly __brand: 'Validated' };

// Transformation-Kette:
function sanitize(raw: RawInput): SanitizedInput {
  // XSS-Schutz, Encoding, etc.
  return raw.replace(/<[^>]*>/g, '') as SanitizedInput;
}

function validateAsEmail(sanitized: SanitizedInput): ValidatedEmail | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) return null;
  return sanitized as ValidatedEmail;
}

// Datenbank-Funktion akzeptiert nur vollständig verarbeitet:
function storeEmail(email: ValidatedEmail): void {
  console.log(`Speichere: ${email}`);
}

// Korrekte Verwendung:
const userInput  = 'max@example.com' as RawInput;
const sanitized  = sanitize(userInput);
const validated  = validateAsEmail(sanitized);

if (validated) {
  storeEmail(validated); // ✅ Nur nach Sanitization + Validation
}

// storeEmail(userInput);   // ❌ RawInput ≠ ValidatedEmail
// storeEmail(sanitized);  // ❌ SanitizedInput ≠ ValidatedEmail
// ^ TypeScript erzwingt die ganze Kette!
```

> **In deinem Angular-Projekt** kannst du dieses Pattern für HTTP-Interceptors nutzen:
>
> ```typescript
> // Jede API-Antwort beginnt als 'unsafe':
> type UnsafeApiData = unknown & { readonly __brand: 'UnsafeApiData' };
> type ValidApiData<T> = T & { readonly __brand: 'ValidApiData' };
>
> // Interceptor transformiert safely:
> function validateApiResponse<T>(
>   schema: (data: unknown) => T,
>   raw: UnsafeApiData
> ): ValidApiData<T> {
>   const parsed = schema(raw); // Wirft bei Fehler
>   return parsed as ValidApiData<T>;
> }
>
> // In React Query:
> const { data } = useQuery<ValidApiData<User>>(['user', id], async () => {
>   const raw = await fetch('/api/user').then(r => r.json()) as UnsafeApiData;
>   return validateApiResponse(UserSchema.parse, raw);
> });
> // data ist ValidApiData<User> — wir WISSEN: es wurde validiert
> ```

---

## Brands über mehrere Primitive hinweg

```typescript annotated
// Brands funktionieren auf JEDEM primitiven Typ:
type NonNegativeNumber = number & { readonly __nonNegative: true };
type PortNumber        = number & { readonly __port: true };   // 1-65535
type PositiveInteger   = number & { readonly __positive: true; readonly __integer: true };

function createPort(n: number): PortNumber {
  if (!Number.isInteger(n) || n < 1 || n > 65535) {
    throw new Error(`Ungültige Port: ${n}`);
  }
  return n as PortNumber;
}

function createPositiveInteger(n: number): PositiveInteger {
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error(`Muss positive Ganzzahl sein: ${n}`);
  }
  return n as PositiveInteger;
}

// Server-Konfiguration — nur valdierte Werte:
interface ServerConfig {
  port: PortNumber;
  maxConnections: PositiveInteger;
  timeout: NonNegativeNumber;
}

const config: ServerConfig = {
  port: createPort(8080),
  maxConnections: createPositiveInteger(100),
  timeout: 30 as NonNegativeNumber, // Direkt für einfache Fälle
};
```

---

## Was du gelernt hast

- Brands können **kombiniert** werden: `string & Trimmed & NonEmpty` — jeder Brand
  repräsentiert eine garantierte Eigenschaft
- **Brand-Hierarchien**: `VerifiedEmail` ist Subtyp von `Email` → überall wo `Email`
  erwartet wird, kann `VerifiedEmail` eingesetzt werden
- Brands sind ideal für **Einheiten** (Meter vs. Foot) und **Validierungszustände**
- Number-Brands verhindern reale Bugs wie den Mars-Orbiter-Unfall (1999, 327 Mio. USD)

> 🧠 **Erkläre dir selbst:** Warum ist `string & Trimmed & NonEmpty` ein *Subtyp*
> von sowohl `string & Trimmed` als auch `string & NonEmpty`? Und was bedeutet
> "Subtyp" im Kontext von Zuweisbarkeit?
>
> **Kernpunkte:** Mehr Brands = stärkerer Typ (mehr Garantien) |
> Subtyp = kann überall eingesetzt werden wo Supertyp erwartet |
> Ein `SearchQuery` ist auch ein `TrimmedString` (hat alle Properties) |
> TypeScript prüft das automatisch durch Structural Typing

**Kernkonzept zum Merken:** Jeder Brand ist eine zusätzliche Garantie.
Brand-Kombinationen modellieren "Wert der alle X, Y und Z erfüllt" — und
TypeScript erzwingt jede Garantie einzeln.

---

> **Pausenpunkt** -- Du verstehst jetzt die volle Brand-Hierarchie.
>
> Weiter geht es mit: [Sektion 05: Praktische Patterns](./05-praktische-patterns.md)
