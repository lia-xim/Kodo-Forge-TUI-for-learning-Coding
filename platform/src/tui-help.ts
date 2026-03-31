/**
 * tui-help.ts — Help Overlay
 */

import {
  c, padR, visLen, boxTop, boxBottom, boxSep, bLine, bEmpty,
  flushScreen, renderHeader,
} from "./tui-render.ts";
import {
  currentScreen, setCurrentScreen, updateTermSize, W, H,
  formatSessionTime, shortcutsForScreen,
} from "./tui-state.ts";
import type { ParsedKey, Screen } from "./tui-types.ts";
import { redraw } from "./tui-redraw.ts";

export function renderHelpOverlay(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as Extract<Screen, { type: "help" }>;
  const prevScreenType = screen.previousScreen.type;
  const w = W();
  const h = H();

  const timerStr = formatSessionTime();
  lines.push(renderHeader(` Tastenbelegung`, `\u23F1 ${timerStr} `));

  const boxW = Math.min(w, 62);
  const innerW = boxW - 2;
  const leftPad = Math.max(0, Math.floor((w - boxW) / 2));
  const padStr = " ".repeat(leftPad);

  lines.push(`${padStr}${boxTop(boxW)}`);
  lines.push(`${padStr}${bEmpty(boxW)}`);

  const shortcuts = shortcutsForScreen[prevScreenType] ?? shortcutsForScreen["main"]!;

  const navKeys = shortcuts.filter(s =>
    ["\u2191 / \u2193", "Enter / \u2192", "Esc / \u2190", "\u2192", "\u2190", "Space / PgDn", "PgUp",
     "Home / End", "\u2191 / \u2193", "\u2190 / \u2192", "Enter"].some(k => s.key.includes(k) || s.key === k)
    && !s.desc.includes("Beenden") && !s.desc.includes("Hilfe") && !s.desc.includes("Tastenbelegung")
  );
  const globalKeys = shortcuts.filter(s => s.desc.includes("Beenden") || s.desc.includes("Hilfe") || s.desc.includes("Tastenbelegung"));
  const actionKeys = shortcuts.filter(s => !navKeys.includes(s) && !globalKeys.includes(s));

  const renderGroup = (title: string, items: { key: string; desc: string }[]): void => {
    if (items.length === 0) return;
    lines.push(`${padStr}${bLine(`  ${c.bold}${c.cyan}${title}${c.reset}`, boxW)}`);
    lines.push(`${padStr}${bLine(`  ${c.dim}${"─".repeat(Math.min(innerW - 4, title.length + 10))}${c.reset}`, boxW)}`);
    for (const s of items) {
      const keyPad = 14;
      const keyStr = padR(`  ${c.bold}${s.key}${c.reset}`, keyPad + 9);
      lines.push(`${padStr}${bLine(`${keyStr}${s.desc}`, boxW)}`);
    }
    lines.push(`${padStr}${bEmpty(boxW)}`);
  };

  renderGroup("Navigation", navKeys);
  renderGroup(`Aktionen (${prevScreenType === "main" ? "Hauptmenue" : prevScreenType === "lesson" ? "Lektionsmenue" : prevScreenType})`, actionKeys);
  renderGroup("Global", globalKeys);

  lines.push(`${padStr}${boxSep(boxW)}`);
  lines.push(`${padStr}${bLine(`  ${c.dim}Druecke eine beliebige Taste um zurueckzukehren${c.reset}`, boxW)}`);
  lines.push(`${padStr}${boxBottom(boxW)}`);

  while (lines.length < h) { lines.push(""); }
  flushScreen(lines);
}

export function handleHelpInput(_key: ParsedKey): void {
  const screen = currentScreen as Extract<Screen, { type: "help" }>;
  setCurrentScreen(screen.previousScreen);
  redraw();
}
