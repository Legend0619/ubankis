# Ubankis

Full-stack telehealth e-commerce store: React (Vite) frontend + Express API + SQLite.

## Quick start

Requires **Node 22.13+** (uses the built-in `node:sqlite`, so there are no native modules to compile).

```sh
npm install
npm run dev        # API on :4000, web on http://localhost:5173
```

The database is created and seeded on first run at `server/data/ubankis.db`. Reset it with `npm run seed`.

| Account | Email | Password |
| --- | --- | --- |
| Admin | admin@ubankis.com | admin1234 |
| Customer | demo@ubankis.com | demo1234 |

Promo codes: `START20` (20% off), `WELCOME10` (10% off).

### Production

```sh
npm run build      # builds client/dist
npm start          # Express serves the API and the built app on :4000
```

Copy `server/.env.example` to `server/.env` and set at least `JWT_SECRET`.

## Payments

- **Demo mode (default):** a built-in card form validates the card server-side. Use `4242 4242 4242 4242`, any future expiry and any CVC; `4000 0000 0000 0002` simulates a decline. Nothing is charged.
- **Stripe:** set `STRIPE_SECRET_KEY` (a `sk_test_…` key works) and `CLIENT_URL`. Checkout then redirects to Stripe Checkout, and the order is marked paid after the server verifies the session on return.

## Features

- **Storefront:** home, shop with filters/search/sort, treatment landing pages, product pages with reviews, membership plans (monthly/annual), how it works, FAQ, about, contact
- **Cart:** slide-out drawer, promo codes, free-shipping meter. All prices are recalculated on the server.
- **Checkout:** shipping, then a medical intake (only when the cart has Rx items), then payment
- **Pricing rules:** Optimize/Elite memberships give 10%/20% off treatments plus free shipping; orders over $75 ship free. Only one membership per cart.
- **Assessment quiz** that recommends a program and products, and is saved as a lead
- **Accounts:** register/login (JWT), order history with a status tracker and timeline, cancel orders, pay a pending order, profile and saved address, password change
- **Admin** (`/admin`): revenue dashboard; order management (approve after provider review → processing → shipped → delivered, or cancel) with intake details; product create/edit/hide; customers; assessments and intakes; contact messages; newsletter subscribers

## Order lifecycle

`pending_payment` → paid → `in_review` (Rx orders only, while a provider reviews the intake) → `processing` → `shipped` → `delivered`, or `cancelled` at any point before shipping.

## Product images

Products render generated packaging art. To use real photos, put **images you own or have licensed** in `client/public/images/` and set each product's *Image URL* in Admin → Products (e.g. `/images/semaglutide.jpg`).

## Project layout

```
server/src/
  index.js          app setup, static hosting, error handler
  db.js             schema (node:sqlite)
  seed.js           catalog, plans, reviews, demo users
  pricing.js        cart quote: discounts, promos, shipping
  payments.js       Stripe Checkout + demo card processing
  routes/           auth, catalog, orders, misc (assessment/contact/newsletter), admin
client/src/
  context/          auth, cart, toast providers
  components/       header, footer, cart drawer, product art, etc.
  pages/            one file per route
```

> Demo project. Medical content, prices, ratings and reviews are placeholders. Selling prescription drugs for real requires licensed providers, pharmacy partners and HIPAA-compliant infrastructure.
