const pool = require('../config/db');

const crearGasto = async (req, res) => {
  try {
    const { id_finca, categoria, descripcion, monto, fecha } = req.body;
    const id_usuario = req.usuario.id_usuario;

    if (!id_finca || !categoria || !monto || !fecha) {
      return res.status(400).json({
        message: 'Finca, categoría, monto y fecha son obligatorios'
      });
    }

    const [fincas] = await pool.query(
      'SELECT * FROM fincas WHERE id_finca = ? AND id_usuario = ?',
      [id_finca, id_usuario]
    );

    if (fincas.length === 0) {
      return res.status(404).json({
        message: 'La finca no existe o no pertenece al usuario'
      });
    }

    await pool.query(
      `INSERT INTO gastos 
      (id_finca, categoria, descripcion, monto, fecha)
      VALUES (?, ?, ?, ?, ?)`,
      [id_finca, categoria, descripcion || null, monto, fecha]
    );

    res.status(201).json({
      message: 'Gasto registrado correctamente'
    });

  } catch (error) {
    console.error('Error al registrar gasto:', error);

    res.status(500).json({
      message: 'Error al registrar gasto',
      error: error.message
    });
  }
};

const obtenerGastos = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;

    const [gastos] = await pool.query(
      `SELECT 
        g.*,
        f.nombre AS nombre_finca
      FROM gastos g
      INNER JOIN fincas f ON g.id_finca = f.id_finca
      WHERE f.id_usuario = ?
      ORDER BY g.fecha DESC`,
      [id_usuario]
    );

    res.json(gastos);

  } catch (error) {
    console.error('Error al obtener gastos:', error);

    res.status(500).json({
      message: 'Error al obtener gastos',
      error: error.message
    });
  }
};

const eliminarGasto = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.usuario.id_usuario;

    const [gasto] = await pool.query(
      `SELECT g.* 
       FROM gastos g
       INNER JOIN fincas f ON g.id_finca = f.id_finca
       WHERE g.id_gasto = ? AND f.id_usuario = ?`,
      [id, id_usuario]
    );

    if (gasto.length === 0) {
      return res.status(404).json({
        message: 'Gasto no encontrado o no pertenece al usuario'
      });
    }

    await pool.query(
      'DELETE FROM gastos WHERE id_gasto = ?',
      [id]
    );

    res.json({
      message: 'Gasto eliminado correctamente'
    });

  } catch (error) {
    console.error('Error al eliminar gasto:', error);

    res.status(500).json({
      message: 'Error al eliminar gasto',
      error: error.message
    });
  }
};

const crearIngreso = async (req, res) => {
  try {
    const { id_finca, categoria, descripcion, monto, fecha } = req.body;
    const id_usuario = req.usuario.id_usuario;

    if (!id_finca || !categoria || !monto || !fecha) {
      return res.status(400).json({
        message: 'Finca, categoría, monto y fecha son obligatorios'
      });
    }

    const [fincas] = await pool.query(
      'SELECT * FROM fincas WHERE id_finca = ? AND id_usuario = ?',
      [id_finca, id_usuario]
    );

    if (fincas.length === 0) {
      return res.status(404).json({
        message: 'La finca no existe o no pertenece al usuario'
      });
    }

    await pool.query(
      `INSERT INTO ingresos 
      (id_finca, categoria, descripcion, monto, fecha)
      VALUES (?, ?, ?, ?, ?)`,
      [id_finca, categoria, descripcion || null, monto, fecha]
    );

    res.status(201).json({
      message: 'Ingreso registrado correctamente'
    });

  } catch (error) {
    console.error('Error al registrar ingreso:', error);

    res.status(500).json({
      message: 'Error al registrar ingreso',
      error: error.message
    });
  }
};

const obtenerIngresos = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;

    const [ingresos] = await pool.query(
      `SELECT 
        i.*,
        f.nombre AS nombre_finca
      FROM ingresos i
      INNER JOIN fincas f ON i.id_finca = f.id_finca
      WHERE f.id_usuario = ?
      ORDER BY i.fecha DESC`,
      [id_usuario]
    );

    res.json(ingresos);

  } catch (error) {
    console.error('Error al obtener ingresos:', error);

    res.status(500).json({
      message: 'Error al obtener ingresos',
      error: error.message
    });
  }
};

const eliminarIngreso = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.usuario.id_usuario;

    const [ingreso] = await pool.query(
      `SELECT i.* 
       FROM ingresos i
       INNER JOIN fincas f ON i.id_finca = f.id_finca
       WHERE i.id_ingreso = ? AND f.id_usuario = ?`,
      [id, id_usuario]
    );

    if (ingreso.length === 0) {
      return res.status(404).json({
        message: 'Ingreso no encontrado o no pertenece al usuario'
      });
    }

    await pool.query(
      'DELETE FROM ingresos WHERE id_ingreso = ?',
      [id]
    );

    res.json({
      message: 'Ingreso eliminado correctamente'
    });

  } catch (error) {
    console.error('Error al eliminar ingreso:', error);

    res.status(500).json({
      message: 'Error al eliminar ingreso',
      error: error.message
    });
  }
};

const obtenerResumenFinanciero = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;

    const [totalGastos] = await pool.query(
      `SELECT COALESCE(SUM(g.monto), 0) AS total_gastos
       FROM gastos g
       INNER JOIN fincas f ON g.id_finca = f.id_finca
       WHERE f.id_usuario = ?`,
      [id_usuario]
    );

    const [totalIngresos] = await pool.query(
      `SELECT COALESCE(SUM(i.monto), 0) AS total_ingresos
       FROM ingresos i
       INNER JOIN fincas f ON i.id_finca = f.id_finca
       WHERE f.id_usuario = ?`,
      [id_usuario]
    );

    const gastos = Number(totalGastos[0].total_gastos);
    const ingresos = Number(totalIngresos[0].total_ingresos);
    const balance = ingresos - gastos;

    res.json({
      total_ingresos: ingresos,
      total_gastos: gastos,
      balance
    });

  } catch (error) {
    console.error('Error al obtener resumen financiero:', error);

    res.status(500).json({
      message: 'Error al obtener resumen financiero',
      error: error.message
    });
  }
};

module.exports = {
  crearGasto,
  obtenerGastos,
  eliminarGasto,
  crearIngreso,
  obtenerIngresos,
  eliminarIngreso,
  obtenerResumenFinanciero
};