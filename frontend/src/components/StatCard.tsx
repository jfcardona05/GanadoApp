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
    green: 'bg-green-50 text-green-700 ring-green-200',
    red: 'bg-red-50 text-red-700 ring-red-200',
    yellow: 'bg-yellow-50 text-yellow-800 ring-yellow-200',
    blue: 'bg-blue-50 text-blue-700 ring-blue-200',
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>
          <div className="mt-2 text-2xl font-bold text-slate-950">
            {value}
          </div>
        </div>

        {icon && (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ${tones[tone]}`}>
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
