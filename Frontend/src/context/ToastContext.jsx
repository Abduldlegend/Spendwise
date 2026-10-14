import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const ToastContext = createContext(null)

/** @param {string} message @param {'success'|'error'|'info'} tone */
function toDetail(message, tone) {
  if (typeof message === 'string') return { message, tone }
  return {
    message: message?.message ?? 'Something went wrong',
    tone: message?.tone ?? 'error',
  }
}

/**
 * Toast provider.
 *
 * Lives outside the data context because AGENTS.md step 5 requires every failed
 * write action to surface an error through the `Toast` component.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const toast = useCallback(
    (input, options = {}) => {
      const { message, tone } = toDetail(input, options.tone)
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts((current) => [...current, { id, message, tone }])
      const timer = setTimeout(() => dismiss(id), options.duration ?? 5000)
      timers.current.set(id, timer)
      return id
    },
    [dismiss],
  )

  const value = useMemo(
    () => ({
      toasts,
      toast,
      dismiss,
      success: (message) => toast(message, { tone: 'success' }),
      error: (message) => toast(message, { tone: 'error' }),
      info: (message) => toast(message, { tone: 'info' }),
    }),
    [toasts, toast, dismiss],
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside <ToastProvider>')
  return context
}

export { ToastContext }
