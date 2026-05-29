# DeadlineWA — Architecture

## System Design

```
React Frontend (Vite)
  ├── LimitationTab → POST /calculate/limitation
  ├── WorkingDaysTab → POST /calculate/working-days
  ├── CourtDeadlineTab → POST /calculate/court-deadline
  └── Download .ics → GET /export/ics
        │
        ▼
FastAPI Backend
  ├── api.py (endpoints)
  │     │
  │     ▼
  ├── calculators/
  │   ├── limitation.py        → uses limitation_periods.py + working_days.py
  │   ├── working_days.py      → uses public_holidays.py
  │   └── calendar_export.py   → generates .ics from DeadlineResult
  │
  └── data/
      ├── public_holidays.py   → computes holidays for any year + jurisdiction
      ├── limitation_periods.py → static lookup table of all periods
      └── court_rules.py       → static lookup table of filing deadlines
```

## Data Models

```python
@dataclass
class LimitationPeriod:
    cause_of_action: str          # e.g., "contract_simple"
    jurisdiction: str             # e.g., "WA"
    years: int                    # Primary period in years
    months: int = 0               # Additional months (rare)
    days: int = 0                 # Additional days (rare)
    long_stop_years: int | None = None  # Long-stop period (personal injury, building)
    discoverability: bool = False # Whether period runs from discoverability
    section_ref: str = ""         # e.g., "s 13"
    act_name: str = ""            # e.g., "Limitation Act 2005"
    notes: str = ""               # Caveats, extensions, special rules
    display_name: str = ""        # e.g., "Contract (Simple)"

@dataclass
class DeadlineResult:
    cause_of_action: str
    jurisdiction: str
    accrual_date: date
    deadline_date: date           # The limitation expiry date
    file_by_date: date            # Last WORKING day before deadline
    calendar_days_remaining: int  # From today
    working_days_remaining: int   # From today (excludes weekends + holidays)
    is_expired: bool
    warnings: list[str]           # e.g., ["Deadline is within 30 days!"]
    holidays_in_range: list[tuple[date, str]]  # Holidays between now and deadline
    section_ref: str
    act_name: str
    notes: str                    # Caveats about extensions, disabilities, etc.
    long_stop_date: date | None   # If applicable

@dataclass
class PublicHoliday:
    date: date
    name: str
    jurisdiction: str             # "WA", "NSW", "national", etc.
```

## Public Holiday Computation

Easter is computed via the Anonymous Gregorian Computus algorithm (no lookup tables needed):

```python
def easter_sunday(year: int) -> date:
    a = year % 19
    b, c = divmod(year, 100)
    d, e = divmod(b, 4)
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i, k = divmod(c, 4)
    l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l) // 451
    month, day = divmod(h + l - 7 * m + 114, 31)
    return date(year, month, day + 1)
```

Variable holidays use "Nth weekday of month" rules:

```python
def nth_weekday_of_month(year: int, month: int, weekday: int, n: int) -> date:
    """Get the nth occurrence of a weekday in a month.
    weekday: 0=Monday, 6=Sunday. n: 1=first, 2=second, etc.
    """
    first_day = date(year, month, 1)
    first_weekday = first_day + timedelta(days=(weekday - first_day.weekday()) % 7)
    return first_weekday + timedelta(weeks=n - 1)
```

WA-specific:
- **WA Day**: 1st Monday in June → `nth_weekday_of_month(year, 6, 0, 1)`
- **King's Birthday (WA)**: 4th Monday in September → `nth_weekday_of_month(year, 9, 0, 4)`
- Other states use 2nd Monday in June for King's Birthday — WA is the outlier

## Working Day Calculation

```python
def add_working_days(start: date, days: int, jurisdiction: str) -> date:
    holidays = get_public_holidays(start.year, jurisdiction)
    # Also get next year's holidays in case we cross a year boundary
    holidays |= get_public_holidays(start.year + 1, jurisdiction)

    current = start
    added = 0
    while added < days:
        current += timedelta(days=1)
        if current.weekday() < 5 and current not in holidays:
            added += 1
    return current
```

## API Endpoints

| Method | Path | Input | Output |
|---|---|---|---|
| POST | /calculate/limitation | {cause, jurisdiction, accrual_date} | DeadlineResult |
| POST | /calculate/working-days | {start_date, days, jurisdiction} | {end_date, holidays_skipped} |
| POST | /calculate/court-deadline | {court, deadline_type, trigger_date} | DeadlineResult |
| GET | /holidays/{year}/{jurisdiction} | — | list[PublicHoliday] |
| GET | /export/ics | {deadline_date, cause, jurisdiction} | .ics file download |
| GET | /causes | — | list of all supported causes of action |
| GET | /jurisdictions | — | list of all supported jurisdictions |
