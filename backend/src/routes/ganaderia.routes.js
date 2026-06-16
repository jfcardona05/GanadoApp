const express = require('express');
const router = express.Router();

const verificarToken = require('../middlewares/auth.middleware');
const controller = require('../controllers/ganaderia.controller');

router.use(verificarToken);

router.get('/potreros', controller.obtenerPotreros);
router.post('/potreros', controller.crearPotrero);
router.get('/movimientos-potrero', controller.obtenerMovimientosPotrero);
router.post('/movimientos-potrero', controller.moverAnimalPotrero);

router.get('/eventos-animales', controller.obtenerEventosAnimales);

router.get('/reproduccion/servicios', controller.obtenerServiciosReproductivos);
router.post('/reproduccion/servicios', controller.crearServicioReproductivo);
router.get('/reproduccion/diagnosticos', controller.obtenerDiagnosticosPrenez);
router.post('/reproduccion/diagnosticos', controller.crearDiagnosticoPrenez);
router.get('/reproduccion/partos', controller.obtenerPartos);
router.post('/reproduccion/partos', controller.crearParto);

router.get('/sanidad/enfermedades', controller.obtenerEnfermedades);
router.post('/sanidad/enfermedades', controller.crearEnfermedad);
router.get('/sanidad/medicamentos', controller.obtenerMedicamentos);
router.post('/sanidad/medicamentos', controller.crearMedicamento);
router.get('/sanidad/tratamientos', controller.obtenerTratamientos);
router.post('/sanidad/tratamientos', controller.crearTratamiento);
router.get('/sanidad/desparasitaciones', controller.obtenerDesparasitaciones);
router.post('/sanidad/desparasitaciones', controller.crearDesparasitacion);

router.get('/produccion/leche', controller.obtenerProduccionLeche);
router.post('/produccion/leche', controller.crearProduccionLeche);
router.get('/produccion/lotes-ceba', controller.obtenerLotesCeba);
router.post('/produccion/lotes-ceba', controller.crearLoteCeba);

router.get('/clientes', controller.obtenerClientes);
router.post('/clientes', controller.crearCliente);
router.get('/proveedores', controller.obtenerProveedores);
router.post('/proveedores', controller.crearProveedor);

router.get('/comercial/compras-animales', controller.obtenerComprasAnimales);
router.post('/comercial/compras-animales', controller.crearCompraAnimal);
router.get('/comercial/ventas-animales', controller.obtenerVentasAnimales);
router.post('/comercial/ventas-animales', controller.crearVentaAnimal);
router.get('/comercial/ventas-leche', controller.obtenerVentasLeche);
router.post('/comercial/ventas-leche', controller.crearVentaLeche);

router.get('/inventario/insumos', controller.obtenerInsumos);
router.post('/inventario/insumos', controller.crearInsumo);
router.get('/inventario/existencias', controller.obtenerInventario);
router.post('/inventario/movimientos', controller.registrarInventario);

router.get('/cuentas/pagar', controller.obtenerCuentasPagar);
router.post('/cuentas/pagar', controller.crearCuentaPagar);
router.get('/cuentas/cobrar', controller.obtenerCuentasCobrar);
router.post('/cuentas/cobrar', controller.crearCuentaCobrar);

router.get('/alertas', controller.obtenerAlertas);

module.exports = router;
