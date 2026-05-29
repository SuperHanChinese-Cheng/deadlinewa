import { useState } from "react";
import type { DeadlineResult } from "../types";
import { downloadICS } from "../engine/calendar-export";

interface ResultsPanelProps {
  result: DeadlineResult | null;
}

/** Format an ISO date string (YYYY-MM-DD) to Australian human-readable format (day first). */
function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Format YYYY-MM-DD to DD/MM/YYYY for compact display. */
function formatDateShort(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

/** Classify a warning string into a severity level for styling. */
function classifyWarning(text: string): { severity: string; icon: string } {
  const upper = text.toUpperCase();
  if (upper.includes("EXPIRED")) return { severity: "expired", icon: "\u{26D4}" };
  if (upper.includes("URGENT")) return { severity: "urgent", icon: "\u{1F6A8}" };
  if (upper.includes("WARNING")) return { severity: "warning", icon: "\u{26A0}\u{FE0F}" };
  if (upper.includes("CAUTION")) return { severity: "caution", icon: "\u{1F7E1}" };
  return { severity: "info", icon: "\u{2139}\u{FE0F}" };
}

/** Calculate urgency level and bar width from calendar days remaining. */
function getUrgency(daysRemaining: number, isExpired: boolean): { className: string; width: number } {
  if (isExpired) return { className: "expired", width: 100 };
  if (daysRemaining <= 7) return { className: "urgent", width: 95 };
  if (daysRemaining <= 30) return { className: "warning", width: 75 };
  if (daysRemaining <= 90) return { className: "caution", width: 50 };
  return { className: "safe", width: Math.max(5, Math.min(30, 30 - (daysRemaining - 90) / 10)) };
}

/** Build a Google Calendar URL for the deadline. */
function googleCalendarUrl(result: DeadlineResult): string {
  const dateStr = result.deadlineDate.replace(/-/g, "");
  const [y, m, d] = result.deadlineDate.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  const endStr = `${next.getUTCFullYear()}${String(next.getUTCMonth() + 1).padStart(2, "0")}${String(next.getUTCDate()).padStart(2, "0")}`;
  const title = encodeURIComponent(`DEADLINE: ${result.causeOfAction} — ${result.jurisdiction}`);
  const details = encodeURIComponent(
    `Limitation period expires: ${formatDateShort(result.deadlineDate)}\nFile by: ${formatDateShort(result.fileByDate)}\n${result.actName ? `Act: ${result.actName}` : ""}${result.sectionRef ? `\nSection: ${result.sectionRef}` : ""}\n\nThis is a date calculation only — not legal advice.`,
  );
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}/${endStr}&details=${details}`;
}

/** Build an Outlook Web URL for the deadline. */
function outlookCalendarUrl(result: DeadlineResult): string {
  const title = encodeURIComponent(`DEADLINE: ${result.causeOfAction} — ${result.jurisdiction}`);
  const body = encodeURIComponent(
    `Limitation period expires: ${formatDateShort(result.deadlineDate)}\nFile by: ${formatDateShort(result.fileByDate)}\n${result.actName ? `Act: ${result.actName}` : ""}${result.sectionRef ? `\nSection: ${result.sectionRef}` : ""}\n\nThis is a date calculation only — not legal advice.`,
  );
  return `https://outlook.live.com/calendar/0/action/compose?subject=${title}&startdt=${result.deadlineDate}&enddt=${result.deadlineDate}&body=${body}&allday=true`;
}

