const express = require('express');
const router = express.Router();

const verificarToken = require('../middlewares/auth.middleware');

const {
  registrarVacunacion,
  obtenerRegistrosVacunacion,
  obtenerRegistrosPorAnimal,
  eliminarRegistroVacunacion
} = require('../controllers/registroVacunacion.controller');

router.post('/', verificarToken, registrarVacunacion);
router.get('/', verificarToken, obtenerRegistrosVacunacion);
router.get('/animal/:id_animal', verificarToken, obtenerRegistrosPorAnimal);
router.delete('/:id', verificarToken, eliminarRegistroVacunacion);

module.exports = router;