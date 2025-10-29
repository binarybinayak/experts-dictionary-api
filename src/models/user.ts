import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { HttpError } from "../utils/custom-errors";

dotenv.config();

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  userType: "user" | "editor" | "admin";
  getJWT(): string;
  validatePassword(password: string): boolean;
}

interface IUserModel extends mongoose.Model<IUser> {}

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    required: true,
    validate: {
      validator: (value: string) => validator.isEmail(value),
      message: "Not a valid email!",
    },
  },
  password: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    required: true,
    enum: ["user", "editor", "admin"],
  },
});

userSchema.pre<IUser>("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    if (validator.isStrongPassword(user.password)) {
      const bcryptSaltRoundsString = process.env.BCRYPT_SALT_ROUNDS;
      if (typeof bcryptSaltRoundsString === "string") {
        const bcryptSaltRounds = parseInt(bcryptSaltRoundsString);
        user.password = await bcrypt.hash(user.password, bcryptSaltRounds);
      } else {
        throw new HttpError(
          500,
          "Missing BCRYPT_SALT_ROUNDS in environment variables."
        );
      }
    } else {
      throw new HttpError(400, "Invalid credential");
    }
  }

  next();
});

userSchema.index({ email: 1 });

userSchema.methods.getJWT = function (): String {
  const user = this;
  const jwtSecret = process.env.JWT_SECRET;
  if (typeof jwtSecret != "string") {
    throw new HttpError(500, "Missing JWT_SECRET in environment variables.");
  }
  return jwt.sign({ id: user._id, userType: user.userType }, jwtSecret);
};

userSchema.methods.validatePassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model<IUser, IUserModel>("User", userSchema);

export default User;
