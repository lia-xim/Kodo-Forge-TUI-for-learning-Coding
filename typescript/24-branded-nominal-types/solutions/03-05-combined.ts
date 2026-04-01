// Lösung 03-05 (zusammengefasst für Kürze)
// Solutions für Exercises 3, 4, 5

// ─── Lösung 03: Physikalische Einheiten ─────────────────────────

type Brand<T, B extends string> = T & { readonly __brand: B };

type Meter           = Brand<number, 'Meter'>;
type Kilogram        = Brand<number, 'Kilogram'>;
type Second          = Brand<number, 'Second'>;
type MeterPerSecond  = Brand<number, 'MeterPerSecond'>;
type Foot            = Brand<number, 'Foot'>;
type Pound           = Brand<number, 'Pound'>;

function createMeter(n: number): Meter {
  if (n < 0) throw new Error(`Negative Länge: ${n}`);
  return n as Meter;
}

function createKilogram(n: number): Kilogram {
  if (n <= 0) throw new Error(`Gewicht muss positiv sein: ${n}`);
  return n as Kilogram;
}

function createSecond(n: number): Second {
  if (n <= 0) throw new Error(`Zeit muss positiv sein: ${n}`);
  return n as Second;
}

function velocity(distance: Meter, time: Second): MeterPerSecond {
  return (distance / time) as MeterPerSecond;
}

function kineticEnergy(mass: Kilogram, v: MeterPerSecond): number {
  return 0.5 * mass * v * v;
}

// Demo:
const distance = createMeter(100);
const time     = createSecond(10);
const mass     = createKilogram(1000);

const v   = velocity(distance, time);      // 10 m/s
const Ekin = kineticEnergy(mass, v);        // 50000 J

console.log(`Geschwindigkeit: ${v} m/s`);
console.log(`Kinetische Energie: ${Ekin} J (= ${Ekin/1000} kJ)`);

// Bonus: Konversion
function meterToFoot(m: Meter): Foot     { return (m * 3.28084) as Foot; }
function kilogramToPound(k: Kilogram): Pound { return (k * 2.20462) as Pound; }

console.log(`100 m = ${meterToFoot(distance).toFixed(2)} ft`);

// ─── Lösung 04: Multi-Step Validierung ──────────────────────────

type Trimmed   = { readonly __trimmed: true };
type NonEmpty  = { readonly __nonEmpty: true };
type Lowercase = { readonly __lowercase: true };
type TrimmedString = string & Trimmed;
type SearchQuery   = string & Trimmed & NonEmpty & Lowercase;

function trim(s: string): TrimmedString {
  return s.trim() as TrimmedString;
}

function assertNonEmpty(s: TrimmedString): string & Trimmed & NonEmpty {
  if (s.length === 0) throw new Error('String darf nicht leer sein');
  return s as string & Trimmed & NonEmpty;
}

function toLowercase(s: string & Trimmed & NonEmpty): SearchQuery {
  return s.toLowerCase() as SearchQuery;
}

function createSearchQuery(input: string): SearchQuery | null {
  const trimmed = trim(input);
  if (trimmed.length === 0) return null;
  return toLowercase(assertNonEmpty(trimmed));
}

function searchProducts(query: SearchQuery): void {
  console.log(`\nSuche: "${query}"`);
}

const q = createSearchQuery("  TypeScript GENERICS  ");
if (q) searchProducts(q); // "typescript generics"

// ─── Lösung 05: ID-System für Repository ────────────────────────

type Id<Entity extends string> = string & { readonly __idType: Entity };
type UserId2    = Id<'User'>;
type ArticleId  = Id<'Article'>;
type CommentId  = Id<'Comment'>;

interface User2    { id: UserId2; name: string; email: string; }
interface Article  { id: ArticleId; title: string; authorId: UserId2; content: string; }
interface Comment  { id: CommentId; authorId: UserId2; articleId: ArticleId; text: string; }

interface Repository<T extends { id: Id<TId> }, TId extends string> {
  findById(id: Id<TId>): T | undefined;
  findAll(): T[];
  save(entity: T): void;
  delete(id: Id<TId>): boolean;
}

class InMemoryRepository<T extends { id: Id<TId> }, TId extends string>
  implements Repository<T, TId> {
  private store = new Map<string, T>();

  findById(id: Id<TId>): T | undefined {
    return this.store.get(id as string);
  }

  findAll(): T[] {
    return Array.from(this.store.values());
  }

  save(entity: T): void {
    this.store.set(entity.id as string, entity);
  }

  delete(id: Id<TId>): boolean {
    return this.store.delete(id as string);
  }
}

// Repositories:
const userRepo    = new InMemoryRepository<User2, 'User'>();
const articleRepo = new InMemoryRepository<Article, 'Article'>();

const user: User2 = {
  id: 'user-001' as UserId2,
  name: 'Max',
  email: 'max@example.com'
};

userRepo.save(user);
const found = userRepo.findById('user-001' as UserId2);
console.log(`\nRepository: ${found?.name}`); // Max

// COMPILE-ERRORS:
// userRepo.findById('art-001' as ArticleId); // ❌ ArticleId ≠ Id<'User'>

console.log('\n✅ Alle Lösungen erfolgreich!');
