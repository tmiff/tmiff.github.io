export type Locale = "en" | "ja";
export type PageKey =
  | "home"
  | "about"
  | "submit"
  | "rules"
  | "selection"
  | "awards"
  | "winners"
  | "faq"
  | "contact"
  | "privacy"
  | "terms"
  | "accessibility"
  | "verify";

export interface ContentSection {
  id: string;
  title: string;
  body: string[];
  items: string[];
}

export interface PageContent {
  seoTitle: string;
  eyebrow: string;
  title: string;
  intro: string;
  sections: ContentSection[];
}

export interface ImageSlotRecord {
  id: string;
  page: string;
  file: string;
  width: number;
  height: number;
  ratio: string;
  safeCrop: { x: string; y: string };
  alt: Record<Locale, string>;
  prompt: string;
  rightsStatus: string;
  approvalStatus: string;
  sourceRecord: string | null;
  display?: {
    position: string;
    mobilePosition?: string;
    scale?: number;
    mobileScale?: number;
  };
}

export interface WinnerRecord {
  cycleId: string;
  publishedAt: string;
  localeTitles: Record<Locale, string>;
  noAwardDivisions?: Array<"short" | "feature">;
  awards: Array<{
    divisionId: "short" | "feature";
    categoryId: string;
    filmTitle: string;
    recipientName: string;
    recipientCredit: string;
    certificateId: string;
    stillUrl?: string;
    stillAlt?: Record<Locale, string>;
  }>;
}
