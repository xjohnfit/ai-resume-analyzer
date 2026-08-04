import { Schema, model } from 'mongoose';

interface RefreshTokenRecord {
    jti: string;
    hashedToken: string;
    expiresAt: Date;
}

const refreshTokenSchema = new Schema<RefreshTokenRecord>(
    {
        jti: { type: String, required: true },
        hashedToken: { type: String, required: true },
        expiresAt: { type: Date, required: true },
    },
    {
        _id: false,
    },
);

export interface Subscription {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    stripePriceId?: string;
    plan: 'free' | 'monthly' | 'yearly';
    status:
        | 'none'
        | 'active'
        | 'trialing'
        | 'past_due'
        | 'canceled'
        | 'incomplete'
        | 'incomplete_expired'
        | 'unpaid'
        | 'paused';
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd: boolean;
}

const subscriptionSchema = new Schema<Subscription>(
    {
        stripeCustomerId: { type: String },
        stripeSubscriptionId: { type: String },
        stripePriceId: { type: String },
        plan: {
            type: String,
            enum: ['free', 'monthly', 'yearly'],
            default: 'free',
        },
        status: {
            type: String,
            enum: [
                'none',
                'active',
                'trialing',
                'past_due',
                'canceled',
                'incomplete',
                'incomplete_expired',
                'unpaid',
                'paused',
            ],
            default: 'none',
        },
        currentPeriodEnd: { type: Date },
        cancelAtPeriodEnd: { type: Boolean, default: false },
    },
    { _id: false },
);

interface Usage {
    analysesThisMonth: number;
    resetAt: Date;
}

const usageSchema = new Schema<Usage>(
    {
        analysesThisMonth: { type: Number, default: 0 },
        resetAt: { type: Date, default: Date.now },
    },
    { _id: false },
);

interface EmailVerificationToken {
    tokenHash: string;
    expiresAt: Date;
}

const emailVerificationTokenSchema = new Schema<EmailVerificationToken>(
    {
        tokenHash: { type: String, required: true },
        expiresAt: { type: Date, required: true },
    },
    { _id: false },
);

export interface UserDocument {
    name: string;
    email: string;
    passwordHash: string;
    refreshTokens: RefreshTokenRecord[];
    subscription: Subscription;
    usage: Usage;
    emailVerified: boolean;
    emailVerificationToken?: EmailVerificationToken;
}

const userSchema = new Schema<UserDocument>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: { type: String, required: true },
        name: { type: String, required: true, trim: true },
        refreshTokens: { type: [refreshTokenSchema], default: [] },
        subscription: { type: subscriptionSchema, default: () => ({}) },
        usage: { type: usageSchema, default: () => ({}) },
        emailVerified: { type: Boolean, default: false },
        emailVerificationToken: { type: emailVerificationTokenSchema },
    },
    {
        timestamps: true,
    },
);

export const User = model<UserDocument>('User', userSchema);
