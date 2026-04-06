# Sektion 6: Wann kein Pattern — YAGNI und Pattern-Overengineering

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [05 - SOLID mit TypeScript](./05-solid-mit-typescript.md)
> Naechste Sektion: — (Ende der Lektion)

---

## Was du hier lernst

- Warum zu viele Patterns ein **Zeichen von schlechtem Design** sind — nicht von gutem
- Was **YAGNI** (You Ain't Gonna Need It) konkret bedeutet und wann es gilt
- Die **Rule of Three** — wann du wirklich abstrahieren solltest
- Signale, die dir sagen: *jetzt* brauche ich ein Pattern

---

## Hintergrund: Die Reaktion auf Overengineering

Ende der 1990er geschah etwas Merkwuerdiges in der Softwareentwicklung. Das GoF-Buch war
erschienen. Enterprise-Software explodierte. Und mit ihr eine neue Religion: Patterns
fuer alles. Factories fuer Factories. Abstract Factories fuer Abstract Factories.
Strategie-Objekte mit einer einzigen Implementierung.

David Heinemeier Hansson (DHH), der Schöpfer von Ruby on Rails, beobachtete das mit
wachsendem Entsetzen. In einem legendaeren Vortrag 2014 sprach er von "Test-Induced Design
Damage" — Code der so ueber-abstrahiert war, dass er fuer Maschinen optimiert wurde
statt fuer Menschen. "Primitive Obsession" nannte er das Gegenproblem: String-Typen fuer
Email-Adressen, Integer-Typen fuer Money-Betraege.

Zur selben Zeit formulierten die Agile-Pioneers das **YAGNI-Prinzip**: "You Ain't Gonna
Need It." Schreibe keinen Code fuer Anforderungen, die du noch nicht hast. Abstrahiere
nicht fuer Flexibilitaet, die du nie nutzen wirst.

Das ist kein Aufruf zu schlechtem Code. Es ist ein Aufruf zu *echtem* gutem Code:
Code der die heutigen Probleme loest, ohne die zukuenftigen Probleme zu erfinden.

> 🧠 **Erklaere dir selbst:** Was ist der Unterschied zwischen schlechtem Code der einfach
> ist und gutem Code der einfach ist? Wie erkennst du den Unterschied?
> **Kernpunkte:** Guter einfacher Code ist klar in seiner Absicht |
> Schlechter einfacher Code loest das Problem nicht vollstaendig |
> Komplexitaet die ein Problem loest ist OK |
> Komplexitaet die kein Problem loest ist immer schlecht

---

## Pattern-Fetishismus in der Praxis

Hier ist ein Beispiel, das du vielleicht aus echten Projekten kennst. Es ist nicht
erfunden — so sieht ueber-abstrahierter Code tatsaechlich aus:

```typescript annotated
// OVERKILL: Design Pattern-Orgie fuer eine simple Funktion
interface FormattingStrategy {
  execute(input: string): string;
}

interface Formatter<TInput, TOutput> {
  format(input: TInput): TOutput;
}

abstract class AbstractUserNameFormatter
  implements Formatter<UserName, FormattedUserName> {
  protected abstract strategy: FormattingStrategy;
  abstract format(name: UserName): FormattedUserName;
}

// Jetzt brauchen wir noch eine Factory...
interface FormatterFactory<T extends Formatter<unknown, unknown>> {
  create(): T;
}

class UserNameFormatterFactory implements FormatterFactory<AbstractUserNameFormatter> {
  constructor(
    @Inject(FORMATTING_STRATEGY_TOKEN) private readonly strategy: FormattingStrategy,
  ) {}
  create(): AbstractUserNameFormatter {
    return new ConcreteUserNameFormatter(this.strategy);
  }
}

// 6 Klassen, 3 Interfaces, 2 abstrakten Basisklassen...
// ...fuer das hier:
const formatUserName = (name: string): string => name.trim().toLowerCase();
// ^ Eine Funktion. Drei Woerter. Loest dasselbe Problem.
```

Die obere Variante wurde wirklich geschrieben. In echten Projekten. Von erfahrenen
Entwicklern die SOLID-Prinzipien kannten und anwenden wollten. Das Problem: Sie
haben "moeglicherweise noetige Flexibilitaet" fuer eine Funktion vorbereitet, die
sich seit drei Jahren nicht geaendert hat und sich wahrscheinlich nie aendern wird.

> 💭 **Denkfrage:** Welche drei Fragen solltest du dir stellen, bevor du ein Pattern
> einfuehrst? Denke nach, bevor du weiterliest.
>
> **Antwort:**
> 1. Habe ich diesen Code mindestens dreimal fast identisch geschrieben (Rule of Three)?
> 2. Brauche ich diese Flexibilitaet konkret heute — oder nur theoretisch?
> 3. Kann ich diesen Code nach dem Refactoring noch in 2 Minuten erklaeren?

---

## Die Rule of Three

Kent Beck formulierte sie zuerst: Das erste Mal — schreib es direkt. Das zweite Mal —
schreib es wieder (Duplikation bemerken). Das dritte Mal — jetzt abstrahiere.

```typescript annotated
// Erste Verwendung: direkt schreiben
async function getUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  return data;
}

// Zweite Verwendung: Du bemerks das Muster
async function getOrder(id: string) {
  const response = await fetch(`/api/orders/${id}`);
  const data = await response.json();
  return data;
}

// Dritte Verwendung: JETZT abstrahieren — du weisst was sich wirklich wiederholt
async function fetchById<T>(endpoint: string, id: string): Promise<T> {
  const response = await fetch(`/api/${endpoint}/${id}`);
  // ^ T macht es generisch: fetchById<User>('users', id)
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${endpoint}/${id}`);
  return response.json() as Promise<T>;
}

