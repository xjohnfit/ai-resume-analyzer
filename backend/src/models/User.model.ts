import { Schema, model } from "mongoose";

interface RefreshTokenRecord {
    jti: string;
    hashedToken: string;
    expiresAt: Date;
}

interface UserDocument {
    name: string;
    email: string;
    passwordHash: string;
    refreshTokens: RefreshTokenRecord[];
}

const refreshTokenSchema = new Schema<RefreshTokenRecord>(
    {
        jti: { type: String, required: true },
        hashedToken: { type: String, required: true },
        expiresAt: { type: Date, required: true },
    },
    {
        _id: false
    }
);

const userSchema = new Schema<UserDocument>(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        name: { type: String, required: true, trim: true },
        refreshTokens: { type: [refreshTokenSchema], default: []},
    },
    {
        timestamps: true
    }
);

export const User = model<UserDocument>("User", userSchema);
