import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectMongoDB = async () => {
  const URI = process.env.MONGODB_CONNECTION_SECRET;

  if (!URI) {
    throw new Error(
      "Missing MONGODB_CONNECTION_SECRET in environment variables."
    );
  }

  await mongoose.connect(URI);
};
