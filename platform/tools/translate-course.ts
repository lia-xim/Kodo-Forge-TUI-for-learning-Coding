/**
 * translate-course.ts — Automated Course Translation Pipeline
 *
 * Translates Markdown lesson files from German to English (or any target language)
 * using the Claude API. Preserves code blocks, annotations, formatting, and structure.
 *
 * Usage:
 *   npx tsx tools/translate-course.ts --course typescript --from de --to en
 *   npx tsx tools/translate-course.ts --course typescript --to en --lesson 01
 *   npx tsx tools/translate-course.ts --course typescript --to en --dry-run
 *
 * Prerequisites:
 *   - ANTHROPIC_API_KEY environment variable set
 *   - npm install @anthropic-ai/sdk (devDependency)
 *
 * Output structure:
 *   typescript/            ← original (German)
 *   typescript-en/         ← translated (English)
 *     01-setup-and-first-steps/
 *       sections/
 *         01-what-is-typescript.md
 *       cheatsheet.md
 *       quiz.ts            ← copied, quiz text translated
 *       pretest-data.ts    ← copied, question text translated
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

// ─── Config ────────────────────────────────────────────────────────────────

const SUPPORTED_LANGS = ["de", "en"] as const;
type Lang = (typeof SUPPORTED_LANGS)[number];

const LANG_NAMES: Record<Lang, string> = {
  de: "German",
  en: "English",
};

// Files that contain translatable text content
const TRANSLATABLE_EXTENSIONS = [".md"];

// Files to copy and translate inline strings (quiz questions, etc.)
const CODE_TRANSLATABLE = [
  "quiz.ts",
  "quiz-data.ts",
  "pretest-data.ts",
  "misconceptions.ts",
  "completion-problems.ts",
  "debugging-data.ts",
  "parsons-data.ts",
  "tracing-data.ts",
  "transfer-data.ts",
];

// Files/dirs to copy as-is (no translation needed)
const COPY_AS_IS = ["examples", "exercises", "solutions", "hints.json"];

// ─── CLI Args ──────────────────────────────────────────────────────────────

interface CliArgs {
  course: string;
  from: Lang;
  to: Lang;
  lesson?: string;
  dryRun: boolean;
  model: string;
  concurrency: number;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const opts: CliArgs = {
    course: "typescript",
    from: "de",
    to: "en",
    dryRun: false,
    model: "claude-sonnet-4-20250514",
    concurrency: 5,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--course":
        opts.course = args[++i];
        break;
      case "--from":
        opts.from = args[++i] as Lang;
        break;
      case "--to":
        opts.to = args[++i] as Lang;
        break;
      case "--lesson":
        opts.lesson = args[++i];
        break;
      case "--dry-run":
        opts.dryRun = true;
        break;
      case "--model":
        opts.model = args[++i];
        break;
      case "--concurrency":
        opts.concurrency = parseInt(args[++i], 10);
        break;
    }
  }
  return opts;
}

// ─── Translation Prompts ───────────────────────────────────────────────────

function getMarkdownTranslationPrompt(
  fromLang: Lang,
  toLang: Lang,
): string {
  return `You are a professional technical translator for a TypeScript/web development learning platform called "Kodo Forge".

Translate the following Markdown lesson content from ${LANG_NAMES[fromLang]} to ${LANG_NAMES[toLang]}.

CRITICAL RULES:
1. PRESERVE ALL MARKDOWN FORMATTING exactly (headers, lists, bold, italic, code blocks, blockquotes)
2. DO NOT translate content inside code blocks (\`\`\`....\`\`\`). Code stays as-is.
3. DO NOT translate inline code (\`variable\`, \`TypeScript\`, etc.). Keep them as-is.
4. DO NOT translate technical terms that are proper nouns: TypeScript, JavaScript, Angular, React, Next.js, Node.js, etc.
5. In annotated code blocks (\`\`\`typescript annotated), translate the annotation comments (// ^ ...) but keep the code lines unchanged.
6. Translate "Erklaere dir selbst:" to "Explain to yourself:" (or equivalent natural phrasing)
7. Translate "Denkfrage:" to "Think about it:" (or equivalent)
8. Translate "Experiment:" to "Experiment:" (same in English)
9. Translate headings like "Was du hier lernst" to "What you'll learn here"
10. Translate "Kernkonzept" to "Core Concept"
11. Keep emoji markers (📖, 🧠, 🔬, ⚡, etc.) in place
12. Maintain the same line count approximately — don't add or remove blank lines
13. Keep any HTML comments unchanged
14. The translation should sound natural and professional, not machine-translated
15. Preserve the teaching tone — friendly but precise, aimed at professional developers

Output ONLY the translated Markdown. No explanations, no wrapper.`;
}

function getCodeFileTranslationPrompt(
  fromLang: Lang,
  toLang: Lang,
): string {
  return `You are a professional technical translator. Translate user-facing strings in this TypeScript data file from ${LANG_NAMES[fromLang]} to ${LANG_NAMES[toLang]}.

RULES:
1. Only translate string VALUES that are user-facing text (questions, explanations, feedback, hints)
2. DO NOT translate: variable names, property keys, code examples, type annotations
3. DO NOT change the file structure, imports, exports, or any TypeScript syntax
4. Keep technical terms (TypeScript, string, number, interface, etc.) in English
5. Translate the content inside string literals ("..." or '...' or \`...\`)
6. For template literals with code examples inside, only translate the surrounding text, not the code

Output ONLY the translated TypeScript file. No explanations.`;
}

// ─── API Client ────────────────────────────────────────────────────────────

interface TranslationResult {
  file: string;
  success: boolean;
  error?: string;
  inputTokens?: number;
  outputTokens?: number;
}

async function translateContent(
  content: string,
  systemPrompt: string,
  _model: string,
): Promise<{ translated: string; inputTokens: number; outputTokens: number }> {
  // Use Claude Code CLI in print mode — no API key needed
  const prompt = `${systemPrompt}\n\n---\n\n${content}`;
  const { stdout } = await execFileAsync("claude", ["-p", "--model", "sonnet", prompt], {
    encoding: "utf-8",
    maxBuffer: 50 * 1024 * 1024, // 50 MB
    timeout: 300_000, // 5 min per file
  });
  const translated = stdout.trim();

  // Token counts not available via CLI — estimate from string lengths
  const inputTokens = Math.ceil(content.length / 4);
  const outputTokens = Math.ceil(translated.length / 4);

  return { translated, inputTokens, outputTokens };
}

/** Run tasks in batches of `concurrency` */
async function runInBatches<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    const batch = tasks.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(fn => fn()));
    results.push(...batchResults);
  }
  return results;
}

