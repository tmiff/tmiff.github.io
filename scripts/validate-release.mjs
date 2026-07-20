import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const site = readJson("src/config/site.json");
const attestation = readJson("src/config/release-attestation.json");
const images = readJson("src/config/image-slots.json");
const errors = [];
const requiredPrivateGates = [
  "dedicatedGmailConfigured",
  "coOrganizerConfigured",
  "filmFreewayConfigured",
  "openAiKeyConfigured",
  "turnstileSecretConfigured",
  "googleWorkspaceConfigured",
  "mediaAnalysisWorkflowApproved",
  "contactAndDraftTestPassed",
  "dualApprovalTestPassed",
  "publicationAndCertificateTestPassed",
  "backupRestoreTestPassed",
  "testMonthPassed"
];

const requiredText = [
  ["festivalName", site.festivalName],
  ["festivalNameJa", site.festivalNameJa],
  ["organizerName", site.organizerName],
  ["country", site.country],
  ["locationDisplay", site.locationDisplay],
  ["contactEmail", site.contactEmail],
  ["filmFreewayUrl", site.filmFreewayUrl],
  ["submissionFeeDisplayEn", site.submissionFeeDisplayEn],
  ["submissionFeeDisplayJa", site.submissionFeeDisplayJa],
  ["signatureName", site.signatureName],
  ["githubOrganization", site.githubOrganization]
];

for (const [name, value] of requiredText) {
  if (!String(value || "").trim()) errors.push(`Missing required public setting: ${name}`);
}
if (site.status !== "ready") errors.push("site.status must be 'ready'.");
if (site.festivalName === "Festival Working Title" || site.festivalNameJa.includes("未設定")) errors.push("Working festival name must be replaced.");
if (!Array.isArray(site.coOrganizerEmails) || site.coOrganizerEmails.length < 1) errors.push("At least one co-organizer email is required.");
if (!site.refundPolicyApproved) errors.push("Refund policy is not approved.");
if (!site.legalApproved) errors.push("Legal copy is not approved.");
if (!/^https:\/\/filmfreeway\.com\//i.test(site.filmFreewayUrl)) errors.push("FilmFreeway URL must use an https://filmfreeway.com/ address.");
if (site.venueStatus !== "confirmed" && site.venueClaimEnabled) errors.push("Venue claims cannot be enabled while the venue is unconfirmed.");

const publicSiteUrl = process.env.PUBLIC_SITE_URL || "";
const contactEndpoint = process.env.PUBLIC_CONTACT_ENDPOINT || "";
const turnstileSiteKey = process.env.PUBLIC_TURNSTILE_SITE_KEY || "";
if (!/^https:\/\//.test(publicSiteUrl)) errors.push("PUBLIC_SITE_URL is missing or invalid.");
if (!/^https:\/\/script\.google\.com\/macros\/s\//.test(contactEndpoint)) errors.push("PUBLIC_CONTACT_ENDPOINT is missing or invalid.");
if (!turnstileSiteKey || /replace|test/i.test(turnstileSiteKey)) errors.push("PUBLIC_TURNSTILE_SITE_KEY is missing or still a placeholder.");

for (const gate of requiredPrivateGates) {
  if (attestation.gates?.[gate] !== true) errors.push(`Private operations gate is not attested: ${gate}`);
}
if (!attestation.generatedAt || !attestation.sourceCommit) errors.push("Operations attestation metadata is incomplete.");

for (const image of images) {
  if (image.approvalStatus !== "approved") errors.push(`Image is not approved: ${image.id}`);
  if (image.rightsStatus !== "generated-original" && image.rightsStatus !== "licensed") errors.push(`Image rights are not cleared: ${image.id}`);
  if (!image.sourceRecord) errors.push(`Image source record is missing: ${image.id}`);
  const imagePath = path.join(root, "public", image.file.replace(/^\//, ""));
  if (!fs.existsSync(imagePath)) errors.push(`Image file is missing: ${image.file}`);
}

const scanRoots = ["src", "scripts", "docs", ".github"];
const secretPatterns = [
  [/sk-[A-Za-z0-9_-]{20,}/, "possible OpenAI key"],
  [/gh[pousr]_[A-Za-z0-9]{20,}/, "possible GitHub token"],
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, "private key"],
  [/TURNSTILE_SECRET\s*=\s*[^\s$][^\n]*/i, "hard-coded Turnstile secret"]
];

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

for (const file of scanRoots.flatMap((item) => walk(path.join(root, item)))) {
  if (/\.(png|jpe?g|webp|gif|woff2?|ico)$/i.test(file)) continue;
  const value = fs.readFileSync(file, "utf8");
  for (const [pattern, label] of secretPatterns) {
    if (pattern.test(value)) errors.push(`${label} found in ${path.relative(root, file)}`);
  }
}

if (errors.length) {
  console.error("Release validation failed:\n" + errors.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log("Release validation passed. Public settings, private attestation, images, and secret scan are complete.");
