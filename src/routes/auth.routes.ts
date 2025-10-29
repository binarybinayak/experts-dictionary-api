import express, { Request, Response, NextFunction } from "express";
import { addUser } from "../services/user.services";
import { HttpError } from "../utils/custom-errors";
import { authenticateUsernamePassword } from "../middlewares/authenticateUser";
import { IUser } from "../models/user";

const router = express.Router();

router.post(
  "/signup",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;

      // Basic validation
      if (!name || !email || !password) {
        throw new HttpError(400, "Name, email, and password are required");
      }

      // Create the user
      const user = await addUser({ name, email, password });

      // Generate JWT
      const token: string = user.getJWT();

      // Respond with success
      res
        .status(201)
        .cookie("token", token)
        .json({
          message: "User registered successfully",
          user: {
            name: user.name,
            email: user.email,
            userType: user.userType,
          },
        });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/login",
  authenticateUsernamePassword,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user: IUser = (req as any).user as IUser;

      // Generate JWT
      const token: string = user.getJWT();

      res
        .status(200)
        .cookie("token", token)
        .json({
          message: "Login successful",
          user: {
            name: user.name,
            email: user.email,
            userType: user.userType,
          },
        });
    } catch (err) {
      next(err);
    }
  }
);

router.post("/logout", (req: Request, res: Response) => {
  res.status(200).cookie("token", null).json({
    message: "Logout successful",
  });
});

export default router;
