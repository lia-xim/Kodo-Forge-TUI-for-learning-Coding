# Kodo Forge TUI

A professional, zero-dependency Terminal User Interface (TUI) for local plain-text learning courses. It features spaced-repetition, a kinetic reading engine, integrated Text-To-Speech (TTS), quizzes, and an animation engine strictly built for the terminal.

## Features

- **Kinetic Reader:** Fast, distraction-free markdown reading engine with smooth terminal animations.
- **Spaced Repetition:** Smart flashcard system tracking concept mastery.
- **Local TTS Engine:** On-the-fly text-to-speech fallback using your operating system's native voices.
- **Zero Dependencies:** Written entirely in pure Node.js ecosystem using standard libraries to minimize bloat (when running via Node).
- **Standalone Native Executable:** No Node.js required!

## Quick Start (Standalone `.exe`)

The easiest way to use Kodo Forge is to download the standalone executable. 

1. Gather your `.exe` file.
2. Place it in a directory and run it (Double-click or run `./kodo-forge.exe` in bash/powershell).
3. On first load, it will automatically bootstrap a sample Markdown course in your directory.
4. Add your own lessons by dropping markdown files into that directory structure!

## Developing & Extending

If you wish to modify the code or run it from source:

You need [Node.js](https://nodejs.org/) (v20+ recommended) and `npm`.

```bash
# Install development runtime tools
npm install

# Start the application
npm start
```

### Compiling to a Single Executable

To compile Kodo Forge into a zero-dependency, standalone binary, you will need [Bun](https://bun.sh/).

```bash
npm run build:win   # For Windows (.exe)
npm run build:mac   # For macOS Apple Silicon
npm run build:linux # For Linux
```

## Creating Your Own Content

Kodo Forge reads content from a `platform.json` configured directory structure. 
To add new chapters, simply create new subdirectories with `README.md` files, and place your detailed content in a `sections/` directory.

Example structure:
```
my_courses/
  platform.json
  typescript/
    01-Intro/
      README.md
      sections/
        01-Basics.md
        02-Advanced.md
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
