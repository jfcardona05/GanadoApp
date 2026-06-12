interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

function Alert({ type, message }: AlertProps) {
  const styles = {
    success: 'bg-green-100 text-green-700 border-green-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
  }

  return (
    <div className={`mb-4 rounded-lg border p-4 text-sm ${styles[type]}`}>
      {message}
    </div>
  )
}

export default Alert