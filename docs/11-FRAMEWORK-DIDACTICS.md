# Framework-spezifische Lernmethoden

> Letzte Aktualisierung: 2026-03-31
> Status: ANALYSIERT und DESIGNED, noch nicht implementiert

---

## 1. Ueberblick

Neben den 12 generischen Uebungsformaten (siehe `docs/09-DIDACTIC-FORMATS.md`) benoetigen die Framework-Kurse (Angular, React, Next.js) **spezialisierte didaktische Formate**. Diese nutzen framework-spezifische Konzepte und mentale Modelle die sich nicht mit generischen Formaten abdecken lassen.

Insgesamt sind **15 framework-spezifische Formate** geplant:
- Angular: 5 Formate
- React: 4 Formate
- Next.js: 3 Formate
- Cross-Framework: 3 Formate

---

## 2. Angular-spezifische Formate (5)

---

### 2.1 Marble Diagram Challenges

**Fuer:** Angular Phase 3 (L22-L24 — RxJS)

**Was sind Marble Diagrams?**

Marble Diagrams sind die Standard-Visualisierung fuer Observable-Streams in RxJS. Jede Zeile ist ein Stream, Striche (---) sind Zeiteinheiten, Buchstaben/Zahlen sind emittierte Werte, | ist Completion, X ist Error.

```
Eingabe:   --a--b--c--d--|
                switchMap(x => timer(10).pipe(map(() => x.toUpperCase())))
Ausgabe:   -----A--B--C--D--|

Eingabe 1: --1--2--3--|
Eingabe 2: ------a------b--|
                combineLatest([input1, input2])
Ausgabe:   ------[3,a]--[3,b]--|
```

**Aufgabentyp:** Lernender bekommt ein Marble Diagram fuer die Eingabe + den Operator und muss das Ausgabe-Diagram zeichnen (als ASCII-Text).

**Wissenschaftliche Grundlage:**
- Dual Coding Theory (Paivio 1986) — visuelle + textuelle Repraesentation
- Mental Simulation (Lister 2004) — Code "im Kopf durchgehen"

**Geplante Implementierung:**

```typescript
interface MarbleDiagramChallenge {
  id: string;
  title: string;
  inputDiagram: string;           // "--a--b--c--|"
  operator: string;               // "switchMap(x => of(x, x))"
  expectedOutputDiagram: string;  // "--aa-bb-cc-|"
  hints: string[];
  explanation: string;
  difficulty: 1 | 2 | 3;
}
```

**Wie es im TUI aussieht:**
```
 Marble Diagram Challenge

 Eingabe:   --a--b--c--d--|

 Operator:  debounceTime(20)
            (20ms = 2 Zeiteinheiten im Diagramm)

 Deine Ausgabe: _________________________
                (Zeichne das Ausgabe-Diagramm)

 [H] Hint   [S] Loesung
```

**5 Schwierigkeitsgrade:**
1. Einfache Operatoren (map, filter, take)
2. Zeitbasierte Operatoren (debounceTime, throttleTime)
3. Kombinations-Operatoren (combineLatest, merge, zip)
4. Higher-order Operatoren (switchMap, mergeMap, exhaustMap)
5. Fehlerbehandlung (catchError, retry, retryWhen)

---

### 2.2 DI-Baum-Tracer

**Fuer:** Angular Phase 1 (L06-L07 — DI)

**Was ist das?**

Angular's Dependency Injection hat eine hierarchische Injector-Struktur. Services die in verschiedenen Injectors registriert sind, haben unterschiedliche Lifetimes und Scopes. Der DI-Baum-Tracer zeigt, *welcher* Injector einen Service bereitstellt.

**Aufgabentyp:** Lernender bekommt eine Component-Hierarchie mit Service-Registrierungen und muss bestimmen, welche Instanz eines Services eine bestimmte Component bekommt.

