# Ride Car Sharing Website

Standalone public storefront for Ride Car Sharing.

## Project goals

- public-facing booking storefront
- premium rental and car sharing website
- separate Git history from Ride Fleet ops/admin software
- connected to Ride Fleet only through public APIs

## What is inside

- public beta website routes
- rental and car sharing search connected to Ride Fleet public APIs
- guest-facing FAQ, contact, host onboarding, fleet, and privacy pages
- Ride brand assets for the premium storefront direction

## What is intentionally not inside

- admin dashboard
- planner
- ops modules
- internal tenant tools
- mobile wrappers

## Architecture snapshot

Current structure:

- `src/app`
  - route layer only
  - each route is intentionally thin
- `src/site`
  - real storefront page implementations
  - keeps marketing/product page logic grouped together
- `src/components`
  - shared public shell and reusable site UI
- `src/lib`
  - API client and public integration helpers
- `public/brand`
  - Ride logo, symbol, and hero/banner assets

This is intentional.

It keeps:

- App Router routes simple
- the actual storefront implementation centralized
- the public website separate from the Ride Fleet monorepo structure it came from

## Local development

```bash
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_BASE` to the Ride Fleet backend that should power the storefront.

## Documentation

Project docs now live under:

- [docs/README.md](c:\Users\silve\.openclaw\workspace\RideFleetManagement-working-clean\ride-carsharing-website\docs\README.md)

Most important docs:

- [docs/ARCHITECTURE.md](c:\Users\silve\.openclaw\workspace\RideFleetManagement-working-clean\ride-carsharing-website\docs\ARCHITECTURE.md)
- [docs/PROJECT_MEMORY.md](c:\Users\silve\.openclaw\workspace\RideFleetManagement-working-clean\ride-carsharing-website\docs\PROJECT_MEMORY.md)
- [docs/ENVIRONMENT.md](c:\Users\silve\.openclaw\workspace\RideFleetManagement-working-clean\ride-carsharing-website\docs\ENVIRONMENT.md)
- [docs/WORKFLOW.md](c:\Users\silve\.openclaw\workspace\RideFleetManagement-working-clean\ride-carsharing-website\docs\WORKFLOW.md)
- [docs/DEPLOYMENT.md](c:\Users\silve\.openclaw\workspace\RideFleetManagement-working-clean\ride-carsharing-website\docs\DEPLOYMENT.md)
