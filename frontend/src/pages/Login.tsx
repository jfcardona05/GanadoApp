import { useState } from 'react'
import type { FormEvent } from 'react'
import { Beef } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../services/authService'
import { getErrorMessage } from '../utils/errors'

function Login() {
  const navigate = useNavigate()

  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await loginUser({ correo, password })

      localStorage.setItem('token', data.token)
      localStorage.setItem('usuario', JSON.stringify(data.usuario))

      navigate('/dashboard')
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error al iniciar sesión'))
    } finally {
      setLoading(false)
    }
  }

  const Logo = ({ dark = false }: { dark?: boolean }) => (
    <div className="flex items-center gap-3">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-green-500/40 text-white shadow-lg ${dark ? 'bg-slate-900' : 'bg-slate-950'}`}>
        <Beef size={30} strokeWidth={2.2} />
      </div>

      <div>
        <h1 className="text-2xl font-bold">GanadoApp</h1>
        <p className="text-sm text-slate-400">Gestión agropecuaria</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <section className="hidden flex-col justify-between bg-slate-900 px-12 py-10 lg:flex">
          <Logo />

          <div className="max-w-xl">
            <span className="inline-flex rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-300">
              Plataforma para productores ganaderos
            </span>

            <h2 className="mt-8 text-5xl font-bold leading-tight">
              Administra tu finca de forma simple, ordenada y profesional.
            </h2>

            <p className="mt-6 text-lg text-slate-300">
              Controla animales, vacunas, peso, finanzas y trazabilidad desde una sola herramienta.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-bold text-green-400">100%</p>
                <p className="mt-1 text-sm text-slate-400">Digital</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-bold text-green-400">24/7</p>
                <p className="mt-1 text-sm text-slate-400">Disponible</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-bold text-green-400">MVP</p>
                <p className="mt-1 text-sm text-slate-400">Funcional</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-500">
            GanadoApp · Sistema de gestión ganadera
          </p>
        </section>

        <section className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            <div className="mb-8 flex justify-center lg:hidden">
              <Logo dark />
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur">
              <div className="mb-8">
                <h2 className="text-3xl font-bold">Iniciar sesión</h2>

                <p className="mt-2 text-slate-400">
                  Ingresa para administrar tus fincas y animales.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300">
                    Correo electrónico
                  </label>

                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                    placeholder="ejemplo@correo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300">
                    Contraseña
                  </label>

                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                    placeholder="********"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Ingresando...' : 'Ingresar'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-400">
                ¿No tienes cuenta?{' '}
                <Link to="/register" className="font-semibold text-green-400 hover:text-green-300">
                  Crear cuenta
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Login
