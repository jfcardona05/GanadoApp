import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="relative mb-6 overflow-hidden rounded-[1.75rem] border border-emerald-950/10 bg-[#fff8ec]/95 px-5 py-5 shadow-lg shadow-emerald-950/10 ring-1 ring-white/70 md:px-6 md:py-6">
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-gradient-to-l from-emerald-100 via-[#ead7bd]/60 to-transparent md:block" />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="max-w-3xl">
        <div className="mb-3 h-1 w-14 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-700" />
        <h1 className="text-2xl font-bold tracking-normal text-emerald-950 md:text-3xl">
          {title}
        </h1>

        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-950/70">
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
