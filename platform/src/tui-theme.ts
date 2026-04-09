/**
 * tui-theme.ts — Design Token System for Kodo Forge TUI
 *
 * Single source of truth for ALL visual decisions.
 * Every color, border character, spacing value used anywhere in the TUI
 * MUST come from this module. No inline ANSI codes elsewhere.
 *
 * Palette: "Muted Retro" — warm amber accents, cool slate structure,
 * sage greens for success, soft blues for info. Designed for
 * long reading sessions with minimal eye strain.
 */

// ─── Raw ANSI Escape Codes (private) ──────────────────────────────────────

const RAW = {
  reset:     "\x1b[0m",
  bold:      "\x1b[1m",
  dim:       "\x1b[2m",
  italic:    "\x1b[3m",
  underline: "\x1b[4m",
  inverse:   "\x1b[7m",
  strikethrough: "\x1b[9m",

  // Standard 16 colors (fallback)
  red:       "\x1b[31m",
  green:     "\x1b[32m",
  yellow:    "\x1b[33m",
  blue:      "\x1b[34m",
  magenta:   "\x1b[35m",
  cyan:      "\x1b[36m",
  white:     "\x1b[37m",
  gray:      "\x1b[90m",

  // 256-color palette (our custom Muted Retro picks)
  amber:       "\x1b[38;5;214m",
  amberDim:    "\x1b[38;5;172m",
  slate:       "\x1b[38;5;66m",
  slateBright: "\x1b[38;5;109m",
  paleWhite:   "\x1b[38;5;253m",
  warmWhite:   "\x1b[38;5;230m",
  mutedBlue:   "\x1b[38;5;110m",
  mutedGreen:  "\x1b[38;5;108m",
  mutedRed:    "\x1b[38;5;167m",
  mutedMagenta:"\x1b[38;5;139m",
  charcoal:    "\x1b[38;5;238m",

  // Backgrounds
  bgSlate:     "\x1b[48;5;23m",
  bgAmber:     "\x1b[48;5;130m",
  bgDarkGray:  "\x1b[48;5;234m",
  bgCharcoal:  "\x1b[48;5;236m",
  bgMutedGreen:"\x1b[48;5;22m",
  bgMutedRed:  "\x1b[48;5;52m",
} as const;

// ─── Semantic Design Tokens ───────────────────────────────────────────────

export const theme = {
  // ─── Text (Foreground) ───
  fg: {
    primary:   RAW.paleWhite,   // Main readable text
    secondary: RAW.slate,       // Supporting text, metadata
    accent:    RAW.amber,       // Interactive highlights, selected items
    accentDim: RAW.amberDim,    // Dimmed accent (blink off-phase)
    muted:     RAW.dim,         // Disabled text, hints
    info:      RAW.mutedBlue,   // Informational labels, panel titles
    success:   RAW.mutedGreen,  // Completed items, correct answers
    warning:   RAW.amber,       // Warnings, due counts
    error:     RAW.mutedRed,    // Errors, wrong answers
    code:      RAW.mutedBlue,   // Code text in quizzes/sections
    heading:   RAW.amber,       // Section/panel headings
    link:      RAW.mutedBlue,   // Navigable references
  },

  // ─── Backgrounds ───
  bg: {
    base:    "",                // Terminal default (transparent)
    surface: RAW.bgSlate,      // Panels, header bar
    overlay: RAW.bgCharcoal,   // Dialog overlays
    accent:  RAW.bgAmber,      // Emphasis areas
    success: RAW.bgMutedGreen, // Flash on correct answer
    error:   RAW.bgMutedRed,   // Flash on wrong answer
  },

  // ─── Borders ───
  border: {
    default: RAW.slate,        // Normal box-drawing
    active:  RAW.amber,        // Active/focused element borders
    focus:   RAW.paleWhite,    // Strong focus indicator
    muted:   RAW.charcoal,     // Very subtle separators
    info:    RAW.mutedBlue,    // Info panel borders
    success: RAW.mutedGreen,   // Success state borders
    error:   RAW.mutedRed,     // Error state borders
  },

  // ─── Status Indicators ───
  status: {
    complete:   { icon: "✓", color: RAW.mutedGreen },
    inProgress: { icon: "▶", color: RAW.amber },
    locked:     { icon: "○", color: RAW.dim },
    notStarted: { icon: "○", color: RAW.slate },
    active:     { icon: "●", color: RAW.amber },
    error:      { icon: "✗", color: RAW.mutedRed },
  },

  // ─── Interactive Elements ───
  interactive: {
    marker:       RAW.amber,       // ▸ selection marker (on-phase)
    markerDim:    RAW.paleWhite,   // ▸ selection marker (off-phase for blink)
    highlight:    RAW.bold,        // Selected item text emphasis
    keyHint:      RAW.bold,        // [Key] shortcut hint
    keyHintPrimary: RAW.amber,     // Primary action key hint
    cursor:       RAW.amber,       // Blinking input cursor █
  },

  // ─── Text Modifiers ───
  mod: {
    reset:     RAW.reset,
    bold:      RAW.bold,
    dim:       RAW.dim,
    italic:    RAW.italic,
    underline: RAW.underline,
    inverse:   RAW.inverse,
  },

  // ─── Legacy Compat (for gradual migration) ───
  // These map old `c.xxx` references to theme tokens
  compat: {
    red:     RAW.red,
    green:   RAW.green,
    yellow:  RAW.yellow,
    blue:    RAW.blue,
    magenta: RAW.magenta,
    cyan:    RAW.cyan,
    white:   RAW.white,
    gray:    RAW.gray,
  },
} as const;

