import { connectDB, disconnectDB } from "../config/db.js";
import { User } from "../models/User.js";

/**
 * Promotes an existing account to admin. Registering through the app first keeps
 * the bootstrap flow free of generated passwords printed to a terminal.
 *
 * Usage: npm run seed:admin -- ada@example.com
 */
async function main() {
  const email = String(process.argv[2] ?? "").trim().toLowerCase();
  if (!email) {
    console.error("[seed] usage: npm run seed:admin -- <email>");
    process.exitCode = 1;
    return;
  }

  await connectDB();
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`[seed] no account found for ${email}. Register it in the app first, then re-run.`);
      process.exitCode = 1;
      return;
    }
    user.role = "admin";
    user.isActive = true;
    await user.save();
    console.log(`[seed] ${email} is now an admin`);
  } finally {
    await disconnectDB();
  }
}

main().catch(async (error) => {
  console.error("[seed] failed:", error.message);
  await disconnectDB().catch(() => undefined);
  process.exit(1);
});
