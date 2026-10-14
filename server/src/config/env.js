import dotenv from "dotenv";

dotenv.config();

const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 4000,
  apiPrefix: process.env.API_PREFIX || "/api/v1",
  mongoUri: process.env.MONGODB_URI || "",
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "dev_access_secret",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "dev_refresh_secret",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  cookie: {
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
  },
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
    authMax: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  },
};

export default config;

