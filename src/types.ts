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

// A poster or still shown beside a film on the results page. Each image keeps its own shape.
export interface FilmStill {
  src: string;
  width: number;
  height: number;
  alt: Record<Locale, string>;
  // Where the file came from, and whether the film's makers have agreed to its use on the site.
  source: string;
  rightsStatus: "pending-confirmation" | "approved";
}

export interface WinnerRecord {
  cycleId: string;
  publishedAt: string;
  localeTitles: Record<Locale, string>;
  noAwards?: Array<{
    divisionId: "short" | "feature" | "documentary-pv";
    categoryId: string;
  }>;
  // Awards are shown in the order they appear here, which is the order the festival announces them.
  awards: Array<{
    // Omitted when the work does not belong to a runtime division, such as a screenplay.
    divisionId?: "short" | "feature" | "documentary-pv";
    // Required for a winner. An Honorable Mention is not given in a category, so it has none.
    categoryId?: string;
    // An Honorable Mention is listed after the winners and is shown as 佳作 / Honorable Mention.
    tier?: "winner" | "honorable-mention";
    filmTitle: string;
    // The title line exactly as printed on the certificate, when it says more than the film title
    // (for example “Gioiello” by Mika Kobayashi). Falls back to filmTitle.
    displayTitle?: string;
    recipientName: string;
    recipientCredit: "director" | "writer";
    // Present only when the printed certificate carries an ID that the verify page can check.
    certificateId?: string;
    still?: FilmStill;
  }>;
  // The film shown as the opening screening of the awards event. It is not an award; it is listed
  // first, apart from the results.
  openingScreening?: {
    filmTitle: string;
    directorName: string;
    still?: FilmStill;
  };
}
