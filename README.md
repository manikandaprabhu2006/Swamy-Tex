# SWAMY TEX — Premium Fashion E-Commerce Platform

Premium clothing store for Tirunelveli, Tamil Nadu. Black + Gold + Ivory luxury design with cinematic scroll-driven video hero, full e-commerce flow, and admin dashboard.

## Tech Stack

- **Frontend:** Vite + React 18 + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
- **Payments:** Razorpay (server-verified)
- **Delivery:** Delhivery (dynamic charge calculation)
- **Animation:** GSAP + ScrollTrigger

## Prerequisites

- Node.js 18+
- npm 10+

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The dev server runs on http://localhost:5173

## Production Build

```bash
npm run build
npm run preview
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:

- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — pre-configured
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — Razorpay credentials (leave empty for demo mode)
- `DELHIVERY_API_TOKEN` — Delhivery API token (falls back to zone-based calculation if not set)
- `DELHIVERY_PICKUP_PINCODE` — pickup PIN (default: 627001)

## Database

The Supabase schema is managed via migrations. Tables: profiles, categories, products, product_images, addresses, cart_items, wishlist_items, orders, order_items, payments, shipments, reviews.

All tables have Row Level Security (RLS) enabled with owner-scoped policies.

## Admin Access

1. Create an account via the signup page
2. In Supabase dashboard, set `profiles.role` to `'ADMIN'` for your user
3. Access admin at `/admin`

## Features

### Customer
- Cinematic scroll-driven video hero (GSAP ScrollTrigger)
- Product catalog with search, filters, sorting
- Product details with gallery, size/color selection
- Cart & Wishlist
- Checkout with dynamic Delhivery delivery calculation
- Razorpay payment (server-verified)
- Order history & real-time tracking
- Profile & address management
- Dark/Light mode

### Admin
- Dashboard with sales & inventory stats
- Product CRUD with image management
- Order management with status updates
- Customer overview
- Category management

## Security

- Server-side payment verification (Razorpay signature check)
- Server-side price re-verification (never trusts frontend amounts)
- Row Level Security on all tables
- Stock reduction via atomic database operations
- Secrets stored server-side only (edge functions)

## Delhivery Setup

1. Get an API token from Delhivery
2. Set `DELHIVERY_API_TOKEN` in Supabase edge function secrets
3. Set `DELHIVERY_PICKUP_PINCODE` to your warehouse PIN
4. The delivery-calculate edge function checks serviceability and fetches real rates
5. Falls back to zone-based dynamic calculation if the token is not configured

## Razorpay Setup

1. Create a Razorpay account
2. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in Supabase edge function secrets
3. The checkout loads the Razorpay widget and verifies payment server-side
4. If credentials are not set, the app runs in demo mode (order is created without real payment)

## Deployment

Deploy to any static host (Vercel, Netlify, etc.):

```bash
npm run build
```

Upload the `dist/` folder. Edge functions are deployed via Supabase.

## Project Structure

```
src/
  app/          — (App router)
  components/   — Reusable UI components
  features/     — Context providers (auth, cart, wishlist, theme, toast)
  hooks/        — Custom hooks
  lib/          — Supabase client
  pages/        — Route pages (customer + admin)
  services/     — Data services
  styles/       — Global CSS
  types/        — TypeScript types
  utils/        — Formatting utilities
supabase/
  functions/    — Edge functions (delivery, razorpay)
  migrations/   — Database migrations
public/         — Static assets (favicon, robots, sitemap)
```

## License

© SWAMY TEX. All rights reserved.


## SWAMY TEX Security & Production Setup

### Authentication
Configure Supabase Authentication before deployment:

1. Enable Email provider and require email confirmation/OTP.
2. Enable Phone provider and configure a trusted SMS provider for mobile OTP.
3. Enable Google provider and set the production Site URL plus redirect URL:
   `https://YOUR-DOMAIN/auth/callback`
4. Keep anonymous/public browsing enabled; protect checkout, orders, profile and admin operations with server-side auth/RLS.
5. Use strong password policy and rate limits in Supabase Auth settings.

### Database security
Enable Row Level Security (RLS) for customer-owned tables. Policies should ensure a customer can only read/write their own profile, addresses, cart, wishlist and orders. Admin operations must use server-side authorization and must never accept a client-supplied role.

### Payment & delivery
Razorpay secrets and Delhivery tokens must stay in the server/Edge Function environment. Never place secret keys in `VITE_*` variables. The frontend should only receive the public Razorpay key ID and a verified order/payment response.

### AI assistant
The included SWAMY TEX AI assistant works as a safe catalog-aware fallback without exposing an AI key. If a real LLM is connected, call it through a Supabase Edge Function/server endpoint, apply rate limiting, and never expose the provider API key to the browser. Do not let the assistant return private customer/order/payment data.

### Local development

```bash
npm install
npm run typecheck
npm run dev
```

Create `.env` from `.env.example` and provide the Supabase URL and anon key before opening the app.

### Build

```bash
npm run build
npm run preview
```

The project is a Vite + React + TypeScript application using Supabase for its data/auth layer. Keep `node_modules` out of source control and reinstall dependencies locally with `npm install`.
