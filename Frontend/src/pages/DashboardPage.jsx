import { useMemo } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import BudgetProgressBar from '../components/ui/BudgetProgressBar'
import Card from '../components/ui/Card'
import CategoryBadge from '../components/ui/CategoryBadge'
import MetricCard from '../components/ui/MetricCard'
import RailsMenu from '../components/ui/RailsMenu'
import Skeleton from '../components/ui/Skeleton'
import SpendingDistributionBar from '../components/ui/SpendingDistributionBar'
import PageContainer from '../components/layout/PageContainer'
import { useData } from '../context/DataContext'
import { cycleKey } from '../utils/cycle'
import { getMilestoneProgress, getTransactionsForCycle } from '../utils/derived'
import { formatCompact, formatCurrency, formatPercent } from '../utils/format'

/**
 * Overview dashboard.
 *
 * Reads the data Context and derives everything with `useMemo` — no figure on
 * this page is stored in state.
 */
export default function DashboardPage() {
  const {
    balance,
    flow,
    categoryBreakdown,
    budgets,
    milestones,
    transactions,
    currency,
    cycle: currentCycle,
    isLoading,
    policyAlerts,
    sweep,
    rails,
  } = useData()

  // Quick actions live in the header from `lg` up; below that the layout hands
  // them down so they can sit inside the Net balance card instead.
  const { onDeposit, onSpend, onSelectRail } = useOutletContext() ?? {}

  const cycle = currentCycle ?? cycleKey()
  const recent = useMemo(() => getTransactionsForCycle(transactions, cycle).slice(0, 6), [transactions, cycle])
  const topEnvelopes = useMemo(
    () => [...budgets].sort((a, b) => b.progress.ratio - a.progress.ratio).slice(0, 4),
    [budgets],
  )
  const nearestMilestone = useMemo(
    () =>
      milestones
        .map((milestone) => ({ milestone, progress: getMilestoneProgress(milestone) }))
        .sort((a, b) => b.progress.ratio - a.progress.ratio)[0],
    [milestones],
  )

  if (isLoading && transactions.length === 0) {
    return (
      <PageContainer title="Overview">
        <Skeleton count={4} variant="card" />
      </PageContainer>
    )
  }

  return (
    <PageContainer title="Overview">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Net balance"
          value={formatCurrency(balance, currency)}
          icon="account_balance_wallet"
        >
          <div className="flex items-center gap-2 lg:hidden">
            <RailsMenu rails={rails} onSelectRail={onSelectRail} />
            <button
              type="button"
              onClick={onDeposit}
              aria-label="Record deposit"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-brand px-2 text-xs font-semibold text-fg-on-brand transition-colors hover:bg-brand-hover"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base">
                add
              </span>
              Deposit
            </button>
            <button
              type="button"
              onClick={onSpend}
              aria-label="Record spend"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-hairline bg-card px-2 text-xs font-semibold text-fg transition-colors hover:bg-hover"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base text-negative-fg">
                remove
              </span>
              Spend
            </button>
          </div>
        </MetricCard>
        <MetricCard
          label="Inflow"
          value={formatCompact(flow.inflow, currency)}
          delta={flow.inflowDelta}
          deltaTone="up"
          icon="south_west"
        />
        <MetricCard
          label="Spend"
          value={formatCompact(flow.spend, currency)}
          delta={flow.spendDelta}
          deltaTone="down"
          icon="north_east"
        />
        <MetricCard
          label="Envelopes at risk"
          value={String(policyAlerts.length)}
          hint={policyAlerts.length > 0 ? policyAlerts[0].category : 'all within budget'}
          icon="warning"
          tone={policyAlerts.length > 0 ? 'accent' : 'default'}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card
          className="min-w-0 lg:col-span-2"
          title="Where the money went"
          subtitle={`Spend distribution across ${Object.keys(categoryBreakdown).length || 'no'} categories`}
          action={
            <Link to="/transactions" className="text-sm font-semibold text-brand-fg hover:underline">
              View ledger
            </Link>
          }
        >
          <SpendingDistributionBar
            segments={categoryBreakdown}
            currency={currency}
            withLegend
            totalLabel="Total spend"
          />
        </Card>

        <Card className="min-w-0" title="Policy" subtitle="Envelope guardrails">
          <ul className="flex flex-col gap-3">
            <PolicyRow
              label="Auto-sweep"
              value={
                sweep.eligible
                  ? `${formatCompact(sweep.swept, currency)} projected`
                  : sweep.projectedSurplus > 0
                    ? `${formatCompact(sweep.projectedSurplus, currency)} below threshold`
                    : 'Inactive'
              }
              tone={sweep.eligible ? 'positive' : 'neutral'}
            />
            <PolicyRow
              label="Breaches"
              value={
                policyAlerts.length === 0
                  ? 'None this cycle'
                  : policyAlerts.map((alert) => alert.category).join(', ')
              }
              tone={policyAlerts.length === 0 ? 'positive' : 'negative'}
            />
            <PolicyRow
              label="Auto close"
              value="Simulated at cycle close"
              tone="neutral"
            />
          </ul>

          {nearestMilestone && (
            <div className="mt-5 border-t border-hairline pt-4">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <p className="truncate text-sm font-medium text-fg">{nearestMilestone.milestone.title}</p>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-fg">
                  {formatPercent(nearestMilestone.progress.ratio, { showSign: false })}
                </span>
              </div>
              <BudgetProgressBar
                ratio={nearestMilestone.progress.ratio}
                state="healthy"
                label="Milestone funded"
              />
              <p className="mt-2 text-xs text-fg-muted">
                {formatCompact(nearestMilestone.progress.remaining, currency)} to go
                {nearestMilestone.progress.eta &&
                  ` · about ${nearestMilestone.progress.monthsRemaining} months`}
              </p>
            </div>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="min-w-0 lg:col-span-2" title="Recent activity" subtitle="Newest first">
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-fg-muted">Nothing recorded this cycle yet.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-hairline-soft">
              {recent.map((row) => (
                <li key={row.id} className="flex items-center gap-3 py-3">
                  <CategoryBadge category={row.category} size="sm" showLabel={false} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-fg">{row.description}</p>
                    <p className="truncate text-xs text-fg-muted">
                      <span className="capitalize">{row.category}</span> · {row.railName}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-sm font-semibold tabular-nums ${
                      row.type === 'income' ? 'text-positive-fg' : 'text-fg'
                    }`}
                  >
                    {row.type === 'income' ? '+' : '−'}
                    {formatCurrency(row.amount, row.currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="min-w-0" title="Closest to the cap" subtitle="Highest utilisation">
          <ul className="flex flex-col gap-4">
            {topEnvelopes.map((budget) => (
              <li key={budget.id}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm font-medium text-fg capitalize">{budget.category}</span>
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-fg-muted">
                    {formatPercent(budget.progress.ratio, { showSign: false })}
                  </span>
                </div>
                <BudgetProgressBar
                  ratio={budget.progress.ratio}
                  state={budget.state}
                  over={budget.progress.over}
                  label={`${budget.category} budget used`}
                />
                <p className="mt-1.5 text-xs text-fg-muted">
                  {formatCompact(budget.progress.spent, currency)} of{' '}
                  {formatCompact(budget.progress.allocated, currency)}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </PageContainer>
  )
}

/** @param {{ label: string, value: string, tone: 'positive'|'negative'|'neutral' }} props */
function PolicyRow({ label, value, tone }) {
  const color = {
    positive: 'text-positive-fg',
    negative: 'text-negative-fg',
    neutral: 'text-fg',
  }[tone]

  return (
    <li className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
      <span className="text-sm text-fg-muted">{label}</span>
      <span className={`text-sm font-medium capitalize sm:text-right ${color}`}>{value}</span>
    </li>
  )
}
