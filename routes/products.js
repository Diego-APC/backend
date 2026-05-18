const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Listar productos (público)
router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;

    const filters = {};
    if (category) filters.category = category;
    if (search) filters.search = search;       // sin sanitizar
    if (minPrice) filters.minPrice = minPrice;
    if (maxPrice) filters.maxPrice = maxPrice;

    const products = await Product.findAll(filters);
    res.json(products);
  } catch (error) {
    // ⚠️ Exponer el error ayuda al estudiante a confirmar la inyección
    res.status(500).json({ error: error.message });
  }
});

// Obtener categorías
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Detalle de producto (público)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear producto (solo admin)
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, price, category, subcategory, image, description, stock } = req.body;
    
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Nombre, precio y categoría son requeridos' });
    }
    
    const newProduct = await Product.create({
      name,
      price: parseFloat(price),
      category,
      subcategory: subcategory || '',
      image: image || '',
      description: description || '',
      stock: stock !== undefined ? parseInt(stock) : 0
    });
    
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Actualizar producto (solo admin)
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const updatedProduct = await Product.update(req.params.id, req.body);
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar producto (solo admin)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    await Product.delete(req.params.id);
    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;