# Sektion 6: Security Checkliste und Code Review

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [05 - Parse, don't validate](./05-parse-dont-validate.md)
> Naechste Sektion: — (Ende der Lektion)

---

## Was du hier lernst

- Eine **praktische PR-Review-Checkliste** mit 8 konkreten roten Flaggen
- Welche **ESLint-Regeln** automatisch die schlimmsten Muster verhindern
- Wann Angular's `DomSanitizer.bypassSecurityTrust*()` berechtigt ist —
  und wann es ein Sicherheitsproblem signalisiert
- Wie du Sicherheits-Wissen im Team verbreiten kannst ohne nervtoetig zu sein

---

## Hintergrund: Code Review als Sicherheits-Gate

Im Jahr 2014 wurde der Heartbleed-Bug veroeffentlicht — eine der
schwerwiegendsten Sicherheitsluecken der Internetgeschichte. Ein einfacher
Puffer-Ueberlauf in OpenSSL, der seit zwei Jahren im Code war. Der Code war
von Experten reviewt worden. Trotzdem war der Fehler unsichtbar.

Robin Seggelmann, der Entwickler der den Fehler einfuehrte, sagte spaeter:
"Ich habe vergessen, die Laenge zu validieren." Keine boese Absicht, nur ein
vergessener Check.

Was haette geholfen? Eine klare Checkliste. Nicht "pruefen ob der Code
korrekt aussieht", sondern konkrete Fragen: "Wird hier die Laenge validiert?
Ist diese Eingabe validiert?" Code Reviews ohne Checkliste sind ineffektiv —
Reviewer suchen das Falsche oder schauen an der falschen Stelle.

Diese Sektion gibt dir genau das: **8 konkrete Fragen** die du bei jedem
TypeScript-PR stellen kannst.

---

## Die 8 roten Flaggen im Code Review

```typescript annotated
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROTE FLAGGE 1: 'as' fuer externe Daten
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ❌ PROBLEM: as ohne vorherige Validierung
const user = await fetch('/api/user').then(r => r.json()) as User;
// Warum gefaehrlich: Die API koennte jedes beliebige Objekt zurueckgeben.
// 'as' sagt dem Compiler "vertraue mir" — der Compiler tut es. Blind.

// ✅ FIX: Type Guard verwenden
const raw = await fetch('/api/user').then(r => r.json());
const user = parseUser(raw);  // Wirf ParseError wenn ungueltig
// Oder mit Result-Pattern:
const result = safeParseUser(raw);
if (!result.ok) throw new Error(`Ungueltige API-Antwort: ${result.error.message}`);
const user = result.value;    // Hier: sicher, TypeScript weiss es

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROTE FLAGGE 2: Non-null Assertion ohne Erklaerung
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ❌ PROBLEM: ! ohne Kommentar oder Check
const element = document.getElementById('app')!;
// Warum gefaehrlich: Wenn 'app' nicht existiert → TypeError zur Laufzeit.
// Das ! verschiebt den Fehler von Compile-Zeit (erkennbar) zu Laufzeit (unsichtbar).

// ✅ FIX: Expliziter Check mit erklaerenden Fehler
const element = document.getElementById('app');
if (!element) {
  throw new Error('App-Container nicht gefunden — wurde index.html korrekt geladen?');
}
// Jetzt: element ist HTMLElement — TypeScript weiss es durch Narrowing, kein !

// Ausnahme: @ViewChild in Angular ist OK mit ! wenn der Lifecycle stimmt:
// @ViewChild('myRef') myRef!: ElementRef;  // In ngAfterViewInit verwendet

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROTE FLAGGE 3: JSON.parse ohne Validierung
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ❌ PROBLEM: JSON.parse direkt mit Cast
const config = JSON.parse(localStorage.getItem('config') || '{}') as AppConfig;
// Zwei Probleme: (1) JSON.parse kann werfen bei ungueltigem JSON
//               (2) as AppConfig ist unbewiesen — jemand koennte localStorage editiert haben

// ✅ FIX: try-catch + Typ-Pruefung + Fallback
function ladeConfig(): AppConfig {
  const raw = localStorage.getItem('config');
  if (!raw) return standardConfig;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.warn('Korrumpierte Config in localStorage');
    return standardConfig;
  }
  return isAppConfig(parsed) ? parsed : standardConfig;
  // isAppConfig ist ein Type Guard — prueft Struktur und Typen
}
```

---

```typescript annotated
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROTE FLAGGE 4: Object.assign mit unbekannten Quellen
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ❌ PROBLEM: Blindes Mergen mit fremden Daten
const merged = Object.assign({}, defaults, userInput);
// Prototype Pollution! Wenn userInput = { __proto__: { isAdmin: true } }
// wird Object.prototype vergiftet — alle Objekte bekommen isAdmin: true

// ✅ FIX: Object.create(null) + Whitelist
const ERLAUBTE_KEYS = ['sprache', 'theme', 'schriftgroesse'] as const;
const sicher = Object.create(null) as Record<string, unknown>;
for (const key of ERLAUBTE_KEYS) {
  if (key in (userInput as object)) {
    sicher[key] = (userInput as Record<string, unknown>)[key];
  }
}
// Object.create(null) hat KEINEN Prototyp — __proto__-Angriffe haben kein Ziel

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROTE FLAGGE 5: any in Funktionssignaturen
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ❌ PROBLEM: any als Parameter- oder Rueckgabetyp
function verarbeite(data: any): any {
  return data.result.value;
  // Tippfehler? Strukturproblem? TypeScript sagt nichts.
}

// ✅ FIX: unknown + Narrowing ODER Generics
function verarbeiteSicher(data: unknown): string {
  if (typeof data !== 'object' || data === null) throw new TypeError('Kein Objekt');
  const v = data as Record<string, unknown>;
  if (typeof v['result'] !== 'object' || v['result'] === null) throw new TypeError('result fehlt');
  const result = v['result'] as Record<string, unknown>;
  if (typeof result['value'] !== 'string') throw new TypeError('value: string erwartet');
  return result['value'];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROTE FLAGGE 6: Direkte URL-Parameter ohne Validierung
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ❌ PROBLEM: URL-Parameter direkt in Logik
const id = route.snapshot.paramMap.get('id')!;
// id ist string | null — das ! Assertion ist gefaehrlich
// Und selbst wenn nicht null: ist es eine gueltige ID?

// ✅ FIX: Validierung + typsichere ID-Typen
const rawId = route.snapshot.paramMap.get('id');
if (!rawId || !/^[a-z0-9-]{1,64}$/.test(rawId)) {
  this.router.navigate(['/404']);
  return;
}
const userId = rawId as UserId;  // as ist OK: Regex hat Format bewiesen

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROTE FLAGGE 7: eval() oder new Function()
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ❌ PROBLEM: Code-Ausfuehrung aus Strings
const ergebnis = eval(userInput);
const fn = new Function('data', userInput);

// ✅ FIX: Alternativen ohne eval
// Mathematische Ausdruecke: Parser schreiben oder sichere Library
// JSON: JSON.parse (kein eval!)
// Templates: Template-Engines die kein eval nutzen (z.B. Mustache)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROTE FLAGGE 8: innerHTML mit Nutzerdaten
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ❌ PROBLEM: Direktes HTML-Setzen
this.box.nativeElement.innerHTML = userContent;

// ✅ FIX: Angular Template-Binding oder DomSanitizer
// In Templates: {{ userContent }} ist automatisch escaped
// Bei HTML-Inhalt: DomSanitizer.sanitize(SecurityContext.HTML, content)
```

---

## ESLint-Regeln als automatisches Sicherheitsnetz

Nicht alle roten Flaggen lassen sich per Code Review finden — der Reviewer
ist muede, abgelenkt, sieht nicht jede Zeile. ESLint kann helfen, die
offensichtlichsten Muster automatisch zu blockieren:

```typescript annotated
// .eslintrc.json — diese Regeln fuer TypeScript-Projekte empfohlen:
{
  "rules": {
    // Verhindert explizites 'any' in Typen und Parametern:
    "@typescript-eslint/no-explicit-any": "error",
    // Erlaubt Ausnahmen wenn der Developer WIRKLICH muss (z.B. Library-Typen)

    // Verhindert ! Non-null Assertions:
    "@typescript-eslint/no-non-null-assertion": "warn",
    // "warn" statt "error" weil @ViewChild! in Angular legitim ist

    // Verhindert unsichere Zuweisungen von any:
    "@typescript-eslint/no-unsafe-assignment": "error",
    // const x: User = apiData  // Fehler wenn apiData 'any' ist

    // Verhindert unsichere Memberaufrufe auf any:
    "@typescript-eslint/no-unsafe-member-access": "error",
    // data.user  // Fehler wenn data 'any' ist

    // Verhindert unsichere Rueckgaben von any:
    "@typescript-eslint/no-unsafe-return": "error",

    // Verhindert Type Assertions die fundamentale Regeln brechen:
    "@typescript-eslint/no-unsafe-type-assertion": "warn"
    // 42 as string  // Fehler — das ist nie sicher
  }
}
```

**Was ESLint nicht ersetzen kann:** ESLint prueft Syntax und Muster, keine Semantik.
`parseUser(data)` sieht fuer ESLint genauso gut aus wie `data as User` wenn die
Typen zueinanderliegen. Logical Review bleibt notwendig.

---

## Angular-Bezug: DomSanitizer — wann Bypass berechtigt ist

Angular hat einen eingebauten Schutzmechanismus gegen XSS: Der `DomSanitizer`
bereinigt gefaehrlichen HTML-Inhalt. Manchmal ist es notwenig, diesen Schutz
zu umgehen — aber das ist eine Entscheidung mit Konsequenzen:

```typescript annotated
@Component({ /* ... */ })
export class RichTextComponent {
  constructor(private sanitizer: DomSanitizer) {}

  // ❌ FAST NIE RICHTIG: bypassSecurityTrust... mit Benutzerdaten
  unsicheresHTML(userContent: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(userContent);
    // ^ Deaktiviert Angulars XSS-Schutz komplett!
    // Wenn userContent Nutzereingabe enthaelt: XSS-Luecke
    // Angular gibt sogar eine Konsolenwarnung aus wenn man das verwendet
  }

  // ✅ KORREKTE VERWENDUNG: sanitize() nicht bypass*()
  sicheresHTML(userContent: string): SafeHtml {
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, userContent);
    // ^ sanitize() bereinigt gefaehrliche Tags/Attribute
    // <script> → entfernt, on*-Attribute → entfernt
    // Normales <b>, <i>, <p> bleibt erhalten
    return this.sanitizer.bypassSecurityTrustHtml(sanitized ?? '');
    // ^ bypass*() nach sanitize() ist OK — der Inhalt ist jetzt sauber
  }

  // ✅ LEGITIMER BYPASS: Eigener vertrauenswuerdiger Inhalt (nicht Nutzereingabe)
  markdownGerendert(markdownOutput: string): SafeHtml {
    // markdownOutput kommt von unserem eigenen Markdown-Renderer
    // Der Renderer produziert nur sicheres HTML — kein Nutzereingabe-HTML
    return this.sanitizer.bypassSecurityTrustHtml(markdownOutput);
    // ^ Hier ist bypass legitim: wir vertrauen UNSEREM Renderer
  }
}
```

**Die Faustregel:** `bypassSecurityTrust*()` ist legitim wenn der Inhalt
**von dir kontrolliert** wird (eigener Renderer, statische Strings, serverseitig
gereinigter HTML). Es ist **niemals** legitim mit unkontrollierter Nutzereingabe.

---

## Experiment-Box: Die Checkliste selbst anwenden

Hier ist ein realer Code-Snippet — finde alle roten Flaggen:

```typescript
// Aufgabe: Wie viele Probleme siehst du?

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  constructor(private http: HttpClient, private router: Router) {}

  async updateProfile(formData: any): Promise<void> {
    const userId = localStorage.getItem('userId')!;
    const response = await this.http.put(
      `/api/users/${userId}/profile`,
      Object.assign({}, this.defaultProfile, formData)
    ).toPromise() as any;

    if (response.success) {
      const updatedUser = JSON.parse(response.userData) as User;
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }

  private defaultProfile = {
    theme: 'light',
    language: 'de',
  };
}
```

Zaehle die Probleme bevor du weiterliest:

```
Antwort — gefundene Probleme (mind. 6):

1. formData: any          → should be unknown, dann validieren
2. localStorage.getItem()! → Non-null Assertion, userId koennte null sein
3. userId direkt in URL   → nicht validiert (Format, SQL-Injection)
4. Object.assign mit formData → Prototype Pollution wenn formData extern
5. .toPromise() as any    → Verlust aller Typinformationen
6. JSON.parse ohne try-catch → wirft bei ungueltigem JSON (crash)
7. JSON.parse as User     → unvalidierter Cast nach dem Parse
8. response.success als Wahrheitspruefer → untypisiert (response ist any)
```

Kein Einzelproblem ist katastrophal — kombiniert ergeben sie eine Funktion
die auf mehrere Arten fehlschlagen kann ohne Fehlermeldung.

---

> 💭 **Denkfrage:** Wenn dein Team eine No-`any`-Regel einfuehren wollte,
> was waere der groesste Widerstand? Welches Argument wuerdest du gehoert
> bekommen — und wie wuerdest du es entraeften?
>
> **Antwort:** "Es macht den Code komplizierter" — stimmt kurzzeitig.
> Aber: `any` ist technische Schulden die Zinsen zahlt. Jedes `any` heute
> ist eine unbemerkte Laufzeit-Exception morgen. Die Lernkurve fuer
> `unknown` + Type Guards ist eine Wochensache. Die Zeit die gespart wird,
> weil Production-Bugs ausbleiben, ist Monate. Zeige konkrete Beispiele aus
> eurem eigenen Code wo `any` zu echten Bugs gefuehrt hat — das ist
> ueberzeugender als abstrakte Argumente.

---

> 🧠 **Erklaere dir selbst:** Was ist der Unterschied zwischen ESLint-Regeln
> und Code Review fuer Sicherheit? Was kann ESLint, was Review nicht kann —
> und umgekehrt?
>
> **Kernpunkte:** ESLint: konsistent, automatisch, billig, prueft Syntax-
> Muster | Review: versteht Semantik, sieht Kontext, findet logische Fehler |
> ESLint wird nicht muede, Review schon | ESLint kann nicht pruefen ob
> parseUser() korrekt implementiert ist | Beide zusammen: beste Abdeckung |
> ESLint als erstes Netz, Review als zweites

---

## Was du gelernt hast

- Die **8 roten Flaggen** im TypeScript-Code Review: `as` fuer externe Daten,
  `!` ohne Check, `JSON.parse` ohne Validierung, blindes `Object.assign`,
  `any` in Signaturen, unvalidierte URL-Parameter, `eval()`, und `innerHTML`
- **ESLint-Regeln** automatisieren die einfachsten Checks: `no-explicit-any`,
  `no-non-null-assertion`, `no-unsafe-assignment` sind der Mindeststandard
- **`DomSanitizer.bypassSecurityTrust*()`** ist legitim fuer eigenen,
  vertrauenswuerdigen Inhalt — niemals fuer unkontrollierte Nutzereingabe
- **Checklisten** schlagen "gut schauen" im Code Review — konkrete Fragen
  finden mehr als vage Aufsicht

**Kernkonzept zum Merken:** Sicherheit im Code Review bedeutet nicht,
Bugs zu finden — das macht der Compiler. Es bedeutet, **Muster zu erkennen**
die das Typsystem absichtlich umgehen. Jedes `as`, `!`, `any` ist eine
bewusste Entscheidung. Frage: "War das eine _informierte_ Entscheidung?"

---

> **Pausenpunkt** — Du hast die vollstaendige Lektion abgeschlossen.
> Du kannst jetzt TypeScript-Sicherheitsrisiken erkennen, defensive
> Validierungsebenen aufbauen, das Parse-Prinzip anwenden und Code
> Reviews strukturiert fuehren. Das ist das Handwerkszeug eines
> sicherheitsbewussten TypeScript-Entwicklers.
>
> Das war Lektion 42 — TypeScript Sicherheit.
