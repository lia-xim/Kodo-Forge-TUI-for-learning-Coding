# Kodo Forge TUI

A professional, zero-dependency Terminal User Interface (TUI) for local plain-text learning courses. It features spaced-repetition, a kinetic reading engine, integrated Text-To-Speech (TTS), quizzes, and an animation engine strictly built for the terminal.

## Features

- **Kinetic Reader:** Fast, distraction-free markdown reading engine with smooth terminal animations.
- **Spaced Repetition:** Smart flashcard system tracking concept mastery.
- **Local TTS Engine:** On-the-fly text-to-speech fallback using your operating system's native voices.
- **Zero Dependencies:** Written entirely in pure Node.js ecosystem using standard libraries to minimize bloat (when running via Node).
- **Standalone Native Executable:** No Node.js required!

## Quick Start (Standalone Binary)

Download the binary for your platform, double-click (or run from terminal), and you're done:

- Windows: `kodo-forge.exe`
- macOS (Apple Silicon): `kodo-forge-macos-arm64`
- macOS (Intel): `kodo-forge-macos-x64`
- Linux (x64): `kodo-forge-linux-x64`
- Linux (ARM64): `kodo-forge-linux-arm64`

On first launch, the binary automatically extracts all bundled courses into your
OS-appropriate data folder and then opens the TUI. Subsequent launches start
instantly.

**Install locations per platform:**

| Platform | Courses & state are installed to |
|----------|----------------------------------|
| Windows  | `%LOCALAPPDATA%\KodoForge\` |
| macOS    | `~/Library/Application Support/KodoForge/` |
| Linux    | `$XDG_DATA_HOME/kodo-forge/` or `~/.local/share/kodo-forge/` |

**Portable mode** — drop the binary on a USB stick:

```bash
./kodo-forge --portable           # or set KODOFORGE_PORTABLE=1
```

With `--portable`, all courses and progress live next to the binary, so you can
carry it between machines.

**Override location** — power-users can point at any directory:

```bash
KODOFORGE_HOME=/my/custom/path ./kodo-forge
```

**Upgrading** — when a new binary with a different course bundle is run, only
the bundled course folders are updated. Your progress (under `state/`) is
always preserved.

**Adding your own courses** — drop a course folder into the install directory
(e.g. `%LOCALAPPDATA%\KodoForge\my-course\`) and add an entry to
`platform.json`. The TUI picks it up on next launch. A proper scaffolding
command is on the roadmap.

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

To compile Kodo Forge into a zero-dependency, standalone binary, you need
[Bun](https://bun.sh/). Course content is packed and embedded automatically by
a prebuild hook.

```bash
npm run pack              # (optional) regenerate course bundle on its own
npm run build:win         # Windows .exe
npm run build:mac         # macOS Apple Silicon
npm run build:mac-intel   # macOS Intel
npm run build:linux       # Linux x64
npm run build:linux-arm64 # Linux ARM64
npm run build:all         # All of the above
```

Outputs land in `dist/`. Each binary is fully self-contained — no `platform.json`,
no course folders, nothing else needs to be shipped alongside it.

**How it works:**

1. `scripts/pack-courses.ts` walks the course directories (`typescript/`,
   `angular/`, `react/`, `nextjs/`, plus any locale variants like
   `typescript-en/`) and packs them into `src/generated/courses-bundle.bin`
   (a single gzip-compressed blob, ~4 MB for all current courses).
2. A sidecar manifest (`courses-bundle-manifest.ts`) records the bundle hash
   so the runtime can detect version changes.
3. `bun build --compile` embeds the bundle into the output binary via
   `src/generated/bundle-loader-bun.ts`.
4. On first launch, the binary extracts the bundle into the OS-appropriate
   data directory (see the Quick Start section).

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
