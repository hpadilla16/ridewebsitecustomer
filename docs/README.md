# Documentation Index

This folder is the operating memory for the standalone Ride Car Sharing website.

Use these files in this order when resuming work.

## Start here

1. [ARCHITECTURE.md](c:\Users\silve\.openclaw\workspace\RideFleetManagement-working-clean\ride-carsharing-website\docs\ARCHITECTURE.md)
2. [PROJECT_MEMORY.md](c:\Users\silve\.openclaw\workspace\RideFleetManagement-working-clean\ride-carsharing-website\docs\PROJECT_MEMORY.md)
3. [ENVIRONMENT.md](c:\Users\silve\.openclaw\workspace\RideFleetManagement-working-clean\ride-carsharing-website\docs\ENVIRONMENT.md)
4. [DEPLOYMENT.md](c:\Users\silve\.openclaw\workspace\RideFleetManagement-working-clean\ride-carsharing-website\docs\DEPLOYMENT.md)

## What each file is for

### `ARCHITECTURE.md`

Explains:

- folder structure
- why routes are split from implementation
- what belongs in this repo
- what should stay in the main Ride Fleet software

### `PROJECT_MEMORY.md`

Explains:

- project history
- decisions made so far
- relationship to the main Ride Fleet platform
- branding and rollout context

### `ENVIRONMENT.md`

Explains:

- env vars
- API base expectations
- local/beta/prod runtime assumptions

### `DEPLOYMENT.md`

Explains:

- beta deployment flow
- rollout strategy
- DNS and cutover notes

## Working rule

This website repo should remain:

- public-facing
- API-connected
- premium-storefront focused

It should not drift into:

- admin modules
- planner/ops tools
- internal tenant workflows
- mobile wrapper concerns

