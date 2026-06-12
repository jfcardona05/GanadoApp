interface EmptyStateProps {
  title: string
  description?: string
}

function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
      <h3 className="text-lg font-semibold text-gray-700">
        {title}
      </h3>

      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
          {description}
        </p>
      )}
    </div>
  )
}

export default EmptyState