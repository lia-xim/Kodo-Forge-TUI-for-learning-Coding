/**
 * i18n.ts — Internationalization for Kodo Forge TUI
 *
 * Provides a t() function backed by JSON translation files.
 * Supports 'de' (German, default) and 'en' (English).
 *
 * IMPORTANT: This module must NOT import from any tui-* module
 * to avoid circular dependencies.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

export type Locale = "de" | "en";
export const SUPPORTED_LOCALES: Locale[] = ["de", "en"];
export const DEFAULT_LOCALE: Locale = "de";

// Flat key-value translations loaded from JSON
let translations: Record<string, string> = {};
let currentLocale: Locale = DEFAULT_LOCALE;

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

/** Get the current locale */
export function getLocale(): Locale {
  return currentLocale;
}

/** Set locale and reload translations */
export function setLocale(locale: Locale): void {
  currentLocale = locale;
  loadTranslations();
}

/**
 * Translate a key. Supports interpolation with {name} placeholders.
 * Falls back to the key itself if not found.
 *
 * Usage: t("platform.locked") -> "gesperrt"
 *        t("stats.lessons", { count: "12" }) -> "12 Lektionen gelesen"
 */
export function t(key: string, vars?: Record<string, string | number>): string {
  let text = translations[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return text;
}

function loadTranslations(): void {
  const dir = path.join(_dirname, "..", "i18n");
  const file = path.join(dir, `${currentLocale}.json`);
  try {
    const raw = fs.readFileSync(file, "utf-8");
    translations = JSON.parse(raw);
  } catch {
    // Fallback: empty translations = keys shown as-is
    translations = {};
  }
}

/** Initialize i18n — call once at startup */
export function initI18n(locale?: Locale): void {
  currentLocale = locale ?? DEFAULT_LOCALE;
  loadTranslations();
}

/** Load saved locale preference from a config file */
export function loadLocalePreference(configDir: string): Locale {
  try {
    const file = path.join(configDir, "locale.json");
    const raw = fs.readFileSync(file, "utf-8");
    const data = JSON.parse(raw);
    if (SUPPORTED_LOCALES.includes(data.locale)) return data.locale;
  } catch {}
  return DEFAULT_LOCALE;
}

/** Save locale preference */
export function saveLocalePreference(configDir: string, locale: Locale): void {
  try {
    const file = path.join(configDir, "locale.json");
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify({ locale }, null, 2));
  } catch {}
}
