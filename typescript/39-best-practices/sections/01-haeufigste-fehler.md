# Sektion 1: Die 10 haeufigsten TypeScript-Fehler

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: — (Start)
> Naechste Sektion: [02 - any vs unknown vs never](./02-any-unknown-never.md)

---

## Was du hier lernst

- Die **10 haeufigsten Fehler** die professionelle Entwickler mit TypeScript machen
- Warum jeder Fehler problematisch ist und wie man ihn **erkennt**
- Konkrete **Fixes** mit Code-Beispielen
- Welche Fehler du wahrscheinlich **selbst** schon gemacht hast

---

## Warum diese Liste?

In 39 Lektionen hast du TypeScript von Grund auf gelernt. Aber
Wissen allein verhindert keine Fehler — **Gewohnheiten** tun es.
Diese Liste basiert auf einer Analyse von tausenden TypeScript-
Projekten und Code Reviews.

> 📖 **Hintergrund: Daten hinter der Liste**
>
> Microsoft's TypeScript-Team veroeffentlichte 2023 eine Analyse
> der haeufigsten Compiler-Fehler in npm-Paketen. Die Top 3:
> TS2322 (Type not assignable), TS2345 (Argument not assignable)
> und TS7006 (Parameter implicitly has 'any'). Aber Compiler-Fehler
> sind nur die Spitze des Eisbergs — die schlimmsten Fehler sind
> die, die der Compiler NICHT findet: unsichere Casts, fehlende
> Narrowing-Checks und Over-Engineering mit Typen. Diese Fehler
> sind die Grundlage dieser Lektion.

Es gibt ein Muster das bei fast allen Fehlern wiederkehrt: Der
Entwickler wollte **den Compiler schnell zum Schweigen bringen**.
`as User`, `any`, `!` — das sind keine Loesungen, sondern
Unterdreckungen. Der Compiler meldet sich damit nicht mehr, aber
der Bug schlummert weiter. Erst in Produktion zeigt er sich —
und dann ist er zehnmal teurer zu fixen.

---

## Die Top 10

### Fehler 1: `as` statt Narrowing

```typescript annotated
// SCHLECHT: Type Assertion (Trust me, Compiler)
const user = apiResponse as User;
// ^ Wenn apiResponse kein User ist, hast du einen Runtime-Fehler
// ^ Der Compiler glaubt dir BLIND

// GUT: Type Narrowing (Prove it, Compiler)
function isUser(data: unknown): data is User {
  return (
    typeof data === "object" &&
    data !== null &&
    "name" in data &&
    "email" in data
  );
}
if (isUser(apiResponse)) {
  // Hier ist apiResponse garantiert User
}
```

### Fehler 2: `any` statt `unknown` fuer externe Daten

```typescript annotated
// SCHLECHT: any deaktiviert das Typsystem
function handleApiResponse(data: any) {
  data.name.toUpperCase();  // Kein Fehler — aber Runtime-Crash moeglich!
}

// GUT: unknown erzwingt Pruefung
function handleApiResponse(data: unknown) {
  if (typeof data === "object" && data !== null && "name" in data) {
    const name = (data as { name: string }).name;
    // ^ Sicher: Wir haben geprueft
  }
}
```

### Fehler 3: Nicht-exhaustive switch

```typescript annotated
type Status = "idle" | "loading" | "success" | "error";

// SCHLECHT: Neuer Status "cancelled" wird uebersehen
function handle(status: Status): string {
  switch (status) {
    case "idle": return "Warten...";
    case "loading": return "Laden...";
    case "success": return "Fertig!";
    // "error" fehlt — kein Compiler-Fehler!
  }
  return "???";  // Fallback versteckt den Bug
}

// GUT: Exhaustive Check mit never
function handleSafe(status: Status): string {
  switch (status) {
    case "idle": return "Warten...";
    case "loading": return "Laden...";
    case "success": return "Fertig!";
    case "error": return "Fehler!";
    default: {
      const _exhaustive: never = status;
      // ^ Compiler-Fehler wenn ein Case fehlt!
      return _exhaustive;
    }
  }
}
```

> 🧠 **Erklaere dir selbst:** Warum funktioniert der Exhaustive Check
> mit `never`? Was passiert wenn du einen neuen Status hinzufuegst
> und den Case vergisst?
> **Kernpunkte:** Nach allen Cases ist status auf never eingeengt |
> Neuer Status "cancelled" waere in default nicht never sondern
> "cancelled" | Zuweisung zu never schlaegt fehl → Compile-Error

