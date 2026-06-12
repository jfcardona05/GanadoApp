-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 12-06-2026 a las 23:16:01
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
-- Estructura de tabla para la tabla `animales`
--

CREATE TABLE `animales` (
  `id_animal` int(11) NOT NULL,
  `id_finca` int(11) NOT NULL,
  `codigo` varchar(50) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `raza` varchar(100) DEFAULT NULL,
  `sexo` enum('MACHO','HEMBRA') NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `peso_actual` decimal(10,2) DEFAULT NULL,
  `estado_salud` enum('SANO','ENFERMO','EN_TRATAMIENTO','VENDIDO','MUERTO') DEFAULT 'SANO',
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `animales`
--

INSERT INTO `animales` (`id_animal`, `id_finca`, `codigo`, `nombre`, `foto`, `raza`, `sexo`, `fecha_nacimiento`, `peso_actual`, `estado_salud`, `fecha_registro`) VALUES
(4, 3, 'A001', 'x1', NULL, 'Angus', 'MACHO', '2026-06-11', 450.00, 'SANO', '2026-06-12 03:55:49'),
(5, 4, 'A001', 'Toro', NULL, 'Rojo', 'MACHO', '2026-06-11', 429.00, 'SANO', '2026-06-12 04:30:06'),
(8, 2, 'A001', 'Toro negro', NULL, 'brahman', 'MACHO', '2026-06-12', 489.00, 'SANO', '2026-06-12 05:37:55'),
(9, 2, 'A002', 'Toro Verde', NULL, 'Brahman', 'MACHO', '2026-06-12', 490.00, 'SANO', '2026-06-12 20:10:21');

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
(1, 1, 'Concentrado', 'GASTO', '2026-06-12 04:48:04'),
(2, 1, 'Venta de leche', 'INGRESO', '2026-06-12 04:48:21'),
(3, 2, 'Alimento', 'GASTO', '2026-06-12 04:55:09'),
(4, 2, 'Medicamento', 'GASTO', '2026-06-12 04:55:22'),
(5, 2, 'Leche', 'INGRESO', '2026-06-12 04:55:52'),
(6, 2, 'Carne', 'INGRESO', '2026-06-12 04:55:56');

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
(2, 1, 'Finca Don Juan', 'Puerto lopez, Meta', 50.00, '2026-06-11 04:44:10'),
(3, 3, 'Finca Don Pérez', 'Villavicencio, Meta', 28.00, '2026-06-12 03:53:17'),
(4, 2, 'Finca Cardona', 'Villavicencio, Meta', 60.00, '2026-06-12 04:29:31');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gastos`
--

CREATE TABLE `gastos` (
  `id_gasto` int(11) NOT NULL,
  `id_finca` int(11) NOT NULL,
  `id_categoria` int(11) DEFAULT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `monto` decimal(12,2) NOT NULL,
  `fecha` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `gastos`
--

INSERT INTO `gastos` (`id_gasto`, `id_finca`, `id_categoria`, `categoria`, `descripcion`, `monto`, `fecha`) VALUES
(1, 2, NULL, 'ALIMENTACION', 'Compra de concentrado', 250000.00, '2026-06-11'),
(2, 2, 1, 'Concentrado', 'Compra de concentrado para el ganado', 250000.00, '2026-06-11'),
(3, 4, 3, 'Alimento', 'Vacas', 1000000.00, '2026-06-11');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ingresos`
--

CREATE TABLE `ingresos` (
  `id_ingreso` int(11) NOT NULL,
  `id_finca` int(11) NOT NULL,
  `id_categoria` int(11) DEFAULT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `monto` decimal(12,2) NOT NULL,
  `fecha` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ingresos`
--

INSERT INTO `ingresos` (`id_ingreso`, `id_finca`, `id_categoria`, `categoria`, `descripcion`, `monto`, `fecha`) VALUES
(1, 2, NULL, 'VENTA_GANADO', 'Venta de un novillo', 3200000.00, '2026-06-11'),
(3, 2, 2, 'Venta de leche', 'Venta de leche semanal', 500000.00, '2026-06-11'),
(4, 4, 6, 'Carne', 'x', 250000.00, '2026-06-11'),
(5, 4, 5, 'Leche', 'x', 1500000.00, '2026-06-11');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registros_peso`
--

CREATE TABLE `registros_peso` (
  `id_peso` int(11) NOT NULL,
  `id_animal` int(11) NOT NULL,
  `peso` decimal(10,2) NOT NULL,
  `fecha_registro` date NOT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `registros_peso`
--

INSERT INTO `registros_peso` (`id_peso`, `id_animal`, `peso`, `fecha_registro`, `observaciones`) VALUES
(3, 8, 489.00, '2026-06-12', 'Registro inicial al crear el animal'),
(4, 9, 490.00, '2026-06-12', 'Registro inicial al crear el animal');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registros_vacunacion`
--

CREATE TABLE `registros_vacunacion` (
  `id_registro` int(11) NOT NULL,
  `id_animal` int(11) NOT NULL,
  `id_vacuna` int(11) NOT NULL,
  `fecha_aplicacion` date NOT NULL,
  `proxima_fecha` date DEFAULT NULL,
  `veterinario` varchar(100) DEFAULT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `registros_vacunacion`
--

INSERT INTO `registros_vacunacion` (`id_registro`, `id_animal`, `id_vacuna`, `fecha_aplicacion`, `proxima_fecha`, `veterinario`, `observaciones`) VALUES
(5, 5, 6, '2026-06-11', '2026-10-09', 'Dr. Andres', 'nignuan');

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
(1, 'Juan', 'juan@test.com', '$2b$10$3MKKimsoO0zlXLxVNRvdRuQCCZHcfBhbC0Tu39WYSi824ZvcEGCYi', 'GANADERO', '2026-06-11 04:24:53'),
(2, 'Juan Cardona', 'cardona@test.com', '$2b$10$kzYHWclg0aFnsAXFD2Vc7Okvy7TIG.K5iSasla7f508xIQFyECFsK', 'GANADERO', '2026-06-11 05:53:09'),
(3, 'Juan Perez', 'perez@gmail.com', '$2b$10$WFNuM0QjxzYr1IBYly9KOO1rlfKOzxLsLSeKg4NEmDSIt6z1jPure', 'GANADERO', '2026-06-12 03:52:20');

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
(5, 3, 'XXX', 'plagas', 120, 1),
(6, 2, 'YYY', 'LARVAS', 120, 1),
(7, 1, 'Vacuna X', 'Anti plagas', 150, 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `animales`
--
ALTER TABLE `animales`
  ADD PRIMARY KEY (`id_animal`),
  ADD KEY `id_finca` (`id_finca`);

--
-- Indices de la tabla `categorias_financieras`
--
ALTER TABLE `categorias_financieras`
  ADD PRIMARY KEY (`id_categoria`),
  ADD KEY `id_usuario` (`id_usuario`);

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
  ADD KEY `fk_gastos_categoria` (`id_categoria`);

--
-- Indices de la tabla `ingresos`
--
ALTER TABLE `ingresos`
  ADD PRIMARY KEY (`id_ingreso`),
  ADD KEY `id_finca` (`id_finca`),
  ADD KEY `fk_ingresos_categoria` (`id_categoria`);

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
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `animales`
--
ALTER TABLE `animales`
  MODIFY `id_animal` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `categorias_financieras`
--
ALTER TABLE `categorias_financieras`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `fincas`
--
ALTER TABLE `fincas`
  MODIFY `id_finca` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `gastos`
--
ALTER TABLE `gastos`
  MODIFY `id_gasto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `ingresos`
--
ALTER TABLE `ingresos`
  MODIFY `id_ingreso` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `registros_peso`
--
ALTER TABLE `registros_peso`
  MODIFY `id_peso` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `registros_vacunacion`
--
ALTER TABLE `registros_vacunacion`
  MODIFY `id_registro` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `vacunas`
--
ALTER TABLE `vacunas`
  MODIFY `id_vacuna` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `animales`
--
ALTER TABLE `animales`
  ADD CONSTRAINT `animales_ibfk_1` FOREIGN KEY (`id_finca`) REFERENCES `fincas` (`id_finca`) ON DELETE CASCADE;

--
-- Filtros para la tabla `categorias_financieras`
--
ALTER TABLE `categorias_financieras`
  ADD CONSTRAINT `categorias_financieras_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `fincas`
--
ALTER TABLE `fincas`
  ADD CONSTRAINT `fincas_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `gastos`
--
ALTER TABLE `gastos`
  ADD CONSTRAINT `fk_gastos_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categorias_financieras` (`id_categoria`) ON DELETE SET NULL,
  ADD CONSTRAINT `gastos_ibfk_1` FOREIGN KEY (`id_finca`) REFERENCES `fincas` (`id_finca`) ON DELETE CASCADE;

--
-- Filtros para la tabla `ingresos`
--
ALTER TABLE `ingresos`
  ADD CONSTRAINT `fk_ingresos_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categorias_financieras` (`id_categoria`) ON DELETE SET NULL,
  ADD CONSTRAINT `ingresos_ibfk_1` FOREIGN KEY (`id_finca`) REFERENCES `fincas` (`id_finca`) ON DELETE CASCADE;

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
-- Filtros para la tabla `vacunas`
--
ALTER TABLE `vacunas`
  ADD CONSTRAINT `fk_vacunas_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
