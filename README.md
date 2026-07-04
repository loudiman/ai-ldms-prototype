# AI-LDMS — Prototype

A runnable draft prototype responding to the client's *AI Land Development &amp; Management Systems — User Stories Document v1.0*: one flagship screen per module across the six-module system, built on simulated data.

**▶ Live demo: https://loudiman.github.io/ai-ldms-prototype/**

> The full written submission — project timeline and cost proposal — is delivered separately as a PDF.

## Built with

React 18 · Vite 6 · TypeScript · Tailwind CSS v4 · react-leaflet / Leaflet · Recharts. All data is generated locally from a seeded mock dataset — no backend.

## Run locally

Requires Node.js 18+ (built on Node 24).

```bash
cd prototype
npm install
npm run dev
```

Then open the printed `localhost` URL. For a production preview: `npm run build && npm run preview`.

## Screens

| Screen | User stories |
| --- | --- |
| Parcel Map | US-001 / US-002 / US-003 |
| Environment | US-004 / US-005 / US-006 |
| Permits | US-007 / US-008 / US-009 |
| Valuation | US-010 / US-011 |
| Community | US-012 / US-013 |
| Analytics | US-014 / US-015 |

Preview images of every screen are in [`screenshots/`](screenshots/).

## Note

All data in the prototype is simulated for demonstration purposes. The production AI architecture — Sentinel-2 / Google Earth Engine imagery, PostGIS / Turf.js geospatial processing, gradient-boosted valuation models, rules-engine compliance checks, and the Claude API for natural-language search, the chatbot, and report generation — is described in the accompanying proposal.

---

Prepared by [Your Name] — loudiamondmorados162@gmail.com
