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
    'inline-flex items-center justify-center gap-2 rounded-lg border text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-green-600/30 disabled:cursor-not-allowed disabled:opacity-50'

  const variants = {
    primary: 'border-green-700 bg-green-700 text-white hover:bg-green-800',
    secondary: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
    danger: 'border-red-600 bg-red-600 text-white hover:bg-red-700',
    outline: 'border-slate-300 bg-transparent text-slate-700 hover:bg-slate-100',
    ghost: 'border-transparent bg-transparent text-slate-600 shadow-none hover:bg-slate-100 hover:text-slate-900',
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
