const pool = require('../config/db');

const registrarPeso = async (req, res) => {
  try {
    const { id_animal, peso, fecha_registro, observaciones } = req.body;
    const id_usuario = req.usuario.id_usuario;

    if (!id_animal || !peso || !fecha_registro) {
      return res.status(400).json({
        message: 'Animal, peso y fecha de registro son obligatorios'
      });
    }

    const [animales] = await pool.query(
      `SELECT a.* 
       FROM animales a
       INNER JOIN fincas f ON a.id_finca = f.id_finca
       WHERE a.id_animal = ? AND f.id_usuario = ?`,
      [id_animal, id_usuario]
    );

    if (animales.length === 0) {
      return res.status(404).json({
        message: 'El animal no existe o no pertenece al usuario'
      });
    }

    await pool.query(
      `INSERT INTO registros_peso 
      (id_animal, peso, fecha_registro, observaciones)
      VALUES (?, ?, ?, ?)`,
      [id_animal, peso, fecha_registro, observaciones || null]
    );

    await pool.query(
      'UPDATE animales SET peso_actual = ? WHERE id_animal = ?',
      [peso, id_animal]
    );

    res.status(201).json({
      message: 'Peso registrado correctamente'
    });

  } catch (error) {
    console.error('Error al registrar peso:', error);

    res.status(500).json({
      message: 'Error al registrar peso',
      error: error.message
    });
  }
};

const obtenerRegistrosPeso = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;

    const [registros] = await pool.query(
      `SELECT 
        rp.id_peso,
        rp.id_animal,
        a.codigo AS codigo_animal,
        a.nombre AS nombre_animal,
        rp.peso,
        rp.fecha_registro,
        rp.observaciones,
        f.nombre AS nombre_finca
      FROM registros_peso rp
      INNER JOIN animales a ON rp.id_animal = a.id_animal
      INNER JOIN fincas f ON a.id_finca = f.id_finca
      WHERE f.id_usuario = ?
      ORDER BY rp.fecha_registro DESC`,
      [id_usuario]
    );

    res.json(registros);

  } catch (error) {
    console.error('Error al obtener registros de peso:', error);

    res.status(500).json({
      message: 'Error al obtener registros de peso',
      error: error.message
    });
  }
};

const obtenerPesosPorAnimal = async (req, res) => {
  try {
    const { id_animal } = req.params;
    const id_usuario = req.usuario.id_usuario;

    const [registros] = await pool.query(
      `SELECT 
        rp.id_peso,
        rp.id_animal,
        a.codigo AS codigo_animal,
        a.nombre AS nombre_animal,
        rp.peso,
        rp.fecha_registro,
        rp.observaciones
      FROM registros_peso rp
      INNER JOIN animales a ON rp.id_animal = a.id_animal
      INNER JOIN fincas f ON a.id_finca = f.id_finca
      WHERE rp.id_animal = ? AND f.id_usuario = ?
      ORDER BY rp.fecha_registro ASC`,
      [id_animal, id_usuario]
    );

    res.json(registros);

  } catch (error) {
    console.error('Error al obtener historial de peso del animal:', error);

    res.status(500).json({
      message: 'Error al obtener historial de peso del animal',
      error: error.message
    });
  }
};

const eliminarRegistroPeso = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.usuario.id_usuario;

    const [registro] = await pool.query(
      `SELECT rp.* 
       FROM registros_peso rp
       INNER JOIN animales a ON rp.id_animal = a.id_animal
       INNER JOIN fincas f ON a.id_finca = f.id_finca
       WHERE rp.id_peso = ? AND f.id_usuario = ?`,
      [id, id_usuario]
    );

    if (registro.length === 0) {
      return res.status(404).json({
        message: 'Registro de peso no encontrado o no pertenece al usuario'
      });
    }

    await pool.query(
      'DELETE FROM registros_peso WHERE id_peso = ?',
      [id]
    );

    res.json({
      message: 'Registro de peso eliminado correctamente'
    });

  } catch (error) {
    console.error('Error al eliminar registro de peso:', error);

    res.status(500).json({
      message: 'Error al eliminar registro de peso',
      error: error.message
    });
  }
};

module.exports = {
  registrarPeso,
  obtenerRegistrosPeso,
  obtenerPesosPorAnimal,
  eliminarRegistroPeso
};