export default function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface p-6 ${className}`}
    >
      {children}
    </div>
  )
}