**Beispiel:**
```
 App Component  (providedIn: 'root' → MyService [Instanz A])
    │
    ├── Header Component
    │      └── nutzt MyService → Bekommt Instanz ???
    │
    └── Feature Component  (providers: [MyService] → [Instanz B])
           │
           └── Child Component
                  └── nutzt MyService → Bekommt Instanz ???

 Frage: Welche Instanz bekommt Header Component?
 Frage: Welche Instanz bekommt Child Component?
```

**Geplante Implementierung:**

```typescript
interface DITracerChallenge {
  id: string;
  componentTree: {
    name: string;
    providers: string[];      // Services die dieser Injector bereitstellt
    children: ComponentNode[];
  };
  questions: {
    component: string;         // "ChildComponent"
    service: string;           // "MyService"
    correctAnswer: string;     // "Instanz B (von FeatureComponent)"
    explanation: string;
  }[];
}
```

---

### 2.3 Change-Detection-Simulator

**Fuer:** Angular Phase 3 (L25 — Change Detection Deep Dive)

**Was ist das?**

Ein interaktiver Simulator der zeigt, welche Components bei einem Event gerendert werden — abhaengig von der Change Detection Strategy (Default vs OnPush) und der Art der Datenmuatation.

**Aufgabentyp:** Lernender bekommt einen Component-Baum mit CD-Strategien und ein Event. Er muss markieren welche Components neu gerendert werden.

**Beispiel:**
```
 App (Default)
    │
    ├── Sidebar (OnPush)
    │      └── NavItem (Default)
    │
    └── Main (Default)
           │
           ├── Header (OnPush) ← @Input() title
           │
           └── Content (OnPush)
                  └── List (Default) ← @Input() items

 Event: Ein Button in Main aendert this.title = "Neuer Titel"
        (this.title ist @Input() von Header)

 Frage: Welche Components werden neu gerendert?
 (a) Alle
 (b) App, Main, Header
 (c) App, Main, Header, Content, List
 (d) Nur Header
```

**Schwierigkeitsgrade:**
1. Nur Default-Strategie (alles wird gerendert)
2. Default + OnPush Mix (Input-Aenderungen)
3. OnPush mit Mutable Mutation (das Problem!)
4. OnPush mit Signals (zoneless)
5. ChangeDetectorRef.markForCheck() Szenarien

---

### 2.4 Signal-vs-Observable-Entscheidungsbaum

**Fuer:** Angular Phase 3 (L24 — RxJS & Signals Interop)

**Was ist das?**

Ein interaktiver Entscheidungsbaum der hilft, fuer ein gegebenes Szenario zu entscheiden ob ein Signal, ein Observable oder eine Kombination das richtige Werkzeug ist.

**Aufgabentyp:** Lernender bekommt ein Szenario und muss durch Ja/Nein-Fragen zum richtigen Werkzeug navigieren.

```
 Szenario: "Nutzereingabe in einem Suchfeld mit 300ms Debounce"

 Frage 1: Braucht der Wert zeitbasierte Operationen (debounce, throttle)?
   → Ja → Observable (Signals haben keine zeitbasierten Operatoren)

 Szenario: "Aktueller Tab-Index in einer Navigation"

 Frage 1: Braucht der Wert zeitbasierte Operationen?
   → Nein
 Frage 2: Aendert sich der Wert synchron (z.B. durch Click-Handler)?
   → Ja → Signal (einfacher, kein subscribe/unsubscribe)
```

---

### 2.5 Template-Typ-Inferenz-Trainer

**Fuer:** Angular Phase 1-2 (L02-L03 — Components & Templates)

**Was ist das?**

Uebungen die das Verstaendnis der Template-Typ-Inferenz staerken. Angular's Template-Compiler inferiert Typen in Templates — aber die Regeln sind manchmal ueberraschend.

**Aufgabentyp:** Lernender bekommt ein Template und muss den Typ einer Variable im Template bestimmen.

```html
@if (user) {
  <!-- Frage: Was ist der Typ von `user` hier? -->
  <span>{{ user.name }}</span>
}

@for (item of items; track item.id) {
  <!-- Frage: Was ist der Typ von `item` hier?
       Gegeben: items: (User | Admin)[] -->
  <span>{{ item.name }}</span>
}
```