// ─── Box-Drawing Character Sets ───────────────────────────────────────────

export const box = {
  /** Standard single-line box drawing (default) */
  single: {
    topLeft:     "┌",
    topRight:    "┐",
    bottomLeft:  "└",
    bottomRight: "┘",
    horizontal:  "─",
    vertical:    "│",
    teeLeft:     "├",
    teeRight:    "┤",
    teeTop:      "┬",
    teeBottom:   "┴",
    cross:       "┼",
  },
  /** Rounded corners (modern look) */
  rounded: {
    topLeft:     "╭",
    topRight:    "╮",
    bottomLeft:  "╰",
    bottomRight: "╯",
    horizontal:  "─",
    vertical:    "│",
    teeLeft:     "├",
    teeRight:    "┤",
    teeTop:      "┬",
    teeBottom:   "┴",
    cross:       "┼",
  },
  /** Heavy/double for strong emphasis */
  heavy: {
    topLeft:     "╔",
    topRight:    "╗",
    bottomLeft:  "╚",
    bottomRight: "╝",
    horizontal:  "═",
    vertical:    "║",
    teeLeft:     "╠",
    teeRight:    "╣",
    teeTop:      "╦",
    teeBottom:   "╩",
    cross:       "╬",
  },
  /** Shadow characters for card depth */
  shadow: {
    bottom: "▄",
    right:  "▐",
    corner: "▗",
  },
  /** Accent border strip (left side of panels) */
  accent: {
    strip: "▐",
    dot:   "●",
  },
} as const;

// ─── Spacing Constants ────────────────────────────────────────────────────

export const spacing = {
  /** Indent levels */
  indent: {
    none: 0,
    sm:   1,
    md:   2,
    lg:   4,
  },
  /** Panel internal padding */
  padding: {
    sm: 1,
    md: 2,
  },
  /** Minimum column widths */
  minCol: {
    narrow:   20,
    standard: 28,
    wide:     40,
  },
} as const;

// ─── Spinner Frames ───────────────────────────────────────────────────────

export const spinnerFrames = {
  braille: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  dots:    ["⠁", "⠂", "⠄", "⡀", "⢀", "⠠", "⠐", "⠈"],
  line:    ["-", "\\", "|", "/"],
  star:    ["✶", "✸", "✹", "✺", "✹", "✸"],
} as const;

// ─── Progress Characters ─────────────────────────────────────────────────

export const progressChars = {
  filled:     "█",
  empty:      "░",
  /** 1/8-block fine resolution characters */
  fractional: ["", "▏", "▎", "▍", "▌", "▋", "▊", "▉"],
  track:      "─",
  thumb:      "█",
} as const;

// ─── Helper: Apply theme color to text ────────────────────────────────────

export function styled(text: string, ...codes: string[]): string {
  if (codes.length === 0) return text;
  return codes.join("") + text + RAW.reset;
}

// ─── Helper: Get blink-phase marker color ─────────────────────────────────

export function blinkColor(intervalMs: number = 600): string {
  const phase = Math.floor(Date.now() / intervalMs) % 2 === 0;
  return phase ? theme.interactive.marker : theme.interactive.markerDim;
}

// ─── Helper: Render a selection marker ────────────────────────────────────

export function marker(isSelected: boolean, blinkOn: boolean = true): string {
  if (!isSelected) return "  ";
  const color = blinkOn ? theme.interactive.marker : theme.interactive.markerDim;
  return `${color}${RAW.bold}▸${RAW.reset} `;
}
