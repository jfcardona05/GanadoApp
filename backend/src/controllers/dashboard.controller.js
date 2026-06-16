const pool = require('../config/db');

const obtenerResumenDashboard = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;

    const [totalFincas] = await pool.query(
      'SELECT COUNT(*) AS total FROM fincas WHERE id_usuario = ?',
      [id_usuario]
    );

    const [totalAnimales] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM animales a
       INNER JOIN fincas f ON a.id_finca = f.id_finca
       WHERE f.id_usuario = ?`,
      [id_usuario]
    );

    const [animalesPorSalud] = await pool.query(
      `SELECT a.estado_salud, COUNT(*) AS total
       FROM animales a
       INNER JOIN fincas f ON a.id_finca = f.id_finca
       WHERE f.id_usuario = ?
       GROUP BY a.estado_salud`,
      [id_usuario]
    );

    const [vacunasProximas] = await pool.query(
      `SELECT 
        rv.id_registro,
        a.codigo AS codigo_animal,
        a.nombre AS nombre_animal,
        v.nombre AS nombre_vacuna,
        rv.proxima_fecha
       FROM registros_vacunacion rv
       INNER JOIN animales a ON rv.id_animal = a.id_animal
       INNER JOIN vacunas v ON rv.id_vacuna = v.id_vacuna
       INNER JOIN fincas f ON a.id_finca = f.id_finca
       WHERE f.id_usuario = ?
       AND rv.proxima_fecha IS NOT NULL
       AND rv.proxima_fecha <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
       ORDER BY rv.proxima_fecha ASC
       LIMIT 10`,
      [id_usuario]
    );

    const [ultimosAnimales] = await pool.query(
      `SELECT 
        a.id_animal,
        a.codigo,
        a.nombre,
        a.raza,
        a.sexo,
        a.peso_actual,
        a.estado_salud,
        f.nombre AS nombre_finca
       FROM animales a
       INNER JOIN fincas f ON a.id_finca = f.id_finca
       WHERE f.id_usuario = ?
       ORDER BY a.fecha_registro DESC
       LIMIT 5`,
      [id_usuario]
    );

    const [totalGastos] = await pool.query(
      `SELECT COALESCE(SUM(g.monto), 0) AS total
       FROM gastos g
       INNER JOIN fincas f ON g.id_finca = f.id_finca
       WHERE f.id_usuario = ?`,
      [id_usuario]
    );

    const [totalIngresos] = await pool.query(
      `SELECT COALESCE(SUM(i.monto), 0) AS total
       FROM ingresos i
       INNER JOIN fincas f ON i.id_finca = f.id_finca
       WHERE f.id_usuario = ?`,
      [id_usuario]
    );

    const ingresos = Number(totalIngresos[0].total);
    const gastos = Number(totalGastos[0].total);

    res.json({
      total_fincas: totalFincas[0].total,
      total_animales: totalAnimales[0].total,
      animales_por_salud: animalesPorSalud,
      vacunas_proximas: vacunasProximas,
      ultimos_animales: ultimosAnimales,
      finanzas: {
        total_ingresos: ingresos,
        total_gastos: gastos,
        balance: ingresos - gastos
      }
    });

  } catch (error) {
    console.error('Error al obtener resumen del dashboard:', error);

    res.status(500).json({
      message: 'Error al obtener resumen del dashboard',
      error: error.message
    });
  }
};

module.exports = {
  obtenerResumenDashboard
};