---

## 3. React-spezifische Formate (4)

---

### 3.1 Re-Render-Simulator

**Fuer:** React Phase 2 (R16 — Performance)

**Was ist das?**

Ein interaktiver Simulator der zeigt, welche Components bei einem State-Update neu gerendert werden — und warum. React rendert standardmaessig ALLE Child-Components einer Component die re-rendert, auch wenn sich ihre Props nicht geaendert haben.

**Aufgabentyp:** Lernender bekommt einen Component-Baum mit State-Locations und ein State-Update. Er muss markieren welche Components neu gerendert werden.

**Beispiel:**
```
 App (useState: theme)
    │
    ├── Header (props: { title })
    │      └── Logo (keine Props)
    │
    └── Main
           │
           ├── Sidebar (React.memo, props: { items })
           │
           └── Content (props: { theme })
                  └── Card (props: { data })

 Event: setTheme("dark") in App

 Frage: Welche Components re-rendern?
 (a) Alle
 (b) App, Header, Logo, Main, Content, Card (nicht Sidebar wegen memo)
 (c) Nur App und Content
 (d) Nur Content
```

**Antwort:** (b) — React rendert alle Children von App, AUSSER Sidebar hat React.memo und seine Props (items) haben sich nicht geaendert.

---

### 3.2 Mutation-Detective

**Fuer:** React Phase 1 (R04 — State mit useState)

**Was ist das?**

Code-Snippets in denen State mutiert wird (ein haeufiger Bug in React). Lernender muss die Mutation finden und den korrekten immutablen Weg zeigen.

**Beispiel:**
```typescript
// Bug: State wird mutiert!
function addItem(item: Item) {
  items.push(item);        // ← MUTATION!
  setItems(items);         // React erkennt keine Aenderung (gleiche Referenz)
}

// Fix: Immutable Update
function addItem(item: Item) {
  setItems([...items, item]);  // Neue Referenz → React rendert
}
```

**Aufgabentyp:** Lernender bekommt Code mit Mutation und muss:
1. Die Mutation identifizieren
2. Den Fix schreiben
3. Erklaeren warum React die Mutation nicht erkennt

---

### 3.3 useEffect-Synchronisationsanalyse

**Fuer:** React Phase 1 (R07 — useEffect Deep Dive)

**Was ist das?**

useEffect ist das am meisten missverstandene Hook in React. Dieses Format zeigt verschiedene useEffect-Szenarien und fragt: "Wann wird dieser Effect ausgefuehrt? Wie oft? Was wird gecleant?"

**Beispiel:**
```typescript
useEffect(() => {
  const handler = () => console.log(count);
  window.addEventListener("resize", handler);
  return () => window.removeEventListener("resize", handler);
}, [count]);
```

**Fragen:**
1. Wann wird der Effect ERSTMALS ausgefuehrt? (Nach dem ersten Render)
2. Wann wird der Cleanup ausgefuehrt? (Bevor der Effect ERNEUT laeuft, und beim Unmount)
3. Wenn count von 0 → 1 → 2 wechselt, wie viele addEventListener/removeEventListener Aufrufe gibt es? (3 add, 2 remove waehrend Lifecycle, 1 remove beim Unmount)

**Schwierigkeitsgrade:**
1. Einfach: Leeres Dependency-Array `[]`
2. Mittel: Ein Dependency `[count]`
3. Schwer: Mehrere Dependencies, Closures, stale State
4. Experte: Race Conditions, AbortController

---

### 3.4 Hook-Kompositions-Aufgaben

**Fuer:** React Phase 2 (R11 — Custom Hooks)

**Was ist das?**

Aufgaben bei denen der Lernende aus mehreren einfachen Hooks einen Custom Hook komponiert. Fokus auf Wiederverwendbarkeit und Type-Safety.

