# Sektion 3: JavaScript-Fallen in TypeScript

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Gefaehrliche TypeScript-Muster](./02-gefaehrliche-typescript-muster.md)
> Naechste Sektion: [04 - Runtime-Validierung als Schutz](./04-runtime-validierung-als-schutz.md)

---

## Was du hier lernst

- Sechs JavaScript-Sicherheitsfallen, die TypeScript **vollstaendig ignoriert**
- Was Prototype Pollution ist und warum sie so gefaehrlich ist
- Wie XSS, ReDoS und unsichere Deserialisierung in TypeScript-Code aussehen
- Wie Angular's Sicherheits-APIs (DomSanitizer, XSRF) diese Luecken schliessen

---

## Hintergrund: JavaScript ist 30 Jahre alt

JavaScript wurde 1995 von Brendan Eich in **10 Tagen** geschrieben. Manche
dieser Entscheidungen waren damals sinnvoll, manche waren Fehler, und viele
haben Sicherheitsimplikationen, die erst Jahrzehnte spaeter vollstaendig
verstanden wurden.

TypeScript ist ein Superset von JavaScript — das bedeutet: **Jeder gueltige
JavaScript-Code ist auch gueltiger TypeScript-Code**. TypeScript fuegt das
Typsystem oben drauf, aber die JavaScript-Semantik darunter bleibt unveraendert.

Wenn JavaScript eine Sicherheitsschwachstelle hat, hat TypeScript sie auch.
Das Typsystem ist kein Schutzwall gegen die Vergangenheit.

---

## Falle 1: Prototype Pollution

Prototype Pollution ist eine der gefaehrlichsten JavaScript-Schwachstellen
und TypeScript ist vollkommen blind dafuer.

```typescript annotated
// HINTERGRUND: JavaScript's Prototyp-Kette
// Jedes Objekt erbt von Object.prototype
// { }.toString === Object.prototype.toString

// DIE FALLE: JSON.parse mit boeswilligen Daten
const userInput = '{"__proto__": {"isAdmin": true}}';
const parsed = JSON.parse(userInput);

// WICHTIG: Object.assign({}, parsed) ist in modernen Engines SICHER!
// __proto__ wird als EIGENE Property kopiert, nicht als Prototyp.
const config = Object.assign({}, parsed);
console.log(config.__proto__);  // { isAdmin: true } — eigene Property!
console.log({}.isAdmin);        // undefined — KEINE Pollution!

// Die ECHTEN Gefahren sind:

// Gefahr 1: Deep-Merge-Funktionen (lodash < 4.17.21, CVE-2019-10744)
function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): void {
  for (const key in source) {
    if (typeof source[key] === "object" && source[key] !== null) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key] as Record<string, unknown>,
                source[key] as Record<string, unknown>);
    } else {
      target[key] = source[key];
    }
  }
}

// Der vergiftete Payload:
const payload = JSON.parse('{"__proto__": {"isAdmin": true}}');
const defaults = {};
deepMerge(defaults, payload);
// defaults.__proto__.isAdmin = true → Object.prototype.isAdmin = true!
console.log({}.isAdmin);  // true — JEDES Objekt ist jetzt "admin"!
```

> **Wichtig:** `Object.assign({}, obj)` und Spread `{...obj}` sind in
> modernen JavaScript-Engines sicher — sie kopieren `__proto__` als
> eigene Property, aendern aber NICHT den Prototyp.
>
> Die ECHTEN Gefahren sind:
> 1. **Deep-Merge-Funktionen** die rekursiv `__proto__` durchgehen
>    (betroffen: lodash < 4.17.21, viele selbstgeschriebene Utilities)
> 2. **Manuelle Kopier-Schleifen** ohne `hasOwnProperty`-Check
> 3. **`Object.prototype` direkt manipulieren** (z.B. in Tests)
>
> **Schutz:** `Object.hasOwn(obj, key)` statt `key in obj` pruefen,
> und `JSON.parse`-Ergebnisse NIEMALS ohne Validierung verwenden.

