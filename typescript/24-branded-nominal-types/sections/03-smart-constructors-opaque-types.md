# Sektion 3: Smart Constructors & Opaque Types

> Geschätzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Die Brand-Technik](./02-die-brand-technik.md)
> Nächste Sektion: [04 - Mehrere Brands & Hierarchien](./04-mehrere-brands-hierarchien.md)

---

## Was du hier lernst

- Wie **Smart Constructors** Validierung und Typ-Vergabe vereinen
- Das **Opaque Type** Pattern mit `unique symbol` für maximale Sicherheit
- Wie man Brands mit **generischem Helfer-Typ** elegant definiert
- Wann Brand-Typen `never` zurückgeben sollen (ungültige Werte)

---

## Smart Constructors: Validierung + Sicherheit

Ein Smart Constructor ist eine Funktion, die:
1. Einen Roh-Wert entgegennimmt
2. Ihn **validiert**
3. Bei Erfolg: einen typisierten (gebrandeten) Wert zurückgibt
4. Bei Misserfolg: einen Fehler wirft *oder* einen `null`/`Error`-Wert

> **Hintergrund: Smart Constructors aus der Haskell-Welt**
>
> Smart Constructors kommen aus der funktionalen Programmierung, besonders
> aus Haskell. Dort sind sie bekannt als "Newtype" Pattern: Ein Typ der
> nur einen anderen Typ umhüllt, aber einen eigenen Namen (und damit Sicherheit)
> hat.
>
> In Haskell:
> ```haskell
> newtype UserId = UserId String  -- Newtype: Nominal, kein Overhead
> makeUserId :: String -> Maybe UserId
> makeUserId s = if isValid s then Just (UserId s) else Nothing
> ```
>
> TypeScript hat kein `newtype` — aber mit Brand-Technik + Smart Constructors
> emulieren wir genau dieses Pattern. Das ist eine der vielen Ideen die
> TypeScript aus der funktionalen Welt übernimmt.

---

## Drei Varianten von Smart Constructors

```typescript annotated
type Email = string & { readonly __brand: 'Email' };

// Variante 1: throw bei ungültigem Wert
function createEmail(value: string): Email {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    throw new Error(`Ungültige E-Mail: "${value}"`);
    // ^ Caller muss mit try/catch umgehen
  }
  return value as Email;
  // ^ Der as-Cast ist hier sicher: Wir haben validiert!
}

// Variante 2: null bei ungültigem Wert (Result-Stil, sicherer)
function tryCreateEmail(value: string): Email | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return null;
    // ^ Kein throw: Caller muss null-Fall behandeln (Compiler erzwingt das!)
  }
  return value as Email;
}

// Variante 3: Result-Typ (noch expliziter, kommt in L25)
type Result<T> = { ok: true; value: T } | { ok: false; error: string };

function parseEmail(value: string): Result<Email> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return { ok: false, error: `Ungültige E-Mail: "${value}"` };
    // ^ Explicit Fehler-Typ statt Ausnahme
  }
  return { ok: true, value: value as Email };
}
```

> 🧠 **Erkläre dir selbst:** Was ist der Unterschied zwischen Variante 1
> (`throw`) und Variante 2 (`null`)? Bei welcher Variante *erzwingt* TypeScript
> dass der Caller den Fehlerfall behandelt?
>
> **Kernpunkte:** throw → Caller kann es ignorieren (kein Compile-Error) |
> null → Compiler erzwingt: "null auch abhandeln!" | Result<T> → am explizitesten |
> In Production-Code: Variante 2 oder 3 bevorzugen

---

## Der generische Brand Helfer-Typ

Anstatt für jeden Brand die `& { readonly __brand: ... }` Syntax zu wiederholen,
gibt es in TypeScript-Projekten oft einen generischen Helfer:

```typescript annotated
// Der Brand Helfer — einmal definieren, überall verwenden
type Brand<T, B extends string> = T & { readonly __brand: B };
//         ^  ^^^^^^^^^^^^^^^^
//         |  B: Der Brand-Name (muss string-literal sein)
//         T: Der Basis-Typ (string, number, etc.)

// Elegante Brand-Definitionen:
type UserId  = Brand<string, 'UserId'>;
type OrderId = Brand<string, 'OrderId'>;
type Email   = Brand<string, 'Email'>;
type Age     = Brand<number, 'Age'>;      // Brand auf number!
type Seconds = Brand<number, 'Seconds'>; // Seconds ≠ Age!

// Vorher war es:
type UserId  = string & { readonly __brand: 'UserId' };  // Wiederholt
type OrderId = string & { readonly __brand: 'OrderId' }; // Wiederholt
// Nachher ist es konsistenter und lesbarer.
```

