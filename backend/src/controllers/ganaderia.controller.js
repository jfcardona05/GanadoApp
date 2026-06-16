const pool = require('../config/db');

const badRequest = (res, message) => res.status(400).json({ message });
const notFound = (res, message) => res.status(404).json({ message });

const validarFinca = async (id_finca, id_usuario) => {
  const [rows] = await pool.query(
    'SELECT id_finca FROM fincas WHERE id_finca = ? AND id_usuario = ?',
    [id_finca, id_usuario]
  );
  return rows.length > 0;
};

const validarAnimal = async (id_animal, id_usuario) => {
  const [rows] = await pool.query(
    `SELECT a.id_animal, a.id_finca
     FROM animales a
     INNER JOIN fincas f ON a.id_finca = f.id_finca
     WHERE a.id_animal = ? AND f.id_usuario = ?`,
    [id_animal, id_usuario]
  );
  return rows[0];
};

const obtenerOCrearCategoriaFinanciera = async (id_usuario, nombre, tipo) => {
  const [existentes] = await pool.query(
    `SELECT id_categoria, nombre
     FROM categorias_financieras
     WHERE id_usuario = ? AND nombre = ? AND tipo = ?`,
    [id_usuario, nombre, tipo]
  );

  if (existentes.length > 0) return existentes[0];

  const [result] = await pool.query(
    'INSERT INTO categorias_financieras (id_usuario, nombre, tipo) VALUES (?, ?, ?)',
    [id_usuario, nombre, tipo]
  );

  return {
    id_categoria: result.insertId,
    nombre
  };
};

const registrarIngresoAutomatico = async ({ id_usuario, id_finca, id_animal = null, id_cliente = null, categoriaNombre, descripcion, monto, fecha }) => {
  const categoria = await obtenerOCrearCategoriaFinanciera(id_usuario, categoriaNombre, 'INGRESO');

  await pool.query(
    `INSERT INTO ingresos
    (id_finca, id_animal, id_categoria, id_cliente, categoria, descripcion, monto, fecha)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id_finca, id_animal, categoria.id_categoria, id_cliente, categoria.nombre, descripcion, monto, fecha]
  );
};

const registrarGastoAutomatico = async ({ id_usuario, id_finca, id_animal = null, id_proveedor = null, categoriaNombre, descripcion, monto, fecha }) => {
  const categoria = await obtenerOCrearCategoriaFinanciera(id_usuario, categoriaNombre, 'GASTO');

  await pool.query(
    `INSERT INTO gastos
    (id_finca, id_animal, id_categoria, id_proveedor, categoria, descripcion, monto, fecha)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id_finca, id_animal, categoria.id_categoria, id_proveedor, categoria.nombre, descripcion, monto, fecha]
  );
};

const crearPotrero = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;
    const {
      id_finca,
      nombre,
      area_hectareas,
      tipo_pasto,
      capacidad_animales,
      estado,
      agua_disponible,
      sombra_disponible,
      observaciones
    } = req.body;

    if (!id_finca || !nombre) {
      return badRequest(res, 'La finca y el nombre del potrero son obligatorios');
    }

    if (!(await validarFinca(id_finca, id_usuario))) {
      return notFound(res, 'La finca no existe o no pertenece al usuario');
    }

    await pool.query(
      `INSERT INTO potreros
      (id_finca, nombre, area_hectareas, tipo_pasto, capacidad_animales, estado, agua_disponible, sombra_disponible, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_finca,
        nombre,
        area_hectareas || null,
        tipo_pasto || null,
        capacidad_animales || null,
        estado || 'DISPONIBLE',
        agua_disponible ? 1 : 0,
        sombra_disponible ? 1 : 0,
        observaciones || null
      ]
    );

    res.status(201).json({ message: 'Potrero creado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear potrero', error: error.message });
  }
};

const obtenerPotreros = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, f.nombre AS nombre_finca
       FROM potreros p
       INNER JOIN fincas f ON p.id_finca = f.id_finca
       WHERE f.id_usuario = ?
       ORDER BY p.fecha_creacion DESC`,
      [req.usuario.id_usuario]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener potreros', error: error.message });
  }
};

