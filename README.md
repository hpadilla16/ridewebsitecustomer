# Ride Car Sharing Website

Standalone public storefront for Ride Car Sharing.

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

## Local development

```bash
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_BASE` to the Ride Fleet backend that should power the storefront.
