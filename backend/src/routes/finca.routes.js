const express = require('express');
const router = express.Router();

const verificarToken = require('../middlewares/auth.middleware');

const {
  crearFinca,
  obtenerFincas,
  obtenerFincaPorId,
  actualizarFinca,
  eliminarFinca
} = require('../controllers/finca.controller');

router.post('/', verificarToken, crearFinca);
router.get('/', verificarToken, obtenerFincas);
router.get('/:id', verificarToken, obtenerFincaPorId);
router.put('/:id', verificarToken, actualizarFinca);
router.delete('/:id', verificarToken, eliminarFinca);

module.exports = router;