// Jetzt koennen getUser und getOrder idiomatisch formuliert werden:
const getUser = (id: string) => fetchById<User>('users', id);
const getOrder = (id: string) => fetchById<Order>('orders', id);
const getProduct = (id: string) => fetchById<Product>('products', id);
// ^ Dritte Verwendung bestaetigt: die Abstraktion war richtig

// Erkennst du das Muster? fetchById ist eine Factory-Funktion —
// aber erst bei der DRITTEN Verwendung gerechtfertigt
```

---

## Signale: Wann ist ein Pattern sinnvoll?

TypeScript gibt dir gute Hinweise, wann eine Abstraktion sich lohnt:

```typescript annotated
// Signal 1: Drei oder mehr fast-identische Implementierungen
// Vor der Abstraktion:
class EmailNotifier    { send(msg: Message): void { /* http fetch */ } }
class SMSNotifier      { send(msg: Message): void { /* twilio api */ } }
class PushNotifier     { send(msg: Message): void { /* firebase */ } }
// Drei Implementierungen, alle haben send(Message) -> Zeit fuer Interface!
interface Notifier { send(message: Message): Promise<void>; }

// Signal 2: Du brauchst einen Test-Mock
// Wenn du fuer Tests schreiben musst: jest.mock('../services/UserService')
// ... dann ist das ein Zeichen: du brauchst ein Interface und DI
// Nicht: du brauchst jest.mock()!

// Signal 3: Du verletzt Open/Closed (immer mehr if-else oder switch)
function handlePayment(type: string): void {
  if (type === 'stripe') { /* ... */ }
  else if (type === 'paypal') { /* ... */ }
  else if (type === 'klarna') { /* ... */ }
  // Fuenfte Methode? Das ist das Open/Closed-Warnsignal
  // -> Jetzt ist Strategy Pattern gerechtfertigt
}

// Signal 4: Die Compile-Fehler zeigen dir den Weg
// Wenn du einen neuen Logger-Typ hinzufuegst und der Compiler dir sagt:
// "switch is not exhaustive — missing case 'file'"
// ... dann arbeitet der Compiler fuer dich. Das Pattern zahlt sich aus.
```

---

## TypeScript's strukturelles Typsystem: Komposition statt Vererbung

Ein letztes, wichtiges Konzept: TypeScript's strukturelles Typsystem macht Komposition
viel natuerlicher als in Java. Statt Vererbungshierarchien kann man Typen zusammensetzen.

```typescript annotated
// Java-Denkweise in TypeScript (VERMEIDEN):
abstract class Animal {
  abstract makeSound(): string;
  move(): string { return 'moving'; }
}
class Dog extends Animal {
  makeSound() { return 'Woof'; }
}
class Cat extends Animal {
  makeSound() { return 'Meow'; }
}
// Was ist mit einem fliegenden Fisch? extends Animal AND extends Fish?
// Java: Geht nicht. TypeScript: Auch nicht mit Klassen.

// TypeScript-Denkweise: Komposition mit Interfaces und Intersection
interface Swimmable   { swim(): void; }
interface Flyable     { fly(): void; }
interface SoundMaking { makeSound(): string; }

// Typaliase kombinieren Faehigkeiten frei:
type Duck = Swimmable & Flyable & SoundMaking;
type FlyingFish = Swimmable & Flyable;

