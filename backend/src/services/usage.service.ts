import type { HydratedDocument } from 'mongoose';
import type { UserDocument } from '../models/User.model';

const FREE_TIER_MONTHLY_LIMIT = 3;
const FREE_TIER_CHAT_MESSAGE_LIMIT = 30;

function startOfNextMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

export function resetUsageIfNeeded(user: HydratedDocument<UserDocument>): boolean {
    const now = new Date();
    if (user.usage.resetAt > now) {
        return false;
    }
    user.usage.analysesThisMonth = 0;
    user.usage.chatMessagesThisMonth = 0;
    user.usage.resetAt = startOfNextMonth(now);
    return true;
}

export function isUnderLimit(user: HydratedDocument<UserDocument>): boolean {
    const { status } = user.subscription;
    if (status === 'active' || status === 'trialing') {
        return true;
    }
    return user.usage.analysesThisMonth < FREE_TIER_MONTHLY_LIMIT;
}

export async function incrementUsage(user: HydratedDocument<UserDocument>): Promise<void> {
    user.usage.analysesThisMonth += 1;
    await user.save();
}

export function isUnderChatMessageLimit(user: HydratedDocument<UserDocument>): boolean {
    const { status } = user.subscription;
    if (status === 'active' || status === 'trialing') {
        return true;
    }
    return user.usage.chatMessagesThisMonth < FREE_TIER_CHAT_MESSAGE_LIMIT;
}

export async function incrementChatMessageUsage(user: HydratedDocument<UserDocument>): Promise<void> {
    user.usage.chatMessagesThisMonth += 1;
    await user.save();
}
