/**
 * models/Product.js
 * Modelo de Producto
 */
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

const Product = {

  findAll() {
    return db.get().products;
  },

  findById(id) {
    return db.get().products.find(p => p.id === id) || null;
  },

  create({ name, brand, category, description, benefits, image, price, discount, active = true, infoSection }) {
    const product = {
      id:          uuidv4(),
      name:        name || '',
      brand:       brand || '',
      category:    category || 'general',
      description: description || '',
      benefits:    Array.isArray(benefits) ? benefits : [],
      image:       image || null,
      price:       parseFloat(price) || 0,
      discount:    parseFloat(discount) || 0,
      active:      Boolean(active),
      infoSection: infoSection || null,
      createdAt:   new Date().toISOString()
    };
    db.get().products.push(product);
    db.save();
    return product;
  },

  update(id, data) {
    const idx = db.get().products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    const updated = { ...db.get().products[idx], ...data, id, updatedAt: new Date().toISOString() };
    db.get().products[idx] = updated;
    db.save();
    return updated;
  },

  delete(id) {
    const idx = db.get().products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    db.get().products.splice(idx, 1);
    db.save();
    return true;
  }
};

module.exports = Product;