const moverAnimalPotrero = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;
    const { id_animal, id_potrero_origen, id_potrero_destino, fecha_movimiento, motivo, observaciones } = req.body;

    if (!id_animal || !id_potrero_destino || !fecha_movimiento) {
      return badRequest(res, 'Animal, potrero destino y fecha son obligatorios');
    }

    const animal = await validarAnimal(id_animal, id_usuario);
    if (!animal) return notFound(res, 'El animal no existe o no pertenece al usuario');

    const [potreros] = await pool.query(
      `SELECT p.id_potrero
       FROM potreros p
       INNER JOIN fincas f ON p.id_finca = f.id_finca
       WHERE p.id_potrero = ? AND f.id_usuario = ?`,
      [id_potrero_destino, id_usuario]
    );
    if (potreros.length === 0) return notFound(res, 'El potrero destino no pertenece al usuario');

    await pool.query(
      `INSERT INTO movimientos_potrero
      (id_animal, id_potrero_origen, id_potrero_destino, fecha_movimiento, motivo, observaciones)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [id_animal, id_potrero_origen || null, id_potrero_destino, fecha_movimiento, motivo || null, observaciones || null]
    );

    res.status(201).json({ message: 'Movimiento de potrero registrado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al mover animal', error: error.message });
  }
};

const obtenerMovimientosPotrero = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT mp.*, a.codigo, a.nombre AS nombre_animal, pd.nombre AS potrero_destino, po.nombre AS potrero_origen
       FROM movimientos_potrero mp
       INNER JOIN animales a ON mp.id_animal = a.id_animal
       INNER JOIN fincas f ON a.id_finca = f.id_finca
       INNER JOIN potreros pd ON mp.id_potrero_destino = pd.id_potrero
       LEFT JOIN potreros po ON mp.id_potrero_origen = po.id_potrero
       WHERE f.id_usuario = ?
       ORDER BY mp.fecha_movimiento DESC, mp.fecha_registro DESC`,
      [req.usuario.id_usuario]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener movimientos de potrero', error: error.message });
  }
};

const crearEventoAnimal = async (id_animal, id_usuario, tipo_evento, titulo, descripcion, fecha_evento, modulo_origen, id_referencia) => {
  await pool.query(
    `INSERT INTO eventos_animales
    (id_animal, id_usuario, tipo_evento, titulo, descripcion, fecha_evento, modulo_origen, id_referencia)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id_animal, id_usuario, tipo_evento, titulo, descripcion || null, fecha_evento, modulo_origen || null, id_referencia || null]
  );
};

const obtenerEventosAnimales = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, a.codigo, a.nombre AS nombre_animal
       FROM eventos_animales e
       INNER JOIN animales a ON e.id_animal = a.id_animal
       WHERE e.id_usuario = ?
       ORDER BY e.fecha_evento DESC, e.fecha_creacion DESC`,
      [req.usuario.id_usuario]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener eventos', error: error.message });
  }
};

const crearServicioReproductivo = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;
    const { id_hembra, id_macho, tipo, fecha_servicio, pajilla_codigo, responsable, resultado, observaciones } = req.body;

    if (!id_hembra || !tipo || !fecha_servicio) {
      return badRequest(res, 'Hembra, tipo y fecha de servicio son obligatorios');
    }

    if (!(await validarAnimal(id_hembra, id_usuario))) return notFound(res, 'La hembra no pertenece al usuario');
    if (id_macho && !(await validarAnimal(id_macho, id_usuario))) return notFound(res, 'El macho no pertenece al usuario');

    const [result] = await pool.query(
      `INSERT INTO servicios_reproductivos
      (id_hembra, id_macho, id_usuario, tipo, fecha_servicio, pajilla_codigo, responsable, resultado, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_hembra, id_macho || null, id_usuario, tipo, fecha_servicio, pajilla_codigo || null, responsable || null, resultado || 'PENDIENTE', observaciones || null]
    );

    await crearEventoAnimal(id_hembra, id_usuario, 'REPRODUCCION', 'Servicio reproductivo', tipo, fecha_servicio, 'servicios_reproductivos', result.insertId);
    res.status(201).json({ message: 'Servicio reproductivo registrado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar servicio reproductivo', error: error.message });
  }
};

const obtenerServiciosReproductivos = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sr.*, h.codigo AS codigo_hembra, h.nombre AS nombre_hembra, m.codigo AS codigo_macho, m.nombre AS nombre_macho
       FROM servicios_reproductivos sr
       INNER JOIN animales h ON sr.id_hembra = h.id_animal
       LEFT JOIN animales m ON sr.id_macho = m.id_animal
       WHERE sr.id_usuario = ?
       ORDER BY sr.fecha_servicio DESC`,
      [req.usuario.id_usuario]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener reproducción', error: error.message });
  }
};

