/**
 * Visuelle Hilfsfunktionen fuer das Terminal
 *
 * Stellt erweiterte Unicode-basierte Visualisierungen bereit:
 * Sparklines, Fortschrittsbalken mit 1/8-Block-Genauigkeit,
 * Braille-Diagramme, farbige Boxen und Trennlinien.
 *
 * Keine externen Dependencies — nur ANSI Escape Codes und Unicode.
 */

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
};

/** Farbname zu ANSI-Code Mapping */
const COLOR_MAP: Record<string, string> = {
  red: c.red,
  green: c.green,
  yellow: c.yellow,
  blue: c.blue,
  magenta: c.magenta,
  cyan: c.cyan,
  white: c.white,
  gray: c.gray,
  dim: c.dim,
};

function colorCode(color?: string): string {
  if (!color) return "";
  return COLOR_MAP[color] ?? "";
}

// ─── ANSI-Hilfsfunktionen ──────────────────────────────────────────────────

/** Entfernt ANSI-Escape-Codes aus einem String */
export function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}

// ─── Sparkline ─────────────────────────────────────────────────────────────

/**
 * Erzeugt eine Sparkline aus numerischen Werten.
 *
 * Nutzt die Unicode-Blockzeichen ▁▂▃▄▅▆▇█ fuer 8 Abstufungen.
 *
 * @param values - Array von Zahlenwerten
 * @returns Sparkline-String (ein Zeichen pro Wert)
 *
 * @example
 * sparkline([1, 3, 5, 8, 12, 15, 12, 8])
 * // => "▁▂▃▅▇█▇▅"
 */
export function sparkline(values: number[]): string {
  if (values.length === 0) return "";

  const blocks = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  if (range === 0) {
    // Alle Werte gleich — mittlere Hoehe
    return values.map(() => blocks[3]).join("");
  }

  return values
    .map((v) => {
      const normalized = (v - min) / range;
      const idx = Math.min(7, Math.floor(normalized * 8));
      return blocks[idx];
    })
    .join("");
}

/**
 * Erzeugt eine farbige Sparkline mit ANSI-Farben.
 * Niedrige Werte sind dim, mittlere gelb, hohe gruen.
 *
 * @param values - Array von Zahlenwerten
 * @returns Farbige Sparkline mit ANSI-Codes
 */
export function colorSparkline(values: number[]): string {
  if (values.length === 0) return "";

  const blocks = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  return values
    .map((v) => {
      const normalized = range === 0 ? 0.5 : (v - min) / range;
      const idx = Math.min(7, Math.floor(normalized * 8));
      let color: string;
      if (normalized < 0.33) {
        color = c.dim;
      } else if (normalized < 0.66) {
        color = c.yellow;
      } else {
        color = c.green;
      }
      return `${color}${blocks[idx]}${c.reset}`;
    })
    .join("");
}

// ─── Fortschrittsbalken ────────────────────────────────────────────────────

/**
 * Erzeugt einen Fortschrittsbalken mit 1/8-Block-Genauigkeit.
 *
 * Nutzt die Unicode-Blockzeichen fuer feine Aufloesung:
 * ░ (leer), ▏▎▍▌▋▊▉█ (1/8 bis 8/8)
 *
 * @param percent - Fortschritt in Prozent (0-100)
 * @param width - Breite des Balkens in Zeichen
 * @param color - Optionale Farbe (red, green, yellow, blue, magenta, cyan)
 * @returns Formatierter Fortschrittsbalken mit ANSI-Codes
 *
 * @example
 * progressBar(73, 20)
 * // => "██████████████▌░░░░░░"
 */
export function progressBar(
  percent: number,
  width: number,
  color?: string
): string {
  const clamped = Math.max(0, Math.min(100, percent));
  const fractionalBlocks = ["", "▏", "▎", "▍", "▌", "▋", "▊", "▉"];
  const emptyChar = "░";
  const fullChar = "█";

  const totalEighths = Math.round((clamped / 100) * width * 8);
  const fullBlocks = Math.floor(totalEighths / 8);
  const remainder = totalEighths % 8;

  const emptyBlocks = Math.max(0, width - fullBlocks - (remainder > 0 ? 1 : 0));

  let bar = fullChar.repeat(fullBlocks);
  if (remainder > 0) {
    bar += fractionalBlocks[remainder];
  }
  bar += emptyChar.repeat(emptyBlocks);

  // Sicherheitscheck: auf exakte Breite trimmen
  // (jedes Zeichen ist 1 Spalte breit bei Monospace-Schrift)
  const visibleLen = [...bar].length;
  if (visibleLen > width) {
    bar = [...bar].slice(0, width).join("");
  } else if (visibleLen < width) {
    bar += emptyChar.repeat(width - visibleLen);
  }

  // Farbe anwenden
  const autoColor =
    clamped >= 100
      ? c.green
      : clamped >= 60
        ? c.yellow
        : clamped > 0
          ? c.cyan
          : c.dim;
  const finalColor = color ? colorCode(color) || autoColor : autoColor;

  return `${finalColor}${bar}${c.reset}`;
}

