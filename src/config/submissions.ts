import rawFees from "./submission-fees.json";
import rawSchedule from "./schedule.json";
import type { Locale } from "../types";

export type SubmissionCycleId =
  | "opening"
  | "regular-deadline"
  | "final-deadline"
  | "nomination-notification"
  | "award-results";

export interface SubmissionCycleItem {
  id: SubmissionCycleId;
  monthOffset: number;
  day: number | "last-day";
}

export interface SubmissionFeeCategory {
  id: string;
  en: string;
  ja: string;
  regular: { standard: number; gold: number };
  final: { standard: number; gold: number };
}

export const submissionCycle = rawSchedule.submissionCycle as SubmissionCycleItem[];
export const deadlineTimeAuthority = rawSchedule.deadlineTimeAuthority;
export const submissionFeeCurrency = rawFees.currency;
export const submissionFeeCategories = rawFees.categories as SubmissionFeeCategory[];

const cycleLabels: Record<Locale, Record<SubmissionCycleId, { title: string; timing: string }>> = {
  ja: {
    opening: { title: "募集開始", timing: "毎月20日" },
    "regular-deadline": { title: "通常締切", timing: "翌月末日" },
    "final-deadline": { title: "最終締切", timing: "翌々月20日" },
    "nomination-notification": { title: "ノミネート通知", timing: "翌々月末日" },
    "award-results": { title: "受賞結果発表", timing: "会場開催日（最終締切の翌月15日）" }
  },
  en: {
    opening: { title: "Opening Date", timing: "20th of every month" },
    "regular-deadline": { title: "Regular Deadline", timing: "Last day of the following month" },
    "final-deadline": { title: "Final Deadline", timing: "20th of the second following month" },
    "nomination-notification": { title: "Nomination Notification", timing: "Last day of the second following month" },
    "award-results": { title: "Award Results Announcement", timing: "Event day (the 15th of the month after the final deadline)" }
  }
};

export function getSubmissionCycle(locale: Locale) {
  return submissionCycle.map((item) => ({ ...item, ...cycleLabels[locale][item.id] }));
}
