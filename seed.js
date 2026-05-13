const { getDatabase, closeDatabase } = require('./config/database');
const bcrypt = require('bcryptjs');

const categories = [
  "Cemento, cal y yeso", "Bloques y ladrillos", "Hierro y acero",
  "Áridos", "Maderas", "Tejas", "Chapa y cubiertas metálicas",
  "Aislantes", "Revestimientos cerámicos", "Pisos", "Pinturas",
  "Plomería", "Electricidad", "Fijaciones", "Herramientas manuales",
  "Puertas y ventanas", "Andamios", "Jardinería", "Adhesivos"
];

const sampleProducts = [
  {
    name: "Cemento Gris 42.5 kg",
    price: 12500,
    category: "Cemento, cal y yeso",
    subcategory: "Cemento",
    image: "https://example.com/cemento.jpg",
    description: "Ideal para hormigón armado. Resistencia óptima para construcciones estructurales.",
    stock: 100
  },
  {
    name: "Ladrillo Hueco 12x18x33",
    price: 850,
    category: "Bloques y ladrillos",
    subcategory: "Ladrillos",
    image: "https://example.com/ladrillo.jpg",
    description: "Ladrillo cerámico hueco para paredes interiores y exteriores.",
    stock: 5000
  },
  {
    name: "Hierro del 12 mm x 12 m",
    price: 4500,
    category: "Hierro y acero",
    subcategory: "Barras",
    image: "https://example.com/hierro.jpg",
    description: "Barra de acero corrugado para estructuras de hormigón.",
    stock: 200
  },
  {
    name: "Arena Fina x m3",
    price: 18000,
    category: "Áridos",
    subcategory: "Arenas",
    image: "https://example.com/arena.jpg",
    description: "Arena fina lavada para morteros y hormigón.",
    stock: 50
  },
  {
    name: "Madera Pino x 3m",
    price: 3200,
    category: "Maderas",
    subcategory: "Maderas",
    image: "https://example.com/madera.jpg",
    description: "Madera de pino tratada para estructuras.",
    stock: 300
  },
  {
    name: "Teja Española",
    price: 850,
    category: "Tejas",
    subcategory: "Tejas cerámicas",
    image: "https://example.com/teja.jpg",
    description: "Teja cerámica tradicional color terracota.",
    stock: 1000
  },
  {
    name: "Pintura Látex Blanca x 20 L",
    price: 35000,
    category: "Pinturas",
    subcategory: "Látex",
    image: "https://example.com/pintura.jpg",
    description: "Pintura látex para interiores y exteriores. Excelente cobertura.",
    stock: 50
  },
  {
    name: "Cable Eléctrico 2.5 mm x 100 m",
    price: 12000,
    category: "Electricidad",
    subcategory: "Cables",
    image: "https://example.com/cable.jpg",
    description: "Cable unipolar para instalaciones eléctricas domiciliarias.",
    stock: 150
  },
  {
    name: "Taladro Percutor 650W",
    price: 45000,
    category: "Herramientas manuales",
    subcategory: "Herramientas eléctricas",
    image: "https://example.com/taladro.jpg",
    description: "Taladro percutor profesional con maletín.",
    stock: 25
  },
  {
    name: "Adhesivo Cerámico x 25 kg",
    price: 8500,
    category: "Adhesivos",
    subcategory: "Adhesivos cerámicos",
    image: "https://example.com/adhesivo.jpg",
    description: "Adhesivo para cerámicos y porcelanatos.",
    stock: 200
  }
];

async function seedDatabase() {
  try {
    const db = await getDatabase();
    
    // Verificar si ya hay datos
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');
    
    if (userCount.count === 0) {
      // Crear admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.run(`
        INSERT INTO users (name, email, password, description, role, avatar)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        "Admin",
        "admin@elcimiento.com",
        hashedPassword,
        "Administrador del sistema",
        "admin",
        "👷"
      ]);
      console.log('✅ Usuario admin creado');
      console.log('   Email: admin@elcimiento.com');
      console.log('   Password: admin123');
      
      // Crear un usuario de ejemplo
      const userPassword = await bcrypt.hash('usuario123', 10);
      await db.run(`
        INSERT INTO users (name, email, password, description, role, avatar)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        "Cliente Ejemplo",
        "cliente@elcimiento.com",
        userPassword,
        "Cliente regular",
        "user",
        "👤"
      ]);
      console.log('✅ Usuario cliente creado');
      console.log('   Email: cliente@elcimiento.com');
      console.log('   Password: usuario123');
      
      // Insertar productos
      for (const product of sampleProducts) {
        await db.run(`
          INSERT INTO products (name, price, category, subcategory, image, description, stock)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          product.name,
          product.price,
          product.category,
          product.subcategory,
          product.image,
          product.description,
          product.stock
        ]);
      }
      console.log(`✅ ${sampleProducts.length} productos cargados`);
      
      // Insertar categorías
      for (const category of categories) {
        await db.run(`
          INSERT OR IGNORE INTO categories (name)
          VALUES (?)
        `, [category]);
      }
      console.log(`✅ ${categories.length} categorías cargadas`);
      
      console.log('\n🎉 Base de datos SQLite inicializada correctamente!');
    } else {
      console.log('ℹ️ La base de datos ya tiene datos. No se realizaron cambios.');
    }
    
  } catch (error) {
    console.error('Error al seedear la base de datos:', error);
  } finally {
    await closeDatabase();
  }
}

seedDatabase();