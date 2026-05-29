/**
 * ICS calendar file generation.
 *
 * Generates RFC 5545 compliant .ics files with reminder alarms
 * at 6 months, 3 months, 1 month, 2 weeks, and 1 week before deadline.
 */

import type { DeadlineResult } from "../types";

/** Format a date string (YYYY-MM-DD) to ICS date format (YYYYMMDD). */
function toICSDate(dateStr: string): string {
  return dateStr.replace(/-/g, "");
}

/** Generate a unique UID for the calendar event. */
function generateUID(result: DeadlineResult): string {
  const hash = `${result.causeOfAction}-${result.jurisdiction}-${result.accrualDate}-${result.deadlineDate}`;
  // Simple hash — good enough for uniqueness in practice
  let h = 0;
  for (let i = 0; i < hash.length; i++) {
    h = ((h << 5) - h + hash.charCodeAt(i)) | 0;
  }
  return `deadlinewa-${Math.abs(h).toString(36)}@deadlinewa.app`;
}

/** Escape text for ICS format (fold long lines, escape special chars). */
function escapeICS(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/**
 * Generate an ICS calendar file string for a deadline result.
 *
 * The event is an all-day event on the deadline date, with VALARM reminders
 * at 6 months, 3 months, 1 month, 2 weeks, and 1 week before.
 */
export function generateICS(result: DeadlineResult): string {
  const dtStart = toICSDate(result.deadlineDate);
  // All-day event: DTEND is the next day
  const deadlineParts = result.deadlineDate.split("-").map(Number);
  const nextDay = new Date(Date.UTC(deadlineParts[0], deadlineParts[1] - 1, deadlineParts[2] + 1));
  const dtEnd = `${nextDay.getUTCFullYear()}${String(nextDay.getUTCMonth() + 1).padStart(2, "0")}${String(nextDay.getUTCDate()).padStart(2, "0")}`;

  const summary = `DEADLINE: ${escapeICS(result.causeOfAction)} — ${result.jurisdiction}`;
  const description = [
    `Limitation period expires: ${result.deadlineDate}`,
    `File by: ${result.fileByDate}`,
    `Cause of action: ${result.causeOfAction}`,
    `Jurisdiction: ${result.jurisdiction}`,
    result.sectionRef ? `Section: ${result.sectionRef}` : "",
    result.actName ? `Act: ${result.actName}` : "",
    "",
    "DISCLAIMER: This is a date calculation only. It does not constitute legal advice.",
  ]
    .filter(Boolean)
    .join("\\n");

  const uid = generateUID(result);
  const now = new Date();
  const dtstamp = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(now.getUTCDate()).padStart(2, "0")}T${String(now.getUTCHours()).padStart(2, "0")}${String(now.getUTCMinutes()).padStart(2, "0")}${String(now.getUTCSeconds()).padStart(2, "0")}Z`;

  const alarms = [
    { trigger: "-P26W", desc: "6 months until deadline" },
    { trigger: "-P13W", desc: "3 months until deadline" },
    { trigger: "-P4W", desc: "1 month until deadline" },
    { trigger: "-P2W", desc: "2 weeks until deadline" },
    { trigger: "-P1W", desc: "1 week until deadline" },
  ];

  const alarmBlocks = alarms
    .map(
      (a) =>
        `BEGIN:VALARM\r\nTRIGGER:${a.trigger}\r\nACTION:DISPLAY\r\nDESCRIPTION:${escapeICS(a.desc)} — ${escapeICS(result.causeOfAction)} (${result.jurisdiction})\r\nEND:VALARM`,
    )
    .join("\r\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DeadlineWA//Court Deadline Calculator//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${dtStart}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${escapeICS(description)}`,
    alarmBlocks,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Trigger a browser download of an ICS file for a deadline result.
 * This is the only function in the engine that touches the DOM.
 */
export function downloadICS(result: DeadlineResult): void {
  const icsContent = generateICS(result);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `deadline-${result.jurisdiction}-${result.causeOfAction.replace(/\s+/g, "-").toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
