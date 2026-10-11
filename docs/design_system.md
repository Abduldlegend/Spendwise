# Design System Specification: SpendWise

**Product Name:** SpendWise  
**Product Concept:** Personal finance and multi-rail budget tracking application for emerging market professionals and students (primary benchmark: Nigeria).  
**Design Personality:** Calm, precise, trustworthy, architectural, bank-grade (Mercury, Wise, Ramp aesthetic).  
**Core Principles:** 1px hairline structural borders, high-density scannable data grids, tabular monetary alignment, restrained semantic color usage.

---

## 1. Visual Foundation & Color Tokens

### 1.1 Color Palette & Roles

#### Primary & Brand Accents
- `primary`: `#0D9488` (Teal 600) — Primary interactive actions, confirmed active states, positive net trends.
- `primary-hover`: `#0F766E` (Teal 700) — Hover state for primary buttons.
- `primary-subtle`: `rgba(13, 148, 136, 0.12)` — Badge backgrounds, light focus rings.
- `primary-dark`: `#14B8A6` (Teal 500) — Dark-mode primary accent for enhanced contrast.

#### Semantic Status & Alerts
- `inflow / positive`: `#059669` (Emerald 600) / Dark: `#10B981` (Emerald 500) — Income, positive variance, liquidity surplus.
- `outflow / expense`: `#DC2626` (Red 600) / Dark: `#EF4444` (Red 500) — Outgoing transfers, debits.
- `warning / near-limit`: `#D97706` (Amber 600) / Dark: `#F59E0B` (Amber 500) — Budget warning threshold (80%–99%).
- `danger / over-budget`: `#E11D48` (Rose 600) / Dark: `#F43F5E` (Rose 500) — Hard-limit breach, category freeze policy alert.
- `info / neutral`: `#6366F1` (Indigo 500) / Dark: `#818CF8` (Indigo 400) — Technology & cloud category tags.

#### Surface Hierarchy (Light Mode)
- `surface-app-bg`: `#F8FAFC` (Slate 50) — Canvas workspace foundation.
- `surface-card-lowest`: `#FFFFFF` — Metric tiles, ledger card, active modal bodies.
- `surface-card-low`: `#F1F5F9` (Slate 100) — Secondary containers, filter pill chips, search bars.
- `surface-card-hover`: `#E2E8F0` (Slate 200) — Table row and button hover backgrounds.
- `border-hairline`: `rgba(226, 232, 240, 0.8)` or `#E2E8F0` — 1px crisp structural division.
- `border-strong`: `#CBD5E1` (Slate 300) — Input control strokes, radio containers.

#### Surface Hierarchy (Dark Mode)
- `surface-app-bg-dark`: `#0B121E` — Deep slate canvas foundation.
- `surface-card-dark`: `#111A2C` — Standard card and drawer background.
- `surface-card-elevated-dark`: `#1E293B` (Slate 800) — Modal surfaces, active filter tags.
- `border-hairline-dark`: `#1E293B` or `rgba(255, 255, 255, 0.08)` — Subtle 1px structural hairline borders.
- `border-strong-dark`: `#334155` (Slate 700) — Input strokes and tab dividers.

---

## 2. Typography & Numerical Rules

