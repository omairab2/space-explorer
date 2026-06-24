# ADR-001: Use `RenderMode.Server` instead of `RenderMode.Prerender`

- **Status:** Accepted
- **Date:** 2026-06-24

## Context

The app fetches data from the NASA APOD API, which requires an API key. The key is
provided at **runtime** through `process.env.NASA_API_KEY` (loaded from a gitignored
`.env` via `dotenv` in `src/server.ts`).

Angular's default `RenderMode.Prerender` renders routes at **build time**, in a separate
process that never executes `src/server.ts` — so `process.env.NASA_API_KEY` is empty
there and NASA responds `403`. Prerendering would bake an error page into the static
output. The content is also live ("daily" astronomy images, plus random selections), so
freezing it at build time is semantically wrong.

## Decision

Configure every route with `RenderMode.Server` in
[`src/app/app.routes.server.ts`](../../src/app/app.routes.server.ts):

```ts
export const serverRoutes: ServerRoute[] = [
  { path: '**', renderMode: RenderMode.Server },
];
```

## Consequences

- **Positive**
  - The API key is available at request time, so SSR fetches succeed.
  - Each request renders fresh data — appropriate for live APOD content.
  - The key stays server-side; it is never shipped in the client bundle.
  - Full SSR HTML (content + SEO meta tags) is produced on every request.
- **Negative / trade-offs**
  - No static prerendered output; a Node server is required to serve the app.
  - Slightly higher per-request cost than serving static HTML.
- **Related:** [ADR-002](./ADR-002-ssr-timeout-retry-strategy.md) bounds the per-request
  render time so server rendering stays within Angular's stabilization budget.
