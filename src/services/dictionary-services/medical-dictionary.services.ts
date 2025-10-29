import MedicalDictionary, {
  IMedicalDictionary,
} from "../../models/dictionary/medical-dictionary";
import MedicalDictionaryUpdateRequest, {
  IMedicalDictionaryUpdateRequest,
} from "../../models/dictionary-update-request/medical-dictionary-update-request";
import User, { IUser } from "../../models/user";
import MedicalDictionaryDeleteRequest, {
  IMedicalDictionaryDeleteRequest,
} from "../../models/dictionary-delete-request/medical-dictionary-request";
import { HttpError } from "../../utils/custom-errors";

export const getDictionaryWord = async (
  word: string
): Promise<{
  word: string;
  defination: string;
  phonetics?: string | undefined;
  partsOfSpeech?: string | undefined;
}> => {
  const dictionaryWord: IMedicalDictionary | null =
    await MedicalDictionary.findOne({ word });

  if (!dictionaryWord) {
    throw new HttpError(404, "Word not found");
  }

  return {
    word: dictionaryWord.word,
    defination: dictionaryWord.defination,
    phonetics: dictionaryWord.phonetics,
    partsOfSpeech: dictionaryWord.partsOfSpeech,
  };
};

export const getDictionaryMatchingWords = async (
  str: string,
  limit: number
): Promise<string[]> => {
  if (!str || str.trim() === "") {
    return [];
  }

  const regex = new RegExp(`^${str}`, "i");
  const words = await MedicalDictionary.find({ word: { $regex: regex } })
    .limit(limit)
    .select("word")
    .lean();

  return words.map((entry) => entry.word);
};

export const addUpdateDictionaryWord = async (
  word: string,
  defination: string,
  phonetics?: string,
  partsOfSpeech?: string
): Promise<{
  word: string;
  defination: string;
  phonetics?: string | undefined;
  partsOfSpeech?: string | undefined;
}> => {
  let medicalDictionaryWord: IMedicalDictionary | null =
    await MedicalDictionary.findOne({ word });
  if (medicalDictionaryWord) {
    medicalDictionaryWord = await MedicalDictionary.findOneAndUpdate(
      { word },
      { phonetics, partsOfSpeech, defination },
      {
        returnDocument: "after",
      }
    );
  } else {
    medicalDictionaryWord = new MedicalDictionary({
      word,
      defination,
      phonetics,
      partsOfSpeech,
    });
    await medicalDictionaryWord.save();
  }

  return { word, defination, phonetics, partsOfSpeech };
};

export const requestDictionaryWordUpdate = async (
  userType: string,
  dictionaryUpdates: {
    word: string;
    defination: string;
    phonetics?: string;
    partsOfSpeech?: string;
  }
): Promise<{
  word: string;
  defination: string;
  phonetics?: string;
  partsOfSpeech?: string;
}> => {
  if (["editor", "admin"].includes(userType)) {
    const medicalDictionaryWord = await addUpdateDictionaryWord(
      dictionaryUpdates.word,
      dictionaryUpdates.defination,
      dictionaryUpdates.phonetics,
      dictionaryUpdates.partsOfSpeech
    );
  } else {
    const medicalDictionaryUpdateRequestWord: IMedicalDictionaryUpdateRequest | null =
      new MedicalDictionaryUpdateRequest(dictionaryUpdates);
    await medicalDictionaryUpdateRequestWord.save();
  }
  return dictionaryUpdates;
};

export type TDictionaryWordUpdateRequests = {
  word: string;
  phonetics?: string;
  partsOfSpeech?: string;
  defination: string;
  userID?: { name: string; email: string } | null;
  wordID?: {
    word: string;
    phonetics?: string;
    partsOfSpeech?: string;
    defination: string;
  } | null;
};
export const getDictionaryWordAddUpdateRequests = async (
  limit: number,
  skip: number
): Promise<TDictionaryWordUpdateRequests[]> => {
  const dictionaryWordRequests: TDictionaryWordUpdateRequests[] =
    await MedicalDictionaryUpdateRequest.find()
      .skip(skip)
      .limit(limit)
      .select("word phonetics partsOfSpeech defination")
      .populate("userID", "name email")
      .populate("wordID", "word phonetics partsOfSpeech defination")
      .lean<TDictionaryWordUpdateRequests[]>();

  return dictionaryWordRequests;
};

export const requestDictionaryWordDelete = async (
  id: string,
  userType: string,
  word: string
): Promise<{ message: string }> => {
  const dictionaryWord = await MedicalDictionary.findOne({ word });
  if (!dictionaryWord) throw new HttpError(404, "Word not found");

  if (["admin", "editor"].includes(userType)) {
    await deleteDictionaryWord(word);
    return { message: "Word deleted" };
  }

  const existingRequest = await MedicalDictionaryDeleteRequest.findOne({
    word,
  });
  if (existingRequest)
    return { message: "Delete request for this word already exists" };

  const deleteRequest = new MedicalDictionaryDeleteRequest({
    userID: id,
    wordID: dictionaryWord._id,
    word: dictionaryWord.word,
  });
  await deleteRequest.save();

  return { message: "Delete request submitted successfully" };
};

export type TDictionaryWordDeleteRequest = {
  word: string;
  userID?: { name: string; email: string } | null;
  wordID?: {
    word: string;
    phonetics?: string;
    partsOfSpeech?: string;
    defination: string;
  } | null;
};

export const getDictionaryWordDeleteRequests = async (
  limit: number,
  skip: number
): Promise<TDictionaryWordDeleteRequest[]> => {
  const deleteRequests: TDictionaryWordDeleteRequest[] =
    await MedicalDictionaryDeleteRequest.find()
      .skip(skip)
      .limit(limit)
      .select("word")
      .populate("userID", "name email")
      .populate("wordID", "word phonetics partsOfSpeech defination")
      .lean<TDictionaryWordDeleteRequest[]>();

  return deleteRequests;
};

export const deleteDictionaryWord = async (word: string): Promise<void> => {
  const deletedWord = await MedicalDictionary.findOneAndDelete({ word });
  if (!deletedWord)
    throw new HttpError(404, "Word not found or already deleted");

  await MedicalDictionaryDeleteRequest.deleteMany({ word });
};

export const deleteDictionaryWordDeleteRequest = async (
  word: string
): Promise<void> => {
  const deletedRequest = await MedicalDictionaryDeleteRequest.deleteMany({
    word,
  });

  if (!deletedRequest) throw new HttpError(404, "Delete request not found");
};
