// Example 03: Option/Maybe Pattern
// Ausführen: npx tsx examples/03-option-maybe.ts

// Option 1: T | null (pragmatisch)
type Option<T> = T | null;

const users: Map<string, { name: string; age: number }> = new Map([
  ['u1', { name: 'Max', age: 30 }],
  ['u2', { name: 'Anna', age: 16 }],
]);

function findUser(id: string): Option<{ name: string; age: number }> {
  return users.get(id) ?? null;
}

console.log('--- T | null Option ---');
const user1 = findUser('u1');
const user2 = findUser('unknown');
console.log(user1 ? user1.name : 'Nicht gefunden'); // Max
console.log(user2 ? user2.name : 'Nicht gefunden'); // Nicht gefunden
console.log(user1?.name?.toUpperCase()); // MAX (optional chaining)
console.log(user2 ?? 'Fallback');        // null >> 'Fallback'

// Option 2: Maybe<T> (Some/None Discriminated Union)
type Some<T> = { readonly kind: 'some'; readonly value: T };
type None    = { readonly kind: 'none' };
type Maybe<T> = Some<T> | None;

const some = <T>(value: T): Some<T> => ({ kind: 'some', value });
const none: None = Object.freeze({ kind: 'none' as const });

// Helfer:
function mapMaybe<T, U>(maybe: Maybe<T>, fn: (v: T) => U): Maybe<U> {
  return maybe.kind === 'none' ? none : some(fn(maybe.value));
}

function flatMapMaybe<T, U>(maybe: Maybe<T>, fn: (v: T) => Maybe<U>): Maybe<U> {
  return maybe.kind === 'none' ? none : fn(maybe.value);
}

function getOrElse<T>(maybe: Maybe<T>, def: T): T {
  return maybe.kind === 'some' ? maybe.value : def;
}

function fromNullable<T>(value: T | null | undefined): Maybe<T> {
  return value != null ? some(value) : none;
}

function filterMaybe<T>(maybe: Maybe<T>, pred: (v: T) => boolean): Maybe<T> {
  if (maybe.kind === 'none') return none;
  return pred(maybe.value) ? maybe : none;
}

// Usage:
function findUserMaybe(id: string): Maybe<{ name: string; age: number }> {
  return fromNullable(users.get(id));
}

console.log('\n--- Maybe<T> Demo ---');
// Kette: find → filter adult → get name
const adultName = getOrElse(
  mapMaybe(
    filterMaybe(findUserMaybe('u1'), u => u.age >= 18),
    u => u.name
  ),
  'Minderjährig oder nicht gefunden'
);
console.log('Adult u1:', adultName); // Max

const minorName = getOrElse(
  mapMaybe(
    filterMaybe(findUserMaybe('u2'), u => u.age >= 18),  // Anna ist 16 → none
    u => u.name
  ),
  'Minderjährig oder nicht gefunden'
);
console.log('Adult u2:', minorName); // Minderjährig oder nicht gefunden

const missing = getOrElse(findUserMaybe('x'), { name: 'Unbekannt', age: 0 });
console.log('Missing:', missing.name); // Unbekannt

console.log('\n✅ Option/Maybe Demo fertig!');
