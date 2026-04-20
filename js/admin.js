/* admin.js v2 */
const PW_KEY = 'hh_pw', SITE_KEY = 'hh_site', DEFAULT_PW = 'admin123';
const getPW = () => localStorage.getItem(PW_KEY) || DEFAULT_PW;
const loggedIn = () => sessionStorage.getItem('hh_admin') === '1';

function checkAuth() {
  if (loggedIn()) { showDash(); } else { document.getElementById('adminLogin').style.display = 'flex'; document.getElementById('adminDashboard').style.display = 'none'; }
}
function showDash() {
  document.getElementById('adminLogin').style.display = 'none';
  document.getElementById('adminDashboard').style.display = 'flex';
  loadList(); loadSiteSettings();
}

document.getElementById('loginBtn').addEventListener('click', doLogin);
document.getElementById('pwInput').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

function doLogin() {
  const v = document.getElementById('pwInput').value;
  if (v === getPW()) { sessionStorage.setItem('hh_admin', '1'); document.getElementById('loginError').textContent = ''; showDash(); }
  else { document.getElementById('loginError').textContent = 'Incorrect password.'; document.getElementById('pwInput').value = ''; }
}

document.getElementById('logoutBtn').addEventListener('click', () => { sessionStorage.removeItem('hh_admin'); checkAuth(); });

// PANEL SWITCHING
document.querySelectorAll('.sidebar-btn').forEach(btn => {
  btn.addEventListener('click', () => switchPanel(btn.dataset.panel));
});
document.addEventListener('click', e => { if (e.target.classList.contains('link-btn') && e.target.dataset.panel) switchPanel(e.target.dataset.panel); });

