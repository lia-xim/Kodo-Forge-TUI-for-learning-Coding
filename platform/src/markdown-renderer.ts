/**
 * Terminal Markdown Renderer
 *
 * Rendert Markdown-Dateien fuer die Terminal-Ausgabe mit ANSI-Farben.
 * Unterstuetzt Ueberschriften, Code-Bloecke, Bold/Italic, Listen,
 * Blockquotes, Links, Tabellen und Mermaid-Diagramme (inline als
 * Box-Drawing-Art via diagram-renderer).
 *
 * Zusaetzliche Features:
 * - Annotierte Code-Bloecke (Anti-Split-Attention): Annotationen neben
 *   dem Code statt darunter. Aktivierung per `typescript annotated`.
 * - Self-Explanation-Prompts: Interaktive Denkfragen mit versteckten
 *   Kernpunkten. Erkennung via Blockquote mit Brain-Emoji.
 *
 * Keine externen Dependencies — nur ANSI Escape Codes.
 */

import {
  canRenderInTerminal,
  renderMermaidToTerminal,
  renderMermaidFallback,
} from "./diagram-renderer.ts";

// ─── Code-Annotationen (Anti-Split-Attention) ─────────────────────────────

/**
 * Steuert, ob annotierte Code-Bloecke die Annotationen anzeigen.
 * Kann von aussen umgeschaltet werden (z.B. per [A]-Taste im TUI).
 */
export let annotationsEnabled: boolean = true;

/**
 * Schaltet die Anzeige von Code-Annotationen ein oder aus.
 */
export function setAnnotationsEnabled(enabled: boolean): void {
  annotationsEnabled = enabled;
}

// ─── Self-Explanation Prompts ──────────────────────────────────────────────

/**
 * Repraesentiert einen Self-Explanation-Prompt aus dem Markdown.
 */
export interface SelfExplanationPrompt {
  /** Die Frage, die dem Lernenden gestellt wird */
  question: string;
  /** Kernpunkte (erst nach Interaktion sichtbar) */
  keyPoints: string[];
  /** Zeile im gerenderten Output, an der der Prompt beginnt */
  lineIndex: number;
}

/**
 * Extrahiert alle Self-Explanation-Prompts aus einem Markdown-String.
 *
 * Erkennt Blockquotes, die mit dem Brain-Emoji und "Erklaere dir selbst:"
 * beginnen. Die Kernpunkte stehen in der Zeile mit "Kernpunkte:".
 *
 * @param markdown - Der Markdown-Quelltext
 * @returns Array aller gefundenen Self-Explanation-Prompts
 */
export function extractSelfExplanationPrompts(
  markdown: string
): SelfExplanationPrompt[] {
  const prompts: SelfExplanationPrompt[] = [];
  const lines = markdown.split("\n");

  let i = 0;
  let renderedLineIndex = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    // Erkenne Self-Explanation-Blockquote
    if (
      trimmed.startsWith("> ") &&
      (trimmed.includes("\u{1F9E0}") || trimmed.includes("🧠")) &&
      trimmed.includes("**Erklaere dir selbst:**")
    ) {
      // Sammle alle Zeilen des Blockquotes
      const quoteLines: string[] = [trimmed.slice(2)];
      while (
        i + 1 < lines.length &&
        (lines[i + 1].trim().startsWith("> ") ||
          lines[i + 1].trim() === ">")
      ) {
        i++;
        const nextLine = lines[i].trim();
        if (nextLine === ">") {
          quoteLines.push("");
        } else {
          quoteLines.push(nextLine.slice(2));
        }
      }

      // Extrahiere Frage und Kernpunkte
      let question = "";
      let keyPoints: string[] = [];

      for (const ql of quoteLines) {
        if (ql.includes("**Kernpunkte:**")) {
          // Kernpunkte aus der Zeile extrahieren
          const kpText = ql
            .replace(/\*\*Kernpunkte:\*\*/, "")
            .trim();
          keyPoints = kpText
            .split("|")
            .map((kp) => kp.trim())
            .filter((kp) => kp.length > 0);
        } else if (
          ql.includes("**Erklaere dir selbst:**")
        ) {
          // Frage beginnt nach dem Marker
          question = ql
            .replace(/.*\*\*Erklaere dir selbst:\*\*/, "")
            .trim();
        } else if (ql.length > 0 && !ql.includes("Kernpunkte:")) {
          // Weiterer Fragetext
          question += (question ? " " : "") + ql.trim();
        }
      }

      if (question) {
        prompts.push({
          question,
          keyPoints,
          lineIndex: renderedLineIndex,
        });
      }
    }

    // Grobe Schaetzung der gerenderten Zeilen
    if (trimmed === "") {
      renderedLineIndex++;
    } else if (trimmed.startsWith("# ")) {
      renderedLineIndex += 4;
    } else if (trimmed.startsWith("## ")) {
      renderedLineIndex += 4;
    } else if (trimmed.startsWith("### ")) {
      renderedLineIndex += 3;
    } else {
      renderedLineIndex++;
    }

    i++;
  }

  return prompts;
}

