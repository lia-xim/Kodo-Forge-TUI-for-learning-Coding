# Sektion 6: Praxis — Angular- und React-Migration

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [05 - Typische Migrationsprobleme und Loesungen](./05-typische-migrationsprobleme.md)
> Naechste Sektion: -- (Ende der Lektion)

---

## Was du hier lernst

- Wie du ein **Angular-Projekt** von losem auf striktes TypeScript migrierst
- Wie du eine **React-Codebase** von JavaScript zu TypeScript umstellst
- Welche **framework-spezifischen Fallstricke** es gibt
- Ein konkretes **Migrations-Playbook** das du direkt anwenden kannst

---

## Angular: Von locker zu strikt

> **Hintergrundwissen: Angulars Strict-Reise**
>
> Angular war von Anfang an (2016) ein TypeScript-Projekt. Aber "TypeScript"
> heisst nicht automatisch "strikt". Viele Angular-Projekte aus der Aera
> Angular 2-8 (2016-2019) nutzen weder `strict: true` noch
> `strictTemplates: true`. Die Angular CLI aktiviert strict erst seit
> Angular 12 (2021) standardmaessig bei `ng new`.
>
> Das bedeutet: Wenn du an einem aelteren Angular-Projekt arbeitest, ist
> die "Migration" nicht JS→TS, sondern TS→Strict TS. Und das kann
> genauso aufwendig sein.

### Schritt 1: Strict-Mode in Angular

```typescript annotated
// angular.json — Angular-spezifische Strict-Optionen
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "options": {
            "strictTemplates": true,
            // ^ Template Type Checking — prueft Property-Bindings und Events
            "strictInjectionParameters": true
            // ^ Prueft DI-Parameter auf korrekte Typen
          }
        }
      }
    }
  }
}

// tsconfig.json — TypeScript Strict
{
  "compilerOptions": {
    "strict": true,
    // ^ Aktiviert alle TypeScript-Strict-Flags
    "noPropertyAccessFromIndexSignature": true
    // ^ Angular-Empfehlung: obj.key → FEHLER, obj["key"] → OK
    // ^ Macht deutlich wann dynamischer Zugriff passiert
  },
  "angularCompilerOptions": {
    "strictTemplates": true,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true
    // ^ Angular-spezifische Compiler-Optionen
  }
}
```

### Schritt 2: Angular-spezifische Probleme

```typescript annotated
// Problem 1: Untypisierte Services
@Injectable({ providedIn: 'root' })
export class DataService {
  private data: any;  // ← Ueberall "any" in alten Services
  // Fix: Schrittweise typisieren
  private data: User[] = [];

  getData() {
    return this.data;  // Rueckgabetyp wird jetzt inferiert
  }
}

// Problem 2: Template-Fehler mit strictTemplates
// <input [value]="user.name">
// ^ FEHLER wenn user undefined sein kann
// Fix:
// <input *ngIf="user" [value]="user.name">
// Oder: Definite Assignment in der Komponente
// user!: User; (temporaer, mit TODO markieren)

// Problem 3: ViewChild ohne Typ
// @ViewChild('myRef') ref;  // FEHLER: implizit any
// Fix:
// @ViewChild('myRef') ref!: ElementRef<HTMLInputElement>;

// Problem 4: Event-Handler in Templates
// (click)="onClick($event)"
// onClick(event) { ... }  // FEHLER: implicit any
// Fix:
// onClick(event: MouseEvent) { ... }
```

> 🧠 **Erklaere dir selbst:** Warum ist `strictTemplates: true` in Angular so wertvoll? Was prueft es, das ohne diese Option nicht geprueft wird?
> **Kernpunkte:** Prueft Property-Bindings auf korrekte Typen | Prueft Event-Handler-Signaturen | Erkennt null/undefined in Templates | Prueft Pipe-Rueckgabetypen | Ohne strictTemplates sind Templates eine "Type-Free Zone"

---

## React: Von JavaScript zu TypeScript

React-Projekte in JavaScript zu migrieren folgt dem Standard-Workflow,
hat aber eigene Besonderheiten:

### Schritt 1: Setup

```typescript annotated
// tsconfig.json fuer React-Migration
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    // ^ Fuer React 17+ (automatischer JSX-Transform)
    "allowJs": true,
    // ^ Erlaubt gemischte .js/.jsx und .ts/.tsx Dateien
    "strict": false,
    // ^ Erst spaeter aktivieren!
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}

// Schritt: .jsx → .tsx umbenennen (Datei fuer Datei)
// ACHTUNG: .js → .ts (ohne JSX) und .jsx → .tsx (mit JSX)!
```

### Schritt 2: React-spezifische Patterns

```typescript annotated
// Props typisieren — der wichtigste Schritt
// VORHER (.jsx):
function UserCard({ name, age, onSave }) {
  return <div onClick={() => onSave(name)}>{name}, {age}</div>;
}

// NACHHER (.tsx):
interface UserCardProps {
  name: string;
  age: number;
  onSave: (name: string) => void;
}

function UserCard({ name, age, onSave }: UserCardProps) {
  // ^ Volle Typen fuer alle Props
  return <div onClick={() => onSave(name)}>{name}, {age}</div>;
}

// Hooks typisieren:
// VORHER:
const [user, setUser] = useState(null);

// NACHHER:
const [user, setUser] = useState<User | null>(null);
// ^ Ohne expliziten Typ: useState(null) → Typ ist 'null' (nicht User | null!)
// ^ Das ist ein SEHR haeufiger Fehler bei React-Migrationen

// Event-Handler:
// VORHER:
function handleChange(e) { setValue(e.target.value); }

// NACHHER:
function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  setValue(e.target.value);
}
```

