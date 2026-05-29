/**
 * Court filing deadline rules and calculator.
 *
 * Static lookup of court-specific filing deadlines (WA Supreme Court,
 * WA Magistrates Court, WA District Court, WA Court of Appeal,
 * Family Court of WA, Federal Court, FCFCA, SAT, High Court).
 */

import type { CourtDeadline, DeadlineResult, Jurisdiction } from "../types";
import { getPublicHolidays } from "./public-holidays";
import {
  addCalendarDays,
  addWorkingDays,
  countWorkingDays,
  diffCalendarDays,
  lastWorkingDayOnOrBefore,
  parseDate,
} from "./working-days";

// ---------------------------------------------------------------------------
// Court rules data (from docs/LIMITATION_PERIODS.md)
// ---------------------------------------------------------------------------

export const COURT_RULES: CourtDeadline[] = [
  {
    court: "WA Supreme Court",
    deadlineType: "Filing a Defence",
    days: 21,
    workingDays: false,
    source: "RSC O 20 r 2",
    displayName: "Defence (WA Supreme Court)",
  },
  {
    court: "WA Magistrates Court",
    deadlineType: "Filing a Defence",
    days: 28,
    workingDays: false,
    source: "MCR r 11",
    displayName: "Defence (WA Magistrates Court)",
  },
  {
    court: "Federal Court",
    deadlineType: "Filing a Defence",
    days: 28,
    workingDays: false,
    source: "FCR r 16.32",
    displayName: "Defence (Federal Court)",
  },
  {
    court: "WA Supreme Court",
    deadlineType: "Interlocutory application response",
    days: 3,
    workingDays: false,
    source: "RSC O 52 r 3",
    displayName: "Interlocutory Response (WA Supreme Court)",
  },
  {
    court: "WA Supreme Court",
    deadlineType: "Appeal (Full Court)",
    days: 21,
    workingDays: false,
    source: "RSC O 63 r 4",
    displayName: "Appeal to Full Court (WA Supreme Court)",
  },
  {
    court: "Federal Court",
    deadlineType: "Appeal (Full Court)",
    days: 21,
    workingDays: false,
    source: "FCR r 36.03",
    displayName: "Appeal to Full Court (Federal Court)",
  },
  {
    court: "High Court",
    deadlineType: "Special leave to appeal",
    days: 28,
    workingDays: false,
    source: "High Court Rules 2004 (Cth) r 41.02",
    displayName: "Special Leave to Appeal (High Court)",
  },
  {
    court: "WA Supreme Court",
    deadlineType: "Discovery",
    days: 28,
    workingDays: false,
    source: "RSC O 26",
    displayName: "Discovery (WA Supreme Court)",
  },

  // ==================== WA District Court ====================
  {
    court: "WA District Court",
    deadlineType: "Filing a Defence",
    days: 14,
    workingDays: false,
    source: "DCR 2005",
    displayName: "Defence (WA District Court)",
  },
  {
    court: "WA District Court",
    deadlineType: "Particulars of Damages",
    days: 60,
    workingDays: false,
    source: "DCR 2005 reg 45C",
    displayName: "Particulars of Damages (WA District Court)",
  },
  {
    court: "WA District Court",
    deadlineType: "Appeal from Magistrates Court",
    days: 21,
    workingDays: false,
    source: "District Court Act 1969 (WA) s 58",
    displayName: "Appeal from Magistrates Court (WA District Court)",
  },

  // ==================== WA Court of Appeal ====================
  {
    court: "WA Court of Appeal",
    deadlineType: "Notice of Appeal (final order)",
    days: 21,
    workingDays: false,
    source: "SC(CoA) Rules 2005 r 7(2)",
    displayName: "Notice of Appeal — Final (WA Court of Appeal)",
  },
  {
    court: "WA Court of Appeal",
    deadlineType: "Notice of Appeal (interlocutory)",
    days: 14,
    workingDays: false,
    source: "SC(CoA) Rules 2005 r 7(3)",
    displayName: "Notice of Appeal — Interlocutory (WA Court of Appeal)",
  },
  {
    court: "WA Court of Appeal",
    deadlineType: "Appellant's Case (final appeal)",
    days: 35,
    workingDays: false,
    source: "SC(CoA) Rules 2005 r 31B",
    displayName: "Appellant's Case — Final (WA Court of Appeal)",
  },
  {
    court: "WA Court of Appeal",
    deadlineType: "Appellant's Case (interlocutory appeal)",
    days: 14,
    workingDays: false,
    source: "SC(CoA) Rules 2005 r 31B",
    displayName: "Appellant's Case — Interlocutory (WA Court of Appeal)",
  },
  {
    court: "WA Court of Appeal",
    deadlineType: "Respondent's Answer",
    days: 21,
    workingDays: false,
    source: "SC(CoA) Rules 2005 r 33",
    displayName: "Respondent's Answer (WA Court of Appeal)",
  },

  // ==================== Family Court of WA ====================
  {
    court: "Family Court of WA",
    deadlineType: "Response to initiating application (in Australia)",
    days: 28,
    workingDays: false,
    source: "Family Court Rules 2021 (WA) r 153",
    displayName: "Response — Served in Australia (Family Court of WA)",
  },
  {
    court: "Family Court of WA",
    deadlineType: "Response to initiating application (outside Australia)",
    days: 42,
    workingDays: false,
    source: "Family Court Rules 2021 (WA) r 153",
    displayName: "Response — Served Outside Australia (Family Court of WA)",
  },
  {
    court: "Family Court of WA",
    deadlineType: "Appeal to Full Court",
    days: 28,
    workingDays: false,
    source: "Family Court Act 1997 (WA)",
    displayName: "Appeal to Full Court (Family Court of WA)",
  },

  // ==================== FCFCA (Federal Circuit and Family Court) ====================
  {
    court: "FCFCA (Div 2)",
    deadlineType: "Filing a Response (General Federal Law)",
    days: 28,
    workingDays: false,
    source: "FCFCA (Div 2) (GFL) Rules 2021",
    displayName: "Response — General (FCFCA Division 2)",
  },
  {
    court: "FCFCA (Div 2)",
    deadlineType: "Response to initiating application (Family Law, in Australia)",
    days: 28,
    workingDays: false,
    source: "FCFCA (FL) Rules 2021 r 2.18",
    displayName: "Response — Family Law, Served in Australia (FCFCA)",
  },
  {
    court: "FCFCA (Div 2)",
    deadlineType: "Response to initiating application (Family Law, outside Australia)",
    days: 42,
    workingDays: false,
    source: "FCFCA (FL) Rules 2021 r 2.18",
    displayName: "Response — Family Law, Served Outside Australia (FCFCA)",
  },
  {
    court: "FCFCA (Div 2)",
    deadlineType: "Appeal (Family Law, Div 2 to Div 1)",
    days: 28,
    workingDays: false,
    source: "FCFCA (FL) Rules 2021",
    displayName: "Appeal to Division 1 (FCFCA)",
  },

  // ==================== State Administrative Tribunal (WA) ====================
  {
    court: "SAT (WA)",
    deadlineType: "Application for review of decision",
    days: 28,
    workingDays: false,
    source: "SAT Act 2004 (WA)",
    displayName: "Application for Review (SAT)",
  },
  {
    court: "SAT (WA)",
    deadlineType: "Service of application on other parties",
    days: 7,
    workingDays: false,
    source: "SAT Rules 2004",
    displayName: "Service of Application (SAT)",
  },
];