### 2.1 Font Family
- **Primary Typeface:** `Geist`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`.
- **Numerical & Financial Figures:** Monospaced tabular figures (`font-variant-numeric: tabular-nums lining-nums; font-family: 'JetBrains Mono', 'SF Mono', 'Roboto Mono', monospace`) applied to all balances, ledger values, dates, and percentages.

### 2.2 Scale & Hierarchy
- `Display / Page Hero`: 28px–32px | `font-semibold` | `tracking-tight` (e.g., `₦4,850,200.50`)
- `Headline / Card Title`: 18px–20px | `font-semibold` | `tracking-tight` (e.g., "Personal Financial Overview")
- `Subhead / Section Header`: 14px–15px | `font-medium` | `tracking-normal` (e.g., "Recent Transactions Ledger")
- `Body Text / Description`: 13px–14px | `font-normal` | Line height 1.5
- `Microcopy / Metadata Label`: 10px–11px | `font-semibold` | `uppercase` | `tracking-wider` (e.g., `TOTAL NET BALANCE`, `OCTOBER 2024`)
- `Table Cells`: 13px | `tabular-nums` | 40px–48px row density

---

## 3. Spacing, Elevation & Corner Geometry

### 3.1 Border Radius (Roundness: `ROUND_FOUR`)
- `rounded-sm`: 4px — Badge pills, inline status tags.
- `rounded-md`: 6px — Inputs, action buttons, table cell indicators.
- `rounded-lg`: 8px — Sub-cards, quick-action tiles.
- `rounded-xl`: 12px — Standard metric & chart cards.
- `rounded-2xl`: 16px — App shells, full modals, slide-over sheets.

### 3.2 Elevation & Shadows
- **Flat Discipline:** No heavy blurred drop shadows. Depth is communicated strictly via **1px hairline borders** (`border border-slate-200/80 dark:border-slate-800`).
- **Modal / Floating Elevation:** `box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`.

---

## 4. Layout Architecture & Breakpoints

### 4.1 Responsive Strategy
1. **Desktop (>= 1024px):**
   - Fixed 260px left sidebar with account credentials, clearance rails, and quick actions.
   - Fluid multi-column main canvas with 4-card metric strip.
   - Two-column dashboard split: 65% primary ledger & category bar, 35% policy rails & savings targets.
2. **Tablet (768px – 1023px):**
   - Collapsible navigation drawer.
   - 2x2 grid for metric cards.
   - Stacked single-column main content.
3. **Mobile (< 768px):**
   - Persistent top app bar (KYC avatar, base currency badge, theme toggle, notifications).
   - Single-column scrolling stream.
   - Fixed docked bottom navigation bar (`BottomNavBar`: Overview, Transactions, Budgets, Settings) with safe-area padding.

---

## 5. Core Components & Design Specifications

### 5.1 Metric Card (`MetricCard`)
- **Structure:**
  - Top row: Uppercase tracking label + status pill (`+12.4% this month`).
  - Middle: Primary monospaced currency figure (`₦4,850,200.50`).
  - Bottom: Comparative cycle reference / sub-label (`Liquid across 3 connected bank rails`).
- **Styling:** `bg-white dark:bg-[#111A2C] border border-slate-200 dark:border-slate-800 rounded-xl p-5`.

### 5.2 Category Budget Progress Bar (`BudgetProgressBar`)
- **Visual States:**
  - `Healthy (<70%)`: Emerald fill (`#059669`).
  - `Warning (70%–90%)`: Amber fill (`#D97706`) with alert badge.
  - `Near/Over Limit (>90%)`: Crimson fill (`#DC2626`) with "Overbudget" tag.
  - `Locked / 100% Allocated`: Slate muted fill (`#64748B`) with lock icon.

### 5.3 Transaction Ledger Row (`TransactionRow`)
- **Height:** 48px row cadence.
- **Columns:**
  1. Icon container (category symbol, 36x36px rounded square).
  2. Description + Channel label (e.g., "Bolt Ride — VI" • "Zenith Virtual").
  3. Category badge pill (e.g., `Transport`, `Groceries`, `Work / SaaS`).
  4. Timestamp (`Today, 14:32`).
  5. Formatted tabular amount with signed polarity (`-₦4,200.00` in red/slate vs `+₦450,000.00` in emerald).

### 5.4 Segmented Spending Distribution Bar
- **Representation:** Stacked horizontal proportional bar chart.
- **Color Mapping:**
  - Housing: Emerald Teal (`#0D9488`)
  - Food & Dining: Cyan / Mint (`#14B8A6`)
  - Utilities: Dark Slate / Navy (`#334155`)
  - Tech & Subscriptions: Indigo (`#6366F1`)
  - Leisure & Personal: Soft Lavender (`#94A3B8`)

### 5.5 Currency & Multi-Rail Formatting
- Single base currency: **Nigerian Naira (`₦`)** formatted as `₦1,250,000.00`.
- No currency selection or conversion; every figure renders in NGN.
- Monospaced tabular spacing across all decimal places.

### 5.2 Module 1: Overview & Dashboard
- **Consolidated 4-Metric Grid:**
  - *Total Net Balance:* Aggregated liquid liquidity across all connected rails.
  - *Monthly Inflow:* Total credits with previous cycle comparison percentage (`+8.2%`).
  - *Total Spend:* Monthly debits under projected cadence (`-3.1%`).
  - *Savings Reserve:* Milestone progress bar showing pace toward target.
- **Spending Distribution Bar Chart:**
  - Proportional multi-category segmented bar (Housing, Food, Utilities, Tech & Cloud, Leisure).
- **Proactive Policy Alert Widget:**
  - Visual notification when a high-frequency envelope (e.g. Food & Groceries) approaches threshold (`86% spent, ₦24,000 remaining`). Provides instant "Adjust Cap" trigger.
- **Quick Inflow / Spend Modal Triggers:**
  - Rapid manual cash input or debit logging with channel selection.

### 5.3 Module 2: Transactions & Activity Ledger
- **Search & Multi-Facet Filtering:**
  - Real-time search across merchant descriptions, notes, and categories.
  - Date period selector (e.g., "October 2024").
  - Quick-filter chips: `All`, `Food`, `Subscriptions`, `Income`, `Transport`.
- **High-Density Ledger Table / Stream:**
  - Category icon indicator with rounded square container.
  - Description, Clearing Channel / Card Last-4 (e.g., `Shoprite Ikeja Mall • POS Card ..4821`).
  - Category pill badge (`Groceries`, `Transport`, `Work / SaaS`, `Income`).
  - Tabular timestamp and signed amounts (`+₦450,000.00` in emerald vs `-₦48,320.00` in dark slate).

### 5.4 Module 3: Budgets & Goals
- **Macro Envelope Overview:**
  - Radial / circular consumption dial (`71% Consumed, 7 days left in cycle`).
  - Projected end balance safe envelope and burn rate (`₦28,352/day`).
  - Automation policy rules: "Auto-Sweep surplus >₦50,000 to high-yield reserve at month close" and "Hard Limit: Freeze virtual card if category breaches 105%".
- **Category Progress Bars:**
  - Progress bar dynamically shaded according to health: Healthy (<70%), Warning (70–90%), Overbudget (>90%), Locked (100% fixed expenses).
- **Milestone Savings Stashes:**
  - Dedicated capital targets (e.g., *MacBook Pro M3 upgrade*, *Tech Fest Trip*) with auto-transfer cadence and estimated completion dates.

### 5.5 Module 4: Settings & Account Preferences
- **Identity & KYC Level:** Tier 2 verification status and limits.
- **Multi-Rail Configuration:** Manage linked clearing channels (Zenith Bank, GTBank, Kuda Rail).
- **Appearance & Theme:** System, Light, and Dark Mode selector with instant header sync.
- **Security & Session Management:** Hardware security key options, active session list, and instant sign-out.