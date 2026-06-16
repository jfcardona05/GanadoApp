-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 16-06-2026 a las 23:14:33
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `ganadoapp_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alertas`
--

CREATE TABLE `alertas` (
  `id_alerta` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_finca` int(11) DEFAULT NULL,
  `id_animal` int(11) DEFAULT NULL,
  `tipo_alerta` enum('VACUNA_VENCIDA','VACUNA_PROXIMA','TRATAMIENTO_PENDIENTE','PARTO_PROXIMO','BAJO_STOCK','INSUMO_VENCIDO','BALANCE_NEGATIVO','CUENTA_VENCIDA','PESO_BAJO','PRODUCCION_BAJA','GENERAL') NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `mensaje` text NOT NULL,
  `prioridad` enum('BAJA','MEDIA','ALTA','CRITICA') DEFAULT 'MEDIA',
  `estado` enum('PENDIENTE','VISTA','RESUELTA','DESCARTADA') DEFAULT 'PENDIENTE',
  `fecha_alerta` date NOT NULL,
  `fecha_resuelta` datetime DEFAULT NULL,
  `modulo_origen` varchar(80) DEFAULT NULL,
  `id_referencia` int(11) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `animales`
--

CREATE TABLE `animales` (
  `id_animal` int(11) NOT NULL,
  `id_finca` int(11) NOT NULL,
  `codigo` varchar(50) NOT NULL,
  `chapeta` varchar(50) DEFAULT NULL,
  `codigo_alterno` varchar(50) DEFAULT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `raza` varchar(100) DEFAULT NULL,
  `color` varchar(80) DEFAULT NULL,
  `procedencia` enum('NACIDO_EN_FINCA','COMPRADO','TRASLADADO','OTRO') DEFAULT 'NACIDO_EN_FINCA',
  `id_padre` int(11) DEFAULT NULL,
  `id_madre` int(11) DEFAULT NULL,
  `sexo` enum('MACHO','HEMBRA') NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `fecha_ingreso` date DEFAULT NULL,
  `peso_actual` decimal(10,2) DEFAULT NULL,
  `estado_productivo` enum('CRIA','LEVANTE','CEBA','REPRODUCTOR','VACA_PRODUCCION','SECA','DESCARTE','OTRO') DEFAULT 'LEVANTE',
  `estado_salud` enum('SANO','ENFERMO','EN_TRATAMIENTO','VENDIDO','MUERTO') DEFAULT 'SANO',
  `estado_comercial` enum('ACTIVO','EN_VENTA','VENDIDO','MUERTO','DESCARTADO') DEFAULT 'ACTIVO',
  `valor_estimado` decimal(12,2) DEFAULT NULL,
  `precio_compra` decimal(12,2) DEFAULT NULL,
  `fecha_salida` date DEFAULT NULL,
  `motivo_salida` varchar(255) DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `animales`
--

INSERT INTO `animales` (`id_animal`, `id_finca`, `codigo`, `chapeta`, `codigo_alterno`, `nombre`, `foto`, `raza`, `color`, `procedencia`, `id_padre`, `id_madre`, `sexo`, `fecha_nacimiento`, `fecha_ingreso`, `peso_actual`, `estado_productivo`, `estado_salud`, `estado_comercial`, `valor_estimado`, `precio_compra`, `fecha_salida`, `motivo_salida`, `fecha_registro`) VALUES
(12, 7, 'TF-001', 'CH-TF-001', 'ALT-001', 'Luna Test', NULL, 'Brahman', 'Blanca', 'NACIDO_EN_FINCA', NULL, NULL, 'HEMBRA', '2024-02-10', '2024-02-11', 332.00, 'LEVANTE', 'EN_TRATAMIENTO', 'ACTIVO', 2500000.00, NULL, NULL, NULL, '2026-06-16 00:49:06');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `archivos`
--

CREATE TABLE `archivos` (
  `id_archivo` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `modulo` varchar(80) NOT NULL,
  `id_referencia` int(11) DEFAULT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `url` varchar(500) NOT NULL,
  `tipo_mime` varchar(120) DEFAULT NULL,
  `tamano_bytes` bigint(20) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `fecha_subida` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias_financieras`
--

CREATE TABLE `categorias_financieras` (
  `id_categoria` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo` enum('GASTO','INGRESO') NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias_financieras`
--

INSERT INTO `categorias_financieras` (`id_categoria`, `id_usuario`, `nombre`, `tipo`, `fecha_creacion`) VALUES
(10, 7, 'Alimento Test', 'GASTO', '2026-06-16 00:49:06'),
(11, 7, 'Venta leche Test', 'INGRESO', '2026-06-16 00:49:06'),
(12, 7, 'Venta de leche', 'INGRESO', '2026-06-16 00:49:07'),
(13, 7, 'Compra de animales', 'GASTO', '2026-06-16 00:49:07'),
(14, 7, 'Compra de insumos', 'GASTO', '2026-06-16 00:49:07');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id_cliente` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `correo` varchar(150) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `tipo` varchar(80) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`id_cliente`, `id_usuario`, `nombre`, `telefono`, `correo`, `direccion`, `tipo`, `observaciones`, `activo`) VALUES
(3, 7, 'Cliente Test Final', '3001234567', NULL, NULL, 'Leche', NULL, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `compras_animales`
--

CREATE TABLE `compras_animales` (
  `id_compra_animal` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_finca` int(11) NOT NULL,
  `id_animal` int(11) DEFAULT NULL,
  `id_proveedor` int(11) DEFAULT NULL,
  `fecha_compra` date NOT NULL,
  `precio` decimal(12,2) NOT NULL,
  `peso_compra` decimal(10,2) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `compras_animales`
--

INSERT INTO `compras_animales` (`id_compra_animal`, `id_usuario`, `id_finca`, `id_animal`, `id_proveedor`, `fecha_compra`, `precio`, `peso_compra`, `descripcion`, `observaciones`) VALUES
(2, 7, 7, 12, 2, '2026-06-15', 2000000.00, 300.00, 'Compra test', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cuentas_por_cobrar`
--

CREATE TABLE `cuentas_por_cobrar` (
  `id_cuenta_cobrar` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_finca` int(11) DEFAULT NULL,
  `id_cliente` int(11) DEFAULT NULL,
  `descripcion` varchar(255) NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `fecha_emision` date DEFAULT NULL,
  `fecha_vencimiento` date NOT NULL,
  `estado` enum('PENDIENTE','COBRADA','VENCIDA','ANULADA') DEFAULT 'PENDIENTE',
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cuentas_por_cobrar`
--

INSERT INTO `cuentas_por_cobrar` (`id_cuenta_cobrar`, `id_usuario`, `id_finca`, `id_cliente`, `descripcion`, `monto`, `fecha_emision`, `fecha_vencimiento`, `estado`, `observaciones`) VALUES
(2, 7, 7, 3, 'Leche pendiente test', 70000.00, NULL, '2026-06-20', 'PENDIENTE', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cuentas_por_pagar`
--

CREATE TABLE `cuentas_por_pagar` (
  `id_cuenta_pagar` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_finca` int(11) DEFAULT NULL,
  `id_proveedor` int(11) DEFAULT NULL,
  `descripcion` varchar(255) NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `fecha_emision` date DEFAULT NULL,
  `fecha_vencimiento` date NOT NULL,
  `estado` enum('PENDIENTE','PAGADA','VENCIDA','ANULADA') DEFAULT 'PENDIENTE',
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cuentas_por_pagar`
--

INSERT INTO `cuentas_por_pagar` (`id_cuenta_pagar`, `id_usuario`, `id_finca`, `id_proveedor`, `descripcion`, `monto`, `fecha_emision`, `fecha_vencimiento`, `estado`, `observaciones`) VALUES
(2, 7, 7, 2, 'Factura alimento test', 50000.00, NULL, '2026-06-20', 'PENDIENTE', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `desparasitaciones`
--

CREATE TABLE `desparasitaciones` (
  `id_desparasitacion` int(11) NOT NULL,
  `id_animal` int(11) NOT NULL,
  `id_medicamento` int(11) DEFAULT NULL,
  `fecha_aplicacion` date NOT NULL,
  `proxima_fecha` date DEFAULT NULL,
  `producto` varchar(120) DEFAULT NULL,
  `dosis` varchar(100) DEFAULT NULL,
  `responsable` varchar(120) DEFAULT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `desparasitaciones`
--

INSERT INTO `desparasitaciones` (`id_desparasitacion`, `id_animal`, `id_medicamento`, `fecha_aplicacion`, `proxima_fecha`, `producto`, `dosis`, `responsable`, `observaciones`) VALUES
(2, 12, 2, '2026-06-15', '2026-12-15', 'Desparasitante Test', '10 ml', 'Tester', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `diagnosticos_prenez`
--

CREATE TABLE `diagnosticos_prenez` (
  `id_diagnostico` int(11) NOT NULL,
  `id_servicio` int(11) NOT NULL,
  `id_hembra` int(11) NOT NULL,
  `fecha_diagnostico` date NOT NULL,
  `resultado` enum('PRENADA','VACIA','DUDOSA') NOT NULL,
  `metodo` varchar(100) DEFAULT NULL,
  `fecha_probable_parto` date DEFAULT NULL,
  `veterinario` varchar(120) DEFAULT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `diagnosticos_prenez`
--

INSERT INTO `diagnosticos_prenez` (`id_diagnostico`, `id_servicio`, `id_hembra`, `fecha_diagnostico`, `resultado`, `metodo`, `fecha_probable_parto`, `veterinario`, `observaciones`) VALUES
(2, 2, 12, '2026-07-15', 'PRENADA', 'Palpaci?n', '2027-03-20', 'Vet Test', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `enfermedades`
--

CREATE TABLE `enfermedades` (
  `id_enfermedad` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activa` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `enfermedades`
--

INSERT INTO `enfermedades` (`id_enfermedad`, `id_usuario`, `nombre`, `descripcion`, `activa`) VALUES
(2, 7, 'Cojera Test', 'Prueba sanitaria', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `eventos_animales`
--

CREATE TABLE `eventos_animales` (
  `id_evento` int(11) NOT NULL,
  `id_animal` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `tipo_evento` enum('NACIMIENTO','COMPRA','VENTA','MUERTE','PESO','VACUNA','TRATAMIENTO','REPRODUCCION','CAMBIO_POTRERO','PRODUCCION','FINANZA','OBSERVACION') NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_evento` date NOT NULL,
  `modulo_origen` varchar(80) DEFAULT NULL,
  `id_referencia` int(11) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `eventos_animales`
--

INSERT INTO `eventos_animales` (`id_evento`, `id_animal`, `id_usuario`, `tipo_evento`, `titulo`, `descripcion`, `fecha_evento`, `modulo_origen`, `id_referencia`, `fecha_creacion`) VALUES
(6, 12, 7, 'NACIMIENTO', 'Animal registrado', 'Código TF-001', '2026-06-15', 'animales', 12, '2026-06-16 00:49:06'),
(7, 12, 7, 'TRATAMIENTO', 'Tratamiento registrado', 'Cojera leve', '2026-06-15', 'tratamientos', 2, '2026-06-16 00:49:07'),
(8, 12, 7, 'REPRODUCCION', 'Servicio reproductivo', 'INSEMINACION', '2026-06-15', 'servicios_reproductivos', 2, '2026-06-16 00:49:07'),
(9, 12, 7, 'REPRODUCCION', 'Parto registrado', 'Parto de prueba', '2027-03-20', 'partos', 2, '2026-06-16 00:49:07');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `fincas`
--

CREATE TABLE `fincas` (
  `id_finca` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `ubicacion` varchar(150) DEFAULT NULL,
  `hectareas` decimal(10,2) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `fincas`
--

INSERT INTO `fincas` (`id_finca`, `id_usuario`, `nombre`, `ubicacion`, `hectareas`, `fecha_creacion`) VALUES
(7, 7, 'Finca Test Final', 'Villavicencio, Meta', 42.50, '2026-06-16 00:49:06'),
(8, 8, 'Finca Paraiso', 'Villavicencio, Meta', 31.20, '2026-06-16 20:56:54');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gastos`
--

CREATE TABLE `gastos` (
  `id_gasto` int(11) NOT NULL,
  `id_finca` int(11) NOT NULL,
  `id_animal` int(11) DEFAULT NULL,
  `id_categoria` int(11) DEFAULT NULL,
  `id_proveedor` int(11) DEFAULT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `monto` decimal(12,2) NOT NULL,
  `fecha` date NOT NULL,
  `estado_pago` enum('PENDIENTE','PAGADO','VENCIDO','ANULADO') DEFAULT 'PAGADO',
  `metodo_pago` varchar(80) DEFAULT NULL,
  `numero_soporte` varchar(120) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `gastos`
--

INSERT INTO `gastos` (`id_gasto`, `id_finca`, `id_animal`, `id_categoria`, `id_proveedor`, `categoria`, `descripcion`, `monto`, `fecha`, `estado_pago`, `metodo_pago`, `numero_soporte`, `fecha_creacion`) VALUES
(5, 7, NULL, 10, NULL, 'Alimento Test', 'Concentrado', 120000.00, '2026-06-15', 'PAGADO', NULL, NULL, '2026-06-16 00:49:06'),
(6, 7, 12, 13, 2, 'Compra de animales', 'Compra test', 2000000.00, '2026-06-15', 'PAGADO', NULL, NULL, '2026-06-16 00:49:07'),
(7, 7, NULL, 14, 2, 'Compra de insumos', 'Compra sal mineral', 25000.00, '2026-06-15', 'PAGADO', NULL, NULL, '2026-06-16 00:49:07');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ingresos`
--

CREATE TABLE `ingresos` (
  `id_ingreso` int(11) NOT NULL,
  `id_finca` int(11) NOT NULL,
  `id_animal` int(11) DEFAULT NULL,
  `id_categoria` int(11) DEFAULT NULL,
  `id_cliente` int(11) DEFAULT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `monto` decimal(12,2) NOT NULL,
  `fecha` date NOT NULL,
  `estado_pago` enum('PENDIENTE','PAGADO','VENCIDO','ANULADO') DEFAULT 'PAGADO',
  `metodo_pago` varchar(80) DEFAULT NULL,
  `numero_soporte` varchar(120) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ingresos`
--

INSERT INTO `ingresos` (`id_ingreso`, `id_finca`, `id_animal`, `id_categoria`, `id_cliente`, `categoria`, `descripcion`, `monto`, `fecha`, `estado_pago`, `metodo_pago`, `numero_soporte`, `fecha_creacion`) VALUES
(8, 7, NULL, 11, NULL, 'Venta leche Test', 'Venta de leche manual', 180000.00, '2026-06-15', 'PAGADO', NULL, NULL, '2026-06-16 00:49:07'),
(9, 7, NULL, 12, 3, 'Venta de leche', 'Venta autom?tica test', 24000.00, '2026-06-15', 'PAGADO', NULL, NULL, '2026-06-16 00:49:07');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `insumos`
--

CREATE TABLE `insumos` (
  `id_insumo` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `tipo` enum('ALIMENTO','MEDICAMENTO','VACUNA','SUPLEMENTO','HERRAMIENTA','OTRO') NOT NULL,
  `unidad_medida` varchar(50) NOT NULL,
  `stock_minimo` decimal(12,2) DEFAULT 0.00,
  `activo` tinyint(1) DEFAULT 1,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `insumos`
--

INSERT INTO `insumos` (`id_insumo`, `id_usuario`, `nombre`, `tipo`, `unidad_medida`, `stock_minimo`, `activo`, `observaciones`) VALUES
(2, 7, 'Sal mineral Test', 'SUPLEMENTO', 'kg', 20.00, 1, 'Insumo prueba');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario_insumos`
--

CREATE TABLE `inventario_insumos` (
  `id_inventario` int(11) NOT NULL,
  `id_insumo` int(11) NOT NULL,
  `id_finca` int(11) NOT NULL,
  `cantidad_actual` decimal(12,2) NOT NULL DEFAULT 0.00,
  `costo_promedio` decimal(12,2) DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `lote` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `inventario_insumos`
--

INSERT INTO `inventario_insumos` (`id_inventario`, `id_insumo`, `id_finca`, `cantidad_actual`, `costo_promedio`, `fecha_vencimiento`, `lote`) VALUES
(2, 2, 7, 10.00, 2500.00, NULL, 'LT-FINAL');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lotes_ceba`
--

CREATE TABLE `lotes_ceba` (
  `id_lote_ceba` int(11) NOT NULL,
  `id_finca` int(11) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `estado` enum('ACTIVO','FINALIZADO','CANCELADO') DEFAULT 'ACTIVO',
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `lotes_ceba`
--

INSERT INTO `lotes_ceba` (`id_lote_ceba`, `id_finca`, `nombre`, `fecha_inicio`, `fecha_fin`, `estado`, `observaciones`) VALUES
(2, 7, 'Lote Ceba Test', '2026-06-15', NULL, 'ACTIVO', 'Lote prueba');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lote_ceba_animales`
--

CREATE TABLE `lote_ceba_animales` (
  `id_lote_ceba_animal` int(11) NOT NULL,
  `id_lote_ceba` int(11) NOT NULL,
  `id_animal` int(11) NOT NULL,
  `fecha_ingreso` date NOT NULL,
  `fecha_salida` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medicamentos`
--

CREATE TABLE `medicamentos` (
  `id_medicamento` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `principio_activo` varchar(120) DEFAULT NULL,
  `unidad_medida` varchar(50) DEFAULT NULL,
  `periodo_retiro_leche_dias` int(11) DEFAULT 0,
  `periodo_retiro_carne_dias` int(11) DEFAULT 0,
  `observaciones` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `medicamentos`
--

INSERT INTO `medicamentos` (`id_medicamento`, `id_usuario`, `nombre`, `principio_activo`, `unidad_medida`, `periodo_retiro_leche_dias`, `periodo_retiro_carne_dias`, `observaciones`, `activo`) VALUES
(2, 7, 'Antibi?tico Test', 'Oxitetraciclina', 'ml', 3, 8, NULL, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientos_inventario`
--

CREATE TABLE `movimientos_inventario` (
  `id_movimiento_inventario` int(11) NOT NULL,
  `id_insumo` int(11) NOT NULL,
  `id_finca` int(11) NOT NULL,
  `id_proveedor` int(11) DEFAULT NULL,
  `tipo_movimiento` enum('ENTRADA','SALIDA','AJUSTE','CONSUMO') NOT NULL,
  `cantidad` decimal(12,2) NOT NULL,
  `costo_unitario` decimal(12,2) DEFAULT NULL,
  `fecha_movimiento` date NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `modulo_origen` varchar(80) DEFAULT NULL,
  `id_referencia` int(11) DEFAULT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `movimientos_inventario`
--

INSERT INTO `movimientos_inventario` (`id_movimiento_inventario`, `id_insumo`, `id_finca`, `id_proveedor`, `tipo_movimiento`, `cantidad`, `costo_unitario`, `fecha_movimiento`, `motivo`, `modulo_origen`, `id_referencia`, `observaciones`) VALUES
(2, 2, 7, 2, 'ENTRADA', 10.00, 2500.00, '2026-06-15', 'Compra sal mineral', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientos_potrero`
--

CREATE TABLE `movimientos_potrero` (
  `id_movimiento_potrero` int(11) NOT NULL,
  `id_animal` int(11) NOT NULL,
  `id_potrero_origen` int(11) DEFAULT NULL,
  `id_potrero_destino` int(11) NOT NULL,
  `fecha_movimiento` date NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `movimientos_potrero`
--

INSERT INTO `movimientos_potrero` (`id_movimiento_potrero`, `id_animal`, `id_potrero_origen`, `id_potrero_destino`, `fecha_movimiento`, `motivo`, `observaciones`, `fecha_registro`) VALUES
(2, 12, NULL, 2, '2026-06-15', 'Rotaci?n de prueba', NULL, '2026-06-16 00:49:07');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `partos`
--

CREATE TABLE `partos` (
  `id_parto` int(11) NOT NULL,
  `id_madre` int(11) NOT NULL,
  `id_servicio` int(11) DEFAULT NULL,
  `id_cria` int(11) DEFAULT NULL,
  `fecha_parto` date NOT NULL,
  `tipo_parto` enum('NORMAL','ASISTIDO','CESAREA','ABORTO') DEFAULT 'NORMAL',
  `sexo_cria` enum('MACHO','HEMBRA') DEFAULT NULL,
  `peso_cria` decimal(10,2) DEFAULT NULL,
  `estado_cria` enum('VIVA','MUERTA','DEBIL') DEFAULT 'VIVA',
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `partos`
--

INSERT INTO `partos` (`id_parto`, `id_madre`, `id_servicio`, `id_cria`, `fecha_parto`, `tipo_parto`, `sexo_cria`, `peso_cria`, `estado_cria`, `observaciones`) VALUES
(2, 12, 2, NULL, '2027-03-20', 'NORMAL', 'HEMBRA', 30.00, 'VIVA', 'Parto de prueba');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `potreros`
--

CREATE TABLE `potreros` (
  `id_potrero` int(11) NOT NULL,
  `id_finca` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `area_hectareas` decimal(10,2) DEFAULT NULL,
  `tipo_pasto` varchar(100) DEFAULT NULL,
  `capacidad_animales` int(11) DEFAULT NULL,
  `estado` enum('DISPONIBLE','OCUPADO','DESCANSO','MANTENIMIENTO') DEFAULT 'DISPONIBLE',
  `agua_disponible` tinyint(1) DEFAULT 0,
  `sombra_disponible` tinyint(1) DEFAULT 0,
  `observaciones` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `potreros`
--

INSERT INTO `potreros` (`id_potrero`, `id_finca`, `nombre`, `area_hectareas`, `tipo_pasto`, `capacidad_animales`, `estado`, `agua_disponible`, `sombra_disponible`, `observaciones`, `fecha_creacion`) VALUES
(2, 7, 'Potrero Norte Test', 8.00, 'Brachiaria', 15, 'DISPONIBLE', 1, 1, 'Potrero de prueba', '2026-06-16 00:49:07');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `produccion_leche`
--

CREATE TABLE `produccion_leche` (
  `id_produccion_leche` int(11) NOT NULL,
  `id_animal` int(11) DEFAULT NULL,
  `id_finca` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `turno` enum('MANANA','TARDE','NOCHE','TOTAL_DIA') DEFAULT 'TOTAL_DIA',
  `litros` decimal(10,2) NOT NULL,
  `destino` enum('VENTA','CONSUMO_INTERNO','CRIA','DESCARTE','OTRO') DEFAULT 'VENTA',
  `observaciones` text DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `produccion_leche`
--

INSERT INTO `produccion_leche` (`id_produccion_leche`, `id_animal`, `id_finca`, `fecha`, `turno`, `litros`, `destino`, `observaciones`, `fecha_registro`) VALUES
(2, 12, 7, '2026-06-15', 'TOTAL_DIA', 12.00, 'VENTA', 'Producci?n final', '2026-06-16 00:49:07');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedores`
--

CREATE TABLE `proveedores` (
  `id_proveedor` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `correo` varchar(150) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `tipo` varchar(80) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proveedores`
--

INSERT INTO `proveedores` (`id_proveedor`, `id_usuario`, `nombre`, `telefono`, `correo`, `direccion`, `tipo`, `observaciones`, `activo`) VALUES
(2, 7, 'Proveedor Test Final', '3101234567', NULL, NULL, 'Insumos', NULL, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registros_peso`
--

CREATE TABLE `registros_peso` (
  `id_peso` int(11) NOT NULL,
  `id_animal` int(11) NOT NULL,
  `peso` decimal(10,2) NOT NULL,
  `condicion_corporal` decimal(3,1) DEFAULT NULL,
  `fecha_registro` date NOT NULL,
  `tipo_pesaje` enum('INICIAL','CONTROL','VENTA','COMPRA','OTRO') DEFAULT 'CONTROL',
  `observaciones` text DEFAULT NULL,
  `responsable` varchar(120) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `registros_peso`
--

INSERT INTO `registros_peso` (`id_peso`, `id_animal`, `peso`, `condicion_corporal`, `fecha_registro`, `tipo_pesaje`, `observaciones`, `responsable`) VALUES
(8, 12, 315.00, NULL, '2026-06-15', 'INICIAL', 'Registro inicial al crear el animal', NULL),
(9, 12, 332.00, NULL, '2026-06-15', 'CONTROL', 'Control final de prueba', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registros_vacunacion`
--

CREATE TABLE `registros_vacunacion` (
  `id_registro` int(11) NOT NULL,
  `id_animal` int(11) NOT NULL,
  `id_vacuna` int(11) NOT NULL,
  `lote_vacuna` varchar(100) DEFAULT NULL,
  `fecha_aplicacion` date NOT NULL,
  `proxima_fecha` date DEFAULT NULL,
  `veterinario` varchar(100) DEFAULT NULL,
  `responsable` varchar(120) DEFAULT NULL,
  `periodo_retiro_leche_dias` int(11) DEFAULT 0,
  `periodo_retiro_carne_dias` int(11) DEFAULT 0,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `registros_vacunacion`
--

INSERT INTO `registros_vacunacion` (`id_registro`, `id_animal`, `id_vacuna`, `lote_vacuna`, `fecha_aplicacion`, `proxima_fecha`, `veterinario`, `responsable`, `periodo_retiro_leche_dias`, `periodo_retiro_carne_dias`, `observaciones`) VALUES
(10, 12, 11, NULL, '2026-06-15', '2026-12-12', 'Vet Test', NULL, 0, 0, 'Aplicaci?n final');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicios_reproductivos`
--

CREATE TABLE `servicios_reproductivos` (
  `id_servicio` int(11) NOT NULL,
  `id_hembra` int(11) NOT NULL,
  `id_macho` int(11) DEFAULT NULL,
  `id_usuario` int(11) NOT NULL,
  `tipo` enum('CELO','MONTA_NATURAL','INSEMINACION','TRANSFERENCIA_EMBRIONARIA') NOT NULL,
  `fecha_servicio` date NOT NULL,
  `pajilla_codigo` varchar(100) DEFAULT NULL,
  `responsable` varchar(120) DEFAULT NULL,
  `resultado` enum('PENDIENTE','PRENADA','NO_PRENADA','REPETICION_CELO','ABORTO') DEFAULT 'PENDIENTE',
  `observaciones` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `servicios_reproductivos`
--

INSERT INTO `servicios_reproductivos` (`id_servicio`, `id_hembra`, `id_macho`, `id_usuario`, `tipo`, `fecha_servicio`, `pajilla_codigo`, `responsable`, `resultado`, `observaciones`, `fecha_creacion`) VALUES
(2, 12, NULL, 7, 'INSEMINACION', '2026-06-15', NULL, 'Tester', 'PRENADA', 'Servicio test', '2026-06-16 00:49:07');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tratamientos`
--

CREATE TABLE `tratamientos` (
  `id_tratamiento` int(11) NOT NULL,
  `id_animal` int(11) NOT NULL,
  `id_enfermedad` int(11) DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `diagnostico` varchar(255) DEFAULT NULL,
  `estado` enum('ACTIVO','FINALIZADO','SUSPENDIDO') DEFAULT 'ACTIVO',
  `veterinario` varchar(120) DEFAULT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tratamientos`
--

INSERT INTO `tratamientos` (`id_tratamiento`, `id_animal`, `id_enfermedad`, `fecha_inicio`, `fecha_fin`, `diagnostico`, `estado`, `veterinario`, `observaciones`) VALUES
(2, 12, 2, '2026-06-15', NULL, 'Cojera leve', 'ACTIVO', 'Vet Test', 'Tratamiento final');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tratamiento_medicamentos`
--

CREATE TABLE `tratamiento_medicamentos` (
  `id_tratamiento_medicamento` int(11) NOT NULL,
  `id_tratamiento` int(11) NOT NULL,
  `id_medicamento` int(11) NOT NULL,
  `dosis` varchar(100) DEFAULT NULL,
  `frecuencia` varchar(100) DEFAULT NULL,
  `via_aplicacion` varchar(80) DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('ADMIN','GANADERO') DEFAULT 'GANADERO',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre`, `correo`, `password`, `rol`, `fecha_creacion`) VALUES
(4, 'juan cardona', 'c@gmail.com', '$2b$10$mgk.dEQ/AzF77KvmGUzkMeRZpqnTVqbuTd9yrZmo9GF7YLndMp9oa', 'GANADERO', '2026-06-15 23:51:46'),
(7, 'Tester Final GanadoApp', 'tester.final.ganadoapp@test.com', '$2b$10$Fc2r/oA5PahSAvaJAHSArOWCQULd7HWOjROsQr5AjQ3H6B8VT2sA2', 'GANADERO', '2026-06-16 00:49:06'),
(8, 'c', 'c@test.com', '$2b$10$GMpAA/1X0tdKB6a4yR66aedOXs/6AiNUU65QO7Jkurz8mQPquNmJm', 'GANADERO', '2026-06-16 20:56:21');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vacunas`
--

CREATE TABLE `vacunas` (
  `id_vacuna` int(11) NOT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `frecuencia_dias` int(11) DEFAULT NULL,
  `obligatoria` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `vacunas`
--

INSERT INTO `vacunas` (`id_vacuna`, `id_usuario`, `nombre`, `descripcion`, `frecuencia_dias`, `obligatoria`) VALUES
(11, 7, 'Aftosa Test Final', 'Vacuna de prueba final', 180, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas_animales`
--

CREATE TABLE `ventas_animales` (
  `id_venta_animal` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_finca` int(11) NOT NULL,
  `id_animal` int(11) DEFAULT NULL,
  `id_cliente` int(11) DEFAULT NULL,
  `fecha_venta` date NOT NULL,
  `precio` decimal(12,2) NOT NULL,
  `peso_venta` decimal(10,2) DEFAULT NULL,
  `utilidad_estimada` decimal(12,2) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas_leche`
--

CREATE TABLE `ventas_leche` (
  `id_venta_leche` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_finca` int(11) NOT NULL,
  `id_cliente` int(11) DEFAULT NULL,
  `fecha_venta` date NOT NULL,
  `litros` decimal(10,2) NOT NULL,
  `precio_litro` decimal(12,2) NOT NULL,
  `total` decimal(12,2) NOT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ventas_leche`
--

INSERT INTO `ventas_leche` (`id_venta_leche`, `id_usuario`, `id_finca`, `id_cliente`, `fecha_venta`, `litros`, `precio_litro`, `total`, `observaciones`) VALUES
(3, 7, 7, 3, '2026-06-15', 12.00, 2000.00, 24000.00, 'Venta autom?tica test');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alertas`
--
ALTER TABLE `alertas`
  ADD PRIMARY KEY (`id_alerta`),
  ADD KEY `idx_alertas_usuario_estado` (`id_usuario`,`estado`),
  ADD KEY `idx_alertas_fecha` (`fecha_alerta`),
  ADD KEY `idx_alertas_animal` (`id_animal`),
  ADD KEY `fk_alertas_finca` (`id_finca`);

--
-- Indices de la tabla `animales`
--
ALTER TABLE `animales`
  ADD PRIMARY KEY (`id_animal`),
  ADD KEY `id_finca` (`id_finca`),
  ADD KEY `idx_animales_chapeta` (`chapeta`),
  ADD KEY `idx_animales_estado_productivo` (`estado_productivo`),
  ADD KEY `idx_animales_estado_comercial` (`estado_comercial`),
  ADD KEY `fk_animales_padre` (`id_padre`),
  ADD KEY `fk_animales_madre` (`id_madre`);

--
-- Indices de la tabla `archivos`
--
ALTER TABLE `archivos`
  ADD PRIMARY KEY (`id_archivo`),
  ADD KEY `idx_archivos_usuario` (`id_usuario`),
  ADD KEY `idx_archivos_modulo_ref` (`modulo`,`id_referencia`);

--
-- Indices de la tabla `categorias_financieras`
--
ALTER TABLE `categorias_financieras`
  ADD PRIMARY KEY (`id_categoria`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id_cliente`),
  ADD KEY `idx_clientes_usuario` (`id_usuario`);

--
-- Indices de la tabla `compras_animales`
--
ALTER TABLE `compras_animales`
  ADD PRIMARY KEY (`id_compra_animal`),
  ADD KEY `idx_compras_animales_usuario` (`id_usuario`),
  ADD KEY `idx_compras_animales_finca` (`id_finca`),
  ADD KEY `fk_compras_animales_animal` (`id_animal`),
  ADD KEY `fk_compras_animales_proveedor` (`id_proveedor`);

--
-- Indices de la tabla `cuentas_por_cobrar`
--
ALTER TABLE `cuentas_por_cobrar`
  ADD PRIMARY KEY (`id_cuenta_cobrar`),
  ADD KEY `idx_cpc_usuario_estado` (`id_usuario`,`estado`),
  ADD KEY `idx_cpc_vencimiento` (`fecha_vencimiento`),
  ADD KEY `fk_cpc_finca` (`id_finca`),
  ADD KEY `fk_cpc_cliente` (`id_cliente`);

--
-- Indices de la tabla `cuentas_por_pagar`
--
ALTER TABLE `cuentas_por_pagar`
  ADD PRIMARY KEY (`id_cuenta_pagar`),
  ADD KEY `idx_cpp_usuario_estado` (`id_usuario`,`estado`),
  ADD KEY `idx_cpp_vencimiento` (`fecha_vencimiento`),
  ADD KEY `fk_cpp_finca` (`id_finca`),
  ADD KEY `fk_cpp_proveedor` (`id_proveedor`);

--
-- Indices de la tabla `desparasitaciones`
--
ALTER TABLE `desparasitaciones`
  ADD PRIMARY KEY (`id_desparasitacion`),
  ADD KEY `idx_desparas_animal` (`id_animal`),
  ADD KEY `fk_desparas_medicamento` (`id_medicamento`);

--
-- Indices de la tabla `diagnosticos_prenez`
--
ALTER TABLE `diagnosticos_prenez`
  ADD PRIMARY KEY (`id_diagnostico`),
  ADD KEY `idx_prenez_servicio` (`id_servicio`),
  ADD KEY `idx_prenez_hembra` (`id_hembra`);

--
-- Indices de la tabla `enfermedades`
--
ALTER TABLE `enfermedades`
  ADD PRIMARY KEY (`id_enfermedad`),
  ADD KEY `idx_enfermedades_usuario` (`id_usuario`);

--
-- Indices de la tabla `eventos_animales`
--
ALTER TABLE `eventos_animales`
  ADD PRIMARY KEY (`id_evento`),
  ADD KEY `idx_eventos_animal` (`id_animal`),
  ADD KEY `idx_eventos_usuario` (`id_usuario`),
  ADD KEY `idx_eventos_tipo_fecha` (`tipo_evento`,`fecha_evento`);

--
-- Indices de la tabla `fincas`
--
ALTER TABLE `fincas`
  ADD PRIMARY KEY (`id_finca`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `gastos`
--
ALTER TABLE `gastos`
  ADD PRIMARY KEY (`id_gasto`),
  ADD KEY `id_finca` (`id_finca`),
  ADD KEY `fk_gastos_categoria` (`id_categoria`),
  ADD KEY `idx_gastos_animal` (`id_animal`),
  ADD KEY `idx_gastos_proveedor` (`id_proveedor`),
  ADD KEY `idx_gastos_fecha` (`fecha`);

--
-- Indices de la tabla `ingresos`
--
ALTER TABLE `ingresos`
  ADD PRIMARY KEY (`id_ingreso`),
  ADD KEY `id_finca` (`id_finca`),
  ADD KEY `fk_ingresos_categoria` (`id_categoria`),
  ADD KEY `idx_ingresos_animal` (`id_animal`),
  ADD KEY `idx_ingresos_cliente` (`id_cliente`),
  ADD KEY `idx_ingresos_fecha` (`fecha`);

--
-- Indices de la tabla `insumos`
--
ALTER TABLE `insumos`
  ADD PRIMARY KEY (`id_insumo`),
  ADD KEY `idx_insumos_usuario_tipo` (`id_usuario`,`tipo`);

--
-- Indices de la tabla `inventario_insumos`
--
ALTER TABLE `inventario_insumos`
  ADD PRIMARY KEY (`id_inventario`),
  ADD UNIQUE KEY `uq_inventario_insumo_finca_lote` (`id_insumo`,`id_finca`,`lote`),
  ADD KEY `idx_inventario_finca` (`id_finca`),
  ADD KEY `idx_inventario_vencimiento` (`fecha_vencimiento`);

--
-- Indices de la tabla `lotes_ceba`
--
ALTER TABLE `lotes_ceba`
  ADD PRIMARY KEY (`id_lote_ceba`),
  ADD KEY `idx_lotes_ceba_finca` (`id_finca`);

--
-- Indices de la tabla `lote_ceba_animales`
--
ALTER TABLE `lote_ceba_animales`
  ADD PRIMARY KEY (`id_lote_ceba_animal`),
  ADD UNIQUE KEY `uq_lote_animal` (`id_lote_ceba`,`id_animal`),
  ADD KEY `fk_lote_ceba_animal_animal` (`id_animal`);

--
-- Indices de la tabla `medicamentos`
--
ALTER TABLE `medicamentos`
  ADD PRIMARY KEY (`id_medicamento`),
  ADD KEY `idx_medicamentos_usuario` (`id_usuario`);

--
-- Indices de la tabla `movimientos_inventario`
--
ALTER TABLE `movimientos_inventario`
  ADD PRIMARY KEY (`id_movimiento_inventario`),
  ADD KEY `idx_mov_inv_insumo` (`id_insumo`),
  ADD KEY `idx_mov_inv_finca_fecha` (`id_finca`,`fecha_movimiento`),
  ADD KEY `fk_mov_inv_proveedor` (`id_proveedor`);

--
-- Indices de la tabla `movimientos_potrero`
--
ALTER TABLE `movimientos_potrero`
  ADD PRIMARY KEY (`id_movimiento_potrero`),
  ADD KEY `idx_mov_potrero_animal` (`id_animal`),
  ADD KEY `idx_mov_potrero_destino` (`id_potrero_destino`),
  ADD KEY `fk_mov_potrero_origen` (`id_potrero_origen`);

--
-- Indices de la tabla `partos`
--
ALTER TABLE `partos`
  ADD PRIMARY KEY (`id_parto`),
  ADD KEY `idx_partos_madre` (`id_madre`),
  ADD KEY `idx_partos_cria` (`id_cria`),
  ADD KEY `fk_partos_servicio` (`id_servicio`);

--
-- Indices de la tabla `potreros`
--
ALTER TABLE `potreros`
  ADD PRIMARY KEY (`id_potrero`),
  ADD KEY `idx_potreros_finca` (`id_finca`),
  ADD KEY `idx_potreros_estado` (`estado`);

--
-- Indices de la tabla `produccion_leche`
--
ALTER TABLE `produccion_leche`
  ADD PRIMARY KEY (`id_produccion_leche`),
  ADD KEY `idx_leche_animal` (`id_animal`),
  ADD KEY `idx_leche_finca_fecha` (`id_finca`,`fecha`);

--
-- Indices de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`id_proveedor`),
  ADD KEY `idx_proveedores_usuario` (`id_usuario`);

--
-- Indices de la tabla `registros_peso`
--
ALTER TABLE `registros_peso`
  ADD PRIMARY KEY (`id_peso`),
  ADD KEY `id_animal` (`id_animal`);

--
-- Indices de la tabla `registros_vacunacion`
--
ALTER TABLE `registros_vacunacion`
  ADD PRIMARY KEY (`id_registro`),
  ADD KEY `id_animal` (`id_animal`),
  ADD KEY `id_vacuna` (`id_vacuna`);

--
-- Indices de la tabla `servicios_reproductivos`
--
ALTER TABLE `servicios_reproductivos`
  ADD PRIMARY KEY (`id_servicio`),
  ADD KEY `idx_servicios_hembra` (`id_hembra`),
  ADD KEY `idx_servicios_usuario` (`id_usuario`),
  ADD KEY `idx_servicios_fecha` (`fecha_servicio`),
  ADD KEY `fk_servicios_macho` (`id_macho`);

--
-- Indices de la tabla `tratamientos`
--
ALTER TABLE `tratamientos`
  ADD PRIMARY KEY (`id_tratamiento`),
  ADD KEY `idx_tratamientos_animal` (`id_animal`),
  ADD KEY `idx_tratamientos_estado` (`estado`),
  ADD KEY `fk_tratamientos_enfermedad` (`id_enfermedad`);

--
-- Indices de la tabla `tratamiento_medicamentos`
--
ALTER TABLE `tratamiento_medicamentos`
  ADD PRIMARY KEY (`id_tratamiento_medicamento`),
  ADD KEY `idx_tm_tratamiento` (`id_tratamiento`),
  ADD KEY `idx_tm_medicamento` (`id_medicamento`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- Indices de la tabla `vacunas`
--
ALTER TABLE `vacunas`
  ADD PRIMARY KEY (`id_vacuna`),
  ADD KEY `fk_vacunas_usuarios` (`id_usuario`);

--
-- Indices de la tabla `ventas_animales`
--
ALTER TABLE `ventas_animales`
  ADD PRIMARY KEY (`id_venta_animal`),
  ADD KEY `idx_ventas_animales_usuario` (`id_usuario`),
  ADD KEY `idx_ventas_animales_finca` (`id_finca`),
  ADD KEY `fk_ventas_animales_animal` (`id_animal`),
  ADD KEY `fk_ventas_animales_cliente` (`id_cliente`);

--
-- Indices de la tabla `ventas_leche`
--
ALTER TABLE `ventas_leche`
  ADD PRIMARY KEY (`id_venta_leche`),
  ADD KEY `idx_ventas_leche_usuario` (`id_usuario`),
  ADD KEY `idx_ventas_leche_finca_fecha` (`id_finca`,`fecha_venta`),
  ADD KEY `fk_ventas_leche_cliente` (`id_cliente`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `alertas`
--
ALTER TABLE `alertas`
  MODIFY `id_alerta` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `animales`
--
ALTER TABLE `animales`
  MODIFY `id_animal` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `archivos`
--
ALTER TABLE `archivos`
  MODIFY `id_archivo` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `categorias_financieras`
--
ALTER TABLE `categorias_financieras`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `compras_animales`
--
ALTER TABLE `compras_animales`
  MODIFY `id_compra_animal` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `cuentas_por_cobrar`
--
ALTER TABLE `cuentas_por_cobrar`
  MODIFY `id_cuenta_cobrar` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `cuentas_por_pagar`
--
ALTER TABLE `cuentas_por_pagar`
  MODIFY `id_cuenta_pagar` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `desparasitaciones`
--
ALTER TABLE `desparasitaciones`
  MODIFY `id_desparasitacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `diagnosticos_prenez`
--
ALTER TABLE `diagnosticos_prenez`
  MODIFY `id_diagnostico` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `enfermedades`
--
ALTER TABLE `enfermedades`
  MODIFY `id_enfermedad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `eventos_animales`
--
ALTER TABLE `eventos_animales`
  MODIFY `id_evento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `fincas`
--
ALTER TABLE `fincas`
  MODIFY `id_finca` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `gastos`
--
ALTER TABLE `gastos`
  MODIFY `id_gasto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `ingresos`
--
ALTER TABLE `ingresos`
  MODIFY `id_ingreso` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `insumos`
--
ALTER TABLE `insumos`
  MODIFY `id_insumo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `inventario_insumos`
--
ALTER TABLE `inventario_insumos`
  MODIFY `id_inventario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `lotes_ceba`
--
ALTER TABLE `lotes_ceba`
  MODIFY `id_lote_ceba` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `lote_ceba_animales`
--
ALTER TABLE `lote_ceba_animales`
  MODIFY `id_lote_ceba_animal` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `medicamentos`
--
ALTER TABLE `medicamentos`
  MODIFY `id_medicamento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `movimientos_inventario`
--
ALTER TABLE `movimientos_inventario`
  MODIFY `id_movimiento_inventario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `movimientos_potrero`
--
ALTER TABLE `movimientos_potrero`
  MODIFY `id_movimiento_potrero` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `partos`
--
ALTER TABLE `partos`
  MODIFY `id_parto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `potreros`
--
ALTER TABLE `potreros`
  MODIFY `id_potrero` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `produccion_leche`
--
ALTER TABLE `produccion_leche`
  MODIFY `id_produccion_leche` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id_proveedor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `registros_peso`
--
ALTER TABLE `registros_peso`
  MODIFY `id_peso` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `registros_vacunacion`
--
ALTER TABLE `registros_vacunacion`
  MODIFY `id_registro` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `servicios_reproductivos`
--
ALTER TABLE `servicios_reproductivos`
  MODIFY `id_servicio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `tratamientos`
--
ALTER TABLE `tratamientos`
  MODIFY `id_tratamiento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `tratamiento_medicamentos`
--
ALTER TABLE `tratamiento_medicamentos`
  MODIFY `id_tratamiento_medicamento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `vacunas`
--
ALTER TABLE `vacunas`
  MODIFY `id_vacuna` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `ventas_animales`
--
ALTER TABLE `ventas_animales`
  MODIFY `id_venta_animal` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `ventas_leche`
--
ALTER TABLE `ventas_leche`
  MODIFY `id_venta_leche` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `alertas`
--
ALTER TABLE `alertas`
  ADD CONSTRAINT `fk_alertas_animal` FOREIGN KEY (`id_animal`) REFERENCES `animales` (`id_animal`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_alertas_finca` FOREIGN KEY (`id_finca`) REFERENCES `fincas` (`id_finca`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_alertas_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `animales`
--
ALTER TABLE `animales`
  ADD CONSTRAINT `animales_ibfk_1` FOREIGN KEY (`id_finca`) REFERENCES `fincas` (`id_finca`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_animales_madre` FOREIGN KEY (`id_madre`) REFERENCES `animales` (`id_animal`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_animales_padre` FOREIGN KEY (`id_padre`) REFERENCES `animales` (`id_animal`) ON DELETE SET NULL;

--
-- Filtros para la tabla `archivos`
--
ALTER TABLE `archivos`
  ADD CONSTRAINT `fk_archivos_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `categorias_financieras`
--
ALTER TABLE `categorias_financieras`
  ADD CONSTRAINT `categorias_financieras_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD CONSTRAINT `fk_clientes_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `compras_animales`
--
ALTER TABLE `compras_animales`
  ADD CONSTRAINT `fk_compras_animales_animal` FOREIGN KEY (`id_animal`) REFERENCES `animales` (`id_animal`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_compras_animales_finca` FOREIGN KEY (`id_finca`) REFERENCES `fincas` (`id_finca`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_compras_animales_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_compras_animales_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `cuentas_por_cobrar`
--
ALTER TABLE `cuentas_por_cobrar`
  ADD CONSTRAINT `fk_cpc_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_cpc_finca` FOREIGN KEY (`id_finca`) REFERENCES `fincas` (`id_finca`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_cpc_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `cuentas_por_pagar`
--
ALTER TABLE `cuentas_por_pagar`
  ADD CONSTRAINT `fk_cpp_finca` FOREIGN KEY (`id_finca`) REFERENCES `fincas` (`id_finca`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_cpp_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_cpp_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `desparasitaciones`
--
ALTER TABLE `desparasitaciones`
  ADD CONSTRAINT `fk_desparas_animal` FOREIGN KEY (`id_animal`) REFERENCES `animales` (`id_animal`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_desparas_medicamento` FOREIGN KEY (`id_medicamento`) REFERENCES `medicamentos` (`id_medicamento`) ON DELETE SET NULL;

--
-- Filtros para la tabla `diagnosticos_prenez`
--
ALTER TABLE `diagnosticos_prenez`
  ADD CONSTRAINT `fk_prenez_hembra` FOREIGN KEY (`id_hembra`) REFERENCES `animales` (`id_animal`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_prenez_servicio` FOREIGN KEY (`id_servicio`) REFERENCES `servicios_reproductivos` (`id_servicio`) ON DELETE CASCADE;

--
-- Filtros para la tabla `enfermedades`
--
ALTER TABLE `enfermedades`
  ADD CONSTRAINT `fk_enfermedades_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `eventos_animales`
--
ALTER TABLE `eventos_animales`
  ADD CONSTRAINT `fk_eventos_animal` FOREIGN KEY (`id_animal`) REFERENCES `animales` (`id_animal`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_eventos_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `fincas`
--
ALTER TABLE `fincas`
  ADD CONSTRAINT `fincas_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `gastos`
--
ALTER TABLE `gastos`
  ADD CONSTRAINT `fk_gastos_animal` FOREIGN KEY (`id_animal`) REFERENCES `animales` (`id_animal`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_gastos_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categorias_financieras` (`id_categoria`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_gastos_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`) ON DELETE SET NULL,
  ADD CONSTRAINT `gastos_ibfk_1` FOREIGN KEY (`id_finca`) REFERENCES `fincas` (`id_finca`) ON DELETE CASCADE;

--
-- Filtros para la tabla `ingresos`
--
ALTER TABLE `ingresos`
  ADD CONSTRAINT `fk_ingresos_animal` FOREIGN KEY (`id_animal`) REFERENCES `animales` (`id_animal`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ingresos_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categorias_financieras` (`id_categoria`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ingresos_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`) ON DELETE SET NULL,
  ADD CONSTRAINT `ingresos_ibfk_1` FOREIGN KEY (`id_finca`) REFERENCES `fincas` (`id_finca`) ON DELETE CASCADE;

--
-- Filtros para la tabla `insumos`
--
ALTER TABLE `insumos`
  ADD CONSTRAINT `fk_insumos_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `inventario_insumos`
--
ALTER TABLE `inventario_insumos`
  ADD CONSTRAINT `fk_inventario_finca` FOREIGN KEY (`id_finca`) REFERENCES `fincas` (`id_finca`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_inventario_insumo` FOREIGN KEY (`id_insumo`) REFERENCES `insumos` (`id_insumo`) ON DELETE CASCADE;

--
-- Filtros para la tabla `lotes_ceba`
--
ALTER TABLE `lotes_ceba`
  ADD CONSTRAINT `fk_lotes_ceba_finca` FOREIGN KEY (`id_finca`) REFERENCES `fincas` (`id_finca`) ON DELETE CASCADE;

--
-- Filtros para la tabla `lote_ceba_animales`
--
ALTER TABLE `lote_ceba_animales`
  ADD CONSTRAINT `fk_lote_ceba_animal_animal` FOREIGN KEY (`id_animal`) REFERENCES `animales` (`id_animal`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_lote_ceba_animal_lote` FOREIGN KEY (`id_lote_ceba`) REFERENCES `lotes_ceba` (`id_lote_ceba`) ON DELETE CASCADE;

--
-- Filtros para la tabla `medicamentos`
--
ALTER TABLE `medicamentos`
  ADD CONSTRAINT `fk_medicamentos_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `movimientos_inventario`
--
ALTER TABLE `movimientos_inventario`
  ADD CONSTRAINT `fk_mov_inv_finca` FOREIGN KEY (`id_finca`) REFERENCES `fincas` (`id_finca`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_mov_inv_insumo` FOREIGN KEY (`id_insumo`) REFERENCES `insumos` (`id_insumo`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_mov_inv_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`) ON DELETE SET NULL;

--
-- Filtros para la tabla `movimientos_potrero`
--
ALTER TABLE `movimientos_potrero`
  ADD CONSTRAINT `fk_mov_potrero_animal` FOREIGN KEY (`id_animal`) REFERENCES `animales` (`id_animal`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_mov_potrero_destino` FOREIGN KEY (`id_potrero_destino`) REFERENCES `potreros` (`id_potrero`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_mov_potrero_origen` FOREIGN KEY (`id_potrero_origen`) REFERENCES `potreros` (`id_potrero`) ON DELETE SET NULL;

--
-- Filtros para la tabla `partos`
--
ALTER TABLE `partos`
  ADD CONSTRAINT `fk_partos_cria` FOREIGN KEY (`id_cria`) REFERENCES `animales` (`id_animal`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_partos_madre` FOREIGN KEY (`id_madre`) REFERENCES `animales` (`id_animal`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_partos_servicio` FOREIGN KEY (`id_servicio`) REFERENCES `servicios_reproductivos` (`id_servicio`) ON DELETE SET NULL;

--
-- Filtros para la tabla `potreros`
--
ALTER TABLE `potreros`
  ADD CONSTRAINT `fk_potreros_finca` FOREIGN KEY (`id_finca`) REFERENCES `fincas` (`id_finca`) ON DELETE CASCADE;

--
-- Filtros para la tabla `produccion_leche`
--
ALTER TABLE `produccion_leche`
  ADD CONSTRAINT `fk_leche_animal` FOREIGN KEY (`id_animal`) REFERENCES `animales` (`id_animal`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_leche_finca` FOREIGN KEY (`id_finca`) REFERENCES `fincas` (`id_finca`) ON DELETE CASCADE;

--
-- Filtros para la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD CONSTRAINT `fk_proveedores_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `registros_peso`
--
ALTER TABLE `registros_peso`
  ADD CONSTRAINT `registros_peso_ibfk_1` FOREIGN KEY (`id_animal`) REFERENCES `animales` (`id_animal`) ON DELETE CASCADE;

--
-- Filtros para la tabla `registros_vacunacion`
--
ALTER TABLE `registros_vacunacion`
  ADD CONSTRAINT `registros_vacunacion_ibfk_1` FOREIGN KEY (`id_animal`) REFERENCES `animales` (`id_animal`) ON DELETE CASCADE,
  ADD CONSTRAINT `registros_vacunacion_ibfk_2` FOREIGN KEY (`id_vacuna`) REFERENCES `vacunas` (`id_vacuna`) ON DELETE CASCADE;

--
-- Filtros para la tabla `servicios_reproductivos`
--
ALTER TABLE `servicios_reproductivos`
  ADD CONSTRAINT `fk_servicios_hembra` FOREIGN KEY (`id_hembra`) REFERENCES `animales` (`id_animal`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_servicios_macho` FOREIGN KEY (`id_macho`) REFERENCES `animales` (`id_animal`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_servicios_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `tratamientos`
--
ALTER TABLE `tratamientos`
  ADD CONSTRAINT `fk_tratamientos_animal` FOREIGN KEY (`id_animal`) REFERENCES `animales` (`id_animal`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tratamientos_enfermedad` FOREIGN KEY (`id_enfermedad`) REFERENCES `enfermedades` (`id_enfermedad`) ON DELETE SET NULL;

--
-- Filtros para la tabla `tratamiento_medicamentos`
--
ALTER TABLE `tratamiento_medicamentos`
  ADD CONSTRAINT `fk_tm_medicamento` FOREIGN KEY (`id_medicamento`) REFERENCES `medicamentos` (`id_medicamento`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tm_tratamiento` FOREIGN KEY (`id_tratamiento`) REFERENCES `tratamientos` (`id_tratamiento`) ON DELETE CASCADE;

--
-- Filtros para la tabla `vacunas`
--
ALTER TABLE `vacunas`
  ADD CONSTRAINT `fk_vacunas_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `ventas_animales`
--
ALTER TABLE `ventas_animales`
  ADD CONSTRAINT `fk_ventas_animales_animal` FOREIGN KEY (`id_animal`) REFERENCES `animales` (`id_animal`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ventas_animales_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ventas_animales_finca` FOREIGN KEY (`id_finca`) REFERENCES `fincas` (`id_finca`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ventas_animales_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `ventas_leche`
--
ALTER TABLE `ventas_leche`
  ADD CONSTRAINT `fk_ventas_leche_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ventas_leche_finca` FOREIGN KEY (`id_finca`) REFERENCES `fincas` (`id_finca`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ventas_leche_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
