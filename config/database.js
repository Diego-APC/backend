const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let db = null;

async function getDatabase() {
  if (!db) {
    db = await open({
      filename: path.join(__dirname, '../data/materiales.db'),
      driver: sqlite3.Database
    });
    
    // Habilitar claves foráneas
    await db.run('PRAGMA foreign_keys = ON');
    
    // Crear tablas si no existen
    await initializeTables();
  }
  return db;
}

async function initializeTables() {
  const db = await getDatabase();
  
  // Tabla de usuarios
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      description TEXT,
      role TEXT DEFAULT 'user',
      avatar TEXT DEFAULT '👤',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Tabla de productos
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT,
      image TEXT,
      description TEXT,
      stock INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Tabla de categorías (para mantener las categorías predefinidas)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log('✅ Tablas inicializadas correctamente');
}

// Función para cerrar la base de datos
async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
  }
}

module.exports = { getDatabase, closeDatabase };