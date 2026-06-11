import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../services/authService'

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
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al registrar usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-green-700 text-center">
          Crear cuenta
        </h1>

        <p className="text-gray-500 text-center mt-2">
          Regístrate para empezar a usar GanadoApp
        </p>

        {error && (
          <div className="mt-4 bg-red-100 text-red-700 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {mensaje && (
          <div className="mt-4 bg-green-100 text-green-700 p-3 rounded-lg text-sm">
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Juan Pérez"
            />
          </div>

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
            {loading ? 'Registrando...' : 'Registrarme'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-green-700 font-semibold">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register