// ─── ANSI-Farben ────────────────────────────────────────────────────────────

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  bgGray: "\x1b[48;5;236m",
  // ─── Muted Retro Palette (matches tui-theme.ts tokens) ───
  amber:      "\x1b[38;5;214m",
  slate:      "\x1b[38;5;66m",
  paleWhite:  "\x1b[38;5;253m",
  mutedBlue:  "\x1b[38;5;110m",
  mutedGreen: "\x1b[38;5;108m",
};

// ─── TypeScript Keyword-Highlighting ────────────────────────────────────────

const TS_KEYWORDS = new Set([
  "const", "let", "var", "function", "return", "if", "else", "for",
  "while", "do", "switch", "case", "break", "continue", "default",
  "import", "export", "from", "class", "extends", "implements",
  "interface", "type", "enum", "namespace", "module", "declare",
  "new", "this", "super", "typeof", "instanceof", "in", "of",
  "true", "false", "null", "undefined", "void", "never", "any",
  "unknown", "string", "number", "boolean", "bigint", "symbol",
  "object", "readonly", "as", "is", "keyof", "infer", "satisfies",
  "async", "await", "yield", "try", "catch", "finally", "throw",
  "abstract", "static", "private", "protected", "public", "get", "set",
]);

const TS_BUILTIN_TYPES = new Set([
  "Array", "Map", "Set", "Promise", "Record", "Partial", "Required",
  "Pick", "Omit", "Exclude", "Extract", "ReturnType", "Parameters",
  "Readonly", "ReadonlyArray", "NonNullable", "InstanceType",
  "ConstructorParameters", "ThisType", "Awaited",
]);

/**
 * Minimales Syntax-Highlighting fuer TypeScript Code-Bloecke.
 */
function highlightTS(line: string): string {
  let result = "";
  let i = 0;

  while (i < line.length) {
    // Einzeilige Kommentare
    if (line[i] === "/" && line[i + 1] === "/") {
      result += `${c.gray}${line.slice(i)}${c.reset}`;
      return result;
    }

    // Strings
    if (line[i] === '"' || line[i] === "'" || line[i] === "`") {
      const quote = line[i];
      let end = i + 1;
      while (end < line.length && line[end] !== quote) {
        if (line[end] === "\\") end++;
        end++;
      }
      end = Math.min(end + 1, line.length);
      result += `${c.green}${line.slice(i, end)}${c.reset}`;
      i = end;
      continue;
    }

    // Zahlen
    if (/\d/.test(line[i]) && (i === 0 || !/\w/.test(line[i - 1]))) {
      let end = i;
      while (end < line.length && /[\d.n]/.test(line[end])) end++;
      result += `${c.magenta}${line.slice(i, end)}${c.reset}`;
      i = end;
      continue;
    }

    // Woerter (Keywords, Types)
    if (/[a-zA-Z_$]/.test(line[i])) {
      let end = i;
      while (end < line.length && /[\w$]/.test(line[end])) end++;
      const word = line.slice(i, end);

      if (TS_KEYWORDS.has(word)) {
        result += `${c.blue}${word}${c.reset}`;
      } else if (TS_BUILTIN_TYPES.has(word)) {
        result += `${c.cyan}${word}${c.reset}`;
      } else {
        result += word;
      }
      i = end;
      continue;
    }

    // Operatoren und Sonderzeichen
    if (/[=<>!+\-*/%&|^~?:]/.test(line[i])) {
      result += `${c.yellow}${line[i]}${c.reset}`;
      i++;
      continue;
    }

    result += line[i];
    i++;
  }

  return result;
}

// ─── Inline-Formatierung ────────────────────────────────────────────────────

/**
 * Verarbeitet Inline-Formatierung: **bold**, *italic*, `code`, [links]
 */
function renderInline(text: string): string {
  let result = text;

  // Inline code: `code`
  result = result.replace(/`([^`]+)`/g, `${c.yellow}$1${c.reset}`);

  // Bold + Italic: ***text***
  result = result.replace(
    /\*\*\*([^*]+)\*\*\*/g,
    `${c.bold}${c.italic}$1${c.reset}`
  );

  // Bold: **text**
  result = result.replace(/\*\*([^*]+)\*\*/g, `${c.bold}$1${c.reset}`);

  // Italic: *text*
  result = result.replace(
    /(?<!\*)\*([^*]+)\*(?!\*)/g,
    `${c.italic}$1${c.reset}`
  );

  // Links: [text](url)
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    `${c.cyan}${c.underline}$1${c.reset}`
  );

  return result;
}

// ─── Annotierte Code-Bloecke (Parsing) ─────────────────────────────────────

interface AnnotatedLine {
  code: string;
  annotation: string | null;
}

/**
 * Parst einen annotierten Code-Block.
 *
 * Erkennt Zeilen mit `// ^` als Annotationen und ordnet sie der
 * vorherigen Code-Zeile zu. Mehrere `^` Annotationen in einer Zeile
 * werden zusammengefuegt.
 *
 * @param codeLines - Die Zeilen des annotierten Code-Blocks
 * @returns Array von Code-Zeilen mit optionaler Annotation
 */
