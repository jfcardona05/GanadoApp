const express = require('express');
const router = express.Router();

const verificarToken = require('../middlewares/auth.middleware');

const {
  registrarPeso,
  obtenerRegistrosPeso,
  obtenerPesosPorAnimal,
  eliminarRegistroPeso
} = require('../controllers/peso.controller.js');

router.post('/', verificarToken, registrarPeso);
router.get('/', verificarToken, obtenerRegistrosPeso);
router.get('/animal/:id_animal', verificarToken, obtenerPesosPorAnimal);
router.delete('/:id', verificarToken, eliminarRegistroPeso);

module.exports = router;