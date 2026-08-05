import { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User.model';
import {
    hashPassword,
    comparePassword,
    signAccessToken,
    createRefreshToken,
    verifyRefreshToken,
    hashToken,
    createEmailVerificationToken,
    EMAIL_VERIFICATION_TOKEN_TTL_MS,
    createPasswordResetToken,
    signMfaChallengeToken,
    verifyMfaChallengeToken,
} from '../services/auth.service';
import { resetUsageIfNeeded } from '../services/usage.service';
import { env } from '../config/env';
import { Profile } from '../models/Profile.model';
import { cancelSubscriptionImmediately } from '../services/stripe.service';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.service';
import { sendVerificationCode, checkVerificationCode } from '../services/mfa.service';

const { NODE_ENV } = env;

const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000; //15 minutes
const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; //30 days
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute

function setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
) {
    const isProd = NODE_ENV === 'production';
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: ACCESS_COOKIE_MAX_AGE,
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: REFRESH_COOKIE_MAX_AGE,
    });
}

const signupSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
    name: z.string().min(1),
});

export async function signup(req: Request, res: Response) {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: z.treeifyError(parsed.error) });
    }
    const { email, password, name } = parsed.data;

    const existing = await User.findOne({ email });

    if (existing) {
        return res.status(409).json({ error: 'Email already in use' });
    }

    const passwordHash = await hashPassword(password);
    const user = new User({ email, passwordHash, name, refreshTokens: [] });

    const accessToken = signAccessToken(user.id);
    const refresh = createRefreshToken(user.id);
    user.refreshTokens.push({
        jti: refresh.jti,
        hashedToken: refresh.hashedToken,
        expiresAt: refresh.expiresAt,
    });

    const verification = createEmailVerificationToken();
    user.emailVerificationToken = {
        tokenHash: verification.tokenHash,
        expiresAt: verification.expiresAt,
    };

    await user.save();

    try {
        await sendVerificationEmail(user.email, verification.token);
    } catch (err) {
        console.error('Failed to send verification email:', err);
    }

    setAuthCookies(res, accessToken, refresh.token);
    res.status(201).json({ id: user.id, email: user.email, name: user.name });
}

const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(1),
});

export async function login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: z.treeifyError(parsed.error) });
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email });
    if (!user || !(await comparePassword(password, user.passwordHash))) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.mfa.enabled && user.mfa.phoneNumber) {
        try {
            await sendVerificationCode(user.mfa.phoneNumber);
        } catch (err) {
            console.error('Failed to send MFA login code:', err);
            return res.status(502).json({ error: 'Failed to send verification code. Please try again.' });
        }

        const challengeToken = signMfaChallengeToken(user.id);
        return res.json({ mfaRequired: true, challengeToken });
    }

    const accessToken = signAccessToken(user.id);
    const refresh = createRefreshToken(user.id);
    user.refreshTokens.push({
        jti: refresh.jti,
        hashedToken: refresh.hashedToken,
        expiresAt: refresh.expiresAt,
    });
    await user.save();

    setAuthCookies(res, accessToken, refresh.token);
    res.json({ id: user.id, email: user.email, name: user.name });
}

export async function refresh(req: Request, res: Response) {
    const token = req.cookies.refreshToken;
    if (!token) {
        return res.status(401).json({ error: 'No refresh token' });
    }

    let payload;

    try {
        payload = verifyRefreshToken(token);
    } catch (error) {
        return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const user = await User.findById(payload.userId);
    const hashed = hashToken(token);
    const stored = user?.refreshTokens.find(
        (rt) => rt.jti === payload.jti && rt.hashedToken === hashed,
    );
    if (!user || !stored) {
        return res.status(401).json({ error: 'Refresh token revoked' });
    }

    //Rotate: invalidate the used token, issue a brand new one
    user.refreshTokens = user.refreshTokens.filter(
        (re) => re.jti !== payload.jti,
    );
    const newRefresh = createRefreshToken(user.id);
    user.refreshTokens.push({
        jti: newRefresh.jti,
        hashedToken: newRefresh.hashedToken,
        expiresAt: newRefresh.expiresAt,
    });
    await user.save();

    const accessToken = signAccessToken(user.id);
    setAuthCookies(res, accessToken, newRefresh.token);
    res.json({ success: true });
}

export async function logout(req: Request, res: Response) {
    const token = req.cookies.refreshToken;
    if (token) {
        try {
            const payload = verifyRefreshToken(token);
            await User.findByIdAndUpdate(payload.userId, {
                $pull: { refreshTokens: { jti: payload.jti } },
            });
        } catch {
            // Already invalid/expired - nothing to revoke, just clear cookies below
        }
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ success: true });
}

