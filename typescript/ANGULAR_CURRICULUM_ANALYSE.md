# Angular Deep Learning -- Curriculum-Analyse

> Aufbauend auf dem TypeScript Deep Learning Kurs (40 Lektionen).
> Zielgruppe: Beruflicher Angular-Entwickler mit tiefen TypeScript-Kenntnissen.
> Stand der Analyse: Maerz 2026 | Angular 17/18/19

---

## Inhaltsverzeichnis

1. [Kontext & Ausgangslage](#kontext--ausgangslage)
2. [Vollstaendiger Lernpfad (4 Phasen, 40 Lektionen)](#vollstaendiger-lernpfad)
3. [TypeScript-Verbindungstabelle](#typescript-verbindungstabelle)
4. [Geschaetzter Umfang](#geschaetzter-umfang)
5. [Was Angular-Lernen besonders macht](#was-angular-lernen-besonders-macht)
6. [Empfehlungen fuer den Kursbau](#empfehlungen-fuer-den-kursbau)

---

## Kontext & Ausgangslage

### Der Lernende

- Benutzt Angular **beruflich** -- kein Anfaenger, aber systematisches Wissen fehlt
- Hat den TypeScript-Kurs (40 Lektionen) abgeschlossen:
  Generics, Mapped Types, Conditional Types, Decorators, Type-Level Programming, etc.
- Versteht das "Warum" hinter TypeScript-Entscheidungen, nicht nur das "Was"
- Kennt auch React/Next.js privat -- Vergleiche sind wertvoller Kontext

### Was dieser Angular-Kurs NICHT ist

- **Kein "Hello World"-Kurs.** Der Lernende kennt TypeScript in der Tiefe.
- **Kein Framework-Tutorial.** Es geht um Verstaendnis der Architektur, nicht Rezepte.
- **Keine Referenzdokumentation.** Dafuer gibt es angular.dev.

### Was dieser Angular-Kurs IST

- Ein systematischer Weg von "ich benutze Angular" zu "ich verstehe Angular".
- Jede Lektion erklaert das **Warum** hinter Angular-Designentscheidungen.
- TypeScript-Tiefenwissen wird aktiv eingesetzt, nicht nur vorausgesetzt.
- Vergleiche zu React/Next.js wo sie das Verstaendnis vertiefen.

---

## Vollstaendiger Lernpfad

### Phase 1: Angular Foundations (Lektion 01--10)

> Das Fundament. Hier baust du ein solides mentales Modell davon auf, wie Angular funktioniert --
> nicht wie man es benutzt (das kannst du schon), sondern warum es so designed ist.

| # | Lektion | Kernkonzept | Du kannst danach... |
|---|---------|-------------|---------------------|
| 01 | Angular Mental Model | Wie Angular denkt: Compiler, Runtime, Zone.js | Erklaeren, was passiert zwischen `ng serve` und dem Browser |
| 02 | Components & Templates | Component-Klasse, Template-Syntax, Data Binding | Components als Einheit von Logik + Template verstehen |
| 03 | Template Deep Dive | Neue Control Flow (@if, @for, @switch), Template Expressions | Die neue Syntax sicher einsetzen und verstehen warum Angular sie eingefuehrt hat |
| 04 | Directives | Built-in Directives, Attribute vs. Structural, HostBinding/HostListener | Directives als Verhaltens-Erweiterungen verstehen und Custom Directives planen |
| 05 | Pipes | Built-in Pipes, Pure vs Impure, Custom Pipes | Datentransformation im Template beherrschen und Performance-Implikationen kennen |
| 06 | Services & Dependency Injection | Providers, Injector Hierarchy, InjectionToken | Das DI-System als Architektur-Grundlage begreifen |
| 07 | Dependency Injection Deep Dive | providedIn, Multi-Providers, Tree-Shakeable Services, inject() | DI-Patterns fuer verschiedene Szenarien bewusst waehlen |
| 08 | Routing Fundamentals | RouterModule, Route Config, Guards, Resolver | Navigation und Route-basierte Architektur aufbauen |
| 09 | Forms: Template-Driven | ngModel, Two-Way Binding, Validation | Einfache Formulare bauen und verstehen wann Template-Driven reicht |
| 10 | Forms: Reactive | FormControl, FormGroup, FormArray, Validators, Typed Forms | Typsichere Reactive Forms bauen und verstehen warum sie fuer komplexe Szenarien ueberlegen sind |

**Phase-1-Sektionen im Detail:**

**Lektion 01: Angular Mental Model** (~60 Min, 6 Sektionen)
1. Die Angular-Philosophie: Opinionated Framework vs. Library-Ansatz
2. Der Angular Compiler (ngc): Was passiert mit deinen Templates?
3. Zone.js: Wie Angular weiss, wann sich etwas geaendert hat
4. Component Tree & Change Detection: Der Render-Zyklus
5. Angular vs. React: Zwei fundamental verschiedene Ansaetze
6. Dev Server, Build Pipeline, AOT vs JIT

**Lektion 02: Components & Templates** (~60 Min, 6 Sektionen)
1. Anatomie einer Component: Decorator, Klasse, Template, Styles
2. Data Binding: Interpolation, Property Binding, Event Binding
3. Two-Way Binding: Die [(ngModel)]-Magie entmystifiziert
4. Input/Output: Kommunikation zwischen Components
5. Component Lifecycle Hooks: ngOnInit, ngOnChanges, ngOnDestroy & Co.
6. Standalone Components: Warum Angular von NgModules weg will

**Lektion 03: Template Deep Dive** (~50 Min, 5 Sektionen)
1. Template Expressions & Statements: Was Angular im Template erlaubt
2. @if, @else -- Die neue Control Flow Syntax (Angular 17+)
3. @for mit track -- Performance und Identitaet
4. @switch, @defer -- Lazy Template Blocks
5. Template Reference Variables (#ref) und @ViewChild

**Lektion 04: Directives** (~50 Min, 5 Sektionen)
1. Was sind Directives? Attribute vs. Structural
2. Built-in: ngClass, ngStyle, ngTemplateOutlet
3. Custom Attribute Directives: HostBinding & HostListener
4. Custom Structural Directives: das *-Prefix verstehen
5. Directive Composition API (Angular 15+)

**Lektion 05: Pipes** (~40 Min, 4 Sektionen)
1. Built-in Pipes: date, currency, async, json, slice
2. Pure vs. Impure Pipes: Wann wird neu berechnet?
3. Custom Pipes: PipeTransform implementieren
4. Performance: Warum Pipes besser sind als Methoden im Template

**Lektion 06: Services & Dependency Injection** (~60 Min, 6 Sektionen)
1. Warum DI? Das Problem, das Angular loest
2. Der Injector-Baum: Root, Module, Component
3. Provider-Konfiguration: useClass, useValue, useFactory, useExisting
4. InjectionToken: Typsichere DI ohne Klassen
5. DI in Angular vs. andere Frameworks: Was Angular einzigartig macht
6. Praktische DI-Patterns: Konfiguration, Feature Flags, API-Abstraktion

**Lektion 07: Dependency Injection Deep Dive** (~50 Min, 5 Sektionen)
1. providedIn: 'root' | 'platform' | 'any' -- Wann was?
2. inject() vs. Constructor Injection: Die neue Art
3. Multi-Providers und das InjectionToken-Pattern
4. Tree-Shaking und DI: Warum providedIn existiert
5. Hierarchische DI: Component-Level Providers und ihre Auswirkungen

**Lektion 08: Routing Fundamentals** (~60 Min, 6 Sektionen)
1. RouterModule und Route-Konfiguration
2. Parametrisierte Routen, Query-Parameter, Fragments
3. Nested Routes und router-outlet
4. Route Guards: canActivate, canDeactivate, canMatch
5. Resolver: Daten vor der Navigation laden
6. Functional Guards und Resolver (Angular 15+)

**Lektion 09: Forms -- Template-Driven** (~40 Min, 4 Sektionen)
1. ngModel und FormsModule: Die einfache Art
2. Two-Way Binding im Detail: Was [()] wirklich macht
3. Template-driven Validation: required, minlength, pattern
4. Wann Template-Driven reicht und wann nicht

**Lektion 10: Forms -- Reactive** (~60 Min, 6 Sektionen)
1. FormControl, FormGroup, FormBuilder: Die Building Blocks
2. Typed Forms (Angular 14+): Endlich typsicher
3. Validatoren: Built-in, Custom, Async
4. FormArray: Dynamische Formulare
5. Reactive Forms Patterns: Cross-Field Validation, Conditional Fields
6. Review Challenge: Components, DI, Routing, Forms zusammen

---

### Phase 2: Angular Architecture (Lektion 11--20)

> Architektur-Ebene. Hier lernst du, wie man Angular-Anwendungen strukturiert, die
> wartbar, testbar und performant sind. Das ist der Sprung von "Component bauen"
> zu "Anwendung designen".

| # | Lektion | Kernkonzept | Du kannst danach... |
|---|---------|-------------|---------------------|
| 11 | Modules vs. Standalone | NgModules, Standalone Components, bootstrapApplication | Bewusst entscheiden zwischen Module- und Standalone-Architektur |
| 12 | Lazy Loading & Code Splitting | loadChildren, loadComponent, @defer, Route-based Splitting | Ladezeiten durch intelligentes Code Splitting optimieren |
| 13 | HTTP Client & Interceptors | HttpClient, typed Responses, Interceptors (functional + class-based) | Typsichere API-Kommunikation mit Interceptor-Ketten aufbauen |
| 14 | State Management Foundations | Component State, Service State, BehaviorSubject, Signal-based State | State-Management-Strategien bewusst waehlen |
| 15 | State Management Advanced | NgRx Store, ComponentStore, SignalStore, Effects | NgRx und Signal-basiertes State Management implementieren |
| 16 | Error Handling Patterns | Global Error Handler, HTTP Error Interceptors, Retry-Strategien | Robuste Fehlerbehandlung auf allen Ebenen implementieren |
| 17 | Testing: Unit Tests | TestBed, ComponentFixture, Mocking Services, Harnesses | Angular Components und Services zuverlaessig testen |
| 18 | Testing: Integration & E2E | Component Integration Tests, Cypress/Playwright Basics | Integrations- und E2E-Tests schreiben und verstehen |
| 19 | Angular CLI & Schematics | ng generate, Builder API, Workspace-Konfiguration | Die CLI als Produktivitaets-Werkzeug voll ausschoepfen |
| 20 | Architecture Review Challenge | Feature-Module, Shared-Module, Core-Module Patterns | Eine Angular-Anwendung sauber strukturieren |

**Phase-2-Sektionen im Detail:**

**Lektion 11: Modules vs. Standalone** (~50 Min, 5 Sektionen)
1. NgModules: Was sie waren und warum sie existierten
2. Das Problem mit NgModules: Boilerplate, Verwirrung, Tree-Shaking
3. Standalone Components: Die Loesung (Angular 14+)
4. bootstrapApplication vs. bootstrapModule
5. Migration: NgModules zu Standalone -- Schritt fuer Schritt

**Lektion 12: Lazy Loading & Code Splitting** (~50 Min, 5 Sektionen)
1. Warum Lazy Loading? Bundle-Groesse und Initial Load
2. Route-based Lazy Loading: loadChildren und loadComponent
3. @defer Blocks: Lazy Loading im Template (Angular 17+)
4. Preloading Strategies: PreloadAllModules, Custom Strategies
5. Analysieren: Source Map Explorer, Webpack Bundle Analyzer

**Lektion 13: HTTP Client & Interceptors** (~60 Min, 6 Sektionen)
1. HttpClient Setup: provideHttpClient(), withInterceptors()
2. Typed HTTP Requests: GET<T>, POST<T> -- Generics in Aktion
3. Error Handling bei HTTP: catchError, retry, retryWhen
4. Class-based Interceptors: Das traditionelle Pattern
5. Functional Interceptors (Angular 15+): Der neue Standard
6. Praxis: Auth-Token, Loading-Spinner, Caching, Logging

**Lektion 14: State Management Foundations** (~50 Min, 5 Sektionen)
1. Wo lebt State? Component, Service, URL, Global Store
2. Service-basierter State: BehaviorSubject + Observable
3. Signal-basierter State: signal(), computed(), effect()
4. Wann braucht man einen Store? Die Entscheidungskriterien
5. Patterns: Facade Services, State-Service vs. Data-Service

**Lektion 15: State Management Advanced** (~60 Min, 6 Sektionen)
1. NgRx Store: Actions, Reducers, Selectors, Effects
2. NgRx ComponentStore: Lokaler Zustand fuer Components
3. NgRx SignalStore: Die Zukunft von NgRx (Angular 17+)
4. NGXS und Akita: Alternativen kennen (Ueberblick)
5. Patterns: Entity-State, Optimistic Updates, Undo
6. Wann welches Pattern? Entscheidungsbaum

**Lektion 16: Error Handling Patterns** (~50 Min, 5 Sektionen)
1. Angulars ErrorHandler: Die globale Fehlergrenze
2. HTTP Fehler: Interceptors, Retry-Strategien, Error-Mapping
3. Component-Level Error Handling: ErrorBoundary-Pattern
4. User-Feedback: Snackbar, Toast, Error Pages
5. Monitoring: Sentry, LogRocket Integration

**Lektion 17: Testing -- Unit Tests** (~60 Min, 6 Sektionen)
1. TestBed: Angulars Testing-Infrastruktur verstehen
2. Component Testing: ComponentFixture, DebugElement
3. Service Testing: Mocking Dependencies, SpyObj
4. Pipe und Directive Testing
5. Component Harnesses (Angular CDK): Stabile Test-APIs
6. Best Practices: Was testen, was nicht, wie strukturieren

**Lektion 18: Testing -- Integration & E2E** (~50 Min, 5 Sektionen)
1. Integration Tests: Mehrere Components zusammen testen
2. Router Testing: RouterTestingModule, fakeAsync
3. HTTP Testing: HttpClientTestingModule, expectOne
4. E2E mit Playwright: Setup und erste Tests
5. Testing Strategy: Die Test-Pyramide in Angular

**Lektion 19: Angular CLI & Schematics** (~40 Min, 4 Sektionen)
1. ng generate: Alle Blueprints kennen und nutzen
2. angular.json: Workspace-Konfiguration verstehen
3. Builder API: Was passiert bei ng build, ng serve
4. Custom Schematics: Eigene Generatoren bauen (Vorschau)

**Lektion 20: Architecture Review Challenge** (~50 Min, 5 Sektionen)
1. Feature-Module / Feature-Routes: Strukturierung nach Domaene
2. Shared vs. Core: Was gehoert wohin?
3. Barrel Exports: index.ts Patterns
4. Dependency Rules: Wer darf wen importieren?
5. Review Challenge: Eine Architektur analysieren und verbessern

---

### Phase 3: Advanced Angular (Lektion 21--30)

> Fortgeschrittene Konzepte. Hier geht es um die Mechanismen unter der Haube:
> Signals, RxJS, Change Detection, und fortgeschrittene Template-Patterns.
> Dieses Wissen trennt Angular-Anwender von Angular-Experten.

| # | Lektion | Kernkonzept | Du kannst danach... |
|---|---------|-------------|---------------------|
| 21 | Signals Deep Dive | signal(), computed(), effect(), LinkedSignal, Resource | Das Signal-System in seiner ganzen Tiefe verstehen und einsetzen |
| 22 | RxJS Foundations fuer Angular | Observable, Observer, Subscription, Core Operators | RxJS als Werkzeug (nicht als Hindernis) nutzen |
| 23 | RxJS Patterns in Angular | switchMap, mergeMap, combineLatest, Fehlerbehandlung | Reale Angular-Probleme mit RxJS elegant loesen |
| 24 | RxJS & Signals: Interop | toSignal(), toObservable(), Wann was? | Signals und RxJS bewusst kombinieren |
| 25 | Change Detection Deep Dive | Zone.js, Default vs. OnPush, Zoneless (experimental) | Angulars Render-Mechanismus vollstaendig verstehen und optimieren |
| 26 | Content Projection & Templates | ng-content, ng-template, ng-container, ngTemplateOutlet | Flexible, wiederverwendbare Component-APIs designen |
| 27 | Dynamic Components & Portals | ViewContainerRef, createComponent(), CDK Portal | Components zur Laufzeit erzeugen und positionieren |
| 28 | Custom Directives & Pipes Advanced | Structural Directives, Exportieren, Host-Directiven | Eigene Template-Erweiterungen bauen die sich "Angular-nativ" anfuehlen |
| 29 | Angular CDK | Overlay, Drag&Drop, Virtual Scrolling, Accessibility | Die CDK-Bausteine kennen und fuer eigene Komponenten nutzen |
| 30 | Advanced Patterns Challenge | Kombination aller Phase-3-Konzepte | Komplexe UI-Patterns mit Signals, RxJS und Templates umsetzen |

**Phase-3-Sektionen im Detail:**

**Lektion 21: Signals Deep Dive** (~60 Min, 6 Sektionen)
1. Reactive Primitives: Warum Angular Signals eingefuehrt hat
2. signal(), computed(), effect(): Die drei Bausteine
3. Signal Equality und Custom Comparators
4. input(), output(), model(): Signal-based Component APIs (Angular 17.1+)
5. LinkedSignal und Resource API (Angular 19+)
6. Signals vs. RxJS: Nicht Entweder-Oder, sondern Sowohl-Als-Auch

**Lektion 22: RxJS Foundations fuer Angular** (~60 Min, 6 Sektionen)
1. Warum RxJS? Das Problem das Observable loest
2. Observable, Observer, Subscription: Die Grundbausteine
3. Creation Operators: of, from, interval, fromEvent, HttpClient
4. Transformation Operators: map, filter, tap, scan
5. Combination Operators: merge, concat, forkJoin, combineLatest
6. Subscription Management: takeUntilDestroyed, async Pipe

**Lektion 23: RxJS Patterns in Angular** (~60 Min, 6 Sektionen)
1. Higher-Order Observables: switchMap, mergeMap, concatMap, exhaustMap
2. Wann welcher Map-Operator? Die Entscheidungstabelle
3. Fehlerbehandlung: catchError, retry, EMPTY, throwError
4. Debouncing und Throttling: Sucheingaben, Scroll-Events
5. Caching: shareReplay, BehaviorSubject-Cache
6. Anti-Patterns: verschachtelte Subscriptions, Memory Leaks

**Lektion 24: RxJS & Signals -- Interop** (~50 Min, 5 Sektionen)
1. toSignal(): Observable zu Signal
2. toObservable(): Signal zu Observable
3. Wann Signal, wann Observable? Der Entscheidungsbaum
4. Migration Patterns: Von RxJS-heavy zu Signal-basiert
5. Praxis: HttpClient + Signals, Forms + Signals

**Lektion 25: Change Detection Deep Dive** (~60 Min, 6 Sektionen)
1. Wie Change Detection funktioniert: Der Component-Baum
2. Zone.js: Monkey-Patching und die Magie dahinter
3. ChangeDetectionStrategy.Default vs. OnPush
4. OnPush: Wann prueft Angular? (Input, async, markForCheck)
5. Signal-based Change Detection: Die zoneless Zukunft
6. Debugging: Angular DevTools, Profiling, Bottleneck-Analyse

**Lektion 26: Content Projection & Templates** (~60 Min, 6 Sektionen)
1. ng-content: Single-Slot und Multi-Slot Projection
2. ng-template: Vorlagen definieren ohne sie zu rendern
3. ng-container: Logik-Container ohne DOM-Element
4. ngTemplateOutlet: Templates dynamisch einsetzen
5. ContentChild und ContentChildren: Projizierte Inhalte abfragen
6. Praxis: Wiederverwendbare Card, Modal, Tab-Components

**Lektion 27: Dynamic Components & Portals** (~50 Min, 5 Sektionen)
1. ViewContainerRef: Der Container fuer dynamische Components
2. createComponent(): Components programmatisch erzeugen
3. ComponentRef: Input-/Output-Binding zur Laufzeit
4. CDK Portal und PortalOutlet: Components an anderer Stelle rendern
5. Praxis: Modale Dialoge, Tooltip-System, Plugin-Architektur

**Lektion 28: Custom Directives & Pipes Advanced** (~50 Min, 5 Sektionen)
1. Structural Directives: microsyntax, TemplateRef, ViewContainerRef
2. Host Directives (Angular 15+): Verhalten kompositionieren
3. Directive exportAs: Directives im Template referenzieren
4. Standalone Directives und Pipes
5. Praxis: Permission-Directive, Infinite-Scroll-Directive, Format-Pipe

**Lektion 29: Angular CDK** (~50 Min, 5 Sektionen)
1. Was ist das CDK? Bausteine ohne Design
2. Overlay: Dropdowns, Tooltips, Modale
3. Drag & Drop: cdkDrag, cdkDropList
4. Virtual Scrolling: Grosse Listen performant rendern
5. Accessibility: FocusTrap, LiveAnnouncer, a11y-Patterns

**Lektion 30: Advanced Patterns Challenge** (~50 Min, 5 Sektionen)
1. Pattern: Reactive Data Table mit Signals + RxJS
2. Pattern: Undo/Redo mit Signal-basiertem State
3. Pattern: Flexible Layout-Component mit Content Projection
4. Pattern: Dynamic Form Renderer
5. Review: Alle Phase-3-Konzepte zusammen anwenden

---

### Phase 4: Angular Mastery (Lektion 31--40)

> Meisterschaft. Hier geht es um Performance, SSR, Architektur fuer grosse Anwendungen,
> und die Faehigkeit, das Angular-Oekosystem mitzugestalten. Nach dieser Phase verstehst
> du nicht nur Angular -- du kannst es formen.

| # | Lektion | Kernkonzept | Du kannst danach... |
|---|---------|-------------|---------------------|
| 31 | Performance Optimization | Bundle Size, Runtime Performance, Memory, Core Web Vitals | Performance-Probleme systematisch finden und beheben |
| 32 | Server-Side Rendering (SSR) | Angular SSR (ehemals Universal), Hydration, Prerendering | SSR aufsetzen und verstehen wann es Sinn macht |
| 33 | Internationalization (i18n) | Built-in i18n, ngx-translate, ICU-Expressions | Mehrsprachige Angular-Apps bauen |
| 34 | Animations | Angular Animations API, Transition-Triggers, Reusable Animations | Fluessige UI-Animationen mit Angulars Animation-System bauen |
| 35 | Custom Schematics & Builders | @angular-devkit/schematics, Builder API, AST-Manipulation | Eigene CLI-Erweiterungen und Code-Generatoren schreiben |
| 36 | Library Authoring | ng-packagr, Secondary Entry Points, Peer Dependencies | Eigene Angular-Libraries bauen und veroeffentlichen |
| 37 | Micro Frontends | Module Federation, Native Federation, Single-SPA | Micro Frontend Strategien kennen und bewerten |
| 38 | Migration Strategies | NgModules->Standalone, AngularJS->Angular, Version Upgrades | Grosse Migrationen sicher planen und durchfuehren |
| 39 | Real-World Architecture | Nx Monorepo, Domain-Driven Design, Clean Architecture | Enterprise Angular-Projekte architektonisch fuehren |
| 40 | Capstone Project | Alles zusammen | Eine vollstaendige Angular-Anwendung eigenstaendig designen und begruenden |

**Phase-4-Sektionen im Detail:**

**Lektion 31: Performance Optimization** (~60 Min, 6 Sektionen)
1. Performance-Budget: Was ist schnell genug? Core Web Vitals
2. Bundle Size: Tree Shaking, Lazy Loading, Code Splitting analysieren
3. Runtime Performance: Change Detection, TrackBy, OnPush, Signals
4. Memory: Subscription Leaks, WeakRef, Profiling
5. Template Performance: Pipes vs. Methods, @defer, Virtual Scrolling
6. Tools: Lighthouse, Angular DevTools Performance Tab, Source Map Explorer

**Lektion 32: Server-Side Rendering (SSR)** (~60 Min, 6 Sektionen)
1. Warum SSR? SEO, Performance, Social Sharing
2. Angular SSR Setup: @angular/ssr (Angular 17+)
3. Hydration: Vom Server-HTML zur interaktiven App
4. Partial Hydration und Deferrable Views
5. Prerendering: Statische Seiten zur Build-Zeit
6. SSR Pitfalls: window, document, localStorage, Browser-only APIs

**Lektion 33: Internationalization** (~50 Min, 5 Sektionen)
1. Angulars Built-in i18n: Compile-Time Translation
2. ICU Message Format: Plurals, Select, Nested
3. ngx-translate: Runtime Translation als Alternative
4. Locale-abhaengige Pipes: Datum, Waehrung, Zahlen
5. RTL-Support und Accessibility in mehrsprachigen Apps

**Lektion 34: Animations** (~50 Min, 5 Sektionen)
1. Angulars Animation-System: trigger, state, transition, animate
2. Enter/Leave Animations: :enter, :leave, void
3. Stagger und Query: Komplexe Sequenzen
4. Route Animations: Uebergaenge zwischen Seiten
5. Reusable Animations und AnimationBuilder

**Lektion 35: Custom Schematics & Builders** (~60 Min, 6 Sektionen)
1. Was sind Schematics? Code-Generierung als Werkzeug
2. Tree API: Dateien lesen, schreiben, umbenennen
3. AST-Manipulation: TypeScript-Code programmatisch aendern
4. Schematic testen: SchematicTestRunner
5. Custom Builders: Eigene Build-Schritte definieren
6. Praxis: Ein Team-Standard-Schematic bauen

**Lektion 36: Library Authoring** (~50 Min, 5 Sektionen)
1. ng generate library: Setup und Workspace-Konfiguration
2. ng-packagr: Wie Angular Libraries gebaut werden
3. Secondary Entry Points: Modulare Library-Struktur
4. Peer Dependencies und Version Ranges
5. Veroeffentlichen: npm, Verdaccio, GitHub Packages

**Lektion 37: Micro Frontends** (~50 Min, 5 Sektionen)
1. Das Problem: Grosse Teams, grosse Anwendungen
2. Module Federation (Webpack): Konzept und Setup
3. Native Federation (esbuild): Die Zukunft ohne Webpack
4. Single-SPA: Framework-uebergreifende Integration
5. Bewertung: Wann Micro Frontends Sinn machen und wann nicht

**Lektion 38: Migration Strategies** (~50 Min, 5 Sektionen)
1. NgModules zu Standalone: Der offizielle Migrationspfad
2. Angular Version Upgrades: ng update und Breaking Changes
3. AngularJS (v1) zu Angular: Hybrid-App-Strategie
4. RxJS-heavy zu Signal-basiert: Schrittweise Migration
5. Migration planen: Risiken, Zeitschaetzung, Team-Kommunikation

**Lektion 39: Real-World Architecture** (~60 Min, 6 Sektionen)
1. Nx Monorepo: Multi-Project-Setup fuer Angular
2. Domain-Driven Design in Angular: Bounded Contexts als Libraries
3. Clean Architecture: Layers und Dependency Rules
4. Feature Flags, A/B Testing, Canary Deployments
5. Logging, Monitoring, Error Tracking in Production
6. Architektur-Entscheidungen dokumentieren: ADRs

**Lektion 40: Capstone Project** (~60 Min, 6 Sektionen)
1. Anforderungsanalyse: Eine realistische Anwendung spezifizieren
2. Architektur-Entscheidungen: Standalone, State Management, Routing
3. Implementierungsplan: Feature-basierte Aufteilung
4. Performance-Plan: Lazy Loading, OnPush, Signals
5. Testing-Strategie: Was wird wie getestet?
6. Praesentation: Architektur erklaeren und begruenden

---

## TypeScript-Verbindungstabelle

> Fuer jede Angular-Lektion: Welche TypeScript-Konzepte aus dem Grundkurs werden aktiv gebraucht?
> Die Nummern verweisen auf die TypeScript-Lektionen (TS-01 bis TS-40).

### Legende

- **Primaer**: Dieses TS-Konzept ist zentral fuer die Angular-Lektion
- **Sekundaer**: Wird benutzt, aber ist nicht der Fokus
- **Vertiefung**: TypeScript-Wissen das durch den Angular-Kontext vertieft wird

### Phase 1: Angular Foundations

| Angular-Lektion | Primaere TS-Konzepte | Sekundaere TS-Konzepte | Verbindungs-Erklaerung |
|-----------------|---------------------|------------------------|----------------------|
| 01 Mental Model | TS-01 (Compiler), TS-29 (tsconfig) | TS-19 (Modules) | Angular-Compiler (ngc) baut auf dem TS-Compiler auf; AOT/JIT nutzen tsconfig extends |
| 02 Components | TS-28 (Decorators), TS-21 (Classes) | TS-05 (Interfaces), TS-06 (Functions) | @Component ist ein Decorator auf einer Klasse; Lifecycle Hooks sind Interface-Implementations |
| 03 Templates | TS-11 (Type Narrowing) | TS-03 (Inference), TS-09 (Literal Types) | Template-Expressions nutzen TS-Expressions; @if entspricht Type Narrowing im Template |
| 04 Directives | TS-28 (Decorators), TS-13 (Generics) | TS-21 (Classes), TS-06 (Functions) | @Directive ist ein Decorator; Structural Directives nutzen Generics fuer Template-Context |
| 05 Pipes | TS-05 (Interfaces), TS-13 (Generics) | TS-06 (Functions), TS-17 (Conditional Types) | PipeTransform ist ein Interface; Generische Pipes nutzen Conditional Types fuer Returntypen |
| 06 DI Basics | TS-21 (Classes), TS-28 (Decorators), TS-13 (Generics) | TS-05 (Interfaces), TS-24 (Branded Types) | @Injectable = Decorator; InjectionToken<T> = Generics; Token-basierte DI aehnelt Branded Types |
| 07 DI Deep Dive | TS-13 (Generics), TS-14 (Generic Patterns) | TS-28 (Decorators), TS-22 (Advanced Generics) | inject<T>() ist eine generische Funktion; Multi-Providers nutzen Array-Generics |
| 08 Routing | TS-05 (Interfaces), TS-12 (Discriminated Unions) | TS-31 (Async), TS-06 (Functions) | Route-Config nutzt Interfaces; Guards returnen Observable<boolean> oder Promise<boolean> |
| 09 Forms TDF | TS-07 (Union Types), TS-05 (Interfaces) | TS-03 (Inference) | ngModel-Typen, Validation-Ergebnisse als Union Types |
| 10 Forms Reactive | TS-13 (Generics), TS-16 (Mapped Types), TS-15 (Utility Types) | TS-23 (Recursive Types), TS-17 (Conditional Types) | FormGroup<T> ist hochgradig generisch; Typed Forms nutzen Mapped Types fuer Verschachtelung |

### Phase 2: Angular Architecture

| Angular-Lektion | Primaere TS-Konzepte | Sekundaere TS-Konzepte | Verbindungs-Erklaerung |
|-----------------|---------------------|------------------------|----------------------|
| 11 Modules/Standalone | TS-19 (Modules), TS-28 (Decorators) | TS-29 (tsconfig) | @NgModule-Decorator, ES-Module-System, Module Resolution |
| 12 Lazy Loading | TS-19 (Modules), TS-31 (Async) | TS-06 (Functions) | Dynamic import() ist ein TS/JS-Feature; loadChildren nutzt Promise<Routes> |
| 13 HTTP Client | TS-13 (Generics), TS-31 (Async) | TS-25 (Error Handling), TS-32 (Type-safe APIs) | HttpClient.get<T>() = Generics + Async; Interceptors = Type-safe Middleware-Pattern |
| 14 State Foundations | TS-13 (Generics), TS-07 (Union Types) | TS-12 (Discriminated Unions) | BehaviorSubject<T>, signal<T>() = Generics; State-Zustaende als Union Types |
| 15 State Advanced | TS-12 (Discriminated Unions), TS-16 (Mapped Types) | TS-14 (Generic Patterns), TS-26 (Advanced Patterns) | NgRx Actions = Discriminated Unions; createReducer nutzt Mapped Types und Overloads |
| 16 Error Handling | TS-25 (Error Handling), TS-07 (Union Types) | TS-21 (Classes), TS-17 (Conditional Types) | ErrorHandler-Klasse, HttpErrorResponse als Typ, Result-Pattern fuer Error-States |
| 17 Unit Testing | TS-33 (Testing), TS-13 (Generics) | TS-15 (Utility Types), TS-22 (Advanced Generics) | TestBed.inject<T>(), SpyObj<T> = Generics; Partial<T> fuer Mock-Daten |
| 18 Integration Tests | TS-33 (Testing), TS-31 (Async) | TS-13 (Generics) | Async Test-Patterns, HttpTestingController.expectOne<T>() |
| 19 CLI & Schematics | TS-19 (Modules), TS-38 (Compiler API) | TS-29 (tsconfig) | Schematics nutzen den TS Compiler API; angular.json ist eine typisierte Config |
| 20 Architecture Review | TS-19 (Modules), TS-05 (Interfaces) | TS-26 (Advanced Patterns) | Module-Grenzen, Interface-basierte Abstraktion, Dependency Rules |

### Phase 3: Advanced Angular

| Angular-Lektion | Primaere TS-Konzepte | Sekundaere TS-Konzepte | Verbindungs-Erklaerung |
|-----------------|---------------------|------------------------|----------------------|
| 21 Signals | TS-13 (Generics), TS-17 (Conditional Types) | TS-22 (Advanced Generics), TS-06 (Functions) | signal<T>(), computed() nutzt Inference, WritableSignal<T> vs Signal<T> = Generics + Conditional |
| 22 RxJS Foundations | TS-13 (Generics), TS-22 (Advanced Generics) | TS-17 (Conditional Types), TS-06 (Functions) | Observable<T>, Operator-Signatures = verschachtelte Generics; pipe() = Function Composition |
| 23 RxJS Patterns | TS-14 (Generic Patterns), TS-31 (Async) | TS-25 (Error Handling), TS-17 (Conditional Types) | switchMap<T,R>(), combineLatest<[A,B,C]> = Advanced Generics und Tuple Types |
| 24 RxJS+Signals | TS-13 (Generics), TS-07 (Union Types) | TS-17 (Conditional Types) | toSignal<T>() Overloads, initialValue-Abhaengigkeit aendert Returntyp (Conditional Types) |
| 25 Change Detection | TS-21 (Classes), TS-28 (Decorators) | TS-05 (Interfaces) | OnPush = Component-Metadata (Decorator); Zone.js = Runtime-Patching (TS-Compile vs Runtime) |
| 26 Content Projection | TS-13 (Generics), TS-18 (Template Literals) | TS-17 (Conditional Types) | TemplateRef<C> = Generics; select-Attribut als String Literal |
| 27 Dynamic Components | TS-13 (Generics), TS-21 (Classes) | TS-22 (Advanced Generics), TS-28 (Decorators) | ComponentRef<T>, ViewContainerRef.createComponent<T>() = Generics mit Class-Constraints |
| 28 Directives Advanced | TS-28 (Decorators), TS-13 (Generics) | TS-16 (Mapped Types) | Host Directives nutzen Decorator-Composition; Structural Directive Context = Generic Interface |
| 29 Angular CDK | TS-13 (Generics), TS-05 (Interfaces) | TS-14 (Generic Patterns), TS-21 (Classes) | CDK-Klassen sind hochgradig generisch: CdkDrag<T>, CdkDropList<T> |
| 30 Advanced Challenge | Alle bisherigen | -- | Integration aller Konzepte |

### Phase 4: Angular Mastery

| Angular-Lektion | Primaere TS-Konzepte | Sekundaere TS-Konzepte | Verbindungs-Erklaerung |
|-----------------|---------------------|------------------------|----------------------|
| 31 Performance | TS-34 (Performance/Compiler) | TS-29 (tsconfig), TS-13 (Generics) | Bundle-Analyse, Tree-Shaking haengt von TS-Konfiguration ab |
| 32 SSR | TS-19 (Modules), TS-31 (Async) | TS-17 (Conditional Types), TS-11 (Narrowing) | Platform-Checks (isPlatformBrowser) = Type Narrowing; Transfer State = serialisierbare Typen |
| 33 i18n | TS-18 (Template Literals), TS-09 (Literal Types) | TS-16 (Mapped Types) | Translation Keys als Literal Types, Type-safe i18n-Interfaces |
| 34 Animations | TS-09 (Literal Types), TS-06 (Functions) | TS-05 (Interfaces) | Animation Trigger-Namen als String Literals, AnimationBuilder-Typen |
| 35 Schematics | TS-38 (Compiler API), TS-23 (Recursive Types) | TS-19 (Modules), TS-37 (Type-Level Programming) | AST-Manipulation nutzt den TS Compiler API direkt; Tree ist rekursiv |
| 36 Library Authoring | TS-36 (Library Authoring), TS-27 (Declaration Merging) | TS-19 (Modules), TS-29 (tsconfig) | ng-packagr generiert .d.ts; Secondary Entry Points nutzen Module-Resolution |
| 37 Micro Frontends | TS-19 (Modules), TS-27 (Declaration Merging) | TS-29 (tsconfig), TS-36 (Library Authoring) | Module Federation nutzt TS Module Resolution; Shared Dependencies brauchen Declaration Merging |
| 38 Migration | TS-35 (Migration), TS-29 (tsconfig) | TS-19 (Modules) | TS-Migrationsstrategien uebertragen sich direkt auf Angular-Migrationen |
| 39 Architecture | TS-26 (Advanced Patterns), TS-19 (Modules) | TS-36 (Library Authoring), TS-05 (Interfaces) | DDD-Boundaries = TS-Module; Clean Architecture = Interface-Abstraktion |
| 40 Capstone | Alle TS-Lektionen | -- | Vollstaendige Integration von TypeScript-Wissen in Angular-Architektur |

### Haeufigkeits-Analyse: Top-10 TypeScript-Konzepte fuer Angular

| Rang | TS-Lektion | Konzept | Angular-Lektionen die es nutzen | Kommentar |
|------|-----------|---------|-------------------------------|-----------|
| 1 | TS-13 | Generics Basics | 30 von 40 | DAS zentrale TS-Konzept fuer Angular |
| 2 | TS-28 | Decorators | 15 von 40 | Angular LEBT von Decorators (trotz Signal-APIs) |
| 3 | TS-21 | Classes & OOP | 14 von 40 | Angular ist klassenbasiert |
| 4 | TS-05 | Interfaces | 13 von 40 | Contracts ueberall: Lifecycle, Config, DI |
| 5 | TS-19 | Modules | 12 von 40 | Module-System ist Architektur-Grundlage |
| 6 | TS-17 | Conditional Types | 11 von 40 | Viele Angular-APIs nutzen Overloads/Conditional Returns |
| 7 | TS-06 | Functions | 10 von 40 | Functional Guards, Pipes, Operators |
| 8 | TS-31 | Async TypeScript | 9 von 40 | HTTP, Guards, Resolver, RxJS |
| 9 | TS-07 | Union Types | 8 von 40 | State-Modellierung, Error Handling |
| 10 | TS-12 | Discriminated Unions | 7 von 40 | NgRx Actions, Router Events, Form States |

---

## Geschaetzter Umfang

### Lektions-Ueberblick

| Metrik | Wert |
|--------|------|
| **Gesamtanzahl Lektionen** | 40 |
| **Sektionen pro Lektion** | 4--6 (Durchschnitt: 5,3) |
| **Gesamtanzahl Sektionen** | ~212 |
| **Zeit pro Sektion** | ~10 Minuten Lesen + Verstehen |
| **Zeit pro Lektion (Theorie)** | ~40--60 Minuten |
| **Zeit pro Lektion (mit Uebungen)** | ~90--120 Minuten |

### Zeitschaetzung nach Phase

| Phase | Lektionen | Sektionen | Reine Lernzeit | Mit Uebungen & Quiz |
|-------|----------|-----------|---------------|---------------------|
| Phase 1: Foundations | 10 | ~53 | ~9 Stunden | ~17 Stunden |
| Phase 2: Architecture | 10 | ~51 | ~8,5 Stunden | ~16 Stunden |
| Phase 3: Advanced | 10 | ~55 | ~9 Stunden | ~18 Stunden |
| Phase 4: Mastery | 10 | ~53 | ~9 Stunden | ~17 Stunden |
| **Gesamt** | **40** | **~212** | **~35,5 Stunden** | **~68 Stunden** |

### Realistische Zeitplanung

| Lerntempo | Lektionen/Woche | Dauer bis Abschluss |
|-----------|----------------|---------------------|
| Intensiv (taeglich 1--2h) | 3--4 Lektionen | ~10--13 Wochen |
| Moderat (3--4x pro Woche) | 2 Lektionen | ~20 Wochen (~5 Monate) |
| Nebenbei (1--2x pro Woche) | 1 Lektion | ~40 Wochen (~10 Monate) |

### Vergleich mit dem TypeScript-Kurs

| Metrik | TypeScript-Kurs | Angular-Kurs | Kommentar |
|--------|----------------|-------------|-----------|
| Lektionen | 40 | 40 | Gleiche Struktur -- bewaehrt |
| Sektionen/Lektion | 4--7 | 4--6 | Etwas gleichmaessiger |
| Gesamtzeit | ~60--70h | ~68h | Vergleichbar |
| Code-Anteil | ~40% | ~60% | Angular braucht mehr Praxis |
| Konzeptuelle Tiefe | Sehr hoch | Hoch | TS-Kurs ist theoretischer |

---

## Was Angular-Lernen besonders macht

### 1. Angular-einzigartige Konzepte

Diese Konzepte existieren so NUR in Angular (nicht in React, Vue, Svelte):

**a) Dependency Injection als Framework-Grundlage**
- Angular hat ein vollstaendiges DI-System als Kernkonzept
- Hierarchischer Injector-Baum mit verschiedenen Scopes
- React hat Context, Vue hat provide/inject -- aber keines ist so umfassend
- **Warum das schwer ist:** DI-Konzepte stammen aus der Java/C#-Welt; Web-Entwickler kennen sie oft nicht
- **TypeScript-Verbindung:** Decorators, Generics, Branded Types (InjectionToken)

**b) Zone.js und automatische Change Detection**
- Angular patcht ALLE async APIs (setTimeout, Promise, addEventListener)
- Kein Framework macht das sonst -- React und Vue nutzen explizite State-Updates
- **Warum das schwer ist:** Zone.js ist "Magie" -- es funktioniert bis es nicht funktioniert
- **Paradigmenwechsel:** Signals als Abloesung von Zone.js (Angular 17+)

**c) Template Compiler (ngc)**
- Angular kompiliert Templates zu TypeScript zur Build-Zeit
- React-JSX ist "nur" syntaktischer Zucker; Vue-Templates werden zur Laufzeit kompiliert
- **Warum das schwer ist:** Fehler im Template erscheinen als kryptische Compiler-Meldungen
- **TypeScript-Verbindung:** Template Type Checking nutzt den TS Compiler API

**d) Decorator-basierte Metadaten**
- @Component, @Injectable, @Input, @Output, @ViewChild...
- Angular nutzt Decorators intensiver als jedes andere Framework
- **Paradigmenwechsel:** Schrittweise Abloesung durch Signal-APIs (input(), output(), model())
- **TypeScript-Verbindung:** TS-28 (Decorators) ist essentiell

**e) Reactive Forms als eigenes System**
- FormControl, FormGroup, FormArray mit Typed Forms
- Kein anderes Framework hat ein so umfassendes Form-System
- **TypeScript-Verbindung:** Generics, Mapped Types, Recursive Types

### 2. Die haeufigsten Schwierigkeiten

Basierend auf Community-Analyse, StackOverflow-Trends und bekannten Pain Points:

**Schwierigkeitsgrad 1: Einstiegshuerde (erste Wochen)**

| Problem | Warum es schwer ist | Loesung im Kurs |
|---------|-------------------|----------------|
| Zu viele Konzepte auf einmal | Angular hat Module, DI, Decorators, RxJS, CLI -- alles gleichzeitig | Phase 1 trennt alles sauber: erst Components, dann DI, dann Forms |
| "Boilerplate-Schock" | Ein Component braucht Decorator, Klasse, Template, Styles, Module-Registration | Standalone Components reduzieren das drastisch -- Lektion 02 startet damit |
| RxJS-Lernkurve | Observable, Subscription, Operators -- neue Denkweise | RxJS erst in Phase 3 (Lektion 22--24), nachdem Signals verstanden sind |
| Angular CLI Magie | `ng generate` macht Dinge die man nicht versteht | Lektion 19 erklaert genau was die CLI tut und warum |

**Schwierigkeitsgrad 2: Architektur (nach 1--3 Monaten)**

| Problem | Warum es schwer ist | Loesung im Kurs |
|---------|-------------------|----------------|
| State Management Verwirrung | BehaviorSubject? Signal? NgRx? Was wann? | Lektionen 14--15 mit klarem Entscheidungsbaum |
| Testing ist komplex | TestBed-Setup, Provider-Mocking, Async-Tests | Eigene Lektionen (17--18) mit schrittweisem Aufbau |
| Module-Architektur | Feature/Shared/Core -- wer importiert wen? | Lektion 20 als Review mit klaren Regeln |
| Change Detection Bugs | "Warum updatet meine View nicht?" | Lektion 25 erklaert den Mechanismus vollstaendig |

**Schwierigkeitsgrad 3: Fortgeschritten (nach 6+ Monaten)**

| Problem | Warum es schwer ist | Loesung im Kurs |
|---------|-------------------|----------------|
| Memory Leaks durch Subscriptions | takeUntil-Pattern vergessen, Subscription nicht bereinigt | Lektion 22 mit takeUntilDestroyed() als moderne Loesung |
| Performance bei grossen Apps | Slow Change Detection, Bundle Size, Runtime Performance | Eigene Lektion 31 mit systematischem Ansatz |
| RxJS Anti-Patterns | Nested Subscriptions, switchMap vs mergeMap Verwechslung | Lektion 23 mit klarer Entscheidungstabelle |
| Signals + RxJS Interop | Wann Signal, wann Observable? Wie kombinieren? | Eigene Lektion 24 mit Migrationspfad |

### 3. Die haeufigsten Misconceptions

**Misconception 1: "Angular ist veraltet weil es Module braucht"**
- **Realitaet:** Standalone Components sind seit Angular 14 verfuegbar und seit 17 Standard. NgModules sind optional. Angular hat sich radikal modernisiert.
- **Im Kurs:** Lektion 02 startet mit Standalone. Lektion 11 erklaert Module als historischen Kontext.

**Misconception 2: "RxJS IST Angular"**
- **Realitaet:** RxJS ist eine Library die Angular nutzt, aber man kann Angular ohne tiefes RxJS-Wissen benutzen. Mit Signals (Angular 17+) wird RxJS zunehmend optional fuer viele Use Cases.
- **Im Kurs:** Signals kommen vor RxJS (Lektion 21 vor 22--23). RxJS wird als Werkzeug positioniert, nicht als Voraussetzung.

**Misconception 3: "OnPush ist immer besser"**
- **Realitaet:** OnPush ist eine Optimierung die Verstaendnis von Immutability und Change Detection erfordert. Falsch eingesetzt verursacht es Bugs (View updatet nicht). Mit Signals wird OnPush weniger relevant.
- **Im Kurs:** Lektion 25 erklaert vollstaendig wann OnPush hilft und wann es schadet.

**Misconception 4: "Angular ist nur fuer Enterprise"**
- **Realitaet:** Angulars Staerke liegt in konsistenter Architektur und eingebauten Loesungen. Das ist wertvoll bei jeder Groesse -- aber der Overhead lohnt sich besonders bei mittleren bis grossen Projekten.
- **Im Kurs:** Jede Architektur-Entscheidung wird mit "Wann braucht man das?" kontextualisiert.

**Misconception 5: "Decorators werden abgeschafft"**
- **Realitaet:** Decorators bleiben. Angular fuegt Signal-basierte Alternativen HINZU (@Input -> input(), @Output -> output()). Bestehender Code mit Decorators funktioniert weiter. Die Migration ist optional und schrittweise.
- **Im Kurs:** Beide Stile werden gezeigt. Neue Projekte nutzen Signal-APIs, Migration ist Lektion 38.

**Misconception 6: "NgRx ist Pflicht fuer State Management"**
- **Realitaet:** NgRx ist maechtiger als die meisten Anwendungen brauchen. Viele Angular-Apps funktionieren hervorragend mit Service-basiertem State oder SignalStore. NgRx lohnt sich erst bei komplexen, geteilten Zustaenden.
- **Im Kurs:** Lektion 14 startet mit einfachem State. NgRx kommt erst in Lektion 15 mit klaren Kriterien wann man es braucht.

**Misconception 7: "Angular Change Detection ist langsam"**
- **Realitaet:** Angulars Change Detection ist fuer die meisten Anwendungen schnell genug. Performance-Probleme entstehen durch falsche Patterns (Methoden im Template, fehlende trackBy, Default statt OnPush bei grossen Listen), nicht durch Angular selbst.
- **Im Kurs:** Lektion 25 und 31 machen den Unterschied zwischen Framework-Overhead und Entwickler-Fehler klar.

**Misconception 8: "TypeScript-Decorators und Angular-Decorators sind dasselbe"**
- **Realitaet:** Angular nutzt seinen eigenen Compiler (ngc) um Decorator-Metadaten zu verarbeiten. Die experimentellen TS-Decorators und Stage-3-Decorators sind verwandt aber nicht identisch. Angular-Decorators erzeugen Code den der Angular-Compiler versteht.
- **Im Kurs:** Lektion 02 macht den Unterschied klar. Verweise auf TS-28 (Decorators).

---

## Empfehlungen fuer den Kursbau

### 1. Didaktische Empfehlungen

**Das bestehende LEARN-Modell uebernehmen:**
- L -- Lesen & Verstehen (sections/*.md)
- E -- Erkunden (examples/*.ts mit Angular-Projekten)
- A -- Anwenden (exercises/*.ts)
- R -- Reflektieren (quiz.ts)
- N -- Nachschlagen (cheatsheet.md)

**Angular-spezifische Anpassungen:**
- **Projektkontinuitaet:** Ab Lektion 03 sollte es ein durchgehendes Beispielprojekt geben, das mit jeder Lektion waechst. Angular-Lernen ohne laufende App ist abstrakt.
- **Angular CLI als Ausgangspunkt:** Exercises sollten `ng generate` nutzen, nicht Dateien manuell erstellen.
- **DevTools-Integration:** Jede Lektion ab Phase 2 sollte Debugging-Aufgaben mit Angular DevTools enthalten.
- **Vergleichsboxen:** `> React-Vergleich:` Boxen fuer Konzepte die in React anders geloest werden.

### 2. Technische Empfehlungen

**Angular-Version:**
- Kurs auf Angular 19 aufbauen (aktuellste stabile Version)
- Standalone Components als Standard, NgModules nur als historischer Kontext
- Neue Control Flow Syntax (@if, @for, @switch) als Standard
- Signal-APIs (input(), output(), model()) als primaerer Stil

**Uebungsformat:**
- Jede Lektion braucht ein Mini-Angular-Projekt (nicht nur einzelne .ts-Dateien)
- `ng new` Workspace mit einer Lektion pro Feature-Route
- Exercises als TODO-Kommentare in Angular-Components
- Automatisierte Tests die pruefen ob Exercises korrekt geloest sind

### 3. Reihenfolge-Empfehlungen

**Drei bewusste Reihenfolge-Entscheidungen:**

1. **Signals vor RxJS** (Lektion 21 vor 22--23):
   Signals sind einfacher zu verstehen und decken viele Use Cases ab.
   RxJS wird dann als Erweiterung positioniert, nicht als Grundvoraussetzung.

2. **DI als eigene Doppellektion** (Lektion 06--07):
   DI ist Angulars einzigartigstes Konzept und verdient zwei volle Lektionen.
   Viele Kurse behandeln DI oberflaechlich -- das fuehrt zu Architekturproblemen spaeter.

3. **Testing in Phase 2, nicht Phase 3** (Lektion 17--18):
   Testen sollte Teil der Architektur sein, nicht ein Nachgedanke.
   Nach DI und HTTP (Lektion 13) hat man genug zu testen.

### 4. Was der Kurs bewusst NICHT abdeckt

| Thema | Grund |
|-------|-------|
| Angular Material (UI Library) | Das ist eine Component-Library, kein Angular-Konzept. Eigener Kurs. |
| NgRx im Detail (Effects, Entity, Router Store) | NgRx ist ein eigenes Oekosystem. Lektion 15 gibt den Ueberblick. |
| CSS/SCSS in Angular | View Encapsulation wird erwaehnt, aber CSS ist kein Angular-Thema. |
| Backend/API-Development | Der Kurs fokussiert auf Angular als Frontend-Framework. |
| Spezifische UI Patterns | Dashboards, Admin-Panels etc. sind Anwendungswissen, nicht Framework-Wissen. |

---

## Anhang: Quick-Reference fuer TypeScript-Verbindungen

Wenn du eine bestimmte TypeScript-Lektion abgeschlossen hast, findest du hier die Angular-Lektionen die davon profitieren:

| TS-Lektion | Schaltet frei in Angular-Lektion(en) |
|------------|-------------------------------------|
| TS-05 Interfaces | A-02, A-05, A-06, A-08, A-09, A-20, A-29, A-34, A-39 |
| TS-06 Functions | A-02, A-04, A-05, A-07, A-08, A-12, A-34 |
| TS-07 Union Types | A-09, A-10, A-14, A-16, A-24 |
| TS-09 Literal Types | A-03, A-33, A-34 |
| TS-11 Narrowing | A-03, A-32 |
| TS-12 Discriminated Unions | A-08, A-14, A-15 |
| TS-13 Generics | A-04, A-05, A-06, A-07, A-10, A-13, A-14, A-17, A-21, A-22, A-23, A-24, A-26, A-27, A-28, A-29 |
| TS-14 Generic Patterns | A-07, A-15, A-23, A-29 |
| TS-15 Utility Types | A-10, A-17 |
| TS-16 Mapped Types | A-10, A-15, A-28, A-33 |
| TS-17 Conditional Types | A-05, A-10, A-15, A-16, A-21, A-22, A-24, A-26, A-32 |
| TS-18 Template Literals | A-26, A-33 |
| TS-19 Modules | A-01, A-11, A-12, A-19, A-20, A-32, A-36, A-37, A-38, A-39 |
| TS-21 Classes | A-02, A-04, A-06, A-16, A-25, A-27 |
| TS-22 Advanced Generics | A-07, A-17, A-22, A-23, A-27 |
| TS-23 Recursive Types | A-10, A-35 |
| TS-24 Branded Types | A-06 |
| TS-25 Error Handling | A-13, A-16, A-23 |
| TS-26 Advanced Patterns | A-15, A-20, A-39 |
| TS-27 Declaration Merging | A-36, A-37 |
| TS-28 Decorators | A-02, A-04, A-06, A-07, A-11, A-25, A-27, A-28 |
| TS-29 tsconfig | A-01, A-11, A-19, A-31, A-36, A-37, A-38 |
| TS-31 Async | A-08, A-12, A-13, A-18, A-23, A-32 |
| TS-33 Testing | A-17, A-18 |
| TS-34 Performance | A-31 |
| TS-35 Migration | A-38 |
| TS-36 Library Authoring | A-36, A-37, A-39 |
| TS-37 Type-Level Programming | A-35 |
| TS-38 Compiler API | A-19, A-35 |

---

*Dieses Dokument dient als Planungsgrundlage fuer den Angular-Kurs.*
*Es wird aktualisiert, wenn sich Anforderungen aendern.*
