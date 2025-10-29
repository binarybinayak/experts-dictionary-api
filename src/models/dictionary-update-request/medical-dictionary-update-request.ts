import mongoose from "mongoose";

export interface IMedicalDictionaryUpdateRequest extends mongoose.Document {
  userID?: mongoose.Schema.Types.ObjectId;
  wordID?: mongoose.Schema.Types.ObjectId;
  word: string;
  phonetics?: string;
  partsOfSpeech?: string;
  defination: string;
}

interface IMedicalDictionaryUpdateRequestModel
  extends mongoose.Model<IMedicalDictionaryUpdateRequest> {}

const medicalDictionaryUpdateRequestSchema =
  new mongoose.Schema<IMedicalDictionaryUpdateRequest>({
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
    phonetics: {
      type: String,
    },
    partsOfSpeech: {
      type: String,
    },
    defination: {
      type: String,
    },
  });

medicalDictionaryUpdateRequestSchema.index({ word: 1 });

const MedicalDictionaryUpdateRequest = mongoose.model<
  IMedicalDictionaryUpdateRequest,
  IMedicalDictionaryUpdateRequestModel
>("MedicalDictionaryUpdateRequest", medicalDictionaryUpdateRequestSchema);

export default MedicalDictionaryUpdateRequest;
