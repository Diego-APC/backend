const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Actualizar perfil (nombre y descripción)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Solo puede actualizar su propio perfil (o admin)
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    // Solo permitir actualizar nombre, descripción y avatar
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      avatar: req.body.avatar
    };
    
    const updatedUser = await User.update(userId, updateData);
    
    res.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar || '👤',
        description: updatedUser.description || ''
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;