# Sektion 6: Angular-Patterns — toSignal, async pipe und die Bruecke

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [05 - Fehlerbehandlung in RxJS mit TypeScript](./05-fehlerbehandlung-rxjs-typescript.md)
> Naechste Sektion: — (Ende der Lektion)

---

## Was du hier lernst

- Wie `toSignal<T>()` ein Observable in ein Signal umwandelt — und welche Typ-Varianten es gibt
- Warum `initialValue` und `requireSync` den Rueckgabetyp fundamental aendern
- `takeUntilDestroyed` und automatisches Cleanup — ohne manuelle Unsubscribe-Logik
- Die `async pipe` aus TypeScript-Sicht: Was der Template-Compiler weiss und was nicht

---

## Die neue Angular-Welt: Signals und Observables nebeneinander

Ab Angular 16 gibt es zwei reaktive Primitive: **Observables** (RxJS) und **Signals**
(Angulars eigenes Reaktivitaetssystem). Beide haben ihre Staerken:

- **Observables**: Zeitliche Sequenzen, HTTP-Requests, WebSockets, komplexe Transformationen
- **Signals**: Zustandsverwaltung, synchroner Zugriff, Zone.js-freies Change-Detection

Angular stellt Brueckenfunktionen zur Verfuegung um zwischen beiden Welten zu wechseln.
Das Typsystem macht diese Bruecke sicher.

> 📖 **Hintergrund: Warum Signals, wenn es RxJS schon gibt?**
>
> RxJS ist maechtig — aber auch komplex. `BehaviorSubject`, `distinctUntilChanged`,
> `shareReplay`, Subscription-Management: Das ist viel Overhead fuer einfache
> Zustandsspeicherung. Angular Signals sind bewusst einfacher: Ein Signal ist ein
> Wert, der sich aendert und automatisch Change Detection ausloest.
>
> Das Angular-Team von Ward Bell, Alex Rickabaugh und anderen hat Signals als
> ergaenzend, nicht ersetzend designed. Die Pruefung: `toSignal()` und `fromSignal()`
> sind Bruecken — du kannst beide Welten mischen. In Angular 17+ ist die Empfehlung:
> Verwende Signals fuer lokalen Komponentenzustand, Observables fuer asynchrone
> Datenstroeme wie HTTP.

---

## toSignal\<T\> — Drei Varianten, drei Typen

`toSignal` wandelt ein Observable in ein Signal um. Je nach Option ist der Rueckgabetyp
unterschiedlich:

```typescript annotated
import { toSignal } from '@angular/core/rxjs-interop';
import { inject, Component, signal } from '@angular/core';

interface User { id: string; name: string; email: string; }
interface Config { theme: string; language: string; }

@Component({ /* ... */ })
class UserComponent {
  private userService = inject(UserService);
  private configService = inject(ConfigService);

  // Option 1: Ohne initialValue — undefined bis erster Wert emittiert
  user = toSignal(this.userService.currentUser$);
  // ^ Typ: Signal<User | undefined>
  //   TypeScript weiss: Bevor der erste Wert kommt, ist es undefined
  //   Das Template muss undefined behandeln: user()?.name

  // Option 2: Mit initialValue — kein undefined, sicherer Startzustand
  userWithDefault = toSignal(
    this.userService.currentUser$,
    { initialValue: null }
  );
  // ^ Typ: Signal<User | null>
  //   initialValue null schliesst undefined aus, behaelt aber null im Typ
  //   Das Template: userWithDefault()?.name  (null-safe)

  // Option 3: requireSync — Observable muss sofort synchron emittieren
  config = toSignal(
    this.configService.config$,
    { requireSync: true }
  );
  // ^ Typ: Signal<Config>  — kein undefined, kein null!
  //   TypeScript weiss: Der Wert ist immer vorhanden
  //   Nur valid wenn Observable sofort emittiert (z.B. BehaviorSubject, of(), startWith())
  //   Wenn es NICHT synchron emittiert: Laufzeitfehler in Angular!
}
```

> 💭 **Denkfrage:** Wann ist `requireSync: true` sicher, und wann ist es eine Falle?
> Welche Observable-Arten emittieren garantiert synchron?
>
> **Antwort:** Sicher bei: `of(wert)`, `from([array])`, `BehaviorSubject` (hat immer Wert),
> `startWith(initialValue)` am Anfang der Pipeline. Gefaehrlich bei: `http.get()`,
> `interval()`, `fromEvent()` — diese emittieren asynchron. Angular wirft einen
> `RuntimeError` wenn `requireSync: true` und kein synchroner Wert kommt.
> Die TypeScript-Typen helfen hier nicht — sie koennen asynchrones Verhalten nicht ausdrucken.
> Das ist eine der Grenzen des Typsystems.

---

## toSignal in der Praxis — TypeScript-Konsequenzen

Der Typ von `toSignal` hat direkte Konsequenzen im Template und im TypeScript-Code:

