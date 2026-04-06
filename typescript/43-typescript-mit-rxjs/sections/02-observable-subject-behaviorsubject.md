# Sektion 2: Observable, Subject, BehaviorSubject — Die Kern-Typen

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - RxJS und TypeScript — Warum das passt](./01-rxjs-und-typescript-warum-das-passt.md)
> Naechste Sektion: [03 - Operator-Typen: map, filter, switchMap](./03-operator-typen-map-filter-switchmap.md)

---

## Was du hier lernst

- Den Unterschied zwischen `Observable<T>`, `Subject<T>`, `BehaviorSubject<T>`,
  `ReplaySubject<T>` und `AsyncSubject<T>` — **aus TypeScript-Sicht**
- Warum Generics hier keine Dekoration sind, sondern das Rueckgrat der Typsicherheit
- Den synchronen Zugriff bei `BehaviorSubject<T>.value` und was TypeScript daraus macht
- Wann du welchen Typ verwendest — Decision Tree fuer deinen Angular-Alltag

---

## Die Verwandtschaft der Kern-Typen

Bevor wir in Typen tauchen, brauchen wir das mentale Modell:

```
Observable<T>          — Basistyp: Ein Strom von T-Werten (kalt oder heiss)
     |
     └── Subject<T>    — Observable + Observer: Kann selbst Werte emittieren
              |
              ├── BehaviorSubject<T>  — Hat Initialwert, speichert letzten Wert
              ├── ReplaySubject<T>    — Speichert N Werte fuer neue Subscriber
              └── AsyncSubject<T>    — Emittiert nur letzten Wert bei complete()
```

Alle erben von `Observable<T>`. Das ist wichtig fuer TypeScript: Ueberall wo
`Observable<User>` erwartet wird, kannst du auch `BehaviorSubject<User>` uebergeben.
Das ist strukturelle Subtypkompatibilitaet — Liskov Substitution in der Praxis.

> 📖 **Origin Story: Warum Subject einen so seltsamen Namen hat**
>
> "Subject" kommt aus dem Observer Pattern (GoF Design Patterns, 1994). Im Original-Pattern
> ist das "Subject" das Objekt, das beobachtet wird — und Subscriber sind die "Observer".
> Als Erik Meijer ReactiveX entwarf, uebernahm er die Terminologie. Ein `Subject<T>` ist
> sowohl beobachtbar (Observable) als auch ein Observer — es kann selbst auf Events
> reagieren und eigene Werte pushen. Das macht es zu einem bidirektionalen Kanal.
>
> In deinem Angular-Code: `EventEmitter<T>` ist intern ein Subject. Jedes Mal wenn du
> `@Output() valueChange = new EventEmitter<string>()` schreibst, verwendest du
> unter der Haube genau diesen Mechanismus.

---

## Observable\<T\> — Der Basistyp

Ein `Observable<T>` ist eine lazy Sequenz von Werten vom Typ T:

```typescript annotated
import { Observable } from 'rxjs';

// Ein Observable ist lazy — es passiert NICHTS bis subscribe() aufgerufen wird
const numbers$: Observable<number> = new Observable<number>(observer => {
  // observer.next() emittiert einen Wert vom Typ T (hier: number)
  observer.next(1);    // T = number — TypeScript erzwingt number
  observer.next(2);
  // observer.next("drei"); // FEHLER: Argument of type 'string' is not assignable to 'number'
  observer.complete();
  // Nach complete() kommen keine Werte mehr

  // Optionale Cleanup-Funktion — wird bei unsubscribe() aufgerufen
  return () => console.log('Cleanup!');
});

// Erst jetzt laeuft der Code im Konstruktor
numbers$.subscribe({
  next: (value) => console.log(value),  // value: number — TypeScript weiss es
  error: (err) => console.error(err),   // err: unknown (seit RxJS 7!)
  complete: () => console.log('Fertig'),
});
```

Wichtig: Der `error`-Callback bekommt `unknown` — nicht `any`. Das ist eine bewusste
Aenderung in RxJS 7, analog zu TypeScript's `useUnknownInCatchVariables`. Dazu mehr
in Sektion 5.

---

## Subject\<T\> — Der bidirektionale Kanal

Ein `Subject<T>` ist ein Observable das selbst Werte emittieren kann:

