import express from "express";
import cors from 'cors'
import userRoutes from "./routes/userRoutes.js";
import { connectDB } from "./config/db.js";

import { notFound, errorHandler } from "./middleware/errorHandler.js"



const app = express()

app.use(cors())
app.use(express.json())

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

app.use("/api/users", userRoutes);

app.use(notFound)
app.use(errorHandler)

export default app
