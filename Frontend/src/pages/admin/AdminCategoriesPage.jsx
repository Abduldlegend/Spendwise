import { useEffect, useState } from 'react'
import { Icon } from '../../components/ui/Button'
import CategoryBadge from '../../components/ui/CategoryBadge'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'
import { useCategories } from '../../context/CategoriesContext'
import { useToast } from '../../context/ToastContext'
import { CATEGORY_ACCENT_ROLES, CATEGORY_KINDS, CATEGORY_STATUSES } from '../../schemas/enums'
import { createAdminCategory, fetchAdminCategories, updateAdminCategory } from '../../services/api'
import { formatCount } from '../../utils/format'
import AdminPageHeader from './AdminPageHeader'

const EMPTY_FORM = {
  key: '',
  label: '',
  icon: 'category',
  accent: 'neutral-muted',
  kind: 'expense',
  status: 'enabled',
  sortOrder: 0,
  reason: '',
}

/** Runtime category taxonomy management. Keys are immutable once created. */
export default function AdminCategoriesPage() {
  const toast = useToast()
  const { refresh: refreshPublic } = useCategories()
  const [state, setState] = useState({ data: null, error: null })
  const [nonce, setNonce] = useState(0)
  const [editor, setEditor] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState(null)

  useEffect(() => {
    let active = true
    fetchAdminCategories()
      .then((rows) => {
        if (active) setState({ data: rows, error: null })
      })
      .catch((cause) => {
        if (active) setState((current) => ({ data: current.data, error: cause.message }))
      })
    return () => {
      active = false
    }
  }, [nonce])

  const rows = state.data ?? []
  const enabled = rows.filter((row) => row.status === 'enabled').length
  const income = rows.filter((row) => row.kind === 'income').length

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setFormError(null)
    setEditor({ mode: 'create' })
  }

  const openEdit = (row, overrides = {}) => {
    setForm({
      key: row.key,
      label: row.label,
      icon: row.icon,
      accent: row.accent,
      kind: row.kind,
      status: overrides.status ?? row.status,
      sortOrder: row.sortOrder,
      reason: '',
    })
    setFormError(null)
    setEditor({ mode: 'edit', row, toggling: Boolean(overrides.toggling) })
  }

  const closeEditor = () => {
    if (isSaving) return
    setEditor(null)
    setFormError(null)
  }

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const submit = async (event) => {
    event.preventDefault()
    if (!editor) return
    setIsSaving(true)
    setFormError(null)
    const payload = {
      label: form.label.trim(),
      icon: form.icon.trim(),
      accent: form.accent,
      kind: form.kind,
      status: form.status,
      sortOrder: Number(form.sortOrder) || 0,
      reason: form.reason.trim(),
    }
    try {
      if (editor.mode === 'create') {
        await createAdminCategory({ ...payload, key: form.key.trim().toLowerCase() })
        toast.success('Category created')
      } else {
        await updateAdminCategory(editor.row.key, payload)
        toast.success('Category updated')
      }
      setEditor(null)
      setNonce((value) => value + 1)
      refreshPublic()
    } catch (cause) {
      setFormError(cause.message)
    } finally {
      setIsSaving(false)
    }
  }

  const canSubmit =
    form.reason.trim().length >= 3 &&
    form.label.trim().length >= 2 &&
    form.icon.trim().length >= 1 &&
    (editor?.mode !== 'create' || /^[a-z][a-z0-9_]{0,31}$/.test(form.key.trim().toLowerCase()))

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4">
      <AdminPageHeader
        eyebrow="Runtime vocabulary"
        title="Category taxonomy"
        description="Every ledger and budget validates against these keys at write time. Keys are permanent; labels and status can change."
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand px-2.5 text-[11px] font-semibold text-fg-on-brand hover:bg-brand-hover"
          >
            <Icon name="add" className="text-[16px]" />
            New category
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Total keys" value={formatCount(rows.length)} />
        <Stat label="Enabled" value={formatCount(enabled)} />
        <Stat label="Income capabilities" value={formatCount(income)} />
      </div>

      {state.error && !state.data ? (
        <div className="rounded-md border border-negative-border bg-negative-subtle p-6 text-center">
          <Icon name="error" className="text-2xl text-negative-fg" />
          <p className="mt-2 text-sm font-semibold text-negative-fg">Taxonomy unavailable</p>
          <p className="mt-1 text-xs text-fg-muted">{state.error}</p>
          <button
            type="button"
            onClick={() => setNonce((value) => value + 1)}
            className="mt-4 inline-flex h-8 items-center rounded-md border border-hairline bg-card px-3 text-xs font-semibold text-fg hover:bg-hover"
          >
            Try again
          </button>
        </div>
      ) : !state.data ? (
        <Skeleton count={6} variant="row" />
      ) : (
        <>
          {state.error && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-negative-border bg-negative-subtle px-3 py-2 text-[11px] text-negative-fg">
              <span>{state.error}</span>
              <button
                type="button"
                onClick={() => setNonce((value) => value + 1)}
                className="font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          <div className="overflow-x-auto rounded-md border border-hairline bg-card">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-b border-hairline bg-surface-soft">
                  <Th>Category</Th>
                  <Th>Key</Th>
                  <Th>Direction</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Order</Th>
                  <Th>Origin</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline-soft">
                {rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-hover">
                    <td className="px-3 py-2.5">
                      <CategoryBadge category={row.key} meta={row} size="sm" />
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[10px] text-fg-muted">{row.key}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`font-mono text-[10px] font-semibold uppercase tracking-wider ${
                          row.kind === 'income' ? 'text-positive-fg' : 'text-fg-muted'
                        }`}
                      >
                        {row.kind}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => openEdit(row, { toggling: true, status: row.status === 'enabled' ? 'disabled' : 'enabled' })}
                        className={`inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider ${
                          row.status === 'enabled'
                            ? 'border-positive-border bg-positive-subtle text-positive-fg'
                            : 'border-hairline bg-surface-soft text-fg-muted'
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            row.status === 'enabled' ? 'bg-positive' : 'bg-fg-faint'
                          }`}
                        />
                        {row.status}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-[10px] tabular-nums text-fg-muted">
                      {row.sortOrder}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-fg-faint">
                        {row.isSystem ? 'System' : 'Custom'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="inline-flex h-7 items-center gap-1 rounded-sm border border-hairline px-2 text-[10px] font-semibold text-fg-muted hover:border-brand-border hover:text-brand-fg"
                      >
                        <Icon name="edit" className="text-[13px]" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="flex items-start gap-1.5 rounded-md border border-hairline bg-surface-soft px-3 py-2 text-[10px] leading-relaxed text-fg-muted">
            <Icon name="info" className="mt-px text-[13px] text-brand-fg" />
            Disabling a category blocks new posts and budgets. Existing rows keep their key and remain
            editable. System categories cannot change direction.
          </p>
        </>
      )}

      <Modal
        open={Boolean(editor)}
        onClose={closeEditor}
        title={editor?.mode === 'create' ? 'New category' : 'Edit category'}
        description={
          editor?.toggling
            ? 'Changing status requires an audit reason.'
            : 'Every change is written to the compliance audit trail.'
        }
        footer={
          <>
            <button
              type="button"
              onClick={closeEditor}
              disabled={isSaving}
              className="inline-flex h-9 items-center rounded-md border border-hairline px-3 text-xs font-semibold text-fg-muted hover:text-fg"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="category-form"
              disabled={isSaving || !canSubmit}
              className="inline-flex h-9 items-center rounded-md bg-brand px-3 text-xs font-semibold text-fg-on-brand hover:bg-brand-hover disabled:opacity-50"
            >
              {isSaving ? 'Saving…' : editor?.mode === 'create' ? 'Create category' : 'Save changes'}
            </button>
          </>
        }
      >
        <form id="category-form" onSubmit={submit} className="space-y-3">
          <div className="flex items-center gap-2 rounded-sm border border-hairline bg-surface-soft p-2">
            <span className="grid size-8 place-items-center rounded-sm bg-card text-fg-muted">
              <Icon name={form.icon || 'category'} className="text-[18px]" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">{form.label || 'Category preview'}</p>
              <p className="font-mono text-[9px] text-fg-faint">{form.key || 'new_key'}</p>
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-fg-faint">Key</span>
            <input
              value={form.key}
              onChange={(event) => setField('key', event.target.value)}
              disabled={editor?.mode === 'edit'}
              placeholder="e.g. insurance"
              className="h-9 w-full rounded-md border border-hairline bg-surface-soft px-2 font-mono text-xs text-fg placeholder:text-fg-faint focus:border-brand-border focus:outline-none disabled:opacity-60"
            />
            <span className="mt-1 block text-[9px] text-fg-faint">
              Lowercase letters, numbers and underscores. Immutable after creation.
            </span>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-fg-faint">Label</span>
              <input
                value={form.label}
                onChange={(event) => setField('label', event.target.value)}
                placeholder="Insurance & Cover"
                className="h-9 w-full rounded-md border border-hairline bg-surface-soft px-2 text-xs text-fg placeholder:text-fg-faint focus:border-brand-border focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-fg-faint">
                Material icon
              </span>
              <input
                value={form.icon}
                onChange={(event) => setField('icon', event.target.value)}
                placeholder="shield"
                className="h-9 w-full rounded-md border border-hairline bg-surface-soft px-2 font-mono text-xs text-fg placeholder:text-fg-faint focus:border-brand-border focus:outline-none"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-fg-faint">
                Direction
              </span>
              <select
                value={form.kind}
                onChange={(event) => setField('kind', event.target.value)}
                disabled={editor?.mode === 'edit' && editor.row.isSystem}
                className="h-9 w-full rounded-md border border-hairline bg-surface-soft px-2 text-xs text-fg focus:border-brand-border focus:outline-none disabled:opacity-60"
              >
                {CATEGORY_KINDS.map((kind) => (
                  <option key={kind} value={kind}>
                    {kind}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-fg-faint">
                Accent
              </span>
              <select
                value={form.accent}
                onChange={(event) => setField('accent', event.target.value)}
                className="h-9 w-full rounded-md border border-hairline bg-surface-soft px-2 text-xs text-fg focus:border-brand-border focus:outline-none"
              >
                {CATEGORY_ACCENT_ROLES.map((accent) => (
                  <option key={accent} value={accent}>
                    {accent}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-fg-faint">
                Status
              </span>
              <select
                value={form.status}
                onChange={(event) => setField('status', event.target.value)}
                className="h-9 w-full rounded-md border border-hairline bg-surface-soft px-2 text-xs text-fg focus:border-brand-border focus:outline-none"
              >
                {CATEGORY_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-fg-faint">
              Sort order
            </span>
            <input
              type="number"
              min={0}
              max={10000}
              value={form.sortOrder}
              onChange={(event) => setField('sortOrder', event.target.value)}
              className="h-9 w-full rounded-md border border-hairline bg-surface-soft px-2 font-mono text-xs text-fg focus:border-brand-border focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-fg-faint">
              Reason (required, audited)
            </span>
            <textarea
              value={form.reason}
              onChange={(event) => setField('reason', event.target.value)}
              rows={2}
              maxLength={280}
              placeholder="Why is this taxonomy change needed?"
              className="w-full rounded-md border border-hairline bg-surface-soft px-2.5 py-2 text-xs text-fg placeholder:text-fg-faint focus:border-brand-border focus:outline-none"
            />
          </label>

          {formError && (
            <p className="rounded-sm border border-negative-border bg-negative-subtle px-2.5 py-2 text-[11px] text-negative-fg">
              {formError}
            </p>
          )}
        </form>
      </Modal>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-md border border-hairline bg-card p-3">
      <p className="font-mono text-[9px] uppercase tracking-widest text-fg-faint">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
    </div>
  )
}

function Th({ children, className = '' }) {
  return (
    <th
      scope="col"
      className={`whitespace-nowrap px-3 py-2 font-mono text-[9px] font-medium uppercase tracking-widest text-fg-faint ${className}`}
    >
      {children}
    </th>
  )
}