const crearDiagnosticoPrenez = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;
    const { id_servicio, id_hembra, fecha_diagnostico, resultado, metodo, fecha_probable_parto, veterinario, observaciones } = req.body;

    if (!id_servicio || !id_hembra || !fecha_diagnostico || !resultado) {
      return badRequest(res, 'Servicio, hembra, fecha y resultado son obligatorios');
    }

    if (!(await validarAnimal(id_hembra, id_usuario))) return notFound(res, 'La hembra no pertenece al usuario');

    await pool.query(
      `INSERT INTO diagnosticos_prenez
      (id_servicio, id_hembra, fecha_diagnostico, resultado, metodo, fecha_probable_parto, veterinario, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_servicio, id_hembra, fecha_diagnostico, resultado, metodo || null, fecha_probable_parto || null, veterinario || null, observaciones || null]
    );

    await pool.query('UPDATE servicios_reproductivos SET resultado = ? WHERE id_servicio = ? AND id_usuario = ?', [resultado === 'PRENADA' ? 'PRENADA' : 'NO_PRENADA', id_servicio, id_usuario]);
    res.status(201).json({ message: 'Diagnóstico registrado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar diagnóstico', error: error.message });
  }
};

const obtenerDiagnosticosPrenez = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.*, a.codigo, a.nombre AS nombre_animal
       FROM diagnosticos_prenez d
       INNER JOIN animales a ON d.id_hembra = a.id_animal
       INNER JOIN fincas f ON a.id_finca = f.id_finca
       WHERE f.id_usuario = ?
       ORDER BY d.fecha_diagnostico DESC`,
      [req.usuario.id_usuario]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener diagnósticos', error: error.message });
  }
};

const crearParto = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;
    const { id_madre, id_servicio, id_cria, fecha_parto, tipo_parto, sexo_cria, peso_cria, estado_cria, observaciones } = req.body;

    if (!id_madre || !fecha_parto) return badRequest(res, 'Madre y fecha de parto son obligatorios');
    if (!(await validarAnimal(id_madre, id_usuario))) return notFound(res, 'La madre no pertenece al usuario');
    if (id_cria && !(await validarAnimal(id_cria, id_usuario))) return notFound(res, 'La cría no pertenece al usuario');

    const [result] = await pool.query(
      `INSERT INTO partos
      (id_madre, id_servicio, id_cria, fecha_parto, tipo_parto, sexo_cria, peso_cria, estado_cria, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_madre, id_servicio || null, id_cria || null, fecha_parto, tipo_parto || 'NORMAL', sexo_cria || null, peso_cria || null, estado_cria || 'VIVA', observaciones || null]
    );

    await crearEventoAnimal(id_madre, id_usuario, 'REPRODUCCION', 'Parto registrado', observaciones, fecha_parto, 'partos', result.insertId);
    res.status(201).json({ message: 'Parto registrado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar parto', error: error.message });
  }
};

const obtenerPartos = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, a.codigo AS codigo_madre, a.nombre AS nombre_madre, c.codigo AS codigo_cria, c.nombre AS nombre_cria
       FROM partos p
       INNER JOIN animales a ON p.id_madre = a.id_animal
       INNER JOIN fincas f ON a.id_finca = f.id_finca
       LEFT JOIN animales c ON p.id_cria = c.id_animal
       WHERE f.id_usuario = ?
       ORDER BY p.fecha_parto DESC`,
      [req.usuario.id_usuario]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener partos', error: error.message });
  }
};

const crearEnfermedad = async (req, res) => {
  try {
    const { nombre, descripcion, activa } = req.body;
    if (!nombre) return badRequest(res, 'El nombre de la enfermedad es obligatorio');
    await pool.query(
      'INSERT INTO enfermedades (id_usuario, nombre, descripcion, activa) VALUES (?, ?, ?, ?)',
      [req.usuario.id_usuario, nombre, descripcion || null, activa === false ? 0 : 1]
    );
    res.status(201).json({ message: 'Enfermedad creada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear enfermedad', error: error.message });
  }
};

const obtenerEnfermedades = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM enfermedades WHERE id_usuario = ? ORDER BY nombre ASC', [req.usuario.id_usuario]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener enfermedades', error: error.message });
  }
};

