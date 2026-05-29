import { useState, useEffect } from "react";
import type { CourtDeadline, DeadlineResult } from "../types";
import { getCourtNames, getCourtRules, calculateCourtDeadline } from "../engine/court-rules";
import { DateInput } from "./DateInput";

interface TabProps {
  onResult: (result: DeadlineResult) => void;
}

const courtNames = getCourtNames();

export function CourtDeadlineTab({ onResult }: TabProps) {
  const [court, setCourt] = useState(courtNames[0] ?? "");
  const [rules, setRules] = useState<CourtDeadline[]>(() => getCourtRules(courtNames[0]));
  const [selectedRuleIndex, setSelectedRuleIndex] = useState(0);
  const [triggerDate, setTriggerDate] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const courtRules = getCourtRules(court);
    setRules(courtRules);
    setSelectedRuleIndex(0);
  }, [court]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!triggerDate) {
      setError("Please select a trigger date.");
      return;
    }

    const rule = rules[selectedRuleIndex];
    if (!rule) {
      setError("Please select a deadline type.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const result = calculateCourtDeadline(rule, triggerDate, "WA", today);
    onResult(result);
  }

  return (
    <div className="tab-content">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="court">Court</label>
          <select
            id="court"
            value={court}
            onChange={(e) => setCourt(e.target.value)}
          >
            {courtNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="deadlineType">Deadline Type</label>
          <select
            id="deadlineType"
            value={selectedRuleIndex}
            onChange={(e) => setSelectedRuleIndex(parseInt(e.target.value, 10))}
          >
            {rules.map((rule, index) => (
              <option key={rule.deadlineType} value={index}>
                {rule.displayName}
              </option>
            ))}
          </select>
        </div>

        <DateInput
          id="triggerDate"
          label="Trigger Date (e.g., date of service)"
          value={triggerDate}
          onChange={setTriggerDate}
        />

        {error && <p className="error-message">{error}</p>}

        <button className="btn-calculate" type="submit">
          Calculate
        </button>
      </form>
    </div>
  );
}