function parseAnnotatedCode(codeLines: string[]): AnnotatedLine[] {
  const result: AnnotatedLine[] = [];

  for (let i = 0; i < codeLines.length; i++) {
    const trimmed = codeLines[i].trim();

    // Pruefe ob die Zeile eine Annotation ist (beginnt mit // ^ oder enthaelt // ^)
    if (/^\s*\/\/\s*\^/.test(codeLines[i])) {
      // Extrahiere den Annotationstext
      // Entferne alles bis zum ersten ^ und den Rest ist die Annotation
      const annotationParts = trimmed.split(/\/\/\s*\^/).filter(Boolean);
      const annotation = annotationParts
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
        .join("  ");

      // Ordne der vorherigen Code-Zeile zu
      if (result.length > 0 && annotation) {
        const prev = result[result.length - 1];
        if (prev.annotation) {
          prev.annotation += "  " + annotation;
        } else {
          prev.annotation = annotation;
        }
      }
      continue; // Annotations-Zeile nicht als Code ausgeben
    }

    result.push({ code: codeLines[i], annotation: null });
  }

  return result;
}

/**
 * Rendert einen annotierten Code-Block.
 *
 * Zeigt Code links und Annotationen rechts an (in dim/gelb).
 * Wenn annotationsEnabled=false, werden nur die Code-Zeilen gerendert.
 *
 * @param annotatedLines - Geparste annotierte Zeilen
 * @param contentWidth - Verfuegbare Breite
 * @param codeBlockLang - Die Sprache fuer Syntax-Highlighting
 * @returns Array von gerenderten Zeilen
 */
function renderAnnotatedCodeBlock(
  annotatedLines: AnnotatedLine[],
  contentWidth: number,
  codeBlockLang: string
): string[] {
  const output: string[] = [];

  // Breite fuer Code und Annotation berechnen
  const codeWidth = Math.floor((contentWidth - 4) * 0.55);
  const annotationSep = " \u2576\u2500 "; // ╶─
  const annotationSepLen = 4; // sichtbare Laenge von " ╶─ "

  // Header
  const langLabel = " typescript (annotiert) ";
  output.push("");
  output.push(
    `  ${c.dim}\u250C\u2500${langLabel}${"\u2500".repeat(
      Math.max(0, contentWidth - 4 - langLabel.length)
    )}\u2510${c.reset}`
  );

  for (const line of annotatedLines) {
    const codeLine =
      line.code.length > codeWidth
        ? line.code.slice(0, codeWidth - 3) + "..."
        : line.code;

    const doHighlight =
      codeBlockLang.includes("typescript") ||
      codeBlockLang.includes("ts") ||
      codeBlockLang === "";

    const highlighted = doHighlight ? highlightTS(codeLine) : codeLine;
    const visibleCodeLen = stripAnsi(codeLine).length;

    if (annotationsEnabled && line.annotation) {
      // Code + Annotation
      const codePadding = Math.max(0, codeWidth - visibleCodeLen);
      const availAnnotation =
        contentWidth - 4 - codeWidth - annotationSepLen;
      const truncatedAnnotation =
        line.annotation.length > availAnnotation
          ? line.annotation.slice(0, availAnnotation - 3) + "..."
          : line.annotation;
      const annotationPadding = Math.max(
        0,
        contentWidth -
          4 -
          visibleCodeLen -
          codePadding -
          annotationSepLen -
          truncatedAnnotation.length
      );

      output.push(
        `  ${c.dim}\u2502${c.reset} ${highlighted}${" ".repeat(
          codePadding
        )}${c.dim}${annotationSep}${c.yellow}${truncatedAnnotation}${
          c.reset
        }${" ".repeat(annotationPadding)} ${c.dim}\u2502${c.reset}`
      );
    } else {
      // Nur Code (keine Annotation oder Annotationen deaktiviert)
      const padding = Math.max(0, contentWidth - 4 - visibleCodeLen);
      output.push(
        `  ${c.dim}\u2502${c.reset} ${highlighted}${" ".repeat(padding)} ${c.dim}\u2502${c.reset}`
      );
    }
  }

  // Footer
  output.push(
    `  ${c.dim}\u2514${"\u2500".repeat(contentWidth - 2)}\u2518${c.reset}`
  );
  output.push("");

  return output;
}

