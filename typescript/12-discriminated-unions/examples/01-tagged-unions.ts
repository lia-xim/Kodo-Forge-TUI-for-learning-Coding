/**
 * Lektion 12 - Example 01: Tagged Unions (Discriminated Unions)
 *
 * Ausfuehren mit: npx tsx examples/01-tagged-unions.ts
 *
 * Grundlagen: Tag-Property, String Literal Diskriminator,
 * automatisches Narrowing.
 */

// ─── DAS PROBLEM: Aehnliche Objekte unterscheiden ─────────────────────────

// Ohne Diskriminator — fragil:
type TextMessageOld = { content: string; timestamp: Date };
type ImageMessageOld = { imageUrl: string; width: number; height: number; timestamp: Date };
type MessageOld = TextMessageOld | ImageMessageOld;

function displayOld(msg: MessageOld) {
  if ("content" in msg) {
    console.log(`[OLD] Text: ${msg.content}`);
  } else {
    console.log(`[OLD] Bild: ${msg.imageUrl}`);
  }
}

// ─── DIE LOESUNG: Diskriminator-Property ───────────────────────────────────

type TextMessage = {
  kind: "text";
  content: string;
  timestamp: Date;
};

type ImageMessage = {
  kind: "image";
  imageUrl: string;
  width: number;
  height: number;
  timestamp: Date;
};

type VideoMessage = {
  kind: "video";
  videoUrl: string;
  duration: number;
  timestamp: Date;
};

type Message = TextMessage | ImageMessage | VideoMessage;

function displayMessage(msg: Message): string {
  switch (msg.kind) {
    case "text":
      return `Text: ${msg.content}`;
    case "image":
      return `Bild: ${msg.imageUrl} (${msg.width}x${msg.height})`;
    case "video":
      return `Video: ${msg.videoUrl} (${msg.duration}s)`;
  }
}

// ─── VERSCHIEDENE DISKRIMINATOR-TYPEN ──────────────────────────────────────

// String Literal (am haeufigsten):
type SuccessResponse = { status: "success"; data: unknown };
type ErrorResponse = { status: "error"; message: string };

// Number Literal:
type HttpOk = { code: 200; body: string };
type HttpNotFound = { code: 404; path: string };
type HttpError = { code: 500; error: string };
type HttpResponse = HttpOk | HttpNotFound | HttpError;

// Boolean Literal:
type ValidResult = { valid: true; value: number };
type InvalidResult = { valid: false; reason: string };
type ValidationResult = ValidResult | InvalidResult;

// ─── DEMONSTRATION ─────────────────────────────────────────────────────────

const messages: Message[] = [
  { kind: "text", content: "Hallo!", timestamp: new Date() },
  { kind: "image", imageUrl: "cat.jpg", width: 800, height: 600, timestamp: new Date() },
  { kind: "video", videoUrl: "demo.mp4", duration: 120, timestamp: new Date() },
];

console.log("=== Discriminated Union: Message ===");
for (const msg of messages) {
  console.log(displayMessage(msg));
}

// Boolean Diskriminator:
function checkValidation(result: ValidationResult) {
  if (result.valid) {
    console.log(`Gueltig: ${result.value}`);
  } else {
    console.log(`Ungueltig: ${result.reason}`);
  }
}

console.log("\n=== Boolean Diskriminator ===");
checkValidation({ valid: true, value: 42 });
checkValidation({ valid: false, reason: "Wert zu gross" });

// Number Diskriminator:
function handleHttp(res: HttpResponse) {
  switch (res.code) {
    case 200: return `OK: ${res.body}`;
    case 404: return `Nicht gefunden: ${res.path}`;
    case 500: return `Server-Fehler: ${res.error}`;
  }
}

console.log("\n=== Number Diskriminator ===");
console.log(handleHttp({ code: 200, body: '{"users":[]}' }));
console.log(handleHttp({ code: 404, path: "/api/unknown" }));

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt! ---");
