/**
 * config/db.js
 * Base de datos en memoria + persistencia JSON (sin dependencias externas)
 * En producción reemplaza por MongoDB, PostgreSQL, etc.
 */
const fs   = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data.json');

// Estado inicial
const DEFAULT = {
  products: [],
  leads: [],
  settings: {
    whatsappNumber: process.env.WHATSAPP_NUMBER || '573001234567',
    facebookUrl:    process.env.FACEBOOK_PAGE_URL || 'https://www.facebook.com/',
    siteName:       'Vital Life'
  }
};

function load() {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    }
  } catch (_) {}
  return JSON.parse(JSON.stringify(DEFAULT));
}

function save(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

let _db = load();

module.exports = {
  get: ()         => _db,
  save: ()        => save(_db),
  reset: ()       => { _db = JSON.parse(JSON.stringify(DEFAULT)); save(_db); }
};