// ─── Directory Name Translation ────────────────────────────────────────────

// Map German directory names to English equivalents
const DIR_NAME_MAP: Record<string, string> = {
  "setup-und-erste-schritte": "setup-and-first-steps",
  "primitive-types": "primitive-types",
  "type-annotations-und-inference": "type-annotations-and-inference",
  "arrays-und-tuples": "arrays-and-tuples",
  "objects-und-interfaces": "objects-and-interfaces",
  "functions": "functions",
  "union-und-intersection-types": "union-and-intersection-types",
  "type-aliases-vs-interfaces": "type-aliases-vs-interfaces",
  "enums-und-literal-types": "enums-and-literal-types",
  "review-challenge": "review-challenge",
  "type-narrowing": "type-narrowing",
  "discriminated-unions": "discriminated-unions",
  "generics-basics": "generics-basics",
  "generic-patterns": "generic-patterns",
  "utility-types": "utility-types",
  "mapped-types": "mapped-types",
  "conditional-types": "conditional-types",
  "template-literal-types": "template-literal-types",
  "modules-und-declarations": "modules-and-declarations",
  "review-challenge-phase-2": "review-challenge-phase-2",
  "classes-und-oop": "classes-and-oop",
  "advanced-generics": "advanced-generics",
  "recursive-types": "recursive-types",
  "branded-nominal-types": "branded-nominal-types",
  "type-safe-error-handling": "type-safe-error-handling",
};

function translateDirName(name: string, toLang: Lang): string {
  if (toLang === "de") return name; // Original is German
  // Strip number prefix, translate, re-add prefix
  const match = name.match(/^(\d{2})-(.+)$/);
  if (!match) return name;
  const [, num, rest] = match;
  const translated = DIR_NAME_MAP[rest] ?? rest.replace(/-und-/g, "-and-");
  return `${num}-${translated}`;
}

// ─── Pipeline ──────────────────────────────────────────────────────────────