const deleteAccountSchema = z.object({
    password: z.string().min(1),
});

export async function deleteAccount(req: Request, res: Response) {
    const parsed = deleteAccountSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: z.treeifyError(parsed.error) });
    }

    const user = await User.findById(req.user!.userId);
    if (
        !user ||
        !(await comparePassword(parsed.data.password, user.passwordHash))
    ) {
        return res.status(401).json({ error: 'Incorrect password' });
    }

    if (
        user.subscription.stripeSubscriptionId &&
        (user.subscription.status === 'active' ||
            user.subscription.status === 'trialing')
    ) {
        await cancelSubscriptionImmediately(
            user.subscription.stripeSubscriptionId,
        );
    }

    await Profile.deleteOne({ userId: user.id });
    await User.findByIdAndDelete(user.id);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ success: true });
}

const verifyEmailSchema = z.object({
    token: z.string().min(1),
});

export async function verifyEmail(req: Request, res: Response) {
    const parsed = verifyEmailSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: z.treeifyError(parsed.error) });
    }

    const tokenHash = hashToken(parsed.data.token);
    const user = await User.findOne({
        'emailVerificationToken.tokenHash': tokenHash,
        'emailVerificationToken.expiresAt': { $gt: new Date() },
    });

    if (!user) {
        return res.status(400).json({ error: 'Invalid or expired verification link' });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.json({ success: true });
}

export async function resendVerification(req: Request, res: Response) {
    const user = await User.findById(req.user!.userId);
    if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    if (user.emailVerified) {
        return res.status(400).json({ error: 'Email already verified' });
    }

    const existingToken = user.emailVerificationToken;
    if (existingToken) {
        const sentAt = existingToken.expiresAt.getTime() - EMAIL_VERIFICATION_TOKEN_TTL_MS;
        if (Date.now() - sentAt < RESEND_COOLDOWN_MS) {
            return res.status(429).json({ error: 'Please wait a moment before requesting another email' });
        }
    }

    const verification = createEmailVerificationToken();
    user.emailVerificationToken = {
        tokenHash: verification.tokenHash,
        expiresAt: verification.expiresAt,
    };
    await user.save();

    try {
        await sendVerificationEmail(user.email, verification.token);
    } catch (err) {
        console.error('Failed to send verification email:', err);
        return res.status(502).json({ error: 'Failed to send email. Please try again.' });
    }

    res.json({ success: true });
}

const forgotPasswordSchema = z.object({
    email: z.email(),
});

export async function forgotPassword(req: Request, res: Response) {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: z.treeifyError(parsed.error) });
    }

    const user = await User.findOne({ email: parsed.data.email });

    if (user) {
        const reset = createPasswordResetToken();
        user.passwordResetToken = {
            tokenHash: reset.tokenHash,
            expiresAt: reset.expiresAt,
        };
        await user.save();

        try {
            await sendPasswordResetEmail(user.email, reset.token);
        } catch (err) {
            console.error('Failed to send password reset email:', err);
        }
    }

    res.json({ success: true, message: "If that email is registered, we've sent a password reset link." });
}

const resetPasswordSchema = z.object({
    token: z.string().min(1),
    newPassword: z.string().min(8),
});

