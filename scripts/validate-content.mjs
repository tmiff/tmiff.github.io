import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const root = process.cwd();
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const errors = [];

const en = readJson("src/content/en/pages.json");
const ja = readJson("src/content/ja/pages.json");
const schedule = readJson("src/config/schedule.json");
const awards = readJson("src/config/awards.json");
const imageSlots = readJson("src/config/image-slots.json");
const winners = readJson("src/content/winners/records.json");

function section(page, id) {
  return page?.sections?.find((item) => item.id === id);
}

function requireTokens(value, tokens, label) {
  const text = JSON.stringify(value || {});
  for (const token of tokens) if (!text.includes(token)) errors.push(`Missing bilingual fact token ${token} in ${label}`);
}

function forbidPublicTokens(value, tokens, label) {
  const text = JSON.stringify(value || {}).toLowerCase();
  for (const token of tokens) {
    if (text.includes(token.toLowerCase())) errors.push(`Internal-facing token ${token} must not appear in ${label}`);
  }
}

const enKeys = Object.keys(en).sort();
const jaKeys = Object.keys(ja).sort();
if (JSON.stringify(enKeys) !== JSON.stringify(jaKeys)) {
  errors.push(`Page keys differ: en=${enKeys.join(",")} ja=${jaKeys.join(",")}`);
}

for (const key of enKeys) {
  const enPage = en[key];
  const jaPage = ja[key];
  if (!jaPage) continue;
  for (const field of ["seoTitle", "eyebrow", "title", "intro"]) {
    if (!String(enPage[field] || "").trim()) errors.push(`Missing en.${key}.${field}`);
    if (!String(jaPage[field] || "").trim()) errors.push(`Missing ja.${key}.${field}`);
  }
  const enIds = enPage.sections.map((section) => section.id);
  const jaIds = jaPage.sections.map((section) => section.id);
  if (JSON.stringify(enIds) !== JSON.stringify(jaIds)) {
    errors.push(`Section IDs differ on ${key}: en=${enIds.join(",")} ja=${jaIds.join(",")}`);
  }
  for (let index = 0; index < Math.min(enPage.sections.length, jaPage.sections.length); index += 1) {
    const enSection = enPage.sections[index];
    const jaSection = jaPage.sections[index];
    if (enSection.items.length !== jaSection.items.length) {
      errors.push(`Item count differs on ${key}.${enSection.id}`);
    }
    if (enSection.body.length !== jaSection.body.length) {
      errors.push(`Paragraph count differs on ${key}.${enSection.id}`);
    }
  }
}

if (schedule.durationBoundarySeconds !== 2100) errors.push("Duration boundary must be 2100 seconds.");
if (schedule.maxFinalistsPerDivision !== 5) errors.push("Maximum finalists per division must be 5.");
if (schedule.timezone !== "Asia/Tokyo") errors.push("Operational timezone must be Asia/Tokyo.");
if (awards.divisions.length !== 2) errors.push("There must be exactly two runtime divisions.");
if (awards.categories.length !== 9) errors.push("There must be exactly nine award categories.");
const expectedMilestones = ["preselection:21-22", "human-review:23-27", "dual-approval:28-29", "publication:last-day 12:00"];
const actualMilestones = schedule.milestones.map((item) => `${item.id}:${item.days}`);
if (JSON.stringify(actualMilestones) !== JSON.stringify(expectedMilestones)) errors.push(`Monthly milestones differ from the approved contract: ${actualMilestones.join(", ")}`);
const expectedAwardIds = ["best-director", "best-cinematography", "best-supporting-actress", "best-producer", "best-writer", "best-actor", "best-supporting-actor", "best-actress", "honorable-mention"];
if (JSON.stringify(awards.categories.map((item) => item.id)) !== JSON.stringify(expectedAwardIds)) errors.push("Award category IDs or ordering differ from the approved contract.");
if (awards.allowMultipleAwardsPerFilm !== true) errors.push("Multiple awards per film must remain allowed.");
if (awards.oneWinnerPerCategoryWhenEligible !== true) errors.push("Each eligible division must retain one winner per category.");
if (awards.noAwardOnlyWhenDivisionHasZeroEligibleSubmissions !== true) errors.push("No-award must remain limited to a zero-submission division.");
for (const award of awards.categories) {
  if (!String(award.en || "").trim() || !String(award.ja || "").trim()) errors.push(`Award label is incomplete: ${award.id}`);
}

