/**
 * tui-first-run.ts — Selbst-Extraktion des Kurs-Bundles beim ersten Start
 *
 * Verhalten:
 * - Bestimmt plattform-spezifisches Install-Verzeichnis (Windows / macOS / Linux)
 * - Beim allerersten Start: Bundle entpacken → Kurse + platform.json werden geschrieben
 * - Bei nachfolgenden Starts mit einer NEUEREN .exe-Version: nur Kurse werden
 *   ersetzt, Progress-State (im state/-Unterordner) bleibt unberuehrt
 * - Wenn der User lokale Aenderungen am Kurs-Ordner gemacht hat (z.B. eigene
 *   Kurse hinzugefuegt), werden diese NICHT geloescht — wir patchen nur
 *   die Ordner, die auch im Bundle existieren
 *
 * Portable-Modus: wenn --portable angegeben, liegt alles neben der .exe.
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as zlib from "node:zlib";
import { fileURLToPath } from "node:url";

import {
  BUNDLE_VERSION,
  BUNDLE_FORMAT_VERSION,
} from "./generated/courses-bundle-manifest.ts";

const MAGIC = Buffer.from("KDOB", "ascii");
const INSTALL_MARKER = ".kodo-install.json";

// ─── Plattform-spezifische Install-Verzeichnisse ────────────────────────────

/**
 * Liefert das plattform-uebliche Verzeichnis fuer Anwendungsdaten.
 *
 * - Windows: %LOCALAPPDATA%\KodoForge  (z.B. C:\Users\name\AppData\Local\KodoForge)
 * - macOS:   ~/Library/Application Support/KodoForge
 * - Linux:   $XDG_DATA_HOME/kodo-forge oder ~/.local/share/kodo-forge
 */
export function getDefaultInstallDir(): string {
  const home = os.homedir();
  if (process.platform === "win32") {
    const localAppData =
      process.env.LOCALAPPDATA || path.join(home, "AppData", "Local");
    return path.join(localAppData, "KodoForge");
  }
  if (process.platform === "darwin") {
    return path.join(home, "Library", "Application Support", "KodoForge");
  }
  // Linux + other Unix-like
  const xdg = process.env.XDG_DATA_HOME;
  if (xdg && xdg.trim().length > 0) {
    return path.join(xdg, "kodo-forge");
  }
  return path.join(home, ".local", "share", "kodo-forge");
}

/**
 * Ermittelt das aktive Install-Verzeichnis.
 *
 * - Mit --portable oder KODOFORGE_PORTABLE=1: Verzeichnis der .exe
 * - Sonst: Plattform-Standard (siehe getDefaultInstallDir)
 */
export function resolveInstallDir(argv: readonly string[]): string {
  const portable =
    argv.includes("--portable") || process.env.KODOFORGE_PORTABLE === "1";
  if (portable) {
    return path.dirname(process.execPath);
  }
  // Optionaler Override fuer Power-User
  const override = process.env.KODOFORGE_HOME;
  if (override && override.trim().length > 0) {
    return override;
  }
  return getDefaultInstallDir();
}

// ─── Bundle-Lookup & Extraktion ─────────────────────────────────────────────

/**
 * Findet die Bundle-Binary und liest sie als Buffer.
 *
 * Zwei Wege:
 *   1. Bun-Compiled-Modus: wir laden einen Bun-spezifischen Loader dynamisch.
 *      Dessen statischer `import ... with { type: "file" }` sorgt dafuer, dass
 *      Bun die .bin beim `build --compile` ins Executable einbettet und uns
 *      zur Laufzeit den virtuellen Pfad (/$bunfs/...) zurueckgibt.
 *   2. Dev-Modus (tsx): direkt von Disk aus src/generated/courses-bundle.bin.
 */
