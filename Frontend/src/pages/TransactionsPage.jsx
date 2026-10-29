import { useMemo, useState } from 'react'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import Skeleton from '../components/ui/Skeleton'
import TransactionFilters from '../components/ui/TransactionFilters'
import TransactionTable from '../components/ui/TransactionTable'
import TransactionForm from '../components/forms/TransactionForm'
import PageContainer from '../components/layout/PageContainer'
import { Button } from '../components/ui/Button'
import { useCategories } from '../context/CategoriesContext'
import { useData } from '../context/DataContext'
import { selectTransactions } from '../utils/derived'
import { cycleKey, getPeriodLabel } from '../utils/cycle'

/**
 * Transactions ledger — the core feature.
 *
 * The only component allowed to read the data Context. All filtering, searching
 * and sorting is local state passed into `selectTransactions`; none of it touches
 * Context or the API, per AGENTS.md. Writes go through the Context actions,
 * which own the optimistic update and rollback.
 */
export default function TransactionsPage() {
  const {
    transactions,
    rails,
    isLoading,
    currency,
    pendingIds,
    addTransaction,
    editTransaction,
    removeTransaction,
  } = useData()
  const { categories: categoryRecords, byKey } = useCategories()

  const cycle = cycleKey()

  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [categories, setCategories] = useState([])
  const [sortBy, setSortBy] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [scope, setScope] = useState('cycle')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const visible = useMemo(
    () =>
      selectTransactions(transactions, {
        query,
        type,
        categories,
        sortBy,
        sortDir,
        cycle: scope === 'cycle' ? cycle : scope === 'all' ? undefined : scope,
      }),
    [transactions, query, type, categories, sortBy, sortDir, scope, cycle],
  )

  const handleSort = (key) => {
    if (key === sortBy) setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'))
    else {
      setSortBy(key)
      setSortDir(key === 'amount' ? 'asc' : 'desc')
    }
  }

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setFormOpen(true)
  }

  const handleSubmit = async (values) => {
    setSubmitting(true)
    try {
      if (editing) await editTransaction(editing.id, values)
      else await addTransaction(values)
      setFormOpen(false)
      setEditing(null)
    } catch {
      // The Context already rolled back and raised a toast; keep the dialog open
      // so the user's input is not lost.
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    try {
      await removeTransaction(confirmDelete.id)
      setConfirmDelete(null)
    } catch {
      setConfirmDelete(null)
    }
  }

  return (
    <PageContainer title="Transactions">
      <Card
        title={scope === 'cycle' ? getPeriodLabel(cycle) : scope === 'all' ? 'All time' : getPeriodLabel(scope)}
        subtitle={`${visible.length} of ${transactions.length} transactions`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-hairline bg-control p-0.5" role="group" aria-label="Cycle scope">
              {[
                { value: 'cycle', label: 'This cycle' },
                { value: 'all', label: 'All' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setScope(option.value)}
                  aria-pressed={scope === option.value}
                  className={`h-8 rounded-md px-3 text-xs font-medium transition-colors ${
                    scope === option.value ? 'bg-brand text-fg-on-brand' : 'text-fg-muted hover:text-fg'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <Button variant="primary" onClick={openCreate}>
              <span aria-hidden="true" className="material-symbols-outlined text-lg">
                add
              </span>
              Add transaction
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4 pb-4">
          <TransactionFilters
            query={query}
            onQueryChange={setQuery}
            type={type}
            onTypeChange={setType}
            categories={categories}
            onCategoriesChange={setCategories}
            options={categoryRecords.filter((category) => category.kind === 'expense')}
          />

          {isLoading && transactions.length === 0 ? (
            <Skeleton count={5} variant="row" />
          ) : visible.length === 0 ? (
            <EmptyState
              icon="receipt_long"
              title="No transactions match"
              description="Try clearing the filters, or add the first transaction for this cycle."
              actionLabel="Add transaction"
              onAction={openCreate}
            />
          ) : (
            <TransactionTable
              rows={visible}
              currency={currency}
              sort={sortBy}
              sortDir={sortDir}
              onSort={handleSort}
              onEdit={openEdit}
              onDelete={setConfirmDelete}
              pendingIds={pendingIds}
              categoryMeta={byKey}
            />
          )}
        </div>
      </Card>

      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        title={editing ? 'Edit transaction' : 'Add transaction'}
        description={editing ? editing.description : 'Amounts are always positive — pick a type instead.'}
        footer={null}
      >
        <TransactionForm
          onSubmit={handleSubmit}
          rails={rails}
          categories={categoryRecords}
          isSubmitting={submitting}
          isEditing={Boolean(editing)}
          onCancel={() => {
            setFormOpen(false)
            setEditing(null)
          }}
          defaultValues={
            editing
              ? {
                  type: editing.type,
                  amount: editing.amount,
                  currency: editing.currency,
                  category: editing.category,
                  description: editing.description,
                  note: editing.note ?? '',
                  railId: editing.railId,
                  occurredAt: new Date(editing.occurredAt).toISOString().slice(0, 10),
                }
              : undefined
          }
        />
      </Modal>

      <Modal
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title="Delete transaction"
        description={confirmDelete ? `“${confirmDelete.description}” will be removed from the ledger.` : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-fg-muted">This cannot be undone.</p>
      </Modal>
    </PageContainer>
  )
}
