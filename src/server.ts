// Must be the FIRST import: loads the gitignored .env into process.env
// before any other module is evaluated, so the NASA key is available during SSR.
import 'dotenv/config';

import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const NASA_APOD_URL = 'https://api.nasa.gov/planetary/apod';
const NASA_PROXY_TIMEOUT_MS = 8000;
const FORWARDED_QUERY_PARAMS = ['count', 'date'] as const;

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Same-origin proxy for the NASA APOD API. The API key lives only on the server
 * (process.env from .env), so the browser calls this endpoint instead of NASA directly —
 * the key is never shipped to the client. See docs/decisions/ADR-003.
 */
app.get('/api/apod', async (req, res) => {
  const params = new URLSearchParams({
    api_key: process.env['NASA_API_KEY'] ?? '',
    thumbs: 'true',
  });
  for (const name of FORWARDED_QUERY_PARAMS) {
    const value = req.query[name];
    if (typeof value === 'string') {
      params.set(name, value);
    }
  }

  try {
    const upstream = await fetch(`${NASA_APOD_URL}?${params.toString()}`, {
      signal: AbortSignal.timeout(NASA_PROXY_TIMEOUT_MS),
    });
    res.status(upstream.status).type('application/json').send(await upstream.text());
  } catch {
    res.status(502).json({ error: 'Upstream NASA request failed' });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
