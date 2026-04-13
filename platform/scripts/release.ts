/**
 * release.ts — Robuster Release-Flow, unabhaengig von npm-version-Quirks.
 *
 * Schritte:
 *   1. Working tree muss clean sein (abort sonst).
 *   2. Version in package.json bumpen (patch by default, --minor / --major moeglich).
 *   3. package-lock.json mit-bumpen.
 *   4. Commit mit Message "Release vX.Y.Z".
 *   5. Tag vX.Y.Z anlegen.
 *   6. Push HEAD + Tag.
 *
 * Usage:
 *   tsx scripts/release.ts            # patch bump
 *   tsx scripts/release.ts minor      # minor bump
 *   tsx scripts/release.ts major      # major bump
 */

import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

type BumpType = "patch" | "minor" | "major";

function sh(cmd: string, silent = false): string {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: silent ? "pipe" : ["inherit", "pipe", "inherit"] });
  } catch (err: any) {
    if (!silent) console.error(`Command failed: ${cmd}`);
    throw err;
  }
}

function bump(version: string, type: BumpType): string {
  const [maj, min, pat] = version.split(".").map(Number);
  if (type === "major") return `${maj + 1}.0.0`;
  if (type === "minor") return `${maj}.${min + 1}.0`;
  return `${maj}.${min}.${pat + 1}`;
}

function main(): void {
  const bumpType = (process.argv[2] || "patch") as BumpType;
  if (!["patch", "minor", "major"].includes(bumpType)) {
    console.error(`Unbekannter bump-type: ${bumpType}. Erlaubt: patch|minor|major`);
    process.exit(1);
  }

  const platformDir = path.resolve(import.meta.dirname, "..");
  const repoRoot = path.resolve(platformDir, "..");
  const pkgPath = path.join(platformDir, "package.json");
  const lockPath = path.join(platformDir, "package-lock.json");

  // 1. Clean working tree?
  const status = sh("git status --porcelain", true).trim();
  if (status) {
    console.error("Working tree ist nicht sauber. Commit oder stash zuerst:");
    console.error(status);
    process.exit(1);
  }

  // 2. Version bumpen
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const oldVersion = pkg.version as string;
  const newVersion = bump(oldVersion, bumpType);
  pkg.version = newVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  // 3. package-lock.json mit-bumpen (top-level + packages[""].version)
  if (fs.existsSync(lockPath)) {
    const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
    lock.version = newVersion;
    if (lock.packages && lock.packages[""]) {
      lock.packages[""].version = newVersion;
    }
    fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2) + "\n");
  }

  const tag = `v${newVersion}`;
  console.log(`Bump ${oldVersion} -> ${newVersion}`);

  // 4. Check ob Tag schon existiert (lokal oder remote)
  try {
    sh(`git rev-parse ${tag}`, true);
    console.error(`\nTag ${tag} existiert bereits lokal. Abbruch.`);
    console.error(`Loesche ihn mit: git tag -d ${tag}`);
    process.exit(1);
  } catch {
    /* Tag existiert nicht — gut */
  }

  // 5. Commit + Tag (im Repo-Root, nicht im platform/-Dir)
  process.chdir(repoRoot);
  sh(`git add platform/package.json platform/package-lock.json`);
  sh(`git commit -m "Release ${tag}"`);
  sh(`git tag ${tag}`);

  // 6. Push
  console.log(`\nPush HEAD + ${tag}...`);
  sh(`git push origin HEAD`);
  sh(`git push origin ${tag}`);

  console.log(`\n[OK] Release ${tag} getaggt und gepushed.`);
  console.log(`     GitHub Actions: https://github.com/lia-xim/Kodo-Forge-TUI-for-learning-Coding/actions`);
  console.log(`     Draft Release:  https://github.com/lia-xim/Kodo-Forge-TUI-for-learning-Coding/releases`);
}

main();
