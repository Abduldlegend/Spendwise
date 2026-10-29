import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

vi.mock('../../config', () => ({ isMockApiEnabled: false, API_BASE_URL: '/api' }))

import AdminLayout from './AdminLayout'
import { RequireAdmin } from '../RequireAuth'
import { AuthProvider } from '../../context/AuthContext'
import { ThemeProvider } from '../../context/ThemeContext'
import { save, STORAGE_KEYS } from '../../utils/storage'

function seedSession(role) {
  save(STORAGE_KEYS.session, {
    token: 'test-token',
    user: { id: 'u1', name: 'Ada Admin', email: 'ada@example.com', role },
  })
}

function renderConsole() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/signin" element={<p>Sign-in screen</p>} />
            <Route element={<RequireAdmin />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<p>Console body</p>} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>,
  )
}

describe('admin shell gating', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders the ops shell for an admin', () => {
    seedSession('admin')
    renderConsole()
    expect(screen.getByText('Console body')).toBeInTheDocument()
    expect(screen.getAllByText('Platform Overview').length).toBeGreaterThan(0)
    expect(screen.getByText('Compliance Audit Log')).toBeInTheDocument()
    expect(screen.getByText('Ada Admin')).toBeInTheDocument()
  })

  it('renders the 403 state for a signed-in non-admin', () => {
    seedSession('user')
    renderConsole()
    expect(screen.getByText('Access denied')).toBeInTheDocument()
    expect(screen.queryByText('Console body')).not.toBeInTheDocument()
  })

  it('sends an anonymous visitor to sign-in', () => {
    renderConsole()
    expect(screen.getByText('Sign-in screen')).toBeInTheDocument()
  })
})
