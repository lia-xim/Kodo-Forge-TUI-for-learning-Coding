# Curriculum-Plaene: Alle Kurse im Detail

> Letzte Aktualisierung: 2026-03-31

---

## 1. Kurs-Abhaengigkeiten

```
TypeScript Deep Learning (40 Lektionen)
    │
    ├── Phase 1-2 abgeschlossen (L20)
    │       │
    │       ├───> Angular Mastery (40 Lektionen)
    │       │         └── Phase 1-2 empfohlen vor React
    │       │
    │       └───> React mit TypeScript (40 Lektionen)
    │                 │
    │                 └── Phase 1-2 abgeschlossen (R20)
    │                         │
    │                         └───> Next.js Production (20 Module)
    │
    └── Phase 3-4 parallel zu Framework-Kursen moeglich
```

**Lock-System:** Die Plattform erzwingt Voraussetzungen mit einem Lock-Symbol. Der Lernende kann den Lock per Bestaetigung uebersteuen ("Ich kenne TypeScript bereits"). Dies respektiert die Autonomie (SDT) waehrend es die optimale Reihenfolge empfiehlt.

**Warum diese Reihenfolge:**
- TypeScript ist Fundament fuer alles — ohne tiefes Type-System-Verstaendnis sind Framework-Typen unverstaendlich
- Angular VOR React: Der Lernende nutzt Angular beruflich, kennt es also schon. Der Angular-Kurs vertieft das Verstaendnis.
- React NACH Angular: Explizite Vergleiche ("In Angular machst du X, in React Y") setzen Angular-Wissen voraus
- Next.js NACH React: Next.js ist ein React-Framework — React-Grundlagen sind Pflicht

---

## 2. TypeScript Deep Learning (40 Lektionen)

### Phase 1: Foundations (L01-L10) — KOMPLETT

Das Fundament. Hier lernt der Lernende die Sprache TypeScript kennen — ohne Framework, nur er und der Compiler. Jede Lektion hat 5-7 Sektionen, 5-6 Examples, 5-6 Exercises, 15 Quiz-Fragen, und alle 12 Uebungsformate.

| # | Lektion | Verzeichnis | Sektionen | Kernkonzepte | TypeScript-Features | Lernziele |
|---|---------|-------------|:---------:|-------------|--------------------|-----------|
| 01 | Setup & Erste Schritte | `01-setup-und-erste-schritte/` | 5 | Compiler, tsconfig, Ausfuehrung | tsc, tsx, tsconfig.json, strict Mode | TS-Projekte aufsetzen, Code ausfuehren, tsconfig verstehen |
| 02 | Primitive Types | `02-primitive-types/` | 6 | Type Erasure, Typhierarchie, Compilezeit vs Laufzeit | string, number, boolean, null, undefined, any, unknown, never, void, symbol, bigint | Alle Basistypen korrekt einsetzen, any vs unknown unterscheiden, Type Widening verstehen |
| 03 | Type Annotations & Inference | `03-type-annotations-und-inference/` | 6 | Wann annotieren, wann inferieren lassen, Inferenz-Algorithmus | Type Inference, Contextual Typing, Type Widening, const assertions | Bewusste Entscheidungen ueber Typannotationen treffen |
| 04 | Arrays & Tuples | `04-arrays-und-tuples/` | 6 | Homogene vs. heterogene Collections, Readonly | Array<T>, T[], readonly, [T, U], as const, Tupel mit Labels | Typsichere Collections verwenden, Readonly korrekt einsetzen |
| 05 | Objects & Interfaces | `05-objects-und-interfaces/` | 6 | Strukturelles Typsystem, Excess Property Check | interface, optional (?), readonly, index signatures, intersection | Komplexe Objektstrukturen modellieren |
| 06 | Functions | `06-functions/` | 5 | Parameter-/Rueckgabetypen, Overloads, Generische Funktionen | Overloads, Rest-Parameter, this-Parameter, Callback-Typen | Typsichere Funktionen schreiben |
| 07 | Union & Intersection Types | `07-union-und-intersection-types/` | 5 | Type Combining, Distributive Behavior | Union (\|), Intersection (&), Distributive Conditional Types | Flexible und praezise Typen kombinieren |
| 08 | Type Aliases vs Interfaces | `08-type-aliases-vs-interfaces/` | 5 | Wann was verwenden, Declaration Merging | type, interface, extends, implements, Declaration Merging | Die richtige Abstraktion waehlen |
| 09 | Enums & Literal Types | `09-enums-und-literal-types/` | 5 | Wertebereiche einschraenken | const enum, string literals, numeric literals, as const, template literals | Wertebereiche exakt einschraenken |
| 10 | Review Challenge | `10-review-challenge/` | 5 | Alle Phase-1-Konzepte | Gemischt | Alles aus Phase 1 frei anwenden |

