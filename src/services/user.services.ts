import User, { IUser } from "../models/user";
import UserAccessRequest, {
  IUserAccessRequest,
} from "../models/user-access-request";
import { HttpError } from "../utils/custom-errors";

export const getUser = async (
  id: string
): Promise<{
  name: string;
  email: string;
  userType: "user" | "editor" | "admin";
}> => {
  const user: IUser | null = await User.findById(id);

  if (!user) {
    throw new HttpError(404, "User not found.");
  }

  return {
    name: user.name,
    email: user.email,
    userType: user.userType as "user" | "editor" | "admin",
  };
};

export const addUser = async (userDetails: {
  name: string;
  email: string;
  password: string;
}): Promise<IUser> => {
  const { name, email, password } = userDetails;
  const userType = "user";
  const user: IUser = new User({ name, email, password, userType });
  await user.save();
  return user;
};

export const editUser = async (
  id: string,
  userDetails: {
    name?: string;
    userType?: string;
  }
): Promise<{
  name: string;
  email: string;
  userType: "user" | "editor" | "admin";
}> => {
  const user: IUser | null = await User.findByIdAndUpdate(
    id,
    {
      name: userDetails.name,
    },
    {
      runValidators: true,
      returnDocument: "after",
    }
  );
  if (!user) {
    throw new HttpError(404, "User not found.");
  }

  if (userDetails.userType) {
    if (user.userType === userDetails.userType) {
      return { name: user.name, email: user.email, userType: user.userType };
    }

    let userAccessRequest: IUserAccessRequest | null =
      await UserAccessRequest.findOne({ userID: id });
    if (userAccessRequest) {
      userAccessRequest.currentUserType = user.userType;
      userAccessRequest.requestedUserType = userDetails.userType as
        | "user"
        | "editor"
        | "admin";
    } else {
      userAccessRequest = new UserAccessRequest({
        userID: id,
        currentUserType: user.userType,
        requestedUserType: userDetails.userType,
      });
    }
    await userAccessRequest.save();
  }
  return { name: user.name, email: user.email, userType: user.userType };
};

export const updatePassword = async (
  id: string,
  oldPassword: string,
  newPassword: string
) => {
  const user: IUser | null = await User.findById(id);
  if (!user) {
    throw new HttpError(404, "User not found.");
  }

  const isMatch = await user.validatePassword(oldPassword);
  if (!isMatch) {
    throw new HttpError(400, "Old password is incorrect.");
  }

  user.password = newPassword;

  await user.save();

  return { message: "Password updated successfully." };
};

export const getUserTypeUpdateRequests = async () => {
  const requests = await UserAccessRequest.find()
    .populate("userID", "name email userType")
    .lean();
  return requests;
};
export const updateUserType = async (
  id: string,
  userType: "user" | "editor" | "admin"
): Promise<{ name: string; email: string; userType: string }> => {
  const user: IUser | null = await User.findByIdAndUpdate(
    id,
    {
      userType: userType,
    },
    {
      runValidators: true,
      returnDocument: "after",
    }
  );
  if (!user) {
    throw new HttpError(404, "User not found.");
  }
  return { name: user.name, email: user.email, userType: user.userType };
};

export const deleteUser = async (id: String): Promise<void> => {
  const user: IUser | null = await User.findById(id);
  if (!user) {
    throw new HttpError(404, "User not found.");
  }
  await User.findByIdAndDelete(id);
};
