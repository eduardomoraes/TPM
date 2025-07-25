import express from "express";
import { registerRoutes } from "./routes";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

async function main() {
  const server = await registerRoutes(app);
  
  server.listen(PORT, () => {
    console.log(`[express] serving on port ${PORT}`);
  });
}

main().catch(console.error);