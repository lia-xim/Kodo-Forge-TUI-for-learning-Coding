/**
 * Farbthemen fuer das TypeScript-Lernprojekt
 *
 * Drei Themes: dark, light, solarized
 * Alle Farben als ANSI-Escape-Sequenzen.
 *
 * Nutzung:
 *   import { getTheme, themes } from '../tools/themes.ts';
 *
 *   const t = getTheme("dark");
 *   console.log(t.primary + "Hallo Welt" + t.text);
 *
 * Keine externen Dependencies.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Theme {
  /** Primaerfarbe fuer Ueberschriften, wichtige Elemente */
  primary: string;
  /** Sekundaerfarbe fuer Akzente */
  secondary: string;
  /** Erfolg / richtige Antwort */
  success: string;
  /** Warnung / Hinweis */
  warning: string;
  /** Fehler / falsche Antwort */
  error: string;
  /** Gedaempft / Nebeninfo */
  muted: string;
  /** Normaler Text (Reset) */
  text: string;
  /** Header-Hintergrund */
  headerBg: string;
  /** Header-Vordergrund */
  headerFg: string;
  /** Linien, Raender */
  border: string;
  /** Hervorhebung im Text */
  highlight: string;
  /** Code-Darstellung */
  code: string;
}

// ─── ANSI Helpers ────────────────────────────────────────────────────────────

// Standard ANSI 16 Farben
const ansi = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
  // Vordergrund
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  // Helle Vordergrund-Farben
  brightBlack: "\x1b[90m",
  brightRed: "\x1b[91m",
  brightGreen: "\x1b[92m",
  brightYellow: "\x1b[93m",
  brightBlue: "\x1b[94m",
  brightMagenta: "\x1b[95m",
  brightCyan: "\x1b[96m",
  brightWhite: "\x1b[97m",
  // Hintergrund
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
} as const;

/**
 * 24-bit RGB-Vordergrundfarbe (True Color).
 * Erfordert ein Terminal das True Color unterstuetzt
 * (Windows Terminal, iTerm2, kitty, VS Code Terminal, etc.)
 */
function rgb(r: number, g: number, b: number): string {
  return "\x1b[38;2;" + r + ";" + g + ";" + b + "m";
}

/**
 * 24-bit RGB-Hintergrundfarbe (True Color).
 */
function rgbBg(r: number, g: number, b: number): string {
  return "\x1b[48;2;" + r + ";" + g + ";" + b + "m";
}

// ─── Themes ──────────────────────────────────────────────────────────────────

/**
 * Dark Theme — Cyan als Primaerfarbe, Gelb als Akzent
 *
 * Optimiert fuer dunkle Terminal-Hintergruende.
 * Nutzt Standard-ANSI-Farben fuer maximale Kompatibilitaet.
 */
const darkTheme: Theme = {
  primary: ansi.bold + ansi.cyan,
  secondary: ansi.yellow,
  success: ansi.bold + ansi.green,
  warning: ansi.yellow,
  error: ansi.bold + ansi.red,
  muted: ansi.dim,
  text: ansi.reset,
  headerBg: ansi.bgCyan + ansi.black,
  headerFg: ansi.bold + ansi.cyan,
  border: ansi.dim + ansi.cyan,
  highlight: ansi.bold + ansi.brightYellow,
  code: ansi.yellow,
};

/**
 * Light Theme — Blau als Primaerfarbe, Magenta als Akzent
 *
 * Optimiert fuer helle Terminal-Hintergruende.
 * Nutzt kraeftigere Farben die auf Weiss gut lesbar sind.
 */
const lightTheme: Theme = {
  primary: ansi.bold + ansi.blue,
  secondary: ansi.magenta,
  success: ansi.bold + ansi.green,
  warning: ansi.bold + ansi.yellow,
  error: ansi.bold + ansi.red,
  muted: ansi.dim,
  text: ansi.reset,
  headerBg: ansi.bgBlue + ansi.white,
  headerFg: ansi.bold + ansi.blue,
  border: ansi.blue,
  highlight: ansi.bold + ansi.magenta,
  code: ansi.magenta,
};

