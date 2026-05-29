# DeadlineWA — Development Roadmap

## Phase 1: Core Calculator (Days 1–3)
- [ ] Set up project: pyproject.toml, venv, ruff, pytest
- [ ] Implement data/public_holidays.py:
  - Easter computation (Computus algorithm — Anonymous Gregorian)
  - WA public holidays (fixed + variable: WA Day, King's Birthday 4th Mon Sep)
  - All other state/territory holidays
  - Federal holidays
  - Substitute day rules (Saturday → Monday, Sunday → Monday)
  - Function: `get_public_holidays(year: int, jurisdiction: str) -> list[date]`
- [ ] Implement calculators/working_days.py:
  - `add_working_days(start: date, days: int, jurisdiction: str) -> date`
  - `count_working_days(start: date, end: date, jurisdiction: str) -> int`
  - `is_working_day(d: date, jurisdiction: str) -> bool`
- [ ] Implement data/limitation_periods.py:
  - Lookup table: (cause_of_action, jurisdiction) → LimitationPeriod
  - LimitationPeriod dataclass: years, months, days, section_ref, act_name, notes
  - Cover: contract, deed, tort, personal injury, defamation, land recovery, debt, building, equity, consumer law, enforcement of judgment
- [ ] Write comprehensive tests for all of the above

## Phase 2: API + Calendar Export (Days 4–5)
- [ ] Implement calculators/limitation.py:
  - `calculate_limitation_deadline(cause: str, jurisdiction: str, accrual_date: date) -> DeadlineResult`
  - DeadlineResult: deadline_date, file_by_date, days_remaining, working_days_remaining, warnings, holidays_in_range
- [ ] Implement calculators/calendar_export.py:
  - Generate .ics file with event + reminders (6mo, 3mo, 1mo, 2wk, 1wk)
  - Include cause of action + jurisdiction in event description
- [ ] Implement data/court_rules.py:
  - WA Supreme Court (RSC) filing deadlines
  - WA Magistrates Court (MCR) filing deadlines
  - Federal Court (FCR) filing deadlines
  - High Court filing deadlines
- [ ] Implement api.py:
  - POST /calculate/limitation — returns deadline for a limitation period
  - POST /calculate/working-days — returns date after N working days
  - POST /calculate/court-deadline — returns filing deadline per court rules
  - GET /holidays/{year}/{jurisdiction} — returns public holidays
  - GET /export/ics — returns .ics calendar file for a deadline

## Phase 3: Frontend + Deploy (Days 6–7)
- [ ] React frontend (Vite):
  - Tab 1: Limitation Period Calculator (dropdown for cause, jurisdiction, date picker)
  - Tab 2: Working Days Calculator (number input, start date, jurisdiction)
  - Tab 3: Court Filing Deadlines (court, deadline type, service date)
  - Results panel: deadline date, days remaining, warnings, holiday list
  - Download .ics button
  - Disclaimer: "This tool provides date calculations only. It does not constitute legal advice."
- [ ] Deploy: Docker → Railway/Fly.io (backend), Vercel (frontend)
- [ ] Write LinkedIn post + record 60-second demo
- [ ] Tag v1.0.0
