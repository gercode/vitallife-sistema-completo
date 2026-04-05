/**
 * middleware/auth.js
 * Middleware de autenticación con JWT para el panel admin
 */
const jwt = require('jsonwebtoken');

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'vitallife2026';
const JWT_SECRET = process.env.JWT_SECRET || 'vitallife-super-secret-key-2026';

function generateToken() {
  return jwt.sign({ user: ADMIN_USER }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.token;
  
  if (!token) {
    return res.status(401).json({ error: 'No autorizado: Token faltante' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'No autorizado: Token inválido o expirado' });
  }
}

module.exports = { authMiddleware, generateToken, ADMIN_USER, ADMIN_PASS };

