/**
 * public/js/admin.js
 * Lógica completa del Panel Administrativo VitalLife
 */

// ── Estado global ─────────────────────────────────────
let allLeads     = [];
let currentFilter = 'all';
let productModal, leadModal;
let settings = {};
let pollInterval;

// ── Bootstrap modals ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  productModal = new bootstrap.Modal(document.getElementById('productModal'));
  leadModal    = new bootstrap.Modal(document.getElementById('leadModal'));

  // Reloj en topbar
  updateClock();
  setInterval(updateClock, 1000);

  // Login automático si hay token guardado
  const token = localStorage.getItem('vl_token');
  if (token) {
    showApp();
  } else {
    // Enter en login
    document.getElementById('loginPass').addEventListener('keydown', e => {
      if (e.key === 'Enter') doLogin();
    });
  }

  // Drag & drop imagen
  setupImageDrop();
});

function updateClock() {
  const el = document.getElementById('topbarTime');
  if (el) el.textContent = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

// ── AUTH ──────────────────────────────────────────────
async function doLogin() {
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value;
  const btn  = document.getElementById('loginBtn');
  const err  = document.getElementById('loginError');

  if (!user || !pass) { showLoginError('Completa todos los campos.'); return; }

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Ingresando...';

  try {
    const res = await API.login(user, pass);
    localStorage.setItem('vl_token', res.token);
    err.classList.add('d-none');
    showApp();
  } catch (e) {
    showLoginError('Usuario o contraseña incorrectos.');
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Ingresar';
  }
}

function showLoginError(msg) {
  const err = document.getElementById('loginError');
  err.textContent = msg;
  err.classList.remove('d-none');
}

async function doLogout() {
  try { await API.logout(); } catch (_) {}
  localStorage.removeItem('vl_token');
  clearInterval(pollInterval);
  document.getElementById('appShell').classList.add('d-none');
  document.getElementById('loginOverlay').style.display = 'flex';
  document.getElementById('loginPass').value = '';
}

function showApp() {
  document.getElementById('loginOverlay').style.display = 'none';
  document.getElementById('appShell').classList.remove('d-none');
  loadDashboard();
  // Polling de notificaciones cada 30 seg
  pollInterval = setInterval(pollNotifications, 30000);
}

// ── NAVEGACIÓN ────────────────────────────────────────
function navigate(viewId, el) {
  // Desactivar todos
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById('view-' + viewId).classList.add('active');
  if (el) el.classList.add('active');

  const titles = {
    dashboard: 'Dashboard', products: 'Productos',
    leads: 'Notificaciones', settings: 'Configuración'
  };
  document.getElementById('topbarTitle').textContent = titles[viewId] || viewId;

  // Cerrar sidebar en móvil
  if (window.innerWidth < 992) closeSidebar();

  // Cargar datos de la vista
  if (viewId === 'dashboard') loadDashboard();
  if (viewId === 'products')  loadProductsAdmin();
  if (viewId === 'leads')     loadLeads();
  if (viewId === 'settings')  loadSettings();
}

// ── SIDEBAR MÓVIL ────────────────────────────────────
function toggleSidebar() {
  const sb  = document.getElementById('sidebar');
  const bd  = document.getElementById('sidebarBackdrop');
  const open = sb.classList.contains('open');
  if (open) { sb.classList.remove('open'); bd.classList.add('d-none'); }
  else       { sb.classList.add('open');   bd.classList.remove('d-none'); }
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarBackdrop').classList.add('d-none');
}

// ── DASHBOARD ────────────────────────────────────────
async function loadDashboard() {
  try {
    const [stats, leads] = await Promise.all([API.getLeadStats(), API.getLeads()]);

    document.getElementById('statLeads').textContent   = stats.total;
    document.getElementById('statUnread').textContent  = stats.unread;
    document.getElementById('statToday').textContent   = stats.today;

    // Contar productos activos
    const products = await API.getProducts();
    const active   = products.filter(p => p.active !== false).length;
    document.getElementById('statProducts').textContent = active;

    // Actualizar badge
    updateUnreadBadge(stats.unread);

    // Últimos 5 leads
    const tbody = document.getElementById('dashboardLeadsTbody');
    const latest = leads.slice(0, 5);
    if (!latest.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center py-3 text-muted">Sin registros aún</td></tr>';
      return;
    }
    tbody.innerHTML = latest.map(l => `
      <tr class="${l.read ? '' : 'row-unread'}">
        <td>${escHtml(l.name)}</td>
        <td>${escHtml(l.email)}</td>
        <td>${formatDate(l.createdAt)}</td>
        <td><span class="badge ${l.read ? 'bg-secondary' : 'bg-warning text-dark'}">${l.read ? 'Leído' : 'Nuevo'}</span></td>
      </tr>`).join('');
  } catch (e) {
    console.error('Dashboard error:', e);
  }
}

// ── PRODUCTOS (ADMIN) ─────────────────────────────────
async function loadProductsAdmin() {
  const grid = document.getElementById('productsAdminGrid');
  grid.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-success"></div></div>';
  try {
    const products = await API.getProducts();
    if (!products.length) {
      grid.innerHTML = `<div class="text-center py-5 text-muted col-span-all">
        <i class="bi bi-box-seam fs-1"></i><p class="mt-2">No hay productos. ¡Crea el primero!</p>
      </div>`;
      return;
    }
    grid.innerHTML = products.map(renderProductAdminCard).join('');
  } catch (e) {
    grid.innerHTML = `<p class="text-danger">Error al cargar productos: ${e.message}</p>`;
  }
}

function renderProductAdminCard(p) {
  const imgSrc   = p.image ? imgUrl(p.image) : null;
  const imgHTML  = imgSrc
    ? `<div class="product-admin-img"><img src="${imgSrc}" alt="${escHtml(p.name)}"/></div>`
    : `<div class="product-admin-img">💊</div>`;
  const badgeCls = p.active !== false ? 'badge-active' : 'badge-inactive';
  const badgeTxt = p.active !== false ? 'Activo' : 'Inactivo';
  
  // Badge de descuento si existe
  const discountBadge = p.discount && p.discount > 0 
    ? `<div class="discount-badge-text">${p.discount}% OFF</div>`
    : '';

  return `
  <div class="product-admin-card" id="pcard-${p.id}">
    ${imgHTML}
    ${discountBadge}
    <div class="product-admin-body">
      <div class="product-admin-name">${escHtml(p.name)}</div>
      <div class="product-admin-brand">${escHtml(p.brand || '')}</div>
      <span class="product-admin-badge ${badgeCls}">${badgeTxt}</span>
      ${p.price ? `<div style="font-weight:700;color:var(--verde);font-size:.95rem;margin-bottom:8px;">$${parseFloat(p.price).toLocaleString()}</div>` : ''}
      <p class="text-muted" style="font-size:.82rem;line-height:1.5;margin-bottom:12px;">${escHtml((p.description||'').slice(0,90))}${(p.description||'').length > 90 ? '…' : ''}</p>
      <div class="product-admin-actions">
        <button class="btn-icon" onclick="editProduct('${p.id}')" title="Editar">
          <i class="bi bi-pencil-fill text-primary"></i>
        </button>
        <button class="btn-icon danger" onclick="deleteProduct('${p.id}','${escHtml(p.name)}')" title="Eliminar">
          <i class="bi bi-trash-fill"></i>
        </button>
        <span class="ms-auto text-muted" style="font-size:.75rem;align-self:center;">${p.category||''}</span>
      </div>
    </div>
  </div>`;
}

// ── MODAL PRODUCTO ────────────────────────────────────
function openProductModal(product = null) {
  document.getElementById('productModalTitle').textContent = product ? 'Editar producto' : 'Nuevo producto';
  document.getElementById('editProductId').value = product ? product.id : '';
  document.getElementById('pName').value          = product?.name        || '';
  document.getElementById('pBrand').value         = product?.brand       || '';
  document.getElementById('pCategory').value      = product?.category    || 'diabetes';
  document.getElementById('pActive').value        = String(product?.active !== false);
  document.getElementById('pPrice').value         = product?.price       || '';
  document.getElementById('pDiscount').value      = product?.discount    || '';
  document.getElementById('pDesc').value          = product?.description || '';
  document.getElementById('pBenefits').value      = (product?.benefits || []).join('\n');

  // Reset imagen
  document.getElementById('pImage').value = '';
  const prev = document.getElementById('imagePreview');
  const plch = document.getElementById('imageUploadPlaceholder');
  if (product?.image) {
    prev.src = imgUrl(product.image);
    prev.classList.remove('d-none');
    plch.classList.add('d-none');
  } else {
    prev.src = '';
    prev.classList.add('d-none');
    plch.classList.remove('d-none');
  }

  // Info Section
  const info = product?.infoSection || {};
  document.getElementById('pInfoTitle').value     = info.title || '';
  document.getElementById('pInfoSubtitle').value  = info.subtitle || '';
  document.getElementById('pInfoDesc').value      = info.description || '';
  document.getElementById('pInfoTechLabel').value = info.techLabel || '';
  document.getElementById('pInfoTechName').value  = info.techName || '';
  document.getElementById('pInfoItems').value     = (info.items || []).join('\n');
  document.getElementById('pInfoImage1').value    = '';
  document.getElementById('pInfoImage2').value    = '';
  // Imagen 1
  const info1Prev = document.getElementById('infoImage1Preview');
  const info1Plch = document.getElementById('infoImage1UploadPlaceholder');
  if (info.image1) {
    info1Prev.src = imgUrl(info.image1);
    info1Prev.classList.remove('d-none');
    info1Plch.classList.add('d-none');
  } else {
    info1Prev.src = '';
    info1Prev.classList.add('d-none');
    info1Plch.classList.remove('d-none');
  }
  // Imagen 2
  const info2Prev = document.getElementById('infoImage2Preview');
  const info2Plch = document.getElementById('infoImage2UploadPlaceholder');
  if (info.image2) {
    info2Prev.src = imgUrl(info.image2);
    info2Prev.classList.remove('d-none');
    info2Plch.classList.add('d-none');
  } else {
    info2Prev.src = '';
    info2Prev.classList.add('d-none');
    info2Plch.classList.remove('d-none');
  }
  // Collapse info section by default, expand if has data
  const infoFields = document.getElementById('infoSectionFields');
  const infoIcon = document.getElementById('infoSectionToggleIcon');
  if (info.title || info.subtitle || info.techName) {
    infoFields.classList.remove('d-none');
    infoIcon.className = 'bi bi-chevron-up';
  } else {
    infoFields.classList.add('d-none');
    infoIcon.className = 'bi bi-chevron-down';
  }

  productModal.show();
}

async function editProduct(id) {
  try {
    const p = await API.getProduct(id);
    openProductModal(p);
  } catch (e) { showToast('Error al cargar producto', 'error'); }
}

async function saveProduct() {
  const id   = document.getElementById('editProductId').value;
  const name = document.getElementById('pName').value.trim();
  if (!name) { showToast('El nombre es obligatorio', 'error'); return; }

  const benefits = document.getElementById('pBenefits').value
    .split('\n').map(b => b.trim()).filter(Boolean);

  const fd = new FormData();
  fd.append('name',        name);
  fd.append('brand',       document.getElementById('pBrand').value.trim());
  fd.append('category',    document.getElementById('pCategory').value);
  fd.append('active',      document.getElementById('pActive').value);
  fd.append('price',       document.getElementById('pPrice').value || '0');
  fd.append('discount',    document.getElementById('pDiscount').value || '0');
  fd.append('description', document.getElementById('pDesc').value.trim());
  fd.append('benefits',    JSON.stringify(benefits));
  const file = document.getElementById('pImage').files[0];
  if (file) fd.append('image', file);

  // Info Section
  const infoTitle    = document.getElementById('pInfoTitle').value.trim();
  const infoSubtitle = document.getElementById('pInfoSubtitle').value.trim();
  const infoDesc     = document.getElementById('pInfoDesc').value.trim();
  const infoTechLabel= document.getElementById('pInfoTechLabel').value.trim();
  const infoTechName = document.getElementById('pInfoTechName').value.trim();
  const infoItems    = document.getElementById('pInfoItems').value.split('\n').map(i => i.trim()).filter(Boolean);

  if (infoTitle || infoSubtitle || infoTechName || infoItems.length) {
    // Preserve existing image paths if no new images
    let existingInfoImage1 = null;
    let existingInfoImage2 = null;
    if (id) {
      try {
        const existing = await API.getProduct(id);
        existingInfoImage1 = existing?.infoSection?.image1 || null;
        existingInfoImage2 = existing?.infoSection?.image2 || null;
      } catch (_) {}
    }
    fd.append('infoSection', JSON.stringify({
      title: infoTitle,
      subtitle: infoSubtitle,
      description: infoDesc,
      techLabel: infoTechLabel,
      techName: infoTechName,
      items: infoItems,
      image1: existingInfoImage1,
      image2: existingInfoImage2
    }));
  } else {
    fd.append('infoSection', 'null');
  }
  const infoFile1 = document.getElementById('pInfoImage1').files[0];
  if (infoFile1) fd.append('infoSectionImage1', infoFile1);
  const infoFile2 = document.getElementById('pInfoImage2').files[0];
  if (infoFile2) fd.append('infoSectionImage2', infoFile2);

  const btn = document.getElementById('saveProductBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Guardando...';

  try {
    if (id) await API.updateProduct(id, fd);
    else    await API.createProduct(fd);

    productModal.hide();
    showToast(id ? '✅ Producto actualizado' : '✅ Producto creado', 'success');
    loadProductsAdmin();
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-save me-1"></i>Guardar producto';
  }
}

async function deleteProduct(id, name) {
  if (!confirm(`¿Eliminar el producto "${name}"? Esta acción no se puede deshacer.`)) return;
  try {
    await API.deleteProduct(id);
    document.getElementById('pcard-' + id)?.remove();
    showToast('🗑️ Producto eliminado', 'success');
  } catch (e) { showToast('Error: ' + e.message, 'error'); }
}

// Preview imagen
function previewImage(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const prev = document.getElementById('imagePreview');
    const plch = document.getElementById('imageUploadPlaceholder');
    prev.src = e.target.result;
    prev.classList.remove('d-none');
    plch.classList.add('d-none');
  };
  reader.readAsDataURL(file);
}

function setupImageDrop() {
  const area = document.getElementById('imageUploadArea');
  if (!area) return;
  area.addEventListener('dragover', e => { e.preventDefault(); area.style.borderColor = '#2d6a4f'; });
  area.addEventListener('dragleave', () => { area.style.borderColor = ''; });
  area.addEventListener('drop', e => {
    e.preventDefault(); area.style.borderColor = '';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const input = document.getElementById('pImage');
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      previewImage(input);
    }
  });

  // Drag & drop para imágenes de sección informativa
  [1, 2].forEach(n => {
    const area = document.getElementById(`infoImage${n}UploadArea`);
    if (!area) return;
    area.addEventListener('dragover', e => { e.preventDefault(); area.style.borderColor = '#2d6a4f'; });
    area.addEventListener('dragleave', () => { area.style.borderColor = ''; });
    area.addEventListener('drop', e => {
      e.preventDefault(); area.style.borderColor = '';
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        const input = document.getElementById(`pInfoImage${n}`);
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        previewInfoImg(input, n);
      }
    });
  });
}

