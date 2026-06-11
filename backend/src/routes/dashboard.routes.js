const express = require('express');
const router = express.Router();

const verificarToken = require('../middlewares/auth.middleware');

const {
  obtenerResumenDashboard
} = require('../controllers/dashboard.controller');

router.get('/resumen', verificarToken, obtenerResumenDashboard);

module.exports = router;