/**
 * Lektion 02 — Fehlkonzeption-Exercises: Primitive Types
 *
 * Code der "offensichtlich richtig" aussieht aber subtil falsch ist.
 * Der Lernende muss den Bug finden.
 */

export interface Misconception {
  id: string;
  title: string;
  /** Der "offensichtlich korrekte" Code */
  code: string;
  /** Was die meisten Leute denken */
  commonBelief: string;
  /** Was tatsaechlich passiert */
  reality: string;
  /** Welches Konzept getestet wird */
  concept: string;
  /** Schwierigkeit 1-5 */
  difficulty: number;
}

export const misconceptions: Misconception[] = [
  // ─── 1: typeof null ─────────────────────────────────────────────────────
  {
    id: "02-typeof-null",
    title: "typeof null gibt 'null' zurueck",
    code: `function isNull(value: unknown): boolean {
  return typeof value === "null";
}

console.log(isNull(null));      // ???
console.log(isNull(undefined)); // ???`,
    commonBelief:
      "`typeof null` gibt `\"null\"` zurueck, also kann man damit " +
      "auf null pruefen.",
    reality:
      "`typeof null` gibt `\"object\"` zurueck — ein beruehmt-beruechtigter " +
      "Bug aus JavaScript 1.0 (1995), der nie behoben wurde. " +
      "Die Funktion gibt also immer `false` zurueck, auch fuer `null`! " +
      "Korrekt waere `value === null` (strikte Gleichheit).",
    concept: "null / typeof-Bug",
    difficulty: 2,
  },

  // ─── 2: NaN Gleichheit ──────────────────────────────────────────────────
  {
    id: "02-nan-equality",
    title: "NaN ist gleich NaN",
    code: `function isInvalid(value: number): boolean {
  return value === NaN;
}

const result = parseInt("hello");
console.log(isInvalid(result)); // ???`,
    commonBelief:
      "`NaN === NaN` ist `true`, also kann man mit `=== NaN` " +
      "auf ungueltige Zahlen pruefen.",
    reality:
      "`NaN === NaN` ist `false`! NaN ist der einzige Wert in JavaScript, " +
      "der NICHT sich selbst gleich ist. Die Funktion gibt immer `false` " +
      "zurueck. Korrekt: `Number.isNaN(value)` oder `isNaN(value)`. " +
      "Alternativ: `value !== value` ist nur bei NaN `true`.",
    concept: "number / NaN-Besonderheit",
    difficulty: 2,
  },

  // ─── 3: any und unknown austauschbar ────────────────────────────────────
  {
    id: "02-any-unknown-interchangeable",
    title: "any und unknown sind austauschbar",
    code: `function processValue(value: unknown) {
  // "unknown ist wie any, aber moderner"
  console.log(value.toUpperCase());
  console.log(value.length);
  console.log(value + 1);
}`,
    commonBelief:
      "`unknown` und `any` sind beide der 'akzeptiert alles'-Typ " +
      "und man kann sie austauschbar verwenden.",
    reality:
      "Dieser Code kompiliert NICHT! `unknown` erlaubt zwar jede " +
      "Zuweisung (genau wie `any`), aber man kann mit einem " +
      "`unknown`-Wert NICHTS anfangen, ohne erst zu pruefen. " +
      "Kein Property-Zugriff, keine Methoden, keine Operationen. " +
      "Man muss erst Type Narrowing machen (z.B. `typeof value === 'string'`). " +
      "Das ist der entscheidende Sicherheitsvorteil.",
    concept: "any vs unknown / Type Safety",
    difficulty: 2,
  },

  // ─── 4: String-Wrapper ──────────────────────────────────────────────────
  {
    id: "02-string-wrapper",
    title: "String und string sind gleich",
    code: `function greet(name: String) {
  return \`Hallo, \${name}!\`;
}

const username: string = "Max";
greet(username); // Funktioniert das?`,
    commonBelief:
      "`String` (gross) und `string` (klein) sind in TypeScript " +
      "austauschbar — Grossschreibung ist egal.",
    reality:
      "Der Code funktioniert zufaellig, aber `String` (gross) ist ein " +
      "JavaScript-Wrapper-Objekt, nicht der primitive Typ. " +
      "Umgekehrt geht es NICHT: `let x: string = new String('hello')` " +
      "erzeugt einen Fehler. TypeScript warnt: " +
      "'Don't use String as a type, use string instead'. " +
      "Faustregel: IMMER die Kleinschreibung verwenden.",
    concept: "Primitive vs. Wrapper-Objekte",
    difficulty: 1,
  },

  // ─── 5: void ist undefined ──────────────────────────────────────────────
  {
    id: "02-void-is-undefined",
    title: "void und undefined sind dasselbe",
    code: `function logMessage(msg: string): void {
  console.log(msg);
}

// "void gibt undefined zurueck, also kann ich es so verwenden:"
const result: undefined = logMessage("Hallo");`,
    commonBelief:
      "`void` und `undefined` sind dasselbe — eine void-Funktion " +
      "gibt `undefined` zurueck, also ist der Typ `undefined`.",
    reality:
      "Der Code kompiliert NICHT! `void` und `undefined` sind verschiedene " +
      "Typen. `void` bedeutet 'der Rueckgabewert soll ignoriert werden', " +
      "nicht 'gibt undefined zurueck'. Zur Laufzeit gibt eine void-Funktion " +
      "tatsaechlich `undefined` zurueck, aber TypeScript behandelt die Typen " +
      "unterschiedlich. Man kann `void` nicht an `undefined` zuweisen.",
    concept: "void vs undefined",
    difficulty: 3,
  },

  // ─── 6: Falsy-Pruefung fuer 0 ──────────────────────────────────────────
  {
    id: "02-falsy-zero",
    title: "|| als Default fuer Zahlen",
    code: `interface ServerConfig {
  port: number;
  timeout: number;
}

function startServer(config: Partial<ServerConfig>) {
  const port = config.port || 3000;
  const timeout = config.timeout || 5000;
  console.log(\`Port: \${port}, Timeout: \${timeout}\`);
}

// Port 0 ist ein gueltiger Port (OS waehlt einen freien Port):
startServer({ port: 0, timeout: 0 });
// Erwartung: Port: 0, Timeout: 0`,
    commonBelief:
      "`config.port || 3000` gibt 3000 nur zurueck wenn `port` " +
      "`undefined` oder `null` ist — also ein perfekter Default-Wert.",
    reality:
      "`||` prueft auf ALLE falsy-Werte: `0`, `''`, `false`, `null`, " +
      "`undefined`, `NaN`. Da `0` falsy ist, gibt `0 || 3000` den Wert " +
      "`3000` zurueck — obwohl `0` ein gueltiger Port ist! " +
      "Korrekt: `config.port ?? 3000` (Nullish Coalescing). " +
      "`??` prueft NUR auf `null` und `undefined`.",
    concept: "Nullish Coalescing (??) vs. Logical OR (||)",
    difficulty: 2,
  },

  // ─── 7: never ist void ─────────────────────────────────────────────────
  {
    id: "02-never-is-void",
    title: "never und void sind austauschbar",
    code: `function handleError(message: string): void {
  throw new Error(message);
}

function process(value: string | number) {
  if (typeof value === "string") {
    console.log(value.toUpperCase());
  } else if (typeof value === "number") {
    console.log(value.toFixed(2));
  } else {
    // value ist hier never — alle Faelle sind abgedeckt
    handleError(\`Unerwarteter Typ: \${value}\`);
  }
}`,
    commonBelief:
      "Die Funktion `handleError` ist korrekt als `void` typisiert, " +
      "weil sie nichts Sinnvolles zurueckgibt.",
    reality:
      "`handleError` sollte `never` zurueckgeben, nicht `void`. " +
      "Eine Funktion die IMMER einen Error wirft, kehrt nie zurueck. " +
      "Der Unterschied ist wichtig fuer Control Flow Analysis: " +
      "Mit `void` denkt TypeScript, dass der Code nach dem Aufruf " +
      "weiterlaufen koennte. Mit `never` weiss TypeScript, dass " +
      "der Pfad dort endet — das verbessert das Type Narrowing.",
    concept: "never vs void / Control Flow",
    difficulty: 4,
  },

  // ─── 8: Type Widening bei const-Objekten ────────────────────────────────
  {
    id: "02-const-object-widening",
    title: "const-Objekte haben Literal-Typen",
    code: `type Direction = "north" | "south" | "east" | "west";

function move(direction: Direction) {
  console.log(\`Moving \${direction}\`);
}

const config = {
  startDirection: "north",
  speed: 10,
};

move(config.startDirection);`,
    commonBelief:
      "Da `config` mit `const` deklariert ist, behaelt " +
      '`config.startDirection` den Literal-Typ `"north"` — ' +
      "genau wie bei `const x = 'north'`.",
    reality:
      "Der Code erzeugt einen Compiler-Fehler! `const` schuetzt nur " +
      "die Variable selbst vor Neuzuweisung, nicht die Properties. " +
      "Man koennte `config.startDirection = 'banana'` schreiben. " +
      "Deshalb wird `startDirection` zu `string` erweitert (Widening), " +
      "und `string` passt nicht zu `Direction`. " +
      'Loesung: `as const` oder explizite Annotation: `startDirection: "north" as const`.',
    concept: "Type Widening / const vs. as const",
    difficulty: 3,
  },
];
