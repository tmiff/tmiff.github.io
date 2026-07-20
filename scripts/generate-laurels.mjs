import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const root = process.cwd();
const site = JSON.parse(await fs.readFile(path.join(root, "src/config/site.json"), "utf8"));
const awards = JSON.parse(await fs.readFile(path.join(root, "src/config/awards.json"), "utf8"));

if (site.status !== "ready" || !site.festivalName || site.festivalName === "Festival Working Title") {
  console.error("Laurels cannot be generated until the approved festival name is configured.");
  process.exit(1);
}

const output = path.join(root, "public/images/laurels");
await fs.mkdir(output, { recursive: true });
const escapeXml = (value) => String(value).replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;" }[character]));
const fittedSize = (value, maximum, targetCharacters, minimum) => Math.max(minimum, Math.min(maximum, Math.floor(maximum * targetCharacters / Math.max(String(value).length, targetCharacters))));

for (const division of awards.divisions) {
  for (const award of awards.categories) {
    const slug = `${division.id}-${award.id}`;
    const festivalLabel = site.festivalName.toUpperCase();
    const awardLabel = award.en.toUpperCase();
    const divisionLabel = division.en.toUpperCase();
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(site.festivalName)} ${escapeXml(award.en)} laurel</title>
  <desc id="desc">Editable monochrome laurel for confirmed winners.</desc>
  <g fill="none" stroke="#FFFFFF" stroke-width="18" stroke-linecap="round">
    <path d="M420 700 C260 560 250 330 400 190"/>
    <path d="M1180 700 C1340 560 1350 330 1200 190"/>
    <path d="M390 620 l-95 -45 M370 530 l-105 -20 M370 435 l-98 10 M395 340 l-85 45 M1210 620 l95 -45 M1230 530 l105 -20 M1230 435 l98 10 M1205 340 l85 45"/>
  </g>
  <g fill="#FFFFFF" text-anchor="middle" font-family="Arial, Helvetica, sans-serif">
    <text x="800" y="280" font-size="${fittedSize(festivalLabel, 46, 28, 28)}" font-weight="700">${escapeXml(festivalLabel)}</text>
    <text x="800" y="415" font-size="${fittedSize(awardLabel, 78, 18, 44)}" font-weight="700">${escapeXml(awardLabel)}</text>
    <text x="800" y="505" font-size="${fittedSize(divisionLabel, 42, 24, 30)}">${escapeXml(divisionLabel)}</text>
    <text x="800" y="610" font-size="34">MONTHLY WINNER</text>
  </g>
</svg>`;
    const svgPath = path.join(output, `${slug}.svg`);
    await fs.writeFile(svgPath, svg, "utf8");
    await sharp(Buffer.from(svg)).png().toFile(path.join(output, `${slug}.png`));
  }
}

console.log(`Generated ${awards.divisions.length * awards.categories.length} editable SVG laurels and transparent PNG exports.`);
