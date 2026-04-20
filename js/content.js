/* content.js — site-wide editable content via localStorage */
const HH_CONTENT = 'hh_content_v1';

const CONTENT_DEFAULTS = {
  stat1Num: 50, stat1Label: 'Properties managed',
  stat2Num: 98, stat2Label: 'Tenant satisfaction',
  stat3Num: 10, stat3Label: 'Years experience',
  stat4Num: 24, stat4Label: 'Response time',
  email: 'hello@homehaven.co.uk',
  phone: '+44 1234 567 890',
  quote: '\u201cThe best accommodation I\u2019ve ever rented. It genuinely felt like home.\u201d',
  cite: '\u2014 Previous tenant, Cambridge',
};

function getContent() {
  try { return Object.assign({}, CONTENT_DEFAULTS, JSON.parse(localStorage.getItem(HH_CONTENT) || '{}')); }
  catch { return Object.assign({}, CONTENT_DEFAULTS); }
}

function saveContent(patch) {
  localStorage.setItem(HH_CONTENT, JSON.stringify(Object.assign(getContent(), patch)));
}

function applyContent() {
  const c = getContent();

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

  const quoteEl = document.getElementById('hhQuote');
  if (quoteEl) quoteEl.textContent = c.quote;

  const citeEl = document.getElementById('hhCite');
  if (citeEl) citeEl.textContent = c.cite;
}

applyContent();
