import { Request, Response, NextFunction } from "express";
import User from "../models/user";
import { HttpError } from "../utils/custom-errors";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authenticateUsernamePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new HttpError(400, "Email and password are required"));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next(new HttpError(401, "Invalid email or password"));
    }

    const isPasswordValid = user.validatePassword(password);
    if (!isPasswordValid) {
      return next(new HttpError(401, "Invalid email or password"));
    }

    // Attach user to request
    (req as any).user = user;

    next();
  } catch (err) {
    next(err);
  }
};

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      throw new HttpError(401, "Please login first.");
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (typeof jwtSecret != "string") {
      throw new HttpError(500, "Missing JWT_SECRET in environment variables.");
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    if (!decoded || !decoded.id) {
      return next(new HttpError(401, "Invalid or expired token."));
    }

    // Attach user info to request
    (req as any).user = {
      id: decoded.id,
      userType: decoded.userType,
    };

    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return next(new HttpError(401, "Session expired. Please login again."));
    }
    if (err.name === "JsonWebTokenError") {
      return next(new HttpError(401, "Invalid token."));
    }
    next(err);
  }
};

export const verifyIfAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Ensure user info is attached (from previous middleware like authticateUser)
    const user = (req as any).user;

    if (!user) {
      return next(new HttpError(401, "User not authenticated"));
    }

    // Check if the user is an admin
    if (user.userType !== "admin") {
      return next(
        new HttpError(403, "You are not authorized to perform this action")
      );
    }

    // If admin, continue
    next();
  } catch (err) {
    next(err);
  }
};

export const verifyIfEditor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Ensure user info is attached (from previous middleware like authticateUser)
    const user = (req as any).user;

    if (!user) {
      return next(new HttpError(401, "User not authenticated"));
    }

    // Check if the user is an editor
    if (user.userType !== "editor") {
      return next(
        new HttpError(403, "You are not authorized to perform this action")
      );
    }

    // If editor, continue
    next();
  } catch (err) {
    next(err);
  }
};

export const verifyIfAdminOrEditor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Ensure user info is attached (from previous middleware like authticateUser)
    const user = (req as any).user;

    if (!user) {
      return next(new HttpError(401, "User not authenticated"));
    }

    // Check if the user is an admin or editor
    if (!["admin", "editor"].includes(user.userType)) {
      return next(
        new HttpError(403, "You are not authorized to perform this action")
      );
    }

    // If editor, continue
    next();
  } catch (err) {
    next(err);
  }
};
