/**
 * Lektion 16 - Loesung 05: Praxis-Patterns
 */

// AUFGABE 1: FormState System
type FormErrors<T> = { [K in keyof T]?: string };
type FormTouched<T> = { [K in keyof T]: boolean };
type FormDirty<T> = { [K in keyof T]: boolean };

interface FormState<T> {
  values: T;
  errors: FormErrors<T>;
  touched: FormTouched<T>;
  dirty: FormDirty<T>;
  isValid: boolean;
  isSubmitting: boolean;
}

function initFormState<T>(initial: T): FormState<T> {
  const touched = {} as FormTouched<T>;
  const dirty = {} as FormDirty<T>;
  for (const key of Object.keys(initial as any) as (keyof T)[]) {
    touched[key] = false as any;
    dirty[key] = false as any;
  }
  return { values: initial, errors: {}, touched, dirty, isValid: false, isSubmitting: false };
}

// AUFGABE 2: API DTO System
interface BaseEntity { id: string; createdAt: Date; updatedAt: Date; }

type CreateDTO<T extends BaseEntity> = Omit<T, keyof BaseEntity>;
type UpdateDTO<T extends BaseEntity> = Partial<Omit<T, keyof BaseEntity>>;
type ResponseDTO<T extends BaseEntity> = {
  [K in keyof T]: T[K] extends Date ? string : T[K];
};

interface Article extends BaseEntity { title: string; content: string; published: boolean; }
type CreateArticle = CreateDTO<Article>;
type UpdateArticle = UpdateDTO<Article>;
type ArticleResponse = ResponseDTO<Article>;

// AUFGABE 3: WithAccessors
type WithAccessors<T> = T & {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
} & {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
};

function createAccessible<T extends Record<string, unknown>>(obj: T): WithAccessors<T> {
  const result: any = { ...obj };
  for (const key of Object.keys(obj)) {
    const cap = key.charAt(0).toUpperCase() + key.slice(1);
    result[`get${cap}`] = () => result[key];
    result[`set${cap}`] = (v: unknown) => { result[key] = v; };
  }
  return result;
}

// AUFGABE 4: EventMap
type EventMap<T> = {
  [K in keyof T as `${string & K}Changed`]: {
    previousValue: T[K];
    newValue: T[K];
  };
};

function makeObservable<T extends Record<string, unknown>>(
  obj: T,
  onEvent: <K extends keyof EventMap<T>>(event: K, data: EventMap<T>[K]) => void,
): T {
  return new Proxy(obj, {
    set(target, prop, value) {
      const prev = (target as any)[prop];
      (target as any)[prop] = value;
      onEvent(`${String(prop)}Changed` as any, { previousValue: prev, newValue: value } as any);
      return true;
    },
  });
}

// AUFGABE 5: ConfigSchema
type ConfigSchema<T> = {
  [K in keyof T]: {
    value: T[K];
    default: T[K];
    description: string;
    required: boolean;
  };
};

function createConfig<T>(schema: ConfigSchema<T>): T {
  const result = {} as T;
  for (const key of Object.keys(schema) as (keyof T)[]) {
    result[key] = (schema[key] as any).value ?? (schema[key] as any).default;
  }
  return result;
}

// Test:
const form = initFormState({ username: "", email: "", password: "", age: 0 });
console.log("Form State:", form);

const point = createAccessible({ x: 10, y: 20 });
console.log("Accessible point:", point);

console.log("Praxis-Patterns Solutions completed.");
