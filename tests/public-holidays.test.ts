import { describe, it, expect } from "vitest";
import {
  easterSunday,
  nthWeekdayOfMonth,
  getPublicHolidays,
  dayOfWeek,
  makeDate,
} from "../src/engine/public-holidays";

describe("easterSunday", () => {
  it("computes known Easter dates correctly", () => {
    // Well-known Easter Sunday dates (verified against published tables)
    expect(easterSunday(2024)).toBe("2024-03-31");
    expect(easterSunday(2025)).toBe("2025-04-20");
    expect(easterSunday(2026)).toBe("2026-04-05");
    expect(easterSunday(2027)).toBe("2027-03-28");
    expect(easterSunday(2028)).toBe("2028-04-16");
    expect(easterSunday(2030)).toBe("2030-04-21");
    expect(easterSunday(2035)).toBe("2035-03-25");
  });

  it("works for far-future years", () => {
    // Just verify it doesn't crash and returns a valid date in March or April
    const date = easterSunday(2126);
    expect(date).toMatch(/^2126-0[34]-\d{2}$/);
  });
});

describe("nthWeekdayOfMonth", () => {
  it("finds 1st Monday in June (WA Day)", () => {
    // 2025: June 1 is a Sunday, so 1st Monday = June 2
    expect(nthWeekdayOfMonth(2025, 6, 0, 1)).toBe("2025-06-02");
    // 2026: June 1 is a Monday, so 1st Monday = June 1
    expect(nthWeekdayOfMonth(2026, 6, 0, 1)).toBe("2026-06-01");
  });

  it("finds 4th Monday in September (WA King's Birthday)", () => {
    // 2025: Sep 1 is a Monday, so 4th Monday = Sep 22
    expect(nthWeekdayOfMonth(2025, 9, 0, 4)).toBe("2025-09-22");
    // 2026: Sep 1 is a Tuesday, so 1st Monday = Sep 7, 4th Monday = Sep 28
    expect(nthWeekdayOfMonth(2026, 9, 0, 4)).toBe("2026-09-28");
  });

  it("finds 2nd Monday in June (other states King's Birthday)", () => {
    // 2025: June 1 is a Sunday, 1st Monday = June 2, 2nd Monday = June 9
    expect(nthWeekdayOfMonth(2025, 6, 0, 2)).toBe("2025-06-09");
  });

  it("finds 1st Tuesday in November (Melbourne Cup)", () => {
    // 2025: Nov 1 is a Saturday, 1st Tuesday = Nov 4
    expect(nthWeekdayOfMonth(2025, 11, 1, 1)).toBe("2025-11-04");
  });
});

describe("dayOfWeek", () => {
  it("returns 0 for Monday", () => {
    expect(dayOfWeek("2025-01-06")).toBe(0); // Known Monday
  });

  it("returns 4 for Friday", () => {
    expect(dayOfWeek("2025-01-10")).toBe(4); // Known Friday
  });

  it("returns 5 for Saturday", () => {
    expect(dayOfWeek("2025-01-11")).toBe(5);
  });

  it("returns 6 for Sunday", () => {
    expect(dayOfWeek("2025-01-12")).toBe(6);
  });
});

