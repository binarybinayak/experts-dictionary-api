import mongoose from "mongoose";

export interface IMedicalDictionary extends mongoose.Document {
  word: string;
  phonetics?: string;
  partsOfSpeech?: string;
  defination: string;
}

interface IMedicalDictionaryModel extends mongoose.Model<IMedicalDictionary> {}

const medicalDictionarySchema = new mongoose.Schema<IMedicalDictionary>({
  word: {
    type: String,
    required: true,
    unique: true,
  },
  phonetics: {
    type: String,
  },
  partsOfSpeech: {
    type: String,
  },
  defination: {
    type: String,
    required: true,
  },
});

medicalDictionarySchema.index({ word: 1 });

const MedicalDictionary = mongoose.model<
  IMedicalDictionary,
  IMedicalDictionaryModel
>("MedicalDictionary", medicalDictionarySchema);

export default MedicalDictionary;
