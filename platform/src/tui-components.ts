/**
 * tui-components.ts — Reusable UI Primitives for Kodo Forge TUI
 *
 * Professional building blocks that replace inline box-drawing
 * and ad-hoc styling throughout all screens.
 *
 * Every component uses tokens from tui-theme.ts — no raw ANSI codes.
 */

import { theme, box, spacing, styled, marker as themeMarker, blinkColor, progressChars } from "./tui-theme.ts";
import { stripAnsi } from "./markdown-renderer.ts";
import { W } from "./tui-state.ts";
import { getBlinkPhase } from "./tui-animation.ts";

// ─── Private Helpers ──────────────────────────────────────────────────────

function visLen(str: string): number {
  return stripAnsi(str).length;
}

function padRight(str: string, width: number): string {
  const vis = visLen(str);
  const pad = Math.max(0, width - vis);
  return str + " ".repeat(pad);
}

function truncStr(str: string, maxLen: number): string {
  const stripped = stripAnsi(str);
  if (stripped.length <= maxLen) return str;
  return stripped.slice(0, maxLen - 1) + "…";
}

// ─── Panel ────────────────────────────────────────────────────────────────
//
// A titled box with optional left accent border strip.
// The primary layout container for all screens.
//
//  ▐ ── Title ─────────────────────┐
//  ▐  Content line 1               │
//  ▐  Content line 2               │
//  └───────────────────────────────┘

export interface PanelOptions {
  width?: number;
  variant?: "default" | "info" | "success" | "warning" | "error" | "accent";
  accentBorder?: boolean;  // Show left ▐ strip (default: true)
  boxStyle?: "single" | "rounded" | "heavy";
  padding?: number;        // Internal left padding (default: 1)
}

export function renderPanel(
  title: string,
  content: string[],
  opts: PanelOptions = {}
): string[] {
  const w = opts.width ?? W();
  const variant = opts.variant ?? "default";
  const showAccent = opts.accentBorder !== false;
  const b = box[opts.boxStyle ?? "single"];
  const pad = opts.padding ?? 1;

  const borderColor = variant === "info"    ? theme.border.info
                    : variant === "success" ? theme.border.success
                    : variant === "error"   ? theme.border.error
                    : variant === "accent"  ? theme.border.active
                    : theme.border.default;

  const titleColor = variant === "info"    ? theme.fg.info
                   : variant === "success" ? theme.fg.success
                   : variant === "error"   ? theme.fg.error
                   : variant === "accent"  ? theme.fg.accent
                   : theme.fg.heading;

  const accentColor = variant === "info"    ? theme.fg.info
                    : variant === "success" ? theme.fg.success
                    : variant === "error"   ? theme.fg.error
                    : theme.fg.accent;

  const accentChar = showAccent ? `${accentColor}${box.accent.strip}${theme.mod.reset}` : "";
  const accentW = showAccent ? 1 : 0;
  const innerW = w - 2 - accentW;
  const padStr = " ".repeat(pad);

  const lines: string[] = [];

  // Top border with title
  if (title) {
    const titleVis = visLen(title);
    const dashesAfter = Math.max(0, innerW - titleVis - 4);
    lines.push(
      `${accentChar}${borderColor}${b.topLeft}${b.horizontal}${b.horizontal} ` +
      `${titleColor}${theme.mod.bold}${title}${theme.mod.reset} ` +
      `${borderColor}${b.horizontal.repeat(dashesAfter)}${b.topRight}${theme.mod.reset}`
    );
  } else {
    lines.push(
      `${accentChar}${borderColor}${b.topLeft}${b.horizontal.repeat(innerW)}${b.topRight}${theme.mod.reset}`
    );
  }

  // Content
  for (const line of content) {
    const vis = visLen(line);
    const contentPad = Math.max(0, innerW - vis - pad * 2);
    lines.push(
      `${accentChar}${borderColor}${b.vertical}${theme.mod.reset}` +
      `${padStr}${line}${" ".repeat(contentPad)}${padStr.slice(0, Math.max(0, pad - 1))}` +
      `${borderColor}${b.vertical}${theme.mod.reset}`
    );
  }

  // Bottom border
  lines.push(
    `${showAccent ? " " : ""}${borderColor}${b.bottomLeft}${b.horizontal.repeat(innerW)}${b.bottomRight}${theme.mod.reset}`
  );

  return lines;
}

