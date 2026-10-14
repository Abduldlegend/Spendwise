/**
 * Reducer for all persisted resources.
 *
 * The optimistic-update contract from AGENTS.md lives here:
 *   insert -> reconcile(tempId -> serverId)  |  rollback(drop tempId)
 *   patch  -> reconcile                       |  restore previous snapshot
 *   remove -> reinsert at original index      |  keep the row untouched
 *
 * Nothing derived (balance, spend, progress) appears in this state — those are
 * computed with `useMemo` in the provider.
 */

/** @typedef {'transactions'|'budgets'|'milestones'|'rails'} Collection */

export const initialState = {
  transactions: [],
  budgets: [],
  milestones: [],
  rails: [],
  user: null,
  isLoading: true,
  /** False until the cache (or the API) has delivered real data. */
  hydrated: false,
  error: null,
  /** Ids currently awaiting server confirmation, for row-level spinners. */
  pending: [],
}

export function dataReducer(state, action) {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }

    case 'error':
      return { ...state, isLoading: false, error: action.message ?? 'Something went wrong' }

    case 'clearError':
      return { ...state, error: null }

    // Signed out (or switching accounts): drop every row so the next user never
    // sees the previous account's data, even for a single frame.
    case 'reset':
      return { ...initialState, isLoading: false, hydrated: false }

    case 'hydrate':
      return {
        ...state,
        isLoading: false,
        hydrated: true,
        error: null,
        transactions: action.transactions ?? state.transactions,
        budgets: action.budgets ?? state.budgets,
        milestones: action.milestones ?? state.milestones,
        rails: action.rails ?? state.rails,
        user: action.user ?? state.user,
      }

    case 'insert':
      return {
        ...state,
        [action.collection]: [action.record, ...state[action.collection]],
        pending: [...state.pending, action.record.id],
      }

    case 'reconcile': {
      const list = state[action.collection]
      const index = list.findIndex((row) => row.id === action.tempId)
      if (index === -1) {
        // Server rejected nothing — the temp row vanished. Re-add by server id
        // so the write is never silently lost.
        return {
          ...state,
          [action.collection]: list.some((row) => row.id === action.record.id)
            ? list
            : [action.record, ...list],
          pending: state.pending.filter((id) => id !== action.tempId),
        }
      }
      const next = [...list]
      // Preserve the optimistic position rather than jumping to the top.
      next[index] = { ...action.record, pending: false }
      return {
        ...state,
        [action.collection]: next,
        pending: state.pending.filter((id) => id !== action.tempId),
      }
    }

    case 'discard': {
      const list = state[action.collection]
      const previousIndex = list.findIndex((row) => row.id === action.tempId)
      return {
        ...state,
        [action.collection]: previousIndex === -1 ? list : list.filter((row) => row.id !== action.tempId),
        pending: state.pending.filter((id) => id !== action.tempId),
        error: action.message ?? state.error,
      }
    }

    case 'patch':
      return {
        ...state,
        [action.collection]: state[action.collection].map((row) =>
          row.id === action.id ? { ...row, ...action.patch, pending: true } : row,
        ),
        pending: state.pending.includes(action.id) ? state.pending : [...state.pending, action.id],
      }

    case 'restore':
      return {
        ...state,
        [action.collection]: state[action.collection].map((row) =>
          row.id === action.id ? { ...action.previous, pending: false } : row,
        ),
        pending: state.pending.filter((id) => id !== action.id),
        error: action.message ?? state.error,
      }

    case 'remove': {
      const list = state[action.collection]
      return {
        ...state,
        [action.collection]: list.filter((row) => row.id !== action.id),
        pending: state.pending.includes(action.id) ? state.pending : [...state.pending, action.id],
      }
    }

    case 'reinstate':
      return {
        ...state,
        [action.collection]: [
          ...state[action.collection].slice(0, action.index).concat(action.record),
          ...state[action.collection].slice(action.index),
        ],
        pending: state.pending.filter((id) => id !== action.id),
        error: action.message ?? state.error,
      }

    case 'confirm':
      return {
        ...state,
        [action.collection]: state[action.collection].map((row) =>
          row.id === action.id ? { ...row, pending: false } : row,
        ),
        pending: state.pending.filter((id) => id !== action.id),
      }

    // The profile is a scalar, not a collection, so it needs its own actions
    // rather than the array-based cases above.
    case 'profile/patch':
      return { ...state, user: { ...state.user, ...action.patch } }

    case 'profile/restore':
      return { ...state, user: action.previous, error: action.message ?? state.error }

    default:
      return state
  }
}
