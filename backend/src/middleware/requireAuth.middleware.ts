import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/auth.service';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.accessToken;
    if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const payload = verifyAccessToken(token);
        req.user = { userId: payload.userId };
        next();
    } catch {
        return res
            .status(401)
            .json({ error: 'Access token expired or invalid' });
    }
}
