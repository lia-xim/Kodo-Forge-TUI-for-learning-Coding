# Sektion 6: Praxis — Code-Review-Checkliste und Refactoring-Patterns

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [05 - Defensive vs Offensive Typing](./05-defensive-vs-offensive-typing.md)
> Naechste Sektion: [Lektion 40 - Capstone Project](../../40-capstone-project/sections/01-projekt-ueberblick.md)

---

## Was du hier lernst

- Eine **Code-Review-Checkliste** fuer TypeScript die du ab morgen verwenden kannst
- **5 Refactoring-Patterns** die TypeScript-Code sofort verbessern
- Wie man TypeScript-Qualitaet **messbar** macht
- Das Ergebnis von 39 Lektionen: Dein persoenlicher Typ-Stil

---

## Die Code-Review-Checkliste

Diese Checkliste hat eine Besonderheit: Sie erklaert nicht nur was,
sondern auch **warum**. Jeder Pruefpunkt ist mit einem konkreten
Schadensbild verknuepft. Das macht den Unterschied zwischen "Ich
weiss dass ich das pruefe" und "Ich weiss warum ich das pruefe."

Drucke diese Liste aus und haenge sie neben deinen Monitor. Bei
jedem Code Review pruefst du diese Punkte:

### Kategorie 1: Typsicherheit

| # | Pruefpunkt | Red Flag | Schaden wenn ignoriert | Fix |
|---|-----------|----------|----------------------|-----|
| 1 | Gibt es `any`? | Jedes `any` ohne Kommentar | any-Drift durch den Code | `unknown` + Type Guard |
| 2 | Gibt es `as`? | `as` bei externen Daten | Stiller Crash wenn API sich aendert | Runtime-Validierung |
| 3 | Gibt es `!`? | Non-null Assertion bei optionalem Wert | TypeError in Production bei unerwartetem null | Optional Chaining `?.` |
| 4 | Sind switch-Statements exhaustive? | Fehlender `default: never` | Neuer Status wird still ignoriert | Exhaustive Check hinzufuegen |
| 5 | Haben oeffentliche Funktionen Return Types? | Kein expliziter Return Type | Refactoring aendert Return-Typ unbemerkt | Expliziten Typ hinzufuegen |

### Kategorie 2: Architektur

| # | Pruefpunkt | Red Flag | Schaden wenn ignoriert | Fix |
|---|-----------|----------|----------------------|-----|
| 6 | Sind Systemgrenzen validiert? | `JSON.parse()` ohne Validierung | Unerwartete Daten crashen die App | Zod/Type Guard |
| 7 | Sind IDs typsicher? | `userId: string` statt Branded Type | `userId` und `orderId` werden vertauscht | Branded Type einfuehren |
| 8 | Ist State eine Discriminated Union? | Boolean-Flags (`isLoading && isError`) | Unmoegliche Zustaende moeglich (isLoading+isError) | DU refactoren |
| 9 | Sind Fehler im Typ sichtbar? | `throws` in JSDoc statt Return-Typ | Aufrufer vergisst Error-Handling | Result-Pattern |
| 10 | Sind Generics gerechtfertigt? | Generic mit nur einer Verwendung | Komplexitaet ohne Nutzen | `unknown` oder konkreter Typ |

### Kategorie 3: Wartbarkeit

| # | Pruefpunkt | Red Flag | Schaden wenn ignoriert | Fix |
|---|-----------|----------|----------------------|-----|
| 11 | Ist der Typ in 30s verstaendlich? | Verschachtelte Conditional Types | Neues Teammitglied braucht Stunden | Vereinfachen |
| 12 | Gibt es Typ-Duplikation? | Gleicher Typ in mehreren Dateien | Aenderung muss an N Stellen gemacht werden | Shared Types extrahieren |
| 13 | Ist `strict: true` aktiv? | `strict: false` oder fehlend | null-Bugs werden uebersehen | Aktivieren |
| 14 | Sind Barrel-Exports bewusst? | `index.ts` mit 50+ Re-Exports | Zirkulaere Abhaengigkeiten, langsame Builds | Direkte Imports |
| 15 | Gibt es `@ts-ignore`? | Jedes `@ts-ignore` ohne Begruendung | Versteckte Typ-Fehler akkumulieren | Typ-Fehler fixen |

