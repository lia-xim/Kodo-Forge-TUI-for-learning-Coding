# Angular Mastery — Curriculum

> Ziel: Von "ich benutze Angular" zu "ich verstehe Angular" — systematisch, tiefgruendig, praxisnah.
> Voraussetzung: TypeScript Deep Learning Phase 1-2 abgeschlossen.
> Stand: Angular 17/18/19

## Didaktischer Ansatz

Jede Lektion folgt dem **LEARN-Zyklus**:

```
  L — Lesen & Verstehen    →  README.md mit Theorie, Diagrammen, Analogien
  E — Erkunden              →  examples/*.ts — lauffaehige Beispiele zum Experimentieren
  A — Anwenden              →  exercises/*.ts — Aufgaben mit steigender Schwierigkeit
  R — Reflektieren          →  quiz.ts — interaktives Quiz im Terminal
  N — Nachschlagen          →  cheatsheet.md — kompakte Referenz fuer spaeter
```

**Besonderheit dieses Kurses:**
- Kein "Hello World"-Kurs — du kennst TypeScript in der Tiefe
- Kein Framework-Tutorial — es geht um Verstaendnis der Architektur, nicht Rezepte
- Jede Lektion erklaert das **Warum** hinter Angular-Designentscheidungen
- Vergleiche zu React wo sie das Verstaendnis vertiefen

---

## Phase 1: Angular Foundations (Lektion 01–10)

Das Fundament. Hier baust du ein solides mentales Modell davon auf, wie Angular funktioniert —
nicht wie man es benutzt (das kannst du schon), sondern warum es so designed ist.

| # | Lektion | Kernkonzept | Du kannst danach... |
|---|---------|-------------|---------------------|
| 01 | Angular Mental Model | Compiler, Runtime, Zone.js | Erklaeren, was passiert zwischen `ng serve` und dem Browser |
| 02 | Components & Templates | Standalone Components, Data Binding, Lifecycle | Components als Einheit von Logik + Template verstehen |
| 03 | Template Deep Dive | @if, @for, @switch, @defer, Template Expressions | Die neue Control Flow Syntax sicher einsetzen |
| 04 | Directives | Built-in, Attribute vs. Structural, HostBinding/HostListener | Custom Directives planen und Verhaltens-Erweiterungen bauen |
| 05 | Pipes | Built-in, Pure vs Impure, Custom Pipes | Datentransformation im Template beherrschen |
| 06 | Services & Dependency Injection | Providers, Injector-Hierarchie, InjectionToken | Das DI-System als Architektur-Grundlage begreifen |
| 07 | DI Deep Dive | providedIn, Multi-Providers, inject(), Tree-Shaking | DI-Patterns fuer verschiedene Szenarien bewusst waehlen |
| 08 | Routing Fundamentals | Router, Guards, Resolver, Lazy Loading | Navigation und Route-basierte Architektur aufbauen |
| 09 | Forms: Template-Driven | ngModel, Two-Way Binding, Validierung | Einfache Formulare bauen und wissen wann Template-Driven reicht |
| 10 | Forms: Reactive | FormBuilder, FormGroup, Typed Forms, Validierung | Typsichere Reactive Forms fuer komplexe Szenarien bauen |

## Phase 2: Angular Architecture (Lektion 11–20)

Architektur-Ebene. Hier lernst du, wie man Angular-Anwendungen strukturiert,
die wartbar, testbar und performant sind.

| # | Lektion | Kernkonzept | Du kannst danach... |
|---|---------|-------------|---------------------|
| 11 | Modules vs. Standalone | NgModules, Standalone Components, Migration | Bewusst zwischen Module- und Standalone-Architektur entscheiden |
| 12 | Lazy Loading & Code Splitting | loadChildren, loadComponent, @defer | Ladezeiten durch intelligentes Code Splitting optimieren |
| 13 | HTTP Client & Interceptors | HttpClient, typed Responses, Functional Interceptors | Typsichere API-Kommunikation mit Interceptor-Ketten aufbauen |
| 14 | State Management Foundations | Component State, Service State, BehaviorSubject, Signals | State-Management-Strategien bewusst waehlen |
| 15 | State Management Advanced | NgRx Store, ComponentStore, SignalStore | NgRx und Signal-basiertes State Management implementieren |
| 16 | Error Handling Patterns | Global Error Handler, HTTP Interceptors, Retry | Robuste Fehlerbehandlung auf allen Ebenen implementieren |
| 17 | Testing: Unit Tests | TestBed, ComponentFixture, Mocking, Harnesses | Angular Components und Services zuverlaessig testen |
| 18 | Testing: Integration & E2E | Component Integration Tests, Playwright | Integrations- und E2E-Tests schreiben und verstehen |
| 19 | Angular CLI & Schematics | ng generate, Builder API, Workspace-Konfiguration | Die CLI als Produktivitaets-Werkzeug voll ausschoepfen |
| 20 | Architecture Review Challenge | Feature-Module, Shared, Core, Dependency Rules | Eine Angular-Anwendung sauber strukturieren |

