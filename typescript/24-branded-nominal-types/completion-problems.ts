// completion-problems.ts — L24: Branded/Nominal Types
// 6 Completion Problems mit steigender Schwierigkeit

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
    title: "Brand-Typ definieren",
    description: "Definiere den generischen Brand-Helfer und einen UserId Brand-Typ.",
    template: `// Generischer Brand-Helfer:
type Brand<T, B extends ___> = T & { readonly __brand: ___ };

// UserId Brand-Typ:
type UserId = ___ & { readonly __brand: ___ };`,
    blanks: ["string", "B", "string", "'UserId'"],
    solution: `type Brand<T, B extends string> = T & { readonly __brand: B };
type UserId = string & { readonly __brand: 'UserId' };`,
    hint: "Brand<T, B extends string> — B muss ein string-Literal sein. __brand: B bedeutet das Property enthält B als Wert."
  },
  {
    id: 2,
    title: "Smart Constructor schreiben",
    description: "Vervollständige den Smart Constructor für UserId.",
    template: `type UserId = string & { readonly __brand: 'UserId' };

function createUserId(raw: ___): UserId {
  if (!raw || raw.trim().___ < 5) {
    throw new Error(\`Ungültige UserId: "\${raw}"\`);
  }
  return raw.___ as ___;
}`,
    blanks: ["string", "length", "trim()", "UserId"],
    solution: `function createUserId(raw: string): UserId {
  if (!raw || raw.trim().length < 5) {
    throw new Error(\`Ungültige UserId: "\${raw}"\`);
  }
  return raw.trim() as UserId;
}`,
    hint: "Parameter ist string, validiere mit .length, schluss: as UserId (der einzige erlaubte Ort)"
  },
  {
    id: 3,
    title: "Brand-Hierarchie aufbauen",
    description: "Erstelle Email und VerifiedEmail als Hierarchie.",
    template: `type Email        = string & { readonly __brand: ___ };
type VerifiedEmail = ___ & { readonly __verified: ___ };

// VerifiedEmail ist Subtyp von Email:
function sendEmail(to: ___): void {}
function sendCritical(to: VerifiedEmail): void {}

const verified: VerifiedEmail = 'v@x.com' as ___;
sendEmail(___); // ✅ VerifiedEmail kann als Email gesendet werden`,
    blanks: ["'Email'", "Email", "true", "Email", "VerifiedEmail", "verified"],
    solution: `type Email        = string & { readonly __brand: 'Email' };
type VerifiedEmail = Email & { readonly __verified: true };

function sendEmail(to: Email): void {}
function sendCritical(to: VerifiedEmail): void {}

const verified: VerifiedEmail = 'v@x.com' as VerifiedEmail;
sendEmail(verified); // ✅`,
    hint: "VerifiedEmail erweitert Email durch Intersection. Als Subtyp kann es überall als Email verwendet werden."
  },
  {
    id: 4,
    title: "Generischer Id-Typ mit Repository",
    description: "Vervollständige den generischen ID-Typ und das Repository-Interface.",
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
    hint: "Id<Entity> — Entity ist der Typ-Parameter, der Generic Type für die Entity. Id<'User'> und Id<'Order'> haben verschiedene __idType-Werte."
  },
  {
    id: 5,
    title: "Multi-Brand Kombination",
    description: "Vervollständige die Multi-Step Validierungs-Pipeline.",
    template: `type Trimmed  = { readonly __trimmed: true };
type NonEmpty = { readonly __nonEmpty: true };
type TrimmedString = string & ___;

function trim(s: string): ___ {
  return s.trim() as TrimmedString;
}

function assertNonEmpty(s: TrimmedString): string & Trimmed & ___ {
  if (s.___ === 0) throw new Error('Leer!');
  return s as string & Trimmed & NonEmpty;
}

type SearchQuery = string & ___ & NonEmpty;`,
    blanks: ["Trimmed", "TrimmedString", "NonEmpty", "length", "Trimmed"],
    solution: `type TrimmedString = string & Trimmed;

function trim(s: string): TrimmedString {
  return s.trim() as TrimmedString;
}

function assertNonEmpty(s: TrimmedString): string & Trimmed & NonEmpty {
  if (s.length === 0) throw new Error('Leer!');
  return s as string & Trimmed & NonEmpty;
}

type SearchQuery = string & Trimmed & NonEmpty;`,
    hint: "TrimmedString = string & Trimmed. Die Kette: string → TrimmedString → string & Trimmed & NonEmpty."
  },
  {
    id: 6,
    title: "Currency-System komplett",
    description: "Vervollständige das typesichere Currency-System.",
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
    hint: "MoneyAmount<C> — C ist sowohl der Brand-Wert als auch der Currency-Parameter. addMoney erzwingt gleiche Währung durch Typ-Constraint."
  }
];
