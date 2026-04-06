# Ride Car Sharing Website Project Memory

## Purpose

This file is the running memory for the standalone public website project.

It captures:

- what this website is
- how it connects to the main Ride Fleet software
- what has already been built in the main software
- what has already been extracted into this repo
- important decisions, naming, and deployment notes

Use this as the first orientation file before continuing work on the storefront.

## Repositories

### 1. Main operations software

Local source project:

- `c:\Users\silve\.openclaw\workspace\RideFleetManagement-working-clean`

This is the full Ride Fleet operational platform.

It contains:

- reservations
- planner
- payments
- customer portal
- inspections
- host workflows
- employee workflows
- admin/tenant/settings modules
- mobile wrapper work

### 2. Standalone public website

Local website project:

- `c:\Users\silve\.openclaw\workspace\RideFleetManagement-working-clean\ride-carsharing-website`

GitHub repo:

- `https://github.com/hpadilla16/ridewebsitecustomer`

This repo is meant to become the public-facing website for:

- normal rentals
- car sharing
- host acquisition / become-a-host
- guest-facing marketing pages

This repo should stay clean and **not** absorb the full ops/admin app.

## Core Product Decision

The public website is now a separate project from the Ride Fleet ops platform.

Reason:

- keep the public website cleaner
- avoid mixing public marketing/storefront work with ops/admin code
- allow a more focused Git history and deployment path
- make `beta.ride-carsharing.com` easier to ship without dragging internal modules along

## Source Of Truth

The public website is a frontend-only storefront.

The backend source of truth remains the main Ride Fleet software and its public APIs.

This website should keep using the Ride Fleet API for:

- booking bootstrap
- rental search
- car sharing search
- unified checkout handoff
- host signup
- customer-facing booking flow support

Environment variable used here:

- `NEXT_PUBLIC_API_BASE`

Expected value in most hosted environments:

- `https://ridefleetmanager.com`

## What Was Already Completed In The Main Ride Fleet Software

These items matter because the website depends on them and should respect them.

### Payments / customer portal

Working in main software:

- Authorize.Net hosted payments
- webhook validation and payment posting
- View Payments reconciliation
- Save Card On File
- Authorize Hold
- Release Hold

Important architectural point:

- the public website should not collect raw card data directly
- card entry and hosted payment handling should remain Authorize.Net / portal driven

### Reservation / operations improvements

Working in main software:

- planner grouped by vehicle type
- planner shows vehicle type and license plate
- planner auto-accommodate / move-to-unassigned / overbooking logic
- vehicle assignment and swap workflow
- swap captures check-in / check-out and inspection history
- tenant timezone setting for reservation-facing date/time consistency

### Policy / disclosures

Already updated in main software:

- privacy policy language for hosted card handling
- explanation that Ride Fleet stores gateway profile/token references, not full card numbers/CVV

## What Was Extracted Into This Website Repo

The new standalone repo includes:

- premium public shell
- homepage
- rental search/results/detail
- car sharing search/results/detail
- checkout handoff page
- fleet page
- FAQ page
- contact page
- become-a-host page
- privacy page
- Ride brand assets

Key route set:

- `/`
- `/rent`
- `/rent/[vehicleTypeId]`
- `/car-sharing`
- `/car-sharing/[listingId]`
- `/checkout`
- `/fleet`
- `/faq`
- `/contact`
- `/become-a-host`
- `/privacy`

## Branding / Visual Direction

The website styling direction was intentionally pushed toward:

- premium mobility
- airport-friendly hospitality
- cleaner trust-first booking UX
- modern, animated, launch-ready storefront

Reference direction used during design work:

- `https://carento-nextjs.vercel.app/?storefront=envato-elements`

But the site should keep Ride's own identity:

- Ride logo
- Ride symbol
- Ride banner / hero assets
- purple / indigo / blue glow language already established by brand and product theme

Local brand assets currently used:

- `public/brand/ride-banner-facebook-cover.jpg`
- `public/brand/ride-logo-white-horizontal.png`
- `public/brand/ride-symbol.png`

## Main Files In This Repo

### App entry and layout

- `src/app/layout.js`
- `src/app/page.js`
- `src/app/globals.css`

### Public shell

- `src/components/PublicSiteShell.jsx`
- `src/components/PublicSiteShell.module.css`

### Shared site helpers and premium styling

- `src/site/sitePreviewShared.js`
- `src/site/sitePreviewPremium.module.css`

### Main storefront pages

- `src/site/page.js`
- `src/site/rent/page.js`
- `src/site/rent/[vehicleTypeId]/page.js`
- `src/site/car-sharing/page.js`
- `src/site/car-sharing/[listingId]/page.js`
- `src/site/checkout/page.js`
- `src/site/fleet/page.js`
- `src/site/faq/page.js`
- `src/site/contact/page.js`

### Additional guest-facing pages

- `src/app/become-a-host/page.js`
- `src/app/privacy/page.js`

### API client

- `src/lib/client.js`

## Important Routing Decision

Inside this standalone repo, the public routes are now root routes.

This means we are no longer depending on:

- `/site-preview`
- `/beta`

for the real product structure.

Those preview structures existed in the original monorepo during design exploration.

The standalone website repo should move forward with clean root routes.

## Checkout / Booking Philosophy

The website should:

- market clearly
- search clearly
- present vehicle/listing detail clearly
- hand off into a trusted booking flow cleanly

It should **not** try to reproduce the entire ops workflow inside the public website.

The public website is the premium storefront.
Ride Fleet remains the operational engine.

## Deployment Intent

Short-term intent:

- use this repo for `beta.ride-carsharing.com`

Longer-term intent:

- potentially replace the current WordPress / GoDaddy public site

Recommended rollout path:

1. Deploy this repo to a beta environment
2. Validate search, pricing, checkout handoff, and guest flows
3. Validate hosted payment/portal continuity
4. Validate host onboarding messaging and lead capture
5. Move production domain only after end-to-end testing is stable

## Commands

### Local dev

```bash
npm run dev
```

### Production build check

```bash
npm run build
npm run start
```

## Git Notes

This repo was initialized as its own independent Git repository.

Initial standalone commit:

- `19647b0` `Initial standalone Ride Car Sharing storefront`

Remote:

- `origin -> https://github.com/hpadilla16/ridewebsitecustomer.git`

## Known Reality / Constraints

- This website still depends on the Ride Fleet public API
- final checkout behavior should continue to respect hosted payments and portal handoff
- host onboarding still depends on backend support in the main Ride Fleet platform
- some public text may still need final copy polish before launch
- deployment setup for `beta.ride-carsharing.com` is still pending

## Near-Term Next Steps

Recommended next work items:

1. finalize copy across homepage, FAQ, contact, and host pages
2. validate every public API call against production/staging backend
3. prepare deployment target for `beta.ride-carsharing.com`
4. add environment/deployment docs
5. decide final launch analytics / forms / support channels
6. prepare production DNS cutover checklist

## Working Principle

Whenever continuing work in this repo:

- keep it public-site focused
- do not pull in admin or ops UI unless absolutely necessary
- prefer API integration over copying operational logic
- keep visual quality high and launch-ready
- preserve Ride Fleet as the backend source of truth

