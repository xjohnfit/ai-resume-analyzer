import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { env } from "../config/env";

const { JWT_ACCESS_SECRET } = env;

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
export const EMAIL_VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
export const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

interface AccessTokenPayload {
    userId: string;
}

export function signAccessToken(userId: string): string {
    return jwt.sign({ userId } satisfies AccessTokenPayload, JWT_ACCESS_SECRET, {
        expiresIn: ACCESS_TOKEN_TTL,
    });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, JWT_ACCESS_SECRET) as AccessTokenPayload;
}

interface RefreshTokenPayload {
    userId: string;
    jti: string;
}

export function hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
}

export function createRefreshToken(userId: string) {
    const jti = crypto.randomUUID();
    const token = jwt.sign({ userId, jti} satisfies RefreshTokenPayload, JWT_ACCESS_SECRET, {
        expiresIn: "30d",
    });
    return {
        token,
        jti,
        hashedToken: hashToken(token),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    };
}

export function createEmailVerificationToken() {
    const token = crypto.randomUUID();
    return {
        token,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL_MS),
    };
}

export function createPasswordResetToken() {
    const token = crypto.randomUUID();
    return {
        token,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS),
    };
}


export function verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(token, JWT_ACCESS_SECRET) as RefreshTokenPayload;
}
