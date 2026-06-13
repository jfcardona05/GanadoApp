import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'green' | 'red' | 'yellow' | 'blue' | 'gray'
  className?: string
}

function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  const styles = {
    green: 'bg-green-50 text-green-700 ring-green-200',
    red: 'bg-red-50 text-red-700 ring-red-200',
    yellow: 'bg-yellow-50 text-yellow-800 ring-yellow-200',
    blue: 'bg-blue-50 text-blue-700 ring-blue-200',
    gray: 'bg-slate-100 text-slate-700 ring-slate-200',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles[variant]} ${className}`}>
      {children}
    </span>
  )
}

export default Badge
