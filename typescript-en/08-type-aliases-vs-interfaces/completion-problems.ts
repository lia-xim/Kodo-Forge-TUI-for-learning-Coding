/**
 * Lesson 08 — Completion Problems: Type Aliases vs Interfaces
 */

export interface CompletionProblem {
  id: string;
  title: string;
  description: string;
  template: string;
  solution: string;
  blanks: { placeholder: string; answer: string; hint: string }[];
  concept: string;
}

export const completionProblems: CompletionProblem[] = [
  {
    id: "08-cp-declaration-merging",
    title: "Declaration Merging for Window",
    description: "Extend the Window interface with a custom property.",
    template: `// Window is already globally defined.
// Declaration Merging adds properties:
______ Window {
  appVersion: ______;
  analytics: { track(event: string): void };
}

// Now window.appVersion is type-safe:
window.______ = "1.0.0";`,
    solution: `interface Window {
  appVersion: string;
  analytics: { track(event: string): void };
}

window.appVersion = "1.0.0";`,
    blanks: [
      { placeholder: "______", answer: "interface", hint: "Which keyword supports declaration merging?" },
      { placeholder: "______", answer: "string", hint: "A version number like '1.0.0' is a..." },
      { placeholder: "______", answer: "appVersion", hint: "Which property was added?" },
    ],
    concept: "Declaration Merging",
  },

  {
    id: "08-cp-extends-chain",
    title: "Interface Inheritance with extends",
    description: "Create an inheritance chain of interfaces.",
    template: `interface Base {
  id: number;
  createdAt: Date;
}

interface User ______ Base {
  name: string;
  email: string;
}

interface Admin ______ User {
  permissions: string[];
}

// Admin has: id, createdAt, name, email, permissions`,
    solution: `interface Base {
  id: number;
  createdAt: Date;
}

interface User extends Base {
  name: string;
  email: string;
}

interface Admin extends User {
  permissions: string[];
}`,
    blanks: [
      { placeholder: "______", answer: "extends", hint: "Which keyword extends an interface?" },
      { placeholder: "______", answer: "extends", hint: "Admin extends User with the same keyword." },
    ],
    concept: "Interface extends / Inheritance",
  },

  {
    id: "08-cp-mapped-type",
    title: "Mapped Type with type (not interface!)",
    description: "Create a mapped type that makes all properties optional.",
    template: `interface User {
  name: string;
  age: number;
  email: string;
}

// Mapped Types only work with ______!
______ OptionalUser = {
  [K ______ keyof User]?: User[K];
};

// Or shorter:
type AlsoOptional = ______<User>;`,
    solution: `interface User {
  name: string;
  age: number;
  email: string;
}

type OptionalUser = {
  [K in keyof User]?: User[K];
};

type AlsoOptional = Partial<User>;`,
    blanks: [
      { placeholder: "______", answer: "type", hint: "Mapped types only work with which keyword?" },
      { placeholder: "______", answer: "type", hint: "The declaration starts with..." },
      { placeholder: "______", answer: "in", hint: "Which keyword iterates over all keys?" },
      { placeholder: "______", answer: "Partial", hint: "Which built-in utility type makes everything optional?" },
    ],
    concept: "Mapped Types / type-only",
  },

  {
    id: "08-cp-decision-matrix",
    title: "Decision: type or interface?",
    description: "Choose the correct keyword for each case.",
    template: `// 1. Union Type -> only possible with type
______ Status = "active" | "inactive" | "banned";

// 2. Object shape -> interface (Angular style)
______ UserProfile {
  name: string;
  bio: string;
}

// 3. Intersection -> only possible with type
______ AdminProfile = UserProfile & { permissions: string[] };

// 4. Library extension -> interface (Declaration Merging)
______ Express {
  export ______ Request {
    userId?: string;
  }
}`,
    solution: `type Status = "active" | "inactive" | "banned";

interface UserProfile {
  name: string;
  bio: string;
}

type AdminProfile = UserProfile & { permissions: string[] };

declare module "express" {
  export interface Request {
    userId?: string;
  }
}`,
    blanks: [
      { placeholder: "______", answer: "type", hint: "Union types only work with..." },
      { placeholder: "______", answer: "interface", hint: "Object shapes: Angular prefers..." },
      { placeholder: "______", answer: "type", hint: "Intersection with & only works with..." },
      { placeholder: "______", answer: "declare module \"express\"", hint: "Module augmentation starts with declare module..." },
      { placeholder: "______", answer: "interface", hint: "Declaration Merging for extending requires..." },
    ],
    concept: "Decision Matrix / type vs interface",
  },

  {
    id: "08-cp-implements",
    title: "Interface with implements",
    description: "Create an interface and implement it in a class.",
    template: `______ Repository<T> {
  findById(id: string): T | undefined;
  findAll(): T[];
  save(item: T): void;
}

class UserRepository ______ Repository<User> {
  private users: User[] = [];

  ______(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  findAll(): User[] {
    return [...this.users];
  }

  save(user: User): void {
    this.users.push(user);
  }
}`,
    solution: `interface Repository<T> {
  findById(id: string): T | undefined;
  findAll(): T[];
  save(item: T): void;
}

class UserRepository implements Repository<User> {
  private users: User[] = [];

  findById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  findAll(): User[] {
    return [...this.users];
  }

  save(user: User): void {
    this.users.push(user);
  }
}`,
    blanks: [
      { placeholder: "______", answer: "interface", hint: "Define Repository as a contract with..." },
      { placeholder: "______", answer: "implements", hint: "The class implements the interface with..." },
      { placeholder: "______", answer: "findById", hint: "Which method from the interface must be implemented?" },
    ],
    concept: "implements / Interface as Contract",
  },

  {
    id: "08-cp-readonly-mapped",
    title: "Readonly Mapped Type",
    description: "Create a type that makes all properties readonly.",
    template: `interface Config {
  host: string;
  port: number;
  debug: boolean;
}

// Mapped Type: All properties become readonly
______ FrozenConfig = {
  ______[K in keyof Config]: Config[K];
};

// Or shorter with Utility Type:
type AlsoFrozen = ______<Config>;`,
    solution: `interface Config {
  host: string;
  port: number;
  debug: boolean;
}

type FrozenConfig = {
  readonly [K in keyof Config]: Config[K];
};

type AlsoFrozen = Readonly<Config>;`,
    blanks: [
      { placeholder: "______", answer: "type", hint: "Mapped types only work with type." },
      { placeholder: "______", answer: "readonly ", hint: "Which modifier makes properties immutable?" },
      { placeholder: "______", answer: "Readonly", hint: "Which utility type makes everything readonly?" },
    ],
    concept: "Mapped Types / Readonly",
  },
];