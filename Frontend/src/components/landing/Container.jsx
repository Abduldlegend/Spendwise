/**
 * Landing content well.
 *
 * Mirrors the reference's `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` rhythm so
 * every section aligns without repeating the utilities.
 *
 * @param {object} props
 * @param {string} [props.className]
 * @param {import('react').ReactNode} props.children
 */
export default function Container({ className = '', children }) {
  return <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
}
