/**
 * tui-tts.ts — Text-to-Speech Funktionen
 */

import * as os from "node:os";
import { spawn } from "node:child_process";
import {
  ttsProcess, ttsActive, ttsParagraphs, ttsCurrentParagraph,
  setTtsProcess, setTtsActive, setTtsParagraphs, setTtsCurrentParagraph,
  sectionRawMarkdown, currentScreen,
} from "./tui-state.ts";
import type { Screen } from "./tui-types.ts";

// Forward-declare to avoid circular: renderSectionReader will be set from tui-section-reader.ts
let _renderSectionReader: ((li: number, si: number, off: number) => void) | null = null;
export function setRenderSectionReader(fn: (li: number, si: number, off: number) => void): void {
  _renderSectionReader = fn;
}

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

export function stopTTS(): void {
  if (ttsProcess) {
    try {
      if (os.platform() === "darwin") {
        spawn("kill", ["-9", String(ttsProcess.pid)], { stdio: "ignore" });
      } else {
        spawn("taskkill", ["/PID", String(ttsProcess.pid), "/T", "/F"], {
          stdio: "ignore",
        });
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

function startTTSSingle(text: string, onDone: () => void): void {
  let proc;
  if (os.platform() === "darwin") {
    const cleanText = text.replace(/\r\n/g, " ").replace(/\n/g, " ");
    proc = spawn("say", [cleanText], {
      stdio: "ignore",
      detached: true,
    });
  } else {
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
