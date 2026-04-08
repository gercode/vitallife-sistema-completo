/**
 * Script de migración – Ejecutar una sola vez
 * Crea las tablas en Supabase PostgreSQL
 * 
 * Uso: node run-migration.js
 */
require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Usar contraseña directamente para evitar problemas de encoding en shell
const DB_PASSWORD = process.argv[2] || process.env.DB_PASSWORD || '';

const configs = [
  {
    name: 'Pooler us-east-1 (session)',
    config: { host: 'aws-0-us-east-1.pooler.supabase.com', port: 5432, user: 'postgres.ujdmltnklloegitngwol', password: DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 8000 }
  },
  {
    name: 'Pooler us-east-1 (transaction)',
    config: { host: 'aws-0-us-east-1.pooler.supabase.com', port: 6543, user: 'postgres.ujdmltnklloegitngwol', password: DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 8000 }
  },
  {
    name: 'Pooler us-west-1 (session)',
    config: { host: 'aws-0-us-west-1.pooler.supabase.com', port: 5432, user: 'postgres.ujdmltnklloegitngwol', password: DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 8000 }
  },
  {
    name: 'Pooler sa-east-1 (session)',
    config: { host: 'aws-0-sa-east-1.pooler.supabase.com', port: 5432, user: 'postgres.ujdmltnklloegitngwol', password: DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 8000 }
  },
  {
    name: 'Pooler us-east-2 (session)',
    config: { host: 'aws-0-us-east-2.pooler.supabase.com', port: 5432, user: 'postgres.ujdmltnklloegitngwol', password: DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 8000 }
  },
  {
    name: 'Pooler eu-central-1 (session)',
    config: { host: 'aws-0-eu-central-1.pooler.supabase.com', port: 5432, user: 'postgres.ujdmltnklloegitngwol', password: DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 8000 }
  },
  {
    name: 'Pooler ap-southeast-1 (session)',
    config: { host: 'aws-0-ap-southeast-1.pooler.supabase.com', port: 5432, user: 'postgres.ujdmltnklloegitngwol', password: DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 8000 }
  }
];

async function run() {
  // Leer el SQL de migración (solo las partes de tablas + datos, sin Storage policies)
  const sql = `
-- 1. Tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL DEFAULT '',
  brand       TEXT DEFAULT '',
  category    TEXT DEFAULT 'general',
  description TEXT DEFAULT '',
  benefits    JSONB DEFAULT '[]'::jsonb,
  image       TEXT,
  price       NUMERIC(12,2) DEFAULT 0,
  discount    NUMERIC(5,2) DEFAULT 0,
  active      BOOLEAN DEFAULT true,
  info_section JSONB,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ
);

-- 2. Tabla de leads
CREATE TABLE IF NOT EXISTS leads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL DEFAULT '',
  email       TEXT DEFAULT '',
  phone       TEXT DEFAULT '',
  products    JSONB DEFAULT '[]'::jsonb,
  source      TEXT DEFAULT 'web',
  read        BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de configuración (una sola fila)
CREATE TABLE IF NOT EXISTS settings (
  id              INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  whatsapp_number TEXT DEFAULT '573001234567',
  facebook_url    TEXT DEFAULT 'https://www.facebook.com/',
  site_name       TEXT DEFAULT 'Vital Life'
);

-- Insertar fila inicial de settings
INSERT INTO settings (id, whatsapp_number, facebook_url, site_name)
VALUES (1, '573001234567', 'https://www.facebook.com/', 'Vital Life')
ON CONFLICT (id) DO NOTHING;
  `;

  console.log('🔌 Buscando conexión a Supabase PostgreSQL...\n');
  
  let client = null;
  let connName = '';
  
  for (const { name, config } of configs) {
    const c = new Client(config);
    try {
      console.log(`  Intentando: ${name}...`);
      await c.connect();
      console.log(`  ✅ Conectado via ${name}\n`);
      client = c;
      connName = name;
      break;
    } catch (err) {
      console.log(`  ❌ ${err.message}`);
      try { await c.end(); } catch(_) {}
    }
  }

  if (!client) {
    console.error('\n❌ No se pudo conectar. Verifica tu contraseña de base de datos.');
    console.error('   Ve a Supabase Dashboard → Settings → Database → Connection string');
    process.exit(1);
  }

  try {
    console.log('📦 Ejecutando migración...');
    await client.query(sql);
    console.log('✅ Tablas creadas correctamente: products, leads, settings');
    
    // Verificar
    const res = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('products', 'leads', 'settings')
      ORDER BY table_name
    `);
    console.log('📋 Tablas verificadas:', res.rows.map(r => r.table_name).join(', '));

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Conexión cerrada');
  }
}

run();
