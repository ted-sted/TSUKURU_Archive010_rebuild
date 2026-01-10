import fs from "node:fs/promises";
import { JSDOM } from "jsdom";

/**
 * Extract visible-ish text from an HTML file.
 * - Drops script/style/noscript
 * - Normalizes whitespace and NBSP
 */
export async function extractVisibleText(htmlPath) {
  const html = await fs.readFile(htmlPath, "utf8");
  const dom = new JSDOM(html);
  const { document } = dom.window;

  for (const sel of ["script", "style", "noscript"]) {
    document.querySelectorAll(sel).forEach((n) => n.remove());
  }

  const root = document.body ?? document.documentElement;
  const raw = root?.textContent ?? "";

  return raw
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
