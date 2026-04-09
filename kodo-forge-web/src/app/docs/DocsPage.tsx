"use client";

import { motion } from "framer-motion";
import {
  Terminal,
  FolderOpen,
  FileText,
  BookOpen,
  Cpu,
  Zap,
  Brain,
  Eye,
  Heart,
  Code2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4 },
  }),
};

const sections = [
  {
    id: "what-is-kodo-forge",
    title: "What is Kodo Forge?",
    icon: <Terminal size={20} />,
    content: `Kodo Forge is a **Terminal User Interface (TUI)** for learning web development. Unlike browser-based platforms like Udemy, Coursera or freeCodeCamp, Kodo Forge runs entirely inside your terminal — the same tool professional developers use every day.

**Why a terminal?** Because it eliminates distractions. No browser tabs, no notifications, no ads. Just you and the material. Research shows that deep-focus, distraction-free environments dramatically improve learning retention.

Kodo Forge is:
- **100% offline** — no internet connection required after download
- **Zero dependencies** — single executable, no Node.js or Python needed
- **Privacy first** — no accounts, no telemetry, no tracking
- **Open source** — MIT licensed, fully transparent`,
  },
  {
    id: "how-it-works",
    title: "How It Works",
    icon: <Cpu size={20} />,
    content: `When you launch Kodo Forge, the engine scans your directory for a \`platform.json\` configuration file. This file tells the engine where your courses are and how they're structured.

The engine then renders a beautiful terminal interface with:
1. **A platform overview** showing all available courses with progress bars and a learning path flowchart
2. **A course view** with all lessons organized by phase, with completion status
3. **A section reader** with the Kinetic Reading engine and adaptive depth modes
4. **Interactive quizzes** with multiple choice and code exercises
5. **A spaced repetition system** with smart review scheduling and streak tracking

Everything is keyboard-driven. Navigate with arrow keys, select with Enter, go back with Escape. It's designed to feel like a native terminal application with smooth animations.`,
  },
  {
    id: "kinetic-reader",
    title: "The Kinetic Reader",
    icon: <Eye size={20} />,
    content: `The Kinetic Reader is our custom-built text progression engine. Instead of dumping an entire page of text at you, it reveals content progressively — section by section, paragraph by paragraph.

**How it works:**
- Text is rendered in the terminal using our custom Markdown engine
- Beautiful syntax-highlighted code blocks with optional line-by-line annotations
- Mermaid diagram support rendered directly in the terminal
- Tables with automatic column sizing and proper formatting
- Callout boxes for tips, warnings, important notes, and thinking prompts

**Why it's better:**
- Forces active reading instead of passive scrolling
- Each section is right-sized for focused learning (3-7 minutes)
- Progress is saved automatically — pick up exactly where you left off
- Adaptive depth: switch between summary, standard, and deep-dive modes per section with a single keypress`,
  },
  {
    id: "spaced-repetition",
    title: "Spaced Repetition System",
    icon: <Brain size={20} />,
    content: `Kodo Forge includes a built-in spaced repetition system based on proven cognitive science. After you complete a section, key concepts are automatically added to your review queue.

**The algorithm:**
- New concepts are reviewed after 1 day
- If you remember them, the interval doubles (1 → 2 → 4 → 8 → 16 days)
- If you forget, the interval resets to 1 day
- The platform shows you which reviews are due each session

**Features:**
- Automatic flashcard generation from lesson content
- Daily review count in the platform header
- Streak tracking to maintain your learning habit
- Activity sparklines showing your 14-day learning history
- Smart recommendations based on your progress and review state`,
  },
  {
    id: "open-source",
    title: "Open Source Philosophy",
    icon: <Heart size={20} />,
    content: `Kodo Forge is **100% free and open source** under the MIT license. We believe high-quality programming education should be accessible to everyone, regardless of income or location.

**What this means for you:**
- All source code is available on GitHub
- You can modify, extend, and redistribute the engine freely
- Community contributions (bug fixes, new features, translations) are welcome
- No hidden premium tier, no subscription, no "freemium" model
- The entire codebase is TypeScript — clean, typed, and well-structured

**Want to contribute?**
- Report bugs and request features via GitHub Issues
- Submit pull requests for improvements
- Create your own courses and share them with the community
- Help translate courses to other languages

We believe in learning by doing. The engine itself is a great TypeScript project to study — it demonstrates clean architecture, state management, terminal rendering, and data-driven design patterns.`,
  },
  {
    id: "installation",
    title: "Installation",
    icon: <Zap size={20} />,
    content: `**Option 1: Download the executable (recommended for learners)**

Go to the [Download page](/download) and grab the binary for your operating system. Place it in any directory and run it. That's it — instant learning environment.

**Option 2: Run from source (recommended for developers)**

If you want to contribute, modify, or study the code:

\`\`\`bash
git clone https://github.com/lia-xim/Learning.git
cd Learning/platform
npm install
npm start
\`\`\`

**Requirements for source:**
- Node.js 20+
- npm

**Requirements for executable:**
- Nothing. Zero dependencies. Works on Windows, macOS, and Linux.`,
  },
  {
    id: "create-content",
    title: "Creating Your Own Courses",
    icon: <FolderOpen size={20} />,
    content: `Kodo Forge is a **data-driven engine**. Courses are just folders of Markdown files. You can create courses on any topic — programming, languages, science, history, anything that can be taught through text.

**Step 1: Create your directory structure**

\`\`\`bash
my-project/
├── platform.json          # Course registry
├── my-course/
│   ├── 01-introduction/
│   │   ├── README.md      # Lesson overview
│   │   └── sections/
│   │       ├── 01-welcome.md
│   │       ├── 02-setup.md
│   │       └── 03-first-steps.md
│   ├── 02-basics/
│   │   ├── README.md
│   │   └── sections/
│   │       ├── 01-core-concepts.md
│   │       └── 02-hands-on.md
│   └── ...
\`\`\`

**Step 2: Register in platform.json**

\`\`\`json
{
  "courses": [{
    "id": "my-course",
    "name": "My Amazing Course",
    "description": "Learn something amazing",
    "directory": "my-course",
    "color": "blue",
    "icon": "MC",
    "totalLessons": 10,
    "status": "active"
  }],
  "activeCourse": "my-course"
}
\`\`\`

**Step 3: Write your Markdown content**

The engine supports rich Markdown features:
- Headers, bold, italic, inline code
- Fenced code blocks with syntax highlighting
- **Annotated code blocks** — code with side-by-side explanations
- Tables with automatic column sizing
- Callout boxes (TIP, WARNING, IMPORTANT, NOTE, DENKFRAGE)
- Mermaid diagrams rendered in the terminal
- Depth markers for adaptive reading (summary / standard / deep-dive)

**Step 4: Test with the engine**

\`\`\`bash
npm start
\`\`\`

The engine auto-detects your course and renders it as a beautiful TUI.

**Using AI to create courses:**
You can use AI assistants (Claude, ChatGPT, Gemini) to generate course content. We provide a workflow file at \`.agent/workflows/create-kodo-course.md\` that teaches AI assistants the exact directory structure, Markdown conventions, and didactic best practices. Simply tell your AI: "Create a Kodo Forge course about [topic]" and point it to this workflow.`,
  },
  {
    id: "markdown-features",
    title: "Markdown Reference",
    icon: <Code2 size={20} />,
    content: `**Headings**
Use \`#\`, \`##\`, \`###\` for section headers.

**Code Blocks**
Use fenced code blocks with language specification for syntax highlighting.

**Annotated Code (Kodo Forge exclusive)**
Add \`[annotated]\` after the language name. Lines ending with \`// comment\` get displayed as side annotations.

**Callout Boxes**
Start a blockquote with an emoji + keyword:
- \`> 💡 TIPP:\` — Tips and best practices
- \`> ⚠️ WARNUNG:\` — Warnings and caveats
- \`> 📌 WICHTIG:\` — Important information
- \`> 🧠 DENKFRAGE:\` — Self-explanation prompts

**Depth Markers**
Control what content appears at each reading depth:
- \`<!-- section:summary -->\` — Summary mode content
- \`<!-- depth:standard -->\` — Standard mode (default)
- \`<!-- depth:vollständig -->\` — Deep-dive mode only

**Tables**
Standard Markdown tables with automatic column sizing and alignment.

**Mermaid Diagrams**
Use \`mermaid\` as the language in a fenced code block. Supports flowcharts, sequence diagrams, and more.`,
  },
  {
    id: "architecture",
    title: "Engine Architecture",
    icon: <FileText size={20} />,
    content: `Kodo Forge is built with TypeScript and runs on Node.js (or as a compiled Bun executable). The codebase is organized into clean, modular components:

**Core Engine Modules:**
- \`tui.ts\` — Main entry point, input loop, screen routing
- \`tui-state.ts\` — Global state management (screens, progress, config)
- \`tui-platform.ts\` — Platform overview with responsive multi-layout system
- \`tui-main-menu.ts\` — Course lesson list with selection and filtering
- \`tui-section-reader.ts\` — The Kinetic Reader engine with adaptive depth
- \`markdown-renderer.ts\` — Custom terminal Markdown renderer (500+ lines)
- \`tui-quiz.ts\` — Interactive quiz engine with multiple question types
- \`tui-review.ts\` — Spaced repetition scheduling and review UI
- \`tui-stats.ts\` — Progress tracking, streaks, activity sparklines
- \`animation-engine.ts\` — Terminal animation system with easing functions

**Design Principles:**
- Zero external runtime dependencies — only dev dependencies (TypeScript, tsx)
- Pure terminal rendering — no ncurses, no blessed, no ink
- Responsive to terminal width/height changes in real-time
- All state persisted to local JSON files
- Modular architecture for easy extension
- Data-driven — the engine knows nothing about specific course content`,
  },
];

