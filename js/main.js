/* main.js v2 — Nav, Reveal, Modal, Filters, Contact */

// NAV
const nav = document.getElementById('mainNav');
const toggle = document.getElementById('navToggle');
const links = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  nav?.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

toggle?.addEventListener('click', () => {
  links?.classList.toggle('open');
  toggle.classList.toggle('open');
});

links?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => { links.classList.remove('open'); toggle?.classList.remove('open'); });
});

// SCROLL REVEAL
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); } });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// COUNTER
function animateCount(el, target) {
  let v = 0; const step = target / 55;
  const tick = () => { v = Math.min(v + step, target); el.textContent = Math.floor(v); if (v < target) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { animateCount(e.target, +e.target.dataset.count); counterObs.unobserve(e.target); } });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => counterObs.observe(el));

// MODAL
const modal = document.getElementById('propModal');
const modalClose = document.getElementById('modalClose');
const modalBackdrop = document.getElementById('modalBackdrop');

window.openModal = function(id) {
  const props = getProperties();
  const p = props.find(x => x.id === id);
  if (!p || !modal) return;

  const imgs = p.photos || [];
  let gallery = '';
  if (imgs.length === 0) {
    gallery = `<div class="modal-no-photo">🏠</div>`;
  } else if (imgs.length === 1) {
    gallery = `<div class="modal-gallery" style="grid-template-columns:1fr"><div class="modal-main-img"><img src="${imgs[0]}" alt="${p.name}" loading="lazy"/></div></div>`;
  } else {
    const thumbs = imgs.slice(1, 3).map(s => `<img src="${s}" alt="${p.name}" loading="lazy"/>`).join('');
    gallery = `<div class="modal-gallery"><div class="modal-main-img"><img src="${imgs[0]}" alt="${p.name}" loading="lazy"/></div><div class="modal-thumbs">${thumbs}</div></div>`;
  }

  const features = (p.features || []).map(f => `<li>${f}</li>`).join('');
  const statusLabel = { available: 'Available', let: 'Let Agreed', unavailable: 'Unavailable' }[p.status] || 'Available';
  const statusClass = `badge-${p.status || 'available'}`;

  document.getElementById('modalBody').innerHTML = `
    ${gallery}
    <div class="modal-body-grid">
      <div style="grid-column:1/-1;display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:1rem">
        <div>
          <h2 class="modal-title">${p.name}</h2>
          <p class="modal-location">📍 ${p.location || ''}</p>
          <p class="modal-price">${p.price || 'Price on request'}</p>
        </div>
        <span class="card-badge ${statusClass}" style="position:static;margin-top:0.3rem">${statusLabel}</span>
      </div>
      <div>
        <p class="modal-desc">${p.description || 'No description provided.'}</p>
        <div class="modal-meta-row">
          ${p.beds  ? `<span>🛏 ${p.beds} bed${p.beds > 1 ? 's' : ''}</span>` : ''}
          ${p.baths ? `<span>🚿 ${p.baths} bath${p.baths > 1 ? 's' : ''}</span>` : ''}
        </div>
      </div>
      ${features ? `<div><p class="modal-features-title">What's included</p><ul class="modal-features">${features}</ul></div>` : '<div></div>'}
      <div class="modal-cta-row">
        <a href="index.html#contact" class="btn btn-warm">Enquire about this property →</a>
      </div>
    </div>`;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
};

function closeModal() { modal?.classList.remove('open'); document.body.style.overflow = ''; }
modalClose?.addEventListener('click', closeModal);
modalBackdrop?.addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// FILTERS
window.initFilters = function(accentClass) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      document.querySelectorAll('.property-card').forEach(card => {
        card.classList.toggle('hidden', f !== 'all' && !(card.dataset.tag || '').toLowerCase().includes(f));
      });
    });
  });
};

// SEARCH
window.liveSearch = function(query, gridId) {
  const q = query.toLowerCase().trim();
  document.querySelectorAll(`#${gridId} .property-card`).forEach(card => {
    const match = !q || (card.dataset.name || '').toLowerCase().includes(q) || (card.dataset.location || '').toLowerCase().includes(q);
    card.classList.toggle('hidden', !match);
  });
};

// CONTACT FORM
const cform = document.getElementById('contactForm');
cform?.addEventListener('submit', e => {
  e.preventDefault();
  const note = document.getElementById('formSuccess');
  if (note) { note.textContent = '✓ Message sent! We\'ll be in touch within 24 hours.'; }
  cform.reset();
});

// hidden card style
const style = document.createElement('style');
style.textContent = '.property-card.hidden{display:none}';
document.head.appendChild(style);
