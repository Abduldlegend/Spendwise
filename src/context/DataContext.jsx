import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react'
import { budgetRecordSchema, budgetSchema } from '../schemas/budget'
import { milestoneRecordSchema, milestoneSchema, railRecordSchema, railSchema } from '../schemas/milestone'
import { toTransactionRecord, transactionSchema } from '../schemas/transaction'
import { MAX_RAILS } from '../schemas/enums'
import * as api from '../services/api'
import {
  getBalance,
  getBudgetProgress,
  getCategoryBreakdown,
  getCategoryTotals,
  getFlowTotals,
  getHealthState,
  getPolicyAlerts,
  getProjectedSweep,
} from '../utils/derived'
import { cycleKey } from '../utils/cycle'
import { accountKey, load, save, STORAGE_KEYS } from '../utils/storage'
import { dataReducer, initialState } from './dataReducer'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'

const DataContext = createContext(null)

let tempCounter = 0
function nextTempId() {
  tempCounter += 1
  return `temp_${Date.now().toString(36)}_${tempCounter}`
}

/**
 * Drops the UI-only `pending` marker before a record is written to cache.
 * @param {Array<object>} rows
 */
function withoutPending(rows) {
  return rows.map(({ pending: _pending, ...row }) => row)
}

/**
 * Provider for every persisted resource.
 *
 * It owns the seven-step write sequence from AGENTS.md:
 *   validate -> optimistic -> api -> reconcile -> (rollback + toast) -> persist
 *
 * All rollbacks land in `dataReducer`; derived values recompute automatically
 * because they are `useMemo` outputs, never state fields.
 */
