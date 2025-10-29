import express, { Request, Response, NextFunction } from "express";
import {
  authenticateUser,
  verifyIfAdmin,
} from "../middlewares/authenticateUser";
import {
  getUser,
  editUser,
  deleteUser,
  updateUserType,
  getUserTypeUpdateRequests,
  updatePassword,
} from "../services/user.services";
import { HttpError } from "../utils/custom-errors";

const router = express.Router();
router.use("/", authenticateUser);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  const userDetails = await getUser(user.id);
  res.status(201).json(userDetails);
});

router.patch("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const { name, userType } = req.body;

    if (!name && !userType) {
      throw new HttpError(400, "Nothing to update.");
    }

    const updatedUser = await editUser(user.id, { name, userType });
    res.status(200).json({
      message: userType
        ? "User type change request submitted."
        : "User updated successfully.",
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    await deleteUser(user.id);
    res.status(200).json({ message: "User deleted successfully." });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/user-type-update-requests",
  verifyIfAdmin,
  async (req, res, next) => {
    try {
      const requests = await getUserTypeUpdateRequests();
      res.status(200).json({
        count: requests.length,
        data: requests,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  "/user-type-update",
  verifyIfAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, userType } = req.body;

      if (!id || !userType) {
        throw new HttpError(400, "User ID and userType are required.");
      }

      const updatedUser = await updateUserType(
        id,
        userType as "user" | "editor" | "admin"
      );

      res.status(200).json({
        message: "User type updated successfully.",
        user: updatedUser,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  "/update-password",
  authenticateUser,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userID = (req as any).user?.id;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        throw new HttpError(400, "Both old and new passwords are required.");
      }

      const result = await updatePassword(userID, oldPassword, newPassword);

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
