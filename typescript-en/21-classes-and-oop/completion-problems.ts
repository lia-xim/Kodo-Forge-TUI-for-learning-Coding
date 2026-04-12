/**
 * Lesson 21 — Completion Problems: Classes & OOP
 *
 * Code templates with strategic blanks (______).
 * The learner fills in the blanks — Faded Worked Examples.
 */

export interface CompletionProblem {
  id: string;
  title: string;
  description: string;
  /** Code with ______ as placeholder for blanks */
  template: string;
  /** Solution with filled blanks */
  solution: string;
  /** Which blank has which answer */
  blanks: { placeholder: string; answer: string; hint: string }[];
  /** Related concept */
  concept: string;
}

export const completionProblems: CompletionProblem[] = [
  // ─── 1: Simple Class with Constructor (easy) ───────────────────────────
  {
    id: "21-cp-basic-class",
    title: "Class with Constructor and Method",
    description:
      "Create a simple class 'Person' with name and age. " +
      "The method 'greet()' should return a greeting.",
    template: `______ Person {
  name: string;
  age: number;

  ______(name: string, age: number) {
    ______.name = name;
    this.age = age;
  }

  greet(): ______ {
    return \`Hello, I am \${this.name} (\${this.age})\`;
  }
}`,
    solution: `class Person {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  greet(): string {
    return \`Hello, I am \${this.name} (\${this.age})\`;
  }
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "class",
        hint: "Which keyword defines a class?",
      },
      {
        placeholder: "______",
        answer: "constructor",
        hint: "What is the special initialization method called?",
      },
      {
        placeholder: "______",
        answer: "this",
        hint: "How do you access the current instance?",
      },
      {
        placeholder: "______",
        answer: "string",
        hint: "What type does the greet() method return?",
      },
    ],
    concept: "class / constructor / this / return type",
  },

  // ─── 2: Parameter Properties (easy-medium) ─────────────────────────────
  {
    id: "21-cp-parameter-properties",
    title: "Parameter Properties Shorthand",
    description:
      "Rewrite the class using Parameter Properties so that " +
      "field declaration and assignment happen automatically.",
    template: `class User {
  constructor(
    ______ name: string,
    ______ email: string,
    ______ id: number
  ) {}

  toString(): string {
    return \`User(\${this.id}): \${this.name} <\${this.email}>\`;
  }
}

const user = new User("Anna", "anna@mail.de", 42);
console.log(user.name);  // "Anna" (public)
// user.email;            // Error (private)
console.log(user.id);    // 42 (not changeable)`,
    solution: `class User {
  constructor(
    public name: string,
    private email: string,
    readonly id: number
  ) {}

  toString(): string {
    return \`User(\${this.id}): \${this.name} <\${this.email}>\`;
  }
}

const user = new User("Anna", "anna@mail.de", 42);
console.log(user.name);  // "Anna" (public)
// user.email;            // Error (private)
console.log(user.id);    // 42 (not changeable)`,
    blanks: [
      {
        placeholder: "______",
        answer: "public",
        hint: "Name should be accessible from outside — which modifier?",
      },
      {
        placeholder: "______",
        answer: "private",
        hint: "Email should only be accessible internally — which modifier?",
      },
      {
        placeholder: "______",
        answer: "readonly",
        hint: "ID should not be changeable after creation — which modifier?",
      },
    ],
    concept: "Parameter Properties / Access Modifiers",
  },

  // ─── 3: Inheritance with extends and super (medium) ────────────────────
  {
    id: "21-cp-inheritance",
    title: "Inheritance with extends and super",
    description:
      "Create a class 'Employee' that inherits from 'Person' " +
      "and has an additional field 'role'.",
    template: `class Person {
  constructor(public name: string, public age: number) {}
  greet(): string { return \`Hi, I am \${this.name}\`; }
}

class Employee ______ Person {
  constructor(
    name: string,
    age: number,
    public role: string
  ) {
    ______(name, age);
  }

  ______ greet(): string {
    return \`\${______.greet()} — \${this.role}\`;
  }
}`,
    solution: `class Person {
  constructor(public name: string, public age: number) {}
  greet(): string { return \`Hi, I am \${this.name}\`; }
}

class Employee extends Person {
  constructor(
    name: string,
    age: number,
    public role: string
  ) {
    super(name, age);
  }

  override greet(): string {
    return \`\${super.greet()} — \${this.role}\`;
  }
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "extends",
        hint: "Which keyword initiates inheritance?",
      },
      {
        placeholder: "______",
        answer: "super",
        hint: "How do you call the parent class constructor?",
      },
      {
        placeholder: "______",
        answer: "override",
        hint: "Which keyword marks an intentionally overridden method?",
      },
      {
        placeholder: "______",
        answer: "super",
        hint: "How do you call the PARENT version of a method?",
      },
    ],
    concept: "extends / super / override",
  },

  // ─── 4: Abstract Class (medium) ────────────────────────────────────────
  {
    id: "21-cp-abstract-class",
    title: "Abstract Class with Template Method",
    description:
      "Create an abstract class 'Shape' with an abstract " +
      "method 'area()' and a concrete method 'describe()'.",
    template: `______ class Shape {
  constructor(public name: string) {}

  ______ area(): number;

  describe(): string {
    return \`\${this.name}: Area = \${this.area().toFixed(2)}\`;
  }
}

class Circle ______ Shape {
  constructor(public radius: number) {
    ______("Circle");
  }

  ______ area(): number {
    return Math.PI * this.radius ** 2;
  }
}`,
    solution: `abstract class Shape {
  constructor(public name: string) {}

  abstract area(): number;

  describe(): string {
    return \`\${this.name}: Area = \${this.area().toFixed(2)}\`;
  }
}

class Circle extends Shape {
  constructor(public radius: number) {
    super("Circle");
  }

  override area(): number {
    return Math.PI * this.radius ** 2;
  }
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "abstract",
        hint: "Which keyword makes a class non-instantiable?",
      },
      {
        placeholder: "______",
        answer: "abstract",
        hint: "Which keyword marks a method without a body?",
      },
      {
        placeholder: "______",
        answer: "extends",
        hint: "How does Circle inherit from Shape?",
      },
      {
        placeholder: "______",
        answer: "super",
        hint: "How do you call the parent constructor?",
      },
      {
        placeholder: "______",
        answer: "override",
        hint: "Which keyword marks the implementation of the abstract method?",
      },
    ],
    concept: "abstract class / Template Method Pattern",
  },

  // ─── 5: Singleton with private Constructor (medium-hard) ───────────────
  {
    id: "21-cp-singleton",
    title: "Singleton Pattern",
    description:
      "Implement the Singleton pattern with a private constructor " +
      "and a static getInstance() method.",
    template: `class AppConfig {
  ______ instance: AppConfig | null = null;

  ______ constructor(
    public readonly apiUrl: string,
    public readonly debug: boolean
  ) {}

  ______ getInstance(): AppConfig {
    if (AppConfig.instance === null) {
      AppConfig.instance = ______ AppConfig("https://api.example.com", false);
    }
    return AppConfig.instance;
  }
}

// const config = new AppConfig("...", true); // ERROR: private
const config = AppConfig.______();`,
    solution: `class AppConfig {
  private static instance: AppConfig | null = null;

  private constructor(
    public readonly apiUrl: string,
    public readonly debug: boolean
  ) {}

  static getInstance(): AppConfig {
    if (AppConfig.instance === null) {
      AppConfig.instance = new AppConfig("https://api.example.com", false);
    }
    return AppConfig.instance;
  }
}

const config = AppConfig.getInstance();`,
    blanks: [
      {
        placeholder: "______",
        answer: "private static",
        hint: "The instance variable must belong to the class AND be invisible from outside.",
      },
      {
        placeholder: "______",
        answer: "private",
        hint: "The constructor must not be callable from outside.",
      },
      {
        placeholder: "______",
        answer: "static",
        hint: "getInstance() must be callable without an instance — which modifier?",
      },
      {
        placeholder: "______",
        answer: "new",
        hint: "How do you create a new instance of a class?",
      },
      {
        placeholder: "______",
        answer: "getInstance",
        hint: "What is the name of the static method for getting the singleton instance?",
      },
    ],
    concept: "Singleton / private constructor / static",
  },

  // ─── 6: Mixin Pattern (hard) ───────────────────────────────────────────
  {
    id: "21-cp-mixin",
    title: "Mixin Pattern for Multiple Extension",
    description:
      "Create a mixin 'WithId' that adds an automatically generated ID " +
      "to any class.",
    template: `type Constructor<T = {}> = ______(______: any[]) => T;

function WithId<TBase extends Constructor>(Base: TBase) {
  return class ______ Base {
    id: string = Math.random().toString(36).slice(2);
  };
}

class User {
  constructor(public name: string) {}
}

const UserWithId = ______(User);
const user = new UserWithId("Anna");
console.log(user.id);   // e.g. "k8f2j9x"
console.log(user.name); // "Anna"`,
    solution: `type Constructor<T = {}> = new (...args: any[]) => T;

function WithId<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    id: string = Math.random().toString(36).slice(2);
  };
}

class User {
  constructor(public name: string) {}
}

const UserWithId = WithId(User);
const user = new UserWithId("Anna");
console.log(user.id);   // e.g. "k8f2j9x"
console.log(user.name); // "Anna"`,
    blanks: [
      {
        placeholder: "______",
        answer: "new",
        hint: "A constructor type starts with which keyword?",
      },
      {
        placeholder: "______",
        answer: "...args",
        hint: "How do you accept any number of parameters?",
      },
      {
        placeholder: "______",
        answer: "extends",
        hint: "The new class should inherit from Base — which keyword?",
      },
      {
        placeholder: "______",
        answer: "WithId",
        hint: "What is the mixin function called?",
      },
    ],
    concept: "Mixins / Constructor Type / Generics",
  },
];