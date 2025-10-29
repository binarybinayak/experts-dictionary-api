import express, { Request, Response, NextFunction } from "express";
import {
  getDictionaryWord,
  getDictionaryMatchingWords,
  requestDictionaryWordUpdate,
  requestDictionaryWordDelete,
  addUpdateDictionaryWord,
  getDictionaryWordAddUpdateRequests,
  getDictionaryWordDeleteRequests,
} from "../../services/dictionary-services/medical-dictionary.services";
import { HttpError } from "../../utils/custom-errors";
import {
  authenticateUser,
  verifyIfAdminOrEditor,
} from "../../middlewares/authenticateUser";

const router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { word } = req.query;
    if (!word || typeof word !== "string") {
      throw new HttpError(400, "Query parameter 'word' is required");
    }

    const dictionaryWord = await getDictionaryWord(word);
    res.status(200).json(dictionaryWord);
  } catch (err) {
    next(err);
  }
});

router.get(
  "/get-matching-words",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { str, limit } = req.query;

      if (!str || typeof str !== "string") {
        throw new HttpError(400, "Query parameter 'str' is required");
      }

      const limitNum = parseInt(limit as string, 10) || 10;

      const words = await getDictionaryMatchingWords(str, limitNum);

      res.status(200).json({
        message: "Matching words fetched successfully",
        count: words.length,
        words,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/add",
  authenticateUser,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { word, defination, phonetics, partsOfSpeech } = req.body;
      const userType = (req as any).user?.userType || "user";

      if (!word || !defination) {
        throw new HttpError(400, "Word and defination are required");
      }

      const result = await requestDictionaryWordUpdate(userType, {
        word,
        defination,
        phonetics,
        partsOfSpeech,
      });

      res.status(201).json({
        message: ["editor", "admin"].includes(userType)
          ? "Word added/updated successfully"
          : "Update request submitted for admin/editor review",
        result,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  "/update",
  authenticateUser,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { word, defination, phonetics, partsOfSpeech } = req.body;
      const userType = (req as any).user?.userType || "user";

      if (!word || !defination) {
        throw new HttpError(400, "Word and defination are required");
      }

      const result = await requestDictionaryWordUpdate(userType, {
        word,
        defination,
        phonetics,
        partsOfSpeech,
      });

      res.status(200).json({
        message: ["editor", "admin"].includes(userType)
          ? "Word updated successfully"
          : "Update request submitted for admin/editor review",
        result,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/add-update-word-requests",
  authenticateUser,
  verifyIfAdminOrEditor,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = parseInt(req.query.skip as string) || 0;

      const requests = await getDictionaryWordAddUpdateRequests(limit, skip);

      res.status(200).json({
        message: "Fetched dictionary word add/update requests successfully",
        count: requests.length,
        requests,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  "/",
  authenticateUser,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { word } = req.body;
      const user = (req as any).user;

      if (!word || typeof word !== "string") {
        throw new HttpError(400, "Word is required");
      }

      const result = await requestDictionaryWordDelete(
        user.id,
        user.userType,
        word
      );

      res.status(200).json({
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/delete-word-requests",
  authenticateUser,
  verifyIfAdminOrEditor,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt((req.query.limit as string) || "10", 10);
      const skip = parseInt((req.query.skip as string) || "0", 10);

      const deleteRequests = await getDictionaryWordDeleteRequests(limit, skip);

      res.status(200).json({
        message: "Delete word requests fetched successfully",
        total: deleteRequests.length,
        requests: deleteRequests,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
