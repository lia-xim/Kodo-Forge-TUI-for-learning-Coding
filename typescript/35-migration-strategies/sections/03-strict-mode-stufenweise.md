# Sektion 3: Strict Mode stufenweise aktivieren

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - allowJs und checkJs Strategie](./02-allowjs-und-checkjs.md)
> Naechste Sektion: [04 - Declaration Files fuer Legacy-Code](./04-declaration-files-fuer-legacy.md)

---

## Was du hier lernst

- Was **strict: true** unter der Haube alles aktiviert (9 Flags!)
- In welcher **Reihenfolge** du die Strict-Flags aktivieren solltest
- Warum **strictNullChecks** das wichtigste und schmerzhafteste Flag ist
- Wie du die **Fehlerzahl** beim schrittweisen Aktivieren managst

---

## Hintergrund: Was ist Strict Mode eigentlich?

> **Origin Story: Die Evolution von Strict**
>
> Als TypeScript 2.0 (2016) `strictNullChecks` einfuehrte, war die Community
> gespalten. Manche liebten es ("Endlich keine null-Fehler mehr!"), andere
> hassten es ("Tausende Fehler in meinem Projekt!"). Mit jeder TypeScript-
> Version kamen neue Strict-Flags hinzu. Um den Ueberblick zu behalten,
> fuehrte TypeScript 2.3 (2017) das Meta-Flag `strict: true` ein — es
> aktiviert ALLE aktuellen und ZUKUENFTIGE Strict-Flags.
>
> Das bedeutet: Wenn du heute `strict: true` aktivierst und morgen ein
> neues TypeScript-Release ein neues Strict-Flag einfuehrt, wird es
> automatisch aktiv. Das ist gewollt — aber bei Upgrades solltest du die
> Release Notes lesen.

`strict: true` ist kein einzelnes Flag — es ist ein **Buendel** aus
9 Einzelflags (Stand TypeScript 5.x):

```typescript annotated
// strict: true aktiviert ALL diese Flags:
{
  "compilerOptions": {
    "strict": true
    // ↓ Aequivalent zu:
    // "strictNullChecks": true,        // null/undefined sind eigene Typen
    // "strictFunctionTypes": true,     // Strikte Funktions-Parameter-Typen
    // "strictBindCallApply": true,     // Strikte bind/call/apply-Pruefung
    // "strictPropertyInitialization": true, // Klassen-Properties muessen initialisiert sein
    // "noImplicitAny": true,           // Kein implizites 'any'
    // "noImplicitThis": true,          // 'this' muss getypt sein
    // "alwaysStrict": true,            // "use strict" in jeder Datei
    // "useUnknownInCatchVariables": true, // catch(e) → e ist unknown statt any
    // "exactOptionalPropertyTypes": true  // Seit TS 4.4
  }
}
```

> 🧠 **Erklaere dir selbst:** Warum ist `strict: true` besser als alle Flags einzeln aufzulisten? Was passiert bei einem TypeScript-Update?
> **Kernpunkte:** strict: true inkludiert automatisch neue Flags | Einzelne Flags verpassen zukuenftige Verbesserungen | strict: true ist die empfohlene Default-Einstellung | Du kannst einzelne Flags mit false ueberschreiben: strict: true + strictNullChecks: false

---

## Die Aktivierungsreihenfolge

Nicht alle Strict-Flags sind gleich schwer zu aktivieren. Hier ist die
empfohlene Reihenfolge — vom einfachsten zum schwersten:

```
  Phase 1 (leicht):    alwaysStrict
                        strictBindCallApply
                        noImplicitThis
                        → Wenige Fehler, einfache Fixes

  Phase 2 (mittel):    noImplicitAny
                        strictFunctionTypes
                        → Mehr Fehler, aber mechanisch loesbar

  Phase 3 (schwer):    strictNullChecks
                        strictPropertyInitialization
                        useUnknownInCatchVariables
                        → Viele Fehler, erfordert Nachdenken

  Phase 4 (Ziel):      strict: true
                        → Alle Flags aktiv, entferne Einzelflags
```

```typescript annotated
// Phase 1: tsconfig.json
{
  "compilerOptions": {
    "alwaysStrict": true,
    // ^ Fuegt "use strict" ein — fast nie ein Problem
    "strictBindCallApply": true,
    // ^ Prueft bind/call/apply-Argumente — selten verwendet, wenige Fehler
    "noImplicitThis": true
    // ^ Erzwingt explizites 'this' in Funktionen — einfach zu fixen
  }
}
// Typische Fehlerzahl: 0-20
// Typische Fixzeit: 1-2 Stunden
```

---

## Phase 2: noImplicitAny

Das ist das Flag mit dem besten Aufwand-Nutzen-Verhaeltnis:

```typescript annotated
// VORHER (noImplicitAny: false):
function processData(data) {
  // ^ 'data' hat implizit Typ 'any' — keine Pruefung!
  return data.map(item => item.name);
  // ^ Kein Fehler, auch wenn data kein Array ist
}

// NACHHER (noImplicitAny: true):
function processData(data) {
  // ^ FEHLER: Parameter 'data' implicitly has an 'any' type
  // Fix 1: Typ annotieren
  // function processData(data: User[]): string[] {
  // Fix 2: Temporaer mit any markieren (fuer spaeter)
  // function processData(data: any) {
  return data.map(item => item.name);
}
```

