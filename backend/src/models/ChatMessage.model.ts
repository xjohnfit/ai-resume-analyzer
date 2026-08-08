import { Schema, model, Types } from 'mongoose';

export type ChatRole = 'user' | 'assistant';

export interface ChatMessageDocument {
    userId: Types.ObjectId;
    role: ChatRole;
    content: string;
    createdAt: Date;
}

const chatMessageSchema = new Schema<ChatMessageDocument>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } },
);

export const ChatMessage = model<ChatMessageDocument>('ChatMessage', chatMessageSchema);
