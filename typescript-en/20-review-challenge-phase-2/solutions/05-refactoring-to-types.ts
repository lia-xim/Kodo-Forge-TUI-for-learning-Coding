/**
 * L20 - Loesung 05: Refactoring to Types
 */

// AUFGABE 1
type UserData = { type: "user"; name: string; email: string };
type ProductData = { type: "product"; title: string; price: number };
type ProcessData = UserData | ProductData;

function processData(data: ProcessData) {
  switch (data.type) {
    case "user": return { name: data.name, email: data.email };
    case "product": return { title: data.title, price: data.price };
  }
}

// AUFGABE 2
class TypedEmitter<Events extends Record<string, unknown>> {
  private handlers = new Map<string, Function[]>();
  on<E extends keyof Events & string>(event: E, handler: (data: Events[E]) => void): void {
    const list = this.handlers.get(event) ?? [];
    list.push(handler);
    this.handlers.set(event, list);
  }
  emit<E extends keyof Events & string>(event: E, data: Events[E]): void {
    (this.handlers.get(event) ?? []).forEach(fn => fn(data));
  }
}

// AUFGABE 3
interface Entity { id: string; }
interface ApiClient<T extends Entity> {
  get(id: string): Promise<T>;
  create(data: Omit<T, "id">): Promise<T>;
}

// AUFGABE 4
interface AppConfig { host: string; port: number; debug: boolean; }
const config: AppConfig = { host: "localhost", port: 3000, debug: true };
function getConfig<K extends keyof AppConfig>(key: K): AppConfig[K] { return config[key]; }

// AUFGABE 5
type Rules<T> = { [K in keyof T]?: { required?: boolean } };
type Errors<T> = Partial<Record<keyof T, string>>;
function validate<T extends Record<string, unknown>>(data: T, rules: Rules<T>): Errors<T> {
  const errors: Errors<T> = {};
  for (const key of Object.keys(rules) as (keyof T)[]) {
    if (rules[key]?.required && !data[key]) (errors as any)[key] = "Required";
  }
  return errors;
}

export { processData, TypedEmitter, getConfig, validate };
