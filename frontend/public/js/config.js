/**
 * public/js/config.js
 * Configuración global del frontend – ajusta API_BASE según tu servidor
 */
/*const CONFIG = {
  API_BASE: 'http://localhost:3001/api',
  // En producción: API_BASE: 'https://tu-dominio.com/api'
};
*/
const CONFIG = {
  API_BASE: 'https://vitallife-backend.onrender.com/api'
};

// Helper: devuelve la URL correcta de imagen.
// Si ya es absoluta (Supabase Storage), la devuelve tal cual.
// Si es relativa (/uploads/...), le antepone la URL del backend.
function imgUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return CONFIG.API_BASE.replace('/api', '') + path;
}