/**
 * Benutzer-Konfiguration fuer das TypeScript-Lernprojekt
 *
 * Speichert Einstellungen in `tools/user-config.json`.
 * Fehlende Felder werden automatisch mit Defaults ergaenzt.
 *
 * Nutzung:
 *   import { loadConfig, saveConfig, getDefault } from '../tools/config.ts';
 *
 *   const config = loadConfig(toolsDir);
 *   config.theme = "solarized";
 *   saveConfig(toolsDir, config);
 *
 * Keine externen Dependencies.
 */

import * as fs from "node:fs";
import * as path from "node:path";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserConfig {
  /** Farbthema: "dark", "light" oder "solarized" */
  theme: "dark" | "light" | "solarized";

  /** Scroll-Geschwindigkeit fuer sektionsweise Anzeige (ms zwischen Zeilen) */
  scrollSpeed: number;

  /** Warm-Up Quiz beim Start einer Lektion anzeigen */
  showWarmUpOnStart: boolean;

  /** Code-Annotationen standardmaessig einblenden */
  annotationsDefault: boolean;

  /** Selbsteinschaetzung nach jeder Sektion anzeigen */
  showConfidencePrompts: boolean;

  /** Pretests vor jeder Lektion anzeigen */
  showPretests: boolean;

  /** Session-Timer in der Statusleiste anzeigen */
  showSessionTimer: boolean;

  /** Selbsterklaerung nach Konzepten anzeigen */
  showSelfExplanation: boolean;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const CONFIG_FILENAME = "user-config.json";

const VALID_THEMES: ReadonlySet<string> = new Set(["dark", "light", "solarized"]);

/**
 * Gibt die Standard-Konfiguration zurueck.
 * Alle Lernhilfen sind standardmaessig aktiviert.
 */
export function getDefault(): UserConfig {
  return {
    theme: "dark",
    scrollSpeed: 30,
    showWarmUpOnStart: true,
    annotationsDefault: true,
    showConfidencePrompts: true,
    showPretests: true,
    showSessionTimer: true,
    showSelfExplanation: true,
  };
}

// ─── Validation ──────────────────────────────────────────────────────────────

/**
 * Validiert und bereinigt eine geladene Konfiguration.
 * Unbekannte Felder werden ignoriert, fehlende mit Defaults ergaenzt,
 * ungueltige Werte werden auf den Default zurueckgesetzt.
 */
function sanitize(raw: Record<string, unknown>): UserConfig {
  const defaults = getDefault();

  const theme = typeof raw.theme === "string" && VALID_THEMES.has(raw.theme)
    ? (raw.theme as UserConfig["theme"])
    : defaults.theme;

  const scrollSpeed =
    typeof raw.scrollSpeed === "number" &&
    Number.isFinite(raw.scrollSpeed) &&
    raw.scrollSpeed >= 0 &&
    raw.scrollSpeed <= 200
      ? raw.scrollSpeed
      : defaults.scrollSpeed;

  function boolField(key: keyof UserConfig): boolean {
    const val = raw[key];
    return typeof val === "boolean" ? val : (defaults[key] as boolean);
  }

  return {
    theme,
    scrollSpeed,
    showWarmUpOnStart: boolField("showWarmUpOnStart"),
    annotationsDefault: boolField("annotationsDefault"),
    showConfidencePrompts: boolField("showConfidencePrompts"),
    showPretests: boolField("showPretests"),
    showSessionTimer: boolField("showSessionTimer"),
    showSelfExplanation: boolField("showSelfExplanation"),
  };
}

// ─── Load / Save ─────────────────────────────────────────────────────────────

/**
 * Laedt die Benutzer-Konfiguration aus `tools/user-config.json`.
 *
 * - Wenn die Datei nicht existiert, werden die Defaults zurueckgegeben.
 * - Fehlende Felder werden automatisch aus den Defaults ergaenzt.
 * - Ungueltige Werte (z.B. theme: "neon") werden auf den Default gesetzt.
 *
 * @param toolsDir - Absoluter Pfad zum `tools/`-Verzeichnis
 * @returns Die validierte Benutzer-Konfiguration
 */
export function loadConfig(toolsDir: string): UserConfig {
  const filePath = path.join(toolsDir, CONFIG_FILENAME);

  if (!fs.existsSync(filePath)) {
    return getDefault();
  }

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const raw = JSON.parse(content);

    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
      console.warn(
        "\x1b[33mWarnung: " + CONFIG_FILENAME + " enthaelt kein gueltiges Objekt. " +
          "Nutze Defaults.\x1b[0m"
      );
      return getDefault();
    }

    return sanitize(raw as Record<string, unknown>);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(
      "\x1b[33mWarnung: Konnte " + CONFIG_FILENAME + " nicht lesen: " + message + ". " +
          "Nutze Defaults.\x1b[0m"
    );
    return getDefault();
  }
}

/**
 * Speichert die Benutzer-Konfiguration in `tools/user-config.json`.
 *
 * Die Konfiguration wird vor dem Speichern validiert und bereinigt.
 *
 * @param toolsDir - Absoluter Pfad zum `tools/`-Verzeichnis
 * @param config   - Die zu speichernde Konfiguration
 */
export function saveConfig(toolsDir: string, config: UserConfig): void {
  const filePath = path.join(toolsDir, CONFIG_FILENAME);

  // Validiere vor dem Speichern
  const sanitized = sanitize(config as unknown as Record<string, unknown>);

  try {
    const content = JSON.stringify(sanitized, null, 2) + "\n";
    fs.writeFileSync(filePath, content, "utf-8");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(
      "Konnte " + CONFIG_FILENAME + " nicht speichern: " + message
    );
  }
}

/**
 * Gibt die aktuelle Konfiguration formatiert im Terminal aus.
 *
 * @param config - Die anzuzeigende Konfiguration
 */
export function printConfig(config: UserConfig): void {
  const line = "=".repeat(50);
  console.log("\n\x1b[36m" + line + "\x1b[0m");
  console.log("\x1b[1m\x1b[36m  Aktuelle Konfiguration\x1b[0m");
  console.log("\x1b[36m" + line + "\x1b[0m\n");

  const entries: Array<[string, string]> = [
    ["Theme", config.theme],
    ["Scroll-Geschwindigkeit", config.scrollSpeed + " ms"],
    ["Warm-Up beim Start", config.showWarmUpOnStart ? "Ja" : "Nein"],
    ["Annotationen", config.annotationsDefault ? "Ein" : "Aus"],
    ["Selbsteinschaetzung", config.showConfidencePrompts ? "Ein" : "Aus"],
    ["Pretests", config.showPretests ? "Ein" : "Aus"],
    ["Session-Timer", config.showSessionTimer ? "Ein" : "Aus"],
    ["Selbsterklaerung", config.showSelfExplanation ? "Ein" : "Aus"],
  ];

  for (const [label, value] of entries) {
    const padded = label.padEnd(24);
    console.log("  \x1b[2m" + padded + "\x1b[0m " + value);
  }

  console.log();
}

/**
 * Setzt die Konfiguration auf die Defaults zurueck und speichert.
 *
 * @param toolsDir - Absoluter Pfad zum `tools/`-Verzeichnis
 * @returns Die Default-Konfiguration
 */
export function resetConfig(toolsDir: string): UserConfig {
  const defaults = getDefault();
  saveConfig(toolsDir, defaults);
  return defaults;
}
