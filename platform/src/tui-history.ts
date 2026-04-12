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
import { theme, marker as themeMarker } from "./tui-theme.ts";
import { renderHeaderBar, renderFooterBar, type FooterHint } from "./tui-components.ts";
import { t } from "./i18n.ts";

function getHistoryLabel(screen: Screen): string {
  switch (screen.type) {
    case "main": return t("history.mainMenu");
    case "lesson": { const l = lessons[screen.lessonIndex]; return `L${l?.number ?? "?"} > ${t("history.lessonMenu")}`; }
    case "section": { const l = lessons[screen.lessonIndex]; const sec = l?.sections[screen.sectionIndex]; return `L${l?.number ?? "?"} > ${t("history.section")} ${screen.sectionIndex + 1}: ${sec?.title ?? "?"}`; }
    case "cheatsheet": { const l = lessons[screen.lessonIndex]; return `L${l?.number ?? "?"} > ${t("history.cheatsheet")}`; }
    case "pretest": { const l = lessons[screen.lessonIndex]; return `L${l?.number ?? "?"} > ${t("history.pretest")}`; }
    case "warmup": return t("history.warmup");
    case "misconceptions": { const l = lessons[screen.lessonIndex]; return `L${l?.number ?? "?"} > ${t("history.misconceptions")}`; }
    case "exercisemenu": { const l = lessons[screen.lessonIndex]; return `L${l?.number ?? "?"} > ${t("history.exercises")}`; }
    case "interleaved": return t("history.interleavedReview");
    case "search": return t("history.search");
    case "bookmarks": return t("history.bookmarks");
    case "competence": return t("history.competence");
    case "stats": return t("history.stats");
    default: return screen.type;
  }
}

export function renderHistoryScreen(): void {
  updateTermSize();
  const lines: string[] = [];
  const w = W();
  const h = H();

  const th = theme;
  const timerStr = formatSessionTime();
  lines.push(renderHeaderBar(` ${t("history.title")}`, `\u23F1 ${timerStr} `, w));
  lines.push(boxTop(w)); lines.push(bEmpty(w));

  const screen = currentScreen as Extract<Screen, { type: "history" }>;

  if (navigationHistory.length === 0) {
    lines.push(bLine(`  ${th.fg.muted}${t("history.noEntries")}${th.mod.reset}`, w));
  } else {
    const reversed = [...navigationHistory].reverse();
    for (let i = 0; i < reversed.length; i++) {
      const entry = reversed[i];
      const isSelected = i === screen.selectedIndex;
      const mk = themeMarker(isSelected);
      const label = getHistoryLabel(entry);
      const style = isSelected ? th.mod.bold : "";
      lines.push(bLine(`  ${mk}${style}${truncate(label, w - 8)}${th.mod.reset}`, w));
    }
  }

  lines.push(bEmpty(w));
  const footerStart = h - 3;
  while (lines.length < footerStart) lines.push(bEmpty(w));
  const footerHints: FooterHint[] = [
    { key: "↑↓", label: t("history.navigate") },
    { key: "Enter", label: t("history.open"), primary: true },
    { key: "Esc", label: t("history.back") },
  ];
  lines.push(...renderFooterBar(footerHints, w));
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
