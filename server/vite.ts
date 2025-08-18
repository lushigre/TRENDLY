import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteDevServer, type ViteDevServer } from "vite";
import { createServer } from "http";

export async function setupVite(
  app: Express,
  httpServer: ReturnType<typeof createServer>
) {
  const viteServer: ViteDevServer = await createViteDevServer({
    server: {
      middlewareMode: true,
      hmr: { server: httpServer },
    },
    appType: "spa",
    root: process.cwd(),
  });

  app.use(viteServer.middlewares);
  return viteServer;
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "client", "dist");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
