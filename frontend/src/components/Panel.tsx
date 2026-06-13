import type { ReactNode } from 'react'

interface PanelProps {
  title: string
  count?: number
  children: ReactNode
  className?: string
}

function Panel({ title, count, children, className = '' }: PanelProps) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-950">
          {title}
        </h2>

        {typeof count === 'number' && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            Total: {count}
          </span>
        )}
      </div>

      <div className="p-5">
        {children}
      </div>
    </section>
  )
}

export default Panel