// Toggle sección informativa
function toggleInfoSection() {
  const fields = document.getElementById('infoSectionFields');
  const icon = document.getElementById('infoSectionToggleIcon');
  fields.classList.toggle('d-none');
  icon.className = fields.classList.contains('d-none') ? 'bi bi-chevron-down' : 'bi bi-chevron-up';
}

// Preview imagen de sección informativa (1 o 2)
function previewInfoImg(input, num) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const prev = document.getElementById(`infoImage${num}Preview`);
    const plch = document.getElementById(`infoImage${num}UploadPlaceholder`);
    prev.src = e.target.result;
    prev.classList.remove('d-none');
    plch.classList.add('d-none');
  };
  reader.readAsDataURL(file);
}

// ── LEADS / NOTIFICACIONES ────────────────────────────
async function loadLeads() {
  const container = document.getElementById('leadsContainer');
  container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-success"></div></div>';
  try {
    allLeads = await API.getLeads();
    renderLeads();
    const unread = allLeads.filter(l => !l.read).length;
    updateUnreadBadge(unread);
  } catch (e) {
    container.innerHTML = `<p class="text-danger">Error: ${e.message}</p>`;
  }
}

function filterLeads(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderLeads();
}

function renderLeads() {
  const container = document.getElementById('leadsContainer');
  let filtered = allLeads;
  if (currentFilter === 'unread') filtered = allLeads.filter(l => !l.read);
  if (currentFilter === 'read')   filtered = allLeads.filter(l =>  l.read);

  if (!filtered.length) {
    container.innerHTML = `<div class="text-center py-5 text-muted">
      <i class="bi bi-inbox fs-1"></i><p class="mt-2">No hay registros en esta categoría</p>
    </div>`;
    return;
  }

  container.innerHTML = filtered.map(l => `
  <div class="lead-card ${l.read ? '' : 'unread'}" id="lcard-${l.id}" onclick="openLead('${l.id}')">
    <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
      <div>
        <div class="lead-name">${escHtml(l.name)}</div>
        <div class="lead-email"><i class="bi bi-envelope me-1"></i>${escHtml(l.email)}</div>
        ${l.phone ? `<div class="lead-phone"><i class="bi bi-phone me-1"></i>${escHtml(l.phone)}</div>` : ''}
      </div>
      <div class="text-end">
        <div class="lead-date">${formatDate(l.createdAt)}</div>
      </div>
    </div>
    ${l.products?.length ? `
      <div class="lead-products">
        ${l.products.map(p => `<span class="lead-product-tag">${escHtml(p)}</span>`).join('')}
      </div>` : ''}
    <div class="lead-actions" onclick="event.stopPropagation()">
      ${!l.read ? `<button class="btn-icon" onclick="markRead('${l.id}')" title="Marcar leído"><i class="bi bi-check2"></i></button>` : ''}
      <button class="btn-icon danger" onclick="deleteLead('${l.id}')" title="Eliminar"><i class="bi bi-trash"></i></button>
    </div>
  </div>`).join('');
}

