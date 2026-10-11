/**
 * Landing page content.
 *
 * Copy lives here, not inside JSX, so sections stay presentational and the
 * marketing text can be retuned without touching layout code.
 */

/** In-page section anchors for the landing header/footer. */
export const LANDING_NAV = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it Works' },
  { href: '#showcase', label: 'Showcase' },
  { href: '#architecture', label: 'Architecture' },
  { href: '#faq', label: 'FAQ' },
]

/** The four-metric strip inside the hero product preview. */
export const PREVIEW_METRICS = [
  {
    id: 'balance',
    label: 'Net Balance',
    icon: 'account_balance_wallet',
    value: '₦4,850,200.50',
    valueTone: 'fg',
    note: '+12.4% vs last cycle',
    noteIcon: 'trending_up',
    noteTone: 'brand',
  },
  {
    id: 'inflow',
    label: 'Monthly Inflow',
    icon: 'south_west',
    value: '₦1,250,000.00',
    valueTone: 'brand',
    note: '2 verified streams',
    noteTone: 'muted',
  },
  {
    id: 'outlay',
    label: 'Total Outlay',
    icon: 'north_east',
    value: '₦680,450.00',
    valueTone: 'negative',
    note: '54.4% of monthly cap',
    noteTone: 'negative',
  },
  {
    id: 'reserve',
    label: 'Savings Reserve',
    icon: 'savings',
    value: '₦1,480,000',
    valueTone: 'fg',
    noteLeft: 'Target: ₦2.0M',
    noteRight: '74%',
    noteTone: 'brand',
  },
]

/**
 * Segmented category bar. `tone` maps to a semantic fill: brand, negative,
 * muted or outline.
 */
export const PREVIEW_SEGMENTS = [
  { label: 'Housing & Utilities', short: 'Housing', pct: 42, tone: 'brand' },
  { label: 'Food & Sustenance', short: 'Food', pct: 28, tone: 'negative' },
  { label: 'Transport & Fuel', short: 'Transport', pct: 18, tone: 'muted' },
  { label: 'Discretionary', short: 'Discretionary', pct: 12, tone: 'outline' },
]

/** Dense ledger rows in the hero preview. */
export const PREVIEW_ROWS = [
  {
    id: 'txn-1',
    timestamp: '2025-05-18 14:22',
    name: 'Client Retainer Payout',
    category: 'Revenue / Direct',
    categoryTone: 'brand',
    channel: 'Bank Wire',
    amount: '+₦950,000.00',
    tone: 'brand',
  },
  {
    id: 'txn-2',
    timestamp: '2025-05-17 19:40',
    name: 'Gourmet Market Provisions',
    category: 'Food & Dining',
    categoryTone: 'negative',
    channel: 'Corporate Debit',
    amount: '-₦42,800.00',
    tone: 'negative',
  },
  {
    id: 'txn-3',
    timestamp: '2025-05-16 09:15',
    name: 'Fiber Optic Workspace Dedicated Link',
    category: 'Utilities',
    categoryTone: 'muted',
    channel: 'Virtual Card',
    amount: '-₦28,500.00',
    tone: 'negative',
  },
]

/** The three core questions in the problem section. */
export const PROBLEM_QUESTIONS = [
  {
    number: '01',
    title: 'How much do I actually have?',
    body: 'Consolidated net position without logging into four different banking portals. Your liquid capital and reserved allocations calculated simultaneously.',
  },
  {
    number: '02',
    title: 'Where did my money go this cycle?',
    body: 'Real proportional expense allocation across custom envelopes. Catch high-velocity burn rates well before the billing period closes.',
  },
  {
    number: '03',
    title: 'Am I on track for my reserves?',
    body: 'Dynamic milestone meters dedicated to emergency vaults, capital expenditures, and recurring tax withholdings without spreadsheets.',
  },
]

/** The six-pillar bento grid. */
export const FEATURES = [
  {
    icon: 'dashboard',
    title: 'Dashboard Overview',
    body: 'Consolidated net balance, monthly inflow vectors, current cycle burn rate, and milestone reserve progress rendered at a glance.',
    tag: '// INSTANT TELEMETRY',
  },
  {
    icon: 'pie_chart',
    title: 'Spending by Category',
    body: 'Proportional segmented bar visualizations that eliminate deceptive radial pie charts. Clear distribution mathematics for rapid triage.',
    tag: '// LINEAR VISUALS',
  },
  {
    icon: 'mail',
    title: 'Envelope Budget Limits',
    body: 'Set hard monthly allocations per category. Real-time visual status gates transition from healthy emerald to amber warning and rose alerts.',
    tag: '// HARD ALLOCATIONS',
  },
  {
    icon: 'receipt_long',
    title: 'Dense Transaction Ledger',
    body: 'Lightning manual logging with autocomplete tags, multi-criteria filtering, fuzzy text search, and zero lag across thousands of records.',
    tag: '// SUB-MILLISECOND LOGGING',
  },
  {
    icon: 'contrast',
    title: 'Native Dual Light & Dark',
    body: 'Meticulously calibrated slate and obsidian contrast ratios that prevent ocular strain during critical late-night balance reconciliation.',
    tag: '// HIGH ACCURACY CONTRAST',
  },
  {
    icon: 'pin',
    title: 'Tabular Financial Numerals',
    body: 'Fixed-width monospaced numerals ensure decimals, currency markers, and debit minus signs align with bank-statement rigor.',
    tag: '// TABULAR STRICTNESS',
  },
]

