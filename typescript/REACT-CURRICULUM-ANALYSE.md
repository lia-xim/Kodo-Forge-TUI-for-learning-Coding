# React mit TypeScript -- Kompletter Lernpfad

> Tiefgruendige Analyse und Curriculum-Design fuer einen React-Lernkurs mit TypeScript-Fokus.
> Voraussetzung: Tiefe TypeScript-Kenntnisse (Phase 1-4 des TS-Curriculums), Angular-Erfahrung beruflich.

---

## Inhaltsverzeichnis

1. [Curriculum-Uebersicht](#curriculum-uebersicht)
2. [Phase 1: React Foundations mit TypeScript](#phase-1-react-foundations-mit-typescript)
3. [Phase 2: React Patterns & Architecture](#phase-2-react-patterns--architecture)
4. [Phase 3: Advanced React](#phase-3-advanced-react)
5. [Phase 4: React Ecosystem](#phase-4-react-ecosystem)
6. [TypeScript-Verbindungen (Gesamtmatrix)](#typescript-verbindungen)
7. [Angular-Vergleichsmatrix](#angular-vergleichsmatrix)
8. [Geschaetzter Umfang](#geschaetzter-umfang)
9. [Haeufige Schwierigkeiten und Stolpersteine](#haeufige-schwierigkeiten)
10. [Empfohlene Reihenfolge und Abhaengigkeiten](#abhaengigkeiten)

---

## Curriculum-Uebersicht

### Philosophie

Dieses Curriculum baut auf einer zentralen Erkenntnis auf: React und Angular verfolgen
**fundamental verschiedene Philosophien**. Angular gibt Struktur vor (opinionated, Decorators,
DI, Modules). React gibt Freiheit und Komposition (unopinionated, Hooks, Props, Context).

Fuer einen Angular-Entwickler bedeutet das:
- **Verlernen**: "Wo ist mein Service?" -- In React gibt es kein DI-System.
- **Umlernen**: "Wo ist mein Template?" -- JSX ist kein Template, sondern JavaScript.
- **Neulernen**: "Wie denke ich in React?" -- Unidirektionaler Datenfluss, Immutability, Composition.

### Gesamtstruktur

```
Phase 1: Foundations        (Lektionen R01-R10)   -- React sprechen lernen
Phase 2: Patterns           (Lektionen R11-R20)   -- React denken lernen
Phase 3: Advanced           (Lektionen R21-R30)   -- React meistern
Phase 4: Ecosystem          (Lektionen R31-R40)   -- React-Welt beherrschen
```

Jede Lektion folgt dem bewaehrten **LEARN-Zyklus** aus dem TypeScript-Kurs.

---

## Phase 1: React Foundations mit TypeScript

> Ziel: React verstehen, JSX lesen und schreiben, die Grundbausteine sicher beherrschen.

### R01 -- Projekt-Setup und mentales Modell

**Inhalt:**
- Vite + React + TypeScript Projekt aufsetzen
- Projektstruktur verstehen (src/, public/, index.html, main.tsx)
- React DevTools installieren und nutzen
- Das mentale Modell: UI = f(state) -- die zentrale Gleichung
- Strict Mode und warum er doppelt rendert

**TypeScript-Konzepte:**
- tsconfig.json fuer React (`jsx: "react-jsx"`, `lib: ["ES2022", "DOM", "DOM.Iterable"]`)
- `@types/react` und `@types/react-dom`
- Modul-Struktur mit `.tsx` Dateien

**Angular-Vergleich:**
| React | Angular |
|-------|---------|
| Vite (oder Next.js) | Angular CLI (`ng new`) |
| `main.tsx` mit `createRoot` | `main.ts` mit `bootstrapApplication` |
| Kein Module-System | `@NgModule` / Standalone Components |
| React DevTools | Angular DevTools |
| `UI = f(state)` | Change Detection + Zones/Signals |

**Geschaetzte Dauer:** ~60 Minuten
**Schwierigkeit:** Niedrig (aber konzeptionell wichtig)

---

### R02 -- JSX und TSX verstehen

**Inhalt:**
- JSX ist KEIN HTML -- es ist JavaScript (bzw. TypeScript)
- JSX-Ausdruecke mit `{}`
- JSX vs. Angular Templates: fundamentale Unterschiede
- Attribute vs. Properties (className, htmlFor, etc.)
- Fragments (`<>...</>` und `<React.Fragment>`)
- JSX als Ausdruck: Variablen, Ternary, Map
- TypeScript: Was `React.JSX.Element` und `React.ReactNode` bedeuten

**TypeScript-Konzepte:**
- `React.JSX.Element` -- der Rueckgabetyp von JSX-Ausdruecken
- `React.ReactNode` -- der Union-Typ fuer alles, was React rendern kann
- `React.JSX.IntrinsicElements` -- wie HTML-Elemente typisiert sind (Declaration Merging!)
- Generics in JSX: `<Component<T> prop={...} />`

**Angular-Vergleich:**
| React (JSX/TSX) | Angular (Templates) |
|------------------|---------------------|
| `{variable}` | `{{ variable }}` (Interpolation) |
| `{condition && <El />}` | `@if (condition) { <El /> }` |
| `{items.map(i => <El key={i.id} />)}` | `@for (i of items; track i.id) { <El /> }` |
| `className="..."` | `class="..."` |
| `onClick={handler}` | `(click)="handler()"` |
| `<>{...}</>` (Fragment) | `<ng-container>` |
| Alles ist JS/TS-Ausdruck | Template-eigene Syntax (Pipes, Directives) |

**Kernunterschied**: In Angular schreibt man Templates mit einer eigenen DSL (Directives,
Pipes, Control Flow). In React schreibt man JavaScript/TypeScript direkt. Das bedeutet:
die volle Macht der Sprache steht im "Template" zur Verfuegung, aber auch die volle
Verantwortung.

**Geschaetzte Dauer:** ~60 Minuten
**Schwierigkeit:** Mittel (Umdenken von Angular-Templates)

---

### R03 -- Components und Props mit TypeScript

**Inhalt:**
- Function Components (der Standard seit React 16.8+)
- `React.FC` vs. einfache Funktionen -- und warum `React.FC` nicht mehr empfohlen wird
- Props typisieren: Interface vs. Type Alias
- Destructuring in der Funktionssignatur
- Default Values fuer Props
- Children als Prop
- Die `PropsWithChildren` Utility

**TypeScript-Konzepte:**
- Interface fuer Props (Konvention: `interface XxxProps { ... }`)
- `React.PropsWithChildren<P>` (Mapped Type unter der Haube)
- Optional Properties (`?:`)
- Readonly Properties (Props sind konzeptionell readonly)
- Type Narrowing bei optionalen Props

**Angular-Vergleich:**
| React | Angular |
|-------|---------|
| Props (Funktions-Parameter) | `@Input()` / `input()` (Signal-based) |
| `interface ButtonProps { label: string }` | `@Input() label!: string` oder `label = input.required<string>()` |
| `<Button label="Click" />` | `<app-button label="Click" />` |
| Children (`props.children`) | Content Projection (`<ng-content>`) |
| Kein Selector noetig | Component Selector (`selector: 'app-button'`) |
| Default via Destructuring `= 'default'` | `input<string>({ initialValue: 'default' })` |

**Code-Beispiel (React):**
```typescript
// Props-Interface definieren
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';  // Optional mit Union Literal
  onClick: () => void;
  children?: React.ReactNode;          // Oder: PropsWithChildren verwenden
}

// Function Component (empfohlener Stil)
function Button({ label, variant = 'primary', onClick, children }: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children ?? label}
    </button>
  );
}
```

**Geschaetzte Dauer:** ~70 Minuten
**Schwierigkeit:** Mittel

---

### R04 -- State mit useState und TypeScript-Generics

**Inhalt:**
- `useState` Grundlagen: State ist immutable
- TypeScript-Inference bei `useState`: Wann reicht sie, wann nicht?
- Explizite Generics: `useState<Type>(initialValue)`
- Haeufige Faelle: `useState<string | null>(null)`, `useState<User[]>([])`
- State-Updates: Warum `setState(prev => ...)` oft besser ist als `setState(newValue)`
- Object-State vs. multiple useState-Aufrufe
- Immutability-Patterns: Spread, `structuredClone`, Immer

**TypeScript-Konzepte:**
- Generics (`useState<T>`)
- Union Types fuer nullable State (`useState<User | null>(null)`)
- Type Inference (wenn `useState(0)` reicht)
- `as const` fuer readonly Initialwerte
- Readonly-Arrays und Spread fuer immutable Updates

**Angular-Vergleich:**
| React | Angular |
|-------|---------|
| `useState(initialValue)` | Property + Change Detection / `signal(initialValue)` |
| `setState(newValue)` | `this.prop = newValue` / `this.prop.set(newValue)` |
| `setState(prev => prev + 1)` | `this.prop.update(prev => prev + 1)` |
| Re-Render bei setState | Change Detection / Signal Notification |
| State ist immutable (Konvention) | State ist mutable (traditionell) / immutable (Signals) |
| Multiple `useState` | Multiple Properties / Signals |

**Kernunterschied**: In Angular aenderst du traditionell direkt Werte auf der
Komponenteninstanz (`this.count = 5`). In React erzeugst du immer einen NEUEN Wert.
Dieser Immutability-Zwang ist der haeufigste Stolperstein fuer Angular-Entwickler.
Angular Signals naehern sich diesem Modell an, sind aber noch nicht ueberall Standard.

**Geschaetzte Dauer:** ~80 Minuten
**Schwierigkeit:** Mittel-Hoch (Immutability ist das groesste Umdenken)

---

### R05 -- Event Handling mit TypeScript

**Inhalt:**
- Synthetische Events in React (SyntheticEvent-Wrapper)
- Event-Handler direkt vs. als separate Funktion
- Die wichtigsten Event-Typen: `React.MouseEvent`, `React.ChangeEvent`, `React.FormEvent`
- Generische Event-Typen: `React.ChangeEvent<HTMLInputElement>`
- Event-Handler-Typen: `React.MouseEventHandler<HTMLButtonElement>`
- `currentTarget` vs. `target` und ihre Typen
- Controlled Form-Inputs: `value` + `onChange`

**TypeScript-Konzepte:**
- Generic Types (`React.ChangeEvent<HTMLInputElement>`)
- Typ-Hierarchie der Event-Typen
- `HTMLElementTagNameMap` (wie TS HTML-Elemente typisiert)
- Function Types fuer Event-Handler Callbacks in Props
- `React.ComponentProps<'button'>` -- alle Props eines HTML-Elements extrahieren

**Angular-Vergleich:**
| React | Angular |
|-------|---------|
| `onClick={handler}` | `(click)="handler()"` |
| `onChange={e => ...}` | `(change)="handler($event)"` / `(ngModelChange)="..."` |
| `React.ChangeEvent<HTMLInputElement>` | `Event` / `InputEvent` (nativer DOM-Event) |
| Synthetische Events (genormter Wrapper) | Native DOM Events |
| Handler als Props weitergeben | `@Output()` / `output()` mit `EventEmitter` |
| `<input value={v} onChange={fn} />` (Controlled) | `[(ngModel)]="v"` (Two-Way Binding) |

**Kernunterschied**: Angular hat Two-Way Binding (`[(ngModel)]`). React nicht.
In React ist alles One-Way: `value` + `onChange` Handler. Das fuehlt sich anfangs
umstaendlich an, ist aber expliziter und einfacher zu debuggen.

**Geschaetzte Dauer:** ~60 Minuten
**Schwierigkeit:** Mittel

---

### R06 -- useEffect: Seiteneffekte und Lifecycle

**Inhalt:**
- Was ist ein "Effekt"? (Synchronisation mit externen Systemen)
- Dependency Array: `[]`, `[dep]`, kein Array
- Cleanup-Funktion: Warum und wann
- Haeufige Anwendungsfaelle: API-Calls, Event-Listener, Timer
- Die neue Denkweise: "Denke in Synchronisation, nicht in Lifecycle"
- Strict Mode und doppeltes Ausfuehren (kein Bug, sondern Feature)
- Wann useEffect NICHT verwenden (derived state, event-basierte Logik)

**TypeScript-Konzepte:**
- Korrekte Typisierung des Cleanup-Returns (`void | (() => void)`)
- Async in useEffect: Warum `async` nicht direkt geht und wie man es loest
- Typisierung von Fetch-Responses

**Angular-Vergleich:**
| React | Angular |
|-------|---------|
| `useEffect(() => {}, [])` | `ngOnInit()` |
| `useEffect(() => {}, [dep])` | `ngOnChanges(changes)` / `effect(() => { ... })` |
| `useEffect cleanup return` | `ngOnDestroy()` / `DestroyRef.onDestroy()` |
| Dependency Array (explizit) | RxJS Subscriptions / Signal `effect()` (auto-tracked) |
| "Synchronisation mit externem System" | Lifecycle Hooks |

**Kernunterschied**: In Angular denkst du in Lifecycle-Phasen (Init, Changes, Destroy).
In React denkst du in Synchronisation: "Halte X synchron mit Y". Das Dependency Array
ist die Schnittstelle. Angular Signals mit `effect()` kommen diesem Modell naeher.

**Haeufige Falle:** Angular-Entwickler neigen dazu, useEffect wie `ngOnInit` zu
verwenden -- fuer alles. In React ist useEffect ein Escape-Hatch, kein Standard-Tool.

**Geschaetzte Dauer:** ~90 Minuten (komplexestes Thema der Phase 1)
**Schwierigkeit:** Hoch

---

### R07 -- useRef, useMemo, useCallback

**Inhalt:**
- `useRef`: DOM-Zugriff und persistente Werte ohne Re-Render
- `useRef<HTMLInputElement>(null)` -- korrektes Typing fuer DOM-Refs
- `useRef<number>(0)` -- als Instanzvariable (wie `this.x` in Angular)
- `useMemo`: Berechnete Werte cachen
- `useCallback`: Funktionen referenzstabil halten
- Wann diese Hooks NICHT verwenden (Premature Optimization)
- React Compiler: Warum useMemo/useCallback bald obsolet werden koennten

**TypeScript-Konzepte:**
- `useRef<T>` Generics und die Unterscheidung `MutableRefObject<T>` vs. `RefObject<T>`
- `useRef<T>(null)` ergibt `RefObject<T | null>` (readonly `.current`)
- `useRef<T>(initialValue)` ergibt `MutableRefObject<T>` (mutable `.current`)
- Generics bei `useMemo<T>` und `useCallback<T>`

**Angular-Vergleich:**
| React | Angular |
|-------|---------|
| `useRef<HTMLInputElement>(null)` | `@ViewChild('ref')` / `viewChild<ElementRef>('ref')` |
| `useRef<number>(0)` (Instanzvariable) | `private count = 0` (Class Property) |
| `useMemo(() => compute(a, b), [a, b])` | `computed(() => compute(a(), b()))` (Signal) |
| `useCallback(fn, [deps])` | Kein Equivalent noetig (Methoden auf Klasse sind stabil) |
| React Compiler (automatische Memoization) | Signal-based Reactivity (Signals, computed) |

**Kernunterschied**: In Angular-Klassen sind Methoden automatisch referenzstabil (gleiche
Instanz). In React-Funktionskomponenten werden Funktionen bei jedem Render neu erstellt.
Daher braucht React `useCallback`. Angular Signals mit `computed()` sind das naechste
Equivalent zu `useMemo`.

**Geschaetzte Dauer:** ~70 Minuten
**Schwierigkeit:** Mittel-Hoch

---

### R08 -- Conditional Rendering und Listen

**Inhalt:**
- Conditional Rendering: `&&`, Ternary, Early Return, IIFE
- Die `0`-Falle bei `&&` (`count && <Component />` zeigt "0")
- Listen rendern mit `map()`
- Keys: Warum sie wichtig sind und warum `index` schlecht ist
- Fragmentierte Listen: `<React.Fragment key={id}>`
- Nested Lists und Performance

**TypeScript-Konzepte:**
- Truthiness-Narrowing in JSX
- `Array.map` mit explizitem Rueckgabetyp
- `key` als reserviertes Attribut (nicht in Props-Interface)

**Angular-Vergleich:**
| React | Angular |
|-------|---------|
| `{condition && <El />}` | `@if (condition) { <El /> }` |
| `{cond ? <A /> : <B />}` | `@if (cond) { <A /> } @else { <B /> }` |
| `{items.map(i => <El key={i.id} />)}` | `@for (i of items; track i.id) { <El /> }` |
| `key={item.id}` (Reconciliation-Hint) | `track item.id` (Tracking-Funktion) |
| Alles in JS/TS (map, filter, &&) | Eigene Template-Syntax |

**Geschaetzte Dauer:** ~50 Minuten
**Schwierigkeit:** Niedrig-Mittel

---

### R09 -- Component Composition und Children-Patterns

**Inhalt:**
- Composition over Inheritance (React-Grundprinzip)
- `children` vs. Render Props
- Slot-Pattern: Benannte Bereiche via Props
- Component Composition vs. Angular Content Projection
- Containment vs. Specialization
- Lifting State Up: Wo lebt der State?

**TypeScript-Konzepte:**
- `React.ReactNode` fuer children
- `React.ReactElement` vs. `React.ReactNode` (Unterschied!)
- Props mit Render-Funktionen typisieren: `render: (data: T) => React.ReactNode`
- Generic Component Props

**Angular-Vergleich:**
| React | Angular |
|-------|---------|
| `props.children` | `<ng-content>` (Default Slot) |
| Named Props als Slots | `<ng-content select="...">` (Named Slots) |
| Composition via Props | Content Projection |
| Lifting State Up | `@Input()/@Output()` / Shared Service |
| "Favor Composition" | "Favor Composition" (gleich, aber OOP-Stil) |

**Geschaetzte Dauer:** ~60 Minuten
**Schwierigkeit:** Mittel

---

### R10 -- Phase-1 Review Challenge

**Inhalt:**
- Mini-Projekt: Eine vollstaendige Komponenten-Hierarchie bauen
- Beispiel: Todo-App oder Kontaktliste
- Alle Phase-1-Konzepte integriert anwenden
- Self-Assessment Checkliste

**Geschaetzte Dauer:** ~120 Minuten
**Schwierigkeit:** Mittel (Integration aller Konzepte)

---

## Phase 2: React Patterns & Architecture

> Ziel: Fortgeschrittene Patterns beherrschen, die in realen Anwendungen taeglich vorkommen.

### R11 -- Custom Hooks: Logik typsicher extrahieren

**Inhalt:**
- Was ist ein Custom Hook? (Funktionen mit `use`-Praefix)
- Regeln der Hooks (Rules of Hooks)
- Custom Hooks extrahieren: `useFetch`, `useLocalStorage`, `useDebounce`
- Generische Custom Hooks
- Testing von Custom Hooks

**TypeScript-Konzepte:**
- Generics in Custom Hooks: `function useFetch<T>(url: string): { data: T | null; ... }`
- Tuple-Rueckgabe typisieren: `[T, (v: T) => void]` (wie `useState`)
- Overloads fuer Custom Hooks
- Discriminated Union als Rueckgabewert (`{ status: 'loading' } | { status: 'success'; data: T }`)

**Angular-Vergleich:**
| React | Angular |
|-------|---------|
| Custom Hook (`useXxx`) | Service (`@Injectable()`) |
| Komposition via Hook-Aufrufe | Dependency Injection |
| In jeder Komponente aufrufbar | Via Constructor/`inject()` injizierbar |
| Eigener State pro Aufruf (Instanz) | Singleton (providedIn: 'root') oder pro Component |
| Kein DI-System noetig | DI-System ist Kern des Frameworks |

**Kernunterschied**: Custom Hooks sind Funktionen, die State und Logik kapseln.
Services sind Klassen, die via DI injiziert werden. Hooks sind leichtgewichtiger,
aber weniger strukturiert. In grossen Anwendungen vermisst man manchmal die
Erzwingung von Angular's DI.

**Geschaetzte Dauer:** ~80 Minuten
**Schwierigkeit:** Mittel-Hoch

---

### R12 -- Context API: Globaler State typsicher

**Inhalt:**
- `createContext` mit TypeScript
- Provider und Consumer Pattern
- `useContext` Hook
- Context vs. Prop Drilling: Wann Context nutzen?
- Multi-Context Pattern
- Performance-Problem: Warum Context zum Re-Rendering fuehrt
- Context + useReducer: Der "Mini-Redux"

**TypeScript-Konzepte:**
- `createContext<T>(defaultValue)` mit Generics
- Non-null Context Pattern: `createContext<T>(null!)` + Custom Hook mit Guard
- Context-Typen als Interface definieren
- Discriminated Unions fuer Complex Context State

**Angular-Vergleich:**
| React | Angular |
|-------|---------|
| `createContext()` + `<Provider>` | `@Injectable({ providedIn: 'root' })` |
| `useContext(MyContext)` | `inject(MyService)` / Constructor Injection |
| Context Re-Render Problem | Kein Equivalent (Services loesen kein Re-Render aus) |
| `<MyContext.Provider value={...}>` | `providers: [MyService]` im Component-Decorator |
| Kein Hierarchisches DI | Hierarchisches DI (Root/Module/Component Level) |

**Kernunterschied**: Angular's DI ist maechtiger als React Context. DI kann
verschiedene Implementierungen pro Level bereitstellen, hat Injector-Hierarchien,
und loest keine Re-Renders aus. Context ist einfacher, aber weniger leistungsfaehig.
Fuer "echtes" State Management nutzt man in React externe Libraries.

**Geschaetzte Dauer:** ~80 Minuten
**Schwierigkeit:** Hoch

---

### R13 -- useReducer: Komplexer State mit Discriminated Unions

**Inhalt:**
- `useReducer` Grundlagen: Wann statt `useState`?
- Actions als Discriminated Unions
- Reducer-Funktion: `(state: S, action: A) => S`
- Exhaustive Checks im Reducer (satisfies never)
- useReducer + Context = Flux/Redux-Lite
- Vergleich mit Redux/Zustand

**TypeScript-Konzepte:**
- Discriminated Unions fuer Actions (DAS React-TypeScript-Muster schlechthin)
- `useReducer<S, A>` Generics
- `satisfies never` fuer exhaustive Switches
- Readonly State-Typen
- Mapped Types fuer Action Creators

**Angular-Vergleich:**
| React | Angular |
|-------|---------|
| `useReducer(reducer, initialState)` | NgRx Store / Akita / NGXS |
| Action Discriminated Unions | NgRx Actions (`createAction()`) |
| Reducer Funktion | NgRx Reducer (`createReducer()`) |
| `dispatch(action)` | `store.dispatch(action)` |
| useReducer + Context | NgRx Store (Global State Management) |

**Kernunterschied**: In Angular ist Redux-artiges State Management (NgRx) ein grosses
externes Framework. In React ist die Grundlage (`useReducer`) eingebaut. Das Prinzip
ist identisch (Flux-Pattern), aber React macht es leichtgewichtiger.

**Geschaetzte Dauer:** ~80 Minuten
**Schwierigkeit:** Hoch (aber TS-Discriminated-Unions sind bereits bekannt)

---

### R14 -- Error Boundaries und Error Handling

**Inhalt:**
- Error Boundaries: Class Component (einziger verbleibender Use Case fuer Klassen)
- `getDerivedStateFromError` und `componentDidCatch`
- Warum es keinen Hook fuer Error Boundaries gibt
- react-error-boundary Library (empfohlen)
- Error-Handling-Patterns: Fallback UI, Retry, Reset
- Error Handling in Async (Error Boundaries + Suspense)

**TypeScript-Konzepte:**
- Class Component Types: `React.Component<Props, State>`
- `React.ErrorInfo` Type
- Generic Error Boundary Components
- `FallbackProps` Interface

**Angular-Vergleich:**
| React | Angular |
|-------|---------|
| Error Boundary (Component) | `ErrorHandler` (globaler Service) |
| `componentDidCatch` | `ErrorHandler.handleError()` |
| Fallback UI pro Boundary | Globales Error Handling (kein komponentenbasiertes) |
| `<ErrorBoundary fallback={<Err />}>` | Kein Equivalent (Custom-Loesung noetig) |

**Geschaetzte Dauer:** ~50 Minuten
**Schwierigkeit:** Mittel

---

### R15 -- Suspense und React.lazy

**Inhalt:**
- Code Splitting mit `React.lazy()` und dynamischen Imports
- `<Suspense fallback={...}>` fuer Ladezustaende
- Suspense fuer Data Fetching (mit TanStack Query oder use-Hook)
- Nested Suspense Boundaries
- `useTransition` und `useDeferredValue`
- Concurrent Features Ueberblick

**TypeScript-Konzepte:**
- `React.lazy<T>(() => import(...))` Generics
- `React.Suspense` Props-Typen
- `React.ComponentType<T>` fuer lazy-loaded Components
- Promise-basierte Typen fuer Suspense-kompatible Datenquellen

**Angular-Vergleich:**
| React | Angular |
|-------|---------|
| `React.lazy(() => import(...))` | `loadComponent: () => import(...)` (Lazy Routes) |
| `<Suspense fallback={<Loading />}>` | Kein direktes Equivalent (Route Resolver, Loading State) |
| Suspense fuer Data Fetching | `@defer { ... } @loading { ... }` (Template-Syntax) |
| `useTransition` | Kein Equivalent |

**Geschaetzte Dauer:** ~60 Minuten
**Schwierigkeit:** Mittel-Hoch

---

### R16 -- Forms: Controlled, Uncontrolled, Libraries

**Inhalt:**
- Controlled Components: `value` + `onChange`
- Uncontrolled Components: `useRef` + `defaultValue`
- Wann welchen Ansatz nutzen?
- Form-Validierung: Manuell vs. Library
- React Hook Form: Integration und TypeScript
- Zod + React Hook Form: Schema-basierte Validierung

**TypeScript-Konzepte:**
- Generic Form Types
- Zod Schemas und `z.infer<typeof schema>`
- `UseFormReturn<T>` und `FieldErrors<T>`
- Discriminated Unions fuer Validierungszustaende

**Angular-Vergleich:**
| React | Angular |
|-------|---------|
| Controlled Input (`value` + `onChange`) | Template-Driven Forms (`ngModel`) |
| Uncontrolled Input (`useRef`) | Kein direktes Equivalent |
| React Hook Form | Reactive Forms (`FormGroup`, `FormControl`) |
| Zod Schema Validation | Built-in Validators + Custom Validators |
| `useForm<FormData>()` | `FormBuilder.group<FormData>({...})` |

**Kernunterschied**: Angular hat zwei eingebaute Form-Systeme (Template-Driven und
Reactive Forms) mit starker TypeScript-Integration (Typed Forms seit Angular 14).
React hat nichts eingebaut -- man waehlt eine Library oder baut es selbst.
React Hook Form + Zod ist der de-facto Standard.

**Geschaetzte Dauer:** ~90 Minuten
**Schwierigkeit:** Hoch (viele Konzepte, Library-Integration)

---

### R17 -- Styling in React

**Inhalt:**
- CSS Modules (`.module.css`)
- Tailwind CSS Integration
- CSS-in-JS: styled-components (Legacy, aber haeufig in Bestandscode)
- Inline Styles und `React.CSSProperties`
- Conditional Styling Patterns
- Empfehlung: Tailwind + CSS Modules fuer 2025+

**TypeScript-Konzepte:**
- `React.CSSProperties` Interface
- CSS Module Type Declarations (`.d.ts` fuer Module)
- Template Literal Types fuer Tailwind-Klassennamen (fortgeschritten)

**Angular-Vergleich:**
| React | Angular |
|-------|---------|
| CSS Modules | Component Styles (View Encapsulation) |
| `className={styles.button}` | `[class]="..."` / `[ngClass]="..."` |
| Kein View Encapsulation | Emulated / ShadowDom Encapsulation |
| Tailwind (populaerste Wahl) | Tailwind (ebenfalls populaer) |
| styled-components (CSS-in-JS) | Kein gaengiges Equivalent |

**Geschaetzte Dauer:** ~50 Minuten
**Schwierigkeit:** Niedrig-Mittel

---

### R18-R20 -- Vertiefung und Review

- **R18**: Fortgeschrittene Hook-Patterns (useId, useSyncExternalStore, useInsertionEffect)
- **R19**: Data Fetching Patterns (SWR/TanStack Query Grundlagen, optimistic Updates)
- **R20**: Phase-2 Review Challenge (mittlere Anwendung mit State, Context, Forms, Error Handling)

---

## Phase 3: Advanced React

> Ziel: Patterns fuer Library-Autoren und komplexe Anwendungen beherrschen.

### R21 -- Render Props und Higher-Order Components

**Inhalt:**
- Render Props Pattern (Legacy, aber in vielen Libraries)
- Higher-Order Components (HOC): `withAuth`, `withTheme`
- Warum Hooks diese Patterns weitgehend ersetzt haben
- Wann Render Props/HOCs noch sinnvoll sind
- TypeScript-Herausforderungen bei HOCs

**TypeScript-Konzepte:**
- HOC-Typen: `<P extends BaseProps>(Component: React.ComponentType<P>) => React.ComponentType<Omit<P, keyof InjectedProps>>`
- `React.ComponentType<P>` und `React.ComponentProps<T>`
- Intersection Types fuer Prop-Injection
- Generic Constraints bei HOCs

**Geschaetzte Dauer:** ~60 Minuten
**Schwierigkeit:** Hoch

---

### R22 -- Compound Components Pattern

**Inhalt:**
- Das Compound Components Pattern (Tab, Accordion, Dropdown)
- Impliziter State via Context
- `React.Children` API und Alternativen
- Flexible vs. Fixed Compound Components
- Accessible Compound Components

**TypeScript-Konzepte:**
- Namespace-Exports: `Tabs.Tab`, `Tabs.Panel`
- Context-basierte Type Safety
- `React.Children.map` Typen

**Geschaetzte Dauer:** ~70 Minuten
**Schwierigkeit:** Hoch

---

### R23 -- Polymorphic Components (as Prop)

**Inhalt:**
- Was ist ein Polymorphic Component? (`<Button as="a" href="..." />`)
- Die `as` Prop implementieren
- Props abhaengig vom Element-Typ
- Libraries die das nutzen: Chakra UI, Radix, Headless UI

**TypeScript-Konzepte:**
- `React.ElementType` -- der Typ fuer die `as` Prop
- `React.ComponentPropsWithRef<E>` / `React.ComponentPropsWithoutRef<E>`
- Conditional Types: Props abhaengig vom Element-Typ
- Generic Components mit Constraints
- Polymorpher Typ: `<E extends React.ElementType = 'button'>`

**Code-Beispiel:**
```typescript
type ButtonProps<E extends React.ElementType = 'button'> = {
  as?: E;
  variant?: 'primary' | 'secondary';
} & Omit<React.ComponentPropsWithoutRef<E>, 'as' | 'variant'>;

function Button<E extends React.ElementType = 'button'>({
  as,
  variant = 'primary',
  ...props
}: ButtonProps<E>) {
  const Component = as ?? 'button';
  return <Component className={`btn-${variant}`} {...props} />;
}

// Nutzung:
<Button onClick={() => {}}>Click</Button>              // Rendert <button>
<Button as="a" href="/page">Link</Button>              // Rendert <a>, href ist valide
<Button as="a" onClick={() => {}}>Link</Button>        // Rendert <a>, onClick ist valide
// @ts-expect-error: href existiert nicht auf <button>
<Button href="/page">Fehler</Button>
```

**Geschaetzte Dauer:** ~80 Minuten
**Schwierigkeit:** Sehr Hoch (eines der komplexesten TS+React Patterns)

---

### R24 -- Generic Components

**Inhalt:**
- Generische Select/List/Table Komponenten
- Type-safe Data Tables
- Generic Props mit Constraints
- Generische Form-Felder

**TypeScript-Konzepte:**
- Generics auf Komponentenebene: `function List<T>({ items }: { items: T[] })`
- `keyof T` fuer Property-Zugriff
- Constraints: `<T extends { id: string }>`
- Generics in JSX: `<List<User> items={users} />`

**Code-Beispiel:**
```typescript
interface SelectProps<T> {
  items: T[];
  selected: T | null;
  getLabel: (item: T) => string;
  getKey: (item: T) => string;
  onChange: (item: T) => void;
}

function Select<T>({ items, selected, getLabel, getKey, onChange }: SelectProps<T>) {
  return (
    <select
      value={selected ? getKey(selected) : ''}
      onChange={e => {
        const item = items.find(i => getKey(i) === e.target.value);
        if (item) onChange(item);
      }}
    >
      {items.map(item => (
        <option key={getKey(item)} value={getKey(item)}>
          {getLabel(item)}
        </option>
      ))}
    </select>
  );
}

// Nutzung -- T wird inferiert:
<Select
  items={users}
  selected={selectedUser}
  getLabel={u => u.name}      // u ist User (inferiert!)
  getKey={u => u.id}
  onChange={u => setUser(u)}   // u ist User (inferiert!)
/>
```

**Geschaetzte Dauer:** ~70 Minuten
**Schwierigkeit:** Hoch

---

### R25 -- React.forwardRef mit Generics

**Inhalt:**
- Warum `ref` kein normales Prop ist
- `React.forwardRef` Grundlagen
- forwardRef mit TypeScript: `React.forwardRef<RefType, Props>`
- forwardRef + Generics: Die Limitation und Workarounds
- `useImperativeHandle`: Custom Ref API
- React 19: `ref` als normales Prop (Breaking Change)

**TypeScript-Konzepte:**
- `React.forwardRef<HTMLInputElement, InputProps>`
- `React.Ref<T>` und `React.RefObject<T>`
- Workaround fuer Generic forwardRef (Type Assertion oder Wrapper)
- `useImperativeHandle` Typisierung

**Geschaetzte Dauer:** ~60 Minuten
**Schwierigkeit:** Hoch

---

### R26 -- Performance: Memo, Profiler, React Compiler

**Inhalt:**
- `React.memo()`: Wann und warum
- Referenzielle Gleichheit verstehen
- `useMemo` und `useCallback` Revisited (mit Profiler-Daten)
- React DevTools Profiler
- React Compiler (React 19+): Automatische Memoization
- Wann manuelles Memoizing noch noetig ist
- Virtualisierung grosser Listen (@tanstack/virtual)

**TypeScript-Konzepte:**
- `React.memo<Props>` Generics
- `React.NamedExoticComponent<Props>` (Rueckgabetyp von memo)
- Performance-Typen: `React.ProfilerOnRenderCallback`

**Angular-Vergleich:**
| React | Angular |
|-------|---------|
| `React.memo(Component)` | `changeDetection: OnPush` |
| React Compiler | Signal-based Components (automatisch) |
| Virtual Scrolling (@tanstack/virtual) | `@angular/cdk` Virtual Scrolling |
| React DevTools Profiler | Angular DevTools Profiler |

**Geschaetzte Dauer:** ~80 Minuten
**Schwierigkeit:** Hoch

---

### R27 -- Testing: Vitest + Testing Library

**Inhalt:**
- Testing-Philosophie: "Test wie ein User interagiert"
- Vitest Setup mit React
- `@testing-library/react`: render, screen, fireEvent, userEvent
- Component Tests: Props, State, Events
- Custom Hook Tests: `renderHook`
- Mocking: API-Calls, Context, Router
- Accessibility-Tests: `jest-axe`

**TypeScript-Konzepte:**
- Test-Utility-Typen: `RenderResult`, `RenderHookResult`
- Typsichere Mocks: `vi.fn<Parameters, ReturnType>`
- Generic Test-Helpers
- Type-safe Test Fixtures

**Angular-Vergleich:**
| React | Angular |
|-------|---------|
| Vitest + Testing Library | Jasmine/Karma oder Jest |
| `render(<Component />)` | `TestBed.createComponent(Component)` |
| `screen.getByRole('button')` | `fixture.debugElement.query(By.css('button'))` |
| `userEvent.click(button)` | `button.nativeElement.click()` + `detectChanges()` |
| `renderHook(() => useXxx())` | Kein Equivalent (Services testen via TestBed) |
| Kein Change Detection | `fixture.detectChanges()` noetig |

**Geschaetzte Dauer:** ~90 Minuten
**Schwierigkeit:** Mittel-Hoch

---

### R28-R30 -- Vertiefung und Review

- **R28**: Accessible Components (ARIA, Keyboard Navigation, Focus Management)
- **R29**: Advanced Patterns (State Machine Components, Headless Components, Inversion of Control)
- **R30**: Phase-3 Review Challenge (Component Library bauen: Button, Input, Modal, Tabs)

---

## Phase 4: React Ecosystem

> Ziel: Die wichtigsten Libraries und Tools des React-Oekosystems produktiv einsetzen.

### R31 -- State Management: Zustand

**Inhalt:**
- Warum externes State Management? (Context-Limitierungen)
- Zustand: Minimal, TypeScript-first
- Store erstellen, Actions, Selectors
- Middleware: `persist`, `devtools`, `immer`
- Zustand vs. Redux Toolkit vs. Jotai

**TypeScript-Konzepte:**
- Store-Typen als Interface
- `create<StoreType>()` mit Generics
- Selector-Typen: `(state: Store) => Slice`
- Middleware-Typen und Type Inference

**Angular-Vergleich:**
| React | Angular |
|-------|---------|
| Zustand Store | NgRx Store / Signal Store |
| `const useStore = create<Store>(...)` | `@Injectable() class Store extends ComponentStore<T>` |
| `useStore(selector)` | `this.store.select(selector)` |
| Middleware (persist, devtools) | Meta-Reducers, Effects |

**Geschaetzte Dauer:** ~70 Minuten
**Schwierigkeit:** Mittel

---

### R32 -- Server State: TanStack Query

**Inhalt:**
- Server State vs. Client State (fundamentale Unterscheidung)
- TanStack Query Grundlagen: `useQuery`, `useMutation`
- Caching, Stale-While-Revalidate, Background Refetch
- Optimistic Updates
- Infinite Queries (`useInfiniteQuery`)
- Query Keys und ihre Typisierung
- QueryClient Konfiguration

**TypeScript-Konzepte:**
- `useQuery<TData, TError>` Generics
- Query Key Factories (typsicher)
- Discriminated Union fuer Query Status
- Generic API-Wrapper

**Angular-Vergleich:**
| React | Angular |
|-------|---------|
| TanStack Query | HttpClient + RxJS Operators / TanStack Query Angular |
| `useQuery({ queryKey, queryFn })` | `this.http.get<T>(url).pipe(...)` |
| Automatisches Caching | Manuelles Caching (ShareReplay, BehaviorSubject) |
| `useMutation` | `this.http.post<T>(url, body)` |
| Stale-While-Revalidate | Manuell implementieren |

**Kernunterschied**: TanStack Query abstrahiert enorm viel, was man in Angular manuell
mit RxJS implementiert (Caching, Retry, Refetching, Garbage Collection). Es gibt
inzwischen auch TanStack Query fuer Angular, aber der RxJS-Weg ist noch verbreiteter.

**Geschaetzte Dauer:** ~90 Minuten
**Schwierigkeit:** Hoch

---

### R33 -- Routing: React Router / TanStack Router

**Inhalt:**
- React Router v7: Grundlagen (Routes, Link, useParams, useNavigate)
- Nested Routes und Layouts
- Route-Parameter typisieren
- Route Guards (Protected Routes)
- TanStack Router: Type-safe Routing
- File-based Routing (Ueberleitung zu Next.js)

**TypeScript-Konzepte:**
- Route-Parameter als Generics
- `useParams<{ id: string }>()`
- TanStack Router: Volle Type Safety fuer Routen, Search Params, Loader
- `RouteObject` Typen

**Angular-Vergleich:**
| React | Angular |
|-------|---------|
| React Router | Angular Router |
| `<Route path="/user/:id" element={<User />} />` | `{ path: 'user/:id', component: UserComponent }` |
| `useParams()` | `ActivatedRoute.params` / `input()` from Route |
| `<Outlet />` | `<router-outlet>` |
| `useNavigate()` | `Router.navigate()` |
| Protected Route (Component Wrapper) | Route Guards (`canActivate`, `canMatch`) |
| TanStack Router (type-safe) | Typed Routes (Angular 16+, begrenzt) |

**Geschaetzte Dauer:** ~80 Minuten
**Schwierigkeit:** Mittel

---

### R34 -- Animation: Framer Motion

**Inhalt:**
- Framer Motion Grundlagen: `motion.div`, `animate`, `variants`
- Layout Animations
- Shared Layout Animations (`layoutId`)
- Exit Animations (`AnimatePresence`)
- Gesture Animations (drag, hover, tap)
- Performance-Tipps

**TypeScript-Konzepte:**
- `HTMLMotionProps<'div'>` und motion-Component-Typen
- Variant-Typen definieren
- Animation-Typen: `TargetAndTransition`, `Variant`

**Geschaetzte Dauer:** ~60 Minuten
**Schwierigkeit:** Mittel

---

### R35 -- Server Components Grundlagen

**Inhalt:**
- Was sind Server Components? (React Server Components Konzept)
- Client vs. Server: Welcher Code wo?
- `'use client'` und `'use server'` Directives
- Warum Server Components die Zukunft sind
- Einschraenkungen (kein State, keine Hooks, keine Browser-APIs)
- Ueberleitung zu Next.js

**TypeScript-Konzepte:**
- `async` Function Components (Server Components koennen async sein!)
- Server/Client Boundary Types
- Serialisierbare Props (keine Funktionen ueber die Grenze!)

**Angular-Vergleich:**
| React | Angular |
|-------|---------|
| React Server Components | Angular SSR / Analog (experimentell) |
| `'use client'` Directive | Kein Equivalent (alles ist "Client") |
| Server Component (async, kein State) | Kein Equivalent |
| Next.js App Router | Angular Universal / Analog |

**Geschaetzte Dauer:** ~60 Minuten
**Schwierigkeit:** Hoch (neues mentales Modell)

---

### R36-R40 -- Vertiefung, Integration, Capstone

- **R36**: Accessibility Deep Dive (Screen Reader Testing, ARIA Patterns, Focus Trap)
- **R37**: Internationalisierung (i18next, react-intl, TypeScript-Typen fuer Uebersetzungen)
- **R38**: Monorepo & Architecture (Nx, Turborepo, Shared Types zwischen Packages)
- **R39**: Migration Patterns (Angular zu React, inkrementelle Migration, Module Federation)
- **R40**: Capstone Project (Vollstaendige Anwendung mit Router, State, Query, Forms, Tests)

---

## TypeScript-Verbindungen

### Vollstaendige Matrix: React-Konzept zu TypeScript-Feature

| React-Konzept | TypeScript-Feature | TS-Lektion (Referenz) |
|---|---|---|
| Props | Interfaces, Optional Properties, Readonly | L05, L08 |
| Props mit Varianten | Union Literal Types (`'primary' \| 'secondary'`) | L07, L09 |
| Children | `React.ReactNode` (Union Type), `PropsWithChildren<P>` (Mapped Type) | L07, L15 |
| useState | Generics (`useState<T>`), Union (`T \| null`) | L13 |
| useReducer | Discriminated Unions, `satisfies never`, Readonly | L12, L13 |
| useRef | Generics, Conditional Types (`MutableRefObject` vs `RefObject`) | L13, L17 |
| useMemo/useCallback | Generics, Function Types | L06, L13 |
| useContext | Generics, Non-null Assertion, Type Guards | L13, L11 |
| Custom Hooks | Generics, Tuple Types, Overloads, Discriminated Unions | L04, L06, L12, L13 |
| Event Handler | Generic Types (`ChangeEvent<HTMLInputElement>`) | L13 |
| forwardRef | Generics, Type Assertions, Generic Constraints | L13, L22 |
| Polymorphic Components | Conditional Types, Generic Constraints, `Omit<>` | L17, L15, L22 |
| Generic Components | Generics, `keyof`, Constraints | L13, L14 |
| HOC | Generics, `Omit<>`, `ComponentType<P>` | L15, L22 |
| Error Boundary | Class Types, `React.Component<P, S>` | L21 |
| Context Provider | Generics, Module Augmentation | L13, L27 |
| TanStack Query | Generics, Discriminated Unions | L12, L13 |
| React Hook Form | Generics, `z.infer<typeof schema>` | L13, L17 |
| React Router | Generics, String Literal Types | L13, L18 |
| Server Components | `async` Funktionen, Serializable Types | L31 |

---

## Angular-Vergleichsmatrix

### Gesamtuebersicht: React-Konzept zu Angular-Equivalent

| Bereich | React | Angular | Anmerkung |
|---------|-------|---------|-----------|
| **Komponenten** | Function Component | `@Component` Klasse / Standalone Component | React: Funktion, Angular: Klasse mit Decorator |
| **Templating** | JSX (JavaScript) | HTML Templates (eigene DSL) | JSX = volle JS-Macht, Templates = Framework-Kontrolle |
| **Data Binding** | One-Way (Props down, Callbacks up) | Two-Way (`[()]`), One-Way, Event Binding | Angular kann beides, React erzwingt One-Way |
| **State (lokal)** | `useState` / `useReducer` | Class Properties / Signals | React: immutable, Angular: mutable (traditionell) |
| **State (global)** | Context, Zustand, TanStack Query | Services + DI, NgRx, Signal Store | Angular DI ist maechtiger, React ist flexibler |
| **Side Effects** | `useEffect` | Lifecycle Hooks / `effect()` | React: Synchronisations-Denkweise, Angular: Lifecycle |
| **Ref/DOM** | `useRef` / `forwardRef` | `@ViewChild` / `viewChild()` | Aehnliche Idee, andere Syntax |
| **Forms** | React Hook Form + Zod | Reactive Forms / Template-Driven | Angular hat eingebaute Form-Loesung |
| **HTTP** | fetch + TanStack Query | `HttpClient` + RxJS | Angular ist eingebaut, React braucht Libraries |
| **Routing** | React Router / TanStack Router | Angular Router | Aehnliche Konzepte, Angular ist eingebaut |
| **Lazy Loading** | `React.lazy` + `Suspense` | `loadComponent` / `loadChildren` | Aehnlich, Angular auf Route-Ebene |
| **Error Handling** | Error Boundary (Class) | `ErrorHandler` (global Service) | React: komponentenbasiert, Angular: global |
| **Testing** | Vitest + Testing Library | Jasmine/Jest + TestBed | React-Tests sind naeher am DOM, Angular an der Klasse |
| **Styling** | CSS Modules, Tailwind, CSS-in-JS | Component Styles, View Encapsulation | Angular hat eingebaute Kapselung |
| **DI** | Kein System (Props, Context, Module) | Hierarchisches DI-System | Groesster architektonischer Unterschied |
| **Reactivity** | Virtual DOM + Reconciliation | Change Detection / Signals | Fundamental verschieden |
| **CLI** | Vite (Community) | Angular CLI (offiziell) | Angular: "Batteries included", React: "Choose your own" |

---

## Geschaetzter Umfang

### Zeitschaetzung pro Phase

| Phase | Lektionen | Geschaetzte Stunden | Wochen (5h/Woche) | Wochen (10h/Woche) |
|-------|-----------|--------------------|--------------------|---------------------|
| Phase 1: Foundations | R01-R10 | 35-45 Stunden | 7-9 Wochen | 3.5-4.5 Wochen |
| Phase 2: Patterns | R11-R20 | 40-55 Stunden | 8-11 Wochen | 4-5.5 Wochen |
| Phase 3: Advanced | R21-R30 | 45-60 Stunden | 9-12 Wochen | 4.5-6 Wochen |
| Phase 4: Ecosystem | R31-R40 | 40-55 Stunden | 8-11 Wochen | 4-5.5 Wochen |
| **Gesamt** | **40 Lektionen** | **160-215 Stunden** | **32-43 Wochen** | **16-21 Wochen** |

### Anpassung fuer Lernprofil

Da der Lernende bereits **tiefe TypeScript-Kenntnisse** und **Angular-Erfahrung** hat:

**Beschleunigungsfaktoren (geschaetzt -25% bis -35%):**
- TypeScript-Typisierung muss nicht von Grund auf gelernt werden
- Konzepte wie Components, Routing, State Management sind von Angular bekannt
- Generics, Discriminated Unions, Mapped Types etc. sitzen bereits
- Mentales Modell fuer UI-Entwicklung ist vorhanden

**Verlangsamungsfaktoren:**
- Umdenken von Angular-Patterns (Mutability, DI, Templates) braucht Zeit
- React's Freiheit kann anfangs ueberfordern ("welche Library nehme ich?")
- useEffect-Verstaendnis dauert laenger, weil Angular-Lifecycle-Denken tief sitzt

**Angepasste Schaetzung:**

| Phase | Original | Angepasst | Anmerkung |
|-------|----------|-----------|-----------|
| Phase 1 | 35-45h | 25-30h | TS-Typing bekannt, Konzeptvergleiche helfen |
| Phase 2 | 40-55h | 30-40h | Patterns sind neu, aber Grundkonzepte transferierbar |
| Phase 3 | 45-60h | 35-50h | Wenig Angular-Transfer, echtes Neuland |
| Phase 4 | 40-55h | 30-40h | Library-Lernen, teilweise Angular-Parallelen |
| **Gesamt** | **160-215h** | **120-160h** | **~25-30% schneller** |

---

## Haeufige Schwierigkeiten

### Geordnet nach Schweregrad und Haeufigkeit

#### Kritisch (wird fast jeden Angular-Entwickler treffen)

**1. Immutability-Zwang bei State**
```
Symptom:    State wird direkt mutiert, UI aktualisiert sich nicht.
Ursache:    In Angular aendert man `this.items.push(item)`. In React muss es
            `setItems(prev => [...prev, item])` sein.
Loesungsweg: Immer-Library nutzen oder Spread-Patterns ueben.
Lektion:    R04 (useState)
```

**2. useEffect als ngOnInit missbrauchen**
```
Symptom:    useEffect fuer alles genutzt (abgeleiteten State, Event-basierte Logik).
Ursache:    Angular-Lifecycle-Denken (ngOnInit, ngOnChanges) auf React uebertragen.
Loesungsweg: "You Might Not Need an Effect" (React-Dokumentation) verinnerlichen.
Lektion:    R06 (useEffect)
```

**3. Two-Way Binding vermissen**
```
Symptom:    Formulare fuehlen sich umstaendlich an.
Ursache:    Angular's [(ngModel)] gibt es nicht. Jedes Input braucht value + onChange.
Loesungsweg: React Hook Form lernen -- es abstrahiert die Boilerplate.
Lektion:    R16 (Forms)
```

#### Hoch (trifft die meisten Lernenden)

**4. Re-Rendering verstehen**
```
Symptom:    Unerwartete Re-Renders, Performance-Probleme.
Ursache:    Angular's Change Detection ist "magisch". React's Re-Rendering ist explizit,
            aber benoetigt Verstaendnis von referenzieller Gleichheit.
Loesungsweg: React DevTools Profiler, React.memo gezielt einsetzen.
Lektion:    R07 (useMemo/useCallback), R26 (Performance)
```

**5. Prop Drilling**
```
Symptom:    Props werden durch viele Ebenen durchgereicht.
Ursache:    In Angular injiziert man Services. In React gibt man Props weiter.
Loesungsweg: Context fuer "globale" Werte, Zustand fuer echtes State Management.
Lektion:    R12 (Context), R31 (Zustand)
```

**6. Kein DI-System**
```
Symptom:    "Wo erstelle ich meinen Service?"
Ursache:    Angular's DI fehlt komplett. React hat keine eingebaute Loesung.
Loesungsweg: Custom Hooks fuer Logik, Context fuer Sharing, Module fuer Utilities.
Lektion:    R11 (Custom Hooks), R12 (Context)
```

#### Mittel (benoetigt Aufmerksamkeit)

**7. Stale Closures**
```
Symptom:    Event-Handler oder Effekte verwenden veraltete Werte.
Ursache:    Closures in Funktionskomponenten fangen den State zum Render-Zeitpunkt ein.
Loesungsweg: useRef fuer "aktuelle Werte", Dependency Arrays korrekt pflegen.
Lektion:    R06 (useEffect), R07 (useRef)
```

**8. Children-Typing**
```
Symptom:    Unsicherheit bei `React.ReactNode` vs. `React.ReactElement` vs. `JSX.Element`.
Ursache:    Zu viele aehnliche Typen.
Loesungsweg: Fast immer `React.ReactNode` verwenden. Nur bei speziellen Patterns anders.
Lektion:    R03 (Props), R09 (Composition)
```

**9. Event-Handler-Typen**
```
Symptom:    `(e: any) => ...` statt korrekter Event-Typen.
Ursache:    React's SyntheticEvent-System hat eigene Typen.
Loesungsweg: Inline-Handler schreiben (Typen werden inferiert), dann extrahieren.
Lektion:    R05 (Events)
```

#### Niedrig (aber wissenswert)

**10. CSS Scoping ohne View Encapsulation**
```
Symptom:    CSS-Klassen kollidieren global.
Ursache:    React hat kein eingebautes Style-Scoping (kein ViewEncapsulation).
Loesungsweg: CSS Modules oder Tailwind verwenden.
Lektion:    R17 (Styling)
```

**11. Error Boundaries sind Class Components**
```
Symptom:    "Warum muss ich hier eine Klasse schreiben?"
Ursache:    React hat keinen Hook fuer componentDidCatch (Stand 2025).
Loesungsweg: react-error-boundary Library verwenden.
Lektion:    R14 (Error Boundaries)
```

---

## Abhaengigkeiten

### Lektions-Abhaengigkeitsgraph

```
R01 (Setup)
 |
 +-- R02 (JSX/TSX)
 |    |
 |    +-- R03 (Components & Props)
 |         |
 |         +-- R04 (useState) ----------+
 |         |                            |
 |         +-- R05 (Events) --------+   |
 |         |                        |   |
 |         +-- R08 (Lists/Keys)     |   |
 |              |                   |   |
 |              +-- R09 (Composition)   |
 |                                  |   |
 +-- R06 (useEffect) <-------------+---+
 |    |
 |    +-- R07 (useRef, useMemo, useCallback)
 |         |
 |         +-- R10 (Review Challenge)
 |
 +-- Phase 2:
 |    |
 |    R11 (Custom Hooks) <-- R04, R06, R07
 |    R12 (Context) <-- R03, R04
 |    R13 (useReducer) <-- R04, R12
 |    R14 (Error Boundaries) <-- R03
 |    R15 (Suspense) <-- R06, R14
 |    R16 (Forms) <-- R04, R05, R07
 |    R17 (Styling) <-- R03
 |
 +-- Phase 3:
 |    |
 |    R21 (HOC/Render Props) <-- R03, R11
 |    R22 (Compound Components) <-- R12, R09
 |    R23 (Polymorphic) <-- R03, R13 (TS Generics)
 |    R24 (Generic Components) <-- R03, R13
 |    R25 (forwardRef) <-- R07, R24
 |    R26 (Performance) <-- R07, R22
 |    R27 (Testing) <-- R11, R12 (kann frueher starten)
 |
 +-- Phase 4:
      |
      R31 (Zustand) <-- R04, R12
      R32 (TanStack Query) <-- R06, R11, R15
      R33 (Routing) <-- R03, R15
      R34 (Animation) <-- R03
      R35 (Server Components) <-- R03, R15
```

### Empfohlene Reihenfolge (kritischer Pfad)

Die Reihenfolge innerhalb jeder Phase ist so gewaehlt, dass **keine Lektion ein Konzept
voraussetzt, das noch nicht behandelt wurde**. Der kritische Pfad (laengste Abhaengigkeitskette):

```
R01 -> R02 -> R03 -> R04 -> R06 -> R07 -> R11 -> R12 -> R13 -> R22 -> R26
```

Diese 11 Lektionen bilden das Rueckgrat. Alles andere verzweigt von diesem Pfad.

### Moegliche Parallelisierung

Wenn der Lernende schneller vorankommen will, kann er innerhalb einer Phase
bestimmte Lektionen parallel bearbeiten:

- **R05 (Events) + R08 (Lists)** koennen parallel nach R03 bearbeitet werden
- **R14 (Error Boundaries) + R17 (Styling)** sind unabhaengig voneinander
- **R31 (Zustand) + R33 (Routing) + R34 (Animation)** koennen parallel starten

---

## Bewertung und Empfehlungen

### Staerken dieses Curriculums

1. **TypeScript-First**: Jedes Konzept wird von Anfang an mit TypeScript behandelt.
   Kein "erst JavaScript lernen, dann TypeScript draufsetzen".

2. **Angular-Bruecken**: Die systematischen Vergleiche nutzen vorhandenes Wissen
   als Anker, statt es zu ignorieren.

3. **Praxisnahe Patterns**: Polymorphic Components, Generic Components, Compound
   Components -- das sind Patterns, die in echten Component Libraries verwendet werden.

4. **Modernes Ecosystem**: Zustand statt Redux, TanStack Query statt manuelles
   Fetching, React Compiler statt manuelles Memoizing.

### Empfehlungen fuer die Umsetzung

1. **Frueher mit einem echten Projekt starten**: Ab Phase 2 (R11+) sollte ein
   laufendes Begleitprojekt existieren, das mit jeder Lektion waechst.

2. **Angular-Vergleiche reduzieren in Phase 3+**: Ab Phase 3 gibt es weniger
   Angular-Equivalente. Hier sollte der Fokus rein auf React liegen.

3. **Testing frueher einbauen**: R27 (Testing) koennte schon in Phase 2 starten.
   Fruehes Testing festigt das Verstaendnis der Komponentenstruktur.

4. **React Compiler separat behandeln**: Der React Compiler (React 19+) veraendert
   die Performance-Landschaft fundamental. Empfehlung: In R07 erwaehnen, in R26
   vertiefen.

5. **Next.js als Folgekurs**: Dieses Curriculum endet bewusst vor Next.js. Server
   Components (R35) bereiten darauf vor, aber Next.js verdient ein eigenes Curriculum.
