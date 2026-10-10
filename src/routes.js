/**
 * The application's route table.
 *
 * Kept out of `AuthenticatedLayout.jsx` so that module exports only components —
 * mixing a component and a constant breaks React Fast Refresh.
 */
export const NAV_LINKS = [
  {
    to: '/',
    label: 'Overview',
    icon: 'space_dashboard',
    title: 'Personal Financial Overview',
    description: 'Consolidated treasury & multi-rail spending ledger',
  },
  {
    to: '/transactions',
    label: 'Transactions',
    icon: 'receipt_long',
    title: 'Transaction Ledger & Rails',
    description: 'Synchronized multi-bank transaction registry and search',
  },
  {
    to: '/budgets',
    label: 'Budgets',
    icon: 'donut_large',
    title: 'Budgets & Liquidity Caps',
    description: 'Category constraints, daily burn cadence, and goal reserves',
  },
  {
    to: '/milestones',
    label: 'Milestones',
    icon: 'flag',
    title: 'Savings Milestones & Reserves',
    description: 'Long-horizon goals with a projected completion date',
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: 'settings',
    title: 'Account Settings & Integrations',
    description: 'Security parameters, display currencies, and open banking rails',
  },
]

/**
 * Resolves the header metadata for a pathname, falling back to the app title.
 *
 * @param {string} pathname
 * @returns {{ title: string, description: string }}
 */
export function getPageMeta(pathname) {
  const link = NAV_LINKS.find((entry) => entry.to === pathname)
  return {
    title: link?.title ?? 'Vault',
    description: link?.description ?? 'Personal finance & liquidity rails',
  }
}
