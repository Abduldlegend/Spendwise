import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

vi.mock('../../config', () => ({ isMockApiEnabled: true, API_BASE_URL: '/api' }))

import AdminLayout from './AdminLayout'
import { RequireAdmin } from '../RequireAuth'
import { AuthProvider } from '../../context/AuthContext'
import { ThemeProvider } from '../../context/ThemeContext'
import { save, STORAGE_KEYS } from '../../utils/storage'

describe('admin mock-mode gate', () => {
  beforeEach(() => {
    window.localStorage.clear()
    save(STORAGE_KEYS.session, {
      token: 'test-token',
      user: { id: 'u1', name: 'Ada Admin', email: 'ada@example.com', role: 'user' },
    })
  })

  it('refuses to render the console against the bundled mock', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <ThemeProvider>
          <AuthProvider>
            <Routes>
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

    expect(screen.getByText('Live API required')).toBeInTheDocument()
    expect(screen.queryByText('Console body')).not.toBeInTheDocument()
  })
})