const crearMedicamento = async (req, res) => {
  try {
    const { nombre, principio_activo, unidad_medida, periodo_retiro_leche_dias, periodo_retiro_carne_dias, observaciones, activo } = req.body;
    if (!nombre) return badRequest(res, 'El nombre del medicamento es obligatorio');
    await pool.query(
      `INSERT INTO medicamentos
      (id_usuario, nombre, principio_activo, unidad_medida, periodo_retiro_leche_dias, periodo_retiro_carne_dias, observaciones, activo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.usuario.id_usuario, nombre, principio_activo || null, unidad_medida || null, periodo_retiro_leche_dias || 0, periodo_retiro_carne_dias || 0, observaciones || null, activo === false ? 0 : 1]
    );
    res.status(201).json({ message: 'Medicamento creado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear medicamento', error: error.message });
  }
};

const obtenerMedicamentos = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM medicamentos WHERE id_usuario = ? ORDER BY nombre ASC', [req.usuario.id_usuario]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener medicamentos', error: error.message });
  }
};

const crearTratamiento = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;
    const { id_animal, id_enfermedad, fecha_inicio, fecha_fin, diagnostico, estado, veterinario, observaciones } = req.body;
    if (!id_animal || !fecha_inicio) return badRequest(res, 'Animal y fecha de inicio son obligatorios');
    if (!(await validarAnimal(id_animal, id_usuario))) return notFound(res, 'El animal no pertenece al usuario');

    const [result] = await pool.query(
      `INSERT INTO tratamientos
      (id_animal, id_enfermedad, fecha_inicio, fecha_fin, diagnostico, estado, veterinario, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_animal, id_enfermedad || null, fecha_inicio, fecha_fin || null, diagnostico || null, estado || 'ACTIVO', veterinario || null, observaciones || null]
    );
    await pool.query('UPDATE animales SET estado_salud = ? WHERE id_animal = ?', [estado === 'FINALIZADO' ? 'SANO' : 'EN_TRATAMIENTO', id_animal]);
    await crearEventoAnimal(id_animal, id_usuario, 'TRATAMIENTO', 'Tratamiento registrado', diagnostico || observaciones, fecha_inicio, 'tratamientos', result.insertId);
    res.status(201).json({ message: 'Tratamiento registrado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar tratamiento', error: error.message });
  }
};

const obtenerTratamientos = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, a.codigo, a.nombre AS nombre_animal, e.nombre AS nombre_enfermedad
       FROM tratamientos t
       INNER JOIN animales a ON t.id_animal = a.id_animal
       INNER JOIN fincas f ON a.id_finca = f.id_finca
       LEFT JOIN enfermedades e ON t.id_enfermedad = e.id_enfermedad
       WHERE f.id_usuario = ?
       ORDER BY t.fecha_inicio DESC`,
      [req.usuario.id_usuario]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tratamientos', error: error.message });
  }
};

const crearDesparasitacion = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;
    const { id_animal, id_medicamento, fecha_aplicacion, proxima_fecha, producto, dosis, responsable, observaciones } = req.body;
    if (!id_animal || !fecha_aplicacion) return badRequest(res, 'Animal y fecha de aplicación son obligatorios');
    if (!(await validarAnimal(id_animal, id_usuario))) return notFound(res, 'El animal no pertenece al usuario');
    await pool.query(
      `INSERT INTO desparasitaciones
      (id_animal, id_medicamento, fecha_aplicacion, proxima_fecha, producto, dosis, responsable, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_animal, id_medicamento || null, fecha_aplicacion, proxima_fecha || null, producto || null, dosis || null, responsable || null, observaciones || null]
    );
    res.status(201).json({ message: 'Desparasitación registrada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar desparasitación', error: error.message });
  }
};

const obtenerDesparasitaciones = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.*, a.codigo, a.nombre AS nombre_animal, m.nombre AS nombre_medicamento
       FROM desparasitaciones d
       INNER JOIN animales a ON d.id_animal = a.id_animal
       INNER JOIN fincas f ON a.id_finca = f.id_finca
       LEFT JOIN medicamentos m ON d.id_medicamento = m.id_medicamento
       WHERE f.id_usuario = ?
       ORDER BY d.fecha_aplicacion DESC`,
      [req.usuario.id_usuario]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener desparasitaciones', error: error.message });
  }
};

const crearProduccionLeche = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;
    const { id_animal, id_finca, fecha, turno, litros, destino, observaciones } = req.body;
    if (!id_finca || !fecha || !litros) return badRequest(res, 'Finca, fecha y litros son obligatorios');
    if (!(await validarFinca(id_finca, id_usuario))) return notFound(res, 'La finca no pertenece al usuario');
    if (id_animal && !(await validarAnimal(id_animal, id_usuario))) return notFound(res, 'El animal no pertenece al usuario');
    await pool.query(
      `INSERT INTO produccion_leche
      (id_animal, id_finca, fecha, turno, litros, destino, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id_animal || null, id_finca, fecha, turno || 'TOTAL_DIA', litros, destino || 'VENTA', observaciones || null]
    );
    res.status(201).json({ message: 'Producción de leche registrada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar producción', error: error.message });
  }
};

