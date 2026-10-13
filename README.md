# Ubenkis

Company website for **Ubenkis LLC**, a digital growth and AI services company. It's a React (Vite) frontend with a small Express + SQLite backend that collects inquiries.

## Quick start

Requires **Node 22.13+** (uses the built-in `node:sqlite`, so there are no native modules to compile).

```sh
npm install
npm run dev        # API on :4000, web on http://localhost:5173
```

The database is created on first run at `server/data/ubenkis.db`, with an admin account and a few sample leads. Reset it with `npm run seed`.

Admin dashboard: `/admin`, signing in as `admin@ubenkis.com` / `admin1234`.

### Production

```sh
npm run build      # builds client/dist
npm start          # Express serves the API and the built site on :4000
```

Copy `server/.env.example` to `server/.env` and set at least `JWT_SECRET`, and change the admin password after first sign-in.

## Site

| Page | Path |
| --- | --- |
| Home: hero, services, clients, efficiency comparison, digital marketing channels, free analysis, AI & development, testimonials, industries | `/` |
| Services overview | `/services` |
| Service detail (one per service) | `/services/:slug` |
| About | `/about` |
| Contact (form + company details) | `/contact` |
| Free business analysis request | `/free-analysis` |
| Admin: leads inbox with status tracking, subscribers | `/admin` |

All marketing copy (company details, services, industries, client names, stats, testimonials) lives in [`client/src/data/site.js`](client/src/data/site.js), so you can edit it without touching layout code. **Client names, stats, team and testimonials are placeholders.** Replace them with real ones before launch.

## API

| Method | Path | |
| --- | --- | --- |
| POST | `/api/leads` | Contact form (`source: "contact"`) or free analysis request (`source: "analysis"`) |
| POST | `/api/newsletter` | Newsletter signup |
| POST | `/api/auth/login` | Admin sign in |
| GET | `/api/admin/stats` · `/api/admin/leads` · `/api/admin/subscribers` | Admin data |
| PATCH | `/api/admin/leads/:id` | Update lead status (`new`, `contacted`, `qualified`, `won`, `lost`) |

## Brand assets

`client/public/` contains `logo-mark.svg` (symbol, also the favicon) plus `logo-dark.png` and `logo-light.png`: the full logo on transparent backgrounds, for dark and light backgrounds respectively.
