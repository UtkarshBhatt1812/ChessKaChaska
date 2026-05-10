import mongoose, { InferSchemaType, Model, Schema } from "mongoose";

const moveSchema = new Schema(
  {
    ply: { type: Number, required: true, min: 1 },
    color: { type: String, enum: ["white", "black"], required: true },
    san: { type: String, required: true, trim: true },
    uci: { type: String, required: true, trim: true },
    fenAfter: { type: String, required: true, trim: true },
    spentTimeMs: { type: Number, min: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const timeControlSchema = new Schema(
  {
    mode: {
      type: String,
      enum: ["bullet", "blitz", "rapid", "classical", "custom"],
      default: "rapid",
    },
    initialTimeSeconds: { type: Number, required: true, min: 0 },
    incrementSeconds: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const playerSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true, trim: true },
    ratingBefore: { type: Number, default: 1200, min: 100 },
    ratingAfter: { type: Number, min: 100 },
  },
  { _id: false }
);

const gameSchema = new Schema(
  {
    white: { type: playerSchema, required: true },
    black: { type: playerSchema, required: true },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "aborted"],
      default: "pending",
      index: true,
    },
    result: {
      type: String,
      enum: ["1-0", "0-1", "1/2-1/2", "*"],
      default: "*",
    },
    winner: { type: Schema.Types.ObjectId, ref: "User", default: null },
    rated: { type: Boolean, default: true },
    variant: {
      type: String,
      enum: ["standard", "chess960"],
      default: "standard",
    },
    timeControl: { type: timeControlSchema, required: true },
    initialFen: { type: String, default: "start", trim: true },
    currentFen: { type: String, default: "start", trim: true },
    pgn: { type: String, default: "" },
    moves: { type: [moveSchema], default: [] },
    termination: {
      type: String,
      enum: [
        "ongoing",
        "checkmate",
        "resignation",
        "timeout",
        "stalemate",
        "draw_agreement",
        "repetition",
        "insufficient_material",
        "fifty_move_rule",
        "aborted",
      ],
      default: "ongoing",
    },
    lastMoveAt: { type: Date },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

gameSchema.index({ "white.user": 1, "black.user": 1, createdAt: -1 });
gameSchema.index({ status: 1, lastMoveAt: -1 });

export type GameDocument = InferSchemaType<typeof gameSchema>;

const Game: Model<GameDocument> =
  (mongoose.models.Game as Model<GameDocument>) ||
  mongoose.model<GameDocument>("Game", gameSchema);

export default Game;