const obtenerProduccionLeche = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT pl.*, f.nombre AS nombre_finca, a.codigo, a.nombre AS nombre_animal
       FROM produccion_leche pl
       INNER JOIN fincas f ON pl.id_finca = f.id_finca
       LEFT JOIN animales a ON pl.id_animal = a.id_animal
       WHERE f.id_usuario = ?
       ORDER BY pl.fecha DESC`,
      [req.usuario.id_usuario]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener producción', error: error.message });
  }
};

const crearLoteCeba = async (req, res) => {
  try {
    const { id_finca, nombre, fecha_inicio, fecha_fin, estado, observaciones } = req.body;
    if (!id_finca || !nombre || !fecha_inicio) return badRequest(res, 'Finca, nombre y fecha de inicio son obligatorios');
    if (!(await validarFinca(id_finca, req.usuario.id_usuario))) return notFound(res, 'La finca no pertenece al usuario');
    await pool.query(
      'INSERT INTO lotes_ceba (id_finca, nombre, fecha_inicio, fecha_fin, estado, observaciones) VALUES (?, ?, ?, ?, ?, ?)',
      [id_finca, nombre, fecha_inicio, fecha_fin || null, estado || 'ACTIVO', observaciones || null]
    );
    res.status(201).json({ message: 'Lote de ceba creado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear lote de ceba', error: error.message });
  }
};

const obtenerLotesCeba = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT lc.*, f.nombre AS nombre_finca, COUNT(lca.id_animal) AS total_animales
       FROM lotes_ceba lc
       INNER JOIN fincas f ON lc.id_finca = f.id_finca
       LEFT JOIN lote_ceba_animales lca ON lc.id_lote_ceba = lca.id_lote_ceba
       WHERE f.id_usuario = ?
       GROUP BY lc.id_lote_ceba
       ORDER BY lc.fecha_inicio DESC`,
      [req.usuario.id_usuario]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener lotes de ceba', error: error.message });
  }
};

const crearContacto = (tabla, idCampo) => async (req, res) => {
  try {
    const { nombre, telefono, correo, direccion, tipo, observaciones, activo } = req.body;
    if (!nombre) return badRequest(res, 'El nombre es obligatorio');
    await pool.query(
      `INSERT INTO ${tabla} (id_usuario, nombre, telefono, correo, direccion, tipo, observaciones, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.usuario.id_usuario, nombre, telefono || null, correo || null, direccion || null, tipo || null, observaciones || null, activo === false ? 0 : 1]
    );
    res.status(201).json({ message: `${idCampo === 'id_cliente' ? 'Cliente' : 'Proveedor'} creado correctamente` });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear contacto', error: error.message });
  }
};

const obtenerContactos = (tabla) => async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM ${tabla} WHERE id_usuario = ? ORDER BY nombre ASC`, [req.usuario.id_usuario]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener contactos', error: error.message });
  }
};

const crearCompraAnimal = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;
    const { id_finca, id_animal, id_proveedor, fecha_compra, precio, peso_compra, descripcion, observaciones } = req.body;
    if (!id_finca || !fecha_compra || !precio) return badRequest(res, 'Finca, fecha y precio son obligatorios');
    if (!(await validarFinca(id_finca, id_usuario))) return notFound(res, 'La finca no pertenece al usuario');
    if (id_animal && !(await validarAnimal(id_animal, id_usuario))) return notFound(res, 'El animal no pertenece al usuario');
    await pool.query(
      `INSERT INTO compras_animales
      (id_usuario, id_finca, id_animal, id_proveedor, fecha_compra, precio, peso_compra, descripcion, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_usuario, id_finca, id_animal || null, id_proveedor || null, fecha_compra, precio, peso_compra || null, descripcion || null, observaciones || null]
    );

    await registrarGastoAutomatico({
      id_usuario,
      id_finca,
      id_animal: id_animal || null,
      id_proveedor: id_proveedor || null,
      categoriaNombre: 'Compra de animales',
      descripcion: descripcion || 'Compra de animal registrada desde Compras y ventas',
      monto: precio,
      fecha: fecha_compra
    });

    res.status(201).json({ message: 'Compra de animal registrada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar compra', error: error.message });
  }
};

const obtenerComprasAnimales = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ca.*, f.nombre AS nombre_finca, a.codigo, a.nombre AS nombre_animal, p.nombre AS nombre_proveedor
       FROM compras_animales ca
       INNER JOIN fincas f ON ca.id_finca = f.id_finca
       LEFT JOIN animales a ON ca.id_animal = a.id_animal
       LEFT JOIN proveedores p ON ca.id_proveedor = p.id_proveedor
       WHERE ca.id_usuario = ?
       ORDER BY ca.fecha_compra DESC`,
      [req.usuario.id_usuario]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener compras', error: error.message });
  }
};

const crearVentaAnimal = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;
    const { id_finca, id_animal, id_cliente, fecha_venta, precio, peso_venta, utilidad_estimada, descripcion, observaciones } = req.body;
    if (!id_finca || !fecha_venta || !precio) return badRequest(res, 'Finca, fecha y precio son obligatorios');
    if (!(await validarFinca(id_finca, id_usuario))) return notFound(res, 'La finca no pertenece al usuario');
    if (id_animal && !(await validarAnimal(id_animal, id_usuario))) return notFound(res, 'El animal no pertenece al usuario');
    await pool.query(
      `INSERT INTO ventas_animales
      (id_usuario, id_finca, id_animal, id_cliente, fecha_venta, precio, peso_venta, utilidad_estimada, descripcion, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_usuario, id_finca, id_animal || null, id_cliente || null, fecha_venta, precio, peso_venta || null, utilidad_estimada || null, descripcion || null, observaciones || null]
    );
    if (id_animal) {
      await pool.query('UPDATE animales SET estado_comercial = ?, fecha_salida = ?, motivo_salida = ? WHERE id_animal = ?', ['VENDIDO', fecha_venta, 'Venta', id_animal]);
    }

    await registrarIngresoAutomatico({
      id_usuario,
      id_finca,
      id_animal: id_animal || null,
      id_cliente: id_cliente || null,
      categoriaNombre: 'Venta de animales',
      descripcion: descripcion || 'Venta de animal registrada desde Compras y ventas',
      monto: precio,
      fecha: fecha_venta
    });

    res.status(201).json({ message: 'Venta de animal registrada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar venta', error: error.message });
  }
};

const obtenerVentasAnimales = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT va.*, f.nombre AS nombre_finca, a.codigo, a.nombre AS nombre_animal, c.nombre AS nombre_cliente
       FROM ventas_animales va
       INNER JOIN fincas f ON va.id_finca = f.id_finca
       LEFT JOIN animales a ON va.id_animal = a.id_animal
       LEFT JOIN clientes c ON va.id_cliente = c.id_cliente
       WHERE va.id_usuario = ?
       ORDER BY va.fecha_venta DESC`,
      [req.usuario.id_usuario]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ventas', error: error.message });
  }
};

const crearVentaLeche = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;
    const { id_finca, id_cliente, fecha_venta, litros, precio_litro, observaciones } = req.body;
    if (!id_finca || !fecha_venta || !litros || !precio_litro) return badRequest(res, 'Finca, fecha, litros y precio son obligatorios');
    if (!(await validarFinca(id_finca, id_usuario))) return notFound(res, 'La finca no pertenece al usuario');
    await pool.query(
      `INSERT INTO ventas_leche
      (id_usuario, id_finca, id_cliente, fecha_venta, litros, precio_litro, total, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_usuario, id_finca, id_cliente || null, fecha_venta, litros, precio_litro, Number(litros) * Number(precio_litro), observaciones || null]
    );

    await registrarIngresoAutomatico({
      id_usuario,
      id_finca,
      id_cliente: id_cliente || null,
      categoriaNombre: 'Venta de leche',
      descripcion: observaciones || `Venta de ${litros} litros de leche`,
      monto: Number(litros) * Number(precio_litro),
      fecha: fecha_venta
    });

    res.status(201).json({ message: 'Venta de leche registrada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar venta de leche', error: error.message });
  }
};

const obtenerVentasLeche = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT vl.*, f.nombre AS nombre_finca, c.nombre AS nombre_cliente
       FROM ventas_leche vl
       INNER JOIN fincas f ON vl.id_finca = f.id_finca
       LEFT JOIN clientes c ON vl.id_cliente = c.id_cliente
       WHERE vl.id_usuario = ?
       ORDER BY vl.fecha_venta DESC`,
      [req.usuario.id_usuario]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ventas de leche', error: error.message });
  }
};

