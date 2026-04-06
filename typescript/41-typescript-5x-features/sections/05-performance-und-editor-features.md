# Sektion 5: Performance und Editor-Features

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Array- und Controlflow-Verbesserungen](./04-array-und-controlflow-improvements.md)
> Naechste Sektion: [06 - Der Upgrade-Pfad und TypeScript Zukunft](./06-upgrade-pfad-und-zukunft.md)

---

## Was du hier lernst

- Warum TypeScript-Performance bei grossen Projekten (100k+ LOC) kritisch ist
- Was `isolatedDeclarations` (TS 5.5) bedeutet und wann man es einschaltet
- Wie du mit `tsserver.log` Performance-Engpaesse im Editor diagnostizierst
- Wie der Angular Language Service TypeScript intern fuer Template-Type-Checking nutzt

---

## Das Problem: TypeScript wird langsam

Stelle dir vor, du arbeitest in einem Angular-Projekt mit 200 Komponenten,
50 Services und 30.000 Zeilen TypeScript. Jedes Mal wenn du eine Datei speicherst,
wartest du 3-4 Sekunden bevor Autocomplete erscheint. Die rote Unterkringelung
kommt mit Verzoegerung. Refactoring haengt sich auf.

Das ist kein hypothetisches Szenario. Es ist der Alltag in grossen Enterprise-Projekten
ohne sorgfaeltige TypeScript-Konfiguration.

> **Die Geschichte: VS Code als Benchmark**
>
> Das TypeScript-Team bei Microsoft hat ein ungewoehnliches Vorgehen bei Performance:
> Sie nutzen **VS Code selbst** als ihren primaeren Performance-Benchmark. VS Code ist
> in TypeScript geschrieben — ueber 1.000 Dateien, Millionen von Zeilen. Wenn eine
> neue TypeScript-Version VS Code langsamer macht, wird sie nicht veroeffentlicht.
>
> Diese "eat your own dog food"-Mentalitaet hat seit TS 4.x zu kontinuierlichen
> Performance-Verbesserungen gefuehrt. In TS 5.x wurden Compile-Zeiten fuer grosse
> Projekte um 10-50% reduziert — nicht durch algorithmische Wunder, sondern durch
> sorgfaeltige Profiling-Arbeit an echten Codebases.
>
> Das TypeScript-Team veroeffentlicht regelmaessig "Performance Improvements"-Beitraege
> im offiziellen Blog mit konkreten Messzahlen. Das ist selten in der Sprach-Welt.

---

## `--skipLibCheck`: Das doppelschneidige Schwert

Die erste und bekannteste Performance-Option ist `skipLibCheck`:

```typescript annotated
// tsconfig.json:
{
  "compilerOptions": {
    "skipLibCheck": true
    // ^ TypeScript prueft .d.ts-Dateien in node_modules NICHT
    // Das spart viel Zeit — aber mit einem Preis
  }
}
```

**Warum es schnell macht:** TypeScript prueft normalerweise alle `.d.ts`-Dateien
deiner Dependencies (z.B. `node_modules/@angular/core/index.d.ts`). Bei grossen
Projekten mit vielen Paketen sind das Tausende von Dateien. `skipLibCheck` ueberspringt
alle diese Pruefungen.

**Wann es sinnvoll ist:**
- Du nutzt gut gepflegte Libraries (Angular, React) mit korrekten Typen
- Konflikte zwischen verschiedenen Type-Definition-Versionen nerven dich
- CI-Build-Zeit ist kritisch

**Wann es gefaehrlich ist:**
- Deine eigenen `.d.ts`-Dateien werden auch nicht geprueft
- Fehler in Typ-Definitionen deiner Dependencies bleiben unsichtbar
- Wenn du eine Library-Version mit kaputten Typen nutzt, merkst du es nicht

