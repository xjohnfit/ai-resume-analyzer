import "dotenv/config";
import { z } from "zod"

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().default(5000),
    MONGODB_URI: z.string().min(1),
    JWT_ACCESS_SECRET: z.string().min(1),
    JWT_REFRESH_SECRET: z.string().min(1),
    FRONTEND_URL: z.string().min(1),
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    STRIPE_PRICE_ID_MONTHLY: z.string().min(1),
    STRIPE_PRICE_ID_YEARLY: z.string().min(1),

});

export const env = envSchema.parse(process.env)