// ─── Self-Explanation Prompt Rendering ─────────────────────────────────────

/**
 * Prueft ob eine Blockquote-Zeile einen Self-Explanation-Prompt einleitet.
 */
function isSelfExplanationStart(text: string): boolean {
  return (
    (text.includes("\u{1F9E0}") || text.includes("🧠")) &&
    text.includes("**Erklaere dir selbst:**")
  );
}

/**
 * Rendert einen Self-Explanation-Prompt als interaktive Box.
 *
 * @param quoteLines - Die Zeilen des Blockquotes
 * @param contentWidth - Verfuegbare Breite
 * @returns Array von gerenderten Zeilen
 */
function renderSelfExplanationPrompt(
  quoteLines: string[],
  contentWidth: number
): string[] {
  const output: string[] = [];

  // Extrahiere Frage und Kernpunkte
  let questionParts: string[] = [];
  let hasKeyPoints = false;

  for (const ql of quoteLines) {
    if (ql.includes("**Kernpunkte:**")) {
      hasKeyPoints = true;
      continue; // Kernpunkte nicht anzeigen
    }
    if (isSelfExplanationStart(ql)) {
      // Extrahiere den Text nach dem Marker
      const after = ql
        .replace(/.*\*\*Erklaere dir selbst:\*\*/, "")
        .trim();
      if (after) questionParts.push(after);
    } else if (ql.length > 0) {
      questionParts.push(ql.trim());
    }
  }

  const boxInner = contentWidth - 4;
  const boxWidth = Math.min(contentWidth, boxInner + 2);

  // Header mit Brain-Emoji
  const headerText = " \u{1F9E0} Erklaere dir selbst ";
  const headerPadding = Math.max(0, boxWidth - headerText.length - 1);

  output.push("");
  output.push(
    `  ${c.magenta}\u250C\u2500${headerText}${"\u2500".repeat(
      headerPadding
    )}\u2510${c.reset}`
  );

  // Leerzeile
  output.push(
    `  ${c.magenta}\u2502${c.reset}${" ".repeat(boxWidth)}${c.magenta}\u2502${c.reset}`
  );

  // Frage rendern (mit Umbruch)
  for (const part of questionParts) {
    const wrapped = wrapText(part, boxInner);
    for (const wl of wrapped) {
      const vis = stripAnsi(wl).length;
      const pad = Math.max(0, boxWidth - 1 - vis);
      output.push(
        `  ${c.magenta}\u2502${c.reset} ${c.bold}${renderInline(wl)}${
          c.reset
        }${" ".repeat(pad)}${c.magenta}\u2502${c.reset}`
      );
    }
  }

  // Leerzeile
  output.push(
    `  ${c.magenta}\u2502${c.reset}${" ".repeat(boxWidth)}${c.magenta}\u2502${c.reset}`
  );

  // Aktions-Hinweise
  const actions = "[T] Tippe deine Erklaerung  [Enter] Verstanden  [?] Hilfe";
  const actionsVis = actions.length;
  const actionsPad = Math.max(0, boxWidth - 1 - actionsVis);

  output.push(
    `  ${c.magenta}\u2502${c.reset} ${c.dim}${actions}${c.reset}${" ".repeat(
      actionsPad
    )}${c.magenta}\u2502${c.reset}`
  );

  // Footer
  output.push(
    `  ${c.magenta}\u2514${"\u2500".repeat(boxWidth)}\u2518${c.reset}`
  );
  output.push("");

  return output;
}

// ─── Tabellenformatierung ───────────────────────────────────────────────────

interface TableData {
  headers: string[];
  rows: string[][];
}

function parseTable(lines: string[]): TableData | null {
  if (lines.length < 2) return null;

  const headers = lines[0]
    .split("|")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Zweite Zeile muss Separator sein
  const sep = lines[1].trim();
  if (!/^\|?[\s\-|:]+\|?$/.test(sep)) return null;

  const rows: string[][] = [];
  for (let i = 2; i < lines.length; i++) {
    const cols = lines[i]
      .split("|")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (cols.length > 0) {
      rows.push(cols);
    }
  }

  return { headers, rows };
}

