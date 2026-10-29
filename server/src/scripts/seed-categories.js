import { connectDB, disconnectDB } from "../config/db.js";
import { seedCategories } from "../seeds/categories.js";

async function main() {
  const force = process.argv.includes("--force");
  await connectDB();
  const result = await seedCategories({ force });
  console.log(
    `[seed] categories: ${result.created} created, ${result.total - result.created} already present${force ? " (refreshed)" : ""}`,
  );
  await disconnectDB();
}

main().catch(async (error) => {
  console.error("[seed] failed:", error.message);
  await disconnectDB().catch(() => undefined);
  process.exit(1);
});
