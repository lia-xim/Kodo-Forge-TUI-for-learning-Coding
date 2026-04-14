# Contributing to Kodo Forge

First off, thank you for considering contributing to Kodo Forge! It's people like you that make Kodo Forge such a great tool for the developer community.

## How Can I Contribute?

### 📚 Adding or Improving Courses
You don't need to be a programmer to contribute to our curriculum!
- Courses are powered by **Markdown**.
- Check out [`.agent/workflows/create-kodo-course.md`](.agent/workflows/create-kodo-course.md) for a guide on how to structure a course.
- You can add new lessons to existing courses (like TypeScript) or start a completely new one (React, Next.js, etc.).

### 💻 Improving the TUI Engine
If you're comfortable with **TypeScript** and **Terminal UIs**:
- The engine logic is located in the `platform/src/` directory.
- We use a custom ANSI-rendering engine to keep the app dependency-free and fast.
- Check the `docs/02-ARCHITECTURE.md` for a deep dive into how the engine works.

### 🐛 Reporting Bugs
- Use GitHub Issues to report bugs.
- Please include your OS and terminal emulator (e.g., Windows Terminal, iTerm2, etc.).

## Development Setup

1. Clone the repo: `git clone https://github.com/lia-xim/Learning.git`
2. Go to the platform: `cd platform`
3. Install: `npm install`
4. Start dev mode: `npm run start`

## Pull Request Process

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Ensure your code follows the existing style (see `CLAUDE.md` for guidelines).
4. Submit a PR with a clear description of what you've changed.

Thank you for being part of the Kodo Forge journey! 🔨✨
