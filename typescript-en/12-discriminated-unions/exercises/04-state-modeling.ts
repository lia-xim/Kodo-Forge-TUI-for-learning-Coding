/**
 * Lektion 12 - Exercise 04: Zustandsmodellierung
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/04-state-modeling.ts
 *
 * 3 Aufgaben zu State Machines, AsyncState und
 * "Make impossible states impossible".
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: AsyncState<T> implementieren
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Definiere AsyncState<T> als Discriminated Union mit:
// - { status: "idle" }
// - { status: "loading" }
// - { status: "error"; error: string }
// - { status: "success"; data: T }
//
// type AsyncState<T> = ...

// TODO: Erstelle eine Funktion "renderAsync" die den Zustand als
// String darstellt:
// idle -> "Bereit"
// loading -> "Lade..."
// error -> "Fehler: <error>"
// success -> "Daten: <data als JSON>"
// Verwende switch/case mit exhaustive Check!
//
// function renderAsync<T>(state: AsyncState<T>): string { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: State Machine fuer einen Mediaplayer
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Modelliere die Zustaende eines Mediaplayers als Discriminated Union:
// - status: "stopped"
// - status: "playing", track: string, position: number (Sekunden)
// - status: "paused", track: string, position: number (Sekunden)
// - status: "buffering", track: string, progress: number (0-100)
//
// type PlayerState = ...

// TODO: Erstelle State-Transition-Funktionen:
// 1. play: Nimmt einen "stopped" oder "paused" State und gibt "playing" zurueck
// 2. pause: Nimmt einen "playing" State und gibt "paused" zurueck
// 3. stop: Nimmt einen beliebigen PlayerState und gibt "stopped" zurueck
//
// function play(state: Extract<PlayerState, { status: "stopped" }>, track: string): PlayerState;
// function play(state: Extract<PlayerState, { status: "paused" }>): PlayerState;
// (Oder: eine Funktion die beide Faelle behandelt)

// TODO: Erstelle eine Funktion "describePlayer" die den Zustand beschreibt:
// stopped -> "Gestoppt"
// playing -> "Spielt: <track> bei <position>s"
// paused -> "Pausiert: <track> bei <position>s"
// buffering -> "Puffert: <track> (<progress>%)"
//
// function describePlayer(state: PlayerState): string { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: mapAsyncState implementieren
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle eine generische Funktion "mapAsyncState" die den
// success-Wert transformiert und alle anderen States unveraendert laesst:
//
// function mapAsyncState<T, U>(
//   state: AsyncState<T>,
//   fn: (data: T) => U
// ): AsyncState<U> { ... }


// ═══════════════════════════════════════════════════════════════════════════
// TESTS (nicht aendern!)
// ═══════════════════════════════════════════════════════════════════════════

/*
// Entkommentiere nach dem Loesen:

console.log("=== Aufgabe 1: AsyncState ===");
console.log(renderAsync({ status: "idle" }));
console.log(renderAsync({ status: "loading" }));
console.log(renderAsync({ status: "error", error: "Timeout" }));
console.log(renderAsync({ status: "success", data: [1, 2, 3] }));

console.log("\n=== Aufgabe 2: Media Player ===");
let player: PlayerState = { status: "stopped" };
console.log(describePlayer(player));

player = { status: "playing", track: "Bohemian Rhapsody", position: 42 };
console.log(describePlayer(player));

player = { status: "paused", track: "Bohemian Rhapsody", position: 42 };
console.log(describePlayer(player));

player = { status: "buffering", track: "Bohemian Rhapsody", progress: 65 };
console.log(describePlayer(player));

console.log("\n=== Aufgabe 3: mapAsyncState ===");
const state: AsyncState<number[]> = { status: "success", data: [1, 2, 3] };
const mapped = mapAsyncState(state, data => data.reduce((a, b) => a + b, 0));
console.log(renderAsync(mapped)); // "Daten: 6"

const errorState: AsyncState<number[]> = { status: "error", error: "Timeout" };
const mappedError = mapAsyncState(errorState, data => data.length);
console.log(renderAsync(mappedError)); // "Fehler: Timeout" (unveraendert)
*/
