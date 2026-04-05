# Sektion 1: Migrationspfade im Ueberblick

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: -- (Start)
> Naechste Sektion: [02 - allowJs und checkJs Strategie](./02-allowjs-und-checkjs.md)

---

## Was du hier lernst

- Warum **JS-zu-TS-Migration** kein einmaliges Event ist sondern ein Prozess
- Die drei Hauptstrategien: **Big Bang**, **graduell** und **Hybrid**
- Wann welche Strategie passt und welche **Risiken** jede birgt
- Wie du den Migrationspfad fuer dein konkretes Projekt waehlen kannst

---

## Hintergrund: Warum migrieren?

> **Origin Story: Wie Airbnb 6 Millionen Zeilen JavaScript migrierte**
>
> 2019 startete Airbnb die Migration ihrer gesamten Frontend-Codebase
> von JavaScript zu TypeScript. Das Projekt umfasste ueber 6 Millionen
> Zeilen Code, 2.000+ Dateien, und ein Team von 200+ Entwicklern. Die
> Migration dauerte 18 Monate — nicht weil TypeScript schwer war, sondern
> weil die Planung komplex war.
>
> Der Schluessel zum Erfolg: Sie migrierten NICHT alles auf einmal (Big Bang).
> Stattdessen nutzten sie eine graduelle Strategie mit `allowJs: true` als
> Bruecke. Jede Woche wurden 50-100 Dateien migriert, begleitet von
> automatisierten Codemod-Scripts. Nach 18 Monaten war die Codebase
> vollstaendig in TypeScript — und die Bug-Rate sank um 38%.

Fast jeder professionelle Entwickler wird irgendwann eine JS-zu-TS-
Migration durchfuehren oder daran beteiligt sein. Die Frage ist nicht
OB, sondern WIE.

---

## Die drei Strategien

### Strategie 1: Big Bang

```
  Tag 1: Alle .js → .ts umbenennen
  Tag 2-N: Alle Typfehler fixen
  Tag N+1: Strict Mode aktivieren
```

**Vorteile:**
- Sauberer Schnitt — kein Mischzustand
- Alle Dateien haben sofort Typen
- Keine Koexistenz von JS und TS

**Nachteile:**
- Riesiger PR der nicht reviewbar ist
- Blockiert andere Arbeit fuer Tage/Wochen
- Hohes Risiko fuer Regressions

**Passt fuer:** Kleine Projekte (< 50 Dateien), Nebenprojekte, Prototypen

### Strategie 2: Graduell (empfohlen)

```
  Phase 1: allowJs + checkJs im Projekt aktivieren
  Phase 2: Neue Dateien immer in .ts schreiben
  Phase 3: Bestehende .js-Dateien schrittweise migrieren
  Phase 4: Strict Mode stufenweise aktivieren
```

**Vorteile:**
- Kein Stillstand — normale Feature-Arbeit laeuft weiter
- Jeder PR ist klein und reviewbar
- Risiko ist minimal (Fehler betreffen nur migrierte Dateien)

**Nachteile:**
- Mischzustand aus JS und TS fuer Wochen/Monate
- Disziplin noetig ("Neue Dateien IMMER in .ts!")
- Temporaer mehr Komplexitaet (zwei Welten)

**Passt fuer:** Grosse Projekte, Teams, Produktion-kritischer Code

### Strategie 3: Hybrid (Codemod-gestuetzt)

```
  Schritt 1: Automatisches Umbenennen .js → .ts mit Codemod
  Schritt 2: Automatisches Hinzufuegen von : any wo noetig
  Schritt 3: Manuelles Verbessern der Typen ueber Zeit
```

**Vorteile:**
- Schneller Anfang — Codemods erledigen die mechanische Arbeit
- Sofort im "TypeScript-Modus" (IDE-Support, Autocomplete)
- any-Stellen sind markiert und koennen priorisiert abgebaut werden

**Nachteile:**
- Falsche Sicherheit — `: any` ist kein echtes Typing
- Codemods koennen subtile Bugs einfuehren
- Erfordert nachgelagerte manuelle Arbeit

**Passt fuer:** Mittlere bis grosse Projekte mit Zeitdruck

> 💭 **Denkfrage:** Airbnb hatte 200+ Entwickler und wahlte die graduelle
> Strategie. Ein Startup mit 3 Entwicklern und 20 Dateien sollte
> wahrscheinlich welche Strategie waehlen?
>
> **Antwort:** Big Bang. Bei 20 Dateien ist die Migration an einem
> Nachmittag erledigt. Der Overhead einer graduellen Strategie (Tooling,
> Koexistenz, Disziplin) lohnt sich erst ab ~100 Dateien.

---

## Die Entscheidungsmatrix

```typescript annotated
// Entscheidung basierend auf Projektgroesse und Teamgroesse:
//
// Dateien  | 1-3 Devs        | 4-10 Devs       | 10+ Devs
// ---------|-----------------|-----------------|------------------
// < 50     | Big Bang        | Big Bang        | Big Bang
// 50-200   | Graduell/Hybrid | Graduell        | Graduell
// 200-1000 | Hybrid          | Graduell        | Graduell + Codemod
// > 1000   | Graduell        | Graduell        | Graduell + Codemod
//
// ^ Bei grossen Teams ist Koordination der Engpass, nicht die Technik
// ^ Graduelle Migration erlaubt parallele Feature-Arbeit
```

