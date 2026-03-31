/**
 * L20 - Loesung 02: Real-World Types
 */
interface BaseEntity { id: string; createdAt: Date; updatedAt: Date; }
type CreateDTO<T extends BaseEntity> = Omit<T, keyof BaseEntity>;
type UpdateDTO<T extends BaseEntity> = Partial<Omit<T, keyof BaseEntity>>;
type ResponseDTO<T extends BaseEntity> = { [K in keyof T]: T[K] extends Date ? string : T[K] };

interface ApiClient<T extends BaseEntity> {
  getAll(): Promise<ResponseDTO<T>[]>;
  getById(id: string): Promise<ResponseDTO<T>>;
  create(data: CreateDTO<T>): Promise<ResponseDTO<T>>;
  update(id: string, data: UpdateDTO<T>): Promise<ResponseDTO<T>>;
  delete(id: string): Promise<void>;
}

type ValidationRule<T> = { [K in keyof T]?: { required?: boolean; min?: number; custom?: (v: T[K]) => string | null } };
type ValidationErrors<T> = Partial<Record<keyof T, string[]>>;

function validate<T extends Record<string, unknown>>(data: T, rules: ValidationRule<T>): ValidationErrors<T> {
  const errors: ValidationErrors<T> = {};
  for (const key of Object.keys(rules) as (keyof T)[]) {
    const rule = rules[key];
    if (!rule) continue;
    const fieldErrors: string[] = [];
    if (rule.required && !data[key]) fieldErrors.push("Pflichtfeld");
    if (fieldErrors.length > 0) (errors as any)[key] = fieldErrors;
  }
  return errors;
}

export { validate };