Und die Smart Constructors:

```typescript annotated
type Meters  = Brand<number, 'Meters'>;
type Seconds = Brand<number, 'Seconds'>;

function createMeters(value: number): Meters {
  if (value < 0) throw new Error(`Negative Länge: ${value}`);
  return value as Meters; // Sicher nach Validierung
}

function createSeconds(value: number): Seconds {
  if (value < 0) throw new Error(`Negative Zeit: ${value}`);
  return value as Seconds;
}

// Jetzt:
function speed(distance: Meters, time: Seconds): number {
  return distance / time;
  // ^ 'distance' und 'time' verhalten sich wie 'number'!
  //   Arithmetik funktioniert direkt.
}

const d = createMeters(100);
const t = createSeconds(10);

speed(d, t);   // ✅ 10 m/s
speed(t, d);   // ❌ COMPILE-ERROR! Seconds ≠ Meters, Meters ≠ Seconds
// ^ Physikalisch falsch — und TypeScript fängt es ab!
```

> **Experiment:** Öffne `examples/02-smart-constructors.ts` und probiere:
> 1. Erstelle `Kelvin = Brand<number, 'Kelvin'>` und `Celsius = Brand<number, 'Celsius'>`.
> 2. Schreibe `toFahrenheit(celsius: Celsius): number`.
> 3. Versuche eine `Kelvin`-Zahl hineinzugeben. Was sagt TypeScript?

---

## Opaque Types mit `unique symbol`

Die Standard-Brand-Technik hat eine Schwäche: Jemand könnte `as UserId`
schreiben und den Schutz umgehen. Für maximale Sicherheit gibt es
**Opaque Types** mit `unique symbol`:

```typescript annotated
// In 'user-id.ts' (ein separates Modul):
declare const userIdBrand: unique symbol;
//            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//            'unique symbol': Ein Symbol-Typ der EINZIGARTIG ist!
//            Jede 'unique symbol'-Deklaration erzeugt einen NEUEN Typ.
//            Niemand außerhalb dieses Moduls kann es reproduzieren.

export type UserId = string & { readonly [userIdBrand]: true };
//                                        ^^^^^^^^^^^^ Computed property mit dem geheimen Symbol!

export function createUserId(value: string): UserId {
  return value as UserId;
  // ^ Als einzige Funktion in diesem Modul hat sie Zugriff auf 'userIdBrand'
}

// In 'order-id.ts' (separates Modul):
declare const orderIdBrand: unique symbol; // ANDERER einzigartiger Symbol!
export type OrderId = string & { readonly [orderIdBrand]: true };
```

> 💭 **Denkfrage:** Was ist der Vorteil von `unique symbol` gegenüber
> dem einfachen String-Brand `{ __brand: 'UserId' }`? Könntest du
> den Schutz mit `unique symbol` umgehen?
>
> **Antwort:** Mit String-Brand könnte man theoretisch `value as UserId`
> in jedem Modul schreiben. Mit `unique symbol` geht das nicht mehr:
> Das Symbol ist nur im definierenden Modul bekannt. Das macht den
> Smart Constructor zum *einzigen* legalen Weg einen UserId zu erstellen.
> Externe Module müssen die exported Funktion verwenden.

---

## Das `Branded` Pattern aus Open-Source

Bibliotheken wie `@effect/schema` oder `zod` verwenden ähnliche Patterns.
Hier ist eine elegante Open-Source-Variante:

```typescript annotated
// Aus der TypeScript-Community: Branded Helper
type Branded<T, B> = T & { readonly [K in B & string]: K };
//                                 ^^^^^^^^^^^^^^^^^^^
//                                 Mapped Type übger B als Key!

// Oder noch einfacher (die verbreitete Variante):
declare const phantom: unique symbol;
type Newtype<T, Brand> = T & { readonly [phantom]: Brand };
//                               ^^^^^^^ Einziges unsichtbares Property

type UserId  = Newtype<string, 'UserId'>;
type OrderId = Newtype<string, 'OrderId'>;
type Kg      = Newtype<number, 'Kg'>;
type Liter   = Newtype<number, 'Liter'>;

// Generischer Smart Constructor:
function brand<T extends Newtype<unknown, unknown>>(
  value: T extends Newtype<infer V, unknown> ? V : never
): T {
  return value as T;
}
// Verwendung:
const id = brand<UserId>('user-123');
```