```typescript annotated
// SICHER: Property-Kopie mit __proto__-Filter
function safeMerge(userConfig: unknown): Record<string, unknown> {
  if (typeof userConfig !== "object" || userConfig === null) {
    return {};
  }
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(userConfig)) {
    // Kritische Keys explizit ausschliessen
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue;
    }
    result[key] = (userConfig as Record<string, unknown>)[key];
  }
  return result;
}

// Noch besser: Runtime-Validierung mit Zod (siehe Sektion 02)
import { z } from "zod";
const ConfigSchema = z.object({
  theme: z.enum(["light", "dark"]).default("light"),
  fontSize: z.number().min(8).max(72).default(16),
});

const safeConfig = ConfigSchema.parse(JSON.parse(userInput));
// Wirft wenn __proto__ oder andere unerwartete Keys vorhanden sind
```

**Echte CVEs durch Prototype Pollution:**
- `lodash` CVE-2019-10744: `_.merge()` vergiftete `Object.prototype`
- `jquery` CVE-2019-11358: `$.extend()` war anfaellig
- **TypeScript-typisierte Versionen waren NICHT gefeit** — das Typsystem
  schuetzt NICHT vor Laufzeit-Pollution

---

## Falle 2: eval() und der Function()-Konstruktor

```typescript annotated
// eval() fuehrt beliebigen Code aus — TypeScript prueft den Inhalt nicht
function berechneFormel(ausdruck: string): number {
  // GEFAEHRLICH: eval() mit Benutzereingabe
  return eval(ausdruck);
  // ^ TypeScript: return-Typ ist any — keine Warnung!
  // Wenn ausdruck = "process.exit(0)": App wird beendet
  // Wenn ausdruck = "require('fs').unlinkSync('/etc/passwd')": Dateisystem-Zugriff
}

// Der Function()-Konstruktor ist genauso gefaehrlich:
function erstelleFunktion(code: string): () => void {
  return new Function(code) as () => void;
  // ^ Identisch zu eval() in Bezug auf Sicherheitsrisiken
  // TypeScript sieht: return-Typ ist Function → als () => void gecastet → OK
}

// SICHER: Ausdruecke parsen statt evaluieren
// Fuer mathematische Formeln: eigenen Parser schreiben oder
// eine sichere Library wie math.js verwenden (die eval() NICHT nutzt)
function berechneSicherFormel(ausdruck: string): number {
  // Nur erlaubte Zeichen: Zahlen, Operatoren, Klammern
  if (!/^[\d\s+\-*/().]+$/.test(ausdruck)) {
    throw new Error(`Ungueltige Formel: ${ausdruck}`);
  }
  // Immer noch problematisch — besser: richtiger Parser
  // Aber deutlich sicherer als direktes eval()
  return Function(`"use strict"; return (${ausdruck})`)() as number;
}
```

---

## Falle 3: JSON.parse ohne Validierung

`JSON.parse` ist eine der meistgenutzten Funktionen in JavaScript/TypeScript —
und eine der gefaehrlichsten, wenn das Ergebnis nicht validiert wird.

```typescript annotated
// JSON.parse gibt 'any' zurueck — das ist kein Zufall
// TypeScript weiss: Was JSON enthaelt, ist zur Compile-Zeit unbekannt

// GEFAEHRLICH: Direkte Verwendung ohne Pruefung
function ladeEinstellungen(): BenutzerEinstellungen {
  const raw = localStorage.getItem('settings') ?? '{}';
  return JSON.parse(raw) as BenutzerEinstellungen;
  // ^ Was wenn jemand die localStorage manuell editiert hat?
  // Was wenn ein anderes Skript sie korrumpiert hat?
  // Was wenn JSON.parse wirft? (ungueltige JSON-Syntax)
  // as-Cast gibt keine Antworten — TypeScript schweigt
}

// HINTERGRUND: JSON.parse kann auch nicht-objekte zurueckgeben
JSON.parse('42')         // → 42 (number)
JSON.parse('"hallo"')    // → "hallo" (string)
JSON.parse('null')       // → null
JSON.parse('[1,2,3]')    // → [1, 2, 3] (Array)
// all das hat den TypeScript-Typ 'any'

// SICHER: try-catch + Validierung
function ladeEinstellungenSicher(): BenutzerEinstellungen {
  const raw = localStorage.getItem('settings');
  if (!raw) return standardEinstellungen;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // JSON.parse wirft bei ungueltigem JSON — NICHT ignorieren!
    console.warn('Korrumpierte Einstellungen in localStorage, verwende Standard');
    return standardEinstellungen;
  }

  // Jetzt: parsed ist unknown → erzwingt Validierung
  return validiereEinstellungen(parsed) ?? standardEinstellungen;
}
```

