# Sektion 5: SOLID mit TypeScript

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Repository und Data Access](./04-repository-und-data-access.md)
> Naechste Sektion: [06 - Wann kein Pattern](./06-wann-kein-pattern.md)

---

## Was du hier lernst

- Was **SOLID** bedeutet — und warum es in TypeScript praeziser formuliert werden kann als in Java
- Wie TypeScript **Liskov Substitution automatisch prueft** wenn du `implements` verwendest
- Wie Angular's Dependency Injection das "D" in SOLID buchstaeblich implementiert
- Welche SOLID-Prinzipien oft falsch angewandt werden — und wann weniger mehr ist

---

## Hintergrund: Die fuenf Prinzipien und ihr Erfinder

2002 fasste Robert C. Martin ("Uncle Bob") fuenf Designprinzipien zusammen, die er in
den vorherigen Jahrzehnten aus guten (und schlechten) Codebases extrahiert hatte. Das
Akronym SOLID stammt von Michael Feathers, der es aus Martins Prinzipien bildete.

Die Prinzipien wurden fuer eine Welt ohne Generics, ohne strukturelle Typsysteme, ohne
Union Types formuliert. Java und C++ waren die Zielsprachen. Das fuehrte zu einer
bestimmten Denkweise: Alles ist eine Klasse, alles braucht ein Interface, alles ist
hierarchisch.

In TypeScript gilt das nur zum Teil. TypeScript hat strukturelles Typing — wenn deine
Klasse die richtigen Methoden hat, *ist* sie das Interface, egal wie sie heisst.
TypeScript hat Generics, die das Open/Closed-Prinzip oft ohne Vererbungshierarchien
ermoeglicht. Und TypeScript 5.5 hat Inferred Type Predicates, die Liskov-konforme
Filteroperationen idiomatischer machen.

Die SOLID-Prinzipien sind weiterhin wertvoll. Aber in TypeScript sehen ihre
Implementierungen oft anders aus als im Java-Lehrbuch.

> 🧠 **Erklaere dir selbst:** Was bedeutet "strukturelles Typsystem" im Kontext von
> SOLID? Wie aendert das die Art, wie wir Interfaces und Klassen designen?
> **Kernpunkte:** Strukturell = Shape-basiert, nicht Name-basiert |
> Kein explizites implements noetig fuer duck typing |
> Interface Segregation wird einfacher |
> Liskov wird automatisch durch den Compiler geprueft

---

## S — Single Responsibility Principle

Eine Klasse soll genau einen Grund zur Aenderung haben. In der Praxis bedeutet das:
Wenn du eine Klasse aenderst, weil sich die Businesslogik aendert UND weil sich die
Datenbankstruktur aendert — dann hat sie zwei Verantwortlichkeiten.

```typescript annotated
// SCHLECHT: Eine UserService-Klasse macht alles
class UserServiceAllesInEins {
  constructor(private db: Database, private emailClient: EmailClient) {}

  async login(email: string, password: string): Promise<User> {
    const user = await this.db.query('SELECT * FROM users WHERE email = ?', email);
    // ^ Datenbankzugriff direkt in der Service-Klasse
    if (!this.verifyPassword(password, user.passwordHash)) throw new Error('Unauthorized');
    await this.emailClient.send(user.email, 'Willkommen!');
    // ^ E-Mail-Logik auch hier — fuenf verschiedene Gruende zur Aenderung!
    return user;
  }
  // Wenn sich die DB-Struktur aendert -> diese Klasse aendern
  // Wenn sich die E-Mail-Templates aendern -> diese Klasse aendern
  // Wenn sich die Auth-Logik aendert -> diese Klasse aendern
}

// BESSER: Separate Klassen mit klaren Verantwortlichkeiten
class UserAuthService {
  // ^ Verantwortung: Authentifizierung (login, logout, resetPassword)
  constructor(
    private readonly userRepository: Repository<User>,
    private readonly passwordHasher: PasswordHasher,
    // ^ Abhaengigkeiten als Interfaces — nicht als konkrete Klassen (D!)
  ) {}

  async login(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new AuthError('Benutzer nicht gefunden');
    if (!await this.passwordHasher.verify(password, user.passwordHash)) {
      throw new AuthError('Falsches Passwort');
    }
    return user;
    // KEINE E-Mail-Logik hier — das ist eine andere Verantwortung
  }
}

class UserNotificationService {
  // ^ Verantwortung: Benachrichtigungen (sendWelcome, sendPasswordReset)
  constructor(private readonly emailClient: EmailClient) {}

  async sendWelcome(user: User): Promise<void> {
    await this.emailClient.send({
      to: user.email,
      subject: 'Willkommen!',
      template: 'welcome',
      data: { name: user.name },
    });
  }
}
```

