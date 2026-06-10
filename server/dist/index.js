"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const db_1 = require("./lib/db");
const logger_1 = require("./utils/logger");
const socket_1 = require("./socket");
const health_1 = __importDefault(require("./routes/health"));
async function bootstrap() {
    // 1. Connect database
    await (0, db_1.connectDB)();
    // 2. Express app
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    }));
    app.use((0, cors_1.default)({
        origin: env_1.config.corsOrigin,
        credentials: true,
    }));
    app.use((0, cookie_parser_1.default)());
    app.use(express_1.default.json({ limit: "50kb" }));
    // HTTP rate limiting (REST endpoints)
    app.use((0, express_rate_limit_1.default)({
        windowMs: 60000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
    }));
    // Routes
    app.use("/", health_1.default);
    // 3. HTTP server + Socket.IO
    const httpServer = http_1.default.createServer(app);
    (0, socket_1.createSocketServer)(httpServer);
    httpServer.listen(env_1.config.port, () => {
        logger_1.logger.info(`Socket server running on http://localhost:${env_1.config.port}`);
    });
    // Graceful shutdown
    process.on("SIGTERM", () => {
        logger_1.logger.info("SIGTERM received. Shutting down...");
        httpServer.close(() => process.exit(0));
    });
}
bootstrap().catch((err) => {
    logger_1.logger.error("Fatal startup error:", err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map