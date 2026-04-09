<h1 align="center">
  <br>
  Kodo Forge 
  <br>
</h1>

<h4 align="center">A terminal-native learning platform for developers who hate browser distractions.</h4>

<br>

<p align="center">
  <img src="kodo_screen_1.png" alt="Kodo Forge Terminal App" width="800">
</p>

## What is this?

Browsers are noisy. Between social media, notifications, and 50 open tabs, it's hard to focus on deep technical learning. **Kodo Forge** is an open-source, terminal-based learning engine. It runs purely in powershell, bash, or zsh, so you can learn complex topics like TypeScript or React without leaving your terminal.

There are no databases or cloud backends required to run it. The engine just parses local Markdown files and turns them into an interactive TUI (Terminal User Interface).

## Features

- **No browser needed:** Run the executable directly in your command line.
- **Spaced Repetition:** The app remembers when you last reviewed a concept and automatically schedules reviews.
- **Side-by-side code annotations:** Add special tags to your markdown and the engine splits the view, placing comments right next to the code.
- **Adaptive difficulty:** If you nail the quizzes, the text adjusts to be faster. If you struggle, it provides deeper explanations.
- **Offline first:** Download it once, learn anywhere.

## Try it out (No installation needed)

Check out our [Releases](https://github.com/lia-xim/Learning/releases) for the standalone executable. 

- **Windows:** Download `kodo-forge.exe` and execute it.
- **Linux/Mac:** Download the binary and run `./kodo-forge`

*(Note: Keep the downloaded executable in the same directory as the `platform.json` and course folders, like `typescript/`)*

## Building from source

If you want to poke around the Node/Bun codebase:

```bash
# Clone it
git clone https://github.com/lia-xim/Learning.git

# Go to the platform folder
cd Learning/platform

# Install dependencies
npm install

# Start the dev environment
npm run start
```

## Adding your own courses & PRs 🤝

Kodo Forge is a **community-driven project**. If you want to contribute, fix a bug, or write a tutorial, Pull Requests are highly welcome.

You don't need to know React or TypeScript to build a course. Courses are literally just Markdown files structured in folders. You edit a single `platform.json` file, add your `.md` files, and the engine automatically handles the syntax highlighting, UI, and quizzes.

If you want to write a course fast, we have an instruction file at [`.agent/workflows/create-kodo-course.md`](.agent/workflows/create-kodo-course.md). You can drop that file into Claude or ChatGPT and have them perfectly format your markdown based on our platform's structure.

## Official Courses

Currently bundled in this repository:

- **TypeScript Deep Learning:** 44 lessons covering fundamentals up to the Compiler API. 
- **Angular Mastery** *(Coming Soon)* 
- **React with TypeScript** *(Coming Soon)*

## License

MIT License. Hack on it, fork it, make it yours.
