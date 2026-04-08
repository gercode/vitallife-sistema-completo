/**
 * server.js – VitalLife Backend
 * Arquitectura MVC · Node.js + Express · Supabase (PostgreSQL)
 */
require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares globales ──────────────────────────────
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rutas API ─────────────────────────────────────────
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/leads',    require('./routes/leadRoutes'));

// ── Health check ──────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

//---fragmento de codigo para traer el numero de whatsapp dinámico
const supabase = require('./config/db');
app.get('/api/public/settings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();
    if (error) throw error;
    res.json({
      whatsappNumber: data.whatsapp_number,
      facebookUrl:    data.facebook_url,
      siteName:       data.site_name
    });
  } catch (err) {
    res.json({
      whatsappNumber: process.env.WHATSAPP_NUMBER || '',
      facebookUrl: process.env.FACEBOOK_PAGE_URL || '',
      siteName: 'Vital Life'
    });
  }
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
  console.log(`   → Base de datos: Supabase (PostgreSQL)`);
  console.log(`   → Productos:   GET /api/products`);
  console.log(`   → Leads:       POST /api/leads`);
  console.log(`   → Admin login: POST /api/auth/login\n`);
});
