/**
 * controllers/productController.js
 * CRUD de productos – Supabase (PostgreSQL + Storage)
 */
const Product  = require('../models/Product');
const supabase = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const BUCKET = 'product-images';

// Sube un archivo (buffer de multer) a Supabase Storage y devuelve la URL pública
async function uploadToStorage(file) {
  const ext = path.extname(file.originalname);
  const fileName = `product-${uuidv4()}${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file.buffer, { contentType: file.mimetype, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

// Borra un archivo de Supabase Storage dada su URL pública
async function deleteFromStorage(publicUrl) {
  if (!publicUrl) return;
  try {
    // Extraer el nombre del archivo de la URL
    const parts = publicUrl.split(`/${BUCKET}/`);
    if (parts.length < 2) return;
    const fileName = parts[1];
    await supabase.storage.from(BUCKET).remove([fileName]);
  } catch (_) {}
}

exports.getAll = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    let { name, brand, category, description, price, discount, active } = req.body;
    let benefits = [];
    try { benefits = JSON.parse(req.body.benefits || '[]'); } catch (_) {}

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
          image1:      parsed.image1 || null,
          image2:      parsed.image2 || null
        };
      }
    } catch (_) {}

    // Subir imágenes a Supabase Storage
    let image = null;
    if (req.files?.image?.[0]) {
      image = await uploadToStorage(req.files.image[0]);
    }
    if (infoSection && req.files?.infoSectionImage1?.[0]) {
      infoSection.image1 = await uploadToStorage(req.files.infoSectionImage1[0]);
    }
    if (infoSection && req.files?.infoSectionImage2?.[0]) {
      infoSection.image2 = await uploadToStorage(req.files.infoSectionImage2[0]);
    }

    const product = await Product.create({ name, brand, category, description, benefits, image, price, discount, active, infoSection });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    let benefits = [];
    try { benefits = JSON.parse(req.body.benefits || '[]'); } catch (_) {}

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
            image1:      parsed.image1 || null,
            image2:      parsed.image2 || null
          };
        } else {
          infoSection = null;
        }
      } catch (_) {}
    }

    const data = { ...req.body, benefits };
    if (infoSection !== undefined) data.infoSection = infoSection;
    delete data.infoSectionImage1;
    delete data.infoSectionImage2;

    // Subir imágenes nuevas a Supabase Storage
    if (req.files?.image?.[0]) {
      // Borrar imagen anterior si existe
      const existing = await Product.findById(req.params.id);
      if (existing?.image) await deleteFromStorage(existing.image);
      data.image = await uploadToStorage(req.files.image[0]);
    }
    if (infoSection && req.files?.infoSectionImage1?.[0]) {
      data.infoSection.image1 = await uploadToStorage(req.files.infoSectionImage1[0]);
    }
    if (infoSection && req.files?.infoSectionImage2?.[0]) {
      data.infoSection.image2 = await uploadToStorage(req.files.infoSectionImage2[0]);
    }
    if (data.active !== undefined) data.active = data.active === 'true' || data.active === true;
    if (data.price !== undefined) data.price = parseFloat(data.price) || 0;
    if (data.discount !== undefined) data.discount = parseFloat(data.discount) || 0;

    const updated = await Product.update(req.params.id, data);
    if (!updated) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Producto no encontrado' });
    // Borrar imágenes de Storage
    if (p.image) await deleteFromStorage(p.image);
    if (p.infoSection?.image1) await deleteFromStorage(p.infoSection.image1);
    if (p.infoSection?.image2) await deleteFromStorage(p.infoSection.image2);
    await Product.delete(req.params.id);
    res.json({ message: 'Eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