function renderTable(table: TableData, maxWidth: number): string[] {
  const colCount = table.headers.length;
  const colWidths: number[] = new Array(colCount).fill(0);

  // Messe maximale Spaltenbreite
  for (let col = 0; col < colCount; col++) {
    colWidths[col] = stripAnsi(table.headers[col]).length;
    for (const row of table.rows) {
      if (col < row.length) {
        const cellLen = stripAnsi(row[col]).length;
        if (cellLen > colWidths[col]) colWidths[col] = cellLen;
      }
    }
  }

  // Kuerze Spalten wenn noetig
  const totalWidth = colWidths.reduce((a, b) => a + b, 0) + colCount * 3 + 1;
  if (totalWidth > maxWidth - 4) {
    const available = maxWidth - 4 - colCount * 3 - 1;
    const perCol = Math.max(8, Math.floor(available / colCount));
    for (let i = 0; i < colWidths.length; i++) {
      if (colWidths[i] > perCol) colWidths[i] = perCol;
    }
  }

  const output: string[] = [];

  // Trennlinie
  const sepLine =
    "+" + colWidths.map((w) => "-".repeat(w + 2)).join("+") + "+";

  // Header
  output.push(`  ${c.dim}${sepLine}${c.reset}`);
  let headerLine = "|";
  for (let col = 0; col < colCount; col++) {
    const text = truncateVisible(table.headers[col], colWidths[col]);
    headerLine += ` ${c.bold}${renderInline(text)}${c.reset}${" ".repeat(Math.max(0, colWidths[col] - stripAnsi(text).length))} |`;
  }
  output.push(`  ${c.dim}${headerLine}${c.reset}`);
  output.push(`  ${c.dim}${sepLine}${c.reset}`);

  // Rows
  for (const row of table.rows) {
    let rowLine = "|";
    for (let col = 0; col < colCount; col++) {
      const cellText = col < row.length ? row[col] : "";
      const text = truncateVisible(cellText, colWidths[col]);
      rowLine += ` ${renderInline(text)}${" ".repeat(Math.max(0, colWidths[col] - stripAnsi(text).length))} |`;
    }
    output.push(`  ${c.dim}${rowLine}${c.reset}`);
  }
  output.push(`  ${c.dim}${sepLine}${c.reset}`);

  return output;
}

// ─── Hilfsfunktionen ────────────────────────────────────────────────────────

export function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}

function truncateVisible(str: string, maxLen: number): string {
  const visible = stripAnsi(str);
  if (visible.length <= maxLen) return str;
  return visible.slice(0, maxLen - 3) + "...";
}

function wrapText(text: string, maxWidth: number): string[] {
  if (maxWidth < 10) maxWidth = 10;
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const testLine = current ? `${current} ${word}` : word;
    if (stripAnsi(testLine).length > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = testLine;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

// ─── Mermaid-Extraktion ────────────────────────────────────────────────────

/**
 * Extrahiert alle Mermaid-Codeblocks aus einem Markdown-String.
 * Gibt ein Array von Mermaid-Code-Strings zurueck.
 */
export function extractMermaidBlocks(markdown: string): string[] {
  const blocks: string[] = [];
  const lines = markdown.split("\n");
  let inMermaid = false;
  let currentBlock: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("```mermaid")) {
      inMermaid = true;
      currentBlock = [];
      continue;
    }
    if (inMermaid && trimmed.startsWith("```")) {
      blocks.push(currentBlock.join("\n"));
      inMermaid = false;
      continue;
    }
    if (inMermaid) {
      currentBlock.push(line);
    }
  }

  return blocks;
}

// ─── Adaptive Depth Filtering ──────────────────────────────────────────────

/**
 * Filtert Markdown-Inhalt basierend auf der gewaehlten Tiefe.
 *
 * Unterstuetzt folgende Marker:
 * - `<!-- section:summary -->` — Immer sichtbar (alle Tiefen)
 * - `<!-- depth:standard -->` — Sichtbar bei "standard" und "vollstaendig"
 * - `<!-- depth:vollstaendig -->` — Nur sichtbar bei "vollstaendig"
 * - `<!-- /depth -->` — Schliesst den letzten Tiefenblock
 * - Inhalt OHNE Marker ist immer sichtbar (abwaertskompatibel)
 */
export function filterByDepth(
  markdown: string,
  depth: "kurz" | "standard" | "vollständig"
): string {
  const lines = markdown.split("\n");
  const result: string[] = [];
  let currentDepth: string | null = null;
  let blockOmitted = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Marker erkennen
    if (trimmed === "<!-- section:summary -->") {
      currentDepth = "summary";
      blockOmitted = false;
      continue;
    }
    if (trimmed === "<!-- depth:standard -->") {
      currentDepth = "standard";
      blockOmitted = false;
      continue;
    }
    if (trimmed === "<!-- depth:vollstaendig -->" || trimmed === "<!-- depth:vollständig -->") {
      currentDepth = "vollstaendig";
      blockOmitted = false;
      continue;
    }
    if (trimmed === "<!-- /depth -->") {
      currentDepth = null;
      blockOmitted = false;
      continue;
    }

    // Sichtbarkeitsregeln
    if (currentDepth === null) {
      // Kein Marker → immer sichtbar
      result.push(line);
    } else if (currentDepth === "summary") {
      // Summary → immer sichtbar
      result.push(line);
    } else if (currentDepth === "standard") {
      // Standard → sichtbar bei "standard" und "vollstaendig"
      if (depth === "standard" || depth === "vollständig") {
        result.push(line);
      } else {
        if (!blockOmitted) {
          result.push("");
          result.push("> *[... Standard-Details weggelassen (Drücke N für Standard, V für Vollständig)]*");
          result.push("");
          blockOmitted = true;
        }
      }
    } else if (currentDepth === "vollstaendig") {
      // Vollstaendig → nur bei "vollständig"
      if (depth === "vollständig") {
        result.push(line);
      } else {
        if (!blockOmitted) {
          result.push("");
          result.push("> *[... Vertiefung übersprungen (Drücke V zum Erweitern)]*");
          result.push("");
          blockOmitted = true;
        }
      }
    }
  }

  return result.join("\n");
}

