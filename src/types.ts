/**
 * Core type definitions for DeadlineWA.
 *
 * All dates in the engine are represented as ISO strings (YYYY-MM-DD).
 * This avoids JavaScript Date timezone pitfalls and keeps the engine pure.
 */

/** Australian state/territory jurisdictions. */
export type Jurisdiction = "WA" | "NSW" | "VIC" | "QLD" | "SA" | "TAS" | "ACT" | "NT" | "CTH";

/** Supported causes of action for limitation period lookup. */
export type CauseOfAction =
  | "contract_simple"
  | "contract_deed"
  | "tort_general"
  | "personal_injury"
  | "defamation"
  | "land_recovery"
  | "debt_recovery"
  | "building"
  | "equity"
  | "consumer_law"
  | "workers_comp"
  | "enforcement_of_judgment"
  | "professional_negligence"
  | "medical_negligence"
  | "motor_vehicle"
  | "family_property"
  | "insurance_claim"
  | "insolvent_trading";

/** A limitation period for a specific cause of action in a jurisdiction. */
export interface LimitationPeriod {
  causeOfAction: CauseOfAction;
  jurisdiction: Jurisdiction;
  years: number;
  months: number;
  days: number;
  longStopYears: number | null;
  discoverability: boolean;
  sectionRef: string;
  actName: string;
  notes: string;
  displayName: string;
}

/** Result of a deadline calculation. */
export interface DeadlineResult {
  causeOfAction: string;
  jurisdiction: Jurisdiction;
  accrualDate: string;
  deadlineDate: string;
  fileByDate: string;
  calendarDaysRemaining: number;
  workingDaysRemaining: number;
  isExpired: boolean;
  warnings: string[];
  holidaysInRange: Array<{ date: string; name: string }>;
  sectionRef: string;
  actName: string;
  notes: string;
  longStopDate: string | null;
}

/** A public holiday. */
export interface PublicHoliday {
  date: string;
  name: string;
  jurisdiction: string;
}

/** A court filing deadline rule. */
export interface CourtDeadline {
  court: string;
  deadlineType: string;
  days: number;
  workingDays: boolean;
  source: string;
  displayName: string;
}

/** All supported jurisdictions. */
export const JURISDICTIONS: Jurisdiction[] = [
  "WA",
  "NSW",
  "VIC",
  "QLD",
  "SA",
  "TAS",
  "ACT",
  "NT",
  "CTH",
];

/** All supported causes of action with display names. */
export const CAUSES_OF_ACTION: Array<{ value: CauseOfAction; label: string }> = [
  { value: "contract_simple", label: "Contract (Simple)" },
  { value: "contract_deed", label: "Contract (Under Deed)" },
  { value: "tort_general", label: "Tort — General (Negligence, Nuisance, Trespass)" },
  { value: "personal_injury", label: "Personal Injury" },
  { value: "professional_negligence", label: "Professional Negligence" },
  { value: "medical_negligence", label: "Medical Negligence" },
  { value: "defamation", label: "Defamation" },
  { value: "land_recovery", label: "Recovery of Land / Possession" },
  { value: "debt_recovery", label: "Debt Recovery / Money Owing" },
  { value: "building", label: "Building / Construction" },
  { value: "equity", label: "Equity (Breach of Trust / Fiduciary Duty)" },
  { value: "consumer_law", label: "Consumer Law (ACL)" },
  { value: "workers_comp", label: "Workers Compensation" },
  { value: "motor_vehicle", label: "Motor Vehicle Accident (CTP)" },
  { value: "family_property", label: "Family Law — Property Settlement" },
  { value: "insurance_claim", label: "Insurance Claim" },
  { value: "insolvent_trading", label: "Insolvent Trading (Corporations Act)" },
  { value: "enforcement_of_judgment", label: "Enforcement of Judgment" },
];