---

## Falle 4: XSS durch Template Literals und innerHTML

Cross-Site Scripting (XSS) ist die haeufigste Web-Sicherheitsluecke.
TypeScript hilft hier nicht — das ist Angulars Job.

```typescript annotated
// GEFAEHRLICH: innerHTML mit Benutzerdaten
@Component({
  selector: 'app-kommentar',
  template: `<div #kommentarBox></div>`
})
export class KommentarComponent {
  @ViewChild('kommentarBox') box!: ElementRef;

  zeigeKommentar(text: string): void {
    // GEFAEHRLICH: innerHTML mit unkontrolliertem Text
    this.box.nativeElement.innerHTML = `<p>${text}</p>`;
    // ^ Wenn text = '<script>stehlePasswoerter()</script>':
    // XSS-Angriff! TypeScript-Typ von text ist 'string' — alles OK fuer den Compiler
    // Aber der Browser fuehrt den Script aus
  }

  // SICHER: Angular's DomSanitizer
  constructor(private sanitizer: DomSanitizer) {}

  zeigeKommentarSicher(text: string): void {
    const sicherHtml = this.sanitizer.sanitize(SecurityContext.HTML, text);
    if (sicherHtml !== null) {
      this.box.nativeElement.innerHTML = sicherHtml;
      // DomSanitizer entfernt gefaehrliche HTML-Elemente/Attribute
    }
  }

  // NOCH BESSER: Angular's Template-Binding nutzen
  // {{ text }} in Templates ist automatisch escaped — KEIN XSS moeglich
  // [innerHTML]="text" triggert Angular's Sanitizer automatisch
  // bypassSecurityTrustHtml() ist NICHT die Loesung — das deaktiviert den Schutz!
}
```

**Warum Angular's Template-Syntax sicher ist:**

Angular's `{{ ausdruck }}` in Templates fuehrt automatisch HTML-Escaping durch.
`<script>` wird zu `&lt;script&gt;`. Das ist der Grund, warum Angular-Templates
standardmaessig XSS-sicher sind — nicht weil TypeScript es verhindert, sondern
weil der Angular-Renderer es tut.

---

## Falle 5: ReDoS — Regular Expression Denial of Service

```typescript annotated
// ReDoS: Boeswillige Strings koennen exponentiell lange Ausfuehrungszeiten erzeugen
// TypeScript-Typ von RegExp-Input ist 'string' — kein Schutz

// GEFAEHRLICH: Katastrophales Backtracking durch verschachtelte Quantifizierer
const EMAIL_REGEX = /^([a-zA-Z0-9]+)*@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
// ^ Das Muster (a+)* ist angreifbar

function validiereEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
  // ^ Mit email = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@':
  // Der Regex-Motor braucht exponentiell lange — Node.js blockiert!
  // TypeScript-Typ: string → boolean — kein Hinweis auf das Problem
}

// SICHER: Einfachere Regex oder Timeout-Schutz
// Fuer Email-Validierung: npm-Package 'validator' nutzen oder
// einfache Heuristik statt komplexer Regex:
function emailSiehtGueltigAus(email: string): boolean {
  // Einfacher Check ohne Backtracking-Risiko:
  const atIndex = email.indexOf('@');
  if (atIndex <= 0 || atIndex === email.length - 1) return false;
  const domain = email.slice(atIndex + 1);
  return domain.includes('.') && domain.length >= 4;
}
```

---

## Falle 6: Unsichere Deserialisierung

```typescript annotated
// localStorage und sessionStorage geben string | null zurueck
// Das ist korrekt — aber oft wird der null-Fall ignoriert

// GEFAEHRLICH: Mehrfach-Annahmen bei Storage-Zugriff
function ladeToken(): string {
  return localStorage.getItem('authToken')!;
  // ^ Non-null Assertion ohne Pruefung
  // Wenn kein Token existiert: null — aber wir haben versprochen: string
  // Bei Verwendung als Authorization-Header: "Authorization: Bearer null" (als String!)
}

