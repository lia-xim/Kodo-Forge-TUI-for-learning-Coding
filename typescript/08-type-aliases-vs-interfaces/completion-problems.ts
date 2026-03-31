/**
 * Lektion 08 — Completion Problems: Type Aliases vs Interfaces
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
    title: "Declaration Merging fuer Window",
    description: "Erweitere das Window-Interface um eine eigene Property.",
    template: `// Window ist bereits global definiert.
// Declaration Merging fuegt Properties hinzu:
______ Window {
  appVersion: ______;
  analytics: { track(event: string): void };
}

// Jetzt ist window.appVersion typsicher:
window.______ = "1.0.0";`,
    solution: `interface Window {
  appVersion: string;
  analytics: { track(event: string): void };
}

window.appVersion = "1.0.0";`,
    blanks: [
      { placeholder: "______", answer: "interface", hint: "Welches Keyword unterstuetzt Declaration Merging?" },
      { placeholder: "______", answer: "string", hint: "Eine Versionsnummer wie '1.0.0' ist ein..." },
      { placeholder: "______", answer: "appVersion", hint: "Welche Property wurde hinzugefuegt?" },
    ],
    concept: "Declaration Merging",
  },

  {
    id: "08-cp-extends-chain",
    title: "Interface-Vererbung mit extends",
    description: "Erstelle eine Vererbungskette von Interfaces.",
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

// Admin hat: id, createdAt, name, email, permissions`,
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
      { placeholder: "______", answer: "extends", hint: "Welches Keyword erweitert ein Interface?" },
      { placeholder: "______", answer: "extends", hint: "Admin erweitert User mit demselben Keyword." },
    ],
    concept: "Interface extends / Vererbung",
  },

  {
    id: "08-cp-mapped-type",
    title: "Mapped Type mit type (nicht interface!)",
    description: "Erstelle einen Mapped Type der alle Properties optional macht.",
    template: `interface User {
  name: string;
  age: number;
  email: string;
}

// Mapped Types gehen nur mit ______!
______ OptionalUser = {
  [K ______ keyof User]?: User[K];
};

// Oder kuerzer:
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
      { placeholder: "______", answer: "type", hint: "Mapped Types funktionieren nur mit welchem Keyword?" },
      { placeholder: "______", answer: "type", hint: "Die Deklaration beginnt mit..." },
      { placeholder: "______", answer: "in", hint: "Welches Keyword iteriert ueber alle Keys?" },
      { placeholder: "______", answer: "Partial", hint: "Welcher eingebaute Utility-Type macht alles optional?" },
    ],
    concept: "Mapped Types / type-only",
  },

  {
    id: "08-cp-decision-matrix",
    title: "Entscheidung: type oder interface?",
    description: "Waehle fuer jeden Fall das richtige Keyword.",
    template: `// 1. Union Type -> nur mit type moeglich
______ Status = "active" | "inactive" | "banned";

// 2. Objekt-Form -> interface (Angular-Style)
______ UserProfile {
  name: string;
  bio: string;
}

// 3. Intersection -> nur mit type moeglich
______ AdminProfile = UserProfile & { permissions: string[] };

// 4. Bibliotheks-Erweiterung -> interface (Declaration Merging)
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
      { placeholder: "______", answer: "type", hint: "Union Types gehen nur mit..." },
      { placeholder: "______", answer: "interface", hint: "Objekt-Formen: Angular bevorzugt..." },
      { placeholder: "______", answer: "type", hint: "Intersection mit & geht nur mit..." },
      { placeholder: "______", answer: "declare module \"express\"", hint: "Module Augmentation beginnt mit declare module..." },
      { placeholder: "______", answer: "interface", hint: "Declaration Merging zum Erweitern braucht..." },
    ],
    concept: "Entscheidungsmatrix / type vs interface",
  },

  {
    id: "08-cp-implements",
    title: "Interface mit implements",
    description: "Erstelle ein Interface und implementiere es in einer Klasse.",
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
      { placeholder: "______", answer: "interface", hint: "Repository als Contract definieren mit..." },
      { placeholder: "______", answer: "implements", hint: "Die Klasse implementiert das Interface mit..." },
      { placeholder: "______", answer: "findById", hint: "Welche Methode aus dem Interface muss implementiert werden?" },
    ],
    concept: "implements / Interface als Contract",
  },

  {
    id: "08-cp-readonly-mapped",
    title: "Readonly Mapped Type",
    description: "Erstelle einen Typ der alle Properties readonly macht.",
    template: `interface Config {
  host: string;
  port: number;
  debug: boolean;
}

// Mapped Type: Alle Properties werden readonly
______ FrozenConfig = {
  ______[K in keyof Config]: Config[K];
};

// Oder kuerzer mit Utility Type:
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
      { placeholder: "______", answer: "type", hint: "Mapped Types gehen nur mit type." },
      { placeholder: "______", answer: "readonly ", hint: "Welcher Modifier macht Properties unveraenderlich?" },
      { placeholder: "______", answer: "Readonly", hint: "Welcher Utility Type macht alles readonly?" },
    ],
    concept: "Mapped Types / Readonly",
  },
];
