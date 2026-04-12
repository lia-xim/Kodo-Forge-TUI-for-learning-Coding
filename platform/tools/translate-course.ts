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
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

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
  skipExisting: boolean;
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
    skipExisting: false,
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
      case "--skip-existing":
        opts.skipExisting = true;
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
  return `Translate the user-facing ${LANG_NAMES[fromLang]} strings in this TypeScript file to ${LANG_NAMES[toLang]}.

Rules:
- Translate string VALUES (questions, explanations, feedback, hints)
- Keep variable names, property keys, code examples, type annotations unchanged
- Keep file structure, imports, exports, TypeScript syntax identical
- Keep technical terms (TypeScript, string, number, interface) in English
- For template literals with code, only translate surrounding text

CRITICAL: Your response must be ONLY the complete translated TypeScript file — the raw source code starting with the first line of the file (import/export/comment). Do NOT include any explanation, description, markdown fences, or preamble. Just the code.`;
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
  isCode: boolean = false,
): Promise<{ translated: string; inputTokens: number; outputTokens: number }> {
  const tmpFile = path.join(
    process.env.TEMP ?? process.env.TMP ?? "/tmp",
    `kf-translate-${Date.now()}-${Math.random().toString(36).slice(2)}.txt`,
  );

  try {
    let cmd: string;
    const escapedPath = tmpFile.replace(/\\/g, "/");

    if (isCode) {
      // Code files: pipe full prompt (system + content) via stdin
      // This avoids shell escaping issues with backticks in prompts
      const fullPrompt = `${systemPrompt}\n\n---\n\n${content}`;
      fs.writeFileSync(tmpFile, fullPrompt, "utf-8");
      cmd = `cat "${escapedPath}" | claude -p --model sonnet`;
    } else {
      // Markdown files: pipe content via stdin, system prompt as argument
      // This works more reliably for markdown translation
      fs.writeFileSync(tmpFile, content, "utf-8");
      cmd = `cat "${escapedPath}" | claude -p --model sonnet "Translate the following Markdown from German to English for a TypeScript learning platform. Preserve ALL formatting, code blocks, emoji markers, and structure. Output ONLY the translated Markdown, no explanations."`;
    }

    const { stdout } = await execAsync(cmd, {
      encoding: "utf-8",
      maxBuffer: 50 * 1024 * 1024,
      timeout: 600_000, // 10 min per file
    });

    let translated = stdout.trim();

    if (isCode) {
      // Strip markdown code fences if Claude wraps the output
      if (translated.includes("```")) {
        const fenceMatch = translated.match(/```\w*\n([\s\S]*?)```/);
        if (fenceMatch) {
          translated = fenceMatch[1].trim();
        }
      }
      // Strip preamble text before actual code
      const codeStart = translated.search(/^(import |export |\/\*|\/\/|"|')/m);
      if (codeStart > 0) {
        translated = translated.slice(codeStart);
      }
    }

    const inputTokens = Math.ceil(content.length / 4);
    const outputTokens = Math.ceil(translated.length / 4);
    return { translated, inputTokens, outputTokens };
  } finally {
    try { fs.unlinkSync(tmpFile); } catch {}
  }
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
  "advanced-patterns": "advanced-patterns",
  "declaration-merging": "declaration-merging",
  "decorators": "decorators",
  "tsconfig-deep-dive": "tsconfig-deep-dive",
  "review-challenge-phase-3": "review-challenge-phase-3",
  "async-typescript": "async-typescript",
  "type-safe-apis": "type-safe-apis",
  "testing-typescript": "testing-typescript",
  "performance-und-compiler": "performance-and-compiler",
  "migration-strategies": "migration-strategies",
  "library-authoring": "library-authoring",
  "type-level-programming": "type-level-programming",
  "compiler-api": "compiler-api",
  "best-practices": "best-practices",
  "capstone-project": "capstone-project",
  "typescript-5x-features": "typescript-5x-features",
  "typescript-sicherheit": "typescript-security",
  "typescript-mit-rxjs": "typescript-with-rxjs",
  "design-patterns-erweitert": "design-patterns-advanced",
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

  if (opts.skipExisting && fs.existsSync(destPath)) {
    console.log(`  ⏭ ${relPath} (already exists)`);
    return { file: relPath, success: true };
  }

  try {
    const content = fs.readFileSync(srcPath, "utf-8");
    const prompt = isCode
      ? getCodeFileTranslationPrompt(opts.from, opts.to)
      : getMarkdownTranslationPrompt(opts.from, opts.to);

    const result = await translateContent(content, prompt, opts.model, isCode);

    // Validate: output should be at least 30% the size of input
    if (result.translated.length < content.length * 0.3) {
      throw new Error(`Output too short (${result.translated.length} vs ${content.length} chars) — likely a bad translation`);
    }

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
