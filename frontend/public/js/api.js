/**
 * public/js/api.js
 * Capa de servicios API – abstrae todas las llamadas HTTP
 */

const API = (() => {

  function getToken() { return localStorage.getItem('vl_token') || ''; }

  async function request(endpoint, options = {}) {
    const url = CONFIG.API_BASE + endpoint;
    const headers = { 'x-admin-token': getToken(), ...options.headers };
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  }

  return {
    // Auth
    login:          (user, pass)  => request('/auth/login',  { method: 'POST', body: JSON.stringify({ user, pass }) }),
    logout:         ()            => request('/auth/logout', { method: 'POST' }),
    getSettings:    ()            => request('/auth/settings'),
    updateSettings: (data)        => request('/auth/settings', { method: 'PUT', body: JSON.stringify(data) }),

    // Products
    getProducts:    ()            => request('/products'),
    getProduct:     (id)          => request(`/products/${id}`),
    createProduct:  (formData)    => request('/products', { method: 'POST', body: formData }),
    updateProduct:  (id, formData)=> request(`/products/${id}`, { method: 'PUT', body: formData }),
    deleteProduct:  (id)          => request(`/products/${id}`, { method: 'DELETE' }),

    // Leads
    getLeads:       ()            => request('/leads'),
    getLeadStats:   ()            => request('/leads/stats'),
    markLeadRead:   (id)          => request(`/leads/${id}/read`, { method: 'PATCH' }),
    deleteLead:     (id)          => request(`/leads/${id}`, { method: 'DELETE' }),

    // Public (sin token)
    submitLead: (data) => fetch(CONFIG.API_BASE + '/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json())
  };
})();
