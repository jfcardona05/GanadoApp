const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const registrarUsuario = async (req, res) => {
  try {
    const { nombre, correo, password, rol } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({
        message: 'Nombre, correo y contraseña son obligatorios'
      });
    }

    const [usuarioExistente] = await pool.query(
      'SELECT * FROM usuarios WHERE correo = ?',
      [correo]
    );

    if (usuarioExistente.length > 0) {
      return res.status(400).json({
        message: 'El correo ya está registrado'
      });
    }

    const passwordEncriptada = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO usuarios (nombre, correo, password, rol) VALUES (?, ?, ?, ?)',
      [nombre, correo, passwordEncriptada, rol || 'GANADERO']
    );

    res.status(201).json({
      message: 'Usuario registrado correctamente'
    });

  } catch (error) {
    console.error('Error al registrar usuario:', error);

    res.status(500).json({
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
};

const iniciarSesion = async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({
        message: 'Correo y contraseña son obligatorios'
      });
    }

    const [usuarios] = await pool.query(
      'SELECT * FROM usuarios WHERE correo = ?',
      [correo]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    const usuario = usuarios[0];

    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({
        message: 'Contraseña incorrecta'
      });
    }

    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        correo: usuario.correo,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error('Error al iniciar sesión:', error);

    res.status(500).json({
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

const perfilUsuario = async (req, res) => {
  res.json({
    message: 'Ruta protegida funcionando correctamente',
    usuario: req.usuario
  });
};

module.exports = {
  registrarUsuario,
  iniciarSesion,
  perfilUsuario
};