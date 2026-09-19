# Tribel — Frontend

Web client for **Tribel**, a multi-tenant hostel booking and property management platform. Guests discover properties and book beds; owners and admins manage tenants, properties, room templates, bookings, occupancy, payments, and invoices.

Built with Next.js 16 (App Router), React 19, TypeScript, TanStack Query, Tailwind CSS, and shadcn-style components on Radix UI.

Backend API: [Tribel-Backend](https://github.com/ValoraSheikh/Tribel-Backend)

---

## Table of contents

- [Architecture overview](#architecture-overview)
- [Tech stack](#tech-stack)
- [Repository structure](#repository-structure)
- [Routing](#routing)
- [Authentication and session](#authentication-and-session)
- [Authorization and route protection](#authorization-and-route-protection)
- [Data layer](#data-layer)
- [Feature modules](#feature-modules)
- [Key flows](#key-flows)
- [Forms and validation](#forms-and-validation)
- [Rendering and providers](#rendering-and-providers)
- [Error, loading, and empty states](#error-loading-and-empty-states)
- [Observability](#observability)
- [Styling](#styling)
- [Testing](#testing)
- [Deployment](#deployment)
- [Local development](#local-development)
- [Environment variables](#environment-variables)
- [Design decisions](#design-decisions)

---

## Architecture overview

```
┌────────────────────────────────────────────────────────────────┐
│                        Browser                                 │
│                                                                │
│   App Router pages (server components)                         │
│        │                                                       │
│        ├── server prefetch ──► dehydrated cache ──► hydration  │
│        │                                                       │
│        └── client components                                   │
│                │                                               │
│                ├── TanStack Query  (server state)              │
│                ├── React Hook Form + Zod  (forms)              │
│                ├── nuqs  (URL state)                           │
│                └── local state                                 │
└───────────────────────────┬────────────────────────────────────┘
                            │  credentialed requests (cookies)
                            ▼
                ┌────────────────────────┐
                │  Tribel backend API    │
                │  Express 5 on EC2      │
                └────────────────────────┘
```

The app is organized **by feature**, not by file type. Each feature under `src/features/` owns its API functions, query hooks, components, and types, so a change to bookings stays inside the booking feature instead of leaking across the codebase.

State is deliberately split by kind:

| State kind | Owner |
|---|---|
| Server data (properties, bookings, payments) | TanStack Query |
| Form inputs and validation | React Hook Form + Zod |
| Shareable view state (filters, pagination, tabs, date span) | URL via `nuqs` |
| Ephemeral component state | React `useState` |

---

## Tech stack

| Concern | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript strict mode |
| Server state | TanStack Query v5 |
| Forms and validation | React Hook Form + Zod |
| HTTP | Axios (separate client and server instances) |
| Styling | Tailwind CSS 4, shadcn-style components on Radix UI |
| URL state | `nuqs` |
| Charts | Recharts |
| Payments | Razorpay Checkout (script loaded on demand) |
| Maps | Google Maps (place search and reverse geocoding) |
| Uploads | Presigned S3 URLs via the backend |
| Notifications | Sonner |
| Telemetry | OpenTelemetry (browser + server instrumentation) |
| Analytics | Vercel Analytics |
| Testing | Jest + Testing Library, Playwright |
| Linting | ESLint with Next.js and React Compiler rules |

---

## Repository structure

```
tribel-frontend/
├── src/
│   ├── app/                      # App Router: route groups, layouts, providers
│   │   ├── layout.tsx            # Root layout: fonts, providers, toaster, analytics
│   │   ├── providers.tsx         # TanStack Query + Redux store + Nuqs adapters
│   │   ├── error.tsx             # Route-level error boundary
│   │   ├── global-error.tsx      # Root error boundary
│   │   ├── not-found.tsx         # 404 experience
│   │   ├── (public)/             # Public shell with navbar and footer
│   │   ├── (auth)/               # Login and logout redirects
│   │   ├── (dashboard)/          # Owner/admin area with sidebar
│   │   └── (super-admin)/        # Platform administration shell
│   ├── features/                 # Feature modules (see below)
│   ├── components/               # Shared UI: layout chrome, primitives, common
│   ├── lib/
│   │   ├── auth/                 # Session loading, guards, return-path safety
│   │   ├── axios/                # Client and server Axios instances
│   │   ├── query/                # Query client configuration
│   │   ├── pricing.ts            # Price preview calculation
│   │   ├── store/                # Redux store wiring
│   │   └── utils.ts              # Class-name and formatting helpers
│   ├── hooks/                    # Cross-feature hooks
│   ├── constants/                # Shared constants
│   ├── utils/                    # Small utilities
│   ├── toolkit/                  # Redux slice scaffolding
│   ├── proxy.ts                  # Request middleware for protected routes
│   ├── instrumentation.ts        # Server-side OpenTelemetry setup
│   └── instrumentation-client.ts # Browser-side OpenTelemetry setup
├── tests/                        # Playwright specs and auth setup
├── public/                       # Static assets
├── next.config.ts                # Redirects and remote image allowlist
├── jest.config.ts / jest.setup.ts
├── playwright.config.ts
└── components.json               # shadcn component registry configuration
```

---

## Routing

All routes live under `src/app` using route groups, which organize layouts without adding URL segments.

### Public — `(public)`

Wrapped in a layout with `Navbar` and `Footer`, marked `force-dynamic` because pages read cookies server-side.

| URL | Purpose |
|---|---|
| `/discover` | Property discovery with server prefetched listings |
| `/search` | Query-driven search with pagination |
| `/property/[propertyId]` | Property detail with gallery, amenities, map, and booking entry point |
| `/bookings/new` | Guest booking workflow |
| `/yourBookings` | Guest booking history and detail |
| `/profile` | Guest profile management |
| `/createTenant` | Host onboarding |

### Auth — `(auth)`

| URL | Purpose |
|---|---|
| `/login` | Builds the backend login URL with a validated return path and redirects |
| `/logout` | Redirects to the backend logout endpoint |

### Dashboard — `(dashboard)`

Owner and admin area, wrapped in a sidebar layout that calls `requireAuth()`.

| URL | Purpose |
|---|---|
| `/properties` | Property list |
| `/createProperty` | Property creation with map and image upload |
| `/properties/[propertyId]/manage` | Property management overview |
| `/properties/[propertyId]/edit` | Property editing |
| `/properties/[propertyId]/bookings` | Booking management with occupancy views |
| `/properties/[propertyId]/bookings/[bookingId]` | Booking detail with admin actions |
| `/properties/[propertyId]/roomtemplate/[roomTemplateId]` | Room template detail and room/bed inventory |
| `/tenant` | Tenant profile and settings |

### Super admin — `(super-admin)`

Platform administration shell guarded by `requireAuth()` and tenant resolution, with its own layout.

### Redirects

`next.config.ts` redirects `/` to `/discover` so the discovery experience is the product entry point.

---

## Authentication and session

Authentication is owned by the backend through Auth0. The frontend never talks to Auth0 directly — it delegates to the API and relies on the session cookie.

### Login

```
/ login?returnTo=…
   │
   ├── getSafeReturnPath() validates the target
   │       (rejects absolute URLs, protocol-relative paths, and traversal)
   │
   └── redirect to  ${API}/auth/login?returnTo=…
                          │
                          ├── Auth0 universal login
                          ├── backend /auth/bridge creates or loads the user
                          └── redirect back to the validated frontend path
```

`lib/auth/return-to.ts` centralizes this logic and is covered by unit tests, including open-redirect attempts.

### Session loading

`lib/auth/auth-utils.ts` exposes:

| Function | Behaviour |
|---|---|
| `getSession()` | Requests `GET /api/v1/user/profile` with the incoming cookie forwarded, returns the typed `SessionUser` or `null`, and is deduplicated per request with React `cache` |
| `requireAuth()` | Returns the session or redirects to login with a validated return path |
| `requireLogout()` | Redirects to the backend logout URL |

Because the browser holds an HTTP-only session cookie shared across origins, the frontend never stores tokens or secrets in client-accessible storage.

---

## Authorization and route protection

Protection is layered. Middleware is a convenience layer for redirect UX; the authoritative checks are server-side.

| Layer | File | Behaviour |
|---|---|---|
| Request middleware | `src/proxy.ts` | For a configured matcher of protected paths, verifies the session against the API and redirects unauthenticated visitors to login with the exact attempted path as the return path |
| Page and layout guards | `src/lib/auth/auth-utils.ts` | `requireAuth()` runs on every protected page and layout, so a direct URL visit is enforced even if middleware is bypassed |
| Tenant resolution | `src/lib/auth/require-tenant.ts` | Resolves the caller's tenant for dashboard and host flows |
| Backend authorization | Tribel backend | Roles (`Guest`, `Staff`, `Admin`, `Super_Admin`) and tenant scoping are enforced by the API and database, never by the UI |

The frontend treats roles as a display concern: it decides what to show, not what is allowed. Every protected endpoint re-checks authorization server-side.

---

## Data layer

### Query client

`lib/query/queryClient.ts` sets consistent defaults:

```ts
queries: {
  retry: 1,
  staleTime: 5 * 60 * 1000,
  refetchOnWindowFocus: true,
  placeholderData: keepPreviousData,   // no flicker when filters/pages change
}
mutations: {
  retry: 1,
}
```

`keepPreviousData` keeps lists stable while paginating or refetching, and a five-minute stale window keeps navigation instant without hammering the API.

### API clients

| Client | File | Use |
|---|---|---|
| `axiosClient` | `lib/axios/axios-client.ts` | Browser requests with `withCredentials: true`; normalizes backend error messages in a response interceptor |
| `createServerAxios()` | `lib/axios/axios-server.ts` | Server-side requests that forward the incoming cookie header, used for prefetching |

Each feature pairs an API module with server variants where prefetching is needed — for example `propertyApi` for the browser and `serverPropertyApi` for server components.

### Query keys and caching

Keys are hierarchical and scoped by resource and parameters (`["property", propertyId]`, `["bookings", "property", propertyId, filters]`), so invalidation can target exactly the affected data. Mutations commonly:

1. Apply an optimistic update with a rollback snapshot.
2. Call the API.
3. Invalidate the affected key families on success.
4. Restore the snapshot and surface an error toast on failure.

### Server prefetch and hydration

Protected and public pages prefetch data on the server, dehydrate the cache, and hydrate it on the client, so the first paint already has data and the client does not refetch what the server just fetched.

---

## Feature modules

Each module under `src/features/` follows the same shape: `api/` for HTTP functions and types, `hooks/` for query and mutation hooks, and `components/` for UI, often split into `public/` and `dashboard/` variants.

| Feature | Responsibility |
|---|---|
| `booking` | Booking creation, guest cancellation, date changes, admin approval and rejection, bed assignment, occupancy views, offline payment recording, refunds |
| `payment` | Razorpay order creation, checkout orchestration, signature verification, payment state handling |
| `invoice` | Invoice retrieval and download for guests and admins |
| `property` | Property CRUD, discovery, search, detail, geolocation, image galleries |
| `room-template` | Room template CRUD and the room/bed inventory behind each template |
| `tenant` | Host onboarding, tenant profile, settings, branding |
| `profile` | Guest profile and avatar management |
| `upload` | Presigned S3 upload hooks and drop-zone components |

---

## Key flows

### Booking and payment

`features/booking/components/public/booking-flow.tsx` orchestrates the guest flow:

1. Loads the property's booking data (room templates, availability, pricing inputs).
2. Validates guest details, date range, room selection, and payment mode with Zod.
3. Shows a live price preview computed with the same half-open date semantics the backend bills on.
4. Creates the booking with a generated `Idempotency-key`, so a retry cannot create a second booking.
5. For online payment, requests a Razorpay order, opens Checkout, and verifies the result server-side.
6. For offline payment, submits the request for admin confirmation.

Payment is modelled as an explicit state machine — `idle → creating-order → checkout-open → verifying → completed | failed` — so the UI can recover when a booking exists but payment did not complete, including retrying verification of an already-created order.

### Refunds

Refund UI distinguishes **captured**, **refunded**, and **refundable** amounts, and the recording modal is capped by what is actually refundable, matching the backend's captured-amount ceiling.

### Property and room management

Property forms cover address, geolocation with reverse geocoding, contact details, amenities, and images. Room templates carry occupancy and pricing, and generate the rooms and beds that the occupancy views render.

### Occupancy views

`features/booking/components/dashboard/` provides two complementary views:

- **Timeline** — a date-axis view of bookings per room, with adaptive column widths and a forced week view on small screens.
- **Theater** — a bed-grid view showing which beds are occupied across a date range.

Both are backed by the occupancy endpoint, filtered by room template, and open booking details in a sheet — a right sheet on desktop and a bottom sheet on mobile.

### Uploads

Images upload directly to S3 using presigned URLs obtained from the backend, so file bytes never pass through the API. Components show per-file progress and surface failures without blocking the surrounding form.

---

## Forms and validation

Every form uses React Hook Form with a Zod schema, so validation rules are declared once and reused for both client feedback and type inference.

| Form | Feature |
|---|---|
| Booking flow | `booking` |
| Property create/edit | `property` |
| Tenant create/edit | `tenant` |
| Profile edit | `profile` |
| Room template create/edit | `room-template` |
| Refund recording | `booking` |
| Bed assignment | `booking` |

Fields expose `aria-invalid`, inline error messages, disabled pending states, and upload progress, and submissions surface success or failure through Sonner toasts.

---

## Rendering and providers

The root layout in `src/app/layout.tsx` sets fonts, metadata, and the provider stack:

```
<html>
  <body>
    <Analytics />                    Vercel Analytics
    <TanstackProvider>               QueryClientProvider
      <StoreProvider>                Redux store
        <NuqsAdapter>                URL state adapter
          {children}
        </NuqsAdapter>
      </StoreProvider>
      <Toaster />                    Sonner
    </TanstackProvider>
  </body>
</html>
```

Server components are the default. Client components are used where interactivity requires them — query hooks, forms, dialogs, sheets, and dashboard visualisations — and the boundary is kept as low in the tree as possible so data fetching stays on the server.

---

## Error, loading, and empty states

- **Route-level skeletons** (`loading.tsx`) exist for discovery, property detail, bookings, dashboard lists, and profile, so navigation shows structure immediately instead of a blank screen.
- **Error boundaries** at the route and root level offer a retry action rather than a dead end.
- **A custom 404** keeps users inside the product with useful navigation.
- **Query states are explicit** — loading, error, empty, and populated are distinct UI states, and empty states explain the next action.
- **Mutations** disable their controls while pending and report failures with actionable messages.

---

## Observability

- `instrumentation.ts` initializes server-side OpenTelemetry when a collector endpoint is configured.
- `instrumentation-client.ts` initializes browser tracing under the same condition.
- Correlation identifiers flow through API requests, so a browser trace ties to the backend trace for the same request.
- Vercel Analytics provides page-level usage data in production.
- Telemetry is opt-in by configuration: with no endpoint set, instrumentation is skipped and local development is unaffected.

---

## Styling

Tailwind CSS 4 with CSS variables for theming, plus shadcn-style primitives built on Radix UI for dialogs, sheets, popovers, selects, tooltips, and menus. Component variants are managed with `class-variance-authority` and merged with `tailwind-merge` through the `cn` helper in `lib/utils.ts`.

Layouts are responsive by default: the dashboard sidebar collapses behind a sheet on mobile, booking detail swaps between a side sheet and a bottom sheet, and the occupancy timeline switches to a week view on narrow screens.

---

## Testing

### Jest and Testing Library

Unit tests cover logic that is easy to get wrong: return-path safety for login redirects (`lib/auth/__tests__/return-to.test.ts`) and the booking login dialog behaviour (`features/property/components/public/__tests__/`).

```bash
npm test
```

### Playwright

End-to-end specs under `tests/` cover authentication setup, the booking flow, and profile editing, with an auth setup project that establishes a signed-in storage state.

```bash
npx playwright test
```

### Checks

```bash
npm run lint        # ESLint, including React Compiler rules
npm run type-check  # TypeScript, no emit
npm run build       # Production build
```

---

## Deployment

Deployed on Vercel with `main` as the production branch. Build-time requirements:

- `NEXT_PUBLIC_*` variables must be present in the Vercel project environment.
- The backend must allow the deployed origin via CORS **with credentials**, because authentication depends on a cross-site session cookie.
- The backend must set the session cookie for the deployed domain in production.
- Remote images are restricted by an allowlist in `next.config.ts` (Google avatars, Unsplash, and the S3 bucket).

---

## Local development

### Prerequisites

Node.js 20+ and a running backend instance.

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Set NEXT_PUBLIC_API_BASE_URL to your backend

# 3. Start the dev server
npm run dev
```

The app runs on **port 3001** by default. Make sure the backend allows this origin in `CORS_ORIGIN` so the session cookie and credentialed requests work locally.

### Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Development server on port 3001 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript checks without emitting |
| `npm test` | Jest unit tests |

---

## Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the Tribel backend API |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay publishable key for Checkout |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key for place search and geocoding |
| `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` | Map style identifier |
| `NEXT_PUBLIC_S3_BUCKET_URL` | Public bucket URL used for image rendering |
| `NEXT_PUBLIC_OTEL_SERVICE_NAME` | Service name reported in browser telemetry |
| `NEXT_PUBLIC_OTEL_TRACES_ENDPOINT` | Browser OTLP traces endpoint |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Server-side OTLP endpoint |
| `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` | Server-side traces endpoint |
| `OTEL_SERVICE_NAME` | Server-side service name |

Only `NEXT_PUBLIC_*` values are exposed to the browser. No secrets belong in this project — the frontend holds no API keys other than publishable ones, because authentication and payment verification happen on the backend.

---

## Design decisions

| Decision | Rationale |
|---|---|
| Backend-mediated Auth0 | Keeping Auth0 on the API means one session authority, no token storage in the browser, and authorization decisions that the UI cannot influence. |
| Feature-based structure | Booking, property, and payment logic changes together; co-locating API, hooks, and components keeps related code in one place. |
| TanStack Query for server state | Caching, invalidation, optimistic updates, and hydration are handled by one tool instead of hand-rolled effects. |
| URL state with `nuqs` | Filters, pagination, tabs, and date spans are shareable and survive refresh, and the back button behaves correctly. |
| Server prefetch with hydration | The first paint contains real data, and the client does not repeat the request the server already made. |
| Explicit payment state machine | Payment can fail after a booking exists; modelling states explicitly makes recovery and retry visible instead of leaving users stuck. |
| Idempotency keys on booking creation | A retried or double-submitted request cannot create two bookings. |
| Half-open date semantics shared with the backend | The quoted price and the charged price cannot disagree about billable nights. |
| Presigned S3 uploads | Large files bypass the API, keeping request payloads small and uploads fast. |
| Explicit loading, error, and empty states | Users always know whether data is loading, failed, or genuinely absent. |
