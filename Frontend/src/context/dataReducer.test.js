import { describe, expect, it } from 'vitest'
import { dataReducer, initialState } from './dataReducer'

const record = (id, overrides = {}) => ({
  id,
  type: 'expense',
  amount: 1000,
  currency: 'NGN',
  category: 'food',
  description: 'Test',
  note: '',
  railId: 'rail_zenith',
  railName: 'Zenith Bank',
  occurredAt: '2026-09-14T12:00:00.000Z',
  createdAt: '2026-09-14T12:00:00.000Z',
  ...overrides,
})

const hydrated = {
  ...initialState,
  isLoading: false,
  hydrated: true,
  transactions: [record('a'), record('b')],
}

describe('dataReducer — hydration', () => {
  it('marks itself hydrated and stops loading', () => {
    const state = dataReducer(initialState, { type: 'hydrate', transactions: [record('a')] })
    expect(state.hydrated).toBe(true)
    expect(state.isLoading).toBe(false)
    expect(state.transactions).toHaveLength(1)
  })

  it('records an error without discarding existing data', () => {
    const state = dataReducer(hydrated, { type: 'error', message: 'boom' })
    expect(state.error).toBe('boom')
    expect(state.isLoading).toBe(false)
    expect(state.transactions).toHaveLength(2)
  })
})

describe('dataReducer — optimistic create', () => {
  it('prepends the temp record and marks it pending', () => {
    const state = dataReducer(hydrated, {
      type: 'insert',
      collection: 'transactions',
      record: { ...record('temp_1'), pending: true },
    })
    expect(state.transactions[0].id).toBe('temp_1')
    expect(state.pending).toContain('temp_1')
  })

  it('reconciles the temp id in place, preserving position', () => {
    const inserted = dataReducer(hydrated, {
      type: 'insert',
      collection: 'transactions',
      record: { ...record('temp_1'), pending: true },
    })
    const state = dataReducer(inserted, {
      type: 'reconcile',
      collection: 'transactions',
      tempId: 'temp_1',
      record: record('srv_1'),
    })

    expect(state.transactions.map((row) => row.id)).toEqual(['srv_1', 'a', 'b'])
    expect(state.pending).not.toContain('temp_1')
  })

  it('rolls back by discarding the temp record and surfacing the error', () => {
    const inserted = dataReducer(hydrated, {
      type: 'insert',
      collection: 'transactions',
      record: { ...record('temp_1'), pending: true },
    })
    const state = dataReducer(inserted, {
      type: 'discard',
      collection: 'transactions',
      tempId: 'temp_1',
      message: 'Server said no',
    })

    expect(state.transactions.map((row) => row.id)).toEqual(['a', 'b'])
    expect(state.pending).not.toContain('temp_1')
    expect(state.error).toBe('Server said no')
  })

  it('still writes the server record when the temp row is missing', () => {
    const state = dataReducer(hydrated, {
      type: 'reconcile',
      collection: 'transactions',
      tempId: 'temp_gone',
      record: record('srv_1'),
    })
    expect(state.transactions.map((row) => row.id)).toEqual(['srv_1', 'a', 'b'])
  })
})

describe('dataReducer — optimistic update', () => {
  it('patches the row and flags it pending', () => {
    const state = dataReducer(hydrated, {
      type: 'patch',
      collection: 'transactions',
      id: 'a',
      patch: { amount: 2500 },
    })
    expect(state.transactions[0].amount).toBe(2500)
    // the untouched row keeps its original amount
    expect(state.transactions[1].amount).toBe(1000)
    expect(state.pending).toContain('a')
  })

  it('clears the pending flag on confirm', () => {
    const patched = dataReducer(hydrated, {
      type: 'patch',
      collection: 'transactions',
      id: 'a',
      patch: { amount: 2500 },
    })
    const state = dataReducer(patched, { type: 'confirm', collection: 'transactions', id: 'a' })
    expect(state.transactions[0].pending).toBe(false)
    expect(state.pending).not.toContain('a')
  })

  it('restores the previous snapshot on failure', () => {
    const patched = dataReducer(hydrated, {
      type: 'patch',
      collection: 'transactions',
      id: 'a',
      patch: { amount: 2500 },
    })
    const state = dataReducer(patched, {
      type: 'restore',
      collection: 'transactions',
      id: 'a',
      previous: record('a'),
      message: 'nope',
    })
    expect(state.transactions[0].amount).toBe(1000)
    expect(state.error).toBe('nope')
  })
})

describe('dataReducer — optimistic delete', () => {
  it('removes the row optimistically', () => {
    const state = dataReducer(hydrated, { type: 'remove', collection: 'transactions', id: 'a' })
    expect(state.transactions.map((row) => row.id)).toEqual(['b'])
  })

  it('reinserts at the original index when the delete fails', () => {
    const removed = dataReducer(hydrated, { type: 'remove', collection: 'transactions', id: 'a' })
    const state = dataReducer(removed, {
      type: 'reinstate',
      collection: 'transactions',
      id: 'a',
      record: record('a'),
      index: 0,
      message: 'locked',
    })
    expect(state.transactions.map((row) => row.id)).toEqual(['a', 'b'])
    expect(state.error).toBe('locked')
  })
})

describe('dataReducer — profile', () => {
  it('merges a profile patch', () => {
    const state = dataReducer(
      { ...hydrated, user: { name: 'Damilola', baseCurrency: 'NGN' } },
      { type: 'profile/patch', patch: { name: 'Ade' } },
    )
    expect(state.user).toEqual({ name: 'Ade', baseCurrency: 'NGN' })
  })

  it('restores the previous profile on failure', () => {
    const state = dataReducer(
      { ...hydrated, user: { name: 'Damilola' } },
      { type: 'profile/restore', previous: { name: 'Damilola' }, message: 'nope' },
    )
    expect(state.user.name).toBe('Damilola')
    expect(state.error).toBe('nope')
  })
})

describe('dataReducer — invariants', () => {
  it('ignores an unknown action', () => {
    expect(dataReducer(hydrated, { type: 'nope' })).toBe(hydrated)
  })

  it('never stores a derived field on a transaction', () => {
    const state = dataReducer(hydrated, {
      type: 'insert',
      collection: 'transactions',
      record: { ...record('temp_1'), pending: true },
    })
    for (const row of state.transactions) {
      expect(row).not.toHaveProperty('balance')
      expect(row).not.toHaveProperty('runningTotal')
    }
  })
})
