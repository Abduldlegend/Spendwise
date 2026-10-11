# Product Requirements Document (PRD) & Project Brief: SpendWise

**Project Title:** SpendWise — Bank-Grade Personal Finance & Multi-Rail Budgeting Ledger  
**Document Version:** 1.0.0  
**Status:** Ready for Engineering / Implementation  
**Target Platform:** Web (Responsive Desktop, Tablet & PWA Mobile)  
**Primary Demographic / Market:** Young professionals, tech freelancers, founders, and students in emerging markets (Primary benchmark: Nigeria / Pan-Africa with multi-rail cashflow settled in a single Naira ledger).

---

## 1. Executive Summary & Problem Statement

### 1.1 The Challenge
Modern professionals and creators in emerging markets (e.g., Nigeria, Kenya, Ghana) navigate fragmented financial realities:
1. **Multi-Rail Inflows:** Income originates from local bank clearing networks (NIBSS, GTBank, Zenith), digital banks/fintechs (Kuda, Cowrywise), and international gig/SaaS platforms (Upwork, Deel, Stripe, PayPal), all settling into a single Naira (NGN) ledger.
2. **Volatile Naira & Informal Channels:** Inflationary environments make strict monthly envelope budgeting crucial, yet existing tools either cater exclusively to US/EU banking rails (Plaid-dependent) or lack double-entry financial rigor.
3. **Cluttered or Childish UI:** Most consumer finance apps lack the quiet clarity, density, and institutional trust that high-earning professionals expect.

### 1.2 The Solution
**SpendWise** is an architectural, calm, and trustworthy personal financial ledger designed with the precision of institutional fintech (Mercury, Wise, Ramp). It consolidates balances across rails, formal and informal clearing channels, automated envelope-budget caps, and milestone savings into a unified, high-density, responsive web application.

---

## 2. Target Personas

### Persona A: Damilola Adebayo (The Multi-Earner Tech Freelancer)
- **Role:** Senior Product Designer & Remote Contractor.
- **Financial Profile:** Receives foreign gig deposits (Upwork/Deel) and local consulting fees (Zenith, GTBank), all tracked in Naira (NGN). Total monthly inflow: ~₦1,250,000–₦2,000,000.
- **Core Pain Point:** Needs real-time tracking across accounts without manual spreadsheet formulas, plus strict alerts when discretionary food/entertainment spending breaches 85% of monthly envelopes.

### Persona B: Chioma Okonjo (The Growth-Stage Startup Operator)
- **Role:** Operations Lead at an early-stage venture.
- **Financial Profile:** Manages both personal treasury envelopes and team operational reimbursements.
- **Core Pain Point:** Needs fast transaction logging with tag categorization, receipt channel context, and automated month-end cashflow surplus sweeping into high-yield targets.

---

## 3. Product Principles & Visual Language

1. **Quiet Authority & Bank-Grade Craft:** 1px hairline structural borders (`#E2E8F0` / `#1E293B`), flat elevation, and no heavy drop shadows.
2. **Tabular Precision:** Every numerical figure, monetary sum, percentage, and timestamp is rendered using monospaced tabular numerals (`Geist Mono`, `tabular-nums`) to ensure scannable vertical alignment.
3. **Restrained Semantic Color:**
   - Inflow / Positive Net Trend: Emerald Teal (`#0D9488` / `#059669`)
   - Outflow / Expense: Slate / Red (`#DC2626`)
   - Warning Policy (80%–99% cap): Amber (`#D97706`)
   - Critical Policy (Over-budget / Freeze): Crimson Rose (`#E11D48`)
   - Neutral Categories: Indigo / Slate
4. **Bi-Directional Light & Dark Mode:** Native theme switcher that cascades through deep slate backgrounds (`#0B121E` / `#111A2C`) without loss of contrast.

---

## 4. System Architecture & User Journey Map

