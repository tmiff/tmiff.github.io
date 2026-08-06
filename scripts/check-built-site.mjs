import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const dist = path.join(root, "dist");
const errors = [];
const siteConfig = JSON.parse(fs.readFileSync(path.join(root, "src/config/site.json"), "utf8"));

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

if (!fs.existsSync(dist)) {
  console.error("dist/ does not exist. Run Astro build first.");
  process.exit(1);
}

const htmlFiles = walk(dist).filter((file) => file.endsWith(".html"));
const routeExists = (urlPath) => {
  const clean = decodeURIComponent(urlPath.split(/[?#]/)[0]);
  const relative = clean.replace(/^\//, "");
  if (path.extname(relative)) return fs.existsSync(path.join(dist, relative));
  const candidates = relative.endsWith(".html")
    ? [path.join(dist, relative)]
    : [path.join(dist, relative, "index.html"), path.join(dist, `${relative}.html`)];
  return candidates.some((candidate) => fs.existsSync(candidate));
};

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const relative = path.relative(dist, file);
  const langMatch = html.match(/<html[^>]+lang="([^"]+)"/i);
  if (!langMatch || !["en", "ja"].includes(langMatch[1])) errors.push(`Missing valid html lang in ${relative}`);
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (h1Count !== 1) errors.push(`Expected one h1 in ${relative}, found ${h1Count}`);
  if (!html.includes("name=\"viewport\"") && !html.includes("name=viewport")) errors.push(`Missing viewport meta in ${relative}`);
  const links = [...html.matchAll(/href="([^"]+)"/gi)].map((match) => match[1]);
  for (const href of links) {
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    if (!routeExists(href)) errors.push(`Broken internal link in ${relative}: ${href}`);
  }
  if (/info@tmiff\.com|mailto:/i.test(html)) errors.push(`Direct contact email must not appear in public HTML: ${relative}`);
}

const requiredRoutes = [
  "index.html", "about/index.html", "submit/index.html", "rules/index.html",
  "selection-process/index.html", "awards/index.html", "winners/index.html",
  "faq/index.html", "contact/index.html", "privacy/index.html", "terms/index.html",
  "verify/index.html", "ja/index.html", "ja/about/index.html",
  "ja/submit/index.html", "ja/rules/index.html", "ja/selection-process/index.html",
  "ja/awards/index.html", "ja/winners/index.html", "ja/faq/index.html",
  "ja/contact/index.html", "ja/privacy/index.html", "ja/terms/index.html",
  "ja/verify/index.html", "404.html"
];
for (const route of requiredRoutes) {
  if (!fs.existsSync(path.join(dist, route))) errors.push(`Required built route is missing: ${route}`);
}

const submitPages = [path.join(dist, "submit/index.html"), path.join(dist, "ja/submit/index.html")].map((file) => fs.readFileSync(file, "utf8"));
if (siteConfig.releasePhase === "submissions-open" && siteConfig.filmFreewayUrl) {
  for (const [index, html] of submitPages.entries()) {
    if (!html.includes(`href="${siteConfig.filmFreewayUrl}"`)) errors.push(`FilmFreeway CTA URL is missing from ${index === 0 ? "English" : "Japanese"} submit page.`);
  }
} else {
  for (const [index, html] of submitPages.entries()) {
    if (!html.includes("button--disabled")) errors.push(`Unconfigured FilmFreeway CTA is not disabled on ${index === 0 ? "English" : "Japanese"} submit page.`);
    if (!html.includes(index === 0 ? "Submissions opening soon" : "応募準備中")) errors.push(`Pre-submission CTA copy is missing from ${index === 0 ? "English" : "Japanese"} submit page.`);
  }
}

if (errors.length) {
  console.error("Built-site validation failed:\n" + errors.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log(`Built-site validation passed: ${htmlFiles.length} HTML files and all required routes checked.`);
