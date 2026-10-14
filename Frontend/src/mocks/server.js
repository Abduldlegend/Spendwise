import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/** Node-side MSW server for tests. Never imported by application code. */
export const server = setupServer(...handlers)