/**
 * Validiert Markdown auf korrekte Depth-Marker-Syntax.
 * Gibt eine Warnung zurueck wenn Marker unausgeglichen sind.
 */
export function validateDepthMarkers(markdown: string): string | null {
  const lines = markdown.split("\n");
  let depthCount = 0;
  let summaryCount = 0;
  let closeCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "<!-- depth:standard -->") depthCount++;
    if (trimmed === "<!-- depth:vollstaendig -->" || trimmed === "<!-- depth:vollständig -->") depthCount++;
    if (trimmed === "<!-- section:summary -->") summaryCount++;
    if (trimmed === "<!-- /depth -->") closeCount++;
  }

  const totalOpen = depthCount + summaryCount;

  if (depthCount > 0 && summaryCount === 0) {
    return "Depth-Marker vorhanden aber kein <!-- section:summary --> gefunden.";
  }
  if (totalOpen !== closeCount) {
    return `Unausgeglichene Depth-Marker: ${totalOpen} oeffnende, ${closeCount} schliessende.`;
  }

  return null; // Alles OK
}

// ─── Hauptrenderer ──────────────────────────────────────────────────────────

/**
 * Rendert eine Markdown-Datei in Terminal-Zeilen mit ANSI-Farben.
 *
 * @param markdown - Der Markdown-Quelltext
 * @param maxWidth - Maximale Zeichenbreite pro Zeile (Standard: 72)
 * @returns Array von gerenderten Zeilen (mit ANSI-Codes)
 */