// ─── Half-Block Pixel-Art Rendering ────────────────────────────────────────

/**
 * Rendert ein Pixel-Raster als Half-Block-Art im Terminal.
 *
 * Nutzt das Zeichen ▀ (Upper Half Block) mit Foreground/Background-Farbe
 * um 2 Zeilen pro Textzeile darzustellen (doppelte vertikale Aufloesung).
 *
 * @param pixels - 2D-Array von [R, G, B]-Farbwerten (0-255)
 * @returns Array von Terminal-Zeilen mit ANSI 24-bit Farbcodes
 */
export function renderPixelArt(pixels: [number, number, number][][]): string {
  if (pixels.length === 0) return "";

  const lines: string[] = [];

  // Jeweils 2 Pixel-Zeilen zu einer Terminal-Zeile zusammenfassen
  for (let y = 0; y < pixels.length; y += 2) {
    let line = "";
    const topRow = pixels[y];
    const bottomRow = y + 1 < pixels.length ? pixels[y + 1] : null;
    const width = topRow?.length ?? 0;

    for (let x = 0; x < width; x++) {
      const top = topRow[x] ?? [0, 0, 0];
      const bottom = bottomRow?.[x] ?? [0, 0, 0];

      // ▀ = obere Haelfte ist Foreground, untere Haelfte ist Background
      const fg = `\x1b[38;2;${top[0]};${top[1]};${top[2]}m`;
      const bg = bottomRow
        ? `\x1b[48;2;${bottom[0]};${bottom[1]};${bottom[2]}m`
        : "";
      line += `${fg}${bg}▀${c.reset}`;
    }

    lines.push(line);
  }

  return lines.join("\n");
}

// ─── Braille-Punkt-Diagramm ───────────────────────────────────────────────

/**
 * Erzeugt ein Braille-Punkt-Diagramm aus Werten.
 *
 * Braille-Zeichen (U+2800-U+28FF) haben ein 2x4 Punkte-Raster,
 * was sehr kompakte Diagramme erlaubt.
 *
 * @param values - Array von Zahlenwerten
 * @param width - Breite in Zeichen (jedes Zeichen = 2 Datenpunkte)
 * @param height - Hoehe in Zeilen (jede Zeile = 4 Pixel-Reihen)
 * @returns Array von gerenderten Zeilen
 */
export function brailleChart(
  values: number[],
  width: number,
  height: number
): string[] {
  if (values.length === 0) return [];

  // Braille-Zeichen Dot-Mapping:
  // Dot 1 (0x01) = oben-links     Dot 4 (0x08) = oben-rechts
  // Dot 2 (0x02) = mitte-links    Dot 5 (0x10) = mitte-rechts
  // Dot 3 (0x04) = unten-links    Dot 6 (0x20) = unten-rechts
  // Dot 7 (0x40) = ganz-unten-links  Dot 8 (0x80) = ganz-unten-rechts
  const BRAILLE_BASE = 0x2800;
  const DOT_MAP = [
    [0x01, 0x08], // Zeile 0: Dot 1 (links), Dot 4 (rechts)
    [0x02, 0x10], // Zeile 1: Dot 2 (links), Dot 5 (rechts)
    [0x04, 0x20], // Zeile 2: Dot 3 (links), Dot 6 (rechts)
    [0x40, 0x80], // Zeile 3: Dot 7 (links), Dot 8 (rechts)
  ];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const totalPixelH = height * 4; // 4 Dot-Reihen pro Zeile

  // Werte auf Pixel-Koordinaten normalisieren
  const normalizedValues = values.map((v) => {
    return Math.round(((v - min) / range) * (totalPixelH - 1));
  });

  // Raster initialisieren: [Zeile][Spalte] = Braille-Wert
  const grid: number[][] = [];
  for (let row = 0; row < height; row++) {
    grid.push(new Array(width).fill(0));
  }

  // Datenpunkte ins Raster eintragen
  for (let i = 0; i < normalizedValues.length && Math.floor(i / 2) < width; i++) {
    const pixelY = totalPixelH - 1 - normalizedValues[i]; // Y invertieren (0 = oben)
    const charCol = Math.floor(i / 2);
    const dotCol = i % 2; // 0 = links, 1 = rechts
    const charRow = Math.floor(pixelY / 4);
    const dotRow = pixelY % 4;

    if (charRow >= 0 && charRow < height && charCol >= 0 && charCol < width) {
      grid[charRow][charCol] |= DOT_MAP[dotRow][dotCol];
    }
  }

  // Grid zu Braille-Strings konvertieren
  const lines: string[] = [];
  for (let row = 0; row < height; row++) {
    let line = "";
    for (let col = 0; col < width; col++) {
      line += String.fromCharCode(BRAILLE_BASE + grid[row][col]);
    }
    lines.push(`${c.cyan}${line}${c.reset}`);
  }

  return lines;
}

