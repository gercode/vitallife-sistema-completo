/**
 * public/js/landing.js
 * Lógica completa del Landing Page público
 */

// ── Estado global ─────────────────────────────────────
let settings = {
  whatsappNumber: '573001234567',
  facebookUrl:    'https://www.facebook.com/',
  siteName:       'Vital Life'
};

// ── Inicialización ────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupShareButtons();
  await loadProducts();
});

/*async function loadSettings() {
  try {
    const data = await fetch(CONFIG.API_BASE + '/auth/settings').then(r => r.json());
    settings = { ...settings, ...data };
  } catch (_) { /* usa valores por defecto */ /*}
}*/
/*async function loadSettings() {
  try {
    const res = await fetch('http://localhost:3001/api/public/settings');
    const data = await res.json();
    settings = { ...settings, ...data };
  } catch (err) {
    console.warn('No se pudo cargar configuración pública', err);
  }
}
*/
async function loadSettings() {
  try {
    const res = await fetch(CONFIG.API_BASE + '/public/settings');
    const data = await res.json();
    settings = { ...settings, ...data };
  } catch (err) {
    console.warn('No se pudo cargar configuración pública', err);
  }
}
// ── Configurar botones de compartir ───────────────────
function setupShareButtons() {
  try {
    const pageUrl = encodeURIComponent(window.location.href);
    const msg     = encodeURIComponent(
      '🌿 ¡Mira estos suplementos naturales para la diabetes y articulaciones! ' + window.location.href
    );

    // WhatsApp → número del titular (comparte el sitio)
    const waNum = settings.whatsappNumber.replace(/\D/g, '');
    
    // Función helper segura para asignar href
    const setHref = (id, url) => {
      const el = document.getElementById(id);
      if (el) el.href = url;
    };
    
    // Solo asignar si los elementos existen
    setHref('shareWA', `https://wa.me/${waNum}?text=${msg}`);
    setHref('shareFB', settings.facebookUrl);
    setHref('shareTW', `https://twitter.com/intent/tweet?text=${msg}`);
    setHref('footerWA', `https://wa.me/${waNum}`);
    setHref('footerFB', settings.facebookUrl);
  } catch (err) {
    console.warn('Error en setupShareButtons:', err);
  }
}

// ── Copiar enlace ─────────────────────────────────────
function copyLink() {
  navigator.clipboard.writeText(window.location.href)
    .then(() => showToast('✅ Enlace copiado al portapapeles'))
    .catch(() => showToast('📋 ' + window.location.href));
}

// ── Cargar productos desde la API ─────────────────────
async function loadProducts() {
  const grid   = document.getElementById('productsGrid');
  const loader = document.getElementById('productsLoader');

  try {
    const products = await API.getProducts();
    allProducts = products.filter(p => p.active !== false);
    loader.remove();

    if (!allProducts.length) {
      grid.innerHTML = `<div class="col-12 text-center py-5 text-muted">
        <i class="bi bi-box-seam fs-1"></i><p class="mt-2">Próximamente más productos...</p>
      </div>`;
      return;
    }

    const active = allProducts;
    grid.innerHTML = active.map(renderProductCard).join('');
    updateFormCheckboxes(active);
  } catch (_) {
    loader.innerHTML = `<p class="text-muted">No se pudieron cargar los productos.</p>`;
  }
}

