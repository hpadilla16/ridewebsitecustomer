# Architecture Guide

## Summary

The current architecture is good for this project.

It is intentionally split into:

- route files in `src/app`
- implementation files in `src/site`
- shared shell and UI in `src/components`
- API integration in `src/lib`
- brand assets in `public/brand`

This is a solid structure for a standalone public storefront.

## Why this architecture works

### 1. `src/app` stays thin

`src/app` should mostly define the public URLs and Next.js route entry points.

That means:

- easier routing changes
- cleaner App Router usage
- less clutter in route files

Examples:

- `src/app/page.js`
- `src/app/rent/page.js`
- `src/app/car-sharing/page.js`

These route files intentionally delegate to implementation files in `src/site`.

### 2. `src/site` keeps the storefront logic together

This is where the real public website behavior lives:

- homepage
- rental search/results/detail
- car sharing search/results/detail
- unified checkout page
- FAQ
- contact
- fleet

Benefits:

- the marketing/product experience is grouped together
- easier to redesign the storefront without touching route structure
- easier to move or reuse route wiring later

### 3. `src/components` contains shared public UI

This is where shared website UI belongs:

- header
- footer
- public shell
- future shared marketing sections if extracted later

Right now the main shared shell is:

- `src/components/PublicSiteShell.jsx`

### 4. `src/lib` isolates backend integration

The API client belongs in:

- `src/lib/client.js`

That is good because:

- backend integration is centralized
- changing API base behavior is easier
- public pages do not each reinvent fetch logic

### 5. `public/brand` keeps branding explicit

This is the right place for:

- logo
- mark/symbol
- banner and hero imagery

This keeps branding separate from code and easy to replace later.

### 6. `src/site/siteConfig.js` keeps public metadata centralized

Use `src/site/siteConfig.js` for:

- public site name
- canonical/public URL
- Open Graph image
- metadata defaults

This prevents SEO and social metadata from being scattered through route files.

## Current route map

### Public routes

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

## Current data flow

The website is not the operational source of truth.

Flow:

1. Website calls Ride Fleet public APIs
2. Ride Fleet backend resolves pricing, availability, and booking context
3. Website presents curated storefront experience
4. Website hands off into booking/checkout flow
5. Main Ride Fleet software remains the operational engine

This is the correct split.

## What should stay in this repo

Keep here:

- public marketing pages
- public search and browse flows
- public detail pages
- host acquisition / onboarding page
- public FAQ/contact/privacy content
- premium frontend styling and brand assets
- public API integration

## What should not move into this repo

Do not move here unless there is a very strong reason:

- admin dashboard
- planner
- payments backoffice
- inspections backoffice
- reservation operations UI
- employee tools
- tenant settings UI
- mobile app wrapper logic

That belongs in the main Ride Fleet application.

## Optimization assessment

### What is already optimal

- separate repo for the public site
- minimal dependencies
- root public routes
- public shell extracted into shared component
- API logic centralized
- public storefront implementation grouped under `src/site`

### What could be improved later, but is not urgent

- introduce import aliases like `@/components`, `@/site`, `@/lib`
- extract repeated section blocks from `src/site/page.js` into reusable marketing components
- add a dedicated `src/content` folder if copy volume grows
- add a lightweight CMS or structured JSON content layer if marketing updates become frequent

These are improvements, not blockers.

## Advanced storefront standards

As this project matures, keep these standards in place:

### Accessibility

- route shell should include a skip link
- navigation should expose active state semantically
- focus states must remain visible
- motion should respect `prefers-reduced-motion`

### Metadata and SEO

- root layout should own canonical metadata
- Open Graph and Twitter metadata should use the real site URL
- homepage should expose structured data for search engines and link previews

### Performance

- keep large decorative sections isolated and lazy-rendered where appropriate
- prefer static brand assets under `public/brand`
- avoid importing internal ops CSS or runtime dependencies into this repo

### Repo discipline

- keep public-site docs current when architecture changes
- preserve the split between the website repo and the main Ride Fleet project

## Recommended development rules

### Rule 1. Keep routes small

Use `src/app` as route wrappers, not as giant implementation files.

### Rule 2. Keep public API calls centralized

Do not scatter fetch behavior everywhere if the same client can do the work.

### Rule 3. Keep marketing and ops separated

If a feature feels like internal operations, it likely belongs in the main Ride Fleet software, not here.

### Rule 4. Favor design quality without operational duplication

This repo should feel premium and polished, but not recreate operational state machines already owned by Ride Fleet.

## Best way to continue building

When adding new work:

1. add the route in `src/app` if needed
2. add the implementation in `src/site`
3. extract shared UI to `src/components` if reused
4. keep API integration in `src/lib`
5. update docs if the structure changes

## Final Recommendation

Do not do a major structural refactor right now.

The current architecture is already strong enough for:

- beta deployment
- continued polish
- API integration work
- launch preparation

The best move is to keep this structure and continue building on top of it with discipline.
