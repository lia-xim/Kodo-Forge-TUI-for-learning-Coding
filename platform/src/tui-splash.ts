/**
 * tui-splash.ts — Startup Splash Screen
 *
 * Shows a branded intro screen with ASCII logo and amber wave animation.
 * Displays for ~1.5 seconds, then calls onComplete to enter the TUI.
 *
 * The wave animation uses the animation engine and integrates with
 * the single-write flushScreen() architecture.
 */

import { flushScreen } from "./tui-render.ts";
import { W, H } from "./tui-state.ts";
import { theme } from "./tui-theme.ts";
import { t } from "./i18n.ts";

// ─── ASCII Logo ───────────────────────────────────────────────────────────────

const LOGO_LINES = [
  "  ██╗  ██╗ ██████╗ ██████╗  ██████╗     ███████╗ ██████╗ ██████╗  ██████╗ ███████╗",
  "  ██║ ██╔╝██╔═══██╗██╔══██╗██╔═══██╗    ██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝",
  "  █████╔╝ ██║   ██║██║  ██║██║   ██║    █████╗  ██║   ██║██████╔╝██║  ███╗█████╗  ",
  "  ██╔═██╗ ██║   ██║██║  ██║██║   ██║    ██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝  ",
  "  ██║  ██╗╚██████╔╝██████╔╝╚██████╔╝    ██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗",
  "  ╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝    ╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝",
];

const SUBTITLE = "Deep Learning Platform  ·  TypeScript · Angular · React · Next.js";
const VERSION  = "v1.0  ·  by lia-xim";

// ─── Amber Color Wave ─────────────────────────────────────────────────────────

const AMBER_SHADES = [
  "\x1b[38;5;58m",
  "\x1b[38;5;94m",
  "\x1b[38;5;130m",
  "\x1b[38;5;136m",
  "\x1b[38;5;172m",
  "\x1b[38;5;208m",
  "\x1b[38;5;214m",
  "\x1b[38;5;220m",
  "\x1b[38;5;214m",
  "\x1b[38;5;208m",
  "\x1b[38;5;172m",
  "\x1b[38;5;136m",
  "\x1b[38;5;130m",
  "\x1b[38;5;94m",
];

function applyWave(logoLines: string[], frame: number): string[] {
  return logoLines.map(line =>
    line.split("").map((ch, i) => {
      if (ch === " ") return " ";
      const colorIdx = Math.abs((i - frame * 3) % AMBER_SHADES.length);
      return AMBER_SHADES[colorIdx] + ch;
    }).join("") + "\x1b[0m"
  );
}

// ─── Spinner Frames ───────────────────────────────────────────────────────────

const SPLASH_SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

// ─── Render Splash Frame ──────────────────────────────────────────────────────

function renderSplashFrame(frame: number, statusText: string): void {
  const w = W();
  const h = H();
  const lines: string[] = [];

  const reset = "\x1b[0m";
  const dimSlate = "\x1b[38;5;66m\x1b[2m";
  const amber = "\x1b[38;5;214m";
  const paleWhite = "\x1b[38;5;253m";
  const mutedSlate = "\x1b[38;5;66m";

  // Center logo vertically
  const logoHeight = LOGO_LINES.length + 6; // logo + padding + subtitle + version + status
  const topPad = Math.max(0, Math.floor((h - logoHeight) / 2));

  // Empty lines above
  for (let i = 0; i < topPad; i++) lines.push("");

  // Logo with wave
  const animatedLogo = applyWave(LOGO_LINES, frame);
  for (const line of animatedLogo) {
    const logoVis = line.replace(/\x1b\[[0-9;]*m/g, "").length;
    const leftPad = Math.max(0, Math.floor((w - logoVis) / 2));
    lines.push(" ".repeat(leftPad) + line);
  }

  // Separator
  lines.push("");
  const sepWidth = Math.min(80, w - 4);
  const sepLeft = Math.floor((w - sepWidth) / 2);
  lines.push(
    " ".repeat(sepLeft) +
    `${dimSlate}${"─".repeat(sepWidth)}${reset}`
  );
  lines.push("");

  // Subtitle
  const subVis = SUBTITLE.length;
  const subLeft = Math.max(0, Math.floor((w - subVis) / 2));
  lines.push(" ".repeat(subLeft) + `${paleWhite}${SUBTITLE}${reset}`);

  // Version
  const verVis = VERSION.length;
  const verLeft = Math.max(0, Math.floor((w - verVis) / 2));
  lines.push(" ".repeat(verLeft) + `${mutedSlate}${VERSION}${reset}`);

  lines.push("");

  // Spinner + status
  const spinnerChar = SPLASH_SPINNER[frame % SPLASH_SPINNER.length];
  const statusLine = `${amber}${spinnerChar}${reset}  ${dimSlate}${statusText}${reset}`;
  const statusVis = statusText.length + 4;
  const statusLeft = Math.max(0, Math.floor((w - statusVis) / 2));
  lines.push(" ".repeat(statusLeft) + statusLine);

  flushScreen(lines);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Show the splash screen for the given duration, then call onComplete.
 * The animation runs at ~30fps (33ms per frame).
 */
export function showSplash(durationMs: number = 1500, onComplete?: () => void): void {
  let frame = 0;
  let elapsed = 0;
  const frameMs = 50; // 20fps — fast enough for wave, not too much CPU

  renderSplashFrame(0, t("splash.loadingConfig"));

  const interval = setInterval(() => {
    frame++;
    elapsed += frameMs;

    const statusText = elapsed < 600
      ? t("splash.loadingConfig")
      : elapsed < 1100
        ? t("splash.discoveringLessons")
        : t("splash.ready");

    renderSplashFrame(frame, statusText);

    if (elapsed >= durationMs) {
      clearInterval(interval);
      onComplete?.();
    }
  }, frameMs);
}
