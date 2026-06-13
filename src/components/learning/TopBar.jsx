import ProgressSync from './ProgressSync'

export default function TopBar({ courseTitle, moduleTitle, progressPct }) {
  return (
    <header className="flex flex-col gap-3 border-b border-border px-6 py-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm text-text-muted">
          {courseTitle} · <span className="text-text">{moduleTitle}</span>
        </p>
      </div>
      <div className="flex flex-col items-end gap-2 md:flex-row md:items-center md:gap-4">
        <ProgressSync />
        <div className="flex items-center gap-3">
          <div className="h-2 w-40 rounded-full bg-surface-hover">
            <div
              className="h-2 rounded-full bg-primary"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-sm text-text-muted">{progressPct}%</span>
        </div>
      </div>
    </header>
  )
}
