-- ============================================================
-- VitalLife – Migración a Supabase (PostgreSQL)
-- Ejecutar este script en el SQL Editor de Supabase Dashboard
-- ============================================================

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

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 5. Políticas: permitir lectura pública de productos activos
CREATE POLICY "Productos públicos: lectura" ON products
  FOR SELECT USING (true);

CREATE POLICY "Productos: escritura con service_role" ON products
  FOR ALL USING (auth.role() = 'service_role');

-- Leads: solo service_role puede leer, cualquiera puede insertar
CREATE POLICY "Leads: insertar público" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Leads: gestión con service_role" ON leads
  FOR ALL USING (auth.role() = 'service_role');

-- Settings: lectura pública, escritura service_role
CREATE POLICY "Settings: lectura pública" ON settings
  FOR SELECT USING (true);

CREATE POLICY "Settings: escritura service_role" ON settings
  FOR ALL USING (auth.role() = 'service_role');

-- 6. Crear bucket de Storage para imágenes de productos
-- (Ejecutar esto en Supabase Dashboard > Storage > New Bucket)
-- Nombre: product-images
-- Público: Sí (para que las imágenes sean accesibles por URL)
--
-- O ejecutar via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política de Storage: lectura pública
CREATE POLICY "Imágenes públicas" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Política de Storage: subida con service_role
CREATE POLICY "Subida de imágenes service_role" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- Política de Storage: borrado con service_role
CREATE POLICY "Borrado de imágenes service_role" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images');

-- ============================================================
-- ¡Listo! Ahora configura las variables de entorno:
--   SUPABASE_URL=https://tu-proyecto.supabase.co
--   SUPABASE_SERVICE_KEY=eyJ...  (service_role key, NO la anon key)
-- ============================================================
