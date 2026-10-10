import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'
import BottomNav from '../components/layout/BottomNav'
import Modal from '../components/ui/Modal'
import TransactionForm from '../components/forms/TransactionForm'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useData } from '../context/DataContext'
import { getFirstName, getGreeting } from '../utils/greeting'
import { getPageMeta, NAV_LINKS } from '../routes'
import { CURRENCIES } from '../schemas/enums'

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
  const { rails, currency, addTransaction, updateProfile, policyAlerts } = useData()
  const navigate = useNavigate()
  const location = useLocation()

  const [quickAdd, setQuickAdd] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const meta = getPageMeta(location.pathname)
  const greeting = `${getGreeting()}, ${getFirstName(user?.name)}`

  const handleSignOut = async () => {
    await signOut()
    navigate('/signin', { replace: true })
  }

  const cycleCurrency = () => {
    const next = CURRENCIES[(CURRENCIES.indexOf(currency) + 1) % CURRENCIES.length]
    updateProfile({ baseCurrency: next }).catch(() => undefined)
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
      <Sidebar links={NAV_LINKS} rails={rails} user={user ?? undefined} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          title={meta.title}
          description={meta.description}
          greeting={greeting}
          currency={currency}
          onCycleCurrency={cycleCurrency}
          onDeposit={() => setQuickAdd('income')}
          onSpend={() => setQuickAdd('expense')}
          onSignOut={handleSignOut}
          onToggleTheme={toggle}
          dark={resolvedTheme === 'dark'}
          notificationCount={policyAlerts.length}
          onNotifications={() => navigate('/budgets')}
        />

        <div className="flex-1 pb-20 lg:pb-0">
          <Outlet />
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
    </div>
  )
}
