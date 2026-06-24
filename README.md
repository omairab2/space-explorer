# 🚀 Space Explorer

A server-rendered gallery for NASA's **Astronomy Picture of the Day (APOD)**. Built as a
portfolio project to showcase modern Angular: native SSR, Signals, standalone components,
and a clean layered architecture.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://space-explorer.vercel.app)
![Angular](https://img.shields.io/badge/Angular-22-dd0031?logo=angular&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?logo=tailwindcss&logoColor=white)
![SSR](https://img.shields.io/badge/SSR-@angular%2Fssr-b52e31)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript&logoColor=white)

## ✨ Features

- **Server-Side Rendering** — every route renders on the server ([ADR-001](docs/decisions/ADR-001-ssr-render-mode.md)) with `TransferState` to avoid a double fetch on the client.
- **Signals** — reactive state via `toSignal()` / `computed()`; no manual subscriptions.
- **Clean Architecture** — strict separation across four layers (see below).
- **SEO meta tags** — title and description are set server-side per page for crawlers.
- **Resilient data layer** — per-request timeout and platform-aware retry keep SSR within budget and degrade gracefully during NASA outages ([ADR-002](docs/decisions/ADR-002-ssr-timeout-retry-strategy.md)).

## 🏗️ Architecture

```
src/app/
├── core/             # Domain models & interfaces (e.g. Apod)
├── infrastructure/   # Services & HTTP (NasaApodService)
├── presentation/     # Pages & components (home, detail, apod-card, skeleton)
└── shared/           # Cross-cutting utils, pipes, shared UI
```

| Layer            | Responsibility                                              | Depends on        |
| ---------------- | ----------------------------------------------------------- | ----------------- |
| `core`           | Framework-agnostic types and contracts                      | nothing           |
| `infrastructure` | Talking to the outside world (NASA APOD over HTTP)          | `core`            |
| `presentation`   | Routed pages and UI components                              | `core`, `infra`   |
| `shared`         | Reusable helpers used across layers                         | `core`            |

### API key & proxy

The NASA API key lives **only on the server** and never reaches the client bundle:

- **SSR (server):** `NasaApodService` calls NASA directly with the key from `process.env`.
- **Browser:** the service calls the same-origin proxy `GET /api/apod` (in `src/server.ts`), which injects the key server-side.

This keeps the key secret while still allowing client-side SPA navigation to detail pages. See [ADR-003](docs/decisions/ADR-003-nasa-api-proxy.md).

## 🛠️ Getting Started

### Prerequisites

- **Node.js** 20+
- **pnpm** ([install](https://pnpm.io/installation))
- A free **NASA API key** — get one at [api.nasa.gov](https://api.nasa.gov)

### Setup

```bash
# 1. Clone
git clone <repository-url>
cd space-explorer

# 2. Install dependencies
pnpm install

# 3. Add your NASA API key for local dev (.env is gitignored)
#    On Vercel, set NASA_API_KEY as an environment variable instead (see Deployment).
echo "NASA_API_KEY=your_key_here" > .env

# 4. Start the SSR dev server → http://localhost:4200
pnpm start
```

### Scripts

| Command                              | Description                          |
| ------------------------------------ | ------------------------------------ |
| `pnpm start`                         | SSR dev server (`http://localhost:4200`) |
| `pnpm build`                         | Production build (browser + server)  |
| `pnpm run serve:ssr:space-explorer`  | Run the built SSR server             |
| `pnpm test`                          | Unit tests (Vitest)                  |

## ☁️ Deployment (Vercel)

This is a server-rendered app — it deploys as a **Node serverless function**, not a static
site. [`vercel.json`](vercel.json) and [`api/index.mjs`](api/index.mjs) route all traffic
through the compiled SSR server (`dist/space-explorer/server/server.mjs`).

1. Import the repository into Vercel.
2. In **Project Settings → Environment Variables**, set:
   - **`NASA_API_KEY`** — your NASA key. The `.env` file is gitignored and **not** deployed, so the proxy needs it configured here.
   - **`NG_ALLOWED_HOSTS`** — your deployment hostname(s), comma-separated and **without port** (e.g. `space-explorer.vercel.app`). Angular SSR validates the `Host` header to prevent SSRF; without this, every SSR route returns `400 Bad Request`.
3. Deploy. Vercel runs `pnpm build` and serves every route through the Angular SSR handler.

## 📐 Architecture Decision Records

- [ADR-001 — Use `RenderMode.Server` instead of `RenderMode.Prerender`](docs/decisions/ADR-001-ssr-render-mode.md)
- [ADR-002 — SSR timeout + platform-aware retry strategy](docs/decisions/ADR-002-ssr-timeout-retry-strategy.md)
- [ADR-003 — Client-side NASA API calls routed through a server proxy](docs/decisions/ADR-003-nasa-api-proxy.md)

## 📸 Screenshots

<!-- TODO: replace placeholders with real screenshots -->

| Home (gallery)        | Detail (APOD)          |
| --------------------- | ---------------------- |
| _screenshot coming soon_ | _screenshot coming soon_ |

## 📄 License

MIT