> 💭 **Denkfrage:** `skipLibCheck` ist in vielen Projekt-Templates standardmaessig
> auf `true` gesetzt — auch in Angular. Warum koennte das eine bewusste Entscheidung
> des Angular-Teams sein, und nicht nur Nachlaeissigkeit?
>
> **Antwort:** Angular-Projekte haben oft Hunderte von npm-Paketen. Die Angular-Typen
> selbst werden vom Angular-Team intensiv getestet. `skipLibCheck: true` ist pragmatisch:
> Es verhindert dass externe Library-Konflikte (z.B. zwischen verschiedenen RxJS-Versionen)
> das eigene Projekt blockieren. Das Angular-Team vertraut darauf, dass ihre eigenen
> Type-Definitionen korrekt sind — und spart den Nutzern Compile-Zeit.

---

## `isolatedDeclarations`: Die Parallelisierungs-Revolution (TS 5.5)

Das war das groesste Performance-Feature in TypeScript 5.5.

**Das Problem davor:** TypeScript ist single-threaded. Bei grossen Projekten
musste der Compiler die gesamte Typ-Inferenz sequenziell durchfuehren, bevor er
`.d.ts`-Dateien generieren konnte. Tools wie esbuild oder `swc` konnten zwar
schnell transpilieren, aber keine Typ-Deklarationen generieren.

```typescript annotated
// OHNE isolatedDeclarations:
export const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
};
// ^ TypeScript muss den Typ inferieren: { apiUrl: string; timeout: number }
// Das erfordert die gesamte Typ-Inferenz-Pipeline

// MIT isolatedDeclarations (TS 5.5):
// Du musst den Rueckgabetyp EXPLIZIT annotieren:
export const config: { apiUrl: string; timeout: number } = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
};
// ^ Jetzt kann JEDES Tool (esbuild, swc, babel) die .d.ts erzeugen
// ohne den gesamten TypeScript-Compiler zu starten!
```

**Was `isolatedDeclarations: true` macht:**

Es erzwingt, dass alle exportierten Symbole explizite Typ-Annotationen haben.
Dadurch kann jede Datei **unabhaengig** von anderen dekompiliert werden — kein
globaler Typ-Inferenz-Durchlauf noetig.

```typescript annotated
// tsconfig.json:
{
  "compilerOptions": {
    "isolatedDeclarations": true,
    // ^ Jede Datei muss fuer sich allein typbar sein
    // TypeScript gibt Fehler wenn eine exportierte Variable
    // keinen expliziten Typ hat und er nicht trivial inferierbar ist
    "declaration": true
    // ^ Kombiniert mit isolatedDeclarations: .d.ts kann parallel erzeugt werden
  }
}
```

**Wann einschalten:**
- Du baust eine **Library** (npm-Paket), nicht eine App
- Du nutzt ein Build-Tool wie Vite, esbuild oder Turbopack
- Dein Projekt hat viele unabhaengige Module die parallel kompiliert werden sollen

**Wann weglassen:**
- Bei normalen Angular/React-Anwendungen (kein Library-Build)
- Wenn du explizite Annotationen als Aufwand siehst (sie sind aber eine gute Praxis!)

> 🧠 **Erklaere dir selbst:** Warum koennte `isolatedDeclarations` paradoxerweise
> die **Codequalitaet** verbessern, obwohl es eine Performance-Optimierung ist?
>
> **Kernpunkte:** Erzwingt explizite Typen bei Exports | Macht API-Grenzen sichtbar |
> Verhindert "Type-Leakage" von Implementierungsdetails | Bessere Lesbarkeit von
> Public APIs | Aehnliche Wirkung wie oeffentliche Methoden in Java immer typen

---

## LSP-Verbesserungen in TypeScript 5.x

Der **Language Server Protocol (LSP)** ist die Schnittstelle zwischen deinem Editor
(VS Code, WebStorm, Neovim) und dem TypeScript-Compiler. Jedes Mal wenn du tippst,
eine Datei speicherst oder auf eine Variable hooverst, kommuniziert dein Editor
mit dem `tsserver`-Prozess ueber LSP.

