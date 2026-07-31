import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';

// Routes import
import authRoutes from './routes/auth.routes';

const app = express();

const { FRONTEND_URL } = env;

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);

app.get('/api/health', (_req, res) => {
    res.json({ status: 'OK' });
});

export default app;
