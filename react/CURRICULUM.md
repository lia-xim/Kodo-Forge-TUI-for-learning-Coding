# React mit TypeScript — Curriculum

> Ziel: React von Grund auf verstehen — deklarativ, komponentenbasiert, typsicher.
> Voraussetzung: TypeScript Deep Learning Phase 1-2 abgeschlossen.
> Vergleiche zu Angular wo sie das Verstaendnis vertiefen.

## Didaktischer Ansatz

Jede Lektion folgt dem **LEARN-Zyklus**:

```
  L — Lesen & Verstehen    →  README.md mit Theorie, Diagrammen, Analogien
  E — Erkunden              →  examples/*.tsx — lauffaehige Beispiele zum Experimentieren
  A — Anwenden              →  exercises/*.tsx — Aufgaben mit steigender Schwierigkeit
  R — Reflektieren          →  quiz.ts — interaktives Quiz im Terminal
  N — Nachschlagen          →  cheatsheet.md — kompakte Referenz fuer spaeter
```

**Besonderheit dieses Kurses:**
- React und Angular verfolgen fundamental verschiedene Philosophien
- Fuer einen Angular-Entwickler bedeutet das: Verlernen, Umlernen, Neulernen
- JSX ist kein Template — es ist JavaScript/TypeScript
- Unidirektionaler Datenfluss und Immutability stehen im Zentrum

---

## Phase 1: React Foundations (Lektion R01–R10)

React sprechen lernen. Die Grundbausteine sicher beherrschen,
das mentale Modell UI = f(state) verinnerlichen.

| # | Lektion | Kernkonzept | Du kannst danach... |
|---|---------|-------------|---------------------|
| R01 | Projekt-Setup & Mentales Modell | Vite, React DevTools, UI = f(state) | Ein React+TS-Projekt aufsetzen und das Rendermodell erklaeren |
| R02 | JSX & TSX verstehen | Syntax, Expressions, Fragments, ReactNode | JSX als JavaScript-Ausdruecke lesen und schreiben |
| R03 | Components & Props | FC, Props-Interfaces, Children, Destructuring | Typsichere Components mit klar definierten Props bauen |
| R04 | State mit useState | Immutability, Generics, Batching, Updates | State korrekt und typsicher verwalten |
| R05 | Event Handling | SyntheticEvent, TypeScript Event Types, Handler | Events mit korrekten TypeScript-Typen behandeln |
| R06 | Conditional Rendering & Listen | Keys, Ternary, Map, Pattern Matching | UI dynamisch rendern und Listen performant darstellen |
| R07 | useEffect Deep Dive | Dependencies, Cleanup, Lifecycle-Ersatz | Seiteneffekte korrekt und sicher verwalten |
| R08 | useRef & DOM-Zugriff | Refs, forwardRef, useImperativeHandle, Generics | Auf DOM-Elemente typsicher zugreifen |
| R09 | Formulare | Controlled, Uncontrolled, Validation Patterns | Formulare ohne und mit Libraries bauen |
| R10 | Review Challenge | Alle Phase-1-Konzepte | Alles aus Phase 1 frei anwenden |

## Phase 2: React Patterns (Lektion R11–R20)

React denken lernen. Patterns fuer Wiederverwendbarkeit,
Abstraktion und saubere Architektur.

| # | Lektion | Kernkonzept | Du kannst danach... |
|---|---------|-------------|---------------------|
| R11 | Custom Hooks | Typsichere Abstraktion, Best Practices, Komposition | Eigene Hooks fuer wiederverwendbare Logik bauen |
| R12 | Context API | createContext, Provider, Generics, Performance | Globalen State ohne externe Libraries verwalten |
| R13 | useReducer | Discriminated Unions, Action Types, Dispatch | Komplexen State mit Reducer-Pattern verwalten |
| R14 | Error Boundaries | Class Components, Fallback UI, Error Recovery | Fehler elegant abfangen und dem Nutzer anzeigen |
| R15 | Suspense & React.lazy | Code Splitting, Loading States, Fallbacks | Ladezeiten durch Code Splitting optimieren |
| R16 | Performance | React.memo, useMemo, useCallback, Profiling | Performance-Probleme erkennen und gezielt beheben |
| R17 | Composition Patterns | Compound Components, Render Props, Slots | Flexible, wiederverwendbare Component-APIs designen |
| R18 | Testing | Vitest, Testing Library, MSW, Mocking | React-Components zuverlaessig testen |
| R19 | Styling | Tailwind, CSS Modules, styled-components, CVA | Verschiedene Styling-Ansaetze kennen und anwenden |
| R20 | Review Challenge | Alle Phase-2-Konzepte | React-Patterns frei kombinieren |