```
┌─────────────────────────────────────────────────────────────────┐
│                       Authentication Layer                       │
│  [Sign In / Login]  <──────── Switch ────────>  [Register / KYC]│
└───────────────────────────────┬─────────────────────────────────┘
                                │ Authenticated Session
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Unified Application Shell                     │
│  - Top Header: Base Currency Badge (₦ NGN),                    │
│                Dark/Light Theme Toggle, Notifications           │
│  - Desktop Rail / Mobile BottomNav: Overview, Activity, Budgets, │
│                Settings, Quick Inflow/Spend Actions             │
└───────┬───────────────────┬────────────────────┬────────────────┘
        │                   │                    │
        ▼                   ▼                    ▼
┌──────────────┐    ┌───────────────┐    ┌───────────────┐
│ 1. Overview  │    │2. Transactions│    │3. Budgets &   │
│ & Dashboard  │    │  Ledger       │    │   Goals       │
├──────────────┤    ├───────────────┤    ├───────────────┤
│• 4-Metric    │    │• Search &     │    │• Monthly      │
│  Strip       │    │  Filter Bar   │    │  Envelope Ring│
│• Segmented   │    │• Category     │    │• Warning/Alert│
│  Spend Chart │    │  Pills        │    │  Envelopes    │
│• Policy Alert│    │• Inflow vs    │    │• Milestone    │
│• Recent Sync │    │  Outflow Tabs │    │  Stash Goals  │
└──────────────┘    └───────────────┘    └───────────────┘
```

---

## 5. Functional Feature Specifications

### 5.1 Authentication & Institutional Access Control
- **Dual-Pane Sign In Screen:**
  - Work Email & Master Ledger Password field with visibility toggle and recovery flow.
  - Passkey / Biometric Face ID integration and Google Workspace SSO.
  - Operational Reassurance Widget: Live status of connected bank rails (Zenith, GTBank, Kuda) with latency indicators and ISO-27001/NDPR compliance indicators.
- **Register & Onboarding Screen:**
  - Full Name, Work Email, Master Password with live AES-256 cipher checklist (8+ chars, uppercase, symbol/number).
  - Base currency is fixed to Nigerian Naira (`NGN ₦`); no currency selection is required.
  - Instant Tier 1 KYC verification boundary (₦5,000,000 limit).

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

---

## 6. Non-Functional & Technical Specifications

| Category | Specification |
|---|---|
| **Frontend Stack** | React 18+ / Next.js 14, Tailwind CSS, Lucide / Material Symbols Icons |
| **Typography** | `Geist Sans` (UI) and `Geist Mono` (Financial Numerals) |
| **State Management** | Zustand or TanStack Query for cache invalidation |
| **Data Alignment** | `font-variant-numeric: tabular-nums lining-nums;` |
| **Responsive Breakpoints** | Mobile (<768px), Tablet (768px–1023px), Desktop (≥1024px) |
| **Accessibility (a11y)** | WCAG 2.1 AA compliant color contrast ratios across both light and dark modes |
| **Security Standards** | AES-256 equivalent UI encryption indicators, NDPR & ISO-27001 regulatory compliance |

---

## 7. Delivery Roadmap & Milestones

1. **Milestone 1 — UI Component Scaffolding (Completed):**
   - Core visual components: `MetricCard`, `TransactionRow`, `BudgetProgressBar`, `SegmentedSpendBar`, `TopAppBar`, `BottomNavBar`.
2. **Milestone 2 — Responsive & Workflow Integration (Completed):**
   - Seamless interactive prototype unifying Desktop, Tablet, and Mobile shells with Dark Mode toggling and Auth views.
3. **Milestone 3 — Backend API & Bank Rail Sync (Upcoming Phase):**
   - Webhook ingress for automated transaction parsing (Open Banking / Mono / Stitch / Plaid APIs).
   - Local storage encryption for offline ledger data.
4. **Milestone 4 — Production Launch & PWA Packaging (Upcoming Phase):**
   - Deployment to Vercel/Netlify with offline PWA support for mobile users.