async function openLead(id) {
  const lead = allLeads.find(l => l.id === id);
  if (!lead) return;

  // Marcar como leído automáticamente
  if (!lead.read) await markRead(id, false);

  const waNum = (settings.whatsappNumber || '').replace(/\D/g, '');
  const waMsg = encodeURIComponent(
    `Hola ${lead.name}, te contactamos de Vital Life sobre tu interés en: ${(lead.products||[]).join(', ') || 'nuestros productos'}.`
  );

  document.getElementById('leadModalBody').innerHTML = `
    <div class="mb-3">
      <small class="text-muted text-uppercase fw-bold">Nombre</small>
      <p class="fw-bold mb-0">${escHtml(lead.name)}</p>
    </div>
    <div class="mb-3">
      <small class="text-muted text-uppercase fw-bold">Correo</small>
      <p class="mb-0"><a href="mailto:${escHtml(lead.email)}">${escHtml(lead.email)}</a></p>
    </div>
    ${lead.phone ? `<div class="mb-3">
      <small class="text-muted text-uppercase fw-bold">Celular</small>
      <p class="mb-0">${escHtml(lead.phone)}</p>
    </div>` : ''}
    ${lead.products?.length ? `<div class="mb-3">
      <small class="text-muted text-uppercase fw-bold">Producto(s) de interés</small>
      <div class="lead-products mt-1">${lead.products.map(p=>`<span class="lead-product-tag">${escHtml(p)}</span>`).join('')}</div>
    </div>` : ''}
    <div class="mb-0">
      <small class="text-muted text-uppercase fw-bold">Fecha de registro</small>
      <p class="mb-0">${formatDate(lead.createdAt, true)}</p>
    </div>`;

  document.getElementById('leadWABtn').href = lead.phone
    ? `https://wa.me/57${lead.phone.replace(/\D/g,'')}?text=${waMsg}`
    : `https://wa.me/${waNum}?text=${waMsg}`;

  leadModal.show();
}