> 🔍 **Tieferes Wissen: `declare const` ohne Wert**
>
> `declare const userIdBrand: unique symbol` fällt auf: Kein Wert nach `=`!
> Das ist ein **ambient declaration** — TypeScript weiß dass das Ding existiert,
> aber definiert es nicht. Es wird NIE kompiliert (Type Erasure!).
>
> `unique symbol` ist ein spezieller TypeScript-Typ: Jede `unique symbol`-Variable
> hat ihren eigenen Typ — sogar zwei `declare const x: unique symbol; declare const y: unique symbol`
> haben verschiedene Typen! Das macht sie perfekt für unverwechselbare Property-Keys.

---

## Brands für Validierte Strings: Das Email-Beispiel vollständig

```typescript annotated
// Vollständiges Email-Modul
export type Email = Brand<string, 'Email'>;

export class InvalidEmailError extends Error {
  constructor(value: string) {
    super(`"${value}" ist keine gültige E-Mail-Adresse`);
    this.name = 'InvalidEmailError';
  }
}

export function createEmail(raw: string): Email {
  const trimmed = raw.trim().toLowerCase();
  // ^ Normalisierung als Teil des Smart Constructors

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    throw new InvalidEmailError(raw);
  }

  return trimmed as Email;
  // ^ Jetzt ist es sicher: validiert UND normalisiert
}

// Verwendung:
function sendWelcomeEmail(to: Email): void {
  console.log(`Sende E-Mail an: ${to}`); // String-Template funktioniert!
  // Fetch, SMTP, etc.
}

try {
  const email = createEmail('  Max.Mustermann@Example.CO  ');
  // email = 'max.mustermann@example.co' (normalisiert!)
  sendWelcomeEmail(email); // ✅ OK
} catch (e) {
  if (e instanceof InvalidEmailError) {
    console.error(e.message); // Typsicher!
  }
}

sendWelcomeEmail('max@example.com');
// ^ COMPILE-ERROR: string ≠ Email. createEmail() muss verwendet werden!
```

> **In deinem Angular-Projekt:** Du kannst Branded Types mit Reactive Forms
> kombinieren:
>
> ```typescript
> // In einem FormService:
> validateAndGetEmail(control: AbstractControl): Email | null {
>   const value = control.value as string;
>   try {
>     return createEmail(value);
>   } catch {
>     return null;
>   }
> }
>
> onSubmit(form: FormGroup): void {
>   const email = this.validateAndGetEmail(form.controls['email']);
>   if (!email) {
>     // Fehlerbehandlung
>     return;
>   }
>   this.userService.register(email); // Typ: Email — sicher!
> }
> ```

---

## Was du gelernt hast

- **Smart Constructors** zentralisieren `as`-Casts und kombinieren Validierung mit Typ-Vergabe
- Der generische **`Brand<T, B>`** Helfer macht Brand-Definitionen eleganter
- **`unique symbol`** für Opaque Types: Maximale Sicherheit — nur der definierende
  Modul kann Werte des Typs erstellen
- Brands können Validierung + Normalisierung enthalten (trimmen, toLowerCase, etc.)

> 🧠 **Erkläre dir selbst:** Was ist der Unterschied zwischen einem einfachen
> `as`-Cast und einem Smart Constructor? Warum ist der Smart Constructor sicherer?
>
> **Kernpunkte:** as-Cast: überall im Code, unsichtbar, keine Validierung |
> Smart Constructor: zentraler Ort, sichtbar, erzwingt Validierung |
> Audit: 1 Funktion prüfen vs. 100 Stellen im Code | APIs bleiben sicher

**Kernkonzept zum Merken:** Smart Constructor = Validierung + `as`-Cast an einem
einzigen sicheren Ort. Der Rest des Codes darf nie direkt `as Brand` schreiben.

---

> **Pausenpunkt** -- Du kennst jetzt Smart Constructors und Opaque Types.
>
> Weiter geht es mit: [Sektion 04: Mehrere Brands & Hierarchien](./04-mehrere-brands-hierarchien.md)
