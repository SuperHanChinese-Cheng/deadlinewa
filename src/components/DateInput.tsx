import { useState, useRef } from "react";

interface DateInputProps {
  id: string;
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (isoDate: string) => void;
}

/**
 * Custom date input that displays DD/MM/YYYY (Australian format).
 * Stores and emits YYYY-MM-DD internally for the engine.
 */
export function DateInput({ id, label, value, onChange }: DateInputProps) {
  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  // Parse existing value
  const parsed = value ? value.split("-") : ["", "", ""];
  const [day, setDay] = useState(parsed[2] || "");
  const [month, setMonth] = useState(parsed[1] || "");
  const [year, setYear] = useState(parsed[0] || "");

  function emitChange(d: string, m: string, y: string) {
    if (d && m && y && y.length === 4) {
      const dd = d.padStart(2, "0");
      const mm = m.padStart(2, "0");
      onChange(`${y}-${mm}-${dd}`);
    }
  }

  function handleDay(val: string) {
    const clean = val.replace(/\D/g, "").slice(0, 2);
    setDay(clean);
    if (clean.length === 2) {
      monthRef.current?.focus();
    }
    emitChange(clean, month, year);
  }

  function handleMonth(val: string) {
    const clean = val.replace(/\D/g, "").slice(0, 2);
    setMonth(clean);
    if (clean.length === 2) {
      yearRef.current?.focus();
    }
    emitChange(day, clean, year);
  }

  function handleYear(val: string) {
    const clean = val.replace(/\D/g, "").slice(0, 4);
    setYear(clean);
    emitChange(day, month, clean);
  }

  function handleDayKeyDown(e: React.KeyboardEvent) {
    if (e.key === "/" || e.key === "-" || e.key === ".") {
      e.preventDefault();
      monthRef.current?.focus();
    }
  }

  function handleMonthKeyDown(e: React.KeyboardEvent) {
    if (e.key === "/" || e.key === "-" || e.key === ".") {
      e.preventDefault();
      yearRef.current?.focus();
    }
    if (e.key === "Backspace" && month === "") {
      dayRef.current?.focus();
    }
  }

  function handleYearKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Backspace" && year === "") {
      monthRef.current?.focus();
    }
  }

  return (
    <div className="form-group">
      <label htmlFor={`${id}-day`}>{label}</label>
      <div className="date-input-row">
        <input
          ref={dayRef}
          id={`${id}-day`}
          type="text"
          inputMode="numeric"
          placeholder="DD"
          value={day}
          onChange={(e) => handleDay(e.target.value)}
          onKeyDown={handleDayKeyDown}
          className="date-segment date-day"
          maxLength={2}
          aria-label="Day"
        />
        <span className="date-separator">/</span>
        <input
          ref={monthRef}
          id={`${id}-month`}
          type="text"
          inputMode="numeric"
          placeholder="MM"
          value={month}
          onChange={(e) => handleMonth(e.target.value)}
          onKeyDown={handleMonthKeyDown}
          className="date-segment date-month"
          maxLength={2}
          aria-label="Month"
        />
        <span className="date-separator">/</span>
        <input
          ref={yearRef}
          id={`${id}-year`}
          type="text"
          inputMode="numeric"
          placeholder="YYYY"
          value={year}
          onChange={(e) => handleYear(e.target.value)}
          onKeyDown={handleYearKeyDown}
          className="date-segment date-year"
          maxLength={4}
          aria-label="Year"
        />
      </div>
    </div>
  );
}
