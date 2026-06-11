const express = require('express');
const router = express.Router();

const verificarToken = require('../middlewares/auth.middleware');

const {
  registrarUsuario,
  iniciarSesion,
  perfilUsuario
} = require('../controllers/auth.controller');

router.post('/register', registrarUsuario);
router.post('/login', iniciarSesion);

router.get('/profile', verificarToken, perfilUsuario);

module.exports = router;