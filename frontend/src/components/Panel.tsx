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
    <section className={`overflow-hidden rounded-[1.75rem] border border-emerald-950/10 bg-[#fff8ec]/95 shadow-lg shadow-emerald-950/10 ring-1 ring-white/70 ${className}`}>
      <div className="flex flex-col gap-3 border-b border-emerald-950/10 bg-gradient-to-r from-[#fff8ec] via-emerald-50 to-emerald-100/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-emerald-950">
            {title}
          </h2>

          {helper && (
            <p className="mt-1 text-sm leading-5 text-emerald-950/60">
              {helper}
            </p>
          )}
        </div>

        {typeof count === 'number' && (
          <span className="w-fit rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
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