**Beispiel:**
```
Baue einen `useDebounce<T>(value: T, delay: number): T` Hook.

Verfuegbare Building Blocks:
- useState<T>
- useEffect
- setTimeout / clearTimeout

Anforderungen:
- Generic (funktioniert mit string, number, etc.)
- Cleanup bei value-Aenderung
- Cleanup bei Unmount
```

---

## 4. Next.js-spezifische Formate (3)

---

### 4.1 Server/Client-Grenze-Visualisierung

**Fuer:** Next.js Phase 1 (N02 — Server vs. Client Components)

**Was ist das?**

Visualisierung die zeigt wo in einem Component-Baum die Server/Client-Grenze liegt. Der Lernende muss bestimmen welche Components Server Components und welche Client Components sind.

**Beispiel:**
```
 page.tsx (Server Component)
    │
    ├── Header (Server Component)
    │      └── SearchBar ("use client")
    │             └── SearchResults (???)
    │
    └── ProductList (Server Component)
           └── AddToCartButton ("use client")

 Frage: Was ist SearchResults — Server oder Client Component?
 Antwort: Client Component! Alles was unter "use client" importiert wird,
          ist automatisch auch Client Component.
```

**Aufgabentyp:** Component-Baum + "use client" Markierungen → Lernender muss fuer jeden Node bestimmen: Server oder Client?

---

### 4.2 Caching-Schichten-Simulator

**Fuer:** Next.js Phase 3 (N11 — Caching Deep Dive)

**Was ist das?**

Next.js hat 4 Caching-Schichten. Dieses Format simuliert einen Request und zeigt, welche Cache-Schicht den Response liefert.

**Die 4 Schichten:**
```
1. Request Memoization (gleicher Request im gleichen Render, per-request)
2. Data Cache (persistiert, ueber Requests hinweg, revalidate-bar)
3. Full Route Cache (gesamte HTML-Seite, build-time oder revalidate-bar)
4. Router Cache (Client-seitig, Navigation Cache)
```

**Aufgabentyp:** Szenario-basiert.

```
Szenario:
- Seite A wurde beim Build gerendert (Static)
- fetch("/api/products", { next: { revalidate: 60 } })
- 30 Sekunden spaeter: Nutzer navigiert zur Seite

Frage: Welche Cache-Schicht liefert die Daten?
(a) Request Memoization
(b) Data Cache (noch innerhalb des 60s-Fensters)
(c) Full Route Cache
(d) Router Cache (Nutzer war schon auf der Seite)
```

---

### 4.3 Server-Action-Security-Audit

**Fuer:** Next.js Phase 3 (N15 — Security)

**Was ist das?**

Code-Review-Aufgaben fuer Server Actions. Lernender muss Sicherheitslue in Server Actions finden.

**Beispiel:**
```typescript
// Server Action — finde die Sicherheitsluecken!
"use server";

export async function deleteUser(userId: string) {
  // Luecke 1: Keine Auth-Pruefung — jeder kann jeden User loeschen!
  // Luecke 2: userId kommt vom Client — nicht validiert (SQL Injection?)
  // Luecke 3: Keine Rate Limiting

  await db.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
}
```

---

## 5. Cross-Framework-Formate (3)

---

### 5.1 Framework-Rosetta-Stone

**Beschreibung:** Gleiches Problem in Angular, React und Next.js geloest. Der Lernende sieht die Loesung in einem Framework und muss sie in ein anderes "uebersetzen".

**Beispiel:**
```
Problem: Zeige eine Liste von Nutzern. Zeige "Laden..." waehrend die Daten geladen werden.

Angular:
  @Component({
    template: `
      @if (loading()) { <p>Laden...</p> }
      @else { @for (user of users(); track user.id) { <p>{{ user.name }}</p> } }
    `
  })
  export class UserList {
    loading = signal(true);
    users = signal<User[]>([]);
    constructor() {
      inject(HttpClient).get<User[]>('/api/users').subscribe(u => {
        this.users.set(u);
        this.loading.set(false);
      });
    }
  }

React:
  function UserList() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      fetch('/api/users').then(r => r.json()).then(u => {
        setUsers(u);
        setLoading(false);
      });
    }, []);
    if (loading) return <p>Laden...</p>;
    return users.map(u => <p key={u.id}>{u.name}</p>);
  }

Next.js:
  // page.tsx (Server Component — kein Loading State noetig!)
  export default async function UserList() {
    const users = await fetch('/api/users').then(r => r.json());
    return users.map(u => <p key={u.id}>{u.name}</p>);
  }
  // loading.tsx
  export default function Loading() { return <p>Laden...</p>; }
```

