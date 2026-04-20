# HomeHaven — Claude Instructions

## Config JSON convention (ALWAYS follow this)

Every page on this site has a matching config file in `config/[pagename].json` that holds all editable copy (text, prices, stats, headings, lists). When building any new page, you MUST:

1. Create `config/[pagename].json` with ALL page copy extracted into it
2. Add a `fetch('config/[pagename].json')` loader script at the bottom of the page that populates the DOM
3. Follow the same pattern used in `phuket.html` / `config/phuket.json`

Existing configs:
- `config/index.json` — homepage copy (split panels, why-us, contact headings)
- `config/student.json` — student rooms page copy
- `config/phuket.json` — Phuket villa page copy
- `data/content.json` — homepage stats, contact details, quotes (written by admin panel — do not consolidate)

The user edits these JSON files directly on GitHub (pencil icon) to update content without touching HTML.

## Site overview

- Static GitHub Pages site — deploy by pushing to `main`
- Images hosted on Cloudinary (cloud: `dgioaobur`, folder: `RentalSite/Phuket`)
- Admin panel at `admin/index.html` writes to `data/content.json` via GitHub API
- Pages: `index.html`, `student.html`, `phuket.html`, `admin/index.html`
