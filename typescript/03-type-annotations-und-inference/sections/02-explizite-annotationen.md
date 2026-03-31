# Sektion 2: Explizite Annotationen

**Geschaetzte Lesezeit:** ~10 Minuten

## Was du hier lernst

- Die vollstaendige Annotations-Syntax fuer alle Situationen
- Den Entscheidungsbaum: Wann annotieren, wann inferieren lassen
- Warum Ueber-Annotieren schaedlich ist -- nicht nur ueberfluessig
- Praktische Regeln fuer deinen Angular/React-Alltag

---

## Denkfragen fuer diese Sektion

1. **Warum ist Ueber-Annotieren nicht nur ueberfluessig, sondern aktiv schaedlich?**
2. **Warum annotierst du Callback-Parameter normalerweise NICHT?**

---

## Die Annotation-Syntax

Eine Annotation hat immer die gleiche Form: **Name, Doppelpunkt, Typ**.

```typescript
// Variablen
let name: string = "Matthias";
let alter: number = 30;
let aktiv: boolean = true;

// Funktionen
function greet(name: string, age: number): string {
  return `Hallo ${name}, du bist ${age}`;
}

// Arrow Functions
const multiply = (a: number, b: number): number => a * b;

// Objekt-Destructuring
function printUser({ name, age }: { name: string; age: number }): void {
  console.log(name, age);
}

// Array-Destructuring
const [first, second]: [string, number] = ["hello", 42];

// Arrays
let items: string[] = [];
let items2: Array<string> = [];  // Generische Schreibweise, identisch

// Union Types
let id: string | number = "abc-123";

// Literal Types
let direction: "north" | "south" | "east" | "west" = "north";
```

> **Praxis-Tipp:** In Angular-Projekten begegnest du Annotationen vor allem bei:
> - **Service-Methoden**: `getData(): Observable<User[]>` (Return-Type fuer RxJS)
> - **Component-Inputs**: `@Input() user: User | undefined`
> - **Template-Variablen**: Werden automatisch inferiert -- du annotierst sie nicht

---

## Der Entscheidungsbaum: Wann annotieren?

```
                      Soll ich annotieren?
                             |
                   Ist es ein Parameter?
                    /                \
                  Ja                 Nein
             Annotieren!         Ist es exportiert?
                                  /           \
                                Ja            Nein
                            Annotieren!    Wird der Wert
                           (Return Type)   sofort zugewiesen?
                                            /          \
                                          Ja           Nein
                                    Lass TS infern   Annotieren!
                                    (Inference        (TS weiss den
                                     reicht aus)       Typ nicht)
```

### Als Tabelle

| Situation | Annotieren? | Grund |
|-----------|:-----------:|-------|
| Funktionsparameter | **Immer** | TS kann Parameter nicht infern |
| Exportierte Return-Types | **Ja** | Klare API, bessere Fehlermeldungen |
| Lokale Variable mit Initialwert | **Nein** | Inference ist korrekt, Annotation waere Rauschen |
| Variable ohne Initialwert | **Ja** | TS wuerde `any` infern |
| Callback-Parameter | **Nein** | Contextual Typing uebernimmt |
| Leere Arrays `[]` | **Ja** | Wird sonst `any[]` oder `never[]` |
| Komplexe Return-Typen | **Ja** | Dokumentation fuer den Leser |
| API-Responses / JSON.parse | **Ja** | TS kennt den Laufzeit-Typ nicht |

---

## Warum Ueber-Annotieren schaedlich ist

Viele TypeScript-Anfaenger annotieren alles -- "sicher ist sicher". Aber Ueber-Annotieren ist nicht nur ueberfluessig, es ist **aktiv schaedlich**:

### Problem 1: Doppelte Wartung

```typescript
// SCHLECHT: Annotation wiederholt, was der Wert schon sagt
const name: string = "Matthias";
const count: number = items.length;
const doubled: number[] = items.map((n: number): number => n * 2);

// GUT: Inference uebernimmt
const name = "Matthias";
const count = items.length;
const doubled = items.map(n => n * 2);
```

