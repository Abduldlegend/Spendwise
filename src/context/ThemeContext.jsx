import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { THEME_SCHEMA } from '../schemas/enums'
import { load, save, STORAGE_KEYS } from '../utils/storage'

const ThemeContext = createContext(null)

/** @param {string} preference @returns {'light'|'dark'} */
function resolve(preference) {
  if (preference === 'light' || preference === 'dark') return preference
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Theme provider.
 *
 * AGENTS.md: "Theme toggling is local + localStorage only — never sent to an API
 * in v1." Dark is the default for a visitor with no saved preference; the
 * `system` preference follows the OS and reacts to live changes.
 */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const stored = load(STORAGE_KEYS.theme, 'dark')
    const parsed = THEME_SCHEMA.safeParse(stored)
    return parsed.success ? parsed.data : 'dark'
  })

  const resolved = resolve(theme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', resolved === 'dark')
    root.style.colorScheme = resolved
  }, [resolved])

  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined' || !window.matchMedia) return
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setThemeState('system')
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [theme])

  const setTheme = useCallback((next) => {
    const parsed = THEME_SCHEMA.safeParse(next)
    if (!parsed.success) return
    setThemeState(parsed.data)
    save(STORAGE_KEYS.theme, parsed.data)
  }, [])

  const toggle = useCallback(() => {
    setTheme(resolve(theme) === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  const value = useMemo(
    () => ({ theme, resolvedTheme: resolved, setTheme, toggle }),
    [theme, resolved, setTheme, toggle],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside <ThemeProvider>')
  return context
}

export { ThemeContext }
