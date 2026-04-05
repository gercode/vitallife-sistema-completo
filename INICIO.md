# 🚀 VITAL LIFE - PANEL ADMINISTRADOR

## ⚡ INICIO RÁPIDO (Windows)

### Opción 1: Automática (Recomendado)

1. **Instala Node.js** (si no lo tienes):
   - Haz doble clic en `INSTALAR.bat`
   - Descarga e instala Node.js desde https://nodejs.org/
   - Reinicia tu computadora

2. **Ejecuta el dashboard**:
   - Haz doble clic en `EJECUTAR.bat`
   - Se abrirán automáticamente:
     - Backend en `http://localhost:3001`
     - Dashboard en `http://localhost:5500`

3. **Credenciales de acceso**:
   - Usuario: `admin`
   - Contraseña: `vitallife2026`

---

### Opción 2: Manual (Terminal PowerShell)

#### Paso 1: Instalar dependencias
```powershell
cd backend
npm install
```

#### Paso 2: Ejecutar Backend (Terminal 1)
```powershell
cd backend
npm start
# O con reinicio automático:
npm run dev
```

#### Paso 3: Ejecutar Frontend (Terminal 2)
```powershell
cd frontend
# Con Python:
python -m http.server 5500

# O con Node.js:
npx http-server . -p 5500
```

#### Paso 4: Abrir Dashboard
```
http://localhost:5500/views/admin/index.html
```

---

## 📝 VARIABLES DE ENTORNO

Edita el archivo `backend/.env`:
```env
PORT=3001
ADMIN_USER=admin
ADMIN_PASS=vitallife2026
WHATSAPP_NUMBER=573001234567
FACEBOOK_PAGE_URL=https://www.facebook.com/TuPaginaVitalLife
FRONTEND_URL=http://localhost:5500
```

---

## 🛠️ ESTRUCTURA

```
vitallife-sistema-completo/
├── backend/               # API Node.js + Express
│   ├── controllers/       # Lógica de negocio
│   ├── models/           # Modelos de datos
│   ├── routes/           # Rutas API
│   ├── middleware/       # Autenticación
│   └── server.js         # Servidor principal
│
└── frontend/             # HTML + CSS + JavaScript
    ├── views/admin/      # Panel administrativo
    ├── public/
    │   ├── css/          # Estilos
    │   └── js/           # Scripts
    └── index.html        # Landing page
```

---

## 📊 RUTAS API

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/products` | Listar productos |
| POST | `/api/products` | Crear producto (admin) |
| PUT | `/api/products/:id` | Editar producto (admin) |
| DELETE | `/api/products/:id` | Eliminar producto (admin) |
| GET | `/api/leads` | Listar leads (admin) |
| POST | `/api/leads` | Crear lead (público) |
| GET | `/api/leads/stats` | Estadísticas (admin) |

---

## ✅ CHECKLIST DE EJECUCIÓN

- [ ] Node.js instalado (`node --version`)
- [ ] Dependencias instaladas (`npm install` en backend)
- [ ] Backend ejecutándose (`npm start`)
- [ ] Frontend sirviendo en puerto 5500
- [ ] Dashboard accesible en `http://localhost:5500/views/admin/index.html`
- [ ] Credenciales correctas (admin/vitallife2026)

---

## 🐛 SOLUCIÓN DE PROBLEMAS

**Error: "node no se reconoce"**
- Instala Node.js desde https://nodejs.org/
- Reinicia PowerShell/CMD

**Error: "Puerto 3001 ya en uso"**
```powershell
netstat -ano | findstr :3001
taskkill /PID [PID] /F
```

**Error: "CORS bloqueado"**
- Verifica `FRONTEND_URL` en `backend/.env`
- Debe coincidencia con tu URL del frontend

**Dashboard en blanco**
- Abre DevTools (F12) y revisa la consola
- Verifica que el backend esté corriendo en puerto 3001

---

## 📞 SOPORTE

Para más información, revisa los archivos en `backend/config/db.js` y `frontend/public/js/api.js`

**¡Éxito! 🌿**
