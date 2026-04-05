# Sektion 4: Parameter Decorators

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Method und Property Decorators](./03-method-property-decorators.md)
> Naechste Sektion: [05 - Stage 3 vs Legacy](./05-stage3-vs-legacy.md)

---

## Was du hier lernst

- Wie **Parameter Decorators** funktionieren und was sie NICHT koennen
- Warum Parameter Decorators fast immer mit **Reflect Metadata** kombiniert werden
- Wie Angular's **Dependency Injection** (`@Inject()`) intern funktioniert
- Warum Stage 3 Decorators **keine Parameter Decorators** haben

---

## Hintergrund: Dependency Injection und Decorators

> **Feature Origin Story: @Inject und Reflect Metadata**
>
> Als das Angular-Team Dependency Injection (DI) entwarf, brauchten sie
> einen Mechanismus um Konstruktor-Parameter zu annotieren: "Dieser
> Parameter soll den UserService injizieren, jener den HttpClient."
>
> Die Loesung: Parameter Decorators + `emitDecoratorMetadata`.
> TypeScript kann die **Typ-Information** der Parameter als Metadaten
> emittieren (ueber die `reflect-metadata`-Polyfill-Bibliothek).
> Angular liest diese Metadaten und weiss: "Der erste Parameter ist
> vom Typ UserService → ich injiziere die UserService-Instanz."
>
> Das ist maechtig, aber es hat einen Preis: Die gesamte DI-Magie
> haengt an einem **experimentellen** TypeScript-Feature
> (`emitDecoratorMetadata`) das es in Stage 3 nicht gibt. Das ist
> einer der Gruende warum Angular den Wechsel zu Stage 3 Decorators
> sorgfaeltig planen muss.

---

## Parameter Decorator: Legacy-Syntax

```typescript annotated
// Parameter Decorator — drei Argumente:
function Inject(token: string) {
  return function (
    target: Object,         // Prototyp der Klasse (oder Konstruktor bei constructor-Params)
    propertyKey: string | undefined,  // Name der Methode (undefined bei Konstruktor)
    parameterIndex: number  // Position des Parameters (0, 1, 2...)
  ): void {
    // ^ Parameter Decorators GEBEN NICHTS ZURUECK!
    //   Sie koennen den Parameter nicht aendern.
    //   Sie koennen nur METADATEN speichern.

    // Metadaten speichern:
    const existingTokens: Record<number, string> =
      (target as any).__inject_tokens || {};
    existingTokens[parameterIndex] = token;
    (target as any).__inject_tokens = existingTokens;
  };
}

class UserController {
  constructor(
    @Inject("UserService") private userService: any,
    // ^ parameterIndex = 0, token = "UserService"
    @Inject("Logger") private logger: any
    // ^ parameterIndex = 1, token = "Logger"
  ) {}
}

// Metadaten auslesen:
const tokens = (UserController as any).__inject_tokens;
// { 0: "UserService", 1: "Logger" }
// ^ Ein DI-Container kann das nutzen um die richtigen Instanzen zu injizieren
```

> 🧠 **Erklaere dir selbst:** Warum koennen Parameter Decorators den
> Wert des Parameters nicht aendern? Was koennen sie stattdessen?
>
> **Kernpunkte:** Parameter Decorators laufen BEVOR der Konstruktor aufgerufen wird |
> Sie haben keinen Zugriff auf den Wert (der existiert noch nicht) |
> Sie koennen nur Metadaten UEBER den Parameter speichern |
> Die Metadaten werden spaeter von einem Framework gelesen (DI-Container)

---

## emitDecoratorMetadata: TypeScript's Geheimwaffe

```typescript annotated
// tsconfig.json:
// {
//   "compilerOptions": {
//     "experimentalDecorators": true,
//     "emitDecoratorMetadata": true  ← DAS ist die Magie!
//   }
// }

// Mit emitDecoratorMetadata generiert TypeScript:
import "reflect-metadata";
// ^ Polyfill fuer Reflect.defineMetadata / Reflect.getMetadata

@Injectable()
class UserService {
  constructor(
    private http: HttpClient,
    // ^ TypeScript emittiert: Reflect.metadata("design:paramtypes", [HttpClient, Logger])
    private logger: Logger
  ) {}
}

// Angular kann jetzt die Typen OHNE @Inject() herausfinden:
const paramTypes = Reflect.getMetadata("design:paramtypes", UserService);
// [HttpClient, Logger]
// ^ Angular weiss: Konstruktor braucht HttpClient + Logger → injizieren!

// DAS ist warum Angular in den meisten Faellen KEIN @Inject() braucht:
// emitDecoratorMetadata liefert die Typ-Information automatisch.
// @Inject() ist nur noetig wenn der Typ nicht eindeutig ist
// (z.B. bei Interfaces oder Tokens).
```

> 💭 **Denkfrage:** `emitDecoratorMetadata` emittiert Typ-Information
> zur Laufzeit. Aber TypeScript hat Type Erasure — Typen verschwinden
> zur Laufzeit. Wie passt das zusammen?
>
> **Antwort:** emitDecoratorMetadata ist eine AUSNAHME von Type Erasure!
> TypeScript generiert zusaetzlichen JavaScript-Code der die Typ-
> Informationen als Metadaten speichert. Es ist einer der wenigen Faelle
> wo TypeScript Laufzeit-Code aus Typ-Informationen generiert. Deshalb
> funktioniert es nur mit **Klassen** (die zur Laufzeit existieren),
> nicht mit Interfaces (die zur Laufzeit verschwinden).