// ─── Card ─────────────────────────────────────────────────────────────────
//
// An elevated Panel with unicode shadow for depth effect.
//
//  ╭── Title ──────────────╮
//  │  Content              │
//  ╰───────────────────────╯▄
//                           ▐

export interface CardOptions extends PanelOptions {
  shadow?: boolean;  // Show shadow (default: true for wide terminals)
}

export function renderCard(
  title: string,
  content: string[],
  opts: CardOptions = {}
): string[] {
  const showShadow = opts.shadow !== false && W() >= 90;
  const cardLines = renderPanel(title, content, {
    ...opts,
    boxStyle: opts.boxStyle ?? "rounded",
    accentBorder: opts.accentBorder ?? false,
  });

  if (!showShadow) return cardLines;

  // Add shadow characters on right and bottom
  const shadowColor = theme.border.muted;
  const result: string[] = [];
  for (let i = 0; i < cardLines.length; i++) {
    if (i === 0) {
      result.push(cardLines[i]);
    } else {
      result.push(`${cardLines[i]}${shadowColor}${box.shadow.right}${theme.mod.reset}`);
    }
  }
  // Bottom shadow line
  const bottomWidth = visLen(cardLines[0]);
  result.push(` ${shadowColor}${box.shadow.bottom.repeat(bottomWidth)}${theme.mod.reset}`);

  return result;
}

// ─── Badge ────────────────────────────────────────────────────────────────
//
// Inline status label: [ACTIVE] [LOCKED] [NEW] [DONE]

export type BadgeVariant = "active" | "locked" | "new" | "done" | "error" | "info";

export function renderBadge(text: string, variant: BadgeVariant): string {
  const styles: Record<BadgeVariant, string> = {
    active: `\x1b[48;5;94m${theme.fg.primary}${theme.mod.bold}`,
    locked: `\x1b[48;5;236m${theme.fg.muted}`,
    new:    `\x1b[48;5;23m${theme.fg.info}${theme.mod.bold}`,
    done:   `\x1b[48;5;22m${theme.fg.success}${theme.mod.bold}`,
    error:  `\x1b[48;5;52m${theme.fg.error}${theme.mod.bold}`,
    info:   `\x1b[48;5;23m${theme.fg.info}`,
  };
  return `${styles[variant]} ${text} ${theme.mod.reset}`;
}

// ─── Mode Pill ────────────────────────────────────────────────────────────────
//
// Helix-style mode indicator: " READING " " QUIZ " " REVIEW "
// Used in the header bar to show current screen context.

export type ModePillType = "reading" | "quiz" | "review" | "menu" | "search" | "pretest";

export function modePill(mode: ModePillType): string {
  const pills: Record<ModePillType, string> = {
    reading:  `\x1b[48;5;23m${theme.fg.primary}${theme.mod.bold} READING ${theme.mod.reset}`,
    quiz:     `\x1b[48;5;94m${theme.fg.primary}${theme.mod.bold} QUIZ ${theme.mod.reset}`,
    review:   `\x1b[48;5;22m${theme.fg.success}${theme.mod.bold} REVIEW ${theme.mod.reset}`,
    menu:     `\x1b[48;5;236m${theme.fg.secondary} MENU ${theme.mod.reset}`,
    search:   `\x1b[48;5;23m${theme.fg.info}${theme.mod.bold} SEARCH ${theme.mod.reset}`,
    pretest:  `\x1b[48;5;52m${theme.fg.primary}${theme.mod.bold} PRETEST ${theme.mod.reset}`,
  };
  return pills[mode];
}

// ─── MenuList ─────────────────────────────────────────────────────────────
//
// Selectable list with animated blinking marker.
// Replaces all manual ▸ marker logic across 5+ files.

export interface MenuItem {
  label: string;
  detail?: string;       // Right-aligned detail text
  statusIcon?: string;   // Left icon (✓, ▶, ○)
  disabled?: boolean;
}

