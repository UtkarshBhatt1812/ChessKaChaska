import { Router } from "express";
import { roomManager } from "../managers/RoomManager";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    rooms: roomManager.getRoomCount(),
  });
});

export default router;
