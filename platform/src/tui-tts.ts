/**
 * tui-tts.ts — Text-to-Speech Funktionen
 *
 * Primaer: edge-tts (Microsoft Neural Voices — hohe Qualitaet fuer Deutsch)
 * Fallback: System-TTS (macOS: say, Windows: PowerShell SAPI, Linux: espeak-ng)
 *
 * Cross-Platform: macOS, Windows, Linux
 */

import * as os from "node:os";
import * as fs from "node:fs";
import * as path from "node:path";
import { spawn, execSync } from "node:child_process";
import {
  ttsProcess, ttsActive, ttsParagraphs, ttsCurrentParagraph,
  ttsEngine, ttsVoice,
  setTtsProcess, setTtsActive, setTtsParagraphs, setTtsCurrentParagraph,
  setTtsEngine, setTtsEngineLabel,
  sectionRawMarkdown, currentScreen, PLATFORM_ROOT,
} from "./tui-state.ts";
import type { TtsEngine } from "./tui-state.ts";
import type { Screen } from "./tui-types.ts";

// Forward-declare to avoid circular: renderSectionReader will be set from tui-section-reader.ts
let _renderSectionReader: ((li: number, si: number, off: number) => void) | null = null;
export function setRenderSectionReader(fn: (li: number, si: number, off: number) => void): void {
  _renderSectionReader = fn;
}

// ─── Temp-Verzeichnis fuer TTS Audio-Dateien ─────────────────────────────

const TTS_TEMP_DIR = path.join(PLATFORM_ROOT, ".tts-cache");

function ensureTtsTempDir(): void {
  if (!fs.existsSync(TTS_TEMP_DIR)) {
    fs.mkdirSync(TTS_TEMP_DIR, { recursive: true });
  }
}

function cleanupTtsFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // Ignorieren — Datei wird spaeter aufgeraeumt
  }
}

// ─── Edge-TTS Erkennung ──────────────────────────────────────────────────

let _edgeTtsPath: string | null = null;
let _edgeTtsChecked = false;

function findEdgeTts(): string | null {
  if (_edgeTtsChecked) return _edgeTtsPath;
  _edgeTtsChecked = true;

  // Versuch 1: python3 -m edge_tts (funktioniert immer wenn pip install edge-tts)
  try {
    execSync("python3 -m edge_tts --version", { stdio: "ignore", timeout: 5000 });
    _edgeTtsPath = "python3-module";
    return _edgeTtsPath;
  } catch {
    // Nicht als Python-Modul verfuegbar
  }

  // Versuch 2: edge-tts direkt im PATH
  try {
    execSync("edge-tts --version", { stdio: "ignore", timeout: 5000 });
    _edgeTtsPath = "edge-tts";
    return _edgeTtsPath;
  } catch {
    // Nicht im PATH
  }

  // Versuch 3: Bekannte User-Installationspfade
  const userPaths = [
    path.join(os.homedir(), "Library", "Python", "3.9", "bin", "edge-tts"),
    path.join(os.homedir(), "Library", "Python", "3.10", "bin", "edge-tts"),
    path.join(os.homedir(), "Library", "Python", "3.11", "bin", "edge-tts"),
    path.join(os.homedir(), "Library", "Python", "3.12", "bin", "edge-tts"),
    path.join(os.homedir(), "Library", "Python", "3.13", "bin", "edge-tts"),
    path.join(os.homedir(), ".local", "bin", "edge-tts"),                   // Linux
    path.join(os.homedir(), "AppData", "Local", "Programs", "Python", "Python312", "Scripts", "edge-tts.exe"), // Windows
    path.join(os.homedir(), "AppData", "Local", "Programs", "Python", "Python311", "Scripts", "edge-tts.exe"),
    path.join(os.homedir(), "AppData", "Local", "Programs", "Python", "Python310", "Scripts", "edge-tts.exe"),
  ];

  for (const p of userPaths) {
    if (fs.existsSync(p)) {
      _edgeTtsPath = p;
      return _edgeTtsPath;
    }
  }

  _edgeTtsPath = null;
  return null;
}

// ─── Engine-Erkennung und Initialisierung ────────────────────────────────

/** Erkennt beim Start welche TTS-Engine verfuegbar ist */
export function detectTtsEngine(): void {
  const edgeTts = findEdgeTts();
  if (edgeTts) {
    setTtsEngine("edge-tts");
    setTtsEngineLabel("Edge Neural");
  } else {
    setTtsEngine("system");
    const platform = os.platform();
    if (platform === "darwin") {
      setTtsEngineLabel("macOS Say");
    } else if (platform === "win32") {
      setTtsEngineLabel("Windows SAPI");
    } else {
      setTtsEngineLabel("espeak");
    }
  }
}

// ─── Text-Extraktion ─────────────────────────────────────────────────────

/**
 * Extrahiert lesbaren Text aus Markdown-Quelltext.
 */