```typescript annotated
import { Subject } from 'rxjs';

interface UserEvent {
  type: 'login' | 'logout' | 'update';
  userId: string;
  timestamp: number;
}

// Subject<T>: Kein Initialwert, kein gespeicherter Zustand
const userEvents$ = new Subject<UserEvent>();

// Subscription vor dem naechsten Wert — bekommt alles
userEvents$.subscribe(event => {
  // event: UserEvent — TypeScript kennt den Typ
  console.log(`${event.type} fuer User ${event.userId}`);
});

// next() erwartet exakt T — TypeScript prueft den Typ
userEvents$.next({ type: 'login', userId: '123', timestamp: Date.now() });
// userEvents$.next({ type: 'foo', userId: '123', timestamp: Date.now() });
// ^ FEHLER: 'foo' ist kein gueltiger Wert fuer type: 'login' | 'logout' | 'update'

// Subscription NACH dem next() — bekommt nichts rueckwirkend
// Das ist der Unterschied zu ReplaySubject
const lateSubscriber = userEvents$.subscribe(e => console.log('Spaet:', e));
userEvents$.next({ type: 'update', userId: '123', timestamp: Date.now() });
// lateSubscriber bekommt 'update', aber nicht 'login' davor
```

> 💭 **Denkfrage:** Warum gibt es in TypeScript keinen Fehler wenn du ein `Subject<UserEvent>`
> als `Observable<UserEvent>` uebergibst? Subject ist eine Subklasse von Observable —
> aber was konkret bedeutet das fuer die TypeScript-Typpruefung?
>
> **Antwort:** TypeScript verwendet **strukturelles Typing**, keine nominale Typhierarchie.
> `Subject<T>` hat alle Properties und Methoden von `Observable<T>` (plus mehr).
> Damit ist es strukturell kompatibel. Ueberall wo `Observable<UserEvent>` erwartet wird,
> kann TypeScript pruefen: "Hat Subject<UserEvent> alle noetigen Members?" — Ja.
> Das ist Liskov Substitution als strukturelles Prinzip.

---

## BehaviorSubject\<T\> — Der Zustand

`BehaviorSubject<T>` ist der am haeufigsten verwendete Subject-Typ in Angular. Er hat
einen Initialwert und speichert den letzten Wert:

```typescript annotated
import { BehaviorSubject } from 'rxjs';

interface User {
  id: string;
  name: string;
  role: 'admin' | 'user' | 'guest';
}

// Initialwert PFLICHT — TypeScript erzwingt T als Argument
const currentUser$ = new BehaviorSubject<User | null>(null);
// ^ T = User | null, Initialwert = null (erlaubt durch den Union-Typ)

// Synchroner Zugriff auf den aktuellen Wert — kein subscribe noetig
const syncValue: User | null = currentUser$.value;
// ^ .value ist immer verfuegbar, Typ ist T (User | null)

// Neue Subscriber bekommen sofort den LETZTEN Wert
const subscription = currentUser$.subscribe(user => {
  // user: User | null
  if (user !== null) {
    // user: User — TypeScript narrowed durch den null-Check!
    console.log(`Eingeloggt als: ${user.name}`);
  }
});

// Update — alle aktuellen Subscriber bekommen den neuen Wert
currentUser$.next({ id: '1', name: 'Max', role: 'admin' });

// FEHLER: next() erwartet User | null, nicht string
// currentUser$.next('Max');  // Type 'string' is not assignable to 'User | null'
```

> 🧠 **Erklaere dir selbst:** Warum hat `BehaviorSubject<User | null>` den Initialwert `null`
> statt einfach `BehaviorSubject<User>` mit einem leeren Objekt?
> Was waere das Problem mit `new BehaviorSubject<User>({} as User)`?
> **Kernpunkte:** `{} as User` ist ein Type Cast, keine echte Validierung |
> TypeScript wuerde es erlauben, aber das Objekt fehlen alle Felder zur Laufzeit |
> `null` ist semantisch korrekt: "Kein User eingeloggt" ist kein User, nicht ein leerer User |
> Union-Typ `User | null` erzwingt null-Checks vor jedem Zugriff

---

## ReplaySubject\<T\> und AsyncSubject\<T\>

```typescript annotated
import { ReplaySubject, AsyncSubject } from 'rxjs';

// ReplaySubject<T>(bufferSize): Speichert die letzten N Werte
const lastThreeEvents$ = new ReplaySubject<string>(3);
// ^ bufferSize = 3: Neue Subscriber bekommen die 3 letzten Werte sofort

lastThreeEvents$.next('Event A');
lastThreeEvents$.next('Event B');
lastThreeEvents$.next('Event C');
lastThreeEvents$.next('Event D');  // A wird verworfen, B/C/D bleiben

const late$ = lastThreeEvents$.subscribe(e => console.log(e));
// late$ bekommt sofort: 'Event B', 'Event C', 'Event D'

// AsyncSubject<T>: Emittiert NUR den letzten Wert, und nur bei complete()
const asyncResult$ = new AsyncSubject<number>();

asyncResult$.subscribe(n => console.log('Ergebnis:', n));  // Noch nichts
asyncResult$.next(1);   // Wird nicht emittiert
asyncResult$.next(2);   // Wird nicht emittiert
asyncResult$.next(42);  // Wird NOCH nicht emittiert
asyncResult$.complete();  // JETZT: subscriber bekommt 42 (den letzten Wert)
// Vergleichbar mit Promise — einmaliges Ergebnis am Ende
```

