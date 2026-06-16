import type { ReactNode } from 'react'

interface PanelProps {
  title: string
  count?: number
  children: ReactNode
  className?: string
  helper?: string
}

function Panel({ title, count, children, className = '', helper }: PanelProps) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-white ${className}`}>
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            {title}
          </h2>

          {helper && (
            <p className="mt-1 text-sm leading-5 text-slate-500">
              {helper}
            </p>
          )}
        </div>

        {typeof count === 'number' && (
          <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
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
