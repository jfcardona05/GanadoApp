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
    primary: 'border-emerald-700 bg-gradient-to-br from-emerald-500 to-emerald-800 text-white shadow-emerald-900/20 hover:-translate-y-0.5 hover:from-emerald-400 hover:to-emerald-700',
    secondary: 'border-emerald-950/10 bg-[#fff8ec] text-emerald-950 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900',
    danger: 'border-red-600 bg-gradient-to-br from-red-600 to-red-700 text-white shadow-red-900/15 hover:-translate-y-0.5 hover:from-red-500 hover:to-red-700',
    outline: 'border-emerald-200 bg-white/70 text-emerald-800 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50',
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
