import { useState } from 'react'
import Container from './Container'
import SectionHeading from './SectionHeading'
import { SHOWCASE_TABS } from './content'

/** Overview pane: macro metrics and cycle progression. */
function OverviewView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-hairline pb-3">
        <div>
          <h4 className="text-base font-semibold text-fg">Consolidated Executive Ledger</h4>
          <p className="text-xs text-fg-muted">Macro financial health metrics with real-time liquidity scoring</p>
        </div>
        <span className="rounded border border-brand/20 bg-brand/10 px-2 py-0.5 font-mono text-xs text-brand">
          LIVE SYNCHRONIZATION
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded border border-hairline bg-panel/40 p-4">
          <span className="font-mono text-[11px] uppercase text-fg-muted">Gross Liquid Assets</span>
          <div className="mt-1 font-mono text-xl font-semibold tabular-nums text-fg">₦8,420,000.00</div>
          <div className="mt-1 font-mono text-[11px] text-brand">+8.2% cycle-to-date</div>
        </div>
        <div className="rounded border border-hairline bg-panel/40 p-4">
          <span className="font-mono text-[11px] uppercase text-fg-muted">Monthly Burn Velocity</span>
          <div className="mt-1 font-mono text-xl font-semibold tabular-nums text-negative">
            ₦24,300.00 / day
          </div>
          <div className="mt-1 font-mono text-[11px] text-negative">Within safe threshold (&lt;₦28k)</div>
        </div>
        <div className="rounded border border-hairline bg-panel/40 p-4">
          <span className="font-mono text-[11px] uppercase text-fg-muted">Effective Savings Rate</span>
          <div className="mt-1 font-mono text-xl font-semibold tabular-nums text-fg">45.6%</div>
          <div className="mt-1 font-mono text-[11px] text-brand">+4.1% over target benchmark</div>
        </div>
      </div>

      <div className="space-y-2 rounded border border-hairline bg-panel/30 p-4">
        <div className="flex justify-between font-mono text-xs text-fg-muted">
          <span>Cycle Progression (Day 19 of 31)</span>
          <span>61.2% elapsed</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-xs bg-track">
          <div className="h-full bg-brand" style={{ width: '61.2%' }} />
        </div>
      </div>
    </div>
  )
}

