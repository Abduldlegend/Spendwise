import express from "express";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";

import config from "./config/env.js";
import { corsOptions } from "./config/cors.js";
import { dbState } from "./config/db.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";
import v1Routes from "./routes/v1/index.js";

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(generalLimiter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", env: config.env, db: dbState() });
});

app.use(`${config.apiPrefix}`, v1Routes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not Found" });
});

app.use(errorHandler);

export default app;

