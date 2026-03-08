import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const port = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`API server listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start the API server", error);
    process.exit(1);
  }
}

startServer();
