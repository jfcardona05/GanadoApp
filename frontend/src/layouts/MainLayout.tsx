import {
  Beef,
  Bell,
  Building2,
  ChartNoAxesCombined,
  ClipboardList,
  DollarSign,
  Gauge,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Route,
  ShieldPlus,
  Sprout,
  Store,
  UserRound,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

const menuSections = [
  {
    title: 'Inicio',
    items: [
      { label: 'Qué hacer hoy', shortLabel: 'Hoy', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Alertas importantes', shortLabel: 'Alertas', path: '/alertas', icon: Bell },
    ],
  },
  {
    title: 'Mi finca',
    items: [
      { label: 'Fincas y predios', shortLabel: 'Fincas', path: '/fincas', icon: Sprout },
      { label: 'Animales', shortLabel: 'Animales', path: '/animales', icon: Building2 },
      { label: 'Potreros', shortLabel: 'Potreros', path: '/potreros', icon: Route },
    ],
  },
  {
    title: 'Cuidado animal',
    items: [
      { label: 'Vacunas', shortLabel: 'Vacunas', path: '/vacunas', icon: ShieldPlus },
      { label: 'Pesos', shortLabel: 'Pesos', path: '/pesos', icon: Gauge },
      { label: 'Salud y tratamientos', shortLabel: 'Sanidad', path: '/sanidad', icon: ClipboardList },
      { label: 'Reproducción', shortLabel: 'Reproducción', path: '/reproduccion', icon: HeartPulse },
    ],
  },
  {
    title: 'Negocio',
    items: [
      { label: 'Producción', shortLabel: 'Producción', path: '/produccion', icon: ChartNoAxesCombined },
      { label: 'Inventario', shortLabel: 'Inventario', path: '/inventario', icon: Package },
      { label: 'Compras y ventas', shortLabel: 'Comercial', path: '/comercial', icon: Store },
      { label: 'Finanzas y cuentas', shortLabel: 'Finanzas', path: '/finanzas', icon: DollarSign },
    ],
  },
]

const menuItems = menuSections.flatMap((section) => section.items)

interface SidebarContentProps {
  usuario: {
    nombre?: string
    correo?: string
  } | null
  onClose: () => void
  onLogout: () => void
}

function SidebarContent({ usuario, onClose, onLogout }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-green-500/40 bg-green-500/10 text-white">
            <Beef size={27} strokeWidth={2.2} />
          </div>

          <div>
            <h1 className="text-lg font-bold leading-tight text-white">GanadoApp</h1>
            <p className="text-xs font-medium text-slate-400">Gestión ganadera fácil</p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <nav className="space-y-5">
          {menuSections.map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {section.title}
              </p>

              <div className="space-y-1.5">
                {section.items.map((item) => {
                  const Icon = item.icon

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                          isActive
                            ? 'bg-green-600 text-white shadow-lg shadow-green-950/20'
                            : 'text-slate-300 hover:bg-white/10 hover:text-white'
                        }`
                      }
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10">
                        <Icon size={17} />
                      </span>

                      <span>{item.label}</span>
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-slate-200">
              <UserRound size={18} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {usuario?.nombre || 'Ganadero'}
              </p>
              <p className="truncate text-xs text-slate-400">
                {usuario?.correo || 'Sin correo'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-100 transition hover:bg-red-600 hover:text-white"
        >
          <LogOut size={17} />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarAbierto, setSidebarAbierto] = useState(false)

  const usuarioGuardado = localStorage.getItem('usuario')
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null
  const paginaActual = menuItems.find((item) => item.path === location.pathname)

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {sidebarAbierto && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
          onClick={() => setSidebarAbierto(false)}
          aria-label="Cerrar menú"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 bg-slate-950 text-white shadow-2xl transition-transform lg:translate-x-0 ${
          sidebarAbierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          type="button"
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 lg:hidden"
          onClick={() => setSidebarAbierto(false)}
          aria-label="Cerrar menú"
        >
          <X size={18} />
        </button>

        <SidebarContent
          usuario={usuario}
          onClose={() => setSidebarAbierto(false)}
          onLogout={cerrarSesion}
        />
      </aside>

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 shadow-sm hover:bg-slate-50 lg:hidden"
                onClick={() => setSidebarAbierto(true)}
                aria-label="Abrir menú"
              >
                <Menu size={20} />
              </button>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Estás en
                </p>
                <p className="text-sm font-semibold text-slate-950">
                  {paginaActual?.shortLabel || 'GanadoApp'}
                </p>
              </div>
            </div>

            <div />
          </div>
        </header>

        <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