/**
 * Solarized Theme — Basiert auf Ethan Schoonover's Solarized Palette
 *
 * Nutzt 24-bit True Color RGB-Werte fuer praezise Farbwiedergabe.
 * Funktioniert am besten in Terminals mit True Color Unterstuetzung.
 *
 * Palette:
 *   base03  #002b36   base01  #586e75   yellow  #b58900
 *   base02  #073642   base00  #657b83   orange  #cb4b16
 *   base3   #fdf6e3   base0   #839496   red     #dc322f
 *   base2   #eee8d5   base1   #93a1a1   magenta #d33682
 *                                        violet  #6c71c4
 *                                        blue    #268bd2
 *                                        cyan    #2aa198
 *                                        green   #859900
 */
const solarizedTheme: Theme = {
  primary: ansi.bold + rgb(38, 139, 210),               // blue    #268bd2
  secondary: rgb(108, 113, 196),                          // violet  #6c71c4
  success: ansi.bold + rgb(133, 153, 0),                  // green   #859900
  warning: rgb(181, 137, 0),                               // yellow  #b58900
  error: ansi.bold + rgb(220, 50, 47),                     // red     #dc322f
  muted: rgb(88, 110, 117),                                // base01  #586e75
  text: ansi.reset,
  headerBg: rgbBg(7, 54, 66) + rgb(147, 161, 161),       // base02 bg, base1 fg
  headerFg: ansi.bold + rgb(38, 139, 210),                 // blue
  border: rgb(88, 110, 117),                                // base01
  highlight: ansi.bold + rgb(203, 75, 22),                  // orange  #cb4b16
  code: rgb(42, 161, 152),                                  // cyan    #2aa198
};

// ─── Theme Registry ──────────────────────────────────────────────────────────

/** Alle verfuegbaren Themes */
export const themes: Record<string, Theme> = {
  dark: darkTheme,
  light: lightTheme,
  solarized: solarizedTheme,
};

/**
 * Gibt ein Theme anhand des Namens zurueck.
 * Falls der Name unbekannt ist, wird das Dark-Theme als Fallback verwendet.
 *
 * @param name - Name des Themes ("dark", "light", "solarized")
 * @returns Das entsprechende Theme
 */
export function getTheme(name: string): Theme {
  const theme = themes[name];
  if (!theme) {
    console.warn(
      '\x1b[33mUnbekanntes Theme "' + name + '". ' +
        "Verfuegbar: " + Object.keys(themes).join(", ") + ". " +
        'Nutze "dark" als Fallback.\x1b[0m'
    );
    return themes.dark;
  }
  return theme;
}

/**
 * Gibt die Namen aller verfuegbaren Themes zurueck.
 */
export function getAvailableThemes(): string[] {
  return Object.keys(themes);
}

/**
 * Zeigt eine Vorschau aller Theme-Farben im Terminal.
 *
 * @param themeName - Name des Themes (oder "all" fuer alle)
 */
export function previewTheme(themeName: string): void {
  const toPreview =
    themeName === "all"
      ? Object.entries(themes)
      : [[themeName, getTheme(themeName)] as [string, Theme]];

  for (const [name, theme] of toPreview) {
    const line = "=".repeat(50);
    console.log("\n" + theme.border + line + theme.text);
    console.log(theme.headerFg + "  Theme: " + name + theme.text);
    console.log(theme.border + line + theme.text + "\n");

    console.log("  " + theme.primary + "primary" + theme.text + "     - Ueberschriften, Titel");
    console.log("  " + theme.secondary + "secondary" + theme.text + "   - Akzente, Zwischeninfos");
    console.log("  " + theme.success + "success" + theme.text + "     - Richtige Antworten");
    console.log("  " + theme.warning + "warning" + theme.text + "     - Warnungen, Hinweise");
    console.log("  " + theme.error + "error" + theme.text + "       - Fehler, falsche Antworten");
    console.log("  " + theme.muted + "muted" + theme.text + "       - Nebeninfos, gedaempft");
    console.log("  " + theme.highlight + "highlight" + theme.text + "   - Hervorhebungen");
    console.log("  " + theme.code + "code" + theme.text + "        - Code-Darstellung");
    console.log("  " + theme.border + "border" + theme.text + "      - Linien, Raender");
    console.log("  " + theme.headerBg + " header " + theme.text + "   - Header-Balken");
    console.log();
  }
}
