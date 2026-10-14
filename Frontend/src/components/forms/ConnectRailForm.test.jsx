import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ConnectRailForm from './ConnectRailForm'

/**
 * The form owns its local state via React Hook Form and calls the handler the
 * page passes down — it never touches Context or the network itself.
 */

function renderForm(props = {}) {
  const onSubmit = props.onSubmit ?? vi.fn()
  render(<ConnectRailForm onSubmit={onSubmit} {...props} />)
  return { onSubmit }
}

describe('ConnectRailForm', () => {
  it('submits a valid rail', async () => {
    const { onSubmit } = renderForm()

    await userEvent.type(screen.getByLabelText(/rail name/i), 'GTBank')
    await userEvent.selectOptions(screen.getByLabelText(/kind/i), 'bank')
    await userEvent.type(screen.getByLabelText(/last four/i), '4196')
    await userEvent.click(screen.getByRole('button', { name: /connect rail/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      name: 'GTBank',
      kind: 'bank',
      currency: 'NGN',
      last4: '4196',
    })
  })

  it('treats a blank last4 as omitted', async () => {
    const { onSubmit } = renderForm()

    await userEvent.type(screen.getByLabelText(/rail name/i), 'Cash Wallet')
    await userEvent.click(screen.getByRole('button', { name: /connect rail/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0].last4).toBeUndefined()
  })

  it('blocks submission and shows a message for a malformed last4', async () => {
    const { onSubmit } = renderForm()

    await userEvent.type(screen.getByLabelText(/rail name/i), 'GTBank')
    await userEvent.type(screen.getByLabelText(/last four/i), '12')
    await userEvent.click(screen.getByRole('button', { name: /connect rail/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/exactly 4 digits/i)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('requires a name of at least 2 characters', async () => {
    const { onSubmit } = renderForm()

    await userEvent.type(screen.getByLabelText(/rail name/i), 'G')
    await userEvent.click(screen.getByRole('button', { name: /connect rail/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/name the rail/i)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('clears the fields after a successful connect', async () => {
    const { onSubmit } = renderForm()

    await userEvent.type(screen.getByLabelText(/rail name/i), 'GTBank')
    await userEvent.click(screen.getByRole('button', { name: /connect rail/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(screen.getByLabelText(/rail name/i)).toHaveValue('')
  })

  it('disables the controls at the rail limit', () => {
    renderForm({ disabled: true })

    expect(screen.getByLabelText(/rail name/i)).toBeDisabled()
    expect(screen.getByRole('button', { name: /connect rail/i })).toBeDisabled()
  })
})
