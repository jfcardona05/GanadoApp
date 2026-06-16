-- GanadoApp - Migracion funcional avanzada
-- Fecha: 2026-06-15
-- Motor objetivo: MySQL/MariaDB
--
-- IMPORTANTE:
-- 1. Probar primero en local con XAMPP/phpMyAdmin.
-- 2. Hacer backup antes de ejecutar en Railway.
-- 3. Ejecutar una sola vez. Este archivo agrega tablas/columnas para una gestion ganadera completa.

SET FOREIGN_KEY_CHECKS = 0;

-- =========================================================
-- 1. AMPLIACION DE ANIMALES
-- =========================================================

ALTER TABLE animales
  ADD COLUMN chapeta VARCHAR(50) NULL AFTER codigo,
  ADD COLUMN codigo_alterno VARCHAR(50) NULL AFTER chapeta,
  ADD COLUMN color VARCHAR(80) NULL AFTER raza,
  ADD COLUMN procedencia ENUM('NACIDO_EN_FINCA','COMPRADO','TRASLADADO','OTRO') DEFAULT 'NACIDO_EN_FINCA' AFTER color,
  ADD COLUMN id_padre INT NULL AFTER procedencia,
  ADD COLUMN id_madre INT NULL AFTER id_padre,
  ADD COLUMN fecha_ingreso DATE NULL AFTER fecha_nacimiento,
  ADD COLUMN estado_productivo ENUM('CRIA','LEVANTE','CEBA','REPRODUCTOR','VACA_PRODUCCION','SECA','DESCARTE','OTRO') DEFAULT 'LEVANTE' AFTER peso_actual,
  ADD COLUMN estado_comercial ENUM('ACTIVO','EN_VENTA','VENDIDO','MUERTO','DESCARTADO') DEFAULT 'ACTIVO' AFTER estado_salud,
  ADD COLUMN valor_estimado DECIMAL(12,2) NULL AFTER estado_comercial,
  ADD COLUMN precio_compra DECIMAL(12,2) NULL AFTER valor_estimado,
  ADD COLUMN fecha_salida DATE NULL AFTER precio_compra,
  ADD COLUMN motivo_salida VARCHAR(255) NULL AFTER fecha_salida;

ALTER TABLE animales
  ADD KEY idx_animales_chapeta (chapeta),
  ADD KEY idx_animales_estado_productivo (estado_productivo),
  ADD KEY idx_animales_estado_comercial (estado_comercial),
  ADD KEY fk_animales_padre (id_padre),
  ADD KEY fk_animales_madre (id_madre),
  ADD CONSTRAINT fk_animales_padre FOREIGN KEY (id_padre) REFERENCES animales(id_animal) ON DELETE SET NULL,
  ADD CONSTRAINT fk_animales_madre FOREIGN KEY (id_madre) REFERENCES animales(id_animal) ON DELETE SET NULL;

-- =========================================================
-- 2. POTREROS Y ROTACION
-- =========================================================

CREATE TABLE potreros (
  id_potrero INT NOT NULL AUTO_INCREMENT,
  id_finca INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  area_hectareas DECIMAL(10,2) NULL,
  tipo_pasto VARCHAR(100) NULL,
  capacidad_animales INT NULL,
  estado ENUM('DISPONIBLE','OCUPADO','DESCANSO','MANTENIMIENTO') DEFAULT 'DISPONIBLE',
  agua_disponible TINYINT(1) DEFAULT 0,
  sombra_disponible TINYINT(1) DEFAULT 0,
  observaciones TEXT NULL,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_potrero),
  KEY idx_potreros_finca (id_finca),
  KEY idx_potreros_estado (estado),
  CONSTRAINT fk_potreros_finca FOREIGN KEY (id_finca) REFERENCES fincas(id_finca) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE movimientos_potrero (
  id_movimiento_potrero INT NOT NULL AUTO_INCREMENT,
  id_animal INT NOT NULL,
  id_potrero_origen INT NULL,
  id_potrero_destino INT NOT NULL,
  fecha_movimiento DATE NOT NULL,
  motivo VARCHAR(255) NULL,
  observaciones TEXT NULL,
  fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_movimiento_potrero),
  KEY idx_mov_potrero_animal (id_animal),
  KEY idx_mov_potrero_destino (id_potrero_destino),
  CONSTRAINT fk_mov_potrero_animal FOREIGN KEY (id_animal) REFERENCES animales(id_animal) ON DELETE CASCADE,
  CONSTRAINT fk_mov_potrero_origen FOREIGN KEY (id_potrero_origen) REFERENCES potreros(id_potrero) ON DELETE SET NULL,
  CONSTRAINT fk_mov_potrero_destino FOREIGN KEY (id_potrero_destino) REFERENCES potreros(id_potrero) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- 3. LINEA DE TIEMPO / TRAZABILIDAD
