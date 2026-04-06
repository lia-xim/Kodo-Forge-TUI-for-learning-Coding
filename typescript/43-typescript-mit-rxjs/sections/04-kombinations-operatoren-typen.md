# Sektion 4: Kombinations-Operatoren und ihre Typen

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Operator-Typen: map, filter, switchMap](./03-operator-typen-map-filter-switchmap.md)
> Naechste Sektion: [05 - Fehlerbehandlung in RxJS mit TypeScript](./05-fehlerbehandlung-rxjs-typescript.md)

---

## Was du hier lernst

- Wie `combineLatest` und `forkJoin` **Tuple-Typen automatisch inferieren** — ohne eine einzige Annotation
- Den Unterschied zwischen Array-Syntax und Object-Syntax bei `forkJoin` — und warum Object-Syntax oft besser ist
- Wie `withLatestFrom` und `zip` Tuple-Typen erzeugen und warum das wichtig ist
- Den Unterschied zwischen `zip` (Paare) und `combineLatest` (letzter Wert) aus TypeScript-Sicht

---

## Die Herausforderung: Mehrere Observables kombinieren

Wenn eine einzelne Observable durch eine Pipeline wandert, ist Typ-Propagation
unkompliziert: `Observable<T>` geht rein, `Observable<R>` kommt raus. Aber was
passiert wenn **mehrere Observables** gleichzeitig kombiniert werden muessen?

Das ist in Angular-Komponenten staendig der Fall: Der aktuelle User, seine
Einstellungen und die Feature-Flags muessen alle zusammen vorhanden sein bevor
die Komponente sinnvoll rendern kann.

> 📖 **Hintergrund: Tuple-Typen als Schluesseltechnologie**
>
> TypeScript 4.0 (August 2020) brachte eine kritische Verbesserung: Variadic Tuple Types.
> Vorher konnte TypeScript bei `combineLatest([a$, b$, c$])` nur `Observable<(A | B | C)[]>`
> inferieren — ein Array-Union statt einem Tuple. Das war nutzlos fuer genaue Typisierung.
>
> Mit TypeScript 4.0 kann der Compiler jetzt `Observable<[A, B, C]>` inferieren — ein
> Tuple bei dem jede Position ihren eigenen Typ hat. RxJS 7 nutzte diese Verbesserung
> sofort und revidierte die Typdeklarationen fuer alle Kombinations-Operatoren.
> Das Ergebnis: Destructuring in `map(([a, b, c]) => ...)` ist vollstaendig typisiert.

---

## combineLatest — Tuple-Typen werden automatisch inferiert

`combineLatest` kombiniert mehrere Observables und emittiert bei jeder Emission eines
Teilnehmers ein neues Tuple mit den **letzten Werten** aller Teilnehmer:

```typescript annotated
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

interface User { id: string; name: string; role: 'admin' | 'user'; }
interface Settings { theme: 'dark' | 'light'; language: string; }
interface Feature { key: string; enabled: boolean; }

const user$: Observable<User> = this.userService.currentUser$;
const settings$: Observable<Settings> = this.settingsService.settings$;
const features$: Observable<Feature[]> = this.featureService.features$;

// combineLatest inferiert den Tuple-Typ aus dem Array:
const combined$ = combineLatest([
  user$,        // Observable<User>
  settings$,    // Observable<Settings>
  features$,    // Observable<Feature[]>
]).pipe(
  // [user, settings, features]: [User, Settings, Feature[]] — Tuple! Kein Union!
  map(([user, settings, features]) => {
    // user: User ✓, settings: Settings ✓, features: Feature[] ✓
    // Destructuring ist vollstaendig typisiert — TypeScript weiss die Position
    const activeFeatures = features.filter(f => f.enabled);
    return {
      user,
      settings,
      activeFeatures,
      isAdmin: user.role === 'admin',
      isDark: settings.theme === 'dark',
    };
  })
  // Rueckgabetyp: Observable<{ user: User; settings: Settings; activeFeatures: Feature[]; isAdmin: boolean; isDark: boolean }>
);
```

Beachte den entscheidenden Unterschied: TypeScript inferiert `[User, Settings, Feature[]]`
als **Tuple**, nicht als `(User | Settings | Feature[])[]`. Das bedeutet:
- Position 0 ist immer `User`
- Position 1 ist immer `Settings`
- Position 2 ist immer `Feature[]`

Das Destructuring `[user, settings, features]` ist vollstaendig typisiert.

> 💭 **Denkfrage:** `combineLatest` emittiert NICHT wenn nur ein Observable emittiert —
> es wartet bis alle mindestens einmal emittiert haben. Was bedeutet das fuer den Typ?
> Koennte der Typ bei einem "noch nie emittiert"-Zustand `undefined` enthalten?
>
> **Antwort:** Nein — TypeScript weiss das nicht. Der Typ ist `Observable<[User, Settings, Feature[]]>`,
> und das stimmt zur Laufzeit, weil `combineLatest` keine Werte emittiert bevor alle
> Teilnehmer mindestens einmal emittiert haben. Das Typsystem beschreibt nur
> **welche Form** die Werte haben, wenn sie ankommen — nicht **ob** und **wann** sie ankommen.
> Das ist ein fundamentaler Unterschied zwischen dem Typ-System und dem Laufzeit-Verhalten.