export async function resetPassword(req: Request, res: Response) {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: z.treeifyError(parsed.error) });
    }

    const tokenHash = hashToken(parsed.data.token);
    const user = await User.findOne({
        'passwordResetToken.tokenHash': tokenHash,
        'passwordResetToken.expiresAt': { $gt: new Date() },
    });

    if (!user) {
        return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    user.passwordHash = await hashPassword(parsed.data.newPassword);
    user.passwordResetToken = undefined;
    user.refreshTokens = [];
    await user.save();

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ success: true });
}

const startPhoneVerificationSchema = z.object({
    phoneNumber: z.string().min(1),
});

export async function startPhoneVerification(req: Request, res: Response) {
    const parsed = startPhoneVerificationSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: z.treeifyError(parsed.error) });
    }

    const user = await User.findById(req.user!.userId);
    if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    if (user.mfa.enabled) {
        return res.status(400).json({ error: 'Disable MFA before changing your phone number' });
    }

    try {
        await sendVerificationCode(parsed.data.phoneNumber);
    } catch (err) {
        console.error('Failed to send MFA verification code:', err);
        return res.status(502).json({ error: 'Failed to send verification code. Please try again.' });
    }

    user.mfa.phoneNumber = parsed.data.phoneNumber;
    user.mfa.phoneVerified = false;
    await user.save();

    res.json({ success: true });
}

const confirmPhoneVerificationSchema = z.object({
    code: z.string().min(1),
});

export async function confirmPhoneVerification(req: Request, res: Response) {
    const parsed = confirmPhoneVerificationSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: z.treeifyError(parsed.error) });
    }

    const user = await User.findById(req.user!.userId);
    if (!user || !user.mfa.phoneNumber) {
        return res.status(400).json({ error: 'No pending phone number to verify' });
    }

    const approved = await checkVerificationCode(user.mfa.phoneNumber, parsed.data.code);
    if (!approved) {
        return res.status(400).json({ error: 'Incorrect or expired code' });
    }

    user.mfa.phoneVerified = true;
    await user.save();

    res.json({ success: true });
}

export async function enableMfa(req: Request, res: Response) {
    const user = await User.findById(req.user!.userId);
    if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!user.mfa.phoneVerified) {
        return res.status(400).json({ error: 'Verify your phone number before enabling MFA' });
    }

    user.mfa.enabled = true;
    await user.save();

    res.json({ success: true });
}

export async function disableMfa(req: Request, res: Response) {
    const user = await User.findById(req.user!.userId);
    if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    user.mfa.enabled = false;
    await user.save();

    res.json({ success: true });
}

const verifyMfaLoginSchema = z.object({
    challengeToken: z.string().min(1),
    code: z.string().min(1),
});

export async function verifyMfaLogin(req: Request, res: Response) {
    const parsed = verifyMfaLoginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: z.treeifyError(parsed.error) });
    }

    let payload;
    try {
        payload = verifyMfaChallengeToken(parsed.data.challengeToken);
    } catch {
        return res.status(401).json({ error: 'Challenge expired. Please log in again.' });
    }

    const user = await User.findById(payload.userId);
    if (!user || !user.mfa.enabled || !user.mfa.phoneNumber) {
        return res.status(401).json({ error: 'Challenge expired. Please log in again.' });
    }

    const approved = await checkVerificationCode(user.mfa.phoneNumber, parsed.data.code);
    if (!approved) {
        return res.status(400).json({ error: 'Incorrect or expired code' });
    }

    const accessToken = signAccessToken(user.id);
    const refresh = createRefreshToken(user.id);
    user.refreshTokens.push({
        jti: refresh.jti,
        hashedToken: refresh.hashedToken,
        expiresAt: refresh.expiresAt,
    });
    await user.save();

    setAuthCookies(res, accessToken, refresh.token);
    res.json({ id: user.id, email: user.email, name: user.name });
}

export async function me(req: Request, res: Response) {
    const user = await User.findById(req.user!.userId).select(
        'email name subscription usage emailVerified mfa',
    );
    if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    if (resetUsageIfNeeded(user)) {
        await user.save();
    }

    res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        subscription: user.subscription,
        usage: user.usage,
        emailVerified: user.emailVerified,
        mfa: user.mfa,
    });
}
