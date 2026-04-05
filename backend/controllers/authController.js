/**
 * controllers/authController.js
 */
const { generateToken, ADMIN_USER, ADMIN_PASS } = require('../middleware/auth');
const db = require('../config/db');

exports.login = (req, res) => {
  const { user, pass } = req.body;
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    const token = generateToken();
    return res.json({ ok: true, token });
  }
  res.status(401).json({ error: 'Credenciales incorrectas' });
};

exports.logout = (req, res) => {
  // Con JWT no hay necesidad de invalidar en el backend
  res.json({ ok: true });
};

exports.getSettingsPublic = (req, res) => {
  res.json(db.get().settings);
};

exports.getSettings = (req, res) => {
  res.json(db.get().settings);
};

exports.updateSettings = (req, res) => {
  const s = db.get().settings;
  const { whatsappNumber, facebookUrl, siteName } = req.body;
  if (whatsappNumber) s.whatsappNumber = whatsappNumber;
  if (facebookUrl)    s.facebookUrl    = facebookUrl;
  if (siteName)       s.siteName       = siteName;
  db.save();
  res.json(s);
};
