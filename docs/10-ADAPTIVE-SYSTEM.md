# Adaptives Tiefensystem: Design und Implementierung

> Letzte Aktualisierung: 2026-03-31
> Status: DESIGNED, noch nicht vollstaendig implementiert

---

## 1. Motivation

### Das Problem

Der Lernende nutzt TypeScript taeglich mit Angular. Wenn er eine Lektion ueber "Arrays" oeffnet, kennt er Arrays bereits — aber er kennt vielleicht nicht `ReadonlyArray<T>` oder die Typhierarchie von Tupeln. Die aktuelle Plattform zeigt jedem Lernenden denselben Inhalt, unabhaengig vom Vorwissen.

### Die wissenschaftliche Basis

**Expertise Reversal Effect** (Kalyuga et al. 2003): Detaillierte Erklaerungen die Anfaengern helfen, **schaden** Fortgeschrittenen aktiv. Sie erzeugen unnoetige kognitive Last durch die Verarbeitung redundanter Information.

**Mastery-Based Learning** (Bloom 1968): Lernende sollten Material erst dann abschliessen wenn sie es beherrschen — und Material ueberspringen duerfen das sie bereits beherrschen.

### Die Loesung

Ein dreistufiges adaptives Tiefensystem:
1. **Kurz:** Kompakte Zusammenfassung fuer Fortgeschrittene (2-5 Saetze pro Konzept)
2. **Standard:** Normale Erklaerung mit Beispielen (der aktuelle Default)
3. **Vollstaendig:** Ausfuehrliche Erklaerung mit Hintergrundgeschichte, Analogien, mehreren Beispielen, Experiment-Boxen

Die empfohlene Tiefe wird durch einen Pre-Test bestimmt, kann aber jederzeit vom Lernenden gewechselt werden (Autonomie aus SDT).

---

## 2. Markdown-Marker-Format

### Syntax

```markdown
## Konzept X

<!-- section:summary -->
**Zusammenfassung:** Konzept X macht Y. Wenn du Z kennst, ist das alles
was du wissen musst.

<!-- depth:standard -->
Konzept X wurde eingefuehrt um das Problem Y zu loesen. Hier ist ein
typisches Beispiel:

```typescript
// Standard-Beispiel
function example<T extends { length: number }>(arg: T): number {
  return arg.length;
}
```

> Erklaere dir selbst: Warum brauchen wir den `extends`-Constraint?

<!-- depth:vollstaendig -->

> **Hintergrundgeschichte:** Als TypeScript 2.0 im September 2016
> veroeffentlicht wurde, war eines der groessten Probleme...

```typescript annotated
// Ausfuehrliches Beispiel mit Annotationen
function example<T extends { length: number }>(  // T muss .length haben
  arg: T                                          // arg ist vom Typ T
): number {                                       // Gibt eine Zahl zurueck
  return arg.length;                              // Sicher — TS weiss T hat .length
}
```

> **Experiment:** Oeffne `examples/constraints.ts` und entferne den
> Constraint. Was sagt TypeScript dir?

> **In deinem Angular-Projekt:** Angular's `HttpClient.get<T>()` nutzt
> genau dieses Pattern — T ist der Response-Typ.

<!-- /depth -->
```

### Regeln

1. `<!-- section:summary -->` — Immer als erstes. Sichtbar in ALLEN Tiefen.
2. `<!-- depth:standard -->` — Sichtbar bei "standard" und "vollstaendig".
3. `<!-- depth:vollstaendig -->` — Nur sichtbar bei "vollstaendig".
4. `<!-- /depth -->` — Schliesst den letzten Tiefenblock (optional, der naechste Marker schliesst automatisch).
5. Inhalt OHNE Marker ist immer sichtbar (abwaertskompatibel mit bestehenden Sektionen).

### Abwaertskompatibilitaet

Bestehende Sektionen (L01-L20) haben KEINE Marker. Sie werden in ALLEN Tiefen vollstaendig angezeigt. Die Marker werden nur bei neuen Sektionen (ab L21) oder bei nachtraeglicher Anreicherung eingefuegt.

---

## 3. filterByDepth()-Funktion

### Implementierung in markdown-renderer.ts

