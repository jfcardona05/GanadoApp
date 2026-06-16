import { useState } from 'react'
import type { FormEvent } from 'react'
import { Beef, CheckCircle2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import heroImage from '../assets/hero.jpg'
import { registerUser } from '../services/authService'
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

function Register() {
  const navigate = useNavigate()

  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMensaje('')
    setLoading(true)

    try {
      await registerUser({
        nombre,
        correo,
        password,
        rol: 'GANADERO',
      })

      setMensaje('Usuario registrado correctamente. Ya puedes iniciar sesión.')

      setTimeout(() => {
        navigate('/login')
      }, 1200)
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error al registrar usuario'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-white text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.12fr_0.88fr]">
        <section className="relative hidden overflow-hidden bg-emerald-950 px-12 py-10 text-white lg:order-2 lg:flex lg:flex-col lg:justify-between">
          <img src={heroImage} alt="" className="absolute inset-0 h-full w-full scale-105 object-cover opacity-85" />
          <div className="absolute inset-0 bg-slate-950/65" />

          <div className="relative">
            <AuthLogo />
          </div>

          <div className="relative max-w-2xl">
            <span className="inline-flex rounded-full border border-emerald-200/35 bg-emerald-300/15 px-4 py-2 text-sm font-semibold text-emerald-50">
              Digitalización para fincas ganaderas
            </span>

            <h2 className="mt-8 text-5xl font-bold leading-tight">
              Control ganadero, sanitario y financiero en una sola plataforma.
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-emerald-50/90">
              Empieza a registrar tu operación con una herramienta clara, confiable y visualmente lista para mostrar al cliente.
            </p>

            <div className="mt-10 space-y-4">
              {[
                'Inventario por finca y trazabilidad animal',
                'Vacunas, peso, salud y reproducción',
                'Ingresos, gastos, compras y ventas',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-3xl border border-white/15 bg-white/12 p-4 shadow-lg shadow-emerald-950/20">
                  <CheckCircle2 className="text-emerald-200" size={20} />
                  <p className="text-sm font-semibold text-white">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-sm text-emerald-50/80">
            Información clara para tomar mejores decisiones en campo.
          </p>
        </section>

        <section className="relative flex items-center justify-center px-5 py-10 sm:px-8 lg:order-1">
          <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-18 lg:hidden" />
          <div className="absolute inset-0 bg-white" />

          <div className="relative w-full max-w-md">
            <div className="mb-8 flex justify-center lg:hidden">
              <div className="rounded-3xl bg-emerald-950 p-4 shadow-xl">
                <AuthLogo />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/80 md:p-8">
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
                  Nueva cuenta
                </p>
                <h2 className="mt-2 text-3xl font-bold text-slate-950">Crear cuenta</h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Regístrate para empezar a controlar tu finca desde GanadoApp.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm">
                  {error}
                </div>
              )}

              {mensaje && (
                <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 shadow-sm">
                  {mensaje}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-800">
                    Nombre completo
                  </label>

                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="mt-2 w-full px-4 py-3"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800">
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
                  <label className="block text-sm font-semibold text-slate-800">
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
                  className="w-full rounded-2xl bg-emerald-700 px-4 py-3.5 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Registrando...' : 'Crear cuenta'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-600">
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Register


