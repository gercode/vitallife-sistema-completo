/**
 * server.js – VitalLife Backend
 * Arquitectura MVC · Node.js + Express
 */
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Crear directorio uploads si no existe ────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// ── Middlewares globales ──────────────────────────────
/*app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-admin-token']
}));
*/

app.use(cors({
  origin: true, // ✅ deja que Express devuelva el Origin correcto
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Archivos estáticos (imágenes subidas) ─────────────
app.use('/uploads', express.static(uploadsDir));

// ── Rutas API ─────────────────────────────────────────
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/leads',    require('./routes/leadRoutes'));

// ── Health check ──────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

//---fragmento de codigo para traer el numero de whatsapp dinámico
app.get('/api/public/settings', (req, res) => {
  res.json({
    whatsappNumber: process.env.WHATSAPP_NUMBER,
    facebookUrl: process.env.FACEBOOK_PAGE_URL,
    siteName: 'Vital Life'
  });
});
// ── 404 ───────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// ── Error handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`\n🌿 VitalLife API corriendo en http://localhost:${PORT}`);
  console.log(`   → Productos:   GET /api/products`);
  console.log(`   → Leads:       POST /api/leads`);
  console.log(`   → Admin login: POST /api/auth/login\n`);
});
