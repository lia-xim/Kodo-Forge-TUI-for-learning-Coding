/**
 * L20 - Exercise 05: Refactoring to Types
 * Refactore den any-Code zu typsicherem Code.
 */

// AUFGABE 1: Refactore diese Funktion
function processData(data: any): any {
  if (data.type === "user") return { name: data.name, email: data.email };
  if (data.type === "product") return { title: data.title, price: data.price };
  return null;
}
// -> Discriminated Union + typsichere Return Types

// AUFGABE 2: Refactore diesen Event Handler
const handlers: Record<string, Function> = {};
function on(event: string, handler: Function) { handlers[event] = handler; }
function emit(event: string, data: any) { handlers[event]?.(data); }
// -> Generischen TypedEmitter mit typsicheren Events

// AUFGABE 3: Refactore diese API-Funktionen
async function getUser(id: string): Promise<any> { return fetch(`/api/users/${id}`).then(r => r.json()); }
async function createUser(data: any): Promise<any> { return fetch('/api/users', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()); }
// -> Generischen ApiClient<T> mit DTOs

// AUFGABE 4: Refactore diese Config
const config: any = { host: "localhost", port: 3000, debug: true };
function getConfig(key: string): any { return (config as any)[key]; }
// -> Typsicheres Config-System mit keyof

// AUFGABE 5: Refactore diesen Validator
function validate(data: any, rules: any): any {
  const errors: any = {};
  for (const key of Object.keys(rules)) {
    if (rules[key].required && !data[key]) errors[key] = "Required";
  }
  return errors;
}
// -> Generischen validate<T> mit korrekten Typen
