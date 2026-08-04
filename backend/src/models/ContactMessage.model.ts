import { Schema, model } from 'mongoose';

export interface ContactMessageDocument {
    name: string;
    email: string;
    category: 'subscription' | 'bug' | 'question' | 'other';
    message: string;
}

const contactMessageSchema = new Schema<ContactMessageDocument>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        category: {
            type: String,
            enum: ['subscription', 'bug', 'question', 'other'],
            required: true,
        },
        message: { type: String, required: true, trim: true },
    },
    {
        timestamps: true,
    },
);

export const ContactMessage = model<ContactMessageDocument>('ContactMessage', contactMessageSchema);