/** The three-step workflow. */
export const STEPS = [
  {
    number: '01',
    icon: 'edit_note',
    title: 'Log your transactions',
    body: 'Capture transactions in seconds with quick-fill tags, payment channels, and monospaced value inputs. No bank sync delays or duplicate pending charges.',
    command: '$ quick-add --cat "Server Cloud" --val 124.00',
    tone: 'muted',
  },
  {
    number: '02',
    icon: 'account_tree',
    title: 'Define category envelopes',
    body: 'Carve your monthly cash flow into deliberate envelopes like Infrastructure, Sustenance, and Reserve Goals. Tailor strict budget caps that protect liquidity.',
    command: '$ policy set --envelope "Dining" --cap 200000',
    tone: 'muted',
  },
  {
    number: '03',
    icon: 'insights',
    title: 'Watch your ledger update live',
    body: 'Real-time arithmetic instantly reflects net-worth shifts, runway projections, and policy infractions. Never be surprised by month-end statements again.',
    command: '$ telemetry status: BALANCED [RUNWAY: 9.4 MO]',
    tone: 'brand',
  },
]

/** Showcase tab controls. */
export const SHOWCASE_TABS = [
  { id: 'overview', label: 'Overview Dashboard' },
  { id: 'ledger', label: 'Transactions Ledger' },
  { id: 'budgets', label: 'Envelopes & Budgets' },
]

/** The three institutional pillars. */
export const PILLARS = [
  {
    tag: '// 01 • UNCLUTTERED',
    title: 'Simple',
    body: 'No complex financial engineering or confusing portfolio jargon. Open the ledger, record your figure, and absorb your true standing in under 5 seconds.',
  },
  {
    tag: '// 02 • MATHEMATICAL',
    title: 'Clear',
    body: 'Tabular lining figures and direct double-entry algebra. If a cent or kobo shifts, you see exactly which envelope absorbed the delta without guesswork.',
  },
  {
    tag: '// 03 • SOVEREIGN',
    title: 'Yours',
    body: 'Local-first architecture. Your private transactions live securely on your machine, not on a third-party advertising exchange or broker server.',
  },
]

/** FAQ accordion. */
export const FAQS = [
  {
    id: 'free',
    question: 'Is SpendWise free to use?',
    answer:
      'Yes. The local-first core ledger is completely free for individual use. You can record unlimited transactions, construct custom envelope caps, and track emergency reserves with zero licensing fees.',
  },
  {
    id: 'bank',
    question: 'Do I need to link or connect my bank account credentials?',
    answer:
      'Never. SpendWise does not require Open Banking logins, Plaid tokens, or banking passwords. We prioritize operational security and intentionality: manual entries and quick-import CSV files ensure your sensitive banking tokens are never exposed online.',
  },
  {
    id: 'mobile',
    question: 'Can I use SpendWise seamlessly on my phone or tablet?',
    answer:
      'Yes. The interface is engineered as an adaptive responsive application with touch-friendly input fields and compact table viewports that fold into grouped rows on mobile devices.',
  },
  {
    id: 'privacy',
    question: 'How is my financial data protected?',
    answer:
      'Your balances and entries are persisted in your client browser storage with local encryption. Your numbers never touch our servers, meaning neither SpendWise employees nor third parties can view your financial standing.',
  },
  {
    id: 'currency',
    question: 'Which currency does SpendWise use?',
    answer:
      'SpendWise runs on a single Naira ledger (₦ NGN). Every figure — balances, envelope caps, milestones, and ledger entries — is recorded and displayed in NGN, so there is no conversion drift or FX guesswork.',
  },
  {
    id: 'theme',
    question: 'Does it support automatic dark mode?',
    answer:
      'Yes. SpendWise opens in dark mode by default, still honours your operating system preference when set to "system", and offers a quick manual override via the toggle in the navigation header.',
  },
]
