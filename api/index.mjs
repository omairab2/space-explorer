// Vercel serverless entry point for the Angular SSR app.
// Delegates every request to our compiled Node server bundle, which includes the
// Express app with the /api/apod proxy and dotenv (see src/server.ts).
export default async (req, res) => {
  const { reqHandler } = await import('../dist/space-explorer/server/server.mjs');
  return reqHandler(req, res);
};
