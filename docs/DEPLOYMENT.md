# Deployment Guide

## Goal

This project is intended to become the standalone public storefront for Ride Car Sharing.

Initial deployment target:

- `beta.ride-carsharing.com`

Future possible production target:

- `ride-carsharing.com`

## Recommended Rollout Path

### Phase 1. Local validation

Validate locally:

- homepage
- rental lane
- car sharing lane
- detail pages
- checkout handoff page
- contact / faq / become-a-host / privacy

Commands:

```bash
npm install
npm run build
npm run start
```

### Phase 2. Beta deployment

Deploy this repo to a standalone hosting target.

Good fits:

- Vercel
- Netlify
- other Node/Next-compatible hosting

Recommended environment variable:

```env
NEXT_PUBLIC_API_BASE=https://ridefleetmanager.com
```

Target domain:

- `beta.ride-carsharing.com`

### Phase 3. Beta validation

Validate all guest-facing flows:

1. homepage and navigation
2. rental search
3. car sharing search
4. rental detail pages
5. car sharing detail pages
6. checkout handoff
7. contact / faq / become-a-host
8. privacy page

Also validate:

- mobile responsiveness
- browser compatibility
- public API latency and reliability

### Phase 4. Operational verification

Before production cutover, confirm the main Ride Fleet backend still correctly handles:

- public booking bootstrap
- search responses
- reservation creation / booking flow handoff
- hosted payments
- customer portal continuity
- host onboarding

### Phase 5. Production cutover

Only after beta is stable:

1. lower DNS TTL
2. update domain records
3. switch `ride-carsharing.com` to the new storefront
4. monitor traffic, booking flow, and support issues

## Hosting Notes

### If using Vercel

Typical process:

1. import GitHub repo
2. set framework to Next.js
3. set env var:
   - `NEXT_PUBLIC_API_BASE`
4. deploy preview
5. attach `beta.ride-carsharing.com`

### If using another host

Requirements:

- Next.js app support
- environment variable support
- static asset support
- HTTPS

## DNS Notes

For `beta.ride-carsharing.com`, you will likely need either:

- `CNAME` to your hosting provider
- or provider-specific DNS records

Do not repoint the main production domain until beta validation is complete.

## What To Test Before Beta Goes Public

### Navigation / marketing

- homepage loads correctly
- all header/footer links work
- FAQ and Contact pages feel final-facing
- host page works and is understandable

### Booking flows

- rental search returns results
- car sharing search returns results
- detail pages load for real inventory/listings
- checkout handoff carries expected parameters

### Backend compatibility

- `bootstrap` returns expected locations/vehicle types/listings
- API shapes match current frontend assumptions
- no CORS or auth issues on public endpoints

### Branding

- logos render correctly
- hero/banner images load correctly
- no broken paths under `public/brand`

## Suggested Deployment Checklist

1. `npm install`
2. `npm run build`
3. push latest code to GitHub
4. connect host to repo
5. set `NEXT_PUBLIC_API_BASE`
6. deploy preview
7. connect `beta.ride-carsharing.com`
8. validate all guest journeys
9. keep main WordPress/live site untouched during beta
10. prepare production cutover separately

## GitHub Repo

Current remote target:

- `https://github.com/hpadilla16/ridewebsitecustomer`

## Initial Git State

Initial standalone commit:

- `19647b0` `Initial standalone Ride Car Sharing storefront`

## Recommended Next Deployment Tasks

1. create the first push to GitHub if not already completed
2. connect the repo to a hosting provider
3. set `NEXT_PUBLIC_API_BASE`
4. publish to `beta.ride-carsharing.com`
5. run a structured QA checklist

