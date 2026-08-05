import { Resend } from 'resend';
import { env } from '../config/env';

const { RESEND_API_KEY } = env;

const resend = new Resend(RESEND_API_KEY);

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

const categoryLabels: Record<string, string> = {
    subscription: 'Subscription & billing',
    bug: 'Report a bug',
    question: 'General question',
    other: 'Other',
};

export async function sendContactNotificationEmail(payload: {
    name: string;
    email: string;
    category: string;
    message: string;
}) {
    const categoryLabel = categoryLabels[payload.category] ?? payload.category;

    await resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to: env.CONTACT_RECEIVER_EMAIL,
        replyTo: payload.email,
        subject: `New contact message: ${categoryLabel}`,
        html: `
            <p><strong>From:</strong> ${escapeHtml(payload.name)} (${escapeHtml(payload.email)})</p>
            <p><strong>Category:</strong> ${escapeHtml(categoryLabel)}</p>
            <p><strong>Message:</strong></p>
            <p>${escapeHtml(payload.message).replace(/\n/g, '<br>')}</p>
        `,
    });
}

export async function sendVerificationEmail(email: string, rawToken: string) {
    const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${rawToken}`;

    await resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to: email,
        subject: 'Verify your Applyze account',
        html: `
            <p>Welcome to Applyze — confirm your email address to finish setting up your account.</p>
            <p><a href="${verifyUrl}">Verify email</a></p>
            <p>This link expires in 24 hours. If you didn't create an Applyze account, you can ignore this email.</p>
        `,
    });
}

export async function sendPasswordResetEmail(email: string, rawToken: string) {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${rawToken}`;

    await resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to: email,
        subject: 'Reset your Applyze password',
        html: `
            <p>We received a request to reset your Applyze password.</p>
            <p><a href="${resetUrl}">Reset password</a></p>
            <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email — your password won't be changed.</p>
        `,
    });
}

