import mongoose from "mongoose";

// Connect the application to MongoDB using the URI from the environment.
export async function connectDB() {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);

    if (!connection) {
      throw new Error("Failed to connect to database");
    }

    console.log("Connected to database");
  } catch (error) {
    console.error(`Error connecting to database: ${error.message}`);
    process.exit(1);
  }
}
