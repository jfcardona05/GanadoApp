import { useState } from 'react'
import type { FormEvent } from 'react'
import { Beef, CheckCircle2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import heroImage from '../assets/hero.jpg'
import { loginUser } from '../services/authService'
import { getErrorMessage } from '../utils/errors'

function AuthLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200/40 bg-emerald-950/80 text-white shadow-lg shadow-emerald-950/40">
        <Beef size={30} strokeWidth={2.2} />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white">GanadoApp</h1>
        <p className="text-sm text-emerald-100/85">Gestión agropecuaria</p>
      </div>
    </div>
  )
}

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

  return (
    <div className="min-h-screen overflow-hidden bg-[#ead7bd] text-emerald-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.12fr_0.88fr]">
        <section className="relative hidden overflow-hidden bg-emerald-950 px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
          <img src={heroImage} alt="" className="absolute inset-0 h-full w-full scale-105 object-cover opacity-85" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/92 via-emerald-950/58 to-slate-950/82" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(52,211,153,0.32),transparent_34%),radial-gradient(circle_at_80%_70%,rgba(234,215,189,0.2),transparent_30%)]" />

          <div className="relative">
            <AuthLogo />
          </div>

          <div className="relative max-w-2xl">
            <span className="inline-flex rounded-full border border-emerald-200/35 bg-emerald-300/15 px-4 py-2 text-sm font-semibold text-emerald-50">
              Software ganadero premium
            </span>

            <h2 className="mt-8 text-5xl font-bold leading-tight">
              Gestiona tu finca con información clara y en tiempo real.
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-emerald-50/90">
              Control ganadero, sanitario y financiero en una sola plataforma visual, sencilla y lista para presentar datos importantes.
            </p>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-4">
              {['Inventario animal', 'Control sanitario', 'Finanzas claras'].map((item) => (
                <div key={item} className="rounded-3xl border border-white/15 bg-white/12 p-4 shadow-lg shadow-emerald-950/20">
                  <CheckCircle2 className="text-emerald-200" size={20} />
                  <p className="mt-3 text-sm font-semibold text-white">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-sm text-emerald-50/80">
            Plataforma profesional para pequeños y medianos productores.
          </p>
        </section>

        <section className="relative flex items-center justify-center px-5 py-10 sm:px-8">
          <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-18 lg:hidden" />
          <div className="absolute inset-0 bg-[#ead7bd]/88 lg:bg-[#ead7bd]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.22),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(101,67,33,0.18),transparent_30%)]" />

          <div className="relative w-full max-w-md">
            <div className="mb-8 flex justify-center lg:hidden">
              <div className="rounded-3xl bg-gradient-to-br from-emerald-950 to-emerald-800 p-4 shadow-xl">
                <AuthLogo />
              </div>
            </div>

            <div className="rounded-[2rem] border border-emerald-950/10 bg-[#fff8ec]/95 p-7 shadow-xl shadow-emerald-950/20 md:p-8">
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
                  Bienvenido
                </p>
                <h2 className="mt-2 text-3xl font-bold text-emerald-950">Iniciar sesión</h2>

                <p className="mt-2 text-sm leading-6 text-emerald-950/70">
                  Ingresa para administrar tus fincas, animales, vacunas, pesos y movimientos.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-emerald-950">
                    Correo electrónico
                  </label>

                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="mt-2 w-full px-4 py-3"
                    placeholder="ejemplo@correo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-emerald-950">
                    Contraseña
                  </label>

                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 w-full px-4 py-3"
                    placeholder="********"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-800 px-4 py-3.5 font-semibold text-white shadow-lg shadow-emerald-900/25 transition hover:-translate-y-0.5 hover:from-emerald-400 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Ingresando...' : 'Ingresar a GanadoApp'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-emerald-950/70">
                ¿No tienes cuenta?{' '}
                <Link to="/register" className="font-semibold text-emerald-700 hover:text-emerald-600">
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
