// misconceptions.ts — L24: Branded/Nominal Types
// 8 häufige Fehlvorstellungen mit Korrekturen

export interface Misconception {
  id: number;
  concept: string;
  misconception: string;
  correction: string;
  example?: string;
}

export const misconceptions: Misconception[] = [
  {
    id: 1,
    concept: "type-alias-vs-brand",
    misconception: "`type UserId = string` macht `UserId` zu einem anderen Typen als `string`. Fehler beim Übergeben eines `string` an eine `UserId`-Funktion.",
    correction: "Type Aliases sind nur Umbenennung, kein neuer Typ. TypeScript prüft Struktur — `type UserId = string` bedeutet `UserId IST string`. Kein Unterschied für den Compiler. Brands (`& { __brand: ... }`) sind nötig um echten Schutz zu bekommen.",
    example: `// ERWARTUNG (falsch):
type UserId = string;
function getUser(id: UserId) {}
getUser("beliebig"); // Man denkt: Fehler — ist aber kein Fehler!

// REALITÄT:
// TypeScript erlaubt das — UserId = string (Alias, kein neuer Typ)

// LÖSUNG:
type UserId = string & { readonly __brand: 'UserId' };
// Jetzt: getUser("beliebig") → COMPILE-ERROR ✅`
  },
  {
    id: 2,
    concept: "brand-runtime-overhead",
    misconception: "Das `__brand`-Property existiert zur Laufzeit im Objekt und verursacht Speicher-Overhead.",
    correction: "Type Erasure: Alle TypeScript-Typ-Informationen werden beim Kompilieren entfernt. Das `__brand`-Property existiert NUR zur Compilezeit. Zur Laufzeit ist ein `UserId`-Wert ein normaler JavaScript-String ohne Overhead.",
    example: `// TypeScript (Compilezeit):
const id: UserId = createUserId("user-123");
// Das kompilierte JavaScript:
const id = "user-123"; // Normaler String! __brand ist weg.

// Zero Runtime Overhead: Kein Objekt, kein allocation, keine Laufzeitprüfung`
  },
  {
    id: 3,
    concept: "brand-blocks-all-operations",
    misconception: "Ein Branded Type `UserId = string & { __brand: 'UserId' }` kann nicht in string-Operationen verwendet werden — `.length`, `.toUpperCase()`, Template Literals sind alle blockiert.",
    correction: "Falsch: Branded Types erben alle Operationen des Basis-Typs. `UserId` ist Subtyp von `string` → hat alle string-Properties. `.length`, `.toUpperCase()`, Template Literals funktionieren alle. Nur die Zuweisbarkeit zu anderen Typen ist eingeschränkt.",
    example: `type UserId = string & { readonly __brand: 'UserId' };
const id = createUserId("user-123");

// ALLES funktioniert:
id.toUpperCase();     // "USER-123" ✅
id.length;            // 8 ✅
\`ID: \${id}\`;         // "ID: user-123" ✅
id.startsWith('user-'); // true ✅

// Nur Zuweisbarkeit ist eingeschränkt:
function f(x: UserId) {}
f("user-123"); // ❌ COMPILE-ERROR — string ≠ UserId`
  },
  {
    id: 4,
    concept: "as-cast-safety",
    misconception: "Wenn ich `as UserId` verwende, ist der Code unsicher weil der Compiler es erlaubt ohne zu prüfen. Brand-Typen bieten keine echte Sicherheit.",
    correction: "`as`-Casts sind ein bewusstes 'Ich verspreche dem Compiler'. In Smart Constructors ist das sicher: Validierung kommt VOR dem Cast. Das Problem entsteht nur wenn `as Brand` überall erlaubt wird. Strategie: `as`-Cast NUR in Smart Constructors. Dann: Ein validierter, auditierbarer Ort statt 100 ungeprüfte Stellen.",
    example: `// UNSICHER: as überall
function processUser(id: string) {
  getUser(id as UserId); // Unkontrollierter Cast — gefährlich!
}

// SICHER: as nur im Smart Constructor
function createUserId(raw: string): UserId {
  validate(raw); // Erst validieren!
  return raw as UserId; // Dann casten — sicher.
}
// processUser muss jetzt: createUserId(id) verwenden ✅`
  },
  {
    id: 5,
    concept: "structural-vs-nominal-confusion",
    misconception: "TypeScript's Structural Typing und Nominal Typing sind zwei opt-in Fehler. Man kann in tsconfig.json auf Nominal Typing umschalten.",
    correction: "Nein — TypeScript hat NUR Structural Typing. Es gibt keine tsconfig-Option für Nominal Typing. Brand-Typen sind der einzige Weg Nominal-ähnliches Verhalten zu emulieren. Die TypeScript-Designer haben sich bewusst für Structural Typing entschieden (Kompatibilität mit JavaScript).",
    example: `// Es gibt KEINE TypeScript-Option wie:
// "nominalTyping": true  ← EXISTIERT NICHT

// Brand-Technik ist die einzige Lösung:
type UserId = string & { readonly __brand: 'UserId' };
// ← Das simuliert Nominal Typing innerhalb des Structural Systems`
  },
  {
    id: 6,
    concept: "brand-subtype-direction",
    misconception: "Ein `UserId` kann nicht als `string` übergeben werden, weil es ein 'stärkerer' Typ ist und TypeScript Downcasting verbietet.",
    correction: "Umgekehrt: `UserId` ist Subtyp von `string` (hat alle string-Properties + mehr). Subtypen können überall eingesetzt werden wo Supertypen erwartet werden — das ist Liskov's Substitution Principle. `string → UserId` (Downcast) ist verboten. `UserId → string` (Upcast) ist erlaubt.",
    example: `type UserId = string & { readonly __brand: 'UserId' };
const id: UserId = createUserId("user-123");

// Upcast (UserId → string): ERLAUBT
function logRaw(s: string) { console.log(s); }
logRaw(id); // ✅ OK — Subtyp kann als Supertyp verwendet werden

// Downcast (string → UserId): VERBOTEN
const raw = "user-123";
logUserId(raw); // ❌ COMPILE-ERROR — kein Brand`
  },
  {
    id: 7,
    concept: "currency-brand-prevents-all-errors",
    misconception: "Mit `type EurCents = number & { __currency: 'EUR' }` kann ich keine falschen Berechnungen mehr machen — TypeScript prüft alles.",
    correction: "Brands schützen vor Typ-Verwechslungen, aber nicht vor logischen Fehlern. `eur * 2` ergibt `number` (nicht `EurCents`) — TypeScript kann nicht wissen ob das sinnvoll ist. Brands schützen die Grenzen: 'EUR an USD-Funktion' → COMPILE-ERROR. Aber interne Berechnungen brauchen menschliche Prüfung.",
    example: `type EurCents = number & { __currency: 'EUR', __cents: true };

// Brand schützt:
function chargeUsd(amount: UsdCents) { /* ... */ }
// chargeUsd(eurAmount) → ❌ COMPILE-ERROR ✅

// Brand schützt NICHT:
const price: EurCents = 1999 as EurCents;
const taxRate = 0.19;
const tax = price * taxRate; // Ergibt NICHT EurCents — ergibt number
// TypeScript weiß nicht: ist das Ergebnis gültige Cents?`
  },
  {
    id: 8,
    concept: "brand-replaces-validation",
    misconception: "Wenn ich einen `Email`-Brand-Typ habe, muss ich keine E-Mail-Validierung mehr schreiben — TypeScript prüft das automatisch.",
    correction: "Brands sind compiletime-only. TypeScript prüft KEINE Inhalte, nur Typen. Ein Browser kann trivial `'noemail' as Email` senden — TypeScript wird beim Kompilieren nicht murren. Validation ist der JOB des Smart Constructors, ein getrennter Schritt. Brand = Garantie dass der Smart Constructor aufgerufen wurde; Validation = das WAS der Smart Constructor prüft.",
    example: `type Email = string & { readonly __brand: 'Email' };

// Ohne Validierung im Smart Constructor:
function createEmail(raw: string): Email {
  return raw as Email; // Kein Fehler — aber 'noemail' wird durchgelassen!
}

const broken: Email = createEmail("noemail"); // ← Wird akzeptiert!

// Korrekt: Validierung IST Teil des Smart Constructors:
function createEmail(raw: string): Email {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(raw.trim())) throw new Error('Ungültig');
  return raw as Email; // Jetzt sicher!
}`
  }
];
