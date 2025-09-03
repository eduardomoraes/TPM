import express from "express";
import { createServer } from "http";
import { setupVite } from "./vite";
import { registerRoutes } from "./routes";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

async function main() {
  // Create HTTP server
  const server = await registerRoutes(app);
  
  // Setup Vite with the server
  await setupVite(app, server);
  
  server.listen(PORT, () => {
    console.log(`[express] serving on port ${PORT}`);
  });
}

main().catch(console.error);