// NOCH GEFAEHRLICHER: Zustandsabhaengige Deserialisierung
function ladeBenutzerStatus(): AdminStatus {
  const raw = sessionStorage.getItem('userStatus');
  const status = JSON.parse(raw ?? '{}');
  return status;
  // ^ Was wenn raw = '{"isAdmin": true}'?
  // Wer hat das geschrieben? Wann? Ist das noch aktuell?
  // Serverseitiger Status sollte NICHT im Client-Storage liegen!
  // TypeScript sieht: return-Typ AdminStatus — einverstanden. Aber komplett falsch.
}

// SICHER: Immer vom Server authorisieren, nicht vom Client-Storage
function istAdministrator(): Observable<boolean> {
  // Nicht: aus localStorage lesen
  // Sondern: bei jedem relevanten Request pruefe mit dem Server
  return this.authService.pruefBerechtigungen(['admin']);
  // Der Server hat immer das letzte Wort — Client-Storage ist unsicher
}
```

---

> 🧠 **Erklaere dir selbst:** Angular hat einen eingebauten XSRF-Schutz.
> Wie funktioniert er, und warum kann TypeScript ihn nicht ersetzen?
>
> **Kernpunkte:** XSRF (Cross-Site Request Forgery) ist ein Laufzeit-Angriff |
> Angular's HttpClient sendet automatisch ein XSRF-Token im Header |
> Das Token beweist dem Server: Diese Anfrage kommt von der echten App |
> TypeScript prueft nur Typen — es kennt keine HTTP-Headers oder Browser-
> Sicherheitsmodelle | Framework-Sicherheits-Features ersetzen TypeScript nicht
> und umgekehrt

---

> 💭 **Denkfrage:** Prototype Pollution klingt abstrakt. Kannst du dir
> vorstellen, wie sie in einer echten Angular-App Schaden anrichten koennte?
>
> **Antwort:** Stell dir vor: Deine App hat eine `isAdmin`-Pruefung:
> `if (user.isAdmin) { ... }`. Durch Prototype Pollution setzt ein Angreifer
> `Object.prototype.isAdmin = true`. Jetzt hat **jedes** Objekt in deiner
> App `isAdmin: true` — alle User-Objekte, alle Config-Objekte, alle Guards.
> Der Angular-Route-Guard fragt `user.isAdmin` und bekommt `true` — auch
> fuer normale Benutzer. TypeScript hat waehrend der ganzen Zeit keinen
> einzigen Fehler gemeldet.

---

## Was du gelernt hast

- **Prototype Pollution** vergiftet `Object.prototype` und betrifft alle
  Objekte in der App — TypeScript sieht es nicht
- **`eval()` und `Function()`** fuehren beliebigen Code aus; TypeScript
  prueft den Inhalt der String-Argumente nicht
- **`JSON.parse`** gibt `any` zurueck und kann werfen — beides muss
  behandelt werden
- **XSS** ist ein DOM-Problem; Angular's Template-Binding und `DomSanitizer`
  schuetzen davor, nicht TypeScript
- **ReDoS** kann Node.js blockieren; komplexe Regex mit Benutzereingaben
  sind ein verstecktes Risiko
- **Client-Storage** ist unsicher fuer sicherheitsrelevante Zustands-
  informationen; der Server muss die Autoriti bleiben

**Kernkonzept zum Merken:** TypeScript ist ein Compile-Zeit-Werkzeug.
Prototype Pollution, XSS, ReDoS und Injection-Angriffe sind Laufzeit-
Phaenomene. Diese Welten ueberschneiden sich nicht — deshalb muss
Sicherheit auf beiden Ebenen gedacht werden.

---

> **Pausenpunkt** — Du hast die JavaScript-Fallen kennengelernt, die
> TypeScript blind bleiben. Das ist kein Versagen von TypeScript —
> es war nie dafuer designed.
>
> Weiter geht es mit: [Sektion 04: Runtime-Validierung als Schutz](./04-runtime-validierung-als-schutz.md)
