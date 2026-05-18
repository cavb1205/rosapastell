# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Dev server at localhost:3000
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint (flat config, v9+)
```

No test framework is configured. Type checking runs implicitly via `next build`.

## Architecture

**Rosa Pastell** is a Next.js 16 (App Router) e-commerce frontend for a Colombian pajama store. The backend is a separate WordPress/WooCommerce instance at `rosapastell.com` accessed via REST API.

### Stack

- **Next.js 16.2.1** / React 19 / TypeScript 5
- **Tailwind CSS v4** — configured inline via `@theme inline` in `globals.css`, no `tailwind.config.ts`
- **Zustand v5** — client state (cart, auth, wishlist, recently viewed, UI)
- **react-hook-form + Zod** — form validation
- **Radix UI** — dialog, dropdown, select primitives
- **SWR** — available but most data fetching uses server-side `fetch` with ISR

### Data Flow

All product, category, order, and user data comes from WooCommerce REST API v3. The data layer lives in `src/lib/woocommerce.ts` which wraps fetch calls with consumer key/secret auth. Pages are Server Components that call these functions directly with ISR revalidation (60s for products/categories, 300s for homepage).

Client state (cart items, wishlist, auth token) is managed by Zustand stores in `src/store/` with localStorage persistence.

### Key Integrations

| Service | Purpose | Key files |
|---------|---------|-----------|
| **WooCommerce** | Products, orders, categories, users | `src/lib/woocommerce.ts`, `src/lib/auth.ts` |
| **Wompi** | Payment gateway (Colombia) | `src/components/checkout/WompiWidget.tsx`, `src/app/api/webhooks/wompi/` |
| **Resend** | Transactional email | `src/lib/email.ts`, `src/lib/email-templates.ts` |
| **WordPress JWT** | Authentication (custom, no Auth.js) | `src/lib/auth.ts`, `src/app/api/auth/` |

### Auth

JWT tokens from WordPress JWT-Auth plugin, stored as HttpOnly cookies (`rp_auth_token`). Auth state hydrated client-side via `AuthProvider` component calling `/api/auth/me`. Wholesale pricing is role-based — detected from WooCommerce `meta_data._role_based_price`.

### Project Layout

```
src/
  app/              # App Router pages and API routes
    api/            # ~20 route handlers (auth, orders, checkout, webhooks, search)
    producto/       # Product detail pages (dynamic [slug])
    categorias/     # Category pages (dynamic [slug])
    checkout/       # Checkout flow (pago/, whatsapp/, confirmacion/)
    cuenta/         # User account (perfil, pedidos, favoritos, login, register)
  components/       # ~45 components organized by domain
    layout/         # SiteHeader, Footer, WhatsAppButton
    product/        # ProductDetail, ProductGallery, ProductGrid, SizeSelector
    cart/           # CartDrawer, CartPageClient
    checkout/       # CheckoutClient, WompiWidget
    auth/           # LoginForm, RegisterForm, AuthProvider
    catalog/        # Pagination, SortSelector, SizeFilter
    seo/            # JSON-LD structured data components
    ui/             # CartToast, Logo
  lib/              # API clients and utilities
  store/            # Zustand stores (auth, cart, ui, wishlist, recently-viewed)
  types/            # TypeScript interfaces (product, cart, order, auth, customer, review)
```

### Routing Notes

`next.config.ts` has ~20 permanent redirects mapping old WordPress URLs (`/shop/`, `/categoria-producto/`, `/my-account`) to the new route structure. All user-facing content is in Spanish.

### Styling

Brand palette defined as CSS custom properties and Tailwind theme tokens in `src/app/globals.css`. Primary color is rosa/pink (`#F89BBB`). Fonts: DM Serif Display (headings via Google Fonts), Century Gothic (body via system fonts).

### Environment Variables

Server-only: `WOOCOMMERCE_URL`, `WOOCOMMERCE_CONSUMER_KEY`, `WOOCOMMERCE_CONSUMER_SECRET`, `WOMPI_PRIVATE_KEY`, `WOMPI_INTEGRITY_SECRET`, `WOMPI_EVENTS_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`

Public: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_WOMPI_PUBLIC_KEY`

### Deployment

Hosted on Vercel. Images served from WordPress CDN (`i0.wp.com`, `www.rosapastell.com`).
