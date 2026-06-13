const VARIANTS = {
  primary:
    'bg-primary text-background hover:bg-primary-hover focus-visible:outline-primary',
  secondary:
    'bg-surface text-text border border-border hover:bg-surface-hover focus-visible:outline-text-muted',
  ghost:
    'bg-transparent text-text-muted hover:text-text focus-visible:outline-text-muted',
}

export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold transition-colors outline-offset-2 focus-visible:outline-2 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
