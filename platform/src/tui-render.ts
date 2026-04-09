/**
 * tui-render.ts — Shared Rendering Utilities (Farben, Box-Drawing, Layout, flushScreen)
 *
 * The `c` object below is the LEGACY color API. It is backed by tui-theme.ts
 * tokens for consistency, but maintains the old API surface so every existing
 * file continues to work without modification during gradual migration.
 *
 * NEW CODE should import from tui-theme.ts and tui-components.ts directly.
 */

import { stripAnsi } from "./markdown-renderer.ts";
import { theme } from "./tui-theme.ts";

// ─── ANSI-Farben & Escape Codes (Legacy Compat Layer) ──────────────────────
//
// This `c` object re-exports theme tokens as the old flat API.
// It ensures all 15+ existing tui-*.ts files keep working unchanged.

export const c = {
  // Modifiers
  reset:     theme.mod.reset,
  bold:      theme.mod.bold,
  dim:       theme.mod.dim,
  italic:    theme.mod.italic,
  underline: theme.mod.underline,
  inverse:   theme.mod.inverse,
  // Standard colors (mapped to theme compat)
  red:       theme.compat.red,
  green:     theme.compat.green,
  yellow:    theme.compat.yellow,
  blue:      theme.compat.blue,
  magenta:   theme.compat.magenta,
  cyan:      theme.compat.cyan,
  white:     theme.compat.white,
  gray:      theme.compat.gray,
  // Backgrounds
  bgBlack:   "\x1b[40m",
  bgRed:     "\x1b[41m",
  bgGreen:   "\x1b[42m",
  bgYellow:  "\x1b[43m",
  bgBlue:    "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan:    "\x1b[46m",
  bgWhite:   "\x1b[47m",
  bgGray:    "\x1b[48;5;236m",
  bgDarkGray:"\x1b[48;5;234m",
  // ─── Muted Retro Palette (from theme tokens) ───
  amber:     theme.fg.accent,
  slate:     theme.fg.secondary,
  paleWhite: theme.fg.primary,
  mutedBlue: theme.fg.info,
  mutedGreen:theme.fg.success,
  mutedRed:  theme.fg.error,
  bgSlate:   theme.bg.surface,
  bgAmber:   theme.bg.accent,
};

// ─── Terminal Escape Sequences ─────────────────────────────────────────────

export const ENTER_ALT_SCREEN = "\x1b[?1049h";
export const LEAVE_ALT_SCREEN = "\x1b[?1049l";
export const HIDE_CURSOR = "\x1b[?25l";
export const SHOW_CURSOR = "\x1b[?25h";
export const CURSOR_HOME = "\x1b[H";
export const CLEAR_SCREEN = "\x1b[2J";

// Mouse tracking
export const ENABLE_MOUSE =
  "\x1b[?1000h\x1b[?1006h\x1b[?1007h";
export const DISABLE_MOUSE =
  "\x1b[?1007l\x1b[?1006l\x1b[?1000l";

// ─── Layout-Hilfsfunktionen ────────────────────────────────────────────────

/** ANSI-freie Laenge */
export function visLen(str: string): number {
  return stripAnsi(str).length;
}

/** Text auf sichtbare Laenge kuerzen (ANSI-aware) */
export function truncate(str: string, maxLen: number): string {
  const stripped = stripAnsi(str);
  if (stripped.length <= maxLen) return str;
  return stripped.slice(0, maxLen - 1) + "\u2026";
}

/** Rechts-Padding mit sichtbarer Laengenmessung */
export function padR(str: string, width: number): string {
  const vis = visLen(str);
  const pad = Math.max(0, width - vis);
  return str + " ".repeat(pad);
}

/** Zentriert einen String */
export function center(str: string, width: number): string {
  const vis = visLen(str);
  const totalPad = Math.max(0, width - vis);
  const leftPad = Math.floor(totalPad / 2);
  const rightPad = totalPad - leftPad;
  return " ".repeat(leftPad) + str + " ".repeat(rightPad);
}

/** Fortschrittsbalken */
export function progressBar(
  done: number,
  total: number,
  barWidth: number = 16
): string {
  if (total === 0) return `${c.slate}${"░".repeat(barWidth)}${c.reset}`;
  const pct = Math.min(1, done / total);
  const filled = Math.round(pct * barWidth);
  const empty = barWidth - filled;
  const color = pct >= 1 ? c.mutedGreen : pct > 0 ? c.amber : c.slate;
  return `${color}${"█".repeat(filled)}${c.slate}${"░".repeat(empty)}${c.reset}`;
}

/** Prozent-String */
export function pctStr(pct: number): string {
  const color = pct >= 100 ? c.mutedGreen : pct > 0 ? c.amber : c.slate;
  return `${color}${String(pct).padStart(3)}%${c.reset}`;
}

// ─── Box-Drawing ───────────────────────────────────────────────────────────

export function boxHLine(width: number, left: string, fill: string, right: string): string {
  return `${c.slate}${left}${fill.repeat(Math.max(0, width - 2))}${right}${c.reset}`;
}

export function boxTop(width: number): string {
  return boxHLine(width, "┌", "─", "┐");
}

export function boxBottom(width: number): string {
  return boxHLine(width, "└", "─", "┘");
}

export function boxSep(width: number): string {
  return boxHLine(width, "├", "─", "┤");
}

/** Erstelle eine Box-Zeile: │ content ... │ */
export function bLine(content: string, width: number): string {
  const innerWidth = width - 2;
  const vis = visLen(content);
  const pad = Math.max(0, innerWidth - vis);
  return `${c.slate}│${c.reset}${content}${" ".repeat(pad)}${c.slate}│${c.reset}`;
}

/** Erstelle eine leere Box-Zeile */
export function bEmpty(width: number): string {
  return `${c.slate}│${c.reset}${" ".repeat(width - 2)}${c.slate}│${c.reset}`;
}

// ─── Scrollbar-Rendering ──────────────────────────────────────────────────

export function computeScrollbar(
  scrollOffset: number,
  totalLines: number,
  viewportHeight: number
): ("track" | "thumb")[] {
  const result: ("track" | "thumb")[] = [];
  if (totalLines <= viewportHeight) {
    for (let i = 0; i < viewportHeight; i++) result.push("track");
    return result;
  }

  const thumbSize = Math.max(1, Math.round((viewportHeight / totalLines) * viewportHeight));
  const maxOffset = totalLines - viewportHeight;
  const scrollFraction = maxOffset > 0 ? scrollOffset / maxOffset : 0;
  const thumbStart = Math.round(scrollFraction * (viewportHeight - thumbSize));

  for (let i = 0; i < viewportHeight; i++) {
    if (i >= thumbStart && i < thumbStart + thumbSize) {
      result.push("thumb");
    } else {
      result.push("track");
    }
  }
  return result;
}

/** Rendert ein Scrollbar-Zeichen */
export function scrollbarChar(type: "track" | "thumb"): string {
  return type === "thumb" ? `${c.amber}█${c.reset}` : `${c.slate}│${c.reset}`;
}

// ─── Render-Pipeline ───────────────────────────────────────────────────────

import { W, H } from "./tui-state.ts";

/**
 * Rendert den gesamten Screen in einem einzigen write-Aufruf
 * fuer flicker-free Darstellung.
 */
export function flushScreen(lines: string[]): void {
  const buffer: string[] = [];
  buffer.push(CURSOR_HOME);

  const h = H();
  for (let i = 0; i < h; i++) {
    if (i < lines.length) {
      buffer.push(lines[i] + "\x1b[K");
    } else {
      buffer.push("\x1b[K");
    }
    if (i < h - 1) {
      buffer.push("\n");
    }
  }

  process.stdout.write(buffer.join(""));
}

// ─── Header & Footer ──────────────────────────────────────────────────────

export function renderHeader(leftText: string, rightText: string): string {
  const w = W();
  const totalInner = w - 2;
  const leftVis = visLen(leftText);
  const rightVis = visLen(rightText);
  const middlePad = Math.max(1, totalInner - leftVis - rightVis);
  const inner = `${leftText}${" ".repeat(middlePad)}${rightText}`;
  return `${c.bgSlate}${c.paleWhite}${c.bold} ${padR(inner, w - 2)}${c.reset}`;
}

export function renderFooter(shortcuts: string[]): string[] {
  const w = W();
  const line1 = boxSep(w);
  const shortcutText = " " + shortcuts.join("  ");
  const line2 = bLine(shortcutText, w);
  const line3 = boxBottom(w);
  return [line1, line2, line3];
}

// ─── Word-Wrap Hilfsfunktion ─────────────────────────────────────────────

export function wordWrap(text: string, maxWidth: number): string[] {
  if (maxWidth <= 0) return [text];
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (stripAnsi(current).length === 0) {
      current = word;
    } else if (stripAnsi(current).length + 1 + stripAnsi(word).length <= maxWidth) {
      current += " " + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current.length > 0) lines.push(current);
  if (lines.length === 0) lines.push("");
  return lines;
}

// ─── Scroll-Helper ─────────────────────────────────────────────────────────

export function getContentHeight(): number {
  return Math.max(5, H() - 4); // Header(1) + Footer(3)
}

export function clampScrollOffset(offset: number, totalLines: number): number {
  const maxOffset = Math.max(0, totalLines - getContentHeight());
  return Math.max(0, Math.min(offset, maxOffset));
}

export function getScrollPercent(scrollOffset: number, totalLines: number): number {
  const contentHeight = getContentHeight();
  if (totalLines <= contentHeight) return 100;
  const maxOffset = totalLines - contentHeight;
  return Math.round((scrollOffset / maxOffset) * 100);
}

// ─── Grid-Helper (fuer Platform Screen) ────────────────────────────────────

export function plainCell(text: string, width: number): string {
  const plain = stripAnsi(text);
  if (plain.length >= width) return plain.slice(0, width);
  return plain + " ".repeat(width - plain.length);
}

export function colorCell(text: string, width: number): string {
  const vis = stripAnsi(text).length;
  if (vis >= width) {
    return stripAnsi(text).slice(0, width);
  }
  return text + " ".repeat(width - vis) + c.reset;
}