export function renderMenuList(
  items: MenuItem[],
  selectedIndex: number,
  width: number,
  opts: { numbered?: boolean; startNum?: number } = {}
): string[] {
  const lines: string[] = [];
  const startNum = opts.startNum ?? 1;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const isSelected = i === selectedIndex;
    const mrkr = themeMarker(isSelected, getBlinkPhase());

    const numStr = opts.numbered
      ? `${isSelected ? theme.mod.bold : ""}${startNum + i}${theme.mod.reset}  `
      : "";

    const icon = item.statusIcon ? `${item.statusIcon} ` : "";
    const label = item.disabled
      ? `${theme.fg.muted}${item.label}${theme.mod.reset}`
      : isSelected
        ? `${theme.mod.bold}${item.label}${theme.mod.reset}`
        : item.label;

    const mainText = `${mrkr}${icon}${numStr}${label}`;
    const mainVis = visLen(mainText);

    if (item.detail) {
      const detailVis = visLen(item.detail);
      const gap = Math.max(1, width - mainVis - detailVis);
      lines.push(`${mainText}${" ".repeat(gap)}${item.detail}`);
    } else {
      lines.push(padRight(mainText, width));
    }
  }

  return lines;
}

// ─── KeyHint ──────────────────────────────────────────────────────────────
//
// Single shortcut hint with primary/secondary styling.
// Primary: amber key, normal label. Secondary: dim key, dim label.

export function keyHint(key: string, label: string, primary: boolean = false): string {
  if (primary) {
    return `${theme.interactive.keyHintPrimary}${theme.mod.bold}[${key}]${theme.mod.reset} ${label}`;
  }
  return `${theme.mod.bold}[${key}]${theme.mod.reset} ${theme.fg.muted}${label}${theme.mod.reset}`;
}

// ─── FooterBar ────────────────────────────────────────────────────────────
//
// Professional grouped footer with separator pipe and primary action highlight.

export interface FooterHint {
  key: string;
  label: string;
  primary?: boolean;
}

