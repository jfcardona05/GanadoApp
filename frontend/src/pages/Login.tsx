import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../services/authService'

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
      const data = await loginUser({
        correo,
        password,
      })

      localStorage.setItem('token', data.token)
      localStorage.setItem('usuario', JSON.stringify(data.usuario))

      navigate('/dashboard')
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-green-700 text-center">
          GanadoApp
        </h1>

        <p className="text-gray-500 text-center mt-2">
          Inicia sesión para administrar tu finca
        </p>

        {error && (
          <div className="mt-4 bg-red-100 text-red-700 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Correo
            </label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 disabled:opacity-60"
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-green-700 font-semibold">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login