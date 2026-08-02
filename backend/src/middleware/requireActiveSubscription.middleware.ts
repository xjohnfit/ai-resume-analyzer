import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model';
import { resetUsageIfNeeded, isUnderLimit } from '../services/usage.service';

export async function requireActiveSubscription(req: Request, res: Response, next: NextFunction) {
    const user = await User.findById(req.user!.userId);
    if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    if (resetUsageIfNeeded(user)) {
        await user.save();
    }

    if (!isUnderLimit(user)) {
        return res.status(402).json({ error: 'Free-tier analysis limit reached for this month' });
    }

    next();
}
