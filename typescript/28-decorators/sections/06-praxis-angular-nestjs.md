# Sektion 6: Praxis — Angular und NestJS Bezuege

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [05 - Stage 3 vs Legacy](./05-stage3-vs-legacy.md)
> Naechste Sektion: — (Ende der Lektion)

---

## Was du hier lernst

- Wie Angular's Decorator-System **intern funktioniert** (@Component, @Injectable)
- Wie NestJS Decorators fuer **HTTP-APIs** verwendet
- Wie man **eigene Decorators** fuer Angular und NestJS schreibt
- Best Practices und **Anti-Patterns** bei Decorator-Nutzung

---

## Hintergrund: Frameworks und ihre Decorator-Philosophie

> **Feature Origin Story: Zwei Philosophien**
>
> Angular (2016, Google) und NestJS (2017, Kamil Mysliwiec) basieren
> beide auf TypeScript-Decorators, aber mit unterschiedlichen
> Philosophien:
>
> **Angular:** Decorators als **Deklarationen**. `@Component({...})`
> sagt "DAS ist eine Komponente mit diesen Eigenschaften". Der
> Angular-Compiler (ngc) liest die Metadaten und generiert
> optimierten Code. Decorators aendern das Verhalten nicht direkt —
> sie beschreiben es.
>
> **NestJS:** Decorators als **Konfiguration und Transformation**.
> `@Controller('users')` konfiguriert das Routing, `@UseGuards()`
> fuegt Middleware hinzu, `@Param('id')` transformiert den Request.
> Decorators sind hier aktive Teilnehmer im Request-Lifecycle.
>
> Beide Ansaetze zeigen: Decorators sind flexibel genug fuer
> grundverschiedene Architekturen.

---

## Angular: Eigene Decorators schreiben

### Custom Property Decorator: @AutoUnsubscribe

```typescript annotated
// Ein haeufiges Problem in Angular: Memory Leaks durch Subscriptions
// Loesung: Ein Decorator der alle Subscriptions automatisch abmeldet

import { Subscription } from "rxjs";

function AutoUnsubscribe(constructor: Function): void {
  const original = constructor.prototype.ngOnDestroy;
  // ^ Originale ngOnDestroy-Methode sichern (falls vorhanden)

  constructor.prototype.ngOnDestroy = function (): void {
    // Alle Properties durchsuchen die Subscriptions sind:
    for (const key of Object.keys(this)) {
      const prop = this[key];
      if (prop instanceof Subscription) {
        prop.unsubscribe();
        console.log(`${constructor.name}: ${key} unsubscribed`);
      }
    }

    // Originale ngOnDestroy aufrufen falls vorhanden:
    if (original) {
      original.apply(this);
    }
  };
}

@Component({ selector: "app-dashboard", template: "..." })
@AutoUnsubscribe
class DashboardComponent implements OnInit {
  private dataSub!: Subscription;
  private timerSub!: Subscription;

  ngOnInit(): void {
    this.dataSub = this.dataService.getData().subscribe(/* ... */);
    this.timerSub = interval(5000).subscribe(/* ... */);
    // ^ Beide Subscriptions werden automatisch bei ngOnDestroy abgemeldet!
  }
}
```

> 🧠 **Erklaere dir selbst:** Warum ist ein @AutoUnsubscribe-Decorator
> besser als manuelles Unsubscribe in ngOnDestroy?
>
> **Kernpunkte:** DRY: Kein Copy-Paste in jeder Komponente |
> Vergessen unmoeglich: Decorator findet ALLE Subscriptions |
> Deklarativ: @AutoUnsubscribe sagt was passiert, nicht wie |
> Aber: Angular empfiehlt heute takeUntilDestroyed() oder async pipe

---

### Custom Method Decorator: @Debounce

```typescript annotated
function Debounce(delayMs: number) {
  return function (
    target: Object,
    key: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    let timer: ReturnType<typeof setTimeout>;
    const original = descriptor.value;

    descriptor.value = function (...args: any[]) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        original.apply(this, args);
      }, delayMs);
    };

    return descriptor;
  };
}

@Component({ selector: "app-search", template: "..." })
class SearchComponent {
  @Debounce(300)
  onSearchInput(query: string): void {
    // ^ Wird erst 300ms nach dem letzten Tastenanschlag aufgerufen
    this.searchService.search(query).subscribe(results => {
      this.results = results;
    });
  }
}
```

> 💭 **Denkfrage:** Der @Debounce-Decorator funktioniert, aber hat ein
> Problem mit Angular's Change Detection. Welches?
>
> **Antwort:** `setTimeout` laeuft ausserhalb von Angular's Zone.
> In manchen Konfigurationen erkennt Angular die Aenderungen nach dem
> debounced Aufruf nicht. Loesung: `NgZone.run()` im Decorator oder
> besser: `debounceTime()` aus RxJS verwenden — das ist Zone-aware.

---

## NestJS: Eigene Decorators schreiben

### Custom Decorator: @Roles

```typescript annotated
import { SetMetadata } from "@nestjs/common";

// Decorator Factory die erlaubte Rollen als Metadaten setzt:
const Roles = (...roles: string[]) => SetMetadata("roles", roles);
// ^ SetMetadata ist NestJS's Helfer fuer Metadaten-Decorators

@Controller("users")
class UsersController {
  @Get()
  @Roles("admin", "manager")
  // ^ Nur Admin und Manager duerfen diese Route nutzen
  findAll(): User[] {
    return this.usersService.findAll();
  }

  @Get(":id")
  @Roles("admin", "manager", "user")
  // ^ Jeder eingeloggte User darf einzelne User sehen
  findOne(@Param("id") id: string): User {
    return this.usersService.findOne(id);
  }
}

// Guard der die Metadaten ausliest:
@Injectable()
class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>("roles", context.getHandler());
    // ^ Liest die Metadaten die @Roles gesetzt hat
    if (!roles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return roles.includes(user.role);
    // ^ Prueft ob der User die richtige Rolle hat
  }
}
```

