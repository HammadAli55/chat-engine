export interface Message {
    username: string;
    message: string;
    room: string;
    timestamp: Date;
    isSystem?: boolean;
}