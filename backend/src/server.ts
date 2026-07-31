import app from "./app"
import { connectDB } from "./config/db"
import { env } from "./config/env"


const { PORT } = env;

async function main() {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

main();
