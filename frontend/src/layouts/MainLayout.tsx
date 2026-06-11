import { Link, Outlet, useNavigate } from 'react-router-dom'

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
    <div className="min-h-screen bg-gray-100">
      <aside className="fixed left-0 top-0 h-full w-64 bg-green-800 text-white p-6 flex flex-col">
        <div>
          <h1 className="text-2xl font-bold mb-2">GanadoApp</h1>

          {usuario && (
            <p className="text-sm text-green-100 mb-8">
              {usuario.nombre}
            </p>
          )}

          <nav className="flex flex-col gap-4">
            <Link to="/dashboard" className="hover:text-green-200">
              Dashboard
            </Link>

            <Link to="/fincas" className="hover:text-green-200">
              Fincas
            </Link>

            <Link to="/animales" className="hover:text-green-200">
              Animales
            </Link>

            <Link to="/vacunas" className="hover:text-green-200">
              Vacunas
            </Link>

            <Link to="/pesos" className="hover:text-green-200">
              Control de Peso
            </Link>

            <Link to="/finanzas" className="hover:text-green-200">
              Finanzas
            </Link>
          </nav>
        </div>

        <button
          onClick={cerrarSesion}
          className="mt-auto bg-green-700 hover:bg-green-600 text-white py-2 px-4 rounded-lg"
        >
          Cerrar sesión
        </button>
      </aside>

      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout