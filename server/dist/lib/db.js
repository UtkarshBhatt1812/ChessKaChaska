"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
let conn = null;
async function connectDB() {
    if (conn)
        return conn;
    try {
        conn = await mongoose_1.default.connect(env_1.config.mongoUri);
        logger_1.logger.info("MongoDB connected");
        return conn;
    }
    catch (err) {
        logger_1.logger.error("MongoDB connection error:", err);
        throw err;
    }
}
//# sourceMappingURL=db.js.map