---

## forkJoin — Alle auf einmal, mit Named-Object-Syntax

`forkJoin` ist das Observable-Aequivalent zu `Promise.all`: Es wartet bis **alle**
Observables abgeschlossen sind und emittiert einmal mit allen Ergebnissen.

```typescript annotated
import { forkJoin } from 'rxjs';

interface Post { id: string; title: string; body: string; }
interface Preferences { notifications: boolean; fontSize: number; }

// Array-Syntax (veraltet — schlechtere Lesbarkeit):
const data_old$ = forkJoin([
  this.userService.getUser(id),   // Position 0: User
  this.postService.getUserPosts(id),  // Position 1: Post[]
]).pipe(
  map(([user, posts]) => ({ user, posts }))
  // [User, Post[]] — korrekt typisiert, aber Positionen muss man zaehlen
);

// Object-Syntax (TypeScript 4.0+, empfohlen — klare Benennung):
const data$ = forkJoin({
  user: this.userService.getUser(id),
  posts: this.postService.getUserPosts(id),
  preferences: this.prefService.get(id),
}).pipe(
  // { user: User, posts: Post[], preferences: Preferences } — benannte Properties!
  map(({ user, posts, preferences }) => ({
    ...user,
    posts,
    notificationsEnabled: preferences.notifications,
  }))
  // TypeScript inferiert: { user: User, posts: Post[], preferences: Preferences }
  // Kein manuelles zaehlen von Positionen noetig
);
```

> 🧠 **Erklaere dir selbst:** Warum ist die Object-Syntax bei `forkJoin` der Array-Syntax
> vorzuziehen, besonders wenn mehr als 3 Observables kombiniert werden?
> **Kernpunkte:** Benannte Properties sind selbstdokumentierend | Array-Positionen muessen
> gezaehlt werden (fehleranfaellig bei Umstrukturierung) | TypeScript inferiert den Objekt-Typ
> mit korrekten Schluesssel-Namen | Destructuring ist klarer: `{ user, posts }` vs `[user, posts]`

---

## withLatestFrom — Tuple-Typ mit Trigger und Snapshot

`withLatestFrom` ist ein anderes Muster: Ein "trigger" Observable loest aus, und
der Operator fuegt den **letzten Wert** eines anderen Observables als Snapshot hinzu:

```typescript annotated
import { withLatestFrom } from 'rxjs/operators';

interface FormData { name: string; email: string; }

const submitButton$ = fromEvent(button, 'click');  // Observable<Event>
const currentUser$: Observable<User> = this.userService.currentUser$;
const formValue$: Observable<FormData> = this.form.valueChanges;

// withLatestFrom gibt IMMER ein Tuple zurueck — Trigger + Snapshots
const submitResult$ = submitButton$.pipe(
  withLatestFrom(currentUser$, formValue$),
  // ^ Typ: Observable<[Event, User, FormData]> — Tuple!
  // Element 0: Event (der Trigger-Wert)
  // Element 1: User (letzter Wert von currentUser$)
  // Element 2: FormData (letzter Wert von formValue$)
  map(([_click, user, form]) => ({
    // _click: Event (meist ignoriert mit _-Prefix)
    userId: user.id,      // user: User — TypeScript kennt den Typ
    data: form,           // form: FormData — TypeScript kennt den Typ
    timestamp: Date.now(),
  }))
);

// In Angular: Submit-Handler mit withLatestFrom
// Im Template: (click)="onSubmit()"
// In der Komponente:
class FormComponent {
  private submitSource$ = new Subject<void>();

  handleSubmit$ = this.submitSource$.pipe(
    withLatestFrom(this.userService.currentUser$, this.form.valueChanges),
    map(([_, user, formData]) => this.saveForm(user.id, formData))
  );
}
```

---

## zip — Strikte Paare mit Tuple-Typen

`zip` ist der strengste Kombinations-Operator: Er wartet bis **jeder** Teilnehmer
einen neuen Wert emittiert und bildet dann Paare:

```typescript annotated
import { zip } from 'rxjs';

const names$ = of('Alice', 'Bob', 'Charlie');  // Observable<string>
const scores$ = of(95, 87, 72);                 // Observable<number>

// zip bildet STRENGE Paare — ein Paar pro Emission aller Teilnehmer
const pairs$ = zip(names$, scores$);
// Typ: Observable<[string, number]> — IMMER Paare, niemals einzeln

pairs$.subscribe(([name, score]) => {
  // name: string ✓, score: number ✓ — Tuple-Destructuring typisiert
  console.log(`${name}: ${score} Punkte`);
  // Output: "Alice: 95 Punkte", "Bob: 87 Punkte", "Charlie: 72 Punkte"
});

// zip vs combineLatest im Vergleich:
// zip([a$, b$]):        Wartet auf NEUE Werte beider — Paare (1:1)
// combineLatest([a$, b$]): Emittiert bei JEDEM neuen Wert — immer letzter Stand
```