/**
 * Get all court rules, optionally filtered by court name.
 */
export function getCourtRules(court?: string): CourtDeadline[] {
  if (!court) return COURT_RULES;
  return COURT_RULES.filter((r) => r.court === court);
}

/**
 * Get unique court names.
 */
export function getCourtNames(): string[] {
  return [...new Set(COURT_RULES.map((r) => r.court))];
}

/**
 * Calculate a court filing deadline.
 *
 * @param rule - The court deadline rule
 * @param triggerDate - The date that triggers the deadline (e.g., date of service) (YYYY-MM-DD)
 * @param jurisdiction - Jurisdiction for working day calculations
 * @param referenceDate - "Today" for remaining-days calculations (YYYY-MM-DD)
 */
export function calculateCourtDeadline(
  rule: CourtDeadline,
  triggerDate: string,
  jurisdiction: Jurisdiction,
  referenceDate: string,
): DeadlineResult {
  // Calculate the raw deadline
  const deadlineDate = rule.workingDays
    ? addWorkingDays(triggerDate, rule.days, jurisdiction)
    : addCalendarDays(triggerDate, rule.days);

  // File-by date: last working day on or before the deadline
  const fileByDate = lastWorkingDayOnOrBefore(deadlineDate, jurisdiction);

  // Remaining days
  const calendarDaysRemaining = diffCalendarDays(referenceDate, deadlineDate);
  const workingDaysRemaining =
    calendarDaysRemaining > 0 ? countWorkingDays(referenceDate, deadlineDate, jurisdiction) : 0;
  const isExpired = calendarDaysRemaining <= 0;

  // Warnings
  const warnings: string[] = [];
  if (isExpired) {
    warnings.push("This filing deadline has EXPIRED.");
  } else if (calendarDaysRemaining <= 7) {
    warnings.push("URGENT: Filing deadline is within 7 days!");
  } else if (calendarDaysRemaining <= 14) {
    warnings.push("WARNING: Filing deadline is within 14 days.");
  }

  // Holidays in range
  const holidaysInRange: Array<{ date: string; name: string }> = [];
  if (!isExpired) {
    const refParsed = parseDate(referenceDate);
    const deadParsed = parseDate(deadlineDate);
    for (let y = refParsed.year; y <= deadParsed.year; y++) {
      const yearHolidays = getPublicHolidays(y, jurisdiction);
      for (const h of yearHolidays) {
        if (h.date > referenceDate && h.date <= deadlineDate) {
          holidaysInRange.push({ date: h.date, name: h.name });
        }
      }
    }
  }

  return {
    causeOfAction: rule.displayName,
    jurisdiction,
    accrualDate: triggerDate,
    deadlineDate,
    fileByDate,
    calendarDaysRemaining,
    workingDaysRemaining,
    isExpired,
    warnings,
    holidaysInRange,
    sectionRef: rule.source,
    actName: "",
    notes: `${rule.days} ${rule.workingDays ? "working" : "calendar"} days from ${rule.deadlineType.toLowerCase()}.`,
    longStopDate: null,
  };
}
