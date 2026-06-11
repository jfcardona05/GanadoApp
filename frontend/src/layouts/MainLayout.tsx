import { Link, Outlet } from 'react-router-dom'

function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <aside className="fixed left-0 top-0 h-full w-64 bg-green-800 text-white p-6">
        <h1 className="text-2xl font-bold mb-8">GanadoApp</h1>

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
      </aside>

      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout