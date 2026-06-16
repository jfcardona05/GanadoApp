const pool = require('../config/db');

const CAMPOS_ANIMAL = [
  'id_finca',
  'codigo',
  'chapeta',
  'codigo_alterno',
  'nombre',
  'foto',
  'raza',
  'color',
  'procedencia',
  'id_padre',
  'id_madre',
  'sexo',
  'fecha_nacimiento',
  'fecha_ingreso',
  'peso_actual',
  'estado_salud',
  'estado_productivo',
  'estado_comercial',
  'valor_estimado',
  'precio_compra',
  'fecha_salida',
  'motivo_salida'
];

const normalizarAnimal = (body) => ({
  id_finca: body.id_finca || null,
  codigo: body.codigo,
  chapeta: body.chapeta || null,
  codigo_alterno: body.codigo_alterno || null,
  nombre: body.nombre || null,
  foto: body.foto || null,
  raza: body.raza || null,
  color: body.color || null,
  procedencia: body.procedencia || 'NACIDO_EN_FINCA',
  id_padre: body.id_padre || null,
  id_madre: body.id_madre || null,
  sexo: body.sexo,
  fecha_nacimiento: body.fecha_nacimiento || null,
  fecha_ingreso: body.fecha_ingreso || null,
  peso_actual:
    body.peso_actual !== undefined && body.peso_actual !== null && body.peso_actual !== ''
      ? Number(body.peso_actual)
      : null,
  estado_salud: body.estado_salud || 'SANO',
  estado_productivo: body.estado_productivo || 'LEVANTE',
  estado_comercial: body.estado_comercial || 'ACTIVO',
  valor_estimado: body.valor_estimado || null,
  precio_compra: body.precio_compra || null,
  fecha_salida: body.fecha_salida || null,
  motivo_salida: body.motivo_salida || null
});

const obtenerAnimalDelUsuario = async (id_animal, id_usuario, connection = pool) => {
  const [rows] = await connection.query(
    `SELECT a.*
     FROM animales a
     INNER JOIN fincas f ON a.id_finca = f.id_finca
     WHERE a.id_animal = ? AND f.id_usuario = ?`,
    [id_animal, id_usuario]
  );

  return rows[0];
};

