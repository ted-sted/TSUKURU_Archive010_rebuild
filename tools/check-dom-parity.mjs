import path from "node:path";
import fs from "node:fs/promises";
import { JSDOM } from "jsdom";

function norm(s) {
  return String(s ?? "")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function readDoc(htmlPath) {
  const html = await fs.readFile(htmlPath, "utf8");
  const dom = new JSDOM(html);
  return dom.window.document;
}

function extractIds(doc) {
  const ids = Array.from(doc.querySelectorAll("[id]"))
    .map((el) => el.getAttribute("id"))
    .filter(Boolean)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const counts = new Map();
  for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
  const dups = Array.from(counts.entries()).filter(([, c]) => c > 1);

  return { ids: Array.from(new Set(ids)).sort(), dups };
}

function extractKeyAnchors(doc) {
  const nodes = Array.from(doc.querySelectorAll("main, section[id], article[id]"));
  return nodes
    .map((el) => {
      const tag = el.tagName.toLowerCase();
      const id = el.getAttribute("id") || "";
      const h = el.querySelector("h1,h2,h3,h4,h5,h6");
      const heading = h ? `${h.tagName.toLowerCase()}:${norm(h.textContent)}` : "";
      return `${tag}#${id} ${heading}`.trim();
    })
    .filter(Boolean);
}

function diffList(a, b) {
  const sa = new Set(a);
  const sb = new Set(b);
  const onlyA = a.filter((x) => !sb.has(x));
  const onlyB = b.filter((x) => !sa.has(x));
  return { onlyA, onlyB };
}

const repoRoot = process.cwd();
const legacyHtml = path.join(repoRoot, "legacy", "index.html");
const newHtml = path.join(repoRoot, "new", "index.html");

const legacyDoc = await readDoc(legacyHtml);
const newDoc = await readDoc(newHtml);

const legacyIds = extractIds(legacyDoc);
const newIds = extractIds(newDoc);

let ok = true;

if (legacyIds.dups.length || newIds.dups.length) {
  ok = false;
  console.error("NG: duplicate IDs detected");
  if (legacyIds.dups.length) console.error("legacy duplicates:", legacyIds.dups);
  if (newIds.dups.length) console.error("new duplicates:", newIds.dups);
}

const idDiff = diffList(legacyIds.ids, newIds.ids);
if (idDiff.onlyA.length || idDiff.onlyB.length) {
  ok = false;
  console.error("NG: id set differs between legacy and new");
  if (idDiff.onlyA.length) console.error("only in legacy:", idDiff.onlyA);
  if (idDiff.onlyB.length) console.error("only in new:", idDiff.onlyB);
} else {
  console.log(`OK: id parity (${legacyIds.ids.length} ids)`);
}

const legacyAnchors = extractKeyAnchors(legacyDoc);
const newAnchors = extractKeyAnchors(newDoc);

const anchorDiff = diffList(legacyAnchors, newAnchors);
if (anchorDiff.onlyA.length || anchorDiff.onlyB.length) {
  ok = false;
  console.error("NG: key anchors differ (section/article ids + headings)");
  if (anchorDiff.onlyA.length) console.error("only in legacy (sample):", anchorDiff.onlyA.slice(0, 20));
  if (anchorDiff.onlyB.length) console.error("only in new (sample):", anchorDiff.onlyB.slice(0, 20));
} else {
  console.log(`OK: key anchor parity (${legacyAnchors.length} anchors)`);
}

process.exit(ok ? 0 : 1);
