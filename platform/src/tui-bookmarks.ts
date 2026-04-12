/**
 * tui-bookmarks.ts — Bookmarks Screen
 */

import {
  c, padR, truncate, boxTop, bLine, bEmpty,
  flushScreen, renderHeader, renderFooter,
} from "./tui-render.ts";
import {
  currentScreen, setCurrentScreen, lessons, progress, saveProgress,
  updateTermSize, W, H,
} from "./tui-state.ts";
import type { ParsedKey, Screen } from "./tui-types.ts";
import { renderMainMenu } from "./tui-main-menu.ts";
import { openSection } from "./tui-section-reader.ts";
import { theme, marker as themeMarker } from "./tui-theme.ts";
import { renderHeaderBar, renderFooterBar, type FooterHint } from "./tui-components.ts";
import { t } from "./i18n.ts";

export function renderBookmarksScreen(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as { type: "bookmarks"; selectedIndex: number };
  const w = W();
  const h = H();

  const th = theme;

  lines.push(renderHeaderBar(` ${t("bookmarks.title")}`, `${t("bookmarks.saved", { count: String(progress.bookmarks.length) })} `, w));
  lines.push(boxTop(w)); lines.push(bEmpty(w));

  if (progress.bookmarks.length === 0) {
    lines.push(bLine(`  ${th.fg.muted}${t("bookmarks.none")}${th.mod.reset}`, w));
    lines.push(bEmpty(w));
    lines.push(bLine(`  ${th.fg.muted}${t("bookmarks.hint")}${th.mod.reset}`, w));
  } else {
    lines.push(bLine(`  ${th.mod.bold}${th.fg.info}${t("bookmarks.list")}${th.mod.reset}`, w));
    lines.push(bEmpty(w));

    for (let i = 0; i < progress.bookmarks.length; i++) {
      const bm = progress.bookmarks[i];
      const isSelected = i === screen.selectedIndex;
      const mk = themeMarker(isSelected);
      const lesson = lessons[bm.lessonIndex];
      const section = lesson?.sections[bm.sectionIndex];
      const title = section ? `L${lesson.number} S${bm.sectionIndex + 1}: ${truncate(section.title, w - 40)}` : `L?? S${bm.sectionIndex + 1}`;
      const dateStr = bm.created ? new Date(bm.created).toLocaleDateString("de-DE") : "";
      const noteStr = bm.note ? ` ${th.fg.secondary}— ${bm.note}${th.mod.reset}` : "";
      const scrollInfo = `${th.fg.secondary}(${t("bookmarks.line")} ${bm.scrollOffset + 1})${th.mod.reset}`;
      lines.push(bLine(`  ${mk}${isSelected ? th.mod.bold : ""}${title}${th.mod.reset} ${scrollInfo}  ${th.fg.muted}${dateStr}${th.mod.reset}${noteStr}`, w));
    }
  }

  const footerStart = h - 3;
  while (lines.length < footerStart) { lines.push(bEmpty(w)); }
  const footerHints: FooterHint[] = [
    { key: "↑↓", label: t("bookmarks.navigate") },
    { key: "Enter", label: t("bookmarks.open"), primary: true },
    { key: "X", label: t("bookmarks.delete") },
    { key: "Esc", label: t("bookmarks.back") },
  ];
  lines.push(...renderFooterBar(footerHints, w));
  flushScreen(lines);
}

export function handleBookmarksInput(key: ParsedKey): void {
  const screen = currentScreen as { type: "bookmarks"; selectedIndex: number };

  if (key.name === "up") { screen.selectedIndex = Math.max(0, screen.selectedIndex - 1); renderBookmarksScreen(); return; }
  if (key.name === "down") { screen.selectedIndex = Math.min(progress.bookmarks.length - 1, screen.selectedIndex + 1); renderBookmarksScreen(); return; }
  if (key.name === "enter") {
    if (progress.bookmarks.length > 0 && screen.selectedIndex < progress.bookmarks.length) {
      const bm = progress.bookmarks[screen.selectedIndex];
      openSection(bm.lessonIndex, bm.sectionIndex, bm.scrollOffset);
    }
    return;
  }
  if (key.name === "x") {
    if (progress.bookmarks.length > 0 && screen.selectedIndex < progress.bookmarks.length) {
      progress.bookmarks.splice(screen.selectedIndex, 1);
      saveProgress();
      if (screen.selectedIndex >= progress.bookmarks.length) { screen.selectedIndex = Math.max(0, progress.bookmarks.length - 1); }
      renderBookmarksScreen();
    }
    return;
  }
  if (key.name === "escape" || key.name === "backspace" || key.name === "left" || key.name === "q") {
    setCurrentScreen({ type: "main", selectedIndex: 0 });
    renderMainMenu();
    return;
  }
}
