import path from "node:path";
import { extractVisibleText } from "./extract-visible-text.mjs";

function firstDiffIndex(a, b) {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) return i;
  }
  return a.length === b.length ? -1 : len;
}

function contextAround(s, i, radius = 80) {
  const start = Math.max(0, i - radius);
  const end = Math.min(s.length, i + radius);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < s.length ? "…" : "";
  return prefix + s.slice(start, end) + suffix;
}

const repoRoot = process.cwd();
const legacyHtml = path.join(repoRoot, "legacy", "index.html");
const newHtml = path.join(repoRoot, "new", "index.html");

const legacyText = await extractVisibleText(legacyHtml);
const newText = await extractVisibleText(newHtml);

if (legacyText === newText) {
  console.log("OK: visible text parity (legacy/index.html == new/index.html)");
  process.exit(0);
}

const idx = firstDiffIndex(legacyText, newText);
console.error("NG: visible text differs between legacy and new");
console.error(`legacy length: ${legacyText.length}`);
console.error(`new    length: ${newText.length}`);
console.error(`first diff index: ${idx}`);

console.error("\nlegacy context:");
console.error(contextAround(legacyText, Math.max(0, idx)));

console.error("\nnew context:");
console.error(contextAround(newText, Math.max(0, idx)));

process.exit(1);
