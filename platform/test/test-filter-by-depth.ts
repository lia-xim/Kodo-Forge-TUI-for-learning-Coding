/**
 * Tests fuer filterByDepth und validateDepthMarkers.
 */

import { filterByDepth, validateDepthMarkers } from "../src/markdown-renderer.ts";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  PASS: ${message}`);
  } else {
    failed++;
    console.error(`  FAIL: ${message}`);
  }
}

// ── Test 1: No markers → content unchanged ──────────────────────────────────

console.log("\nTest 1: No markers - content unchanged");
{
  const input = "# Hello\n\nThis is some text.\n\n- Item 1\n- Item 2\n";
  const result = filterByDepth(input, "kurz");
  assert(result === input, "kurz: no markers → unchanged");
  assert(filterByDepth(input, "standard") === input, "standard: no markers → unchanged");
  assert(filterByDepth(input, "vollständig") === input, "vollständig: no markers → unchanged");
}

// ── Test 2: Summary always visible ──────────────────────────────────────────

console.log("\nTest 2: Summary always visible");
{
  const input = [
    "<!-- section:summary -->",
    "This is the summary.",
    "<!-- /depth -->",
  ].join("\n");

  const kurz = filterByDepth(input, "kurz");
  const standard = filterByDepth(input, "standard");
  const full = filterByDepth(input, "vollständig");

  assert(kurz.includes("This is the summary."), "kurz: summary visible");
  assert(standard.includes("This is the summary."), "standard: summary visible");
  assert(full.includes("This is the summary."), "vollständig: summary visible");

  // Markers should be removed
  assert(!kurz.includes("<!-- section:summary -->"), "kurz: markers removed");
  assert(!full.includes("<!-- /depth -->"), "vollständig: closing marker removed");
}

// ── Test 3: Standard visible at standard/vollständig but not kurz ────────────

console.log("\nTest 3: Standard depth visible at standard/vollständig but not kurz");
{
  const input = [
    "<!-- section:summary -->",
    "Summary line.",
    "<!-- /depth -->",
    "",
    "<!-- depth:standard -->",
    "Standard detail here.",
    "<!-- /depth -->",
  ].join("\n");

  const kurz = filterByDepth(input, "kurz");
  const standard = filterByDepth(input, "standard");
  const full = filterByDepth(input, "vollständig");

  assert(!kurz.includes("Standard detail here."), "kurz: standard content hidden");
  assert(standard.includes("Standard detail here."), "standard: standard content visible");
  assert(full.includes("Standard detail here."), "vollständig: standard content visible");

  // Summary still visible at all levels
  assert(kurz.includes("Summary line."), "kurz: summary still visible");
  assert(standard.includes("Summary line."), "standard: summary still visible");
}

// ── Test 4: Vollständig only visible at vollständig ─────────────────────────

console.log("\nTest 4: Vollständig only visible at vollständig");
{
  const input = [
    "<!-- section:summary -->",
    "Summary line.",
    "<!-- /depth -->",
    "",
    "<!-- depth:standard -->",
    "Standard detail.",
    "<!-- /depth -->",
    "",
    "<!-- depth:vollstaendig -->",
    "Full detail here.",
    "<!-- /depth -->",
  ].join("\n");

  const kurz = filterByDepth(input, "kurz");
  const standard = filterByDepth(input, "standard");
  const full = filterByDepth(input, "vollständig");

  assert(!kurz.includes("Full detail here."), "kurz: vollstaendig hidden");
  assert(!standard.includes("Full detail here."), "standard: vollstaendig hidden");
  assert(full.includes("Full detail here."), "vollständig: vollstaendig visible");

  // Umlaut variant
  const inputUmlaut = [
    "<!-- depth:vollständig -->",
    "Umlaut variant content.",
    "<!-- /depth -->",
  ].join("\n");

  assert(
    !filterByDepth(inputUmlaut, "standard").includes("Umlaut variant content."),
    "standard: umlaut variant hidden"
  );
  assert(
    filterByDepth(inputUmlaut, "vollständig").includes("Umlaut variant content."),
    "vollständig: umlaut variant visible"
  );
}

// ── Test 5: Unmarked content always visible ─────────────────────────────────

console.log("\nTest 5: Unmarked content always visible");
{
  const input = [
    "# Title",
    "",
    "Always visible text.",
    "",
    "<!-- section:summary -->",
    "Summary.",
    "<!-- /depth -->",
    "",
    "More unmarked text.",
  ].join("\n");

  const kurz = filterByDepth(input, "kurz");
  const standard = filterByDepth(input, "standard");
  const full = filterByDepth(input, "vollständig");

  assert(kurz.includes("Always visible text."), "kurz: unmarked visible");
  assert(kurz.includes("# Title"), "kurz: heading visible");
  assert(kurz.includes("More unmarked text."), "kurz: trailing unmarked visible");

  assert(standard.includes("Always visible text."), "standard: unmarked visible");
  assert(full.includes("Always visible text."), "vollständig: unmarked visible");
}

// ── Test 6: validateDepthMarkers detects unbalanced markers ─────────────────

console.log("\nTest 6: validateDepthMarkers detects unbalanced markers");
{
  // Valid markdown
  const valid = [
    "<!-- section:summary -->",
    "Summary.",
    "<!-- /depth -->",
    "<!-- depth:standard -->",
    "Detail.",
    "<!-- /depth -->",
  ].join("\n");
  assert(validateDepthMarkers(valid) === null, "valid: no warning");

  // No markers at all
  assert(validateDepthMarkers("# Hello\n\nText.") === null, "no markers: no warning");

  // Missing closing tag
  const unclosed = [
    "<!-- section:summary -->",
    "Summary.",
    "<!-- depth:standard -->",
    "Detail.",
  ].join("\n");
  const unclosedWarning = validateDepthMarkers(unclosed);
  assert(unclosedWarning !== null, "unclosed: warning returned");
  assert(
    unclosedWarning!.includes("Unausgeglichene"),
    `unclosed: correct warning message, got: "${unclosedWarning}"`
  );

  // Depth markers without summary
  const noSummary = [
    "<!-- depth:standard -->",
    "Detail.",
    "<!-- /depth -->",
  ].join("\n");
  const noSummaryWarning = validateDepthMarkers(noSummary);
  assert(noSummaryWarning !== null, "no summary: warning returned");
  assert(
    noSummaryWarning!.includes("section:summary"),
    `no summary: correct warning message, got: "${noSummaryWarning}"`
  );

  // Extra closing tag
  const extraClose = [
    "<!-- section:summary -->",
    "Summary.",
    "<!-- /depth -->",
    "<!-- /depth -->",
  ].join("\n");
  const extraCloseWarning = validateDepthMarkers(extraClose);
  assert(extraCloseWarning !== null, "extra close: warning returned");
}

// ── Summary ─────────────────────────────────────────────────────────────────

console.log(`\n${"=".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error(`\n${failed} test(s) FAILED!`);
  process.exit(1);
} else {
  console.log("\nAll tests PASSED!");
}