function switchPanel(name) {
  document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.toggle('active', b.dataset.panel === name));
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${name}`));
  if (name === 'properties') loadList();
  if (name === 'add') { clearForm(); document.getElementById('addTitle').textContent = 'Add Property'; document.getElementById('cancelBtn').style.display = 'none'; }
  if (name === 'content') loadContentPanel();
}

// PROPERTIES LIST
function loadList(filter) {
  const list = document.getElementById('adminList'), empty = document.getElementById('adminEmpty');
  const type = filter ?? document.getElementById('typeFilter').value;
  const props = getProperties(type === 'all' ? undefined : type);
  list.innerHTML = '';
  if (!props.length) { empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  props.forEach(p => {
    const thumb = p.photos?.length ? `<div class="admin-thumb"><img src="${p.photos[0]}" alt="${p.name}"/></div>` : `<div class="admin-thumb">🏠</div>`;
    const row = document.createElement('div'); row.className = 'admin-row';
    row.innerHTML = `${thumb}
      <div class="admin-info">
        <div class="admin-name">${p.name}</div>
        <div class="admin-meta">
          <span class="type-pill type-${p.type}">${p.type === 'student' ? 'Student' : 'Holiday'}</span>
          <span>${p.location || '—'}</span>
          <span>${p.price || 'POA'}</span>
          <span class="status-pill s-${p.status||'available'}">${{available:'Available',let:'Let Agreed',unavailable:'Unavailable'}[p.status||'available']}</span>
        </div>
      </div>
      <div class="admin-actions">
        <button class="btn-edit" data-id="${p.id}">Edit</button>
        <button class="btn-del" data-id="${p.id}">Delete</button>
      </div>`;
    list.appendChild(row);
  });
  list.querySelectorAll('.btn-edit').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); loadEdit(b.dataset.id); }));
  list.querySelectorAll('.btn-del').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); if (confirm('Delete this property?')) { deleteProperty(b.dataset.id); loadList(); } }));
}
document.getElementById('typeFilter').addEventListener('change', e => loadList(e.target.value));

// ADD / EDIT
let photos = [];

function clearForm() {
  ['editId','propName','propLocation','propPrice','propTag','propDesc','propFeatures'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  ['propBeds','propBaths'].forEach(id => { document.getElementById(id).value = '1'; });
  document.getElementById('propType').value = 'student';
  document.getElementById('propStatus').value = 'available';
  document.getElementById('propFeatured').value = 'true';
  photos = []; renderPreviews();
  document.getElementById('saveMsg').textContent = '';
}

function loadEdit(id) {
  const p = getProperty(id); if (!p) return;
  switchPanel('add');
  document.getElementById('addTitle').textContent = 'Edit Property';
  document.getElementById('cancelBtn').style.display = 'inline-block';
  document.getElementById('editId').value = p.id;
  document.getElementById('propName').value = p.name || '';
  document.getElementById('propType').value = p.type || 'student';
  document.getElementById('propLocation').value = p.location || '';
  document.getElementById('propPrice').value = p.price || '';
  document.getElementById('propBeds').value = p.beds || 1;
  document.getElementById('propBaths').value = p.baths || 1;
  document.getElementById('propTag').value = p.tag || '';
  document.getElementById('propDesc').value = p.description || '';
  document.getElementById('propFeatures').value = (p.features || []).join('\n');
  document.getElementById('propStatus').value = p.status || 'available';
  document.getElementById('propFeatured').value = p.featured !== false ? 'true' : 'false';
  photos = (p.photos || []).map((url, i) => ({ dataUrl: url, name: `photo_${i}` }));
  renderPreviews();
}

document.getElementById('cancelBtn').addEventListener('click', () => { clearForm(); switchPanel('properties'); });

document.getElementById('saveBtn').addEventListener('click', () => {
  const name = document.getElementById('propName').value.trim();
  const type = document.getElementById('propType').value;
  if (!name || !type) { showMsg('Please enter at least a name and type.', true); return; }
  const features = document.getElementById('propFeatures').value.split('\n').map(f => f.trim()).filter(Boolean);
  const prop = {
    id: document.getElementById('editId').value || undefined,
    name, type,
    location: document.getElementById('propLocation').value.trim(),
    price: document.getElementById('propPrice').value.trim(),
    beds: +document.getElementById('propBeds').value || 1,
    baths: +document.getElementById('propBaths').value || 1,
    tag: document.getElementById('propTag').value.trim(),
    description: document.getElementById('propDesc').value.trim(),
    features,
    status: document.getElementById('propStatus').value,
    featured: document.getElementById('propFeatured').value === 'true',
    photos: photos.map(p => p.dataUrl),
  };
  saveProperty(prop);
  showMsg('✓ Property saved!', false);
  if (!document.getElementById('editId').value) setTimeout(clearForm, 1500);
  else document.getElementById('editId').value = prop.id;
});

function showMsg(m, err) {
  const el = document.getElementById('saveMsg');
  el.textContent = m; el.className = `save-msg${err ? ' err' : ''}`;
  if (!err) setTimeout(() => { el.textContent = ''; }, 3000);
}

// PHOTOS
const photoInput = document.getElementById('photoInput');
const photoZone = document.getElementById('photoZone');

document.getElementById('uploadTrigger').addEventListener('click', e => { e.stopPropagation(); photoInput.click(); });
photoZone.addEventListener('click', () => photoInput.click());
photoInput.addEventListener('change', e => { handleFiles(Array.from(e.target.files)); photoInput.value = ''; });
photoZone.addEventListener('dragover', e => { e.preventDefault(); photoZone.classList.add('drag-over'); });
photoZone.addEventListener('dragleave', () => photoZone.classList.remove('drag-over'));
photoZone.addEventListener('drop', e => { e.preventDefault(); photoZone.classList.remove('drag-over'); handleFiles(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))); });

function handleFiles(files) {
  files.forEach(file => {
    const r = new FileReader();
    r.onload = e => { photos.push({ dataUrl: e.target.result, name: file.name }); renderPreviews(); };
    r.readAsDataURL(file);
  });
}

function renderPreviews() {
  const c = document.getElementById('photoPreviews'), pr = document.getElementById('uploadPrompt');
  c.innerHTML = '';
  pr.style.display = photos.length ? 'none' : 'block';
  if (!photos.length) return;
  photos.forEach((ph, i) => {
    const d = document.createElement('div'); d.className = 'preview-wrap';
    d.innerHTML = `<img src="${ph.dataUrl}" alt="${ph.name}"/><button class="preview-rm" data-i="${i}">✕</button>`;
    c.appendChild(d);
  });
  const add = document.createElement('div');
  add.className = 'preview-wrap';
  add.style.cssText = 'border:2px dashed #d4d9cc;background:#f1f2ee;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1.4rem;color:#aaa;';
  add.innerHTML = '+'; add.onclick = () => photoInput.click();
  c.appendChild(add);
  c.querySelectorAll('.preview-rm').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); photos.splice(+btn.dataset.i, 1); renderPreviews(); }));
}

// SETTINGS
function loadSiteSettings() {
  try { const s = JSON.parse(localStorage.getItem(SITE_KEY) || '{}'); if (s.name) document.getElementById('siteName').value = s.name; if (s.email) document.getElementById('siteEmail').value = s.email; } catch {}
}

document.getElementById('changePwBtn').addEventListener('click', () => {
  const np = document.getElementById('newPw').value, cp = document.getElementById('confirmPw').value, msg = document.getElementById('pwMsg');
  if (!np) { msg.textContent = 'Enter a new password.'; msg.className = 'save-msg err'; return; }
  if (np !== cp) { msg.textContent = 'Passwords do not match.'; msg.className = 'save-msg err'; return; }
  localStorage.setItem(PW_KEY, np);
  msg.textContent = '✓ Password updated.'; msg.className = 'save-msg';
  document.getElementById('newPw').value = ''; document.getElementById('confirmPw').value = '';
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ properties: getProperties(), exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'homehaven-data.json' }); a.click();
});

document.getElementById('clearBtn').addEventListener('click', () => {
  if (confirm('Delete ALL property data? This cannot be undone.')) { localStorage.removeItem('homehaven_v2_props'); loadList(); alert('Cleared.'); }
});

document.getElementById('saveSiteBtn').addEventListener('click', () => {
  localStorage.setItem(SITE_KEY, JSON.stringify({ name: document.getElementById('siteName').value.trim(), email: document.getElementById('siteEmail').value.trim() }));
  const m = document.getElementById('siteMsg'); m.textContent = '✓ Saved.'; m.className = 'save-msg';
  setTimeout(() => { m.textContent = ''; }, 3000);
});

// PAT management
const PAT_KEY = 'hh_gh_pat';
const getPat = () => localStorage.getItem(PAT_KEY) || '';

document.getElementById('savePatBtn')?.addEventListener('click', () => {
  const val = document.getElementById('ghPat').value.trim();
  if (val && !val.startsWith('\u2022')) localStorage.setItem(PAT_KEY, val);
  contentMsg('patMsg', '\u2713 Token saved.', false);
});

// CONTENT PANEL
function loadContentPanel() {
  fetchContent().then(c => {
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v ?? ''; };
    for (let i = 1; i <= 4; i++) {
      set(`cStat${i}Num`, c[`stat${i}Num`]);
      set(`cStat${i}Label`, c[`stat${i}Label`]);
    }
    set('cEmail', c.email);
    set('cPhone', c.phone);
    set('cQuote', c.quote);
    set('cCite', c.cite);
  });
  const ghPat = document.getElementById('ghPat');
  if (ghPat && getPat()) ghPat.placeholder = 'Token saved \u2014 paste new one to replace';
}

function contentMsg(id, text, err, btnId) {
  const el = document.getElementById(id);
  if (el) { el.textContent = text; el.className = `save-msg${err ? ' err' : ''}`; }
  if (btnId) {
    const btn = document.getElementById(btnId);
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = err ? '✕ Error' : '✓ Saved!';
      btn.style.background = err ? 'var(--adng)' : '#2d7d46';
      btn.disabled = true;
      setTimeout(() => { btn.textContent = orig; btn.style.background = ''; btn.disabled = false; }, 3000);
    }
  }
  if (!err) setTimeout(() => { if (el) el.textContent = ''; }, 4000);
}

function requirePat(msgId, btnId) {
  if (getPat()) return true;
  contentMsg(msgId, 'Add your GitHub token in Settings first.', true, btnId);
  return false;
}

document.getElementById('saveStatsBtn')?.addEventListener('click', async () => {
  if (!requirePat('statsMsg', 'saveStatsBtn')) return;
  const patch = {};
  for (let i = 1; i <= 4; i++) {
    patch[`stat${i}Num`] = +document.getElementById(`cStat${i}Num`).value || 0;
    patch[`stat${i}Label`] = document.getElementById(`cStat${i}Label`).value.trim();
  }
  contentMsg('statsMsg', 'Saving\u2026', false, 'saveStatsBtn');
  try { await saveContent(patch, getPat()); contentMsg('statsMsg', 'Live in ~30s.', false, 'saveStatsBtn'); }
  catch (e) { contentMsg('statsMsg', e.message, true, 'saveStatsBtn'); }
});

document.getElementById('saveContactBtn')?.addEventListener('click', async () => {
  if (!requirePat('contactMsg', 'saveContactBtn')) return;
  contentMsg('contactMsg', 'Saving\u2026', false, 'saveContactBtn');
  try {
    await saveContent({ email: document.getElementById('cEmail').value.trim(), phone: document.getElementById('cPhone').value.trim() }, getPat());
    contentMsg('contactMsg', 'Live in ~30s.', false, 'saveContactBtn');
  } catch (e) { contentMsg('contactMsg', e.message, true, 'saveContactBtn'); }
});

document.getElementById('saveQuoteBtn')?.addEventListener('click', async () => {
  if (!requirePat('quoteMsg', 'saveQuoteBtn')) return;
  contentMsg('quoteMsg', 'Saving\u2026', false, 'saveQuoteBtn');
  try {
    await saveContent({ quote: document.getElementById('cQuote').value.trim(), cite: document.getElementById('cCite').value.trim() }, getPat());
    contentMsg('quoteMsg', 'Live in ~30s.', false, 'saveQuoteBtn');
  } catch (e) { contentMsg('quoteMsg', e.message, true, 'saveQuoteBtn'); }
});

checkAuth();
