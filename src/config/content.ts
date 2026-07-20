import en from "../content/en/pages.json";
import ja from "../content/ja/pages.json";
import type { Locale, PageContent, PageKey } from "../types";

const content = { en, ja } as unknown as Record<Locale, Record<PageKey, PageContent>>;

export function getPageContent(locale: Locale, key: PageKey): PageContent {
  return content[locale][key];
}

export function getSection(locale: Locale, key: PageKey, id: string) {
  const section = getPageContent(locale, key).sections.find((item) => item.id === id);
  if (!section) {
    throw new Error(`Missing content section: ${locale}.${key}.${id}`);
  }
  return section;
}
