const express = require('express');
const router = express.Router();

const verificarToken = require('../middlewares/auth.middleware');

const {
  crearGasto,
  obtenerGastos,
  eliminarGasto,
  crearIngreso,
  obtenerIngresos,
  eliminarIngreso,
  obtenerResumenFinanciero
} = require('../controllers/finanza.controller');

router.post('/gastos', verificarToken, crearGasto);
router.get('/gastos', verificarToken, obtenerGastos);
router.delete('/gastos/:id', verificarToken, eliminarGasto);

router.post('/ingresos', verificarToken, crearIngreso);
router.get('/ingresos', verificarToken, obtenerIngresos);
router.delete('/ingresos/:id', verificarToken, eliminarIngreso);

router.get('/resumen', verificarToken, obtenerResumenFinanciero);

module.exports = router;