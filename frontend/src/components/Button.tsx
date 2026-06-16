import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
  size?: 'sm' | 'md'
  icon?: ReactNode
}

function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 rounded-xl border text-sm font-semibold shadow-sm transition duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-600/15 disabled:cursor-not-allowed disabled:opacity-50'

  const variants = {
    primary: 'border-emerald-700 bg-emerald-700 text-white shadow-emerald-900/15 hover:-translate-y-0.5 hover:bg-emerald-800',
    secondary: 'border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900',
    danger: 'border-red-600 bg-red-600 text-white shadow-red-900/15 hover:-translate-y-0.5 hover:bg-red-700',
    outline: 'border-emerald-200 bg-white text-emerald-800 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50',
    ghost: 'border-transparent bg-transparent text-slate-600 shadow-none hover:bg-slate-100/80 hover:text-slate-950',
  }

  const sizes = {
    sm: 'px-3 py-2',
    md: 'px-4 py-2.5',
  }

  return (
    <button
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  )
}

export default Button


