# Sektion 5: Praxis & Grenzen -- Type Checking vs. Laufzeitverhalten

> Geschaetzte Lesezeit: ~10 Minuten

## Was du hier lernst

- Warum TypeScript das Laufzeitverhalten deines Codes nicht veraendert
- Wo TypeScript dich schuetzt -- und wo NICHT
- Wie du mit den Grenzen umgehst (Runtime-Validierung, zod, io-ts)

---

## TypeScript aendert NICHT, wie dein Code laeuft

Das ist ein Punkt, an dem viele TypeScript-Anfaenger stolpern. Es ist so wichtig, dass es einen eigenen Abschnitt verdient:

**TypeScript fuegt keine Laufzeit-Pruefungen hinzu.**

Wenn du schreibst:

```typescript
function add(a: number, b: number): number {
  return a + b;
}
```

...dann erzeugt TypeScript daraus:

```javascript
function add(a, b) {
  return a + b;
}
```

Wenn jemand `add("hello", "world")` aufruft, gibt die Funktion `"helloworld"` zurueck -- zur Laufzeit gibt es keine Typ-Pruefung. Der TypeScript-Compiler haette den Fehler *vorher* gemeldet, aber wenn der Code trotzdem ausgefuehrt wird (z.B. weil er ueber `tsx` ohne Type Checking laeuft, oder weil die Daten von einer externen API kommen), passiert kein Fehler.

### Die Analogie: Rechtschreibpruefung

TypeScript ist wie eine Rechtschreibpruefung:

- Sie zeigt dir Fehler an, *waehrend du schreibst*
- Sie verhindert nicht, dass du den Text trotzdem abschickst
- Der Empfaenger liest den Text mit allen Fehlern, die du ignoriert hast
- Aber wenn du die Fehler korrigierst, ist der Text besser

Oder noch praeziser: TypeScript ist wie der TUeV fuer dein Auto. Der TUeV prueft *vor der Fahrt*, ob alles in Ordnung ist. Aber er sitzt nicht waehrend der Fahrt neben dir und greift ins Lenkrad. Wenn du den TUeV ignorierst und trotzdem faehrst, funktioniert das Auto -- aber du traegst das Risiko.

> **Hintergrund:** Diese Designentscheidung war nicht alternativlos. Sprachen wie Dart (ebenfalls von Google) fueegen im Debug-Modus tatsaechlich Laufzeit-Assertions hinzu. TypeScript hat sich bewusst dagegen entschieden, weil jede Laufzeit-Pruefung Performance kostet und die erzeugte JavaScript-Ausgabe groesser macht. Der Philosophie-Kern: *TypeScript ist ein Analyse-Tool, kein Runtime-Framework.*

---

## Wo TypeScript dich schuetzt

TypeScript ist hervorragend bei allem, was **zur Compile-Zeit bekannt ist**:

**1. Deinen eigenen Code**

```typescript
interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return `Hallo ${user.nmae}`;  // FEHLER! Property 'nmae' does not exist on type 'User'
}
```

Der Compiler kennt die Struktur von `User` und bemerkt den Tippfehler sofort.

**2. Interaktion zwischen deinen Modulen**

Wenn Modul A eine Funktion exportiert und Modul B sie aufruft, prueft TypeScript, ob die Parameter stimmen. Das ist der Hauptgrund, warum Refactoring in TypeScript so viel sicherer ist als in JavaScript.

**3. Library-APIs**

Dank `.d.ts`-Dateien kennt TypeScript die Typen von npm-Paketen. Wenn du `axios.get()` aufrufst, weiss die IDE, welche Parameter die Funktion erwartet und was sie zurueckgibt.

---

## Wo TypeScript dich NICHT schuetzt

TypeScript kann nicht pruefen, was zur Compile-Zeit nicht bekannt ist. Das betrifft vor allem **externe Daten**:

### 1. API-Responses

```typescript annotated
interface UserResponse {
  id: number;
  name: string;
  email: string;
}

const response = await fetch("/api/users/1");
const user: UserResponse = await response.json();
// ^ response.json() gibt "any" zurueck -- TypeScript glaubt dir blind!
// ^ Keine Pruefung ob die API wirklich {id, name, email} liefert
// ^ Wenn die API anders antwortet: Laufzeit-Crash ohne Compiler-Warnung
```

> 🧠 **Erklaere dir selbst:** Warum kann TypeScript die Struktur einer API-Response nicht pruefen? Was ist die Grenze zwischen Compile-Zeit und Laufzeit -- und wie ueberbrueckst du sie?
> **Kernpunkte:** API-Daten erst zur Laufzeit bekannt | TypeScript arbeitet nur zur Compile-Zeit | Type Assertion ist kein Check | Loesung: Runtime-Validierung (zod, io-ts)