---

## Experiment-Box: Tuple-Typen in Action

Schreibe folgendes und beobachte die Typen durch Hovern:

```typescript
import { combineLatest, forkJoin, of, BehaviorSubject } from 'rxjs';
import { map, delay } from 'rxjs/operators';

interface Config { maxRetries: number; timeout: number; }
interface Theme { primary: string; secondary: string; }

const config$ = new BehaviorSubject<Config>({ maxRetries: 3, timeout: 5000 });
const theme$ = new BehaviorSubject<Theme>({ primary: '#3f51b5', secondary: '#ff4081' });

// Hover ueber combined$ — TypeScript zeigt den vollstaendigen Tuple-Typ
const combined$ = combineLatest([config$, theme$]).pipe(
  map(([config, theme]) => ({
    retries: config.maxRetries,   // config: Config — korrekt typisiert
    primaryColor: theme.primary,  // theme: Theme — korrekt typisiert
  }))
);

// Hover ueber joined$ — TypeScript zeigt den Objekt-Typ
const joined$ = forkJoin({
  config: of<Config>({ maxRetries: 3, timeout: 5000 }).pipe(delay(100)),
  theme: of<Theme>({ primary: '#333', secondary: '#fff' }).pipe(delay(200)),
});

// Aendere einen der Typen und beobachte wie TypeScript sofort die
// Destructuring-Variablen aktualisiert
```

---

## Angular-Bezug: Zusammengesetzter State in Komponenten

Das haeufigste Muster in Angular: Eine Komponente braucht Daten aus mehreren Services
gleichzeitig:

```typescript annotated
@Component({
  template: `
    <ng-container *ngIf="vm$ | async as vm">
      <h1>Hallo, {{ vm.user.name }}</h1>
      <app-theme [config]="vm.theme"></app-theme>
      <app-feature-list [features]="vm.activeFeatures"></app-feature-list>
    </ng-container>
  `
})
export class DashboardComponent {
  private userService = inject(UserService);
  private themeService = inject(ThemeService);
  private featureService = inject(FeatureService);

  // ViewModel Observable — kombiniert alle noetigen Daten
  vm$ = combineLatest({
    user: this.userService.currentUser$,
    theme: this.themeService.activeTheme$,
    features: this.featureService.features$,
  }).pipe(
    // { user: User, theme: Theme, features: Feature[] } — TypeScript inferiert alles
    map(({ user, theme, features }) => ({
      user,
      theme,
      activeFeatures: features.filter(f => f.enabled),
      isAdmin: user.role === 'admin',
    }))
    // Rueckgabetyp wird vollstaendig inferiert — kein manuelles Interface noetig!
  );
}
```

> ⚡ **Praxis-Tipp:** Das "ViewModel-Pattern" mit `combineLatest` und `async pipe` ist
> der Standard-Ansatz in modernen Angular-Projekten. Der Vorteil: TypeScript kennt den
> exakten Typ des ViewModels — der Template-Compiler kann ihn prueft und du hast
> vollstaendiges Autocomplete im Template (mit Ivy und strictTemplates).

---

## Was du gelernt hast

- `combineLatest([a$, b$, c$])` inferiert `Observable<[A, B, C]>` — Tuple, nicht Union-Array
- `forkJoin({ a: a$, b: b$ })` inferiert `Observable<{ a: A; b: B }>` — benannte Objekte, klarer als Array-Syntax
- `withLatestFrom(b$, c$)` erzeugt `Observable<[T, B, C]>` — Trigger plus Snapshots als Tuple
- `zip(a$, b$)` erzeugt `Observable<[A, B]>` — strikte 1:1-Paare
- Das ViewModel-Pattern mit `combineLatest` ist der empfohlene Ansatz fuer zusammengesetzten State in Angular-Komponenten

**Kernkonzept:** TypeScript 4.0 Variadic Tuple Types sind der Schluesselmechanismus hinter
der Typisierung von Kombinations-Operatoren. Ohne sie koennte TypeScript nur Union-Arrays
inferieren — mit ihnen kennt TypeScript jede Position im kombinierten Ergebnis praezise.

---

> **Pausenpunkt** — Gut. Du weisst jetzt wie TypeScript mit mehreren kombinierten
> Observables umgeht. Das naechste Thema ist eines der wichtigsten: Was passiert
> wenn etwas schief geht — und wie TypeScript dabei hilft, Fehler typsicher zu behandeln.
>
> Weiter geht es mit: [Sektion 05: Fehlerbehandlung in RxJS mit TypeScript](./05-fehlerbehandlung-rxjs-typescript.md)