```typescript annotated
@Component({
  template: `
    <!-- user ist Signal<User | undefined> — muss optional chaining verwenden -->
    @if (user()) {
      <span>{{ user()!.name }}</span>
    }

    <!-- userWithDefault ist Signal<User | null> -->
    <span>{{ userWithDefault()?.name ?? 'Kein User' }}</span>

    <!-- config ist Signal<Config> — kein Guard noetig! -->
    <span>{{ config().theme }}</span>
  `
})
class ProfileComponent {
  private userService = inject(UserService);
  private configService = inject(ConfigService);

  // Signal<User | undefined> — template prueft mit @if
  user = toSignal(this.userService.currentUser$);

  // Signal<User | null> — template nutzt optional chaining
  userWithDefault = toSignal(this.userService.currentUser$, { initialValue: null });

  // Signal<Config> — kein Guard noetig, always defined
  config = toSignal(this.configService.config$, { requireSync: true });

  // Abgeleitetes Signal: computed() kennt die Typen
  displayName = computed(() => {
    const u = this.user();
    // u: User | undefined — TypeScript erzwingt Pruefung!
    return u ? `${u.name} (${u.email})` : 'Nicht eingeloggt';
    //                                     ^^ TypeScript: u ist hier User
  });
}
```

> 🧠 **Erklaere dir selbst:** Warum gibt `toSignal(obs$)` ohne Optionen den Typ
> `Signal<T | undefined>` zurueck, statt `Signal<T>`? Was wuerde es bedeuten wenn
> der Typ `Signal<T>` waere aber Observable noch nichts emittiert hat?
> **Kernpunkte:** Angular liest den Signal-Wert synchron — aber HTTP-Requests sind asynchron |
> Bevor der erste Wert kommt ist der Signal-Wert undefined |
> Signal<T> ohne undefined waere eine Luepe: TypeScript sagt "immer T" aber tatsaechlich ist es undefined |
> `initialValue` sagt dem Typsystem und Angular: "Hier ist der Startwert, kein undefined"

---

## takeUntilDestroyed — Automatisches Cleanup

Das laestigste Problem mit Subscriptions in Angular war immer das manuelle Unsubscribe.
Mit `takeUntilDestroyed` ist das Geschichte:

```typescript annotated
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef, inject } from '@angular/core';

@Component({ /* ... */ })
class DataComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private dataService = inject(DataService);

  // Variante 1: Im Konstruktor — direkte Injektion ohne DestroyRef
  readonly data$ = this.dataService.stream$.pipe(
    takeUntilDestroyed()
    // ^ Im Konstruktor-Kontext: takeUntilDestroyed() findet DestroyRef automatisch!
    // Typ: Observable<DataType> — unveraendert (takeUntilDestroyed aendert T nicht)
  );

  ngOnInit() {
    // Variante 2: Ausserhalb Konstruktor — DestroyRef explizit uebergeben
    this.dataService.stream$.pipe(
      takeUntilDestroyed(this.destroyRef)
      // ^ DestroyRef: wird destroyed wenn Komponente zerstoert wird
    ).subscribe(data => this.processData(data));
    // ^ Kein unsubscribe noetig! takeUntilDestroyed kuemmert sich darum
  }

  private processData(data: DataType): void {
    // data: DataType — vollstaendig typisiert
  }
}

// Anti-Pattern (das vermieden wird):
// private sub!: Subscription;
// ngOnInit() { this.sub = obs$.subscribe(...); }
// ngOnDestroy() { this.sub.unsubscribe(); }
// ^ Vergisst man leicht — Memory Leak!
```

---

## Experiment-Box: toSignal und computed kombinieren

```typescript
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

interface CartItem { productId: string; quantity: number; price: number; }

@Component({
  template: `
    <p>Artikel: {{ itemCount() }}</p>
    <p>Gesamt: {{ total() | currency }}</p>
    @if (isExpensive()) {
      <p>Versandkostenfrei ab 50 EUR!</p>
    }
  `
})
class CartComponent {
  // Simulierter Cart-Service mit BehaviorSubject
  private items$ = new BehaviorSubject<CartItem[]>([
    { productId: 'p1', quantity: 2, price: 12.99 },
    { productId: 'p2', quantity: 1, price: 49.99 },
  ]);

  // toSignal mit requireSync — BehaviorSubject emittiert synchron
  private items = toSignal(this.items$, { requireSync: true });
  // ^ Signal<CartItem[]> — kein undefined, kein null

  // computed() nutzt den Typ von Signal<CartItem[]>
  itemCount = computed(() => this.items().length);
  // ^ Signal<number> — TypeScript inferiert aus items()

  total = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity * item.price, 0)
  );
  // ^ Signal<number>

  isExpensive = computed(() => this.total() > 50);
  // ^ Signal<boolean>
}
```

