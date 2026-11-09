#!/usr/bin/env node
// cya-brand-check: flags colours, fonts and copy that drift from CYA Design System 2.0.
// Usage: cya-brand-check [paths...] [--copy <path>]... [--warn]
// Config (optional): cya-brand.config.json in the working directory:
//   { "paths": ["app", "components"], "copy": ["content"], "ignore": ["superseded"], "allowColours": ["#000000"] }
// Add the comment cya-brand-ignore to a line to skip it (for internal-only strings).
// Exit code 1 when errors are found, unless --warn is passed.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname, relative } from "node:path";

const palette = JSON.parse(readFileSync(new URL("../dist/palette.json", import.meta.url)));
const cwd = process.cwd();
const cfgPath = join(cwd, "cya-brand.config.json");
const cfg = existsSync(cfgPath) ? JSON.parse(readFileSync(cfgPath, "utf8")) : {};

const args = process.argv.slice(2);
const warnOnly = args.includes("--warn");
const paths = [];
const copy = [...(cfg.copy || [])];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--copy") copy.push(args[++i]);
  else if (!args[i].startsWith("--")) paths.push(args[i]);
}
if (!paths.length) paths.push(...(cfg.paths || ["app", "components", "src", "styles"]));

const ignore = new Set(["node_modules", ".next", "dist", "build", ".git", "superseded", ...(cfg.ignore || [])]);
const allowed = new Set([...palette.hex, ...(cfg.allowColours || []).map((c) => c.toLowerCase())]);
const CODE = new Set([".css", ".scss", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".html", ".mdx"]);
const COPY = new Set([".ts", ".tsx", ".js", ".json", ".md", ".mdx", ".html", ".txt"]);
const BANNED_FONTS = /\b(Plus Jakarta Sans|Plus_Jakarta_Sans|Instrument Sans|Instrument_Sans|Inter|Montserrat|Poppins)\b/;

const issues = [];
const add = (file, line, rule, detail) => issues.push({ file: relative(cwd, file), line, rule, detail });

function walk(p, exts, visit) {
  if (!existsSync(p)) return;
  const s = statSync(p);
  if (s.isDirectory()) {
    for (const e of readdirSync(p)) if (!ignore.has(e)) walk(join(p, e), exts, visit);
  } else if (exts.has(extname(p))) visit(p);
}

const expand = (h) => {
  h = h.toLowerCase();
  if (h.length === 4) return "#" + [...h.slice(1)].map((c) => c + c).join("");
  if (h.length === 9) return h.slice(0, 7); // alpha suffix: judge the base colour
  return h;
};

for (const root of paths) {
  walk(join(cwd, root), CODE, (file) => {
    readFileSync(file, "utf8").split("\n").forEach((text, i) => {
      if (text.includes("cya-brand-ignore")) return;
      for (const m of text.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
        const raw = m[0];
        if (![4, 7, 9].includes(raw.length)) continue;
        const before = text.slice(0, m.index);
        if (/(href|id|url)\s*=\s*["'{][^"']*$/.test(before) || /["']\/[^"']*$/.test(before)) continue; // anchors and paths
        const hex = expand(raw);
        if (!allowed.has(hex)) add(file, i + 1, "colour", `${raw} is not in the CYA palette`);
      }
      const font = text.match(BANNED_FONTS);
      if (font) add(file, i + 1, "font", `${font[0]}: use Urbanist (headings) or Open Sans (body)`);
    });
  });
}

for (const root of copy) {
  walk(join(cwd, root), COPY, (file) => {
    readFileSync(file, "utf8").split("\n").forEach((text, i) => {
      if (text.includes("cya-brand-ignore")) return;
      if (/\bprogrammes?\b/i.test(text)) add(file, i + 1, "spelling", 'use "program", not "programme"');
      if (/\u2014/.test(text)) add(file, i + 1, "punctuation", "em dash in copy");
      for (const m of text.matchAll(/["'`][^"'`]*\bCYA\b(?![_-])[^"'`]*["'`]/g)) {
        add(file, i + 1, "naming", `"CYA" in public copy: write "Corporate Yoga Australia" (${m[0].slice(0, 60)})`);
      }
    });
  });
}

const byRule = {};
for (const x of issues) (byRule[x.rule] ||= []).push(x);
for (const [rule, list] of Object.entries(byRule)) {
  console.log(`\n${rule} (${list.length})`);
  for (const x of list.slice(0, 200)) console.log(`  ${x.file}:${x.line}  ${x.detail}`);
  if (list.length > 200) console.log(`  ...and ${list.length - 200} more`);
}
console.log(`\nCYA brand check (palette ${palette.version}): ${issues.length ? issues.length + " issue(s)" : "no issues"}`);
process.exit(issues.length && !warnOnly ? 1 : 0);