/** Ledger pane: a compact audit journal. */
function LedgerView() {
  const rows = [
    {
      id: 'l1',
      direction: 'income',
      title: 'Client Strategic Retainer',
      meta: 'Channel: Standard Chartered Direct // Ref: TXN-8829',
      amount: '+₦950,000.00',
      date: 'May 18, 2025',
    },
    {
      id: 'l2',
      direction: 'expense',
      title: 'Server Cluster Compute (AWS)',
      meta: 'Channel: Virtual Visa // Ref: TXN-8828',
      amount: '-₦84,200.00',
      date: 'May 17, 2025',
    },
    {
      id: 'l3',
      direction: 'expense',
      title: 'Office Co-working Lease',
      meta: 'Channel: Standing Order // Ref: TXN-8827',
      amount: '-₦150,000.00',
      date: 'May 16, 2025',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-hairline pb-3">
        <div>
          <h4 className="text-base font-semibold text-fg">Audit Ledger &amp; Journal</h4>
          <p className="text-xs text-fg-muted">Every debit and credit logged with zero round-trip delay</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="flex items-center gap-1 rounded border border-hairline px-2.5 py-1 font-mono text-xs text-fg-muted hover:bg-hover"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[14px]">
              filter_list
            </span>
            <span>Filter</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1 rounded bg-brand px-2.5 py-1 font-mono text-xs text-fg-on-brand"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[14px]">
              add
            </span>
            <span>Record</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between rounded border border-hairline p-2.5 font-mono text-xs transition-colors hover:bg-hover/40"
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={`material-symbols-outlined text-sm ${
                  row.direction === 'income' ? 'text-brand' : 'text-negative'
                }`}
              >
                {row.direction === 'income' ? 'arrow_downward' : 'arrow_upward'}
              </span>
              <div>
                <div className="font-medium text-fg">{row.title}</div>
                <div className="text-[10px] text-fg-muted">{row.meta}</div>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`font-semibold tabular-nums ${
                  row.direction === 'income' ? 'text-brand' : 'text-negative'
                }`}
              >
                {row.amount}
              </div>
              <div className="text-[10px] text-fg-muted">{row.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Budgets pane: envelope caps, including one warning state. */
function BudgetsView() {
  const envelopes = [
    {
      id: 'e1',
      name: 'Infrastructure & Tech Stack',
      spent: '₦84,200',
      cap: '₦150,000',
      pct: 56,
      tone: 'brand',
      note: 'Normal burn • ₦65,800 head-room remaining',
    },
    {
      id: 'e2',
      name: 'Food, Dining & Provisions',
      spent: '₦190,500',
      cap: '₦220,000',
      pct: 86,
      tone: 'negative',
      note: 'Threshold alert triggered • Daily cap adjusted to ₦2,680',
    },
    {
      id: 'e3',
      name: 'Health, Wellness & Fitness',
      spent: '₦32,000',
      cap: '₦80,000',
      pct: 40,
      tone: 'brand',
      note: 'Healthy status • Under planned velocity',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-hairline pb-3">
        <div>
          <h4 className="text-base font-semibold text-fg">Envelope Allocation Engine</h4>
          <p className="text-xs text-fg-muted">Zero-sum balance caps and safety margins for every category</p>
        </div>
        <span className="rounded border border-negative/20 bg-negative/10 px-2 py-0.5 font-mono text-xs text-negative">
          1 POLICY WARNING
        </span>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {envelopes.map((envelope) => {
          const warn = envelope.tone === 'negative'
          return (
            <div
              key={envelope.id}
              className={`space-y-1.5 rounded border p-3 ${
                warn ? 'border-negative/30 bg-negative-subtle/40' : 'border-hairline'
              }`}
            >
              <div className="flex justify-between">
                <span className={`font-medium ${warn ? 'text-negative' : 'text-fg'}`}>{envelope.name}</span>
                <span className={`tabular-nums ${warn ? 'font-semibold text-negative' : 'text-fg'}`}>
                  {envelope.spent} / {envelope.cap} ({envelope.pct}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-xs bg-track">
                <div
                  className={`h-full ${warn ? 'bg-negative' : 'bg-brand'}`}
                  style={{ width: `${envelope.pct}%` }}
                />
              </div>
              <div className={`text-[10px] ${warn ? 'text-negative' : 'text-brand'}`}>{envelope.note}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Tabbed interface deep-dive. Local `useState` only — switching tabs never
 * touches Context or the network.
 */
export default function ShowcaseSection() {
  const [active, setActive] = useState('overview')

  return (
    <section id="showcase" className="border-b border-hairline bg-panel/20 py-16 md:py-24">
      <Container>
        <SectionHeading
          center
          eyebrow="Interface Showcase"
          title="Designed for screen efficiency."
          subtitle="Explore the core views designed to give you continuous structural awareness."
        />

        <div className="mt-10 flex justify-center">
          <div role="tablist" aria-label="Product views" className="inline-flex rounded-lg border border-hairline bg-panel p-1">
            {SHOWCASE_TABS.map((tab) => {
              const selected = active === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={selected}
                  onClick={() => setActive(tab.id)}
                  className={`rounded-md px-4 py-1.5 font-mono text-xs font-medium transition-all ${
                    selected ? 'bg-card text-brand shadow-xs' : 'text-fg-muted hover:text-fg'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mx-auto mt-8 flex min-h-[380px] max-w-4xl flex-col justify-between rounded-xl border border-hairline bg-card p-6 shadow-sm">
          <div>
            {active === 'overview' && <OverviewView />}
            {active === 'ledger' && <LedgerView />}
            {active === 'budgets' && <BudgetsView />}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-hairline-soft pt-4 font-mono text-xs text-fg-muted">
            <span>// ZERO EXTERNAL THIRD-PARTY TRACKERS</span>
            <span>AES-256 LOCAL STORAGE CIPHER</span>
          </div>
        </div>
      </Container>
    </section>
  )
}
