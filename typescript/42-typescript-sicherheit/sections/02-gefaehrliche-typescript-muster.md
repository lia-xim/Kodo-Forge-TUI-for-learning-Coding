# Sektion 2: Gefaehrliche TypeScript-Muster

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Das Sicherheits-Paradox](./01-das-sicherheits-paradox.md)
> Naechste Sektion: [03 - JavaScript-Fallen in TypeScript](./03-javascript-fallen-in-typescript.md)

---

## Was du hier lernst

- Die vier gefahrlichsten TypeScript-Muster, die echte Sicherheitsprobleme verursachen
- Wie `as`, `!`, `any` und `Object.assign` das Typsystem aushebeln
- Wie jedes Muster in einem realen Angular-Projekt aussehen koennte
- Was die sicheren Alternativen sind

---

## Hintergrund: Die Entstehung der "Escape Hatches"

Als Anders Hejlsberg und das TypeScript-Team 2012 TypeScript designten,
standen sie vor einem Dilemma: JavaScript-Code ist oft **dynamisch** —
Typen werden zur Laufzeit berechnet, Objekte werden zusammengemergt,
externe Daten kommen ohne Garantien.

Um die Migration von bestehenden JavaScript-Projekten zu ermoeglichen,
bauten sie sogenannte **Escape Hatches** ein — Wege, das Typsystem zu
umgehen wenn es "im Weg steht". `as`, `!`, `any` — all das sind bewusste
Designentscheidungen fuer Migrationsszenarien und Grenzfaelle.

Das Problem: Diese Escape Hatches sind so bequem, dass sie im Alltag
verwendet werden. Statt das Typsystem zu reparieren (indem man echte
Validierung schreibt), sagt man einfach: "Vertrau mir, Compiler."

> **Die goldene Regel:** Jedes `as`, jedes `!`, jedes `any` im Code ist
> eine Stelle, an der **du die Verantwortung vom Compiler uebernimmst**.
> Du versprichst etwas, das nicht verifiziert wird.

---

## Muster 1: `as` Type Assertion — das stille Luegen

Type Assertions mit `as` sagen dem Compiler: "Ich weiss es besser."
Der Compiler glaubt dir. Blind.

```typescript annotated
// SZENARIO: Angular-Formular verarbeiten
interface BenutzerFormular {
  email: string;
  passwort: string;
  alter: number;  // muss >= 18 sein
}

// GEFAEHRLICH: as ohne Validierung
@Component({ /* ... */ })
export class RegistrierungComponent {
  form = new FormGroup({
    email: new FormControl(''),
    passwort: new FormControl(''),
    alter: new FormControl(''),
  });

  onSubmit(): void {
    const daten = this.form.value as BenutzerFormular;
    // ^ TypeScript: "Alles klar, ist ein BenutzerFormular!"
    // Realitaet 1: alter ist ein string (FormControl gibt strings zurueck)
    //             nicht number — TypeScript prueft es nicht nach dem as-Cast
    // Realitaet 2: email koennte leer sein (FormControl-Default ist '')
    // Realitaet 3: alter koennte "15" sein — Altersvalidierung fehlt komplett
    this.userService.registrieren(daten);
    // Der Service erwartet alter: number, bekommt "15" (string)
    // Kann zu falschen Berechnungen fuehren, kein Fehler
  }
}

// SICHER: Explizite Validierung statt as
onSubmitSicher(): void {
  const raw = this.form.value;
  if (!raw.email || !raw.passwort || !raw.alter) {
    throw new Error('Formular unvollstaendig');
  }
  const alter = Number(raw.alter);
  if (isNaN(alter) || alter < 18) {
    throw new Error('Ungueltige Alterseingabe');
  }
  // Jetzt erst zusammenbauen — kein as-Cast!
  const daten: BenutzerFormular = {
    email: raw.email,
    passwort: raw.passwort,
    alter,
  };
  this.userService.registrieren(daten);
}
```

**Besonders gefaehrlich bei Branded Types:**

```typescript annotated
// Branded Type fuer sichere IDs
type UserId = string & { readonly _brand: 'UserId' };

// GEFAEHRLICH: Brand per as vergeben ohne Validierung
function getUser(id: string): User {
  const userId = id as UserId;    // Kein Schutz! Jeder string wird akzeptiert
  return userRepository.find(userId);
  // SQL Injection? Prototype Pollution? TypeScript sagt nichts.
}

// SICHER: Brand nur nach Validierung vergeben
function asUserId(raw: string): UserId {
  if (!/^user-[a-z0-9]{8}$/.test(raw)) {
    throw new Error(`Ungueltige User-ID: ${raw}`);
  }
  return raw as UserId;  // as ist hier OK — wir haben VORHER validiert
}
```

---

## Muster 2: Non-null Assertion `!` — der optimistische Crash

