/**
 * controllers/leadController.js
 * Gestión de leads del formulario público – Supabase
 */
const Lead = require('../models/Lead');

exports.getAll = async (req, res) => {
  try {
    res.json(await Lead.findAll());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead no encontrado' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, email, phone, products, source } = req.body;
    if (!name) return res.status(400).json({ error: 'Nombre es obligatorio' });
    const lead = await Lead.create({ name, email: email || '', phone, products, source });
    res.status(201).json({ ok: true, id: lead.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const lead = await Lead.markRead(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead no encontrado' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Lead.delete(req.params.id);
    res.json({ message: 'Eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.stats = async (req, res) => {
  try {
    const leads  = await Lead.findAll();
    const total  = leads.length;
    const unread = await Lead.countUnread();
    const today  = leads.filter(l => l.createdAt && l.createdAt.startsWith(new Date().toISOString().slice(0, 10))).length;
    res.json({ total, unread, today });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
