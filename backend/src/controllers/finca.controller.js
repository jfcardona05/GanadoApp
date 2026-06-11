const pool = require('../config/db');

const crearFinca = async (req, res) => {
  try {
    const { nombre, ubicacion, hectareas } = req.body;
    const id_usuario = req.usuario.id_usuario;

    if (!nombre) {
      return res.status(400).json({
        message: 'El nombre de la finca es obligatorio'
      });
    }

    await pool.query(
      'INSERT INTO fincas (id_usuario, nombre, ubicacion, hectareas) VALUES (?, ?, ?, ?)',
      [id_usuario, nombre, ubicacion || null, hectareas || null]
    );

    res.status(201).json({
      message: 'Finca creada correctamente'
    });

  } catch (error) {
    console.error('Error al crear finca:', error);

    res.status(500).json({
      message: 'Error al crear finca',
      error: error.message
    });
  }
};

const obtenerFincas = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;

    const [fincas] = await pool.query(
      'SELECT * FROM fincas WHERE id_usuario = ? ORDER BY fecha_creacion DESC',
      [id_usuario]
    );

    res.json(fincas);

  } catch (error) {
    console.error('Error al obtener fincas:', error);

    res.status(500).json({
      message: 'Error al obtener fincas',
      error: error.message
    });
  }
};

const obtenerFincaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.usuario.id_usuario;

    const [fincas] = await pool.query(
      'SELECT * FROM fincas WHERE id_finca = ? AND id_usuario = ?',
      [id, id_usuario]
    );

    if (fincas.length === 0) {
      return res.status(404).json({
        message: 'Finca no encontrada'
      });
    }

    res.json(fincas[0]);

  } catch (error) {
    console.error('Error al obtener finca:', error);

    res.status(500).json({
      message: 'Error al obtener finca',
      error: error.message
    });
  }
};

const actualizarFinca = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, ubicacion, hectareas } = req.body;
    const id_usuario = req.usuario.id_usuario;

    if (!nombre) {
      return res.status(400).json({
        message: 'El nombre de la finca es obligatorio'
      });
    }

    const [resultado] = await pool.query(
      'UPDATE fincas SET nombre = ?, ubicacion = ?, hectareas = ? WHERE id_finca = ? AND id_usuario = ?',
      [nombre, ubicacion || null, hectareas || null, id, id_usuario]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        message: 'Finca no encontrada o no pertenece al usuario'
      });
    }

    res.json({
      message: 'Finca actualizada correctamente'
    });

  } catch (error) {
    console.error('Error al actualizar finca:', error);

    res.status(500).json({
      message: 'Error al actualizar finca',
      error: error.message
    });
  }
};

const eliminarFinca = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.usuario.id_usuario;

    const [resultado] = await pool.query(
      'DELETE FROM fincas WHERE id_finca = ? AND id_usuario = ?',
      [id, id_usuario]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        message: 'Finca no encontrada o no pertenece al usuario'
      });
    }

    res.json({
      message: 'Finca eliminada correctamente'
    });

  } catch (error) {
    console.error('Error al eliminar finca:', error);

    res.status(500).json({
      message: 'Error al eliminar finca',
      error: error.message
    });
  }
};

module.exports = {
  crearFinca,
  obtenerFincas,
  obtenerFincaPorId,
  actualizarFinca,
  eliminarFinca
};