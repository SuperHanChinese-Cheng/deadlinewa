/**
 * Working day arithmetic for Australian jurisdictions.
 *
 * All date math for business days goes through this module.
 * Uses public-holidays.ts for holiday lookups.
 */

import type { Jurisdiction } from "../types";
import {
  addCalendarDays,
  dayOfWeek,
  diffCalendarDays,
  getHolidayDateSet,
  parseDate,
} from "./public-holidays";

// Re-export date utilities so other engine modules import from one place
export { addCalendarDays, addYearsMonths, dayOfWeek, diffCalendarDays, makeDate, parseDate } from "./public-holidays";

/**
 * Check if a date is a working day (not a weekend, not a public holiday).
 */
export function isWorkingDay(dateStr: string, jurisdiction: Jurisdiction): boolean {
  const dow = dayOfWeek(dateStr);
  if (dow >= 5) return false; // Saturday (5) or Sunday (6)

  const { year } = parseDate(dateStr);
  const holidays = getHolidayDateSet(year, jurisdiction);
  return !holidays.has(dateStr);
}

/**
 * Add N working days to a start date.
 *
 * The start date is NOT counted — counting begins from the next day.
 * Returns the date that is N working days after the start.
 *
 * Only use for court-rule calculations (typically 21-90 days).
 * For limitation periods (years), use addYearsMonths + adjust to working day.
 */
export function addWorkingDays(
  start: string,
  days: number,
  jurisdiction: Jurisdiction,
): string {
  const { year } = parseDate(start);
  // Pre-fetch holidays for current year and next two years (handles year boundaries)
  const holidayDates = new Set<string>();
  for (let y = year; y <= year + 2; y++) {
    for (const d of getHolidayDateSet(y, jurisdiction)) {
      holidayDates.add(d);
    }
  }

  let current = start;
  let added = 0;

  while (added < days) {
    current = addCalendarDays(current, 1);
    const dow = dayOfWeek(current);
    if (dow < 5 && !holidayDates.has(current)) {
      added++;
    }
  }

  return current;
}

/**
 * Count working days between two dates.
 *
 * Start is EXCLUSIVE, end is INCLUSIVE.
 * This matches the legal convention: "21 days from service" means
 * the day of service is day 0, the next working day is day 1.
 *
 * If end <= start, returns 0 (or negative if you need to handle that).
 */
export function countWorkingDays(
  start: string,
  end: string,
  jurisdiction: Jurisdiction,
): number {
  const totalDays = diffCalendarDays(start, end);
  if (totalDays <= 0) return 0;

  const startParsed = parseDate(start);
  const endParsed = parseDate(end);

  // Pre-fetch holidays for all years in range
  const holidayDates = new Set<string>();
  for (let y = startParsed.year; y <= endParsed.year + 1; y++) {
    for (const d of getHolidayDateSet(y, jurisdiction)) {
      holidayDates.add(d);
    }
  }

  let count = 0;
  let current = start;
  for (let i = 0; i < totalDays; i++) {
    current = addCalendarDays(current, 1);
    const dow = dayOfWeek(current);
    if (dow < 5 && !holidayDates.has(current)) {
      count++;
    }
  }

  return count;
}

/**
 * Find the last working day on or before a given date.
 * Used to calculate "file by" dates.
 */
export function lastWorkingDayOnOrBefore(
  dateStr: string,
  jurisdiction: Jurisdiction,
): string {
  let current = dateStr;
  while (!isWorkingDay(current, jurisdiction)) {
    current = addCalendarDays(current, -1);
  }
  return current;
}
