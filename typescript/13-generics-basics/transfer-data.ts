/**
 * Lektion 13 — Transfer Tasks: Generics Basics
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

export const transferTasks: TransferTask[] = [
  {
    id: "13-generic-form-validator",
    title: "Generischer Formular-Validator",
    prerequisiteLessons: [13],
    scenario:
      "Du baust ein Formular-System fuer eine Web-App. Bisher hat jedes Formular " +
      "seinen eigenen handgeschriebenen Validator. Die Logik ist immer gleich — " +
      "nur die Felder und Regeln unterscheiden sich. Code-Duplikation pur.",
    task:
      "Erstelle ein generisches Validierungssystem:\n\n" +
      "1. Definiere ein generisches Interface ValidationRule<T> das den Typ des " +
      "   Formulars kennt und Regeln pro Feld definiert\n" +
      "2. Schreibe eine generische validate<T>-Funktion die ein Objekt und " +
      "   Regeln nimmt und Fehler pro Feld zurueckgibt\n" +
      "3. Nutze keyof Constraints damit nur gueltige Felder validiert werden koennen\n" +
      "4. Zeige wie dasselbe System fuer User-, Product- und Adress-Formulare funktioniert",
    starterCode: [
      "// TODO: ValidationRule<T> Interface",
      "// TODO: ValidationErrors<T> Type",
      "// TODO: validate<T>() Funktion",
      "// TODO: Beispiele fuer verschiedene Formulare",
    ].join("\n"),
    solutionCode: [
      "// Validierungsregel fuer ein einzelnes Feld",
      "interface FieldRule<T> {",
      "  required?: boolean;",
      "  minLength?: number;",
      "  maxLength?: number;",
      "  custom?: (value: T) => string | null;",
      "}",
      "",
      "// Regeln fuer das gesamte Formular — nur gueltige Keys erlaubt!",
      "type ValidationRules<T> = {",
      "  [K in keyof T]?: FieldRule<T[K]>;",
      "};",
      "",
      "// Fehler pro Feld",
      "type ValidationErrors<T> = Partial<Record<keyof T, string[]>>;",
      "",
      "// Generische Validierungsfunktion",
      "function validate<T extends Record<string, unknown>>(data: T, rules: ValidationRules<T>): ValidationErrors<T> {",
      "  const errors: ValidationErrors<T> = {};",
      "",
      "  for (const key of Object.keys(rules) as (keyof T)[]) {",
      "    const rule = rules[key] as FieldRule<unknown> | undefined;",
      "    if (!rule) continue;",
      "    const value = data[key];",
      "    const fieldErrors: string[] = [];",
      "",
      "    if (rule.required && (value === undefined || value === null || value === '')) {",
      "      fieldErrors.push('Pflichtfeld');",
      "    }",
      "    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {",
      "      fieldErrors.push(`Mindestens ${rule.minLength} Zeichen`);",
      "    }",
      "    if (rule.custom) {",
      "      const msg = rule.custom(value);",
      "      if (msg) fieldErrors.push(msg);",
      "    }",
      "    if (fieldErrors.length > 0) errors[key] = fieldErrors;",
      "  }",
      "  return errors;",
      "}",
      "",
      "// Verwendung fuer verschiedene Formulare:",
      "interface UserForm { name: string; email: string; age: number; }",
      "const userErrors = validate<UserForm>(",
      "  { name: '', email: 'bad', age: 15 },",
      "  { name: { required: true }, email: { custom: v => String(v).includes('@') ? null : 'Keine gueltige Email' } }",
      ");",
    ].join("\n"),
    conceptsBridged: [
      "Generische Funktionen mit Record-Constraint",
      "keyof fuer typsichere Feld-Validierung",
      "Mapped Types fuer Regelobjekte",
      "Ein Validator fuer alle Formular-Typen",
    ],
    hints: [
      "ValidationRules<T> nutzt keyof T als Keys — so sind nur gueltige Felder erlaubt.",
      "validate<T> nimmt sowohl die Daten als auch die Regeln als T-abhaengig.",
      "Die Fehler sind Partial<Record<keyof T, string[]>> — nicht jedes Feld hat Fehler.",
    ],
    difficulty: 4,
  },

  {
    id: "13-data-pipeline",
    title: "Generische Daten-Pipeline",
    prerequisiteLessons: [13],
    scenario:
      "Dein Daten-Team verarbeitet CSV-Imports verschiedener Typen: User-Daten, " +
      "Transaktionen, Produktkataloge. Jeder Import hat eigenen Code fuer " +
      "Parsing, Validierung und Transformation. Die Pipelines sind identisch " +
      "aufgebaut — nur die Typen unterscheiden sich.",
    task:
      "Erstelle eine generische Daten-Pipeline:\n\n" +
      "1. Interface Pipeline<TInput, TOutput> mit den Schritten parse, validate, transform\n" +
      "2. Eine generische pipe-Funktion die die Schritte verkettet\n" +
      "3. Zeige wie dieselbe Pipeline-Struktur fuer User-Import und " +
      "   Transaktions-Import funktioniert\n" +
      "4. Nutze Generics damit Typ-Fehler bei falscher Verkettung erkannt werden",
    starterCode: [
      "// TODO: PipelineStep<TIn, TOut> Interface",
      "// TODO: Pipeline<TRaw, TFinal> Builder",
      "// TODO: User-Import Pipeline",
      "// TODO: Transaction-Import Pipeline",
    ].join("\n"),
    solutionCode: [
      "interface PipelineStep<TIn, TOut> {",
      "  name: string;",
      "  execute(input: TIn): TOut;",
      "}",
      "",
      "function createPipeline<TIn, TOut>(steps: [PipelineStep<TIn, TOut>]): (input: TIn) => TOut;",
      "function createPipeline<TIn, TMid, TOut>(steps: [PipelineStep<TIn, TMid>, PipelineStep<TMid, TOut>]): (input: TIn) => TOut;",
      "function createPipeline(steps: PipelineStep<any, any>[]): (input: any) => any {",
      "  return (input) => steps.reduce((acc, step) => step.execute(acc), input);",
      "}",
      "",
      "// User-Pipeline: string[] -> RawUser -> ValidUser",
      "interface RawUser { name: string; ageStr: string; }",
      "interface ValidUser { name: string; age: number; }",
      "",
      "const parseUser: PipelineStep<string[], RawUser[]> = {",
      "  name: 'parse',",
      "  execute: (rows) => rows.map(r => {",
      "    const [name, ageStr] = r.split(',');",
      "    return { name, ageStr };",
      "  }),",
      "};",
    ].join("\n"),
    conceptsBridged: [
      "PipelineStep<TIn, TOut> fuer typsichere Verkettung",
      "Generics verbinden Output eines Schritts mit Input des naechsten",
      "Gleiche Pipeline-Struktur fuer verschiedene Datentypen",
      "Compile-Zeit-Fehler bei falscher Schritt-Reihenfolge",
    ],
    hints: [
      "PipelineStep<TIn, TOut> hat execute(input: TIn): TOut — Input und Output sind verschiedene Typen.",
      "Die Pipeline verkettet Steps: Output von Step 1 = Input von Step 2.",
      "Generics stellen sicher dass die Typen zwischen Steps passen.",
    ],
    difficulty: 5,
  },

  {
    id: "13-generic-cache-with-ttl",
    title: "Generischer Cache mit TTL und typsicheren Keys",
    prerequisiteLessons: [13],
    scenario:
      "Deine App cached verschiedene Datentypen: User-Profile, API-Responses, " +
      "Konfigurationen. Jeder Cache-Eintrag hat einen anderen Typ. Bisher " +
      "nutzt du Map<string, any> — bei get() kommt immer any zurueck. " +
      "Tippfehler in Keys werden nicht erkannt.",
    task:
      "Erstelle einen typsicheren Cache:\n\n" +
      "1. Definiere eine CacheMap als generisches Interface das Keys mit Typen verbindet\n" +
      "2. Schreibe eine generische TypedCache-Klasse die get() und set() " +
      "   mit keyof-Constraints typsicher macht\n" +
      "3. Implementiere TTL (Time-To-Live) pro Eintrag\n" +
      "4. Zeige wie ungueltige Keys und falsche Werttypen zur Compilezeit erkannt werden",
    starterCode: [
      "// TODO: CacheSchema Interface (definiert welche Keys welche Typen haben)",
      "// TODO: TypedCache<TSchema> Klasse",
      "// TODO: get() und set() mit keyof Constraint",
      "// TODO: TTL-Mechanismus",
    ].join("\n"),
    solutionCode: [
      "// Schema definiert: Key -> Werttyp",
      "interface AppCache {",
      "  'user:profile': { name: string; age: number };",
      "  'config:theme': 'light' | 'dark';",
      "  'api:products': { id: number; title: string }[];",
      "}",
      "",
      "class TypedCache<TSchema extends Record<string, unknown>> {",
      "  private store = new Map<string, { value: unknown; expiresAt: number }>();",
      "",
      "  get<K extends keyof TSchema & string>(key: K): TSchema[K] | undefined {",
      "    const entry = this.store.get(key);",
      "    if (!entry) return undefined;",
      "    if (Date.now() > entry.expiresAt) {",
      "      this.store.delete(key);",
      "      return undefined;",
      "    }",
      "    return entry.value as TSchema[K];",
      "  }",
      "",
      "  set<K extends keyof TSchema & string>(key: K, value: TSchema[K], ttlMs = 60_000): void {",
      "    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });",
      "  }",
      "}",
      "",
      "const cache = new TypedCache<AppCache>();",
      "cache.set('user:profile', { name: 'Max', age: 30 });",
      "const profile = cache.get('user:profile'); // { name: string; age: number } | undefined",
      "// cache.set('user:profile', 'wrong'); // Error! string !== { name: string; age: number }",
      "// cache.get('unknown:key'); // Error! Kein gueltiger Key",
    ].join("\n"),
    conceptsBridged: [
      "Schema-Interface fuer typsichere Key-Value-Beziehungen",
      "keyof Constraint fuer gueltige Cache-Keys",
      "Indexed Access TSchema[K] fuer praezise Werttypen",
      "Generische Klasse mit Schema-Parameter",
    ],
    hints: [
      "Das Schema-Interface definiert: jeder Key hat einen bestimmten Werttyp.",
      "get<K extends keyof TSchema>(key: K): TSchema[K] — der Rueckgabetyp ist praezise pro Key.",
      "set<K extends keyof TSchema>(key: K, value: TSchema[K]) — Werttyp wird pro Key geprueft.",
    ],
    difficulty: 4,
  },
];
