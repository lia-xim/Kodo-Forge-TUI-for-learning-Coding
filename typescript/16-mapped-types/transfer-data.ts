/**
 * Lektion 16 — Transfer Tasks: Mapped Types
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

export const transferTasks: TransferTask[] = [
  {
    id: "16-reactive-store",
    title: "Reaktiver Store mit Mapped Types",
    prerequisiteLessons: [15, 16],
    scenario:
      "Du baust einen State-Management-Store (aehnlich Zustand/Pinia). " +
      "Der Store soll automatisch Getter, Setter und Change-Events " +
      "fuer jede Property generieren. Bisher wird alles manuell definiert — " +
      "bei 20 Properties sind das 60 zusaetzliche Definitionen.",
    task:
      "Erstelle einen typsicheren reaktiven Store:\n\n" +
      "1. Definiere StoreGetters<T>, StoreSetters<T>, StoreEvents<T> als Mapped Types\n" +
      "2. Baue einen createStore<T>(initial: T) der ein Objekt mit\n" +
      "   values, getters, setters und subscribe zurueckgibt\n" +
      "3. Alle Event-Namen und Payload-Typen sollen aus T abgeleitet werden\n" +
      "4. Demonstriere mit einem UserStore (name, email, theme)",
    starterCode: [
      "// TODO: StoreGetters<T>, StoreSetters<T>, StoreEvents<T> Mapped Types",
      "// TODO: createStore<T>(initial: T) Funktion",
      "// TODO: UserStore demonstrieren",
    ].join("\n"),
    solutionCode: [
      "type StoreGetters<T> = {",
      "  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];",
      "};",
      "",
      "type StoreSetters<T> = {",
      "  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;",
      "};",
      "",
      "type StoreEvents<T> = {",
      "  [K in keyof T as `${string & K}Changed`]: {",
      "    previousValue: T[K]; newValue: T[K];",
      "  };",
      "};",
      "",
      "type Store<T> = {",
      "  values: T;",
      "  getters: StoreGetters<T>;",
      "  setters: StoreSetters<T>;",
      "  subscribe: <K extends keyof StoreEvents<T>>(event: K, handler: (data: StoreEvents<T>[K]) => void) => () => void;",
      "};",
      "",
      "function createStore<T extends Record<string, unknown>>(initial: T): Store<T> {",
      "  const state = { ...initial };",
      "  const listeners = new Map<string, Function[]>();",
      "  const getters: any = {};",
      "  const setters: any = {};",
      "  for (const key of Object.keys(initial)) {",
      "    const cap = key.charAt(0).toUpperCase() + key.slice(1);",
      "    getters[`get${cap}`] = () => state[key as keyof T];",
      "    setters[`set${cap}`] = (value: unknown) => {",
      "      const prev = state[key as keyof T];",
      "      (state as any)[key] = value;",
      "      (listeners.get(`${key}Changed`) ?? []).forEach(fn => fn({ previousValue: prev, newValue: value }));",
      "    };",
      "  }",
      "  return {",
      "    values: state,",
      "    getters,",
      "    setters,",
      "    subscribe: (event: string, handler: Function) => {",
      "      const fns = listeners.get(event) ?? [];",
      "      fns.push(handler);",
      "      listeners.set(event, fns);",
      "      return () => { const arr = listeners.get(event)!; arr.splice(arr.indexOf(handler), 1); };",
      "    },",
      "  } as Store<T>;",
      "}",
      "",
      "const store = createStore({ name: 'Max', email: 'max@test.de', theme: 'dark' as 'light' | 'dark' });",
      "store.subscribe('nameChanged', (e) => console.log('Name:', e.previousValue, '->', e.newValue));",
      "store.setters.setName('Moritz');",
    ].join("\n"),
    conceptsBridged: [
      "Key Remapping mit Template Literals",
      "Getter/Setter Generierung",
      "Event-System mit Mapped Types",
      "createStore Pattern (Zustand/Pinia-inspiriert)",
    ],
    estimatedMinutes: 25,
    difficulty: 4,
  },
  {
    id: "16-api-layer",
    title: "Typsichere API-Schicht mit Mapped Types",
    prerequisiteLessons: [15, 16],
    scenario:
      "Dein Projekt hat 15 Entity-Typen (User, Product, Order, etc.) und " +
      "jeder braucht CreateDTO, UpdateDTO, ResponseDTO, ListResponseDTO. " +
      "Das sind 60 manuell definierte Typen die bei jeder Aenderung " +
      "synchron gehalten werden muessen.",
    task:
      "Erstelle ein generisches API-DTO-System:\n\n" +
      "1. Definiere BaseEntity mit id, createdAt, updatedAt\n" +
      "2. Erstelle CreateDTO<T>, UpdateDTO<T>, ResponseDTO<T>, ListResponseDTO<T>\n" +
      "3. ResponseDTO soll Date-Felder zu string konvertieren\n" +
      "4. Erstelle einen ApiClient<T> mit typsicheren CRUD-Methoden\n" +
      "5. Demonstriere mit User und Product Entities",
    starterCode: [
      "// TODO: BaseEntity, CreateDTO, UpdateDTO, ResponseDTO, ListResponseDTO",
      "// TODO: ApiClient<T extends BaseEntity>",
      "// TODO: User und Product Entities",
    ].join("\n"),
    solutionCode: [
      "interface BaseEntity { id: string; createdAt: Date; updatedAt: Date; }",
      "",
      "type CreateDTO<T extends BaseEntity> = Omit<T, keyof BaseEntity>;",
      "type UpdateDTO<T extends BaseEntity> = Partial<Omit<T, keyof BaseEntity>>;",
      "type ResponseDTO<T extends BaseEntity> = {",
      "  [K in keyof T]: T[K] extends Date ? string : T[K];",
      "};",
      "type ListResponseDTO<T extends BaseEntity> = {",
      "  items: ResponseDTO<T>[]; total: number; page: number; pageSize: number;",
      "};",
      "",
      "interface ApiClient<T extends BaseEntity> {",
      "  getAll(page?: number): Promise<ListResponseDTO<T>>;",
      "  getById(id: string): Promise<ResponseDTO<T>>;",
      "  create(data: CreateDTO<T>): Promise<ResponseDTO<T>>;",
      "  update(id: string, data: UpdateDTO<T>): Promise<ResponseDTO<T>>;",
      "  delete(id: string): Promise<void>;",
      "}",
      "",
      "interface User extends BaseEntity { name: string; email: string; role: 'admin' | 'user'; }",
      "interface Product extends BaseEntity { name: string; price: number; category: string; }",
      "",
      "// Alle 4 DTOs + ApiClient werden aus dem Entity-Typ abgeleitet!",
      "declare const userApi: ApiClient<User>;",
      "declare const productApi: ApiClient<Product>;",
    ].join("\n"),
    conceptsBridged: [
      "Omit/Partial Kombination fuer DTOs",
      "Conditional Mapped Types fuer Date->string Konvertierung",
      "Generischer ApiClient basierend auf Entity-Typ",
      "Ein Entity -> viele abgeleitete Typen",
    ],
    estimatedMinutes: 20,
    difficulty: 3,
  },
];
