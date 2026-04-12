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
import { theme } from "./tui-theme.ts";
import { renderHeaderBar } from "./tui-components.ts";
import { t } from "./i18n.ts";

export function renderHelpOverlay(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as Extract<Screen, { type: "help" }>;
  const prevScreenType = screen.previousScreen.type;
  const w = W();
  const h = H();

  const th = theme;
  const timerStr = formatSessionTime();
  lines.push(renderHeaderBar(` ${t("help.title")}`, `\u23F1 ${timerStr} `, w));

  const boxW = Math.min(w, 62);
  const innerW = boxW - 2;
  const leftPad = Math.max(0, Math.floor((w - boxW) / 2));
  const padStr = " ".repeat(leftPad);

  lines.push(`${padStr}${boxTop(boxW)}`);
  lines.push(`${padStr}${bEmpty(boxW)}`);

  const shortcuts = shortcutsForScreen[prevScreenType] ?? shortcutsForScreen["main"]!;

  const navKeyPatterns = ["\u2191 / \u2193", "Enter / \u2192", "Esc / \u2190", "\u2192", "\u2190", "Space / PgDn", "PgUp",
     "Home / End", "\u2190 / \u2192", "Enter"];
  const globalKeyPatterns = ["Q", "Ctrl+C", "?/F1", "F1"];
  const navKeys = shortcuts.filter(s =>
    navKeyPatterns.some(k => s.key.includes(k) || s.key === k)
    && !globalKeyPatterns.some(k => s.key === k)
  );
  const globalKeys = shortcuts.filter(s => globalKeyPatterns.some(k => s.key === k));
  const actionKeys = shortcuts.filter(s => !navKeys.includes(s) && !globalKeys.includes(s));

  const renderGroup = (title: string, items: { key: string; desc: string }[]): void => {
    if (items.length === 0) return;
    lines.push(`${padStr}${bLine(`  ${th.mod.bold}${th.fg.info}${title}${th.mod.reset}`, boxW)}`);
    lines.push(`${padStr}${bLine(`  ${th.border.default}${"─".repeat(Math.min(innerW - 4, title.length + 10))}${th.mod.reset}`, boxW)}`);
    for (const s of items) {
      const keyPad = 14;
      const keyStr = padR(`  ${th.mod.bold}${s.key}${th.mod.reset}`, keyPad + 9);
      lines.push(`${padStr}${bLine(`${keyStr}${s.desc}`, boxW)}`);
    }
    lines.push(`${padStr}${bEmpty(boxW)}`);
  };

  renderGroup(t("help.navigation"), navKeys);
  const actionsLabel = prevScreenType === "main" ? t("help.actionsMain")
    : prevScreenType === "lesson" ? t("help.actionsLesson")
    : t("help.actions", { screen: prevScreenType });
  renderGroup(actionsLabel, actionKeys);
  renderGroup(t("help.global"), globalKeys);

  lines.push(`${padStr}${boxSep(boxW)}`);
  lines.push(`${padStr}${bLine(`  ${th.fg.muted}${t("help.pressAnyKey")}${th.mod.reset}`, boxW)}`);
  lines.push(`${padStr}${boxBottom(boxW)}`);

  while (lines.length < h) { lines.push(""); }
  flushScreen(lines);
}

export function handleHelpInput(_key: ParsedKey): void {
  const screen = currentScreen as Extract<Screen, { type: "help" }>;
  setCurrentScreen(screen.previousScreen);
  redraw();
}
