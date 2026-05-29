import { describe, it, expect } from "vitest";
import { calculateCourtDeadline, COURT_RULES, getCourtRules } from "../src/engine/court-rules";

describe("COURT_RULES data", () => {
  it("has rules for all courts", () => {
    const courts = [...new Set(COURT_RULES.map((r) => r.court))];
    expect(courts).toContain("WA Supreme Court");
    expect(courts).toContain("WA Magistrates Court");
    expect(courts).toContain("WA District Court");
    expect(courts).toContain("WA Court of Appeal");
    expect(courts).toContain("Family Court of WA");
    expect(courts).toContain("FCFCA (Div 2)");
    expect(courts).toContain("SAT (WA)");
    expect(courts).toContain("Federal Court");
    expect(courts).toContain("High Court");
  });

  it("filters by court name", () => {
    const waSupreme = getCourtRules("WA Supreme Court");
    expect(waSupreme.length).toBeGreaterThan(0);
    expect(waSupreme.every((r) => r.court === "WA Supreme Court")).toBe(true);
  });
});

describe("calculateCourtDeadline", () => {
  const REF_DATE = "2025-01-15";

  it("calculates WA Supreme Court defence deadline (21 calendar days)", () => {
    const rule = COURT_RULES.find(
      (r) => r.court === "WA Supreme Court" && r.deadlineType === "Filing a Defence",
    )!;
    const result = calculateCourtDeadline(rule, "2025-01-15", "WA", REF_DATE);
    // 21 calendar days from Jan 15 = Feb 5
    expect(result.deadlineDate).toBe("2025-02-05");
  });

  it("calculates Federal Court defence deadline (28 calendar days)", () => {
    const rule = COURT_RULES.find(
      (r) => r.court === "Federal Court" && r.deadlineType === "Filing a Defence",
    )!;
    const result = calculateCourtDeadline(rule, "2025-01-15", "WA", REF_DATE);
    // 28 calendar days from Jan 15 = Feb 12
    expect(result.deadlineDate).toBe("2025-02-12");
  });

  it("adjusts file-by date when deadline falls on weekend", () => {
    // Find a service date where +21 days lands on a weekend
    // Jan 11, 2025 is Saturday. 21 days before = Dec 21, 2024
    const rule = COURT_RULES.find(
      (r) => r.court === "WA Supreme Court" && r.deadlineType === "Filing a Defence",
    )!;
    const result = calculateCourtDeadline(rule, "2024-12-21", "WA", REF_DATE);
    // 21 days from Dec 21 = Jan 11, 2025 (Saturday)
    expect(result.deadlineDate).toBe("2025-01-11");
    // File-by should be Friday Jan 10
    expect(result.fileByDate).toBe("2025-01-10");
  });

  it("marks expired court deadlines", () => {
    const rule = COURT_RULES.find(
      (r) => r.court === "WA Supreme Court" && r.deadlineType === "Filing a Defence",
    )!;
    const result = calculateCourtDeadline(rule, "2024-12-01", "WA", REF_DATE);
    // 21 days from Dec 1 = Dec 22, which is before REF_DATE Jan 15
    expect(result.isExpired).toBe(true);
  });

  it("calculates High Court special leave appeal (28 days)", () => {
    const rule = COURT_RULES.find((r) => r.court === "High Court")!;
    const result = calculateCourtDeadline(rule, "2025-02-01", "WA", REF_DATE);
    expect(result.deadlineDate).toBe("2025-03-01");
  });

  // ---------- New court rules ----------

  it("calculates WA District Court defence deadline (14 calendar days)", () => {
    const rule = COURT_RULES.find(
      (r) => r.court === "WA District Court" && r.deadlineType === "Filing a Defence",
    )!;
    const result = calculateCourtDeadline(rule, "2025-01-15", "WA", REF_DATE);
    // 14 calendar days from Jan 15 = Jan 29
    expect(result.deadlineDate).toBe("2025-01-29");
  });

  it("calculates WA Court of Appeal notice of appeal — final (21 days)", () => {
    const rule = COURT_RULES.find(
      (r) => r.court === "WA Court of Appeal" && r.deadlineType === "Notice of Appeal (final order)",
    )!;
    const result = calculateCourtDeadline(rule, "2025-02-01", "WA", REF_DATE);
    expect(result.deadlineDate).toBe("2025-02-22");
  });

  it("calculates WA Court of Appeal notice of appeal — interlocutory (14 days)", () => {
    const rule = COURT_RULES.find(
      (r) => r.court === "WA Court of Appeal" && r.deadlineType === "Notice of Appeal (interlocutory)",
    )!;
    const result = calculateCourtDeadline(rule, "2025-02-01", "WA", REF_DATE);
    expect(result.deadlineDate).toBe("2025-02-15");
  });

  it("calculates Family Court of WA response (28 days)", () => {
    const rule = COURT_RULES.find(
      (r) => r.court === "Family Court of WA" && r.deadlineType.includes("in Australia"),
    )!;
    const result = calculateCourtDeadline(rule, "2025-01-15", "WA", REF_DATE);
    expect(result.deadlineDate).toBe("2025-02-12");
  });

  it("calculates FCFCA response (28 days)", () => {
    const rule = COURT_RULES.find(
      (r) => r.court === "FCFCA (Div 2)" && r.deadlineType.includes("General Federal Law"),
    )!;
    const result = calculateCourtDeadline(rule, "2025-01-15", "WA", REF_DATE);
    expect(result.deadlineDate).toBe("2025-02-12");
  });

  it("calculates SAT application for review (28 days)", () => {
    const rule = COURT_RULES.find(
      (r) => r.court === "SAT (WA)" && r.deadlineType.includes("review"),
    )!;
    const result = calculateCourtDeadline(rule, "2025-01-15", "WA", REF_DATE);
    expect(result.deadlineDate).toBe("2025-02-12");
  });
});
