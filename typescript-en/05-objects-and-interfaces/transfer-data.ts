/**
 * Lesson 05 -- Transfer Tasks: Objects & Interfaces
 *
 * These tasks take the concepts from the Objects/Interfaces lesson
 * and apply them in completely new contexts:
 *
 *  1. Model REST API response states
 *  2. Form validation with Readonly and Partial
 *  3. Plugin system with Index Signatures and Intersection Types
 *
 * No external dependencies.
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

// ─── Transfer Tasks ─────────────────────────────────────────────────────────

export const transferTasks: TransferTask[] = [
  // ─── Task 1: REST API Response States ──────────────────────────────────
  {
    id: "05-api-response-states",
    title: "Modeling REST API Response States",
    prerequisiteLessons: [5],
    scenario:
      "Your React app displays data from a REST API. Currently the " +
      "state looks like this: { data: any, loading: boolean, error: string | null }. " +
      "The problem: there are invalid combinations — e.g. loading: true " +
      "AND data present, or loading: false and NEITHER data nor error. " +
      "Last week the app showed a spinner AND an error message at the same time " +
      "because the state was inconsistent.",
    task:
      "Model the API response as a Discriminated Union.\n\n" +
      "1. Define three states: 'idle', 'loading', 'success', 'error'\n" +
      "2. Each state has ONLY the fields it needs\n" +
      "3. Use a shared 'status' field as the discriminator\n" +
      "4. Write a render function that safely handles every " +
      "   state via switch/if (exhaustive check)\n" +
      "5. Show why the old approach with boolean flags " +
      "   allows unsafe states",
    starterCode: [
      "// OLD (unsafe): Allows invalid combinations",
      "// interface ApiState {",
      "//   data: User[] | null;",
      "//   loading: boolean;",
      "//   error: string | null;",
      "// }",
      "",
      "// NEW: Discriminated Union",
      "type ApiState<T> = ???;",
      "",
      "interface User {",
      "  id: number;",
      "  name: string;",
      "  email: string;",
      "}",
      "",
      "function renderUserList(state: ApiState<User[]>): string {",
      "  // TODO: Handle each state safely",
      "}",
    ].join("\n"),
    solutionCode: [
      "// ═══ Discriminated Union: Each state only has its own fields ═══",
      "type ApiState<T> =",
      "  | { status: 'idle' }",
      "  | { status: 'loading' }",
      "  | { status: 'success'; data: T }",
      "  | { status: 'error'; error: string; retryCount: number };",
      "",
      "interface User {",
      "  id: number;",
      "  name: string;",
      "  email: string;",
      "}",
      "",
      "// ═══ Exhaustive Render Function ═══",
      "function renderUserList(state: ApiState<User[]>): string {",
      "  switch (state.status) {",
      "    case 'idle':",
      "      return 'Press Load to display users';",
      "",
      "    case 'loading':",
      "      return 'Loading users...';",
      "",
      "    case 'success':",
      "      // TypeScript knows: state.data exists here",
      "      if (state.data.length === 0) {",
      "        return 'No users found';",
      "      }",
      "      return state.data.map(u => u.name).join(', ');",
      "",
      "    case 'error':",
      "      // TypeScript knows: state.error exists here",
      "      return 'Error: ' + state.error +",
      "        ' (attempt ' + state.retryCount + ')';",
      "  }",
      "}",
      "",
      "// ═══ Why is the old approach unsafe? ═══",
      "// { loading: true, data: [...], error: 'Timeout' }",
      "// -> Loading AND data AND error at the same time? Nonsense!",
      "//",
      "// { loading: false, data: null, error: null }",
      "// -> Not loading, no data, no error? What do we show?",
      "//",
      "// With Discriminated Unions this is IMPOSSIBLE:",
      "// - status: 'loading' has no data and no error",
      "// - status: 'success' has data, but no error",
      "// - status: 'error' has error, but no data",
      "// -> Each state has ONLY the fields that make sense",
      "",
      "// ═══ Bonus: Exhaustive Check ═══",
      "// If a new status is added (e.g. 'refreshing'),",
      "// the switch block forces a compile error:",
      "// 'Not all code paths return a value'",
      "// So you never forget a case.",
    ].join("\n"),
    conceptsBridged: [
      "Discriminated Unions",
      "Structural Typing",
      "Exhaustive Checks",
      "Generics with Interfaces",
      "State Modeling",
    ],
    hints: [
      "The problem with boolean flags: 2 booleans (loading, hasError) yield 4 combinations, but only 3 are valid. Discriminated Unions allow ONLY valid states.",
      "Use a shared 'status' field with Literal Types ('idle' | 'loading' | 'success' | 'error'). TypeScript can then narrow the type via switch().",
      "Make the type generic (ApiState<T>) so it works for any data: ApiState<User[]>, ApiState<Product>, etc.",
    ],
    difficulty: 3,
  },

  // ─── Task 2: Form with Readonly and Partial ─────────────────────────
  {
    id: "05-formular-validierung",
    title: "Form State with Readonly, Partial, and Pick",
    prerequisiteLessons: [5],
    scenario:
      "You are building a multi-step registration form (wizard). " +
      "Step 1: Name and email. Step 2: Address. Step 3: Summary. " +
      "The problem: on step 1 the address fields are still empty (undefined), " +
      "but on step 3 all fields must be present. " +
      "Currently all fields are marked as optional (?), " +
      "and the summary page sometimes crashes " +
      "because a field is missing.",
    task:
      "Model the form state so that each step has exactly " +
      "the right types.\n\n" +
      "1. Define the complete UserProfile interface\n" +
      "2. Use Pick<> to get only the relevant fields for each step\n" +
      "3. Use Partial<> for the overall state while filling in\n" +
      "4. Use Readonly<> for the summary step " +
      "   (no more changes possible)\n" +
      "5. Write a function that validates from Partial -> complete",
    starterCode: [
      "interface UserProfile {",
      "  firstName: string;",
      "  lastName: string;",
      "  email: string;",
      "  street: string;",
      "  city: string;",
      "  zipCode: string;",
      "  country: string;",
      "}",
      "",
      "// Types for each wizard step:",
      "type Step1Data = ???;  // Name + email only",
      "type Step2Data = ???;  // Address only",
      "type DraftProfile = ???;  // Everything optional (in-progress)",
      "type FinalProfile = ???;  // Everything readonly (complete)",
      "",
      "function validateDraft(draft: DraftProfile): FinalProfile | null {",
      "  // TODO: Check whether all fields are present",
      "}",
    ].join("\n"),
    solutionCode: [
      "interface UserProfile {",
      "  firstName: string;",
      "  lastName: string;",
      "  email: string;",
      "  street: string;",
      "  city: string;",
      "  zipCode: string;",
      "  country: string;",
      "}",
      "",
      "// ═══ Pick: Only the relevant fields per step ═══",
      "type Step1Data = Pick<UserProfile, 'firstName' | 'lastName' | 'email'>;",
      "type Step2Data = Pick<UserProfile, 'street' | 'city' | 'zipCode' | 'country'>;",
      "",
      "// ═══ Partial: Everything optional while filling in ═══",
      "type DraftProfile = Partial<UserProfile>;",
      "// Results in: {",
      "//   firstName?: string | undefined;",
      "//   lastName?: string | undefined;",
      "//   ... all fields optional",
      "// }",
      "",
      "// ═══ Readonly: No changes on the summary step ═══",
      "type FinalProfile = Readonly<UserProfile>;",
      "// Results in: {",
      "//   readonly firstName: string;",
      "//   readonly lastName: string;",
      "//   ... all fields readonly",
      "// }",
      "",
      "// ═══ Validation: Partial -> Complete ═══",
      "function validateDraft(draft: DraftProfile): FinalProfile | null {",
      "  const requiredFields: Array<keyof UserProfile> = [",
      "    'firstName', 'lastName', 'email',",
      "    'street', 'city', 'zipCode', 'country',",
      "  ];",
      "",
      "  for (const field of requiredFields) {",
      "    if (draft[field] === undefined || draft[field] === '') {",
      "      return null;",
      "    }",
      "  }",
      "",
      "  // All fields are present — safe cast",
      "  return draft as FinalProfile;",
      "}",
      "",
      "// ═══ Wizard steps with correct types ═══",
      "// function handleStep1(data: Step1Data, draft: DraftProfile): DraftProfile {",
      "//   return { ...draft, ...data };",
      "// }",
      "//",
      "// function handleStep2(data: Step2Data, draft: DraftProfile): DraftProfile {",
      "//   return { ...draft, ...data };",
      "// }",
      "//",
      "// function handleSubmit(draft: DraftProfile): void {",
      "//   const final = validateDraft(draft);",
      "//   if (final === null) {",
      "//     console.log('Please fill in all fields');",
      "//     return;",
      "//   }",
      "//   // TypeScript knows: final has all fields (readonly)",
      "//   console.log(final.firstName + ' ' + final.lastName);",
      "//   // final.firstName = 'Hack';  // Compile error! readonly",
      "// }",
    ].join("\n"),
    conceptsBridged: [
      "Pick / Partial / Readonly",
      "Combining Utility Types",
      "readonly (shallow)",
      "keyof",
      "Wizard State Pattern",
    ],
    hints: [
      "Pick<UserProfile, 'firstName' | 'lastName' | 'email'> gives you a new interface with ONLY these three fields. Perfect for individual wizard steps.",
      "Partial<UserProfile> makes all fields optional. That is the right type for the in-progress state while the user is still filling in the form.",
      "Readonly<UserProfile> prevents changes. Use this for the final summary. Important: readonly in TypeScript is only SHALLOW (first level only).",
    ],
    difficulty: 3,
  },

  // ─── Task 3: Plugin System ─────────────────────────────────────────────
  {
    id: "05-plugin-system",
    title: "Extensible Plugin System",
    prerequisiteLessons: [5],
    scenario:
      "You are developing a text editor that can be extended through plugins. " +
      "Each plugin registers itself with a name and brings commands " +
      "and settings with it. The problem: the current implementation " +
      "uses a simple Record<string, any> for the plugin registry. " +
      "There is no type safety during registration or access.",
    task:
      "Build a type-safe plugin system with interfaces and Intersection Types.\n\n" +
      "1. Define a Plugin interface with name, version, commands, settings\n" +
      "2. Use Index Signatures for the dynamic commands\n" +
      "3. Use Intersection Types to extend plugins with base functionality\n" +
      "4. Write a Registry class that manages plugins in a type-safe way\n" +
      "5. Show how extends and & work together",
    starterCode: [
      "// Base Plugin Interface",
      "interface Plugin {",
      "  // TODO: name, version, commands, settings",
      "}",
      "",
      "// Plugin with additional lifecycle hooks",
      "interface LifecyclePlugin extends Plugin {",
      "  // TODO: onActivate, onDeactivate",
      "}",
      "",
      "// Plugin Registry",
      "class PluginRegistry {",
      "  // TODO: register(), get(), getAll(), executeCommand()",
      "}",
    ].join("\n"),
    solutionCode: [
      "// ═══ Base Plugin Interface ═══",
      "interface Plugin {",
      "  readonly name: string;",
      "  readonly version: string;",
      "  // Index Signature for dynamic commands",
      "  commands: {",
      "    [commandName: string]: (...args: string[]) => string;",
      "  };",
      "  settings: {",
      "    [key: string]: string | number | boolean;",
      "  };",
      "}",
      "",
      "// ═══ Extended interfaces with extends ═══",
      "interface LifecyclePlugin extends Plugin {",
      "  onActivate(): void;",
      "  onDeactivate(): void;",
      "}",
      "",
      "// ═══ Intersection Type: Base + Metadata ═══",
      "type PluginMetadata = {",
      "  readonly author: string;",
      "  readonly description: string;",
      "  readonly tags: readonly string[];",
      "};",
      "",
      "// A plugin with metadata — without needing a new interface",
      "type RichPlugin = Plugin & PluginMetadata;",
      "",
      "// ═══ Plugin Registry ═══",
      "class PluginRegistry {",
      "  private plugins: Map<string, Plugin> = new Map();",
      "",
      "  register(plugin: Plugin): void {",
      "    if (this.plugins.has(plugin.name)) {",
      "      throw new Error('Plugin already registered: ' + plugin.name);",
      "    }",
      "    this.plugins.set(plugin.name, plugin);",
      "  }",
      "",
      "  get(name: string): Plugin | undefined {",
      "    return this.plugins.get(name);",
      "  }",
      "",
      "  getAll(): readonly Plugin[] {",
      "    return Array.from(this.plugins.values());",
      "  }",
      "",
      "  executeCommand(pluginName: string, command: string, ...args: string[]): string {",
      "    const plugin = this.plugins.get(pluginName);",
      "    if (!plugin) {",
      "      throw new Error('Plugin not found: ' + pluginName);",
      "    }",
      "    const cmd = plugin.commands[command];",
      "    if (!cmd) {",
      "      throw new Error(",
      "        'Command ' + command + ' not found in plugin ' + pluginName",
      "      );",
      "    }",
      "    return cmd(...args);",
      "  }",
      "}",
      "",
      "// ═══ Example Plugin ═══",
      "// const markdownPlugin: RichPlugin = {",
      "//   name: 'markdown',",
      "//   version: '1.0.0',",
      "//   author: 'Team',",
      "//   description: 'Markdown formatting',",
      "//   tags: ['formatting', 'markdown'] as const,",
      "//   commands: {",
      "//     bold: (text) => '**' + text + '**',",
      "//     italic: (text) => '*' + text + '*',",
      "//     link: (text, url) => '[' + text + '](' + url + ')',",
      "//   },",
      "//   settings: {",
      "//     flavor: 'github',",
      "//     autoPreview: true,",
      "//     tabSize: 2,",
      "//   },",
      "// };",
      "",
      "// ═══ extends vs & (Intersection) ═══",
      "// extends: For interface inheritance. Creates a subtype relationship.",
      "//          Good when you have a real hierarchy.",
      "//",
      "// & (Intersection): Combines two types into one.",
      "//                   Good for composition (mixins, metadata).",
      "//                   Does not require a new interface.",
    ].join("\n"),
    conceptsBridged: [
      "Interfaces",
      "Index Signatures",
      "Intersection Types (&)",
      "extends vs &",
      "readonly Properties",
      "Structural Typing in Practice",
    ],
    hints: [
      "Index Signatures ([key: string]: ...) allow dynamic fields. For commands: [commandName: string]: (...args: string[]) => string.",
      "extends creates an inheritance hierarchy (LifecyclePlugin extends Plugin). & (Intersection) combines two types without a hierarchy (Plugin & Metadata).",
      "Use Map<string, Plugin> instead of Record<string, Plugin> for the registry. Map has has(), get(), set() and is safer at runtime than a plain object.",
    ],
    difficulty: 4,
  },
];