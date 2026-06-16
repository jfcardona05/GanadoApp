import { TriangleAlert } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import Button from './Button'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Sí, eliminar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-950/75 px-4">
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onCancel}
        aria-label="Cancelar confirmación"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/25">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-200">
            <TriangleAlert size={22} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ConfirmDialog


