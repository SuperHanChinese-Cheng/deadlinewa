/**
 * Limitation period lookup table for all Australian jurisdictions.
 *
 * Data sourced from docs/LIMITATION_PERIODS.md.
 * Periods are pure data — no calculation logic here.
 */

import type { CauseOfAction, Jurisdiction, LimitationPeriod } from "../types";

/** Helper to build a LimitationPeriod with defaults. */
function lp(
  causeOfAction: CauseOfAction,
  jurisdiction: Jurisdiction,
  years: number,
  opts: Partial<
    Pick<
      LimitationPeriod,
      "months" | "days" | "longStopYears" | "discoverability" | "sectionRef" | "actName" | "notes" | "displayName"
    >
  > = {},
): LimitationPeriod {
  return {
    causeOfAction,
    jurisdiction,
    years,
    months: opts.months ?? 0,
    days: opts.days ?? 0,
    longStopYears: opts.longStopYears ?? null,
    discoverability: opts.discoverability ?? false,
    sectionRef: opts.sectionRef ?? "",
    actName: opts.actName ?? "",
    notes: opts.notes ?? "",
    displayName: opts.displayName ?? "",
  };
}

// ---------------------------------------------------------------------------
// Complete limitation periods table
// ---------------------------------------------------------------------------

export const LIMITATION_PERIODS: LimitationPeriod[] = [
  // ==================== Contract (Simple) ====================
  lp("contract_simple", "WA", 6, {
    sectionRef: "s 13",
    actName: "Limitation Act 2005 (WA)",
    displayName: "Contract (Simple)",
  }),
  lp("contract_simple", "NSW", 6, {
    sectionRef: "s 14(1)(a)",
    actName: "Limitation Act 1969 (NSW)",
    displayName: "Contract (Simple)",
  }),
  lp("contract_simple", "VIC", 6, {
    sectionRef: "s 5(1)(a)",
    actName: "Limitation of Actions Act 1958 (Vic)",
    displayName: "Contract (Simple)",
  }),
  lp("contract_simple", "QLD", 6, {
    sectionRef: "s 10(1)(a)",
    actName: "Limitation of Actions Act 1974 (Qld)",
    displayName: "Contract (Simple)",
  }),
  lp("contract_simple", "SA", 6, {
    sectionRef: "s 35(a)",
    actName: "Limitation of Actions Act 1936 (SA)",
    displayName: "Contract (Simple)",
  }),
  lp("contract_simple", "TAS", 6, {
    sectionRef: "s 4(1)(a)",
    actName: "Limitation Act 1974 (Tas)",
    displayName: "Contract (Simple)",
  }),
  lp("contract_simple", "ACT", 6, {
    sectionRef: "s 11(1)",
    actName: "Limitation Act 1985 (ACT)",
    displayName: "Contract (Simple)",
  }),
  lp("contract_simple", "NT", 3, {
    sectionRef: "s 12(1)(a)",
    actName: "Limitation Act 1981 (NT)",
    displayName: "Contract (Simple)",
    notes: "NT has a shorter 3-year period, unlike the 6 years in most states.",
  }),

  // ==================== Contract (Under Deed / Specialty) ====================
  lp("contract_deed", "WA", 12, {
    sectionRef: "s 13",
    actName: "Limitation Act 2005 (WA)",
    displayName: "Contract (Under Deed)",
  }),
  lp("contract_deed", "NSW", 12, {
    sectionRef: "s 16",
    actName: "Limitation Act 1969 (NSW)",
    displayName: "Contract (Under Deed)",
  }),
  lp("contract_deed", "VIC", 15, {
    sectionRef: "s 5(3)",
    actName: "Limitation of Actions Act 1958 (Vic)",
    displayName: "Contract (Under Deed)",
  }),
  lp("contract_deed", "QLD", 12, {
    sectionRef: "s 10(1)(c)",
    actName: "Limitation of Actions Act 1974 (Qld)",
    displayName: "Contract (Under Deed)",
  }),
  lp("contract_deed", "SA", 15, {
    sectionRef: "s 35(c)",
    actName: "Limitation of Actions Act 1936 (SA)",
    displayName: "Contract (Under Deed)",
  }),
  lp("contract_deed", "TAS", 12, {
    sectionRef: "s 4(1)(c)",
    actName: "Limitation Act 1974 (Tas)",
    displayName: "Contract (Under Deed)",
  }),
  lp("contract_deed", "ACT", 12, {
    sectionRef: "s 11(2)",
    actName: "Limitation Act 1985 (ACT)",
    displayName: "Contract (Under Deed)",
  }),
  lp("contract_deed", "NT", 12, {
    sectionRef: "s 12(1)(b)",
    actName: "Limitation Act 1981 (NT)",
    displayName: "Contract (Under Deed)",
  }),

  // ==================== Tort — General ====================
  lp("tort_general", "WA", 6, {
    sectionRef: "s 13",
    actName: "Limitation Act 2005 (WA)",
    displayName: "Tort — General",
  }),
  lp("tort_general", "NSW", 6, {
    sectionRef: "s 14(1)(b)",
    actName: "Limitation Act 1969 (NSW)",
    displayName: "Tort — General",
  }),
  lp("tort_general", "VIC", 6, {
    sectionRef: "s 5(1)(a)",
    actName: "Limitation of Actions Act 1958 (Vic)",
    displayName: "Tort — General",
  }),
  lp("tort_general", "QLD", 6, {
    sectionRef: "s 10(1)(a)",
    actName: "Limitation of Actions Act 1974 (Qld)",
    displayName: "Tort — General",
  }),
  lp("tort_general", "SA", 6, {
    sectionRef: "s 35(a)",
    actName: "Limitation of Actions Act 1936 (SA)",
    displayName: "Tort — General",
  }),
  lp("tort_general", "TAS", 6, {
    sectionRef: "s 4(1)(a)",
    actName: "Limitation Act 1974 (Tas)",
    displayName: "Tort — General",
  }),
  lp("tort_general", "ACT", 6, {
    sectionRef: "s 11(1)",
    actName: "Limitation Act 1985 (ACT)",
    displayName: "Tort — General",
  }),
  lp("tort_general", "NT", 3, {
    sectionRef: "s 12(1)(a)",
    actName: "Limitation Act 1981 (NT)",
    displayName: "Tort — General",
    notes: "NT has a shorter 3-year period.",
  }),

  // ==================== Personal Injury ====================
  lp("personal_injury", "WA", 3, {
    longStopYears: 12,
    discoverability: true,
    sectionRef: "ss 14, 55",
    actName: "Limitation Act 2005 (WA)",
    displayName: "Personal Injury",
    notes:
      "Period runs from discoverability (when plaintiff knew or ought to have known). May be extended for disability, fraud, or concealment.",
  }),
  lp("personal_injury", "NSW", 3, {
    longStopYears: 12,
    discoverability: true,
    sectionRef: "ss 50C, 50D",
    actName: "Limitation Act 1969 (NSW)",
    displayName: "Personal Injury",
    notes: "Period runs from discoverability.",
  }),
  lp("personal_injury", "VIC", 3, {
    longStopYears: 12,
    discoverability: true,
    sectionRef: "ss 27D, 27K",
    actName: "Limitation of Actions Act 1958 (Vic)",
    displayName: "Personal Injury",
    notes: "Period runs from discoverability.",
  }),
  lp("personal_injury", "QLD", 3, {
    longStopYears: 12,
    discoverability: false,
    sectionRef: "ss 11, 29",
    actName: "Limitation of Actions Act 1974 (Qld)",
    displayName: "Personal Injury",
    notes: "Period runs from accrual (not discoverability in QLD).",
  }),
  lp("personal_injury", "SA", 3, {
    longStopYears: 12,
    discoverability: true,
    sectionRef: "ss 36, 45",
    actName: "Limitation of Actions Act 1936 (SA)",
    displayName: "Personal Injury",
    notes: "Period runs from discoverability.",
  }),
  lp("personal_injury", "TAS", 3, {
    longStopYears: 12,
    discoverability: true,
    sectionRef: "ss 5A, 5B",
    actName: "Limitation Act 1974 (Tas)",
    displayName: "Personal Injury",
    notes: "Period runs from discoverability.",
  }),
  lp("personal_injury", "ACT", 3, {
    discoverability: false,
    sectionRef: "s 16B",
    actName: "Limitation Act 1985 (ACT)",
    displayName: "Personal Injury",
    notes: "Period runs from accrual. No long-stop period in ACT.",
  }),
  lp("personal_injury", "NT", 3, {
    discoverability: false,
    sectionRef: "s 12(1)(b)",
    actName: "Limitation Act 1981 (NT)",
    displayName: "Personal Injury",
    notes: "Period runs from accrual. No long-stop period in NT.",
  }),

  // ==================== Defamation ====================
  lp("defamation", "WA", 1, {
    sectionRef: "s 15; Defamation Act 2005 (WA) s 41",
    actName: "Limitation Act 2005 (WA)",
    displayName: "Defamation",
    notes: "Extension up to 3 years may be granted by court.",
  }),
  lp("defamation", "NSW", 1, {
    sectionRef: "Defamation Act 2005 (NSW) s 56A",
    actName: "Defamation Act 2005 (NSW)",
    displayName: "Defamation",
    notes: "Extension up to 3 years may be granted by court.",
  }),
  lp("defamation", "VIC", 1, {
    sectionRef: "Defamation Act 2005 (Vic) s 56A",
    actName: "Defamation Act 2005 (Vic)",
    displayName: "Defamation",
    notes: "Extension up to 3 years may be granted by court.",
  }),
  lp("defamation", "QLD", 1, {
    sectionRef: "Defamation Act 2005 (Qld) s 56A",
    actName: "Defamation Act 2005 (Qld)",
    displayName: "Defamation",
    notes: "Extension up to 3 years may be granted by court.",
  }),
  lp("defamation", "SA", 1, {
    sectionRef: "Defamation Act 2005 (SA) s 41",
    actName: "Defamation Act 2005 (SA)",
    displayName: "Defamation",
    notes: "Extension up to 3 years may be granted by court.",
  }),
  lp("defamation", "TAS", 1, {
    sectionRef: "Defamation Act 2005 (Tas) s 56A",
    actName: "Defamation Act 2005 (Tas)",
    displayName: "Defamation",
    notes: "Extension up to 3 years may be granted by court.",
  }),
  lp("defamation", "ACT", 1, {
    sectionRef: "Defamation Act 2006 (ACT) s 56A",
    actName: "Defamation Act 2006 (ACT)",
    displayName: "Defamation",
    notes: "Extension up to 3 years may be granted by court.",
  }),
  lp("defamation", "NT", 1, {
    sectionRef: "Defamation Act 2006 (NT) s 56A",
    actName: "Defamation Act 2006 (NT)",
    displayName: "Defamation",
    notes: "Extension up to 3 years may be granted by court.",
  }),

  // ==================== Recovery of Land / Possession ====================
  lp("land_recovery", "WA", 12, {
    sectionRef: "s 19",
    actName: "Limitation Act 2005 (WA)",
    displayName: "Recovery of Land",
  }),
  lp("land_recovery", "NSW", 12, {
    sectionRef: "s 27(2)",
    actName: "Limitation Act 1969 (NSW)",
    displayName: "Recovery of Land",
  }),
  lp("land_recovery", "VIC", 15, {
    sectionRef: "s 8",
    actName: "Limitation of Actions Act 1958 (Vic)",
    displayName: "Recovery of Land",
  }),
  lp("land_recovery", "QLD", 12, {
    sectionRef: "s 13",
    actName: "Limitation of Actions Act 1974 (Qld)",
    displayName: "Recovery of Land",
  }),
  lp("land_recovery", "SA", 15, {
    sectionRef: "s 4",
    actName: "Limitation of Actions Act 1936 (SA)",
    displayName: "Recovery of Land",
  }),
  lp("land_recovery", "TAS", 12, {
    sectionRef: "s 10(1)",
    actName: "Limitation Act 1974 (Tas)",
    displayName: "Recovery of Land",
  }),
  lp("land_recovery", "ACT", 12, {
    sectionRef: "s 25",
    actName: "Limitation Act 1985 (ACT)",
    displayName: "Recovery of Land",
  }),
  lp("land_recovery", "NT", 12, {
    sectionRef: "s 18",
    actName: "Limitation Act 1981 (NT)",
    displayName: "Recovery of Land",
  }),

  // ==================== Debt Recovery / Money Owing ====================
  lp("debt_recovery", "WA", 6, {
    sectionRef: "s 13",
    actName: "Limitation Act 2005 (WA)",
    displayName: "Debt Recovery",
    notes: "Acknowledgment or part payment restarts the limitation period.",
  }),
  lp("debt_recovery", "NSW", 6, {
    sectionRef: "s 14(1)(a)",
    actName: "Limitation Act 1969 (NSW)",
    displayName: "Debt Recovery",
    notes: "Acknowledgment or part payment restarts the limitation period.",
  }),
  lp("debt_recovery", "VIC", 6, {
    sectionRef: "s 5(1)(a)",
    actName: "Limitation of Actions Act 1958 (Vic)",
    displayName: "Debt Recovery",
    notes: "Acknowledgment or part payment restarts the limitation period.",
  }),
  lp("debt_recovery", "QLD", 6, {
    sectionRef: "s 10(1)(a)",
    actName: "Limitation of Actions Act 1974 (Qld)",
    displayName: "Debt Recovery",
    notes: "Acknowledgment or part payment restarts the limitation period.",
  }),
  lp("debt_recovery", "SA", 6, {
    sectionRef: "s 35(a)",
    actName: "Limitation of Actions Act 1936 (SA)",
    displayName: "Debt Recovery",
    notes: "Acknowledgment or part payment restarts the limitation period.",
  }),
  lp("debt_recovery", "TAS", 6, {
    sectionRef: "s 4(1)(a)",
    actName: "Limitation Act 1974 (Tas)",
    displayName: "Debt Recovery",
    notes: "Acknowledgment or part payment restarts the limitation period.",
  }),
  lp("debt_recovery", "ACT", 6, {
    sectionRef: "s 11(1)",
    actName: "Limitation Act 1985 (ACT)",
    displayName: "Debt Recovery",
    notes: "Acknowledgment or part payment restarts the limitation period.",
  }),
  lp("debt_recovery", "NT", 3, {
    sectionRef: "s 12(1)(a)",
    actName: "Limitation Act 1981 (NT)",
    displayName: "Debt Recovery",
    notes: "NT has a shorter 3-year period. Acknowledgment or part payment restarts the period.",
  }),

  // ==================== Building / Construction ====================
  lp("building", "WA", 6, {
    longStopYears: 10,
    sectionRef: "s 13",
    actName: "Limitation Act 2005 (WA)",
    displayName: "Building / Construction",
    notes:
      "Long-stop of 10 years from completion. See also Building Services (Complaint Resolution and Administration) Act 2011 (WA).",
  }),
  lp("building", "NSW", 6, {
    longStopYears: 10,
    sectionRef: "Environmental Planning and Assessment Act 1979 (NSW) s 6.20",
    actName: "Limitation Act 1969 (NSW)",
    displayName: "Building / Construction",
    notes:
      "6 years for economic loss, 3 years for personal injury. Long-stop of 10 years from completion.",
  }),
  lp("building", "VIC", 6, {
    longStopYears: 10,
    sectionRef: "Building Act 1993 (Vic) s 134",
    actName: "Limitation of Actions Act 1958 (Vic)",
    displayName: "Building / Construction",
    notes: "Long-stop of 10 years from completion.",
  }),
  lp("building", "QLD", 6, {
    longStopYears: 10,
    sectionRef: "Queensland Building and Construction Commission Act 1991 (Qld) s 68",
    actName: "Limitation of Actions Act 1974 (Qld)",
    displayName: "Building / Construction",
    notes:
      "Long-stop: 10 years (non-structural defects), 15 years (structural defects).",
  }),

  // ==================== Equity (Breach of Trust / Fiduciary Duty) ====================
  lp("equity", "WA", 6, {
    sectionRef: "s 27",
    actName: "Limitation Act 2005 (WA)",
    displayName: "Equity",
    notes: "6 years by analogy to common law.",
  }),
  lp("equity", "NSW", 6, {
    sectionRef: "s 48",
    actName: "Limitation Act 1969 (NSW)",
    displayName: "Equity",
    notes: "6 years by analogy to common law.",
  }),
  lp("equity", "VIC", 6, {
    sectionRef: "s 21",
    actName: "Limitation of Actions Act 1958 (Vic)",
    displayName: "Equity",
  }),
  lp("equity", "QLD", 6, {
    sectionRef: "s 27",
    actName: "Limitation of Actions Act 1974 (Qld)",
    displayName: "Equity",
  }),

  // ==================== Consumer Law (ACL — Commonwealth) ====================
  lp("consumer_law", "CTH", 6, {
    sectionRef: "Competition and Consumer Act 2010 (Cth) sch 2",
    actName: "Competition and Consumer Act 2010 (Cth)",
    displayName: "Consumer Law (ACL)",
    notes:
      "6 years general. 3 years for damages for personal injury under ACL. Applies in all jurisdictions via applied laws.",
  }),

  // ==================== Workers Compensation ====================
  lp("workers_comp", "WA", 0, {
    months: 12,
    sectionRef: "",
    actName: "Workers' Compensation and Injury Management Act 1981 (WA)",
    displayName: "Workers Compensation",
    notes: "12 months from injury, or 3 years from discovery. Seek specialist advice.",
  }),
  lp("workers_comp", "NSW", 0, {
    months: 6,
    sectionRef: "",
    actName: "Workers Compensation Act 1987 (NSW)",
    displayName: "Workers Compensation",
    notes: "6 months from injury. Seek specialist advice.",
  }),

  // ==================== Enforcement of Judgment ====================
  lp("enforcement_of_judgment", "WA", 12, {
    sectionRef: "s 13(2)",
    actName: "Limitation Act 2005 (WA)",
    displayName: "Enforcement of Judgment",
  }),
  lp("enforcement_of_judgment", "NSW", 12, {
    sectionRef: "s 17",
    actName: "Limitation Act 1969 (NSW)",
    displayName: "Enforcement of Judgment",
  }),
  lp("enforcement_of_judgment", "VIC", 15, {
    sectionRef: "s 5(3)",
    actName: "Limitation of Actions Act 1958 (Vic)",
    displayName: "Enforcement of Judgment",
  }),
  lp("enforcement_of_judgment", "QLD", 12, {
    sectionRef: "s 10(1)(d)",
    actName: "Limitation of Actions Act 1974 (Qld)",
    displayName: "Enforcement of Judgment",
  }),

  // ==================== Professional Negligence (Economic Loss) ====================
  lp("professional_negligence", "WA", 6, {
    sectionRef: "s 13",
    actName: "Limitation Act 2005 (WA)",
    displayName: "Professional Negligence",
    notes: "6 years for economic loss. If personal injury results, the 3-year personal injury regime applies instead. Accrual is when loss is first suffered, not when the negligent act occurred.",
  }),
  lp("professional_negligence", "NSW", 6, {
    sectionRef: "s 14(1)(b)",
    actName: "Limitation Act 1969 (NSW)",
    displayName: "Professional Negligence",
    notes: "6 years for economic loss. NSW Limitation Act Sch 5 specifically defines 'legal professional negligence'. If personal injury results, 3-year PI regime applies.",
  }),
  lp("professional_negligence", "VIC", 6, {
    sectionRef: "s 5(1)(a)",
    actName: "Limitation of Actions Act 1958 (Vic)",
    displayName: "Professional Negligence",
    notes: "6 years for economic loss. If personal injury results, 3-year PI regime applies.",
  }),
  lp("professional_negligence", "QLD", 6, {
    sectionRef: "s 10(1)(a)",
    actName: "Limitation of Actions Act 1974 (Qld)",
    displayName: "Professional Negligence",
    notes: "6 years for economic loss. If personal injury results, 3-year PI regime applies.",
  }),
  lp("professional_negligence", "SA", 6, {
    sectionRef: "s 35(a)",
    actName: "Limitation of Actions Act 1936 (SA)",
    displayName: "Professional Negligence",
    notes: "6 years for economic loss. If personal injury results, 3-year PI regime applies.",
  }),
  lp("professional_negligence", "TAS", 6, {
    sectionRef: "s 4(1)(a)",
    actName: "Limitation Act 1974 (Tas)",
    displayName: "Professional Negligence",
    notes: "6 years for economic loss. If personal injury results, 3-year PI regime applies.",
  }),
  lp("professional_negligence", "ACT", 6, {
    sectionRef: "s 11(1)",
    actName: "Limitation Act 1985 (ACT)",
    displayName: "Professional Negligence",
    notes: "6 years for economic loss. If personal injury results, 3-year PI regime applies.",
  }),
  lp("professional_negligence", "NT", 3, {
    sectionRef: "s 12(1)(a)",
    actName: "Limitation Act 1981 (NT)",
    displayName: "Professional Negligence",
    notes: "NT has a shorter 3-year period for economic loss claims. If personal injury results, the PI regime applies.",
  }),

  // ==================== Medical Negligence ====================
  lp("medical_negligence", "WA", 3, {
    longStopYears: 12,
    discoverability: true,
    sectionRef: "ss 14, 55",
    actName: "Limitation Act 2005 (WA)",
    displayName: "Medical Negligence",
    notes: "Treated as personal injury. Period runs from discoverability — when plaintiff knew or ought to have known of injury, cause, and defendant.",
  }),
  lp("medical_negligence", "NSW", 3, {
    longStopYears: 12,
    discoverability: true,
    sectionRef: "ss 50C, 50D",
    actName: "Limitation Act 1969 (NSW)",
    displayName: "Medical Negligence",
    notes: "Treated as personal injury. Period runs from discoverability.",
  }),
  lp("medical_negligence", "VIC", 3, {
    longStopYears: 12,
    discoverability: true,
    sectionRef: "s 27D",
    actName: "Limitation of Actions Act 1958 (Vic)",
    displayName: "Medical Negligence",
    notes: "Treated as personal injury. Period runs from discoverability (s 27D). In Vic, knowledge of fault must be actual knowledge — suspicion is not sufficient. Court may extend under s 27K.",
  }),
  lp("medical_negligence", "QLD", 3, {
    discoverability: false,
    sectionRef: "s 11",
    actName: "Limitation of Actions Act 1974 (Qld)",
    displayName: "Medical Negligence",
    notes: "Treated as personal injury. QLD runs from accrual (date of treatment), not discoverability. No statutory long-stop period. Court has power to extend under s 31.",
  }),
  lp("medical_negligence", "SA", 3, {
    discoverability: true,
    sectionRef: "s 36",
    actName: "Limitation of Actions Act 1936 (SA)",
    displayName: "Medical Negligence",
    notes: "Treated as personal injury. Period runs from discoverability. Disability extensions may apply (s 45).",
  }),
  lp("medical_negligence", "TAS", 3, {
    longStopYears: 12,
    discoverability: true,
    sectionRef: "s 5A",
    actName: "Limitation Act 1974 (Tas)",
    displayName: "Medical Negligence",
    notes: "Treated as personal injury. 3 years from discoverability or 12 years from act/omission, whichever expires first (s 5A).",
  }),
  lp("medical_negligence", "ACT", 3, {
    discoverability: false,
    sectionRef: "s 16B",
    actName: "Limitation Act 1985 (ACT)",
    displayName: "Medical Negligence",
    notes: "Treated as personal injury. Period runs from accrual. No long-stop period in ACT.",
  }),
  lp("medical_negligence", "NT", 3, {
    discoverability: false,
    sectionRef: "s 12(1)(b)",
    actName: "Limitation Act 1981 (NT)",
    displayName: "Medical Negligence",
    notes: "Treated as personal injury. Period runs from accrual. No long-stop period in NT.",
  }),

  // ==================== Motor Vehicle Accident (CTP) ====================
  lp("motor_vehicle", "WA", 3, {
    sectionRef: "s 14",
    actName: "Limitation Act 2005 (WA)",
    displayName: "Motor Vehicle Accident",
    notes: "3 years from accident (personal injury limitation). CTP scheme governed by Motor Vehicle (Third Party Insurance) Act 1943 (WA). Notification to insurer as soon as reasonably possible.",
  }),
  lp("motor_vehicle", "NSW", 3, {
    sectionRef: "s 6.32",
    actName: "Motor Accident Injuries Act 2017 (NSW)",
    displayName: "Motor Vehicle Accident",
    notes: "3 years from accident. Notification to CTP insurer within 28 days. Application for Benefits within 3 months.",
  }),
  lp("motor_vehicle", "VIC", 6, {
    sectionRef: "s 93",
    actName: "Transport Accident Act 1986 (Vic)",
    displayName: "Motor Vehicle Accident",
    notes: "6 years for common law negligence claims (s 93). TAC statutory claim within 12 months of accident. Vic is a no-fault scheme for statutory benefits.",
  }),
  lp("motor_vehicle", "QLD", 3, {
    sectionRef: "s 11",
    actName: "Limitation of Actions Act 1974 (Qld)",
    displayName: "Motor Vehicle Accident",
    notes: "3 years from accident (personal injury limitation). CTP notice of claim within 9 months (Motor Accident Insurance Act 1994 s 37). Extension possible if reasonable excuse.",
  }),
  lp("motor_vehicle", "SA", 3, {
    sectionRef: "s 36",
    actName: "Limitation of Actions Act 1936 (SA)",
    displayName: "Motor Vehicle Accident",
    notes: "3 years from accident (personal injury limitation). Notification within 6 months.",
  }),
  lp("motor_vehicle", "TAS", 3, {
    sectionRef: "s 5A",
    actName: "Limitation Act 1974 (Tas)",
    displayName: "Motor Vehicle Accident",
    notes: "3 years from accident (personal injury limitation). MAIB claim notification within 12 months (3 months if unidentified vehicle).",
  }),
  lp("motor_vehicle", "ACT", 3, {
    sectionRef: "s 16B",
    actName: "Limitation Act 1985 (ACT)",
    displayName: "Motor Vehicle Accident",
    notes: "3 years from accident (personal injury limitation). CTP notification within 28 days (Road Transport (Third-Party Insurance) Act 2008) — missing this can result in loss of compensation.",
  }),
  lp("motor_vehicle", "NT", 3, {
    sectionRef: "",
    actName: "Motor Accidents (Compensation) Act 1979 (NT)",
    displayName: "Motor Vehicle Accident",
    notes: "3 years from accident. Claim recommended within 6 months; rejected after 3 years.",
  }),

  // ==================== Family Law — Property Settlement (Commonwealth) ====================
  lp("family_property", "CTH", 1, {
    sectionRef: "s 44(3)",
    actName: "Family Law Act 1975 (Cth)",
    displayName: "Family Law — Property (Married)",
    notes: "12 months from date of divorce order. Court may grant leave if hardship would be caused. Does not apply if both parties consent to late application.",
  }),

  // ==================== Insurance Claim ====================
  lp("insurance_claim", "WA", 6, {
    sectionRef: "s 13",
    actName: "Limitation Act 2005 (WA)",
    displayName: "Insurance Claim",
    notes: "Insurance contracts follow standard contract limitation. ICA s 54 prevents insurer refusing claim for late notification unless delay caused prejudice.",
  }),
  lp("insurance_claim", "NSW", 6, {
    sectionRef: "s 14(1)(a)",
    actName: "Limitation Act 1969 (NSW)",
    displayName: "Insurance Claim",
    notes: "Standard contract limitation applies. ICA s 54 prevents insurer refusing claim for late notification unless delay caused prejudice.",
  }),
  lp("insurance_claim", "VIC", 6, {
    sectionRef: "s 5(1)(a)",
    actName: "Limitation of Actions Act 1958 (Vic)",
    displayName: "Insurance Claim",
    notes: "Standard contract limitation applies. ICA s 54 prevents insurer refusing claim for late notification unless delay caused prejudice.",
  }),
  lp("insurance_claim", "QLD", 6, {
    sectionRef: "s 10(1)(a)",
    actName: "Limitation of Actions Act 1974 (Qld)",
    displayName: "Insurance Claim",
    notes: "Standard contract limitation applies.",
  }),
  lp("insurance_claim", "SA", 6, {
    sectionRef: "s 35(a)",
    actName: "Limitation of Actions Act 1936 (SA)",
    displayName: "Insurance Claim",
  }),
  lp("insurance_claim", "TAS", 6, {
    sectionRef: "s 4(1)(a)",
    actName: "Limitation Act 1974 (Tas)",
    displayName: "Insurance Claim",
  }),
  lp("insurance_claim", "ACT", 6, {
    sectionRef: "s 11(1)",
    actName: "Limitation Act 1985 (ACT)",
    displayName: "Insurance Claim",
  }),
  lp("insurance_claim", "NT", 3, {
    sectionRef: "s 12(1)(a)",
    actName: "Limitation Act 1981 (NT)",
    displayName: "Insurance Claim",
    notes: "NT has a shorter 3-year period.",
  }),

  // ==================== Insolvent Trading (Corporations Act — Commonwealth) ====================
  lp("insolvent_trading", "CTH", 6, {
    sectionRef: "s 588M(4)",
    actName: "Corporations Act 2001 (Cth)",
    displayName: "Insolvent Trading",
    notes: "6 years from the beginning of the winding up, not from the date of the insolvent trading. Liquidator brings claim (s 588M(2)); creditor may claim with liquidator's consent or court leave (s 588M(3)).",
  }),
];

/**
 * Look up a limitation period by cause of action and jurisdiction.
 * Returns null if not found (e.g., workers comp in VIC — not in our data).
 */
export function getLimitationPeriod(
  cause: CauseOfAction,
  jurisdiction: Jurisdiction,
): LimitationPeriod | null {
  return (
    LIMITATION_PERIODS.find(
      (lp) => lp.causeOfAction === cause && lp.jurisdiction === jurisdiction,
    ) ?? null
  );
}

/**
 * Get all available causes of action for a jurisdiction.
 */
export function getAvailableCauses(jurisdiction: Jurisdiction): LimitationPeriod[] {
  return LIMITATION_PERIODS.filter((lp) => lp.jurisdiction === jurisdiction);
}
