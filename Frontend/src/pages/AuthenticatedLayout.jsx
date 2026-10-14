import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'
import BottomNav from '../components/layout/BottomNav'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Modal from '../components/ui/Modal'
import RailBalanceCard from '../components/ui/RailBalanceCard'
import TransactionForm from '../components/forms/TransactionForm'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useData } from '../context/DataContext'
import { getFirstName, getGreeting } from '../utils/greeting'
import { getPageMeta, NAV_LINKS } from '../routes'

/**
 * The authenticated chrome.
 *
 * This lives in `pages/` precisely because it is the one place layout chrome may
 * read global state — AGENTS.md restricts Context reads to `pages/`, and
 * `components/layout/*` stays pure by receiving everything through props.
 *
 * It also owns the global quick-add transaction dialog so the header's Deposit /
 * Spend actions work from any screen, matching the reference's `openTransactionModal`.
 */
export default function AuthenticatedLayout() {
  const { user, signOut } = useAuth()
  const { resolvedTheme, toggle } = useTheme()
  const { rails, addTransaction, policyAlerts } = useData()
  const navigate = useNavigate()
  const location = useLocation()

  const [quickAdd, setQuickAdd] = useState(null)
  const [confirmSignOut, setConfirmSignOut] = useState(false)
  const [selectedRail, setSelectedRail] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const meta = getPageMeta(location.pathname)
  const greeting = `${getGreeting()}, ${getFirstName(user?.name)}`

  const handleSignOut = async () => {
    setConfirmSignOut(false)
    await signOut()
    navigate('/', { replace: true })
  }

  const handleQuickAdd = async (values) => {
    setSubmitting(true)
    try {
      await addTransaction(values)
      setQuickAdd(null)
    } catch {
      /* rolled back and toasted by the Context; keep the dialog open */
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-dvh bg-surface">
      <Sidebar links={NAV_LINKS} rails={rails} user={user ?? undefined} onSelectRail={setSelectedRail} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          title={meta.title}
          description={meta.description}
          greeting={greeting}
          onDeposit={() => setQuickAdd('income')}
          onSpend={() => setQuickAdd('expense')}
          onSignOut={() => setConfirmSignOut(true)}
          onToggleTheme={toggle}
          dark={resolvedTheme === 'dark'}
          notificationCount={policyAlerts.length}
          onNotifications={() => navigate('/budgets')}
          rails={rails}
          onSelectRail={setSelectedRail}
        />

        <div className="flex-1 pb-20 lg:pb-0">
          <Outlet
            context={{
              onDeposit: () => setQuickAdd('income'),
              onSpend: () => setQuickAdd('expense'),
              onSelectRail: setSelectedRail,
            }}
          />
        </div>
      </div>

      <BottomNav links={NAV_LINKS} />

      <Modal
        open={Boolean(quickAdd)}
        onClose={() => setQuickAdd(null)}
        title={quickAdd === 'income' ? 'Record deposit' : 'Record spend'}
        description="Amounts are always positive — pick a type instead."
        footer={null}
      >
        <TransactionForm
          onSubmit={handleQuickAdd}
          rails={rails}
          isSubmitting={submitting}
          defaultValues={{ type: quickAdd ?? 'expense' }}
          onCancel={() => setQuickAdd(null)}
        />
      </Modal>

      <Modal
        open={Boolean(selectedRail)}
        onClose={() => setSelectedRail(null)}
        title={selectedRail?.name ?? 'Rail'}
        align="center"
        footer={null}
      >
        {selectedRail && <RailBalanceCard rail={selectedRail} />}
      </Modal>

      <ConfirmDialog
        open={confirmSignOut}
        title="Sign out?"
        description="You'll need to sign in again to reach your ledger."
        confirmLabel="Sign out"
        tone="danger"
        onConfirm={handleSignOut}
        onCancel={() => setConfirmSignOut(false)}
      >
        <p className="text-sm text-fg-muted">
          Nothing is deleted — your transactions and budgets stay on this device.
        </p>
      </ConfirmDialog>
    </div>
  )
}
