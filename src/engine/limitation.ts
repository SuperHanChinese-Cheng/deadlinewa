/**
 * Limitation period calculator.
 *
 * Takes a cause of action, jurisdiction, and accrual date → returns a DeadlineResult
 * with the exact deadline, file-by date, warnings, and holidays in range.
 */

import type { CauseOfAction, DeadlineResult, Jurisdiction } from "../types";
import { getPublicHolidays } from "./public-holidays";
import { getLimitationPeriod } from "./limitation-data";
import {
  addCalendarDays,
  addYearsMonths,
  countWorkingDays,
  diffCalendarDays,
  lastWorkingDayOnOrBefore,
  parseDate,
} from "./working-days";

/**
 * Calculate the limitation deadline for a cause of action.
 *
 * @param cause - The cause of action key
 * @param jurisdiction - The jurisdiction
 * @param accrualDate - The date the cause of action arose (YYYY-MM-DD)
 * @param referenceDate - "Today" for calculating remaining days (YYYY-MM-DD). Never uses Date.now().
 * @returns DeadlineResult or null if the cause/jurisdiction combination is not found
 */
export function calculateLimitationDeadline(
  cause: CauseOfAction,
  jurisdiction: Jurisdiction,
  accrualDate: string,
  referenceDate: string,
): DeadlineResult | null {
  const period = getLimitationPeriod(cause, jurisdiction);
  if (!period) return null;

  // Step 1: Calculate raw deadline date
  // Add years and months first, then days
  let deadlineDate = addYearsMonths(accrualDate, period.years, period.months);
  if (period.days > 0) {
    deadlineDate = addCalendarDays(deadlineDate, period.days);
  }

  // Step 2: Calculate file-by date (last working day before the deadline)
  // You must file BEFORE the limitation expires, so file-by = last working day
  // on or before (deadline - 1 calendar day)
  const dayBeforeDeadline = addCalendarDays(deadlineDate, -1);
  const fileByDate = lastWorkingDayOnOrBefore(dayBeforeDeadline, jurisdiction);

  // Step 3: Calculate remaining days from reference date
  const calendarDaysRemaining = diffCalendarDays(referenceDate, deadlineDate);
  const workingDaysRemaining =
    calendarDaysRemaining > 0 ? countWorkingDays(referenceDate, deadlineDate, jurisdiction) : 0;
  const isExpired = calendarDaysRemaining <= 0;

  // Step 4: Generate warnings
  const warnings: string[] = [];

  if (isExpired) {
    warnings.push("This limitation period has EXPIRED.");
  } else if (calendarDaysRemaining <= 30) {
    warnings.push("URGENT: Deadline is within 30 days!");
  } else if (calendarDaysRemaining <= 60) {
    warnings.push("WARNING: Deadline is within 60 days.");
  } else if (calendarDaysRemaining <= 90) {
    warnings.push("CAUTION: Deadline is within 90 days.");
  }

  if (period.discoverability) {
    warnings.push(
      "This period runs from discoverability (when the plaintiff knew or ought to have known), not necessarily from the date of the event. Verify the start date.",
    );
  }

  if (period.notes) {
    warnings.push(period.notes);
  }

  // Always add the general extension warning
  warnings.push(
    "Limitation periods may be extended for disability (minor, unsound mind), fraud, or concealment. This tool does not calculate extensions — seek legal advice if these apply.",
  );

  // Step 5: Get holidays between reference date and deadline
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

  // Step 6: Calculate long-stop date if applicable
  let longStopDate: string | null = null;
  if (period.longStopYears !== null) {
    longStopDate = addYearsMonths(accrualDate, period.longStopYears, 0);
  }

  return {
    causeOfAction: period.displayName || cause,
    jurisdiction,
    accrualDate,
    deadlineDate,
    fileByDate,
    calendarDaysRemaining,
    workingDaysRemaining,
    isExpired,
    warnings,
    holidaysInRange,
    sectionRef: period.sectionRef,
    actName: period.actName,
    notes: period.notes,
    longStopDate,
  };
}
