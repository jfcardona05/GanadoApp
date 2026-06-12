const express = require('express');
const router = express.Router();

const verificarToken = require('../middlewares/auth.middleware');

const {
  crearCategoria,
  obtenerCategorias,
  obtenerCategoriaPorId,
  actualizarCategoria,
  eliminarCategoria
} = require('../controllers/categoriaFinanciera.controller');

router.post('/', verificarToken, crearCategoria);
router.get('/', verificarToken, obtenerCategorias);
router.get('/:id', verificarToken, obtenerCategoriaPorId);
router.put('/:id', verificarToken, actualizarCategoria);
router.delete('/:id', verificarToken, eliminarCategoria);

module.exports = router;