import rawSite from "./site.json";

export const siteConfig = {
  ...rawSite,
  siteUrl: import.meta.env.PUBLIC_SITE_URL || "",
  contactEndpoint: import.meta.env.PUBLIC_CONTACT_ENDPOINT || "",
  turnstileSiteKey: import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || "",
  isRelease: import.meta.env.PUBLIC_RELEASE === "true"
};

export function festivalName(locale: "en" | "ja") {
  return locale === "ja" ? siteConfig.festivalNameJa : siteConfig.festivalName;
}
