import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as api from '../services/api'
import { DEFAULT_CATEGORY_RECORDS, indexCategories } from '../utils/categories'

const CategoriesContext = createContext(null)

const INITIAL = {
  categories: DEFAULT_CATEGORY_RECORDS,
  isLoading: true,
  error: null,
}

/**
 * Runtime category taxonomy.
 *
 * Categories are public data (no account scope), so this provider loads once at
 * mount, before any page needs it. It starts from the seeded defaults so forms
 * remain usable while the request is in flight, and falls back to them on error
 * rather than leaving the ledger without a vocabulary.
 */
export function CategoriesProvider({ children }) {
  const [state, setState] = useState(INITIAL)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    api
      .fetchCategories()
      .then((rows) => {
        if (!active) return
        const categories = Array.isArray(rows) && rows.length > 0 ? rows : DEFAULT_CATEGORY_RECORDS
        setState({ categories, isLoading: false, error: null })
      })
      .catch((error) => {
        if (!active) return
        setState({ categories: DEFAULT_CATEGORY_RECORDS, isLoading: false, error: error.message })
      })
    return () => {
      active = false
    }
  }, [reloadKey])

  const refresh = useCallback(() => setReloadKey((key) => key + 1), [])

  const value = useMemo(() => {
    const enabled = state.categories.filter((category) => category.status !== 'disabled')
    return {
      categories: state.categories,
      enabled,
      expense: enabled.filter((category) => category.kind === 'expense'),
      income: enabled.filter((category) => category.kind === 'income'),
      byKey: indexCategories(state.categories),
      isLoading: state.isLoading,
      error: state.error,
      refresh,
    }
  }, [state, refresh])

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>
}

export function useCategories() {
  const context = useContext(CategoriesContext)
  if (!context) throw new Error('useCategories must be used inside <CategoriesProvider>')
  return context
}

export { CategoriesContext }
