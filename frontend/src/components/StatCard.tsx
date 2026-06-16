import type { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: ReactNode
  icon?: ReactNode
  tone?: 'green' | 'red' | 'yellow' | 'blue' | 'slate'
  helper?: string
}

function StatCard({ title, value, icon, tone = 'green', helper }: StatCardProps) {
  const tones = {
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    red: 'bg-red-50 text-red-700 ring-red-200',
    yellow: 'bg-amber-50 text-amber-800 ring-amber-200',
    blue: 'bg-sky-50 text-sky-700 ring-sky-200',
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  }

  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 text-sm font-semibold text-slate-500">
          {title}
        </p>

        {icon && (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 ${tones[tone]}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 min-w-0 overflow-hidden text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-3xl">
        <span className="block truncate tabular-nums" title={typeof value === 'string' ? value : undefined}>
          {value}
        </span>
      </div>

      {helper && (
        <p className="mt-3 text-xs text-slate-500">
          {helper}
        </p>
      )}
    </div>
  )
}

export default StatCard
