import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { config } from "./config/env";
import { connectDB } from "./lib/db";
import { logger } from "./utils/logger";
import { createSocketServer } from "./socket";
import healthRouter from "./routes/health";

async function bootstrap() {
  // 1. Connect database. Multiplayer rooms are in-memory, so keep the socket
  // server available even if persistence is temporarily unavailable.
  void connectDB().catch((err) => {
    logger.error("MongoDB unavailable; starting socket server without persistence:", err);
  });

  // 2. Express app
  const app = express();

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  ); 
  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(express.json({ limit: "50kb" }));

  // HTTP rate limiting (REST endpoints)
  app.use(
    rateLimit({
      windowMs: 60_000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // Routes
  app.use("/", healthRouter);

  // 3. HTTP server + Socket.IO
  const httpServer = http.createServer(app);
  createSocketServer(httpServer);

  httpServer.listen(config.port, () => {
    logger.info(`Socket server running on http://localhost:${config.port}`);
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    logger.info("SIGTERM received. Shutting down...");
    httpServer.close(() => process.exit(0));
  });
}

bootstrap().catch((err) => {
  logger.error("Fatal startup error:", err);
  process.exit(1);
});