### Phase 2: Type System Core (L11-L20) — KOMPLETT

Das Herzstueck von TypeScript. Hier wird das Type System tief verstanden — Generics, Mapped Types, Conditional Types.

| # | Lektion | Verzeichnis | Sektionen | Kernkonzepte | TypeScript-Features | Lernziele |
|---|---------|-------------|:---------:|-------------|--------------------|-----------|
| 11 | Type Narrowing | `11-type-narrowing/` | 6 | Control Flow Analysis, Type Guards | typeof, instanceof, in, is, asserts, Truthiness Narrowing | Typen sicher eingrenzen |
| 12 | Discriminated Unions | `12-discriminated-unions/` | 5 | Tagged Unions, Exhaustive Checks | Discriminant Property, never, switch, satisfies | Komplexe Zustaende modellieren |
| 13 | Generics Basics | `13-generics-basics/` | 6 | Typparameter, Constraints | `<T>`, extends, keyof, Default-Typparameter | Wiederverwendbare typsichere Funktionen schreiben |
| 14 | Generic Patterns | `14-generic-patterns/` | 5 | Factories, Collections, Builder | Generic Factories, Generic Collections, Builder Pattern, Fluent API | Generics in der Praxis anwenden |
| 15 | Utility Types | `15-utility-types/` | 5 | Built-in Type Transformationen | Partial, Required, Pick, Omit, Record, Readonly, ReturnType, Parameters, Exclude, Extract, NonNullable | Built-in Utility Types meistern |
| 16 | Mapped Types | `16-mapped-types/` | 5 | Typen transformieren | `{[K in keyof T]: ...}`, Key Remapping (as), Template Literal Keys | Eigene Utility Types bauen |
| 17 | Conditional Types | `17-conditional-types/` | 5 | Typen dynamisch berechnen | `T extends U ? X : Y`, infer, Distributive Behavior | Typen dynamisch berechnen |
| 18 | Template Literal Types | `18-template-literal-types/` | 5 | String-Manipulation auf Type-Level | Template Literals, Uppercase/Lowercase, Pattern Matching | String-basierte APIs typsicher machen |
| 19 | Modules & Declarations | `19-modules-und-declarations/` | 5 | Module-System, Type Declarations | import/export, .d.ts, @types, declare, module augmentation | Module-System verstehen und nutzen |
| 20 | Review Challenge Phase 2 | `20-review-challenge-phase-2/` | 5 | Alle Phase-2-Konzepte | Gemischt | Das Type System frei nutzen |

### Phase 3: Advanced TypeScript (L21-L30) — NOCH NICHT ERSTELLT

Fortgeschrittene Techniken. Von "kann TypeScript" zu "beherrscht TypeScript".

