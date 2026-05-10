import mongoose from "mongoose";
import { config } from "../config/env";
import { logger } from "../utils/logger";

let conn: typeof mongoose | null = null;

export async function connectDB(): Promise<typeof mongoose> {
  if (conn) return conn;

  try {
    conn = await mongoose.connect(config.mongoUri);
    logger.info("MongoDB connected");
    return conn;
  } catch (err) {
    logger.error("MongoDB connection error:", err);
    throw err;
  }
}
