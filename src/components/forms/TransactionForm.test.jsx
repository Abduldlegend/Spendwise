import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TransactionForm from './TransactionForm'
import { server } from '../../mocks/server'
import { resetDb } from '../../mocks/db'
import { createAccount, publicProfile } from '../../mocks/accounts'
import { remove, save, STORAGE_KEYS } from '../../utils/storage'

/**
 * The form owns its local state via React Hook Form and calls the handler the
 * page passes down — it never touches Context or the network itself.
 */

const rails = [
  { id: 'rail_zenith', name: 'Zenith Bank', currency: 'NGN' },
  { id: 'rail_kuda', name: 'Kuda MFB', currency: 'NGN' },
]

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function renderForm(props = {}) {
  const onSubmit = props.onSubmit ?? vi.fn()
  render(
    <TransactionForm
      onSubmit={onSubmit}
      rails={rails}
      {...props}
    />,
  )
  return { onSubmit }
}

describe('TransactionForm', () => {
  it('submits a valid expense', async () => {
    const { onSubmit } = renderForm()

    await userEvent.type(screen.getByLabelText(/amount/i), '48320.50')
    await userEvent.type(screen.getByLabelText(/description/i), 'Bolt Food')
    await userEvent.selectOptions(screen.getByLabelText(/rail/i), 'rail_kuda')
    await userEvent.click(screen.getByRole('button', { name: /add transaction/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      type: 'expense',
      amount: 48320.5,
      currency: 'NGN',
      description: 'Bolt Food',
      railId: 'rail_kuda',
    })
  })

  it('blocks submission and shows a message for a zero amount', async () => {
    const { onSubmit } = renderForm()

    await userEvent.type(screen.getByLabelText(/description/i), 'Nothing')
    await userEvent.click(screen.getByRole('button', { name: /add transaction/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/greater than zero/i)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rejects more than two decimal places', async () => {
    renderForm()

    await userEvent.type(screen.getByLabelText(/amount/i), '100.005')
    await userEvent.type(screen.getByLabelText(/description/i), 'Too precise')
    await userEvent.click(screen.getByRole('button', { name: /add transaction/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/2 decimal places/i)
  })

  it('requires a description of at least 2 characters', async () => {
    renderForm()

    await userEvent.type(screen.getByLabelText(/amount/i), '1000')
    await userEvent.type(screen.getByLabelText(/description/i), 'a')
    await userEvent.click(screen.getByRole('button', { name: /add transaction/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/short description/i)
  })

  it('switches the category options when the type becomes income', async () => {
    renderForm()

    expect(screen.queryByRole('option', { name: 'income' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('radio', { name: /income/i }))
    expect(await screen.findByRole('option', { name: 'Income / Wire' })).toBeInTheDocument()
  })

  it('uses the editing submit label and pre-fills defaults', () => {
    renderForm({
      isEditing: true,
      defaultValues: {
        type: 'expense',
        amount: 1500,
        category: 'tech',
        description: 'GitHub seat',
        note: '',
        railId: 'rail_zenith',
        occurredAt: '2026-09-14',
      },
    })

    expect(screen.getByLabelText(/amount/i)).toHaveValue(1500)
    expect(screen.getByLabelText(/description/i)).toHaveValue('GitHub seat')
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })

  it('calls onCancel', async () => {
    const onCancel = vi.fn()
    renderForm({ onCancel })

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})

describe('MSW contract', () => {
  let headers

  beforeEach(async () => {
    resetDb()
    for (const key of Object.values(STORAGE_KEYS)) remove(key)
    const account = await createAccount({ name: 'Contract Tester', email: 'contract@example.com', password: 'password123' })
    save(STORAGE_KEYS.session, { token: account.id, user: publicProfile(account) })
    headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${account.id}` }
  })

  it('serves an empty ledger and accepts a create', async () => {
    const list = await fetch('/api/transactions', { headers }).then((response) => response.json())
    expect(Array.isArray(list)).toBe(true)
    expect(list).toEqual([])

    const created = await fetch('/api/transactions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type: 'expense',
        amount: 2500,
        currency: 'NGN',
        category: 'food',
        description: 'Test create',
        railId: 'rail_kuda',
        occurredAt: new Date().toISOString(),
      }),
    }).then((response) => response.json())

    expect(created.id).toMatch(/^txn_/)
    expect(created.createdAt).toBeTruthy()
  })

  it('returns 404 when updating an unknown transaction', async () => {
    const response = await fetch('/api/transactions/does-not-exist', {
      method: 'PUT',
      headers,
      body: JSON.stringify({ amount: 1 }),
    })
    expect(response.status).toBe(404)
  })

  it('returns 400 for a login without an email', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    expect(response.status).toBe(400)
  })
})
