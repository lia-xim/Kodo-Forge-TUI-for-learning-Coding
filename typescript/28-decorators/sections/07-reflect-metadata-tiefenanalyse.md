# Sektion 7: Reflect Metadata — Tiefenanalyse

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [06 - Praxis: Angular und NestJS](./06-praxis-angular-nestjs.md)
> Naechste Sektion: — (Ende der Lektion 28)

---

## Was du hier lernst

- Warum Angular's Dependency Injection **keine Magie ist** — und wie `emitDecoratorMetadata` den Trick erklaert
- Was die drei automatisch generierten Metadaten-Keys `design:type`, `design:paramtypes` und `design:returntype` bedeuten
- Wie man eigene Metadaten **schreibt, liest und loescht** mit der Reflect API
- Warum `emitDecoratorMetadata` experimentell ist und was die **Stage-3-Alternative** bringt

---

## Geschichte: Die Magie hinter @Injectable()
<!-- section:summary -->
Du kennst es aus deinem Angular-Projekt: Du schreibst `@Injectable()` ueber einen Service, gibst den `HttpClient` im Konstruktor an — und Angular l...

<!-- depth:standard -->
Du kennst es aus deinem Angular-Projekt: Du schreibst `@Injectable()` ueber einen Service, gibst den `HttpClient` im Konstruktor an — und Angular liefert automatisch die richtige Instanz. Aber woher weiss Angular, **was** injiziert werden soll?

```typescript
@Injectable()
class UserService {
  constructor(private http: HttpClient) {}
  // Woher weiss Angular: "http braucht eine HttpClient-Instanz"?
}
```

Die naheliegende Antwort waere: Angular liest den Quellcode. Aber das stimmt nicht — der TypeScript-Compiler entfernt alle Typ-Annotationen vor der Laufzeit (Type Erasure, Sektion 1 von Lektion 2). Zur Laufzeit gibt es kein `HttpClient` mehr, nur noch JavaScript.

> **Feature Origin Story: Ein Problem, das TypeScript selbst loesen wollte**
>
> 2015 arbeiteten das Angular-Team und das TypeScript-Team eng zusammen.
> Angular 2 sollte Dependency Injection ueber Konstruktor-Typen unterstuetzen —
> aber TypeScript's Type Erasure machte das unmoeglich. Die Loesung: TypeScript
> bekommt ein **optionales Feature**, das vor dem Loeschen der Typen deren
> Informationen als JavaScript-Metadaten speichert.
>
> Das Ergebnis war `emitDecoratorMetadata: true` in `tsconfig.json` — ein
> experimenteller Schalter, der TypeScript anweist, Typ-Informationen nicht
> einfach zu loeschen, sondern sie als Laufzeit-Metadaten zu konservieren.
> Gleichzeitig gab es keinen nativen Browser-Standard dafuer, also entstand
> das `reflect-metadata` Polyfill — eine Bibliothek, die eine geplante
> (aber nie finalisierte) Reflect-Erweiterung des Web-Standards implementiert.
>
> Angular nutzt diesen Mechanismus seit 2016. NestJS folgte kurz danach.
> Beide Frameworks haengen bis heute von diesem experimentellen Feature ab.

Die Antwort auf das Raesel: TypeScript emittiert die Typ-Informationen **vor** dem Loeschen als Metadaten — und Angular liest sie zur Laufzeit zurueck.

---

<!-- /depth -->
## Setup: Was du benoetigt
<!-- section:summary -->
Damit das funktioniert, braucht es zwei Dinge:

<!-- depth:standard -->
Damit das funktioniert, braucht es zwei Dinge:

```typescript
// tsconfig.json — beide Optionen MUESSEN aktiv sein:
{
  "compilerOptions": {
    "experimentalDecorators": true,   // Decorators aktivieren (Sektion 1-4)
    "emitDecoratorMetadata": true     // Typ-Infos als Metadaten emittieren
  }
}

// Einstiegspunkt der Anwendung (main.ts o.ae.):
import "reflect-metadata";  // Polyfill muss als ERSTES importiert werden!
// npm install reflect-metadata

// Angular importiert den Polyfill automatisch in polyfills.ts
// NestJS importiert ihn in main.ts
// Eigene Projekte: import ganz oben in der Hauptdatei
```

