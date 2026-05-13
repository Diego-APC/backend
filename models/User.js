const { getDatabase } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Obtener todos los usuarios (sin passwords)
  static async findAll() {
    const db = await getDatabase();
    const users = await db.all(`
      SELECT id, name, email, description, role, avatar, created_at, updated_at 
      FROM users 
      ORDER BY id
    `);
    return users;
  }

  // Obtener usuario por ID
  static async findById(id) {
    const db = await getDatabase();
    const user = await db.get(`
      SELECT id, name, email, description, role, avatar, created_at, updated_at 
      FROM users 
      WHERE id = ?
    `, [id]);
    return user;
  }

  // Obtener usuario por email (con password para autenticación)
  static async findByEmail(email) {
    const db = await getDatabase();
    const user = await db.get(`
      SELECT * FROM users WHERE email = ?
    `, [email]);
    return user;
  }

  // Crear nuevo usuario
  static async create(userData) {
    const db = await getDatabase();
    
    // Verificar si el email ya existe
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }
    
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const result = await db.run(`
      INSERT INTO users (name, email, password, description, role, avatar)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      userData.name,
      userData.email,
      hashedPassword,
      userData.description || '',
      userData.role || 'user',
      userData.avatar || '👤'
    ]);
    
    // Obtener el usuario creado
    const newUser = await this.findById(result.lastID);
    return newUser;
  }

  // Actualizar usuario
  static async update(id, userData) {
    const db = await getDatabase();
    
    const updates = [];
    const values = [];
    
    if (userData.name !== undefined) {
      updates.push('name = ?');
      values.push(userData.name);
    }
    if (userData.description !== undefined) {
      updates.push('description = ?');
      values.push(userData.description);
    }
    if (userData.avatar !== undefined) {
      updates.push('avatar = ?');
      values.push(userData.avatar);
    }
    
    if (updates.length === 0) {
      throw new Error('No hay datos para actualizar');
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    await db.run(`
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = ?
    `, values);
    
    const updatedUser = await this.findById(id);
    return updatedUser;
  }

  // Verificar contraseña
  static async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password);
  }
}

module.exports = User;