> **Experiment:** Schreibe einen eigenen NestJS-Decorator `@Public()`:
>
> ```typescript
> // @Public() markiert eine Route als oeffentlich (kein Auth noetig)
> const IS_PUBLIC_KEY = "isPublic";
> const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
>
> // Im Guard:
> const isPublic = this.reflector.getAllAndOverride<boolean>(
>   IS_PUBLIC_KEY,
>   [context.getHandler(), context.getClass()]
> );
> if (isPublic) return true; // Oeffentliche Route → kein Auth-Check
>
> // Verwendung:
> @Public()
> @Get("health")
> healthCheck(): string { return "OK"; }
> ```

---

## Decorator-Komposition: Mehrere Decorators kombinieren

```typescript annotated
// NestJS: Dekoratoren zu einem kombinieren
import { applyDecorators, UseGuards, SetMetadata } from "@nestjs/common";

// Custom Composed Decorator:
function AdminOnly() {
  return applyDecorators(
    SetMetadata("roles", ["admin"]),
    UseGuards(AuthGuard, RolesGuard),
    // ^ Kombiniert: Auth + Rollen-Pruefung
  );
}

// Statt:
// @UseGuards(AuthGuard, RolesGuard)
// @Roles('admin')
// Jetzt nur:
@AdminOnly()
@Get("admin-dashboard")
getDashboard(): Dashboard { /* ... */ }
```

> ⚡ **In deinem Angular-Projekt** kannst du aehnliche Komposition nutzen:
>
> ```typescript
> // Eigener Decorator der mehrere Angular-Features kombiniert:
> function PageComponent(config: {
>   title: string;
>   route: string;
> }) {
>   return function (constructor: Function): void {
>     // Metadaten fuer Routing:
>     (constructor as any).__route = config.route;
>     // Metadaten fuer Title-Service:
>     (constructor as any).__pageTitle = config.title;
>   };
> }
>
> @Component({ selector: "app-dashboard", template: "..." })
> @PageComponent({ title: "Dashboard", route: "/dashboard" })
> class DashboardComponent { /* ... */ }
> ```

---

## Anti-Patterns: Was man vermeiden sollte

```typescript annotated
// ANTI-PATTERN 1: Zu viel Logik im Decorator
function BadDecorator(constructor: Function): void {
  // 200 Zeilen Business-Logik...
  // Decorators sollten KURZ und DEKLARATIV sein!
  // Auslagern in Services/Utilities!
}

// ANTI-PATTERN 2: Decorator der globalen State veraendert
let globalCounter = 0;
function CountInstances(constructor: Function): void {
  globalCounter++; // SEITENEFFEKT! Schwer zu testen und debuggen.
}

// ANTI-PATTERN 3: Decorator der den Typ "luegt"
function AddMethod(constructor: Function): void {
  constructor.prototype.newMethod = () => {};
  // TypeScript kennt newMethod NICHT!
  // (instance as any).newMethod() — unsicher
}

// BESSER: Decorator fuer Cross-Cutting Concerns nutzen:
// ✅ Logging, Caching, Retry, Throttle, Auth-Guards
// ✅ Metadaten (Routing, Validierung, Serialisierung)
// ❌ Business-Logik, State-Management, komplexe Transformationen
```

---

## Zusammenfassung: Decorator-Oekosystem

| Framework | Decorator-Typ | Beispiele |
|---|---|---|
| Angular | Class | @Component, @Injectable, @Pipe, @Directive |
| Angular | Property | @Input, @Output, @ViewChild, @HostBinding |
| Angular | Method | @HostListener |
| NestJS | Class | @Controller, @Module, @Injectable |
| NestJS | Method | @Get, @Post, @Put, @UseGuards |
| NestJS | Parameter | @Param, @Query, @Body, @Headers |
| TypeORM | Class | @Entity |
| TypeORM | Property | @Column, @PrimaryGeneratedColumn |
| MobX | Property | @observable, @computed |
| MobX | Method | @action |

---

## Was du gelernt hast

- **Angular** nutzt Decorators als Deklarationen — Metadaten die der Compiler liest
- **NestJS** nutzt Decorators als Konfiguration und Request-Transformation
- **Eigene Decorators** sind einfach zu schreiben: Class Decorator = Funktion(Konstruktor)
- **Decorator-Komposition** kombiniert mehrere Decorators zu einem
- **Anti-Patterns**: Keine Business-Logik, kein globaler State, keine Typ-Luegen

> 🧠 **Erklaere dir selbst:** Warum sind Decorators in Angular so zentral,
> aber in React fast nicht vorhanden?
>
> **Kernpunkte:** Angular: Klassen-basiert → Decorators sind natuerlich |
> React: Funktions-basiert → Hooks sind natuerlicher |
> Decorators annotieren Klassen | Hooks komponieren Funktionen |
> Beide loesen das gleiche Problem (DI, State, Lifecycle) mit
> verschiedenen Mitteln

**Kernkonzept zum Merken:** Decorators sind Metaprogrammierung —
Code der Code beschreibt und transformiert. In Angular deklarieren
sie was eine Klasse IST, in NestJS konfigurieren sie was eine
Methode TUT. Beide nutzen das gleiche TypeScript-Feature fuer
grundverschiedene Zwecke.

---

> **Ende der Lektion** -- Du beherrschst TypeScript Decorators —
> von den Grundlagen bis zur Framework-Integration.
>
> Weiter geht es mit: [Lektion 29](../../29-next-lesson/sections/01-first-section.md)