Ohne `reflect-metadata` wuerde `Reflect.getMetadata(...)` nicht existieren — der Polyfill stellt die API bereit.

---

<!-- /depth -->
## Die drei automatisch generierten Metadaten-Keys
<!-- section:summary -->
Wenn `emitDecoratorMetadata: true` aktiv ist, emittiert TypeScript bei **jeder dekorierten Klasse oder Methode** automatisch bis zu drei Metadaten-...

<!-- depth:standard -->
Wenn `emitDecoratorMetadata: true` aktiv ist, emittiert TypeScript bei **jeder dekorierten Klasse oder Methode** automatisch bis zu drei Metadaten-Eintraege:

```
"design:type"        Der Typ der Property oder des Parameters selbst
"design:paramtypes"  Array aller Konstruktor-Parameter-Typen (als Klassen)
"design:returntype"  Der Rueckgabetyp einer dekorierten Methode
```

**Wichtig:** Diese Metadaten werden NUR emittiert, wenn mindestens ein Decorator auf der Klasse, Methode oder Property vorhanden ist. Ohne Decorator — kein Emit.

---

<!-- /depth -->
## Wie Angular DI den Mechanismus nutzt
<!-- section:summary -->
Jetzt wird die Angular-Magie erklaerbar. Schauen wir uns an, was TypeScript tatsaechlich in JavaScript uebersetzt:

<!-- depth:standard -->
Jetzt wird die Angular-Magie erklaerbar. Schauen wir uns an, was TypeScript tatsaechlich in JavaScript uebersetzt:

```typescript annotated
// Was du schreibst:
@Injectable()
class UserService {
  constructor(
    private http: HttpClient,   // ← TypeScript merkt sich: HttpClient
    private logger: LogService  // ← TypeScript merkt sich: LogService
  ) {}
}

// Was TypeScript als JavaScript-Output generiert (vereinfacht):
UserService = __decorate(
  [
    Injectable(),
    // ↓ DAS emittiert emitDecoratorMetadata automatisch:
    __metadata("design:paramtypes", [HttpClient, LogService])
  ],
  UserService
);
// Die Konstruktor-Typen werden als Klassen-Referenzen gespeichert!
// HttpClient und LogService existieren zur Laufzeit als Klassen → kein Erasure

// Angular's DI liest das dann so:
const paramTypes = Reflect.getMetadata("design:paramtypes", UserService);
// → [HttpClient, LogService]

// Angular hat jetzt die Tokens und kann injizieren:
const httpInstance = injector.get(HttpClient);
const loggerInstance = injector.get(LogService);
new UserService(httpInstance, loggerInstance);
// ← DAS ist die "Magie" — in Wirklichkeit: Metadaten-Lookup
```

> 🧠 **Erklaere dir selbst:** Warum funktioniert dieser Mechanismus nur mit
> Klassen als Parameter-Typen, nicht mit Interfaces oder primitiven Typen?
>
> **Kernpunkte:** Klassen existieren zur Laufzeit als Objekte (kein Erasure) |
> Interfaces werden komplett geloescht (Type Erasure) — `design:paramtypes`
> koennte den Typ nicht speichern | Primitive wie `string` oder `number`
> wuerden als eingebaute Konstruktoren gespeichert, nicht als Token |
> Deshalb braucht Angular's DI fuer nicht-Klassen-Tokens `@Inject(TOKEN)`

---

<!-- /depth -->
## Experiment-Box: Eigene Metadaten schreiben und lesen
<!-- section:summary -->
Das Interessante an der Reflect API ist, dass du eigene Metadaten-Keys definieren kannst — unabhaengig von den `design:*`-Keys, die TypeScript auto...

<!-- depth:standard -->
Das Interessante an der Reflect API ist, dass du eigene Metadaten-Keys definieren kannst — unabhaengig von den `design:*`-Keys, die TypeScript automatisch setzt.

