import winston from "winston";
import { config } from "../config/env";

export const logger = winston.createLogger({
  level: config.isDev ? "debug" : "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    config.isDev
      ? winston.format.colorize()
      : winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaStr = Object.keys(meta).length
        ? ` ${JSON.stringify(meta)}`
        : "";
      return `[${timestamp}] ${level}: ${message}${metaStr}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    ...(config.isDev
      ? []
      : [new winston.transports.File({ filename: "logs/error.log", level: "error" }),
         new winston.transports.File({ filename: "logs/combined.log" })]),
  ],
});