async function translateFile(
  srcPath: string,
  destPath: string,
  isCode: boolean,
  opts: CliArgs,
): Promise<TranslationResult> {
  const relPath = path.relative(
    path.join(process.cwd(), ".."),
    srcPath,
  );

  if (opts.dryRun) {
    console.log(`  [DRY] ${relPath} → ${path.relative(path.join(process.cwd(), ".."), destPath)}`);
    return { file: relPath, success: true };
  }

  try {
    const content = fs.readFileSync(srcPath, "utf-8");
    const prompt = isCode
      ? getCodeFileTranslationPrompt(opts.from, opts.to)
      : getMarkdownTranslationPrompt(opts.from, opts.to);

    const result = await translateContent(content, prompt, opts.model);

    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, result.translated);

    console.log(
      `  ✓ ${relPath} (${result.inputTokens}+${result.outputTokens} tokens)`,
    );
    return {
      file: relPath,
      success: true,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  ✗ ${relPath}: ${msg}`);
    return { file: relPath, success: false, error: msg };
  }
}

async function processLesson(
  lessonDir: string,
  destDir: string,
  opts: CliArgs,
): Promise<TranslationResult[]> {
  const tasks: (() => Promise<TranslationResult>)[] = [];

  // 1. Collect markdown files (sections/, cheatsheet.md, README.md)
  const sectionsDir = path.join(lessonDir, "sections");
  if (fs.existsSync(sectionsDir)) {
    const sections = fs.readdirSync(sectionsDir).filter((f) => f.endsWith(".md"));
    for (const section of sections) {
      const src = path.join(sectionsDir, section);
      const dest = path.join(destDir, "sections", section);
      tasks.push(() => translateFile(src, dest, false, opts));
    }
  }

  // Top-level markdown files
  for (const mdFile of ["cheatsheet.md", "README.md"]) {
    const src = path.join(lessonDir, mdFile);
    if (fs.existsSync(src)) {
      const dest = path.join(destDir, mdFile);
      tasks.push(() => translateFile(src, dest, false, opts));
    }
  }

  // 2. Collect code data files (quiz, pretest, etc.)
  for (const codeFile of CODE_TRANSLATABLE) {
    const src = path.join(lessonDir, codeFile);
    if (fs.existsSync(src)) {
      const dest = path.join(destDir, codeFile);
      tasks.push(() => translateFile(src, dest, true, opts));
    }
  }

  // 3. Copy files that don't need translation (sync, no batching needed)
  for (const item of COPY_AS_IS) {
    const src = path.join(lessonDir, item);
    if (fs.existsSync(src)) {
      const dest = path.join(destDir, item);
      copyRecursive(src, dest);
    }
  }

  // Run translation tasks in parallel batches
  return runInBatches(tasks, opts.concurrency);
}

function copyRecursive(src: string, dest: string): void {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs();

  console.log(`\n🔄 Kodo Forge Course Translation Pipeline`);
  console.log(`   Course: ${opts.course}`);
  console.log(`   ${LANG_NAMES[opts.from]} → ${LANG_NAMES[opts.to]}`);
  console.log(`   Model: ${opts.model}`);
  if (opts.dryRun) console.log(`   Mode: DRY RUN`);
  if (opts.lesson) console.log(`   Lesson filter: ${opts.lesson}`);
  console.log();

  const rootDir = path.join(process.cwd(), "..");
  const courseDir = path.join(rootDir, opts.course);
  const destCourseDir = path.join(rootDir, `${opts.course}-${opts.to}`);

  if (!fs.existsSync(courseDir)) {
    console.error(`Course directory not found: ${courseDir}`);
    process.exit(1);
  }

  // Find lesson directories (XX-name format)
  const lessons = fs
    .readdirSync(courseDir)
    .filter((d) => /^\d{2}-/.test(d) && fs.statSync(path.join(courseDir, d)).isDirectory())
    .filter((d) => !opts.lesson || d.startsWith(opts.lesson))
    .sort();

  console.log(`Found ${lessons.length} lesson(s) to translate\n`);

  const allResults: TranslationResult[] = [];
  let totalInput = 0;
  let totalOutput = 0;

  for (const lesson of lessons) {
    const lessonSrc = path.join(courseDir, lesson);
    const translatedName = translateDirName(lesson, opts.to);
    const lessonDest = path.join(destCourseDir, translatedName);

    console.log(`📚 ${lesson} → ${translatedName}`);

    const results = await processLesson(lessonSrc, lessonDest, opts);
    allResults.push(...results);

    for (const r of results) {
      totalInput += r.inputTokens ?? 0;
      totalOutput += r.outputTokens ?? 0;
    }
    console.log();
  }

  // Copy course-level files (CURRICULUM.md, PROGRESS.md, etc.)
  for (const topFile of ["CURRICULUM.md", "PROGRESS.md"]) {
    const src = path.join(courseDir, topFile);
    if (fs.existsSync(src)) {
      const dest = path.join(destCourseDir, topFile);
      const result = await translateFile(src, dest, false, opts);
      allResults.push(result);
      totalInput += result.inputTokens ?? 0;
      totalOutput += result.outputTokens ?? 0;
    }
  }

  // Summary
  const successful = allResults.filter((r) => r.success).length;
  const failed = allResults.filter((r) => !r.success).length;

  console.log(`\n${"═".repeat(60)}`);
  console.log(`Translation complete!`);
  console.log(`  Files processed: ${allResults.length}`);
  console.log(`  Successful: ${successful}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total tokens: ${totalInput} input + ${totalOutput} output = ${totalInput + totalOutput}`);
  console.log(`  Estimated cost: ~$${((totalInput * 3 + totalOutput * 15) / 1_000_000).toFixed(2)} (Sonnet pricing)`);
  console.log(`  Output: ${destCourseDir}`);

  if (failed > 0) {
    console.log(`\nFailed files:`);
    for (const r of allResults.filter((r) => !r.success)) {
      console.log(`  ✗ ${r.file}: ${r.error}`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