async function readBundleBytes(): Promise<Buffer> {
  // Primaer: Bun-Compiled
  const isBun = !!(globalThis as any).Bun;
  if (isBun) {
    try {
      const loader = await import("./generated/bundle-loader-bun.ts");
      const p = (loader as { BUNDLE_PATH: string }).BUNDLE_PATH;
      if (p) return fs.readFileSync(p);
    } catch (err) {
      // Bun-Loader konnte nicht geladen werden — fall through zum Disk-Lookup
      // (sollte in einem korrekt gebauten Binary nicht passieren)
      console.error(
        `  Warnung: Bundle-Loader konnte nicht geladen werden: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // Sekundaer: Disk (Dev-Modus via tsx)
  try {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const devPath = path.join(here, "generated", "courses-bundle.bin");
    if (fs.existsSync(devPath)) return fs.readFileSync(devPath);
  } catch {
    // ignore
  }

  throw new Error(
    "Kurs-Bundle wurde nicht gefunden. Wurde 'npm run pack' ausgefuehrt, " +
      "und wurde die .exe mit 'bun build --compile' gebaut?"
  );
}

interface ExtractionResult {
  installDir: string;
  extractedFiles: number;
  bundleVersion: string;
  wasFirstRun: boolean;
  wasUpgrade: boolean;
}

/**
 * Entpackt das Bundle nach targetDir.
 *
 * Verhalten:
 *  - Kurs-Ordner (typescript/, react/, etc.) werden komplett neu geschrieben
 *  - platform.json: wenn noch keine existiert → schreiben; wenn existiert →
 *    nur die "courses"-Liste aus Bundle uebernehmen, "activeCourse" und
 *    "lastAccessed" vom User behalten
 *  - state/ wird nie angefasst
 */
function extractBundle(
  bundleBytes: Buffer,
  targetDir: string
): { filesWritten: number } {
  const raw = zlib.gunzipSync(bundleBytes);

  // Header pruefen
  if (raw.length < 12) {
    throw new Error("Bundle zu klein — korrupt?");
  }
  if (!raw.slice(0, 4).equals(MAGIC)) {
    throw new Error(
      `Bundle-Magic stimmt nicht (erwartet 'KDOB', gelesen '${raw.slice(0, 4).toString("ascii")}')`
    );
  }
  const version = raw.readUInt32LE(4);
  if (version !== BUNDLE_FORMAT_VERSION) {
    throw new Error(
      `Bundle-Format-Version ${version} wird nicht unterstuetzt (erwartet ${BUNDLE_FORMAT_VERSION}).`
    );
  }
  const fileCount = raw.readUInt32LE(8);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  let cursor = 12;
  let filesWritten = 0;

  // Existierende platform.json einlesen, falls vorhanden (fuer Merge)
  const existingPlatformJsonPath = path.join(targetDir, "platform.json");
  let existingPlatformJson: any = null;
  if (fs.existsSync(existingPlatformJsonPath)) {
    try {
      existingPlatformJson = JSON.parse(
        fs.readFileSync(existingPlatformJsonPath, "utf8")
      );
    } catch {
      existingPlatformJson = null;
    }
  }

  for (let i = 0; i < fileCount; i++) {
    const pathLen = raw.readUInt32LE(cursor);
    cursor += 4;
    const relPath = raw.slice(cursor, cursor + pathLen).toString("utf8");
    cursor += pathLen;
    const contentLen = raw.readUInt32LE(cursor);
    cursor += 4;
    const content = raw.slice(cursor, cursor + contentLen);
    cursor += contentLen;

    // Path-Traversal verhindern
    const normalized = path.normalize(relPath).replace(/\\/g, "/");
    if (normalized.startsWith("..") || normalized.startsWith("/") || /^[a-zA-Z]:/.test(normalized)) {
      console.warn(`  Warnung: Eintrag mit verdaechtigem Pfad uebersprungen: ${relPath}`);
      continue;
    }

    const absPath = path.join(targetDir, normalized);
    const parentDir = path.dirname(absPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    // platform.json: mergen statt ueberschreiben (user-state behalten)
    if (normalized === "platform.json" && existingPlatformJson) {
      const bundleJson = JSON.parse(content.toString("utf8"));
      const merged = {
        ...bundleJson,
        activeCourse:
          existingPlatformJson.activeCourse ?? bundleJson.activeCourse,
        lastAccessed: existingPlatformJson.lastAccessed ?? {},
      };
      fs.writeFileSync(
        absPath,
        JSON.stringify(merged, null, 2) + "\n",
        "utf8"
      );
    } else {
      fs.writeFileSync(absPath, content);
    }
    filesWritten++;
  }

  return { filesWritten };
}

/**
 * Liest das Install-Marker-File. Enthaelt die Version des zuletzt extrahierten
 * Bundles, damit wir bei .exe-Upgrades automatisch neu entpacken.
 */
interface InstallMarker {
  bundleVersion: string;
  installedAt: string;
  installPath: string;
}

function readInstallMarker(installDir: string): InstallMarker | null {
  const markerPath = path.join(installDir, INSTALL_MARKER);
  if (!fs.existsSync(markerPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(markerPath, "utf8")) as InstallMarker;
  } catch {
    return null;
  }
}

function writeInstallMarker(installDir: string): void {
  const markerPath = path.join(installDir, INSTALL_MARKER);
  const marker: InstallMarker = {
    bundleVersion: BUNDLE_VERSION,
    installedAt: new Date().toISOString(),
    installPath: installDir,
  };
  fs.writeFileSync(markerPath, JSON.stringify(marker, null, 2) + "\n", "utf8");
}

// ─── Simple Progress-UI (nur beim ersten Start / Upgrade sichtbar) ──────────

function writeLine(msg: string): void {
  // CR an den Anfang → ueberschreibt die vorherige Zeile (falls Terminal)
  process.stdout.write(`\r\x1b[2K${msg}`);
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Stellt sicher dass Kurse installiert sind. Gibt das verwendete Install-Dir
 * zurueck. Wird von tui.ts VOR loadPlatformConfig aufgerufen.
 *
 * Bei Fehler wird geworfen — der Aufrufer soll den Fehler dem User zeigen
 * und dann robust pausieren, bevor die .exe schliesst.
 */
export async function ensureInstalled(
  argv: readonly string[] = process.argv
): Promise<ExtractionResult> {
  const installDir = resolveInstallDir(argv);

  // Marker pruefen
  const marker = readInstallMarker(installDir);
  const isFirstRun = marker === null;
  const isUpgrade =
    marker !== null && marker.bundleVersion !== BUNDLE_VERSION;

  if (!isFirstRun && !isUpgrade) {
    // Alles aktuell — nichts zu tun
    return {
      installDir,
      extractedFiles: 0,
      bundleVersion: BUNDLE_VERSION,
      wasFirstRun: false,
      wasUpgrade: false,
    };
  }

  const bundleBytes = await readBundleBytes();

  // User informieren
  const headline = isFirstRun
    ? "Erste Einrichtung — Kurse werden entpackt..."
    : "Neue Version erkannt — Kurse werden aktualisiert...";
  console.log("");
  console.log(`  ${headline}`);
  console.log(`  Ziel: ${installDir}`);
  writeLine("  [....] 0%");

  const { filesWritten } = extractBundle(bundleBytes, installDir);
  writeLine(`  [####] Fertig. ${filesWritten} Dateien geschrieben.\n`);

  writeInstallMarker(installDir);

  return {
    installDir,
    extractedFiles: filesWritten,
    bundleVersion: BUNDLE_VERSION,
    wasFirstRun: isFirstRun,
    wasUpgrade: isUpgrade,
  };
}