Wenn du den Wert aenderst, musst du bei expliziter Annotation **zwei Stellen** aktualisieren. Bei Inference passt der Typ sich automatisch an.

### Problem 2: Annotationen koennen **weniger praezise** sein als Inference

```typescript
// Annotation: Typ ist BREITER als noetig
const status: string = "active";
// status ist jetzt 'string' -- akzeptiert "irgendwas"

// Inference: Typ ist PRAEZISER
const status = "active";
// status ist jetzt '"active"' -- ein Literal Type!
```

Das ist ein haeufiges Missverstaendnis: Viele denken, eine explizite Annotation ist "genauer". In Wirklichkeit ist die Inference bei `const`-Variablen **praeziser**, weil sie den Literal-Typ erkennt.

> **Denkfrage:** Warum gibt `const status: string = "active"` den Typ `string`, aber `const status = "active"` den Typ `"active"`? Was verlierst du durch die Annotation?

### Problem 3: Callback-Annotationen zerstoeren Lesbarkeit

```typescript
// SCHLECHT: Rauschen in jedem Callback
const users = data
  .filter((item: DataItem): boolean => item.active)
  .map((item: DataItem): string => item.name)
  .sort((a: string, b: string): number => a.localeCompare(b));

// GUT: Saubere Pipeline
const users = data
  .filter(item => item.active)
  .map(item => item.name)
  .sort((a, b) => a.localeCompare(b));
```

Contextual Typing (Sektion 5) stellt sicher, dass `item`, `a`, und `b` in beiden Versionen den korrekten Typ haben. Die Annotationen sind pures Rauschen.

---

## Wann Annotationen unverzichtbar sind

### 1. Funktionsparameter -- immer

```typescript
// TS kann den Typ nicht ableiten -- woher auch?
function calculateDiscount(price: number, percentage: number): number {
  return price * (1 - percentage / 100);
}
```

Die Gruende hast du in Sektion 1 gelernt: Parameter sind Vertraege, keine Beobachtungen.

### 2. Exportierte Return-Types -- fuer stabile APIs

```typescript
// In einem Angular Service:
@Injectable({ providedIn: 'root' })
export class UserService {
  // Return-Typ annotiert: Der Konsument weiss sofort, was er bekommt
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }

  // Ohne Annotation: Funktioniert, aber...
  // - Fehlermeldungen zeigen auf den Aufrufer, nicht die Quelle
  // - Aenderungen in der Implementierung koennen den Return-Typ stillschweigend aendern
}
```

> **Hintergrund:** Warum sind annotierte Return-Types bei Exports so wichtig? Weil TypeScript bei einem Fehler die **Aufrufstelle** markiert, nicht die Funktions-Implementierung. Wenn `getUsers()` ploetzlich `Observable<any>` zurueckgibt (weil jemand die Implementierung geaendert hat), siehst du den Fehler erst dort, wo du `getUsers()` benutzt -- eventuell in einer ganz anderen Datei. Mit annotiertem Return-Typ markiert TS den Fehler direkt in der Funktion.

### 3. Variablen ohne Initialwert

```typescript
// SCHLECHT: any, weil kein Wert vorhanden
let username;
username = getName();  // username ist 'any' und bleibt 'any'

// GUT: Annotation gibt TS die fehlende Information
let username: string;
username = getName();  // username ist 'string'
```

### 4. Leere Arrays

```typescript
// SCHLECHT: any[], weil keine Elemente vorhanden
const items = [];
items.push("hello");  // Kein Fehler
items.push(42);       // Auch kein Fehler -- alles geht rein!

// GUT: Typ vorgeben
const items: string[] = [];
items.push("hello");  // OK
items.push(42);       // FEHLER -- genau was wir wollen
```

### 5. Externe Daten

