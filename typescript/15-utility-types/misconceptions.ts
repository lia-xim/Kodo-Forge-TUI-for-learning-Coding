/**
 * Lektion 15 — Fehlkonzeption-Exercises: Utility Types
 */

export interface Misconception {
  id: string;
  title: string;
  code: string;
  commonBelief: string;
  reality: string;
  concept: string;
  difficulty: number;
}

export const misconceptions: Misconception[] = [
  {
    id: "15-readonly-deep",
    title: "Readonly<T> schuetzt verschachtelte Objekte",
    code: `interface User {
  name: string;
  address: { city: string };
}
const u: Readonly<User> = { name: "Max", address: { city: "Berlin" } };
u.address.city = "Munich"; // Fehler?`,
    commonBelief: "Readonly<T> macht ALLES readonly — auch verschachtelte Properties.",
    reality:
      "Readonly<T> ist SHALLOW. Nur die erste Ebene ist geschuetzt. " +
      "u.address.city = 'Munich' funktioniert, weil address.city " +
      "NICHT readonly ist — nur die Referenz u.address ist geschuetzt. " +
      "Fuer tiefes Readonly braucht man DeepReadonly.",
    concept: "Readonly / shallow vs deep",
    difficulty: 2,
  },

  {
    id: "15-omit-typesafe",
    title: "Omit erkennt Tippfehler",
    code: `interface User { id: number; name: string; email: string; }
type WithoutEmail = Omit<User, "emali">; // Tippfehler!`,
    commonBelief: "Omit<User, 'emali'> sollte einen Compile-Error geben — 'emali' existiert nicht.",
    reality:
      "Omit<T, K> akzeptiert K extends string | number | symbol — " +
      "NICHT K extends keyof T. Beliebige Strings sind erlaubt. " +
      "'emali' wird nicht gefunden, also wird nichts entfernt — " +
      "WithoutEmail ist identisch mit User. " +
      "Loesung: type StrictOmit<T, K extends keyof T> = Omit<T, K>.",
    concept: "Omit / Typsicherheit der Keys",
    difficulty: 3,
  },

  {
    id: "15-partial-removes-types",
    title: "Partial entfernt die Typ-Information",
    code: `interface User { name: string; age: number; }
type PUser = Partial<User>;
const u: PUser = { name: "Max" };
// u.name hat welchen Typ?`,
    commonBelief: "u.name ist string — das ? aendert nichts am eigentlichen Typ.",
    reality:
      "Partial macht Properties optional: name?: string. " +
      "Das bedeutet name hat den Typ string | undefined! " +
      "Auch wenn name gesetzt ist, muss TypeScript die Moeglichkeit " +
      "von undefined beruecksichtigen. Du brauchst einen Narrowing-Check " +
      "oder NonNullable um sicher auf string zuzugreifen.",
    concept: "Partial / optional = T | undefined",
    difficulty: 2,
  },

  {
    id: "15-extract-objects",
    title: "Extract/Exclude arbeiten auf Objekt-Properties",
    code: `interface User { id: number; name: string; email: string; }
type WithoutId = Exclude<User, "id">; // ???`,
    commonBelief: "Exclude<User, 'id'> entfernt die id-Property aus dem User-Interface.",
    reality:
      "Exclude arbeitet auf UNION-MITGLIEDERN, nicht auf Objekt-Properties! " +
      "Exclude<User, 'id'> prueft ob User dem Typ 'id' zuweisbar ist — " +
      "ein Objekt ist kein String, also bleibt User unveraendert. " +
      "Fuer Property-Entfernung: Omit<User, 'id'>. " +
      "Exclude ist fuer Union-Typen: Exclude<'a' | 'b' | 'c', 'a'>.",
    concept: "Extract/Exclude vs Pick/Omit",
    difficulty: 3,
  },

  {
    id: "15-returntype-async",
    title: "ReturnType gibt bei async Funktionen den unwrapped Typ",
    code: `async function fetchUser() { return { name: "Max" }; }
type User = ReturnType<typeof fetchUser>;
// User = { name: string } ?`,
    commonBelief: "ReturnType<typeof fetchUser> ist { name: string }.",
    reality:
      "ReturnType gibt den TATSAECHLICHEN Rueckgabetyp — bei async " +
      "Funktionen ist das Promise<{ name: string }>, NICHT { name: string }. " +
      "Fuer den unwrapped Typ: Awaited<ReturnType<typeof fetchUser>>. " +
      "Das ist eines der haeufigsten Missverstaendnisse mit async.",
    concept: "ReturnType / async / Awaited",
    difficulty: 3,
  },

  {
    id: "15-record-flexible",
    title: "Record<string, T> und Record<K, T> sind gleich",
    code: `type A = Record<string, number>;
type B = Record<"x" | "y" | "z", number>;
// Gleicher Effekt?`,
    commonBelief: "Record<string, T> und Record<'x'|'y'|'z', T> sind aehnlich genug.",
    reality:
      "Record<string, T> erlaubt BELIEBIGE String-Keys — " +
      "es gibt keine Compile-Zeit-Pruefung welche Keys existieren. " +
      "Record<'x'|'y'|'z', T> erzwingt GENAU diese drei Keys — " +
      "fehlende oder extra Keys sind Compile-Errors. " +
      "Der Unterschied ist wie any vs spezifischer Typ.",
    concept: "Record / offene vs geschlossene Keys",
    difficulty: 2,
  },

  {
    id: "15-required-partial-cancel",
    title: "Required<Partial<T>> gibt immer T zurueck",
    code: `interface User {
  name: string;
  bio?: string;
}
type A = Required<Partial<User>>;
type B = Partial<Required<User>>;
// A === B === User?`,
    commonBelief: "Required und Partial heben sich immer gegenseitig auf.",
    reality:
      "Required<Partial<User>> macht erst alles optional, dann alles required. " +
      "Ergebnis: { name: string; bio: string } — bio ist jetzt REQUIRED! " +
      "Partial<Required<User>> macht erst alles required, dann alles optional. " +
      "Ergebnis: { name?: string; bio?: string } — name ist jetzt OPTIONAL! " +
      "Die Reihenfolge ist NICHT egal — sie ergibt VERSCHIEDENE Typen!",
    concept: "Composition-Reihenfolge / Partial + Required",
    difficulty: 4,
  },

  {
    id: "15-pick-preserves-optional",
    title: "Pick macht Properties immer required",
    code: `interface User {
  name: string;
  bio?: string;
  avatar?: string;
}
type Picked = Pick<User, "name" | "bio">;
// bio ist jetzt required?`,
    commonBelief: "Pick erstellt einen neuen Typ — alle Properties sind required.",
    reality:
      "Pick BEWAHRT den Original-Modifier! Wenn bio in User optional war " +
      "(bio?: string), ist es auch in Pick<User, 'name' | 'bio'> optional. " +
      "Pick aendert weder optional noch readonly — es waehlt nur aus. " +
      "Fuer required nach Pick: Required<Pick<User, 'name' | 'bio'>>.",
    concept: "Pick / Modifier-Bewahrung",
    difficulty: 3,
  },
];
