import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../../services/api', () => ({
  fetchAdminUsers: vi.fn(),
}))

import * as api from '../../services/api'
import AdminUsersPage from './AdminUsersPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminUsersPage />
    </MemoryRouter>,
  )
}

describe('AdminUsersPage', () => {
  beforeEach(() => {
    api.fetchAdminUsers.mockReset()
  })

  it('renders account metadata and ledger counts', async () => {
    api.fetchAdminUsers.mockResolvedValue({
      items: [
        {
          id: 'u1',
          name: 'Ada Obi',
          email: 'ada@example.com',
          role: 'admin',
          provider: 'password',
          kycTier: 2,
          kycLimit: 20000000,
          isActive: true,
          baseCurrency: 'NGN',
          createdAt: '2026-01-04T10:00:00.000Z',
          lastLoginAt: null,
          accountId: 'a1',
          counts: { transactions: 12, budgets: 3, milestones: 2, rails: 1 },
        },
      ],
      page: 1,
      limit: 20,
      total: 1,
      pages: 1,
    })

    renderPage()

    expect(await screen.findByText('Ada Obi')).toBeInTheDocument()
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('/ 3b / 2m / 1r')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /open ada obi/i })).toHaveAttribute(
      'href',
      '/admin/users/u1',
    )
  })

  it('shows an empty state when no accounts match', async () => {
    api.fetchAdminUsers.mockResolvedValue({ items: [], page: 1, limit: 20, total: 0, pages: 1 })
    renderPage()
    expect(await screen.findByText('No accounts match')).toBeInTheDocument()
  })
})
