import app from "./app.js";
import config from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { seedCategories } from "./seeds/categories.js";

async function start() {
  await connectDB();

  try {
    const { created } = await seedCategories();
    if (created > 0) console.log(`[api] seeded ${created} default categories`);
  } catch (error) {
    console.warn("[api] category seed skipped:", error.message);
  }

  const server = app.listen(config.port, () => {
    console.log(`[api] listening on http://localhost:${config.port}${config.apiPrefix}`);
  });

  const shutdown = async (signal) => {
    console.log(`[api] ${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDB().catch(() => undefined);
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((error) => {
  console.error("[api] failed to start:", error.message);
  process.exit(1);
});
