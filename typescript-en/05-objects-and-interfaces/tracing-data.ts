/**
 * Lesson 05 — Tracing Exercises: Objects & Interfaces
 *
 * Topics:
 *  - Structural Typing: Assignments based on structure
 *  - Excess Property Checking: Why does this fail?
 *  - Interface extends: Inheritance and compatibility
 *  - Optional Properties and their types
 *
 * Difficulty increasing: 1 -> 4
 */

import type { TracingExercise } from "../tools/tracing-engine.ts";

export const tracingExercises: TracingExercise[] = [
  // --- Exercise 1: Structural Typing — Assignment Rules --------------------
  {
    id: "05-structural-typing",
    title: "Structural Typing — Shape over Name",
    description:
      "Trace which assignments TypeScript allows and which it doesn't, " +
      "based on the structure of the objects.",
    code: [
      "interface Point2D {",
      "  x: number;",
      "  y: number;",
      "}",
      "",
      "interface Point3D {",
      "  x: number;",
      "  y: number;",
      "  z: number;",
      "}",
      "",
      "const p3: Point3D = { x: 1, y: 2, z: 3 };",
      "const p2: Point2D = p3;",
      "// const p3b: Point3D = { x: 1, y: 2 };  // Error!",
      "",
      "console.log(p2.x, p2.y);",
    ],
    steps: [
      {
        lineIndex: 11,
        question:
          "Is the assignment 'p3' with all three properties (x, y, z) " +
          "to Point3D allowed?",
        expectedAnswer: "Yes",
        variables: { "p3": "Point3D ({ x: 1, y: 2, z: 3 })" },
        explanation:
          "The object has all required properties of " +
          "Point3D (x, y, z). The assignment is valid.",
      },
      {
        lineIndex: 12,
        question:
          "Is the assignment 'p2: Point2D = p3' allowed? " +
          "Point3D has an additional property z.",
        expectedAnswer: "Yes",
        variables: { "p3": "Point3D", "p2": "Point2D (points to p3)" },
        explanation:
          "Structural Typing: TypeScript checks whether p3 has all " +
          "properties of Point2D (x and y). It does — " +
          "plus an additional one (z). Additional properties " +
          "are allowed for variable assignments. " +
          "A Point3D IS a Point2D (has everything that's required).",
      },
      {
        lineIndex: 13,
        question:
          "Why would 'p3b: Point3D = { x: 1, y: 2 }' fail?",
        expectedAnswer: "z is missing — Point3D requires x, y AND z",
        variables: {},
        explanation:
          "Point3D requires three properties. { x: 1, y: 2 } has " +
          "only two. z is missing. Structural Typing means: " +
          "the object must have AT LEAST all required properties. " +
          "Having fewer is not allowed.",
      },
      {
        lineIndex: 15,
        question:
          "Can you access p2.z via p2? " +
          "(p2 points to the same object as p3)",
        expectedAnswer: "No, TypeScript error (z does not exist on Point2D)",
        variables: { "p2.x": "1", "p2.y": "2" },
        explanation:
          "Even though the runtime object has the property z, " +
          "TypeScript doesn't know about it. p2 has type Point2D, " +
          "and Point2D only has x and y. Access to z " +
          "is blocked by the compiler — even though it would " +
          "work at runtime.",
      },
    ],
    concept: "structural-typing",
    difficulty: 1,
  },

  // --- Exercise 2: Excess Property Checking --------------------------------
  {
    id: "05-excess-property-checking",
    title: "Excess Property Checking — Why sometimes yes, sometimes no?",
    description:
      "Trace when TypeScript allows additional properties " +
      "and when it doesn't. The rules are surprising.",
    code: [
      "interface Config {",
      "  host: string;",
      "  port: number;",
      "}",
      "",
      "// Direct assignment:",
      "// const c1: Config = { host: 'localhost', port: 3000, debug: true };",
      "",
      "// Via variable:",
      "const temp = { host: 'localhost', port: 3000, debug: true };",
      "const c2: Config = temp;",
      "",
      "// Function:",
      "function startServer(config: Config) { return config; }",
      "startServer({ host: 'localhost', port: 3000 });",
      "// startServer({ host: 'localhost', port: 3000, debug: true });",
    ],
    steps: [
      {
        lineIndex: 6,
        question:
          "Is the direct assignment with the additional " +
          "property 'debug' allowed?",
        expectedAnswer: "No, compile error: 'debug' does not exist in Config",
        variables: {},
        explanation:
          "For DIRECT object literal assignments, TypeScript activates " +
          "'Excess Property Checking'. It checks whether ALL " +
          "properties are defined in the interface. debug is not " +
          "defined in Config — hence the error.",
      },
      {
        lineIndex: 10,
        question:
          "Is the assignment via the intermediate variable 'temp' " +
          "allowed? temp also has the property 'debug'.",
        expectedAnswer: "Yes, no error",
        variables: { "temp": "{ host: string; port: number; debug: boolean }", "c2": "Config" },
        explanation:
          "Excess Property Checking only applies to direct " +
          "object literal assignments. For variable assignments, " +
          "TypeScript uses normal structural typing: " +
          "temp has host and port, which is enough for Config.",
      },
      {
        lineIndex: 15,
        question:
          "Would the function call with the additional " +
          "'debug' in line 16 work?",
        expectedAnswer: "No, compile error (Excess Property Checking)",
        variables: {},
        explanation:
          "Function calls with direct object literals " +
          "are also subject to Excess Property Checking. " +
          "This protects against typos: if you write 'prot' instead " +
          "of 'port', TypeScript catches the error.",
      },
      {
        lineIndex: 14,
        question:
          "Why does TypeScript distinguish between direct " +
          "object literals and variable assignments?",
        expectedAnswer: "With object literals, extra properties are likely typos",
        variables: {},
        explanation:
          "The reason is pragmatic: if you write an object literal " +
          "directly and a property doesn't belong to the type, " +
          "it's probably a mistake. With variables, the " +
          "object might intentionally have more properties (e.g., when " +
          "it comes from another source).",
      },
    ],
    concept: "excess-property-checking",
    difficulty: 2,
  },

  // --- Exercise 3: Interface extends — Inheritance -------------------------
  {
    id: "05-interface-extends",
    title: "Interface extends — Inheritance and Compatibility",
    description:
      "Trace how interface inheritance affects type compatibility " +
      "and which assignments are possible.",
    code: [
      "interface Animal {",
      "  name: string;",
      "  sound(): string;",
      "}",
      "",
      "interface Dog extends Animal {",
      "  breed: string;",
      "}",
      "",
      "interface ServiceDog extends Dog {",
      "  task: string;",
      "}",
      "",
      "const rex: ServiceDog = { name: 'Rex', sound() { return 'Woof'; }, breed: 'Labrador', task: 'Guide' };",
      "const dog: Dog = rex;",
      "const animal: Animal = rex;",
      "// const serviceDog: ServiceDog = dog;  // Error!",
    ],
    steps: [
      {
        lineIndex: 5,
        question:
          "What properties must a Dog object have? " +
          "(Interface Dog extends Animal)",
        expectedAnswer: "name: string, sound(): string, breed: string",
        variables: {},
        explanation:
          "Dog inherits all properties from Animal (name, sound) " +
          "and adds breed. extends means: 'has everything " +
          "from Animal, plus its own properties'. A Dog must " +
          "therefore have three properties.",
      },
      {
        lineIndex: 13,
        question:
          "What properties does the rex object have in total?",
        expectedAnswer: "name, sound, breed, task (all four)",
        variables: {
          "rex.name": "\"Rex\"",
          "rex.breed": "\"Labrador\"",
          "rex.task": "\"Guide\"",
        },
        explanation:
          "ServiceDog inherits from Dog (name, sound, breed) and " +
          "adds task. The inheritance chain is: " +
          "Animal -> Dog -> ServiceDog. Each level adds " +
          "at least one property.",
      },
      {
        lineIndex: 14,
        question:
          "Is the assignment 'dog: Dog = rex' allowed? " +
          "rex is a ServiceDog, not a Dog.",
        expectedAnswer: "Yes",
        variables: { "dog": "Dog (points to rex)", "rex": "ServiceDog" },
        explanation:
          "ServiceDog extends Dog — every ServiceDog IS a Dog " +
          "(has name, sound, breed). Assigning 'upward' " +
          "in the inheritance chain is always allowed. " +
          "You only lose access to task.",
      },
      {
        lineIndex: 16,
        question:
          "Why does 'serviceDog: ServiceDog = dog' fail? " +
          "The object behind dog is a ServiceDog after all.",
        expectedAnswer: "Dog has no task property — TypeScript checks the static type",
        variables: { "dog (static type)": "Dog (no task)" },
        explanation:
          "TypeScript checks the STATIC type, not the " +
          "runtime value. dog has type Dog, and Dog has " +
          "no task property. Assignments 'downward' in the " +
          "inheritance chain are not allowed, because properties " +
          "might be missing.",
      },
    ],
    concept: "interface-extends",
    difficulty: 3,
  },

  // --- Exercise 4: Optional Properties and Their Types ---------------------
  {
    id: "05-optional-properties",
    title: "Optional Properties — What's behind the question mark?",
    description:
      "Trace how optional properties affect the type " +
      "and which checks are necessary.",
    code: [
      "interface UserProfile {",
      "  name: string;",
      "  email?: string;",
      "  age?: number;",
      "}",
      "",
      "const user: UserProfile = { name: 'Anna' };",
      "const email = user.email;",
      "const upper = user.email?.toUpperCase();",
      "",
      "if (user.email) {",
      "  const confirmed = user.email;",
      "}",
    ],
    steps: [
      {
        lineIndex: 6,
        question:
          "Is the assignment valid? email and age are missing " +
          "from the object.",
        expectedAnswer: "Yes, because email and age are optional (marked with ?)",
        variables: { "user": "UserProfile ({ name: \"Anna\" })" },
        explanation:
          "Optional properties (with ?) do not need to be provided. " +
          "Only 'name' is required. The object { name: 'Anna' } " +
          "fulfills all requirements of UserProfile.",
      },
      {
        lineIndex: 7,
        question:
          "What type does 'email' (user.email) have?",
        expectedAnswer: "string | undefined",
        variables: { "email": "string | undefined" },
        explanation:
          "An optional property 'email?: string' has type " +
          "string | undefined. If the property is not set, " +
          "accessing it returns undefined. TypeScript adds " +
          "the '| undefined' automatically.",
      },
      {
        lineIndex: 8,
        question:
          "What type does 'upper' (user.email?.toUpperCase()) have?",
        expectedAnswer: "string | undefined",
        variables: { "upper": "string | undefined" },
        explanation:
          "The optional chaining operator (?.) returns undefined " +
          "when user.email is undefined, or the " +
          "toUpperCase() value when it's a string. " +
          "The resulting type is string | undefined.",
      },
      {
        lineIndex: 11,
        question:
          "What type does 'confirmed' (user.email after the if-check) have?",
        expectedAnswer: "string",
        variables: { "confirmed": "string" },
        explanation:
          "The truthiness check 'if (user.email)' excludes " +
          "undefined (and also '' as falsy). Inside the " +
          "if-block, TypeScript narrows the type to string. " +
          "This is control flow analysis on optional properties.",
      },
    ],
    concept: "optional-properties",
    difficulty: 2,
  },

  // --- Exercise 5: Readonly and Structural Typing --------------------------
  {
    id: "05-readonly-structural",
    title: "Readonly — Protection at the type level only",
    description:
      "Trace how readonly properties protect at compile time " +
      "but remain mutable at runtime.",
    code: [
      "interface Immutable {",
      "  readonly id: number;",
      "  readonly name: string;",
      "}",
      "",
      "interface Mutable {",
      "  id: number;",
      "  name: string;",
      "}",
      "",
      "const obj: Immutable = { id: 1, name: 'Test' };",
      "// obj.id = 2;  // Error!",
      "",
      "const mutable: Mutable = obj;",
      "mutable.name = 'Changed';",
      "console.log(obj.name);",
    ],
    steps: [
      {
        lineIndex: 11,
        question:
          "Why does 'obj.id = 2' fail?",
        expectedAnswer: "id is readonly — assignment to readonly properties is forbidden",
        variables: { "obj": "Immutable ({ id: 1, name: \"Test\" })" },
        explanation:
          "readonly properties cannot be reassigned after initialization. " +
          "TypeScript reports a compile error. This protects against " +
          "accidental modifications.",
      },
      {
        lineIndex: 13,
        question:
          "Is the assignment 'mutable: Mutable = obj' allowed? " +
          "Immutable has readonly, Mutable does not.",
        expectedAnswer: "Yes",
        variables: { "mutable": "Mutable (points to obj)" },
        explanation:
          "Structural Typing ignores readonly during " +
          "compatibility checks. Immutable has id: number " +
          "and name: string — that matches Mutable. " +
          "This is a known loophole in TypeScript.",
      },
      {
        lineIndex: 14,
        question:
          "Is 'mutable.name = \"Changed\"' allowed? " +
          "mutable points to the same object as obj.",
        expectedAnswer: "Yes, because mutable has type Mutable (no readonly)",
        variables: { "mutable.name": "\"Changed\"" },
        explanation:
          "Since mutable has type Mutable (without readonly), " +
          "TypeScript allows the assignment. The object is " +
          "actually changed — readonly is only a " +
          "compile-time check, not a runtime guarantee.",
      },
      {
        lineIndex: 15,
        question:
          "What does console.log(obj.name) output? " +
          "obj is readonly, but mutable changed it.",
        expectedAnswer: "Changed",
        variables: { "obj.name": "\"Changed\"", "mutable.name": "\"Changed\"" },
        explanation:
          "Both variables point to the same object in memory. " +
          "The change via mutable affects obj as well. " +
          "readonly only protects at the type level — there is no " +
          "runtime protection. For real immutability you need " +
          "Object.freeze() or structural copying.",
      },
    ],
    concept: "readonly-vs-mutable",
    difficulty: 4,
  },
];