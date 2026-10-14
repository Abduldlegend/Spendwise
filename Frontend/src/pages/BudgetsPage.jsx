import { useState } from 'react'
import BudgetProgressBar from '../components/ui/BudgetProgressBar'
import CategoryBadge from '../components/ui/CategoryBadge'
import MetricCard from '../components/ui/MetricCard'
import Modal from '../components/ui/Modal'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import BudgetGoalForm from '../components/forms/BudgetGoalForm'
import PageContainer from '../components/layout/PageContainer'
import { Icon } from '../components/ui/Button'
import { useData } from '../context/DataContext'
import { BUDGET_THRESHOLDS } from '../utils/derived'
import { formatCompact, formatCurrency, formatPercent } from '../utils/format'

const STATE_META = {
  healthy: { label: 'Healthy', chip: 'bg-positive-subtle text-positive-fg', dot: 'bg-positive' },
  warning: { label: 'Warning', chip: 'bg-warning-subtle text-warning-fg', dot: 'bg-warning' },
  critical: { label: 'Critical', chip: 'bg-negative-subtle text-negative-fg', dot: 'bg-negative' },
  locked: { label: 'Locked', chip: 'bg-negative text-white', dot: 'bg-negative' },
}

/**
 * Budget envelopes.
 *
 * Reads the Context (allowed in `pages/`) and renders each envelope's
 * pre-computed progress. Threshold percentages come from `utils/derived` so the
 * card and the progress bar can never disagree.
 */
export default function BudgetsPage() {
  const { budgets, currency, cycle, isLoading, sweep, upsertBudget, setBudgetLock } = useData()

  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const totalAllocated = budgets.reduce((sum, budget) => sum + budget.progress.allocated, 0)
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.progress.spent, 0)

  const handleSubmit = async (values) => {
    setSubmitting(true)
    try {
      await upsertBudget(editing?.id ? { ...values, id: editing.id } : values)
      setEditing(null)
    } catch {
      /* rolled back and toasted by the Context */
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading && budgets.length === 0) {
    return (
      <PageContainer title="Budgets">
        <Skeleton count={4} variant="card" />
      </PageContainer>
    )
  }

  return (
    <PageContainer title="Budgets">
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Allocated" value={formatCurrency(totalAllocated, currency)} icon="account_balance" />
        <MetricCard label="Spent" value={formatCurrency(totalSpent, currency)} icon="payments" />
        <MetricCard
          label="Unspent"
          value={formatCurrency(Math.max(0, totalAllocated - totalSpent), currency)}
          hint={sweep.eligible ? 'eligible for auto-sweep' : undefined}
          icon="savings"
        />
      </div>

      <p className="mt-2 text-xs text-fg-muted">
        Warning at {BUDGET_THRESHOLDS.warning * 100}%, critical at {BUDGET_THRESHOLDS.critical * 100}%, locked
        at {BUDGET_THRESHOLDS.locked * 100}% utilisation.
      </p>

      {budgets.length === 0 ? (
        <Card className="mt-4">
          <EmptyState
            icon="donut_large"
            title="No envelopes yet"
            description="Create an envelope to cap spending in a category."
            actionLabel="New envelope"
            onAction={() => setEditing({ isNew: true })}
          />
        </Card>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {budgets.map((budget) => {
            const meta = STATE_META[budget.state] ?? STATE_META.healthy
            const sweeping = budget.policy?.autoSweep?.enabled
            return (
              <li key={budget.id}>
                <Card className="h-full">
                  <div className="flex items-start justify-between gap-3">
                    <CategoryBadge category={budget.category} />
                    <span className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${meta.chip}`}>
                      {meta.label}
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-xl font-semibold tabular-nums text-fg">
                      {formatCurrency(budget.progress.spent, currency)}
                    </span>
                    <span className="text-sm tabular-nums text-fg-muted">
                      / {formatCompact(budget.progress.allocated, currency)}
                    </span>
                  </div>

                  <div className="mt-3">
                    <BudgetProgressBar
                      ratio={budget.progress.ratio}
                      state={budget.state}
                      over={budget.progress.over}
                      label={`${budget.category} budget used`}
                    />
                  </div>

                  <p className="mt-2.5 text-xs text-fg-muted">
                    {budget.progress.over ? (
                      <span className="font-medium text-negative-fg">
                        {formatCompact(Math.abs(budget.progress.remaining), currency)} over
                      </span>
                    ) : (
                      <>
                        {formatCompact(budget.progress.remaining, currency)} left ·{' '}
                        {formatPercent(budget.progress.ratio, { showSign: false })} used
                      </>
                    )}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-hairline-soft pt-3">
                    <button
                      type="button"
                      onClick={() => setEditing(budget)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-fg-muted hover:bg-hover hover:text-fg"
                    >
                      <Icon name="edit" className="text-sm" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => setBudgetLock(budget.id, !budget.isLocked)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-fg-muted hover:bg-hover hover:text-fg"
                    >
                      <Icon name={budget.isLocked ? 'lock' : 'lock_open'} className="text-sm" />
                      {budget.isLocked ? 'Unlock' : 'Lock'}
                    </button>

                    {sweeping && (
                      <span className="ml-auto inline-flex items-center gap-1 rounded-lg bg-brand-subtle px-2 py-1 text-xs font-semibold text-brand-fg">
                        <Icon name="auto_awesome" className="text-sm" />
                        Sweep {formatCompact(budget.policy.autoSweep.threshold, currency)}
                      </span>
                    )}
                  </div>
                </Card>
              </li>
            )
          })}
          <li>
            <button
              type="button"
              onClick={() => setEditing({ isNew: true })}
              className="flex h-full min-h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-hairline-strong p-5 text-sm font-medium text-fg-muted transition-colors hover:border-brand hover:text-brand-fg"
            >
              <Icon name="add" className="text-xl" />
              New envelope
            </button>
          </li>
        </ul>
      )}

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.isNew || !editing ? 'New envelope' : `Edit ${editing.category}`}
        description="Allocation is per month and resets each cycle."
      >
        <BudgetGoalForm
          onSubmit={handleSubmit}
          isSubmitting={submitting}
          existing={editing?.isNew ? undefined : editing}
          cycle={cycle}
          onCancel={() => setEditing(null)}
        />
      </Modal>
    </PageContainer>
  )
}
