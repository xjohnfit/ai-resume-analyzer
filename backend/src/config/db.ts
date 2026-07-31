import mongoose from "mongoose";
import { env } from "./env";

const { MONGODB_URI } = env;

export async function connectDB(): Promise<void> {
    try {
        await mongoose.connect(MONGODB_URI as string);
        console.log("MongoDB Connected");
    } catch (error) {
        console.log("MongoDB connection failed:", error)
        process.exit(1)
    }
}
