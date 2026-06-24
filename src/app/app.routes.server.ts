import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * All routes use RenderMode.Server (SSR on each request) rather than Prerender:
 * the NASA key is only loaded into process.env at runtime (via dotenv in server.ts),
 * so build-time prerendering would have no key and NASA would return 403.
 * Server rendering also fits the live "daily images" nature of the data.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