---

## Angular's DI im Detail

```typescript annotated
// Angular's @Injectable() — ein Class Decorator:
@Injectable({
  providedIn: "root",
  // ^ Angular weiss: Diesen Service global bereitstellen
})
class UserService {
  constructor(
    private http: HttpClient
    // ^ emitDecoratorMetadata → Angular kennt den Typ
  ) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>("/api/users");
  }
}

// WANN braucht man @Inject()?
@Injectable()
class AppService {
  constructor(
    @Inject("API_URL") private apiUrl: string
    // ^ string ist ein primitiver Typ — Angular kann nicht wissen
    //   WELCHER string gemeint ist. @Inject(TOKEN) ist noetig.
  ) {}
}

// Angular's InjectionToken:
const API_URL = new InjectionToken<string>("API_URL");
// ^ Token-basierte Injektion statt typ-basierter
```

> **Experiment:** Schau in einem Angular-Projekt in die
> kompilierte JavaScript-Ausgabe (dist/). Suche nach
> `__decorate` und `__metadata`:
>
> ```javascript
> // Kompilierte Ausgabe (vereinfacht):
> UserService = __decorate([
>   Injectable({ providedIn: 'root' }),
>   __metadata("design:paramtypes", [HttpClient])
>   //          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
>   // DAS ist emitDecoratorMetadata in Aktion!
> ], UserService);
> ```
>
> Die `__metadata`-Zeile existiert NUR wenn `emitDecoratorMetadata: true`
> gesetzt ist. Sie speichert die Konstruktor-Parameter-Typen als
> Laufzeit-Information.

---

## NestJS: Parameter Decorators fuer HTTP

```typescript annotated
// NestJS nutzt Parameter Decorators intensiv:
@Controller("users")
class UsersController {
  @Get(":id")
  getUser(
    @Param("id") id: string,
    // ^ Parameter Decorator: Extrahiert Route-Parameter "id"
    @Query("include") include?: string,
    // ^ Parameter Decorator: Extrahiert Query-Parameter "include"
    @Headers("authorization") auth?: string,
    // ^ Parameter Decorator: Extrahiert Header "authorization"
    @Body() body?: CreateUserDto
    // ^ Parameter Decorator: Extrahiert Request-Body
  ): User {
    return this.userService.findById(id);
  }
}

// Intern speichern diese Decorators Metadaten:
// "Parameter 0 → Route-Param 'id'"
// "Parameter 1 → Query-Param 'include'"
// NestJS liest die Metadaten und injiziert die richtigen Werte.
```

> ⚡ **In deinem Angular-Projekt** nutzt du Parameter Decorators
> hauptsaechlich fuer DI:
>
> ```typescript
> @Component({ ... })
> class DashboardComponent {
>   constructor(
>     private userService: UserService,
>     // ^ emitDecoratorMetadata → Angular kennt den Typ
>     private router: Router,
>     @Optional() private analytics?: AnalyticsService
>     // ^ @Optional() = Parameter Decorator!
>     //   Wenn kein Provider existiert → null statt Error
>   ) {}
> }
> ```
>
> In React gibt es keine Parameter Decorators — React's DI basiert
> auf Context und Hooks, nicht auf Klassen-Konstruktoren.

---

## Was du gelernt hast

- Parameter Decorators koennen **nur Metadaten speichern** — den Wert nicht aendern
- **emitDecoratorMetadata** emittiert Typ-Information als Laufzeit-Metadaten (Ausnahme von Type Erasure!)
- Angular's DI nutzt emitDecoratorMetadata um Konstruktor-Parameter-Typen zu erkennen
- `@Inject()` ist nur noetig wenn der Typ nicht eindeutig ist (primitive Typen, Tokens)
- **Stage 3 Decorators haben KEINE Parameter Decorators** — das wird zum Problem

> 🧠 **Erklaere dir selbst:** Warum ist `emitDecoratorMetadata` eine
> Ausnahme von TypeScript's Type Erasure? Was generiert es konkret?
>
> **Kernpunkte:** Normalerweise: Alle Typen werden entfernt |
> emitDecoratorMetadata: Generiert Reflect.metadata()-Aufrufe |
> Die Typ-Information wird als WERT gespeichert (nicht als Typ) |
> Funktioniert nur mit Klassen (existieren zur Laufzeit) |
> Interfaces werden zu Object (da sie zur Laufzeit nicht existieren)

**Kernkonzept zum Merken:** Parameter Decorators = Metadaten, kein Verhalten.
Sie annotieren Parameter, damit ein Framework (Angular, NestJS) weiss
was es injizieren soll. Die echte Magie steckt in `emitDecoratorMetadata`.

---

> **Pausenpunkt** -- Du verstehst jetzt alle Decorator-Typen.
> Naechstes Thema: Stage 3 vs Legacy — der grosse Vergleich.
>
> Weiter geht es mit: [Sektion 05: Stage 3 vs Legacy](./05-stage3-vs-legacy.md)
