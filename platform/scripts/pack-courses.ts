/**
 * pack-courses.ts — Build-time packer fuer eingebettete Kursinhalte
 *
 * Walkt die Kursverzeichnisse + platform.json und packt alles in ein
 * einziges gzip-komprimiertes Blob. Das Blob wird beim ersten Start der
 * .exe nach ~/AppSupport oder %LOCALAPPDATA% entpackt.
 *
 * Bundle-Format (vor Gzip):
 *   "KDOB" (4 bytes magic)
 *   uint32 version    (format version, 1)
 *   uint32 fileCount
 *   for each file:
 *     uint32 pathLength
 *     bytes  path        (utf-8, forward slashes)
 *     uint32 contentLength
 *     bytes  content
 *
 * Aufruf: tsx scripts/pack-courses.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as zlib from "node:zlib";
import * as crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const PLATFORM_ROOT = path.resolve(_dirname, "..");
const LEARNING_ROOT = path.resolve(PLATFORM_ROOT, "..");
const OUT_DIR = path.join(PLATFORM_ROOT, "src", "generated");
const OUT_BUNDLE = path.join(OUT_DIR, "courses-bundle.bin");
const OUT_MANIFEST = path.join(OUT_DIR, "courses-bundle-manifest.ts");

const MAGIC = Buffer.from("KDOB", "ascii");
const FORMAT_VERSION = 1;

// Welche Kurs-Verzeichnisse werden eingepackt?
// Nur Kurse mit echtem Content. Angular/React/Next.js (CURRICULUM.md only) sind zu klein,
// aber wir nehmen sie mit — minimal Overhead, und der User sieht die Kurs-Slots.
const COURSE_DIRS = ["typescript", "angular", "react", "nextjs"];

// Locale-Varianten (typescript-en etc.) mit einpacken, falls vorhanden
function expandLocaleDirs(dir: string): string[] {
  const result = [dir];
  for (const locale of ["en"]) {
    const localized = `${dir}-${locale}`;
    if (fs.existsSync(path.join(LEARNING_ROOT, localized))) {
      result.push(localized);
    }
  }
  return result;
}

// Dateien die NICHT eingepackt werden (Platzverschwendung, nicht vom TUI benutzt)
const EXCLUDE_FILES = new Set([
  ".DS_Store",
  "Thumbs.db",
]);

const EXCLUDE_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
]);

interface FileEntry {
  relativePath: string; // immer mit forward slashes
  bytes: Buffer;
}

function walkDir(absDir: string, relBase: string, out: FileEntry[]): void {
  const entries = fs.readdirSync(absDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.name !== ".gitkeep") continue;
    if (EXCLUDE_FILES.has(entry.name)) continue;
    const abs = path.join(absDir, entry.name);
    const rel = relBase ? `${relBase}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      walkDir(abs, rel, out);
    } else if (entry.isFile()) {
      out.push({
        relativePath: rel,
        bytes: fs.readFileSync(abs),
      });
    }
  }
}

function pack(): void {
  const files: FileEntry[] = [];

  // 1) platform.json aus platform/ mitnehmen
  const platformJson = path.join(PLATFORM_ROOT, "platform.json");
  if (fs.existsSync(platformJson)) {
    // Beim Packen "lastAccessed" entfernen — das ist User-State, nicht Kurs-State
    const raw = JSON.parse(fs.readFileSync(platformJson, "utf8"));
    delete raw.lastAccessed;
    files.push({
      relativePath: "platform.json",
      bytes: Buffer.from(JSON.stringify(raw, null, 2), "utf8"),
    });
  } else {
    console.error(`  Warnung: platform.json nicht gefunden bei ${platformJson}`);
  }

  // 2) Kurs-Verzeichnisse einpacken
  const includedCourses: string[] = [];
  for (const baseDir of COURSE_DIRS) {
    for (const dir of expandLocaleDirs(baseDir)) {
      const abs = path.join(LEARNING_ROOT, dir);
      if (!fs.existsSync(abs)) continue;
      const countBefore = files.length;
      walkDir(abs, dir, files);
      const added = files.length - countBefore;
      if (added > 0) {
        includedCourses.push(`${dir} (${added} Dateien)`);
      }
    }
  }

  if (files.length === 0) {
    console.error("  FEHLER: Keine Dateien zum Packen gefunden.");
    process.exit(1);
  }

  // 3) Blob bauen
  const chunks: Buffer[] = [];
  chunks.push(MAGIC);
  const versionBuf = Buffer.alloc(4);
  versionBuf.writeUInt32LE(FORMAT_VERSION, 0);
  chunks.push(versionBuf);
  const countBuf = Buffer.alloc(4);
  countBuf.writeUInt32LE(files.length, 0);
  chunks.push(countBuf);

  // stabile Reihenfolge → deterministischer Hash
  files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  for (const f of files) {
    const pathBytes = Buffer.from(f.relativePath, "utf8");
    const pathLen = Buffer.alloc(4);
    pathLen.writeUInt32LE(pathBytes.length, 0);
    chunks.push(pathLen);
    chunks.push(pathBytes);
    const contentLen = Buffer.alloc(4);
    contentLen.writeUInt32LE(f.bytes.length, 0);
    chunks.push(contentLen);
    chunks.push(f.bytes);
  }

  const raw = Buffer.concat(chunks);
  const compressed = zlib.gzipSync(raw, { level: 9 });

  // 4) Hash berechnen
  const hash = crypto.createHash("sha256").update(compressed).digest("hex");

  // 5) Output schreiben
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }
  fs.writeFileSync(OUT_BUNDLE, compressed);

  const manifestTs = `/**
 * AUTO-GENERIERT von scripts/pack-courses.ts — NICHT MANUELL BEARBEITEN!
 *
 * Dieses Manifest beschreibt das gepackte Kurs-Bundle. Bei ersten Start der
 * .exe (oder nach Upgrade auf eine neue Bundle-Version) wird das Bundle nach
 * dem plattform-spezifischen Install-Verzeichnis entpackt.
 */

export const BUNDLE_VERSION = ${JSON.stringify(hash)};
export const BUNDLE_FORMAT_VERSION = ${FORMAT_VERSION};
export const BUNDLE_FILE_COUNT = ${files.length};
export const BUNDLE_COMPRESSED_SIZE = ${compressed.length};
export const BUNDLE_RAW_SIZE = ${raw.length};
export const BUNDLE_INCLUDED_COURSES = ${JSON.stringify(includedCourses, null, 2)};
`;
  fs.writeFileSync(OUT_MANIFEST, manifestTs);

  // 6) Report
  const mb = (n: number) => (n / 1024 / 1024).toFixed(2) + " MB";
  console.log("=== Kodo Forge Bundle gepackt ===");
  console.log(`  Dateien:          ${files.length}`);
  console.log(`  Roh:              ${mb(raw.length)}`);
  console.log(`  Komprimiert:      ${mb(compressed.length)}  (${((1 - compressed.length / raw.length) * 100).toFixed(1)}% kleiner)`);
  console.log(`  Version (SHA256): ${hash.slice(0, 16)}...`);
  console.log(`  Bundle:           ${path.relative(PLATFORM_ROOT, OUT_BUNDLE)}`);
  console.log(`  Manifest:         ${path.relative(PLATFORM_ROOT, OUT_MANIFEST)}`);
  console.log(`  Kurse:`);
  for (const c of includedCourses) console.log(`    - ${c}`);
}

pack();
