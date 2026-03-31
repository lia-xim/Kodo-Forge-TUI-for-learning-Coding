/**
 * Lektion 05 -- Transfer Tasks: Objects & Interfaces
 *
 * Diese Tasks nehmen die Konzepte aus der Objects/Interfaces-Lektion
 * und wenden sie in komplett neuen Kontexten an:
 *
 *  1. REST-API Response States modellieren
 *  2. Formular-Validierung mit Readonly und Partial
 *  3. Plugin-System mit Index Signatures und Intersection Types
 *
 * Keine externen Dependencies.
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

// ─── Transfer Tasks ─────────────────────────────────────────────────────────

export const transferTasks: TransferTask[] = [
  // ─── Task 1: REST-API Response States ──────────────────────────────────
  {
    id: "05-api-response-states",
    title: "REST-API Response States modellieren",
    prerequisiteLessons: [5],
    scenario:
      "Deine React-App zeigt Daten von einer REST-API an. Aktuell sieht " +
      "der State so aus: { data: any, loading: boolean, error: string | null }. " +
      "Das Problem: Es gibt ungueltige Kombinationen — z.B. loading: true " +
      "UND data vorhanden, oder loading: false und WEDER data noch error. " +
      "Letzte Woche hat die App einen Spinner UND Fehlermeldung gleichzeitig " +
      "angezeigt, weil der State inkonsistent war.",
    task:
      "Modelliere die API-Response als Discriminated Union.\n\n" +
      "1. Definiere drei Zustaende: 'idle', 'loading', 'success', 'error'\n" +
      "2. Jeder Zustand hat NUR die Felder die er braucht\n" +
      "3. Nutze ein gemeinsames 'status'-Feld als Discriminator\n" +
      "4. Schreibe eine render-Funktion die per switch/if jeden " +
      "   Zustand sicher behandelt (exhaustive check)\n" +
      "5. Zeige warum die alte Variante mit boolean-Flags " +
      "   unsichere Zustaende erlaubt",
    starterCode: [
      "// ALT (unsicher): Erlaubt ungueltige Kombinationen",
      "// interface ApiState {",
      "//   data: User[] | null;",
      "//   loading: boolean;",
      "//   error: string | null;",
      "// }",
      "",
      "// NEU: Discriminated Union",
      "type ApiState<T> = ???;",
      "",
      "interface User {",
      "  id: number;",
      "  name: string;",
      "  email: string;",
      "}",
      "",
      "function renderUserList(state: ApiState<User[]>): string {",
      "  // TODO: Jeden Zustand sicher behandeln",
      "}",
    ].join("\n"),
    solutionCode: [
      "// ═══ Discriminated Union: Jeder Zustand hat nur seine Felder ═══",
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
      "// ═══ Exhaustive Render-Funktion ═══",
      "function renderUserList(state: ApiState<User[]>): string {",
      "  switch (state.status) {",
      "    case 'idle':",
      "      return 'Druecke Laden um Benutzer anzuzeigen';",
      "",
      "    case 'loading':",
      "      return 'Lade Benutzer...';",
      "",
      "    case 'success':",
      "      // TypeScript weiss: state.data existiert hier",
      "      if (state.data.length === 0) {",
      "        return 'Keine Benutzer gefunden';",
      "      }",
      "      return state.data.map(u => u.name).join(', ');",
      "",
      "    case 'error':",
      "      // TypeScript weiss: state.error existiert hier",
      "      return 'Fehler: ' + state.error +",
      "        ' (Versuch ' + state.retryCount + ')';",
      "  }",
      "}",
      "",
      "// ═══ Warum ist die alte Variante unsicher? ═══",
      "// { loading: true, data: [...], error: 'Timeout' }",
      "// -> Laden UND Daten UND Fehler gleichzeitig? Unsinn!",
      "//",
      "// { loading: false, data: null, error: null }",
      "// -> Nicht laden, keine Daten, kein Fehler? Was zeigen wir an?",
      "//",
      "// Mit Discriminated Unions ist das UNMOEGLICH:",
      "// - status: 'loading' hat kein data und kein error",
      "// - status: 'success' hat data, aber kein error",
      "// - status: 'error' hat error, aber kein data",
      "// -> Jeder Zustand hat NUR die Felder die Sinn machen",
      "",
      "// ═══ Bonus: Exhaustive Check ═══",
      "// Wenn ein neuer Status hinzukommt (z.B. 'refreshing'),",
      "// erzwingt der switch-Block einen Compile-Fehler:",
      "// 'Not all code paths return a value'",
      "// So vergisst man nie einen Fall.",
    ].join("\n"),
    conceptsBridged: [
      "Discriminated Unions",
      "Structural Typing",
      "Exhaustive Checks",
      "Generics mit Interfaces",
      "Zustandsmodellierung",
    ],
    hints: [
      "Das Problem mit boolean-Flags: 2 Booleans (loading, hasError) ergeben 4 Kombinationen, aber nur 3 davon sind gueltig. Discriminated Unions erlauben NUR gueltige Zustaende.",
      "Nutze ein gemeinsames Feld 'status' mit Literal Types ('idle' | 'loading' | 'success' | 'error'). TypeScript kann dann per switch() den Typ narrowen.",
      "Mache den Typ generisch (ApiState<T>) damit er fuer beliebige Daten funktioniert: ApiState<User[]>, ApiState<Product>, etc.",
    ],
    difficulty: 3,
  },

  // ─── Task 2: Formular mit Readonly und Partial ─────────────────────────
  {
    id: "05-formular-validierung",
    title: "Formular-State mit Readonly, Partial und Pick",
    prerequisiteLessons: [5],
    scenario:
      "Du baust ein mehrseitiges Registrierungsformular (Wizard). " +
      "Seite 1: Name und E-Mail. Seite 2: Adresse. Seite 3: Zusammenfassung. " +
      "Das Problem: Auf Seite 1 sind die Adressfelder noch leer (undefined), " +
      "aber auf Seite 3 muessen alle Felder vorhanden sein. " +
      "Aktuell werden alle Felder als optional (?) markiert, " +
      "und auf der Zusammenfassungsseite crasht die App manchmal " +
      "weil ein Feld fehlt.",
    task:
      "Modelliere den Formular-State so, dass jede Seite genau " +
      "die richtigen Typen hat.\n\n" +
      "1. Definiere das vollstaendige UserProfile-Interface\n" +
      "2. Nutze Pick<> um fuer jede Seite nur die relevanten Felder zu haben\n" +
      "3. Nutze Partial<> fuer den Gesamtzustand waehrend des Ausfuellens\n" +
      "4. Nutze Readonly<> fuer die Zusammenfassungsseite " +
      "   (keine Aenderungen mehr moeglich)\n" +
      "5. Schreibe eine Funktion die von Partial -> vollstaendig validiert",
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
      "// Typen fuer jede Wizard-Seite:",
      "type Step1Data = ???;  // Nur Name + E-Mail",
      "type Step2Data = ???;  // Nur Adresse",
      "type DraftProfile = ???;  // Alles optional (Zwischenstand)",
      "type FinalProfile = ???;  // Alles readonly (fertig)",
      "",
      "function validateDraft(draft: DraftProfile): FinalProfile | null {",
      "  // TODO: Pruefe ob alle Felder vorhanden sind",
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
      "// ═══ Pick: Nur die relevanten Felder pro Seite ═══",
      "type Step1Data = Pick<UserProfile, 'firstName' | 'lastName' | 'email'>;",
      "type Step2Data = Pick<UserProfile, 'street' | 'city' | 'zipCode' | 'country'>;",
      "",
      "// ═══ Partial: Alles optional waehrend des Ausfuellens ═══",
      "type DraftProfile = Partial<UserProfile>;",
      "// Ergibt: {",
      "//   firstName?: string | undefined;",
      "//   lastName?: string | undefined;",
      "//   ... alle Felder optional",
      "// }",
      "",
      "// ═══ Readonly: Keine Aenderungen auf der Zusammenfassungsseite ═══",
      "type FinalProfile = Readonly<UserProfile>;",
      "// Ergibt: {",
      "//   readonly firstName: string;",
      "//   readonly lastName: string;",
      "//   ... alle Felder readonly",
      "// }",
      "",
      "// ═══ Validierung: Partial -> Vollstaendig ═══",
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
      "  // Alle Felder sind vorhanden — sicherer Cast",
      "  return draft as FinalProfile;",
      "}",
      "",
      "// ═══ Wizard-Seiten mit korrekten Typen ═══",
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
      "//     console.log('Bitte alle Felder ausfuellen');",
      "//     return;",
      "//   }",
      "//   // TypeScript weiss: final hat alle Felder (readonly)",
      "//   console.log(final.firstName + ' ' + final.lastName);",
      "//   // final.firstName = 'Hack';  // Compile-Fehler! readonly",
      "// }",
    ].join("\n"),
    conceptsBridged: [
      "Pick / Partial / Readonly",
      "Utility Types kombinieren",
      "readonly (shallow)",
      "keyof",
      "Wizard-State-Pattern",
    ],
    hints: [
      "Pick<UserProfile, 'firstName' | 'lastName' | 'email'> gibt dir ein neues Interface mit NUR diesen drei Feldern. Perfekt fuer einzelne Wizard-Seiten.",
      "Partial<UserProfile> macht alle Felder optional. Das ist der richtige Typ fuer den Zwischenstand waehrend der Benutzer noch ausfuellt.",
      "Readonly<UserProfile> verhindert Aenderungen. Nutze das fuer die finale Zusammenfassung. Wichtig: readonly ist in TypeScript nur SHALLOW (nur erste Ebene).",
    ],
    difficulty: 3,
  },

  // ─── Task 3: Plugin-System ─────────────────────────────────────────────
  {
    id: "05-plugin-system",
    title: "Erweiterbares Plugin-System",
    prerequisiteLessons: [5],
    scenario:
      "Du entwickelst einen Texteditor der durch Plugins erweitert werden kann. " +
      "Jedes Plugin registriert sich mit einem Namen und bringt Kommandos " +
      "und Einstellungen mit. Das Problem: Die aktuelle Implementierung " +
      "nutzt ein einfaches Record<string, any> fuer die Plugin-Registry. " +
      "Es gibt keine Typsicherheit bei der Registrierung und beim Zugriff.",
    task:
      "Baue ein typsicheres Plugin-System mit Interfaces und Intersection Types.\n\n" +
      "1. Definiere ein Plugin-Interface mit name, version, commands, settings\n" +
      "2. Nutze Index Signatures fuer die dynamischen Kommandos\n" +
      "3. Nutze Intersection Types um Plugins mit Basis-Funktionalitaet " +
      "   zu erweitern\n" +
      "4. Schreibe eine Registry-Klasse die Plugins typsicher verwaltet\n" +
      "5. Zeige wie extends und & zusammenarbeiten",
    starterCode: [
      "// Basis-Plugin Interface",
      "interface Plugin {",
      "  // TODO: name, version, commands, settings",
      "}",
      "",
      "// Plugin mit zusaetzlichen Lifecycle-Hooks",
      "interface LifecyclePlugin extends Plugin {",
      "  // TODO: onActivate, onDeactivate",
      "}",
      "",
      "// Plugin-Registry",
      "class PluginRegistry {",
      "  // TODO: register(), get(), getAll(), executeCommand()",
      "}",
    ].join("\n"),
    solutionCode: [
      "// ═══ Basis-Plugin Interface ═══",
      "interface Plugin {",
      "  readonly name: string;",
      "  readonly version: string;",
      "  // Index Signature fuer dynamische Kommandos",
      "  commands: {",
      "    [commandName: string]: (...args: string[]) => string;",
      "  };",
      "  settings: {",
      "    [key: string]: string | number | boolean;",
      "  };",
      "}",
      "",
      "// ═══ Erweiterte Interfaces mit extends ═══",
      "interface LifecyclePlugin extends Plugin {",
      "  onActivate(): void;",
      "  onDeactivate(): void;",
      "}",
      "",
      "// ═══ Intersection Type: Basis + Metadata ═══",
      "type PluginMetadata = {",
      "  readonly author: string;",
      "  readonly description: string;",
      "  readonly tags: readonly string[];",
      "};",
      "",
      "// Ein Plugin mit Metadata — ohne ein neues Interface zu brauchen",
      "type RichPlugin = Plugin & PluginMetadata;",
      "",
      "// ═══ Plugin-Registry ═══",
      "class PluginRegistry {",
      "  private plugins: Map<string, Plugin> = new Map();",
      "",
      "  register(plugin: Plugin): void {",
      "    if (this.plugins.has(plugin.name)) {",
      "      throw new Error('Plugin bereits registriert: ' + plugin.name);",
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
      "      throw new Error('Plugin nicht gefunden: ' + pluginName);",
      "    }",
      "    const cmd = plugin.commands[command];",
      "    if (!cmd) {",
      "      throw new Error(",
      "        'Kommando ' + command + ' nicht gefunden in Plugin ' + pluginName",
      "      );",
      "    }",
      "    return cmd(...args);",
      "  }",
      "}",
      "",
      "// ═══ Beispiel-Plugin ═══",
      "// const markdownPlugin: RichPlugin = {",
      "//   name: 'markdown',",
      "//   version: '1.0.0',",
      "//   author: 'Team',",
      "//   description: 'Markdown-Formatierung',",
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
      "// extends: Fuer Interface-Vererbung. Erstellt eine Subtype-Beziehung.",
      "//          Gut wenn man eine echte Hierarchie hat.",
      "//",
      "// & (Intersection): Kombiniert zwei Typen zu einem.",
      "//                   Gut fuer Composition (Mixins, Metadata).",
      "//                   Braucht kein neues Interface.",
    ].join("\n"),
    conceptsBridged: [
      "Interfaces",
      "Index Signatures",
      "Intersection Types (&)",
      "extends vs &",
      "readonly Properties",
      "Structural Typing in der Praxis",
    ],
    hints: [
      "Index Signatures ([key: string]: ...) erlauben dynamische Felder. Fuer die Kommandos: [commandName: string]: (...args: string[]) => string.",
      "extends erstellt eine Vererbungs-Hierarchie (LifecyclePlugin extends Plugin). & (Intersection) kombiniert zwei Typen ohne Hierarchie (Plugin & Metadata).",
      "Nutze Map<string, Plugin> statt Record<string, Plugin> fuer die Registry. Map hat has(), get(), set() und ist zur Laufzeit sicherer als ein Objekt.",
    ],
    difficulty: 4,
  },
];
