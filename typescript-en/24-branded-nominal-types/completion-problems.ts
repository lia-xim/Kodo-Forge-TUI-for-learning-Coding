// completion-problems.ts — L24: Branded/Nominal Types
// 6 Completion Problems with increasing difficulty

export interface CompletionProblem {
  id: number;
  title: string;
  description: string;
  template: string;
  blanks: string[];
  solution: string;
  hint: string;
}

export const completionProblems: CompletionProblem[] = [
  {
    id: 1,
    title: "Define Brand Type",
    description: "Define the generic brand helper and a UserId brand type.",
    template: `// Generic brand helper:
type Brand<T, B extends ___> = T & { readonly __brand: ___ };

// UserId brand type:
type UserId = ___ & { readonly __brand: ___ };`,
    blanks: ["string", "B", "string", "'UserId'"],
    solution: `type Brand<T, B extends string> = T & { readonly __brand: B };
type UserId = string & { readonly __brand: 'UserId' };`,
    hint: "Brand<T, B extends string> — B must be a string literal. __brand: B means the property contains B as its value."
  },
  {
    id: 2,
    title: "Write a Smart Constructor",
    description: "Complete the smart constructor for UserId.",
    template: `type UserId = string & { readonly __brand: 'UserId' };

function createUserId(raw: ___): UserId {
  if (!raw || raw.trim().___ < 5) {
    throw new Error(\`Invalid UserId: "\${raw}"\`);
  }
  return raw.___ as ___;
}`,
    blanks: ["string", "length", "trim()", "UserId"],
    solution: `function createUserId(raw: string): UserId {
  if (!raw || raw.trim().length < 5) {
    throw new Error(\`Invalid UserId: "\${raw}"\`);
  }
  return raw.trim() as UserId;
}`,
    hint: "Parameter is string, validate with .length, finish with: as UserId (the only allowed place)"
  },
  {
    id: 3,
    title: "Build a Brand Hierarchy",
    description: "Create Email and VerifiedEmail as a hierarchy.",
    template: `type Email        = string & { readonly __brand: ___ };
type VerifiedEmail = ___ & { readonly __verified: ___ };

// VerifiedEmail is a subtype of Email:
function sendEmail(to: ___): void {}
function sendCritical(to: VerifiedEmail): void {}

const verified: VerifiedEmail = 'v@x.com' as ___;
sendEmail(___); // ✅ VerifiedEmail can be used as Email`,
    blanks: ["'Email'", "Email", "true", "Email", "VerifiedEmail", "verified"],
    solution: `type Email        = string & { readonly __brand: 'Email' };
type VerifiedEmail = Email & { readonly __verified: true };

function sendEmail(to: Email): void {}
function sendCritical(to: VerifiedEmail): void {}

const verified: VerifiedEmail = 'v@x.com' as VerifiedEmail;
sendEmail(verified); // ✅`,
    hint: "VerifiedEmail extends Email through intersection. As a subtype, it can be used anywhere Email is expected."
  },
  {
    id: 4,
    title: "Generic Id Type with Repository",
    description: "Complete the generic ID type and the Repository interface.",
    template: `type Id<Entity extends ___> = string & { readonly __idType: ___ };
type UserId   = Id<___>;
type OrderId  = Id<___>;

interface Repository<T, TId extends string> {
  findById(id: ___<TId>): T | undefined;
  delete(id: Id<TId>): ___;
}`,
    blanks: ["string", "Entity", "'User'", "'Order'", "Id", "boolean"],
    solution: `type Id<Entity extends string> = string & { readonly __idType: Entity };
type UserId  = Id<'User'>;
type OrderId = Id<'Order'>;

interface Repository<T, TId extends string> {
  findById(id: Id<TId>): T | undefined;
  delete(id: Id<TId>): boolean;
}`,
    hint: "Id<Entity> — Entity is the type parameter, the generic type for the entity. Id<'User'> and Id<'Order'> have different __idType values."
  },
  {
    id: 5,
    title: "Multi-Brand Combination",
    description: "Complete the multi-step validation pipeline.",
    template: `type Trimmed  = { readonly __trimmed: true };
type NonEmpty = { readonly __nonEmpty: true };
type TrimmedString = string & ___;

function trim(s: string): ___ {
  return s.trim() as TrimmedString;
}

function assertNonEmpty(s: TrimmedString): string & Trimmed & ___ {
  if (s.___ === 0) throw new Error('Empty!');
  return s as string & Trimmed & NonEmpty;
}

type SearchQuery = string & ___ & NonEmpty;`,
    blanks: ["Trimmed", "TrimmedString", "NonEmpty", "length", "Trimmed"],
    solution: `type TrimmedString = string & Trimmed;

function trim(s: string): TrimmedString {
  return s.trim() as TrimmedString;
}

function assertNonEmpty(s: TrimmedString): string & Trimmed & NonEmpty {
  if (s.length === 0) throw new Error('Empty!');
  return s as string & Trimmed & NonEmpty;
}

type SearchQuery = string & Trimmed & NonEmpty;`,
    hint: "TrimmedString = string & Trimmed. The chain: string → TrimmedString → string & Trimmed & NonEmpty."
  },
  {
    id: 6,
    title: "Complete Currency System",
    description: "Complete the type-safe currency system.",
    template: `type Currency = 'EUR' | 'USD';
type MoneyAmount<C extends ___> = number & {
  readonly __currency: ___;
  readonly __cents: ___;
};
type EurCents = MoneyAmount<___>;

function addMoney<C extends Currency>(
  a: MoneyAmount<___>,
  b: ___<C>
): MoneyAmount<C> {
  return (a + b) as ___;
}

function formatMoney<C extends Currency>(
  amount: MoneyAmount<C>,
  currency: ___
): string {
  return \`\${(amount / 100).toFixed(2)} \${currency}\`;
}`,
    blanks: ["Currency", "C", "true", "'EUR'", "C", "MoneyAmount", "MoneyAmount<C>", "C"],
    solution: `type MoneyAmount<C extends Currency> = number & {
  readonly __currency: C;
  readonly __cents: true;
};
type EurCents = MoneyAmount<'EUR'>;

function addMoney<C extends Currency>(
  a: MoneyAmount<C>,
  b: MoneyAmount<C>
): MoneyAmount<C> {
  return (a + b) as MoneyAmount<C>;
}

function formatMoney<C extends Currency>(
  amount: MoneyAmount<C>,
  currency: C
): string {
  return \`\${(amount / 100).toFixed(2)} \${currency}\`;
}`,
    hint: "MoneyAmount<C> — C is both the brand value and the currency parameter. addMoney enforces the same currency through the type constraint."
  }
];