export function extractReadableText(markdown: string, fromLine: number): string {
  const lines = markdown.split("\n");
  const relevantLines = lines.slice(fromLine);

  let text = relevantLines
    .join("\n")
    .replace(/```mermaid[\s\S]*?```/g, " Diagramm uebersprungen. ")
    .replace(/```[\s\S]*?```/g, " Code-Beispiel uebersprungen. ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/^>\s*/gm, "")
    .replace(/^[-*_]{3,}$/gm, "")
    .replace(/^(\s*)([-*+]|\d+\.)\s+/gm, "$1")
    .replace(/[─═╔╗╚╝║╠╣╦╩┌┐└┘├┤┬┴│─]/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (text.length > 2000) {
    const truncated = text.slice(0, 2000);
    const lastSentence = truncated.lastIndexOf(". ");
    if (lastSentence > 1500) {
      text = truncated.slice(0, lastSentence + 1) + " Weiter scrollen fuer mehr.";
    } else {
      text = truncated + ". Weiter scrollen fuer mehr.";
    }
  }

  return text;
}

export function getMarkdownLineFromScroll(
  scrollOffset: number,
  totalRendered: number,
  totalMarkdown: number
): number {
  if (totalRendered <= 0) return 0;
  return Math.floor((scrollOffset / totalRendered) * totalMarkdown);
}

// ─── Stop TTS ────────────────────────────────────────────────────────────

export function stopTTS(): void {
  if (ttsProcess) {
    try {
      if (os.platform() === "win32") {
        spawn("taskkill", ["/PID", String(ttsProcess.pid), "/T", "/F"], {
          stdio: "ignore",
        });
      } else {
        // macOS + Linux: kill process tree
        spawn("kill", ["-9", String(ttsProcess.pid)], { stdio: "ignore" });
      }
    } catch {
      // Prozess war evtl. schon beendet
    }
    setTtsProcess(null);
  }
  setTtsActive(false);
  setTtsParagraphs([]);
  setTtsCurrentParagraph(0);
}

// ─── Edge-TTS Sprachsynthese ─────────────────────────────────────────────

function startEdgeTTS(text: string, onDone: () => void): void {
  ensureTtsTempDir();

  const tmpFile = path.join(TTS_TEMP_DIR, `tts-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.mp3`);
  const cleanText = text.replace(/\r\n/g, " ").replace(/\n/g, " ").trim();

  if (cleanText.length === 0) {
    onDone();
    return;
  }

  // Edge-TTS aufrufen — generiert MP3-Datei
  let genProc;
  const edgeTtsPath = findEdgeTts();

  if (edgeTtsPath === "python3-module") {
    genProc = spawn("python3", [
      "-m", "edge_tts",
      "--text", cleanText,
      "--voice", ttsVoice,
      "--write-media", tmpFile,
    ], { stdio: "ignore" });
  } else if (edgeTtsPath) {
    genProc = spawn(edgeTtsPath, [
      "--text", cleanText,
      "--voice", ttsVoice,
      "--write-media", tmpFile,
    ], { stdio: "ignore" });
  } else {
    // Sollte nicht passieren — Fallback
    onDone();
    return;
  }

  setTtsProcess(genProc);

  genProc.on("error", () => {
    cleanupTtsFile(tmpFile);
    setTtsProcess(null);
    setTtsActive(false);
  });

  genProc.on("exit", (code) => {
    if (!ttsActive) {
      cleanupTtsFile(tmpFile);
      setTtsProcess(null);
      return;
    }

    if (code !== 0 || !fs.existsSync(tmpFile)) {
      // Edge-TTS fehlgeschlagen — Fallback auf System-TTS fuer diesen Paragraph
      cleanupTtsFile(tmpFile);
      setTtsProcess(null);
      startSystemTTS(text, onDone);
      return;
    }

    // MP3 abspielen — plattformabhaengig
    playAudioFile(tmpFile, () => {
      cleanupTtsFile(tmpFile);
      onDone();
    });
  });
}

// ─── Audio-Datei abspielen (Cross-Platform) ──────────────────────────────

function playAudioFile(filePath: string, onDone: () => void): void {
  const platform = os.platform();
  let player;

  if (platform === "darwin") {
    // macOS: afplay (built-in)
    player = spawn("afplay", [filePath], { stdio: "ignore", detached: true });
  } else if (platform === "win32") {
    // Windows: PowerShell MediaPlayer
    player = spawn("powershell", [
      "-NoProfile", "-Command",
      `Add-Type -AssemblyName presentationCore; ` +
      `$player = New-Object System.Windows.Media.MediaPlayer; ` +
      `$player.Open([Uri]"${filePath.replace(/\\/g, "\\\\")}"); ` +
      `$player.Play(); ` +
      `Start-Sleep -Milliseconds 500; ` +
      `while ($player.Position -lt $player.NaturalDuration.TimeSpan) { Start-Sleep -Milliseconds 100 }; ` +
      `$player.Close();`,
    ], { stdio: "ignore", detached: true });
  } else {
    // Linux: mpv, ffplay, aplay oder paplay
    const linuxPlayers = ["mpv", "ffplay", "paplay"];
    let playerCmd: string | null = null;

    for (const p of linuxPlayers) {
      try {
        execSync(`which ${p}`, { stdio: "ignore", timeout: 2000 });
        playerCmd = p;
        break;
      } catch { /* nicht installiert */ }
    }

    if (!playerCmd) {
      // Letzter Versuch: aplay (nur WAV, nicht MP3)
      onDone();
      return;
    }

    if (playerCmd === "mpv") {
      player = spawn("mpv", ["--no-video", "--no-terminal", filePath], { stdio: "ignore", detached: true });
    } else if (playerCmd === "ffplay") {
      player = spawn("ffplay", ["-nodisp", "-autoexit", filePath], { stdio: "ignore", detached: true });
    } else {
      player = spawn(playerCmd, [filePath], { stdio: "ignore", detached: true });
    }
  }

  setTtsProcess(player);

  player.on("exit", () => {
    setTtsProcess(null);
    onDone();
  });

  player.on("error", () => {
    setTtsProcess(null);
    onDone();
  });
}

// ─── System-TTS Fallback (Cross-Platform) ────────────────────────────────

function startSystemTTS(text: string, onDone: () => void): void {
  const platform = os.platform();
  let proc;

  if (platform === "darwin") {
    // macOS: say-Befehl
    const cleanText = text.replace(/\r\n/g, " ").replace(/\n/g, " ");
    // Versuche Enhanced-Stimme, Fallback auf Default
    proc = spawn("say", ["-v", "Markus", cleanText], {
      stdio: "ignore",
      detached: true,
    });

    // Falls Markus nicht installiert → Fallback auf Default say
    proc.on("error", () => {
      proc = spawn("say", [cleanText], { stdio: "ignore", detached: true });
      setTtsProcess(proc);
      proc.on("exit", () => { setTtsProcess(null); onDone(); });
      proc.on("error", () => { setTtsProcess(null); setTtsActive(false); });
    });
  } else if (platform === "win32") {
    // Windows: PowerShell System.Speech (SAPI)
    const escaped = text
      .replace(/'/g, "''")
      .replace(/\r\n/g, " ")
      .replace(/\n/g, " ")
      .replace(/"/g, "'");

    proc = spawn(
      "powershell",
      [
        "-NoProfile",
        "-Command",
        `Add-Type -AssemblyName System.Speech; ` +
          `$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer; ` +
          `$synth.Rate = 1; ` +
          `$deVoice = $synth.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Culture.Name -like 'de-*' } | Select-Object -First 1; ` +
          `if ($deVoice) { $synth.SelectVoice($deVoice.VoiceInfo.Name) }; ` +
          `$synth.Speak('${escaped}');`,
      ],
      {
        stdio: "ignore",
        detached: true,
      }
    );
  } else {
    // Linux: espeak-ng (bevorzugt) oder espeak
    const cleanText = text.replace(/\r\n/g, " ").replace(/\n/g, " ");
    let espeakCmd = "espeak-ng";

    try {
      execSync("which espeak-ng", { stdio: "ignore", timeout: 2000 });
    } catch {
      espeakCmd = "espeak";
    }

    proc = spawn(espeakCmd, ["-v", "de", cleanText], {
      stdio: "ignore",
      detached: true,
    });
  }

  setTtsProcess(proc);

  proc.on("exit", () => {
    setTtsProcess(null);
    onDone();
  });

  proc.on("error", () => {
    setTtsProcess(null);
    setTtsActive(false);
  });
}

// ─── Unified TTS Start ──────────────────────────────────────────────────

function startTTSSingle(text: string, onDone: () => void): void {
  if (ttsEngine === "edge-tts" && findEdgeTts()) {
    startEdgeTTS(text, onDone);
  } else {
    startSystemTTS(text, onDone);
  }
}

// ─── Paragraph-Sequencer ─────────────────────────────────────────────────

export function readNextParagraph(): void {
  if (!ttsActive || ttsCurrentParagraph >= ttsParagraphs.length) {
    setTtsActive(false);
    setTtsProcess(null);
    // Redraw footer um Status zu aktualisieren
    if (currentScreen.type === "section" && _renderSectionReader) {
      const s = currentScreen as Extract<Screen, { type: "section" }>;
      _renderSectionReader(s.lessonIndex, s.sectionIndex, s.scrollOffset);
    }
    return;
  }

  const para = ttsParagraphs[ttsCurrentParagraph];
  setTtsCurrentParagraph(ttsCurrentParagraph + 1);

  startTTSSingle(para, () => {
    if (ttsActive) {
      readNextParagraph();
    }
  });
}

export function startTTSFromPosition(
  markdown: string,
  scrollOffset: number,
  totalRendered: number
): void {
  stopTTS();

  const totalMarkdown = markdown.split("\n").length;
  const fromLine = getMarkdownLineFromScroll(scrollOffset, totalRendered, totalMarkdown);
  const text = extractReadableText(markdown, fromLine);

  if (text.length === 0) return;

  setTtsParagraphs(text.split(/\n\n+/).filter((p) => p.trim().length > 0));
  setTtsCurrentParagraph(0);
  setTtsActive(true);

  readNextParagraph();
}