| # | Lektion | Kernkonzepte | TypeScript-Features | Lernziele |
|---|---------|-------------|--------------------|-----------|
| 21 | Classes & OOP | Access Modifiers, Abstract Classes, Implements | public/private/protected, abstract, implements, #private | Typsichere Klassenhierarchien designen |
| 22 | Advanced Generics | Higher-order Types, Variance | Covariance, Contravariance, Bivariance, `in`/`out` Modifier (TS 4.7) | Komplexe generische Abstraktionen bauen |
| 23 | Recursive Types | Selbstreferenzierende Typen | Recursive Type Aliases, JSON-Typ, DeepPartial, DeepReadonly | Baumstrukturen und deep-Operationen typen |
| 24 | Branded/Nominal Types | Type-safe IDs, Opaque Types | Branded Types mit `& { __brand: T }`, Template Literal Brands | Verwechslung gleichfoermiger Typen verhindern |
| 25 | Type-safe Error Handling | Result<T,E>, Exhaustive Errors | Discriminated Union Errors, never, Custom Error Types | Fehler als Typen modellieren |
| 26 | Advanced Patterns | Builder, State Machine, Phantom Types | Phantom Types, State Machine mit Typen, Type-safe Builder | Design Patterns mit dem Type System |
| 27 | Declaration Merging | Module Augmentation, Global | declare module, declare global, interface merging | Drittanbieter-Typen erweitern |
| 28 | Decorators | Legacy & Stage 3 Decorators | @Decorator, Decorator Factories, Metadata | Metaprogrammierung mit Typsicherheit |
| 29 | tsconfig Deep Dive | Alle Compiler Flags | strict, moduleResolution, paths, references, composite | Projekte optimal konfigurieren |
| 30 | Review Challenge Phase 3 | Alle Phase-3-Konzepte | Gemischt | Fortgeschrittene Techniken anwenden |

### Phase 4: Real-World Mastery (L31-L40) — NOCH NICHT ERSTELLT

Vom Wissen zur Anwendung. TypeScript im echten Projekt.

| # | Lektion | Kernkonzepte | TypeScript-Features | Lernziele |
|---|---------|-------------|--------------------|-----------|
| 31 | Async TypeScript | Promises, async/await Typen | Promise<T>, Awaited<T>, AsyncGenerator, AbortSignal-Typen | Asynchronen Code typsicher schreiben |
| 32 | Type-safe APIs | REST/GraphQL Typen | Zod, io-ts, tRPC-Patterns, API Route Typing | API-Schichten end-to-end typen |
| 33 | Testing TypeScript | Vitest/Jest Typen, Mocking | vi.fn(), Mock<T>, Type-safe Test Helpers | TypeScript-Code effektiv testen |
| 34 | Performance & Compiler | Type Instantiation Limits | Performance Tracing, --generateTrace, tsc --extendedDiagnostics | Compiler-Performance verstehen |
| 35 | Migration Strategies | JS→TS, Strict Mode Migration | allowJs, checkJs, @ts-check, incrementelle Strict-Migration | Bestehenden Code sicher migrieren |
| 36 | Library Authoring | Package-Typen, .d.ts | tsup, Package exports, Dual CJS/ESM, Conditional Exports | Eigene typsichere Libraries schreiben |
| 37 | Type-Level Programming | Computing with Types | Recursive Conditional Types, Type-Level Arithmetic, String Parsing | Auf Type-Level "programmieren" |
| 38 | Compiler API | ts.createProgram, AST | TypeScript Compiler API, AST-Traversal, Custom Transforms | Den Compiler als Tool nutzen |
| 39 | Best Practices & Anti-Patterns | any vs unknown, Overengineering | Code-Review-Checkliste, Common Pitfalls, When NOT to type | Haeufige Fehler vermeiden |
| 40 | Capstone Project | Alles zusammen | Vollstaendiges Projekt mit allen Techniken | Ein komplettes Projekt eigenstaendig umsetzen |

---

## 3. Angular Mastery (40 Lektionen)

### Phase 1: Angular Foundations (L01-L10)

Kein "Hello World"-Kurs. Der Lernende nutzt Angular beruflich — es geht um *Verstaendnis*, nicht Rezepte. Jede Lektion erklaert das **Warum** hinter Angular-Designentscheidungen.