-- =========================================================

CREATE TABLE eventos_animales (
  id_evento INT NOT NULL AUTO_INCREMENT,
  id_animal INT NOT NULL,
  id_usuario INT NOT NULL,
  tipo_evento ENUM(
    'NACIMIENTO','COMPRA','VENTA','MUERTE','PESO','VACUNA','TRATAMIENTO',
    'REPRODUCCION','CAMBIO_POTRERO','PRODUCCION','FINANZA','OBSERVACION'
  ) NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  descripcion TEXT NULL,
  fecha_evento DATE NOT NULL,
  modulo_origen VARCHAR(80) NULL,
  id_referencia INT NULL,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_evento),
  KEY idx_eventos_animal (id_animal),
  KEY idx_eventos_usuario (id_usuario),
  KEY idx_eventos_tipo_fecha (tipo_evento, fecha_evento),
  CONSTRAINT fk_eventos_animal FOREIGN KEY (id_animal) REFERENCES animales(id_animal) ON DELETE CASCADE,
  CONSTRAINT fk_eventos_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- 4. REPRODUCCION
-- =========================================================

CREATE TABLE servicios_reproductivos (
  id_servicio INT NOT NULL AUTO_INCREMENT,
  id_hembra INT NOT NULL,
  id_macho INT NULL,
  id_usuario INT NOT NULL,
  tipo ENUM('CELO','MONTA_NATURAL','INSEMINACION','TRANSFERENCIA_EMBRIONARIA') NOT NULL,
  fecha_servicio DATE NOT NULL,
  pajilla_codigo VARCHAR(100) NULL,
  responsable VARCHAR(120) NULL,
  resultado ENUM('PENDIENTE','PRENADA','NO_PRENADA','REPETICION_CELO','ABORTO') DEFAULT 'PENDIENTE',
  observaciones TEXT NULL,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_servicio),
  KEY idx_servicios_hembra (id_hembra),
  KEY idx_servicios_usuario (id_usuario),
  KEY idx_servicios_fecha (fecha_servicio),
  CONSTRAINT fk_servicios_hembra FOREIGN KEY (id_hembra) REFERENCES animales(id_animal) ON DELETE CASCADE,
  CONSTRAINT fk_servicios_macho FOREIGN KEY (id_macho) REFERENCES animales(id_animal) ON DELETE SET NULL,
  CONSTRAINT fk_servicios_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE diagnosticos_prenez (
  id_diagnostico INT NOT NULL AUTO_INCREMENT,
  id_servicio INT NOT NULL,
  id_hembra INT NOT NULL,
  fecha_diagnostico DATE NOT NULL,
  resultado ENUM('PRENADA','VACIA','DUDOSA') NOT NULL,
  metodo VARCHAR(100) NULL,
  fecha_probable_parto DATE NULL,
  veterinario VARCHAR(120) NULL,
  observaciones TEXT NULL,
  PRIMARY KEY (id_diagnostico),
  KEY idx_prenez_servicio (id_servicio),
  KEY idx_prenez_hembra (id_hembra),
  CONSTRAINT fk_prenez_servicio FOREIGN KEY (id_servicio) REFERENCES servicios_reproductivos(id_servicio) ON DELETE CASCADE,
  CONSTRAINT fk_prenez_hembra FOREIGN KEY (id_hembra) REFERENCES animales(id_animal) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE partos (
  id_parto INT NOT NULL AUTO_INCREMENT,
  id_madre INT NOT NULL,
  id_servicio INT NULL,
  id_cria INT NULL,
  fecha_parto DATE NOT NULL,
  tipo_parto ENUM('NORMAL','ASISTIDO','CESAREA','ABORTO') DEFAULT 'NORMAL',
  sexo_cria ENUM('MACHO','HEMBRA') NULL,
  peso_cria DECIMAL(10,2) NULL,
  estado_cria ENUM('VIVA','MUERTA','DEBIL') DEFAULT 'VIVA',
  observaciones TEXT NULL,
  PRIMARY KEY (id_parto),
  KEY idx_partos_madre (id_madre),
  KEY idx_partos_cria (id_cria),
  CONSTRAINT fk_partos_madre FOREIGN KEY (id_madre) REFERENCES animales(id_animal) ON DELETE CASCADE,
  CONSTRAINT fk_partos_servicio FOREIGN KEY (id_servicio) REFERENCES servicios_reproductivos(id_servicio) ON DELETE SET NULL,
  CONSTRAINT fk_partos_cria FOREIGN KEY (id_cria) REFERENCES animales(id_animal) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- 5. SANIDAD AVANZADA
-- =========================================================

CREATE TABLE enfermedades (
  id_enfermedad INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT NULL,
  activa TINYINT(1) DEFAULT 1,
  PRIMARY KEY (id_enfermedad),
  KEY idx_enfermedades_usuario (id_usuario),
  CONSTRAINT fk_enfermedades_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE medicamentos (
  id_medicamento INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  principio_activo VARCHAR(120) NULL,
  unidad_medida VARCHAR(50) NULL,
  periodo_retiro_leche_dias INT DEFAULT 0,
  periodo_retiro_carne_dias INT DEFAULT 0,
  observaciones TEXT NULL,
  activo TINYINT(1) DEFAULT 1,
  PRIMARY KEY (id_medicamento),
  KEY idx_medicamentos_usuario (id_usuario),
  CONSTRAINT fk_medicamentos_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE tratamientos (
  id_tratamiento INT NOT NULL AUTO_INCREMENT,
  id_animal INT NOT NULL,
  id_enfermedad INT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NULL,
  diagnostico VARCHAR(255) NULL,
  estado ENUM('ACTIVO','FINALIZADO','SUSPENDIDO') DEFAULT 'ACTIVO',
  veterinario VARCHAR(120) NULL,
  observaciones TEXT NULL,
  PRIMARY KEY (id_tratamiento),
  KEY idx_tratamientos_animal (id_animal),
  KEY idx_tratamientos_estado (estado),
  CONSTRAINT fk_tratamientos_animal FOREIGN KEY (id_animal) REFERENCES animales(id_animal) ON DELETE CASCADE,
  CONSTRAINT fk_tratamientos_enfermedad FOREIGN KEY (id_enfermedad) REFERENCES enfermedades(id_enfermedad) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE tratamiento_medicamentos (
  id_tratamiento_medicamento INT NOT NULL AUTO_INCREMENT,
  id_tratamiento INT NOT NULL,
  id_medicamento INT NOT NULL,
  dosis VARCHAR(100) NULL,
  frecuencia VARCHAR(100) NULL,
  via_aplicacion VARCHAR(80) NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NULL,
  observaciones TEXT NULL,
  PRIMARY KEY (id_tratamiento_medicamento),
  KEY idx_tm_tratamiento (id_tratamiento),
  KEY idx_tm_medicamento (id_medicamento),
  CONSTRAINT fk_tm_tratamiento FOREIGN KEY (id_tratamiento) REFERENCES tratamientos(id_tratamiento) ON DELETE CASCADE,
  CONSTRAINT fk_tm_medicamento FOREIGN KEY (id_medicamento) REFERENCES medicamentos(id_medicamento) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE desparasitaciones (
  id_desparasitacion INT NOT NULL AUTO_INCREMENT,
  id_animal INT NOT NULL,
  id_medicamento INT NULL,
  fecha_aplicacion DATE NOT NULL,
  proxima_fecha DATE NULL,
  producto VARCHAR(120) NULL,
  dosis VARCHAR(100) NULL,
  responsable VARCHAR(120) NULL,
  observaciones TEXT NULL,
  PRIMARY KEY (id_desparasitacion),
  KEY idx_desparas_animal (id_animal),
  CONSTRAINT fk_desparas_animal FOREIGN KEY (id_animal) REFERENCES animales(id_animal) ON DELETE CASCADE,
  CONSTRAINT fk_desparas_medicamento FOREIGN KEY (id_medicamento) REFERENCES medicamentos(id_medicamento) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE registros_vacunacion
  ADD COLUMN lote_vacuna VARCHAR(100) NULL AFTER id_vacuna,
  ADD COLUMN responsable VARCHAR(120) NULL AFTER veterinario,
  ADD COLUMN periodo_retiro_leche_dias INT DEFAULT 0 AFTER responsable,
  ADD COLUMN periodo_retiro_carne_dias INT DEFAULT 0 AFTER periodo_retiro_leche_dias;

-- =========================================================
-- 6. PESO / DESARROLLO
-- =========================================================

ALTER TABLE registros_peso
  ADD COLUMN tipo_pesaje ENUM('INICIAL','CONTROL','VENTA','COMPRA','OTRO') DEFAULT 'CONTROL' AFTER fecha_registro,
  ADD COLUMN condicion_corporal DECIMAL(3,1) NULL AFTER peso,
  ADD COLUMN responsable VARCHAR(120) NULL AFTER observaciones;

-- =========================================================
-- 7. PRODUCCION
-- =========================================================

CREATE TABLE produccion_leche (
  id_produccion_leche INT NOT NULL AUTO_INCREMENT,
  id_animal INT NULL,
  id_finca INT NOT NULL,
  fecha DATE NOT NULL,
  turno ENUM('MANANA','TARDE','NOCHE','TOTAL_DIA') DEFAULT 'TOTAL_DIA',
  litros DECIMAL(10,2) NOT NULL,
  destino ENUM('VENTA','CONSUMO_INTERNO','CRIA','DESCARTE','OTRO') DEFAULT 'VENTA',
  observaciones TEXT NULL,
  fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_produccion_leche),
  KEY idx_leche_animal (id_animal),
  KEY idx_leche_finca_fecha (id_finca, fecha),
  CONSTRAINT fk_leche_animal FOREIGN KEY (id_animal) REFERENCES animales(id_animal) ON DELETE SET NULL,
  CONSTRAINT fk_leche_finca FOREIGN KEY (id_finca) REFERENCES fincas(id_finca) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE lotes_ceba (
  id_lote_ceba INT NOT NULL AUTO_INCREMENT,
  id_finca INT NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NULL,
  estado ENUM('ACTIVO','FINALIZADO','CANCELADO') DEFAULT 'ACTIVO',
  observaciones TEXT NULL,
  PRIMARY KEY (id_lote_ceba),
  KEY idx_lotes_ceba_finca (id_finca),
  CONSTRAINT fk_lotes_ceba_finca FOREIGN KEY (id_finca) REFERENCES fincas(id_finca) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE lote_ceba_animales (
  id_lote_ceba_animal INT NOT NULL AUTO_INCREMENT,
  id_lote_ceba INT NOT NULL,
  id_animal INT NOT NULL,
  fecha_ingreso DATE NOT NULL,
  fecha_salida DATE NULL,
  PRIMARY KEY (id_lote_ceba_animal),
  UNIQUE KEY uq_lote_animal (id_lote_ceba, id_animal),
  CONSTRAINT fk_lote_ceba_animal_lote FOREIGN KEY (id_lote_ceba) REFERENCES lotes_ceba(id_lote_ceba) ON DELETE CASCADE,
  CONSTRAINT fk_lote_ceba_animal_animal FOREIGN KEY (id_animal) REFERENCES animales(id_animal) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- 8. CLIENTES, PROVEEDORES, COMPRAS Y VENTAS
-- =========================================================

CREATE TABLE proveedores (
  id_proveedor INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  telefono VARCHAR(50) NULL,
  correo VARCHAR(150) NULL,
  direccion VARCHAR(255) NULL,
  tipo VARCHAR(80) NULL,
  observaciones TEXT NULL,
  activo TINYINT(1) DEFAULT 1,
  PRIMARY KEY (id_proveedor),
  KEY idx_proveedores_usuario (id_usuario),
  CONSTRAINT fk_proveedores_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE clientes (
  id_cliente INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  telefono VARCHAR(50) NULL,
  correo VARCHAR(150) NULL,
  direccion VARCHAR(255) NULL,
  tipo VARCHAR(80) NULL,
  observaciones TEXT NULL,
  activo TINYINT(1) DEFAULT 1,
  PRIMARY KEY (id_cliente),
  KEY idx_clientes_usuario (id_usuario),
  CONSTRAINT fk_clientes_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE compras_animales (
  id_compra_animal INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_finca INT NOT NULL,
  id_animal INT NULL,
  id_proveedor INT NULL,
  fecha_compra DATE NOT NULL,
  precio DECIMAL(12,2) NOT NULL,
  peso_compra DECIMAL(10,2) NULL,
  descripcion VARCHAR(255) NULL,
  observaciones TEXT NULL,
  PRIMARY KEY (id_compra_animal),
  KEY idx_compras_animales_usuario (id_usuario),
  KEY idx_compras_animales_finca (id_finca),
  CONSTRAINT fk_compras_animales_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_compras_animales_finca FOREIGN KEY (id_finca) REFERENCES fincas(id_finca) ON DELETE CASCADE,
  CONSTRAINT fk_compras_animales_animal FOREIGN KEY (id_animal) REFERENCES animales(id_animal) ON DELETE SET NULL,
  CONSTRAINT fk_compras_animales_proveedor FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE ventas_animales (
  id_venta_animal INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_finca INT NOT NULL,
  id_animal INT NULL,
  id_cliente INT NULL,
  fecha_venta DATE NOT NULL,
  precio DECIMAL(12,2) NOT NULL,
  peso_venta DECIMAL(10,2) NULL,
  utilidad_estimada DECIMAL(12,2) NULL,
  descripcion VARCHAR(255) NULL,
  observaciones TEXT NULL,
  PRIMARY KEY (id_venta_animal),
  KEY idx_ventas_animales_usuario (id_usuario),
  KEY idx_ventas_animales_finca (id_finca),
  CONSTRAINT fk_ventas_animales_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_ventas_animales_finca FOREIGN KEY (id_finca) REFERENCES fincas(id_finca) ON DELETE CASCADE,
  CONSTRAINT fk_ventas_animales_animal FOREIGN KEY (id_animal) REFERENCES animales(id_animal) ON DELETE SET NULL,
  CONSTRAINT fk_ventas_animales_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE ventas_leche (
  id_venta_leche INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_finca INT NOT NULL,
  id_cliente INT NULL,
  fecha_venta DATE NOT NULL,
  litros DECIMAL(10,2) NOT NULL,
  precio_litro DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  observaciones TEXT NULL,
  PRIMARY KEY (id_venta_leche),
  KEY idx_ventas_leche_usuario (id_usuario),
  KEY idx_ventas_leche_finca_fecha (id_finca, fecha_venta),
  CONSTRAINT fk_ventas_leche_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_ventas_leche_finca FOREIGN KEY (id_finca) REFERENCES fincas(id_finca) ON DELETE CASCADE,
  CONSTRAINT fk_ventas_leche_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- 9. INVENTARIO DE INSUMOS / STOCK
-- =========================================================

CREATE TABLE insumos (
  id_insumo INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  tipo ENUM('ALIMENTO','MEDICAMENTO','VACUNA','SUPLEMENTO','HERRAMIENTA','OTRO') NOT NULL,
  unidad_medida VARCHAR(50) NOT NULL,
  stock_minimo DECIMAL(12,2) DEFAULT 0,
  activo TINYINT(1) DEFAULT 1,
  observaciones TEXT NULL,
  PRIMARY KEY (id_insumo),
  KEY idx_insumos_usuario_tipo (id_usuario, tipo),
  CONSTRAINT fk_insumos_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE inventario_insumos (
  id_inventario INT NOT NULL AUTO_INCREMENT,
  id_insumo INT NOT NULL,
  id_finca INT NOT NULL,
  cantidad_actual DECIMAL(12,2) NOT NULL DEFAULT 0,
  costo_promedio DECIMAL(12,2) NULL,
  fecha_vencimiento DATE NULL,
  lote VARCHAR(100) NULL,
  PRIMARY KEY (id_inventario),
  UNIQUE KEY uq_inventario_insumo_finca_lote (id_insumo, id_finca, lote),
  KEY idx_inventario_finca (id_finca),
  KEY idx_inventario_vencimiento (fecha_vencimiento),
  CONSTRAINT fk_inventario_insumo FOREIGN KEY (id_insumo) REFERENCES insumos(id_insumo) ON DELETE CASCADE,
  CONSTRAINT fk_inventario_finca FOREIGN KEY (id_finca) REFERENCES fincas(id_finca) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE movimientos_inventario (
  id_movimiento_inventario INT NOT NULL AUTO_INCREMENT,
  id_insumo INT NOT NULL,
  id_finca INT NOT NULL,
  id_proveedor INT NULL,
  tipo_movimiento ENUM('ENTRADA','SALIDA','AJUSTE','CONSUMO') NOT NULL,
  cantidad DECIMAL(12,2) NOT NULL,
  costo_unitario DECIMAL(12,2) NULL,
  fecha_movimiento DATE NOT NULL,
  motivo VARCHAR(255) NULL,
  modulo_origen VARCHAR(80) NULL,
  id_referencia INT NULL,
  observaciones TEXT NULL,
  PRIMARY KEY (id_movimiento_inventario),
  KEY idx_mov_inv_insumo (id_insumo),
  KEY idx_mov_inv_finca_fecha (id_finca, fecha_movimiento),
  CONSTRAINT fk_mov_inv_insumo FOREIGN KEY (id_insumo) REFERENCES insumos(id_insumo) ON DELETE CASCADE,
  CONSTRAINT fk_mov_inv_finca FOREIGN KEY (id_finca) REFERENCES fincas(id_finca) ON DELETE CASCADE,
  CONSTRAINT fk_mov_inv_proveedor FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- 10. FINANZAS AVANZADAS
-- =========================================================

ALTER TABLE gastos
  ADD COLUMN id_animal INT NULL AFTER id_finca,
  ADD COLUMN id_proveedor INT NULL AFTER id_categoria,
  ADD COLUMN estado_pago ENUM('PENDIENTE','PAGADO','VENCIDO','ANULADO') DEFAULT 'PAGADO' AFTER fecha,
  ADD COLUMN metodo_pago VARCHAR(80) NULL AFTER estado_pago,
  ADD COLUMN numero_soporte VARCHAR(120) NULL AFTER metodo_pago,
  ADD COLUMN fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER numero_soporte,
  ADD KEY idx_gastos_animal (id_animal),
  ADD KEY idx_gastos_proveedor (id_proveedor),
  ADD KEY idx_gastos_fecha (fecha),
  ADD CONSTRAINT fk_gastos_animal FOREIGN KEY (id_animal) REFERENCES animales(id_animal) ON DELETE SET NULL,
  ADD CONSTRAINT fk_gastos_proveedor FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor) ON DELETE SET NULL;

ALTER TABLE ingresos
  ADD COLUMN id_animal INT NULL AFTER id_finca,
  ADD COLUMN id_cliente INT NULL AFTER id_categoria,
  ADD COLUMN estado_pago ENUM('PENDIENTE','PAGADO','VENCIDO','ANULADO') DEFAULT 'PAGADO' AFTER fecha,
  ADD COLUMN metodo_pago VARCHAR(80) NULL AFTER estado_pago,
  ADD COLUMN numero_soporte VARCHAR(120) NULL AFTER metodo_pago,
  ADD COLUMN fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER numero_soporte,
  ADD KEY idx_ingresos_animal (id_animal),
  ADD KEY idx_ingresos_cliente (id_cliente),
  ADD KEY idx_ingresos_fecha (fecha),
  ADD CONSTRAINT fk_ingresos_animal FOREIGN KEY (id_animal) REFERENCES animales(id_animal) ON DELETE SET NULL,
  ADD CONSTRAINT fk_ingresos_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE SET NULL;

CREATE TABLE cuentas_por_pagar (
  id_cuenta_pagar INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_finca INT NULL,
  id_proveedor INT NULL,
  descripcion VARCHAR(255) NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  fecha_emision DATE NULL,
  fecha_vencimiento DATE NOT NULL,
  estado ENUM('PENDIENTE','PAGADA','VENCIDA','ANULADA') DEFAULT 'PENDIENTE',
  observaciones TEXT NULL,
  PRIMARY KEY (id_cuenta_pagar),
  KEY idx_cpp_usuario_estado (id_usuario, estado),
  KEY idx_cpp_vencimiento (fecha_vencimiento),
  CONSTRAINT fk_cpp_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_cpp_finca FOREIGN KEY (id_finca) REFERENCES fincas(id_finca) ON DELETE SET NULL,
  CONSTRAINT fk_cpp_proveedor FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE cuentas_por_cobrar (
  id_cuenta_cobrar INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_finca INT NULL,
  id_cliente INT NULL,
  descripcion VARCHAR(255) NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  fecha_emision DATE NULL,
  fecha_vencimiento DATE NOT NULL,
  estado ENUM('PENDIENTE','COBRADA','VENCIDA','ANULADA') DEFAULT 'PENDIENTE',
  observaciones TEXT NULL,
  PRIMARY KEY (id_cuenta_cobrar),
  KEY idx_cpc_usuario_estado (id_usuario, estado),
  KEY idx_cpc_vencimiento (fecha_vencimiento),
  CONSTRAINT fk_cpc_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_cpc_finca FOREIGN KEY (id_finca) REFERENCES fincas(id_finca) ON DELETE SET NULL,
  CONSTRAINT fk_cpc_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- 11. ARCHIVOS / SOPORTES
-- =========================================================

CREATE TABLE archivos (
  id_archivo INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  modulo VARCHAR(80) NOT NULL,
  id_referencia INT NULL,
  nombre_archivo VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  tipo_mime VARCHAR(120) NULL,
  tamano_bytes BIGINT NULL,
  descripcion VARCHAR(255) NULL,
  fecha_subida TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_archivo),
  KEY idx_archivos_usuario (id_usuario),
  KEY idx_archivos_modulo_ref (modulo, id_referencia),
  CONSTRAINT fk_archivos_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- 12. ALERTAS
-- =========================================================

CREATE TABLE alertas (
  id_alerta INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_finca INT NULL,
  id_animal INT NULL,
  tipo_alerta ENUM(
    'VACUNA_VENCIDA','VACUNA_PROXIMA','TRATAMIENTO_PENDIENTE','PARTO_PROXIMO',
    'BAJO_STOCK','INSUMO_VENCIDO','BALANCE_NEGATIVO','CUENTA_VENCIDA',
    'PESO_BAJO','PRODUCCION_BAJA','GENERAL'
  ) NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  mensaje TEXT NOT NULL,
  prioridad ENUM('BAJA','MEDIA','ALTA','CRITICA') DEFAULT 'MEDIA',
  estado ENUM('PENDIENTE','VISTA','RESUELTA','DESCARTADA') DEFAULT 'PENDIENTE',
  fecha_alerta DATE NOT NULL,
  fecha_resuelta DATETIME NULL,
  modulo_origen VARCHAR(80) NULL,
  id_referencia INT NULL,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_alerta),
  KEY idx_alertas_usuario_estado (id_usuario, estado),
  KEY idx_alertas_fecha (fecha_alerta),
  KEY idx_alertas_animal (id_animal),
  CONSTRAINT fk_alertas_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_alertas_finca FOREIGN KEY (id_finca) REFERENCES fincas(id_finca) ON DELETE SET NULL,
  CONSTRAINT fk_alertas_animal FOREIGN KEY (id_animal) REFERENCES animales(id_animal) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

SET FOREIGN_KEY_CHECKS = 1;
