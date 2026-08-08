import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model';
import { resetUsageIfNeeded, isUnderChatMessageLimit } from '../services/usage.service';

export async function requireChatMessageAllowance(req: Request, res: Response, next: NextFunction) {
    const user = await User.findById(req.user!.userId);
    if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    if (resetUsageIfNeeded(user)) {
        await user.save();
    }

    if (!isUnderChatMessageLimit(user)) {
        return res.status(402).json({ error: 'Free-tier chat message limit reached for this month' });
    }

    next();
}
