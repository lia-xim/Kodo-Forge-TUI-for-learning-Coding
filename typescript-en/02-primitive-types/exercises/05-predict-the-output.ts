/**
 * Lektion 02 - Exercise 05: Predict the Output
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/05-predict-the-output.ts
 *
 * Bei jeder Aufgabe: ZUERST vorhersagen, was die Ausgabe sein wird.
 * DANN den Code ausfuehren und pruefen ob du recht hattest.
 *
 * Schwierigkeitsgrad: Mittel — Fokus auf ueberraschende Ergebnisse
 *
 * ANLEITUNG:
 * 1. Lies den Code-Block
 * 2. Schreibe deine Vorhersage in den DEINE_VORHERSAGE-String
 * 3. Fuehre den Code aus — stimmt deine Vorhersage?
 * 4. Lies die Erklaerung, wenn du falsch lagst
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: typeof null — der historische Bug
// ═══════════════════════════════════════════════════════════════════════════

// Was gibt typeof null zurueck?
// Hinweis: Das ist einer der bekanntesten Bugs in der JavaScript-Geschichte.

const aufgabe1 = typeof null;

// TODO: Was ist das Ergebnis? Ersetze "???" mit deiner Vorhersage.
const vorhersage1: string = "???";

console.assert(
  aufgabe1 === vorhersage1,
  `Aufgabe 1: typeof null ist "${aufgabe1}", nicht "${vorhersage1}"`
);

// ERKLAERUNG (lies nach dem Ausfuehren):
// typeof null === "object" — ein Bug aus der ersten JavaScript-Implementierung
// von 1995. Intern wurden Werte mit einem Tag gespeichert: Objekte hatten
// den Tag 0, und null wurde als Null-Pointer (0x00) dargestellt. Da die
// Tag-Bits ebenfalls 0 waren, wurde null als Objekt erkannt. Dieser Bug
// wird NIE gefixt — zu viel Code verlaesst sich darauf.

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Gleitkomma-Arithmetik
// ═══════════════════════════════════════════════════════════════════════════

// Was ergibt 0.1 + 0.2 === 0.3?

const aufgabe2 = (0.1 + 0.2 === 0.3);

// TODO: Was ist das Ergebnis? true oder false?
const vorhersage2: boolean = true; // <-- Aendere wenn noetig

console.assert(
  aufgabe2 === vorhersage2,
  `Aufgabe 2: 0.1 + 0.2 === 0.3 ist ${aufgabe2}, nicht ${vorhersage2}`
);

// ERKLAERUNG:
// 0.1 + 0.2 === 0.3 ergibt FALSE! Das Ergebnis von 0.1 + 0.2 ist
// 0.30000000000000004 — eine winzige Abweichung durch IEEE 754 Gleitkomma.
// Das ist KEIN JavaScript-Bug — es passiert in C, Java, Python, Go und
// jeder anderen Sprache die IEEE 754 verwendet. Loesung fuer Praezision:
// In Cent rechnen (ganzzahlig) oder Math.abs(a - b) < Number.EPSILON verwenden.

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: NaN — die Identitaetskrise
// ═══════════════════════════════════════════════════════════════════════════

// Was ergibt NaN === NaN?

const aufgabe3 = (NaN === NaN);

// TODO: true oder false?
const vorhersage3: boolean = true; // <-- Aendere wenn noetig

console.assert(
  aufgabe3 === vorhersage3,
  `Aufgabe 3: NaN === NaN ist ${aufgabe3}, nicht ${vorhersage3}`
);

// ERKLAERUNG:
// NaN === NaN ergibt FALSE! NaN ist der EINZIGE Wert in JavaScript, der
// sich selbst ungleich ist. Der Grund (IEEE 754): NaN entsteht aus
// verschiedenen undefinierten Operationen (0/0, sqrt(-1), parseInt("abc")).
// Da verschiedene "Nicht-Zahlen" nicht notwendig identisch sind, ist
// der Vergleich immer false. Nutze Number.isNaN() statt === NaN!

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: typeof NaN
// ═══════════════════════════════════════════════════════════════════════════

// Was gibt typeof NaN zurueck?
// NaN steht fuer "Not a Number" — aber welchen Typ hat es?

const aufgabe4 = typeof NaN;

// TODO: Was ist das Ergebnis?
const vorhersage4: string = "???";

console.assert(
  aufgabe4 === vorhersage4,
  `Aufgabe 4: typeof NaN ist "${aufgabe4}", nicht "${vorhersage4}"`
);

// ERKLAERUNG:
// typeof NaN === "number"! Ja, "Not a Number" ist vom Typ number.
// Das klingt paradox, ist aber korrekt: NaN ist ein spezieller IEEE 754
// Wert innerhalb des number-Typs. Er repraesentiert "ein undefiniertes
// numerisches Ergebnis" — und ein numerisches Ergebnis ist immer noch
// ein numerischer Wert, auch wenn es undefiniert ist.

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: any in einer Berechnung
// ═══════════════════════════════════════════════════════════════════════════

// 🦆 BEVOR du codest — erklaere kurz:
// 1. Was passiert, wenn TypeScript "any" in einem Ausdruck sieht? ___
// 2. Wird hier ein Compile-Error erzeugt oder nicht? ___

// Was ergibt (true as any) + 1?
// TypeScript sieht den Wert als "any" — prueft also nicht.
// Aber JavaScript fuehrt trotzdem etwas aus!

const aufgabe5: any = true;
const ergebnis5 = aufgabe5 + 1;

// TODO: Was ist ergebnis5? (Zahl? String? Boolean? Crash?)
const vorhersage5: number = 0; // <-- Aendere den Wert

console.assert(
  ergebnis5 === vorhersage5,
  `Aufgabe 5: (true as any) + 1 ist ${ergebnis5}, nicht ${vorhersage5}`
);

// ERKLAERUNG:
// true + 1 === 2! JavaScript konvertiert true zu 1 (und false zu 0)
// bei arithmetischen Operationen. TypeScript haette dich VOR diesem
// seltsamen Verhalten gewarnt — aber "any" schaltet die Pruefung ab.
// Das ist ein perfektes Beispiel, warum "any" gefaehrlich ist:
// Der Code laeuft ohne Fehler, aber das Ergebnis ist ueberraschend.

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 6: BigInt vs Number Praezision
// ═══════════════════════════════════════════════════════════════════════════

// 🦆 BEVOR du codest — erklaere kurz:
// 1. Was ist Number.MAX_SAFE_INTEGER? ___
// 2. Was passiert mit number-Werten jenseits dieser Grenze? ___

const maxSafe = Number.MAX_SAFE_INTEGER; // 9007199254740991

// Was ergibt die Addition als number?
const alsNumber = maxSafe + 1;
const alsNumberPlus2 = maxSafe + 2;

// TODO: Sind diese beiden Werte gleich oder verschieden?
const vorhersage6: boolean = false; // <-- true wenn gleich, false wenn verschieden

console.assert(
  (alsNumber === alsNumberPlus2) === vorhersage6,
  `Aufgabe 6: (MAX_SAFE + 1 === MAX_SAFE + 2) ist ${alsNumber === alsNumberPlus2}, nicht ${vorhersage6}`
);

// ERKLAERUNG:
// MAX_SAFE_INTEGER + 1 === MAX_SAFE_INTEGER + 2 ergibt TRUE!
// Beide ergeben 9007199254740992. Ab MAX_SAFE_INTEGER verliert number
// an Praezision — verschiedene Berechnungen koennen denselben Wert
// ergeben. Mit BigInt passiert das nicht:
// BigInt(MAX_SAFE_INTEGER) + 1n !== BigInt(MAX_SAFE_INTEGER) + 2n

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 7: let vs const — Typinferenz
// ═══════════════════════════════════════════════════════════════════════════

// Was inferiert TypeScript als Typ?

const konstant = "hallo";     // Welcher Typ?
let variabel = "hallo";       // Welcher Typ?

// Du kannst die Typen nicht zur Laufzeit pruefen (Type Erasure!),
// aber du kannst sie in der IDE hovern.

// TODO: Welcher der beiden Werte kann man "welt" zuweisen?
// Tipp: Der eine hat den Literal Type "hallo", der andere string.

// const konstant2 = "welt";  // Kann man das? <-- Nein, const!
// variabel = "welt";         // Kann man das? <-- Ja/Nein?

// Test: Wenn du variabel "welt" zuweisen kannst, setze vorhersage7 auf true
const vorhersage7: boolean = true; // <-- Aendere wenn noetig

let testVariabel = "hallo";
let konntZuweisen = false;
try {
  testVariabel = "welt";
  konntZuweisen = true;
} catch {
  konntZuweisen = false;
}

console.assert(
  konntZuweisen === vorhersage7,
  `Aufgabe 7: let-Variable neu zuweisen: ${konntZuweisen}, nicht ${vorhersage7}`
);

// ERKLAERUNG:
// let-Variablen haben den breiten Typ (string), also kann man jeden
// String zuweisen. const-Variablen haben den Literal Type ("hallo"),
// und koennen gar nicht neu zugewiesen werden (weil const).
// Das ist Type Widening in Aktion.

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 8: Nullish Coalescing vs Logical OR
// ═══════════════════════════════════════════════════════════════════════════

// 🦆 BEVOR du codest — erklaere kurz:
// 1. Was ist der Unterschied zwischen ?? und ||? ___
// 2. Welche Werte sind "falsy" in JavaScript? ___

const wert1 = 0 || "default";     // Was ist wert1?
const wert2 = 0 ?? "default";     // Was ist wert2?
const wert3 = "" || "default";    // Was ist wert3?
const wert4 = "" ?? "default";    // Was ist wert4?

// TODO: Sage die Ergebnisse vorher
const vorhersage8a: string | number = "???";   // wert1
const vorhersage8b: string | number = 999;     // wert2
const vorhersage8c: string = "???";            // wert3
const vorhersage8d: string = "???";            // wert4

console.assert(wert1 === vorhersage8a, `Aufgabe 8a: 0 || "default" ist ${JSON.stringify(wert1)}`);
console.assert(wert2 === vorhersage8b, `Aufgabe 8b: 0 ?? "default" ist ${JSON.stringify(wert2)}`);
console.assert(wert3 === vorhersage8c, `Aufgabe 8c: "" || "default" ist ${JSON.stringify(wert3)}`);
console.assert(wert4 === vorhersage8d, `Aufgabe 8d: "" ?? "default" ist ${JSON.stringify(wert4)}`);

// ERKLAERUNG:
// wert1 = "default" — || ersetzt ALLE falsy-Werte (0 ist falsy!)
// wert2 = 0         — ?? ersetzt NUR null/undefined (0 ist nicht nullish)
// wert3 = "default" — || ersetzt alle falsy-Werte ("" ist falsy!)
// wert4 = ""        — ?? ersetzt nur null/undefined ("" ist nicht nullish)
//
// Das ist ein HAEUFIGER Bug in der Praxis: || statt ?? bei
// Konfigurationswerten, wo 0 oder "" gueltige Werte sind!

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 9: undefined vs null Verhalten
// ═══════════════════════════════════════════════════════════════════════════

const aufgabe9a = (null == undefined);      // Was?
const aufgabe9b = (null === undefined);     // Was?
const aufgabe9c = (null == 0);              // Was?
const aufgabe9d = (undefined == false);     // Was?

// TODO: Sage die Ergebnisse vorher
const vorhersage9a: boolean = true;   // <-- Aendere wenn noetig
const vorhersage9b: boolean = true;   // <-- Aendere wenn noetig
const vorhersage9c: boolean = true;   // <-- Aendere wenn noetig
const vorhersage9d: boolean = true;   // <-- Aendere wenn noetig

console.assert(aufgabe9a === vorhersage9a, `Aufgabe 9a: null == undefined ist ${aufgabe9a}`);
console.assert(aufgabe9b === vorhersage9b, `Aufgabe 9b: null === undefined ist ${aufgabe9b}`);
console.assert(aufgabe9c === vorhersage9c, `Aufgabe 9c: null == 0 ist ${aufgabe9c}`);
console.assert(aufgabe9d === vorhersage9d, `Aufgabe 9d: undefined == false ist ${aufgabe9d}`);

// ERKLAERUNG:
// 9a: true  — null == undefined ist true (sie sind "loose equal")
// 9b: false — null === undefined ist false (verschiedene Typen!)
// 9c: false — null ist NUR == null und undefined, NICHT 0!
// 9d: false — undefined ist NUR == null und undefined, NICHT false!
//
// Das ist der Grund, warum x == null ein akzeptiertes Pattern ist:
// Es prueft auf null UND undefined gleichzeitig, aber NICHT auf
// andere falsy-Werte wie 0, "", oder false.

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 10: as const — das Objekt-Raetsel
// ═══════════════════════════════════════════════════════════════════════════

// 🦆 BEVOR du codest — erklaere kurz:
// 1. Was ist Type Widening bei Objekt-Properties? ___
// 2. Was macht "as const" mit Objekt-Properties? ___

const ohneConst = { name: "Max", alter: 25 };
const mitConst = { name: "Max", alter: 25 } as const;

// Frage: Kann man ohneConst.name aendern? Und mitConst.name?

let konntAendern = false;
try {
  ohneConst.name = "Anna";
  konntAendern = true;
} catch {
  konntAendern = false;
}

// TODO: Kann man die Property des Objekts OHNE as const aendern?
const vorhersage10: boolean = true; // <-- true = ja, false = nein

console.assert(
  konntAendern === vorhersage10,
  `Aufgabe 10: ohneConst.name aendern: ${konntAendern}, nicht ${vorhersage10}`
);

// Bonus: Versuche mitConst.name = "Anna" — der COMPILER verhindert es!
// (Entferne den Kommentar und beobachte den Error)
// mitConst.name = "Anna";  // Error: Cannot assign to 'name' because it is a read-only property

// ERKLAERUNG:
// ohneConst.name kann geaendert werden — const schuetzt nur die
// Variable-Bindung (du kannst ohneConst nicht neu zuweisen), aber
// die Properties sind NICHT readonly.
// mitConst.name kann NICHT geaendert werden — as const macht alle
// Properties zu readonly UND gibt ihnen Literal Types ("Max" statt string).

// ═══════════════════════════════════════════════════════════════════════════
// ERGEBNIS
// ═══════════════════════════════════════════════════════════════════════════

console.log("\n--- Predict the Output: Ergebnis ---");
console.log("Wenn alle Assertions bestanden sind, hast du alles richtig!");
console.log("Falls nicht, lies die ERKLAERUNG unter der jeweiligen Aufgabe.");
console.log("\nTipp: Die haeufigsten Ueberraschungen sind:");
console.log("  - typeof null === 'object' (historischer Bug)");
console.log("  - NaN !== NaN (IEEE 754 Spezifikation)");
console.log("  - 0.1 + 0.2 !== 0.3 (Gleitkomma-Praezision)");
console.log("  - || vs ?? bei falsy-Werten (0, '')");
