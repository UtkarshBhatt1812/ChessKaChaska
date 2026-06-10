import mongoose, { InferSchemaType, Model } from "mongoose";
declare const chatMessageSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    timestamp: number;
    message: string;
    userId: string;
    username: string;
    id: string;
    roomCode: string;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    timestamp: number;
    message: string;
    userId: string;
    username: string;
    id: string;
    roomCode: string;
} & mongoose.DefaultTimestampProps, {}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & {
    timestamp: number;
    message: string;
    userId: string;
    username: string;
    id: string;
    roomCode: string;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, unknown, {
    timestamp: number;
    message: string;
    userId: string;
    username: string;
    id: string;
    roomCode: string;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export type ChatMessageDocument = InferSchemaType<typeof chatMessageSchema>;
declare const ChatMessage: Model<ChatMessageDocument>;
export default ChatMessage;
//# sourceMappingURL=ChatMessage.d.ts.map