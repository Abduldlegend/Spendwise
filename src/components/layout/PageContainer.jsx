/**
 * Page shell: the content well that holds a page's grid.
 *
 * Structural only. Owns the responsive max width and vertical rhythm so every
 * page lines up without repeating container utilities.
 *
 * @param {object} props
 * @param {string} [props.title] visually hidden page heading
 * @param {'sm'|'md'|'lg'} [props.width='lg'] content well width
 * @param {import('react').ReactNode} props.children
 */
export default function PageContainer({ title, width = 'lg', children }) {
  const widths = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
  }

  return (
    <main className={`w-full ${widths[width] ?? widths.lg} px-4 py-6 sm:px-6 sm:py-8`}>
      {title && <h2 className="sr-only">{title}</h2>}
      {children}
    </main>
  )
}
