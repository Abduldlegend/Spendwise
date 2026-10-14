/**
 * Loading placeholder.
 *
 * Dimensions are expressed as Tailwind classes by the caller (there is no
 * inline style anywhere in this component) — pass e.g. `className="h-28"`.
 *
 * @param {object} props
 * @param {'text'|'card'|'row'|'circle'} [props.variant='text']
 * @param {number} [props.count=1] render several stacked lines
 * @param {string} [props.className] dimensions for each block
 * @param {string} [props.itemClassName] extra classes per block, e.g. widths
 */
export default function Skeleton({ variant = 'text', count = 1, className = '', itemClassName = '' }) {
  const shapes = {
    text: 'h-3 rounded-md',
    card: 'h-28 rounded-xl',
    row: 'h-12 rounded-xl',
    circle: 'size-10 rounded-full',
  }
  const shape = shapes[variant] ?? shapes.text

  return (
    <span aria-hidden="true" className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: Math.max(1, count) }).map((_, index) => (
        <span
          key={index}
          className={`block animate-pulse bg-track motion-reduce:animate-none ${shape} ${itemClassName}`}
        />
      ))}
    </span>
  )
}
