/**
 * Runtime configuration read from Vite env.
 *
 * Values here are public (they ship in the browser bundle), so they are safe to
 * expose as `VITE_` variables. Set them in `.env.local`:
 *
 *   VITE_GOOGLE_CLIENT_ID=1234567890-abcdef.apps.googleusercontent.com
 *   VITE_API_BASE_URL=http://localhost:4000/api/v1
 */
export const VITE_GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

/** Google Identity Services is only usable once a client ID is configured. */
export const isGoogleAuthEnabled = Boolean(VITE_GOOGLE_CLIENT_ID)

/**
 * Base URL of the real backend. When unset, the app falls back to the bundled
 * MSW mock API at `/api`, so local development and tests work with zero setup.
 */
export const VITE_API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')

export const API_BASE_URL = VITE_API_BASE_URL || '/api'

/** The MSW mock is the default; a configured API base URL disables it. */
export const isMockApiEnabled = !VITE_API_BASE_URL
