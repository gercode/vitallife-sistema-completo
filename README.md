# 🌿 VitalLife – Sistema Web Completo

Arquitectura **MVC** separada en Frontend y Backend independientes.

---

## 📁 Estructura de carpetas

```
vitallife/
├── backend/                   ← API REST (Node.js + Express)
│   ├── config/
│   │   └── db.js              ← Base de datos JSON (sin dependencias externas)
│   ├── controllers/
│   │   ├── authController.js  ← Login, logout, ajustes
│   │   ├── productController.js
│   │   └── leadController.js  ← Formulario del landing
│   ├── middleware/
│   │   └── auth.js            ← Autenticación por token
│   ├── models/
│   │   ├── Product.js
│   │   └── Lead.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   └── leadRoutes.js
│   ├── uploads/               ← Imágenes subidas (auto-creado)
│   ├── .env.example           ← Copiar a .env y configurar
│   ├── server.js              ← Punto de entrada
│   └── package.json
│
└── frontend/                  ← Sitio estático (HTML + CSS + JS)
    ├── index.html             ← Landing page pública
    ├── public/
    │   ├── css/
    │   │   ├── landing.css
    │   │   └── admin.css
    │   ├── js/
    │   │   ├── config.js      ← URL del API (ajustar en producción)
    │   │   ├── api.js         ← Capa de servicios HTTP
    │   │   ├── landing.js     ← Lógica del landing
    │   │   └── admin.js       ← Lógica del dashboard
    │   └── images/
    │       └── logo.png       ← Pegar aquí el logo de Vital Life
    └── views/
        └── admin/
            └── index.html     ← Panel administrativo
```

---

## 🚀 Instalación y arranque

### 1. Backend

```bash
cd backend

# Copiar variables de entorno
cp .env.example .env

# Editar .env con tus datos reales:
#   WHATSAPP_NUMBER=573001234567
#   FACEBOOK_PAGE_URL=https://www.facebook.com/TuPagina
#   ADMIN_USER=admin
#   ADMIN_PASS=tu_contraseña_segura

# Instalar dependencias
npm install

# Modo desarrollo (con auto-reload)
npm run dev

# Modo producción
npm start
```

El API queda disponible en: **http://localhost:3001**

### 2. Frontend

El frontend es estático. Puedes abrirlo con cualquiera de estos métodos:

**Opción A – VS Code Live Server** (recomendado en desarrollo)
- Instala la extensión "Live Server"
- Clic derecho en `frontend/index.html` → "Open with Live Server"

**Opción B – Python HTTP Server**
```bash
cd frontend
python3 -m http.server 5500
```

**Opción C – Node http-server**
```bash
npx http-server frontend -p 5500
```

Accede al landing en: **http://localhost:5500**
Accede al admin en: **http://localhost:5500/views/admin/**

---

## ⚙️ Configuración importante

### `frontend/public/js/config.js`
```javascript
const CONFIG = {
  API_BASE: 'http://localhost:3001/api', // ← Cambiar en producción
};
```

### Credenciales de admin (en .env)
```
ADMIN_USER=admin
ADMIN_PASS=vitallife2026
```

### Logo
Copia tu imagen del logo en:
```
frontend/public/images/logo.png
```

---

## 🔌 API Endpoints

| Método | Ruta                     | Acceso | Descripción                  |
|--------|--------------------------|--------|------------------------------|
| POST   | /api/auth/login          | Público | Login admin                 |
| POST   | /api/auth/logout         | Admin  | Logout                       |
| GET    | /api/auth/settings       | Admin  | Ver configuración            |
| PUT    | /api/auth/settings       | Admin  | Actualizar configuración     |
| GET    | /api/products            | Público | Listar productos             |
| GET    | /api/products/:id        | Público | Ver producto                 |
| POST   | /api/products            | Admin  | Crear producto + imagen      |
| PUT    | /api/products/:id        | Admin  | Editar producto              |
| DELETE | /api/products/:id        | Admin  | Eliminar producto            |
| POST   | /api/leads               | Público | Registrar lead (formulario)  |
| GET    | /api/leads               | Admin  | Listar leads                 |
| GET    | /api/leads/stats         | Admin  | Estadísticas                 |
| PATCH  | /api/leads/:id/read      | Admin  | Marcar como leído            |
| DELETE | /api/leads/:id           | Admin  | Eliminar lead                |

---

## 🎯 Funcionalidades del Dashboard

- ✅ **Login seguro** con usuario y contraseña
- ✅ **Dashboard** con estadísticas en tiempo real
- ✅ **Gestión de productos**: crear, editar, eliminar, activar/desactivar
- ✅ **Subida de imágenes** con drag & drop
- ✅ **Notificaciones**: ver leads del formulario, marcar como leído
- ✅ **Contactar por WhatsApp** directamente desde el lead
- ✅ **Polling automático** cada 30 seg para nuevas notificaciones
- ✅ **Configuración**: WhatsApp, Facebook, nombre del sitio
- ✅ **Responsive** para móvil, tablet y escritorio

---

## 🌐 Despliegue en producción

1. **Backend**: Despliega en Railway, Render, Heroku o VPS. Configura las variables de entorno.
2. **Frontend**: Sube la carpeta `frontend/` a Netlify, Vercel, o cualquier hosting estático.
3. **Actualiza** `frontend/public/js/config.js` con la URL real del backend.

---

## 🔐 Seguridad (para producción)

- Cambia `ADMIN_PASS` por una contraseña fuerte
- Reemplaza el sistema de tokens por JWT
- Usa HTTPS en producción
- Considera migrar la base de datos de JSON a MongoDB o PostgreSQL
