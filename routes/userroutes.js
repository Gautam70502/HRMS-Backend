import express from "express";
import {
  updateUserProfile,
  updateUserField,
} from "../controllers/usercontroller.js";
import { verifyuser } from "../middleware/verifyuser.js";
import { validateRequestBody } from "../middleware/validationRequestBody.js";
import { updateUserFieldValidation } from "../types.js";
import uploadStorage from "../middleware/multer.js";
const router = express.Router();

router.patch(
  "/updateuserprofile",
  uploadStorage.single("file"),
  verifyuser,
  updateUserProfile,
);
router.post(
  "/updateuserfield",
  validateRequestBody(updateUserFieldValidation),
  verifyuser,
  updateUserField,
);

export default router;
