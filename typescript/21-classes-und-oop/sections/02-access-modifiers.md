# Sektion 2: Access Modifiers

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Klassen-Grundlagen](./01-klassen-grundlagen.md)
> Naechste Sektion: [03 - Vererbung und Abstract Classes](./03-vererbung-und-abstract.md)

---

## Was du hier lernst

- Die vier Access Modifiers: **public**, **private**, **protected** und **readonly**
- Den fundamentalen Unterschied zwischen TypeScript's `private` und JavaScript's `#private`
- Warum **Type Erasure** bedeutet, dass `private` zur Laufzeit **nicht existiert**
- Wie du Access Modifiers in der Praxis einsetzt, um APIs klar zu definieren

---

## Die vier Access Modifiers im Ueberblick

<!-- section:summary -->
TypeScript bietet `public` (default), `private`, `protected` und `readonly` — Compilezeit-Modifier zur API-Definition, die zur Laufzeit via Type Erasure verschwinden.
<!-- depth:standard -->
TypeScript bietet vier Schluesselwoerter, um den Zugriff auf
Klassen-Mitglieder zu steuern. Wenn du aus Java oder C# kommst,
wirst du einiges wiedererkennen — aber es gibt einen entscheidenden
Unterschied, den du verstehen musst.

```typescript annotated
class BankAccount {
  public owner: string;
  // ^ public: Von ueberall zugaenglich. Das ist der DEFAULT —
  //   wenn du nichts schreibst, ist es public.
  private balance: number;
  // ^ private: Nur innerhalb DIESER Klasse zugaenglich.
  //   ACHTUNG: Nur zur Compilezeit! (Type Erasure)
  protected accountType: string;
  // ^ protected: Innerhalb dieser Klasse UND in Subklassen.
  readonly iban: string;
  // ^ readonly: Kann nach der Initialisierung nicht mehr geaendert werden.

  constructor(owner: string, iban: string, initialBalance: number = 0) {
    this.owner = owner;
    this.iban = iban;
    this.balance = initialBalance;
    this.accountType = "checking";
  }

  deposit(amount: number): void {
    if (amount <= 0) throw new Error("Betrag muss positiv sein");
    this.balance += amount;
    // ^ OK: private-Felder sind innerhalb der Klasse zugaenglich.
  }

  getBalance(): number {
    return this.balance;
    // ^ Getter-Methode: Der sichere Weg, den Saldo abzufragen.
  }
}

const account = new BankAccount("Max", "DE89...", 1000);
console.log(account.owner);    // OK: public
console.log(account.iban);     // OK: readonly (lesen geht)
// account.iban = "DE00...";   // FEHLER: readonly nach Initialisierung
// console.log(account.balance); // FEHLER: private
// account.accountType;        // FEHLER: protected
```

| Modifier | Innerhalb der Klasse | Subklassen | Von aussen |
|---|---|---|---|
| `public` | Ja | Ja | Ja |
| `private` | Ja | Nein | Nein |
| `protected` | Ja | Ja | Nein |
| `readonly` | Ja (nur Initialisierung) | Ja (lesen) | Ja (lesen) |

<!-- depth:vollstaendig -->
> **Analogie:** Access Modifiers sind wie Zonen in einem Firmengebaeude:
> `public` = Empfangshalle (jeder kommt rein), `private` = CEO-Buero
> (nur mit Schluessel), `protected` = Labor (Mitarbeiter + Praktikanten),
> `readonly` = Info-Tafel (anschauen ja, veraendern nein).

<!-- /depth -->

---

## Der grosse Irrtum: private ist NICHT wirklich privat

<!-- section:summary -->
TypeScript's `private` existiert nur zur Compilezeit — zur Laufzeit kann jeder via `(obj as any).feld` darauf zugreifen; JavaScript's `#private` (ES2022) bietet echte Laufzeit-Kapselung.
<!-- depth:standard -->
Hier kommt das wichtigste Konzept dieser Sektion — und es haengt
direkt mit **Type Erasure** aus Lektion 02 zusammen:

> **TypeScript's `private` existiert NUR zur Compilezeit.
> Zur Laufzeit ist das Feld ganz normal zugaenglich!**