| # | Lektion | Kernkonzepte | Angular-Features | TS-Verbindung | Einzigartiges Konzept |
|---|---------|-------------|-----------------|---------------|----------------------|
| 01 | Angular Mental Model | Compiler, Runtime, Zone.js | ng serve, AOT vs JIT, Tree Shaking | Decorators (L28) | Was passiert zwischen ng serve und dem Browser |
| 02 | Components & Templates | Standalone Components, Data Binding | @Component, Input/Output, Lifecycle Hooks | Interface fuer Component-Input Types | Template-Syntax als DSL vs JSX als JavaScript |
| 03 | Template Deep Dive | Neue Control Flow Syntax | @if, @for, @switch, @defer | Type Narrowing in Templates (L11) | Warum Angular Template Syntax braucht |
| 04 | Directives | Built-in, Custom, Structural | ngIf, ngFor, HostBinding, HostListener | Generic Directives (L13) | Directives als Verhaltenserweiterungen |
| 05 | Pipes | Pure vs Impure, Custom | DatePipe, AsyncPipe, Custom | Function-Typen (L06) | Warum Pure Pipes gecached werden |
| 06 | Services & DI | Providers, Injector-Hierarchie | @Injectable, providedIn, InjectionToken | Abstract Classes (L21) | DI als Architektur-Grundlage |
| 07 | DI Deep Dive | Multi-Providers, inject() | providedIn, Tree-Shaking, inject() | Generics fuer InjectionToken<T> (L13) | Wann providedIn: 'root' vs Modul-Scope |
| 08 | Routing Fundamentals | Router, Guards, Lazy Loading | RouterModule, CanActivate, loadChildren | Promise<T> fuer Resolver (L31) | Route-basierte Architektur |
| 09 | Forms: Template-Driven | ngModel, Two-Way Binding | FormsModule, ngModel, Validation | String Literal Types fuer Validierung (L09) | Wann Template-Driven ausreicht |
| 10 | Forms: Reactive | Typed Forms, FormBuilder | FormBuilder, FormGroup, FormControl<T> | Mapped Types fuer FormGroup (L16) | Warum Reactive Forms typsicherer sind |

### Phase 2: Angular Architecture (L11-L20)

| # | Lektion | Kernkonzepte | Angular-Features | TS-Verbindung |
|---|---------|-------------|-----------------|---------------|
| 11 | Modules vs. Standalone | NgModules, Migration | Standalone Components, importProvidersFrom | Module Systems (L19) |
| 12 | Lazy Loading & Code Splitting | Performance, Bundle Size | loadChildren, @defer, loadComponent | Dynamic Import Types |
| 13 | HTTP Client & Interceptors | Typed Responses | HttpClient<T>, Functional Interceptors | Generics fuer Response-Typen (L13) |
| 14 | State Management Foundations | Component vs Service State | BehaviorSubject, Signals, WritableSignal | Discriminated Unions fuer Actions (L12) |
| 15 | State Management Advanced | NgRx, SignalStore | @ngrx/store, @ngrx/signals | Conditional Types fuer Selectors (L17) |
| 16 | Error Handling Patterns | Global Handler, Retry | ErrorHandler, HttpInterceptor, retry() | Type-safe Error Handling (L25) |
| 17 | Testing: Unit Tests | TestBed, Mocking | ComponentFixture, Harnesses, SpyObj | Mock<T> Types (L33) |
| 18 | Testing: Integration & E2E | Playwright, Component Tests | Component Integration, Playwright Config | Async Types (L31) |
| 19 | Angular CLI & Schematics | ng generate, Builder API | Workspace Config, nx.json | Compiler API Parallelen (L38) |
| 20 | Architecture Review | Feature-Module, Dependency Rules | Shared, Core, Feature-Module Patterns | All Phase 2 |

### Phase 3: Advanced Angular (L21-L30)

| # | Lektion | Kernkonzepte |
|---|---------|-------------|
| 21 | Signals Deep Dive | signal(), computed(), effect(), LinkedSignal, Resource |
| 22 | RxJS Foundations | Observable, Observer, Subscription, Core Operators |
| 23 | RxJS Patterns | switchMap, mergeMap, combineLatest, Error Handling |
| 24 | RxJS & Signals Interop | toSignal(), toObservable(), Wann was? |
| 25 | Change Detection Deep Dive | Zone.js, Default vs. OnPush, Zoneless Angular |
| 26 | Content Projection & Templates | ng-content, ng-template, ngTemplateOutlet |
| 27 | Dynamic Components & Portals | ViewContainerRef, CDK Portal |
| 28 | Custom Directives & Pipes Advanced | Structural Directives, Host-Directiven |
| 29 | Angular CDK | Overlay, Drag&Drop, Virtual Scrolling, a11y |
| 30 | Advanced Patterns Challenge | Kombination aller Phase-3-Konzepte |

