import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const port = process.env.PORT || 3000;

// Connect to MongoDB before starting the server.
connectDB();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
