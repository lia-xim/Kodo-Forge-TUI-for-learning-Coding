/**
 * Lektion 13 — Tracing-Exercises: Generics Basics
 */

import type { TracingExercise } from "../tools/tracing-engine.ts";

export const tracingExercises: TracingExercise[] = [
  {
    id: "13-inference-flow",
    title: "Type Inference bei generischen Funktionen",
    description: "Verfolge wie TypeScript Typparameter aus den Argumenten inferiert.",
    code: [
      "function wrap<T>(value: T): { wrapped: T } {",
      "  return { wrapped: value };",
      "}",
      "",
      "const a = wrap('hallo');",
      "const b = wrap(42);",
      "const c = wrap({ name: 'Max', age: 30 });",
      "const d = wrap<boolean>(true);",
    ],
    steps: [
      {
        lineIndex: 4,
        question: "Was ist T und welchen Typ hat a?",
        expectedAnswer: "T = string, a: { wrapped: string }",
        variables: { "T": "string", "a": "{ wrapped: 'hallo' } (Typ: { wrapped: string })" },
        explanation: "TypeScript inferiert T = string aus dem Argument 'hallo'.",
      },
      {
        lineIndex: 5,
        question: "Was ist T und welchen Typ hat b?",
        expectedAnswer: "T = number, b: { wrapped: number }",
        variables: { "T": "number", "b": "{ wrapped: 42 } (Typ: { wrapped: number })" },
        explanation: "TypeScript inferiert T = number aus dem Argument 42.",
      },
      {
        lineIndex: 6,
        question: "Was ist T und welchen Typ hat c?",
        expectedAnswer: "T = { name: string; age: number }, c: { wrapped: { name: string; age: number } }",
        variables: { "T": "{ name: string; age: number }" },
        explanation: "TypeScript inferiert auch komplexe Objekttypen aus den Argumenten.",
      },
      {
        lineIndex: 7,
        question: "Was ist T bei expliziter Angabe? Welchen Typ hat d?",
        expectedAnswer: "T = boolean (explizit), d: { wrapped: boolean }",
        variables: { "T": "boolean (explizit angegeben)", "d": "{ wrapped: true } (Typ: { wrapped: boolean })" },
        explanation: "Bei expliziter Angabe <boolean> wird T nicht inferiert, sondern direkt gesetzt.",
      },
    ],
    concept: "generic-type-inference",
    difficulty: 1,
  },

  {
    id: "13-constraint-narrowing",
    title: "Constraints und der inferierte Typ",
    description: "Verfolge wie Constraints den inferierten Typ NICHT einschraenken — T behaelt alle Properties.",
    code: [
      "interface HasId { id: number; }",
      "",
      "function process<T extends HasId>(entity: T): T {",
      "  console.log(`Processing ${entity.id}`);",
      "  return entity;",
      "}",
      "",
      "const user = { id: 1, name: 'Max', email: 'max@test.de' };",
      "const result = process(user);",
      "console.log(result.name);",
      "console.log(result.email);",
    ],
    steps: [
      {
        lineIndex: 8,
        question: "Was ist T nach process(user)? HasId oder der volle Typ?",
        expectedAnswer: "T = { id: number; name: string; email: string } — der VOLLE Typ, nicht HasId",
        variables: { "T": "{ id: number; name: string; email: string }" },
        explanation: "Der Constraint ist die Mindestanforderung. T behaelt den VOLLEN Typ des Arguments.",
      },
      {
        lineIndex: 9,
        question: "Funktioniert result.name? Welchen Typ hat es?",
        expectedAnswer: "Ja — result hat den vollen Typ. result.name ist string.",
        variables: { "result.name": "'Max' (Typ: string)" },
        explanation: "T behaelt alle Properties — nicht nur die des Constraints.",
      },
      {
        lineIndex: 10,
        question: "Funktioniert result.email?",
        expectedAnswer: "Ja — result.email ist string. T ist der volle Typ.",
        variables: { "result.email": "'max@test.de' (Typ: string)" },
        explanation: "Der Constraint garantiert id, aber T hat alles was der Aufrufer uebergibt.",
      },
    ],
    concept: "constraint-preserves-full-type",
    difficulty: 2,
  },

  {
    id: "13-keyof-indexed-access",
    title: "keyof und Indexed Access Types",
    description: "Verfolge wie K extends keyof T den praezisen Property-Typ zurueckgibt.",
    code: [
      "function get<T, K extends keyof T>(obj: T, key: K): T[K] {",
      "  return obj[key];",
      "}",
      "",
      "const config = { host: 'localhost', port: 3000, debug: true };",
      "const host = get(config, 'host');",
      "const port = get(config, 'port');",
      "const debug = get(config, 'debug');",
    ],
    steps: [
      {
        lineIndex: 5,
        question: "Was ist K und welchen Typ hat host?",
        expectedAnswer: "K = 'host', T[K] = T['host'] = string",
        variables: { "K": "'host'", "T[K]": "string", "host": "'localhost' (Typ: string)" },
        explanation: "K wird zum Literal 'host' inferiert. T['host'] ist string.",
      },
      {
        lineIndex: 6,
        question: "Was ist K und welchen Typ hat port?",
        expectedAnswer: "K = 'port', T[K] = T['port'] = number",
        variables: { "K": "'port'", "T[K]": "number", "port": "3000 (Typ: number)" },
        explanation: "K = 'port', T['port'] = number. Jeder Key hat seinen praezisen Typ.",
      },
      {
        lineIndex: 7,
        question: "Was ist K und welchen Typ hat debug?",
        expectedAnswer: "K = 'debug', T[K] = T['debug'] = boolean",
        variables: { "K": "'debug'", "T[K]": "boolean", "debug": "true (Typ: boolean)" },
        explanation: "Indexed Access T[K] gibt fuer jeden Key den PRAEZISEN Typ zurueck — nicht den Union aller Typen.",
      },
    ],
    concept: "keyof-indexed-access-precision",
    difficulty: 3,
  },

  {
    id: "13-multiple-type-params",
    title: "Mehrere Typparameter — map-Funktion",
    description: "Verfolge wie T und U bei einer map-Funktion inferiert werden.",
    code: [
      "function myMap<T, U>(arr: T[], fn: (item: T) => U): U[] {",
      "  return arr.map(fn);",
      "}",
      "",
      "const nums = [1, 2, 3];",
      "const strings = myMap(nums, n => String(n));",
      "const objects = myMap(nums, n => ({ value: n, doubled: n * 2 }));",
    ],
    steps: [
      {
        lineIndex: 5,
        question: "Was sind T und U? Welchen Typ hat strings?",
        expectedAnswer: "T = number (aus nums), U = string (aus String(n)). strings: string[]",
        variables: { "T": "number", "U": "string", "strings": "['1', '2', '3'] (Typ: string[])" },
        explanation: "T wird aus dem Array inferiert, U aus dem Rueckgabetyp der Callback-Funktion.",
      },
      {
        lineIndex: 6,
        question: "Was sind T und U beim zweiten Aufruf?",
        expectedAnswer: "T = number, U = { value: number; doubled: number }. objects: { value: number; doubled: number }[]",
        variables: { "T": "number", "U": "{ value: number; doubled: number }" },
        explanation: "TypeScript inferiert den komplexen Objekttyp aus dem Callback-Rueckgabetyp.",
      },
    ],
    concept: "multiple-type-param-inference",
    difficulty: 2,
  },
];
