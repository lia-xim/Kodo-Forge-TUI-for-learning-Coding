/**
 * Lektion 20 — Parson's Problems: Review Phase 2
 */
import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  { id: "L20-P1", title: "DeepReadonly (L16+L17)", description: "Ordne die Zeilen zum rekursiven DeepReadonly.", correctOrder: ["type DeepReadonly<T> = {", "  readonly [K in keyof T]: T[K] extends object", "    ? T[K] extends Function", "      ? T[K]", "      : DeepReadonly<T[K]>", "    : T[K];", "};"], distractors: ["  readonly [K in keyof T]: DeepReadonly<T[K]>;", "    ? DeepReadonly<T[K]>"], hint: "Reihenfolge: object-Check -> Function-Guard -> Rekursion -> Primitive.", concept: "recursive-deep-readonly", difficulty: 4 },
  { id: "L20-P2", title: "ExtractParams (L18)", description: "Ordne die Zeilen zur Route-Parameter-Extraktion.", correctOrder: ["type ExtractParams<T extends string> =", "  T extends `${string}:${infer P}/${infer Rest}`", "    ? P | ExtractParams<Rest>", "    : T extends `${string}:${infer P}`", "      ? P", "      : never;"], distractors: ["  T extends `${infer P}/${infer Rest}`", "    ? ExtractParams<P>"], hint: "Zwei Cases: mit /Rest (rekursiv) und ohne (letzter Param). :param-Pattern matchen.", concept: "route-param-extraction", difficulty: 4 },
  { id: "L20-P3", title: "Global Augmentation (L19)", description: "Ordne die Zeilen zur korrekten ProcessEnv-Erweiterung.", correctOrder: ["declare global {", "  namespace NodeJS {", "    interface ProcessEnv {", "      NODE_ENV: 'development' | 'production';", "      DATABASE_URL: string;", "    }", "  }", "}", "export {};"], distractors: ["declare namespace global {", "module.exports = {};"], hint: "declare global, namespace NodeJS, interface ProcessEnv. export {} am Ende!", concept: "global-augmentation", difficulty: 2 },
];