> 📖 **Hintergrund: Warum Checklisten funktionieren**
>
> Atul Gawande beschrieb in "The Checklist Manifesto" (2009) wie
> Checklisten in der Chirurgie die Sterblichkeitsrate um 47% senkten.
> Das Prinzip gilt auch fuer Code: Nicht weil Entwickler die Regeln
> nicht kennen, sondern weil sie unter Zeitdruck vergessen sie
> anzuwenden. Eine Checkliste macht das Vergessen unmoeglich.
> Microsoft's TypeScript-Team nutzt intern eine aehnliche Liste
> fuer PRs in das TypeScript-Repository selbst.

---

## 5 Refactoring-Patterns

### Pattern 1: Boolean-Flags → Discriminated Union

```typescript annotated
// VORHER:
interface State {
  isLoading: boolean;
  isError: boolean;
  data: User[] | null;
  error: string | null;
}
// ^ 2^2 = 4 Kombinationen, davon 2 ungueltig

// NACHHER:
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: User[] }
  | { status: "error"; error: string };
// ^ Genau 4 gueltige Zustaende, kein ungueltiger moeglich
```

### Pattern 2: String-IDs → Branded Types

```typescript annotated
// VORHER:
function transfer(from: string, to: string, amount: number) {}
transfer(orderId, userId, price);  // OOPS! Argumente vertauscht
// ^ Kein Compile-Fehler — orderId und userId sind beide string

// NACHHER:
type AccountId = string & { __brand: "AccountId" };
type Amount = number & { __brand: "Amount" };

// Smart Constructor — der einzige Weg einen AccountId zu erstellen:
function accountId(raw: string): AccountId {
  if (raw.length === 0) throw new Error("AccountId must not be empty");
  return raw as AccountId;
}

function transfer(from: AccountId, to: AccountId, amount: Amount) {}

// transfer(orderId, userId, price);  // COMPILE-ERROR!
// ^ orderId ist OrderId, nicht AccountId
// ^ Verwechslung ist jetzt unmoeglich
```

### Pattern 3: Optional Chaining statt Non-null Assertion

```typescript annotated
// VORHER:
const name = user!.profile!.name!;
// ^ Drei Stellen die null sein koennten → Runtime-Crash

// NACHHER:
const name = user?.profile?.name ?? "Unbekannt";
// ^ Sicher: Falls null → Fallback
```

### Pattern 4: Overloads statt Union Return

```typescript annotated
// VORHER:
function parse(input: string): string | number {
  const num = Number(input);
  return isNaN(num) ? input : num;
}
const result = parse("42");  // string | number — unpraezise!

// NACHHER:
function parse(input: `${number}`): number;
function parse(input: string): string;
function parse(input: string): string | number {
  const num = Number(input);
  return isNaN(num) ? input : num;
}
const result = parse("42");  // number — praezise!
```

### Pattern 5: Index Signature → Record/Map

```typescript annotated
// VORHER:
interface Config {
  [key: string]: string;  // Alles erlaubt, nichts geprueft
}
config.tyypo;  // Kein Fehler — Tippfehler unbemerkt!

// NACHHER (wenn Keys bekannt):
interface Config {
  host: string;
  port: string;
  env: "development" | "staging" | "production";
  // ^ Noch praeziser: env ist keine beliebige string
}
// config.tyypo;  // FEHLER: Property 'tyypo' does not exist
// config.env = "prod";  // FEHLER: "prod" nicht in Union

// NACHHER (wenn Keys dynamisch aber endlich):
type Environment = "development" | "staging" | "production";
type FeatureFlags = Record<Environment, boolean>;
// ^ Besser als { [key: string]: boolean } — Keys sind typisiert

// NACHHER (wenn Keys wirklich beliebig):
const config = new Map<string, string>();
config.get("tyypo");  // Gibt string | undefined zurueck — sicherer
// ^ Map.get() gibt immer | undefined zurueck — erzwingt null-Handling
```

