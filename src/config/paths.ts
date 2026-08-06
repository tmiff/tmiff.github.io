import type { Locale, PageKey } from "../types";

export const pageSlugs: Record<PageKey, string> = {
  home: "",
  about: "about",
  submit: "submit",
  rules: "rules",
  selection: "selection-process",
  awards: "awards",
  winners: "winners",
  faq: "faq",
  contact: "contact",
  privacy: "privacy",
  terms: "terms",
  verify: "verify"
};

export function pagePath(locale: Locale, key: PageKey) {
  const localePrefix = locale === "ja" ? "/ja" : "";
  const slug = pageSlugs[key];
  return slug ? `${localePrefix}/${slug}/` : `${localePrefix || ""}/`;
}

export function alternateLocalePath(locale: Locale, key: PageKey) {
  return pagePath(locale === "en" ? "ja" : "en", key);
}

export const primaryNavigation: PageKey[] = ["about", "submit", "rules", "selection", "awards", "winners"];

export const navigationLabels: Record<Locale, Partial<Record<PageKey, string>>> = {
  en: {
    about: "About",
    submit: "Submit",
    rules: "Rules",
    selection: "Selection",
    awards: "Awards",
    winners: "Winners",
    faq: "FAQ",
    contact: "Contact",
    privacy: "Privacy",
    terms: "Terms",
    verify: "Verify certificate"
  },
  ja: {
    about: "映画祭について",
    submit: "応募",
    rules: "規約",
    selection: "選考",
    awards: "賞",
    winners: "受賞結果",
    faq: "よくある質問",
    contact: "お問い合わせ",
    privacy: "プライバシー",
    terms: "利用規約",
    verify: "証書確認"
  }
};