describe("getPublicHolidays — WA", () => {
  it("returns correct WA holidays for 2025", () => {
    const holidays = getPublicHolidays(2025, "WA");
    const names = holidays.map((h) => h.name);
    const dates = holidays.map((h) => h.date);

    // National holidays
    expect(dates).toContain("2025-01-01"); // New Year's Day
    expect(dates).toContain("2025-01-27"); // Australia Day (26th is Sunday → Monday sub)
    expect(dates).toContain("2025-04-18"); // Good Friday (Easter April 20)
    expect(dates).toContain("2025-04-19"); // Easter Saturday
    expect(dates).toContain("2025-04-21"); // Easter Monday
    expect(dates).toContain("2025-04-25"); // Anzac Day (Friday)
    expect(dates).toContain("2025-12-25"); // Christmas (Thursday)
    expect(dates).toContain("2025-12-26"); // Boxing Day (Friday)

    // WA-specific holidays
    expect(names).toContain("WA Day");
    expect(names).toContain("King's Birthday");
    expect(dates).toContain("2025-06-02"); // WA Day (1st Monday June)
    expect(dates).toContain("2025-09-22"); // King's Birthday (4th Monday Sep)
  });

  it("handles Australia Day falling on Sunday (2025)", () => {
    const holidays = getPublicHolidays(2025, "WA");
    // Jan 26, 2025 is a Sunday → substitute Monday Jan 27
    const ausDayHoliday = holidays.find((h) => h.name === "Australia Day");
    expect(ausDayHoliday?.date).toBe("2025-01-27");
  });

  it("handles Christmas on Saturday + Boxing Day on Sunday (double sub)", () => {
    // 2021: Dec 25 = Saturday, Dec 26 = Sunday
    const holidays = getPublicHolidays(2021, "WA");
    const christmas = holidays.find((h) => h.name === "Christmas Day");
    const boxing = holidays.find((h) => h.name === "Boxing Day");
    expect(christmas?.date).toBe("2021-12-27"); // Monday
    expect(boxing?.date).toBe("2021-12-28"); // Tuesday
  });

  it("handles Christmas on Sunday (2022)", () => {
    // 2022: Dec 25 = Sunday → sub Tue Dec 27. Dec 26 = Monday (no sub)
    const holidays = getPublicHolidays(2022, "WA");
    const christmas = holidays.find((h) => h.name === "Christmas Day");
    const boxing = holidays.find((h) => h.name === "Boxing Day");
    expect(christmas?.date).toBe("2022-12-27"); // Tuesday
    expect(boxing?.date).toBe("2022-12-26"); // Monday (actual day)
  });

  it("handles Boxing Day on Saturday (Christmas on Friday)", () => {
    // 2020: Dec 25 = Friday, Dec 26 = Saturday → Boxing Day subs to Monday Dec 28
    const holidays = getPublicHolidays(2020, "WA");
    const christmas = holidays.find((h) => h.name === "Christmas Day");
    const boxing = holidays.find((h) => h.name === "Boxing Day");
    expect(christmas?.date).toBe("2020-12-25"); // Friday, no sub
    expect(boxing?.date).toBe("2020-12-28"); // Monday
  });

  it("handles Anzac Day on Sunday in WA (substitute Monday)", () => {
    // 2021: April 25 = Sunday → WA gives a substitute Monday April 26
    const holidays = getPublicHolidays(2021, "WA");
    const anzacSub = holidays.find((h) => h.name === "Anzac Day (substitute)");
    expect(anzacSub?.date).toBe("2021-04-26");
  });

  it("returns holidays sorted by date", () => {
    const holidays = getPublicHolidays(2025, "WA");
    for (let i = 1; i < holidays.length; i++) {
      expect(holidays[i].date >= holidays[i - 1].date).toBe(true);
    }
  });

  it("returns a reasonable number of holidays (10-13)", () => {
    for (let year = 2020; year <= 2035; year++) {
      const count = getPublicHolidays(year, "WA").length;
      expect(count).toBeGreaterThanOrEqual(10);
      expect(count).toBeLessThanOrEqual(14);
    }
  });
});

describe("getPublicHolidays — other jurisdictions", () => {
  it("NSW has Bank Holiday in August", () => {
    const holidays = getPublicHolidays(2025, "NSW");
    const bankHol = holidays.find((h) => h.name === "Bank Holiday");
    expect(bankHol).toBeDefined();
    expect(bankHol?.date).toBe("2025-08-04"); // 1st Monday August 2025
  });

  it("VIC has Melbourne Cup in November", () => {
    const holidays = getPublicHolidays(2025, "VIC");
    const cup = holidays.find((h) => h.name === "Melbourne Cup Day");
    expect(cup).toBeDefined();
  });

  it("NT has May Day and Picnic Day", () => {
    const holidays = getPublicHolidays(2025, "NT");
    const names = holidays.map((h) => h.name);
    expect(names).toContain("May Day");
    expect(names).toContain("Picnic Day");
  });

  it("WA King's Birthday is in September (4th Mon), others in June (2nd Mon)", () => {
    const waHolidays = getPublicHolidays(2025, "WA");
    const nswHolidays = getPublicHolidays(2025, "NSW");

    const waKB = waHolidays.find((h) => h.name === "King's Birthday");
    const nswKB = nswHolidays.find((h) => h.name === "King's Birthday");

    // WA: 4th Monday September 2025 = Sep 22
    expect(waKB?.date).toBe("2025-09-22");
    // NSW: 2nd Monday June 2025 = Jun 9
    expect(nswKB?.date).toBe("2025-06-09");
  });

  it("CTH only has national holidays", () => {
    const cthHolidays = getPublicHolidays(2025, "CTH");
    // Should have national holidays but no state-specific ones
    const names = cthHolidays.map((h) => h.name);
    expect(names).not.toContain("WA Day");
    expect(names).not.toContain("King's Birthday");
    expect(names).toContain("Good Friday");
  });

  it("ACT has Canberra Day and Reconciliation Day", () => {
    const holidays = getPublicHolidays(2025, "ACT");
    const names = holidays.map((h) => h.name);
    expect(names).toContain("Canberra Day");
    expect(names).toContain("Reconciliation Day");
  });
});
