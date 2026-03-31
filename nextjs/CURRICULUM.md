# Next.js Production — Curriculum

> Ziel: Next.js App Router vollstaendig verstehen — von Server Components bis Deployment.
> Voraussetzung: React mit TypeScript Phase 1-2 abgeschlossen.
> 20 Module in 4 Phasen — kompakt, praxisnah, produktionsreif.

## Didaktischer Ansatz

Jede Lektion folgt dem **LEARN-Zyklus**:

```
  L — Lesen & Verstehen    →  README.md mit Theorie, Diagrammen, Analogien
  E — Erkunden              →  examples/ — lauffaehige Beispiele zum Experimentieren
  A — Anwenden              →  exercises/ — Aufgaben mit steigender Schwierigkeit
  R — Reflektieren          →  quiz.ts — interaktives Quiz im Terminal
  N — Nachschlagen          →  cheatsheet.md — kompakte Referenz fuer spaeter
```

**Besonderheit dieses Kurses:**
- Next.js ist ein Full-Stack-Framework — Server und Client verschmelzen
- Der App Router ist ein fundamentaler Paradigmenwechsel
- Caching ist das komplexeste Thema — es bekommt eine eigene Lektion
- Jede Lektion verbindet React-Wissen mit Next.js-spezifischen Konzepten

---

## Phase 1: Next.js Foundations (Lektion N01–N05)

Das Fundament. Hier verstehst du die App-Router-Architektur,
die Server/Client-Grenze und das neue Datenmodell.

| # | Lektion | Kernkonzept | Du kannst danach... |
|---|---------|-------------|---------------------|
| N01 | App Router Architektur | Ordnerstruktur, Routing Conventions, page/layout | Die dateibasierte Routing-Architektur verstehen und anwenden |
| N02 | Server vs. Client Components | use client, Serialisierung, Component-Grenze | Bewusst entscheiden wo die Server/Client-Grenze liegt |
| N03 | Layout System | layout.tsx, loading.tsx, error.tsx, not-found.tsx | Verschachtelte Layouts mit Loading- und Error-States bauen |
| N04 | Data Fetching | Server Components, fetch, Caching Basics, Streaming | Daten auf dem Server laden und zum Client streamen |
| N05 | Server Actions | Formulare, Mutation, Revalidation, useActionState | Daten typsicher vom Client zum Server mutieren |

## Phase 2: Next.js Patterns (Lektion N06–N10)

Architektur-Patterns. Routing-Strategien, Auth, Datenbank-Anbindung
und Optimierung.

| # | Lektion | Kernkonzept | Du kannst danach... |
|---|---------|-------------|---------------------|
| N06 | Erweitertes Routing | Dynamic, Parallel, Intercepting Routes, Route Groups | Komplexe Routing-Anforderungen elegant loesen |
| N07 | Middleware & Auth | Middleware, Authentication Patterns, Session | Auth-Flows implementieren und Routen schuetzen |
| N08 | Database Integration | Prisma, Drizzle, ORM-Typen, Connection Pooling | Typsichere Datenbank-Anbindung aufbauen |
| N09 | Image & Font Optimization | next/image, next/font, LCP-Optimierung | Medien performant laden und darstellen |
| N10 | Metadata & SEO | generateMetadata, Open Graph, JSON-LD, Sitemap | Seiten fuer Suchmaschinen und Social Media optimieren |

## Phase 3: Advanced Next.js (Lektion N11–N15)

Die Tiefen von Next.js. Caching, Streaming, Edge Runtime
und fortgeschrittene Patterns.

| # | Lektion | Kernkonzept | Du kannst danach... |
|---|---------|-------------|---------------------|
| N11 | Caching Deep Dive | 4 Caching-Schichten, Revalidation, Cache Tags | Das Caching-System vollstaendig verstehen und kontrollieren |
| N12 | Streaming & Suspense | Progressive Rendering, Suspense Boundaries | Seiten progressiv laden und dem Nutzer frueher anzeigen |
| N13 | Edge Runtime | Middleware, Edge Functions, Runtime-Unterschiede | Die Edge Runtime gezielt fuer Performance einsetzen |
| N14 | Testing | Playwright E2E, Vitest, MSW, Server Component Tests | Next.js-Anwendungen umfassend testen |
| N15 | Security | Headers, Server Action Auth, CSRF, Rate Limiting | Sicherheitsluecken erkennen und beheben |

## Phase 4: Production (Lektion N16–N20)

Produktionsreife. Performance, Deployment, CI/CD und Architektur
fuer grosse Anwendungen.

| # | Lektion | Kernkonzept | Du kannst danach... |
|---|---------|-------------|---------------------|
| N16 | Performance | Bundle Analysis, Code Splitting, Core Web Vitals | Performance systematisch messen und optimieren |
| N17 | Deployment | Vercel, Docker, Self-hosted, Static Export | Next.js-Apps auf verschiedenen Plattformen deployen |
| N18 | CI/CD | GitHub Actions, Preview Deployments, Checks | Automatisierte Build- und Deploy-Pipelines aufbauen |
| N19 | Architecture | Feature Folders, Monorepo, Shared Libraries | Grosse Next.js-Projekte sauber strukturieren |
| N20 | Capstone Project | Alles zusammen | Eine produktionsreife Next.js-App eigenstaendig bauen |

---

## Danach

Du hast den gesamten Lernpfad abgeschlossen: TypeScript → Angular → React → Next.js.
Du verstehst drei verschiedene Architektur-Philosophien und kannst fuer jedes Projekt die richtige Technologie waehlen.
