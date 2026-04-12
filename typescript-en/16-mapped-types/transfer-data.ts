/**
 * Lesson 16 — Transfer Tasks: Mapped Types
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

export const transferTasks: TransferTask[] = [
  {
    id: "16-reactive-store",
    title: "Reactive Store with Mapped Types",
    prerequisiteLessons: [15, 16],
    scenario:
      "You are building a state management store (similar to Zustand/Pinia). " +
      "The store should automatically generate getters, setters, and change events " +
      "for each property. Currently everything is defined manually — " +
      "with 20 properties that means 60 additional definitions.",
    task:
      "Create a type-safe reactive store:\n\n" +
      "1. Define StoreGetters<T>, StoreSetters<T>, StoreEvents<T> as mapped types\n" +
      "2. Build a createStore<T>(initial: T) that returns an object with\n" +
      "   values, getters, setters, and subscribe\n" +
      "3. All event names and payload types should be derived from T\n" +
      "4. Demonstrate with a UserStore (name, email, theme)",
    starterCode: [
      "// TODO: StoreGetters<T>, StoreSetters<T>, StoreEvents<T> mapped types",
      "// TODO: createStore<T>(initial: T) function",
      "// TODO: demonstrate UserStore",
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
      "Key remapping with template literals",
      "Getter/setter generation",
      "Event system with mapped types",
      "createStore pattern (Zustand/Pinia-inspired)",
    ],
    estimatedMinutes: 25,
    difficulty: 4,
  },
  {
    id: "16-api-layer",
    title: "Type-Safe API Layer with Mapped Types",
    prerequisiteLessons: [15, 16],
    scenario:
      "Your project has 15 entity types (User, Product, Order, etc.) and " +
      "each one needs CreateDTO, UpdateDTO, ResponseDTO, ListResponseDTO. " +
      "That's 60 manually defined types that must be kept in sync " +
      "with every change.",
    task:
      "Create a generic API DTO system:\n\n" +
      "1. Define BaseEntity with id, createdAt, updatedAt\n" +
      "2. Create CreateDTO<T>, UpdateDTO<T>, ResponseDTO<T>, ListResponseDTO<T>\n" +
      "3. ResponseDTO should convert Date fields to string\n" +
      "4. Create an ApiClient<T> with type-safe CRUD methods\n" +
      "5. Demonstrate with User and Product entities",
    starterCode: [
      "// TODO: BaseEntity, CreateDTO, UpdateDTO, ResponseDTO, ListResponseDTO",
      "// TODO: ApiClient<T extends BaseEntity>",
      "// TODO: User and Product entities",
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
      "// All 4 DTOs + ApiClient are derived from the entity type!",
      "declare const userApi: ApiClient<User>;",
      "declare const productApi: ApiClient<Product>;",
    ].join("\n"),
    conceptsBridged: [
      "Omit/Partial combination for DTOs",
      "Conditional mapped types for Date->string conversion",
      "Generic ApiClient based on entity type",
      "One entity -> many derived types",
    ],
    estimatedMinutes: 20,
    difficulty: 3,
  },
];