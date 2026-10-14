import { Link } from 'react-router-dom'

const SIZES = {
  sm: { box: 'size-8 rounded-lg text-base', word: 'text-lg' },
  md: { box: 'size-10 rounded-xl text-xl', word: 'text-xl' },
}

/**
 * SpendWise logotype: a monogram tile plus wordmark, optionally with the
 * "LEDGER v2.0" release badge.
 *
 * Shared by the marketing landing page and the authenticated app chrome so the
 * brand mark is identical everywhere. Purely presentational — it takes no data
 * and reads no Context.
 *
 * @param {object} props
 * @param {'sm'|'md'} [props.size='sm']
 * @param {boolean} [props.withBadge=false]
 * @param {boolean} [props.link=true] wrap in a link
 * @param {string} [props.to='/'] link target when `link` is true
 */
export default function BrandMark({ size = 'sm', withBadge = false, link = true, to = '/' }) {
  const scale = SIZES[size] ?? SIZES.sm

  const content = (
    <span className="group flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className={`grid place-items-center bg-brand font-mono font-bold text-fg-on-brand transition-colors group-hover:bg-brand-hover ${scale.box}`}
      >
        S
      </span>
      <span className="flex items-center gap-2">
        <span className={`font-semibold tracking-tight text-fg ${scale.word}`}>SpendWise</span>
        {withBadge && (
          <span className="hidden rounded border border-hairline bg-surface-soft px-1.5 py-0.5 font-mono text-[10px] font-medium text-fg-muted sm:inline-flex">
            LEDGER v2.0
          </span>
        )}
      </span>
    </span>
  )

  if (!link) return content
  return (
    <Link to={to} aria-label="SpendWise — home" className="shrink-0">
      {content}
    </Link>
  )
}