```typescript
import "reflect-metadata";

// --- Eigener Metadaten-Key fuer Berechtigungen ---
const PERMISSION_KEY = Symbol("permission");  // Symbol verhindert Key-Konflikte

function RequiresPermission(permission: string) {
  return function (target: any, methodName: string): void {
    Reflect.defineMetadata(PERMISSION_KEY, permission, target, methodName);
    // ← Schreibt: "Fuer diese Methode wird permission X benoetigt"
  };
}

function getRequiredPermission(instance: any, methodName: string): string | undefined {
  return Reflect.getMetadata(PERMISSION_KEY, Object.getPrototypeOf(instance), methodName);
  // ← Liest die Metadaten zur Laufzeit aus
}

// Anwendung:
class AdminController {
  @RequiresPermission("admin:read")
  getUsers(): void { /* ... */ }

  @RequiresPermission("admin:write")
  deleteUser(id: string): void { /* ... */ }

  listPublic(): void { /* keine Berechtigung noetig */ }
}

// Beispiel: Vor dem Aufruf pruefen
function callWithAuth(instance: any, method: string, userRole: string): void {
  const required = getRequiredPermission(instance, method);
  if (required && userRole !== required) {
    throw new Error(`Keine Berechtigung: ${required} benoetigt`);
  }
  (instance as any)[method]();
}

const ctrl = new AdminController();
callWithAuth(ctrl, "getUsers", "admin:read");   // OK
callWithAuth(ctrl, "deleteUser", "user");        // wirft Error
callWithAuth(ctrl, "listPublic", "guest");       // OK (kein PERMISSION_KEY)
```

Dieses Muster ist exakt das, was NestJS' `@Roles()`-Decorator intern tut — du hast es jetzt von Grund auf nachgebaut.

> 💭 **Denkfrage:** Warum liest Angular `design:paramtypes` auf der **Klasse selbst**
> (`Reflect.getMetadata(..., UserService)`) und nicht auf dem Prototype?
>
> **Antwort:** Auf der Klasse direkt bekommt man die **Konstruktor-Parameter**.
> Auf dem Prototype bekommt man die Parameter einzelner Methoden. Angular
> braucht die Konstruktor-Abhaengigkeiten fuer DI — daher kein `.prototype`.

---

> ⚡ **In deinem Angular-Projekt** begegnest du der Reflect API indirekt staendig.
> Jedes Mal wenn Angular einen Service instanziert, liest es `design:paramtypes`
> und loest die Abhaengigkeiten auf. Das macht die Dependency Injection so
> maechtig: Sie muss die Klassen nicht kennen — die Klassen beschreiben sich
> selbst durch Metadaten.
>
> ```typescript
> // Angular's InjectionToken ist die Antwort auf das Interface-Problem:
> const API_URL = new InjectionToken<string>('API_URL');
>
> @Injectable()
> class DataService {
>   constructor(
>     private http: HttpClient,        // ← Klasse: design:paramtypes speichert HttpClient
>     @Inject(API_URL) private url: string  // ← kein Klassen-Typ: @Inject gibt den Token manuell
>   ) {}
> }
> // Ohne @Inject wuesste Angular nicht, welches Token fuer 'string' benutzt werden soll
> ```

---

<!-- /depth -->
## Grenzen und Warnungen
<!-- section:summary -->
`emitDecoratorMetadata` ist seit Jahren "experimentell" — und das aus gutem Grund. Es gibt wichtige Einschraenkungen:

<!-- depth:standard -->
`emitDecoratorMetadata` ist seit Jahren "experimentell" — und das aus gutem Grund. Es gibt wichtige Einschraenkungen:

```typescript
// GRENZE 1: Interfaces werden geloescht — kein Metadaten-Emit
interface ApiConfig { url: string; }

@Injectable()
class ConfigService {
  constructor(private config: ApiConfig) {}
  // design:paramtypes speichert: Object (nicht ApiConfig!)
  // Interface-Typ ist zur Laufzeit nicht vorhanden → Fallback auf Object
}

// GRENZE 2: Union-Types werden zu Object
@Injectable()
class Broken {
  constructor(private val: string | number) {}
  // design:paramtypes: Object — Union-Typ kann nicht als Token dienen
}

// GRENZE 3: Optionale Typen verlieren ihre Information
@Injectable()
class Partial {
  constructor(private opt?: HttpClient) {}
  // design:paramtypes: HttpClient — das Fragezeichen verschwindet
  // Angular sieht keinen Unterschied zu einem Pflichtparameter
}
```

### Stage-3-Decorators und die neue Metadaten-API

