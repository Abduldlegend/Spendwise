import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import BudgetProgressBar from './BudgetProgressBar'
import CategoryBadge from './CategoryBadge'
import ConfirmDialog from './ConfirmDialog'
import MetricCard from './MetricCard'
import SpendingDistributionBar from './SpendingDistributionBar'
import TransactionTable from './TransactionTable'

/**
 * These render with static props only — no Context provider anywhere, which is
 * the check that the presentational layer is genuinely decoupled.
 */

const rows = [
  {
    id: 'txn_1',
    type: 'expense',
    amount: 48320.5,
    currency: 'NGN',
    category: 'food',
    description: 'Bolt Food ×3',
    note: '',
    railId: 'rail_kuda',
    railName: 'Kuda MFB',
    occurredAt: '2026-09-14T12:00:00.000Z',
  },
  {
    id: 'txn_2',
    type: 'income',
    amount: 1250000,
    currency: 'NGN',
    category: 'income',
    description: 'Salary',
    note: 'September',
    railId: 'rail_zenith',
    railName: 'Zenith Bank',
    occurredAt: '2026-09-01T08:00:00.000Z',
  },
]

describe('CategoryBadge', () => {
  it('renders the label for a category', () => {
    render(<CategoryBadge category="groceries" />)
    expect(screen.getByText('Groceries')).toBeInTheDocument()
  })

  it('falls back for an unknown category instead of crashing', () => {
    render(<CategoryBadge category="nope" />)
    expect(screen.getByText('Other')).toBeInTheDocument()
  })

  it('can hide the label', () => {
    render(<CategoryBadge category="food" showLabel={false} />)
    expect(screen.queryByText('Food & Dining')).not.toBeInTheDocument()
  })
})

describe('MetricCard', () => {
  it('shows the label and pre-formatted value', () => {
    render(<MetricCard label="Net balance" value="₦1,250,000.00" />)
    expect(screen.getByText('Net balance')).toBeInTheDocument()
    expect(screen.getByText('₦1,250,000.00')).toBeInTheDocument()
  })

  it('omits the delta when none is supplied', () => {
    render(<MetricCard label="Net balance" value="₦0.00" />)
    expect(screen.queryByText(/%/)).not.toBeInTheDocument()
  })

  it('renders a signed delta', () => {
    render(<MetricCard label="Spend" value="₦500.00" delta={0.082} />)
    expect(screen.getByText('+8.2%')).toBeInTheDocument()
  })

  it('does not mark a zero delta as a rise', () => {
    render(<MetricCard label="Spend" value="₦500.00" delta={0} />)
    expect(screen.getByText('0.0%')).toBeInTheDocument()
  })
})

describe('BudgetProgressBar', () => {
  it('exposes the ratio to assistive tech', () => {
    render(<BudgetProgressBar ratio={0.42} label="Food budget used" />)
    const bar = screen.getByRole('progressbar', { name: 'Food budget used' })
    expect(bar).toHaveAttribute('aria-valuenow', '42')
  })

  it('clamps above 100% for the accessible value', () => {
    render(<BudgetProgressBar ratio={1.8} label="Over" />)
    expect(screen.getByRole('progressbar', { name: 'Over' })).toHaveAttribute('aria-valuenow', '100')
  })

  it('handles a non-finite ratio without crashing', () => {
    render(<BudgetProgressBar ratio={NaN} label="Bad" />)
    expect(screen.getByRole('progressbar', { name: 'Bad' })).toHaveAttribute('aria-valuenow', '0')
  })

  it('describes an over-budget envelope', () => {
    render(<BudgetProgressBar ratio={1.2} over label="Over" />)
    expect(screen.getByRole('progressbar', { name: 'Over' })).toHaveAttribute(
      'aria-valuetext',
      expect.stringContaining('over budget'),
    )
  })
})

describe('SpendingDistributionBar', () => {
  const segments = [
    { category: 'housing', amount: 480000, share: 0.6 },
    { category: 'food', amount: 320000, share: 0.4 },
  ]

  it('renders an empty message with no segments', () => {
    render(<SpendingDistributionBar segments={[]} />)
    expect(screen.getByText(/No spending recorded/i)).toBeInTheDocument()
  })

  it('renders the legend with compact amounts', () => {
    render(<SpendingDistributionBar segments={segments} withLegend currency="NGN" />)
    expect(screen.getByText('housing')).toBeInTheDocument()
    expect(screen.getByText('₦480K')).toBeInTheDocument()
  })

  it('reports the clicked category', async () => {
    const onSelect = vi.fn()
    render(<SpendingDistributionBar segments={segments} onSelect={onSelect} />)
    await userEvent.click(screen.getByTitle(/housing/i))
    expect(onSelect).toHaveBeenCalledWith('housing')
  })
})

describe('TransactionTable', () => {
  it('renders one row per transaction in both the table and the stacked list', () => {
    render(<TransactionTable rows={rows} />)
    expect(screen.getAllByText('Bolt Food ×3')).toHaveLength(2)
    expect(screen.getAllByText('Salary')).toHaveLength(2)
  })

  it('prefixes income and de-prefixes expense', () => {
    render(<TransactionTable rows={rows} />)
    expect(screen.getAllByText('+₦1,250,000.00')).toHaveLength(2)
    expect(screen.getAllByText(/−₦48,320.50/)).toHaveLength(2)
  })

  it('renders the note when present', () => {
    render(<TransactionTable rows={rows} />)
    expect(screen.getAllByText('September')).toHaveLength(2)
  })

  it('hides row actions when no handlers are supplied', () => {
    render(<TransactionTable rows={rows} />)
    expect(screen.queryByRole('button', { name: /Edit Bolt Food/ })).not.toBeInTheDocument()
  })

  it('calls the edit handler with the row', async () => {
    const onEdit = vi.fn()
    render(<TransactionTable rows={rows} onEdit={onEdit} />)
    await userEvent.click(screen.getAllByRole('button', { name: 'Edit Salary' })[0])
    expect(onEdit).toHaveBeenCalledWith(rows[1])
  })

  it('reports a sort request', async () => {
    const onSort = vi.fn()
    render(<TransactionTable rows={rows} onSort={onSort} />)
    await userEvent.click(screen.getByRole('button', { name: /Amount/ }))
    expect(onSort).toHaveBeenCalledWith('amount')
  })

  it('dims rows that are still pending', () => {
    const { container } = render(<TransactionTable rows={rows} pendingIds={['txn_1']} />)
    const firstRow = container.querySelectorAll('tbody tr')[0]
    expect(firstRow.className).toContain('opacity-60')
  })

  it('handles an empty ledger', () => {
    render(<TransactionTable rows={[]} />)
    expect(screen.getAllByRole('row')).toHaveLength(1)
  })
})

describe('ConfirmDialog', () => {
  it('renders nothing while closed', () => {
    render(<ConfirmDialog open={false} title="Sign out?" onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('invokes the confirm and cancel handlers', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        open
        title="Sign out?"
        description="You'll need to sign in again."
        confirmLabel="Sign out"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    )

    expect(screen.getByRole('dialog')).toHaveAccessibleName('Sign out?')
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
