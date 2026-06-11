const express = require('express');
const router = express.Router();

const verificarToken = require('../middlewares/auth.middleware');

const {
  crearAnimal,
  obtenerAnimales,
  obtenerAnimalPorId,
  actualizarAnimal,
  eliminarAnimal
} = require('../controllers/animal.controller');

router.post('/', verificarToken, crearAnimal);
router.get('/', verificarToken, obtenerAnimales);
router.get('/:id', verificarToken, obtenerAnimalPorId);
router.put('/:id', verificarToken, actualizarAnimal);
router.delete('/:id', verificarToken, eliminarAnimal);

module.exports = router;