requireTokens(section(en.submit, "deadlines"), ["21st", "20th", "23:59"], "en.submit.deadlines");
requireTokens(section(ja.submit, "deadlines"), ["21日", "20日", "23:59"], "ja.submit.deadlines");
requireTokens(section(en.rules, "duration"), ["35:00", "35:01"], "en.rules.duration");
requireTokens(section(ja.rules, "duration"), ["35分00秒", "35分01秒"], "ja.rules.duration");
requireTokens(section(en.home, "monthly-cycle"), ["20th", "23:59", "12:00"], "en.home.monthly-cycle");
requireTokens(section(ja.home, "monthly-cycle"), ["20日", "23:59", "12:00"], "ja.home.monthly-cycle");
forbidPublicTokens(en, ["pre-release", "preview mode", "FilmFreeway CSV", "approval record", "audit record", "private operations system", "not configured", "dual approval"], "English public content");
forbidPublicTokens(ja, ["公開前", "プレビュー", "CSV", "承認記録", "監査記録", "運営システム", "連携は未設定", "2名承認"], "Japanese public content");

const expectedSlots = new Map([
  ["home-hero", [1672, 941]],
  ["about-editorial", [2400, 1350]],
  ["selection-process", [2400, 1350]],
  ["awards-materials", [2400, 1350]],
  ["home-screening", [1942, 809]],
  ["home-in-person", [1536, 1024]]
]);
if (imageSlots.length !== expectedSlots.size) {
  errors.push(`Exactly ${expectedSlots.size} approved image slots are permitted; found ${imageSlots.length}.`);
}

for (const slot of imageSlots) {
  const expected = expectedSlots.get(slot.id);
  if (!expected) {
    errors.push(`Unexpected image slot: ${slot.id}`);
    continue;
  }
  if (slot.width !== expected[0] || slot.height !== expected[1]) {
    errors.push(`Wrong dimensions for ${slot.id}: ${slot.width}x${slot.height}`);
  }
  if (!slot.safeCrop?.x || !slot.safeCrop?.y || !slot.alt?.en || !slot.alt?.ja || !slot.prompt) {
    errors.push(`Incomplete image ledger record: ${slot.id}`);
  }
  if (slot.rightsStatus !== "pending-generation") {
    const filePath = path.join(root, "public", slot.file.replace(/^\//, ""));
    if (!fs.existsSync(filePath)) {
      errors.push(`Generated image file is missing: ${slot.file}`);
    } else {
      const metadata = await sharp(filePath).metadata();
      if (metadata.width !== slot.width || metadata.height !== slot.height) {
        errors.push(`Actual dimensions for ${slot.id} are ${metadata.width}x${metadata.height}; expected ${slot.width}x${slot.height}.`);
      }
    }
  }
}

const certificateIds = new Set();
const validCategoryIds = new Set(awards.categories.map((item) => item.id));
const validDivisionIds = new Set(awards.divisions.map((item) => item.id));
for (const cycle of winners) {
  if (!/^\d{4}-\d{2}$/.test(cycle.cycleId)) errors.push(`Invalid cycle ID: ${cycle.cycleId}`);
  if (!cycle.localeTitles?.en || !cycle.localeTitles?.ja) errors.push(`Missing localized cycle title: ${cycle.cycleId}`);
  for (const award of cycle.awards || []) {
    if (!validCategoryIds.has(award.categoryId)) errors.push(`Unknown award category: ${award.categoryId}`);
    if (!validDivisionIds.has(award.divisionId)) errors.push(`Unknown division: ${award.divisionId}`);
    if (!award.filmTitle || !award.recipientName || !award.certificateId) errors.push(`Incomplete award record in ${cycle.cycleId}`);
    if (certificateIds.has(award.certificateId)) errors.push(`Duplicate certificate ID: ${award.certificateId}`);
    certificateIds.add(award.certificateId);
    if (award.stillUrl && !award.stillAlt?.en) errors.push(`Winner still requires English alt text: ${award.certificateId}`);
    if (award.stillUrl && !award.stillAlt?.ja) errors.push(`Winner still requires Japanese alt text: ${award.certificateId}`);
  }
}

const forbiddenPageFiles = ["news", "jury", "partners", "press", "history", "event", "venue"];
for (const page of forbiddenPageFiles) {
  const candidates = [path.join(root, "src/pages", `${page}.astro`), path.join(root, "src/pages/ja", `${page}.astro`)];
  if (candidates.some((candidate) => fs.existsSync(candidate))) errors.push(`Unverified public page must not exist yet: ${page}`);
}

if (errors.length) {
  console.error("Content validation failed:\n" + errors.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log(`Content validation passed: ${enKeys.length} bilingual pages, ${awards.categories.length} awards, ${imageSlots.length} image slots.`);
