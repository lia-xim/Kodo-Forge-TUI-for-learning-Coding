/**
 * Lektion 21 — Completion Problems: Classes & OOP
 *
 * Code-Templates mit strategischen Luecken (______).
 * Der Lernende fuellt die Luecken — Faded Worked Examples.
 */

export interface CompletionProblem {
  id: string;
  title: string;
  description: string;
  /** Code mit ______ als Platzhalter fuer Luecken */
  template: string;
  /** Loesung mit gefuellten Luecken */
  solution: string;
  /** Welche Luecke welche Antwort hat */
  blanks: { placeholder: string; answer: string; hint: string }[];
  /** Verwandtes Konzept */
  concept: string;
}

export const completionProblems: CompletionProblem[] = [
  // ─── 1: Einfache Klasse mit Constructor (leicht) ───────────────────────
  {
    id: "21-cp-basic-class",
    title: "Klasse mit Constructor und Methode",
    description:
      "Erstelle eine einfache Klasse 'Person' mit Name und Alter. " +
      "Die Methode 'greet()' soll eine Begruessung zurueckgeben.",
    template: `______ Person {
  name: string;
  age: number;

  ______(name: string, age: number) {
    ______.name = name;
    this.age = age;
  }

  greet(): ______ {
    return \`Hallo, ich bin \${this.name} (\${this.age})\`;
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
    return \`Hallo, ich bin \${this.name} (\${this.age})\`;
  }
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "class",
        hint: "Welches Schluesselwort definiert eine Klasse?",
      },
      {
        placeholder: "______",
        answer: "constructor",
        hint: "Wie heisst die spezielle Methode fuer die Initialisierung?",
      },
      {
        placeholder: "______",
        answer: "this",
        hint: "Wie greifst du auf die aktuelle Instanz zu?",
      },
      {
        placeholder: "______",
        answer: "string",
        hint: "Welchen Typ hat der Rueckgabewert der greet()-Methode?",
      },
    ],
    concept: "class / constructor / this / Rueckgabetyp",
  },

  // ─── 2: Parameter Properties (leicht-mittel) ──────────────────────────
  {
    id: "21-cp-parameter-properties",
    title: "Parameter Properties Kurzschreibweise",
    description:
      "Schreibe die Klasse mit Parameter Properties um, sodass " +
      "Feld-Deklaration und Zuweisung automatisch passieren.",
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
console.log(user.id);    // 42 (nicht aenderbar)`,
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
console.log(user.id);    // 42 (nicht aenderbar)`,
    blanks: [
      {
        placeholder: "______",
        answer: "public",
        hint: "Name soll von aussen zugaenglich sein — welcher Modifier?",
      },
      {
        placeholder: "______",
        answer: "private",
        hint: "Email soll nur intern zugaenglich sein — welcher Modifier?",
      },
      {
        placeholder: "______",
        answer: "readonly",
        hint: "ID soll nach Erstellung nicht aenderbar sein — welcher Modifier?",
      },
    ],
    concept: "Parameter Properties / Access Modifiers",
  },

  // ─── 3: Vererbung mit extends und super (mittel) ──────────────────────
  {
    id: "21-cp-inheritance",
    title: "Vererbung mit extends und super",
    description:
      "Erstelle eine Klasse 'Employee', die von 'Person' erbt " +
      "und ein zusaetzliches Feld 'role' hat.",
    template: `class Person {
  constructor(public name: string, public age: number) {}
  greet(): string { return \`Hi, ich bin \${this.name}\`; }
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
  greet(): string { return \`Hi, ich bin \${this.name}\`; }
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
        hint: "Welches Schluesselwort leitet Vererbung ein?",
      },
      {
        placeholder: "______",
        answer: "super",
        hint: "Wie rufst du den Constructor der Elternklasse auf?",
      },
      {
        placeholder: "______",
        answer: "override",
        hint: "Welches Keyword markiert eine bewusst ueberschriebene Methode?",
      },
      {
        placeholder: "______",
        answer: "super",
        hint: "Wie rufst du die ELTERN-Version einer Methode auf?",
      },
    ],
    concept: "extends / super / override",
  },

  // ─── 4: Abstract Class (mittel) ───────────────────────────────────────
  {
    id: "21-cp-abstract-class",
    title: "Abstract Class mit Template Method",
    description:
      "Erstelle eine abstrakte Klasse 'Shape' mit einer abstrakten " +
      "Methode 'area()' und einer konkreten Methode 'describe()'.",
    template: `______ class Shape {
  constructor(public name: string) {}

  ______ area(): number;

  describe(): string {
    return \`\${this.name}: Flaeche = \${this.area().toFixed(2)}\`;
  }
}

class Circle ______ Shape {
  constructor(public radius: number) {
    ______("Kreis");
  }

  ______ area(): number {
    return Math.PI * this.radius ** 2;
  }
}`,
    solution: `abstract class Shape {
  constructor(public name: string) {}

  abstract area(): number;

  describe(): string {
    return \`\${this.name}: Flaeche = \${this.area().toFixed(2)}\`;
  }
}

class Circle extends Shape {
  constructor(public radius: number) {
    super("Kreis");
  }

  override area(): number {
    return Math.PI * this.radius ** 2;
  }
}`,
    blanks: [
      {
        placeholder: "______",
        answer: "abstract",
        hint: "Welches Keyword macht eine Klasse nicht-instanziierbar?",
      },
      {
        placeholder: "______",
        answer: "abstract",
        hint: "Welches Keyword kennzeichnet eine Methode ohne Body?",
      },
      {
        placeholder: "______",
        answer: "extends",
        hint: "Wie erbt Circle von Shape?",
      },
      {
        placeholder: "______",
        answer: "super",
        hint: "Wie rufst du den Eltern-Constructor auf?",
      },
      {
        placeholder: "______",
        answer: "override",
        hint: "Welches Keyword markiert die Implementierung der abstrakten Methode?",
      },
    ],
    concept: "abstract class / Template Method Pattern",
  },

  // ─── 5: Singleton mit private Constructor (mittel-schwer) ─────────────
  {
    id: "21-cp-singleton",
    title: "Singleton-Pattern",
    description:
      "Implementiere das Singleton-Pattern mit privatem Constructor " +
      "und statischer getInstance()-Methode.",
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

// const config = new AppConfig("...", true); // FEHLER: private
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
        hint: "Die Instanz-Variable muss auf der Klasse liegen UND von aussen unsichtbar sein.",
      },
      {
        placeholder: "______",
        answer: "private",
        hint: "Der Constructor muss von aussen nicht aufrufbar sein.",
      },
      {
        placeholder: "______",
        answer: "static",
        hint: "getInstance() muss ohne Instanz aufrufbar sein — welcher Modifier?",
      },
      {
        placeholder: "______",
        answer: "new",
        hint: "Wie erstellst du eine neue Instanz einer Klasse?",
      },
      {
        placeholder: "______",
        answer: "getInstance",
        hint: "Wie heisst die statische Methode zum Holen der Singleton-Instanz?",
      },
    ],
    concept: "Singleton / private constructor / static",
  },

  // ─── 6: Mixin-Pattern (schwer) ────────────────────────────────────────
  {
    id: "21-cp-mixin",
    title: "Mixin-Pattern fuer Mehrfach-Erweiterung",
    description:
      "Erstelle ein Mixin 'WithId', das einer beliebigen Klasse " +
      "eine automatisch generierte ID hinzufuegt.",
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
console.log(user.id);   // z.B. "k8f2j9x"
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
console.log(user.id);   // z.B. "k8f2j9x"
console.log(user.name); // "Anna"`,
    blanks: [
      {
        placeholder: "______",
        answer: "new",
        hint: "Ein Constructor-Typ beginnt mit welchem Keyword?",
      },
      {
        placeholder: "______",
        answer: "...args",
        hint: "Wie nimmst du beliebig viele Parameter entgegen?",
      },
      {
        placeholder: "______",
        answer: "extends",
        hint: "Die neue Klasse soll von Base erben — welches Keyword?",
      },
      {
        placeholder: "______",
        answer: "WithId",
        hint: "Wie heisst die Mixin-Funktion?",
      },
    ],
    concept: "Mixins / Constructor Type / Generics",
  },
];
