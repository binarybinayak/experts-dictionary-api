import mongoose from "mongoose";

export interface IUserAccessRequest extends mongoose.Document {
  userID: mongoose.Types.ObjectId;
  currentUserType: "user" | "editor" | "admin";
  requestedUserType: "user" | "editor" | "admin";
}

interface IUserAccessRequestModel extends mongoose.Model<IUserAccessRequest> {}

const userAccessRequestSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  currentUserType: {
    type: String,
    required: true,
    enum: ["user", "editor", "admin"],
  },
  requestedUserType: {
    type: String,
    required: true,
    enum: ["user", "editor", "admin"],
  },
});

userAccessRequestSchema.index({ userID: 1 });

const UserAccessRequest = mongoose.model<
  IUserAccessRequest,
  IUserAccessRequestModel
>("UserAccessRequest", userAccessRequestSchema);

export default UserAccessRequest;
