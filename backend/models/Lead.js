/**
 * models/Lead.js
 * Modelo de Lead – Supabase (PostgreSQL)
 */
const supabase = require('../config/db');

const TABLE = 'leads';

function toCamel(row) {
  if (!row) return null;
  return {
    id:        row.id,
    name:      row.name,
    email:     row.email,
    phone:     row.phone,
    products:  row.products || [],
    source:    row.source,
    read:      row.read,
    createdAt: row.created_at
  };
}

const Lead = {

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

  async create({ name, email, phone, products, source }) {
    const row = {
      name:     name || '',
      email:    email || '',
      phone:    phone || '',
      products: Array.isArray(products) ? products : [],
      source:   source || 'web'
    };
    const { data, error } = await supabase
      .from(TABLE)
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    return toCamel(data);
  },

  async markRead(id) {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return toCamel(data);
  },

  async delete(id) {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  async countUnread() {
    const { count, error } = await supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('read', false);
    if (error) throw error;
    return count || 0;
  }
};

module.exports = Lead;