TypeScript 5.x hat mehrere LSP-Verbesserungen gebracht:

**Schnellere Go-to-Definition:** Der Sprung zu einer Type-Definition war bei
re-exportierten Typen langsam. TS 5.x optimiert den Lookup-Algorithmus — besonders
merkbar in grossen Monorepos.

**Besseres Inlay Hints Caching:** Inlay Hints (die grauen Typ-Annotationen die VS Code
anzeigt) werden jetzt gecacht und nur bei Bedarf neu berechnet.

**Schnellere Completion nach Dot-Notation:** Bei `obj.` erscheinen Vorschlaege jetzt
schneller, weil der Narrowing-Algorithmus optimiert wurde.

---

## `tsserver.log`: Der Performance-Arzt

Wenn dein Editor langsam ist, kannst du den TypeScript Language Server diagnostizieren:

```typescript annotated
// In VS Code settings.json:
{
  "typescript.tsserver.log": "verbose"
  // ^ Aktiviert detailliertes Logging des tsserver
  // Dann: Command Palette → "TypeScript: Open TS Server log"
  // Du siehst welche Operationen wie lange dauern
}
```

Im Log siehst du Eintraege wie:

```
[13:42:01.231] getCompletions: took 342ms
[13:42:01.574] getDefinitionAndBoundSpan: took 1.2s
[13:42:02.801] getSemanticDiagnostics: took 2.8s
```

Wenn `getSemanticDiagnostics` mehr als 1 Sekunde dauert, hast du ein Problem.
Ursachen koennen sein:
- Zu viele `any`-Casts die TypeScript zur Laufzeit nicht optimieren kann
- Komplexe Conditional Types mit vielen Verschachtelungen
- Fehlende `paths`-Konfiguration die zu langen Import-Lookups fuehrt

---

## Angular Language Service: TypeScript im Template

> ⚡ **Framework-Bezug: Angular**
>
> Der **Angular Language Service** ist ein Plugin fuer den TypeScript Language Server.
> Er erweitert tsserver um das Verstaendnis von Angular-Templates (`.html`-Dateien).
>
> ```typescript
> // Wenn du in einem Angular-Template schreibst:
> // <button [disabled]="isLoading">{{ userName }}</button>
> //
> // Der Angular LS prueft:
> // - Existiert 'isLoading' in der Komponenten-Klasse?
> // - Ist 'isLoading' einem boolean zuweisbar? (fuer [disabled])
> // - Existiert 'userName' als Property oder Getter?
> // - Welchen Typ hat 'userName'? (fuer sichere Interpolation)
> ```
>
> In TS 5.x wurde die Performance des Angular Language Service durch die verbesserten
> LSP-Grundlagen messbar besser. Bei grossen Angular-Projekten (50+ Komponenten) war
> Template-Completion vorher oft traege — mit TS 5.5+ und Angular 17+ deutlich schneller.
>
> Das kannst du selbst konfigurieren:
>
> ```json
> // tsconfig.json (Angular):
> {
>   "angularCompilerOptions": {
>     "strictTemplates": true,
>     // ^ Aktiviert vollstaendiges Type-Checking in Templates
>     // Braucht den Angular LS und kostet etwas Performance —
>     // aber faengt echte Bugs ab!
>     "strictInputAccessModifiers": true
>     // ^ Prueft ob Input-Properties readonly sind (TS 5.x Pattern)
>   }
> }
> ```

---

## Experiment-Box: Performance messen

