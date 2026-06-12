const pool = require('../config/db');

const calcularProximaFecha = (fechaAplicacion, frecuenciaDias) => {
  if (!frecuenciaDias) {
    return null;
  }

  const fecha = new Date(fechaAplicacion);
  fecha.setDate(fecha.getDate() + Number(frecuenciaDias));

  return fecha.toISOString().slice(0, 10);
};

const registrarVacunacion = async (req, res) => {
  try {
    const {
      id_animal,
      id_vacuna,
      fecha_aplicacion,
      veterinario,
      observaciones
    } = req.body;

    const id_usuario = req.usuario.id_usuario;

    if (!id_animal || !id_vacuna || !fecha_aplicacion) {
      return res.status(400).json({
        message: 'Animal, vacuna y fecha de aplicación son obligatorios'
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

    const [vacunas] = await pool.query(
      'SELECT * FROM vacunas WHERE id_vacuna = ? AND id_usuario = ?',
      [id_vacuna, id_usuario]
    );

    if (vacunas.length === 0) {
      return res.status(404).json({
        message: 'La vacuna no existe o no pertenece al usuario'
      });
    }

    const vacuna = vacunas[0];

    const proxima_fecha = calcularProximaFecha(
      fecha_aplicacion,
      vacuna.frecuencia_dias
    );

    await pool.query(
      `INSERT INTO registros_vacunacion
      (id_animal, id_vacuna, fecha_aplicacion, proxima_fecha, veterinario, observaciones)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id_animal,
        id_vacuna,
        fecha_aplicacion,
        proxima_fecha,
        veterinario || null,
        observaciones || null
      ]
    );

    res.status(201).json({
      message: 'Vacunación registrada correctamente',
      proxima_fecha
    });

  } catch (error) {
    console.error('Error al registrar vacunación:', error);

    res.status(500).json({
      message: 'Error al registrar vacunación',
      error: error.message
    });
  }
};

const obtenerRegistrosVacunacion = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;

    const [registros] = await pool.query(
      `SELECT 
        rv.id_registro,
        rv.id_animal,
        a.codigo AS codigo_animal,
        a.nombre AS nombre_animal,
        rv.id_vacuna,
        v.nombre AS nombre_vacuna,
        v.frecuencia_dias,
        rv.fecha_aplicacion,
        rv.proxima_fecha,
        rv.veterinario,
        rv.observaciones,
        f.nombre AS nombre_finca
      FROM registros_vacunacion rv
      INNER JOIN animales a ON rv.id_animal = a.id_animal
      INNER JOIN vacunas v ON rv.id_vacuna = v.id_vacuna
      INNER JOIN fincas f ON a.id_finca = f.id_finca
      WHERE f.id_usuario = ?
      ORDER BY rv.fecha_aplicacion DESC`,
      [id_usuario]
    );

    res.json(registros);

  } catch (error) {
    console.error('Error al obtener registros de vacunación:', error);

    res.status(500).json({
      message: 'Error al obtener registros de vacunación',
      error: error.message
    });
  }
};

const obtenerRegistrosPorAnimal = async (req, res) => {
  try {
    const { id_animal } = req.params;
    const id_usuario = req.usuario.id_usuario;

    const [registros] = await pool.query(
      `SELECT 
        rv.id_registro,
        rv.id_animal,
        a.codigo AS codigo_animal,
        a.nombre AS nombre_animal,
        rv.id_vacuna,
        v.nombre AS nombre_vacuna,
        v.frecuencia_dias,
        rv.fecha_aplicacion,
        rv.proxima_fecha,
        rv.veterinario,
        rv.observaciones
      FROM registros_vacunacion rv
      INNER JOIN animales a ON rv.id_animal = a.id_animal
      INNER JOIN vacunas v ON rv.id_vacuna = v.id_vacuna
      INNER JOIN fincas f ON a.id_finca = f.id_finca
      WHERE rv.id_animal = ? AND f.id_usuario = ?
      ORDER BY rv.fecha_aplicacion DESC`,
      [id_animal, id_usuario]
    );

    res.json(registros);

  } catch (error) {
    console.error('Error al obtener historial de vacunación del animal:', error);

    res.status(500).json({
      message: 'Error al obtener historial de vacunación del animal',
      error: error.message
    });
  }
};

const eliminarRegistroVacunacion = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.usuario.id_usuario;

    const [registro] = await pool.query(
      `SELECT rv.* 
       FROM registros_vacunacion rv
       INNER JOIN animales a ON rv.id_animal = a.id_animal
       INNER JOIN fincas f ON a.id_finca = f.id_finca
       WHERE rv.id_registro = ? AND f.id_usuario = ?`,
      [id, id_usuario]
    );

    if (registro.length === 0) {
      return res.status(404).json({
        message: 'Registro de vacunación no encontrado o no pertenece al usuario'
      });
    }

    await pool.query(
      'DELETE FROM registros_vacunacion WHERE id_registro = ?',
      [id]
    );

    res.json({
      message: 'Registro de vacunación eliminado correctamente'
    });

  } catch (error) {
    console.error('Error al eliminar registro de vacunación:', error);

    res.status(500).json({
      message: 'Error al eliminar registro de vacunación',
      error: error.message
    });
  }
};

module.exports = {
  registrarVacunacion,
  obtenerRegistrosVacunacion,
  obtenerRegistrosPorAnimal,
  eliminarRegistroVacunacion
};