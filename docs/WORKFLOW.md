# Workflow Guide

## Purpose

This file is the quick operating guide for switching between the two Ride projects without mixing work or losing context.

## Project Split

### Main project

Use this when working on the operational Ride Fleet software:

- reservations
- payments
- planner
- inspections
- tenant settings
- employee/admin tooling

Local path:

- `c:\Users\silve\.openclaw\workspace\RideFleetManagement-working-clean`

### Website repo

Use this when working on the public storefront:

- homepage
- rentals
- car sharing
- checkout handoff
- FAQ / Contact / Become a Host / Privacy
- brand presentation and public UX

Local path:

- `c:\Users\silve\.openclaw\workspace\RideFleetManagement-working-clean\ride-carsharing-website`

## Working Rule

When resuming work, explicitly decide which one you are in:

- `main project`
- `website repo`

Do not mix commits or assumptions across them.

## Recommended Local Preview Workflow

For larger storefront styling changes, use a clean production-like preview instead of relying only on `next dev`.

### Stable preview routine

From the website repo:

```powershell
if (Test-Path .next) {
  Remove-Item .next -Recurse -Force
}

cmd /c npm run build
npx next start -p 3001
```

Then open:

- `http://127.0.0.1:3001`

This is the most reliable way to review large visual changes.

### Standard dev mode

```bash
npm run dev
```

Then open:

- `http://127.0.0.1:3000`

Use this for faster iteration, but prefer the stable preview routine when visual chunks or stale CSS become unreliable.

## Suggested Session Start Order

When coming back to the website repo:

1. open `docs/ARCHITECTURE.md`
2. open `docs/PROJECT_MEMORY.md`
3. open `docs/ENVIRONMENT.md`
4. use this file for the local preview workflow

## Suggested Session End Order

Before stopping work:

1. make sure the repo still builds
2. update docs if architecture or workflow changed
3. keep public-site changes in this repo only
4. keep ops/backend changes in the main Ride Fleet repo only

## Goal

This workflow exists to keep:

- cleaner Git history
- cleaner deployments
- safer context switching
- less confusion between storefront work and operational software
