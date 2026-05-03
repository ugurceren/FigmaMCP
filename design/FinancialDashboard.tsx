import React, { useState } from "react";
import "./FinancialDashboard.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Transaction {
  id: number;
  name: string;
  sub: string;
  time: string;
  amount: string;
  status?: "declined";
  icon: string;
}

interface SavingGoal {
  id: number;
  label: string;
  current: string;
  goal: string;
  progress: number;
}

interface Account {
  id: number;
  last4: string;
  brand: "mastercard" | "visa";
  balance?: string;
  expiry?: string;
  highlight?: boolean;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const TRANSACTIONS: Transaction[] = [
  { id: 1, name: "Hewlett-Packard (HP)", sub: "HSBC", time: "24min ago", amount: "$8000.00", icon: "🖥️" },
  { id: 2, name: "Amazon.com, Inc.", sub: "HSBC · Apple pay", time: "1h ago", amount: "$102.24", icon: "📦" },
  { id: 3, name: "Dribbble Co", sub: "Revolut · POS", time: "Yesterday", amount: "$60.49", status: "declined", icon: "🎨" },
  { id: 4, name: "Costa coffee", sub: "AMEX · Apple pay", time: "Yesterday", amount: "$3.80", icon: "☕" },
];

const SAVING_GOALS: SavingGoal[] = [
  { id: 1, label: "Family trip", current: "$8.2K", goal: "$10K", progress: 80 },
  { id: 2, label: "New car", current: "$10.2K", goal: "$58K", progress: 12 },
];

const ACCOUNTS: Account[] = [
  { id: 1, last4: "8892", brand: "mastercard" },
  { id: 2, last4: "7712", brand: "visa" },
  { id: 3, last4: "2241", brand: "visa", balance: "$16,800.00", expiry: "04/25", highlight: true },
];

const ANALYTICS_CATEGORIES = [
  { label: "Shopping", value: "$3,312.00", change: "+12.2%", up: true, color: "#FF6B6B" },
  { label: "Entertain...", value: "$1,521.00", change: "-12.2%", up: false, color: "#4ECDC4" },
  { label: "Utility", value: "$4,220.00", change: "0.00", up: null, color: "#FFE66D" },
];

const BAR_DATA = [
  { label: "Apr", value: 8800 },
  { label: "", value: 6323 },
  { label: "", value: 4322 },
  { label: "", value: 2670, highlight: true },
  { label: "", value: 1628 },
  { label: "", value: 1622 },
  { label: "", value: 1404 },
  { label: "May", value: 642 },
];

// ─── Tiny SVG Line Chart ──────────────────────────────────────────────────────

function LineChart() {
  const points = [
    [0, 60], [40, 50], [80, 70], [120, 40], [160, 80], [200, 30],
    [240, 55], [280, 45], [320, 60], [360, 35], [400, 50],
  ];
  const poly = points.map((p) => p.join(",")).join(" ");
  const area = `${points.map((p) => p.join(",")).join(" ")} ${400},${100} 0,${100}`;

  return (
    <svg viewBox="0 0 400 100" className="fd-line-chart" preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#CCFF00" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#CCFF00" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#areaGrad)" />
      <polyline points={poly} fill="none" stroke="#CCFF00" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="160" cy="80" r="5" fill="#CCFF00" />
    </svg>
  );
}

// ─── Tiny SVG Bar Chart ───────────────────────────────────────────────────────

function BarChart() {
  const max = Math.max(...BAR_DATA.map((d) => d.value));
  const w = 36;
  const gap = 8;
  const h = 120;
  return (
    <svg viewBox={`0 0 ${BAR_DATA.length * (w + gap)} ${h}`} className="fd-bar-chart" preserveAspectRatio="none">
      {BAR_DATA.map((d, i) => {
        const barH = (d.value / max) * (h - 10);
        const x = i * (w + gap);
        const y = h - barH;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={w}
            height={barH}
            rx="6"
            fill={d.highlight ? "#CCFF00" : "rgba(255,255,255,0.15)"}
          />
        );
      })}
    </svg>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="fd-progress-track">
      <div className="fd-progress-fill" style={{ width: `${value}%` }} />
    </div>
  );
}

