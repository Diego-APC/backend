const { getDatabase } = require('../config/database');

class Product {
  // Obtener todos los productos con filtros
  static async findAll(filters = {}) {
    const db = await getDatabase();

    // ⚠️ VULNERABLE A SQL INJECTION — laboratorio educativo
    let query = `SELECT * FROM products WHERE 1=1`;

    if (filters.category) {
      query += ` AND category = '${filters.category}'`;
    }

    if (filters.search) {
      // ❌ VULNERABLE — concatenación directa sin sanitizar
      query += ` AND name LIKE '%${filters.search}%'`;
    }

    if (filters.minPrice) {
      query += ` AND price >= ${filters.minPrice}`;
    }

    if (filters.maxPrice) {
      query += ` AND price <= ${filters.maxPrice}`;
    }

    query += ` ORDER BY id`;

    const products = await db.all(query);
    return products;
  }

  // Obtener producto por ID
  static async findById(id) {
    const db = await getDatabase();
    const product = await db.get(`
      SELECT * FROM products WHERE id = ?
    `, [id]);
    return product;
  }

  // Crear producto
  static async create(productData) {
    const db = await getDatabase();
    
    const result = await db.run(`
      INSERT INTO products (name, price, category, subcategory, image, description, stock)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      productData.name,
      productData.price,
      productData.category,
      productData.subcategory || '',
      productData.image || '',
      productData.description || '',
      productData.stock || 0
    ]);
    
    const newProduct = await this.findById(result.lastID);
    return newProduct;
  }

  // Actualizar producto
  static async update(id, productData) {
    const db = await getDatabase();
    
    const updates = [];
    const values = [];
    
    const allowedFields = ['name', 'price', 'category', 'subcategory', 'image', 'description', 'stock'];
    
    for (const field of allowedFields) {
      if (productData[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(productData[field]);
      }
    }
    
    if (updates.length === 0) {
      throw new Error('No hay datos para actualizar');
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    await db.run(`
      UPDATE products 
      SET ${updates.join(', ')} 
      WHERE id = ?
    `, values);
    
    const updatedProduct = await this.findById(id);
    return updatedProduct;
  }

  // Eliminar producto
  static async delete(id) {
    const db = await getDatabase();
    const result = await db.run(`
      DELETE FROM products WHERE id = ?
    `, [id]);
    
    if (result.changes === 0) {
      throw new Error('Producto no encontrado');
    }
    
    return true;
  }

  // Obtener todas las categorías
  static async getCategories() {
    const db = await getDatabase();
    const categories = await db.all(`
      SELECT DISTINCT category FROM products ORDER BY category
    `);
    return categories.map(c => c.category);
  }

  // Actualizar stock
  static async updateStock(id, quantity) {
    const db = await getDatabase();
    await db.run(`
      UPDATE products 
      SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [quantity, id]);
    
    const updatedProduct = await this.findById(id);
    return updatedProduct;
  }
}

module.exports = Product;