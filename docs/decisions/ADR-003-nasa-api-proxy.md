# ADR-003: Client-side NASA API calls routed through a server proxy

- **Status:** Accepted
- **Date:** 2026-06-24

## Context

`NASA_API_KEY` only exists in `process.env` on the **server** (loaded from `.env`, never
shipped to the client — see [ADR-001](./ADR-001-ssr-render-mode.md)). In the browser the
key resolves to `''`, so any client-side request hit NASA with an empty `api_key` and
received `403 Forbidden`.

This breaks as soon as the browser needs to fetch data, which it does on **SPA navigation**:
clicking a card routes client-side to `/detail/:date`, a route the server did not pre-render,
so its data is not in `TransferState` and the component must fetch it from the client.

## Decision

Add a same-origin proxy and select the URL by platform.

- **Server** — `src/server.ts` exposes `GET /api/apod`, which injects the key from
  `process.env` and forwards the request to NASA:

  ```ts
  app.get('/api/apod', async (req, res) => {
    const params = new URLSearchParams({ api_key: process.env['NASA_API_KEY'] ?? '', thumbs: 'true' });
    // ...forward count/date, fetch NASA, return JSON
  });
  ```

- **Service** — `NasaApodService.buildUrl()` uses `isPlatformServer()` to pick the target:
  NASA directly (with the key) during SSR, or the same-origin `/api/apod` proxy in the browser.

  ```ts
  return isPlatformServer(this.platformId)
    ? `${NASA_APOD_URL}?${params}` // + api_key, server only
    : `${APOD_PROXY_URL}?${params}`; // browser → proxy injects the key
  ```

## Consequences

- **Positive**
  - The API key never appears in the client bundle or in client→server traffic.
  - Client-side SPA navigation to detail pages works (no more `403`).
  - Self-healing: after an SSR error (NASA outage) the client re-fetches through the proxy
    on hydration and recovers — this is only possible because the proxy supplies the key.
- **Negative / trade-offs**
  - One extra hop for browser requests (browser → our server → NASA).
  - A new server route to maintain and deploy (the deployment must run our `server.mjs`, not
    a default Angular handler — see `vercel.json` / `api/index.mjs`).
- **Related:** [ADR-002](./ADR-002-ssr-timeout-retry-strategy.md) (timeout + retry strategy
  that the proxied client requests also benefit from).
