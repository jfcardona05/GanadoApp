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
    <div className="rounded-[1.75rem] border border-emerald-950/10 bg-[#fff8ec]/95 p-5 shadow-lg shadow-emerald-950/10 ring-1 ring-white/70 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-emerald-950/15">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-emerald-950/60">
            {title}
          </p>
          <div className="mt-2 text-3xl font-bold text-emerald-950">
            {value}
          </div>
        </div>

        {icon && (
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ${tones[tone]}`}>
            {icon}
          </div>
        )}
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
