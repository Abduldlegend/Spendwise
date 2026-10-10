import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

/**
 * MSW browser worker. Vite serves the generated `public/mockServiceWorker.js`;
 * when it is absent (e.g. a fresh clone that skipped `msw init`) the app must
 * still boot, so startup failure degrades to "no interception" rather than a
 * blank screen.
 */
export const worker = setupWorker(...handlers)

export async function startMockApi() {
  try {
    await worker.start({
      onUnhandledRequest: 'bypass',
      quiet: true,
      serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
    })
    return true
  } catch (error) {
    console.warn('[vault] MSW failed to start; running without a mock API.', error)
    return false
  }
}

export { handlers }
