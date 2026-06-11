const express = require('express');
const router = express.Router();

const verificarToken = require('../middlewares/auth.middleware');

const {
  crearVacuna,
  obtenerVacunas,
  obtenerVacunaPorId,
  actualizarVacuna,
  eliminarVacuna
} = require('../controllers/vacuna.controller');

router.post('/', verificarToken, crearVacuna);
router.get('/', verificarToken, obtenerVacunas);
router.get('/:id', verificarToken, obtenerVacunaPorId);
router.put('/:id', verificarToken, actualizarVacuna);
router.delete('/:id', verificarToken, eliminarVacuna);

module.exports = router;