"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
exports.config = {
    port: parseInt(process.env.PORT || "3001", 10),
    nodeEnv: process.env.NODE_ENV || "development",
    mongoUri: requireEnv("MONGO_URI"),
    jwtSecret: process.env.JWT_SECRET ||
        process.env.ACCESS_TOKEN_SECRET ||
        process.env.AUTH_SECRET ||
        (() => {
            throw new Error("No JWT secret defined");
        })(),
    corsOrigin: (process.env.CORS_ORIGIN || "http://localhost:3000").split(","),
    roomCleanupIntervalMs: parseInt(process.env.ROOM_CLEANUP_INTERVAL_MS || "60000", 10),
    roomDisconnectGracePeriodMs: parseInt(process.env.ROOM_DISCONNECT_GRACE_PERIOD_MS || "30000", 10),
    isDev: process.env.NODE_ENV !== "production",
};
//# sourceMappingURL=env.js.map