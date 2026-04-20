/* main.js v4 — Nav, Layered Parallax, Reveal, Modal, Filters, Contact */

// LAYERED PARALLAX HERO
(function () {
  const hero = document.getElementById('paraHero');
  if (!hero) return;
  const bg   = hero.querySelector('.para-bg');
  const mid  = hero.querySelector('.para-mid');
  const fg   = hero.querySelector('.para-fg');
  const cont = hero.querySelector('.para-content');
  const hint = hero.querySelector('.para-scroll');

  function update() {
    const sy = window.scrollY;
    const vh = window.innerHeight;
    if (sy > vh * 1.1) return;
    if (bg)  bg.style.transform  = `translateY(${-sy * 0.08}px)`;
    if (mid) mid.style.transform = `translateY(${-sy * 0.28}px)`;
    if (fg)  fg.style.transform  = `translateY(${-sy * 0.52}px)`;
    if (cont) {
      const p = Math.min(sy / (vh * 0.45), 1);
      cont.style.transform = `translateY(${-sy * 0.18}px)`;
      cont.style.opacity   = String(Math.max(1 - p * 1.4, 0));
    }
    if (hint) hint.style.opacity = String(Math.max(1 - sy / 130, 0));
  }
  window.addEventListener('scroll', update, { passive: true });
})();

// SPLIT PANEL VISIBILITY — hide panels with no properties
(function () {
  if (typeof getProperties !== 'function') return;
  const check = (type, sel) => {
    if (getProperties(type).length) return;
    const panel = document.querySelector(sel);
    if (!panel) return;
    panel.style.pointerEvents = 'none';
    const tag = panel.querySelector('.split-tag');
    if (tag) tag.textContent = 'Coming Soon';
    const btn = panel.querySelector('.btn');
    if (btn) btn.style.display = 'none';
  };
  check('student', '.split-student');
  check('holiday', '.split-holiday');
})();

// QUOTE CYCLING
window.cycleQuotes = function (quotes) {
  if (!quotes || quotes.length < 2) return;
  const q = document.getElementById('hhQuote');
  const c = document.getElementById('hhCite');
  if (!q || !c) return;
  let idx = 0;
  setInterval(() => {
    q.classList.add('quote-fade');
    c.classList.add('quote-fade');
    setTimeout(() => {
      idx = (idx + 1) % quotes.length;
      q.textContent = quotes[idx].text;
      c.textContent = quotes[idx].cite;
      q.classList.remove('quote-fade');
      c.classList.remove('quote-fade');
    }, 700);
  }, 6000);
};

// NAV
const nav = document.getElementById('mainNav');
const toggle = document.getElementById('navToggle');
const links = document.querySelector('.nav-links');

const _navThreshold = document.getElementById('paraHero') ? window.innerHeight * 0.85 : 50;
window.addEventListener('scroll', () => {
  nav?.classList.toggle('scrolled', window.scrollY > _navThreshold);
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
cform?.addEventListener('submit', async e => {
  e.preventDefault();
  const note = document.getElementById('formSuccess');
  const btn  = cform.querySelector('[type="submit"]');
  if (btn) btn.disabled = true;
  if (note) { note.style.color = ''; note.textContent = 'Sending…'; }

  const fd = new FormData(cform);
  try {
    const res = await fetch('https://formsubmit.co/ajax/suziezhu7717@gmail.com', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: JSON.stringify({
        name:    fd.get('name'),
        email:   fd.get('email'),
        interest: fd.get('interest') || '',
        message: fd.get('message') || '',
        _subject: 'New enquiry — HomeHaven',
        _captcha: 'false'
      })
    });
    const data = await res.json();
    if (data.success === 'true' || data.success === true) {
      if (note) { note.style.color = 'var(--warm-accent)'; note.textContent = '✓ Message sent! We\'ll be in touch within 24 hours.'; }
      cform.reset();
    } else {
      throw new Error();
    }
  } catch {
    if (note) { note.style.color = '#c0392b'; note.textContent = 'Something went wrong — please email us directly.'; }
  } finally {
    if (btn) btn.disabled = false;
  }
});

// hidden card style
const style = document.createElement('style');
style.textContent = '.property-card.hidden{display:none}';
document.head.appendChild(style);