## Phase 3: Advanced React (Lektion R21–R30)

React meistern. Typsichere Abstraktionen, fortgeschrittene Patterns
und die neuesten React-Features.

| # | Lektion | Kernkonzept | Du kannst danach... |
|---|---------|-------------|---------------------|
| R21 | Generic Components | Typsichere wiederverwendbare UI-Bausteine | Components bauen die mit beliebigen Datentypen arbeiten |
| R22 | Polymorphic Components | as-Prop, ElementType, ComponentPropsWithRef | Components bauen die ihr HTML-Element dynamisch aendern |
| R23 | Higher-Order Components | Typsichere HOCs, Props Injection, Decorators | HOCs als Werkzeug fuer Cross-Cutting Concerns nutzen |
| R24 | React Compiler | Automatische Memoization, Regeln, Einschraenkungen | Den React Compiler verstehen und korrekt einsetzen |
| R25 | Concurrent Features | useTransition, useDeferredValue, Prioritaeten | UI responsiv halten bei aufwendigen Updates |
| R26 | Server Components Grundlagen | RSC, Serialisierung, Client/Server-Grenze | Die Server-Component-Architektur verstehen |
| R27 | Form Libraries | React Hook Form, Zod Integration, Validation | Komplexe Formulare effizient und typsicher bauen |
| R28 | Animation | Framer Motion, Layout Animations, Transitions | Fluessige Animationen in React umsetzen |
| R29 | Advanced Hooks | useImperativeHandle, useSyncExternalStore, use() | Fortgeschrittene Hook-APIs gezielt einsetzen |
| R30 | Review Challenge | Alle Phase-3-Konzepte | Fortgeschrittene React-Techniken anwenden |

## Phase 4: React Ecosystem (Lektion R31–R40)

Die React-Welt beherrschen. State Management, Routing, Testing,
Build Tools und alles was zum Produktionseinsatz gehoert.

| # | Lektion | Kernkonzept | Du kannst danach... |
|---|---------|-------------|---------------------|
| R31 | State Management | Zustand, Jotai, TanStack Query | Die richtige State-Library fuer den Anwendungsfall waehlen |
| R32 | Routing | React Router, TanStack Router, Type-safe Routes | Routing-Loesungen implementieren und vergleichen |
| R33 | Data Fetching | SWR, TanStack Query, Suspense Integration | Daten effizient laden, cachen und synchronisieren |
| R34 | Testing Advanced | E2E mit Playwright, Visual Regression, CI | Umfassende Teststrategien fuer React-Apps aufbauen |
| R35 | Accessibility | ARIA, Screen Readers, axe, Keyboard Navigation | Barrierefreie React-Anwendungen bauen |
| R36 | Internationalization | react-intl, i18next, ICU, Plurals | Mehrsprachige React-Apps implementieren |
| R37 | Monorepo | Turborepo, Shared Packages, Workspace Config | React-Projekte in Monorepo-Strukturen organisieren |
| R38 | Build Tools | Vite, esbuild, Bundle Optimization, Analyse | Build-Pipeline verstehen und optimieren |
| R39 | Design Systems | Component Libraries, Storybook, Tokens | Eigene Design-Systeme bauen und dokumentieren |
| R40 | Capstone Project | Alles zusammen | Eine vollstaendige React-Anwendung eigenstaendig umsetzen |

---

## Danach

Nach Abschluss empfiehlt die Plattform: **Next.js Production** — um React im Full-Stack-Kontext mit Server Components, SSR und Deployment zu meistern.