> 💭 **Denkfrage:** Wenn noImplicitAny 200 Fehler in deinem Projekt zeigt,
> solltest du alle sofort fixen? Oder gibt es eine bessere Strategie?
>
> **Antwort:** Nicht alle sofort! Strategie: (1) Offensichtliche Typen
> sofort annotieren (Parameter die klar sind). (2) Komplexe Faelle mit
> explizitem `: any` markieren — das ist BESSER als implizites any, weil
> es eine bewusste Entscheidung dokumentiert. (3) Die `: any`-Stellen
> ueber die naechsten Wochen abarbeiten.

---

## Phase 3: strictNullChecks — der grosse Brocken

Dies ist das wichtigste UND das schmerzhafteste Flag. Es aendert
fundamental, wie TypeScript ueber null und undefined denkt:

```typescript annotated
// VORHER (strictNullChecks: false):
function getUser(id: string): User {
  const user = users.find(u => u.id === id);
  return user;
  // ^ OK! find() gibt User | undefined zurueck
  // ^ Aber ohne strictNullChecks ist undefined implizit in JEDEM Typ enthalten
  // ^ → Kein Fehler, aber potentieller Runtime-Crash
}

// NACHHER (strictNullChecks: true):
function getUser(id: string): User {
  const user = users.find(u => u.id === id);
  return user;
  // ^ FEHLER: Type 'User | undefined' is not assignable to type 'User'
  // ^ TypeScript sagt: "undefined ist nicht User — was tust du bei undefined?"
}

// Fix-Optionen:
function getUser(id: string): User | undefined {
  // ^ Option 1: Ehrlicher Rueckgabetyp — Aufrufer muessen pruefen
  return users.find(u => u.id === id);
}

function getUser(id: string): User {
  const user = users.find(u => u.id === id);
  if (!user) throw new Error(`User ${id} not found`);
  // ^ Option 2: Explicit Error — klarer Contract
  return user;
}

function getUser(id: string): User {
  return users.find(u => u.id === id)!;
  // ^ Option 3: Non-null Assertion (!) — GEFAEHRLICH, nur als Uebergang
  // ^ Markiere mit // TODO: Remove ! after migration
}
```

> ⚡ **Framework-Bezug (Angular):** strictNullChecks hat massive Auswirkungen
> auf Angular-Templates. Mit `strictTemplates: true` (empfohlen!) prueft
> Angular auch Templates auf null-Sicherheit:
>
> ```html
> <!-- Fehler mit strictNullChecks: -->
> <div>{{ user.name }}</div>
> <!-- ^ 'user' is possibly undefined -->
>
> <!-- Fix: -->
> <div *ngIf="user">{{ user.name }}</div>
> <!-- Oder mit neuem Control Flow: -->
> @if (user) { <div>{{ user.name }}</div> }
> ```
>
> In grossen Angular-Projekten verursacht strictNullChecks oft 500+ Fehler
> allein in den Templates.

---

## Die Fehlerzahl managen

strictNullChecks kann Hunderte oder Tausende Fehler erzeugen. So gehst
du damit um:

```typescript annotated
// Strategie: "Fix forward" mit Non-null Assertions
//
// Schritt 1: strictNullChecks aktivieren → 800 Fehler
// Schritt 2: Alle Fehler mit ! beheben → 0 Fehler (aber unsicher)
// Schritt 3: Jede Woche 20 ! durch echte Pruefungen ersetzen
// Schritt 4: CI-Regel: "Keine neuen ! in PRs"
//
// Vorteil: Das Projekt ist sofort "strict"
// Nachteil: ! ist unsicher — aber es ist MARKIERT und abbaubar

// Werkzeug: ts-strictify (Community-Tool)
// npx ts-strictify --check
// ^ Prueft nur GEAENDERTE Dateien gegen strictNullChecks
// ^ Bestehende Dateien bleiben erstmal unstrict
// ^ Neue/geaenderte Dateien muessen strict sein
```

> 🧪 **Experiment:** Zaehle die Fehler die strictNullChecks in einem
> Projekt erzeugt:
>
> ```bash
> # Ohne strictNullChecks:
> npx tsc --noEmit 2>&1 | wc -l
>
> # Mit strictNullChecks:
> npx tsc --noEmit --strictNullChecks 2>&1 | wc -l
>
> # Die Differenz = Fehler durch strictNullChecks
> # Typisch: 30-50% aller Fehler kommen von strictNullChecks allein
> ```
>
> Das gibt dir ein Gefuehl fuer den Aufwand bevor du das Flag aktivierst.

---

## Was du gelernt hast

- `strict: true` buendelt **9 Einzelflags** und inkludiert zukuenftige automatisch
- Aktivierungsreihenfolge: **alwaysStrict → noImplicitAny → strictNullChecks → strict**
- **strictNullChecks** ist das wichtigste und aufwendigste Flag
- Non-null Assertions (`!`) sind ein akzeptabler **Uebergangsmechanismus** (aber abbauen!)
- `strict: true` mit einzelnen Flags auf `false` ist ein valider Zwischenschritt

**Kernkonzept zum Merken:** Strict Mode ist kein Schalter den du einmal umlegst — es ist ein Prozess. Aktiviere die leichten Flags zuerst, dann die schweren. strictNullChecks allein verhindert mehr Bugs als alle anderen Flags zusammen — aber es erfordert auch die meiste Arbeit.

---

> **Pausenpunkt** -- Guter Moment fuer eine Pause. Du weisst jetzt, wie du
> Strict Mode ohne Chaos aktivierst.
>
> Weiter geht es mit: [Sektion 04: Declaration Files fuer Legacy-Code](./04-declaration-files-fuer-legacy.md)
