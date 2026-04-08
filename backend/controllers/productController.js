/**
 * controllers/productController.js
 * CRUD de productos
 */
const Product = require('../models/Product');
const path    = require('path');
const fs      = require('fs');

exports.getAll = (req, res) => {
  res.json(Product.findAll());
};
/*
exports.getOne = (req, res) => {
  const p = Product.findById(req.params.id);
  if (!p) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(p);
};
*/
exports.getOne = (req, res) => {
  const id = req.params.id;
  const p = Product.findById(id);

  if (!p) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  res.json(p);
};

exports.create = (req, res) => {
  try {
    let { name, brand, category, description, price, discount, active } = req.body;
    // benefits puede venir como JSON string
    let benefits = [];
    try { benefits = JSON.parse(req.body.benefits || '[]'); } catch (_) {}

    // infoSection puede venir como JSON string
    let infoSection = null;
    try {
      const parsed = JSON.parse(req.body.infoSection || 'null');
      if (parsed) {
        infoSection = {
          title:       parsed.title || '',
          subtitle:    parsed.subtitle || '',
          description: parsed.description || '',
          techLabel:   parsed.techLabel || '',
          techName:    parsed.techName || '',
          items:       Array.isArray(parsed.items) ? parsed.items : [],
          image:       parsed.image || null
        };
      }
    } catch (_) {}

    const image = req.files?.image?.[0] ? `/uploads/${req.files.image[0].filename}` : null;
    if (infoSection && req.files?.infoSectionImage?.[0]) {
      infoSection.image = `/uploads/${req.files.infoSectionImage[0].filename}`;
    }

    const product = Product.create({ name, brand, category, description, benefits, image, price, discount, active, infoSection });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = (req, res) => {
  try {
    let benefits = [];
    try { benefits = JSON.parse(req.body.benefits || '[]'); } catch (_) {}

    // infoSection puede venir como JSON string
    let infoSection = undefined;
    if (req.body.infoSection !== undefined) {
      try {
        const parsed = JSON.parse(req.body.infoSection || 'null');
        if (parsed) {
          infoSection = {
            title:       parsed.title || '',
            subtitle:    parsed.subtitle || '',
            description: parsed.description || '',
            techLabel:   parsed.techLabel || '',
            techName:    parsed.techName || '',
            items:       Array.isArray(parsed.items) ? parsed.items : [],
            image:       parsed.image || null
          };
        } else {
          infoSection = null;
        }
      } catch (_) {}
    }

    const data = { ...req.body, benefits };
    if (infoSection !== undefined) data.infoSection = infoSection;
    delete data.infoSectionImage;

    if (req.files?.image?.[0]) data.image = `/uploads/${req.files.image[0].filename}`;
    if (infoSection && req.files?.infoSectionImage?.[0]) {
      data.infoSection.image = `/uploads/${req.files.infoSectionImage[0].filename}`;
    }
    if (data.active !== undefined) data.active = data.active === 'true' || data.active === true;
    if (data.price !== undefined) data.price = parseFloat(data.price) || 0;
    if (data.discount !== undefined) data.discount = parseFloat(data.discount) || 0;

    const updated = Product.update(req.params.id, data);
    if (!updated) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = (req, res) => {
  // Elimina imagen física si existe
  const p = Product.findById(req.params.id);
  if (p && p.image) {
    const filePath = path.join(__dirname, '..', p.image);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  const ok = Product.delete(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json({ message: 'Eliminado correctamente' });
};