```typescript annotated
class Secret {
  private password: string = "geheim123";
}

const s = new Secret();
// s.password;          // Compile-Error: private
(s as any).password;    // "geheim123" — FUNKTIONIERT!
// ^ Type Erasure: 'private' ist zur Laufzeit verschwunden.
//   Mit 'as any' umgehst du das Typsystem komplett.
```

<!-- depth:vollstaendig -->
> **Hintergrund: Java's Einfluss und JavaScript's Realitaet**
>
> TypeScript's Access Modifiers sind von **Java und C#** inspiriert —
> kein Zufall, denn Anders Hejlsberg (TypeScript-Erfinder) hat auch C#
> erfunden. In Java ist `private` ein harter Schutz: Die JVM verhindert
> Zugriff zur Laufzeit (mit Reflection ist es moeglich, aber die Absicht
> ist klar).
>
> In TypeScript hingegen ist `private` ein **Gentleman's Agreement**:
> Der Compiler warnt dich, aber der generierte JavaScript-Code hat
> kein `private` mehr. Das Feld ist ein ganz normales Property.
>
> Diese Designentscheidung folgt aus TypeScript's Grundprinzip:
> **Kein Laufzeit-Overhead**. TypeScript fuegt keinen Code hinzu,
> der Access Control zur Laufzeit erzwingt.

> **Erklaere dir selbst:** Warum ist `private` in TypeScript NICHT das gleiche
> wie `#private` in JavaScript? Was passiert mit `private` nach dem Kompilieren?
> Und was bleibt von `#private` uebrig?
>
> **Kernpunkte:** TypeScript `private` → wird entfernt (Type Erasure) |
> JavaScript `#private` → bleibt im JS-Code | `#private` ist echte Kapselung |
> `private` ist nur eine Compiler-Anweisung

<!-- /depth -->

---

## JavaScript's echtes Private: #private (ES2022)

<!-- section:summary -->
Seit ES2022 bietet JavaScript `#private` Felder — echte Laufzeit-Kapselung, die selbst mit `(obj as any)` nicht umgangen werden kann.
<!-- depth:standard -->
Seit ES2022 hat JavaScript eine **echte** private-Syntax: das Hash-Zeichen.
Im Gegensatz zu TypeScript's `private` bleibt `#` zur Laufzeit erhalten:

```typescript annotated
class VaultAccount {
  #secret: string;
  // ^ #private: Existiert auch zur Laufzeit als echtes Private Field.
  //   Nicht einmal mit (obj as any) zugaenglich!

  constructor(secret: string) {
    this.#secret = secret;
  }

  reveal(): string {
    return this.#secret;
    // ^ Zugriff nur innerhalb der Klasse moeglich
  }
}

const vault = new VaultAccount("top-secret");
// vault.#secret;           // Syntax-Error (auch zur Laufzeit!)
// (vault as any).#secret;  // Syntax-Error — nicht umgehbar!
// (vault as any)["#secret"] // undefined — der Name ist kein normaler Key
console.log(vault.reveal());  // "top-secret"
```

### TypeScript private vs JavaScript #private

| Feature | `private` (TS) | `#private` (JS/TS) |
|---|---|---|
| Zugriff mit `as any` moeglich? | **Ja** | **Nein** |
| Existiert zur Laufzeit? | **Nein** (Type Erasure) | **Ja** |
| In `JSON.stringify` sichtbar? | **Ja** | **Nein** |
| In `for...in` sichtbar? | **Ja** | **Nein** |
| Von Subklassen ueberschreibbar? | Nein (shadowing moeglich) | Nein |
| Mit `Object.keys()` sichtbar? | **Ja** | **Nein** |
| Performance? | Normal | Minimal langsamer |

<!-- depth:vollstaendig -->
> **Denkfrage:** Wenn TypeScript-Typen zur Laufzeit verschwinden (Type Erasure,
> Lektion 02), was bedeutet das fuer `private`? Ist es dann ueberhaupt
> sinnvoll, `private` zu verwenden, wenn jeder es mit `as any` umgehen kann?
>
> **Antwort:** Ja! `private` ist ein **Kommunikationsmittel**. Es sagt anderen
> Entwicklern: "Dieses Feld ist ein Implementierungsdetail. Benutze es nicht."
> Der Compiler erzwingt das in deinem Code. Und wer `as any` schreibt,
> weiss, dass er die Regeln bricht — das ist dann ein bewusstes Risiko.
> In den meisten Projekten reicht TypeScript's `private` voellig aus.

