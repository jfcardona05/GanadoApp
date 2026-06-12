const pool = require('../config/db');

const crearVacuna = async (req, res) => {
  try {
    const { nombre, descripcion, frecuencia_dias, obligatoria } = req.body;
    const id_usuario = req.usuario.id_usuario;

    if (!nombre) {
      return res.status(400).json({
        message: 'El nombre de la vacuna es obligatorio'
      });
    }

    const [vacunaExistente] = await pool.query(
      'SELECT * FROM vacunas WHERE nombre = ? AND id_usuario = ?',
      [nombre, id_usuario]
    );

    if (vacunaExistente.length > 0) {
      return res.status(400).json({
        message: 'Ya existe una vacuna con ese nombre para este usuario'
      });
    }

    await pool.query(
      `INSERT INTO vacunas 
      (id_usuario, nombre, descripcion, frecuencia_dias, obligatoria) 
      VALUES (?, ?, ?, ?, ?)`,
      [
        id_usuario,
        nombre,
        descripcion || null,
        frecuencia_dias || null,
        obligatoria || false
      ]
    );

    res.status(201).json({
      message: 'Vacuna creada correctamente'
    });

  } catch (error) {
    console.error('Error al crear vacuna:', error);

    res.status(500).json({
      message: 'Error al crear vacuna',
      error: error.message
    });
  }
};

const obtenerVacunas = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;

    const [vacunas] = await pool.query(
      'SELECT * FROM vacunas WHERE id_usuario = ? ORDER BY nombre ASC',
      [id_usuario]
    );

    res.json(vacunas);

  } catch (error) {
    console.error('Error al obtener vacunas:', error);

    res.status(500).json({
      message: 'Error al obtener vacunas',
      error: error.message
    });
  }
};

const obtenerVacunaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.usuario.id_usuario;

    const [vacunas] = await pool.query(
      'SELECT * FROM vacunas WHERE id_vacuna = ? AND id_usuario = ?',
      [id, id_usuario]
    );

    if (vacunas.length === 0) {
      return res.status(404).json({
        message: 'Vacuna no encontrada'
      });
    }

    res.json(vacunas[0]);

  } catch (error) {
    console.error('Error al obtener vacuna:', error);

    res.status(500).json({
      message: 'Error al obtener vacuna',
      error: error.message
    });
  }
};

const actualizarVacuna = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, frecuencia_dias, obligatoria } = req.body;
    const id_usuario = req.usuario.id_usuario;

    if (!nombre) {
      return res.status(400).json({
        message: 'El nombre de la vacuna es obligatorio'
      });
    }

    const [resultado] = await pool.query(
      `UPDATE vacunas 
       SET nombre = ?, descripcion = ?, frecuencia_dias = ?, obligatoria = ?
       WHERE id_vacuna = ? AND id_usuario = ?`,
      [
        nombre,
        descripcion || null,
        frecuencia_dias || null,
        obligatoria || false,
        id,
        id_usuario
      ]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        message: 'Vacuna no encontrada o no pertenece al usuario'
      });
    }

    res.json({
      message: 'Vacuna actualizada correctamente'
    });

  } catch (error) {
    console.error('Error al actualizar vacuna:', error);

    res.status(500).json({
      message: 'Error al actualizar vacuna',
      error: error.message
    });
  }
};

const eliminarVacuna = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.usuario.id_usuario;

    const [resultado] = await pool.query(
      'DELETE FROM vacunas WHERE id_vacuna = ? AND id_usuario = ?',
      [id, id_usuario]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        message: 'Vacuna no encontrada o no pertenece al usuario'
      });
    }

    res.json({
      message: 'Vacuna eliminada correctamente'
    });

  } catch (error) {
    console.error('Error al eliminar vacuna:', error);

    res.status(500).json({
      message: 'Error al eliminar vacuna',
      error: error.message
    });
  }
};

module.exports = {
  crearVacuna,
  obtenerVacunas,
  obtenerVacunaPorId,
  actualizarVacuna,
  eliminarVacuna
};