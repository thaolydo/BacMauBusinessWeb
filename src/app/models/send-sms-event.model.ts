export interface SendSmsEvent {
    createdAt: number;
    content: string;
    description?: string;
    imageUrl?: string; // not needed currently
}