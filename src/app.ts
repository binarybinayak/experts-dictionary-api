import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { connectMongoDB } from "./config/connect-db";
import { HttpError } from "./utils/custom-errors";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import authRoute from "./routes/auth.routes";
import userRoute from "./routes/user.routes";
import medicalDictionaryRoute from "./routes/dictionary-routes/medical-dictionary.routes";

dotenv.config();

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : [];
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allows cookies/auth headers to be sent
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions), helmet(), cookieParser(), express.json());

app.use("/auth", authRoute);
app.use("/user", userRoute);
app.use("/medical-dictionary", medicalDictionaryRoute);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ message: err.message });
  } else {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Connect to MongoDB and start server
connectMongoDB()
  .then(() => {
    const PORT = process.env.PORT || 3000; // Use PORT from env or fallback to 3000
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB or start server:", err);
    process.exit(1);
  });
