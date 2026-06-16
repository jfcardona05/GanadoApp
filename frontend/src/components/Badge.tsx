import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'green' | 'red' | 'yellow' | 'blue' | 'gray'
  className?: string
}

function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  const styles = {
    green: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    red: 'bg-red-50 text-red-800 ring-red-200',
    yellow: 'bg-amber-50 text-amber-900 ring-amber-200',
    blue: 'bg-sky-50 text-sky-800 ring-sky-200',
    gray: 'bg-slate-100 text-slate-700 ring-slate-200',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ring-1 ${styles[variant]} ${className}`}>
      {children}
    </span>
  )
}

export default Badge


