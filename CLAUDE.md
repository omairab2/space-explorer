# Space Explorer — CLAUDE.md

## Project Overview
Angular 22 SSR-native portfolio project using NASA's public API (APOD).
Built to demonstrate SSR, Signals, and modern Angular standalone components.

## Stack
- Angular 22 (standalone components, no NgModules)
- SSR nativo (@angular/ssr)
- Signals para reactividad
- TailwindCSS v4 (config CSS-first, sin tailwind.config.js)
- NASA APOD API (https://api.nasa.gov)
- pnpm como gestor de paquetes

## Architecture
Clean layered structure:
- core/ → models/interfaces
- infrastructure/ → services (HTTP)
- presentation/ → pages + components
- shared/ → pipes, utils, UI components

## Key Conventions
- Standalone components always (no NgModules)
- Signals over RxJS where possible
- inject() over constructor injection
- async pipe or toSignal() for observables
- SSR-safe: no direct window/document access without isPlatformBrowser()

## SSR Rules
- All data fetching in components must work server-side
- Use TransferState to avoid double fetch (server + client)
- Meta tags must be set server-side for SEO

## Environment
- NASA API key en `.env` (gitignored), leída server-side en SSR (process.env)
- Nunca hardcodear la key ni exponerla en el bundle del cliente

## Commands
- Dev: pnpm start (ng serve — SSR automático)
- Build: pnpm build
- SSR run: pnpm run serve:ssr:space-explorer
- Test: pnpm test

## File naming
- Components: kebab-case (e.g. apod-card.component.ts)
- Services: kebab-case (e.g. nasa-apod.service.ts)
- Models: kebab-case (e.g. apod.model.ts)