const crearInsumo = async (req, res) => {
  try {
    const { nombre, tipo, unidad_medida, stock_minimo, observaciones, activo } = req.body;
    if (!nombre || !tipo || !unidad_medida) return badRequest(res, 'Nombre, tipo y unidad de medida son obligatorios');
    await pool.query(
      `INSERT INTO insumos (id_usuario, nombre, tipo, unidad_medida, stock_minimo, activo, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.usuario.id_usuario, nombre, tipo, unidad_medida, stock_minimo || 0, activo === false ? 0 : 1, observaciones || null]
    );
    res.status(201).json({ message: 'Insumo creado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear insumo', error: error.message });
  }
};

const obtenerInsumos = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT i.*,
        COALESCE(SUM(inv.cantidad_actual), 0) AS stock_total
       FROM insumos i
       LEFT JOIN inventario_insumos inv ON i.id_insumo = inv.id_insumo
       WHERE i.id_usuario = ?
       GROUP BY i.id_insumo
       ORDER BY i.nombre ASC`,
      [req.usuario.id_usuario]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener insumos', error: error.message });
  }
};

const registrarInventario = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;
    const { id_insumo, id_finca, id_proveedor, tipo_movimiento, cantidad, costo_unitario, fecha_movimiento, motivo, lote, fecha_vencimiento, observaciones } = req.body;
    if (!id_insumo || !id_finca || !tipo_movimiento || !cantidad || !fecha_movimiento) {
      return badRequest(res, 'Insumo, finca, movimiento, cantidad y fecha son obligatorios');
    }
    if (!(await validarFinca(id_finca, id_usuario))) return notFound(res, 'La finca no pertenece al usuario');

    const [insumos] = await pool.query('SELECT * FROM insumos WHERE id_insumo = ? AND id_usuario = ?', [id_insumo, id_usuario]);
    if (insumos.length === 0) return notFound(res, 'El insumo no pertenece al usuario');

    const factor = tipo_movimiento === 'SALIDA' || tipo_movimiento === 'CONSUMO' ? -1 : 1;
    const cantidadMovimiento = Number(cantidad) * factor;

    await pool.query(
      `INSERT INTO movimientos_inventario
      (id_insumo, id_finca, id_proveedor, tipo_movimiento, cantidad, costo_unitario, fecha_movimiento, motivo, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_insumo, id_finca, id_proveedor || null, tipo_movimiento, cantidad, costo_unitario || null, fecha_movimiento, motivo || null, observaciones || null]
    );

    await pool.query(
      `INSERT INTO inventario_insumos (id_insumo, id_finca, cantidad_actual, costo_promedio, fecha_vencimiento, lote)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       cantidad_actual = cantidad_actual + VALUES(cantidad_actual),
       costo_promedio = COALESCE(VALUES(costo_promedio), costo_promedio),
       fecha_vencimiento = COALESCE(VALUES(fecha_vencimiento), fecha_vencimiento)`,
      [id_insumo, id_finca, cantidadMovimiento, costo_unitario || null, fecha_vencimiento || null, lote || null]
    );

    if (tipo_movimiento === 'ENTRADA' && costo_unitario) {
      await registrarGastoAutomatico({
        id_usuario,
        id_finca,
        id_proveedor: id_proveedor || null,
        categoriaNombre: 'Compra de insumos',
        descripcion: motivo || `Entrada de inventario: ${insumos[0].nombre}`,
        monto: Number(cantidad) * Number(costo_unitario),
        fecha: fecha_movimiento
      });
    }

    res.status(201).json({ message: 'Movimiento de inventario registrado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar inventario', error: error.message });
  }
};

const obtenerInventario = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT inv.*, i.nombre AS nombre_insumo, i.tipo, i.unidad_medida, i.stock_minimo, f.nombre AS nombre_finca
       FROM inventario_insumos inv
       INNER JOIN insumos i ON inv.id_insumo = i.id_insumo
       INNER JOIN fincas f ON inv.id_finca = f.id_finca
       WHERE i.id_usuario = ?
       ORDER BY i.nombre ASC`,
      [req.usuario.id_usuario]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener inventario', error: error.message });
  }
};

const crearCuenta = (tabla, tipo) => async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;
    const { id_finca, id_proveedor, id_cliente, descripcion, monto, fecha_emision, fecha_vencimiento, estado, observaciones } = req.body;
    if (!descripcion || !monto || !fecha_vencimiento) return badRequest(res, 'Descripción, monto y vencimiento son obligatorios');
    if (id_finca && !(await validarFinca(id_finca, id_usuario))) return notFound(res, 'La finca no pertenece al usuario');
    const contactoCampo = tipo === 'pagar' ? 'id_proveedor' : 'id_cliente';
    const contactoValor = tipo === 'pagar' ? id_proveedor : id_cliente;
    await pool.query(
      `INSERT INTO ${tabla}
      (id_usuario, id_finca, ${contactoCampo}, descripcion, monto, fecha_emision, fecha_vencimiento, estado, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_usuario, id_finca || null, contactoValor || null, descripcion, monto, fecha_emision || null, fecha_vencimiento, estado || 'PENDIENTE', observaciones || null]
    );
    res.status(201).json({ message: `Cuenta por ${tipo === 'pagar' ? 'pagar' : 'cobrar'} creada correctamente` });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear cuenta', error: error.message });
  }
};

const obtenerCuentas = (tabla) => async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM ${tabla} WHERE id_usuario = ? ORDER BY fecha_vencimiento ASC`, [req.usuario.id_usuario]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener cuentas', error: error.message });
  }
};

