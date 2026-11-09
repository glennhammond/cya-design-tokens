// Builds dist/ from src/tokens.json. No dependencies.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const t = JSON.parse(readFileSync(new URL("../src/tokens.json", import.meta.url)));
const out = new URL("../dist/", import.meta.url);
mkdirSync(out, { recursive: true });
const banner = `/* CYA Design Tokens ${t.version}. Generated from src/tokens.json by scripts/build.mjs. Do not edit. */\n`;
const P = "--cya-";

const colour = Object.fromEntries(t.color.tokens.map((x) => [x.name, x.value]));
const isAlias = (v) => typeof v === "string" && v.startsWith("{");
const resolve = (v) => { let n = 0; while (isAlias(v)) { v = colour[v.slice(1, -1)]; if (++n > 16 || v === undefined) throw new Error("Bad alias"); } return v; };
const cssValue = (v) => (isAlias(v) ? `var(${P}${v.slice(1, -1)})` : v);

// tokens.css
let css = banner + ":root {\n";
for (const x of t.color.tokens) css += `  ${P}${x.name}: ${cssValue(x.value)};\n`;
for (const fam of ["spacing", "radius", "shadow", "layout"]) for (const x of t[fam].tokens) css += `  ${P}${x.name}: ${x.value};\n`;
// next/font sets --font-cya-heading and --font-cya-body; without it the self-hosted faces in fonts.css apply.
for (const [k, v] of Object.entries(t.type.families)) {
  const [first, ...rest] = v.split(",");
  css += `  ${P}font-${k}: var(--font-cya-${k}, ${first.trim()}), ${rest.map((r) => r.trim()).join(", ")};\n`;
}
css += "}\n";
writeFileSync(new URL("tokens.css", out), css);

// fonts.css
let fonts = banner;
for (const f of t.type.fonts) {
  fonts += `@font-face {\n  font-family: "${f.family}";\n  font-style: ${f.style || "normal"};\n  font-weight: ${f.weight};\n  font-display: swap;\n  src: url("../${f.file}") format("woff2");\n}\n`;
}
writeFileSync(new URL("fonts.css", out), fonts);

// type.css: one class per text style, fluid where the style defines it
let type = banner + "@layer components {\n";
for (const g of t.type.groups) for (const s of g.styles) {
  const fam = s.family || g.family;
  type += `  .cya-${s.name} {\n    font-family: var(${P}font-${fam});\n    font-size: ${s.fluid || s.fontSize};\n    line-height: ${s.lineHeight};\n    font-weight: ${s.fontWeight};\n`;
  if (s.letterSpacing) type += `    letter-spacing: ${s.letterSpacing};\n`;
  if (s.name === "kicker") type += "    text-transform: uppercase;\n";
  type += "  }\n";
}
type += "}\n";
writeFileSync(new URL("type.css", out), type);

// theme.css: Tailwind 4 mapping. Colours become bg-teal, text-charcoal, border-control and so on.
let theme = banner + "/* Import after @import \"tailwindcss\". */\n@theme inline {\n";
for (const x of t.color.tokens) theme += `  --color-${x.name}: var(${P}${x.name});\n`;
theme += `  --font-heading: var(${P}font-heading);\n  --font-body: var(${P}font-body);\n  --font-sans: var(${P}font-body);\n`;
for (const x of t.radius.tokens) if (x.name !== "radius-none") theme += `  --${x.name}: var(${P}${x.name});\n`;
theme += `  --shadow-raised: var(${P}shadow-raised);\n  --container-site: var(${P}container-max);\n  --container-narrow: var(${P}container-narrow);\n}\n`;
writeFileSync(new URL("theme.css", out), theme);

// tokens.js and tokens.d.ts: resolved values for JavaScript (charts, emails, PDFs)
const resolved = Object.fromEntries(t.color.tokens.map((x) => [x.name, resolve(x.value)]));
const pick = (fam) => Object.fromEntries(t[fam].tokens.map((x) => [x.name, x.value]));
const js = {
  version: t.version,
  colors: resolved,
  fonts: t.type.families,
  space: pick("spacing"),
  radius: pick("radius"),
  shadow: pick("shadow"),
  layout: pick("layout"),
};
writeFileSync(new URL("tokens.js", out), `${banner}export const tokens = ${JSON.stringify(js, null, 2)};\nexport default tokens;\n`);
const keys = (o) => Object.keys(o).map((k) => JSON.stringify(k)).join(" | ");
writeFileSync(new URL("tokens.d.ts", out), `${banner}export declare const tokens: {
  version: string;
  colors: Record<${keys(resolved)}, string>;
  fonts: Record<${keys(t.type.families)}, string>;
  space: Record<${keys(js.space)}, string>;
  radius: Record<${keys(js.radius)}, string>;
  shadow: Record<${keys(js.shadow)}, string>;
  layout: Record<${keys(js.layout)}, string>;
};
export default tokens;
`);

// palette.json: the allowed colour list, read by the brand check
const hexes = [...new Set(Object.entries(resolved).filter(([k]) => !k.startsWith("logo-")).map(([, v]) => v).filter((v) => v.startsWith("#")).map((v) => v.toLowerCase()))].sort();
writeFileSync(new URL("palette.json", out), JSON.stringify({ version: t.version, hex: hexes }, null, 2) + "\n");

console.log(`Built CYA Design Tokens ${t.version}: ${t.color.tokens.length} colours, ${t.type.fonts.length} font files.`);

// Hand-written stylesheets are copied through with the banner.
for (const f of ["base.css", "components.css", "index.css"]) {
  writeFileSync(new URL(f, out), banner + readFileSync(new URL(`../src/css/${f}`, import.meta.url), "utf8"));
}
