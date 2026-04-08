/**
 * models/Product.js
 * Modelo de Producto – Supabase (PostgreSQL)
 */
const supabase = require('../config/db');

const TABLE = 'products';

// Convierte snake_case de la BD a camelCase para la API
function toCamel(row) {
  if (!row) return null;
  return {
    id:          row.id,
    name:        row.name,
    brand:       row.brand,
    category:    row.category,
    description: row.description,
    benefits:    row.benefits || [],
    image:       row.image,
    price:       parseFloat(row.price) || 0,
    discount:    parseFloat(row.discount) || 0,
    active:      row.active,
    infoSection: row.info_section || null,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at
  };
}

const Product = {

  async findAll() {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(toCamel);
  },

  async findById(id) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return toCamel(data);
  },

  async create({ name, brand, category, description, benefits, image, price, discount, active = true, infoSection }) {
    const row = {
      name:         name || '',
      brand:        brand || '',
      category:     category || 'general',
      description:  description || '',
      benefits:     Array.isArray(benefits) ? benefits : [],
      image:        image || null,
      price:        parseFloat(price) || 0,
      discount:     parseFloat(discount) || 0,
      active:       Boolean(active),
      info_section: infoSection || null
    };
    const { data, error } = await supabase
      .from(TABLE)
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    return toCamel(data);
  },

  async update(id, fields) {
    const row = {};
    if (fields.name !== undefined)        row.name         = fields.name;
    if (fields.brand !== undefined)       row.brand        = fields.brand;
    if (fields.category !== undefined)    row.category     = fields.category;
    if (fields.description !== undefined) row.description  = fields.description;
    if (fields.benefits !== undefined)    row.benefits     = fields.benefits;
    if (fields.image !== undefined)       row.image        = fields.image;
    if (fields.price !== undefined)       row.price        = parseFloat(fields.price) || 0;
    if (fields.discount !== undefined)    row.discount     = parseFloat(fields.discount) || 0;
    if (fields.active !== undefined)      row.active       = fields.active;
    if (fields.infoSection !== undefined) row.info_section = fields.infoSection;
    row.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from(TABLE)
      .update(row)
      .eq('id', id)
      .select()
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return toCamel(data);
  },

  async delete(id) {
    const { error, count } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};

module.exports = Product;