Die Stage-3-Decorators (Sektion 5 dieser Lektion) haben keine `emitDecoratorMetadata`-Unterstuetzung — das ist eine bewusste Entscheidung des TC39-Komitees. Stattdessen gibt es ein **separates TC39-Proposal** fuer Decorator Metadata:

```typescript
// Stage-3 Decorator Metadata (TC39 Proposal — noch experimentell):
function Injectable(value: unknown, context: ClassDecoratorContext): void {
  context.metadata["injectable"] = true;
  // ← context.metadata ist ein Objekt, das der Spec definiert
  // KEIN Reflect.defineMetadata — eine eigenstaendige API
}

// Zugriff ueber Symbol.metadata:
const meta = UserService[Symbol.metadata];
console.log(meta?.["injectable"]); // true

// KEIN automatisches design:paramtypes-Emitting!
// Frameworks muessen Parameter-Typen auf anderem Weg ermitteln
// (z.B. explizite Token-Listen oder Code-Generierung)
```

**Was das fuer dich bedeutet:** Angular hat bereits angekuendigt, langfristig
auf Stage-3-Decorators umzusteigen. Bis dahin bleibt `emitDecoratorMetadata`
der Standard im Angular-Oekosystem. NestJS plant aehnliche Migrationen. Wenn
du heute neue eigene Decorator-Infrastruktur baust, halte das Design so, dass
du spaeter zwischen beiden APIs wechseln kannst.

> 🧠 **Erklaere dir selbst:** Warum hat das TC39-Komitee beschlossen, KEINE
> automatischen `design:paramtypes`-Metadaten in die Stage-3-Spec aufzunehmen?
>
> **Kernpunkte:** Type Erasure ist ein Kernprinzip von TypeScript |
> Automatisches Emittieren koppelt TypeScript-Typen eng an die Laufzeit |
> Das verletzt die Separation of Concerns (Typsystem vs. Laufzeitverhalten) |
> Explizite Token (wie Angular's `InjectionToken`) sind transparenter und
> sicherer | Die neue API gibt Frameworks mehr Kontrolle ueber das Was und Wie

---

<!-- /depth -->
## Was du gelernt hast

- **`emitDecoratorMetadata: true`** weist TypeScript an, Typ-Informationen nicht zu loeschen, sondern sie vor der Ausfuehrung als JavaScript-Metadaten zu emittieren
- **`reflect-metadata`** ist ein Polyfill der die `Reflect.defineMetadata / getMetadata`-API bereitstellt — ohne ihn existiert die API nicht
- TypeScript emittiert automatisch **drei Keys**: `design:type` (Property-Typ), `design:paramtypes` (Konstruktor/Methoden-Parameter), `design:returntype` (Rueckgabetyp)
- **Angular's DI** liest `design:paramtypes` aus, um zu wissen, welche Klassen in den Konstruktor injiziert werden sollen — keine Magie, reines Metadaten-Lookup
- Eigene Metadaten mit `Reflect.defineMetadata / getMetadata` erlauben dasselbe Muster fuer eigene Infrastruktur (Guards, Permissions, Validation)
- **Grenzen:** Interfaces, Union-Types und optionale Typen verlieren Praezision bei der Uebertragung in Metadaten
- **Stage-3-Decorators** bringen eine neue, eigenstaendige Metadaten-API ueber `context.metadata` und `Symbol.metadata` — ohne automatisches `design:*`-Emitting

**Kernkonzept zum Merken:** `emitDecoratorMetadata` ist die Bruecke zwischen
TypeScript's Compilezeit-Typen und der Laufzeit. Es ist kein Feature das man
im Alltag direkt nutzt — aber es erklaert, warum Angular's DI funktioniert und
warum Interfaces keine DI-Tokens sein koennen. Wer dieses Fundament versteht,
debuggt Angular-DI-Fehler in Sekunden statt Stunden.

---

> **Pausenpunkt** — Das war die letzte Sektion von Lektion 28.
> Du hast Decorators von den Grundlagen bis zur internen Metadaten-Infrastruktur
> durchdrungen. Lass die Konzepte kurz sacken, bevor du weitermachst.
>
> **Lektion 28 abgeschlossen.** Weiter geht es mit Lektion 29.
