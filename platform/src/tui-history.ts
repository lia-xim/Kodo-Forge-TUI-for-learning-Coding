/**
 * tui-history.ts — History Screen
 */

import {
  c, padR, truncate, boxTop, bLine, bEmpty,
  flushScreen, renderHeader, renderFooter,
} from "./tui-render.ts";
import {
  currentScreen, setCurrentScreen, lessons, navigationHistory,
  updateTermSize, W, H, formatSessionTime,
} from "./tui-state.ts";
import type { ParsedKey, Screen } from "./tui-types.ts";
import { renderMainMenu } from "./tui-main-menu.ts";
import { openSection, openCheatsheet } from "./tui-section-reader.ts";
import { redraw } from "./tui-redraw.ts";

function getHistoryLabel(screen: Screen): string {
  switch (screen.type) {
    case "main": return "Hauptmenue";
    case "lesson": { const l = lessons[screen.lessonIndex]; return `L${l?.number ?? "?"} > Lektionsmenue`; }
    case "section": { const l = lessons[screen.lessonIndex]; const sec = l?.sections[screen.sectionIndex]; return `L${l?.number ?? "?"} > Sektion ${screen.sectionIndex + 1}: ${sec?.title ?? "?"}`; }
    case "cheatsheet": { const l = lessons[screen.lessonIndex]; return `L${l?.number ?? "?"} > Cheatsheet`; }
    case "pretest": { const l = lessons[screen.lessonIndex]; return `L${l?.number ?? "?"} > Pre-Test`; }
    case "warmup": return "Warm-Up";
    case "misconceptions": { const l = lessons[screen.lessonIndex]; return `L${l?.number ?? "?"} > Misconceptions`; }
    case "exercisemenu": { const l = lessons[screen.lessonIndex]; return `L${l?.number ?? "?"} > Exercises`; }
    case "interleaved": return "Interleaved Review";
    case "search": return "Suche";
    case "bookmarks": return "Lesezeichen";
    case "competence": return "Kompetenzen";
    case "stats": return "Statistiken";
    default: return screen.type;
  }
}

export function renderHistoryScreen(): void {
  updateTermSize();
  const lines: string[] = [];
  const w = W();
  const h = H();

  const timerStr = formatSessionTime();
  lines.push(renderHeader(` Letzte Stellen`, `\u23F1 ${timerStr} `));
  lines.push(boxTop(w)); lines.push(bEmpty(w));

  const screen = currentScreen as Extract<Screen, { type: "history" }>;

  if (navigationHistory.length === 0) {
    lines.push(bLine(`  ${c.dim}Noch keine Navigation aufgezeichnet.${c.reset}`, w));
  } else {
    const reversed = [...navigationHistory].reverse();
    for (let i = 0; i < reversed.length; i++) {
      const entry = reversed[i];
      const isSelected = i === screen.selectedIndex;
      const marker = isSelected ? `${c.cyan}${c.bold}\u25B8${c.reset}` : " ";
      const label = getHistoryLabel(entry);
      const style = isSelected ? c.bold : "";
      lines.push(bLine(`  ${marker} ${style}${truncate(label, w - 8)}${c.reset}`, w));
    }
  }

  lines.push(bEmpty(w));
  const footerStart = h - 3;
  while (lines.length < footerStart) lines.push(bEmpty(w));
  lines.push(...renderFooter([`${c.bold}[\u2191\u2193]${c.reset} Navigieren`, `${c.bold}[Enter]${c.reset} Oeffnen`, `${c.bold}[Esc]${c.reset} Zurueck`]));
  flushScreen(lines);
}

export function handleHistoryInput(key: ParsedKey): void {
  const screen = currentScreen as Extract<Screen, { type: "history" }>;
  const reversed = [...navigationHistory].reverse();

  if (key.name === "up") { screen.selectedIndex = Math.max(0, screen.selectedIndex - 1); renderHistoryScreen(); return; }
  if (key.name === "down") { screen.selectedIndex = Math.min(reversed.length - 1, screen.selectedIndex + 1); renderHistoryScreen(); return; }
  if (key.name === "enter") {
    if (reversed.length > 0 && screen.selectedIndex < reversed.length) {
      const target = JSON.parse(JSON.stringify(reversed[screen.selectedIndex])) as Screen;
      if (target.type === "section") { openSection(target.lessonIndex, target.sectionIndex, target.scrollOffset); return; }
      if (target.type === "cheatsheet") { openCheatsheet(target.lessonIndex); return; }
      setCurrentScreen(target);
      redraw();
    }
    return;
  }
  if (key.name === "escape" || key.name === "backspace" || key.name === "q") {
    setCurrentScreen({ type: "main", selectedIndex: 0 });
    renderMainMenu();
    return;
  }
}
