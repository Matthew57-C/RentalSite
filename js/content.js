/* content.js — fetches from GitHub, writes back via API */
const HH_GH_USER = 'Matthew57-C';
const HH_GH_REPO = 'RentalSite';
const HH_CONTENT_PATH = 'data/content.json';

const CONTENT_DEFAULTS = {
  stat1Num: 50, stat1Label: 'Properties managed',
  stat2Num: 98, stat2Label: 'Tenant satisfaction',
  stat3Num: 10, stat3Label: 'Years experience',
  stat4Num: 24, stat4Label: 'Response time',
  email: 'hello@homehaven.co.uk',
  phone: '+44 1234 567 890',
  quotes: [
    { text: '\u201cThe best accommodation I\u2019ve ever rented. It genuinely felt like home.\u201d', cite: '\u2014 Previous tenant, Cambridge' }
  ],
};

async function fetchContent() {
  try {
    const url = `https://raw.githubusercontent.com/${HH_GH_USER}/${HH_GH_REPO}/main/${HH_CONTENT_PATH}?t=${Date.now()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return Object.assign({}, CONTENT_DEFAULTS);
  }
}

async function saveContent(patch, pat) {
  const apiUrl = `https://api.github.com/repos/${HH_GH_USER}/${HH_GH_REPO}/contents/${HH_CONTENT_PATH}`;
  const metaRes = await fetch(apiUrl, {
    headers: { 'Authorization': `token ${pat}`, 'Accept': 'application/vnd.github.v3+json' }
  });
  if (!metaRes.ok) throw new Error('GitHub token invalid — check Settings.');
  const meta = await metaRes.json();
  const current = JSON.parse(atob(meta.content.replace(/\n/g, '')));
  const updated = Object.assign(current, patch);
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(updated, null, 2))));
  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers: { 'Authorization': `token ${pat}`, 'Content-Type': 'application/json', 'Accept': 'application/vnd.github.v3+json' },
    body: JSON.stringify({ message: 'Update site content via admin panel', content: encoded, sha: meta.sha })
  });
  if (!putRes.ok) throw new Error('Save failed — check token has repo write access.');
}

function applyContentToDOM(c) {
  for (let i = 1; i <= 4; i++) {
    const numEl = document.getElementById(`hhStat${i}Num`);
    if (numEl) numEl.dataset.count = c[`stat${i}Num`];
    const labelEl = document.getElementById(`hhStat${i}Label`);
    if (labelEl) labelEl.textContent = c[`stat${i}Label`];
  }
  const emailEl = document.getElementById('hhEmail');
  if (emailEl) { emailEl.textContent = c.email; emailEl.href = `mailto:${c.email}`; }
  const phoneEl = document.getElementById('hhPhone');
  if (phoneEl) { phoneEl.textContent = c.phone; phoneEl.href = `tel:${c.phone.replace(/[^+\d]/g, '')}`; }

  const quotes = c.quotes && c.quotes.length ? c.quotes : CONTENT_DEFAULTS.quotes;
  const quoteEl = document.getElementById('hhQuote');
  const citeEl = document.getElementById('hhCite');
  if (quoteEl) quoteEl.textContent = quotes[0].text;
  if (citeEl) citeEl.textContent = quotes[0].cite;

  if (quotes.length > 1) {
    const start = () => {
      if (typeof window.cycleQuotes === 'function') window.cycleQuotes(quotes);
      else setTimeout(start, 200);
    };
    setTimeout(start, 1200);
  }
}

fetchContent().then(applyContentToDOM);
