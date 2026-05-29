import { useState } from "react";
import type { CauseOfAction, DeadlineResult, Jurisdiction } from "../types";
import { CAUSES_OF_ACTION, JURISDICTIONS } from "../types";
import { calculateLimitationDeadline } from "../engine/limitation";
import { DateInput } from "./DateInput";

interface TabProps {
  onResult: (result: DeadlineResult) => void;
}

export function LimitationTab({ onResult }: TabProps) {
  const [cause, setCause] = useState<CauseOfAction>("contract_simple");
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>("WA");
  const [accrualDate, setAccrualDate] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!accrualDate) {
      setError("Please enter an accrual date.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const result = calculateLimitationDeadline(cause, jurisdiction, accrualDate, today);

    if (result) {
      onResult(result);
    } else {
      setError("No limitation period data available for this combination.");
    }
  }

  return (
    <div className="tab-content">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="cause">Cause of Action</label>
          <select
            id="cause"
            value={cause}
            onChange={(e) => setCause(e.target.value as CauseOfAction)}
          >
            {CAUSES_OF_ACTION.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
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

        <DateInput
          id="accrualDate"
          label="Accrual Date"
          value={accrualDate}
          onChange={setAccrualDate}
        />

        {error && <p className="error-message">{error}</p>}

        <button className="btn-calculate" type="submit">
          Calculate
        </button>
      </form>
    </div>
  );
}