const obtenerAlertas = async (req, res) => {
  try {
    const [manuales] = await pool.query(
      `SELECT a.*, f.nombre AS nombre_finca, an.codigo, an.nombre AS nombre_animal
       FROM alertas a
       LEFT JOIN fincas f ON a.id_finca = f.id_finca
       LEFT JOIN animales an ON a.id_animal = an.id_animal
       WHERE a.id_usuario = ? AND a.estado IN ('PENDIENTE','VISTA')
       ORDER BY FIELD(a.prioridad, 'CRITICA','ALTA','MEDIA','BAJA'), a.fecha_alerta ASC`,
      [req.usuario.id_usuario]
    );

    const [stock] = await pool.query(
      `SELECT inv.id_inventario, i.nombre, inv.cantidad_actual, i.stock_minimo, f.nombre AS nombre_finca
       FROM inventario_insumos inv
       INNER JOIN insumos i ON inv.id_insumo = i.id_insumo
       INNER JOIN fincas f ON inv.id_finca = f.id_finca
       WHERE i.id_usuario = ? AND inv.cantidad_actual <= i.stock_minimo AND i.stock_minimo > 0`,
      [req.usuario.id_usuario]
    );

    const [cuentasPagar] = await pool.query(
      `SELECT * FROM cuentas_por_pagar WHERE id_usuario = ? AND estado = 'PENDIENTE' AND fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)`,
      [req.usuario.id_usuario]
    );

    const generadas = [
      ...stock.map((item) => ({
        id_alerta: `stock-${item.id_inventario}`,
        tipo_alerta: 'BAJO_STOCK',
        titulo: 'Stock bajo',
        mensaje: `${item.nombre} está en ${item.cantidad_actual}, mínimo ${item.stock_minimo}.`,
        prioridad: 'ALTA',
        estado: 'PENDIENTE',
        fecha_alerta: new Date().toISOString().slice(0, 10),
        nombre_finca: item.nombre_finca
      })),
      ...cuentasPagar.map((item) => ({
        id_alerta: `pagar-${item.id_cuenta_pagar}`,
        tipo_alerta: 'CUENTA_VENCIDA',
        titulo: 'Cuenta por pagar cercana',
        mensaje: `${item.descripcion} vence el ${item.fecha_vencimiento}.`,
        prioridad: 'ALTA',
        estado: 'PENDIENTE',
        fecha_alerta: item.fecha_vencimiento
      }))
    ];

    res.json([...manuales, ...generadas]);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener alertas', error: error.message });
  }
};

module.exports = {
  crearPotrero,
  obtenerPotreros,
  moverAnimalPotrero,
  obtenerMovimientosPotrero,
  obtenerEventosAnimales,
  crearServicioReproductivo,
  obtenerServiciosReproductivos,
  crearDiagnosticoPrenez,
  obtenerDiagnosticosPrenez,
  crearParto,
  obtenerPartos,
  crearEnfermedad,
  obtenerEnfermedades,
  crearMedicamento,
  obtenerMedicamentos,
  crearTratamiento,
  obtenerTratamientos,
  crearDesparasitacion,
  obtenerDesparasitaciones,
  crearProduccionLeche,
  obtenerProduccionLeche,
  crearLoteCeba,
  obtenerLotesCeba,
  crearCliente: crearContacto('clientes', 'id_cliente'),
  obtenerClientes: obtenerContactos('clientes'),
  crearProveedor: crearContacto('proveedores', 'id_proveedor'),
  obtenerProveedores: obtenerContactos('proveedores'),
  crearCompraAnimal,
  obtenerComprasAnimales,
  crearVentaAnimal,
  obtenerVentasAnimales,
  crearVentaLeche,
  obtenerVentasLeche,
  crearInsumo,
  obtenerInsumos,
  registrarInventario,
  obtenerInventario,
  crearCuentaPagar: crearCuenta('cuentas_por_pagar', 'pagar'),
  obtenerCuentasPagar: obtenerCuentas('cuentas_por_pagar'),
  crearCuentaCobrar: crearCuenta('cuentas_por_cobrar', 'cobrar'),
  obtenerCuentasCobrar: obtenerCuentas('cuentas_por_cobrar'),
  obtenerAlertas
};