export function ResultsPanel({ result }: ResultsPanelProps) {
  const [holidaysExpanded, setHolidaysExpanded] = useState(false);

  if (!result) {
    return (
      <div className="results-panel results-placeholder">
        <span className="results-placeholder-icon">{"\u{2696}\u{FE0F}"}</span>
        <p>Select your inputs and click Calculate</p>
      </div>
    );
  }

  const urgency = getUrgency(result.calendarDaysRemaining, result.isExpired);

  return (
    <div className="results-panel">
      {/* Header */}
      <div className="results-header">
        <h2>{result.causeOfAction} &mdash; {result.jurisdiction}</h2>
        {(result.actName || result.sectionRef) && (
          <p className="results-legislation">
            {result.actName}
            {result.actName && result.sectionRef ? ", " : ""}
            {result.sectionRef}
          </p>
        )}
      </div>

      {/* Urgency bar */}
      <div className="urgency-bar">
        <div
          className={`urgency-bar-fill ${urgency.className}`}
          style={{ width: `${urgency.width}%` }}
        />
      </div>

      {/* Key dates */}
      <div className="dates-grid">
        <div className={`date-card${result.isExpired ? " expired" : ""}`}>
          <span className="date-label">Deadline Date</span>
          <span className="date-value">{formatDate(result.deadlineDate)}</span>
        </div>
        <div className="date-card">
          <span className="date-label">File By</span>
          <span className="date-value">{formatDate(result.fileByDate)}</span>
        </div>
        <div className="date-card">
          <span className="date-label">Accrual Date</span>
          <span className="date-value">{formatDate(result.accrualDate)}</span>
        </div>
        {result.longStopDate && (
          <div className="date-card">
            <span className="date-label">Long-stop Date</span>
            <span className="date-value">{formatDate(result.longStopDate)}</span>
          </div>
        )}
      </div>

      {/* Remaining time */}
      <div className="remaining-time">
        <div className="remaining-stat">
          <span className={`remaining-number${result.isExpired ? " expired" : ""}`}>
            {result.isExpired ? "0" : result.calendarDaysRemaining}
          </span>
          <span className="remaining-label">Calendar days</span>
        </div>
        <div className="remaining-stat">
          <span className={`remaining-number${result.isExpired ? " expired" : ""}`}>
            {result.isExpired ? "0" : result.workingDaysRemaining}
          </span>
          <span className="remaining-label">Working days</span>
        </div>
      </div>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="warnings-list">
          {result.warnings.map((w, i) => {
            const { severity, icon } = classifyWarning(w);
            return (
              <div key={i} className={`warning-item ${severity}`}>
                <span className="warning-icon">{icon}</span>
                <span>{w}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Notes */}
      {result.notes && (
        <div className="notes-section">
          <div className="notes-label">Notes</div>
          <div className="notes-text">{result.notes}</div>
        </div>
      )}

      {/* Holidays in range */}
      {result.holidaysInRange.length > 0 && (
        <div className="holidays-section">
          <button
            className="holidays-toggle"
            type="button"
            onClick={() => setHolidaysExpanded(!holidaysExpanded)}
          >
            <span>{holidaysExpanded ? "Hide" : "Show"} public holidays ({result.holidaysInRange.length})</span>
            <span className={`holidays-chevron${holidaysExpanded ? " open" : ""}`}>{"▼"}</span>
          </button>
          {holidaysExpanded && (
            <table className="holidays-list">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Holiday</th>
                </tr>
              </thead>
              <tbody>
                {result.holidaysInRange.map((h, i) => (
                  <tr key={i}>
                    <td>{formatDate(h.date)}</td>
                    <td>{h.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Calendar export buttons */}
      <div className="calendar-buttons">
        <a
          className="btn-calendar btn-google"
          href={googleCalendarUrl(result)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Calendar
        </a>
        <a
          className="btn-calendar btn-outlook"
          href={outlookCalendarUrl(result)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Outlook
        </a>
        <button className="btn-calendar btn-ics" type="button" onClick={() => downloadICS(result)}>
          Download .ics File
        </button>
      </div>

      {/* Disclaimer */}
      <p className="disclaimer">
        This tool provides date calculations only. It does not constitute legal advice. Limitation
        periods may be affected by disability, fraud, concealment, acknowledgment, or other factors
        not accounted for by this calculator.
      </p>
    </div>
  );
}