const crearAnimal = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const data = normalizarAnimal(req.body);
    const id_usuario = req.usuario.id_usuario;

    if (!data.id_finca || !data.codigo || !data.sexo) {
      await connection.rollback();
      return res.status(400).json({
        message: 'La finca, el código y el sexo del animal son obligatorios'
      });
    }

    const [fincas] = await connection.query(
      'SELECT id_finca FROM fincas WHERE id_finca = ? AND id_usuario = ?',
      [data.id_finca, id_usuario]
    );

    if (fincas.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'La finca no existe o no pertenece al usuario'
      });
    }

    const [animalExistente] = await connection.query(
      'SELECT id_animal FROM animales WHERE id_finca = ? AND codigo = ?',
      [data.id_finca, data.codigo]
    );

    if (animalExistente.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        message: 'Ya existe un animal con ese código en esta finca'
      });
    }

    if (data.id_padre && !(await obtenerAnimalDelUsuario(data.id_padre, id_usuario, connection))) {
      await connection.rollback();
      return res.status(404).json({ message: 'El padre no pertenece al usuario' });
    }

    if (data.id_madre && !(await obtenerAnimalDelUsuario(data.id_madre, id_usuario, connection))) {
      await connection.rollback();
      return res.status(404).json({ message: 'La madre no pertenece al usuario' });
    }

    const [resultado] = await connection.query(
      `INSERT INTO animales (${CAMPOS_ANIMAL.join(', ')})
       VALUES (${CAMPOS_ANIMAL.map(() => '?').join(', ')})`,
      CAMPOS_ANIMAL.map((campo) => data[campo])
    );

    const id_animal_creado = resultado.insertId;

    if (data.peso_actual !== null) {
      await connection.query(
        `INSERT INTO registros_peso
        (id_animal, peso, fecha_registro, tipo_pesaje, observaciones)
        VALUES (?, ?, CURDATE(), 'INICIAL', ?)`,
        [id_animal_creado, data.peso_actual, 'Registro inicial al crear el animal']
      );
    }

    await connection.query(
      `INSERT INTO eventos_animales
      (id_animal, id_usuario, tipo_evento, titulo, descripcion, fecha_evento, modulo_origen, id_referencia)
      VALUES (?, ?, 'NACIMIENTO', ?, ?, CURDATE(), 'animales', ?)`,
      [
        id_animal_creado,
        id_usuario,
        data.procedencia === 'COMPRADO' ? 'Animal comprado registrado' : 'Animal registrado',
        `Código ${data.codigo}`,
        id_animal_creado
      ]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Animal registrado correctamente',
      id_animal: id_animal_creado
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear animal:', error);
    res.status(500).json({
      message: 'Error al crear animal',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

const obtenerAnimales = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;

    const [animales] = await pool.query(
      `SELECT
        a.*,
        f.nombre AS nombre_finca,
        padre.codigo AS codigo_padre,
        madre.codigo AS codigo_madre
      FROM animales a
      INNER JOIN fincas f ON a.id_finca = f.id_finca
      LEFT JOIN animales padre ON a.id_padre = padre.id_animal
      LEFT JOIN animales madre ON a.id_madre = madre.id_animal
      WHERE f.id_usuario = ?
      ORDER BY a.fecha_registro DESC`,
      [id_usuario]
    );

    res.json(animales);
  } catch (error) {
    console.error('Error al obtener animales:', error);
    res.status(500).json({
      message: 'Error al obtener animales',
      error: error.message
    });
  }
};

const obtenerAnimalPorId = async (req, res) => {
  try {
    const animal = await obtenerAnimalDelUsuario(req.params.id, req.usuario.id_usuario);

    if (!animal) {
      return res.status(404).json({ message: 'Animal no encontrado' });
    }

    res.json(animal);
  } catch (error) {
    console.error('Error al obtener animal:', error);
    res.status(500).json({
      message: 'Error al obtener animal',
      error: error.message
    });
  }
};

const actualizarAnimal = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.usuario.id_usuario;
    const animal = await obtenerAnimalDelUsuario(id, id_usuario);

    if (!animal) {
      return res.status(404).json({
        message: 'Animal no encontrado o no pertenece al usuario'
      });
    }

    const data = normalizarAnimal({ ...animal, ...req.body, id_finca: req.body.id_finca || animal.id_finca });

    if (data.id_finca && data.id_finca !== animal.id_finca) {
      const [fincas] = await pool.query(
        'SELECT id_finca FROM fincas WHERE id_finca = ? AND id_usuario = ?',
        [data.id_finca, id_usuario]
      );
      if (fincas.length === 0) {
        return res.status(404).json({ message: 'La finca no pertenece al usuario' });
      }
    }

    await pool.query(
      `UPDATE animales
       SET ${CAMPOS_ANIMAL.map((campo) => `${campo} = ?`).join(', ')}
       WHERE id_animal = ?`,
      [...CAMPOS_ANIMAL.map((campo) => data[campo]), id]
    );

    res.json({ message: 'Animal actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar animal:', error);
    res.status(500).json({
      message: 'Error al actualizar animal',
      error: error.message
    });
  }
};

const eliminarAnimal = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.usuario.id_usuario;

    const animal = await obtenerAnimalDelUsuario(id, id_usuario);

    if (!animal) {
      return res.status(404).json({
        message: 'Animal no encontrado o no pertenece al usuario'
      });
    }

    await pool.query('DELETE FROM animales WHERE id_animal = ?', [id]);

    res.json({ message: 'Animal eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar animal:', error);
    res.status(500).json({
      message: 'Error al eliminar animal',
      error: error.message
    });
  }
};

module.exports = {
  crearAnimal,
  obtenerAnimales,
  obtenerAnimalPorId,
  actualizarAnimal,
  eliminarAnimal
};
