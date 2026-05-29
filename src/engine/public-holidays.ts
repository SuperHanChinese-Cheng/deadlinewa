/**
 * Public holiday computation for all Australian jurisdictions.
 *
 * All holidays are computed algorithmically — no hardcoded per-year data.
 * Easter via Computus, variable holidays via nth-weekday-of-month rules.
 */

import type { Jurisdiction, PublicHoliday } from "../types";

// ---------------------------------------------------------------------------
// Date utility helpers (all engine date math uses YYYY-MM-DD strings)
// ---------------------------------------------------------------------------

/** Build a YYYY-MM-DD string. */
export function makeDate(year: number, month: number, day: number): string {
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

/** Parse a YYYY-MM-DD string into components. */
export function parseDate(dateStr: string): { year: number; month: number; day: number } {
  const [y, m, d] = dateStr.split("-").map(Number);
  return { year: y, month: m, day: d };
}

/** Get the day of week for a YYYY-MM-DD string. 0=Monday, 6=Sunday. */
export function dayOfWeek(dateStr: string): number {
  const { year, month, day } = parseDate(dateStr);
  const d = new Date(Date.UTC(year, month - 1, day));
  // JS getUTCDay: 0=Sun, 1=Mon..6=Sat → convert to 0=Mon..6=Sun
  return (d.getUTCDay() + 6) % 7;
}

/** Add calendar days to a YYYY-MM-DD string. */
export function addCalendarDays(dateStr: string, n: number): string {
  const { year, month, day } = parseDate(dateStr);
  const d = new Date(Date.UTC(year, month - 1, day + n));
  return makeDate(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

/** Difference in calendar days between two YYYY-MM-DD strings (end - start). */
export function diffCalendarDays(start: string, end: string): number {
  const s = parseDate(start);
  const e = parseDate(end);
  const startMs = Date.UTC(s.year, s.month - 1, s.day);
  const endMs = Date.UTC(e.year, e.month - 1, e.day);
  return Math.round((endMs - startMs) / 86_400_000);
}

/** Days in a given month. */
function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Add years and months to a date, clamping day to month-end if needed. */
export function addYearsMonths(dateStr: string, years: number, months: number): string {
  const { year, month, day } = parseDate(dateStr);
  let newYear = year + years;
  let newMonth = month + months;

  // Normalize month overflow/underflow
  while (newMonth > 12) {
    newMonth -= 12;
    newYear += 1;
  }
  while (newMonth < 1) {
    newMonth += 12;
    newYear -= 1;
  }

  const maxDay = daysInMonth(newYear, newMonth);
  const newDay = Math.min(day, maxDay);
  return makeDate(newYear, newMonth, newDay);
}

// ---------------------------------------------------------------------------
// Easter computation (Anonymous Gregorian Computus)
// ---------------------------------------------------------------------------

/** Compute Easter Sunday for a given year. Works for any year. */
export function easterSunday(year: number): string {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return makeDate(year, month, day);
}

// ---------------------------------------------------------------------------
// Nth weekday of month
// ---------------------------------------------------------------------------

/**
 * Get the nth occurrence of a weekday in a month.
 * @param weekday 0=Monday, 6=Sunday
 * @param n 1=first, 2=second, etc.
 */
export function nthWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number,
  n: number,
): string {
  const firstDay = makeDate(year, month, 1);
  const firstDow = dayOfWeek(firstDay);
  const daysUntil = (weekday - firstDow + 7) % 7;
  const day = 1 + daysUntil + (n - 1) * 7;
  return makeDate(year, month, day);
}

// ---------------------------------------------------------------------------
// Substitute day rules
// ---------------------------------------------------------------------------

/**
 * Apply WA/national substitute day rule for a single fixed holiday.
 * If the holiday falls on Saturday → Monday. Sunday → Monday.
 * Returns the substitute date (or the original if no sub needed).
 */
function substituteDay(dateStr: string): string {
  const dow = dayOfWeek(dateStr);
  if (dow === 5) return addCalendarDays(dateStr, 2); // Saturday → Monday
  if (dow === 6) return addCalendarDays(dateStr, 1); // Sunday → Monday
  return dateStr;
}

/**
 * Handle Christmas + Boxing Day double-substitution.
 * Returns [christmasObserved, boxingDayObserved].
 */
function christmasBoxingSubstitute(year: number): [string, string] {
  const christmas = makeDate(year, 12, 25);
  const boxingDay = makeDate(year, 12, 26);
  const christmasDow = dayOfWeek(christmas);

  switch (christmasDow) {
    case 4: // Friday: Christmas=Fri, Boxing=Sat → Boxing subs to Mon 28
      return [christmas, addCalendarDays(boxingDay, 2)];
    case 5: // Saturday: Christmas=Sat→Mon 27, Boxing=Sun→Tue 28
      return [addCalendarDays(christmas, 2), addCalendarDays(boxingDay, 2)];
    case 6: // Sunday: Christmas=Sun→Tue 27, Boxing=Mon (no sub)
      return [addCalendarDays(christmas, 2), boxingDay];
    default: // Mon-Thu: no substitution needed
      return [christmas, boxingDay];
  }
}

// ---------------------------------------------------------------------------
// National holidays (apply to ALL jurisdictions)
// ---------------------------------------------------------------------------

function getNationalHolidays(year: number): PublicHoliday[] {
  const holidays: PublicHoliday[] = [];

  // New Year's Day
  holidays.push({
    date: substituteDay(makeDate(year, 1, 1)),
    name: "New Year's Day",
    jurisdiction: "national",
  });

  // Australia Day — 26 January
  holidays.push({
    date: substituteDay(makeDate(year, 1, 26)),
    name: "Australia Day",
    jurisdiction: "national",
  });

  // Easter
  const easter = easterSunday(year);
  holidays.push({
    date: addCalendarDays(easter, -2),
    name: "Good Friday",
    jurisdiction: "national",
  });
  holidays.push({
    date: addCalendarDays(easter, -1),
    name: "Easter Saturday",
    jurisdiction: "national",
  });
  holidays.push({
    date: addCalendarDays(easter, 1),
    name: "Easter Monday",
    jurisdiction: "national",
  });

  // Anzac Day — 25 April
  // Note: substitute rules for Anzac Day vary by state.
  // We add the raw date here; state-specific functions handle substitution.
  holidays.push({
    date: makeDate(year, 4, 25),
    name: "Anzac Day",
    jurisdiction: "national",
  });

  // Christmas and Boxing Day (with double-substitution)
  const [christmasObs, boxingObs] = christmasBoxingSubstitute(year);
  holidays.push({
    date: christmasObs,
    name: "Christmas Day",
    jurisdiction: "national",
  });
  holidays.push({
    date: boxingObs,
    name: "Boxing Day",
    jurisdiction: "national",
  });

  return holidays;
}

// ---------------------------------------------------------------------------
// State-specific holidays
// ---------------------------------------------------------------------------

function getWAHolidays(year: number): PublicHoliday[] {
  const holidays: PublicHoliday[] = [];

  // WA Day — 1st Monday in June
  holidays.push({
    date: nthWeekdayOfMonth(year, 6, 0, 1),
    name: "WA Day",
    jurisdiction: "WA",
  });

  // King's Birthday (WA) — 4th Monday in September
  // NOTE: WA is DIFFERENT from all other states!
  holidays.push({
    date: nthWeekdayOfMonth(year, 9, 0, 4),
    name: "King's Birthday",
    jurisdiction: "WA",
  });

  // Anzac Day substitute: WA gives Monday if Anzac Day falls on Sunday
  const anzac = makeDate(year, 4, 25);
  if (dayOfWeek(anzac) === 6) {
    // Sunday → Monday substitute
    holidays.push({
      date: addCalendarDays(anzac, 1),
      name: "Anzac Day (substitute)",
      jurisdiction: "WA",
    });
  }

  return holidays;
}

function getNSWHolidays(year: number): PublicHoliday[] {
  const holidays: PublicHoliday[] = [];

  // King's Birthday — 2nd Monday in June
  holidays.push({
    date: nthWeekdayOfMonth(year, 6, 0, 2),
    name: "King's Birthday",
    jurisdiction: "NSW",
  });

  // Bank Holiday — 1st Monday in August
  holidays.push({
    date: nthWeekdayOfMonth(year, 8, 0, 1),
    name: "Bank Holiday",
    jurisdiction: "NSW",
  });

  return holidays;
}

function getVICHolidays(year: number): PublicHoliday[] {
  const holidays: PublicHoliday[] = [];

  // King's Birthday — 2nd Monday in June
  holidays.push({
    date: nthWeekdayOfMonth(year, 6, 0, 2),
    name: "King's Birthday",
    jurisdiction: "VIC",
  });

  // Melbourne Cup — 1st Tuesday in November
  holidays.push({
    date: nthWeekdayOfMonth(year, 11, 1, 1),
    name: "Melbourne Cup Day",
    jurisdiction: "VIC",
  });

  return holidays;
}

function getQLDHolidays(year: number): PublicHoliday[] {
  const holidays: PublicHoliday[] = [];

  // King's Birthday — 2nd Monday in June (QLD moved it back from October)
  holidays.push({
    date: nthWeekdayOfMonth(year, 6, 0, 2),
    name: "King's Birthday",
    jurisdiction: "QLD",
  });

  // Royal Queensland Show (Brisbane only) — typically mid-August Wednesday
  // This is region-specific; we include it with a note
  holidays.push({
    date: nthWeekdayOfMonth(year, 8, 2, 2),
    name: "Royal Queensland Show (Brisbane region)",
    jurisdiction: "QLD",
  });

  return holidays;
}

function getSAHolidays(year: number): PublicHoliday[] {
  const holidays: PublicHoliday[] = [];

  // Adelaide Cup — 2nd Monday in March
  holidays.push({
    date: nthWeekdayOfMonth(year, 3, 0, 2),
    name: "Adelaide Cup",
    jurisdiction: "SA",
  });

  // King's Birthday — 2nd Monday in June
  holidays.push({
    date: nthWeekdayOfMonth(year, 6, 0, 2),
    name: "King's Birthday",
    jurisdiction: "SA",
  });

  // Proclamation Day — 24 December (or substitute)
  holidays.push({
    date: substituteDay(makeDate(year, 12, 24)),
    name: "Proclamation Day",
    jurisdiction: "SA",
  });

  return holidays;
}

function getTASHolidays(year: number): PublicHoliday[] {
  const holidays: PublicHoliday[] = [];

  // King's Birthday — 2nd Monday in June
  holidays.push({
    date: nthWeekdayOfMonth(year, 6, 0, 2),
    name: "King's Birthday",
    jurisdiction: "TAS",
  });

  // Recreation Day (Northern Tasmania) — 1st Monday in November
  holidays.push({
    date: nthWeekdayOfMonth(year, 11, 0, 1),
    name: "Recreation Day (North Tas)",
    jurisdiction: "TAS",
  });

  return holidays;
}

function getACTHolidays(year: number): PublicHoliday[] {
  const holidays: PublicHoliday[] = [];

  // Canberra Day — 2nd Monday in March
  holidays.push({
    date: nthWeekdayOfMonth(year, 3, 0, 2),
    name: "Canberra Day",
    jurisdiction: "ACT",
  });

  // Reconciliation Day — 27 May (or substitute)
  holidays.push({
    date: substituteDay(makeDate(year, 5, 27)),
    name: "Reconciliation Day",
    jurisdiction: "ACT",
  });

  // King's Birthday — 2nd Monday in June
  holidays.push({
    date: nthWeekdayOfMonth(year, 6, 0, 2),
    name: "King's Birthday",
    jurisdiction: "ACT",
  });

  // Family & Community Day — Monday before or on 30 September
  // This is the last Monday in September or the Monday of the week containing Sep 30
  // Simplified: last Monday on or before Sep 30
  const sep30 = makeDate(year, 9, 30);
  const sep30Dow = dayOfWeek(sep30);
  const daysBack = sep30Dow; // 0=Mon means 0 days back, 1=Tue means 1 day back, etc.
  holidays.push({
    date: addCalendarDays(sep30, -daysBack),
    name: "Family & Community Day",
    jurisdiction: "ACT",
  });

  return holidays;
}

function getNTHolidays(year: number): PublicHoliday[] {
  const holidays: PublicHoliday[] = [];

  // May Day — 1st Monday in May
  holidays.push({
    date: nthWeekdayOfMonth(year, 5, 0, 1),
    name: "May Day",
    jurisdiction: "NT",
  });

  // King's Birthday — 2nd Monday in June
  holidays.push({
    date: nthWeekdayOfMonth(year, 6, 0, 2),
    name: "King's Birthday",
    jurisdiction: "NT",
  });

  // Picnic Day — 1st Monday in August
  holidays.push({
    date: nthWeekdayOfMonth(year, 8, 0, 1),
    name: "Picnic Day",
    jurisdiction: "NT",
  });

  return holidays;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Get all public holidays for a given year and jurisdiction.
 * Includes national holidays + state/territory-specific holidays.
 * Returns holidays sorted by date.
 */
export function getPublicHolidays(year: number, jurisdiction: Jurisdiction): PublicHoliday[] {
  const holidays = [...getNationalHolidays(year)];

  switch (jurisdiction) {
    case "WA":
      holidays.push(...getWAHolidays(year));
      break;
    case "NSW":
      holidays.push(...getNSWHolidays(year));
      break;
    case "VIC":
      holidays.push(...getVICHolidays(year));
      break;
    case "QLD":
      holidays.push(...getQLDHolidays(year));
      break;
    case "SA":
      holidays.push(...getSAHolidays(year));
      break;
    case "TAS":
      holidays.push(...getTASHolidays(year));
      break;
    case "ACT":
      holidays.push(...getACTHolidays(year));
      break;
    case "NT":
      holidays.push(...getNTHolidays(year));
      break;
    case "CTH":
      // Commonwealth uses national holidays only
      break;
  }

  // Sort by date
  holidays.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  return holidays;
}

/**
 * Get a set of holiday date strings for quick lookup.
 * Used by working-days.ts for efficient is-holiday checks.
 */
export function getHolidayDateSet(year: number, jurisdiction: Jurisdiction): Set<string> {
  return new Set(getPublicHolidays(year, jurisdiction).map((h) => h.date));
}
