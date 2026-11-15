import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Allow requests from the frontend and read JSON request bodies.
app.use(cors());
app.use(express.json());

// Simple route to check whether the API is running.
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// All user-related routes start with /api/users.
app.use("/api/users", userRoutes);

// Handle unknown routes and application errors.
app.use(notFound);
app.use(errorHandler);

export default app;
