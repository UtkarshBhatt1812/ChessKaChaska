import mongoose, { InferSchemaType, Model, Schema } from "mongoose";

const playerSessionSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    username: { type: String, required: true },
    socketId: { type: String, required: true },
    roomCode: { type: String, required: true, index: true },
    color: { type: String, enum: ["white", "black"], required: true },
    isGuest: { type: Boolean, default: false },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

playerSessionSchema.index({ userId: 1, roomCode: 1 }, { unique: true });

export type PlayerSessionDocument = InferSchemaType<typeof playerSessionSchema>;

const PlayerSession: Model<PlayerSessionDocument> =
  (mongoose.models.PlayerSession as Model<PlayerSessionDocument>) ||
  mongoose.model<PlayerSessionDocument>("PlayerSession", playerSessionSchema);

export default PlayerSession;
