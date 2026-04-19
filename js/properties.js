/* properties.js — localStorage CRUD + card builder */

const STORE = 'homehaven_v2_props';

window.getProperties = function(type) {
  try { const d = JSON.parse(localStorage.getItem(STORE) || '[]'); return type ? d.filter(p => p.type === type) : d; }
  catch { return []; }
};

window.saveProperty = function(p) {
  const all = getProperties();
  const i = all.findIndex(x => x.id === p.id);
  if (i >= 0) { all[i] = p; } else { p.id = p.id || 'p_' + Date.now(); p.createdAt = new Date().toISOString(); all.unshift(p); }
  localStorage.setItem(STORE, JSON.stringify(all));
  return p;
};

window.deleteProperty = function(id) {
  localStorage.setItem(STORE, JSON.stringify(getProperties().filter(p => p.id !== id)));
};

window.getProperty = function(id) { return getProperties().find(p => p.id === id); };

window.buildCard = function(p) {
  const img = p.photos?.length
    ? `<img src="${p.photos[0]}" alt="${p.name}" loading="lazy"/>`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2.5rem;background:var(--warm-mid)">🏠</div>`;
  const statusLabel = { available:'Available', let:'Let Agreed', unavailable:'Unavailable' }[p.status] || 'Available';
  return `<div class="property-card" data-id="${p.id}" data-tag="${p.tag||''}" data-name="${p.name||''}" data-location="${p.location||''}" onclick="openModal('${p.id}')">
    <div class="card-image">${img}<span class="card-badge badge-${p.status||'available'}">${statusLabel}</span></div>
    <div class="card-body">
      ${p.tag ? `<p class="card-tag">${p.tag}</p>` : ''}
      <h3 class="card-title">${p.name}</h3>
      <p class="card-location">📍 ${p.location||''}</p>
      <div class="card-meta">${p.beds?`<span>🛏 ${p.beds} bed</span>`:''} ${p.baths?`<span>🚿 ${p.baths} bath</span>`:''}</div>
      <p class="card-price">${p.price||'Price on request'}</p>
    </div>
  </div>`;
};

window.renderGrid = function(type, gridId, emptyId) {
  const grid = document.getElementById(gridId);
  const empty = document.getElementById(emptyId);
  if (!grid) return;
  const props = getProperties(type);
  grid.innerHTML = '';
  if (!props.length) { if (empty) empty.style.display = 'block'; return; }
  if (empty) empty.style.display = 'none';
  props.forEach((p, i) => {
    const el = document.createElement('div');
    el.innerHTML = buildCard(p);
    const card = el.firstElementChild;
    card.classList.add('reveal');
    card.style.transitionDelay = `${i * 0.07}s`;
    grid.appendChild(card);
    requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('in')));
  });
};