export function renderMarkdown(
  markdown: string,
  maxWidth: number = 72
): string[] {
  const lines = markdown.split("\n");
  const output: string[] = [];
  const contentWidth = Math.max(20, maxWidth - 4); // Rand links+rechts

  let inCodeBlock = false;
  let codeBlockLang = "";
  let inTable = false;
  let tableLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // ── Code-Bloecke ──────────────────────────────────────────────────

    if (trimmed.startsWith("```")) {
      if (!inCodeBlock) {
        // Start eines Code-Blocks
        inCodeBlock = true;
        codeBlockLang = trimmed.slice(3).trim().toLowerCase();

        // Mermaid-Bloecke speziell behandeln
        if (codeBlockLang === "mermaid") {
          // Sammle den Mermaid-Code
          const mermaidLines: string[] = [];
          while (i + 1 < lines.length && !lines[i + 1].trim().startsWith("```")) {
            i++;
            mermaidLines.push(lines[i]);
          }
          if (i + 1 < lines.length) i++; // Schliessende ```

          const mermaidCode = mermaidLines.join("\n");
          output.push("");

          // Versuche inline zu rendern
          if (canRenderInTerminal(mermaidCode)) {
            const boxW = Math.min(contentWidth - 2, 60);
            output.push(
              `  ${c.dim}┌─ Diagramm ${"─".repeat(Math.max(0, boxW - 14))}┐${c.reset}`
            );
            const diagramLines = renderMermaidToTerminal(mermaidCode, boxW - 2);
            for (const dl of diagramLines) {
              output.push(`  ${c.dim}│${c.reset} ${dl}`);
            }
            output.push(
              `  ${c.dim}├${"─".repeat(boxW - 1)}┤${c.reset}`
            );
            output.push(
              `  ${c.dim}│${c.reset} ${c.yellow}[D] Vollstaendiges Diagramm im Browser${c.reset}${" ".repeat(Math.max(0, boxW - 41))}${c.dim}│${c.reset}`
            );
            output.push(
              `  ${c.dim}└${"─".repeat(boxW - 1)}┘${c.reset}`
            );
          } else {
            // Fallback fuer komplexe Diagramme
            const fallbackLines = renderMermaidFallback(contentWidth);
            output.push(...fallbackLines);
          }

          output.push("");
          inCodeBlock = false;
          continue;
        }

        // Annotierte Code-Bloecke speziell behandeln
        if (
          codeBlockLang === "typescript annotated" ||
          codeBlockLang === "ts annotated"
        ) {
          // Sammle alle Zeilen des annotierten Blocks
          const annotatedCodeLines: string[] = [];
          while (
            i + 1 < lines.length &&
            !lines[i + 1].trim().startsWith("```")
          ) {
            i++;
            annotatedCodeLines.push(lines[i]);
          }
          if (i + 1 < lines.length) i++; // Schliessende ```

          const parsed = parseAnnotatedCode(annotatedCodeLines);
          output.push(
            ...renderAnnotatedCodeBlock(parsed, contentWidth, codeBlockLang)
          );

          inCodeBlock = false;
          codeBlockLang = "";
          continue;
        }

        output.push("");
        const langLabel = codeBlockLang ? ` ${codeBlockLang} ` : "";
        output.push(
          `  ${c.dim}┌─${langLabel}${"─".repeat(Math.max(0, contentWidth - 4 - langLabel.length))}┐${c.reset}`
        );
        continue;
      } else {
        // Ende eines Code-Blocks
        output.push(
          `  ${c.dim}└${"─".repeat(contentWidth - 2)}┘${c.reset}`
        );
        output.push("");
        inCodeBlock = false;
        codeBlockLang = "";
        continue;
      }
    }

    if (inCodeBlock) {
      // Code-Zeile rendern
      const codeLine =
        line.length > contentWidth - 4
          ? line.slice(0, contentWidth - 7) + "..."
          : line;

      const highlighted =
        codeBlockLang === "typescript" || codeBlockLang === "ts" ||
        codeBlockLang === "javascript" || codeBlockLang === "js" ||
        codeBlockLang === ""
          ? highlightTS(codeLine)
          : codeLine;

      const padding = Math.max(
        0,
        contentWidth - 4 - stripAnsi(codeLine).length
      );
      output.push(
        `  ${c.dim}│${c.reset} ${highlighted}${" ".repeat(padding)} ${c.dim}│${c.reset}`
      );
      continue;
    }

    // ── Tabellen ──────────────────────────────────────────────────────

    if (trimmed.includes("|") && !trimmed.startsWith(">")) {
      if (!inTable) {
        inTable = true;
        tableLines = [];
      }
      tableLines.push(trimmed);

      // Pruefen ob naechste Zeile noch zur Tabelle gehoert
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : "";
      if (!nextLine.includes("|") || nextLine.startsWith(">")) {
        // Tabelle fertig
        const table = parseTable(tableLines);
        if (table) {
          output.push("");
          output.push(...renderTable(table, maxWidth));
          output.push("");
        } else {
          // Fallback: Zeilen normal rendern
          for (const tl of tableLines) {
            output.push(`  ${renderInline(tl)}`);
          }
        }
        inTable = false;
        tableLines = [];
      }
      continue;
    }

    if (inTable) {
      // Tabelle unerwartet beendet
      const table = parseTable(tableLines);
      if (table) {
        output.push(...renderTable(table, maxWidth));
      }
      inTable = false;
      tableLines = [];
      // Fall through to process current line normally
    }

    // ── Horizontale Trennlinie ────────────────────────────────────────

    if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed)) {
      output.push(`  ${c.dim}${"─".repeat(contentWidth)}${c.reset}`);
      continue;
    }

    // ── Ueberschriften ────────────────────────────────────────────────
    
    if (trimmed.startsWith("# ")) {
      output.push("");
      const text = trimmed.slice(2);
      output.push(`  ${c.bold}${c.amber}█ ${text}${c.reset}`);
      output.push(
        `  ${c.amber}${"▀".repeat(Math.min(stripAnsi(text).length + 2, contentWidth))}${c.reset}`
      );
      output.push("");
      continue;
    }

    if (trimmed.startsWith("## ")) {
      output.push("");
      const text = trimmed.slice(3);
      output.push(`  ${c.bold}${c.mutedBlue}▓ ${text}${c.reset}`);
      output.push(
        `  ${c.mutedBlue}${"─".repeat(Math.min(stripAnsi(text).length + 2, contentWidth))}${c.reset}`
      );
      output.push("");
      continue;
    }

    if (trimmed.startsWith("### ")) {
      output.push("");
      const text = trimmed.slice(4);
      output.push(`  ${c.bold}${c.mutedGreen}▒ ${text}${c.reset}`);
      output.push("");
      continue;
    }

    if (trimmed.startsWith("#### ")) {
      output.push(`  ${c.bold}${trimmed.slice(5)}${c.reset}`);
      continue;
    }

    // ── Blockquotes ───────────────────────────────────────────────────

    if (trimmed.startsWith("> ")) {
      const quoteText = trimmed.slice(2);

      // Multi-line blockquote sammeln
      const quoteLines = [quoteText];
      while (
        i + 1 < lines.length &&
        (lines[i + 1].trim().startsWith("> ") || lines[i + 1].trim() === ">")
      ) {
        i++;
        const nextQuoteLine = lines[i].trim();
        if (nextQuoteLine === ">") {
          quoteLines.push("");
        } else {
          quoteLines.push(nextQuoteLine.slice(2));
        }
      }

      // Self-Explanation-Prompt erkennen und speziell rendern
      if (isSelfExplanationStart(quoteText)) {
        output.push(
          ...renderSelfExplanationPrompt(quoteLines, contentWidth)
        );
        continue;
      }

      // Dynamische Box-Breite basierend auf contentWidth
      const boxInnerWidth = contentWidth - 4;
      const boxWidth = Math.min(contentWidth, boxInnerWidth + 2);

      output.push("");
      output.push(
        `  ${c.slate}┌${"─".repeat(boxWidth)}┐${c.reset}`
      );
      for (const ql of quoteLines) {
        if (ql === "") {
          output.push(`  ${c.slate}│${c.reset}${" ".repeat(boxWidth)}${c.slate}│${c.reset}`);
        } else {
          const wrapped = wrapText(ql, boxInnerWidth);
          for (const wl of wrapped) {
            const vis = stripAnsi(wl).length;
            const pad = Math.max(0, boxWidth - 1 - vis);
            output.push(
              `  ${c.slate}│${c.reset} ${c.paleWhite}${renderInline(wl)}${c.reset}${" ".repeat(pad)}${c.slate}│${c.reset}`
            );
          }
        }
      }
      output.push(
        `  ${c.slate}└${"─".repeat(boxWidth)}┘${c.reset}`
      );
      output.push("");
      continue;
    }

    // ── Listen ────────────────────────────────────────────────────────

    if (/^[-*]\s/.test(trimmed)) {
      const listText = trimmed.slice(2);
      const wrapped = wrapText(listText, contentWidth - 4);
      output.push(`  ${c.cyan}\u2022${c.reset} ${renderInline(wrapped[0])}`);
      for (let w = 1; w < wrapped.length; w++) {
        output.push(`    ${renderInline(wrapped[w])}`);
      }
      continue;
    }

    // Nummerierte Listen
    const numberedMatch = trimmed.match(/^(\d+)\.\s(.+)/);
    if (numberedMatch) {
      const num = numberedMatch[1];
      const listText = numberedMatch[2];
      const wrapped = wrapText(listText, contentWidth - 4 - num.length);
      output.push(
        `  ${c.cyan}${num}.${c.reset} ${renderInline(wrapped[0])}`
      );
      for (let w = 1; w < wrapped.length; w++) {
        output.push(`${" ".repeat(num.length + 4)}${renderInline(wrapped[w])}`);
      }
      continue;
    }

    // ── Leerzeilen ────────────────────────────────────────────────────

    if (trimmed === "") {
      output.push("");
      continue;
    }

    // ── Normaler Text ─────────────────────────────────────────────────

    const wrapped = wrapText(trimmed, contentWidth);
    for (const wl of wrapped) {
      output.push(`  ${renderInline(wl)}`);
    }
  }

  return output;
}

