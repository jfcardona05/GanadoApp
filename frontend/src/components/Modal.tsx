import { X } from 'lucide-react'
import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/75 px-4 py-6">
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
        aria-label="Cerrar modal"
      />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[1.75rem] border border-[#fff8ec]/70 bg-[#fff8ec] shadow-2xl shadow-slate-950/25">
        <div className="relative flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-6 py-5">
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
              GanadoApp
            </p>
            <h2 className="mt-1 text-lg font-semibold text-white">
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white transition hover:bg-white hover:text-slate-950"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto bg-gradient-to-b from-[#fff8ec] to-[#ead7bd]/55 px-6 py-5">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default Modal
