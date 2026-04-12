/**
 * Lesson 04 -- Transfer Tasks: Arrays & Tuples
 *
 * These tasks take the concepts from the Arrays/Tuples lesson
 * and apply them in completely new contexts:
 *
 *  1. Model a chessboard with tuples
 *  2. Implement a type-safe event queue
 *
 * No external dependencies.
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

// ─── Transfer Tasks ─────────────────────────────────────────────────────────

export const transferTasks: TransferTask[] = [
  // ─── Task 1: Chessboard with Tuples ────────────────────────────────────
  {
    id: "04-schachbrett-tuples",
    title: "Model a Chessboard with Tuples",
    prerequisiteLessons: [4],
    scenario:
      "You're building an online chess game. The game logic needs to know " +
      "which piece is on which square. Another developer modeled the board " +
      "as string[][] — but that allows accidentally creating a 9x9 board or " +
      "entering invalid pieces. Last week a bug caused a " +
      "'Superqueen' to appear on the board that doesn't exist.",
    task:
      "Model a chessboard with tuples and literal types.\n\n" +
      "1. Define a type 'Piece' for all chess pieces " +
      "   (King, Queen, Rook, Bishop, Knight, Pawn + empty + color)\n" +
      "2. Define a type 'Row' as a tuple with exactly 8 squares\n" +
      "3. Define a type 'Board' as a tuple with exactly 8 rows\n" +
      "4. Create the starting position as 'as const satisfies Board'\n" +
      "5. Write a function 'getPiece(board, row, col)' that accesses " +
      "   a square in a type-safe way",
    starterCode: [
      "// Chess pieces",
      "type Color = 'w' | 'b';  // white | black",
      "type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';  // King, Queen, ...",
      "type Piece = ???;  // e.g. 'wK' for white King, null for empty",
      "",
      "// Board types",
      "type Row = ???;    // Tuple with exactly 8 squares",
      "type Board = ???;  // Tuple with exactly 8 rows",
      "",
      "// Starting position",
      "const startBoard = {",
      "  // TODO: as const satisfies Board",
      "};",
      "",
      "// Access function",
      "function getPiece(board: Board, row: number, col: number): Piece {",
      "  // TODO: type-safe access",
      "}",
    ].join("\n"),
    solutionCode: [
      "// ═══ Piece Types ═══",
      "type Color = 'w' | 'b';",
      "type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';",
      "",
      "// Template Literal Type: Combines color + piece type",
      "type Piece = `${Color}${PieceType}` | null;",
      "// Results in: 'wK' | 'wQ' | 'wR' | ... | 'bP' | null",
      "",
      "// ═══ Board as Tuple ═══",
      "// Exactly 8 squares per row — no more, no less",
      "type Row = [Piece, Piece, Piece, Piece, Piece, Piece, Piece, Piece];",
      "",
      "// Exactly 8 rows — this is a real 8x8 board",
      "type Board = [Row, Row, Row, Row, Row, Row, Row, Row];",
      "",
      "// ═══ Starting Position ═══",
      "// as const: preserves literal types ('wR' instead of string)",
      "// satisfies Board: structure is validated (8x8, valid pieces)",
      "const startBoard = [",
      "  ['bR','bN','bB','bQ','bK','bB','bN','bR'],  // Row 8",
      "  ['bP','bP','bP','bP','bP','bP','bP','bP'],  // Row 7",
      "  [null, null, null, null, null, null, null, null],",
      "  [null, null, null, null, null, null, null, null],",
      "  [null, null, null, null, null, null, null, null],",
      "  [null, null, null, null, null, null, null, null],",
      "  ['wP','wP','wP','wP','wP','wP','wP','wP'],  // Row 2",
      "  ['wR','wN','wB','wQ','wK','wB','wN','wR'],  // Row 1",
      "] as const satisfies Board;",
      "",
      "// ═══ Type-Safe Access ═══",
      "type ValidIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;",
      "",
      "function getPiece(board: Board, row: ValidIndex, col: ValidIndex): Piece {",
      "  return board[row][col];",
      "}",
      "",
      "// ═══ Why Tuples Are Better Than Arrays Here ═══",
      "// string[][]: Allows 9x9, 1x1, empty arrays, arbitrary strings",
      "// Board (Tuple): Enforces exactly 8x8, only valid pieces",
      "// ValidIndex: Enforces 0-7 instead of arbitrary numbers",
      "//",
      "// getPiece(startBoard, 0, 0) // 'bR' — rook top left",
      "// getPiece(startBoard, 8, 0) // Compile error! 8 is not a ValidIndex",
    ].join("\n"),
    conceptsBridged: [
      "Tuples for fixed lengths",
      "Template Literal Types",
      "as const satisfies",
      "Literal Union Types as index",
      "Array vs Tuple decision",
    ],
    hints: [
      "A tuple has a FIXED length and one type per position. [Piece, Piece, ...] with exactly 8 entries guarantees a row with exactly 8 squares.",
      "Template Literal Types combine strings: `${Color}${PieceType}` automatically produces all combinations like 'wK', 'wQ', 'bR', etc.",
      "Use 'as const satisfies Board' for the starting position: satisfies validates the structure, as const preserves the exact literal values ('wK' instead of Piece).",
    ],
    difficulty: 4,
  },

  // ─── Task 2: Type-Safe Event Queue ────────────────────────────────────
  {
    id: "04-event-queue",
    title: "Type-Safe Event Queue with readonly Arrays",
    prerequisiteLessons: [4],
    scenario:
      "You're building a notification system for a chat app. " +
      "Events are collected in a queue and then processed in batches. " +
      "The problem: other parts of the code accidentally modify " +
      "the queue while it is being processed. " +
      "Yesterday events were processed twice because someone " +
      "called push() on the queue while the batch was running.",
    task:
      "Build a type-safe event queue with readonly arrays.\n\n" +
      "1. Define event types as tuples: [eventName, ...payload]\n" +
      "   e.g. ['message', senderId, text] or ['typing', userId]\n" +
      "2. The queue should be readonly — no push/pop/splice possible\n" +
      "3. Write an 'enqueue' function that returns a NEW queue " +
      "   (instead of mutating the old one)\n" +
      "4. Write a 'processBatch' function that processes the queue " +
      "   and returns an empty queue",
    starterCode: [
      "// Event types as tuples",
      "type MessageEvent = ['message', string, string];  // [name, senderId, text]",
      "type TypingEvent = ['typing', string];             // [name, userId]",
      "type Event = ???;",
      "",
      "// Readonly Queue",
      "type EventQueue = ???;",
      "",
      "function enqueue(queue: EventQueue, event: Event): EventQueue {",
      "  // TODO: Return new queue, do not mutate the old one!",
      "}",
      "",
      "function processBatch(queue: EventQueue): EventQueue {",
      "  // TODO: Process all events, return empty queue",
      "}",
    ].join("\n"),
    solutionCode: [
      "// ═══ Event Types as Tuples ═══",
      "// Each event has a fixed name and typed payload",
      "type MessageEvent = readonly ['message', string, string];",
      "type TypingEvent  = readonly ['typing', string];",
      "type JoinEvent    = readonly ['join', string, string];  // userId, roomId",
      "type LeaveEvent   = readonly ['leave', string];",
      "",
      "type ChatEvent = MessageEvent | TypingEvent | JoinEvent | LeaveEvent;",
      "",
      "// ═══ Readonly Queue ═══",
      "// readonly prevents push(), pop(), splice(), index assignment",
      "type EventQueue = readonly ChatEvent[];",
      "",
      "// ═══ Immutable Operations ═══",
      "",
      "// Instead of push(): spread operator creates a new queue",
      "function enqueue(queue: EventQueue, event: ChatEvent): EventQueue {",
      "  return [...queue, event];",
      "}",
      "",
      "// Add multiple events at once",
      "function enqueueBatch(queue: EventQueue, events: readonly ChatEvent[]): EventQueue {",
      "  return [...queue, ...events];",
      "}",
      "",
      "// Processes all events and returns empty queue",
      "function processBatch(queue: EventQueue): EventQueue {",
      "  for (const event of queue) {",
      "    // Discriminated Union on event[0]",
      "    switch (event[0]) {",
      "      case 'message':",
      "        console.log('Message from ' + event[1] + ': ' + event[2]);",
      "        break;",
      "      case 'typing':",
      "        console.log(event[1] + ' is typing...');",
      "        break;",
      "      case 'join':",
      "        console.log(event[1] + ' joined ' + event[2]);",
      "        break;",
      "      case 'leave':",
      "        console.log(event[1] + ' left the chat');",
      "        break;",
      "    }",
      "  }",
      "  return [];  // Empty queue",
      "}",
      "",
      "// ═══ Usage ═══",
      "// let q: EventQueue = [];",
      "// q = enqueue(q, ['message', 'user1', 'Hello!'] as const);",
      "// q = enqueue(q, ['typing', 'user2'] as const);",
      "// q = processBatch(q);  // Processes everything, q is now []",
      "//",
      "// q.push(...)  // Compile error! readonly",
      "// q[0] = ...   // Compile error! readonly",
      "",
      "// ═══ Why readonly + immutable? ═══",
      "// 1. No accidental mutation during processing",
      "// 2. Every operation returns a NEW queue",
      "// 3. The old state is preserved (good for undo/logging)",
      "// 4. TypeScript enforces the pattern at compile time",
    ].join("\n"),
    conceptsBridged: [
      "readonly Arrays",
      "Tuples as Event Types",
      "Immutable Data Patterns",
      "Spread Operator instead of Mutation",
      "Discriminated Unions on Tuples",
    ],
    hints: [
      "readonly ChatEvent[] prevents push(), pop() and index assignment. This enforces at the compiler level that the queue is not mutated.",
      "Instead of mutating the queue (queue.push(event)), create a new one: return [...queue, event]. This is the immutable pattern.",
      "The events are tuples with the event name at position 0. You can use switch(event[0]) to narrow the type — like a discriminated union, but on tuples.",
    ],
    difficulty: 3,
  },
];