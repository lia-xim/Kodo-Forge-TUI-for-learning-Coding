/**
 * Lektion 18 - Loesung 04
 */
type EventMap<T> = {
  [K in keyof T & string as `${K}Changed`]: { previousValue: T[K]; newValue: T[K] };
};

type OnHandlers<T extends Record<string, unknown>> = {
  [K in keyof T & string as `on${Capitalize<K>}`]: (data: T[K]) => void;
};

class EventEmitter<Events extends Record<string, unknown>> {
  private handlers = new Map<string, Function[]>();
  on<E extends string & keyof Events>(event: E, handler: (data: Events[E]) => void): void {
    const list = this.handlers.get(event) ?? [];
    list.push(handler);
    this.handlers.set(event, list);
  }
  emit<E extends string & keyof Events>(event: E, data: Events[E]): void {
    (this.handlers.get(event) ?? []).forEach(fn => fn(data));
  }
}

type ComponentEvents<Props> = {
  [K in keyof Props & string as `on${Capitalize<K>}Change`]: (newValue: Props[K]) => void;
};
