# Sektion 4: Typsichere Event-Systeme

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Pattern Matching](./03-pattern-matching.md)
> Naechste Sektion: [05 - Praxis-Patterns](./05-praxis-patterns.md)

---

## Was du hier lernst

- Event-Namen aus Datentypen ableiten
- Handler-Signaturen automatisch generieren
- DOM-Event-Patterns nachbauen
- on/emit mit korrekter Typisierung

---

## Event-Namen aus Properties ableiten

```typescript
type EventNames<T> = {
  [K in keyof T & string as `${K}Changed`]: {
    previousValue: T[K];
    newValue: T[K];
  };
};

interface UserProfile {
  name: string;
  avatar: string;
  theme: "light" | "dark";
}

type Events = EventNames<UserProfile>;
// {
//   nameChanged: { previousValue: string; newValue: string; };
//   avatarChanged: { previousValue: string; newValue: string; };
//   themeChanged: { previousValue: "light" | "dark"; newValue: "light" | "dark"; };
// }
```

---

## on/emit mit Template Literal Constraints

```typescript
class EventEmitter<Events extends Record<string, unknown>> {
  private handlers = new Map<string, Function[]>();

  on<E extends string & keyof Events>(
    event: E,
    handler: (data: Events[E]) => void
  ): void {
    const list = this.handlers.get(event) ?? [];
    list.push(handler);
    this.handlers.set(event, list);
  }

  emit<E extends string & keyof Events>(
    event: E,
    data: Events[E]
  ): void {
    (this.handlers.get(event) ?? []).forEach(fn => fn(data));
  }
}

// Verwendung:
interface AppEvents {
  "user:login": { userId: string };
  "user:logout": { reason: string };
  "data:refresh": { source: string; timestamp: number };
}

const emitter = new EventEmitter<AppEvents>();
emitter.on("user:login", (data) => {
  console.log(data.userId); // typsicher!
});
```

---

## DOM-Event Pattern

```typescript
type DOMEventMap = {
  click: MouseEvent;
  keydown: KeyboardEvent;
  resize: UIEvent;
  scroll: Event;
};

type OnEvent = `on${Capitalize<keyof DOMEventMap & string>}`;
// "onClick" | "onKeydown" | "onResize" | "onScroll"

type EventHandlerMap = {
  [K in keyof DOMEventMap as `on${Capitalize<K & string>}`]:
    (event: DOMEventMap[K]) => void;
};
// {
//   onClick: (event: MouseEvent) => void;
//   onKeydown: (event: KeyboardEvent) => void;
//   ...
// }
```

---

## Pausenpunkt

**Kernerkenntnisse:**
- Template Literal Types + Mapped Types = automatische Event-Namen
- on/emit mit generischen Constraints fuer Event-Name + Payload
- DOM-Event-Pattern nachbaubar mit Capitalize

> **Weiter:** [Sektion 05 - Praxis-Patterns](./05-praxis-patterns.md)