```typescript
/**
 * Filtert Markdown-Inhalt basierend auf der gewaehlten Tiefe.
 *
 * @param markdown - Roher Markdown-Text mit Tiefenmarkern
 * @param depth - Gewaehlte Tiefe ("kurz", "standard", "vollstaendig")
 * @returns Gefilterter Markdown-Text
 */
export function filterByDepth(
  markdown: string,
  depth: "kurz" | "standard" | "vollständig"
): string {
  const lines = markdown.split("\n");
  const result: string[] = [];
  let currentDepth: string | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Marker erkennen
    if (trimmed === "<!-- section:summary -->") {
      currentDepth = "summary";
      continue;
    }
    if (trimmed === "<!-- depth:standard -->") {
      currentDepth = "standard";
      continue;
    }
    if (trimmed === "<!-- depth:vollstaendig -->") {
      currentDepth = "vollstaendig";
      continue;
    }
    if (trimmed === "<!-- /depth -->") {
      currentDepth = null;
      continue;
    }

    // Sichtbarkeitsregeln
    if (currentDepth === null) {
      // Kein Marker → immer sichtbar
      result.push(line);
    } else if (currentDepth === "summary") {
      // Summary → immer sichtbar
      result.push(line);
    } else if (currentDepth === "standard") {
      // Standard → sichtbar bei "standard" und "vollstaendig"
      if (depth === "standard" || depth === "vollständig") {
        result.push(line);
      }
    } else if (currentDepth === "vollstaendig") {
      // Vollstaendig → nur bei "vollstaendig"
      if (depth === "vollständig") {
        result.push(line);
      }
    }
  }

  return result.join("\n");
}
```

### Integration in tui-section-reader.ts

```typescript
// Beim Laden einer Sektion:
const rawMarkdown = fs.readFileSync(sectionPath, "utf-8");
const depth = adaptiveState.sectionDepths[`${lessonIdx}-${sectionIdx}`] || "standard";
const filteredMarkdown = filterByDepth(rawMarkdown, depth);
const renderedLines = renderMarkdown(filteredMarkdown, W() - 4);
```

---

## 4. UX-Flow

### Pre-Test auf Lektionsebene

```
Lernender oeffnet L21 (Classes & OOP)
    │
    v
TUI: "Moechtest du einen Pre-Test machen? (3 Min)"
     [J]a  [N]ein (direkt mit Standard-Tiefe starten)
    │
    ├── [N]ein → Alle Sektionen mit "standard" Tiefe
    │
    └── [J]a → 6-9 Fragen (1-2 pro Sektion)
            │
            v
        Ergebnis:
        ┌────────────────────────────────────────────────┐
        │  Pre-Test: L21 Classes & OOP                   │
        │                                                │
        │  S1: Klassen-Grundlagen      2/2 richtig       │
        │  S2: Access Modifiers        1/2 richtig       │
        │  S3: Abstract Classes        0/2 richtig       │
        │  S4: Implements              1/1 richtig       │
        │  S5: Private Fields (#)      0/1 richtig       │
        │                                                │
        │  Empfehlung:                                   │
        │    S1 → kurz (du kennst das schon)             │
        │    S2 → standard                               │
        │    S3 → vollstaendig (hier solltest du tiefer  │
        │         einsteigen)                             │
        │    S4 → kurz                                   │
        │    S5 → vollstaendig                           │
        │                                                │
        │  [Enter] Empfehlungen uebernehmen              │
        │  [A] Alle auf Standard setzen                  │
        │  [K/N/V] Einzeln anpassen                      │
        └────────────────────────────────────────────────┘
```

### Tiefe waehrend des Lesens wechseln

```
Im Section Reader:
    │
    ├── [K] → Wechsel zu "kurz" (nur Summary anzeigen)
    ├── [N] → Wechsel zu "standard" (Normal)
    └── [V] → Wechsel zu "vollstaendig" (alles)
    │
    v
Sektion wird sofort mit neuer Tiefe neu gerendert.
Scroll-Position wird beibehalten (soweit moeglich).
Neue Tiefe wird in adaptiveState.sectionDepths gespeichert.
```

---

## 5. Datenmodell

### AdaptiveState (bereits teilweise implementiert)

```typescript
interface AdaptiveState {
  // Pro Sektion: Gesetzte oder empfohlene Tiefe
  sectionDepths: Record<string, ContentDepth>;
  // Schluessel: "lessonIdx-sectionIdx"
  // Wert: "kurz" | "standard" | "vollstaendig"

  // Pro Konzept: Performance-Tracking
  conceptScores: Record<string, {
    correct: number;      // Richtige Antworten
    total: number;        // Gesamte Antworten
    lastSeen: string;     // ISO-Datum
  }>;
  // Schluessel: Konzept-Name (z.B. "type-erasure", "generics")

  // Pro Exercise: Hint-Level
  hintLevels: Record<string, number>;
  // Schluessel: "lessonIdx-sectionIdx-exerciseIdx"
  // Wert: Aktuelles Hint-Level (0 = keine Hints)
}
```