/**
 * Berechnet Seitenumbrueche basierend auf der Terminal-Hoehe.
 *
 * @param renderedLines - Die gerenderten Zeilen aus renderMarkdown()
 * @param pageHeight - Verfuegbare Zeilen pro Seite (abzgl. Header/Footer)
 * @returns Array von Seiten, jede Seite ist ein Array von Zeilen
 */
export function paginate(
  renderedLines: string[],
  pageHeight: number
): string[][] {
  const pages: string[][] = [];

  for (let i = 0; i < renderedLines.length; i += pageHeight) {
    pages.push(renderedLines.slice(i, i + pageHeight));
  }

  if (pages.length === 0) {
    pages.push([""]);
  }

  return pages;
}

/**
 * Schaetze die Lesezeit eines Markdown-Textes (in Minuten).
 * Basierend auf ~200 Woerter pro Minute.
 */
export function estimateReadTime(markdown: string): number {
  const words = markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#*>|`\-=]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  return Math.max(1, Math.ceil(words / 200));
}

/**
 * Rendert eine kurze Vorschau (die ersten paar Zeilen) eines Markdown-Textes.
 * Fuer die Sektions-Vorschau im Lektionsmenue.
 */
export function renderPreview(
  markdown: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const full = renderMarkdown(markdown, maxWidth);
  // Ueberspringe fuehrende Leerzeilen
  let start = 0;
  while (start < full.length && stripAnsi(full[start]).trim() === "") {
    start++;
  }
  return full.slice(start, start + maxLines);
}
