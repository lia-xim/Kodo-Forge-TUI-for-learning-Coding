/**
 * Lektion 04 -- Transfer Tasks: Arrays & Tuples
 *
 * Diese Tasks nehmen die Konzepte aus der Arrays/Tuples-Lektion
 * und wenden sie in komplett neuen Kontexten an:
 *
 *  1. Schachbrett mit Tuples modellieren
 *  2. Typsichere Event-Queue implementieren
 *
 * Keine externen Dependencies.
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

// ─── Transfer Tasks ─────────────────────────────────────────────────────────

export const transferTasks: TransferTask[] = [
  // ─── Task 1: Schachbrett mit Tuples ────────────────────────────────────
  {
    id: "04-schachbrett-tuples",
    title: "Schachbrett mit Tuples modellieren",
    prerequisiteLessons: [4],
    scenario:
      "Du baust ein Online-Schachspiel. Die Spiellogik muss wissen, " +
      "welche Figur auf welchem Feld steht. Ein anderer Entwickler hat " +
      "das Brett als string[][] modelliert — aber damit kann man " +
      "versehentlich ein 9x9 Brett erstellen oder ungueltige Figuren " +
      "eintragen. Letzte Woche hat ein Bug dazu gefuehrt, dass ein " +
      "'Superkoenigin' auf dem Brett stand die es nicht gibt.",
    task:
      "Modelliere ein Schachbrett mit Tuples und Literal Types.\n\n" +
      "1. Definiere einen Typ 'Piece' fuer alle Schachfiguren " +
      "   (Koenig, Dame, Turm, Laeufer, Springer, Bauer + leer + Farbe)\n" +
      "2. Definiere einen Typ 'Row' als Tuple mit genau 8 Feldern\n" +
      "3. Definiere einen Typ 'Board' als Tuple mit genau 8 Reihen\n" +
      "4. Erstelle die Startaufstellung als 'as const satisfies Board'\n" +
      "5. Schreibe eine Funktion 'getPiece(board, row, col)' die typsicher " +
      "   auf ein Feld zugreift",
    starterCode: [
      "// Schachfiguren",
      "type Color = 'w' | 'b';  // weiss | schwarz",
      "type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';  // Koenig, Dame, ...",
      "type Piece = ???;  // z.B. 'wK' fuer weisser Koenig, null fuer leer",
      "",
      "// Brett-Typen",
      "type Row = ???;    // Tuple mit genau 8 Feldern",
      "type Board = ???;  // Tuple mit genau 8 Reihen",
      "",
      "// Startaufstellung",
      "const startBoard = {",
      "  // TODO: as const satisfies Board",
      "};",
      "",
      "// Zugriffsfunktion",
      "function getPiece(board: Board, row: number, col: number): Piece {",
      "  // TODO: typsicherer Zugriff",
      "}",
    ].join("\n"),
    solutionCode: [
      "// ═══ Figuren-Typen ═══",
      "type Color = 'w' | 'b';",
      "type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';",
      "",
      "// Template Literal Type: Kombiniert Farbe + Figurtyp",
      "type Piece = `${Color}${PieceType}` | null;",
      "// Ergibt: 'wK' | 'wQ' | 'wR' | ... | 'bP' | null",
      "",
      "// ═══ Brett als Tuple ═══",
      "// Genau 8 Felder pro Reihe — nicht mehr, nicht weniger",
      "type Row = [Piece, Piece, Piece, Piece, Piece, Piece, Piece, Piece];",
      "",
      "// Genau 8 Reihen — das ist ein echtes 8x8 Brett",
      "type Board = [Row, Row, Row, Row, Row, Row, Row, Row];",
      "",
      "// ═══ Startaufstellung ═══",
      "// as const: Literal Types erhalten ('wR' statt string)",
      "// satisfies Board: Struktur wird geprueft (8x8, gueltige Figuren)",
      "const startBoard = [",
      "  ['bR','bN','bB','bQ','bK','bB','bN','bR'],  // Reihe 8",
      "  ['bP','bP','bP','bP','bP','bP','bP','bP'],  // Reihe 7",
      "  [null, null, null, null, null, null, null, null],",
      "  [null, null, null, null, null, null, null, null],",
      "  [null, null, null, null, null, null, null, null],",
      "  [null, null, null, null, null, null, null, null],",
      "  ['wP','wP','wP','wP','wP','wP','wP','wP'],  // Reihe 2",
      "  ['wR','wN','wB','wQ','wK','wB','wN','wR'],  // Reihe 1",
      "] as const satisfies Board;",
      "",
      "// ═══ Typsicherer Zugriff ═══",
      "type ValidIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;",
      "",
      "function getPiece(board: Board, row: ValidIndex, col: ValidIndex): Piece {",
      "  return board[row][col];",
      "}",
      "",
      "// ═══ Warum Tuples hier besser sind als Arrays ═══",
      "// string[][]: Erlaubt 9x9, 1x1, leere Arrays, beliebige Strings",
      "// Board (Tuple): Erzwingt exakt 8x8, nur gueltige Figuren",
      "// ValidIndex: Erzwingt 0-7 statt beliebiger Zahlen",
      "//",
      "// getPiece(startBoard, 0, 0) // 'bR' — Turm oben links",
      "// getPiece(startBoard, 8, 0) // Compile-Fehler! 8 ist kein ValidIndex",
    ].join("\n"),
    conceptsBridged: [
      "Tuples fuer feste Laengen",
      "Template Literal Types",
      "as const satisfies",
      "Literal Union Types als Index",
      "Array vs Tuple Entscheidung",
    ],
    hints: [
      "Ein Tuple hat eine FESTE Laenge und einen Typ pro Position. [Piece, Piece, ...] mit genau 8 Eintraegen garantiert eine Reihe mit exakt 8 Feldern.",
      "Template Literal Types kombinieren Strings: `${Color}${PieceType}` ergibt automatisch alle Kombinationen wie 'wK', 'wQ', 'bR', etc.",
      "Nutze 'as const satisfies Board' fuer die Startaufstellung: satisfies prueft die Struktur, as const bewahrt die exakten Literal-Werte ('wK' statt Piece).",
    ],
    difficulty: 4,
  },

  // ─── Task 2: Typsichere Event-Queue ────────────────────────────────────
  {
    id: "04-event-queue",
    title: "Typsichere Event-Queue mit readonly Arrays",
    prerequisiteLessons: [4],
    scenario:
      "Du baust ein Benachrichtigungssystem fuer eine Chat-App. " +
      "Events werden in einer Queue gesammelt und dann batch-weise " +
      "verarbeitet. Das Problem: Andere Teile des Codes aendern " +
      "versehentlich die Queue waehrend sie verarbeitet wird. " +
      "Gestern wurden Events doppelt verarbeitet weil jemand " +
      "push() auf die Queue aufgerufen hat waehrend der Batch lief.",
    task:
      "Baue eine typsichere Event-Queue mit readonly Arrays.\n\n" +
      "1. Definiere Event-Typen als Tuple: [eventName, ...payload]\n" +
      "   z.B. ['message', senderId, text] oder ['typing', userId]\n" +
      "2. Die Queue soll readonly sein — kein push/pop/splice moeglich\n" +
      "3. Schreibe eine 'enqueue'-Funktion die eine NEUE Queue zurueckgibt " +
      "   (statt die alte zu mutieren)\n" +
      "4. Schreibe eine 'processBatch'-Funktion die die Queue verarbeitet " +
      "   und eine leere Queue zurueckgibt",
    starterCode: [
      "// Event-Typen als Tuples",
      "type MessageEvent = ['message', string, string];  // [name, senderId, text]",
      "type TypingEvent = ['typing', string];             // [name, userId]",
      "type Event = ???;",
      "",
      "// Readonly Queue",
      "type EventQueue = ???;",
      "",
      "function enqueue(queue: EventQueue, event: Event): EventQueue {",
      "  // TODO: Neue Queue zurueckgeben, alte nicht mutieren!",
      "}",
      "",
      "function processBatch(queue: EventQueue): EventQueue {",
      "  // TODO: Alle Events verarbeiten, leere Queue zurueckgeben",
      "}",
    ].join("\n"),
    solutionCode: [
      "// ═══ Event-Typen als Tuples ═══",
      "// Jeder Event hat einen festen Namen und typisierten Payload",
      "type MessageEvent = readonly ['message', string, string];",
      "type TypingEvent  = readonly ['typing', string];",
      "type JoinEvent    = readonly ['join', string, string];  // userId, roomId",
      "type LeaveEvent   = readonly ['leave', string];",
      "",
      "type ChatEvent = MessageEvent | TypingEvent | JoinEvent | LeaveEvent;",
      "",
      "// ═══ Readonly Queue ═══",
      "// readonly verhindert push(), pop(), splice(), Indexzuweisung",
      "type EventQueue = readonly ChatEvent[];",
      "",
      "// ═══ Immutable Operationen ═══",
      "",
      "// Statt push(): Spread-Operator erzeugt neue Queue",
      "function enqueue(queue: EventQueue, event: ChatEvent): EventQueue {",
      "  return [...queue, event];",
      "}",
      "",
      "// Mehrere Events auf einmal hinzufuegen",
      "function enqueueBatch(queue: EventQueue, events: readonly ChatEvent[]): EventQueue {",
      "  return [...queue, ...events];",
      "}",
      "",
      "// Verarbeitet alle Events und gibt leere Queue zurueck",
      "function processBatch(queue: EventQueue): EventQueue {",
      "  for (const event of queue) {",
      "    // Discriminated Union auf event[0]",
      "    switch (event[0]) {",
      "      case 'message':",
      "        console.log('Nachricht von ' + event[1] + ': ' + event[2]);",
      "        break;",
      "      case 'typing':",
      "        console.log(event[1] + ' tippt...');",
      "        break;",
      "      case 'join':",
      "        console.log(event[1] + ' ist ' + event[2] + ' beigetreten');",
      "        break;",
      "      case 'leave':",
      "        console.log(event[1] + ' hat den Chat verlassen');",
      "        break;",
      "    }",
      "  }",
      "  return [];  // Leere Queue",
      "}",
      "",
      "// ═══ Nutzung ═══",
      "// let q: EventQueue = [];",
      "// q = enqueue(q, ['message', 'user1', 'Hallo!'] as const);",
      "// q = enqueue(q, ['typing', 'user2'] as const);",
      "// q = processBatch(q);  // Verarbeitet alles, q ist jetzt []",
      "//",
      "// q.push(...)  // Compile-Fehler! readonly",
      "// q[0] = ...   // Compile-Fehler! readonly",
      "",
      "// ═══ Warum readonly + immutable? ═══",
      "// 1. Keine versehentliche Mutation waehrend der Verarbeitung",
      "// 2. Jede Operation gibt eine NEUE Queue zurueck",
      "// 3. Der alte Zustand bleibt erhalten (gut fuer Undo/Logging)",
      "// 4. TypeScript erzwingt das Pattern auf Compile-Ebene",
    ].join("\n"),
    conceptsBridged: [
      "readonly Arrays",
      "Tuples als Event-Typen",
      "Immutable Data Patterns",
      "Spread-Operator statt Mutation",
      "Discriminated Unions auf Tuples",
    ],
    hints: [
      "readonly ChatEvent[] verhindert push(), pop() und Indexzuweisung. Das erzwingt auf Compiler-Ebene, dass die Queue nicht mutiert wird.",
      "Statt die Queue zu mutieren (queue.push(event)), erzeuge eine neue: return [...queue, event]. Das ist das immutable Pattern.",
      "Die Events sind Tuples mit dem Event-Namen an Position 0. Du kannst switch(event[0]) verwenden um den Typ zu narrowen — wie eine Discriminated Union, aber auf Tuples.",
    ],
    difficulty: 3,
  },
];