Das Problem: `response.json()` gibt `any` zurueck. Du castest es zu `UserResponse`, aber TypeScript prueft nicht, ob die Daten tatsaechlich dieser Struktur entsprechen.

> **Praxis-Tipp:** In Angular-Projekten siehst du oft `httpClient.get<UserResponse>(url)`. Das sieht sicher aus, ist es aber nicht -- das Generic-Argument ist nur ein Type Assertion, keine Runtime-Validierung. Die HTTP-Antwort wird nicht gegen den Typ geprueft.

### 2. Benutzereingaben

```typescript
const input = document.getElementById("age") as HTMLInputElement;
const age: number = Number(input.value);

// Was wenn der Nutzer "abc" eingibt?
// age ist jetzt NaN -- ein gueltiger JavaScript number-Wert
// TypeScript sagt: alles in Ordnung
```

### 3. JSON.parse und dynamic data

```typescript
const config = JSON.parse(fs.readFileSync("config.json", "utf-8"));
// config hat den Typ 'any' -- TypeScript weiss nichts ueber den Inhalt
```

> **Denkfrage:** `JSON.parse()` gibt `any` zurueck. Warum hat das TypeScript-Team das nicht als `unknown` definiert? Was wuerde sich fuer alle bestehenden Projekte aendern, wenn `JSON.parse()` ploetzlich `unknown` zurueckgaebe?

### 4. `any`-Casts

```typescript
const data: any = getExternalData();
data.whatever.does.not.exist;  // Kein Fehler! 'any' schaltet TypeScript ab
```

---

## Die Loesung: Runtime-Validierung

Fuer externe Daten brauchst du **Runtime-Validierung** -- Code, der zur Laufzeit prueft, ob die Daten der erwarteten Struktur entsprechen. Die beliebtesten Libraries dafuer:

### zod -- Der aktuelle Standard

```typescript
import { z } from "zod";

// Schema definieren (existiert zur Laufzeit!)
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

// TypeScript-Typ automatisch ableiten
type User = z.infer<typeof UserSchema>;

// Validierung zur Laufzeit
const result = UserSchema.safeParse(await response.json());
if (result.success) {
  console.log(result.data.name);  // Typ-sicher UND runtime-validiert
} else {
  console.error(result.error);
}
```

> **Hintergrund:** `zod` wurde 2020 von Colin McDonnell geschrieben und hat sich zum De-facto-Standard fuer Runtime-Validierung in TypeScript entwickelt. Der Clou: Du definierst das Schema einmal, und `zod` leitet sowohl die Runtime-Validierung als auch den TypeScript-Typ daraus ab. Keine Duplikation, keine Divergenz. Das ist die eleganteste Loesung fuer die Luecke zwischen Compile-Zeit und Laufzeit.

Andere Libraries in diesem Bereich sind `io-ts`, `valibot` (leichtgewichtiger als zod) und `arktype`.

> **Experiment:** Oeffne `examples/02-type-erasure.ts` und finde eine Stelle, an der TypeScript-Typen zur Laufzeit nicht schuetzen. Kannst du ein Szenario konstruieren, in dem der Code trotz korrekter Typen zur Laufzeit crasht? (Tipp: Denke an externe Daten, die als `any` reinkommen.)

> **Denkfrage:** Die Funktion `httpClient.get<UserResponse>(url)` in Angular *sieht* typsicher aus. Warum ist sie es nicht? Was muesste Angular anders machen, um echte Typsicherheit zu garantieren?

> **Praxis-Tipp:** Baue dir die Gewohnheit auf, jede externe Datenquelle zu validieren:
> - API-Responses: `zod` Schema
> - Formulareingaben: Framework-eigene Validierung (Angular Reactive Forms, React Hook Form) + `zod`
> - Umgebungsvariablen: `zod` Schema fuer `process.env`
> - JSON-Konfigurationsdateien: `zod` Schema
>
> Das klingt nach viel Aufwand, spart aber enorme Debugging-Zeit.

---

## Die Zusammenfassung: Compile-Zeit vs. Laufzeit