// ─── Card shell ───────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`fd-card ${className}`}>{children}</div>;
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Header({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (t: string) => void }) {
  return (
    <header className="fd-header">
      <div className="fd-header-left">
        <h1 className="fd-title">Financial summary</h1>
        <p className="fd-subtitle">Track your monthly activities</p>
      </div>
      <div className="fd-header-right">
        <div className="fd-tabs">
          {["Today", "This month"].map((tab) => (
            <button
              key={tab}
              className={`fd-tab ${activeTab === tab ? "fd-tab--active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
          <button className="fd-tab fd-tab--icon">📅 Date</button>
        </div>
        <button className="fd-icon-btn" aria-label="Download">⬇</button>
        <div className="fd-avatar" aria-label="User profile" />
        <span className="fd-balance">$156,834.42</span>
        <button className="fd-icon-btn" aria-label="Toggle visibility">👁</button>
      </div>
    </header>
  );
}

// ─── Analytics Card ───────────────────────────────────────────────────────────

function AnalyticsCard() {
  return (
    <Card className="fd-card--analytics">
      <div className="fd-card-header">
        <span className="fd-card-title">Analitics</span>
        <div className="fd-card-actions">
          <button className="fd-pill fd-pill--active">Expenses</button>
          <button className="fd-pill">Income</button>
          <button className="fd-icon-btn">〰</button>
          <button className="fd-icon-btn">↗</button>
        </div>
      </div>
      <div className="fd-analytics-cats">
        {ANALYTICS_CATEGORIES.map((c) => (
          <div key={c.label} className="fd-analytics-cat">
            <span className="fd-cat-dot" style={{ background: c.color }} />
            <span className="fd-cat-label">{c.label}</span>
            {c.up !== null && (
              <span className={`fd-cat-change ${c.up ? "fd-up" : "fd-down"}`}>
                {c.up ? "↑" : "↓"} {c.change}
              </span>
            )}
            <span className="fd-cat-value">{c.value}</span>
          </div>
        ))}
      </div>
      <div className="fd-chart-area">
        <LineChart />
        <div className="fd-chart-tooltip">
          <span>🛍 Shopping</span>
          <strong>$3,844.00 🎯</strong>
        </div>
      </div>
      <div className="fd-chart-labels">
        <span>24 Apr</span>
        <span>18 Mr</span>
        <span>24 Mr</span>
      </div>
    </Card>
  );
}

// ─── Total Spending Card ──────────────────────────────────────────────────────

function TotalSpendingCard() {
  return (
    <Card className="fd-card--spending">
      <div className="fd-card-header">
        <span className="fd-card-title">Total spending</span>
        <span className="fd-badge fd-badge--green">+$1450.22</span>
      </div>
      <p className="fd-card-subtitle">This week</p>
      <div className="fd-spending-amount">$16,896.22</div>
      <div className="fd-bar-wrapper">
        <BarChart />
        <div className="fd-bar-tooltip">
          <span>+$140.22 from Apr 24 🔥</span>
        </div>
      </div>
    </Card>
  );
}

// ─── Recent Transactions Card ─────────────────────────────────────────────────

function RecentTransactionsCard() {
  return (
    <Card className="fd-card--transactions">
      <div className="fd-card-header">
        <div>
          <span className="fd-card-title">Resent Transactions</span>
          <span className="fd-card-meta"> ↗</span>
        </div>
        <span className="fd-card-subtitle">342 reports</span>
      </div>
      <ul className="fd-tx-list">
        {TRANSACTIONS.map((tx) => (
          <li key={tx.id} className="fd-tx-item">
            <span className="fd-tx-icon">{tx.icon}</span>
            <div className="fd-tx-info">
              <span className="fd-tx-name">{tx.name}</span>
              <span className="fd-tx-sub">{tx.sub} · {tx.time}</span>
            </div>
            <div className="fd-tx-right">
              <span className="fd-tx-amount">{tx.amount}</span>
              {tx.status === "declined" && <span className="fd-badge fd-badge--red">DECLINED</span>}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

// ─── Metric Card (Income / Expenses / Subscriptions / Saving tips) ─────────────

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeUp?: boolean;
  sub?: string;
  subValue?: string;
}

function MetricCard({ title, value, change, changeUp, sub, subValue }: MetricCardProps) {
  return (
    <Card className="fd-card--metric">
      <div className="fd-card-header">
        <span className="fd-card-title">{title}</span>
        <button className="fd-icon-btn">↗</button>
      </div>
      {change && (
        <span className={`fd-metric-change ${changeUp ? "fd-up" : "fd-down"}`}>
          {changeUp ? "↑" : "↓"}{change}
        </span>
      )}
      {sub && <span className="fd-metric-sub">{sub}</span>}
      <div className="fd-metric-value">{value}</div>
      {subValue && <div className="fd-metric-subvalue">{subValue}</div>}
    </Card>
  );
}

// ─── My Savings Card ──────────────────────────────────────────────────────────

function MySavingsCard() {
  return (
    <Card className="fd-card--savings">
      <div className="fd-card-header">
        <div>
          <span className="fd-card-title">My Savings</span>
          <p className="fd-card-subtitle">You have 2 goal</p>
        </div>
        <button className="fd-icon-btn fd-icon-btn--accent">+</button>
      </div>
      {SAVING_GOALS.map((g) => (
        <div key={g.id} className="fd-saving-item">
          <div className="fd-saving-header">
            <span className="fd-saving-pct">{g.progress}%</span>
          </div>
          <ProgressBar value={g.progress} />
          <div className="fd-saving-info">
            <span className="fd-saving-current">{g.current}</span>
            <span className="fd-saving-label">{g.label}</span>
            <span className="fd-saving-goal">↑ Goal {g.goal}</span>
          </div>
        </div>
      ))}
    </Card>
  );
}

// ─── My Accounts Card ─────────────────────────────────────────────────────────

function MyAccountsCard() {
  return (
    <Card className="fd-card--accounts">
      <div className="fd-card-header">
        <span className="fd-card-title">My Accounts</span>
        <button className="fd-icon-btn fd-icon-btn--accent">+</button>
      </div>
      <ul className="fd-account-list">
        {ACCOUNTS.map((acc) => (
          <li key={acc.id} className={`fd-account-item ${acc.highlight ? "fd-account-item--highlight" : ""}`}>
            <span className="fd-account-number">**** {acc.last4}</span>
            {acc.highlight && (
              <div className="fd-account-details">
                <span className="fd-account-balance">${acc.balance}</span>
                <span className="fd-account-expiry">{acc.expiry}</span>
              </div>
            )}
            <span className={`fd-account-brand fd-account-brand--${acc.brand}`}>
              {acc.brand === "mastercard" ? "⬤⬤" : "VISA"}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

// ─── Dashboard Root ───────────────────────────────────────────────────────────

export default function FinancialDashboard() {
  const [activeTab, setActiveTab] = useState("This month");

  return (
    <div className="fd-root">
      <div className="fd-bg" aria-hidden="true" />
      <div className="fd-container">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="fd-grid">
          {/* Row 1 */}
          <AnalyticsCard />
          <TotalSpendingCard />
          <RecentTransactionsCard />

          {/* Row 2 */}
          <MetricCard
            title="Income"
            value="$12,800.00"
            change="-7.2% Higher"
            changeUp={false}
          />
          <MetricCard
            title="Expenses"
            value="$16,800.00"
            change="+12.2% Higher"
            changeUp={true}
          />
          <MySavingsCard />
          <MyAccountsCard />

          {/* Row 3 */}
          <MetricCard title="Subscri..." value="11" sub="+2 Total" changeUp={true} change="+2 Total" />
          <MetricCard title="Saving tips" value="$120" sub="Save from subscri..." />
          <Card className="fd-card--add">
            <span className="fd-add-icon">+</span>
            <span className="fd-add-label">Add widget</span>
          </Card>
        </div>
      </div>
    </div>
  );
}
