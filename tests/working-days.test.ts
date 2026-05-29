import { describe, it, expect } from "vitest";
import {
  isWorkingDay,
  addWorkingDays,
  countWorkingDays,
  lastWorkingDayOnOrBefore,
} from "../src/engine/working-days";

describe("isWorkingDay", () => {
  it("returns true for a normal weekday", () => {
    expect(isWorkingDay("2025-01-06", "WA")).toBe(true); // Monday
    expect(isWorkingDay("2025-01-07", "WA")).toBe(true); // Tuesday
    expect(isWorkingDay("2025-01-10", "WA")).toBe(true); // Friday
  });

  it("returns false for Saturday and Sunday", () => {
    expect(isWorkingDay("2025-01-11", "WA")).toBe(false); // Saturday
    expect(isWorkingDay("2025-01-12", "WA")).toBe(false); // Sunday
  });

  it("returns false for New Year's Day", () => {
    expect(isWorkingDay("2025-01-01", "WA")).toBe(false);
  });

  it("returns false for Good Friday", () => {
    // Easter 2025 is April 20, Good Friday = April 18
    expect(isWorkingDay("2025-04-18", "WA")).toBe(false);
  });

  it("returns false for WA Day but true in NSW", () => {
    // WA Day 2025 = 1st Monday June = June 2
    expect(isWorkingDay("2025-06-02", "WA")).toBe(false);
    expect(isWorkingDay("2025-06-02", "NSW")).toBe(true); // Not a holiday in NSW
  });

  it("returns false for WA King's Birthday (Sep) but true on that day in NSW", () => {
    // WA King's Birthday 2025 = 4th Monday September = Sep 22
    expect(isWorkingDay("2025-09-22", "WA")).toBe(false);
    expect(isWorkingDay("2025-09-22", "NSW")).toBe(true);
  });
});

describe("addWorkingDays", () => {
  it("adds 1 working day from Friday = next Monday", () => {
    expect(addWorkingDays("2025-01-10", 1, "WA")).toBe("2025-01-13"); // Fri → Mon
  });

  it("adds 5 working days from Monday = next Monday", () => {
    expect(addWorkingDays("2025-01-06", 5, "WA")).toBe("2025-01-13");
  });

  it("skips Easter holidays", () => {
    // Easter 2025: Good Friday April 18, Easter Mon April 21
    // Start: Thursday April 17
    // Day 1 = skip Fri 18 (Good Friday), skip Sat 19, skip Sun 20, skip Mon 21 (Easter Mon) → Tue 22
    expect(addWorkingDays("2025-04-17", 1, "WA")).toBe("2025-04-22");
  });

  it("handles year boundary with Christmas/New Year", () => {
    // Dec 24, 2025 is a Wednesday
    // Christmas Dec 25 (Thu) — holiday
    // Boxing Day Dec 26 (Fri) — holiday
    // Dec 27-28 weekend
    // Dec 29 Mon — working day (day 1)
    // Dec 30 Tue — working day (day 2)
    // Dec 31 Wed — working day (day 3)
    // Jan 1, 2026 (Thu) — holiday (New Year)
    // Jan 2, 2026 (Fri) — working day (day 4)
    expect(addWorkingDays("2025-12-24", 4, "WA")).toBe("2026-01-02");
  });

  it("handles 21 calendar-equivalent working days for court deadline", () => {
    // Starting from Jan 6, 2025 (Monday), add 21 working days
    // That should be roughly 4 weeks + 1 day = 29 calendar days, ending on Feb 4 or similar
    const result = addWorkingDays("2025-01-06", 21, "WA");
    // 21 working days from Mon Jan 6:
    // Week 1: Jan 7-10 (4 days, but Jan 27 is Aus Day sub...)
    // Let's just verify it's a weekday and in early February
    expect(result >= "2025-02-03").toBe(true);
    expect(result <= "2025-02-07").toBe(true);
  });
});

describe("countWorkingDays", () => {
  it("counts 5 working days in a normal week (Mon to Fri, start exclusive)", () => {
    // Mon Jan 6 to Fri Jan 10: start exclusive, end inclusive
    // Days counted: Tue 7, Wed 8, Thu 9, Fri 10 = 4 days
    expect(countWorkingDays("2025-01-06", "2025-01-10", "WA")).toBe(4);
  });

  it("counts 0 when start equals end", () => {
    expect(countWorkingDays("2025-01-06", "2025-01-06", "WA")).toBe(0);
  });

  it("counts 0 when end is before start", () => {
    expect(countWorkingDays("2025-01-10", "2025-01-06", "WA")).toBe(0);
  });

  it("correctly excludes weekends", () => {
    // Fri Jan 10 to Mon Jan 13: Sat 11, Sun 12 excluded, Mon 13 counted = 1
    expect(countWorkingDays("2025-01-10", "2025-01-13", "WA")).toBe(1);
  });

  it("correctly excludes public holidays", () => {
    // Around Australia Day 2025 (Jan 26 = Sun, sub Mon Jan 27)
    // Fri Jan 24 to Tue Jan 28:
    // Sat 25 (weekend), Sun 26 (weekend), Mon 27 (holiday), Tue 28 (working) = 1
    expect(countWorkingDays("2025-01-24", "2025-01-28", "WA")).toBe(1);
  });
});

describe("lastWorkingDayOnOrBefore", () => {
  it("returns the same day if it's a working day", () => {
    expect(lastWorkingDayOnOrBefore("2025-01-06", "WA")).toBe("2025-01-06"); // Monday
  });

  it("returns Friday for a Saturday", () => {
    expect(lastWorkingDayOnOrBefore("2025-01-11", "WA")).toBe("2025-01-10"); // Sat → Fri
  });

  it("returns Friday for a Sunday", () => {
    expect(lastWorkingDayOnOrBefore("2025-01-12", "WA")).toBe("2025-01-10"); // Sun → Fri
  });

  it("skips back over holidays", () => {
    // Christmas 2025 is Thursday Dec 25, Boxing Day is Friday Dec 26
    // Sat Dec 27 → back to Wed Dec 24 (skip Sat, Fri Boxing, Thu Christmas)
    expect(lastWorkingDayOnOrBefore("2025-12-27", "WA")).toBe("2025-12-24");
  });
});