> 💭 **Denkfrage:** Warum gibt `useState(null)` den Typ `null` und nicht
> `null | undefined`? Und warum muss man explizit `useState<User | null>(null)`
> schreiben?
>
> **Antwort:** TypeScript inferiert den engsten moeglichen Typ. `null` ist
> ein Literal-Typ — TypeScript inferiert `useState<null>`, nicht
> `useState<User | null>`. Du musst den Generischen Typ explizit angeben
> wenn der Initialwert nicht den vollen Wertebereich repraesentiert.

---

## Das Migrations-Playbook

Ein konkreter, anwendbarer Plan fuer beide Frameworks:

```typescript annotated
// WOCHE 1: Infrastruktur
// - [ ] TypeScript + tsconfig einrichten
// - [ ] allowJs: true, strict: false
// - [ ] CI erweitern: tsc --noEmit
// - [ ] Regel etablieren: "Neue Dateien in .ts/.tsx"

// WOCHE 2-3: Shared Code
// - [ ] Types/Interfaces definieren (models/, types/)
// - [ ] API-Response-Typen erstellen
// - [ ] Utility-Funktionen migrieren

// WOCHE 4-6: Services/Hooks (Core)
// - [ ] Angular: Services migrieren
// - [ ] React: Custom Hooks migrieren
// - [ ] State Management typisieren (NgRx/Redux/Zustand)

// WOCHE 7-10: Komponenten
// - [ ] Von Blatt-Komponenten nach innen arbeiten
// - [ ] Props/Inputs typisieren
// - [ ] Event-Handler typisieren

// WOCHE 11-12: Strict Mode
// - [ ] Phase 1 Strict-Flags aktivieren (alwaysStrict, etc.)
// - [ ] Phase 2: noImplicitAny
// - [ ] Phase 3: strictNullChecks (der grosse Brocken)

// WOCHE 13+: Verfeinerung
// - [ ] Verbleibende ! (Non-null Assertions) abbauen
// - [ ] any-Stellen typisieren
// - [ ] strict: true aktivieren
// - [ ] allowJs: false (Migration abgeschlossen!)
```

> ⚡ **Framework-Bezug (Angular + React):** Der Unterschied in der Praxis:
>
> **Angular:** Die meiste Arbeit steckt in `strictTemplates` — Templates
> sind die groesste "Type-Free Zone". Services und Komponenten-Klassen
> sind oft schon halbwegs typisiert.
>
> **React:** Die meiste Arbeit steckt in Props-Typen und Hooks. JSX ist
> weniger problematisch als Angular-Templates, weil JSX naeher an
> normalem TypeScript ist. Dafuer hat React mehr untypisierte Patterns
> (Context, Render Props, HOCs).

---

## Metriken: Fortschritt messen

```typescript annotated
// Migration-Fortschritt quantifizieren:

// 1. Dateien: Wie viele .ts vs .js?
// find src -name "*.ts" -o -name "*.tsx" | wc -l  → 120
// find src -name "*.js" -o -name "*.jsx" | wc -l  → 80
// → 60% migriert

// 2. Any-Count: Wie viele explizite 'any'?
// grep -r ": any" src/ --include="*.ts" | wc -l → 45
// → 45 Stellen die noch typisiert werden muessen

// 3. @ts-ignore Count:
// grep -r "@ts-ignore\|@ts-expect-error" src/ | wc -l → 12
// → 12 unterdrueckte Fehler

// 4. Strict-Compliance: Kompiliert mit strict: true?
// npx tsc --noEmit --strict 2>&1 | grep "error TS" | wc -l → 230
// → 230 Fehler bis strict: true moeglich

// Ziel: Alle 4 Metriken auf 0/100%
```

> 🧪 **Experiment:** Fuehre die obigen Metriken in einem echten Projekt aus:
>
> ```bash
> # In deinem Angular/React-Projekt:
> echo "=== Migration Status ==="
> echo "TypeScript files: $(find src -name '*.ts' -o -name '*.tsx' | wc -l)"
> echo "JavaScript files: $(find src -name '*.js' -o -name '*.jsx' | wc -l)"
> echo "Explicit any: $(grep -r ': any' src/ --include='*.ts*' | wc -l)"
> echo "Suppressed errors: $(grep -r '@ts-ignore\|@ts-expect-error' src/ | wc -l)"
> ```
>
> Diese 4 Zahlen geben dir sofort ein Bild vom Migrationsstatus.

---

## Was du gelernt hast

- **Angular-Migration** fokussiert auf `strictTemplates` und Service-Typisierung
- **React-Migration** fokussiert auf Props-Typen, Hooks und Event-Handler
- `useState(null)` inferiert `null`, nicht `User | null` — expliziter Generic noetig
- Ein **12-Wochen-Playbook** gibt Struktur: Infrastruktur → Shared → Core → Komponenten → Strict
- **4 Metriken** messen den Fortschritt: TS-Anteil, any-Count, ts-ignore-Count, Strict-Fehler

**Kernkonzept zum Merken:** Framework-Migration ist Framework-spezifisch. Angular hat Templates als groesste Type-Free Zone, React hat Props und Hooks. Der Weg ist aber gleich: Graduell, von innen nach aussen, mit messbaren Metriken. Und der letzte Schritt — `strict: true` und `allowJs: false` — ist der befriedigendste.

---

> **Ende der Lektion.** Du hast jetzt das Wissen und die Werkzeuge um
> jedes JavaScript-Projekt sicher nach TypeScript zu migrieren.
>
> Weiter geht es mit: **L36 — Library Authoring**