> **Analogie:** TypeScript `private` ist ein "Bitte nicht betreten"-Schild —
> hoefflich, aber kein Schloss. JavaScript `#private` ist eine Tuer mit
> Zahlenkombination — niemand kommt rein ohne Code.

<!-- /depth -->

---

## protected: Fuer die Familie

<!-- section:summary -->
`protected` erlaubt Zugriff innerhalb der Klasse und in Subklassen, aber nicht von aussen — ideal fuer interne Werte die in Vererbungshierarchien sichtbar sein sollen.
<!-- depth:standard -->
`protected` ist der Modifier, der am meisten Verwirrung stiftet.
Er erlaubt Zugriff **innerhalb der Klasse und in allen Subklassen** —
aber nicht von aussen.

```typescript annotated
class Vehicle {
  protected speed: number = 0;
  // ^ protected: Subklassen koennen darauf zugreifen

  accelerate(amount: number): void {
    this.speed += amount;
  }
}

class Car extends Vehicle {
  turboBoost(): void {
    this.speed *= 2;
    // ^ OK! Car erbt von Vehicle, also ist 'protected' zugaenglich.
  }

  getSpeed(): number {
    return this.speed;
    // ^ OK! Zugriff auf protected innerhalb einer Subklasse.
  }
}

const car = new Car();
car.accelerate(50);
car.turboBoost();
console.log(car.getSpeed()); // 100
// car.speed;  // FEHLER: protected — von aussen nicht zugaenglich
```

<!-- depth:vollstaendig -->
> **Experiment:** Markiere ein Feld als `private` und greife trotzdem
> via `(obj as any).feld` darauf zu. Dann markiere das gleiche Feld
> als `#feld` (mit Hash) und versuche dasselbe. Was passiert in beiden
> Faellen? Das demonstriert den Unterschied zwischen Compilezeit-Schutz
> und Laufzeit-Schutz.

> **Analogie:** `protected` ist wie ein Familiengeheimnis — alle
> Familienmitglieder (Subklassen) kennen es, aber Aussenstehende nicht.

<!-- /depth -->

---

## readonly: Einmal setzen, nie aendern

<!-- section:summary -->
`readonly` verhindert Aenderungen nach der Initialisierung — kombinierbar mit anderen Modifiern fuer unveraenderliche Werte wie IDs und Konfigurationen.
<!-- depth:standard -->
`readonly` verhindert, dass ein Feld nach der Initialisierung
geaendert wird. Das ist besonders nuetzlich fuer IDs, Konfigurationen
und andere Werte, die sich nie aendern sollen.

```typescript annotated
class Config {
  readonly apiUrl: string;
  readonly maxRetries: number;
  readonly debug: boolean = false;
  // ^ Default-Wert + readonly: Kann nur im Constructor ueberschrieben werden.

  constructor(apiUrl: string, maxRetries: number = 3) {
    this.apiUrl = apiUrl;
    this.maxRetries = maxRetries;
    // ^ Im Constructor darf readonly gesetzt werden.
  }

  updateUrl(newUrl: string): void {
    // this.apiUrl = newUrl;
    // ^ FEHLER: Cannot assign to 'apiUrl' because it is a read-only property.
  }
}
```

Du kannst `readonly` mit anderen Modifiern kombinieren:

```typescript
class User {
  private readonly id: string;        // Nur in der Klasse lesbar, nie aenderbar
  protected readonly role: string;    // In Subklassen lesbar, nie aenderbar
  public readonly createdAt: Date;    // Von aussen lesbar, nie aenderbar

  constructor(id: string, role: string) {
    this.id = id;
    this.role = role;
    this.createdAt = new Date();
  }
}
```

<!-- /depth -->

---

## Getter und Setter: Kontrollierter Zugriff

