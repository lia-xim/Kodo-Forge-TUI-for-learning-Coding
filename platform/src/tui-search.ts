/**
 * tui-search.ts — Search Screen
 */

import * as fs from "node:fs";
import {
  c, padR, truncate, boxTop, bLine, bEmpty,
  flushScreen, renderHeader, renderFooter,
} from "./tui-render.ts";
import {
  currentScreen, setCurrentScreen, lessons, updateTermSize, W, H,
  searchDebounceTimer, setSearchDebounceTimer,
} from "./tui-state.ts";
import type { ParsedKey, SearchResult, Screen } from "./tui-types.ts";
import { HIDE_CURSOR } from "./tui-render.ts";
import { renderMainMenu } from "./tui-main-menu.ts";
import { openSection } from "./tui-section-reader.ts";
import { theme, marker as themeMarker } from "./tui-theme.ts";
import { renderHeaderBar, renderFooterBar, type FooterHint } from "./tui-components.ts";
import { getSpinner } from "./tui-animation.ts";
import { t } from "./i18n.ts";

function performSearch(query: string): SearchResult[] {
  if (!query || query.length < 2) return [];
  const results: SearchResult[] = [];
  const lowerQuery = query.toLowerCase();

  for (let li = 0; li < lessons.length; li++) {
    const lesson = lessons[li];
    for (let si = 0; si < lesson.sections.length; si++) {
      const section = lesson.sections[si];
      try {
        const content = fs.readFileSync(section.filePath, "utf-8");
        const contentLines = content.split("\n");
        for (let lineIdx = 0; lineIdx < contentLines.length; lineIdx++) {
          const line = contentLines[lineIdx];
          if (line.toLowerCase().includes(lowerQuery)) {
            const cleanLine = line.replace(/^#+\s*/, "").replace(/\*\*/g, "").replace(/`/g, "").trim();
            if (cleanLine.length < 3) continue;
            const existingForSection = results.filter((r) => r.lessonIndex === li && r.sectionIndex === si);
            if (existingForSection.length >= 3) continue;
            results.push({
              lessonIndex: li, sectionIndex: si, lessonNumber: lesson.number,
              sectionNumber: si + 1, sectionTitle: section.title,
              contextLine: cleanLine.length > 70 ? cleanLine.slice(0, 67) + "..." : cleanLine,
              lineNumber: lineIdx,
            });
          }
        }
      } catch { /* Datei nicht lesbar */ }
    }
  }
  return results.slice(0, 50);
}

export function renderSearchScreen(): void {
  updateTermSize();
  const lines: string[] = [];
  const screen = currentScreen as Extract<Screen, { type: "search" }>;
  const w = W();
  const h = H();

  const th = theme;
  lines.push(renderHeaderBar(` ${t("search.title")}`, `[Esc] ${t("search.cancel")} `, w));
  lines.push(boxTop(w)); lines.push(bEmpty(w));

  const queryDisplay = screen.query + `${th.fg.accent}\u2588${th.mod.reset}`;
  lines.push(bLine(`  ${th.mod.bold}${t("search.query")}${th.mod.reset} ${th.fg.info}${queryDisplay}${th.mod.reset}`, w));
  lines.push(bEmpty(w));

  if (screen.query.length < 2) {
    lines.push(bLine(`  ${th.fg.muted}${t("search.minChars")}${th.mod.reset}`, w));
  } else if (screen.results.length === 0) {
    lines.push(bLine(`  ${th.fg.muted}${t("search.noResults")}${th.mod.reset}`, w));
  } else {
    lines.push(bLine(`  ${th.mod.bold}${t("search.results", { count: String(screen.results.length) })}${th.mod.reset}`, w));
    lines.push(bEmpty(w));

    const resultAreaHeight = h - 12;
    const visibleResults = Math.max(1, Math.floor(resultAreaHeight / 3));
    const startIdx = Math.max(0, Math.min(screen.selectedResult - Math.floor(visibleResults / 2), screen.results.length - visibleResults));

    for (let i = startIdx; i < Math.min(startIdx + visibleResults, screen.results.length); i++) {
      const result = screen.results[i];
      const isSelected = i === screen.selectedResult;
      const mk = themeMarker(isSelected);
      const title = `L${result.lessonNumber} S${result.sectionNumber}: ${truncate(result.sectionTitle, w - 20)}`;
      lines.push(bLine(`  ${mk}${isSelected ? th.mod.bold : ""}${title}${th.mod.reset}`, w));
      lines.push(bLine(`    ${th.fg.secondary}"...${truncate(result.contextLine, w - 12)}..."${th.mod.reset}`, w));
      lines.push(bEmpty(w));
    }
  }

  const footerStart = h - 3;
  while (lines.length < footerStart) { lines.push(bEmpty(w)); }
  const footerHints: FooterHint[] = [
    { key: "↑↓", label: t("search.navigate") },
    { key: "Enter", label: t("search.open"), primary: true },
    { key: "Esc", label: t("search.back") },
  ];
  lines.push(...renderFooterBar(footerHints, w));
  flushScreen(lines);
}

export function handleSearchInput(key: ParsedKey, rawData: Buffer): void {
  const screen = currentScreen as Extract<Screen, { type: "search" }>;

  if (key.name === "escape") {
    process.stdout.write(HIDE_CURSOR);
    setCurrentScreen({ type: "main", selectedIndex: 0 });
    renderMainMenu();
    return;
  }
  if (key.name === "enter") {
    if (screen.results.length > 0 && screen.selectedResult < screen.results.length) {
      const result = screen.results[screen.selectedResult];
      process.stdout.write(HIDE_CURSOR);
      openSection(result.lessonIndex, result.sectionIndex);
    }
    return;
  }
  if (key.name === "up") { screen.selectedResult = Math.max(0, screen.selectedResult - 1); renderSearchScreen(); return; }
  if (key.name === "down") { screen.selectedResult = Math.min(screen.results.length - 1, screen.selectedResult + 1); renderSearchScreen(); return; }
  if (key.name === "backspace") { screen.query = screen.query.slice(0, -1); triggerSearchDebounced(screen); renderSearchScreen(); return; }

  if (key.name === "space" || key.name === "tab" || key.name.startsWith("mouse-") || key.name.startsWith("unknown-") || key.name === "pageup" || key.name === "pagedown" || key.name === "home" || key.name === "end" || key.name === "left" || key.name === "right") {
    if (key.name === "space") { screen.query += " "; triggerSearchDebounced(screen); renderSearchScreen(); }
    return;
  }

  if (key.raw.length === 1 && key.raw.charCodeAt(0) >= 32) { screen.query += key.raw; triggerSearchDebounced(screen); renderSearchScreen(); return; }
  if (rawData.length > 1 && rawData[0] !== 0x1b) { screen.query += rawData.toString("utf-8"); triggerSearchDebounced(screen); renderSearchScreen(); return; }
}

function triggerSearchDebounced(screen: { query: string; results: SearchResult[]; selectedResult: number }): void {
  if (searchDebounceTimer) { clearTimeout(searchDebounceTimer); }
  setSearchDebounceTimer(setTimeout(() => {
    screen.results = performSearch(screen.query);
    screen.selectedResult = 0;
    renderSearchScreen();
  }, 150));
}
