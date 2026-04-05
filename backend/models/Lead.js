/**
 * models/Lead.js
 * Modelo de Lead (registro del formulario público)
 */
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

const Lead = {

  findAll() {
    // Más recientes primero
    return [...db.get().leads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  findById(id) {
    return db.get().leads.find(l => l.id === id) || null;
  },

  create({ name, email, phone, products, source }) {
    const lead = {
      id:       uuidv4(),
      name:     name || '',
      email:    email || '',
      phone:    phone || '',
      products: Array.isArray(products) ? products : [],
      source:   source || 'web',
      read:     false,
      createdAt: new Date().toISOString()
    };
    db.get().leads.push(lead);
    db.save();
    return lead;
  },

  markRead(id) {
    const idx = db.get().leads.findIndex(l => l.id === id);
    if (idx === -1) return null;
    db.get().leads[idx].read = true;
    db.save();
    return db.get().leads[idx];
  },

  delete(id) {
    const idx = db.get().leads.findIndex(l => l.id === id);
    if (idx === -1) return false;
    db.get().leads.splice(idx, 1);
    db.save();
    return true;
  },

  countUnread() {
    return db.get().leads.filter(l => !l.read).length;
  }
};

module.exports = Lead;
