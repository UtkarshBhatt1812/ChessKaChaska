import mongoose, { InferSchemaType, Model } from "mongoose";
declare const playerSessionSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    userId: string;
    color: "white" | "black";
    username: string;
    socketId: string;
    roomCode: string;
    isGuest: boolean;
    lastSeenAt: NativeDate;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    userId: string;
    color: "white" | "black";
    username: string;
    socketId: string;
    roomCode: string;
    isGuest: boolean;
    lastSeenAt: NativeDate;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    userId: string;
    color: "white" | "black";
    username: string;
    socketId: string;
    roomCode: string;
    isGuest: boolean;
    lastSeenAt: NativeDate;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    userId: string;
    color: "white" | "black";
    username: string;
    socketId: string;
    roomCode: string;
    isGuest: boolean;
    lastSeenAt: NativeDate;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export type PlayerSessionDocument = InferSchemaType<typeof playerSessionSchema>;
declare const PlayerSession: Model<PlayerSessionDocument>;
export default PlayerSession;
//# sourceMappingURL=PlayerSession.d.ts.map