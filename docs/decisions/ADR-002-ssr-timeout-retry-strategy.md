# ADR-002: SSR timeout + platform-aware retry strategy

- **Status:** Accepted
- **Date:** 2026-06-24

## Context

The NASA APOD API is unreliable under load. Measured behaviour:

- Healthy: `getApodByDate` ~0.25–1 s; `getApodList(12)` up to ~3.4 s.
- Degraded: frequent `503`s and responses taking **10–15 s**.

Angular server-side rendering aborts a route if the app does not stabilize within
**~9 s**, falling back to an empty client-rendered shell (no content, no SEO). An
HTTP call with no timeout can therefore blow the SSR budget, and a `retry` that
re-issues slow calls makes it worse.

## Decision

In [`src/app/infrastructure/services/nasa-apod.service.ts`](../../src/app/infrastructure/services/nasa-apod.service.ts),
bound every request and vary retries by platform:

```ts
const HTTP_TIMEOUT_MS = 5000;
const HTTP_RETRY_DELAY_MS = 500;
const SERVER_RETRY_COUNT = 0; // single bounded attempt → worst case 5 s ≪ 9 s budget
const CLIENT_RETRY_COUNT = 2; // no SSR budget on the client; retry for resilience

http.get<T>(url).pipe(
  timeout({ each: HTTP_TIMEOUT_MS }),
  retry({ count: isServer ? SERVER_RETRY_COUNT : CLIENT_RETRY_COUNT, delay: HTTP_RETRY_DELAY_MS }),
  tap((data) => { if (isServer) transferState.set(stateKey, data); }),
);
```

The 5 s timeout sits above healthy latency (~3.4 s) without false-tripping, while a single
server attempt keeps the worst case well under the 9 s budget.

## Consequences

- **Positive**
  - SSR always stabilizes (worst case ~5 s) — the empty client shell never ships.
  - Healthy NASA responses render full SSR content; outages render a graceful error state.
  - Self-healing: errors are not cached in TransferState, so the client re-fetches on
    hydration (with retries) and recovers once NASA responds.
- **Negative / trade-offs**
  - During a NASA outage, the SSR HTML shows the error state until the client recovers.
  - The 5 s timeout can cut off legitimately slow (>5 s) responses while NASA is degraded;
    raising it trades SSR latency for fewer errors during outages.
- **Related:** [ADR-001](./ADR-001-ssr-render-mode.md) (why rendering happens per request).
