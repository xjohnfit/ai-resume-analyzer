import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { handleStripeWebhook } from './controllers/billing.controllers';

// Routes import
import authRoutes from './routes/auth.routes';
import billingRoutes from './routes/billing.routes';
import profileRoutes from './routes/profile.routes';

const app = express();

const { FRONTEND_URL } = env;

app.use(cors({ origin: FRONTEND_URL, credentials: true }));

// This must stay above express.json() — Stripe's webhook signature check needs
// the raw request body, and express.json() would consume it first if registered above this line.
app.post(
    '/api/billing/webhook',
    express.raw({ type: 'application/json' }),
    handleStripeWebhook,
);

app.use(express.json());
app.use(cookieParser());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/profile', profileRoutes);

app.get('/api/health', (_req, res) => {
    res.json({ status: 'OK' });
});

export default app;
