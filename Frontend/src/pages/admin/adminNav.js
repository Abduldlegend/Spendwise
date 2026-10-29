/**
 * Ops Console navigation and screen metadata.
 *
 * Kept beside the shell (not in `routes.js`) because the admin console is a
 * separate surface with its own information architecture and wording.
 */
export const ADMIN_NAV = [
  {
    to: '/admin',
    label: 'Platform Overview',
    icon: 'dashboard',
    end: true,
    title: 'System Performance & Aggregate Telemetry',
    description: 'High-level anonymized operations across all liquidity zones.',
  },
  {
    to: '/admin/users',
    label: 'User Accounts',
    icon: 'group',
    title: 'User Accounts Directory',
    description: 'Macro account metadata, KYC tiers and suspension controls.',
  },
  {
    to: '/admin/analytics',
    label: 'Aggregate Telemetry',
    icon: 'analytics',
    title: 'Platform Telemetry',
    description: 'Aggregate ledger activity with no access to individual rows.',
  },
  {
    to: '/admin/categories',
    label: 'Category Taxonomy',
    icon: 'category',
    title: 'Category Taxonomy',
    description: 'Manage the runtime category vocabulary used by every ledger.',
  },
  {
    to: '/admin/audit',
    label: 'Compliance Audit Log',
    icon: 'shield',
    title: 'Immutable Audit Log',
    description: 'Every privileged action, actor, target and reason.',
  },
  {
    to: '/admin/settings',
    label: 'Currencies & Rails',
    icon: 'currency_exchange',
    title: 'Currencies & Rails',
    description: 'Settlement currency and clearing-rail health.',
  },
]

export const ADMIN_SECURITY_NAV = [
  {
    to: '/admin/gateway',
    label: 'Sign-in Gateway',
    icon: 'lock',
    title: 'Staff Sign-in Gateway',
    description: 'Session, role and hardware-token posture for this console.',
  },
  {
    to: '/admin/states',
    label: 'Access & Error States',
    icon: 'warning',
    title: 'Access & Error States',
    description: '403, 404 and degraded-service presentation standards.',
  },
]

const ALL_SCREENS = [...ADMIN_NAV, ...ADMIN_SECURITY_NAV]

/**
 * @param {string} pathname
 * @returns {{ title: string, description: string }}
 */
export function getAdminMeta(pathname) {
  if (pathname.startsWith('/admin/users/')) {
    return {
      title: 'User Detail & KYC',
      description: 'Per-account metadata, limits and privileged actions.',
    }
  }

  const match = [...ALL_SCREENS]
    .sort((a, b) => b.to.length - a.to.length)
    .find((screen) => (screen.end ? pathname === screen.to : pathname.startsWith(screen.to)))

  return {
    title: match?.title ?? 'Ops Console',
    description: match?.description ?? 'SpendWise internal operations',
  }
}

export const LIVE_API_HINT = 'http://localhost:4000/api/v1'
