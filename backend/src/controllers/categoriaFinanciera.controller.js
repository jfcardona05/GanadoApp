const pool = require('../config/db');

const crearCategoria = async (req, res) => {
  try {
    const { nombre, tipo } = req.body;
    const id_usuario = req.usuario.id_usuario;

    if (!nombre || !tipo) {
      return res.status(400).json({
        message: 'Nombre y tipo de categoría son obligatorios'
      });
    }

    if (!['GASTO', 'INGRESO'].includes(tipo)) {
      return res.status(400).json({
        message: 'El tipo debe ser GASTO o INGRESO'
      });
    }

    const [categoriaExistente] = await pool.query(
      `SELECT * FROM categorias_financieras
       WHERE id_usuario = ? AND nombre = ? AND tipo = ?`,
      [id_usuario, nombre, tipo]
    );

    if (categoriaExistente.length > 0) {
      return res.status(400).json({
        message: 'Ya existe una categoría con ese nombre y tipo'
      });
    }

    await pool.query(
      `INSERT INTO categorias_financieras
      (id_usuario, nombre, tipo)
      VALUES (?, ?, ?)`,
      [id_usuario, nombre, tipo]
    );

    res.status(201).json({
      message: 'Categoría creada correctamente'
    });

  } catch (error) {
    console.error('Error al crear categoría financiera:', error);

    res.status(500).json({
      message: 'Error al crear categoría financiera',
      error: error.message
    });
  }
};

const obtenerCategorias = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;

    const [categorias] = await pool.query(
      `SELECT *
       FROM categorias_financieras
       WHERE id_usuario = ?
       ORDER BY tipo ASC, nombre ASC`,
      [id_usuario]
    );

    res.json(categorias);

  } catch (error) {
    console.error('Error al obtener categorías financieras:', error);

    res.status(500).json({
      message: 'Error al obtener categorías financieras',
      error: error.message
    });
  }
};

const obtenerCategoriaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.usuario.id_usuario;

    const [categorias] = await pool.query(
      `SELECT *
       FROM categorias_financieras
       WHERE id_categoria = ? AND id_usuario = ?`,
      [id, id_usuario]
    );

    if (categorias.length === 0) {
      return res.status(404).json({
        message: 'Categoría no encontrada'
      });
    }

    res.json(categorias[0]);

  } catch (error) {
    console.error('Error al obtener categoría financiera:', error);

    res.status(500).json({
      message: 'Error al obtener categoría financiera',
      error: error.message
    });
  }
};

const actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, tipo } = req.body;
    const id_usuario = req.usuario.id_usuario;

    if (!nombre || !tipo) {
      return res.status(400).json({
        message: 'Nombre y tipo de categoría son obligatorios'
      });
    }

    if (!['GASTO', 'INGRESO'].includes(tipo)) {
      return res.status(400).json({
        message: 'El tipo debe ser GASTO o INGRESO'
      });
    }

    const [resultado] = await pool.query(
      `UPDATE categorias_financieras
       SET nombre = ?, tipo = ?
       WHERE id_categoria = ? AND id_usuario = ?`,
      [nombre, tipo, id, id_usuario]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        message: 'Categoría no encontrada o no pertenece al usuario'
      });
    }

    res.json({
      message: 'Categoría actualizada correctamente'
    });

  } catch (error) {
    console.error('Error al actualizar categoría financiera:', error);

    res.status(500).json({
      message: 'Error al actualizar categoría financiera',
      error: error.message
    });
  }
};

const eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.usuario.id_usuario;

    const [categoria] = await pool.query(
      `SELECT *
       FROM categorias_financieras
       WHERE id_categoria = ? AND id_usuario = ?`,
      [id, id_usuario]
    );

    if (categoria.length === 0) {
      return res.status(404).json({
        message: 'Categoría no encontrada o no pertenece al usuario'
      });
    }

    await pool.query(
      `UPDATE gastos
       SET id_categoria = NULL
       WHERE id_categoria = ?`,
      [id]
    );

    await pool.query(
      `UPDATE ingresos
       SET id_categoria = NULL
       WHERE id_categoria = ?`,
      [id]
    );

    await pool.query(
      `DELETE FROM categorias_financieras
       WHERE id_categoria = ? AND id_usuario = ?`,
      [id, id_usuario]
    );

    res.json({
      message: 'Categoría eliminada correctamente'
    });

  } catch (error) {
    console.error('Error al eliminar categoría financiera:', error);

    res.status(500).json({
      message: 'Error al eliminar categoría financiera',
      error: error.message
    });
  }
};

module.exports = {
  crearCategoria,
  obtenerCategorias,
  obtenerCategoriaPorId,
  actualizarCategoria,
  eliminarCategoria
};