export default function BlackoutOverlay({ title, message }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-3 bg-background px-6 text-center text-text">
      <span className="text-5xl">🚫</span>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="max-w-md text-text-muted">{message}</p>
    </div>
  )
}