> 🧠 **Erklaere dir selbst:** Welches dieser 5 Patterns haette den
> groessten Impact in deinem aktuellen Projekt? Welches koenntest
> du morgen umsetzen?
> **Kernpunkte:** Boolean → DU hat den hoechsten Impact (verhindert
> unmoegliche Zustaende) | String → Branded ist am einfachsten
> umzusetzen (5 Zeilen) | Beide zusammen decken 80% der Verbesserungen |
> Pattern 5 (Index → Record) ist am haeufigsten in Legacy-Code

---

## Angular und React: Framework-spezifische Review-Punkte

In Framework-Code gibt es zus‌atzliche Punkte die allgemeine Tools
nicht kennen:

```typescript annotated
// Angular-spezifisch:

// SCHLECHTE Praxis: Component kennt HTTP-Details
@Component({ /* ... */ })
class UserComponent {
  users: any[] = [];  // any im Component-State

  constructor(private http: HttpClient) {
    this.http.get("/api/users").subscribe((data: any) => {
      this.users = data;  // any wird nicht validiert
    });
  }
}

// GUTE Praxis: Service kapselt Validierung, Component vertraut dem Typ
@Injectable({ providedIn: "root" })
class UserService {
  getUsers(): Observable<User[]> {
    return this.http.get<unknown>("/api/users").pipe(
      map(data => {
        if (!Array.isArray(data) || !data.every(isUser)) {
          throw new Error("Unexpected API response");
        }
        return data as User[];
        // ^ As ist hier akzeptabel: data.every(isUser) hat bereits bewiesen
        //   dass alle Elemente User sind
      })
    );
  }
}

@Component({ /* ... */ })
class UserComponent {
  users: User[] = [];  // Kein any — Component vertraut dem Service

  constructor(private userService: UserService) {
    this.userService.getUsers().subscribe(users => {
      this.users = users;  // Typsicher
    });
  }
}
```

```typescript annotated
// React-spezifisch:

// SCHLECHTE Praxis: Props ohne vollstaendige Typen
function UserCard({ user, onSelect }: any) {  // any bei Props!
  return <div onClick={() => onSelect(user)}>{user.name}</div>;
}

// GUTE Praxis: Praezise Props-Typen
interface UserCardProps {
  user: User;
  onSelect: (user: User) => void;
  // ^ onSelect nimmt User entgegen — nicht any, nicht id: string
}

function UserCard({ user, onSelect }: UserCardProps) {
  return <div onClick={() => onSelect(user)}>{user.name}</div>;
  // ^ TypeScript prueft ob onSelect die richtige Signatur hat
}

// Custom Hook mit explizitem Return Type:
interface UseUsersResult {
  users: User[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

function useUsers(): UseUsersResult {
  // ^ Expliziter Return Type — Vertrag fuer alle Consumer
  const [state, setState] = useState<{
    users: User[];
    isLoading: boolean;
    error: Error | null;
  }>({ users: [], isLoading: true, error: null });

  // ...
  return { ...state, refetch: () => { /* ... */ } };
}
```

## TypeScript-Qualitaet messen

> ⚡ **Framework-Bezug:** In Angular-Projekten mit Nx gibt es den
> `nx lint`-Befehl der @typescript-eslint Regeln prueft. In React-
> Projekten mit Next.js prueft `next lint` aehnliche Regeln. Fuer
> beide gilt: Die ESLint-Konfiguration IST deine Code-Review-
> Checkliste — automatisiert. Aktiviere mindestens:
> `@typescript-eslint/no-explicit-any`, `no-floating-promises`,
> `strict-boolean-expressions`.

```
Metriken fuer TypeScript-Qualitaet:
│
├── "any"-Dichte: Anzahl 'any' pro 1000 Zeilen
│     Ziel: < 1 pro 1000 Zeilen (in neuem Code: 0)
│
├── "as"-Dichte: Anzahl Type Assertions pro 1000 Zeilen
│     Ziel: < 5 pro 1000 Zeilen (die meisten in Tests)
│
├── Strict-Mode: Alle strict-Flags aktiviert?
│     Ziel: strict: true + noUncheckedIndexedAccess
│
├── Exhaustive Checks: % der switch-Statements mit never-Check
│     Ziel: 100% bei Discriminated Unions
│
└── Return Types: % der exportierten Funktionen mit explizitem Typ
      Ziel: 100% (Regel: @typescript-eslint/explicit-module-boundary-types)
```