### Fehler 4: Implicit Return Types bei oeffentlichen Funktionen

```typescript annotated
// SCHLECHT: Rueckgabetyp wird inferiert — aendert sich bei Refactoring
export function getUser(id: string) {
  return db.users.find(u => u.id === id);
  // ^ Inferiert: User | undefined
  // Wenn jemand die Implementierung aendert, aendert sich der Return-Typ!
}

// GUT: Expliziter Rueckgabetyp bei exportierten Funktionen
export function getUser(id: string): User | undefined {
  return db.users.find(u => u.id === id);
  // ^ Rueckgabetyp ist ein VERTRAG — aendert sich die Implementierung,
  //   bekommt der Autor einen Compile-Fehler
}
```

Das ist wirklich in Production-Code passiert: Ein Team refactored
`getUser()` so dass es statt `User | undefined` ein `Promise<User>`
zurueckgibt. Da kein expliziter Rueckgabetyp vorhanden war, merkte
niemand den Breaking Change — alle Aufrufer liefen weiterhin, nur
mit einem Promise-Objekt statt einem User. Das `user.name` wurde
zu einem Promise-Object-Stringname. Ein Fehler der vier Stunden
Debugging kostete und durch einen einzigen Typ-Annotation verhindert
worden waere.

> ⚡ **Angular-Bezug:** In Angular-Services ist dieser Fehler besonders
> haeufig. Ein Service-Methode ohne expliziten Return Type kann still
> ihren Rueckgabetyp aendern wenn das Refactoring die Implementierung
> umstrukturiert. Schreibe in Angular-Services IMMER:
> `getUsers(): Observable<User[]>` — nie nur `getUsers()`.
> In React ist das Aequivalent bei Custom Hooks: `function useAuth():
> AuthState` macht den Vertrag explizit, sodass niemand den Return-Typ
> versehentlich bricht. ESLint-Regel: `@typescript-eslint/explicit-module-boundary-types`
> erzwingt das automatisch.

### Fehler 5: Non-null Assertion als Notlosung

```typescript annotated
// SCHLECHT: ! als Flucht vor null-Handling
const username = user!.profile!.settings!.username!;
// ^ Vier Ausrufezeichen = vier potenzielle Runtime-Crashes
// ^ Wenn irgendein Link in der Kette null ist → TypeError

// GUT: Optional Chaining + Fallback
const username = user?.profile?.settings?.username ?? "Anonym";
// ^ Sicher: Falls irgendwo null → Fallback-Wert
// ^ Lesbar: Der "happy path" ist klar erkennbar
```

**Warum `!` gefaehrlich ist:** Es ist eine Behauptung an den Compiler
die nicht verifiziert wird. `user!` sagt: "Ich schwore, user ist nie
null." Aber in einer Web-App kann fast alles null werden — ein
ausgeloggter User, eine langsame API, ein geleerter Cache. Das `!`
verschiebt den Fehler von der Compilezeit in die Laufzeit. Und in
der Laufzeit passiert es meistens genau dann wenn ein Nutzer etwas
wichtiges tun will.

### Fehler 6-10 im Detail

**Fehler 6: `Object` statt `object`** — `Object` (gross) ist fast
wie `any`: Es akzeptiert alle nicht-nullaren Werte. `object` (klein)
akzeptiert nur Objekte. Fuer "irgendein Objekt" schreibe
`Record<string, unknown>` — das ist explizit und sicher.

**Fehler 7: `interface` vs `type` Glaubenskrieg** — Teams verbringen
Stunden in Diskussionen ob `interface User {}` oder `type User = {}`
besser sei. Die Antwort: Es ist egal. Was zaehlt: Konsistenz im
Projekt. Unsere Empfehlung: `interface` fuer Objekte die man
erweitern kann (`extends`), `type` fuer Unions und Aliases.

**Fehler 8: Kein `strict: true`** — Ohne `strictNullChecks` kann
`null` unbemerkt in jeden Typ schluefen. Das ist wie Fahren ohne
Gurt. Aktiviere `strict: true` in der `tsconfig.json` fuer jedes
neue Projekt. Fuer bestehende Projekte: Schrittweise mit `// @ts-nocheck`
Legacy-Dateien ausblenden waehrend du migrierst.

**Fehler 9: Sinnlose Generics** — `function log<T>(msg: T): void`
ist kein typsichererer Code als `function log(msg: unknown): void`.
Ein Generic der nur einmal vorkommt gibt keinen Mehrwert. Generics
haben Kosten: Compiler-Zeit, Lesbarkeit, IntelliSense-Komplexitaet.

