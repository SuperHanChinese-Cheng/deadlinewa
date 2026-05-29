import { useState, useEffect } from "react";
import type { DeadlineResult } from "./types";
import { LimitationTab } from "./components/LimitationTab";
import { WorkingDaysTab } from "./components/WorkingDaysTab";
import { CourtDeadlineTab } from "./components/CourtDeadlineTab";
import { ResultsPanel } from "./components/ResultsPanel";
import "./App.css";

type Tab = "limitation" | "working-days" | "court-deadline";
type Theme = "light" | "dark";

/** Read saved theme or default to system preference. */
function getInitialTheme(): Theme {
  const saved = localStorage.getItem("deadlinewa-theme");
  if (saved === "light" || saved === "dark") return saved;
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("limitation");
  const [result, setResult] = useState<DeadlineResult | null>(null);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("deadlinewa-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-text">
          <h1>DeadlineWA</h1>
          <p className="app-subtitle">Court Deadline &amp; Limitation Period Calculator</p>
        </div>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          type="button"
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? "\u{1F319}" : "\u{2600}\u{FE0F}"}
        </button>
      </header>

      <nav className="tab-nav">
        <button
          className={activeTab === "limitation" ? "tab-btn active" : "tab-btn"}
          onClick={() => {
            setActiveTab("limitation");
            setResult(null);
          }}
          type="button"
        >
          Limitation Period
        </button>
        <button
          className={activeTab === "working-days" ? "tab-btn active" : "tab-btn"}
          onClick={() => {
            setActiveTab("working-days");
            setResult(null);
          }}
          type="button"
        >
          Working Days
        </button>
        <button
          className={activeTab === "court-deadline" ? "tab-btn active" : "tab-btn"}
          onClick={() => {
            setActiveTab("court-deadline");
            setResult(null);
          }}
          type="button"
        >
          Court Filing
        </button>
      </nav>

      <main className="main-content">
        <div className="calculator-section">
          {activeTab === "limitation" && <LimitationTab onResult={setResult} />}
          {activeTab === "working-days" && <WorkingDaysTab onResult={setResult} />}
          {activeTab === "court-deadline" && <CourtDeadlineTab onResult={setResult} />}
        </div>
        <div className="results-section">
          <ResultsPanel result={result} />
        </div>
      </main>

      <footer className="app-footer">
        <span>DeadlineWA v0.2.0</span>
        <span className="footer-dot" />
        <span>This tool does not constitute legal advice</span>
      </footer>
    </div>
  );
}