---

## O — Open/Closed Principle

Software-Entitaeten sollen offen fuer Erweiterung, aber geschlossen fuer Modifikation sein.
TypeScript-Generics machen das eleganter als Vererbungshierarchien.

```typescript annotated
// Discount-Hierarchie — erweiterbar ohne bestehenden Code zu aendern
interface DiscountStrategy {
  apply(originalPrice: number): number;
  readonly description: string;
}

class PercentageDiscount implements DiscountStrategy {
  readonly description: string;
  constructor(private readonly percent: number) {
    this.description = `${percent}% Rabatt`;
  }
  apply(price: number): number {
    return price * (1 - this.percent / 100);
  }
}

class FixedAmountDiscount implements DiscountStrategy {
  readonly description: string;
  constructor(private readonly amount: number) {
    this.description = `${amount}€ Rabatt`;
  }
  apply(price: number): number {
    return Math.max(0, price - this.amount);
    // ^ Preis kann nicht negativ werden
  }
}

// OrderCalculator ist geschlossen fuer Modifikation — egal wie viele Discounts du hinzufuegst
class OrderCalculator {
  calculateTotal(items: CartItem[], discounts: DiscountStrategy[]): number {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return discounts.reduce((price, discount) => discount.apply(price), subtotal);
    // ^ reduce() ueber alle Discounts — neuer Discount braucht nur DiscountStrategy zu implementieren
  }
}

// Neuer Discount hinzufuegen — KEINE Aenderung in OrderCalculator!
class BuyTwoGetOneFreeDiscount implements DiscountStrategy {
  readonly description = 'Kaufe 2, bekomme 1 gratis';
  apply(price: number): number { /* ... */ return price; }
}
// OrderCalculator.calculateTotal([...], [new BuyTwoGetOneFreeDiscount()])
// Funktioniert sofort — kein if/switch, keine Aenderung im Calculator
```

---

## L — Liskov Substitution Principle

Eine Unterklasse muss ueberall verwendbar sein, wo die Basisklasse verwendet wird —
**ohne dass sich das Verhalten unerwartet aendert**.

