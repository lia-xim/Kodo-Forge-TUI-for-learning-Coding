/**
 * Lektion 18 — Parson's Problems: Template Literal Types
 */
import type { ParsonsProblem } from "../tools/parsons-engine.ts";

export const parsonsProblems: ParsonsProblem[] = [
  { id: "L18-P1", title: "Event-Name-Typ generieren", description: "Ordne die Zeilen zu einem Typ der Event-Handler-Namen generiert.", correctOrder: ["type EventHandlers<T> = {", "  [K in keyof T & string as `on${Capitalize<K>}Change`]:", "    (newValue: T[K], oldValue: T[K]) => void;", "};"], distractors: ["  [K in keyof T as `on${K}Change`]:", "  [K in keyof T as `on${Uppercase<K>}Change`]:"], hint: "string & K fuer String-Filterung, Capitalize (nicht Uppercase) fuer den ersten Buchstaben.", concept: "event-handler-generation", difficulty: 3 },
  { id: "L18-P2", title: "Route-Parameter extrahieren", description: "Ordne die Zeilen zur rekursiven Parameter-Extraktion.", correctOrder: ["type ExtractParams<T extends string> =", "  T extends `${string}:${infer Param}/${infer Rest}`", "    ? Param | ExtractParams<Rest>", "    : T extends `${string}:${infer Param}`", "      ? Param", "      : never;"], distractors: ["  T extends `${infer Param}/${infer Rest}`", "    ? ExtractParams<Param>"], hint: "Zwei Cases: mit /-Rest (rekursiv) und ohne (letzter Parameter). :param-Pattern matchen.", concept: "route-param-extraction", difficulty: 4 },
  { id: "L18-P3", title: "ReplaceAll rekursiv", description: "Ordne die Zeilen zum rekursiven String-Replace.", correctOrder: ["type ReplaceAll<S extends string, From extends string, To extends string> =", "  S extends `${infer H}${From}${infer T}`", "    ? ReplaceAll<`${H}${To}${T}`, From, To>", "    : S;"], distractors: ["    ? `${H}${To}${T}`", "    ? ReplaceAll<S, From, To>"], hint: "Nach dem Ersetzen: ReplaceAll auf das NEUE Ergebnis anwenden (nicht auf S). Ohne Rekursion nur erstes Vorkommen.", concept: "recursive-replace", difficulty: 3 },
];
