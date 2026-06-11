const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const fincaRoutes = require('./routes/finca.routes');
const animalRoutes = require('./routes/animal.routes');
const vacunaRoutes = require('./routes/vacuna.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'API de GanadoApp funcionando correctamente'
  });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DATABASE() AS database_actual');

    res.json({
      message: 'Conexión a MySQL exitosa',
      database: rows[0].database_actual
    });
  } catch (error) {
    console.error('Error al conectar con MySQL:', error);

    res.status(500).json({
      message: 'Error al conectar con MySQL',
      error: error.message
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/fincas', fincaRoutes);
app.use('/api/animales', animalRoutes);
app.use('/api/vacunas', vacunaRoutes);

module.exports = app;