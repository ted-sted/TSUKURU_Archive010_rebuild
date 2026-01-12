import fs from "node:fs/promises";
import path from "node:path";
import { JSDOM } from "jsdom";

const repoRoot = process.cwd();
const htmlPath = path.join(repoRoot, "new", "index.html");
const outPath = path.join(repoRoot, "docs", "dom-inventory.md");

const html = await fs.readFile(htmlPath, "utf8");
const dom = new JSDOM(html);
const { document } = dom.window;

function textOf(el) {
  return (el?.textContent ?? "")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function short(s, n = 120) {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + "…";
}

const sections = Array.from(document.querySelectorAll("section, main, header, footer, nav, article"))
  .map((el) => {
    const id = el.getAttribute("id") || "";
    const cls = el.getAttribute("class") || "";
    const role = el.tagName.toLowerCase();

    // nearest heading inside
    const h = el.querySelector("h1,h2,h3,h4,h5,h6");
    const heading = h ? `${h.tagName.toLowerCase()}: ${short(textOf(h))}` : "";

    return { role, id, cls, heading };
  });

const ids = Array.from(document.querySelectorAll("[id]"))
  .map((el) => ({
    tag: el.tagName.toLowerCase(),
    id: el.getAttribute("id"),
    cls: el.getAttribute("class") || ""
  }))
  .filter((x) => x.id && x.id.trim().length > 0);

const dataAttrs = Array.from(document.querySelectorAll("*"))
  .flatMap((el) => Array.from(el.attributes)
    .filter((a) => a.name.startsWith("data-"))
    .map((a) => ({ tag: el.tagName.toLowerCase(), id: el.getAttribute("id") || "", attr: a.name, val: a.value }))
  );

let md = "";
md += `# DOM Inventory (new/index.html)\n\n`;
md += `Generated: ${new Date().toISOString()}\n\n`;

md += `## High-level landmarks (section/main/header/footer/nav/article)\n\n`;
md += `| tag | id | class | first heading |\n|---|---|---|---|\n`;
for (const s of sections) {
  md += `| ${s.role} | ${s.id || ""} | ${s.cls || ""} | ${s.heading || ""} |\n`;
}

md += `\n## All elements with id\n\n`;
md += `| tag | id | class |\n|---|---|---|\n`;
for (const x of ids) {
  md += `| ${x.tag} | ${x.id} | ${x.cls} |\n`;
}

md += `\n## data-* attributes\n\n`;
md += `| tag | id | data-* | value |\n|---|---|---|---|\n`;
for (const d of dataAttrs) {
  md += `| ${d.tag} | ${d.id || ""} | ${d.attr} | ${String(d.val).replace(/\|/g, "\\|")} |\n`;
}

await fs.mkdir(path.join(repoRoot, "docs"), { recursive: true });
await fs.writeFile(outPath, md, "utf8");
console.log("Wrote:", outPath);
