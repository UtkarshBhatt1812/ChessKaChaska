export type PlayerColor = "white" | "black";
export type PlayerInfo = {
    userId: string;
    username: string;
    socketId: string;
    color: PlayerColor;
    connected: boolean;
    disconnectedAt?: number;
};
export type RoomStatus = "waiting" | "ready" | "active" | "completed" | "abandoned";
export type RoomState = {
    code: string;
    white: PlayerInfo | null;
    black: PlayerInfo | null;
    spectators: SpectatorInfo[];
    status: RoomStatus;
    gameId: string | null;
    createdAt: number;
    timeControl: TimeControl;
};
export type SpectatorInfo = {
    userId: string;
    username: string;
    socketId: string;
};
export type TimeControl = {
    initialSeconds: number;
    incrementSeconds: number;
    mode: "bullet" | "blitz" | "rapid" | "classical" | "custom";
};
export type CapturedPieces = {
    white: string[];
    black: string[];
};
export type GameState = {
    fen: string;
    pgn: string;
    history: MoveRecord[];
    turn: "w" | "b";
    capturedPieces: CapturedPieces;
    timers: {
        white: number;
        black: number;
    };
    isCheck: boolean;
    isCheckmate: boolean;
    isStalemate: boolean;
    isDraw: boolean;
    isGameOver: boolean;
    termination?: GameTermination;
    winner?: PlayerColor | "draw" | null;
};
export type MoveRecord = {
    ply: number;
    san: string;
    uci: string;
    fenAfter: string;
    color: PlayerColor;
    timestamp: number;
};
export type GameTermination = "checkmate" | "resignation" | "timeout" | "stalemate" | "draw_agreement" | "repetition" | "insufficient_material" | "fifty_move_rule" | "aborted";
export type ChatMessage = {
    id: string;
    roomCode: string;
    userId: string;
    username: string;
    message: string;
    timestamp: number;
};
export type CreateRoomPayload = {
    timeControl: TimeControl;
    color?: PlayerColor;
};
export type JoinRoomPayload = {
    roomCode: string;
};
export type ReconnectRoomPayload = {
    roomCode: string;
};
export type MakeMovePayload = {
    roomCode: string;
    from: string;
    to: string;
    promotion?: string;
};
export type ResignPayload = {
    roomCode: string;
};
export type DrawOfferPayload = {
    roomCode: string;
};
export type DrawResponsePayload = {
    roomCode: string;
    accepted: boolean;
};
export type SendMessagePayload = {
    roomCode: string;
    message: string;
};
export type TypingPayload = {
    roomCode: string;
};
export type RematchRequestPayload = {
    roomCode: string;
};
export type RematchResponsePayload = {
    roomCode: string;
    accepted: boolean;
};
export type RoomCreatedPayload = {
    room: RoomState;
    myColor: PlayerColor;
};
export type PlayerJoinedPayload = {
    player: PlayerInfo;
    room: RoomState;
    myColor?: PlayerColor;
};
export type SpectatorJoinedPayload = {
    spectator: SpectatorInfo;
    spectatorCount: number;
    room?: RoomState;
    gameState?: GameState;
};
export type MoveMadePayload = {
    move: MoveRecord;
    gameState: GameState;
};
export type IllegalMovePayload = {
    from: string;
    to: string;
    reason: string;
};
export type GameOverPayload = {
    gameState: GameState;
    winner: PlayerColor | "draw" | null;
    termination: GameTermination;
};
export type ReconnectSuccessPayload = {
    room: RoomState;
    gameState: GameState;
    myColor: PlayerColor;
    chatHistory: ChatMessage[];
};
export type ReconnectFailedPayload = {
    reason: string;
};
export type ErrorPayload = {
    event: string;
    message: string;
};
export type SocketData = {
    userId: string;
    username: string;
    isGuest: boolean;
};
export type ClientToServerEvents = {
    create_room: (payload: CreateRoomPayload) => void;
    join_room: (payload: JoinRoomPayload) => void;
    reconnect_room: (payload: ReconnectRoomPayload) => void;
    leave_room: (payload: {
        roomCode: string;
    }) => void;
    make_move: (payload: MakeMovePayload) => void;
    resign: (payload: ResignPayload) => void;
    draw_offer: (payload: DrawOfferPayload) => void;
    draw_response: (payload: DrawResponsePayload) => void;
    send_message: (payload: SendMessagePayload) => void;
    typing: (payload: TypingPayload) => void;
    rematch_request: (payload: RematchRequestPayload) => void;
    rematch_response: (payload: RematchResponsePayload) => void;
};
export type ServerToClientEvents = {
    room_created: (payload: RoomCreatedPayload) => void;
    player_joined: (payload: PlayerJoinedPayload) => void;
    spectator_joined: (payload: SpectatorJoinedPayload) => void;
    game_state: (payload: GameState) => void;
    move_made: (payload: MoveMadePayload) => void;
    illegal_move: (payload: IllegalMovePayload) => void;
    game_over: (payload: GameOverPayload) => void;
    resign: (payload: {
        color: PlayerColor;
    }) => void;
    draw_offer: (payload: {
        fromColor: PlayerColor;
    }) => void;
    player_disconnected: (payload: {
        color: PlayerColor;
        username: string;
    }) => void;
    player_reconnected: (payload: {
        color: PlayerColor;
        username: string;
    }) => void;
    reconnect_success: (payload: ReconnectSuccessPayload) => void;
    reconnect_failed: (payload: ReconnectFailedPayload) => void;
    receive_message: (payload: ChatMessage) => void;
    typing: (payload: {
        username: string;
    }) => void;
    rematch_request: (payload: {
        fromColor: PlayerColor;
    }) => void;
    rematch_accepted: (payload: {
        gameState: GameState;
    }) => void;
    game_restarted: (payload: {
        gameState: GameState;
        room: RoomState;
    }) => void;
    error: (payload: ErrorPayload) => void;
};
//# sourceMappingURL=socket.types.d.ts.map