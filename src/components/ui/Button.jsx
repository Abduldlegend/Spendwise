/**
 * Button primitives.
 *
 * Kept as plain class maps so Tailwind's scanner sees every literal, and so a
 * button is never restyled at the call site.
 */

const VARIANTS = {
  primary: 'bg-brand text-fg-on-brand hover:bg-brand-hover active:bg-brand-hover',
  secondary: 'border border-hairline bg-card text-fg hover:bg-hover active:bg-hover',
  subtle: 'bg-hover text-fg hover:bg-track active:bg-track',
  danger: 'bg-negative text-white hover:brightness-110',
  ghost: 'text-fg-muted hover:bg-hover hover:text-fg',
}

const SIZES = {
  sm: 'h-8 gap-1.5 px-2.5 text-xs rounded-lg',
  md: 'h-10 gap-2 px-3.5 text-sm rounded-lg',
  lg: 'h-12 gap-2 px-5 text-sm rounded-xl',
  icon: 'size-9 rounded-lg',
}

/** @param {object} props */
export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  type = 'button',
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      className={`inline-flex shrink-0 items-center justify-center font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant] ?? VARIANTS.secondary} ${SIZES[size] ?? SIZES.md} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

/**
 * Material Symbols glyph.
 * @param {object} props
 * @param {string} props.name
 * @param {string} [props.className]
 */
export function Icon({ name, className = 'text-lg' }) {
  return (
    <span aria-hidden="true" className={`material-symbols-outlined ${className}`}>
      {name}
    </span>
  )
}
