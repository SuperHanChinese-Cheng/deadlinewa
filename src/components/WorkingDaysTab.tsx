import { useState } from "react";
import type { DeadlineResult, Jurisdiction } from "../types";
import { JURISDICTIONS } from "../types";
import { addWorkingDays, countWorkingDays, diffCalendarDays } from "../engine/working-days";
import { getPublicHolidays } from "../engine/public-holidays";
import { parseDate } from "../engine/public-holidays";
import { DateInput } from "./DateInput";

interface TabProps {
  onResult: (result: DeadlineResult) => void;
}

export function WorkingDaysTab({ onResult }: TabProps) {
  const [startDate, setStartDate] = useState("");
  const [numberOfDays, setNumberOfDays] = useState(21);
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>("WA");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!startDate) {
      setError("Please select a start date.");
      return;
    }
    if (numberOfDays < 1) {
      setError("Number of working days must be at least 1.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const endDate = addWorkingDays(startDate, numberOfDays, jurisdiction);

    // Calculate remaining days from today
    const calendarDaysRemaining = diffCalendarDays(today, endDate);
    const workingDaysRemaining =
      calendarDaysRemaining > 0 ? countWorkingDays(today, endDate, jurisdiction) : 0;
    const isExpired = calendarDaysRemaining <= 0;

    // Generate warnings
    const warnings: string[] = [];
    if (isExpired) {
      warnings.push("This deadline has EXPIRED.");
    } else if (calendarDaysRemaining <= 7) {
      warnings.push("URGENT: Deadline is within 7 days!");
    } else if (calendarDaysRemaining <= 14) {
      warnings.push("WARNING: Deadline is within 14 days.");
    } else if (calendarDaysRemaining <= 30) {
      warnings.push("CAUTION: Deadline is within 30 days.");
    }

    // Collect holidays between start date and end date
    const holidaysInRange: Array<{ date: string; name: string }> = [];
    const startParsed = parseDate(startDate);
    const endParsed = parseDate(endDate);
    for (let y = startParsed.year; y <= endParsed.year; y++) {
      const yearHolidays = getPublicHolidays(y, jurisdiction);
      for (const h of yearHolidays) {
        if (h.date > startDate && h.date <= endDate) {
          holidaysInRange.push({ date: h.date, name: h.name });
        }
      }
    }

    const result: DeadlineResult = {
      causeOfAction: `${numberOfDays} Working Days`,
      jurisdiction,
      accrualDate: startDate,
      deadlineDate: endDate,
      fileByDate: endDate,
      calendarDaysRemaining,
      workingDaysRemaining,
      isExpired,
      warnings,
      holidaysInRange,
      sectionRef: "",
      actName: "",
      notes: "",
      longStopDate: null,
    };

    onResult(result);
  }

  return (
    <div className="tab-content">
      <form onSubmit={handleSubmit}>
        <DateInput
          id="startDate"
          label="Start Date"
          value={startDate}
          onChange={setStartDate}
        />

        <div className="form-group">
          <label htmlFor="numberOfDays">Number of Working Days</label>
          <input
            id="numberOfDays"
            type="number"
            min="1"
            value={numberOfDays}
            onChange={(e) => setNumberOfDays(parseInt(e.target.value, 10) || 1)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="jurisdiction">Jurisdiction</label>
          <select
            id="jurisdiction"
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value as Jurisdiction)}
          >
            {JURISDICTIONS.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="error-message">{error}</p>}

        <button className="btn-calculate" type="submit">
          Calculate
        </button>
      </form>
    </div>
  );
}