Das Ausrufezeichen sagt: "Ich verspreche, das ist nicht null oder undefined."
TypeScript glaubt dir. Was passiert wenn du luegst?

```typescript annotated
// SZENARIO: Angular-Template-Referenz und DOM-Zugriff
@Component({
  template: `<canvas #myCanvas></canvas>`
})
export class DiagrammComponent implements OnInit {
  @ViewChild('myCanvas') canvas!: ElementRef<HTMLCanvasElement>;
  // ^ Das ! hier ist notwendig (Angular initialisiert es erst in ngAfterViewInit)
  //   Aber es ist ein "falsches Versprechen" in ngOnInit

  ngOnInit(): void {
    // GEFAEHRLICH: canvas ist zu diesem Zeitpunkt NOCH null!
    const ctx = this.canvas.nativeElement.getContext('2d')!;
    // ^ Zwei ! hintereinander — doppeltes Optimismus-Fatale
    // this.canvas ist undefined → TypeError: Cannot read properties of undefined
    // Der ! verhindert nur den Compile-Fehler, nicht den Runtime-Crash
    ctx.fillRect(0, 0, 100, 100);  // Explodiert hier
  }

  // SICHER: Lifecycle korrekt beachten
  ngAfterViewInit(): void {
    const ctx = this.canvas?.nativeElement?.getContext('2d');
    if (!ctx) {
      console.error('Canvas-Kontext nicht verfuegbar');
      return;
    }
    ctx.fillRect(0, 0, 100, 100);  // Sicher
  }
}
```

**Das Kettencrash-Muster — besonders heimtuckisch:**

```typescript annotated
interface Benutzer {
  profil?: {
    avatar?: {
      url: string;
    };
  };
}

// GEFAEHRLICH: Kettenweise ! verwenden
function getAvatarUrl(user: Benutzer): string {
  return user.profil!.avatar!.url;
  // ^ Wenn profil undefined → TypeError: Cannot read properties of undefined ('avatar')
  // Stacktrace zeigt diese Zeile — aber kein Hinweis WAS null war
  // In Angular-Templates noch schlimmer: weisses Bild statt Fehlermeldung
}

// SICHER: Optional Chaining mit Fallback
function getAvatarUrlSicher(user: Benutzer): string {
  return user.profil?.avatar?.url ?? '/assets/default-avatar.png';
}
```

---

## Muster 3: `any` in kritischen Pfaden

`any` ist ansteckend. Ein einziges `any` kann sich durch das gesamte
Typsystem verbreiten und Garantien in einem ganzen Modul aufloesen.

```typescript annotated
// GEFAEHRLICH: API-Response als any behandeln
// (passiert oft bei schnellen Prototypen die in Produktion landen)
async function ladeDashboardDaten(): Promise<DashboardDaten> {
  const response = await fetch('/api/dashboard');
  const json: any = await response.json();
  // ^ json ist any — ab hier gibt es KEINE Typsicherheit mehr

  return {
    nutzerAnzahl: json.users.count,
    // ^ Wenn json.users undefined: TypeError — kein Compile-Fehler!
    umsatz: json.revenue.total * 100,
    // ^ Wenn json.revenue null: TypeError — kein Compile-Fehler!
    aktiveKurse: json.courses.filter((c: any) => c.active),
    // ^ any pflanzt sich fort: c ist any, Tippfehler werden nicht erkannt
  };
}

// GEFAEHRLICH: any als "universeller" Funktionstyp
function verarbeite(handler: any): void {
  handler.onSuccess();   // Kein Compile-Fehler — auch wenn handler keine onSuccess-Methode hat
  handler.onErro();      // Tippfehler (onError -> onErro) — kein Compile-Fehler!
}
```

**Die any-Ausbreitung in Angular-Services:**

```typescript annotated
// In einem Angular-Service
@Injectable({ providedIn: 'root' })
export class ApiService {
  // GEFAEHRLICH: Generische Methode mit any-Escape
  get(url: string): Observable<any> {
    return this.http.get(url);
    // ^ Das any pflanzt sich in alle Caller fort
  }
}

// Im Component — Caller verliert alle Typen:
export class ProductComponent {
  produkte: any[] = [];  // any breitet sich aus!

  ngOnInit(): void {
    this.api.get('/api/products').subscribe(data => {
      this.produkte = data;  // data ist any — alle TypeScript-Vorteile weg
      this.produkte[0].preis.toFixed(2);
      // Tippfehler? Falscher Typ? Undefined? Kein Hinweis.
    });
  }
}

