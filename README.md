<h1 align="center">
  <br>
  Kodo Forge 
  <br>
</h1>

<h4 align="center">A high-fidelity, distraction-free terminal learning platform for Software Developers.</h4>

<br>

<p align="center">
  <img src="kodo_screen_1.png" alt="Kodo Forge Terminal App" width="800">
</p>

## Overview

**Kodo Forge** is an open-source, terminal-native educational engine. Why the terminal? Because browsers are noisy. Social media, notifications, and 50 open tabs destroy deep work. Kodo Forge is a specialized TUI (Terminal User Interface) built to help developers master complex technologies with pure, distraction-free focus.

Our courses combine rigorous didactic methodology (the LEARN cycle) with gamification, spaced repetition, and interactive quizzes—all rendered natively in your command line, requiring zero internet connection once downloaded.

## Key Features

- **No Browser Required:** Runs purely in powershell, zsh, or bash.
- **Spaced Repetition Engine:** Automatically calculates memory decay and prompts you to review previously learned concepts.
- **Kinetic Reading:** Intelligent scrolling that prevents text-walls. Content is unlocked dynamically to keep you engaged.
- **Annotated Code Trees:** Code examples are parsed and aligned with inline comments for side-by-side reading in the terminal.
- **Open-Source & Markdown Driven:** Courses aren't locked in a database. They are standard `git` directories full of simple Markdown files.
- **Adaptive Difficulty:** Automatically switches depth (Detailed vs. Fast-track) based on your performance in quizzes.

## Getting Started

### Play it right now (No installation required)

Check out our [Releases](https://github.com/lia-xim/Learning/releases) for the latest executable. 
- **Windows:** Download `kodo-forge.exe` and execute it.
- **Linux/Mac:** Download the binary and run `./kodo-forge`

*(Note: The platform expects the `platform.json` and course folders like `typescript/` to be adjacent to the executable.)*

### Build from source

If you want to contribute to the engine or run it directly via Node/Bun:

```bash
# Clone the repository
git clone https://github.com/lia-xim/Learning.git

# Enter the platform folder
cd Learning/platform

# Install dependencies
npm install

# Start the TUI
npm run start
```

## Community-Driven & Create Your Own Course! 🤝

Kodo Forge is a **community-driven project**. We actively welcome contributions, new courses, and extensions to the engine!

You can author your own interactive courses using nothing but Standard Markdown. No proprietary editors. No databases. Just create a folder, add your markdown files to `platform.json`, and our engine parses it into a beautiful Terminal application automatically.

We even provide an **AI Course Creator Workflow**: You can feed our instruction set ([`create-kodo-course.md`](.agent/workflows/create-kodo-course.md)) to an AI, and it will generate structurally perfect, Kodo-Forge-compatible courses for you.

Want to contribute a fix or a new course? **Pull Requests are highly welcome and appreciated!**

## Course Catalog

Currently, Kodo Forge supports the following official curriculum tracks:

- **TypeScript Deep Learning:** From primitive types to Compiler API and AST parsing (44 Lessons, 82h).
- **Angular Mastery** *(Coming Soon)* 
- **React with TypeScript** *(Coming Soon)*

## Scripts & Automation

For Maintainers:
To release a new version of the binaries (via GitHub Actions):
```bash
npm run release
```
*This bumps the package version, creates a Git Tag, and pushes it, triggering the Release workflow.*

## License

MIT License - Use it, fork it, build on it!
