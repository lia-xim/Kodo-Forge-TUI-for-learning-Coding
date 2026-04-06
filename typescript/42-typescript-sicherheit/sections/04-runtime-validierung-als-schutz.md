# Sektion 4: Runtime-Validierung als Schutz

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - JavaScript-Fallen in TypeScript](./03-javascript-fallen-in-typescript.md)
> Naechste Sektion: [05 - Parse, don't validate](./05-parse-dont-validate.md)

---

## Was du hier lernst

- Wie du TypeScript-native **Type Guards** als vollstaendige Validierungs-Schicht einsetzt
- Das **Validator-Pattern** — eine generische Fabrik fuer wiederverwendbare Prueffunktionen
- Wie sich Validatoren **komponieren** lassen (Laenge, Format, Wertebereich)
- Wie Angular's **Reactive Forms** von Custom Type Guards profitieren

---

## Hintergrund: Der Moment, als Netflix die Produktion crashte

Im Dezember 2015 erlebte Netflix einen Produktionsausfall, der zehntausende
Nutzer betraf. Die Ursache war verbluffend einfach: Eine API-Antwort enthielt
ein Feld, das normalerweise ein Array lieferte — diesmal aber `null`.
Der aufrufende Code hatte das nie validiert. "Wir wissen, was die API
zurueckgibt" — bis sie es nicht tat.

Der Netflix-Ingenieur Ben Christensen beschrieb spaeter im Hystrix-Blog, was
daraus entstand: **Defensive Programming als Architekturprinzip**. Nicht blind
vertrauen, was von aussen kommt. Jede Systemgrenze validieren.

TypeScript allein haette das nicht verhindert. `HttpClient.get<Response>()` ist
ein Cast, kein Schutz. Was haette geholfen? Genau das, was wir in dieser
Sektion lernen: **Runtime-Validierung an der Systemgrenze**.

> **Das Prinzip:** Validiere einmal, beim Eintritt in dein System. Danach
> kannst du dem Typ vertrauen — weil du ihn bewiesen hast, nicht weil du
> ihn behauptet hast.

---

## Das Type Guard Fundament

Wir haben in Sektion 1 gesehen, dass `HttpClient.get<User>()` ein Versprechen
ist, keine Pruefung. Jetzt bauen wir die echte Pruefung.

TypeScript bietet uns **Type Guards** — Funktionen, die zur Laufzeit pruefen
und dem Compiler gleichzeitig den Typ mitteilen:

```typescript annotated
// Die Validator-Typ-Signatur: der Kern des ganzen Patterns
type Validator<T> = (value: unknown) => value is T;
//                                     ^^^^^^^^^^^
//                                     Type Predicate: sagt dem Compiler:
//                                     "Wenn diese Funktion true zurueckgibt,
//                                     dann ist value ein T"

// Ein einfaches Beispiel: string-Validator
const isString: Validator<string> = (value): value is string => {
  return typeof value === 'string';
  // ^ Laufzeit-Check: wirklich ein string?
};

// Jetzt kann TypeScript narrowen:
function verarbeite(value: unknown): void {
  if (isString(value)) {
    console.log(value.toUpperCase()); // OK! TypeScript weiss: value ist string
    // ^ value wurde BEWIESEN, nicht behauptet
  }
}
```

Das Type Predicate (`value is T`) ist der Schluesselmechanismus: Es verbindet
die Laufzeit-Pruefung mit dem Compile-Zeit-Typsystem. Wenn die Funktion
`true` zurueckgibt, weiss TypeScript: "In diesem Zweig ist value ein T."

---

## Der vollstaendige User-Validator

Bauen wir einen realistischen Validator fuer ein Domaenobjekt:

```typescript annotated
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  createdAt: string;  // ISO 8601
}

// Hilfsfunktionen fuer Primitive
const isString = (v: unknown): v is string => typeof v === 'string';
const isNumber = (v: unknown): v is number => typeof v === 'number' && !isNaN(v);

// Der User-Guard: prueft jede Property einzeln
function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) {
    return false;
    // ^ Kein Objekt, kein User — frueher Return verhindert verschachtelte Ifs
  }

  // TypeScript kennt value noch als 'object' — wir casten fuer den Zugriff
  const v = value as Record<string, unknown>;
  // ^ Dieses as ist sicher: wir haben gerade geprueft, dass es ein Objekt ist

  return (
    isString(v['id'])   && v['id'].length > 0          &&
    // ^ id: nicht-leerer string

    isString(v['name']) && v['name'].length >= 2        &&
    // ^ name: mindestens 2 Zeichen

    isString(v['email']) && v['email'].includes('@')    &&
    // ^ email: enthaelt '@' — einfacher Plausibilitaetscheck

    (v['role'] === 'admin' || v['role'] === 'user' || v['role'] === 'moderator') &&
    // ^ role: nur erlaubte Werte — verhindert unerwartete Rollen-Strings

    isString(v['createdAt']) && !isNaN(Date.parse(v['createdAt']))
    // ^ createdAt: parsebares Datum — verhindert kaputte Zeitstempel
  );
}

// Verwendung: kein 'as' Cast notwendig!
async function fetchUser(id: string): Promise<User> {
  const raw = await fetch(`/api/users/${id}`).then(r => r.json());
  if (!isUser(raw)) {
    throw new ValidationError(
      `Ungueltige User-Antwort von API: ${JSON.stringify(raw)}`
      // ^ Logge den konkreten Wert fuer einfaches Debugging
    );
  }
  return raw;
  // ^ Kein 'as'! Der Type Guard hat die Invariante bewiesen.
  //   TypeScript weiss: raw ist User, weil isUser(raw) true war.
}
```

---

## Die Validator-Fabrik: createValidator

Statt jeden Validator von Hand zu schreiben, koennen wir eine generische
Fabrik bauen. Das reduziert Boilerplate und macht Validatoren testbar:

```typescript annotated
// Eine Regel: nimmt einen Wert, gibt true/false zurueck
type Rule<T> = (value: T) => boolean;

// Fabrik fuer Objekt-Validatoren
function createObjectValidator<T extends object>(
  checks: { [K in keyof T]: (value: unknown) => value is T[K] }
): Validator<T> {
  return (value: unknown): value is T => {
    if (typeof value !== 'object' || value === null) return false;
    const v = value as Record<string, unknown>;

    // Pruefe jede Property mit dem zugehoerigen Validator
    for (const key of Object.keys(checks) as (keyof T)[]) {
      if (!checks[key](v[key as string])) {
        return false;
        // ^ Fruehabbruch: erste fehlgeschlagene Pruefung stoppt sofort
      }
    }
    return true;
  };
}

// Verwendung: Validator deklarativ beschreiben
const validateProduct = createObjectValidator<Product>({
  id:    (v): v is string  => typeof v === 'string' && v.length > 0,
  name:  (v): v is string  => typeof v === 'string' && v.length >= 2,
  price: (v): v is number  => typeof v === 'number' && v >= 0,
});
// Kein Boilerplate-Loop — einfach die Shapes deklarieren
```

---

## Komponierbare Validatoren

Einzelne Regeln lassen sich zu komplexen Validatoren kombinieren:

```typescript annotated
// String-Validatoren koennen verkettet werden
function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function isEmail(v: unknown): v is string {
  return typeof v === 'string' &&
    v.includes('@') &&
    v.split('@').length === 2 &&
    v.split('@')[1].includes('.');
}

function isInRange(min: number, max: number) {
  return (v: unknown): v is number =>
    typeof v === 'number' && !isNaN(v) && v >= min && v <= max;
}

// Alle Fehlermeldungen auf einmal sammeln (statt beim ersten Fehler abbrechen)
class ValidationError extends Error {
  constructor(
    public readonly messages: string[],
    public readonly rawValue: unknown
  ) {
    super(`Validierungsfehler: ${messages.join(', ')}`);
    this.name = 'ValidationError';
  }
}

function validateWithMessages<T>(
  value: unknown,
  checks: Array<{ guard: (v: unknown) => boolean; message: string }>
): T {
  const errors = checks
    .filter(check => !check.guard(value))
    .map(check => check.message);
  // ^ Alle fehlgeschlagenen Pruefungen sammeln — nicht beim ersten abbrechen

  if (errors.length > 0) {
    throw new ValidationError(errors, value);
    // ^ Eine Exception mit allen Fehlern — besser als 5 separate Exceptions
  }
  return value as T;  // as ist hier sicher: alle Checks haben bestanden
}

// Verwendung in der Praxis:
function validatePassword(raw: unknown): string {
  return validateWithMessages<string>(raw, [
    { guard: (v): boolean => typeof v === 'string', message: 'Muss ein String sein' },
    { guard: (v): boolean => typeof v === 'string' && v.length >= 8, message: 'Mindestens 8 Zeichen' },
    { guard: (v): boolean => typeof v === 'string' && /[A-Z]/.test(v), message: 'Mindestens ein Grossbuchstabe' },
    { guard: (v): boolean => typeof v === 'string' && /[0-9]/.test(v), message: 'Mindestens eine Ziffer' },
  ]);
  // Alle Fehler auf einmal: "Mindestens 8 Zeichen, Mindestens ein Grossbuchstabe"
  // Besser als: "Fehler 1" → Fix → "Fehler 2" → Fix → ...
}
```

---

## Experiment-Box: Type Guard in Aktion

Schreibe diesen Code im TypeScript Playground und beobachte, wie TypeScript
durch den Type Guard narrowt — ohne Cast, ohne `any`:

```typescript
interface Produkt {
  id: string;
  name: string;
  preis: number;
}

function isProdukt(value: unknown): value is Produkt {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v['id'] === 'string' &&
    typeof v['name'] === 'string' &&
    typeof v['preis'] === 'number' &&
    v['preis'] >= 0
  );
}

// Simuliere eine API-Antwort mit falschen Daten:
const apiantwort: unknown = JSON.parse(`{
  "id": "prod-1",
  "name": "Laptop",
  "price": 999
}`);
// Beachte: 'price' statt 'preis'

if (isProdukt(apiantwort)) {
  console.log('Gueltiges Produkt:', apiantwort.name);
  // TypeScript erlaubt .name — Type Guard hat bewiesen: apiantwort ist Produkt
} else {
  console.log('UNGUELTIGE API-Antwort!');
  // Dieser Zweig wird ausgefuehrt — weil 'preis' fehlt
  // Der Fehler wird SOFORT am API-Rand gefangen, nicht spaeter
}

// Frage zum Nachdenken: Was passiert, wenn du 'preis' statt 'price'
// im JSON verwendest? Was wenn 'preis' -5 ist?
```

Der entscheidende Unterschied zu `as Produkt`: Wenn die API ploetzlich
`price` statt `preis` schickt, faengt der Guard das sofort ab. Mit `as`
wuerdest du es erst merken, wenn irgendwo `undefined * 0.19 = NaN` auftaucht.

---

## Angular-Bezug: Reactive Forms mit Type Guards

In deinem Angular-Projekt erzeugst du Formulardaten mit `FormGroup.value`.
Das Problem: Der TypeScript-Typ ist oft `Partial<T>` oder sogar `any`.
Type Guards helfen:

```typescript annotated
// Formular-Schnittstelle
interface BestellFormular {
  kundeId: string;
  artikel: string[];
  lieferadresse: string;
  bezahlmethode: 'kreditkarte' | 'paypal' | 'ueberweisung';
}

// Type Guard fuer Formulardaten
function isBestellFormular(value: unknown): value is BestellFormular {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;

  return (
    typeof v['kundeId'] === 'string' && v['kundeId'].length > 0 &&
    Array.isArray(v['artikel']) && v['artikel'].length > 0 &&
    typeof v['lieferadresse'] === 'string' && v['lieferadresse'].length >= 10 &&
    (v['bezahlmethode'] === 'kreditkarte' ||
     v['bezahlmethode'] === 'paypal' ||
     v['bezahlmethode'] === 'ueberweisung')
  );
}

// Im Component: sauber und typsicher
@Component({ /* ... */ })
export class BestellungComponent {
  form = new FormGroup({
    kundeId: new FormControl(''),
    artikel: new FormControl<string[]>([]),
    lieferadresse: new FormControl(''),
    bezahlmethode: new FormControl(''),
  });

  onSubmit(): void {
    const raw = this.form.value;
    // ^ raw ist Partial<{ kundeId: string | null, ... }>

    if (!isBestellFormular(raw)) {
      // Zeige Fehler in der UI
      this.formFehler = 'Bitte alle Pflichtfelder ausfullen';
      return;
    }
    // Ab hier: raw ist BestellFormular — TypeScript ist ueberzeugt, kein Cast noetig
    this.bestellService.bestellen(raw);
    // ^ raw.kundeId, raw.artikel — alles vollstaendig typisiert
  }
}
```

Das Reaktive Form gibt `Partial<T>` oder `any`-nahe Typen zurueck. Der Type Guard
baut die Bruecke zwischen "Formulardaten" und "Domaenentyp" — ohne `as`.

---

## Was du gelernt hast

- **Type Guards** (`value is T`) verbinden Laufzeit-Pruefung mit Compile-Zeit-Wissen
- Der Cast `as Record<string, unknown>` nach `typeof === 'object'`-Check ist sicher,
  weil du die Invariante bereits geprueft hast
- **Validator-Fabriken** reduzieren Boilerplate und machen Validierung testbar
- **Fehler-Sammlung** statt Fruehabbruch: alle Validierungsfehler auf einmal
  zeigen verbessert die Nutzererfahrung
- In Angular: Type Guards loesen das `FormGroup.value`-Typproblem ohne Casts

> 🧠 **Erklaere dir selbst:** Warum ist `return value as T` am Ende einer
> Validator-Funktion (nach allen Pruefungen) ein akzeptables `as` — obwohl
> wir `as` normalerweise meiden?
>
> **Kernpunkte:** `as` ist sicher wenn du die Invariante bewiesen hast |
> Alle Checks haben bestanden → der Typ stimmt tatsaechlich | Das ist das
> "Trust after verify"-Prinzip | Das `as` widerspiegelt bewiesene Tatsachen,
> nicht Behauptungen | Es gibt keine bessere Alternative ohne externe Libraries

**Kernkonzept zum Merken:** Ein Type Guard ist ein Vertrag zwischen Laufzeit
und Compile-Zeit. Er sagt: "Ich pruefe das jetzt wirklich, damit TypeScript
es spaeter glauben kann." Das ist der einzige Weg, externe Daten ehrlich ins
Typsystem zu holen.

---

> **Pausenpunkt** — Du hast das Validator-Pattern von Grund auf verstanden.
> Das ist das Werkzeug, das die naechste Sektion auf eine elegante Design-
> Philosophie hebt.
>
> Weiter geht es mit: [Sektion 05: Parse, don't validate](./05-parse-dont-validate.md)
