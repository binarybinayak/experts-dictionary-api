import mongoose from "mongoose";

export interface IMedicalDictionaryDeleteRequest extends mongoose.Document {
  userID: mongoose.Schema.Types.ObjectId;
  wordID: mongoose.Schema.Types.ObjectId;
  word: string;
}

interface IMedicalDictionaryDeleteRequestModel
  extends mongoose.Model<IMedicalDictionaryDeleteRequest> {}

const medicalDictionaryDeleteRequestSchema =
  new mongoose.Schema<IMedicalDictionaryDeleteRequest>({
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    wordID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicalDictionary",
    },
    word: {
      type: String,
      required: true,
    },
  });

medicalDictionaryDeleteRequestSchema.index({ word: 1 });

const MedicalDictionaryDeleteRequest = mongoose.model<
  IMedicalDictionaryDeleteRequest,
  IMedicalDictionaryDeleteRequestModel
>("MedicalDictionaryDeleteRequest", medicalDictionaryDeleteRequestSchema);

export default MedicalDictionaryDeleteRequest;
