/**
 * tui-animation.ts — Professional Animation & Tween Engine for Kodo Forge TUI
 *
 * Provides:
 *  - Frame-based animation loop at ~30fps
 *  - Value tweening with easing functions
 *  - Screen fade transitions
 *  - Flash effects (border color pulse)
 *  - Spinner animations
 *  - Typewriter text reveal
 *
 * All animations are interruptible — any user input can cancel/skip.
 */

import { currentScreen } from "./tui-state.ts";
import { theme } from "./tui-theme.ts";

// ─── Blink Phase State ───────────────────────────────────────────────────────
let _blinkPhase = true;

/** Returns the current blink phase (true = on, false = off). Driven by the animation engine. */
export function getBlinkPhase(): boolean {
  return _blinkPhase;
}

// ─── Force Render Callback ────────────────────────────────────────────────

let forceRenderFn: (() => void) | null = null;

export function setForceRenderFn(fn: () => void) {
  forceRenderFn = fn;
}

// ─── Easing Functions ─────────────────────────────────────────────────────

export type EasingFn = (t: number) => number;

export const easing = {
  linear:    (t: number) => t,
  easeOut:   (t: number) => 1 - Math.pow(1 - t, 3),
  easeIn:    (t: number) => Math.pow(t, 3),
  easeInOut: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  bounce:    (t: number) => {
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
} as const;

// ─── Animation Registry ──────────────────────────────────────────────────

type AnimationId = string;

interface AnimationInstance {
  id: AnimationId;
  tickFn: (frameCount: number) => void;
  intervalMs: number;
  lastTick: number;
  frameCount: number;
}

const activeAnimations = new Map<AnimationId, AnimationInstance>();

// ─── Tween Registry ──────────────────────────────────────────────────────

interface TweenInstance {
  id: string;
  startTime: number;
  durationMs: number;
  from: number;
  to: number;
  easingFn: EasingFn;
  onFrame: (value: number) => void;
  onComplete?: () => void;
}

const activeTweens = new Map<string, TweenInstance>();

// ─── Engine Loop ─────────────────────────────────────────────────────────

let engineInterval: ReturnType<typeof setInterval> | null = null;
const ENGINE_TICK_MS = 33; // ~30 fps

function startEngine() {
  if (engineInterval) return;
  engineInterval = setInterval(() => {
    let needsRender = false;
    const now = Date.now();

    // Process animations
    for (const anim of activeAnimations.values()) {
      if (now - anim.lastTick >= anim.intervalMs) {
        anim.frameCount++;
        anim.lastTick = now;
        anim.tickFn(anim.frameCount);
        needsRender = true;
      }
    }

    // Process tweens
    const completedTweens: string[] = [];
    for (const tween of activeTweens.values()) {
      const elapsed = now - tween.startTime;
      const progress = Math.min(1, elapsed / tween.durationMs);
      const easedProgress = tween.easingFn(progress);
      const value = tween.from + (tween.to - tween.from) * easedProgress;

      tween.onFrame(value);
      needsRender = true;

      if (progress >= 1) {
        completedTweens.push(tween.id);
        tween.onComplete?.();
      }
    }
    for (const id of completedTweens) {
      activeTweens.delete(id);
    }

    // Process screen dimming
    if (screenDimState.active) {
      const elapsed = now - screenDimState.startTime;
      const progress = Math.min(1, elapsed / screenDimState.durationMs);
      
      if (screenDimState.direction === "out") {
        screenDimState.opacity = 1 - progress;
      } else {
        screenDimState.opacity = progress;
      }
      
      needsRender = true;
      
      if (progress >= 1) {
        screenDimState.active = false;
        screenDimState.onComplete?.();
      }
    }

    if (needsRender && forceRenderFn) {
      forceRenderFn();
    }

    stopEngineIfEmpty();
  }, ENGINE_TICK_MS);
}

function stopEngineIfEmpty() {
  if (activeAnimations.size === 0 && activeTweens.size === 0 && !screenDimState.active && engineInterval) {
    clearInterval(engineInterval);
    engineInterval = null;
  }
}

// ─── Animation API ───────────────────────────────────────────────────────

export function registerAnimation(
  id: AnimationId,
  intervalMs: number,
  tickFn: (frameCount: number) => void
): void {
  activeAnimations.set(id, {
    id,
    intervalMs,
    tickFn,
    lastTick: Date.now(),
    frameCount: 0,
  });
  startEngine();
}

export function stopAnimation(id: AnimationId): void {
  activeAnimations.delete(id);
  stopEngineIfEmpty();
}

export function hasAnimation(id: AnimationId): boolean {
  return activeAnimations.has(id);
}

export function stopAllAnimations(): void {
  activeAnimations.clear();
  activeTweens.clear();
  screenDimState.active = false;
  stopEngineIfEmpty();
}

// ─── Tween API ───────────────────────────────────────────────────────────

export function tweenValue(
  id: string,
  from: number,
  to: number,
  durationMs: number,
  easingFn: EasingFn = easing.easeOut,
  onFrame: (value: number) => void,
  onComplete?: () => void
): void {
  activeTweens.set(id, {
    id,
    startTime: Date.now(),
    durationMs,
    from,
    to,
    easingFn,
    onFrame,
    onComplete,
  });
  startEngine();
}

export function stopTween(id: string): void {
  activeTweens.delete(id);
  stopEngineIfEmpty();
}

export function hasTween(id: string): boolean {
  return activeTweens.has(id);
}

// ─── Screen Dim / Fade State ─────────────────────────────────────────────

interface ScreenDimState {
  active: boolean;
  direction: "in" | "out";
  opacity: number;      // 0 = fully dimmed, 1 = fully bright
  startTime: number;
  durationMs: number;
  onComplete?: () => void;
}

const screenDimState: ScreenDimState = {
  active: false,
  direction: "in",
  opacity: 1,
  startTime: 0,
  durationMs: 0,
};

/**
 * Get the current screen dim level.
 * Returns a dim ANSI modifier if the screen is being faded.
 * Screens should apply this to their content during transitions.
 */
export function getScreenDimModifier(): string {
  if (!screenDimState.active) return "";
  const opacity = screenDimState.opacity;
  if (opacity < 0.2)  return "\x1b[38;5;234m"; // near-invisible
  if (opacity < 0.45) return "\x1b[2m\x1b[38;5;238m"; // heavy dim
  if (opacity < 0.7)  return "\x1b[2m"; // standard dim
  return ""; // mostly opaque
}

export function isScreenTransitioning(): boolean {
  return screenDimState.active;
}

/**
 * Start a screen fade-out then call onComplete.
 * Used for screen transitions.
 */
export function fadeOut(durationMs: number = 100, onComplete?: () => void): void {
  screenDimState.active = true;
  screenDimState.direction = "out";
  screenDimState.opacity = 1;
  screenDimState.startTime = Date.now();
  screenDimState.durationMs = durationMs;
  screenDimState.onComplete = onComplete;
  startEngine();
}

/**
 * Start a screen fade-in.
 */
export function fadeIn(durationMs: number = 100): void {
  screenDimState.active = true;
  screenDimState.direction = "in";
  screenDimState.opacity = 0;
  screenDimState.startTime = Date.now();
  screenDimState.durationMs = durationMs;
  screenDimState.onComplete = undefined;
  startEngine();
}

/**
 * Skip any active transition immediately.
 */
export function skipTransition(): void {
  if (screenDimState.active) {
    screenDimState.active = false;
    screenDimState.opacity = 1;
    screenDimState.onComplete?.();
  }
}

// ─── Flash Effect ────────────────────────────────────────────────────────

let flashState: { color: string; endTime: number } | null = null;

/**
 * Get the current flash border color override, or null if not flashing.
 */
export function getFlashColor(): string | null {
  if (!flashState) return null;
  if (Date.now() > flashState.endTime) {
    flashState = null;
    return null;
  }
  return flashState.color;
}

/**
 * Trigger a border color flash (e.g., green on correct answer, red on wrong).
 */
export function flashBorder(color: string, durationMs: number = 200): void {
  flashState = { color, endTime: Date.now() + durationMs };
  // Ensure engine is running to clear the flash
  if (!hasAnimation("_flashClear")) {
    registerAnimation("_flashClear", durationMs + 50, () => {
      if (flashState && Date.now() > flashState.endTime) {
        flashState = null;
        stopAnimation("_flashClear");
      }
    });
  }
}

// ─── Spinner ─────────────────────────────────────────────────────────────

const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const spinnerStates = new Map<string, number>();

/**
 * Get the current spinner frame for an ID.
 * Auto-registers the spinner animation if not running.
 */
export function getSpinner(id: string): string {
  const frame = spinnerStates.get(id) ?? 0;
  
  if (!hasAnimation(`spinner_${id}`)) {
    spinnerStates.set(id, 0);
    registerAnimation(`spinner_${id}`, 80, (fc) => {
      spinnerStates.set(id, fc % spinnerFrames.length);
    });
  }
  
  return `${theme.fg.accent}${spinnerFrames[frame % spinnerFrames.length]}${theme.mod.reset}`;
}

export function stopSpinner(id: string): void {
  spinnerStates.delete(id);
  stopAnimation(`spinner_${id}`);
}

// ─── Ensure Menu Blink ───────────────────────────────────────────────────

/**
 * Ensures the menu blink animation is running.
 * Call this from any screen that has selectable items.
 */
export function ensureMenuBlink(): void {
  if (!hasAnimation("menuBlink")) {
    registerAnimation("menuBlink", 600, (fc) => {
      _blinkPhase = fc % 2 === 0;
    });
  }
}