async function markRead(id, rerender = true) {
  try {
    await API.markLeadRead(id);
    const lead = allLeads.find(l => l.id === id);
    if (lead) lead.read = true;
    if (rerender) {
      renderLeads();
      const unread = allLeads.filter(l => !l.read).length;
      updateUnreadBadge(unread);
    }
  } catch (e) { showToast('Error: ' + e.message, 'error'); }
}

async function markAllRead() {
  const unread = allLeads.filter(l => !l.read);
  if (!unread.length) { showToast('No hay mensajes sin leer'); return; }
  await Promise.all(unread.map(l => API.markLeadRead(l.id).catch(() => {})));
  allLeads.forEach(l => l.read = true);
  renderLeads();
  updateUnreadBadge(0);
  showToast('✅ Todos marcados como leídos', 'success');
}

async function deleteLead(id) {
  if (!confirm('¿Eliminar este registro?')) return;
  try {
    await API.deleteLead(id);
    allLeads = allLeads.filter(l => l.id !== id);
    renderLeads();
    const unread = allLeads.filter(l => !l.read).length;
    updateUnreadBadge(unread);
    showToast('🗑️ Registro eliminado', 'success');
  } catch (e) { showToast('Error: ' + e.message, 'error'); }
}

// ── SETTINGS ─────────────────────────────────────────
async function loadSettings() {
  try {
    settings = await API.getSettings();
    document.getElementById('cfgSiteName').value  = settings.siteName       || '';
    document.getElementById('cfgWhatsapp').value  = settings.whatsappNumber || '';
    document.getElementById('cfgFacebook').value  = settings.facebookUrl    || '';
  } catch (e) { showToast('Error al cargar ajustes', 'error'); }
}

