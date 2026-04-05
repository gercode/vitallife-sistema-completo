/**
 * controllers/leadController.js
 * Gestión de leads del formulario público
 */
const Lead = require('../models/Lead');
const db   = require('../config/db');

exports.getAll = (req, res) => {
  res.json(Lead.findAll());
};

exports.getOne = (req, res) => {
  const lead = Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead no encontrado' });
  res.json(lead);
};

exports.create = (req, res) => {
  const { name, email, phone, products, source } = req.body;
  if (!name) return res.status(400).json({ error: 'Nombre es obligatorio' });
  const lead = Lead.create({ name, email: email || '', phone, products, source });
  res.status(201).json({ ok: true, id: lead.id });
};

exports.markRead = (req, res) => {
  const lead = Lead.markRead(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead no encontrado' });
  res.json(lead);
};

exports.remove = (req, res) => {
  const ok = Lead.delete(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Lead no encontrado' });
  res.json({ message: 'Eliminado' });
};

exports.stats = (req, res) => {
  const leads    = Lead.findAll();
  const total    = leads.length;
  const unread   = Lead.countUnread();
  const today    = leads.filter(l => l.createdAt.startsWith(new Date().toISOString().slice(0, 10))).length;
  res.json({ total, unread, today });
};