### Tiefenberechnung

```typescript
function calculateDepthFromPretest(
  sectionScores: { sectionIndex: number; correct: number; total: number }[]
): Record<string, ContentDepth> {
  const depths: Record<string, ContentDepth> = {};

  for (const { sectionIndex, correct, total } of sectionScores) {
    const ratio = total > 0 ? correct / total : 0;

    if (ratio >= 0.8) {
      depths[`${lessonIdx}-${sectionIndex}`] = "kurz";
      // 80%+ richtig → der Lernende kennt das schon
    } else if (ratio >= 0.4) {
      depths[`${lessonIdx}-${sectionIndex}`] = "standard";
      // 40-80% → Grundlagen da, Details fehlen
    } else {
      depths[`${lessonIdx}-${sectionIndex}`] = "vollständig";
      // <40% → Neuland, vollstaendige Erklaerung noetig
    }
  }

  return depths;
}
```

---

## 6. Integrationspunkte

| Modul | Aenderung |
|-------|-----------|
| `markdown-renderer.ts` | `filterByDepth()` Funktion hinzufuegen |
| `tui-section-reader.ts` | Beim Laden: `filterByDepth()` anwenden. [K]/[N]/[V] Tasten fuer Tiefenwechsel. |
| `tui-quiz.ts` | Pre-Test auf Lektionsebene (statt Sektionsebene) als neuer Modus |
| `pretest-engine.ts` | `calculateDepthFromPretest()` Funktion hinzufuegen |
| `adaptive-engine.ts` | Speichern/Laden der Tiefe pro Sektion (bereits vorhanden) |
| `tui-lesson-menu.ts` | Tiefe pro Sektion anzeigen (kurz/standard/vollst.) |
| `tui-state.ts` | Keine Aenderung noetig (AdaptiveState existiert bereits) |
| `sections/*.md` (neue Lektionen) | Marker einfuegen |

---

## 7. Risiken und Gegenmassnahmen

| Risiko | Wahrscheinlichkeit | Auswirkung | Gegenmassnahme |
|--------|:------------------:|:----------:|----------------|
| Marker-Syntax wird von Autoren falsch verwendet | Mittel | Inhalt wird nicht korrekt gefiltert | Validation-Funktion die Marker-Paare prueft |
| Lernende waehlen immer "kurz" und ueberspringen wichtige Details | Hoch | Oberflaechliches Lernen | Empfehlung basierend auf Pre-Test als Default. "Kurz" explizit als "Du kennst das schon" labeln, nicht als "Abkuerzung" |
| Bestehende Sektionen (L01-L20) haben keine Marker | Sicher | Kein adaptives Verhalten fuer existierende Inhalte | Nachtraegliches Einfuegen von Markern (niedrige Prioritaet, hoher Aufwand) |
| Pre-Test auf Lektionsebene dauert zu lang | Niedrig | Lernender ueberspringt Pre-Test | Maximal 9 Fragen, geschaetzte Zeit anzeigen ("~3 Min") |
| Scroll-Position bei Tiefenwechsel springt | Mittel | Desorientierung | Versuch die naechstgelegene Ueberschrift als Anker zu verwenden |

---

## 8. Implementierungsplan

### Phase A (Minimal Viable — 1 Session)

1. `filterByDepth()` in `markdown-renderer.ts` implementieren
2. [K]/[N]/[V] Tasten in `tui-section-reader.ts` einbauen
3. Tiefenwechsel speichert in `adaptiveState.sectionDepths`
4. Marker in 2-3 neue Sektionen (L21) einfuegen als Proof of Concept

### Phase B (Pre-Test Integration — 1 Session)

5. Pre-Test auf Lektionsebene in `pretest-engine.ts`
6. Ergebnis-Screen mit Tiefen-Empfehlung pro Sektion
7. Automatisches Setzen der Tiefen nach Pre-Test

### Phase C (Nachtraegliche Marker — mehrere Sessions)

8. Marker in bestehende Sektionen (L01-L20) einfuegen
9. Jede Sektion braucht: summary, standard, vollstaendig Bloecke
10. Qualitaetspruefung: Ist die "kurz"-Version wirklich ausreichend?
