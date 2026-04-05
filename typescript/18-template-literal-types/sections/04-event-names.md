# Sektion 4: Typsichere Event-Systeme

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Pattern Matching](./03-pattern-matching.md)
> Naechste Sektion: [05 - Praxis-Patterns](./05-praxis-patterns.md)

---

## Was du hier lernst

- Wie man Event-Namen **automatisch aus Datentypen ableitet** statt sie manuell zu tippen
- Das Muster hinter Angular EventEmitter und DOM-Events — und wie du es selbst nachbaust
- Wie man einen vollstaendig typsicheren `on`/`emit`-EventEmitter mit Template Literal Types und generischen Typen baut
- Warum dieses Muster eines der praktischsten Anwendungsfaelle fuer Template Literal Types ist

---

## Die Hintergrundgeschichte: Das Event-Problem

Jedes Frontend-Framework loest dasselbe grundlegende Problem: Komponenten muessen miteinander kommunizieren, ohne direkt voneinander abzuhaengen. Die Loesung ist fast immer ein Event-System — eine Komponente emittiert ein Event, andere hoeren zu.

Das Problem war lange: TypeScript konnte den Zusammenhang zwischen Event-Namen und Event-Payload-Typen nicht automatisch herstellen. Wenn du `emitter.on("user-login", handler)` schriebst, wusste TypeScript nicht, was `handler` als Argument erhalten wuerde — ausser du haettest es explizit definiert.

Mit Template Literal Types und generischen Constraints laesst sich das loesen. Das TypeScript-Team selbst nutzt das bei den Typen fuer das DOM-API: `addEventListener("click", handler)` funktioniert nur weil `lib.dom.d.ts` exakt das Pattern verwendet, das wir in dieser Sektion aufbauen. Du baust also nach, was das TypeScript-Team fuer Browser-Events implementiert hat.

---

## Ausgangspunkt: Event-Namen aus Properties ableiten

Das eleganteste Muster: Wenn du ein Interface hast, sollen Aenderungen an Properties automatisch Events generieren. Eine Eigenschaft `name` wird zu einem Event `nameChanged`, `theme` zu `themeChanged`:

```typescript annotated
type EventNames<T> = {
  [K in keyof T & string as `${K}Changed`]: {
  //                  ^^^^^^^^^^^^^^^^^^    // Key Remapping: K -> "${K}Changed"
  //   ^^^^^^^^^^^^^^                        // Nur String-Keys behalten (nicht symbol)
    previousValue: T[K]; // Typ des Felds = Typ des vorherigen Werts
    newValue: T[K];      // Gleicher Typ fuer den neuen Wert
  };
};

interface UserProfile {
  name: string;
  avatar: string;
  theme: "light" | "dark";
}

type UserEvents = EventNames<UserProfile>;
// {
//   nameChanged:   { previousValue: string;           newValue: string; }
//   avatarChanged: { previousValue: string;            newValue: string; }
//   themeChanged:  { previousValue: "light" | "dark"; newValue: "light" | "dark"; }
// }
```

Beachte: Die Payload-Typen sind **automatisch korrekt**. `themeChanged` kann nur `"light"` oder `"dark"` als Werte haben — nicht beliebige Strings. TypeScript leitet das direkt aus `UserProfile.theme` ab.

> **Erklaere dir selbst:** Warum verwenden wir `keyof T & string` statt nur `keyof T`? Was koennte `keyof T` enthalten, das kein String ist?
>
> **Kernpunkte:** `keyof T` kann strings, numbers und symbols enthalten. Symbols und numbers koennen nicht in Template Literals verwendet werden. `& string` filtert alles ausser strings heraus. In der Praxis haben die meisten Interfaces nur string-Keys, aber TypeScript ist streng.

---

## Ein typsicherer EventEmitter von Grund auf

Jetzt bauen wir den vollstaendigen EventEmitter — mit korrekten Typen fuer `on` und `emit`:

```typescript annotated
class EventEmitter<Events extends Record<string, unknown>> {
//                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                  Events beschreibt den Event-Katalog:
//                  { "user:login": { userId: string }, ... }
  private handlers = new Map<string, Array<(data: unknown) => void>>();

  on<E extends string & keyof Events>(
  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // E ist ein konkreter Event-Name (z.B. "user:login")
  // Constraint: E muss ein gueltiger Key von Events sein
    event: E,
    handler: (data: Events[E]) => void
    //             ^^^^^^^^    // Payload-Typ wird automatisch aus Events abgeleitet!
  ): void {
    const list = this.handlers.get(event) ?? [];
    list.push(handler as (data: unknown) => void);
    this.handlers.set(event, list);
  }

  emit<E extends string & keyof Events>(
    event: E,
    data: Events[E]  // Payload muss zum Event-Namen passen
  ): void {
    const list = this.handlers.get(event) ?? [];
    list.forEach(fn => fn(data));
  }
}
```