Beobachte: `computed()` inferiert den Rueckgabetyp automatisch aus dem Rueckgabetyp
der Funktion. Du musst nie `computed<number>()` schreiben — TypeScript weiss es.

---

## Die async pipe — Was TypeScript weiss

Die `async pipe` ist das Fundament des Template-basierten Observable-Handlings
in klassischem Angular:

```typescript annotated
@Component({
  template: `
    <!-- async pipe: Observable<User[]> | null im Template -->
    @if (users$ | async; as users) {
      @for (user of users; track user.id) {
        <li>{{ user.name }}</li>
      }
    }

    <!-- async pipe mit Fallback fuer null -->
    {{ (title$ | async) ?? 'Lade...' }}
  `
})
class UserListComponent {
  // Observable<User[]> — TypeScript weiss den Typ
  users$ = this.http.get<User[]>('/api/users');
  // Typ im Template NACH async pipe: User[] | null
  // null weil async pipe null zurueckgibt bevor das Observable emittiert

  title$ = this.titleService.title$;
  // Observable<string> — nach async pipe: string | null
}
```

> ⚡ **Praxis-Tipp:** Die `async pipe` gibt IMMER `T | null` zurueck — `null` ist der
> Anfangszustand bevor das Observable emittiert. Das ist der Hauptvorteil von `toSignal`
> mit `initialValue`: Du kontrollierst den Anfangszustand explizit und der Typ ist klarer.
>
> In Angular 17+ mit dem neuen `@if`-Syntax ist `async pipe` lesbarer als das alte
> `*ngIf="obs$ | async as value"`. Aber `toSignal` ist oft die bessere Alternative fuer
> neue Komponenten — kein Template-Boilerplate, typsichere Signals.

---

## fromSignal — Die andere Richtung

Falls du ein Signal in ein Observable umwandeln musst (z.B. fuer einen HTTP-Request
bei Signal-Aenderung):

```typescript annotated
import { toObservable } from '@angular/core/rxjs-interop';
import { signal, computed } from '@angular/core';

@Component({ /* ... */ })
class SearchComponent {
  searchTerm = signal('');
  // ^ WritableSignal<string>

  // Signal zu Observable — fuer RxJS-Pipelines
  searchTerm$ = toObservable(this.searchTerm);
  // ^ Observable<string>

  // Jetzt kannst du die volle RxJS-Pipeline nutzen:
  results$ = this.searchTerm$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    filter(term => term.length >= 2),
    switchMap(term => this.http.get<SearchResult[]>(`/api/search?q=${term}`))
  );
  // ^ Observable<SearchResult[]> — vollstaendig typisiert

  // Und das Ergebnis wieder als Signal fuer das Template:
  results = toSignal(this.results$, { initialValue: [] as SearchResult[] });
  // ^ Signal<SearchResult[]>
}
```

---

## Was du gelernt hast

- `toSignal(obs$)` ohne Optionen: `Signal<T | undefined>` — undefined bis zum ersten Wert
- `toSignal(obs$, { initialValue: x })`: `Signal<T | typeof x>` — kontrollierter Startzustand
- `toSignal(obs$, { requireSync: true })`: `Signal<T>` — kein undefined, Observable muss synchron emittieren
- `takeUntilDestroyed()` im Konstruktor: automatisches Cleanup ohne manuelle `unsubscribe`-Logik
- `async pipe` gibt `T | null` zurueck — TypeScript-Konsequenz: Template muss null behandeln
- `toObservable(signal)` schliesst den Kreis: Signals koennen zu Observables werden und umgekehrt

**Kernkonzept:** Die Bruecke zwischen Signals und Observables ist vollstaendig typsicher.
TypeScript kennt den Rueckgabetyp jeder Konvertierungsfunktion — und die Option-Parameter
(`initialValue`, `requireSync`) aendern den Typ praezise. Das Typsystem modelliert die
semantischen Unterschiede der drei `toSignal`-Varianten.

> 🧠 **Erklaere dir selbst:** Du hast ein `BehaviorSubject<User[]>` in einem Service.
> Du willst es in einer Komponente als Signal verwenden. Welche `toSignal`-Variante
> ist korrekt und warum? Welcher Typ resultiert daraus?
> **Kernpunkte:** BehaviorSubject emittiert synchron beim Subscribe |
> `requireSync: true` ist korrekt — kein Laufzeitfehler, kein undefined |
> Resultat: `Signal<User[]>` — kein undefined, kein null |
> Alternative: `initialValue: []` gibt `Signal<User[]>` mit leerem Array als Startwert

---

> **Pausenpunkt** — Du hast die gesamte Lektion abgeschlossen. Von den Grundlagen der
> Typ-Propagation bis zu den modernen Angular 17+ Patterns mit Signals und Observables.
> RxJS und TypeScript sind nicht nur kompatibel — sie verstaerken sich gegenseitig.
>
> Wiederholung gefaellig? Starte das Quiz oder pruefe dein Wissen mit dem Pre-Test.