```typescript
// Messe deine TypeScript-Build-Zeit:
// $ time npx tsc --noEmit
// real    0m4.231s   <- ohne Optimierungen
//
// Mit --skipLibCheck:
// $ time npx tsc --noEmit --skipLibCheck
// real    0m1.847s   <- 56% schneller!
//
// Mit --incremental:
// $ time npx tsc --noEmit --incremental
// real    0m0.412s   <- 90% schneller (nach dem ersten Durchlauf)
//
// tsconfig.json fuer schnelle Entwicklung:
{
  "compilerOptions": {
    "skipLibCheck": true,      // externe .d.ts nicht pruefen
    "incremental": true,       // Build-Cache verwenden
    "tsBuildInfoFile": ".tsbuildinfo",  // Cache-Datei
    "noEmit": true             // nur type-check, nicht kompilieren
  }
}
//
// WICHTIG: .tsbuildinfo in .gitignore aufnehmen!
// Es ist eine maschinenspezifische Cache-Datei.
```

---

```typescript annotated
// tsconfig.json mit Performance-Flags kommentiert:
{
  "compilerOptions": {
    // --- Grundlegende Einstellungen ---
    "target": "ES2022",
    // ^ Was der Browser/Node ausfuehren soll

    "module": "ESNext",
    // ^ ESM-Module (nicht CommonJS)

    // --- Performance-Flags ---
    "skipLibCheck": true,
    // ^ node_modules/*.d.ts werden NICHT geprueft
    // Spart 40-60% Build-Zeit bei grossen Projekten

    "incremental": true,
    // ^ TypeScript cached den Compile-Status
    // Nur geaenderte Dateien werden neu geprueft

    "tsBuildInfoFile": "./.tsbuildinfo",
    // ^ Pfad fuer den Incremental-Cache

    // --- Korrektheit ---
    "strict": true,
    // ^ Aktiviert alle strengen Checks (immer einschalten!)

    "noUncheckedIndexedAccess": true,
    // ^ arr[0] hat Typ T | undefined, nicht T
    // Leicht nervig, aber verhindert echte Bugs

    // --- Library-Build-spezifisch ---
    "declaration": true,
    // ^ Erzeugt .d.ts Dateien
    "isolatedDeclarations": true
    // ^ Nur fuer Libraries: erzwingt explizite Export-Typen
    // Ermoeglicht parallele .d.ts-Erzeugung durch andere Tools
  }
}
```

---

## Was du gelernt hast

- `skipLibCheck: true` spart viel Build-Zeit, ueberspringt aber Pruefung von Bibliotheks-Typen
- `isolatedDeclarations` (TS 5.5) erzwingt explizite Export-Typen und erlaubt parallele Kompilierung
- `incremental: true` cached den Build-Status und macht wiederholte Checks drastisch schneller
- `tsserver.log` deckt Performance-Engpaesse im Editor auf
- Der Angular Language Service baut auf dem TypeScript LSP auf und profitiert direkt von TS 5.x-Verbesserungen

**Kernkonzept:** TypeScript-Performance ist keine Eigenschaft des Compilers — sie ist eine
Eigenschaft deiner `tsconfig.json`. Mit den richtigen Flags kann dieselbe Codebase 10x
schneller kompilieren.

> 🧠 **Erklaere dir selbst:** Du hast ein grosses Angular-Projekt (150 Komponenten, 80
> Services). Die Entwickler beschweren sich ueber traege Autocomplete. Welche drei
> tsconfig-Optionen wuerden du als erstes anpassen, und warum?
>
> **Kernpunkte:** skipLibCheck fuer schnellere .d.ts-Verarbeitung | incremental fuer
> Caching zwischen Speichervorgaengen | strictTemplates ggf. auf false fuer schnelleres
> Template-Feedback | tsserver.log um den Engpass zu identifizieren

---

> **Pausenpunkt** — Guter Moment fuer eine kurze Pause. Du hast die Performance-Seite
> von TypeScript kennengelernt — die Seite, die in Tutorials oft fehlt aber im echten
> Projektalltag entscheidend ist.
>
> Weiter geht es mit: [Sektion 06: Der Upgrade-Pfad und TypeScript Zukunft](./06-upgrade-pfad-und-zukunft.md)
