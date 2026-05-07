const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY || 'mi-secreto-super-seguro';

// Obtener todos los usuarios (solo admin)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un usuario específico (admin o el propio usuario)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // Verificar si es admin o el mismo usuario
    if (req.user.rol !== 'admin' && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear nuevo usuario (registro público)
router.post('/register', async (req, res) => {
  try {
    const { nombre, descripcion, rol, password } = req.body;
    
    if (!nombre || !descripcion || !password) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    // Si no se especifica rol, por defecto es 'user'
    const userRol = rol === 'admin' ? 'admin' : 'user';
    
    const newUser = await User.create({
      nombre,
      descripcion,
      rol: userRol,
      password
    });
    
    res.status(201).json({ message: 'Usuario creado exitosamente', user: newUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { nombre, password } = req.body;
    
    if (!nombre || !password) {
      return res.status(400).json({ error: 'Nombre y contraseña requeridos' });
    }
    
    const user = await User.authenticate(nombre, password);
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, nombre: user.nombre, rol: user.rol },
      SECRET_KEY,
      { expiresIn: '24h' }
    );
    
    res.json({ message: 'Login exitoso', token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar usuario (admin o el propio usuario)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Verificar si es admin o el mismo usuario
    if (req.user.rol !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    // Si no es admin, no puede cambiar el rol
    if (req.user.rol !== 'admin' && req.body.rol) {
      delete req.body.rol;
    }
    
    const updatedUser = await User.update(userId, req.body);
    res.json({ message: 'Usuario actualizado exitosamente', user: updatedUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar usuario (solo admin)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    await User.delete(req.params.id);
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;