### Phase 4: Angular Mastery (L31-L40)

| # | Lektion | Kernkonzepte |
|---|---------|-------------|
| 31 | Performance Optimization | Bundle Size, Runtime, Core Web Vitals |
| 32 | Server-Side Rendering | Angular SSR, Hydration, Prerendering |
| 33 | Internationalization | Built-in i18n, ngx-translate, ICU |
| 34 | Animations | Angular Animations API, Reusable Animations |
| 35 | Custom Schematics & Builders | @angular-devkit/schematics, Builder API |
| 36 | Library Authoring | ng-packagr, Secondary Entry Points |
| 37 | Micro Frontends | Module Federation, Native Federation |
| 38 | Migration Strategies | NgModules→Standalone, AngularJS→Angular |
| 39 | Real-World Architecture | Nx Monorepo, DDD, Clean Architecture |
| 40 | Capstone Project | Vollstaendige Angular-Anwendung eigenstaendig designen |

---

## 4. React mit TypeScript (40 Lektionen)

### Phase 1: React Foundations (R01-R10)

React sprechen lernen. UI = f(state) verinnerlichen. Explizite Angular-Vergleiche.

| # | Lektion | Kernkonzepte | Angular-Vergleich | TS-Verbindung |
|---|---------|-------------|-------------------|---------------|
| R01 | Setup & Mentales Modell | Vite, React DevTools, UI = f(state) | ng serve vs Vite | tsconfig fuer React (jsx: "react-jsx") |
| R02 | JSX & TSX | Syntax, Expressions, Fragments | Template Syntax vs JSX | ReactNode, ReactElement Types |
| R03 | Components & Props | FC, Props-Interfaces, Children | @Input/@Output vs Props | Interface fuer Props |
| R04 | State mit useState | Immutability, Generics, Batching | Signal vs useState | Generic: useState<T> |
| R05 | Event Handling | SyntheticEvent, Handler Types | (click)="fn()" vs onClick={fn} | React.MouseEvent<HTMLButtonElement> |
| R06 | Conditional Rendering & Listen | Keys, Ternary, Map | @if vs JSX Ternary, @for vs .map() | Type Narrowing in JSX |
| R07 | useEffect Deep Dive | Dependencies, Cleanup | ngOnInit/ngOnDestroy vs useEffect | Dependency Array Typing |
| R08 | useRef & DOM-Zugriff | Refs, forwardRef | ViewChild vs useRef | Generic: useRef<HTMLDivElement> |
| R09 | Formulare | Controlled vs Uncontrolled | Reactive Forms vs Controlled | FormEvent, ChangeEvent Types |
| R10 | Review Challenge | Alle Phase-1-Konzepte | — | — |

### Phase 2: React Patterns (R11-R20)

| # | Lektion | Kernkonzepte | Angular-Vergleich |
|---|---------|-------------|-------------------|
| R11 | Custom Hooks | Abstraktion, Komposition | Services vs Custom Hooks |
| R12 | Context API | Globaler State ohne Libraries | providedIn: 'root' vs Context |
| R13 | useReducer | Discriminated Unions, Dispatch | NgRx Store vs useReducer |
| R14 | Error Boundaries | Class Components, Fallback | ErrorHandler vs Error Boundaries |
| R15 | Suspense & React.lazy | Code Splitting, Loading | @defer vs Suspense |
| R16 | Performance | React.memo, useMemo, useCallback | OnPush vs memo |
| R17 | Composition Patterns | Compound Components, Render Props | Content Projection vs Composition |
| R18 | Testing | Vitest, Testing Library, MSW | TestBed vs Testing Library |
| R19 | Styling | Tailwind, CSS Modules, CVA | Component Styles vs CSS Modules |
| R20 | Review Challenge | Alle Phase-2-Konzepte | — |

