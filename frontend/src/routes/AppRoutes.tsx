import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import MainLayout from '../layouts/MainLayout'
import ProtectedRoute from './ProtectedRoute'

import Login from '../pages/Login'
import Register from '../pages/Register'
import Dashboard from '../pages/Dashboard'
import Fincas from '../pages/Fincas'
import Animales from '../pages/Animales'
import Vacunas from '../pages/Vacunas'
import Pesos from '../pages/Pesos'
import Finanzas from '../pages/Finanzas'
import Potreros from '../pages/Potreros'
import Reproduccion from '../pages/Reproduccion'
import Sanidad from '../pages/Sanidad'
import Produccion from '../pages/Produccion'
import Inventario from '../pages/Inventario'
import Comercial from '../pages/Comercial'
import Cuentas from '../pages/Cuentas'
import Trazabilidad from '../pages/Trazabilidad'
import Alertas from '../pages/Alertas'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/fincas" element={<Fincas />} />
            <Route path="/animales" element={<Animales />} />
            <Route path="/vacunas" element={<Vacunas />} />
            <Route path="/pesos" element={<Pesos />} />
            <Route path="/finanzas" element={<Finanzas />} />
            <Route path="/potreros" element={<Potreros />} />
            <Route path="/reproduccion" element={<Reproduccion />} />
            <Route path="/sanidad" element={<Sanidad />} />
            <Route path="/produccion" element={<Produccion />} />
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/comercial" element={<Comercial />} />
            <Route path="/cuentas" element={<Cuentas />} />
            <Route path="/trazabilidad" element={<Trazabilidad />} />
            <Route path="/alertas" element={<Alertas />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
