import { describe, it, expect } from "vitest";
import { generateICS } from "../src/engine/calendar-export";
import type { DeadlineResult } from "../src/types";

function makeResult(overrides: Partial<DeadlineResult> = {}): DeadlineResult {
  return {
    causeOfAction: "Contract (Simple)",
    jurisdiction: "WA",
    accrualDate: "2020-01-15",
    deadlineDate: "2026-01-15",
    fileByDate: "2026-01-14",
    calendarDaysRemaining: 365,
    workingDaysRemaining: 260,
    isExpired: false,
    warnings: [],
    holidaysInRange: [],
    sectionRef: "s 13",
    actName: "Limitation Act 2005 (WA)",
    notes: "",
    longStopDate: null,
    ...overrides,
  };
}

describe("generateICS", () => {
  it("produces valid iCalendar structure", () => {
    const ics = generateICS(makeResult());
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("END:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("END:VEVENT");
    expect(ics).toContain("VERSION:2.0");
  });

  it("sets correct DTSTART for all-day event", () => {
    const ics = generateICS(makeResult({ deadlineDate: "2026-01-15" }));
    expect(ics).toContain("DTSTART;VALUE=DATE:20260115");
    expect(ics).toContain("DTEND;VALUE=DATE:20260116"); // Next day for all-day
  });

  it("includes the cause of action and jurisdiction in SUMMARY", () => {
    const ics = generateICS(makeResult());
    expect(ics).toContain("SUMMARY:DEADLINE: Contract (Simple)");
    expect(ics).toContain("WA");
  });

  it("includes 5 reminder alarms", () => {
    const ics = generateICS(makeResult());
    const alarmCount = (ics.match(/BEGIN:VALARM/g) || []).length;
    expect(alarmCount).toBe(5);
  });

  it("has correct trigger durations for alarms", () => {
    const ics = generateICS(makeResult());
    expect(ics).toContain("TRIGGER:-P26W"); // ~6 months
    expect(ics).toContain("TRIGGER:-P13W"); // ~3 months
    expect(ics).toContain("TRIGGER:-P4W"); // ~1 month
    expect(ics).toContain("TRIGGER:-P2W"); // 2 weeks
    expect(ics).toContain("TRIGGER:-P1W"); // 1 week
  });

  it("includes disclaimer in description", () => {
    const ics = generateICS(makeResult());
    expect(ics).toContain("does not constitute legal advice");
  });

  it("includes PRODID identifying DeadlineWA", () => {
    const ics = generateICS(makeResult());
    expect(ics).toContain("PRODID:-//DeadlineWA");
  });
});
