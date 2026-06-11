const pool = require('../config/db');

const crearAnimal = async (req, res) => {
  try {
    const {
      id_finca,
      codigo,
      nombre,
      foto,
      raza,
      sexo,
      fecha_nacimiento,
      peso_actual,
      estado_salud
    } = req.body;

    const id_usuario = req.usuario.id_usuario;

    if (!id_finca || !codigo || !sexo) {
      return res.status(400).json({
        message: 'La finca, el código y el sexo del animal son obligatorios'
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

    const [animalExistente] = await pool.query(
      'SELECT * FROM animales WHERE id_finca = ? AND codigo = ?',
      [id_finca, codigo]
    );

    if (animalExistente.length > 0) {
      return res.status(400).json({
        message: 'Ya existe un animal con ese código en esta finca'
      });
    }

    await pool.query(
      `INSERT INTO animales 
      (id_finca, codigo, nombre, foto, raza, sexo, fecha_nacimiento, peso_actual, estado_salud) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_finca,
        codigo,
        nombre || null,
        foto || null,
        raza || null,
        sexo,
        fecha_nacimiento || null,
        peso_actual || null,
        estado_salud || 'SANO'
      ]
    );

    res.status(201).json({
      message: 'Animal registrado correctamente'
    });

  } catch (error) {
    console.error('Error al crear animal:', error);

    res.status(500).json({
      message: 'Error al crear animal',
      error: error.message
    });
  }
};

const obtenerAnimales = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;

    const [animales] = await pool.query(
      `SELECT 
        a.*,
        f.nombre AS nombre_finca
      FROM animales a
      INNER JOIN fincas f ON a.id_finca = f.id_finca
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
    const { id } = req.params;
    const id_usuario = req.usuario.id_usuario;

    const [animales] = await pool.query(
      `SELECT 
        a.*,
        f.nombre AS nombre_finca
      FROM animales a
      INNER JOIN fincas f ON a.id_finca = f.id_finca
      WHERE a.id_animal = ? AND f.id_usuario = ?`,
      [id, id_usuario]
    );

    if (animales.length === 0) {
      return res.status(404).json({
        message: 'Animal no encontrado'
      });
    }

    res.json(animales[0]);

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
    const {
      codigo,
      nombre,
      foto,
      raza,
      sexo,
      fecha_nacimiento,
      peso_actual,
      estado_salud
    } = req.body;

    const id_usuario = req.usuario.id_usuario;

    const [animal] = await pool.query(
      `SELECT a.* 
       FROM animales a
       INNER JOIN fincas f ON a.id_finca = f.id_finca
       WHERE a.id_animal = ? AND f.id_usuario = ?`,
      [id, id_usuario]
    );

    if (animal.length === 0) {
      return res.status(404).json({
        message: 'Animal no encontrado o no pertenece al usuario'
      });
    }

    await pool.query(
      `UPDATE animales 
       SET codigo = ?, nombre = ?, foto = ?, raza = ?, sexo = ?, fecha_nacimiento = ?, peso_actual = ?, estado_salud = ?
       WHERE id_animal = ?`,
      [
        codigo,
        nombre || null,
        foto || null,
        raza || null,
        sexo,
        fecha_nacimiento || null,
        peso_actual || null,
        estado_salud || 'SANO',
        id
      ]
    );

    res.json({
      message: 'Animal actualizado correctamente'
    });

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

    const [animal] = await pool.query(
      `SELECT a.* 
       FROM animales a
       INNER JOIN fincas f ON a.id_finca = f.id_finca
       WHERE a.id_animal = ? AND f.id_usuario = ?`,
      [id, id_usuario]
    );

    if (animal.length === 0) {
      return res.status(404).json({
        message: 'Animal no encontrado o no pertenece al usuario'
      });
    }

    await pool.query(
      'DELETE FROM animales WHERE id_animal = ?',
      [id]
    );

    res.json({
      message: 'Animal eliminado correctamente'
    });

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