```mermaid
flowchart LR
    subgraph CT ["COMPILE-ZEIT -- TypeScript prueft"]
        C1["Dein eigener Code"]
        C2["Modul-Interaktionen"]
        C3["Library-APIs (.d.ts)"]
        C4["Typen, Interfaces"]
    end

    subgraph RT ["LAUFZEIT -- Du musst selbst pruefen"]
        R1["Externe API-Responses"]
        R2["Benutzereingaben"]
        R3["JSON.parse() Ergebnisse"]
        R4["Dynamische Daten"]
    end

    CT ---|"Grenze"| RT

    style CT fill:#10b981,stroke:#059669,color:#fff
    style RT fill:#ef4444,stroke:#dc2626,color:#fff
```

> Die **Grenze** zwischen Compile-Zeit und Laufzeit ist die zentrale Erkenntnis dieser Lektion. Links prueft TypeScript automatisch. Rechts bist du selbst verantwortlich -- mit Tools wie `zod`, `io-ts` oder manuellen Checks.

> **Denkfrage:** Warum hat TypeScript sich entschieden, KEINE Laufzeit-Pruefungen hinzuzufuegen? Man koennte doch fuer jede Typ-Annotation automatisch einen Runtime-Check erzeugen. Was waeren die Nachteile?

Die Nachteile waeren: (1) **Performance** -- jede Typ-Pruefung kostet CPU-Zeit, (2) **Code-Groesse** -- die erzeugte JavaScript-Datei waere um ein Vielfaches groesser, (3) **Kompatibilitaet** -- der erzeugte Code waere kein Standard-JavaScript mehr und wuerde eine TypeScript-Runtime-Library erfordern, und (4) **Vorhersagbarkeit** -- der erzeugte Code waere schwerer zu verstehen und zu debuggen. TypeScript waere eine andere Sprache geworden, nicht eine Erweiterung von JavaScript.

---

## Praxis: Was du jetzt tun solltest

1. Lies die Beispiel-Dateien in `examples/` durch und fuehre sie aus
2. Bearbeite die Uebungen in `exercises/`
3. Pruefe deine Loesungen gegen `solutions/`
4. Mache das Quiz (`quiz.ts`)
5. Behalte das `cheatsheet.md` als Referenz

```bash
# Beispiele ausfuehren
tsx examples/01-hello-typescript.ts
tsx examples/02-type-erasure.ts
tsx examples/03-compiler-errors.ts
tsx examples/04-source-maps-und-output.ts

# Uebungen bearbeiten
code exercises/01-erste-schritte.ts
code exercises/02-tsconfig-verstehen.ts
code exercises/03-compiler-output-vorhersagen.ts
code exercises/04-fehler-finden-und-fixen.ts
code exercises/05-predict-the-output.ts
code exercises/06-fehlermeldungen-lesen.ts

# Quiz starten
tsx quiz.ts
```

---

## Was du in dieser gesamten Lektion gelernt hast

1. **TypeScript = JavaScript + statische Typen.** Alles, was JavaScript kann, kann TypeScript auch. TypeScript fuegt nur Typen hinzu.

2. **Typen existieren nur zur Compile-Zeit.** Zur Laufzeit ist alles pures JavaScript. Das nennt man Type Erasure.

3. **Der Compiler hat drei Phasen:** Parsing (AST erzeugen), Type Checking (Fehler finden), Emit (JavaScript erzeugen). Type Checking und Emit sind unabhaengig.

4. **`strict: true` ist Pflicht.** Ohne Strict-Mode verschenkst du den groessten Vorteil von TypeScript -- insbesondere `strictNullChecks`.

5. **TypeScript aendert nicht das Laufzeitverhalten.** Es fuegt keine Pruefungen hinzu. Es sagt dir nur *vorher*, wo Probleme lauern.

6. **`tsc` prueft und kompiliert, `tsx` fuehrt schnell aus.** Nutze beides zusammen fuer den besten Workflow.

7. **Externe Daten** (API-Responses, JSON, Benutzereingaben) sind die Grenze von TypeScript -- hier brauchst du Runtime-Validierung.

---

> **Experiment:** Schreibe eine kleine Funktion, die Daten von einer oeffentlichen API holt (z.B. `https://jsonplaceholder.typicode.com/users/1`). Nutze `fetch` und weise dem Ergebnis ein Interface zu. Aendere dann die API-URL, sodass ungueltige Daten zurueckkommen. Dein Code crasht -- obwohl TypeScript keine Fehler meldet. Das ist die Grenze, die du verstehen musst.

## Naechste Lektion

**Lektion 02: Primitive Typen & Grundlagen**
- `string`, `number`, `boolean` im Detail
- `null`, `undefined`, `void`, `never`
- `any` vs `unknown` -- und warum `any` Gift ist
- Type Inference -- wenn TypeScript selbst erkennt, welcher Typ gemeint ist

Weiter: `../02-primitive-types/`
