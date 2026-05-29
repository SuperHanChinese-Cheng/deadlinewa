import { describe, it, expect } from "vitest";
import { calculateLimitationDeadline } from "../src/engine/limitation";

describe("calculateLimitationDeadline", () => {
  const REF_DATE = "2025-01-15"; // Fixed reference date for all tests

  it("calculates contract simple WA (6 years)", () => {
    const result = calculateLimitationDeadline("contract_simple", "WA", "2020-01-15", REF_DATE);
    expect(result).not.toBeNull();
    expect(result!.deadlineDate).toBe("2026-01-15"); // 6 years from accrual
    expect(result!.isExpired).toBe(false);
    expect(result!.calendarDaysRemaining).toBe(365); // Jan 15 2025 → Jan 15 2026
  });

  it("calculates contract simple NT (3 years, shorter than other states)", () => {
    const result = calculateLimitationDeadline("contract_simple", "NT", "2020-01-15", REF_DATE);
    expect(result).not.toBeNull();
    expect(result!.deadlineDate).toBe("2023-01-15"); // 3 years
    expect(result!.isExpired).toBe(true);
  });

  it("calculates contract under deed VIC (15 years)", () => {
    const result = calculateLimitationDeadline("contract_deed", "VIC", "2020-01-15", REF_DATE);
    expect(result).not.toBeNull();
    expect(result!.deadlineDate).toBe("2035-01-15"); // 15 years
  });

  it("calculates personal injury WA with long-stop and discoverability", () => {
    const result = calculateLimitationDeadline("personal_injury", "WA", "2023-06-01", REF_DATE);
    expect(result).not.toBeNull();
    expect(result!.deadlineDate).toBe("2026-06-01"); // 3 years
    expect(result!.longStopDate).toBe("2035-06-01"); // 12-year long-stop
    // Should have discoverability warning
    expect(result!.warnings.some((w) => w.includes("discoverability"))).toBe(true);
  });

  it("calculates defamation (1 year) for all jurisdictions", () => {
    const jurisdictions = ["WA", "NSW", "VIC", "QLD", "SA", "TAS", "ACT", "NT"] as const;
    for (const jur of jurisdictions) {
      const result = calculateLimitationDeadline("defamation", jur, "2024-06-15", REF_DATE);
      expect(result).not.toBeNull();
      expect(result!.deadlineDate).toBe("2025-06-15"); // 1 year
    }
  });

  it("handles leap year accrual date (Feb 29)", () => {
    // Feb 29, 2024 + 6 years = Feb 28, 2030 (2030 is not a leap year)
    const result = calculateLimitationDeadline("contract_simple", "WA", "2024-02-29", REF_DATE);
    expect(result).not.toBeNull();
    expect(result!.deadlineDate).toBe("2030-02-28");
  });

  it("handles deadline falling on weekend — fileByDate adjusts", () => {
    // Find an accrual date where deadline lands on a Saturday
    // Jan 11, 2025 is Saturday. So accrual date 6 years prior = Jan 11, 2019
    const result = calculateLimitationDeadline("contract_simple", "WA", "2019-01-12", REF_DATE);
    expect(result).not.toBeNull();
    // Deadline: Jan 12, 2025 (Sunday). File-by: day before (Jan 11) is Saturday → back to Friday Jan 10
    expect(result!.deadlineDate).toBe("2025-01-12");
    expect(result!.fileByDate).toBe("2025-01-10"); // Friday
  });

  it("marks expired deadlines correctly", () => {
    const result = calculateLimitationDeadline("contract_simple", "WA", "2015-01-01", REF_DATE);
    expect(result).not.toBeNull();
    expect(result!.deadlineDate).toBe("2021-01-01"); // 6 years
    expect(result!.isExpired).toBe(true);
    expect(result!.warnings.some((w) => w.includes("EXPIRED"))).toBe(true);
  });

  it("generates 30-day urgency warning", () => {
    // Deadline within 30 days of reference date
    // Reference: 2025-01-15. Deadline needs to be before Feb 14, 2025
    // Defamation (1 year) from Jan 25, 2024 → deadline Jan 25, 2025 = 10 days away
    const result = calculateLimitationDeadline("defamation", "WA", "2024-01-25", REF_DATE);
    expect(result).not.toBeNull();
    expect(result!.warnings.some((w) => w.includes("URGENT"))).toBe(true);
  });

  it("returns null for unknown cause/jurisdiction combo", () => {
    const result = calculateLimitationDeadline("workers_comp", "VIC", "2024-01-01", REF_DATE);
    expect(result).toBeNull();
  });

  it("includes holidays in range", () => {
    const result = calculateLimitationDeadline("defamation", "WA", "2024-06-15", REF_DATE);
    expect(result).not.toBeNull();
    expect(result!.holidaysInRange.length).toBeGreaterThan(0);
    // Should include Anzac Day April 25
    expect(result!.holidaysInRange.some((h) => h.name === "Anzac Day")).toBe(true);
  });

  it("calculates workers comp WA (12 months)", () => {
    const result = calculateLimitationDeadline("workers_comp", "WA", "2024-06-15", REF_DATE);
    expect(result).not.toBeNull();
    // 0 years + 12 months = 1 year
    expect(result!.deadlineDate).toBe("2025-06-15");
  });

  it("calculates enforcement of judgment WA (12 years)", () => {
    const result = calculateLimitationDeadline(
      "enforcement_of_judgment",
      "WA",
      "2020-01-15",
      REF_DATE,
    );
    expect(result).not.toBeNull();
    expect(result!.deadlineDate).toBe("2032-01-15");
  });

  it("calculates land recovery VIC (15 years)", () => {
    const result = calculateLimitationDeadline("land_recovery", "VIC", "2020-01-15", REF_DATE);
    expect(result).not.toBeNull();
    expect(result!.deadlineDate).toBe("2035-01-15");
  });

  // ---------- New limitation period types ----------

  it("calculates professional negligence WA (6 years)", () => {
    const result = calculateLimitationDeadline("professional_negligence", "WA", "2020-03-01", REF_DATE);
    expect(result).not.toBeNull();
    expect(result!.deadlineDate).toBe("2026-03-01");
    expect(result!.isExpired).toBe(false);
  });

  it("calculates professional negligence NT (3 years — shorter)", () => {
    const result = calculateLimitationDeadline("professional_negligence", "NT", "2020-03-01", REF_DATE);
    expect(result).not.toBeNull();
    expect(result!.deadlineDate).toBe("2023-03-01");
    expect(result!.isExpired).toBe(true);
  });

  it("calculates medical negligence WA (3 years with 12-year long-stop)", () => {
    const result = calculateLimitationDeadline("medical_negligence", "WA", "2023-06-01", REF_DATE);
    expect(result).not.toBeNull();
    expect(result!.deadlineDate).toBe("2026-06-01");
    expect(result!.longStopDate).toBe("2035-06-01");
    expect(result!.warnings.some((w) => w.includes("discoverability"))).toBe(true);
  });

  it("calculates medical negligence QLD (3 years, accrual-based, no discoverability, no long-stop)", () => {
    const result = calculateLimitationDeadline("medical_negligence", "QLD", "2023-06-01", REF_DATE);
    expect(result).not.toBeNull();
    expect(result!.deadlineDate).toBe("2026-06-01");
    // QLD has NO long-stop period
    expect(result!.longStopDate).toBeNull();
    // QLD does NOT have the discoverability flag
    expect(result!.warnings.some((w) => w.startsWith("This period runs from discoverability"))).toBe(false);
  });

  it("calculates motor vehicle accident WA (3 years)", () => {
    const result = calculateLimitationDeadline("motor_vehicle", "WA", "2023-01-15", REF_DATE);
    expect(result).not.toBeNull();
    expect(result!.deadlineDate).toBe("2026-01-15");
  });

  it("calculates motor vehicle accident VIC (6 years)", () => {
    const result = calculateLimitationDeadline("motor_vehicle", "VIC", "2020-01-15", REF_DATE);
    expect(result).not.toBeNull();
    expect(result!.deadlineDate).toBe("2026-01-15");
  });

  it("calculates family property settlement (12 months from CTH)", () => {
    const result = calculateLimitationDeadline("family_property", "CTH", "2024-06-15", REF_DATE);
    expect(result).not.toBeNull();
    expect(result!.deadlineDate).toBe("2025-06-15"); // 1 year
  });

  it("calculates insurance claim WA (6 years)", () => {
    const result = calculateLimitationDeadline("insurance_claim", "WA", "2020-01-15", REF_DATE);
    expect(result).not.toBeNull();
    expect(result!.deadlineDate).toBe("2026-01-15");
  });

  it("calculates insurance claim NT (3 years — shorter)", () => {
    const result = calculateLimitationDeadline("insurance_claim", "NT", "2020-01-15", REF_DATE);
    expect(result).not.toBeNull();
    expect(result!.deadlineDate).toBe("2023-01-15");
    expect(result!.isExpired).toBe(true);
  });

  it("calculates insolvent trading CTH (6 years)", () => {
    const result = calculateLimitationDeadline("insolvent_trading", "CTH", "2020-01-15", REF_DATE);
    expect(result).not.toBeNull();
    expect(result!.deadlineDate).toBe("2026-01-15");
  });
});
