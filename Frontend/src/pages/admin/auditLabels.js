export const AUDIT_LABELS = {
  'user.suspend': 'Account suspended',
  'user.reinstate': 'Account reinstated',
  'user.role_change': 'Role changed',
  'user.kyc_tier_change': 'KYC tier changed',
  'category.create': 'Category created',
  'category.update': 'Category updated',
  'credential.rotate': 'Credential rotated',
}

export const AUDIT_TARGET_TYPES = ['user', 'category', 'rail', 'credential', 'system']

export const AUDIT_ACTIONS = Object.keys(AUDIT_LABELS)
