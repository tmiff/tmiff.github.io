// Renders each published film title as a PNG in the typeface used on the printed certificates.
//
// The certificate typeface (Perpetua Italic) is licensed with Microsoft 365 for use on this
// computer. Only the rendered images are written into the site; the font file itself is read in
// place and is never copied into the repository or the built site.
//
// Usage: npm run generate:winner-titles
// Set TITLE_FONT_FILE to use a font file at another location.
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { create } from "fontkitten";
import sharp from "sharp";

const root = process.cwd();
const fontFile = process.env.TITLE_FONT_FILE || "/Applications/Microsoft PowerPoint.app/Contents/Resources/DFonts/Perpetua Italic.ttf";
const records = JSON.parse(await fs.readFile(path.join(root, "src/content/winners/records.json"), "utf8"));
const manifestPath = path.join(root, "src/content/winners/title-images.json");

// Display size of the title in CSS pixels, and the pixel density the PNG is rendered at so it stays
// sharp on high-density screens.
const fontSize = 48;
const density = 3;
// White, because the results page is set on black.
const ink = "#ffffff";

let fontData;
try {
  fontData = await fs.readFile(fontFile);
} catch {
  console.error(`The certificate font was not found: ${fontFile}\nSet TITLE_FONT_FILE to its location.`);
  process.exit(1);
}
const font = create(fontData);
const scale = (fontSize * density) / font.unitsPerEm;

const slugify = (value) => value.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function renderSvg(text) {
  let pen = 0;
  let minX = 0;
  let maxX = 0;
  const paths = [];
  for (const character of text) {
    const glyph = font.glyphForCodePoint(character.codePointAt(0));
    const box = glyph.path.bbox;
    if (Number.isFinite(box.minX)) {
      minX = Math.min(minX, pen + box.minX);
      maxX = Math.max(maxX, pen + box.maxX);
      paths.push(`<path transform="translate(${pen} 0)" d="${glyph.path.toSVG()}"/>`);
    }
    pen += glyph.advanceWidth;
  }
  // Every title uses the same height, from the font's ascent to its descent, so titles with and
  // without descenders share one baseline. The width covers the italic overhang of the last letter.
  const left = Math.min(0, minX);
  const right = Math.max(pen, maxX);
  const width = Math.ceil((right - left) * scale);
  const height = Math.ceil((font.ascent - font.descent) * scale);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <g fill="${ink}" transform="translate(${-left * scale} ${font.ascent * scale}) scale(${scale} ${-scale})">${paths.join("")}</g>
</svg>`;
  return { svg, width, height };
}

const manifest = {};
for (const cycle of records) {
  const directory = path.join(root, "public/images/winners", cycle.cycleId);
  await fs.mkdir(directory, { recursive: true });
  // The opening screening is set in the same typeface as the award-winning titles.
  const titles = [...(cycle.awards || []), ...(cycle.openingScreening ? [cycle.openingScreening] : [])];
  for (const award of titles) {
    const slug = slugify(award.filmTitle);
    // The image shows the title line as printed on the certificate when it differs from the film title.
    const { svg, width, height } = renderSvg(award.displayTitle || award.filmTitle);
    const file = path.join(directory, `${slug}.png`);
    await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(file);
    manifest[`${cycle.cycleId}:${award.filmTitle}`] = {
      src: `/images/winners/${cycle.cycleId}/${slug}.png`,
      width: Math.round(width / density),
      height: Math.round(height / density)
    };
    console.log(`${cycle.cycleId}  ${award.displayTitle || award.filmTitle}  →  ${slug}.png (${width}x${height})`);
  }
}
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${Object.keys(manifest).length} title images.`);