async function saveSettings() {
  try {
    settings = await API.updateSettings({
      siteName:       document.getElementById('cfgSiteName').value.trim(),
      whatsappNumber: document.getElementById('cfgWhatsapp').value.trim(),
      facebookUrl:    document.getElementById('cfgFacebook').value.trim()
    });
    showToast('✅ Configuración guardada', 'success');
  } catch (e) { showToast('Error: ' + e.message, 'error'); }
}

// ── POLLING NOTIFICACIONES ────────────────────────────
async function pollNotifications() {
  try {
    const stats = await API.getLeadStats();
    updateUnreadBadge(stats.unread);
  } catch (_) {}
}

// ── UTILIDADES ───────────────────────────────────────
function updateUnreadBadge(count) {
  const badges = [
    document.getElementById('sidebarBadge'),
    document.getElementById('leadsHeaderBadge')
  ];
  badges.forEach(b => {
    if (!b) return;
    b.textContent = count > 0 ? count : '';
    b.style.display = count > 0 ? 'inline-block' : 'none';
  });
}

function formatDate(iso, full = false) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (full) return d.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showToast(msg, type = '') {
  const t = document.getElementById('adminToast');
  t.textContent = msg;
  t.className   = 'admin-toast show' + (type ? ' ' + type : '');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3500);
}