> 🧠 **Erklaere dir selbst:** Warum ist Big Bang bei > 50 Dateien riskant, auch wenn das Projekt nur 1-3 Entwickler hat? Was koennte schiefgehen?
> **Kernpunkte:** Ein riesiger PR kann nicht sinnvoll reviewed werden | Alle Fehler kommen gleichzeitig | Merge-Konflikte mit laufender Feature-Arbeit | Rollback ist schwierig | Graduelle Migration erlaubt Lernen

---

## Der Migration-Plan

Unabhaengig von der Strategie brauchst du einen Plan:

```typescript annotated
// migration-plan.md (Beispiel)
//
// ## 1. Vorbereitung (Woche 1)
// - [ ] tsconfig.json erstellen mit allowJs: true
// - [ ] TypeScript als devDependency installieren
// - [ ] CI um tsc --noEmit erweitern
// - [ ] Team-Meeting: "Neue Dateien ab sofort in .ts"
//
// ## 2. Infrastruktur-Dateien (Woche 2-3)
// - [ ] Shared Types definieren (models/, interfaces/)
// - [ ] API-Response-Typen definieren
// - [ ] Konfigurationsdateien migrieren
// ^ Infrastruktur zuerst, weil sie von allem importiert wird
//
// ## 3. Core-Module (Woche 4-8)
// - [ ] Services migrieren (Abhaengigkeitsreihenfolge!)
// - [ ] Utilities migrieren
// - [ ] Stores/State migrieren
// ^ Reihenfolge: Blaetter zuerst, dann nach innen
//
// ## 4. UI-Schicht (Woche 9-12)
// - [ ] Komponenten migrieren
// - [ ] Seiten migrieren
// ^ UI zuletzt, weil sie die meisten Abhaengigkeiten hat
//
// ## 5. Strict Mode (Woche 13+)
// - [ ] strictNullChecks aktivieren
// - [ ] strict aktivieren
// - [ ] allowJs entfernen
```

> ⚡ **Framework-Bezug (Angular):** Angular-Projekte haben einen Vorteil:
> Die CLI erzeugt seit Angular 2 (2016) alles in TypeScript. "Migration"
> bedeutet hier meist: Strict Mode aktivieren und bestehende `any`-Stellen
> typisieren. Wenn du ein altes AngularJS-Projekt (Angular 1.x) migrierst,
> ist das eine andere Geschichte — da brauchst du die volle JS→TS-Migration.

---

## Reihenfolge: Blaetter zuerst

Die wichtigste Regel bei gradueller Migration:

```
  shared/types.ts      ← ZUERST (keine Abhaengigkeiten)
  utils/helpers.ts     ← DANN (abhaengt nur von types)
  services/api.ts      ← DANN (abhaengt von types + helpers)
  components/User.tsx  ← ZULETZT (abhaengt von allem)
```

```typescript annotated
// Abhaengigkeitsgraph:
//
//   types.ts  ←── helpers.ts  ←── api.ts  ←── User.tsx
//     (Blatt)                                   (Wurzel)
//
// Migriere von links nach rechts:
// 1. types.ts → .ts mit vollen Typen
// 2. helpers.ts → .ts, importiert typisierte types
// 3. api.ts → .ts, importiert typisierte helpers + types
// 4. User.tsx → .tsx, alles typisiert
//
// ^ Jeder Schritt baut auf bereits typisierten Modulen auf
// ^ Nie eine Datei migrieren deren Abhaengigkeiten noch .js sind
```

> 🧪 **Experiment:** Visualisiere die Abhaengigkeiten in einem Projekt:
>
> ```bash
> # Mit madge (Dependency Graph Tool):
> npx madge --image graph.png src/
>
> # Oder einfacher — finde Dateien ohne Imports:
> grep -rL "^import" src/ --include="*.js" | head -10
> # Diese Dateien haben keine Abhaengigkeiten → ideale Startpunkte
> ```
>
> Die Dateien ohne Imports sind deine "Blaetter" — migriere sie zuerst.

---

## Was du gelernt hast

- **Big Bang** passt fuer kleine Projekte (< 50 Dateien)
- **Graduelle Migration** ist der sichere Weg fuer grosse Projekte und Teams
- **Hybrid/Codemod** beschleunigt den Start, erfordert aber Nacharbeit
- Migriere immer **Blaetter zuerst** (Dateien ohne Abhaengigkeiten)
- Ein **Migration-Plan** mit klaren Phasen verhindert Chaos

**Kernkonzept zum Merken:** Migration ist kein technisches Problem — es ist ein organisatorisches. Die beste Strategie ist die, die dein Team durchhalten kann, ohne dass die Feature-Arbeit stoppt. Graduelle Migration ist fast immer die richtige Wahl.

---

> **Pausenpunkt** -- Guter Moment fuer eine Pause. Du hast das grosse Bild
> der Migrationsstrategien verstanden.
>
> Weiter geht es mit: [Sektion 02: allowJs und checkJs Strategie](./02-allowjs-und-checkjs.md)
