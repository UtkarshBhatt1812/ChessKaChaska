import mongoose, { InferSchemaType, Model, Schema } from "mongoose";

const ratingSchema = new Schema(
  {
    bullet: { type: Number, default: 1200, min: 100 },
    blitz: { type: Number, default: 1200, min: 100 },
    rapid: { type: Number, default: 1200, min: 100 },
    classical: { type: Number, default: 1200, min: 100 },
  },
  { _id: false }
);

const statsSchema = new Schema(
  {
    gamesPlayed: { type: Number, default: 0, min: 0 },
    wins: { type: Number, default: 0, min: 0 },
    losses: { type: Number, default: 0, min: 0 },
    draws: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: { type: String, required: true },
    displayName: { type: String, trim: true, maxlength: 40 },
    avatarUrl: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, maxlength: 50 },
    rating: { type: ratingSchema, default: () => ({}) },
    stats: { type: statsSchema, default: () => ({}) },
    status: {
      type: String,
      enum: ["offline", "online", "playing"],
      default: "offline",
    },
    lastSeenAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export type UserDocument = InferSchemaType<typeof userSchema>;

const User: Model<UserDocument> =
  (mongoose.models.User as Model<UserDocument>) ||
  mongoose.model<UserDocument>("User", userSchema);

export default User;