```typescript
// JSON.parse gibt immer 'any' zurueck
const data: User = JSON.parse(responseBody);

// Noch besser: Runtime-Validierung (z.B. mit zod)
const UserSchema = z.object({ name: z.string(), age: z.number() });
const data = UserSchema.parse(JSON.parse(responseBody));
```

---

## Praxis: Typische Angular/React-Patterns

### Angular Component

```typescript
@Component({ selector: 'app-user-list', templateUrl: './user-list.component.html' })
export class UserListComponent implements OnInit {
  // Annotation noetig: kein Initialwert
  users: User[] = [];
  selectedUser: User | null = null;

  // Parameter annotiert, Return-Type fuer Observable annotiert
  constructor(private userService: UserService) {}

  ngOnInit(): void {
    // Callback-Parameter: NICHT annotieren (Contextual Typing)
    this.userService.getUsers().subscribe(users => {
      this.users = users;  // users ist automatisch User[]
    });
  }

  // Parameter annotiert, Return-Type bei einfacher Methode optional
  selectUser(user: User): void {
    this.selectedUser = user;
  }
}
```

### React Component

```typescript
// Props-Interface: Annotation
interface UserListProps {
  initialFilter?: string;
  onSelect: (user: User) => void;
}

// Props-Parameter annotiert, Rest inferiert
const UserList: React.FC<UserListProps> = ({ initialFilter, onSelect }) => {
  // Lokale State: Inference uebernimmt
  const [users, setUsers] = useState<User[]>([]);  // Generics statt Annotation
  const [filter, setFilter] = useState(initialFilter ?? "");

  // useEffect-Callback: NICHT annotieren
  useEffect(() => {
    fetchUsers().then(data => setUsers(data));
  }, []);

  // Event-Handler: Contextual Typing
  const handleClick = (user: User) => {  // Hier annotieren: separater Callback!
    onSelect(user);
  };

  return /* JSX */;
};
```

> **Praxis-Tipp:** Beachte das Pattern bei `useState`: Wenn der Initialwert den Typ bestimmt (wie `useState("")`), brauchst du kein Generic. Aber bei `useState<User[]>([])` ist das Generic noetig, weil ein leeres Array sonst `never[]` waere.

---

## Experiment-Box: Annotation vs. Inference im Vergleich

> **Experiment:** Oeffne `examples/01-explizite-annotationen.ts` und probiere:
>
> 1. Schreibe `const status: string = "active";` -- hovere ueber `status`. Welcher Typ?
> 2. Entferne die Annotation: `const status = "active";` -- was zeigt die IDE jetzt?
> 3. Welche Version ist **praeziser**? Warum?
> 4. Schreibe eine Funktion mit Callback: `[1,2,3].map((n: number): number => n * 2);` -- entferne die Callback-Annotationen. Kompiliert es noch? Was sagt dir das ueber Contextual Typing?

---

## Rubber-Duck-Prompt

Stell dir vor, ein Kollege fragt: "Soll ich bei `const name = 'Max'` den Typ `: string` hinschreiben oder weglassen?"

Erklaere in 2-3 Saetzen, warum die Annotation hier nicht nur ueberfluessig, sondern sogar **schaedlich** sein kann. (Stichwort: Literal-Typ vs. Basis-Typ)

---

## Was du gelernt hast

- Annotations-Syntax: **Name: Typ** -- konsistent bei Variablen, Parametern, Returns
- **Ueber-Annotieren ist schaedlich**: Es erzeugt Rauschen, erfordert doppelte Wartung und kann weniger praezise sein als Inference
- Der Entscheidungsbaum: Parameter und Grenzen annotieren, Inneres inferieren lassen
- In Angular/React-Projekten: **Service-Returns, Props-Interfaces und Parameter** annotieren; **Callbacks, lokale Variablen und State mit Wert** inferieren lassen

---

**Pausenpunkt.** Wenn du bereit bist, geht es weiter mit [Sektion 3: Wie Inference funktioniert](./03-wie-inference-funktioniert.md) -- dort schaust du dem Compiler ueber die Schulter und lernst seine Inference-Regeln kennen.
