import { useMemo, useState } from 'react'
import BudgetProgressBar from '../components/ui/BudgetProgressBar'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import MilestoneForm from '../components/forms/MilestoneForm'
import PageContainer from '../components/layout/PageContainer'
import Skeleton from '../components/ui/Skeleton'
import { Icon } from '../components/ui/Button'
import { useData } from '../context/DataContext'
import { getMilestoneProgress } from '../utils/derived'
import { formatCompact, formatCurrency, formatPercent } from '../utils/format'

/**
 * Savings milestones.
 *
 * Completion ratios and ETAs are always computed from the milestone list at
 * render time — they are never stored on the milestone itself.
 */
export default function MilestonesPage() {
  const { milestones, currency, isLoading, addMilestone, saveMilestone } = useData()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const views = useMemo(
    () => milestones.map((milestone) => ({ milestone, progress: getMilestoneProgress(milestone) })),
    [milestones],
  )

  const handleSubmit = async (values) => {
    setSubmitting(true)
    try {
      if (editing) await saveMilestone(editing.id, values)
      else await addMilestone(values)
      setFormOpen(false)
      setEditing(null)
    } catch {
      /* rolled back and toasted by the Context */
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading && milestones.length === 0) {
    return (
      <PageContainer title="Milestones">
        <Skeleton count={3} variant="card" />
      </PageContainer>
    )
  }

  return (
    <PageContainer title="Milestones">
      {views.length === 0 ? (
        <Card>
          <EmptyState
            icon="flag"
            title="No milestones yet"
            description="Name a goal and Vault will project when you get there."
            actionLabel="New milestone"
            onAction={() => setFormOpen(true)}
          />
        </Card>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {views.map(({ milestone, progress }) => (
            <li key={milestone.id}>
              <Card className="h-full">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-fg">{milestone.title}</h2>
                    <p className="mt-1 text-sm tabular-nums text-fg-muted">
                      {formatCurrency(milestone.savedAmount, milestone.currency)} of{' '}
                      {formatCurrency(milestone.targetAmount, milestone.currency)}
                    </p>
                  </div>
                  {progress.complete && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-positive-subtle px-2 py-1 text-xs font-semibold text-positive-fg">
                      <Icon name="check_circle" className="text-sm" />
                      Funded
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <BudgetProgressBar
                    ratio={progress.ratio}
                    state={progress.complete ? 'healthy' : 'healthy'}
                    label={`${milestone.title} funded`}
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-muted">
                  <span className="font-semibold tabular-nums text-fg">
                    {formatPercent(progress.ratio, { showSign: false })}
                  </span>
                  <span className="tabular-nums">
                    {formatCompact(progress.remaining, currency)} to go
                  </span>
                  {progress.eta && (
                    <span>
                      ETA{' '}
                      {progress.eta.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>

                <div className="mt-4 border-t border-hairline-soft pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(milestone)
                      setFormOpen(true)
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-fg-muted hover:bg-hover hover:text-fg"
                  >
                    <Icon name="edit" className="text-sm" />
                    Update progress
                  </button>
                </div>
              </Card>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
              className="flex h-full min-h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-hairline-strong p-5 text-sm font-medium text-fg-muted transition-colors hover:border-brand hover:text-brand-fg"
            >
              <Icon name="add" className="text-xl" />
              New milestone
            </button>
          </li>
        </ul>
      )}

      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        title={editing ? `Update ${editing.title}` : 'New milestone'}
        description="The monthly contribution drives the projected completion date."
      >
        <MilestoneForm
          onSubmit={handleSubmit}
          existing={editing}
          isSubmitting={submitting}
          onCancel={() => {
            setFormOpen(false)
            setEditing(null)
          }}
        />
      </Modal>
    </PageContainer>
  )
}
