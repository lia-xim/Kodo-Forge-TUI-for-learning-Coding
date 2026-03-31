/**
 * Lektion 18 - Beispiel 04: Typsichere Event-Systeme
 */

type EventMap<T> = {
  [K in keyof T & string as `${K}Changed`]: { previousValue: T[K]; newValue: T[K] };
};

interface Settings { theme: "light" | "dark"; fontSize: number; language: string; }
type SettingsEvents = EventMap<Settings>;

class TypedEmitter<Events extends Record<string, unknown>> {
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

const emitter = new TypedEmitter<SettingsEvents>();
emitter.on("themeChanged", (data) => {
  console.log("Theme:", data.previousValue, "->", data.newValue);
});
emitter.emit("themeChanged", { previousValue: "light", newValue: "dark" });