export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(dataReducer, initialState)
  const toast = useToast()
  const { user: authUser } = useAuth()

  // Every resource is scoped to the signed-in account. When the account changes
  // (sign-in, sign-out, switch) the cache and the API are re-read for that user.
  const accountId = authUser?.id ?? null

  useEffect(() => {
    if (!accountId) {
      dispatch({ type: 'reset' })
      return undefined
    }

    // Cache-first: paint this account's cached rows, then revalidate against the API.
    dispatch({
      type: 'hydrate',
      transactions: load(accountKey(STORAGE_KEYS.transactions, accountId), []),
      budgets: load(accountKey(STORAGE_KEYS.budgets, accountId), []),
      milestones: load(accountKey(STORAGE_KEYS.milestones, accountId), []),
      rails: load(accountKey(STORAGE_KEYS.rails, accountId), []),
      user: load(accountKey(STORAGE_KEYS.user, accountId), null),
    })

    let active = true
    ;(async () => {
      try {
        const [transactions, budgets, milestones, rails, user] = await Promise.all([
          api.fetchTransactions(),
          api.fetchBudgets(),
          api.fetchMilestones(),
          api.fetchRails(),
          api.fetchProfile(),
        ])
        if (!active) return
        dispatch({ type: 'hydrate', transactions, budgets, milestones, rails, user })
      } catch (error) {
        if (active) dispatch({ type: 'error', message: error.message })
      }
    })()

    return () => {
      active = false
    }
  }, [accountId])

  // Step 7 of the write sequence. Persist only real data — the transient
  // `pending` marker is stripped, otherwise a row cached mid-flight would come
  // back from a reload looking permanently stuck saving. Never writes before
  // hydration, or the first render would overwrite the cache it is about to read.
  useEffect(() => {
    if (!state.hydrated || !accountId) return
    save(accountKey(STORAGE_KEYS.transactions, accountId), withoutPending(state.transactions))
    save(accountKey(STORAGE_KEYS.budgets, accountId), withoutPending(state.budgets))
    save(accountKey(STORAGE_KEYS.milestones, accountId), withoutPending(state.milestones))
    save(accountKey(STORAGE_KEYS.rails, accountId), state.rails)
    if (state.user) save(accountKey(STORAGE_KEYS.user, accountId), state.user)
  }, [
    state.hydrated,
    accountId,
    state.transactions,
    state.budgets,
    state.milestones,
    state.rails,
    state.user,
  ])

  const railName = useCallback(
    (railId) => state.rails.find((rail) => rail.id === railId)?.name ?? 'Unknown rail',
    [state.rails],
  )

  // ------------------------------------------------------------------ transactions

  const addTransaction = useCallback(
    async (input) => {
      const parsed = transactionSchema.parse(input)
      const tempId = nextTempId()
      const record = {
        ...toTransactionRecord(parsed, { id: tempId, railName: railName(parsed.railId) }),
        pending: true,
      }

      dispatch({ type: 'insert', collection: 'transactions', record })

      try {
        const { pending: _pending, ...payload } = record
        const saved = await api.createTransaction(payload)
        dispatch({ type: 'reconcile', collection: 'transactions', tempId, record: saved })
        toast.success('Transaction added')
        return saved
      } catch (error) {
        dispatch({ type: 'discard', collection: 'transactions', tempId, message: error.message })
        toast.error(`Could not save transaction: ${error.message}`)
        throw error
      }
    },
    [railName, toast],
  )

  const editTransaction = useCallback(
    async (id, input) => {
      const parsed = transactionSchema.parse(input)
      const index = state.transactions.findIndex((row) => row.id === id)
      if (index === -1) throw new Error('Transaction not found')
      const previous = state.transactions[index]

      dispatch({
        type: 'patch',
        collection: 'transactions',
        id,
        patch: {
          ...toTransactionRecord(parsed, { id, railName: railName(parsed.railId), now: new Date(previous.createdAt) }),
        },
      })

      try {
        const saved = await api.updateTransaction(id, parsed)
        dispatch({ type: 'confirm', collection: 'transactions', id, record: saved })
        toast.success('Transaction updated')
        return saved
      } catch (error) {
        dispatch({ type: 'restore', collection: 'transactions', id, previous, message: error.message })
        toast.error(`Could not update transaction: ${error.message}`)
        throw error
      }
    },
    [state.transactions, railName, toast],
  )

  const removeTransaction = useCallback(
    async (id) => {
      const index = state.transactions.findIndex((row) => row.id === id)
      if (index === -1) throw new Error('Transaction not found')
      const previous = state.transactions[index]

      dispatch({ type: 'remove', collection: 'transactions', id })

      try {
        await api.deleteTransaction(id)
        dispatch({ type: 'confirm', collection: 'transactions', id })
        toast.success('Transaction deleted')
      } catch (error) {
        dispatch({
          type: 'reinstate',
          collection: 'transactions',
          id,
          record: previous,
          index,
          message: error.message,
        })
        toast.error(`Could not delete transaction: ${error.message}`)
        throw error
      }
    },
    [state.transactions, toast],
  )

  // --------------------------------------------------------------------- budgets

  const upsertBudget = useCallback(
    async (input) => {
      const parsed = budgetSchema.parse(input)
      const existing = state.budgets.find((row) => row.category === parsed.category && !input.id)

      if (existing) {
        const previous = existing
        dispatch({ type: 'patch', collection: 'budgets', id: existing.id, patch: parsed })
        try {
          const saved = await api.updateBudget(existing.id, parsed)
          dispatch({ type: 'confirm', collection: 'budgets', id: existing.id, record: saved })
          toast.success(`${saved.category} envelope updated`)
          return saved
        } catch (error) {
          dispatch({ type: 'restore', collection: 'budgets', id: existing.id, previous, message: error.message })
          toast.error(`Could not save envelope: ${error.message}`)
          throw error
        }
      }

      const tempId = nextTempId()
      const now = new Date().toISOString()
      const record = budgetRecordSchema.parse({
        ...parsed,
        id: tempId,
        createdAt: now,
        updatedAt: now,
      })

      dispatch({ type: 'insert', collection: 'budgets', record: { ...record, pending: true } })

      try {
        const { pending: _pending, ...payload } = record
        const saved = await api.createBudget(payload)
        dispatch({ type: 'reconcile', collection: 'budgets', tempId, record: saved })
        toast.success(`${saved.category} envelope created`)
        return saved
      } catch (error) {
        dispatch({ type: 'discard', collection: 'budgets', tempId, message: error.message })
        toast.error(`Could not save envelope: ${error.message}`)
        throw error
      }
    },
    [state.budgets, toast],
  )

  const setBudgetLock = useCallback(
    async (id, isLocked) => {
      const previous = state.budgets.find((row) => row.id === id)
      if (!previous) throw new Error('Envelope not found')

      const patch = { isLocked, policy: { ...previous.policy, autoSweep: { ...previous.policy.autoSweep, enabled: false } } }
      dispatch({ type: 'patch', collection: 'budgets', id, patch })

      try {
        const saved = await api.updateBudget(id, { isLocked, ...patch })
        dispatch({ type: 'confirm', collection: 'budgets', id, record: saved })
        toast.success(isLocked ? 'Envelope locked' : 'Envelope unlocked')
        return saved
      } catch (error) {
        dispatch({ type: 'restore', collection: 'budgets', id, previous, message: error.message })
        toast.error(`Could not update envelope: ${error.message}`)
        throw error
      }
    },
    [state.budgets, toast],
  )

  // ------------------------------------------------------------------ milestones

  const addMilestone = useCallback(
    async (input) => {
      const parsed = milestoneSchema.parse(input)
      const tempId = nextTempId()
      const record = {
        ...milestoneRecordSchema.parse({ ...parsed, id: tempId, createdAt: new Date().toISOString() }),
        pending: true,
      }

      dispatch({ type: 'insert', collection: 'milestones', record })

      try {
        const { pending: _pending, ...payload } = record
        const saved = await api.createMilestone(payload)
        dispatch({ type: 'reconcile', collection: 'milestones', tempId, record: saved })
        toast.success('Milestone created')
        return saved
      } catch (error) {
        dispatch({ type: 'discard', collection: 'milestones', tempId, message: error.message })
        toast.error(`Could not create milestone: ${error.message}`)
        throw error
      }
    },
    [toast],
  )

  const saveMilestone = useCallback(
    async (id, input) => {
      const parsed = milestoneSchema.parse(input)
      const previous = state.milestones.find((row) => row.id === id)
      if (!previous) throw new Error('Milestone not found')

      dispatch({ type: 'patch', collection: 'milestones', id, patch: parsed })

      try {
        const saved = await api.updateMilestone(id, parsed)
        dispatch({ type: 'confirm', collection: 'milestones', id, record: saved })
        toast.success('Milestone updated')
        return saved
      } catch (error) {
        dispatch({ type: 'restore', collection: 'milestones', id, previous, message: error.message })
        toast.error(`Could not update milestone: ${error.message}`)
        throw error
      }
    },
    [state.milestones, toast],
  )

  // ------------------------------------------------------------------------ rails

  const connectRail = useCallback(
    async (input) => {
      const parsed = railSchema.parse(input)

      if (state.rails.length >= MAX_RAILS) {
        const error = new Error(`You can connect up to ${MAX_RAILS} rails`)
        error.status = 409
        throw error
      }

      const tempId = nextTempId()
      const record = {
        ...railRecordSchema.parse({ ...parsed, id: tempId }),
        pending: true,
      }

      dispatch({ type: 'insert', collection: 'rails', record })

      try {
        const { pending: _pending, ...payload } = record
        const saved = await api.connectRail(payload)
        dispatch({ type: 'reconcile', collection: 'rails', tempId, record: saved })
        toast.success(`${saved.name} connected`)
        return saved
      } catch (error) {
        dispatch({ type: 'discard', collection: 'rails', tempId, message: error.message })
        toast.error(`Could not connect rail: ${error.message}`)
        throw error
      }
    },
    [state.rails, toast],
  )

  const disconnectRail = useCallback(
    async (id) => {
      const index = state.rails.findIndex((row) => row.id === id)
      if (index === -1) throw new Error('Rail not found')
      const previous = state.rails[index]

      dispatch({ type: 'remove', collection: 'rails', id })

      try {
        await api.disconnectRail(id)
        dispatch({ type: 'confirm', collection: 'rails', id })
        toast.success(`${previous.name} disconnected`)
      } catch (error) {
        dispatch({ type: 'reinstate', collection: 'rails', id, record: previous, index, message: error.message })
        toast.error(`Could not disconnect rail: ${error.message}`)
        throw error
      }
    },
    [state.rails, toast],
  )

  const updateProfile = useCallback(
    async (payload) => {
      const previous = state.user
      dispatch({ type: 'profile/patch', patch: payload })
      try {
        const saved = await api.updateProfile(payload)
        dispatch({ type: 'profile/patch', patch: saved })
        toast.success('Profile updated')
        return saved
      } catch (error) {
        dispatch({ type: 'profile/restore', previous, message: error.message })
        toast.error(`Could not update profile: ${error.message}`)
        throw error
      }
    },
    [state.user, toast],
  )

  const user = state.user

  // ------------------------------------------------------------------ derived

  const cycle = cycleKey()
  const currency = user?.baseCurrency ?? 'NGN'

  const balance = useMemo(() => getBalance(state.transactions, currency), [state.transactions, currency])
  const flow = useMemo(
    () => getFlowTotals(state.transactions, { cycle, currency }),
    [state.transactions, cycle, currency],
  )
  const categoryTotals = useMemo(
    () => getCategoryTotals(state.transactions, { cycle, currency }),
    [state.transactions, cycle, currency],
  )
  const categoryBreakdown = useMemo(
    () => getCategoryBreakdown(state.transactions, { cycle, currency }),
    [state.transactions, cycle, currency],
  )
  const budgetViews = useMemo(
    () =>
      state.budgets.map((budget) => {
        const progress = getBudgetProgress(budget.allocated, categoryTotals[budget.category] ?? 0)
        return { ...budget, progress, state: getHealthState(progress.ratio) }
      }),
    [state.budgets, categoryTotals],
  )
  const policyAlerts = useMemo(
    () => getPolicyAlerts(state.budgets, categoryTotals),
    [state.budgets, categoryTotals],
  )
  const sweep = useMemo(() => {
    const autoSweep = state.budgets.find((budget) => budget.policy?.autoSweep?.enabled)
    if (!autoSweep) return { eligible: false, projectedSurplus: 0, swept: 0 }
    return getProjectedSweep(
      state.budgets.filter((budget) => budget.policy?.autoSweep?.enabled),
      categoryTotals,
      autoSweep.policy.autoSweep,
    )
  }, [state.budgets, categoryTotals])

  const value = useMemo(
    () => ({
      transactions: state.transactions,
      budgets: budgetViews,
      rawBudgets: state.budgets,
      milestones: state.milestones,
      rails: state.rails,
      user,
      isLoading: state.isLoading,
      error: state.error,
      pendingIds: state.pending,
      clearError: () => dispatch({ type: 'clearError' }),
      cycle,
      currency,
      // derived, never stored
      balance,
      flow,
      categoryTotals,
      categoryBreakdown,
      policyAlerts,
      sweep,
      // writes
      addTransaction,
      editTransaction,
      removeTransaction,
      upsertBudget,
      setBudgetLock,
      addMilestone,
      saveMilestone,
      connectRail,
      disconnectRail,
      updateProfile,
    }),
    [
      state.transactions,
      state.budgets,
      state.milestones,
      state.rails,
      state.isLoading,
      state.error,
      state.pending,
      user,
      cycle,
      currency,
      balance,
      flow,
      categoryTotals,
      categoryBreakdown,
      budgetViews,
      policyAlerts,
      sweep,
      addTransaction,
      editTransaction,
      removeTransaction,
      upsertBudget,
      setBudgetLock,
      addMilestone,
      saveMilestone,
      connectRail,
      disconnectRail,
      updateProfile,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used inside <DataProvider>')
  return context
}

export { DataContext }