// ─── Farbige Box mit Titel ─────────────────────────────────────────────────

/**
 * Erzeugt eine farbige Box mit Titel und Inhalt.
 *
 * @param title - Titel der Box (wird oben zentriert angezeigt)
 * @param content - Array von Inhaltszeilen
 * @param width - Gesamtbreite der Box
 * @param color - Farbe der Box-Raender (red, green, yellow, blue, magenta, cyan)
 * @returns Array von gerenderten Zeilen mit ANSI-Codes
 */
export function colorBox(
  title: string,
  content: string[],
  width: number,
  color: string
): string[] {
  const cc = colorCode(color) || c.cyan;
  const innerW = Math.max(4, width - 2);
  const lines: string[] = [];

  // Obere Linie mit Titel
  const titleVis = stripAnsi(title);
  if (titleVis.length > 0) {
    const titlePad = Math.max(0, innerW - titleVis.length - 4);
    const leftDash = Math.floor(titlePad / 2);
    const rightDash = titlePad - leftDash;
    lines.push(
      `${cc}┌─${"─".repeat(leftDash)} ${c.bold}${title}${c.reset}${cc} ${"─".repeat(rightDash)}─┐${c.reset}`
    );
  } else {
    lines.push(`${cc}┌${"─".repeat(innerW)}┐${c.reset}`);
  }

  // Inhalt
  for (const line of content) {
    const vis = stripAnsi(line).length;
    const pad = Math.max(0, innerW - vis - 1);
    lines.push(`${cc}│${c.reset} ${line}${" ".repeat(pad)}${cc}│${c.reset}`);
  }

  // Untere Linie
  lines.push(`${cc}└${"─".repeat(innerW)}┘${c.reset}`);

  return lines;
}

// ─── Trennlinie mit Titel ──────────────────────────────────────────────────

/**
 * Erzeugt eine dekorative Trennlinie mit zentriertem Titel.
 *
 * @param title - Text der in der Trennlinie angezeigt wird
 * @param width - Gesamtbreite der Linie
 * @returns Formatierte Trennlinie mit ANSI-Codes
 *
 * @example
 * sectionDivider("Statistiken", 40)
 * // => "──────── Statistiken ────────"
 */
export function sectionDivider(title: string, width: number): string {
  const titleVis = stripAnsi(title);
  if (titleVis.length === 0) {
    return `${c.dim}${"─".repeat(width)}${c.reset}`;
  }

  const remaining = Math.max(0, width - titleVis.length - 2);
  const left = Math.floor(remaining / 2);
  const right = remaining - left;

  return `${c.dim}${"─".repeat(left)}${c.reset} ${c.bold}${c.cyan}${title}${c.reset} ${c.dim}${"─".repeat(right)}${c.reset}`;
}

// ─── Horizontale Balkendiagramme ───────────────────────────────────────────

/**
 * Erzeugt ein einfaches horizontales Balkendiagramm.
 *
 * @param items - Array von {label, value} Objekten
 * @param width - Verfuegbare Breite
 * @param color - Farbe der Balken
 * @returns Array von gerenderten Zeilen
 */
export function horizontalBarChart(
  items: { label: string; value: number }[],
  width: number,
  color?: string
): string[] {
  if (items.length === 0) return [];

  const maxLabel = Math.max(...items.map((i) => stripAnsi(i.label).length));
  const maxValue = Math.max(...items.map((i) => i.value));
  const barMaxWidth = Math.max(4, width - maxLabel - 8);
  const lines: string[] = [];

  for (const item of items) {
    const labelPad = " ".repeat(Math.max(0, maxLabel - stripAnsi(item.label).length));
    const pct = maxValue > 0 ? item.value / maxValue : 0;
    const barWidth = Math.round(pct * barMaxWidth);
    const bar = progressBar((item.value / maxValue) * 100, barMaxWidth, color);
    const valueStr = `${c.bold}${item.value}${c.reset}`;
    lines.push(`  ${item.label}${labelPad} ${bar} ${valueStr}`);
  }

  return lines;
}

// ─── Mini-Tabelle ──────────────────────────────────────────────────────────

/**
 * Erzeugt eine kompakte Statistik-Anzeige mit Label/Wert-Paaren.
 *
 * @param items - Array von [Label, Wert]-Paaren
 * @param separator - Trennzeichen zwischen Label und Wert
 * @returns Array von formatierten Zeilen
 */
export function statsDisplay(
  items: [string, string][],
  separator: string = "·"
): string[] {
  const maxLabel = Math.max(...items.map(([l]) => stripAnsi(l).length));
  return items.map(([label, value]) => {
    const pad = " ".repeat(Math.max(0, maxLabel - stripAnsi(label).length));
    return `  ${c.dim}${label}${pad} ${separator}${c.reset} ${value}`;
  });
}
