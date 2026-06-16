import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm md:px-6 md:py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl">
          <div className="mb-3 h-1 w-14 rounded-full bg-emerald-600" />
          <h1 className="text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">
            {title}
          </h1>

          {description && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {description}
            </p>
          )}
        </div>

        {action && (
          <div className="flex shrink-0 flex-wrap gap-2">
            {action}
          </div>
        )}
      </div>
    </div>
  )
}

export default PageHeader


