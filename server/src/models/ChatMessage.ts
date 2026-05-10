import mongoose, { InferSchemaType, Model, Schema } from "mongoose";

const chatMessageSchema = new Schema(
  {
    id: { type: String, required: true },
    roomCode: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    username: { type: String, required: true },
    message: { type: String, required: true, maxlength: 500 },
    timestamp: { type: Number, required: true },
  },
  { timestamps: true }
);

chatMessageSchema.index({ roomCode: 1, timestamp: 1 });

export type ChatMessageDocument = InferSchemaType<typeof chatMessageSchema>;

const ChatMessage: Model<ChatMessageDocument> =
  (mongoose.models.ChatMessage as Model<ChatMessageDocument>) ||
  mongoose.model<ChatMessageDocument>("ChatMessage", chatMessageSchema);

export default ChatMessage;
