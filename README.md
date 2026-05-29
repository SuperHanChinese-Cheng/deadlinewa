# DeadlineWA — Court Deadline & Limitation Period Calculator

Never miss a deadline again. Input a cause of action, jurisdiction, and date — get the exact limitation deadline adjusted for working days and public holidays.

Built by **SuperHanChinese-Cheng**

## Features

- **Limitation periods**: contract, tort, personal injury, defamation, land recovery, debt, building, equity, consumer law — across all 8 Australian jurisdictions + Commonwealth
- **Working day calculator**: counts working days excluding weekends and state-specific public holidays
- **Court filing deadlines**: WA Supreme Court (RSC), Magistrates Court (MCR), Federal Court (FCR), High Court
- **Calendar integration**: add deadlines directly to Google Calendar or Outlook, or download .ics file with reminders at 6mo, 3mo, 1mo, 2wk, 1wk
- **WA-aware**: knows WA Day (1st Mon Jun) and King's Birthday WA (4th Mon Sep — different from other states!)
- **Works offline**: PWA that runs entirely in the browser — no backend, no server, no database
- **Works forever**: all public holidays computed algorithmically (Easter via Computus, variable holidays via nth-weekday rules) — no data updates needed

## Quick Start

```bash
git clone https://github.com/SuperHanChinese-Cheng/deadlinewa.git
cd deadlinewa
npm install
npm run dev
```

Open http://localhost:5173

## Tech Stack

- React 18 + TypeScript (strict mode)
- Vite 6 with PWA support (offline-first)
- Pure TypeScript date arithmetic — no date libraries, no runtime dependencies beyond React
- 72 tests (Vitest)

## Disclaimer

This tool provides date calculations only. It does not constitute legal advice. Limitation periods may be affected by disability, fraud, concealment, acknowledgment, or other statutory provisions. Always verify deadlines independently.

## License

MIT