> 💭 **Denkfrage:** Ist es realistisch, 0 `any` in einem grossen
> Projekt zu haben? Was waere ein pragmatischer Weg dorthin?
>
> **Antwort:** 0 `any` in NEUEM Code ist realistisch und sollte
> die Regel sein. In Legacy-Code: Schrittweise Migration. Setze
> `@typescript-eslint/no-explicit-any: "warn"` fuer Bestand und
> `"error"` fuer neue Dateien. Nutze `// eslint-disable-next-line`
> nur mit Begruendung. Ueber Monate sinkt die any-Dichte auf null.

---

## Experiment: Code-Review an einem realen Beispiel

Pruefe diesen Code gegen alle 15 Punkte der Checkliste:

```typescript
// Angular Service — wie viele Probleme findest du?

@Injectable({ providedIn: "root" })
export class ProductService {
  private products: any[] = [];
  private isLoading = false;
  private hasError = false;

  constructor(private http: HttpClient) {}

  loadProducts() {  // Kein Return Type
    this.isLoading = true;
    this.http.get("/api/products").subscribe((data: any) => {
      this.products = data as any[];
      this.isLoading = false;
    }, (err: any) => {
      this.hasError = true;
      this.isLoading = false;
      console.log(err.message);  // Was wenn err.message undefined ist?
    });
  }

  getProduct(id: string) {  // Kein Return Type
    return this.products.find(p => p.id == id);  // == statt ===
    // ^ Kein Type Guard — p.id koennte eine number sein
  }
}

// Checkliste ausfuellen:
// Red Flags (schreibe welche Pruefpunkte zutreffen):
// Kategorie 1: [___]
// Kategorie 2: [___]
// Kategorie 3: [___]

// Deine verbesserte Version:
// Hinweis: Fange mit dem State an (isLoading + hasError → Discriminated Union)
// Dann: any → konkreter Typ, Return Types hinzufuegen, Error-Handling verbessern
```

---

## Was du gelernt hast

- Eine **15-Punkte-Checkliste** fuer TypeScript Code Reviews — jetzt mit Schadensbildern
- **5 Refactoring-Patterns**: Boolean→DU, String→Brand, !→?., Overloads, Index→Record
- Branded Types brauchen **Smart Constructors** um den einzigen Erstellungsweg zu sichern
- **Framework-spezifische Review-Punkte**: Services kapseln Validierung, Components vertrauen dem Typ
- **Metriken** fuer TypeScript-Qualitaet: any-Dichte, as-Dichte, Strict-Mode, Exhaustive Checks
- Die meisten Verbesserungen sind **kleine Aenderungen** mit grossem Impact
- Automatisierung ueber **ESLint-Regeln** macht die Checkliste dauerhaft

> 🧠 **Erklaere dir selbst:** Wenn du nur EINEN Rat fuer einen
> Kollegen haettest der TypeScript lernt — was waere er? Was ist
> die einzelne wichtigste Best Practice?
> **Kernpunkte:** "Vertraue dem Compiler — wenn er meckert, hat
> er meistens recht. Nutze `as` und `any` nicht um ihn zum
> Schweigen zu bringen." | Das ist die Zusammenfassung der
> gesamten Lektion in einem Satz | Die Disziplin nicht nachzugeben
> wenn der Compiler meckert ist das Einzige was dich von einem
> TypeScript-Anwender zu einem TypeScript-Meister macht

**Kernkonzept der gesamten Lektion:** Best Practices sind keine starren Regeln — sie sind ein Entscheidungsrahmen. Die Checkliste, die Entscheidungsbaeume und die Refactoring-Patterns geben dir Werkzeuge um in jeder Situation die richtige Entscheidung zu treffen. Nach 39 Lektionen hast du das Wissen. Jetzt geht es um die Gewohnheit.

---

> **Pausenpunkt** — Du hast Best Practices und Anti-Patterns
> gemeistert. Die letzte Lektion bringt alles zusammen: Das
> Capstone Project.
>
> Weiter geht es mit: [Lektion 40: Capstone Project](../../40-capstone-project/sections/01-projekt-ueberblick.md)
