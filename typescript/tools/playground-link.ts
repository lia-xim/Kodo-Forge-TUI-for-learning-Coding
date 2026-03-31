/**
 * TypeScript Playground Link Generator
 *
 * Liest eine TypeScript-Datei, komprimiert den Inhalt und
 * generiert einen Link zum TypeScript Playground.
 *
 * Nutzung:
 *   npx tsx tools/playground-link.ts <datei.ts>
 *   npx tsx tools/playground-link.ts examples/01-hello-typescript.ts
 *   npm run playground -- examples/01-hello-typescript.ts
 *
 * Der Link wird im Terminal angezeigt und automatisch im Browser geoeffnet.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as zlib from "node:zlib";
import { exec } from "node:child_process";

// --- Terminal-Farben ---

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  underline: "\x1b[4m",
};

// --- TypeScript-Code zu Playground-URL konvertieren ---

function codeToPlaygroundUrl(code: string): string {
  const compressed = zlib.deflateSync(Buffer.from(code, "utf-8"));
  const base64 = compressed.toString("base64");

  // URL-safe Base64: + -> -, / -> _, kein Padding (=)
  const urlSafe = base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `https://www.typescriptlang.org/play?#code/${urlSafe}`;
}

// --- Im Browser oeffnen ---

function openInBrowser(url: string): void {
  const platform = process.platform;

  let command: string;
  if (platform === "win32") {
    command = `start "" "${url}"`;
  } else if (platform === "darwin") {
    command = `open "${url}"`;
  } else {
    // Linux und andere Unix-Systeme
    command = `xdg-open "${url}"`;
  }

  exec(command, (error) => {
    if (error) {
      console.log(`  ${c.dim}Browser konnte nicht automatisch geoeffnet werden.${c.reset}`);
      console.log(`  ${c.dim}Kopiere den Link oben und oeffne ihn manuell.${c.reset}\n`);
    }
  });
}

// --- Verfuegbare Dateien auflisten ---

function listTypeScriptFiles(): void {
  console.log(`\n  ${c.cyan}${c.bold}Verfuegbare TypeScript-Dateien:${c.reset}\n`);

  const lektionen = [
    "01-setup-und-erste-schritte",
    "02-primitive-types",
    "03-type-annotations-und-inference",
    "04-arrays-und-tuples",
    "05-objects-und-interfaces",
  ];

  for (const lektion of lektionen) {
    const lektionPath = path.join(process.cwd(), lektion);

    if (!fs.existsSync(lektionPath)) continue;

    console.log(`  ${c.bold}${lektion}/${c.reset}`);

    // Examples
    const examplesDir = path.join(lektionPath, "examples");
    if (fs.existsSync(examplesDir)) {
      const examples = fs.readdirSync(examplesDir).filter((f) => f.endsWith(".ts"));
      for (const file of examples) {
        console.log(`    ${c.green}examples/${file}${c.reset}`);
      }
    }

    // Exercises
    const exercisesDir = path.join(lektionPath, "exercises");
    if (fs.existsSync(exercisesDir)) {
      const exercises = fs.readdirSync(exercisesDir).filter((f) => f.endsWith(".ts"));
      for (const file of exercises) {
        console.log(`    ${c.yellow}exercises/${file}${c.reset}`);
      }
    }

    console.log();
  }
}

// --- Dateizeilen-Info ---

function getFileStats(content: string): { lines: number; chars: number } {
  const lines = content.split("\n").length;
  const chars = content.length;
  return { lines, chars };
}

// --- Hauptlogik ---

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(`
  ${c.bold}${c.cyan}TypeScript Playground Link Generator${c.reset}

  ${c.bold}Nutzung:${c.reset}
    npx tsx tools/playground-link.ts ${c.yellow}<datei.ts>${c.reset}

  ${c.bold}Beispiele:${c.reset}
    npx tsx tools/playground-link.ts 01-setup-und-erste-schritte/examples/01-hello-typescript.ts
    npm run playground -- 02-primitive-types/exercises/01-typ-zuweisungen.ts

  ${c.bold}Optionen:${c.reset}
    ${c.yellow}--no-open${c.reset}   Link generieren, aber Browser NICHT oeffnen
    ${c.yellow}--list${c.reset}      Alle verfuegbaren TypeScript-Dateien auflisten
`);
    return;
  }

  // --list: Dateien anzeigen
  if (args.includes("--list")) {
    listTypeScriptFiles();
    return;
  }

  // Datei-Argument finden (erstes Argument das nicht mit -- beginnt)
  const fileArg = args.find((a) => !a.startsWith("--"));
  const noOpen = args.includes("--no-open");

  if (!fileArg) {
    console.log(`\n  ${c.red}Keine Datei angegeben.${c.reset}`);
    console.log(`  ${c.dim}Nutzung: npx tsx tools/playground-link.ts <datei.ts>${c.reset}\n`);
    return;
  }

  // Pfad aufloesen (relativ zum aktuellen Verzeichnis)
  const filePath = path.resolve(process.cwd(), fileArg);

  if (!fs.existsSync(filePath)) {
    console.log(`\n  ${c.red}Datei nicht gefunden: ${fileArg}${c.reset}`);
    console.log(`  ${c.dim}Gesuchter Pfad: ${filePath}${c.reset}\n`);

    // Tipp: Vielleicht muss der Lektionspfad vorangestellt werden?
    const lektionen = [
      "01-setup-und-erste-schritte",
      "02-primitive-types",
      "03-type-annotations-und-inference",
      "04-arrays-und-tuples",
      "05-objects-und-interfaces",
    ];

    for (const lektion of lektionen) {
      const altPath = path.resolve(process.cwd(), lektion, fileArg);
      if (fs.existsSync(altPath)) {
        console.log(`  ${c.yellow}Meintest du vielleicht: ${lektion}/${fileArg} ?${c.reset}\n`);
        break;
      }
    }

    return;
  }

  if (!filePath.endsWith(".ts") && !filePath.endsWith(".tsx")) {
    console.log(`\n  ${c.yellow}Warnung: Die Datei hat keine .ts/.tsx Endung.${c.reset}`);
    console.log(`  ${c.dim}Der Playground erwartet TypeScript-Code.${c.reset}\n`);
  }

  // Datei einlesen
  let code: string;
  try {
    code = fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    console.log(`\n  ${c.red}Fehler beim Lesen der Datei: ${(err as Error).message}${c.reset}\n`);
    return;
  }

  if (code.trim().length === 0) {
    console.log(`\n  ${c.yellow}Die Datei ist leer. Es gibt nichts zum Anzeigen.${c.reset}\n`);
    return;
  }

  // Import-Zeilen entfernen, die im Playground nicht funktionieren wuerden
  const cleanedCode = code
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      // Entferne relative Imports (die im Playground nicht aufloesbar sind)
      if (trimmed.startsWith("import") && trimmed.includes("./")) return false;
      if (trimmed.startsWith("import") && trimmed.includes("../")) return false;
      // export {} entfernen (haeufig in Exercises)
      if (trimmed === "export {};") return false;
      return true;
    })
    .join("\n")
    .trim();

  // URL generieren
  const url = codeToPlaygroundUrl(cleanedCode);
  const stats = getFileStats(code);
  const relativePath = path.relative(process.cwd(), filePath);

  // Ausgabe
  const separator = "=".repeat(60);

  console.log();
  console.log(`  ${c.cyan}${separator}${c.reset}`);
  console.log(`  ${c.bold}${c.cyan}  TypeScript Playground Link generiert!${c.reset}`);
  console.log(`  ${c.cyan}${separator}${c.reset}`);
  console.log();
  console.log(`  ${c.bold}Datei:${c.reset}   ${relativePath}`);
  console.log(`  ${c.dim}Zeilen:${c.reset}  ${stats.lines}  ${c.dim}|${c.reset}  ${c.dim}Zeichen:${c.reset} ${stats.chars}`);
  console.log();
  console.log(`  ${c.bold}Link:${c.reset}`);
  console.log(`  ${c.underline}${c.cyan}${url}${c.reset}`);
  console.log();

  if (url.length > 8000) {
    console.log(`  ${c.yellow}Warnung: Der Link ist sehr lang (${url.length} Zeichen).${c.reset}`);
    console.log(`  ${c.yellow}Manche Browser koennen lange URLs nicht verarbeiten.${c.reset}\n`);
  }

  // Im Browser oeffnen
  if (!noOpen) {
    console.log(`  ${c.dim}Oeffne im Browser...${c.reset}\n`);
    openInBrowser(url);
  } else {
    console.log(`  ${c.dim}(--no-open: Browser wird nicht geoeffnet)${c.reset}\n`);
  }
}

main();
