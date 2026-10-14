import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeAll, afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import { DataProvider, useData } from '../context/DataContext'
import { ThemeProvider } from '../context/ThemeContext'
import { ToastProvider } from '../context/ToastContext'
import AuthenticatedLayout from './AuthenticatedLayout'
import TransactionsPage from './TransactionsPage'
import ToastViewport from '../components/ui/ToastViewport'
import { server } from '../mocks/server'
import { resetDb } from '../mocks/db'
import { createAccount, publicProfile } from '../mocks/accounts'
import { accountKey, load, remove, save, STORAGE_KEYS } from '../utils/storage'

/**
 * End-to-end coverage of the wiring: MSW -> services -> Context (optimistic
 * write + reconcile) -> derived values -> presentational table.
 *
 * Accounts now start empty, so this suite seeds its own rail and ledger through
 * the API before rendering.
 */

let account
let railId
let headers

/** @param {number} day @param {number} [monthOffset] */
function iso(day, monthOffset = 0) {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + monthOffset, day, 10, 0, 0).toISOString()
}

async function createTransaction(overrides) {
  return fetch('/api/transactions', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      type: 'expense',
      amount: 1000,
      currency: 'NGN',
      category: 'food',
      description: 'Entry',
      railId,
      occurredAt: iso(5),
      ...overrides,
    }),
  }).then((response) => response.json())
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
beforeEach(async () => {
  resetDb()
  for (const key of Object.values(STORAGE_KEYS)) remove(key)
  account = await createAccount({ name: 'Damilola Adebayo', email: 'dami@example.com', password: 'password123' })
  save(STORAGE_KEYS.session, { token: account.id, user: publicProfile(account) })
  headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${account.id}` }

  const rail = await fetch('/api/rails', {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: 'Kuda MFB', kind: 'digital', currency: 'NGN', last4: '4417', latencyMs: 90 }),
  }).then((response) => response.json())
  railId = rail.id

  await createTransaction({ type: 'income', amount: 1_250_000, category: 'income', description: 'Salary', occurredAt: iso(1) })
  await createTransaction({ amount: 48_320.5, category: 'food', description: 'Bolt Food ×3', occurredAt: iso(4) })
  await createTransaction({ amount: 142_800, category: 'groceries', description: 'Shoprite Ikeja Mall', occurredAt: iso(8) })
  await createTransaction({ type: 'income', amount: 1_250_000, category: 'income', description: 'Salary — prior', occurredAt: iso(1, -1) })
  await createTransaction({ amount: 118_200, category: 'food', description: 'Bolt Food ×2', occurredAt: iso(4, -1) })
})
afterEach(() => {
  server.resetHandlers()
  vi.useRealTimers()
})
afterAll(() => server.close())

/** Reads Context so the test can assert on derived state directly. */
function Probe() {
  const { balance, flow, categoryTotals, transactions } = useData()
  return (
    <dl>
      <dd data-testid="balance">{balance}</dd>
      <dd data-testid="inflow">{flow.inflow}</dd>
      <dd data-testid="spend">{flow.spend}</dd>
      <dd data-testid="priorNet">{flow.priorInflow - flow.priorSpend}</dd>
      <dd data-testid="count">{transactions.length}</dd>
      <dd data-testid="food">{categoryTotals.food ?? 0}</dd>
    </dl>
  )
}

function renderApp() {
  return render(
    <MemoryRouter initialEntries={['/transactions']}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <DataProvider>
              <Probe />
              <Routes>
                <Route element={<AuthenticatedLayout />}>
                  <Route path="/transactions" element={<TransactionsPage />} />
                </Route>
              </Routes>
              <ToastViewport />
            </DataProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </MemoryRouter>,
  )
}

describe('ledger integration', () => {
  it('renders the reference header with the active screen title and greeting', async () => {
    renderApp()

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Transaction Ledger & Rails' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/^Good (morning|afternoon|evening), Damilola$/),
    ).toBeInTheDocument()
  })

  it("renders the account's ledger and matching derived totals", async () => {
    renderApp()

    await waitFor(() => expect(screen.getByTestId('count')).not.toHaveTextContent('0'))
    expect(screen.getAllByText('Bolt Food ×3').length).toBeGreaterThan(0)

    // Balance is all-time while the flow totals are scoped to the current
    // cycle, so the two only reconcile once the prior cycle is added back.
    const spend = Number(screen.getByTestId('spend').textContent)
    const inflow = Number(screen.getByTestId('inflow').textContent)
    const balance = Number(screen.getByTestId('balance').textContent)
    const priorNet = Number(screen.getByTestId('priorNet').textContent)
    const food = Number(screen.getByTestId('food').textContent)

    expect(spend).toBeGreaterThan(0)
    expect(inflow).toBeGreaterThan(0)
    expect(priorNet).not.toBe(0)
    expect(balance).toBeCloseTo(inflow - spend + priorNet, 2)
    expect(food).toBeGreaterThan(0)
  })

  it('adds a transaction optimistically and reconciles the temp id', async () => {
    renderApp()
    await waitFor(() => expect(screen.getByTestId('count')).not.toHaveTextContent('0'))
    const before = Number(screen.getByTestId('count').textContent)

    await userEvent.click(screen.getAllByRole('button', { name: /add transaction/i })[0])
    const dialog = await screen.findByRole('dialog')

    await userEvent.type(within(dialog).getByLabelText(/amount/i), '12500')
    await userEvent.type(within(dialog).getByLabelText(/description/i), 'Smoke test entry')
    await userEvent.selectOptions(within(dialog).getByLabelText(/rail/i), railId)
    await userEvent.click(within(dialog).getByRole('button', { name: /add transaction/i }))

    // The row appears immediately (optimistic) and the server id replaces the
    // temp id once confirmed.
    await waitFor(() => expect(screen.getAllByText('Smoke test entry').length).toBeGreaterThan(0))
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent(String(before + 1)))

    await waitFor(() => {
      const cached = load(accountKey(STORAGE_KEYS.transactions, account.id), []).find(
        (row) => row.description === 'Smoke test entry',
      )
      expect(cached).toBeDefined()
      expect(cached.id).not.toMatch(/^temp_/)
    })

    const cached = load(accountKey(STORAGE_KEYS.transactions, account.id), []).find(
      (row) => row.description === 'Smoke test entry',
    )
    expect(cached.pending).toBeUndefined()
  })

  it('rolls the row back and toasts when the server rejects the write', async () => {
    renderApp()
    await waitFor(() => expect(screen.getByTestId('count')).not.toHaveTextContent('0'))
    const before = Number(screen.getByTestId('count').textContent)

    // Simulate the failure the Settings "arm failure" toggle produces.
    const { armFailure, disarmFailure } = await import('../mocks/handlers')
    armFailure()

    await userEvent.click(screen.getAllByRole('button', { name: /add transaction/i })[0])
    const dialog = await screen.findByRole('dialog')

    await userEvent.type(within(dialog).getByLabelText(/amount/i), '9999')
    await userEvent.type(within(dialog).getByLabelText(/description/i), 'Doomed entry')
    await userEvent.selectOptions(within(dialog).getByLabelText(/rail/i), railId)
    await userEvent.click(within(dialog).getByRole('button', { name: /add transaction/i }))

    await waitFor(
      () => expect(screen.getByText(/ledger service unavailable/i)).toBeInTheDocument(),
      { timeout: 4000 },
    )
    expect(screen.queryAllByText('Doomed entry')).toHaveLength(0)
    expect(screen.getByTestId('count')).toHaveTextContent(String(before))

    disarmFailure()
  })

  it('filters locally without refetching', async () => {
    renderApp()
    await waitFor(() => expect(screen.getAllByText('Bolt Food ×3').length).toBeGreaterThan(0))

    await userEvent.type(screen.getByLabelText(/search transactions/i), 'Shoprite')

    await waitFor(() => expect(screen.queryAllByText('Bolt Food ×3')).toHaveLength(0))
    expect(screen.getAllByText('Shoprite Ikeja Mall').length).toBeGreaterThan(0)
  })
})