// SICHER: Generisches Typsystem korrekt nutzen
@Injectable({ providedIn: 'root' })
export class ApiService {
  get<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }
}
```

---

## Muster 4: Object.assign und Spread mit unbekannten Quellen

Dieses Muster ist besonders gefaehrlich, weil es harmlos aussieht und
haeufig fuer Konfigurationsmerging verwendet wird.

```typescript annotated
// SZENARIO: Benutzer-Einstellungen aus localStorage mergen
interface AppKonfiguration {
  sprache: string;
  theme: 'hell' | 'dunkel';
  schriftgroesse: number;
}

const standardKonfig: AppKonfiguration = {
  sprache: 'de',
  theme: 'hell',
  schriftgroesse: 16,
};

// GEFAEHRLICH: Unvalidierter Input direkt in Object.assign
function ladeKonfiguration(): AppKonfiguration {
  const gespeichert = localStorage.getItem('config');
  if (!gespeichert) return standardKonfig;

  const userInput = JSON.parse(gespeichert);
  // ^ userInput ist any — JSON.parse gibt any zurueck

  return Object.assign({}, standardKonfig, userInput);
  // ^ PROTOTYPE POLLUTION MOEGLICH!
  // Wenn localStorage: '{"__proto__": {"isAdmin": true}}'
  // dann wird Object.prototype.isAdmin = true gesetzt
  // ALLE Objekte in der App haben jetzt isAdmin: true
  // TypeScript sieht keinen Fehler!
}

// SICHER: Explizites Property-Picking statt blindes Mergen
function ladeKonfigurationSicher(): AppKonfiguration {
  const gespeichert = localStorage.getItem('config');
  if (!gespeichert) return standardKonfig;

  let userInput: unknown;
  try {
    userInput = JSON.parse(gespeichert);
  } catch {
    return standardKonfig;
  }

  if (typeof userInput !== 'object' || userInput === null) {
    return standardKonfig;
  }

  // Nur bekannte Properties explizit herausziehen
  const u = userInput as Record<string, unknown>;
  return {
    sprache: typeof u['sprache'] === 'string' ? u['sprache'] : standardKonfig.sprache,
    theme: (u['theme'] === 'hell' || u['theme'] === 'dunkel') ? u['theme'] : standardKonfig.theme,
    schriftgroesse: typeof u['schriftgroesse'] === 'number' ? u['schriftgroesse'] : standardKonfig.schriftgroesse,
  };
}
```

---

> 💭 **Denkfrage:** In welchem der vier Muster hast du dich selbst schon
> ertappt? Welches kommt in deinem Angular-Projekt am haeufigsten vor?
>
> **Antwort:** Ehrlich gesagt: Alle vier kommen in fast jedem Projekt vor.
> `as` beim Formular-Processing, `!` bei ViewChild, `any` bei
> Legacy-API-Calls, `Object.assign` beim Mergen von Einstellungen. Das
> Wissen darum ist der erste Schritt — die naechsten Sektionen zeigen die
> sicheren Alternativen.

---

## Was du gelernt hast

- **`as`** ohne vorherige Validierung ist eine Luege an den Compiler — und
  der glaubt dir immer
- **`!`** (Non-null Assertion) verschiebt den Crash nur von der Compile-Zeit
  zur Laufzeit; es loest das Problem nicht
- **`any`** ist ansteckend und pflanzt sich durch das gesamte Typsystem fort;
  ein `any` kann die Typsicherheit eines ganzen Moduls vernichten
- **`Object.assign`/Spread** mit unbekannten Quellen eroeffnet Prototype
  Pollution — eine JavaScript-Schwachstelle, die TypeScript komplett unsichtbar ist
- Alle vier Muster kommen im echten Angular-Alltag vor — Erkennung ist
  der erste Schritt zur Vermeidung

> 🧠 **Erklaere dir selbst:** Warum ist `as` mit vorheriger Validierung
> akzeptabel, aber `as` ohne Validierung gefaehrlich? Wo liegt der
> genaue Unterschied?
>
> **Kernpunkte:** `as` mit Validierung: du hast die Invariante geprueft,
> der Cast widerspiegelt eine bewiesene Tatsache | `as` ohne Validierung:
> du behauptest etwas ohne Beweis | TypeScript kann nicht unterscheiden
> — deshalb liegt die Verantwortung bei dir | "Trust but verify" → "Verify
> then trust"

**Kernkonzept zum Merken:** Die vier gefaehrlichen Muster (`as`, `!`, `any`,
blindes Mergen) haben alle dasselbe Problem: Sie versprechen dem Compiler
etwas, das nicht bewiesen wird. Jedes `as` und `!` im Code ist ein TODO
fuer eine echte Validierung.

---

> **Pausenpunkt** — Du hast die vier hauptsaechlichen Gefahrenquellen
> im TypeScript-Alltag kennengelernt.
>
> Weiter geht es mit: [Sektion 03: JavaScript-Fallen in TypeScript](./03-javascript-fallen-in-typescript.md)
