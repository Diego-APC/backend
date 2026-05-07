const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_FILE = path.join(__dirname, '../data/users.json');

class User {
  constructor(id, nombre, descripcion, rol, password) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.rol = rol; // 'admin' o 'user'
    this.password = password;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Asegurar que el archivo de datos existe
  static async ensureDataFile() {
    try {
      await fs.access(DATA_FILE);
    } catch (error) {
      await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
    }
  }

  // Leer todos los usuarios
  static async findAll() {
    await this.ensureDataFile();
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const users = JSON.parse(data);
    // Ocultar contraseñas al enviar al cliente
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  // Buscar usuario por ID
  static async findById(id) {
    const users = await this.findAllFull();
    const user = users.find(u => u.id === parseInt(id));
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Buscar usuario completo (con contraseña)
  static async findAllFull() {
    await this.ensureDataFile();
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  }

  // Buscar por nombre
  static async findByNombre(nombre) {
    const users = await this.findAllFull();
    return users.find(u => u.nombre === nombre);
  }

  // Crear nuevo usuario
  static async create(userData) {
    const users = await this.findAllFull();
    
    // Verificar si el usuario ya existe
    const existingUser = await this.findByNombre(userData.nombre);
    if (existingUser) {
      throw new Error('El nombre de usuario ya existe');
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      nombre: userData.nombre,
      descripcion: userData.descripcion,
      rol: userData.rol || 'user',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    users.push(newUser);
    await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));
    
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  // Actualizar usuario
  static async update(id, userData) {
    const users = await this.findAllFull();
    const userIndex = users.findIndex(u => u.id === parseInt(id));
    
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    // Si se actualiza la contraseña, encriptarla
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    users[userIndex] = {
      ...users[userIndex],
      nombre: userData.nombre || users[userIndex].nombre,
      descripcion: userData.descripcion || users[userIndex].descripcion,
      rol: userData.rol || users[userIndex].rol,
      password: userData.password || users[userIndex].password,
      updatedAt: new Date()
    };

    await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));
    
    const { password, ...userWithoutPassword } = users[userIndex];
    return userWithoutPassword;
  }

  // Eliminar usuario
  static async delete(id) {
    const users = await this.findAllFull();
    const filteredUsers = users.filter(u => u.id !== parseInt(id));
    
    if (filteredUsers.length === users.length) {
      throw new Error('Usuario no encontrado');
    }
    
    await fs.writeFile(DATA_FILE, JSON.stringify(filteredUsers, null, 2));
    return true;
  }

  // Verificar credenciales
  static async authenticate(nombre, password) {
    const user = await this.findByNombre(nombre);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;
    
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

module.exports = User;