function renderProductCard(p) {
  const imgHTML = p.image
    ? `<img src="${imgUrl(p.image)}" alt="${p.name}" loading="lazy"/>`
    : `<div class="product-img-placeholder">💊</div>`;

  const benefits = (p.benefits || []).map(b =>
    `<li><i class="bi bi-check-circle-fill"></i>${b}</li>`
  ).join('');
  
  // Badge de descuento
  const discountBadge = p.discount && p.discount > 0 
    ? `<div class="discount-badge"><div style="line-height:1;">${p.discount}%</div><div style="font-size:.7rem;">OFF</div></div>`
    : '';

  return `
  <div class="col-md-6 col-lg-5">
    <a href="javascript:void(0)" onclick="viewProductDetail('${p.id}')" class="product-link">
      <div class="product-card" style="position:relative;">
        <div class="product-img-wrap">${imgHTML}</div>
        ${discountBadge}
        <div class="product-body">
          <span class="product-tag">${categoryIcon(p.category)} ${p.category || 'Suplemento'}</span>
          <h3 class="product-name">${p.name}</h3>
          ${p.brand ? `<p class="product-brand">${p.brand}</p>` : ''}
          ${p.price ? `<div style="font-weight:700;color:#2d6a4f;font-size:1rem;margin-bottom:8px;">$${parseFloat(p.price).toLocaleString()}</div>` : ''}
          <p class="product-desc">${p.description || ''}</p>
          ${benefits ? `<ul class="product-benefits">${benefits}</ul>` : ''}
          <div class="product-cta">Ver detalles →</div>
        </div>
      </div>
    </a>
  </div>`;
}

/*function viewProductDetail(productId) {
  // Guardar en sessionStorage y redirigir
  const product = allProducts.find(p => p.id === productId);
  if (product) {
    sessionStorage.setItem('selectedProduct', JSON.stringify(product));
    window.location.href = 'producto-detail.html';
  }
}
*/
function viewProductDetail(productId) {
  window.location.href = `producto-detail.html?id=${productId}`;
}


function categoryIcon(cat) {
  const icons = { diabetes: '🩺', articulaciones: '🦴', vitaminas: '💊', general: '🌿' };
  return icons[(cat||'').toLowerCase()] || '🌿';
}

function updateFormCheckboxes(products) {
  const wrap = document.getElementById('productCheckboxes');
  if (!products.length) return;
  wrap.innerHTML = products.map((p, i) => `
    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="chk${i}" value="${p.name}"/>
      <label class="form-check-label" for="chk${i}">${p.name}</label>
    </div>`).join('');
}

// ── Envío del formulario ──────────────────────────────
async function submitForm() {
  const nombre  = document.getElementById('nombre').value.trim();
  const celular = document.getElementById('celular').value.trim();

  // Recoger checkboxes
  const selected = [...document.querySelectorAll('#productCheckboxes .form-check-input:checked')]
                     .map(c => c.value);

  // Validación
  let valid = true;
  if (!nombre) { document.getElementById('nombre').classList.add('is-invalid'); valid = false; }
  else           document.getElementById('nombre').classList.remove('is-invalid');

  if (!valid) return;

  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...';

  try {
    await API.submitLead({ name: nombre, email: '', phone: celular, products: selected, source: 'landing' });

    document.getElementById('formWrap').style.display = 'none';
    document.getElementById('successBox').classList.remove('d-none');
    document.getElementById('successBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (err) {
    showToast('❌ Error al enviar. Intenta de nuevo.');
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-send-fill me-2"></i>¡Quiero que me contacten!';
  }
}

// ── Toast ─────────────────────────────────────────────
function showToast(msg, duration = 3200) {
  const t = document.getElementById('toastMsg');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

// Quitar invalid al escribir
['nombre','correo'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', () =>
    document.getElementById(id).classList.remove('is-invalid'));
});

// ── FILTRO DE CATEGORÍAS ──────────────────────────────
let allProducts = [];

function filterByCategory(category, btn) {
  document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const grid = document.getElementById('productsGrid');
  let filtered = allProducts;
  
  if (category !== 'all') {
    filtered = allProducts.filter(p => (p.category || '').toLowerCase() === category);
  }

  if (!filtered.length) {
    grid.innerHTML = `<div class="col-12 text-center py-5 text-muted">
      <i class="bi bi-box-seam fs-1"></i><p class="mt-2">No hay productos en esta categoría</p>
    </div>`;
    return;
  }

  grid.innerHTML = filtered.map(renderProductCard).join('');
}
