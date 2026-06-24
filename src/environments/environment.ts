/**
 * Application environment configuration.
 *
 * IMPORTANT: Angular's native builder does NOT support Vite's `import.meta.env`.
 * The NASA key is read from Node's `process.env` at request time (SSR only),
 * populated from the gitignored `.env` file. In the browser bundle `process` is
 * undefined, so `nasaApiKey` resolves to '' — by design the key never ships to the
 * client. Data is fetched during SSR and handed to the browser via TransferState,
 * so the client never needs the key for the initial render. (See CLAUDE.md → Environment.)
 */
const NASA_API_KEY_VAR = 'NASA_API_KEY';

type NodeProcessGlobal = {
  process?: { env?: Record<string, string | undefined> };
};

export const environment = {
  production: false,
  get nasaApiKey(): string {
    return (globalThis as typeof globalThis & NodeProcessGlobal).process?.env?.[NASA_API_KEY_VAR] ?? '';
  },
};
