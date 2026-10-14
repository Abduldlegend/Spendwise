import mongoose from "mongoose";
import config from "./env.js";

const MONGOOSE_OPTIONS = {
  // Atlas can be slow to accept the first connection on a cold cluster.
  serverSelectionTimeoutMS: 10_000,
  maxPoolSize: 10,
};

const CONNECTION_STATES = ["disconnected", "connected", "connecting", "disconnecting"];

/** @type {boolean} */
let listenersAttached = false;

function attachListeners() {
  if (listenersAttached) return;
  listenersAttached = true;
  mongoose.connection.on("disconnected", () => console.warn("[db] disconnected"));
  mongoose.connection.on("reconnected", () => console.log("[db] reconnected"));
  mongoose.connection.on("error", (error) => console.error("[db] connection error:", error.message));
}

/** Human-readable mongoose connection state, for `/health`. */
export function dbState() {
  return CONNECTION_STATES[mongoose.connection.readyState] ?? "unknown";
}

/** Guards against the shipped placeholder so the failure message is actionable. */
function assertUsableUri(uri) {
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add your MongoDB Atlas connection string to server/.env");
  }
  if (!/^mongodb(\+srv)?:\/\//.test(uri)) {
    throw new Error("MONGODB_URI must start with mongodb:// or mongodb+srv://");
  }
  if (/USERNAME|PASSWORD|CLUSTER/.test(uri)) {
    throw new Error(
      "MONGODB_URI still contains the Atlas placeholder. Open server/.env and paste your real connection string."
    );
  }
}

export async function connectDB() {
  assertUsableUri(config.mongoUri);

  attachListeners();
  mongoose.set("strictQuery", true);

  await mongoose.connect(config.mongoUri, MONGOOSE_OPTIONS);
  const { host, name } = mongoose.connection;
  console.log(`[db] connected to ${host}/${name}`);
  return mongoose.connection;
}

export function disconnectDB() {
  return mongoose.disconnect();
}
