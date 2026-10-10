import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { webcrypto } from 'node:crypto'

afterEach(() => {
  cleanup()
})

// jsdom does not implement Web Crypto's subtle API in all cases; Node provides it.
if (!globalThis.crypto?.subtle) {
  globalThis.crypto = webcrypto
}
if (typeof window !== 'undefined' && !window.crypto?.subtle) {
  try {
    window.crypto = webcrypto
  } catch {
    // ignore if read-only
  }
}

// jsdom does not implement matchMedia, which ThemeContext relies on for the
// "system" theme option.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })
}