export function renderFooterBar(hints: FooterHint[], width?: number): string[] {
  const w = width ?? W();
  const b = box.single;

  // Separator line
  const sepLine = `${theme.border.default}${b.teeLeft}${b.horizontal.repeat(Math.max(0, w - 2))}${b.teeRight}${theme.mod.reset}`;

  // Hint line
  const hintParts = hints.map(h => keyHint(h.key, h.label, h.primary));
  const hintText = " " + hintParts.join("  ");
  const hintVis = visLen(hintText);
  const hintPad = Math.max(0, w - 2 - hintVis);
  const hintLine = `${theme.border.default}${b.vertical}${theme.mod.reset}${hintText}${" ".repeat(hintPad)}${theme.border.default}${b.vertical}${theme.mod.reset}`;

  // Bottom line
  const bottomLine = `${theme.border.default}${b.bottomLeft}${b.horizontal.repeat(Math.max(0, w - 2))}${b.bottomRight}${theme.mod.reset}`;

  return [sepLine, hintLine, bottomLine];
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────
//
// Styled navigation path: Kodo Forge › TypeScript › L04 › S2

export function renderBreadcrumb(segments: string[]): string {
  const separator = ` ${theme.fg.secondary}›${theme.mod.reset} `;
  return segments
    .map((seg, i) =>
      i === segments.length - 1
        ? `${theme.mod.bold}${seg}${theme.mod.reset}`
        : `${theme.fg.secondary}${seg}${theme.mod.reset}`
    )
    .join(separator);
}

// ─── Divider ──────────────────────────────────────────────────────────────
//
// Themed section divider with optional centered title.

export function renderDivider(width: number, title?: string): string {
  if (!title) {
    return `${theme.border.default}${box.single.horizontal.repeat(width)}${theme.mod.reset}`;
  }
  const titleVis = visLen(title);
  const remaining = Math.max(0, width - titleVis - 2);
  const left = Math.floor(remaining / 2);
  const right = remaining - left;
  return (
    `${theme.border.default}${box.single.horizontal.repeat(left)}${theme.mod.reset}` +
    ` ${theme.fg.heading}${theme.mod.bold}${title}${theme.mod.reset} ` +
    `${theme.border.default}${box.single.horizontal.repeat(right)}${theme.mod.reset}`
  );
}

// ─── StatusIcon ───────────────────────────────────────────────────────────
//
// Rendered status indicator using theme tokens.

export function statusIcon(status: "complete" | "inProgress" | "notStarted" | "locked"): string {
  const s = theme.status[status];
  return `${s.color}${s.icon}${theme.mod.reset}`;
}

// ─── HeaderBar ────────────────────────────────────────────────────────────
//
// Top bar with background color, left text, right text.

export function renderHeaderBar(left: string, right: string, width?: number): string {
  const w = width ?? W();
  const totalInner = w - 2;
  const leftVis = visLen(left);
  const rightVis = visLen(right);
  const middlePad = Math.max(1, totalInner - leftVis - rightVis);
  const inner = `${left}${" ".repeat(middlePad)}${right}`;
  return `${theme.bg.surface}${theme.fg.primary}${theme.mod.bold} ${padRight(inner, w - 2)}${theme.mod.reset}`;
}

// ─── ThemedProgressBar ────────────────────────────────────────────────────
//
// Progress bar using theme tokens.

export function themedProgress(
  percent: number,
  width: number,
  opts: { variant?: "default" | "success" | "warning" } = {}
): string {
  const pct = Math.max(0, Math.min(100, percent));
  const filled = Math.round((pct / 100) * width);
  const empty = width - filled;

  const fillColor = pct >= 100 ? theme.fg.success
                  : pct > 0   ? theme.fg.accent
                  :              theme.fg.secondary;

  return (
    `${fillColor}${"█".repeat(filled)}${theme.mod.reset}` +
    `${theme.fg.secondary}${"░".repeat(empty)}${theme.mod.reset}`
  );
}

/**
 * High-resolution progress bar using 1/8-block characters.
 * Gives 8× the resolution of a normal block progress bar.
 */
export function smoothProgress(percent: number, width: number): string {
  const pct = Math.max(0, Math.min(100, percent));
  const totalEighths = Math.round((pct / 100) * width * 8);
  const full = Math.floor(totalEighths / 8);
  const partial = totalEighths % 8;
  const empty = Math.max(0, width - full - (partial > 0 ? 1 : 0));

  const fillColor = pct >= 100 ? theme.fg.success
                  : pct >   0 ? theme.fg.accent
                  :              theme.fg.secondary;

  let result = `${fillColor}${"█".repeat(full)}`;
  if (partial > 0) result += progressChars.fractional[partial];
  result += `${theme.fg.secondary}${"░".repeat(empty)}${theme.mod.reset}`;
  return result;
}

export function themedPctStr(pct: number): string {
  const color = pct >= 100 ? theme.fg.success : pct > 0 ? theme.fg.accent : theme.fg.secondary;
  return `${color}${String(pct).padStart(3)}%${theme.mod.reset}`;
}

// ─── Empty Line / Box Helpers using theme ─────────────────────────────────

export function themedBoxLine(content: string, width: number): string {
  const innerWidth = width - 2;
  const vis = visLen(content);
  const pad = Math.max(0, innerWidth - vis);
  return `${theme.border.default}${box.single.vertical}${theme.mod.reset}${content}${" ".repeat(pad)}${theme.border.default}${box.single.vertical}${theme.mod.reset}`;
}

export function themedBoxEmpty(width: number): string {
  return `${theme.border.default}${box.single.vertical}${theme.mod.reset}${" ".repeat(width - 2)}${theme.border.default}${box.single.vertical}${theme.mod.reset}`;
}

export function themedBoxTop(width: number): string {
  return `${theme.border.default}${box.single.topLeft}${box.single.horizontal.repeat(Math.max(0, width - 2))}${box.single.topRight}${theme.mod.reset}`;
}

export function themedBoxBottom(width: number): string {
  return `${theme.border.default}${box.single.bottomLeft}${box.single.horizontal.repeat(Math.max(0, width - 2))}${box.single.bottomRight}${theme.mod.reset}`;
}

export function themedBoxSep(width: number): string {
  return `${theme.border.default}${box.single.teeLeft}${box.single.horizontal.repeat(Math.max(0, width - 2))}${box.single.teeRight}${theme.mod.reset}`;
}
