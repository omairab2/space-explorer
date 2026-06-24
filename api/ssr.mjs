// Vercel serverless entry for the Angular SSR app.
//
// A catch-all rewrite (see vercel.json) sends every non-static request here; the original
// request URL is preserved, so the Express app inside server.mjs routes it
// (/api/apod -> NASA proxy, everything else -> Angular SSR).
//
// The dynamic import is intentional: it keeps the already-bundled server.mjs as an included
// file (via functions.includeFiles) instead of letting Vercel re-bundle it, which would
// rewrite the `import.meta.dirname` that server.ts relies on.
export default async (req, res) => {
  const { reqHandler } = await import('../dist/space-explorer/server/server.mjs');
  return reqHandler(req, res);
};