const toc = sections.map((s) => ({ id: s.id, title: s.title }));

export default function DocsPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12">
        {/* Sidebar TOC */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24" aria-label="Table of contents">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
              On This Page
            </h3>
            <div className="space-y-1">
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block text-sm text-zinc-500 hover:text-[#FFB000] transition-colors py-1.5 border-l border-zinc-800 pl-4 hover:border-[#FFB000]"
                >
                  {item.title}
                </a>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
            <h1
              className="text-4xl sm:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Docu<span className="text-[#FFB000]">mentation</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl">
              Everything you need to know about Kodo Forge — from getting started to creating your own terminal courses.
            </p>
          </motion.div>

          <div className="space-y-16">
            {sections.map((section, i) => (
              <motion.section
                key={section.id}
                id={section.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="scroll-mt-24"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="text-[#FFB000]">{section.icon}</div>
                  <h2
                    className="text-2xl font-bold text-white"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {section.title}
                  </h2>
                </div>

                <div className="prose-terminal">
                  {section.content.split("\n\n").map((paragraph, pi) => {
                    if (paragraph.startsWith("```")) {
                      const lines = paragraph.split("\n");
                      const lang = lines[0].replace("```", "").trim();
                      const code = lines.slice(1, -1).join("\n");
                      return (
                        <div key={pi} className="my-4 retro-glass rounded-lg overflow-hidden">
                          {lang && (
                            <div className="px-4 py-2 border-b border-zinc-800/40 text-xs text-zinc-500 font-mono">
                              {lang}
                            </div>
                          )}
                          <pre className="p-4 text-sm text-zinc-300 overflow-x-auto font-mono leading-relaxed">
                            {code}
                          </pre>
                        </div>
                      );
                    }

                    const html = paragraph
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                      .replace(
                        /`([^`]+)`/g,
                        '<code class="px-1.5 py-0.5 bg-zinc-800/60 text-[#FFB000] text-xs rounded font-mono">$1</code>'
                      )
                      .replace(
                        /\[([^\]]+)\]\(([^)]+)\)/g,
                        '<a href="$2" class="text-[#FFB000] hover:underline">$1</a>'
                      )
                      .replace(/^- /gm, "• ");

                    if (paragraph.match(/^\d+\./m) || paragraph.match(/^[•\-] /m)) {
                      return (
                        <div
                          key={pi}
                          className="text-sm text-zinc-400 leading-relaxed my-3 space-y-1"
                          dangerouslySetInnerHTML={{
                            __html: html
                              .split("\n")
                              .map((l: string) => `<div class="ml-2">${l}</div>`)
                              .join(""),
                          }}
                        />
                      );
                    }

                    return (
                      <p
                        key={pi}
                        className="text-sm text-zinc-400 leading-relaxed my-3"
                        dangerouslySetInnerHTML={{ __html: html }}
                      />
                    );
                  })}
                </div>
              </motion.section>
            ))}
          </div>

          {/* Open Source Banner */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="mt-20 retro-glass rounded-lg p-8 text-center"
          >
            <Sparkles className="text-[#FFB000] mx-auto mb-4" size={28} />
            <h2
              className="text-2xl font-bold text-white mb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Kodo Forge is Open Source
            </h2>
            <p className="text-zinc-400 text-sm max-w-lg mx-auto mb-6">
              Built by developers, for developers. Contribute, fork, or just study the code.
              The entire engine is written in clean, well-documented TypeScript.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://github.com/lia-xim/Learning"
                target="_blank"
                className="inline-flex items-center gap-2 px-6 py-3 retro-glass rounded text-[#FFB000] font-bold uppercase tracking-widest text-sm hover:bg-zinc-800/40 transition-colors"
              >
                <Code2 size={16} /> View on GitHub
              </a>
              <Link
                href="/download"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFB000] rounded text-[#09090b] font-bold uppercase tracking-widest text-sm"
              >
                Download Free
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