---

## Experiment-Box: BehaviorSubject als State Container

In Angular wirst du `BehaviorSubject` sehr oft fuer einfaches State Management sehen.
Schreibe folgendes und beobachte die TypeScript-Typen:

```typescript
import { BehaviorSubject } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

interface AppState {
  users: User[];
  loading: boolean;
  error: string | null;
  selectedUserId: string | null;
}

const initialState: AppState = {
  users: [],
  loading: false,
  error: null,
  selectedUserId: null,
};

class StateService {
  private state$ = new BehaviorSubject<AppState>(initialState);

  // Expose als readonly Observable — Subscriber koennen nicht next() aufrufen
  readonly state = this.state$.asObservable();
  // ^ asObservable() gibt Observable<AppState> zurueck, kein Subject mehr

  // Abgeleiteter State — TypeScript kennt den Rueckgabetyp automatisch
  readonly users$ = this.state$.pipe(
    map(state => state.users),
    // Typ: Observable<User[]> — TypeScript inferiert aus map(state => state.users)
    distinctUntilChanged()
  );

  readonly isLoading$ = this.state$.pipe(
    map(state => state.loading),
    // Typ: Observable<boolean>
    distinctUntilChanged()
  );

  // Update-Methode: Typgeprüftes Partial-Update
  update(partial: Partial<AppState>): void {
    this.state$.next({ ...this.state$.value, ...partial });
    // state$.value: AppState — synchroner Zugriff auf aktuellen Wert
  }
}
```

Beachte: `asObservable()` gibt `Observable<T>` zurueck, nicht `Subject<T>`. Das ist
eine wichtige Kapselung: Externe Code koennen den State lesen, aber nicht direkt
schreiben.

---

## Decision Tree: Welchen Typ verwenden?

```
Muss der Observable selbst Werte emittieren?
├── Nein → Observable<T> (z.B. von http.get())
└── Ja → Subject-Variante:
    ├── Braucht neuer Subscriber den letzten Wert sofort?
    │   ├── Ja → BehaviorSubject<T> (braucht Initialwert)
    │   └── Nein → Subject<T> (kein Initialwert)
    ├── Braucht neuer Subscriber mehrere vergangene Werte?
    │   └── Ja → ReplaySubject<T>(N)
    └── Wichtig ist nur der letzte Wert bei Abschluss?
        └── Ja → AsyncSubject<T> (aehnlich wie Promise)
```

> ⚡ **Angular-Praxis-Tipp:** In deinen Services verwende `BehaviorSubject<T>` fuer State
> der immer einen aktuellen Wert hat (User-Session, Einstellungen) und `Subject<T>` fuer
> Events die keine History brauchen (Button-Clicks, HTTP-Fehler-Benachrichtigungen).
> Exponiere immer `.asObservable()` nach aussen — nie das Subject selbst.

---

## Was du gelernt hast

- `Observable<T>` ist der Basistyp: lazy, kalt oder heiss, TypeScript kennt T durch die gesamte Pipeline
- `Subject<T>` ist bidirektional: sowohl Observable als auch Observer. Kein Initialwert, kein Replay
- `BehaviorSubject<T>` hat immer einen Wert (`value`-Property, synchroner Zugriff). Initialwert PFLICHT
- `ReplaySubject<T>(N)` speichert die letzten N Werte fuer neue Subscriber
- `AsyncSubject<T>` ist das Observable-Aequivalent zu Promise: ein Wert am Ende
- TypeScript erzwingt in `next(value)` dass der Wert genau vom Typ T ist — Union-Typen wie `User | null` sind erlaubt und semantisch korrekt

**Kernkonzept:** `BehaviorSubject<T>` ist der Standard-Baustein fuer State in Angular-Services.
Der Typ T wandert durch `.value`, `.next()`, `.subscribe()` und abgeleitete Observables —
TypeScript prueft jeden Schritt.

---

> **Pausenpunkt** — Gut gemacht. Du kennst jetzt die Typen-Identitaet aller Subject-Varianten.
> Im naechsten Schritt schauen wir uns an, was Operatoren mit diesen Typen machen.
>
> Weiter geht es mit: [Sektion 03: Operator-Typen: map, filter, switchMap](./03-operator-typen-map-filter-switchmap.md)
