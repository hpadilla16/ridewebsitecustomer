# Environment Guide

## Purpose

This document explains the environment variables and runtime assumptions for the standalone Ride Car Sharing website.

## Primary Runtime Model

This website is a Next.js public storefront that depends on the Ride Fleet backend APIs.

It does **not** own the operational data model.

It consumes:

- public booking bootstrap
- rental search
- car sharing search
- host signup
- unified checkout handoff data

## Required Environment Variable

### `NEXT_PUBLIC_API_BASE`

This is the base URL for the Ride Fleet backend that powers the storefront.

Examples:

- Local/staging:
  - `http://localhost:4000`
- Production-style:
  - `https://ridefleetmanager.com`

### Example `.env.local`

```env
NEXT_PUBLIC_API_BASE=https://ridefleetmanager.com
```

## Recommended Public URL Variable

### `NEXT_PUBLIC_SITE_URL`

This is used for metadata and absolute canonical/Open Graph URLs.

Examples:

- Local preview:
  - `http://127.0.0.1:3001`
- Beta:
  - `https://beta.ride-carsharing.com`
- Production:
  - `https://ride-carsharing.com`

Example:

```env
NEXT_PUBLIC_SITE_URL=https://beta.ride-carsharing.com
```

## How The Website Uses `NEXT_PUBLIC_API_BASE`

The client logic is in:

- `src/lib/client.js`

Behavior:

- on browser environments, if the configured host mismatches the current host in certain ways, the client may fall back to `window.location.origin`
- on server/build contexts, it uses the configured value or `http://localhost:4000`

This means production deployments should set `NEXT_PUBLIC_API_BASE` correctly and consistently.

## Environments We Expect

### Local development

Use when iterating on UI and integration:

```env
NEXT_PUBLIC_API_BASE=http://localhost:4000
```

or

```env
NEXT_PUBLIC_API_BASE=https://ridefleetmanager.com
```

depending on whether you are pointing at local backend or remote backend.

### Beta deployment

Target example:

- `beta.ride-carsharing.com`

Recommended:

```env
NEXT_PUBLIC_API_BASE=https://ridefleetmanager.com
```

unless you maintain a separate staging backend.

### Production deployment

Target example:

- `ride-carsharing.com`

Recommended:

```env
NEXT_PUBLIC_API_BASE=https://ridefleetmanager.com
```

## Important Backend Dependencies

The website assumes the Ride Fleet backend already supports:

- `/api/public/booking/bootstrap`
- `/api/public/booking/rental-search`
- `/api/public/booking/car-sharing-search`
- `/api/public/booking/host-signup`

If any of those change, update:

- `src/lib/client.js`
- relevant page logic in `src/site/*`

## Payments / Checkout Assumptions

The website should continue to respect the architecture already proven in the main Ride Fleet system:

- hosted payments through Authorize.Net
- customer portal / payment handoff
- saved cards / deposit workflows living in the ops system, not in this storefront directly

This website should avoid adding direct raw card handling.

## Host Onboarding Assumptions

The `Become a Host` page depends on:

- public bootstrap data
- host signup backend logic

If backend host onboarding changes, the page at:

- `src/app/become-a-host/page.js`

must be updated accordingly.

## Local Run Commands

### Development

```bash
npm run dev
```

### Production-like local preview

```bash
npm run build
npm run start
```

## Troubleshooting

### If the site loads but no results appear

Check:

- `NEXT_PUBLIC_API_BASE`
- backend availability
- browser network calls to `/api/public/booking/*`

### If images or UI styling look broken

Check:

- local build freshness
- whether `.next` should be cleared before rebuild
- whether static asset paths under `public/brand` are intact

### If booking/search behavior changes unexpectedly

Check:

- main Ride Fleet backend public APIs
- API payload shapes
- tenant/bootstrap configuration in the backend
