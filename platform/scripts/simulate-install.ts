/**
 * simulate-install.ts — Testet das First-Run-Verhalten lokal OHNE .exe zu bauen.
 *
 * Setzt KODOFORGE_HOME auf ein Temp-Verzeichnis und laesst ensureInstalled
 * laufen, als waere es der erste Start einer compile-ten .exe.
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { ensureInstalled } from "../src/tui-first-run.ts";

const testDir = path.join(os.tmpdir(), "kodo-forge-extract-test-" + Date.now());
process.env.KODOFORGE_HOME = testDir;

console.log("Test-Ziel:", testDir);
console.log("");

const result = await ensureInstalled(["--exe-simulate"]);
console.log("Extract-Result:");
console.log("  installDir:      " + result.installDir);
console.log("  extractedFiles:  " + result.extractedFiles);
console.log("  bundleVersion:   " + result.bundleVersion.slice(0, 16) + "...");
console.log("  wasFirstRun:     " + result.wasFirstRun);
console.log("  wasUpgrade:      " + result.wasUpgrade);
console.log("");

// Verify key files exist
const checks = [
  "platform.json",
  "typescript/02-primitive-types/sections/section-01.md",
  "typescript/02-primitive-types/quiz-data.ts",
  ".kodo-install.json",
];
console.log("Datei-Checks:");
let allOk = true;
for (const c of checks) {
  const p = path.join(testDir, c);
  const ok = fs.existsSync(p);
  if (!ok) allOk = false;
  console.log("  " + (ok ? "[OK]  " : "[MISS]") + " " + c);
}

// Second call should be no-op
console.log("");
console.log("Zweiter Aufruf (sollte no-op sein):");
const result2 = await ensureInstalled(["--exe-simulate"]);
console.log("  extractedFiles=" + result2.extractedFiles);
console.log("  wasFirstRun=" + result2.wasFirstRun);
console.log("  wasUpgrade=" + result2.wasUpgrade);

// Count extracted files
let count = 0;
function walk(dir: string): void {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) walk(path.join(dir, e.name));
    else count++;
  }
}
walk(testDir);
console.log("");
console.log("Insgesamt " + count + " Dateien im Install-Dir.");

// Cleanup
fs.rmSync(testDir, { recursive: true, force: true });
console.log("Test-Ordner aufgeraeumt.");

if (!allOk) process.exit(1);
