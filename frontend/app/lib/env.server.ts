import { z } from "zod"

const envSchema = z.object({
    BACKEND_URL: z.string().min(1).default("http://localhost:5000"),
})

export const env = envSchema.parse(process.env)
