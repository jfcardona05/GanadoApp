import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react'

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

function Alert({ type, message }: AlertProps) {
  const styles = {
    success: 'bg-emerald-50 text-emerald-900 border-emerald-200 ring-emerald-100',
    error: 'bg-red-50 text-red-900 border-red-200 ring-red-100',
    warning: 'bg-amber-50 text-amber-950 border-amber-200 ring-amber-100',
    info: 'bg-sky-50 text-sky-900 border-sky-200 ring-sky-100',
  }

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: TriangleAlert,
    info: Info,
  }

  const Icon = icons[type]

  return (
    <div className={`mb-4 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-sm ring-1 ${styles[type]}`}>
      <Icon className="mt-0.5 shrink-0" size={18} />
      <span className="leading-6">{message}</span>
    </div>
  )
}

export default Alert