**Aufgabentyp:** Lernender bekommt die Loesung in einem Framework und muss sie in ein anderes uebersetzen. Bonus: Erklaere den fundamentalen Unterschied (z.B. "Next.js braucht keinen Loading State im Component weil die loading.tsx-Konvention das uebernimmt").

---

### 5.2 Architektur-Entscheidungs-Simulator

**Beschreibung:** Reales Projekt-Szenario → Lernender muss entscheiden welches Framework/Pattern am besten passt.

**Beispiel:**
```
Szenario: Du baust ein internes Dashboard fuer 50 Nutzer.
- Viele Formulare, komplexe Validierung
- Echtzeit-Updates via WebSocket
- Keine SEO noetig
- Team kennt Angular

Frage: Welches Framework/Setup wuerdest du waehlen?
(a) Angular mit Signals + RxJS fuer WebSocket
(b) React mit TanStack Query + WebSocket Hook
(c) Next.js App Router mit Server Components
(d) Plain TypeScript ohne Framework

Diskussion: Warum ist (a) hier die beste Wahl? Wann waere (c) besser?
```

---

### 5.3 Migration-Challenge

**Beschreibung:** Code von einem Framework in ein anderes migrieren. Fokus auf konzeptuelle Unterschiede, nicht auf Syntax.

**Beispiel:**
```
Migriere diesen Angular-Service zu einem React Custom Hook:

// Angular
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private theme = signal<'light' | 'dark'>('light');
  readonly currentTheme = this.theme.asReadonly();
  toggle() { this.theme.update(t => t === 'light' ? 'dark' : 'light'); }
}

// React — schreibe einen useTheme() Hook
// Beachte: Angular DI = Singleton, React Context = per Provider-Scope
```

---

## 6. Zusammenfassung: Alle 15 geplanten Formate

| # | Format | Framework | Fuer Lektion(en) | Schwierigkeit |
|---|--------|-----------|-------------------|:-------------:|
| 1 | Marble Diagram Challenges | Angular | L22-L24 (RxJS) | Mittel-Schwer |
| 2 | DI-Baum-Tracer | Angular | L06-L07 (DI) | Mittel |
| 3 | Change-Detection-Simulator | Angular | L25 (CD) | Schwer |
| 4 | Signal-vs-Observable-Entscheidungsbaum | Angular | L24 (Interop) | Mittel |
| 5 | Template-Typ-Inferenz-Trainer | Angular | L02-L03 | Leicht-Mittel |
| 6 | Re-Render-Simulator | React | R16 (Performance) | Mittel-Schwer |
| 7 | Mutation-Detective | React | R04 (useState) | Leicht-Mittel |
| 8 | useEffect-Synchronisationsanalyse | React | R07 (useEffect) | Schwer |
| 9 | Hook-Kompositions-Aufgaben | React | R11 (Custom Hooks) | Mittel |
| 10 | Server/Client-Grenze-Visualisierung | Next.js | N02 (RSC) | Mittel |
| 11 | Caching-Schichten-Simulator | Next.js | N11 (Caching) | Schwer |
| 12 | Server-Action-Security-Audit | Next.js | N15 (Security) | Mittel-Schwer |
| 13 | Framework-Rosetta-Stone | Cross | Alle Review-Lektionen | Mittel |
| 14 | Architektur-Entscheidungs-Simulator | Cross | Alle Capstone-Lektionen | Schwer |
| 15 | Migration-Challenge | Cross | Alle Phase-4-Lektionen | Schwer |