Die Verwendung zeigt die volle Kraft:

```typescript
interface AppEvents {
  "user:login":   { userId: string; timestamp: number };
  "user:logout":  { reason: "timeout" | "manual" };
  "data:refresh": { source: string; itemCount: number };
}

const emitter = new EventEmitter<AppEvents>();

// TypeScript weiss: Der Handler fuer "user:login" bekommt { userId, timestamp }
emitter.on("user:login", (data) => {
  console.log(data.userId);    // OK — TypeScript weiss: string
  console.log(data.timestamp); // OK — TypeScript weiss: number
  // console.log(data.reason); // FEHLER! "reason" gibt es bei user:login nicht
});

// TypeScript prueft: data muss { reason: "timeout" | "manual" } sein
emitter.emit("user:logout", { reason: "timeout" }); // OK
// emitter.emit("user:logout", { reason: "aborted" }); // FEHLER! Falscher Wert
// emitter.emit("page:load", {});                       // FEHLER! Kein "page:load"
```

> **Denkfrage:** Was waere der Unterschied, wenn `on` und `emit` einfach `string` und `unknown` als Typen haetten? Welche Fehler wuerde TypeScript nicht mehr fangen? Und in welcher Phase wuerden diese Fehler dann erst auffallen?
>
> **Antwort:** Mit `string` und `unknown` wuerde jeder Event-Name akzeptiert — Tippfehler werden zur Laufzeit zu stillen Fehlern (kein Handler reagiert). Payload-Fehler werden ebenfalls erst zur Laufzeit sichtbar, wenn Properties fehlen oder falsch sind. Das ist der klassische "es funktioniert zur Entwicklungszeit nicht, aber fliegt nicht auf bis zur Produktion" Fehlertyp.

---

## DOM-Events: Das Original-Pattern

Die TypeScript-Typen fuer das DOM-API in `lib.dom.d.ts` verwenden exakt dieses Pattern. Hier ist das Grundprinzip dahinter — vereinfacht nachgebaut:

```typescript annotated
// Das DOM-API definiert einen Katalog von Events und ihren Typen:
interface HTMLElementEventMap {
  click:      MouseEvent;
  keydown:    KeyboardEvent;
  mouseenter: MouseEvent;
  scroll:     Event;
  focus:      FocusEvent;
}

// addEventListener ist dann im Prinzip so typisiert:
interface HTMLElement {
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,                                         // z.B. "click"
    listener: (event: HTMLElementEventMap[K]) => void // MouseEvent fuer "click"
  ): void;
}

// Deshalb funktioniert das:
document.addEventListener("click", (event) => {
  console.log(event.clientX); // OK — TypeScript weiss: event ist MouseEvent
  // console.log(event.key);  // FEHLER! MouseEvent hat kein .key (das ist KeyboardEvent)
});
```

Das ist kein Zufall — genau dafuer wurden Template Literal Types entworfen. Du hast jetzt das Werkzeug, um solche APIs selbst zu bauen.

---

> **Experiment:** Probiere folgendes im TypeScript Playground:
>
> ```typescript
> interface ComponentEvents {
>   valueChange: string;
>   visibilityChange: boolean;
>   itemSelect: { id: number; label: string };
> }
>
> // Generiere automatisch die Handler-Props:
> type EventHandlerProps = {
>   [K in keyof ComponentEvents as `on${Capitalize<K & string>}`]:
>     (event: ComponentEvents[K]) => void;
> };
>
> // Hovere ueber EventHandlerProps — was entsteht?
>
> // Teste dann:
> function createComponent(props: EventHandlerProps) { /* ... */ }
>
> createComponent({
>   onValueChange: (value) => console.log(value),      // value: string?
>   onVisibilityChange: (visible) => console.log(visible), // visible: boolean?
>   onItemSelect: (item) => console.log(item.id),      // item.id: number?
> });
> ```
>
> Das ist genau das Pattern, das React fuer seine synthetischen Events verwendet. Was passiert, wenn du `onValueChange` weglaeesst?

---

## Angular-Bezug: EventEmitter und Output

In Angular-Komponenten kennst du `Output()` und `EventEmitter`. Das zugrundeliegende Typmuster ist eng verwandt:

```typescript
// Was Angular im Hintergrund tut (vereinfacht):
type OutputNames<T> = {
  [K in keyof T as `${K & string}Change`]: EventEmitter<T[K]>;
};

// In einer Angular-Komponente:
@Component({
  selector: 'app-user-form',
  template: `...`
})
export class UserFormComponent {
  @Output() nameChange = new EventEmitter<string>();
  @Output() avatarChange = new EventEmitter<string>();
  @Output() themeChange = new EventEmitter<"light" | "dark">();
}

// Das Parent-Component bindet:
// <app-user-form (nameChange)="onNameChange($event)"></app-user-form>
// TypeScript weiss: $event ist string — nicht any!

// Mit unserem EventNames-Typ koennte man das automatisch generieren:
type FormOutputs = EventNames<UserProfile>;
// {
//   nameChanged:   { previousValue: string;          newValue: string }
//   avatarChanged: { previousValue: string;           newValue: string }
//   themeChanged:  { previousValue: "light" | "dark"; newValue: "light" | "dark" }
// }
```

Angular selbst nutzt diese Konvention beim Two-Way-Binding: `[(value)]` erfordert sowohl ein `@Input() value` als auch ein `@Output() valueChange`. Das ist genau das `${K}Change`-Pattern — und TypeScript 4.1+ kann das vollstaendig typisiert abbilden.

---

## Was du gelernt hast

- Event-Namen lassen sich automatisch aus Interface-Keys ableiten: `nameChanged`, `themeChanged` usw. entstehen durch `as \`${K}Changed\``
- Ein typsicherer EventEmitter verwendet generische Constraints, um sicherzustellen dass `on(event, handler)` und `emit(event, data)` **immer zusammenpassen**
- Das DOM-API in `lib.dom.d.ts` verwendet exakt dieses Pattern fuer `addEventListener` — du hast jetzt das Handwerkszeug, um aehnliche APIs zu bauen
- Angular `@Output()` und Angulars Two-Way-Binding-Konvention (`valueChange`) folgen demselben Muster

> **Erklaere dir selbst:** In `emitter.on<E extends string & keyof Events>(event: E, handler: (data: Events[E]) => void)` — warum ist `Events[E]` der richtige Typ fuer den Handler-Parameter? Was passiert ohne diesen indexed access?
>
> **Kernpunkte:** `Events[E]` schaut den Payload-Typ fuer den konkreten Event-Namen nach | Wenn E = "user:login", dann Events[E] = { userId: string; timestamp: number } | Ohne Indexed Access muesste man den Payload-Typ manuell angeben | Das waere fehleranfaellig und kein echter Typsicherheitsgewinn

**Kernkonzept zum Merken:** Template Literal Types + generische Constraints + Indexed Access Types sind das Trio, das typsichere Event-Systeme ermoeglicht. Der Compiler kann automatisch pruefen: Ist dieser Event-Name gueltig? Und hat der Handler den richtigen Payload-Typ? Das sind genau die Fehler, die in manuell getippten Event-Systemen am haeufigsten passieren.

---

## Schnellreferenz: Event-Pattern im Ueberblick

Drei Varianten, wie du Event-Namen in TypeScript modellieren kannst — von einfach bis vollstaendig typsicher:

```typescript
// Variante 1: Einfach (keine Typsicherheit)
class SimpleEmitter {
  on(event: string, handler: (data: unknown) => void): void { /* ... */ }
  emit(event: string, data: unknown): void { /* ... */ }
}
// Vorteil: Einfach. Nachteil: Kein Fehler bei falschem Event-Namen oder Payload.

// Variante 2: Union fuer Event-Namen (halbe Typsicherheit)
type EventName = "user:login" | "user:logout" | "data:refresh";
class TypedEmitter {
  on(event: EventName, handler: (data: unknown) => void): void { /* ... */ }
}
// Vorteil: Falsche Event-Namen werden erkannt.
// Nachteil: Payload ist immer unknown — kein Schutz vor falschen Eigenschaften.

// Variante 3: Vollstaendig typsicher (unser EventEmitter)
class SafeEmitter<Events extends Record<string, unknown>> {
  on<E extends string & keyof Events>(
    event: E,
    handler: (data: Events[E]) => void
  ): void { /* ... */ }
}
// Vorteil: Event-Name UND Payload sind typsicher.
// Nachteil: Etwas mehr Setup — der Events-Katalog muss definiert werden.
```

In der Praxis wirst du fast immer Variante 3 anstreben. Das Setup ist minimal, und der Gewinn ist enorm: Du kannst niemals den falschen Event-Namen schreiben oder den falschen Payload senden.

---

> **Pausenpunkt** — Du hast jetzt das tiefste Pattern dieser Lektion gesehen. Bevor du weiterliest: Kannst du erklaeren, warum `emitter.on("user:login", (data) => { data.userId })` ohne explizite Typ-Annotation funktioniert? TypeScript inferiert den Typ von `data` automatisch — aus welcher Information?
>
> Weiter geht es mit: [Sektion 05: Praxis-Patterns](./05-praxis-patterns.md)
