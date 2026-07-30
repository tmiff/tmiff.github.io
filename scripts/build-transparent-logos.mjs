import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const brandDir = path.resolve("public/images/brand");
const sourcePath = path.join(brandDir, "tmiff-logo-source.png");

await mkdir(brandDir, { recursive: true });

const { data: source, info: sourceInfo } = await sharp(sourcePath)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const transparent = Buffer.alloc(sourceInfo.width * sourceInfo.height * 4);

for (let sourceIndex = 0, outputIndex = 0; sourceIndex < source.length; sourceIndex += 3, outputIndex += 4) {
  const red = source[sourceIndex];
  const green = source[sourceIndex + 1];
  const blue = source[sourceIndex + 2];
  const luminance = Math.round(0.2126 * red + 0.7152 * green + 0.0722 * blue);

  transparent[outputIndex] = 255;
  transparent[outputIndex + 1] = 255;
  transparent[outputIndex + 2] = 255;
  transparent[outputIndex + 3] = luminance;
}

const combined = await sharp(transparent, {
  raw: {
    width: sourceInfo.width,
    height: sourceInfo.height,
    channels: 4,
  },
})
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

const { data: combinedRaw, info: combinedInfo } = await sharp(combined)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const occupiedRows = [];
for (let y = 0; y < combinedInfo.height; y += 1) {
  let occupied = false;
  for (let x = 0; x < combinedInfo.width; x += 1) {
    if (combinedRaw[(y * combinedInfo.width + x) * 4 + 3] > 8) {
      occupied = true;
      break;
    }
  }
  if (occupied) occupiedRows.push(y);
}

const rowGroups = [];
let groupStart = occupiedRows[0];
let previousRow = occupiedRows[0];

for (const row of occupiedRows.slice(1)) {
  if (row > previousRow + 1) {
    rowGroups.push([groupStart, previousRow]);
    groupStart = row;
  }
  previousRow = row;
}
rowGroups.push([groupStart, previousRow]);

if (rowGroups.length !== 2) {
  throw new Error(`Expected two separated logo rows, found ${rowGroups.length}. Review the source image manually.`);
}

const [[markTop, markBottom], [nameTop, nameBottom]] = rowGroups;
const mark = await sharp(combined)
  .extract({ left: 0, top: markTop, width: combinedInfo.width, height: markBottom - markTop + 1 })
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();
const name = await sharp(combined)
  .extract({ left: 0, top: nameTop, width: combinedInfo.width, height: nameBottom - nameTop + 1 })
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

await Promise.all([
  sharp(combined).toFile(path.join(brandDir, "tmiff-logo-transparent.png")),
  sharp(mark).toFile(path.join(brandDir, "tmiff-mark-transparent.png")),
  sharp(name).toFile(path.join(brandDir, "tmiff-name-transparent.png")),
]);

const [combinedMetadata, markMetadata, nameMetadata] = await Promise.all([
  sharp(combined).metadata(),
  sharp(mark).metadata(),
  sharp(name).metadata(),
]);

console.log({
  combined: `${combinedMetadata.width}x${combinedMetadata.height}`,
  mark: `${markMetadata.width}x${markMetadata.height}`,
  name: `${nameMetadata.width}x${nameMetadata.height}`,
});