**Fehler 10: Barrel-Exports ohne Bedacht** — `index.ts` mit 50
Re-Exports klingt praktisch, fuehrt aber zu zirkulaeren Abhaengigkeiten
und verhindert Tree-Shaking. Grosse Angular-Apps werden merklich
langsamer wenn alles durch Barrel-Files geht. Direkte Imports
(`import { UserService } from './services/user.service'`) sind
oft die bessere Wahl.

> 💭 **Denkfrage:** Welchen dieser 10 Fehler hast du wahrscheinlich
> selbst schon gemacht? Welchen wuerdest du in einem Code Review
> als erstes beanstanden?
>
> **Antwort:** Die haeufigsten sind `as`-Casts (#1) und `any` (#2) —
> weil sie die schnellste "Loesung" sind wenn der Compiler meckert.
> In Code Reviews sollte `any` ein sofortiges Red Flag sein. Ein
> einziges `any` kann durch die gesamte Codebasis "fliessen" und
> das Typsystem wertlos machen. Schau mal in dein letztes Angular-
> oder React-Projekt: Wie viele `as` und `any` findest du? Jedes
> davon ist eine potenzielle Zeitbombe.

---

## Experiment: Fehler-Detektor

Betrachte diesen Code-Block und finde alle 10 Fehler (einen pro Kategorie):

```typescript
// Fehlerhafte User-Verwaltung — wie viele Probleme siehst du?

interface UserStore {
  [key: string]: any;  // Fehler 6+9: Object mit any
}

function fetchUser(id: any): any {  // Fehler 2: any statt unknown/string
  const raw = localStorage.getItem("user_" + id);
  return JSON.parse(raw!) as User;  // Fehler 1+5: as + !
}

export function processUser(store: UserStore) {  // Fehler 4: kein Return Type
  const user = fetchUser(store.currentId);
  
  // Fehler 3: Nicht-exhaustiver switch
  switch (user.status) {
    case "active": return user.name.toUpperCase();
    case "inactive": return "Inaktiv";
    // "banned" fehlt — was passiert wenn ein neuer Status kommt?
  }
}

// Fehler 7: inkonsistente Typdefinitionen
interface UserProfile { name: String; age: Number; }
// ^ String/Number (gross) sind die Wrapper-Objekte, nicht die Primitives!
// Richtig: name: string; age: number;
```

Gehe jetzt in dein eigenes Angular- oder React-Projekt und suche nach denselben
Mustern. Drei Minuten Suche nach `": any"` und `" as "` zeigen dir mehr als
jede Code-Review-Theorie.

---

## Was du gelernt hast

- Die **10 haeufigsten TypeScript-Fehler** — von `as`-Casts bis Over-Generics
- `as` ist ein **Trust me** an den Compiler — verwende stattdessen Narrowing (**Prove it**)
- `any` ist **ansteckend** — ein einziges `any` kann durch die gesamte Codebasis fliessen
- **Exhaustive Checks** mit `never` fangen fehlende Cases zur Compilezeit
- Explizite Return Types bei oeffentlichen Funktionen sind ein **Vertrag**
- Non-null Assertions (`!`) verschieben null-Fehler von der Compilezeit in die Laufzeit
- `strict: true` in tsconfig.json ist keine Option, sondern eine Pflicht
- Barrel-Exports kosten Performance und erzeugen zirkulaere Abhaengigkeiten

> 🧠 **Erklaere dir selbst:** Warum ist `any` "ansteckend"? Wenn du
> `const x: any = ...` schreibst und dann `const y = x.foo` — welchen
> Typ hat `y`?
> **Kernpunkte:** y ist auch `any` | Jeder Zugriff auf `any` ergibt
> `any` | Das breitet sich durch die gesamte Aufrufkette aus |
> Deshalb ist ein einziges `any` in einer Utility-Funktion so
> gefaehrlich | In Angular: ein `any` im HttpClient-Service infiziert
> alle Components die diesen Service nutzen

**Kernkonzept zum Merken:** Der Compiler ist dein Partner, nicht dein Feind. Wenn er meckert, hat er meistens recht. `as`, `any` und `!` sind keine Loesungen — sie sind Unterdrueckung von Symptomen. Das Symptom verschwindet, der Bug bleibt.

---

> **Pausenpunkt** — Du kennst die haeufigsten Fehler. Naechster
> Schritt: Die drei Spezialtypen `any`, `unknown` und `never` im Detail.
>
> Weiter geht es mit: [Sektion 02: any vs unknown vs never](./02-any-unknown-never.md)
