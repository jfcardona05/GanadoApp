import { ClipboardCheck, Plus, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'

import Alert from './Alert'
import Button from './Button'
import EmptyState from './EmptyState'
import Modal from './Modal'
import Panel from './Panel'
import { getErrorMessage } from '../utils/errors'

export interface FieldOption {
  label: string
  value: string | number
}

export interface FieldConfig {
  name: string
  label: string
  type?: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox'
  required?: boolean
  placeholder?: string
  options?: FieldOption[]
  help?: string
}

export interface ColumnConfig {
  key: string
  label: string
  render?: (item: Record<string, any>) => string
}

interface ModuleSectionProps {
  title: string
  description: string
  buttonLabel: string
  emptyTitle: string
  fields: FieldConfig[]
  columns: ColumnConfig[]
  load: () => Promise<Record<string, any>[]>
  create: (data: Record<string, any>) => Promise<unknown>
  searchKeys?: string[]
  simpleHint?: string
}

const initialForm = (fields: FieldConfig[]) =>
  fields.reduce<Record<string, string | boolean>>((acc, field) => {
    acc[field.name] = field.type === 'checkbox' ? false : ''
    return acc
  }, {})

function ModuleSection({
  title,
  description,
  buttonLabel,
  emptyTitle,
  fields,
  columns,
  load,
  create,
  searchKeys = [],
  simpleHint,
}: ModuleSectionProps) {
  const [items, setItems] = useState<Record<string, any>[]>([])
  const [form, setForm] = useState(initialForm(fields))
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const cargar = async () => {
    try {
      setLoading(true)
      setItems(await load())
    } catch (error: unknown) {
      setError(getErrorMessage(error, `Error al cargar ${title.toLowerCase()}`))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar()
  }, [])

  const filtrados = useMemo(() => {
    if (!search.trim()) return items
    const term = search.toLowerCase()
    return items.filter((item) =>
      searchKeys.some((key) => String(item[key] ?? '').toLowerCase().includes(term)),
    )
  }, [items, search, searchKeys])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setMessage('')

    const data = fields.reduce<Record<string, any>>((acc, field) => {
      const value = form[field.name]
      if (field.type === 'checkbox') {
        acc[field.name] = Boolean(value)
      } else if (value !== '') {
        acc[field.name] = field.type === 'number' ? Number(value) : value
      }
      return acc
    }, {})

    try {
      await create(data)
      setMessage('Registro guardado correctamente')
      setForm(initialForm(fields))
      setModalOpen(false)
      cargar()
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error al guardar registro'))
    }
  }

  const valueOf = (item: Record<string, any>, column: ColumnConfig) => {
    const value = column.render ? column.render(item) : item[column.key]
    return value === null || value === undefined || value === '' ? 'No registrado' : String(value)
  }

  return (
    <Panel title={title} count={filtrados.length} helper={description}>
      <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
        <div className="flex gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-green-700 shadow-sm">
            <ClipboardCheck size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-green-900">Para empezar</p>
            <p className="mt-1 text-sm leading-6 text-green-800">
              {simpleHint || `Presiona "${buttonLabel}", llena los datos que conozcas y guarda. Si no sabes un dato, lo puedes dejar vacío.`}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-700">Registros guardados</p>
          <p className="text-sm text-slate-500">Busca y revisa la información sin abrir el formulario.</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {searchKeys.length > 0 && (
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full pl-10 sm:w-72"
                placeholder="Buscar por nombre, finca o estado"
              />
            </div>
          )}
          <Button onClick={() => setModalOpen(true)} icon={<Plus size={17} />} className="min-h-11">
            {buttonLabel}
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}
      {message && <Alert type="success" message={message} />}

      {loading ? (
        <p className="text-sm text-slate-500">Cargando...</p>
      ) : filtrados.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description="Cuando registres información aparecerá aquí para consultarla rápido."
          actionLabel={buttonLabel}
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <>
          <div className="grid gap-3 md:hidden">
            {filtrados.map((item, index) => (
              <div key={item.id ?? item[columns[0].key] ?? index} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="font-semibold text-slate-950">{valueOf(item, columns[0])}</p>
                <div className="mt-3 space-y-1">
                  {columns.slice(1).map((column) => (
                    <p key={column.key} className="text-sm text-slate-500">
                      <span className="font-semibold text-slate-700">{column.label}:</span> {valueOf(item, column)}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-lg border border-slate-200 md:block">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column.key}>{column.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtrados.map((item, index) => (
                  <tr key={item.id ?? item[columns[0].key] ?? index} className="hover:bg-slate-50">
                    {columns.map((column, columnIndex) => (
                      <td key={column.key} className={columnIndex === 0 ? 'font-semibold text-slate-900' : 'text-slate-600'}>
                        {valueOf(item, column)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={buttonLabel}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-800">Llena solo lo necesario</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Los campos con * son obligatorios. Los demás se pueden completar después.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => (
              <label key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                <span className="block text-sm font-semibold text-slate-700">
                  {field.label}
                  {field.required && <span className="ml-1 text-red-600">*</span>}
                </span>
                {field.type === 'select' ? (
                  <select
                    value={String(form[field.name] ?? '')}
                    onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                    className="mt-1 w-full"
                    required={field.required}
                  >
                    <option value="">Seleccionar</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    value={String(form[field.name] ?? '')}
                    onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                    className="mt-1 w-full"
                    rows={3}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                ) : field.type === 'checkbox' ? (
                  <span className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={Boolean(form[field.name])}
                      onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.checked }))}
                      className="h-5 w-5"
                    />
                    <span className="text-sm text-slate-600">Sí</span>
                  </span>
                ) : (
                  <input
                    type={field.type || 'text'}
                    value={String(form[field.name] ?? '')}
                    onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                    className="mt-1 w-full"
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                )}
                {field.help && (
                  <span className="mt-1 block text-xs leading-5 text-slate-500">{field.help}</span>
                )}
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>
    </Panel>
  )
}

export default ModuleSection