### Phase 3: Advanced React (R21-R30)

| # | Lektion | Kernkonzepte |
|---|---------|-------------|
| R21 | Generic Components | Typsichere wiederverwendbare UI |
| R22 | Polymorphic Components | as-Prop, ElementType |
| R23 | Higher-Order Components | Typsichere HOCs, Props Injection |
| R24 | React Compiler | Automatische Memoization |
| R25 | Concurrent Features | useTransition, useDeferredValue |
| R26 | Server Components Grundlagen | RSC, Serialisierung |
| R27 | Form Libraries | React Hook Form, Zod |
| R28 | Animation | Framer Motion, Layout Animations |
| R29 | Advanced Hooks | useImperativeHandle, useSyncExternalStore |
| R30 | Review Challenge | Alle Phase-3-Konzepte |

### Phase 4: React Ecosystem (R31-R40)

| # | Lektion | Kernkonzepte |
|---|---------|-------------|
| R31 | State Management | Zustand, Jotai, TanStack Query |
| R32 | Routing | React Router, TanStack Router |
| R33 | Data Fetching | SWR, TanStack Query |
| R34 | Testing Advanced | E2E Playwright, Visual Regression |
| R35 | Accessibility | ARIA, Screen Readers, axe |
| R36 | Internationalization | react-intl, i18next |
| R37 | Monorepo | Turborepo, Shared Packages |
| R38 | Build Tools | Vite, esbuild, Analyse |
| R39 | Design Systems | Storybook, Tokens |
| R40 | Capstone Project | Vollstaendige React-Anwendung |

---

## 5. Next.js Production (20 Module)

### Phase 1: Foundations (N01-N05)

| # | Lektion | Kernkonzepte | React-Voraussetzung |
|---|---------|-------------|---------------------|
| N01 | App Router Architektur | Dateibasiertes Routing, page/layout | R06 (Routing-Konzepte) |
| N02 | Server vs. Client Components | use client, Serialisierung | R26 (RSC Grundlagen) |
| N03 | Layout System | layout.tsx, loading.tsx, error.tsx | R14 (Error Boundaries), R15 (Suspense) |
| N04 | Data Fetching | Server Components, fetch, Streaming | R33 (Data Fetching) |
| N05 | Server Actions | Formulare, Mutation, Revalidation | R09 (Formulare), R27 (Form Libraries) |

### Phase 2: Patterns (N06-N10)

| # | Lektion | Kernkonzepte | React-Voraussetzung |
|---|---------|-------------|---------------------|
| N06 | Erweitertes Routing | Dynamic, Parallel, Intercepting | R32 (Routing) |
| N07 | Middleware & Auth | Authentication Patterns | R12 (Context) |
| N08 | Database Integration | Prisma, Drizzle, ORM-Typen | R33 (Data Fetching) |
| N09 | Image & Font Optimization | next/image, next/font | R16 (Performance) |
| N10 | Metadata & SEO | generateMetadata, Open Graph | — |

### Phase 3: Advanced (N11-N15)

| # | Lektion | Kernkonzepte |
|---|---------|-------------|
| N11 | Caching Deep Dive | 4 Schichten: Request Memoization, Data Cache, Full Route Cache, Router Cache |
| N12 | Streaming & Suspense | Progressive Rendering, Suspense Boundaries |
| N13 | Edge Runtime | Middleware, Edge Functions, Runtime-Unterschiede |
| N14 | Testing | E2E, Vitest, MSW, Server Component Tests |
| N15 | Security | Headers, CSRF, Rate Limiting |

### Phase 4: Production (N16-N20)

| # | Lektion | Kernkonzepte |
|---|---------|-------------|
| N16 | Performance | Bundle Analysis, Code Splitting, Core Web Vitals |
| N17 | Deployment | Vercel, Docker, Self-hosted, Static Export |
| N18 | CI/CD | GitHub Actions, Preview Deployments |
| N19 | Architecture | Feature Folders, Monorepo, Shared Libraries |
| N20 | Capstone Project | Produktionsreife Next.js-App |