> **Wichtig:** TypeScript prueft mit `implements` nur die **strukturelle
> Kompatibilitaet** (alle Methoden mit korrekten Signaturen vorhanden).
> Es prueft NICHT die **behaviorale Korrektheit**:
> - Staerkere Vorbedingungen in der Unterklasse (z.B. "width muss > 0 sein")
> - Schwaechere Nachbedingungen (z.B. "area() kann negativ zurueckgeben")
> - Verletzung von Invarianten (z.B. "ein Rectangle das nach area()-Aufruf
>   seine Dimensionen aendert")
>
> Diese Liskov-Verletzungen sind **Laufzeit-Probleme** die TypeScript NICHT
> erkennen kann. Der Compiler gibt dir ein falsches Sicherheitsgefuehl.

```typescript annotated
interface Shape {
  area(): number;
  perimeter(): number;
}

// KORREKTE Implementierungen — erfuellen Liskov:
class Circle implements Shape {
  constructor(private readonly radius: number) {}
  area(): number { return Math.PI * this.radius ** 2; }
  perimeter(): number { return 2 * Math.PI * this.radius; }
}

class Rectangle implements Shape {
  constructor(private readonly width: number, private readonly height: number) {}
  area(): number { return this.width * this.height; }
  perimeter(): number { return 2 * (this.width + this.height); }
}

// Diese Funktion arbeitet mit JEDEM Shape:
function printShapeInfo(shape: Shape): void {
  console.log(`Flaeche: ${shape.area().toFixed(2)}`);
  console.log(`Umfang: ${shape.perimeter().toFixed(2)}`);
}
```

> **Das klassische Liskov-Beispiel was TypeScript NICHT erkennt:**
> ```typescript
> interface Rectangle {
>   setWidth(w: number): void;
>   setHeight(h: number): void;
>   area(): number;
> }
>
> class Square implements Rectangle {
>   private side: number;
>   constructor(side: number) { this.side = side; }
>   setWidth(w: number) { this.side = w; }
>   setHeight(h: number) { this.side = h; } // Aendert AUCH width!
>   area(): number { return this.side ** 2; }
> }
> // TypeScript: KEIN FEHLER — alle Signaturen stimmen.
> // Liskov-Verletzung: setWidth() aendert implizit auch height!
> // Ein Client der r.setWidth(5); r.setHeight(3); erwartet
> // area() === 15, aber Square liefert 9.
> ```
>
> **Faustregel:** `implements` garantiert nur dass die Methoden existieren.
> Dass sie sich *korrekt* verhalten, liegt in deiner Verantwortung.

---

## I — Interface Segregation Principle

Viele kleine, spezifische Interfaces sind besser als ein grosses "Fettes" Interface.
Clients sollen nicht von Methoden abhaengen, die sie nicht verwenden.

```typescript annotated
// SCHLECHT: Ein riesiges Interface — nicht alle implementierenden Klassen brauchen alles
interface UserOperations {
  read(): Promise<User>;
  write(user: User): Promise<void>;
  delete(id: string): Promise<void>;
  exportToCsv(): string;        // Wirklich? Jede Implementierung muss das haben?
  sendNotification(): void;     // Das gehoert nicht hierher!
}

// BESSER: Segregierte Interfaces
interface Readable<T> { findById(id: string): Promise<T | null>; }
interface Writable<T> { save(entity: T): Promise<T>; }
interface Deletable    { delete(id: string): Promise<void>; }

// Combination nur wenn noetig:
interface ReadWriteRepository<T> extends Readable<T>, Writable<T>, Deletable {}
// ^ Lese-schreib-loesh-Repository — nur wo beides benoetigt wird

// Read-Only-Repository: Cache, Read-Replika, Reporting
interface ReadOnlyUserRepository extends Readable<User> {}
// Diese Implementierung braucht KEIN save() oder delete()!

// TypeScript erlaubt Intersection fuer flexible Zusammensetzung:
type AdminRepository = Repository<User> & { exportToCsv(): string };
// ^ Nur Admin-Services bekommen exportToCsv — andere arbeiten mit Repository<User>
```

---

## D — Dependency Inversion Principle

High-Level-Module sollen nicht von Low-Level-Modulen abhaengen. Beide sollen von
Abstraktionen abhaengen. Angular's DI-System ist das Dependency Inversion Principle
in Action.

```typescript annotated
// SCHLECHT: Direkte Abhaengigkeit von konkreter Implementierung
class ReportService {
  private readonly db = new PostgresDatabase();
  // ^ High-Level (ReportService) haengt von Low-Level (PostgresDatabase) ab
  // Kein Mock moeglich, kein Test ohne echte DB, kein Austausch ohne Code-Aenderung
}

// GUT: Abhaengigkeit von Abstraktion
interface Database {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<void>;
}

class ReportService {
  constructor(private readonly db: Database) {}
  // ^ Haengt von der Abstraktion ab — kann PostgresDatabase, InMemoryDatabase, MockDatabase sein

  async generateMonthlyReport(month: number, year: number): Promise<Report> {
    const orders = await this.db.query<Order>(
      'SELECT * FROM orders WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?',
      [month, year],
    );
    return this.calculateReport(orders);
  }
}

// Angular macht DI idiomatisch — das 'D' in SOLID als Framework-Feature:
const DATABASE_TOKEN = new InjectionToken<Database>('Database');

// Im Modul: Konvention ueber Konfiguration
@NgModule({
  providers: [
    { provide: DATABASE_TOKEN, useClass: PostgresDatabase },
    // ^ In Tests: useClass: InMemoryDatabase — KEIN Code-Aenderung in ReportService
  ],
})
class AppModule {}

@Injectable()
class ReportService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}
  // ^ inject(DATABASE_TOKEN) statt inject(PostgresDatabase) — Abstraktion, nicht Konkretisierung
}
```

> ⚡ **Angular-Bezug:** `inject(DATABASE_TOKEN)` statt `inject(PostgresDatabase)` ist
> buchstaeblich das D in SOLID. Angular's `InjectionToken` ist das Interface, das
> High-Level und Low-Level trennt. In deinen Unit-Tests kannst du einfach einen anderen
> Provider registrieren — ohne den Service zu aendern.

---

## Experiment-Box: SOLID-Verletzungen erkennen

```typescript
// Finde alle SOLID-Verletzungen in diesem Code:
class UserController {
  private readonly db = new MySQLConnection('localhost', 'user', 'password', 'myapp');

  async createUser(req: Request): Promise<Response> {
    const data = req.body;
    if (!data.email || !data.email.includes('@')) {
      return { status: 400, body: 'Invalid email' };
    }
    const passwordHash = await bcrypt.hash(data.password, 10);
    await this.db.execute(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [data.email, passwordHash],
    );
    await fetch('https://email-service.example.com/send', {
      method: 'POST',
      body: JSON.stringify({ to: data.email, subject: 'Welcome!' }),
    });
    return { status: 201, body: 'Created' };
  }
}

// Antwort: Alle 5 Prinzipien verletzt!
// S: Controller macht Validierung, Hashing, DB-Zugriff UND E-Mail-Versand
// O: Neue Validierungsregeln erfordern Aenderung in diesem Code
// L: Kein Interface, keine Austauschbarkeit
// I: Keine getrennten Abstraktionen fuer Lesen/Schreiben
// D: new MySQLConnection() direkt im Controller — konkrete Implementierung!
```

---

## Was du gelernt hast

- **S** — Eine Klasse, ein Grund zur Aenderung: trenne Auth, Profil, Benachrichtigung
- **O** — Erweiterbar ohne Modifikation: Strategy Pattern als TypeScript-Interface
- **L** — TypeScript prueft Liskov automatisch bei `implements` — falsche Signaturen -> Compile-Fehler
- **I** — Viele kleine Interfaces sind besser als ein fettes: `Readable<T>`, `Writable<T>`, `Deletable`
- **D** — Angular's DI-System *ist* das D in SOLID: `InjectionToken` statt konkrete Klasse

**Kernkonzept:** SOLID-Prinzipien sind keine Regeln, die du blind befolgst — sie sind
Heuristiken fuer den Schmerz der Aenderbarkeit. Wenn du dich fragst "Kann ich das leicht
testen?" und "Kann ich das leicht aendern?" — bist du auf dem richtigen Weg.

> 🧠 **Erklaere dir selbst:** Welches SOLID-Prinzip haengt am staerksten mit Testbarkeit
> zusammen? Warum ist Testbarkeit ein guter Indikator fuer SOLID-Konformitaet?
> **Kernpunkte:** D (Dependency Inversion) macht Mocking moeglich |
> S (Single Responsibility) macht Tests klein und fokussiert |
> Schwer zu testen = Schlechtes Design-Signal |
> "If it's hard to test, it's hard to change"

---

> **Pausenpunkt** — SOLID ist kein Dogma, aber ein nuetzliches Werkzeug.
> TypeScript prueft L automatisch, Angular implementiert D buchstaeblich.
>
> Weiter geht es mit: [Sektion 06: Wann kein Pattern](./06-wann-kein-pattern.md)
