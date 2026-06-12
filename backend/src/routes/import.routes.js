const express = require('express');
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const router = express.Router();

router.post('/database', async (req, res) => {
  try {
    const importKey = req.headers['x-import-key'];

    if (importKey !== process.env.IMPORT_KEY) {
      return res.status(401).json({
        message: 'No autorizado'
      });
    }

    const filePath = path.join(__dirname, '..', 'database', 'ganadoapp.sql');

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: 'No se encontró el archivo SQL'
      });
    }

    let sql = fs.readFileSync(filePath, 'utf8');

    sql = sql
      .replace(/CREATE DATABASE.*?;/gi, '')
      .replace(/USE .*?;/gi, '');

    await pool.query(sql);

    res.json({
      message: 'Base de datos importada correctamente'
    });

  } catch (error) {
    console.error('Error al importar base de datos:', error);

    res.status(500).json({
      message: 'Error al importar base de datos',
      error: error.message
    });
  }
});

module.exports = router;