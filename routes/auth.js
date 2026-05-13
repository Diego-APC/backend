const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY || 'mi-secreto-super-seguro';

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }
    
    // Buscar usuario por email
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const isValid = await User.verifyPassword(user, password);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '👤',
        description: user.description || ''
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registro
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña requeridos' });
    }
    
    const newUser = await User.create({
      name,
      email,
      password,
      role: 'user', // Por defecto usuario normal
      avatar: '👤',
      description: ''
    });
    
    // Generar token JWT
    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      SECRET_KEY,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
        description: newUser.description
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener perfil propio
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '👤',
        description: user.description || ''
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;