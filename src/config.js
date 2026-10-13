/**
 * Runtime configuration read from Vite env.
 *
 * The Google OAuth client ID is public (it ships in the browser bundle), so it is
 * safe to expose as a `VITE_` variable. Set it in `.env.local`:
 *
 *   GOOGLE_CLIENT_ID=1234567890-abcdef.apps.googleusercontent.com
 */
export const GOOGLE_CLIENT_ID = import.meta.env.GOOGLE_CLIENT_ID ?? ''

/** Google Identity Services is only usable once a client ID is configured. */
export const isGoogleAuthEnabled = Boolean(GOOGLE_CLIENT_ID)
