/**
 * tui-utils.ts — Child-Process, VS Code, Mermaid, Cleanup, misc utilities
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawn, exec } from "node:child_process";
import {
  PLATFORM_ROOT, PROJECT_ROOT, STATE_DIR, COURSES_ROOT, PLATFORM_FILE,
  isInAltScreen, setIsInAltScreen,
  platformConfig, setPlatformConfig, courseProgressCache,
  lessons, progress, saveProgress,
  setProjectRoot, setActiveCourseId, ACTIVE_COURSE_ID,
  updateDerivedPaths, discoverLessons, loadProgress, setLessons,
  setWarmupShownThisSession, setAdaptiveState,
  SESSION_START, sessionStats,
  formatSessionTime,
} from "./tui-state.ts";
import type { PlatformConfig, PlatformCourse, CourseProgressSummary } from "./tui-types.ts";
import {
  c, ENTER_ALT_SCREEN, LEAVE_ALT_SCREEN, HIDE_CURSOR, SHOW_CURSOR,
  ENABLE_MOUSE, DISABLE_MOUSE,
} from "./tui-render.ts";
import { stopTTS } from "./tui-tts.ts";
import { loadAdaptiveState } from "./adaptive-engine.ts";

// ─── Cleanup — IMMER alternate buffer verlassen ────────────────────────────

export function cleanup(): void {
  stopTTS();
  if (isInAltScreen) {
    process.stdout.write(DISABLE_MOUSE);
    process.stdout.write(LEAVE_ALT_SCREEN);
    setIsInAltScreen(false);
  }
  process.stdout.write(SHOW_CURSOR);
  try {
    if (process.stdin.isTTY && process.stdin.isRaw) {
      process.stdin.setRawMode(false);
    }
  } catch {
    // stdin evtl. schon geschlossen
  }
}

// ─── Mermaid-Diagramm im Browser ──────────────────────────────────────────

export function openMermaidDiagram(mermaidCode: string): void {
  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>TypeScript Deep Learning — Diagramm</title>
  <style>
    body {
      background: #1e1e2e;
      color: #cdd6f4;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      font-family: system-ui, sans-serif;
    }
    .mermaid {
      max-width: 90vw;
    }
    h3 {
      text-align: center;
      color: #89b4fa;
      margin-top: 2rem;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
</head>
<body>
  <div>
    <h3>TypeScript Deep Learning — Diagramm</h3>
    <pre class="mermaid">
${mermaidCode}
    </pre>
  </div>
  <script>
    mermaid.initialize({ startOnLoad: true, theme: 'dark' });
  </script>
</body>
</html>`;

  const tmpFile = path.join(os.tmpdir(), "ts-learn-diagram.html");
  fs.writeFileSync(tmpFile, html, "utf-8");

  const openCmd =
    process.platform === "win32"
      ? `start "" "${tmpFile}"`
      : process.platform === "darwin"
        ? `open "${tmpFile}"`
        : `xdg-open "${tmpFile}"`;

  exec(openCmd, (_err) => {
    // Fehler ignorieren — Browser oeffnet sich im Hintergrund
  });
}

// ─── VS Code Integration ──────────────────────────────────────────────────

export function openInVSCode(targetPath: string): void {
  exec(`code "${targetPath}"`, () => {});
}

// ─── Child-Process Runner ──────────────────────────────────────────────────

export function runChildProcess(
  command: string,
  args: string[],
  onExit: () => void
): void {
  if (isInAltScreen) {
    process.stdout.write(DISABLE_MOUSE);
    process.stdout.write(LEAVE_ALT_SCREEN);
    process.stdout.write(SHOW_CURSOR);
    setIsInAltScreen(false);
  }

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false);
  }
  process.stdin.pause();

  const tsxPath = path.join(PLATFORM_ROOT, "node_modules", ".bin", "tsx");
  const child = spawn(tsxPath, [command, ...args], {
    cwd: PROJECT_ROOT,
    stdio: "inherit",
    shell: true,
  });

  child.on("exit", () => {
    setTimeout(() => {
      process.stdout.write(ENTER_ALT_SCREEN);
      process.stdout.write(HIDE_CURSOR);
      process.stdout.write(ENABLE_MOUSE);
      setIsInAltScreen(true);

      if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
      }
      process.stdin.resume();
      onExit();
    }, 100);
  });

  child.on("error", (err) => {
    process.stderr.write(
      `\n${c.red}Fehler beim Starten: ${err.message}${c.reset}\n`
    );
    setTimeout(() => {
      process.stdout.write(ENTER_ALT_SCREEN);
      process.stdout.write(HIDE_CURSOR);
      process.stdout.write(ENABLE_MOUSE);
      setIsInAltScreen(true);

      if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
      }
      process.stdin.resume();
      onExit();
    }, 2000);
  });
}

// ─── Exit TUI ─────────────────────────────────────────────────────────────

export function exitTui(): void {
  stopTTS();
  saveProgress();
  cleanup();

  const elapsed = Date.now() - SESSION_START;
  const mins = Math.floor(elapsed / 60000);
  const secs = Math.floor((elapsed % 60000) / 1000);
  const timeStr = mins > 0 ? `${mins} Min ${secs} Sek` : `${secs} Sek`;

  console.log("");
  console.log(`  ${c.bold}${c.cyan}--- Tages-Zusammenfassung ---${c.reset}`);
  console.log(`  ${c.dim}Lernzeit:${c.reset}              ${c.bold}${timeStr}${c.reset}`);
  if (sessionStats.sectionsRead > 0) {
    console.log(`  ${c.dim}Sektionen gelesen:${c.reset}     ${c.bold}${sessionStats.sectionsRead}${c.reset}`);
  }
  if (sessionStats.questionsAnswered > 0) {
    console.log(`  ${c.dim}Fragen beantwortet:${c.reset}    ${c.bold}${sessionStats.questionsAnswered}${c.reset}`);
  }
  if (sessionStats.exercisesSolved > 0) {
    console.log(`  ${c.dim}Exercises geloest:${c.reset}     ${c.bold}${sessionStats.exercisesSolved}${c.reset}`);
  }
  if (sessionStats.quizzesTaken > 0) {
    console.log(`  ${c.dim}Quizzes absolviert:${c.reset}    ${c.bold}${sessionStats.quizzesTaken}${c.reset}`);
  }
  const totalActions = sessionStats.sectionsRead + sessionStats.questionsAnswered
    + sessionStats.exercisesSolved + sessionStats.quizzesTaken;
  if (totalActions === 0) {
    console.log(`  ${c.dim}(Noch keine Aktivitaeten in dieser Session.)${c.reset}`);
  }
  console.log("");
  console.log(`  ${c.dim}Bis zum naechsten Mal! Weiter lernen mit:${c.reset} ${c.cyan}npm start${c.reset}`);
  console.log("");

  process.exit(0);
}

// ─── Platform-Konfiguration ────────────────────────────────────────────────

export function getDefaultPlatformConfig(): PlatformConfig {
  return {
    courses: [
      {
        id: "typescript",
        name: "TypeScript Deep Learning",
        description: "Von den Basics bis zur Type-Level-Programmierung",
        directory: "typescript",
        color: "blue",
        icon: "TS",
        totalLessons: 40,
        totalSections: 212,
        estimatedHours: 68,
        exerciseTypes: 12,
        topics: ["Primitives", "Generics", "Mapped Types", "Conditional Types", "Decorators", "Compiler API"],
        prerequisite: null,
        prerequisiteDescription: "Keine",
        prerequisiteMinPhase: null,
        status: "active",
        recommendNext: "angular",
      },
    ],
    activeCourse: "typescript",
    lastAccessed: {},
  };
}

export function loadPlatformConfig(): void {
  try {
    if (fs.existsSync(PLATFORM_FILE)) {
      const raw = fs.readFileSync(PLATFORM_FILE, "utf-8");
      const data = JSON.parse(raw);
      setPlatformConfig({
        courses: data.courses ?? getDefaultPlatformConfig().courses,
        activeCourse: data.activeCourse ?? "typescript",
        lastAccessed: data.lastAccessed ?? {},
      });
    } else {
      setPlatformConfig(getDefaultPlatformConfig());
      savePlatformConfig();
    }
  } catch {
    setPlatformConfig(getDefaultPlatformConfig());
  }
}

export function savePlatformConfig(): void {
  try {
    fs.writeFileSync(
      PLATFORM_FILE,
      JSON.stringify(platformConfig, null, 2) + "\n",
      "utf-8"
    );
  } catch {
    // Schreibfehler ignorieren — nicht kritisch
  }
}

export function getCourseProgressSummary(course: PlatformCourse): CourseProgressSummary {
  const cached = courseProgressCache.get(course.id);
  if (cached) return cached;

  const courseDir = path.join(COURSES_ROOT, course.directory);
  const centralProgressFile = path.join(STATE_DIR, `progress-${course.id}.json`);
  const legacyProgressFile = path.join(courseDir, "tools", "tui-progress.json");
  const progressFile = fs.existsSync(centralProgressFile)
    ? centralProgressFile
    : legacyProgressFile;

  let completedLessons = 0;
  let lastLessonTitle = "";
  let currentPhase = 1;

  try {
    if (fs.existsSync(progressFile)) {
      const raw = fs.readFileSync(progressFile, "utf-8");
      const data = JSON.parse(raw);
      const sections = data.sections ?? {};

      const lessonCompletions = new Map<string, { done: number; total: number }>();

      if (fs.existsSync(courseDir)) {
        const entries = fs.readdirSync(courseDir, { withFileTypes: true });
        for (const entry of entries) {
          if (!entry.isDirectory()) continue;
          const match = entry.name.match(/^(\d{2})-/);
          if (!match) continue;
          const lessonNum = match[1];
          const sectionsDir = path.join(courseDir, entry.name, "sections");
          if (fs.existsSync(sectionsDir)) {
            const sectionFiles = fs.readdirSync(sectionsDir).filter(f => f.endsWith(".md"));
            const total = sectionFiles.length;
            let done = 0;
            for (let s = 0; s < total; s++) {
              const key = `${lessonNum}-${String(s + 1).padStart(2, "0")}`;
              const entry2 = sections[key];
              if (entry2) {
                const status = typeof entry2 === "string" ? entry2 : entry2.status;
                if (status === "completed") done++;
              }
            }
            lessonCompletions.set(lessonNum, { done, total });
          }
        }
      }

      for (const [, info] of lessonCompletions) {
        if (info.total > 0 && info.done >= info.total * 0.5) {
          completedLessons++;
        }
      }

      currentPhase = Math.min(4, Math.floor(completedLessons / 10) + 1);

      if (data.lastLesson !== undefined) {
        const lessonIdx = data.lastLesson;
        const entries = fs.existsSync(courseDir)
          ? fs.readdirSync(courseDir, { withFileTypes: true })
              .filter(e => e.isDirectory() && /^\d{2}-/.test(e.name))
              .sort((a, b) => a.name.localeCompare(b.name))
          : [];
        if (lessonIdx >= 0 && lessonIdx < entries.length) {
          const lessonDir = entries[lessonIdx].name;
          const readmePath = path.join(courseDir, lessonDir, "README.md");
          if (fs.existsSync(readmePath)) {
            const firstLine = fs.readFileSync(readmePath, "utf-8").split("\n")[0];
            const titleMatch = firstLine.match(/^#\s*Lektion\s*\d+:\s*(.+)/);
            if (titleMatch) lastLessonTitle = titleMatch[1].trim();
          }
          if (!lastLessonTitle) {
            lastLessonTitle = lessonDir.replace(/^\d{2}-/, "").replace(/-/g, " ");
          }
        }
      }
    }
  } catch {
    // Graceful fallback
  }

  let actualLessons = 0;
  try {
    if (fs.existsSync(courseDir)) {
      actualLessons = fs.readdirSync(courseDir, { withFileTypes: true })
        .filter(e => e.isDirectory() && /^\d{2}-/.test(e.name))
        .length;
    }
  } catch {
    // ignore
  }

  const totalForPercent = actualLessons > 0 ? actualLessons : course.totalLessons;
  const percent = totalForPercent > 0 ? Math.round((completedLessons / totalForPercent) * 100) : 0;

  const summary: CourseProgressSummary = {
    completedLessons,
    totalLessons: actualLessons > 0 ? actualLessons : course.totalLessons,
    currentPhase,
    lastLessonTitle,
    percent,
  };

  courseProgressCache.set(course.id, summary);
  return summary;
}

export function isCourseUnlocked(course: PlatformCourse): boolean {
  if (!course.prerequisite) return true;
  const prereqCourse = platformConfig.courses.find(c2 => c2.id === course.prerequisite);
  if (!prereqCourse) return true;
  const prereqProgress = getCourseProgressSummary(prereqCourse);
  const minPhase = course.prerequisiteMinPhase ?? 1;
  return prereqProgress.currentPhase >= minPhase;
}

export function getRecommendedCourse(): { courseId: string; lessonTitle: string } | null {
  const activeCourse = platformConfig.courses.find(co => co.id === platformConfig.activeCourse);
  if (activeCourse) {
    const prog = getCourseProgressSummary(activeCourse);
    if (prog.percent < 100) {
      return {
        courseId: activeCourse.id,
        lessonTitle: prog.lastLessonTitle || "Naechste Lektion",
      };
    }
    if (activeCourse.recommendNext) {
      const next = platformConfig.courses.find(co => co.id === activeCourse.recommendNext);
      if (next) {
        return { courseId: next.id, lessonTitle: "Starte jetzt!" };
      }
    }
  }

  for (const course of platformConfig.courses) {
    const prog = getCourseProgressSummary(course);
    if (prog.percent < 100) {
      return { courseId: course.id, lessonTitle: prog.lastLessonTitle || "Starten" };
    }
  }

  return null;
}

export function switchToCourse(courseId: string): void {
  const course = platformConfig.courses.find(co => co.id === courseId);
  if (!course) return;

  saveProgress();

  platformConfig.activeCourse = courseId;
  platformConfig.lastAccessed[courseId] = new Date().toISOString();
  savePlatformConfig();

  setProjectRoot(path.join(COURSES_ROOT, course.directory));
  setActiveCourseId(courseId);
  updateDerivedPaths();

  setLessons(discoverLessons());
  loadProgress();

  try {
    setAdaptiveState(loadAdaptiveState(STATE_DIR));
  } catch {
    setAdaptiveState({ sectionDepths: {}, conceptScores: {}, hintLevels: {} });
  }

  setWarmupShownThisSession(false);
  courseProgressCache.clear();
}

export function formatTimeAgo(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    const now = Date.now();
    const diffMs = now - date.getTime();
    if (diffMs < 0) return "gerade eben";

    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "gerade eben";
    if (minutes < 60) return `vor ${minutes} Minute${minutes === 1 ? "" : "n"}`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `vor ${hours} Stunde${hours === 1 ? "" : "n"}`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `vor ${days} Tag${days === 1 ? "" : "en"}`;

    const weeks = Math.floor(days / 7);
    return `vor ${weeks} Woche${weeks === 1 ? "" : "n"}`;
  } catch {
    return "";
  }
}