<!-- section:summary -->
Getter und Setter mit `get`/`set`-Syntax sind Methoden die wie Properties aussehen — ideal fuer Validierung bei Aenderungen und berechnete Werte.
<!-- depth:standard -->
TypeScript unterstuetzt **Getter** und **Setter** mit der
`get`/`set`-Syntax. Das sind Methoden, die wie Properties aussehen —
ideal fuer Validierung oder berechnete Werte:

```typescript annotated
class Temperature {
  private _celsius: number;
  // ^ Konvention: Unterstrich fuer das private Backing-Feld

  constructor(celsius: number) {
    this._celsius = celsius;
  }

  get celsius(): number {
    return this._celsius;
    // ^ Getter: Wird wie ein Property gelesen (temp.celsius)
  }

  set celsius(value: number) {
    if (value < -273.15) {
      throw new Error("Unter absolutem Nullpunkt!");
    }
    this._celsius = value;
    // ^ Setter: Validierung bei jeder Aenderung
  }

  get fahrenheit(): number {
    return this._celsius * 9/5 + 32;
    // ^ Berechnetes Property: Kein eigenes Feld noetig
  }
}

const temp = new Temperature(20);
console.log(temp.celsius);    // 20 (ruft den Getter auf)
console.log(temp.fahrenheit); // 68 (berechneter Wert)
temp.celsius = 100;           // OK (ruft den Setter auf)
// temp.celsius = -300;       // Error: Unter absolutem Nullpunkt!
```

<!-- depth:vollstaendig -->
> **Analogie:** Getter/Setter sind wie ein Concierge: Du fragst einfach
> nach dem Zimmerservice (Getter), und er liefert — aber er prueft auch
> ob du ueberhaupt im Hotel bist (Setter-Validierung).

> **Framework-Referenz (Angular):** In Angular-Services nutzt du
> `private` fuer interne Logik und Getter fuer die oeffentliche API:
>
> ```typescript
> @Injectable({ providedIn: 'root' })
> class AuthService {
>   private token: string | null = null;
>   readonly isLoggedIn$ = new BehaviorSubject(false);
>
>   get currentUser(): User | null { ... }  // Berechneter Wert
>   set token(value: string) { ... }        // Mit Validierung
> }
> ```

<!-- /depth -->

---

## Zusammenfassung: Wann welchen Modifier?

| Situation | Modifier | Grund |
|---|---|---|
| API fuer externe Nutzer | `public` (default) | Muss zugaenglich sein |
| Internes Implementierungsdetail | `private` | Versteckt vor Konsumenten |
| Template fuer Subklassen | `protected` | Erweiterbar, aber nicht oeffentlich |
| Unveraenderliche Werte | `readonly` | Schutz vor versehentlicher Aenderung |
| Echte Laufzeit-Kapselung | `#private` | Wenn `as any`-Schutz noetig ist |

---

## Was du gelernt hast

- **public** ist der Default-Modifier — alles ohne Modifier ist oeffentlich
- **private** ist ein Compilezeit-Schutz (Type Erasure!) — zur Laufzeit
  kann jeder mit `as any` darauf zugreifen
- **#private** (ES2022) ist echte Laufzeit-Kapselung — nicht umgehbar
- **protected** erlaubt Zugriff in Subklassen, aber nicht von aussen
- **readonly** verhindert Aenderungen nach der Initialisierung
- **Getter/Setter** ermoeglichen Validierung und berechnete Properties

> **Erklaere dir selbst:** Wenn du einen Angular-Service schreibst, wann
> wuerdest du `private` verwenden und wann `#private`? Was sind die Vor-
> und Nachteile fuer Unit-Tests?
>
> **Kernpunkte:** `private` ist testfreundlicher (mit `as any` testbar) |
> `#private` ist sicherer, aber schwerer zu testen |
> In Angular-Projekten reicht `private` fast immer |
> `#private` nur bei echten Sicherheitsanforderungen

**Kernkonzept zum Merken:** TypeScript's `private` ist ein Versprechen,
kein Zaun. JavaScript's `#private` ist ein Zaun. Wisse, welches du brauchst.

---

> **Pausenpunkt** -- Guter Moment fuer eine Pause. Du verstehst jetzt,
> wie Access Modifiers funktionieren und warum `private` ≠ `#private`.
>
> Weiter geht es mit: [Sektion 03: Vererbung und Abstract Classes](./03-vererbung-und-abstract.md)
