import { ArrowRight, Inbox } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-emerald-300 bg-gradient-to-br from-emerald-50 via-[#fff8ec] to-[#ead7bd] px-6 py-10 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200 bg-[#fff8ec] text-emerald-700 shadow-sm">
        <Inbox size={22} />
      </div>

      <h3 className="text-base font-semibold text-emerald-950">
        {title}
      </h3>

      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mx-auto mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-green-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:from-emerald-500 hover:to-green-700"
        >
          {actionLabel}
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  )
}

export default EmptyState
