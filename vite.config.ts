import { defineConfig } from "@lovable.dev/vite-tanstack-config";

/**
 * Vercel serves the app from `/`.
 * For the Nginx demo, build with: VITE_BASE=/ocean-wonders-v3/
 */
const PUBLIC_BASE = process.env.VITE_BASE ?? "/";
const LEGACY_BASE = "/ocean-wonders-v2";

function rewriteBasePath(
  req: { url?: string },
  res: { statusCode: number; setHeader: (k: string, v: string) => void; end: () => void },
  next: () => void,
) {
  const raw = req.url ?? "/";
  const qIndex = raw.indexOf("?");
  const path = qIndex === -1 ? raw : raw.slice(0, qIndex);
  const search = qIndex === -1 ? "" : raw.slice(qIndex);

  if (path === LEGACY_BASE || path.startsWith(`${LEGACY_BASE}/`)) {
    const rest = path.slice(LEGACY_BASE.length).replace(/^\//, "");
    res.statusCode = 302;
    res.setHeader("Location", `${PUBLIC_BASE}${rest}${search}`);
    res.end();
    return;
  }

  next();
}

export default defineConfig({
  // Lovable defaults Nitro to Cloudflare. On Vercel that must be "vercel".
  // Local / Nginx `vite preview` stays on Node. Do not use preset "bun" on Vercel.
  nitro: {
    preset: process.env.VERCEL ? "vercel" : "node-server",
  },
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    base: PUBLIC_BASE,
    plugins: [
      {
        name: "ocean-wonders-legacy-redirects",
        configureServer(server) {
          server.middlewares.use(rewriteBasePath);
        },
        configurePreviewServer(server) {
          server.middlewares.use(rewriteBasePath);
        },
      },
    ],
    server: {
      allowedHosts: ["demo.sourapps.com", "localhost", "127.0.0.1"],
    },
    preview: {
      allowedHosts: ["demo.sourapps.com", "localhost", "127.0.0.1"],
    },
  },
});
