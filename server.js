const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { getDatabase } = require('./config/database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para verificar conexión a BD (opcional)
app.use(async (req, res, next) => {
  try {
    await getDatabase();
    next();
  } catch (error) {
    console.error('Error de conexión a BD:', error);
    res.status(500).json({ error: 'Error de conexión a la base de datos' });
  }
});

// Rutas
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const productsRoutes = require('./routes/products');

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/products', productsRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Tienda de Materiales de Construcción',
    version: '1.0.0',
    database: 'SQLite',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      products: '/api/products'
    }
  });
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📁 Base de datos SQLite: ${process.env.DB_PATH || './data/materiales.db'}`);
});