## Phase 3: Advanced Angular (Lektion 21–30)

Fortgeschrittene Konzepte. Hier geht es um die Mechanismen unter der Haube:
Signals, RxJS, Change Detection und fortgeschrittene Template-Patterns.

| # | Lektion | Kernkonzept | Du kannst danach... |
|---|---------|-------------|---------------------|
| 21 | Signals Deep Dive | signal(), computed(), effect(), LinkedSignal, Resource | Das Signal-System in seiner ganzen Tiefe verstehen |
| 22 | RxJS Foundations | Observable, Observer, Subscription, Core Operators | RxJS als Werkzeug (nicht als Hindernis) nutzen |
| 23 | RxJS Patterns | switchMap, mergeMap, combineLatest, Fehlerbehandlung | Reale Angular-Probleme mit RxJS elegant loesen |
| 24 | RxJS & Signals Interop | toSignal(), toObservable(), Wann was? | Signals und RxJS bewusst kombinieren |
| 25 | Change Detection Deep Dive | Zone.js, Default vs. OnPush, Zoneless | Angulars Render-Mechanismus vollstaendig verstehen |
| 26 | Content Projection & Templates | ng-content, ng-template, ngTemplateOutlet | Flexible, wiederverwendbare Component-APIs designen |
| 27 | Dynamic Components & Portals | ViewContainerRef, createComponent(), CDK Portal | Components zur Laufzeit erzeugen und positionieren |
| 28 | Custom Directives & Pipes Advanced | Structural Directives, Host-Directiven | Eigene Template-Erweiterungen bauen |
| 29 | Angular CDK | Overlay, Drag&Drop, Virtual Scrolling, Accessibility | CDK-Bausteine fuer eigene Komponenten nutzen |
| 30 | Advanced Patterns Challenge | Kombination aller Phase-3-Konzepte | Komplexe UI-Patterns mit Signals, RxJS und Templates umsetzen |

## Phase 4: Angular Mastery (Lektion 31–40)

Meisterschaft. Performance, SSR, Architektur fuer grosse Anwendungen,
und die Faehigkeit, das Angular-Oekosystem mitzugestalten.

| # | Lektion | Kernkonzept | Du kannst danach... |
|---|---------|-------------|---------------------|
| 31 | Performance Optimization | Bundle Size, Runtime Performance, Core Web Vitals | Performance-Probleme systematisch finden und beheben |
| 32 | Server-Side Rendering (SSR) | Angular SSR, Hydration, Prerendering | SSR aufsetzen und verstehen wann es Sinn macht |
| 33 | Internationalization (i18n) | Built-in i18n, ngx-translate, ICU-Expressions | Mehrsprachige Angular-Apps bauen |
| 34 | Animations | Angular Animations API, Transitions, Reusable Animations | Fluessige UI-Animationen mit Angulars Animation-System bauen |
| 35 | Custom Schematics & Builders | @angular-devkit/schematics, Builder API, AST | Eigene CLI-Erweiterungen und Code-Generatoren schreiben |
| 36 | Library Authoring | ng-packagr, Secondary Entry Points, Peer Dependencies | Eigene Angular-Libraries bauen und veroeffentlichen |
| 37 | Micro Frontends | Module Federation, Native Federation, Single-SPA | Micro Frontend Strategien kennen und bewerten |
| 38 | Migration Strategies | NgModules→Standalone, AngularJS→Angular, Upgrades | Grosse Migrationen sicher planen und durchfuehren |
| 39 | Real-World Architecture | Nx Monorepo, Domain-Driven Design, Clean Architecture | Enterprise Angular-Projekte architektonisch fuehren |
| 40 | Capstone Project | Alles zusammen | Eine vollstaendige Angular-Anwendung eigenstaendig designen |

---

## Danach

Nach Abschluss empfiehlt die Plattform: **React mit TypeScript** — um ein zweites mentales Modell aufzubauen und die Unterschiede zu Angular bewusst zu verstehen.