// Implementierungen mit freien Funktionen (keine Klassenh ierarchie noetig):
const duckBehavior: Duck = {
  swim: () => console.log('platsch'),
  fly:  () => console.log('flatter'),
  makeSound: () => 'Quak',
};
// ^ Das strukturelle Typsystem prueft: Hat das Objekt swim, fly, makeSound?
// Kein extends noetig — das ist Duck-Typing mit Typsicherheit

// Wann Klassen doch sinnvoll sind:
// 1. Du brauchst Konstruktor-Logik und Instanz-State
// 2. Du willst private Properties und Methoden
// 3. Du arbeitest mit Angular DI (das erwartet Klassen)
// Alles andere: Interfaces + Typalias + Objekt-Literale
```

> ⚡ **Angular- und React-Bezug:** In Angular brauchst du Klassen fuer Services,
> Components und Directives — das Framework erfordert es. In React sind Klassen
> optional (seit Hooks) und werden zunehmend seltener verwendet. TypeScript-Interfaces
> funktionieren in beiden Welten hervorragend fuer Props-Typen und Service-Contracts.

---

## Experiment-Box: Pattern-Overengineering erkennen und vereinfachen

```typescript
// Aufgabe: Vereinfache diesen Code ohne Funktionalitaet zu verlieren.
// Wie viele Patterns kannst du entfernen?

interface CurrencyFormatter {
  format(amount: number): string;
}

class EuroFormatterStrategy implements CurrencyFormatter {
  format(amount: number): string {
    return `${amount.toFixed(2)} EUR`;
  }
}

class USDFormatterStrategy implements CurrencyFormatter {
  format(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }
}

class FormatterFactory {
  static create(currency: 'EUR' | 'USD'): CurrencyFormatter {
    if (currency === 'EUR') return new EuroFormatterStrategy();
    if (currency === 'USD') return new USDFormatterStrategy();
    throw new Error('Unknown currency');
  }
}

class PriceDisplay {
  private formatter: CurrencyFormatter;
  constructor(currency: 'EUR' | 'USD') {
    this.formatter = FormatterFactory.create(currency);
  }
  display(amount: number): string {
    return this.formatter.format(amount);
  }
}

// Verwendung:
const display = new PriceDisplay('EUR');
display.display(99.99);  // "99.99 EUR"

// --- VEREINFACHT (kein Verlust an Typsicherheit): ---
const formatCurrency = (amount: number, currency: 'EUR' | 'USD'): string =>
  currency === 'EUR' ? `${amount.toFixed(2)} EUR` : `$${amount.toFixed(2)}`;

formatCurrency(99.99, 'EUR');  // "99.99 EUR"
// Eine Funktion. 3 Zeilen. Vollstaendig typsicher. Kein Pattern.
// Erweiterbar WENN noetig: einfach cases hinzufuegen.
// YAGNI: Warten bis drei Waehrungen benoetigt werden — DANN Strategy Pattern.
```

---

## Was du gelernt hast

- **Pattern-Overengineering** ist ein echtes Problem — mehr Abstraktionen bedeuten mehr
  Komplexitaet, nicht weniger
- **YAGNI** (You Ain't Gonna Need It) bedeutet: Schreibe Code fuer heutige Probleme,
  nicht fuer moegliche zukuenftige Anforderungen
- **Rule of Three**: Erst beim dritten fast-identischen Code-Block abstrahieren —
  nicht frueher
- **Signale fuer echte Patterns**: Drei Implementierungen, Test-Mock noetig,
  Open/Closed-Verletzung, exhaustive Compile-Fehler
- TypeScript's strukturelles Typsystem macht **Komposition** oft eleganter als
  Vererbungshierarchien

**Kernkonzept:** Das beste Pattern ist oft kein Pattern. Eine klare Funktion die ein
konkretes Problem loest ist wertvoller als sechs Klassen die ein abstraktes Problem
vorbereiten. Warte auf den dritten Fall, dann abstrahiere — und nicht frueher.

> 🧠 **Erklaere dir selbst:** Du bekommst eine Aufgabe: "Baue ein erweiterbares
> Logging-System." Wie entscheidest du, ob du sofort ein Strategy-Pattern baust
> oder ob du erst direkt anfaengst?
> **Kernpunkte:** Wieviele konkrete Logging-Ziele gibt es heute? |
> Wie wahrscheinlich sind weitere? (Konkret, nicht spekulativ) |
> Koennte eine einfache Funktion mit switch genuegen? |
> Rule of Three: erst bei drei Implementierungen abstrahieren

---

> **Pausenpunkt** — Das war die letzte Sektion dieser Lektion. Du hast nicht nur
> gelernt, wann man Patterns einsetzt — sondern auch wann man es laesst. Das ist
> genauso wichtig.
>
> Zeit fuer das Quiz! Es testet alle sechs Sektionen.
