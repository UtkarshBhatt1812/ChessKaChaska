"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const RoomManager_1 = require("../managers/RoomManager");
const router = (0, express_1.Router)();
router.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        rooms: RoomManager_1.roomManager.getRoomCount(),
    });
});
exports.default = router;
//# sourceMappingURL=health.js.map