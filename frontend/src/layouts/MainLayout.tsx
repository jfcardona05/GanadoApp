import { NavLink, Outlet, useNavigate } from 'react-router-dom'

const menuItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: '📊',
  },
  {
    label: 'Fincas',
    path: '/fincas',
    icon: '🌿',
  },
  {
    label: 'Animales',
    path: '/animales',
    icon: '🐂',
  },
  {
    label: 'Vacunas',
    path: '/vacunas',
    icon: '💉',
  },
  {
    label: 'Control de peso',
    path: '/pesos',
    icon: '⚖️',
  },
  {
    label: 'Finanzas',
    path: '/finanzas',
    icon: '💰',
  },
]

function MainLayout() {
  const navigate = useNavigate()

  const usuarioGuardado = localStorage.getItem('usuario')
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed left-0 top-0 z-40 h-screen w-72 bg-slate-950 text-white shadow-2xl">
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 border border-green-500/60 text-xl shadow-lg">
                🚜
              </div>

              <div>
                <h1 className="text-xl font-bold leading-tight">
                  GanadoApp
                </h1>
                <p className="text-xs text-slate-400">
                  Gestión ganadera
                </p>
              </div>
            </div>
          </div>

          <div className="px-4 py-5">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Menú principal
            </p>

            <nav className="space-y-2">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? 'bg-green-600 text-white shadow-lg shadow-green-900/30'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-lg">
                    {item.icon}
                  </span>

                  <span>
                    {item.label}
                  </span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="mt-auto border-t border-white/10 p-4">
            <div className="mb-4 rounded-2xl bg-white/10 p-4">
              <p className="text-xs text-slate-400">
                Usuario activo
              </p>

              <p className="mt-1 font-semibold text-white">
                {usuario?.nombre || 'Ganadero'}
              </p>

              <p className="mt-1 truncate text-xs text-slate-400">
                {usuario?.correo || 'Sin correo'}
              </p>
            </div>

            <button
              onClick={cerrarSesion}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <span>↪</span>
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      <main className="ml-72 min-h-screen p-8">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout